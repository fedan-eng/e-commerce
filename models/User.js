import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    firstName: {
      type: String,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true, 
    },
    isActive: { type: Boolean, default: true },

    dob: {
      type: String,
    },

    role: { type: String, enum: ["user", "admin"], default: "user" },

    address: {
      type: String,
    },

    phone: {
      type: String,
    },

    addPhone: {
      type: String,
    },

    country: {
      type: String,
    },

    city: {
      type: String,
    },

    region: {
      name: { type: String, default: "" },
      fee: { type: Number, default: 0 },
    },

    resetPasswordCode: { type: String },
    resetPasswordExpiry: { type: Date },
    cart: {
  items: [
    {
      _id:      { type: String },
      name:     { type: String },
      price:    { type: Number },
      image:    { type: String },
      quantity: { type: Number, default: 1 },
      color:    { type: String, default: "" },
    },
  ],
  updatedAt:          { type: Date, default: null },
  abandonedEmailSent: { type: Boolean, default: false }, // prevent duplicate emails
},
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
