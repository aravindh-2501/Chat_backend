import {
  LOGIN_SUCCESS,
  SERVER_ERROR,
  USER_NOT_FOUND,
  INVALID_CREDENTIALS,
} from "../constant/messages.js";
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  OK,
  UNAUTHORIZED,
} from "../constant/statusCodes.js";
import bcrypt from "bcryptjs";
import User from "../model/user-model.js";
import { generateToken } from "../utils/token-utils.js";
import Message from "../model/message-model.js";

const isValidEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

// Registration handler
const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // console.log("REGISTER", username, email, password);

    // Check if the username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      // console.log("Username already taken");
      return res.status(400).json({ error: "Username already taken" });
    }

    // Check if the email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      // console.log("Email already registered"); // Debugging
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash the password using bcrypt
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create the new user in the database
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate a JWT token for the new user
    const token = generateToken(user);

    // Respond with success message, user data, and token
    res.status(201).json({ data: user, token, msg: "Successfully registered" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Login handler
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(UNAUTHORIZED).json({ error: USER_NOT_FOUND });
    }

    console.log({ existingUser });

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(UNAUTHORIZED).json({ error: INVALID_CREDENTIALS });
    }

    const token = generateToken(existingUser);

    res.status(OK).json({
      user: {
        _id: existingUser._id,
        email: existingUser.email,
        username: existingUser.username,
        avatar: existingUser.avatar,
      },
      token,
      msg: LOGIN_SUCCESS,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: SERVER_ERROR });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const loggedInUserId = req.query.userId;

    if (!loggedInUserId) {
      return res.status(BAD_REQUEST).json({ msg: "User ID is required" });
    }

    const users = await User.find({ _id: { $ne: loggedInUserId } }).select(
      "-password"
    );
    console.log("getAllusers", users);
    res.status(OK).json({ data: users, msg: "Users retrieved successfully" });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res
      .status(INTERNAL_SERVER_ERROR)
      .json({ msg: "An error occurred while retrieving users" });
  }
};

// Get users with conversation
const getUsersWithConversation = async (req, res) => {
  try {
    const loggedInUserId = req.query.userId;

    if (!loggedInUserId) {
      return res.status(400).json({ msg: "User ID is required" });
    }

    // Find messages where the logged-in user is either sender or receiver
    const usersWithConvo = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    if (usersWithConvo.length === 0) {
      return res.status(200).json({
        data: [],
        msg: "No conversations found for this user",
      });
    }

    // Extract unique user IDs from conversations
    const uniqueUsers = usersWithConvo.map((msg) =>
      msg.senderId.toString() === loggedInUserId.toString()
        ? msg.receiverId
        : msg.senderId
    );

    const uniqueUserIds = [
      ...new Set(uniqueUsers.map((user) => user.toString())),
    ];

    // Fetch user details excluding the logged-in user
    const users = await User.find({
      _id: { $in: uniqueUserIds },
    });

    console.log("uniqueryIds", users);
    res.status(200).json({
      data: users,
      msg: "Users with conversation retrieved successfully",
    });
  } catch (error) {
    console.error("Error retrieving users with conversation:", error);
    res.status(500).json({
      msg: "An error occurred while retrieving users with conversation",
    });
  }
};

const updateProfile = async (req, res) => {
  const { id } = req.params;
  const { avatar, username } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { _id: id },
      { avatar, username },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log({ user });

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

export default {
  login,
  register,
  getAllUsers,
  getUsersWithConversation,
  updateProfile,
};
