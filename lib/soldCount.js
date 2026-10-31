// lib/soldCount.js — keeps Product.soldCount in step with orders.
//
// An order adds to soldCount once it's paid, and takes it back off if it's
// cancelled or returned. The order's `soldCounted` flag is flipped atomically
// before touching products, so the Paystack webhook and verify-payment (which
// can both handle the same payment) can never count an order twice.
import mongoose from "mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { revalidateProduct } from "@/lib/revalidate";

// Statuses whose items should NOT be counted as sold
export const UNSOLD_STATUSES = ["cancelled", "returned"];

// Online cart items carry the product id as `_id`; manual sales use `productId`
const productIdOf = (item) => item.productId || item._id;

async function applyToProducts(items, sign) {
  const valid = (items || []).filter((it) => mongoose.isValidObjectId(productIdOf(it)) && Number(it.quantity) > 0);
  await Promise.all(
    valid.map((it) => {
      const qty = Number(it.quantity);
      const filter = { _id: productIdOf(it) };
      // Never let a decrement push the count below zero
      if (sign < 0) filter.soldCount = { $gte: qty };
      return Product.updateOne(filter, { $inc: { soldCount: sign * qty } });
    })
  );
  valid.forEach((it) => revalidateProduct(productIdOf(it)));
}

// Adds a paid, active order's items to soldCount. Safe to call more than once.
export async function countOrderSales(orderId) {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, soldCounted: { $ne: true }, paymentStatus: "paid", status: { $nin: UNSOLD_STATUSES } },
      { $set: { soldCounted: true } },
      { new: true }
    );
    if (order) await applyToProducts(order.items, +1);
  } catch (err) {
    console.error(`countOrderSales(${orderId}) failed:`, err);
  }
}

// Removes a previously counted order's items from soldCount. Safe to call more than once.
export async function uncountOrderSales(orderId) {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, soldCounted: true },
      { $set: { soldCounted: false } },
      { new: true }
    );
    if (order) await applyToProducts(order.items, -1);
  } catch (err) {
    console.error(`uncountOrderSales(${orderId}) failed:`, err);
  }
}
