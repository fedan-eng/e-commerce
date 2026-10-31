// app/api/admin/promocodes/[id]/route.js
// PATCH  — edit a code's rules (the code itself can't change once created)
// DELETE — remove a code that no order has used yet; used codes get switched off instead
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import PromoCode from "@/models/PromoCode";
import Order from "@/models/Order";
import { parsePromoBody, toClient } from "@/lib/promoCodes";

async function findPromo(context) {
  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  await connectDB();
  return PromoCode.findById(id);
}

const ordersWith = (code) =>
  Order.exists({ promoCode: code }).collation({ locale: "en", strength: 2 });

export async function PATCH(req, context) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const promo = await findPromo(context);
  if (!promo) return NextResponse.json({ message: "Promo code not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));

  // Quick on/off from the list
  if (Object.keys(body).length === 1 && "active" in body) {
    promo.active = Boolean(body.active);
  } else {
    const { data, error } = parsePromoBody(body, { isNew: false });
    if (error) return NextResponse.json({ message: error }, { status: 400 });
    promo.set(data);
  }

  await promo.save();
  return NextResponse.json({ code: toClient(promo.toObject()) });
}

export async function DELETE(req, context) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const promo = await findPromo(context);
  if (!promo) return NextResponse.json({ message: "Promo code not found" }, { status: 404 });

  if (await ordersWith(promo.code)) {
    return NextResponse.json(
      { message: "Orders have used this code, so it can't be deleted. Switch it off instead." },
      { status: 409 }
    );
  }

  await promo.deleteOne();
  return NextResponse.json({ message: "Deleted" });
}
