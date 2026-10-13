// app/api/admin/sales/route.js
// Manual (offline) sales entered by staff from the admin console.
// Stored as Orders with source: "manual" so dashboard stats include them.

import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PAYMENT_METHODS = ["cash", "transfer", "pos"];
const NO_STORE = { "Cache-Control": "no-store, no-cache, must-revalidate" };

function requireAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE }) };
  const user = verifyToken(token);
  if (user?.role !== "admin") return { error: NextResponse.json({ message: "Forbidden" }, { status: 403, headers: NO_STORE }) };
  return { user };
}

// ── GET: list manual sales ──────────────────────────────────
export async function GET(req) {
  await connectDB();
  const { error } = requireAdmin(req);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const page  = parseInt(searchParams.get("page"))  || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;

    const query = { source: "manual" };
    const [total, sales, [sums]] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("recordedBy", "firstName lastName")
        .lean(),
      Order.aggregate([{ $match: query }, { $group: { _id: null, revenue: { $sum: "$total" } } }]),
    ]);

    return NextResponse.json(
      { sales, total, page, totalPages: Math.ceil(total / limit), revenue: sums?.revenue || 0 },
      { headers: NO_STORE }
    );
  } catch (err) {
    console.error("[admin/sales GET]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500, headers: NO_STORE });
  }
}

// ── POST: record a manual sale ──────────────────────────────
export async function POST(req) {
  await connectDB();
  const { user, error } = requireAdmin(req);
  if (error) return error;

  try {
    const body = await req.json();
    const {
      firstName, lastName, email, phone, address, city,
      items, paymentMethod, discount, orderNote, saleDate,
    } = body;

    if (!firstName?.trim()) return NextResponse.json({ message: "Customer name is required" }, { status: 400 });
    if (!PAYMENT_METHODS.includes(paymentMethod)) return NextResponse.json({ message: "Invalid payment method" }, { status: 400 });
    if (!Array.isArray(items) || !items.length) return NextResponse.json({ message: "Add at least one item" }, { status: 400 });

    // Resolve products server-side so category/image come from the catalogue.
    // Price may be overridden (negotiated price), but must be a positive number.
    const ids = items.map(it => it.productId).filter(id => mongoose.isValidObjectId(id));
    const products = await Product.find({ _id: { $in: ids } }).select("name price category image colors").lean();
    const byId = Object.fromEntries(products.map(p => [String(p._id), p]));

    const orderItems = [];
    for (const it of items) {
      const product  = byId[String(it.productId)];
      const quantity = parseInt(it.quantity, 10);
      const price    = it.price === "" || it.price == null ? product?.price : Number(it.price);
      if (!product) return NextResponse.json({ message: "One of the selected products no longer exists" }, { status: 400 });
      if (!quantity || quantity < 1) return NextResponse.json({ message: `Invalid quantity for ${product.name}` }, { status: 400 });
      if (!Number.isFinite(price) || price < 0) return NextResponse.json({ message: `Invalid price for ${product.name}` }, { status: 400 });

      orderItems.push({
        productId: product._id,
        name:      product.name,
        category:  product.category,
        image:     product.image || product.colors?.[0]?.images?.[0] || "",
        color:     it.color || "",
        price,
        quantity,
      });
    }

    const subTotal = orderItems.reduce((a, it) => a + it.price * it.quantity, 0);
    const disc     = Math.max(0, Number(discount) || 0);
    if (disc > subTotal) return NextResponse.json({ message: "Discount cannot exceed subtotal" }, { status: 400 });

    const date = saleDate ? new Date(saleDate) : new Date();
    if (isNaN(date) || date > new Date()) return NextResponse.json({ message: "Invalid sale date" }, { status: 400 });

    const digits = String(phone || "").replace(/\D/g, "");

    const order = await Order.create({
      source:        "manual",
      recordedBy:    user.id,
      userId:        null,
      firstName:     firstName.trim(),
      lastName:      lastName?.trim() || "",
      email:         email?.trim() || "",
      phone:         digits ? Number(digits) : undefined,
      address:       address?.trim() || "",
      city:          city?.trim() || "",
      orderNote:     orderNote?.trim() || "",
      items:         orderItems,
      subTotal,
      deliveryFee:   0,
      discount:      disc,
      total:         subTotal - disc,
      paymentMethod,
      paymentStatus: "paid",
      status:        "delivered",
      statusHistory: [{ status: "delivered", date }],
      createdAt:     date,
      followUpSent:  true, // no automated customer emails for offline sales
    });

    await Promise.all(
      orderItems.map(it => Product.updateOne({ _id: it.productId }, { $inc: { soldCount: it.quantity } }))
    );

    return NextResponse.json({ sale: order }, { status: 201, headers: NO_STORE });
  } catch (err) {
    console.error("[admin/sales POST]", err);
    return NextResponse.json({ message: err.message || "Server error" }, { status: 500, headers: NO_STORE });
  }
}

// ── DELETE: remove a manual sale (?id=...) ──────────────────
export async function DELETE(req) {
  await connectDB();
  const { error } = requireAdmin(req);
  if (error) return error;

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "Invalid id" }, { status: 400 });

    // Only manual sales can be deleted here — never touch online orders
    const order = await Order.findOneAndDelete({ _id: id, source: "manual" });
    if (!order) return NextResponse.json({ message: "Sale not found" }, { status: 404 });

    await Promise.all(
      (order.items || []).map(it =>
        Product.updateOne({ _id: it.productId, soldCount: { $gte: it.quantity } }, { $inc: { soldCount: -it.quantity } })
      )
    );

    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  } catch (err) {
    console.error("[admin/sales DELETE]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500, headers: NO_STORE });
  }
}
