import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true }, // e.g. "Kothrud, Pune"
    rent: { type: Number, required: true }, // monthly rent in INR
    availableFrom: { type: Date, required: true },
    roomType: {
      type: String,
      enum: ["single", "shared", "1BHK", "2BHK", "PG"],
      required: true,
    },
    furnishing: {
      type: String,
      enum: ["unfurnished", "semi-furnished", "fully-furnished"],
      default: "semi-furnished",
    },
    description: { type: String, default: "" },
    amenities: [{ type: String }],
    photos: [{ type: String }], // URLs (S3 or external)
    status: {
      type: String,
      enum: ["active", "filled"],
      default: "active",
    },
  },
  { timestamps: true }
);

listingSchema.index({ location: "text", title: "text" });
listingSchema.index({ status: 1, rent: 1 });

export default mongoose.model("Listing", listingSchema);
