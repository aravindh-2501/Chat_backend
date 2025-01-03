import { Server } from "socket.io";

const setupSocket = (httpServer) => {
const io = new Server(httpServer, {
cors: {
origin: "\*", // Allowing all origins (you might want to restrict this for security reasons)
methods: ["GET", "POST"],
},
});

// To store connected users' socket ids by their userId
const connectedUsers = {};

io.on("connection", (socket) => {
// console.log("A user connected, socket.id:", socket.id);

    // Register user by userId when they connect
    socket.on("register_user", (data) => {
      // console.log("User registered:", data);
      if (data?.userId) {
        connectedUsers[data.userId] = socket.id;
        // console.log("Updated connectedUsers:", connectedUsers);
      } else {
        console.error("No userId provided in register_user");
      }
    });

    // Listen for send_message events
    socket.on("send_message", (msg) => {
      // console.log("Message received:", msg);

      const receiverId = msg.receiver;
      if (!receiverId) {
        // console.error("No receiverId in message");
        return;
      }

      // Get the receiver's socket ID from connected users
      const receiverSocketId = connectedUsers[receiverId];
      if (receiverSocketId) {
        // console.log(
        //   `Sending message to userId: ${receiverId}, socketId: ${receiverSocketId}`
        // );
        // Emit the message to the receiver
        socket.to(receiverSocketId).emit("receive_message", msg);
      } else {
        // console.error(`Receiver with userId: ${receiverId} not connected`);
      }
    });

    // Listen for typing events
    socket.on("typing", (data) => {
      // console.log("typing", data);
      // console.log(`${senderId} is typing to ${receiverId}`);
      const receiverSocketId = connectedUsers[data.receiver];
      // console.log("receiverSocketId", receiverSocketId);
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("typing", data);
      } else {
        // console.error(`Receiver with userId: ${data?.receiver} not connected`);
      }
    });

    // Listen for stop_typing events
    socket.on("stop_typing", (data) => {
      // console.log("typing", data);
      // console.log(`${senderId} is typing to ${receiverId}`);
      const receiverSocketId = connectedUsers[data.receiver];
      // console.log("receiverSocketId", receiverSocketId);
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("typing", data);
      } else {
        // console.error(`Receiver with userId: ${data?.receiver} not connected`);
      }
    });

    // Clean up when a user disconnects
    socket.on("disconnect", () => {
      // Remove the user from the connectedUsers object when they disconnect
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

export default setupSocket;
