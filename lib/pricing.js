// lib/pricing.js — prices and delivery fees for /api/paystack, taken from the database.
// The cart in the browser only says *what* is being bought; never what it costs.
import mongoose from "mongoose";
import Product from "@/models/Product";
import DeliveryRegion from "@/models/DeliveryRegion";
import { FREE_DELIVERY_MIN_SUBTOTAL } from "@/components/checkout/delivery";

const MAX_QUANTITY = 100;

/**
 * Re-prices cart items from the Product collection. Returns { items, subTotal } with each
 * item's real name and price, or { error } when something can't be bought. Needs an open DB connection.
 */
export async function priceCart(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return { error: "Cart is empty" };

  const ids = cartItems.map((item) => item?._id);
  if (!ids.every((id) => mongoose.isValidObjectId(id))) return { error: "Some items in your cart are no longer available" };

  const products = await Product.find({ _id: { $in: ids } }).select("name price availability").lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const items = [];
  for (const item of cartItems) {
    const product = byId.get(String(item._id));
    const quantity = Number(item.quantity);
    if (!product || product.availability === false) {
      return { error: `${product?.name || item.name || "An item"} is no longer available. Please remove it from your cart.` };
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return { error: `Please check the quantity of ${product.name}` };
    }
    items.push({ ...item, name: product.name, price: product.price, quantity });
  }

  const subTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { items, subTotal };
}

/**
 * Delivery fee from the DeliveryRegion collection, using the same rules as the checkout
 * (components/checkout/delivery.js). Returns { fee, region } or { error }.
 */
export async function deliveryFeeFor(deliveryType, regionName, subTotal) {
  const record = regionName ? await DeliveryRegion.findOne({ region: String(regionName) }).lean() : null;
  if (!record) return { error: "Please choose a delivery region" };

  const region = { name: record.region, fee: record.fee };
  if (deliveryType === "Free") {
    if (subTotal < FREE_DELIVERY_MIN_SUBTOTAL) return { error: "Free delivery needs a bigger order" };
    return { fee: 0, region };
  }
  if (deliveryType === "Express") return { fee: record.fee * 2, region };
  return { fee: record.fee, region };
}
