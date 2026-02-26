import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  value: { type: Number, required: true, min: 1, max: 5 },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    tag: {
      type: String,
      enum: ["hurry", "fast", "new", "discount"],
      default: null,
    },

    videos: {
      type: [String],
      default: [],
    },

    colors: [
      {
        name: String,
        images: { type: [String], default: [] },
      },
    ],

    boxContent: [
      {
        item: { type: String, trim: true },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],

    category: { type: String, required: true },
    features: { type: [String], default: [] },
    availability: { type: Boolean, default: true },
    secondaryImages: { type: [String], default: [] },

    isDiscounted: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    isTodaysDeal: { type: Boolean, default: false },
    isWhatsNew: { type: Boolean, default: false },

    image: { type: String },
    ratings: [ratingSchema],
    averageRating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    comments: [
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "approved", "archived"],
      default: "pending",  // all new comments need approval
    },
  },
],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
