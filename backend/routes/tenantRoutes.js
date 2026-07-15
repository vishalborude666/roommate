import express from "express";
import { upsertProfile, getMyProfile } from "../controllers/tenantController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.put("/profile", protect, authorize("tenant"), upsertProfile);
router.get("/profile", protect, authorize("tenant"), getMyProfile);

export default router;
