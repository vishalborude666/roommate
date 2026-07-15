import mongoose from "mongoose";

const compatibilityScoreSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    explanation: { type: String, required: true },
    source: { type: String, enum: ["llm", "rule-based"], required: true }, // tracks fallback usage
  },
  { timestamps: true }
);

// One score per tenant-listing pair; re-generated only if listing/profile changes (see service)
compatibilityScoreSchema.index({ tenant: 1, listing: 1 }, { unique: true });

export default mongoose.model("CompatibilityScore", compatibilityScoreSchema);
