import mongoose from "mongoose";

// ─── Subdoc: a single user's star rating (used for averageRating calc) ────────
const ratingSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  value: { type: Number, required: true, min: 1, max: 5 },
});

// ─── Subdoc: a review comment (text + its own star rating) ───────────────────
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: { type: String, required: true, trim: true },

  // ✅ Each review carries its own star rating (1–5)
  rating: { type: Number, min: 1, max: 5, default: null },

  createdAt: { type: Date, default: Date.now },

  status: {
    type: String,
    enum: ["pending", "approved", "archived"],
    default: "pending", // all new reviews need admin approval
  },

  // Arrays of user ObjectIds who liked / disliked this review
  likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

// ─── Main product schema ──────────────────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true },
    description:   { type: String },
    price:         { type: Number, required: true },
    originalPrice: { type: Number },

    tag: {
      type: String,
      enum: ["hurry", "fast", "new", "discount"],
      default: null,
    },

    videos: { type: [String], default: [] },

    colors: [
      {
        name:   String,
        images: { type: [String], default: [] },
      },
    ],

    boxContent: [
      {
        item:     { type: String, trim: true },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],

    category:         { type: String, required: true },
    features:         { type: [String], default: [] },
    availability:     { type: Boolean, default: true },
    secondaryImages:  { type: [String], default: [] },

    isDiscounted:  { type: Boolean, default: false },
    isBestseller:  { type: Boolean, default: false },
    isTodaysDeal:  { type: Boolean, default: false },
    isWhatsNew:    { type: Boolean, default: false },

    image: { type: String },

    // ✅ Aggregate rating pool (one entry per user, used to compute averageRating)
    ratings:       [ratingSchema],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount:  { type: Number, default: 0 },

    soldCount: { type: Number, default: 0 },

    // ✅ Reviews — each carries text + its own rating field
    comments: [commentSchema],

    sortOrder: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

// ─── Helper: recompute averageRating + ratingsCount from ratings array ────────
// Call this after pushing/pulling from product.ratings, then save().
productSchema.methods.recalcRatings = function () {
  const arr = this.ratings;
  this.ratingsCount  = arr.length;
  this.averageRating = arr.length
    ? arr.reduce((sum, r) => sum + r.value, 0) / arr.length
    : 0;
};

export default mongoose.models.Product || mongoose.model("Product", productSchema);