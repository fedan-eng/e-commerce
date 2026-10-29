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
      required: function() {
        return !this.googleId; // Password not required for Google OAuth users
      },
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
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
    isVerified: { type: Boolean, default: false },

    dob: {
      type: String,
    },

    // "creator" opens /creator for the promo codes linked to them (PromoCode.creatorUser)
    role: { type: String, enum: ["user", "creator", "admin"], default: "user" },

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
    resetPasswordToken: { type: String },
    resetPasswordTokenExpiry: { type: Date },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
    // 6-digit email code (stored hashed) — the in-page alternative to the verification link
    verificationCode: { type: String },
    verificationCodeExpiry: { type: Date },
    verificationCodeAttempts: { type: Number, default: 0 },
    // Accounts made from the promo popup start with a password we generated and emailed
    passwordIsGenerated: { type: Boolean, default: false },
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
wishlist: {
  items: [
    {
      _id:   { type: String },
      name:  { type: String },
      price: { type: Number },
      image: { type: String },
    },
  ],
  updatedAt: { type: Date, default: null },
},
  },
  { timestamps: true }
);

// "In 50+ people's cart" counts (app/api/products/cart-counts)
userSchema.index({ "cart.items._id": 1, "cart.updatedAt": -1 });

// Never sent to the browser (see /api/auth/me and /api/auth/update-profile)
export const PRIVATE_USER_FIELDS =
  "-password -verificationToken -verificationTokenExpiry -verificationCode -verificationCodeExpiry " +
  "-verificationCodeAttempts -resetPasswordCode -resetPasswordExpiry -resetPasswordToken -resetPasswordTokenExpiry";

export default mongoose.models.User || mongoose.model("User", userSchema);
