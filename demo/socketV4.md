import { Server } from "socket.io";

let connectedUsers = {};
let io;

export const receiverIdCheck = (receiverId) => {
return connectedUsers[receiverId];
};

const setupSocket = (httpServer) => {
io = new Server(httpServer, {
cors: {
origin: "\*",
methods: ["GET", "POST"],
},
});

io.on("connection", (socket) => {
console.log("A user connected, socket.id:", socket.id);

    // Register user by userId when they connect
    socket.on("register_user", (data) => {
      if (data?.userId) {
        connectedUsers[data.userId] = socket.id;
        console.log("Updated connectedUsers:", connectedUsers);
      } else {
        console.error("No userId provided in register_user");
      }
    });

    // Listen for typing events
    socket.on("typing", (data) => {
      const receiverSocketId = connectedUsers[data.receiver];
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("typing", data);
      } else {
        console.error(`Receiver with userId: ${data?.receiver} not connected`);
      }
    });

    // Listen for stop_typing events
    socket.on("stop_typing", (data) => {
      const receiverSocketId = connectedUsers[data.receiver];
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("stop_typing", data);
      } else {
        console.error(`Receiver with userId: ${data?.receiver} not connected`);
      }
    });

    socket.on("message_delivered", (data) => {
      const receiverSocketId = connectedUsers[data.receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("status_updated", {
          _id: data.messageId,
          status: "delivered",
        });
        io.to(socket.id).emit("status_updated", {
          messageId,
          status: "delivered",
        });
      }
    });

    socket.on("message_read", (data) => {
      const receiverSocketId = connectedUsers[data.receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("status_updated", {
          _id: data.messageId,
          status: "read",
        });
        io.to(socket.id).emit("status_updated", {
          _id: data.messageId,
          status: "read",
        });
      }
    });

    // Clean up when a user disconnects
    socket.on("disconnect", () => {
      for (const userId in connectedUsers) {
        if (connectedUsers[userId] === socket.id) {
          console.log(`User with userId: ${userId} disconnected`);
          delete connectedUsers[userId];
          break;
        }
      }
      console.log("Updated connectedUsers after disconnect:", connectedUsers);
    });

});
};

export { io };

export default setupSocket;
