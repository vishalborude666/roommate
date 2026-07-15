import TenantProfile from "../models/TenantProfile.js";
import CompatibilityScore from "../models/CompatibilityScore.js";

export const upsertProfile = async (req, res, next) => {
  try {
    const profile = await TenantProfile.findOneAndUpdate(
      { tenant: req.user._id },
      { ...req.body, tenant: req.user._id },
      { upsert: true, new: true, runValidators: true }
    );

    // Preferences changed -> invalidate this tenant's cached scores so they recompute
    await CompatibilityScore.deleteMany({ tenant: req.user._id });

    res.json({ profile });
  } catch (err) {
    next(err);
  }
};

export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await TenantProfile.findOne({ tenant: req.user._id });
    res.json({ profile });
  } catch (err) {
    next(err);
  }
};
