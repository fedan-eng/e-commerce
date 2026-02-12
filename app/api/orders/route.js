import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req) {
  await connectDB();

  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const user = verifyToken(token);

    // Extract page and limit from query
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    const orders = await Order.find({ userId: user.id }).sort({
      createdAt: -1,
    });

    // Flatten and group items
    const allItems = [];

for (const order of orders) {
  const grouped = {}; // reset for each order

  for (const item of order.items) {
    // Use a unique product identifier as the key (fallback to name+price+variant if needed)
    const key = item.productId || item._id || `${item.name}-${item.price}-${item.size || ''}-${item.color || ''}`;

    if (!grouped[key]) {
      grouped[key] = {
        ...item,
        quantity: 0,
        orderId: order._id,
        orderDate: order.createdAt,
        status: order.status,
      };
    }

    grouped[key].quantity += item.quantity || 1;
  }

  allItems.push(...Object.values(grouped));
}


    // Sort items by order date desc
    allItems.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    // Pagination
    const totalItems = allItems.length;
    const start = (page - 1) * limit;
    const paginatedItems = allItems.slice(start, start + limit);

    return new Response(
      JSON.stringify({
        items: paginatedItems,
        total: totalItems,
        page,
        totalPages: Math.ceil(totalItems / limit),
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching items:", err);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
    });
  }
}
