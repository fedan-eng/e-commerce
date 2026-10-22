// app/api/delivery/regions/route.js
import { connectDB } from "@/lib/db";
import DeliveryRegion from "@/models/DeliveryRegion";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const regions = await DeliveryRegion.find({});
    return new Response(JSON.stringify(regions), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}

// SEED or ADD regions (admins only: fees here are what checkout charges)
export async function POST(req) {
  const session = verifyToken(req.cookies.get("token")?.value || "");
  if (session?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    await connectDB();
    const body = await req.json();

    // body can be a single region or an array
    if (Array.isArray(body)) {
      await DeliveryRegion.insertMany(body, { ordered: false });
    } else {
      await DeliveryRegion.create(body);
    }

    return new Response(
      JSON.stringify({ message: "Regions seeded successfully" }),
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to seed regions" }), {
      status: 500,
    });
  }
}
