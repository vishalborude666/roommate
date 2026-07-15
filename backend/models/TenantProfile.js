import mongoose from "mongoose";

const tenantProfileSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    preferredLocations: [{ type: String, trim: true }],
    budgetMin: { type: Number, required: true },
    budgetMax: { type: Number, required: true },
    moveInDate: { type: Date, required: true },
    roomTypePreference: {
      type: String,
      enum: ["single", "shared", "1BHK", "2BHK", "PG", "any"],
      default: "any",
    },
    lifestyle: {
      foodPreference: { type: String, enum: ["veg", "non-veg", "any"], default: "any" },
      smoking: { type: Boolean, default: false },
      pets: { type: Boolean, default: false },
      workSchedule: { type: String, enum: ["day", "night", "flexible"], default: "flexible" },
    },
    bio: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("TenantProfile", tenantProfileSchema);
