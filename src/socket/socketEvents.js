// socket/socketEvents.js

import { getRoomName, createRoom } from "./roomUtils.js";
import { io, onlineUsers, roomMap } from "./socket.js";

export const handleRegisterUser = (socket, userId, token) => {
  if (!userId) return;
  onlineUsers.set(userId, socket.id);

  io.emit("online_users", Array.from(onlineUsers.keys()));
};

export const handleJoinRoom = (socket, senderId, receiverId) => {
  if (!senderId || !receiverId) return;

  let roomName = getRoomName(senderId, receiverId, roomMap);
  if (!roomName) {
    roomName = createRoom(senderId, receiverId, roomMap);
  }

  socket.join(roomName);
};

export const handleSendMessage = (data) => {
  const { senderId, receiverId, text } = data;
  if (!senderId || !receiverId || !text) return;

  const roomName = getRoomName(senderId, receiverId, roomMap);

  if (roomName) {
    data.status = onlineUsers.has(receiverId) ? "delivered" : "sent";
    io.to(roomName).emit("receive_message", data);
  }
};

export const handleStartTyping = (socket, senderId, receiverId, isTyping) => {
  const roomName = getRoomName(senderId, receiverId, roomMap);

  if (roomName) {
    socket.to(roomName).emit("receiver_typing", { senderId, isTyping });
  }
};

export const handleStopTyping = (socket, senderId, receiverId, isTyping) => {
  const roomName = getRoomName(senderId, receiverId, roomMap);

  if (roomName) {
    socket.to(roomName).emit("receiver_not_typing", { senderId, isTyping });
  }
};

export const handleDeleteMessage = (messageId, senderId, receiverId) => {
  if (!messageId || !senderId || !receiverId) return;

  const roomName = getRoomName(senderId, receiverId, roomMap);

  if (roomName) {
    console.log({ messageId });
    io.to(roomName).emit("message_deleted", {
      messageId,
      isDeleted: true,
    });
  }
};

export const handleDisconnect = (socket) => {
  console.log("A user disconnected, socket.id:", socket.id);

  onlineUsers.forEach((socketId, userId) => {
    if (socketId === socket.id) {
      onlineUsers.delete(userId);
    }
  });

  // Remove user's room references
  for (const [key, roomName] of roomMap.entries()) {
    if (key.includes(socket.id)) {
      roomMap.delete(key);
    }
  }
};
