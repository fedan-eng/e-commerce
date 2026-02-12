// app/api/delivery/regions/route.js
import { connectDB } from "@/lib/db";
import DeliveryRegion from "@/models/DeliveryRegion";

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

// SEED or ADD regions
export async function POST(req) {
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
