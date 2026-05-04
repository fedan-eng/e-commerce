import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  const { id } = await context.params;

  try {
    await connectDB();

    // Find the current product
    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Calculate price range (±30% of current product price)
    const priceMargin = currentProduct.price * 0.3;
    const minPrice = currentProduct.price - priceMargin;
    const maxPrice = currentProduct.price + priceMargin;

    // Build the query with multiple criteria for better recommendations
    const query = {
      _id: { $ne: currentProduct._id }, // Exclude current product
      availability: true, // Only available products
      $or: [
        // Same category (highest priority)
        { category: currentProduct.category },
        
        // Similar features (if features array exists)
        ...(currentProduct.features && currentProduct.features.length > 0
          ? [{ features: { $in: currentProduct.features } }]
          : []),
        
        // Same tag (if tag exists)
        ...(currentProduct.tag ? [{ tag: currentProduct.tag }] : []),
        
        // Similar price range
        {
          price: {
            $gte: Math.max(0, minPrice), // Ensure price doesn't go below 0
            $lte: maxPrice,
          }
        }
      ]
    };

    // Find related products
    const relatedProducts = await Product.find(query)
      .sort({ 
        // Prioritize by multiple factors
        // 1. Bestsellers first
        isBestseller: -1,
        // 2. Higher ratings
        averageRating: -1,
        // 3. More ratings (more popular)
        ratingsCount: -1,
        // 4. Price similarity (closer to current price first)
        price: 1
      })
      .limit(8) // Get up to 8 products
      .lean(); // Return plain objects for better performance

    // If we don't have enough products with the advanced query, fall back to category-only
    if (relatedProducts.length < 3) {
      const fallbackProducts = await Product.find({
        _id: { $ne: currentProduct._id },
        availability: true,
        category: currentProduct.category
      })
      .sort({ 
        isBestseller: -1,
        averageRating: -1,
        ratingsCount: -1
      })
      .limit(8 - relatedProducts.length)
      .lean();

      relatedProducts.push(...fallbackProducts);
    }

    // Remove duplicates and limit to 5 products for the UI
    const uniqueProducts = relatedProducts
      .filter((product, index, self) => 
        index === self.findIndex((p) => p._id.toString() === product._id.toString())
      )
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      related: uniqueProducts,
      strategy: relatedProducts.length >= 3 ? 'advanced' : 'fallback'
    });

  } catch (error) {
    console.error("Error fetching related products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
