import { Server } from 'socket.io';
import Message from './model/message-model.js';

const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const connectedUsers = {}; // Map to track connected users

  io.on('connection', (socket) => {
    // console.log('A user connected, socket.id:', socket.id);

    // Handle user registration
    socket.on('register_user', (userId) => {
      connectedUsers[userId] = socket.id;
      // console.log(`User registered: ${userId} with socket.id: ${socket.id}`);
    });

    socket.on('send_message', async (msg) => {
      // console.log('Received message:', msg);
      try {
        // Send the message to the receiver if they're connected
        const receiverSocketId = connectedUsers[msg.receiver];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_msg', msg);
        } else {
          // console.log(`Receiver ${msg.receiver} is not connected.`);
        }
      } catch (error) {
        console.error(error);
        socket.emit('error', 'Failed to send message');
      }
    });

    socket.on('disconnect', () => {
      // Remove disconnected users from the map
      for (const [userId, socketId] of Object.entries(connectedUsers)) {
        if (socketId === socket.id) {
          delete connectedUsers[userId];
          break;
        }
      }
      // console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export default setupSocket;
