import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/revalidate";

export async function PATCH(req) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  await connectDB();

  try {
    const { category, orderedIds } = await req.json();

    if (!category || !Array.isArray(orderedIds)) {
      return Response.json({ message: "Invalid payload" }, { status: 400 });
    }

    await Promise.all(
      orderedIds.map((id, index) =>
        Product.findByIdAndUpdate(id, {
          $set: { [`sortOrder.${category}`]: index },
        })
      )
    );
    revalidateStorefront();

    return Response.json({ message: "Order saved" });
  } catch (err) {
    console.error("Sort order error:", err);
    return Response.json({ message: "Failed to save order" }, { status: 500 });
  }
}