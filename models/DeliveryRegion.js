// models/DeliveryRegion.js
import mongoose from "mongoose";

const DeliveryRegionSchema = new mongoose.Schema({
  region: { type: String, required: true, unique: true },
  fee: { type: Number, required: true },
});

export default mongoose.models.DeliveryRegion ||
  mongoose.model("DeliveryRegion", DeliveryRegionSchema);
