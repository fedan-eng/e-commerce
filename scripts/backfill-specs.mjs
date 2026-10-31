// scripts/backfill-specs.mjs
// One-off: fill product.specs from what's already written in each product's
// name / features / description, so the category filters work.
//
//   node scripts/backfill-specs.mjs           → dry run (prints proposals, writes nothing)
//   node scripts/backfill-specs.mjs --apply   → writes them
//
// Only fills spec fields that are currently empty — never overwrites values set in the admin.
// Also normalises category spelling (e.g. "chargers" → "Chargers").
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ path: ".env", quiet: true });

const APPLY = process.argv.includes("--apply");

const CANONICAL = ["Power Bank", "Chargers", "Wearables", "Extensions", "Lifestyle"];
const canonicalCategory = (c = "") =>
  CANONICAL.find((x) => x.toLowerCase() === c.trim().toLowerCase()) || c;

// ─── Text helpers ─────────────────────────────────────────────────────────────

// Unicode hyphens (‐ ‑ ‒ – —) → "-" so "noise‑cancelling" / "USB‑C" match
const clean = (s) => s.replace(/[‐-―]/g, "-").replace(/\s+/g, " ");

// Product text without the box list — a "USB-C Cable" in the box is not a USB-C port
const textOf = (p) => clean([p.name, ...(p.features || []), p.description || ""].join(" \n "));

// "32,500 mAh" → 32500 (name first, it's the most reliable)
function capacityMah(p) {
  for (const src of [p.name, textOf(p)]) {
    const m = src.match(/(\d{1,3}(?:,\d{3})+|\d{4,6})\s*mAh/i);
    if (m) return parseInt(m[1].replace(/,/g, ""), 10);
  }
  return undefined;
}

// Highest wattage mentioned anywhere ("22.5W", "27w")
function maxWatts(text) {
  const ws = [...text.matchAll(/(\d+(?:\.\d+)?)\s*W\b/gi)].map((m) => parseFloat(m[1]));
  return ws.length ? Math.max(...ws) : undefined;
}

function ports(text) {
  const out = [];
  if (/\b(type[\s-]?c|usb[\s-]?c)\b/i.test(text)) out.push("USB-C");
  // "USB" not followed by C → USB-A ("4 USB Ports", "Multiple USB Ports")
  if (/\busb[\s-]?a\b/i.test(text) || /\busb\b(?![\s-]?c\b)/i.test(text)) out.push("USB-A");
  if (/\b(lightning|iphone)\b/i.test(text)) out.push("Lightning");
  return out.length ? out : undefined;
}

const tags = (text, rules) => {
  const out = rules.filter(([, re]) => re.test(text)).map(([id]) => id);
  return out.length ? out : undefined;
};

// ─── Per-category rules ───────────────────────────────────────────────────────

const RULES = {
  "Power Bank": (p, t) => ({
    capacityMah: capacityMah(p),
    outputW: maxWatts(t),
    ports: ports(t),
    featureTags: tags(t, [
      ["magnetic", /magnet|mag-?safe|magflex|mag-?snap/i],
      ["wireless-charging", /wireless/i],
      ["built-in-cable", /built-?in cables?|cables? built[\s-]?in/i],
      ["digital-display", /\bLCD\b|LED display|digital display/i],
    ]),
  }),

  Chargers: (p, t) => {
    const isCable = /\bcable\b/i.test(p.name);
    const portCount = t.match(/(\d+)\s*(?:-\s*port|usb ports?)/i);
    return {
      outputW: maxWatts(t),
      ports: ports(t),
      portCount: portCount ? parseInt(portCount[1], 10) : undefined,
      // Plugs into a wall socket ("2 pins", "3Pin", "wall charger"); cables have no charging type
      chargingType: !isCable && /wall charger|\d\s*-?\s*pins?\b/i.test(t) ? "wall" : undefined,
    };
  },

  Wearables: (p, t) => ({
    wearableType: /earbud|\bbuds\b/i.test(t) ? "earbuds" : undefined,
    connectivity: (t.match(/bluetooth\s*(5\.\d)/i) || [])[1] ? `Bluetooth ${t.match(/bluetooth\s*(5\.\d)/i)[1]}` : undefined,
    featureTags: tags(t, [
      ["noise-cancellation", /noise[\s-]?cancel/i],
      ["water-resistant", /water[\s-]?resist|sweat/i],
      ["touch-controls", /touch/i],
    ]),
  }),

  Lifestyle: (p, t) => ({
    lifestyleType: /projector/i.test(p.name) ? "projector"
      : /\bfan\b/i.test(p.name) ? "fan"
      : /bulb|lamp/i.test(p.name) ? "lamp"
      : undefined,
    powerSource: /rechargeable|solar|battery capacity|fast charge/i.test(t) ? ["rechargeable"] : undefined,
    featureTags: tags(t, [
      ["bluetooth", /bluetooth/i],
      ["remote-control", /remote/i],
      ["dimmable", /dimmable|brightness levels/i],
      ["multi-speed", /multi[\s-]?speed|\d\s*speeds?/i],
    ]),
  }),

  Extensions: (p, t) => {
    const sockets = t.match(/(\d+)\s*[-\s]?(?:socket|way|gang)/i);
    const cable = t.match(/(\d+(?:\.\d+)?)\s*(?:m|metres?|meters?)\b\s*(?:cable|cord|long)?/i);
    return {
      socketCount: sockets ? parseInt(sockets[1], 10) : undefined,
      cableLengthM: cable ? parseFloat(cable[1]) : undefined,
      featureTags: tags(t, [
        ["surge-protection", /surge/i],
        ["usb-ports", /\busb\b/i],
        ["fire-resistant", /fire[\s-]?(resist|retard|proof)/i],
      ]),
    };
  },
};

// Fields each category's filters use — anything not found is listed as "fill in by hand"
const FIELDS = {
  "Power Bank": ["capacityMah", "outputW", "ports", "compatibility", "featureTags"],
  Chargers: ["outputW", "compatibility", "ports", "chargingType", "portCount"],
  Wearables: ["batteryHours", "featureTags", "connectivity", "wearableType"],
  Extensions: ["socketCount", "featureTags", "cableLengthM"],
  Lifestyle: ["lifestyleType", "powerSource", "featureTags"],
};

const isEmpty = (v) => v == null || (Array.isArray(v) && v.length === 0) || v === "";

// ─── Run ──────────────────────────────────────────────────────────────────────

await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 30000 });
const col = mongoose.connection.db.collection("products");
const products = await col
  .find({}, { projection: { name: 1, category: 1, features: 1, description: 1, boxContent: 1, specs: 1 } })
  .toArray();

let toUpdate = 0;
const ops = [];

for (const p of products) {
  const category = canonicalCategory(p.category);
  const rule = RULES[category];
  const existing = p.specs || {};
  const proposed = rule ? rule(p, textOf(p)) : {};

  const $set = {};
  for (const [k, v] of Object.entries(proposed)) {
    if (!isEmpty(v) && isEmpty(existing[k])) $set[`specs.${k}`] = v;
  }
  if (category !== p.category) $set.category = category;

  const missing = (FIELDS[category] || []).filter((f) => isEmpty(existing[f]) && isEmpty(proposed[f]));

  console.log(`\n■ ${p.name}  [${p.category}${category !== p.category ? ` → ${category}` : ""}]  ${p._id}`);
  if (!rule) console.log("  (no rules for this category)");
  for (const [k, v] of Object.entries($set)) console.log(`  + ${k.replace("specs.", "")}: ${JSON.stringify(v)}`);
  if (!Object.keys($set).length) console.log("  (nothing to set)");
  if (missing.length) console.log(`  · fill in by hand: ${missing.join(", ")}`);

  if (Object.keys($set).length) {
    toUpdate++;
    ops.push({ updateOne: { filter: { _id: p._id }, update: { $set } } });
  }
}

console.log(`\n${products.length} products, ${toUpdate} with changes.`);

if (APPLY && ops.length) {
  const res = await col.bulkWrite(ops);
  console.log(`Applied: ${res.modifiedCount} products updated.`);
} else if (!APPLY) {
  console.log("Dry run — nothing written. Re-run with --apply to save.");
}

await mongoose.disconnect();
