import mongoose from "mongoose";

const pendingVerificationSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    hashedPassword: { type: String, required: true },
    verificationCode: { type: String, required: true },
    verificationCodeExpiry: { type: Date, required: true },

    // TTL FIELD
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // expires after 600 seconds (10 minutes)
    },
  },

  { timestamps: true }
);

export default mongoose.models.PendingVerification ||
  mongoose.model("PendingVerification", pendingVerificationSchema);
