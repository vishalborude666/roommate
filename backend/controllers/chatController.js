import Interest from "../models/Interest.js";
import Message from "../models/Message.js";

// @desc Get chat history for an accepted interest (only participants can access)
export const getMessages = async (req, res, next) => {
  try {
    const interest = await Interest.findById(req.params.interestId);
    if (!interest) return res.status(404).json({ message: "Conversation not found" });
    if (interest.status !== "accepted") {
      return res.status(403).json({ message: "Chat is only available after interest is accepted" });
    }

    const isParticipant =
      interest.tenant.toString() === req.user._id.toString() || interest.owner.toString() === req.user._id.toString();
    if (!isParticipant) return res.status(403).json({ message: "Not authorized to view this conversation" });

    const messages = await Message.find({ interest: interest._id }).populate("sender", "name role").sort({ createdAt: 1 });

    res.json({ messages, interest });
  } catch (err) {
    next(err);
  }
};

// @desc List all accepted conversations for the logged-in user
export const getMyConversations = async (req, res, next) => {
  try {
    const interests = await Interest.find({
      status: "accepted",
      $or: [{ tenant: req.user._id }, { owner: req.user._id }],
    })
      .populate("listing", "title location")
      .populate("tenant", "name")
      .populate("owner", "name")
      .sort({ updatedAt: -1 });

    res.json({ conversations: interests });
  } catch (err) {
    next(err);
  }
};
