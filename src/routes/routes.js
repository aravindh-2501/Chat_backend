import express from "express";
import userController from "../controller/user.controller.js";
import messageController from "../controller/message.controller.js";

const { login, register, getAllUsers, getUsersWithConversation } =
  userController;
const { sendMessage, getConvo } = messageController;
const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/users", getAllUsers);
router.post("/sendMsg", sendMessage);
router.get("/getConvo/:id", getConvo);
router.get("/getConvoUser", getUsersWithConversation);

export default router;
