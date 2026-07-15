import Listing from "../models/Listing.js";
import TenantProfile from "../models/TenantProfile.js";
import CompatibilityScore from "../models/CompatibilityScore.js";
import { getOrCreateCompatibilityScore } from "../services/compatibilityService.js";

// @desc Owner creates a listing
export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ listing });
  } catch (err) {
    next(err);
  }
};

// @desc Owner updates own listing (triggers score refresh downstream)
export const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findOne({ _id: req.params.id, owner: req.user._id });
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    Object.assign(listing, req.body);
    await listing.save();

    // Invalidate cached scores tied to this listing since details changed
    await CompatibilityScore.deleteMany({ listing: listing._id });

    res.json({ listing });
  } catch (err) {
    next(err);
  }
};

export const markListingFilled = async (req, res, next) => {
  try {
    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { status: "filled" },
      { new: true }
    );
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json({ listing });
  } catch (err) {
    next(err);
  }
};

export const getOwnerListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ listings });
  } catch (err) {
    next(err);
  }
};

// @desc Tenant browses/filters listings, ranked by AI compatibility score
export const browseListings = async (req, res, next) => {
  try {
    const { location, minRent, maxRent, roomType } = req.query;

    const filter = { status: "active" };
    if (location) filter.location = { $regex: location, $options: "i" };
    if (roomType) filter.roomType = roomType;
    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) filter.rent.$gte = Number(minRent);
      if (maxRent) filter.rent.$lte = Number(maxRent);
    }

    const listings = await Listing.find(filter).populate("owner", "name email").sort({ createdAt: -1 });

    const profile = await TenantProfile.findOne({ tenant: req.user._id });

    let ranked = listings.map((l) => ({ listing: l, score: null, explanation: null }));

    if (profile) {
      const scored = await Promise.all(
        listings.map(async (listing) => {
          const result = await getOrCreateCompatibilityScore(req.user._id, profile, listing);
          return { listing, score: result.score, explanation: result.explanation };
        })
      );
      ranked = scored.sort((a, b) => b.score - a.score);
    }

    res.json({ results: ranked, profileComplete: !!profile });
  } catch (err) {
    next(err);
  }
};

export const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate("owner", "name email");
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json({ listing });
  } catch (err) {
    next(err);
  }
};
