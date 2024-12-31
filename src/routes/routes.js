import express from "express";
import userController from "../controller/user.controller.js";
import messageController from "../controller/message.controller.js";

const {
  login,
  register,
  getAllUsers,
  getUsersWithConversation,
  updateProfile,
} = userController;
const { sendMessage, getConvo, markMessageAsDelivered, deleteMessage } =
  messageController;
const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/users", getAllUsers);
router.post("/sendMsg", sendMessage);
router.get("/getConvo/:id", getConvo);
router.get("/getConvoUser", getUsersWithConversation);
router.post("/messages/update-status", markMessageAsDelivered);
router.put("/messages/:id/delete-message", deleteMessage);
router.put("/profile-update/:id", updateProfile);

export default router;

/// notes
// POST /api/auth/login
// GET /api/users/:id
// POST /api/chat/room
// GET /api/chat/rooms
// POST /api/chat/message
// GET /api/chat/messages/:roomId
// POST /api/chat/read
// POST /api/chat/typing
// POST /api/chat/readReceipt
