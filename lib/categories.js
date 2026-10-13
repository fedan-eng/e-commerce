// lib/categories.js
// Single source of truth for the category landing pages (/products/<slug>).
// Each page renders the same <CategoryPage /> template — only this config changes.

const SITE_URL = "https://www.filstore.com.ng";

// Price brackets. The lowest bracket's label keeps its design range ("₦5,000 – ₦15,000")
// but matches from ₦0, so cheaper products aren't left out of every bracket.
const priceFilter = ([lowest, ...rest]) => ({
  key: "price",
  label: "Price",
  field: "price",
  type: "range",
  options: [{ ...lowest, min: 0 }, ...rest],
});

const saleFilter = {
  key: "offers",
  label: "Offers",
  field: "isDiscounted",
  type: "boolean",
  options: [{ id: "on-sale", label: "On Sale" }],
};

const compatFilter = {
  key: "compat",
  label: "Device Compatibility",
  field: "specs.compatibility",
  type: "multi",
  options: [
    { id: "phones", label: "Phones" },
    { id: "laptops", label: "Laptops" },
    { id: "multi-device", label: "Multi-Device" },
  ],
};

// Filter conventions (also used to build the admin "Specs" inputs):
//   type "range"  → stored as a Number; `unit` is shown next to the admin input
//   type "multi"  → stored as [String], or a single String when `single: true`
//   option.all    → matches products that have *every* listed value (admin skips these)
//   filter.hidden → not shown in the sidebar (used by chips only)

// Shared FAQs that appear at the bottom of every category's FAQ list
const commonFaqs = [
  { q: "How do I pay, and can I pay on delivery?", a: "TODO" },
  { q: "How fast is delivery?", a: "TODO" },
  { q: "What if I want to return something?", a: "TODO" },
];

export const CATEGORIES = {
  "power-banks": {
    slug: "power-banks",
    dbCategory: "Power Bank", // value stored in Product.category
    title: "Power Banks",
    heroText:
      "Keep every device alive through outages, travel and long work days. FIL's power banks pair fast charging with real-world durability, so you're never caught without a charge.",
    heroImage: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/CatProductHero5.png",
    theme: {
      cardBg: "#D9F7E7",     // product card image background
      chipBg: "#DDF7E8",     // inactive quick-filter chip
      chipBorder: "#4CB97A",
      exploreBg: "#93E8C1",  // Explore More / nav menu tile
    },
    exploreImage: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/ExplorePb.png",
    menuText: "Pocket-sized backup for when light takes a break.",
    chips: [
      { label: "All", set: {} },
      { label: "Over 20,000mAh", set: { capacity: ["over-20k"] } },
      { label: "Under 10,000mAh", set: { capacity: ["under-10k"] } },
      { label: "10,000 – 20,000mAh", set: { capacity: ["10k-20k"] } },
    ],
    filters: [
      {
        key: "capacity",
        label: "Capacity",
        field: "specs.capacityMah",
        type: "range",
        unit: "mAh",
        options: [
          { id: "under-10k", label: "Under 10,000mAh", max: 9999 },
          { id: "10k-20k", label: "10,000 – 20,000mAh", min: 10000, max: 20000 },
          { id: "over-20k", label: "Over 20,000mAh", min: 20001 },
        ],
      },
      priceFilter([
        { id: "5k-15k", label: "₦5,000 – ₦15,000", min: 5000, max: 15000 },
        { id: "15k-30k", label: "₦15,000 – ₦30,000", min: 15000, max: 30000 },
        { id: "30k-50k", label: "₦30,000 – ₦50,000", min: 30000, max: 50000 },
        { id: "50k-plus", label: "₦50,000+", min: 50000 },
      ]),
      saleFilter,
      compatFilter,
      {
        key: "ports",
        label: "Port Type",
        field: "specs.ports",
        type: "multi",
        options: [
          { id: "USB-C", label: "USB-C" },
          { id: "USB-A", label: "USB-A" },
          { id: "Lightning", label: "Lightning" },
        ],
      },
      {
        key: "speed",
        label: "Charging Speed",
        field: "specs.outputW",
        type: "range",
        unit: "W",
        adminLabel: "Max Output",
        options: [
          { id: "up-to-20", label: "Up to 20W", max: 20 },
          { id: "20-45", label: "20W – 45W", min: 20.01, max: 45 },
          { id: "over-45", label: "Over 45W", min: 45.01 },
        ],
      },
      {
        key: "features",
        label: "Features",
        field: "specs.featureTags",
        type: "multi",
        options: [
          { id: "magnetic", label: "Magnetic / MagSafe" },
          { id: "wireless-charging", label: "Wireless Charging" },
          { id: "built-in-cable", label: "Built-in Cable" },
          { id: "digital-display", label: "Digital Display" },
        ],
      },
    ],
    helpCard: {
      title: "Not sure which size you need?",
      text: "Tell us your phone and how long your days are. We'll recommend the right power bank.",
    },
    faqTitle: "Questions about Power Banks",
    faqs: [
      { q: "How many times will a power bank charge my phone?", a: "TODO" },
      { q: "Can I take a power bank on a plane?", a: "TODO" },
      { q: "How long does it take to recharge the power bank itself?", a: "TODO" },
      { q: "Can I charge my phone while the power bank is charging?", a: "TODO" },
      ...commonFaqs,
    ],
    seo: {
      title: "Power Bank Price in Nigeria | Buy Power Banks Online | FIL Store",
      description:
        "Buy power bank online Nigeria at best prices. Original power banks 5,000mAh to 60,000mAh. Fast charging, magnetic wireless, solar power bank. Pay on delivery available. Fast delivery in Lagos, Abuja, Port Harcourt.",
      keywords:
        "power bank price in Nigeria, buy power bank online Nigeria, original power bank Nigeria, power bank for sale in Nigeria, affordable power bank Nigeria, cheap power bank Nigeria, power bank delivery Lagos",
    },
  },

  chargers: {
    slug: "chargers",
    dbCategory: "Chargers",
    title: "Chargers",
    heroText:
      "Compact, high-output chargers for phones, laptops and everything in between. FIL's charger range packs real power into small, travel-ready designs.",
    heroImage: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/CatProductHero3.png",
    theme: {
      cardBg: "#FFF1B8",
      chipBg: "#FFF1B8",
      chipBorder: "#E3B21A",
      exploreBg: "#FFCD4D",
    },
    exploreImage: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/ExploreChg.png",
    menuText: "Fast chargers that get you from 5% to out the door.",
    chips: [
      { label: "All Chargers", set: {} },
      { label: "Below 65W", set: { output: ["below-65"] } },
      { label: "65W – 100W", set: { output: ["65-100"] } },
      { label: "Above 100W", set: { output: ["above-100"] } },
    ],
    filters: [
      {
        key: "output",
        label: "Total Power Output",
        field: "specs.outputW",
        type: "range",
        unit: "W",
        options: [
          { id: "below-65", label: "Below 65W", max: 64.99 },
          { id: "65-100", label: "65W – 100W", min: 65, max: 100 },
          { id: "above-100", label: "Above 100W", min: 100.01 },
        ],
      },
      priceFilter([
        { id: "5k-15k", label: "₦5,000 – ₦15,000", min: 5000, max: 15000 },
        { id: "15k-30k", label: "₦15,000 – ₦30,000", min: 15000, max: 30000 },
        { id: "30k-50k", label: "₦30,000 – ₦50,000", min: 30000, max: 50000 },
        { id: "50k-plus", label: "₦50,000+", min: 50000 },
      ]),
      saleFilter,
      compatFilter,
      {
        key: "ports",
        label: "Port Type",
        field: "specs.ports",
        type: "multi",
        options: [
          { id: "USB-C", label: "USB-C" },
          { id: "USB-A", label: "USB-A" },
          { id: "USB-C+USB-A", label: "USB-C and USB-A", all: ["USB-C", "USB-A"] },
        ],
      },
      {
        key: "type",
        label: "Charging Type",
        field: "specs.chargingType",
        type: "multi",
        single: true,
        options: [
          { id: "wall", label: "Wall Chargers" },
          { id: "desktop", label: "Desktop Chargers" },
          { id: "car", label: "Car Chargers" },
        ],
      },
      {
        key: "portCount",
        label: "Number of Ports",
        field: "specs.portCount",
        type: "range",
        unit: "ports",
        options: [
          { id: "1", label: "1 Port", min: 1, max: 1 },
          { id: "2-3", label: "2 – 3 Ports", min: 2, max: 3 },
          { id: "4-plus", label: "More Than 3 Ports", min: 4 },
        ],
      },
    ],
    helpCard: {
      title: "Which charger fits your phone?",
      text: "Send us your phone model on WhatsApp and we'll tell you the right charger and cable.",
    },
    faqTitle: "Questions about Chargers",
    faqs: [
      { q: "Will a fast charger damage my phone's battery?", a: "TODO" },
      { q: "Which charger is right for my phone?", a: "TODO" },
      { q: "Do your wall chargers fit Nigerian sockets?", a: "TODO" },
      { q: "Does the charger come with a cable?", a: "TODO" },
      ...commonFaqs,
    ],
    seo: {
      title: "Fast Charging Cable Nigeria | Buy Charger Online | USB-C, Lightning | FIL Store",
      description:
        "Buy charger online Nigeria. Fast charging cable, USB-C cable, Lightning cable, original charger Nigeria. iPhone & Android compatible. 3-in-1 cable, type-c cable. Pay on delivery available. Charger delivery Lagos.",
      keywords:
        "fast charging cable Nigeria, buy charger online Nigeria, original charger Nigeria, USB-C cable price in Nigeria, Lightning cable price in Nigeria, cheap charger Nigeria, charger under ₦10,000 Nigeria",
    },
  },

  wearables: {
    slug: "wearables",
    dbCategory: "Wearables",
    title: "Wearables",
    heroText:
      "Earbuds, headphones and smartwatches that keep up with your commute, workouts and calls.",
    heroImage: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/CatProductHero2.png",
    theme: {
      cardBg: "#E4DEFF",
      chipBg: "#E4DEFF",
      chipBorder: "#9580F0",
      exploreBg: "#C9BCFF",
    },
    exploreImage: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/ExploreWear.png",
    menuText: "Earbuds that outlast your longest go-slow.",
    chips: [
      { label: "All", set: {} },
      { label: "Earbuds", set: { type: ["earbuds"] } },
      { label: "Over 20hr battery", set: { battery: ["over-20"] } },
    ],
    filters: [
      priceFilter([
        { id: "8k-20k", label: "₦8,000 – ₦20,000", min: 8000, max: 20000 },
        { id: "20k-40k", label: "₦20,000 – ₦40,000", min: 20000, max: 40000 },
        { id: "40k-70k", label: "₦40,000 – ₦70,000", min: 40000, max: 70000 },
        { id: "70k-plus", label: "₦70,000+", min: 70000 },
      ]),
      saleFilter,
      {
        key: "battery",
        label: "Battery Life",
        field: "specs.batteryHours",
        type: "range",
        unit: "hr",
        options: [
          { id: "under-10", label: "Under 10hr", max: 9.99 },
          { id: "10-20", label: "10 – 20hr", min: 10, max: 20 },
          { id: "over-20", label: "Over 20hr", min: 20.01 },
        ],
      },
      {
        key: "features",
        label: "Features",
        field: "specs.featureTags",
        type: "multi",
        options: [
          { id: "noise-cancellation", label: "Noise Cancellation" },
          { id: "water-resistant", label: "Water Resistant" },
          { id: "heart-rate", label: "Heart Rate Monitor" },
          { id: "touch-controls", label: "Touch Controls" },
        ],
      },
      {
        key: "connectivity",
        label: "Connectivity",
        field: "specs.connectivity",
        type: "multi",
        single: true,
        options: [
          { id: "Bluetooth 5.0", label: "Bluetooth 5.0" },
          { id: "Bluetooth 5.3", label: "Bluetooth 5.3" },
        ],
      },
      // Hidden group used by the "Earbuds" chip
      {
        key: "type",
        label: "Type",
        field: "specs.wearableType",
        type: "multi",
        single: true,
        hidden: true,
        options: [
          { id: "earbuds", label: "Earbuds" },
          { id: "headphones", label: "Headphones" },
          { id: "smartwatch", label: "Smartwatch" },
        ],
      },
    ],
    helpCard: {
      title: "Not sure which ear bud fit you?",
      text: "Tell us how you'll use them (calls, gym, gaming) and we'll point you to the right pair.",
    },
    faqTitle: "Questions about Wearables",
    faqs: [
      { q: "Will FIL earbuds work with my phone?", a: "TODO" },
      { q: "How do I pair my earbuds for the first time?", a: "TODO" },
      { q: "Can I wear them to the gym or in the rain?", a: "TODO" },
      { q: "How long does the battery last?", a: "TODO" },
      ...commonFaqs,
    ],
    seo: {
      title: "Wireless Earbuds Nigeria | Buy Earbuds Online | Noise Cancelling | FIL Store",
      description:
        "Buy wireless earbuds online Nigeria. Noise cancelling earbuds, ANC, Bluetooth earbuds, sports earbuds. Original earbuds at best prices. Pay on delivery available. Earbuds shop in Lagos with fast delivery.",
      keywords:
        "wireless earbuds Nigeria, buy earbuds online Nigeria, noise cancelling earbuds Nigeria, earbuds price in Nigeria, original earbuds Lagos, best earbuds to buy in Nigeria, affordable earbuds Nigeria, cheap earbuds Nigeria",
    },
  },

  extensions: {
    slug: "extensions",
    dbCategory: "Extensions",
    title: "Extensions",
    heroText:
      "Power more devices from one outlet without compromising on safety. FIL's extension range combines surge protection with generous socket counts, built for Nigerian homes, shops and offices.",
    heroImage: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/CatProductHero4.png",
    theme: {
      cardBg: "#FDE3D9",
      chipBg: "#FDE3D9",
      chipBorder: "#F08B6B",
      exploreBg: "#FFA488",
    },
    exploreImage: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/ExploreExt.png",
    menuText: "Surge-protected extensions for every room.",
    featuredTitle: "See what everyone else is using.",
    chips: [
      { label: "All Extensions", set: {} },
      { label: "4 Sockets", set: { sockets: ["4"] } },
      { label: "6 Sockets", set: { sockets: ["6"] } },
      { label: "8+ Sockets", set: { sockets: ["8-plus"] } },
    ],
    filters: [
      {
        key: "sockets",
        label: "Number of Sockets",
        field: "specs.socketCount",
        type: "range",
        unit: "sockets",
        options: [
          { id: "4", label: "4 Sockets", max: 4 },
          { id: "6", label: "6 Sockets", min: 5, max: 7 },
          { id: "8-plus", label: "8+ Sockets", min: 8 },
        ],
      },
      priceFilter([
        { id: "3k-8k", label: "₦3,000 – ₦8,000", min: 3000, max: 8000 },
        { id: "8k-15k", label: "₦8,000 – ₦15,000", min: 8000, max: 15000 },
        { id: "15k-25k", label: "₦15,000 – ₦25,000", min: 15000, max: 25000 },
        { id: "25k-plus", label: "₦25,000+", min: 25000 },
      ]),
      saleFilter,
      {
        key: "features",
        label: "Features",
        field: "specs.featureTags",
        type: "multi",
        options: [
          { id: "surge-protection", label: "Surge Protection" },
          { id: "usb-ports", label: "Built-In USB Ports" },
          { id: "fire-resistant", label: "Fire-Resistant Casing" },
          { id: "extra-long-cable", label: "Extra-Long Cable" },
        ],
      },
      {
        key: "cable",
        label: "Cable Length",
        field: "specs.cableLengthM",
        type: "range",
        unit: "m",
        options: [
          { id: "1-2", label: "1 – 2m", max: 2.99 },
          { id: "3-5", label: "3 – 5m", min: 3, max: 5 },
          { id: "5-plus", label: "5m+", min: 5.01 },
        ],
      },
    ],
    helpCard: {
      title: "Powering a shop or office?",
      text: "Tell us what you need to plug in and we'll suggest the right extensions. Bulk orders welcome.",
    },
    faqTitle: "Questions about Extensions",
    faqs: [
      { q: "What does surge protection do?", a: "TODO" },
      { q: "How much can I plug into one extension?", a: "TODO" },
      { q: "Can I use FIL extensions with a generator or inverter?", a: "TODO" },
      { q: "Do you sell in bulk for shops and offices?", a: "TODO" },
      ...commonFaqs,
    ],
    seo: {
      title: "Extension Cable Nigeria | Power Strip & Surge Protector | Buy Extension Online | FIL Store",
      description:
        "Buy extension cable online Nigeria. Power strip, surge protector, multi socket extension with USB ports. Wireless charging extensions. Protect devices from power surges. Pay on delivery available. Extension delivery Lagos.",
      keywords:
        "extension cable Nigeria, buy extension online Nigeria, power strip Lagos, surge protector Nigeria, multi socket Nigeria, USB extension, cheap extension Nigeria",
    },
  },

  lifestyle: {
    slug: "lifestyle",
    dbCategory: "Lifestyle",
    title: "Lifestyle",
    heroText:
      "Everyday gadgets that make life easier — mini projectors, rechargeable lamps and fans, all built with the same FIL reliability.",
    heroImage: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/CatProductHero1.png",
    theme: {
      cardBg: "#DDEEFF",
      chipBg: "#DDEEFF",
      chipBorder: "#6FAEEA",
      exploreBg: "#B0DDFF",
    },
    exploreImage: "https://pub-2793ec977eaa425a9595b78bd8c10d2b.r2.dev/products/bfaa0d7e92484ec783dc80fcb299da8f5a08211d.png",
    menuText: "Projectors, lamps and rechargeable fans for when light goes.",
    featuredTitle: "See what everyone else is using.",
    reviewsTitle: "What customers say about our Lifestyle Products",
    chips: [
      { label: "All Lifestyle", set: {} },
      { label: "Mini Projectors", set: { type: ["projector"] } },
      { label: "Lamps", set: { type: ["lamp"] } },
      { label: "Rechargeable Fans", set: { type: ["fan"] } },
    ],
    filters: [
      {
        key: "type",
        label: "Category",
        adminLabel: "Product Type",
        field: "specs.lifestyleType",
        type: "multi",
        single: true,
        options: [
          { id: "projector", label: "Mini Projectors" },
          { id: "lamp", label: "Lamps" },
          { id: "fan", label: "Rechargeable Fans" },
        ],
      },
      priceFilter([
        { id: "5k-15k", label: "₦5,000 – ₦15,000", min: 5000, max: 15000 },
        { id: "15k-30k", label: "₦15,000 – ₦30,000", min: 15000, max: 30000 },
        { id: "30k-50k", label: "₦30,000 – ₦50,000", min: 30000, max: 50000 },
        { id: "50k-plus", label: "₦50,000+", min: 50000 },
      ]),
      saleFilter,
      {
        key: "power",
        label: "Power Source",
        field: "specs.powerSource",
        type: "multi",
        options: [
          { id: "rechargeable", label: "Rechargeable" },
          { id: "mains", label: "Mains Powered" },
        ],
      },
      {
        key: "features",
        label: "Features",
        field: "specs.featureTags",
        type: "multi",
        options: [
          { id: "bluetooth", label: "Bluetooth" },
          { id: "remote-control", label: "Remote Control" },
          { id: "dimmable", label: "Dimmable" },
          { id: "multi-speed", label: "Multi-Speed" },
        ],
      },
    ],
    helpCard: {
      title: "Need cool air though long outages?",
      text: "Tell us your room size and how long light is usually off. We'll suggest the right fan.",
    },
    faqTitle: "Questions about Projectors and Fans",
    faqs: [
      { q: "How long does a rechargeable fan run on one charge?", a: "TODO" },
      { q: "How long does the fan take to charge fully?", a: "TODO" },
      { q: "Can I use the fan while it's charging?", a: "TODO" },
      { q: "Can the fan charge my phone?", a: "TODO" },
      ...commonFaqs,
    ],
    seo: {
      title: "Smart Projector Nigeria | Solar Rechargeable Bulb for Sale | Tech Lifestyle | FIL Store",
      description:
        "Buy smart projector online Nigeria at best prices. Solar rechargeable bulb for sale in Nigeria, rechargeable bulb price in Nigeria. Tech lifestyle gadgets, smart home devices. Pay on delivery available. Fast delivery nationwide.",
      keywords:
        "smart projector Nigeria, solar rechargeable bulb Nigeria, rechargeable bulb for sale in Nigeria, rechargeable bulb price in Nigeria, best deal on smart projector Nigeria, buy tech gadgets online Nigeria",
    },
  },
};

export const CATEGORY_SLUGS = Object.keys(CATEGORIES);

export const WHATSAPP_URL = "https://wa.me/2347018900705";

export function getCategory(slug) {
  return CATEGORIES[slug] || null;
}

// ─── Admin helpers ────────────────────────────────────────────────────────────

// Values for the admin "Category" dropdown (what gets stored in Product.category)
export const CATEGORY_OPTIONS = Object.values(CATEGORIES).map((c) => ({
  value: c.dbCategory,
  label: c.title,
}));

export function getCategoryByDbName(dbCategory) {
  const name = (dbCategory || "").toLowerCase();
  return Object.values(CATEGORIES).find((c) => c.dbCategory.toLowerCase() === name) || null;
}

// The spec inputs the admin form should show for a category, derived from its filters
// → [{ name: "capacityMah", label, kind: "number" | "select" | "multiselect", unit, options }]
export function getSpecFields(dbCategory) {
  const cat = getCategoryByDbName(dbCategory);
  if (!cat) return [];
  return cat.filters
    .filter((f) => f.field.startsWith("specs."))
    .map((f) => ({
      name: f.field.slice("specs.".length),
      label: f.adminLabel || f.label,
      kind: f.type === "range" ? "number" : f.single ? "select" : "multiselect",
      unit: f.unit || "",
      options: (f.options || []).filter((o) => !o.all),
    }));
}

export function buildCategoryMetadata(slug) {
  const cat = getCategory(slug);
  if (!cat) return {};
  const url = `${SITE_URL}/products/${slug}`;
  return {
    title: cat.seo.title,
    description: cat.seo.description,
    keywords: cat.seo.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: cat.seo.title,
      description: cat.seo.description,
      url,
      siteName: "FIL Store",
      locale: "en_NG",
      type: "website",
    },
  };
}

// ─── Filtering ────────────────────────────────────────────────────────────────

function getField(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function matchesOption(value, option, type) {
  if (type === "boolean") return value === true;
  if (type === "range") {
    if (typeof value !== "number") return false;
    if (option.min != null && value < option.min) return false;
    if (option.max != null && value > option.max) return false;
    return true;
  }
  // multi
  const values = Array.isArray(value) ? value : value == null ? [] : [value];
  if (option.all) return option.all.every((v) => values.includes(v));
  return values.includes(option.id);
}

// selected: { [filterKey]: string[] of option ids }
// Options within a group are OR'd, groups are AND'd.
export function filterProducts(products, category, selected) {
  const active = category.filters.filter((f) => selected[f.key]?.length);
  if (!active.length) return products;

  return products.filter((p) =>
    active.every((f) => {
      const value = getField(p, f.field);
      const opts = f.options.filter((o) => selected[f.key].includes(o.id));
      return opts.some((o) => matchesOption(value, o, f.type));
    })
  );
}

// URL <-> selected filter state
export function selectedFromParams(category, searchParams) {
  const selected = {};
  for (const f of category.filters) {
    const raw = searchParams.get(f.key);
    if (raw) selected[f.key] = raw.split(",").filter(Boolean);
  }
  return selected;
}

export function selectedToQuery(selected) {
  const params = new URLSearchParams();
  for (const [key, ids] of Object.entries(selected)) {
    if (ids?.length) params.set(key, ids.join(","));
  }
  return params.toString();
}
