import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req, context) {
  await connectDB();

  const { id } = await context.params;

  try {
    const order = await Order.findById(id);

    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ order }), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Failed to fetch order",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
