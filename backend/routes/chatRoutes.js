import express from "express";
import { getMessages, getMyConversations } from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/conversations", protect, getMyConversations);
router.get("/:interestId/messages", protect, getMessages);

export default router;
