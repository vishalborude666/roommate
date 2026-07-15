import express from "express";
import {
  createListing,
  updateListing,
  markListingFilled,
  getOwnerListings,
  browseListings,
  getListingById,
} from "../controllers/listingController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, authorize("owner"), createListing);
router.get("/mine", protect, authorize("owner"), getOwnerListings);
router.get("/browse", protect, authorize("tenant"), browseListings);
router.put("/:id", protect, authorize("owner"), updateListing);
router.patch("/:id/fill", protect, authorize("owner"), markListingFilled);
router.get("/:id", protect, getListingById);

export default router;
