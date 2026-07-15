import express from "express";
import {
  sendInterest,
  respondToInterest,
  getMyInterestsAsTenant,
  getMyInterestsAsOwner,
} from "../controllers/interestController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/listing/:listingId", protect, authorize("tenant"), sendInterest);
router.patch("/:id/respond", protect, authorize("owner"), respondToInterest);
router.get("/tenant", protect, authorize("tenant"), getMyInterestsAsTenant);
router.get("/owner", protect, authorize("owner"), getMyInterestsAsOwner);

export default router;
