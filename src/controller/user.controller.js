import {
  EMAIL_ALREADY_REGISTERED,
  LOGIN_SUCCESS,
  REGISTRATION_SUCCESS,
  SERVER_ERROR,
  USER_NOT_FOUND,
} from "../constant/messages.js";
import {
  BAD_REQUEST,
  CREATED,
  INTERNAL_SERVER_ERROR,
  OK,
} from "../constant/statusCodes.js";
import bcrypt from "bcryptjs";
import User from "../model/user-model.js";
import { generateToken } from "../utils/token-utils.js";
import Message from "../model/message-model.js";

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(BAD_REQUEST).json({ error: EMAIL_ALREADY_REGISTERED });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user);

    res.status(CREATED).json({ data: user, token, msg: REGISTRATION_SUCCESS });
  } catch (error) {
    res.status(BAD_REQUEST).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(UNAUTHORIZED).json({ error: USER_NOT_FOUND });
    }
    // console.log("existingUser",existingUser)
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(UNAUTHORIZED).json({ error: INVALID_CREDENTIALS });
    }
    // console.log("isMatch",isMatch)

    const token = generateToken(existingUser);
    // console.log("token",token)

    res.status(OK).json({
      user: {
        _id: existingUser._id,
        email: existingUser.email,
        username: existingUser.username,
      },
      token,
      msg: LOGIN_SUCCESS,
    });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ error: SERVER_ERROR });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const loggedInUserId = req.query.userId;

    if (!loggedInUserId) {
      return res.status(400).json({ msg: "User ID is required" });
    }
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select(
      "-password"
    );
    // console.log("users",users)
    res.status(200).json({ data: users, msg: "Users retrieved successfully" });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ msg: "An error occurred while retrieving users" });
  }
};

const getUsersWithConversation = async (req, res) => {
  try {
    const loggedInUserId = req.query.userId;

    if (!loggedInUserId) {
      return res.status(400).json({ msg: "User ID is required" });
    }
    // console.log("loggedInUserId",loggedInUserId)

    // Find all users who have sent or received a message with the logged-in user
    const usersWithConvo = await Message.find({
      $or: [{ sender: loggedInUserId }, { receiver: loggedInUserId }],
    });
    // .populate('sender receiver', 'username _id') // Populate the sender and receiver user info
    // .distinct('sender') // Get distinct senders
    // .exec();
    // console.log("usersWithConvo",usersWithConvo)

    // Get only unique users (other than the logged-in user)
    const uniqueUsers = usersWithConvo.map((msg) => {
      return msg.sender._id.toString() === loggedInUserId.toString()
        ? msg.receiver
        : msg.sender;
    });
    // console.log("uniqueUsers",uniqueUsers)

    // Remove duplicates
    const uniqueUserIds = [
      ...new Set(uniqueUsers.map((user) => user.toString())),
    ];

    // Find the full user details for the unique users
    const users = await User.find({
      _id: { $in: uniqueUserIds, $ne: loggedInUserId }, // Exclude logged-in user
    });
    // console.log("Users with conversation retrieved successfully",users)
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

export default { login, register, getAllUsers, getUsersWithConversation };
