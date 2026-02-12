import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  // Filters
  const search = searchParams.get("search");
  const categories =
    searchParams.get("categories")?.split(",").filter(Boolean) || [];
  const specials =
    searchParams.get("specials")?.split(",").filter(Boolean) || [];
  const features =
    searchParams.get("features")?.split(",").filter(Boolean) || [];
  const availability = searchParams.get("availability");
  const minPrice = parseFloat(searchParams.get("minPrice"));
  const maxPrice = parseFloat(searchParams.get("maxPrice"));
  const minRating = parseFloat(searchParams.get("minRating"));

  // Pagination
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 100;
  const skip = (page - 1) * limit;

  // Sorting
  const sortBy = searchParams.get("sort") || "default";
  const sortOptions = {
    default: { createdAt: -1 },
    oldest: { createdAt: 1 },
    "price-low-high": { price: 1 },
    "price-high-low": { price: -1 },
    "rating-high-low": { averageRating: -1 },
    "rating-low-high": { averageRating: 1 },
  };

  // Build the MongoDB query object
  const query = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (categories.length > 0) {
    query.category = { $in: categories };
  }

  if (specials.length > 0) {
    specials.forEach((s) => {
      query[s] = true;
    });
  }

  if (features.length > 0) {
    query.features = { $all: features };
  }

  if (availability === "inStock") {
    query.availability = true;
  } else if (availability === "outOfStock") {
    query.availability = false;
  }

  if (!isNaN(minPrice) || !isNaN(maxPrice)) {
    query.price = {};
    if (!isNaN(minPrice)) query.price.$gte = minPrice;
    if (!isNaN(maxPrice)) query.price.$lte = maxPrice;
  }

  if (!isNaN(minRating)) {
    query.averageRating = { $gte: minRating };
  }

  // Fetch total count and products
  const totalCount = await Product.countDocuments(query);

  const products = await Product.find(query)
    .sort(sortOptions[sortBy] || { createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return Response.json({
    products,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
}
