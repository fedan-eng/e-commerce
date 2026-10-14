// scripts/backfill-sold-count.mjs
// One-off: add past online orders to Product.soldCount. Before lib/soldCount.js,
// only manual sales from the admin counted, so every website purchase is missing.
//
//   node scripts/backfill-sold-count.mjs           → dry run (prints totals, writes nothing)
//   node scripts/backfill-sold-count.mjs --apply   → writes them
//
// Same rules as lib/soldCount.js: an order counts if it's paid and not cancelled/returned.
// Every order it counts gets soldCounted: true, so running it twice never double-counts.
// Manual sales were already counted when recorded; they only get the flag.
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ path: ".env", quiet: true });

const APPLY = process.argv.includes("--apply");
const UNSOLD_STATUSES = ["cancelled", "returned"];

// Online cart items carry the product id as `_id`; manual sales use `productId`
const productIdOf = (item) => String(item.productId || item._id || "");

await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 30000 });
const db = mongoose.connection.db;
const orders = await db
  .collection("orders")
  .find({ soldCounted: { $ne: true } }, { projection: { items: 1, source: 1, status: 1, paymentStatus: 1 } })
  .toArray();

const totals = new Map(); // productId → quantity to add
const countedIds = [];
const manualIds = [];
let skipped = 0;

for (const order of orders) {
  if (order.source === "manual") {
    manualIds.push(order._id);
    continue;
  }
  const paid = (order.paymentStatus ?? "paid") === "paid";
  const active = !UNSOLD_STATUSES.includes(String(order.status || "").toLowerCase());
  if (!paid || !active) {
    skipped++;
    continue;
  }
  for (const item of order.items || []) {
    const id = productIdOf(item);
    const qty = Number(item.quantity) || 0;
    if (!mongoose.isValidObjectId(id) || qty <= 0) continue;
    totals.set(id, (totals.get(id) || 0) + qty);
  }
  countedIds.push(order._id);
}

const products = await db
  .collection("products")
  .find({ _id: { $in: [...totals.keys()].map((id) => new mongoose.Types.ObjectId(id)) } }, { projection: { name: 1, soldCount: 1 } })
  .toArray();
const byId = new Map(products.map((p) => [String(p._id), p]));

console.log("\nProduct                                            current  +add  → new");
for (const [id, add] of [...totals].sort((a, b) => b[1] - a[1])) {
  const p = byId.get(id);
  if (!p) {
    console.log(`  (deleted product ${id})`.padEnd(52), "    -", String(add).padStart(5), "  skipped");
    continue;
  }
  const current = p.soldCount || 0;
  console.log(`  ${p.name.slice(0, 48).padEnd(50)}${String(current).padStart(7)}${String(add).padStart(6)}  → ${current + add}`);
}

console.log(
  `\n${orders.length} uncounted orders: ${countedIds.length} to count, ` +
    `${manualIds.length} manual (already counted, flag only), ${skipped} unpaid/cancelled (left alone).`
);

if (APPLY) {
  const productOps = [...totals]
    .filter(([id]) => byId.has(id))
    .map(([id, add]) => ({ updateOne: { filter: { _id: new mongoose.Types.ObjectId(id) }, update: { $inc: { soldCount: add } } } }));
  if (productOps.length) await db.collection("products").bulkWrite(productOps);
  const flagged = await db
    .collection("orders")
    .updateMany({ _id: { $in: [...countedIds, ...manualIds] } }, { $set: { soldCounted: true } });
  console.log(`Applied: ${productOps.length} products updated, ${flagged.modifiedCount} orders flagged.`);
} else {
  console.log("Dry run — nothing written. Re-run with --apply to save.");
}

await mongoose.disconnect();
