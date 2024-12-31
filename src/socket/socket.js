// socket/setupSocket.js

import { Server } from "socket.io";
import {
  handleRegisterUser,
  handleJoinRoom,
  handleSendMessage,
  handleStartTyping,
  handleStopTyping,
  handleDisconnect,
  handleDeleteMessage,
} from "./socketEvents.js";

let io;
export const roomMap = new Map();
export const onlineUsers = new Map();

const setupSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected, socket.id:", socket.id);

    socket.on("register_user", ({ userId, token }) => {
      handleRegisterUser(socket, userId, token);
    });

    socket.on("join_room", ({ senderId, receiverId }) => {
      handleJoinRoom(socket, senderId, receiverId);
    });

    socket.on("send_message", (data) => {
      handleSendMessage(data);
    });

    socket.on("start_typing", ({ senderId, receiverId, isTyping }) => {
      handleStartTyping(socket, senderId, receiverId, isTyping);
    });

    socket.on("stop_typing", ({ senderId, receiverId, isTyping }) => {
      handleStopTyping(socket, senderId, receiverId, isTyping);
    });

    socket.on("delete_message", (data) => {
      const { messageId, senderId, receiverId } = data;
      handleDeleteMessage(messageId, senderId, receiverId);
    });

    socket.on("disconnect", () => {
      handleDisconnect(socket);
    });
  });
};

export { io };
export default setupSocket;
