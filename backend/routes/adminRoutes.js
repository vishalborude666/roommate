import express from "express";
import {
  getAllUsers,
  setUserActiveStatus,
  getAllListings,
  deleteListing,
  getPlatformStats,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/stats", getPlatformStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/status", setUserActiveStatus);
router.get("/listings", getAllListings);
router.delete("/listings/:id", deleteListing);

export default router;
