import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "http";
import setupSocket from "./socket.js";
import router from "./routes/routes.js";
import cors from "cors";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://MuthuChat:muthu@cluster0.ji3elga.mongodb.net/project_idx_chat?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("MongoDB Connected...");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use("/api", router);

// Default route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Error handling for unhandled routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Call the socket setup function
setupSocket(httpServer);

// Start the server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
