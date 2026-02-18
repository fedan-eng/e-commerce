import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { verifyToken } from "@/lib/auth";

export async function GET(req, context) {
  await connectDB();
  const { id } = await context.params;
  try {
    const order = await Order.findById(id);
    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), { status: 404 });
    }
    return new Response(JSON.stringify({ order }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
}

export async function PATCH(req, context) {
  await connectDB();
  const { id } = await context.params;

  try {
    // Just verify a valid token exists — role check is handled by middleware
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    // Don't check role here — middleware already blocked non-admins
    verifyToken(token); // just validate it's a real token

    const { status } = await req.json();

    // Accept any casing from the DB
    const validStatuses = ["pending", "processing", "shipped", "delivered", 
                           "cancelled", "confirmed", "processed"];
    if (!validStatuses.includes(status.toLowerCase())) {
      return new Response(JSON.stringify({ message: "Invalid status" }), { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ order }), { status: 200 });
  } catch (error) {
    console.error("PATCH error:", error.message);
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
}