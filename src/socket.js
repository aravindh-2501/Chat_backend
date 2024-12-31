import { Server } from "socket.io";
import mongoose from "mongoose";
import Message from "./model/message-model.js";

const { Types } = mongoose;

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

    // Register user when they connect
    socket.on("register_user", ({ userId, token }) => {
      // console.log("Received registration data:", { userId, token });

      if (!userId) {
        // console.log("No userId provided for registration.");
        return;
      }

      onlineUsers.set(userId, socket.id);
      // console.log(`User ${userId} registered with socket ID ${socket.id}`);
      // console.log("Current online users:", Array.from(onlineUsers.keys()));

      // Emit online users
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });

    // Join a room for private messaging
    socket.on("join_room", ({ senderId, receiverId }) => {
      // console.log("User join room data:", { senderId, receiverId });

      if (!senderId || !receiverId) {
        // console.log("Invalid sender or receiver ID for joining room.");
        return;
      }

      let roomName =
        roomMap.get(`${senderId}_${receiverId}`) ||
        roomMap.get(`${receiverId}_${senderId}`);

      if (!roomName) {
        roomName = `PM_${String(senderId)}_${String(receiverId)}`;
        roomMap.set(`${senderId}_${receiverId}`, roomName);
        roomMap.set(`${receiverId}_${senderId}`, roomName);
        // console.log(`Created new room: ${roomName}`);
      }

      socket.join(roomName);
      // console.log(`User ${senderId} joined room: ${roomName}`);
    });

    // Handle sending message
    socket.on("send_message", (data) => {
      // console.log("Received message data:", data);

      const { senderId, receiverId, text } = data;
      if (!senderId || !receiverId || !text) {
        // console.log("Invalid message data:", data);
        return;
      }

      const roomName =
        roomMap.get(`${senderId}_${receiverId}`) ||
        roomMap.get(`${receiverId}_${senderId}`);

      if (roomName) {
        // Check if the receiver is online
        if (onlineUsers.has(receiverId)) {
          data.status = "delivered";
          io.to(roomName).emit("receive_message", data);
          // console.log(`Message delivered in room: ${roomName}`, data);
        } else {
          data.status = "sent";
          io.to(roomName).emit("receive_message", data);
          // console.log(`Message sent to offline user: ${receiverId}`, data);
        }
      } else {
        // console.log("Room not found for this pair of users.");
      }
    });

    // Handle typing events
    socket.on("start_typing", ({ senderId, receiverId, isTyping }) => {
      console.log(
        `User ${senderId} started typing in room ${receiverId}:`,
        isTyping
      );

      const roomName =
        roomMap.get(`${senderId}_${receiverId}`) ||
        roomMap.get(`${receiverId}_${senderId}`);

      if (roomName) {
        socket.to(roomName).emit("receiver_typing", { senderId, isTyping });
        console.log(`User ${senderId} is typing in room: ${roomName}`);
      }
    });

    socket.on("stop_typing", ({ senderId, receiverId, isTyping }) => {
      console.log(
        `User ${senderId} stopped typing in room ${receiverId}:`,
        isTyping
      );

      const roomName =
        roomMap.get(`${senderId}_${receiverId}`) ||
        roomMap.get(`${receiverId}_${senderId}`);

      if (roomName) {
        socket.to(roomName).emit("receiver_not_typing", { senderId, isTyping });
        console.log(`User ${senderId} stopped typing in room: ${roomName}`);
      }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected, socket.id:", socket.id);

      // Remove user from onlineUsers
      onlineUsers.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} removed from online users.`);
        }
      });

      // Remove user's room references
      for (const [key, roomName] of roomMap.entries()) {
        if (key.includes(socket.id)) {
          roomMap.delete(key);
          console.log(`Room reference ${key} removed.`);
        }
      }
    });
  });
};

export { io };
export default setupSocket;
