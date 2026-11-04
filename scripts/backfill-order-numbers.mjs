// scripts/backfill-order-numbers.mjs
// One-off: give past orders their orderNumber (last 8 characters of _id, uppercase), so the
// tracker can find them by the short number in the emails. New orders get it on save (models/Order.js).
//
//   node scripts/backfill-order-numbers.mjs           → dry run (prints counts, writes nothing)
//   node scripts/backfill-order-numbers.mjs --apply   → writes them
//
// Only touches orders without one, so running it twice is harmless.
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ path: ".env", quiet: true });

const APPLY = process.argv.includes("--apply");
const BATCH = 1000;

// Same as lib/orderStatus.js shortId
const shortId = (id) => String(id).slice(-8).toUpperCase();

await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 30000 });
const orders = mongoose.connection.db.collection("orders");

const missing = await orders.find({ orderNumber: { $in: [null, ""] } }, { projection: { _id: 1 } }).toArray();
console.log(`${missing.length} orders without an order number.`);

if (APPLY) {
  let written = 0;
  for (let i = 0; i < missing.length; i += BATCH) {
    const ops = missing.slice(i, i + BATCH).map(({ _id }) => ({
      updateOne: { filter: { _id }, update: { $set: { orderNumber: shortId(_id) } } },
    }));
    written += (await orders.bulkWrite(ops)).modifiedCount;
  }
  await orders.createIndex({ orderNumber: 1 });
  console.log(`Applied: ${written} orders updated, orderNumber index ensured.`);
} else {
  console.log("Dry run — nothing written. Re-run with --apply to save.");
}

await mongoose.disconnect();
