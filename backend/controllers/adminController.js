import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Interest from "../models/Interest.js";
import Message from "../models/Message.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

export const setUserActiveStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

export const getAllListings = async (req, res, next) => {
  try {
    const listings = await Listing.find().populate("owner", "name email").sort({ createdAt: -1 });
    res.json({ listings });
  } catch (err) {
    next(err);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json({ message: "Listing removed" });
  } catch (err) {
    next(err);
  }
};

export const getPlatformStats = async (req, res, next) => {
  try {
    const [totalUsers, totalTenants, totalOwners, totalListings, activeListings, totalInterests, acceptedInterests, totalMessages] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "tenant" }),
        User.countDocuments({ role: "owner" }),
        Listing.countDocuments(),
        Listing.countDocuments({ status: "active" }),
        Interest.countDocuments(),
        Interest.countDocuments({ status: "accepted" }),
        Message.countDocuments(),
      ]);

    res.json({
      totalUsers,
      totalTenants,
      totalOwners,
      totalListings,
      activeListings,
      totalInterests,
      acceptedInterests,
      totalMessages,
    });
  } catch (err) {
    next(err);
  }
};
