import Interest from "../models/Interest.js";
import Listing from "../models/Listing.js";
import TenantProfile from "../models/TenantProfile.js";
import { getOrCreateCompatibilityScore } from "../services/compatibilityService.js";
import { sendHighInterestEmail, sendInterestReceivedEmail, sendInterestDecisionEmail } from "../services/emailService.js";

const HIGH_SCORE_THRESHOLD = Number(process.env.HIGH_SCORE_THRESHOLD) || 80;

// @desc Tenant sends interest to an owner for a listing
export const sendInterest = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.listingId).populate("owner", "name email");
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.status === "filled") return res.status(400).json({ message: "This listing has already been filled" });

    const profile = await TenantProfile.findOne({ tenant: req.user._id });
    if (!profile) return res.status(400).json({ message: "Complete your tenant profile before expressing interest" });

    const scoreDoc = await getOrCreateCompatibilityScore(req.user._id, profile, listing);

    const interest = await Interest.create({
      tenant: req.user._id,
      owner: listing.owner._id,
      listing: listing._id,
      compatibilityScore: scoreDoc.score,
    });

    // Notification flow: always notify owner of new interest; extra "hot lead" email above threshold
    if (scoreDoc.score >= HIGH_SCORE_THRESHOLD) {
      await sendHighInterestEmail({
        ownerEmail: listing.owner.email,
        ownerName: listing.owner.name,
        tenantName: req.user.name,
        listingTitle: listing.title,
        score: scoreDoc.score,
        explanation: scoreDoc.explanation,
      });
    } else {
      await sendInterestReceivedEmail({
        ownerEmail: listing.owner.email,
        ownerName: listing.owner.name,
        tenantName: req.user.name,
        listingTitle: listing.title,
        score: scoreDoc.score,
      });
    }

    res.status(201).json({ interest, score: scoreDoc.score, explanation: scoreDoc.explanation });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "You've already expressed interest in this listing" });
    }
    next(err);
  }
};

// @desc Owner accepts/declines an interest
export const respondToInterest = async (req, res, next) => {
  try {
    const { decision } = req.body; // "accepted" | "declined"
    if (!["accepted", "declined"].includes(decision)) {
      return res.status(400).json({ message: "decision must be 'accepted' or 'declined'" });
    }

    const interest = await Interest.findOne({ _id: req.params.id, owner: req.user._id })
      .populate("tenant", "name email")
      .populate("listing", "title");
    if (!interest) return res.status(404).json({ message: "Interest request not found" });

    interest.status = decision;
    await interest.save();

    await sendInterestDecisionEmail({
      tenantEmail: interest.tenant.email,
      tenantName: interest.tenant.name,
      listingTitle: interest.listing.title,
      accepted: decision === "accepted",
    });

    res.json({ interest });
  } catch (err) {
    next(err);
  }
};

export const getMyInterestsAsTenant = async (req, res, next) => {
  try {
    const interests = await Interest.find({ tenant: req.user._id })
      .populate("listing")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });
    res.json({ interests });
  } catch (err) {
    next(err);
  }
};

export const getMyInterestsAsOwner = async (req, res, next) => {
  try {
    const interests = await Interest.find({ owner: req.user._id })
      .populate("listing")
      .populate("tenant", "name email")
      .sort({ createdAt: -1 });
    res.json({ interests });
  } catch (err) {
    next(err);
  }
};
