import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Interest from "../models/Interest.js";
import Message from "../models/Message.js";

export default function registerChatSocket(io) {
  // Auth middleware for socket connections - expects { token } in handshake.auth
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("User not found"));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.user.name} (${socket.user.role})`);

    // Join a conversation room scoped to an accepted interest
    socket.on("join_conversation", async ({ interestId }, callback) => {
      try {
        const interest = await Interest.findById(interestId);
        if (!interest || interest.status !== "accepted") {
          return callback?.({ ok: false, error: "Conversation not available" });
        }
        const isParticipant =
          interest.tenant.toString() === socket.user._id.toString() ||
          interest.owner.toString() === socket.user._id.toString();
        if (!isParticipant) {
          return callback?.({ ok: false, error: "Not authorized for this conversation" });
        }
        socket.join(`interest:${interestId}`);
        callback?.({ ok: true });
      } catch (err) {
        callback?.({ ok: false, error: err.message });
      }
    });

    // Send + persist a message, then broadcast to the room
    socket.on("send_message", async ({ interestId, text }, callback) => {
      try {
        if (!text?.trim()) return callback?.({ ok: false, error: "Message cannot be empty" });

        const interest = await Interest.findById(interestId);
        if (!interest || interest.status !== "accepted") {
          return callback?.({ ok: false, error: "Conversation not available" });
        }
        const isParticipant =
          interest.tenant.toString() === socket.user._id.toString() ||
          interest.owner.toString() === socket.user._id.toString();
        if (!isParticipant) return callback?.({ ok: false, error: "Not authorized" });

        const message = await Message.create({
          interest: interestId,
          sender: socket.user._id,
          text: text.trim(),
          readBy: [socket.user._id],
        });

        const populated = await message.populate("sender", "name role");

        io.to(`interest:${interestId}`).emit("new_message", populated);
        callback?.({ ok: true, message: populated });
      } catch (err) {
        callback?.({ ok: false, error: err.message });
      }
    });

    socket.on("typing", ({ interestId }) => {
      socket.to(`interest:${interestId}`).emit("user_typing", { userId: socket.user._id, name: socket.user.name });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.user.name}`);
    });
  });
}
