// Migration script to fix existing dirty rating data
// Run this once to recalculate averageRating and ratingsCount from approved comments only

import { connectDB } from "../lib/db.js";
import Product from "../models/Product.js";

async function fixRatings() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Find all products that have comments
    const products = await Product.find({ "comments.0": { $exists: true } });
    console.log(`Found ${products.length} products with comments`);

    let updatedCount = 0;

    for (const product of products) {
      // Calculate ratings from approved comments only
      const approvedComments = product.comments.filter(
        c => c.status === "approved" || (!c.status && c.rating)
      );
      
      const oldRatingsCount = product.ratingsCount;
      const oldAverageRating = product.averageRating;
      const oldRatingsArray = product.ratings?.length || 0;
      
      product.ratingsCount = approvedComments.length;
      product.averageRating = approvedComments.length
        ? parseFloat(
            (approvedComments.reduce((sum, c) => sum + (c.rating ?? 5), 0) / approvedComments.length).toFixed(1)
          )
        : 0;
      
      // Also sync the ratings array to only approved comments
      product.ratings = approvedComments
        .filter(c => c.rating != null)
        .map(c => ({ user: c.user, value: c.rating }));

      // Only save if there's a change
      if (oldRatingsCount !== product.ratingsCount || 
          oldAverageRating !== product.averageRating ||
          oldRatingsArray !== product.ratings.length) {
        await product.save();
        updatedCount++;
        console.log(`Updated product "${product.name}": ${oldRatingsCount}→${product.ratingsCount} reviews, ${oldAverageRating}→${product.averageRating} avg rating, ${oldRatingsArray}→${product.ratings.length} ratings array entries`);
      }
    }

    console.log(`\nMigration complete! Updated ${updatedCount} products.`);
    console.log("Products now only count approved comments in their ratings.");

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

// Run the migration
fixRatings();
