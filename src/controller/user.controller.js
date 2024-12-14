import Message from "../model/message-model.js";
import User from "../model/user-model.js";

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.create({ username, email, password });
        res.status(201).json({ data: user, msg: "Successfully registered" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ msg: "Invalid email or password" });
        }
        res.status(200).json({ data: user, msg: "Login successful" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const getAllUsers = async (req, res) => {
    try {
        const loggedInUserId = req.query.userId; 

        if (!loggedInUserId) {
            return res.status(400).json({ msg: "User ID is required" });
        }
        const users = await User.find({_id:{$ne:loggedInUserId}}); 
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
        console.log("loggedInUserId",loggedInUserId)

        // Find all users who have sent or received a message with the logged-in user
        const usersWithConvo = await Message.find({
            $or: [
                { sender: loggedInUserId },
                { receiver: loggedInUserId }
            ]
        })
        // .populate('sender receiver', 'username _id') // Populate the sender and receiver user info
        // .distinct('sender') // Get distinct senders
        // .exec();
        console.log("usersWithConvo",usersWithConvo)

        // Get only unique users (other than the logged-in user)
        const uniqueUsers = usersWithConvo.map(msg => {
            return msg.sender._id.toString() === loggedInUserId.toString() ? msg.receiver : msg.sender;
        });
        console.log("uniqueUsers",uniqueUsers)

        // Remove duplicates
        const uniqueUserIds = [...new Set(uniqueUsers.map(user => user.toString()))];

        // Find the full user details for the unique users
        const users = await User.find({
            _id: { $in: uniqueUserIds, $ne: loggedInUserId }  // Exclude logged-in user
        });
        console.log("Users with conversation retrieved successfully",users)
        res.status(200).json({ data: users, msg: "Users with conversation retrieved successfully" });
    } catch (error) {
        console.error("Error retrieving users with conversation:", error);
        res.status(500).json({ msg: "An error occurred while retrieving users with conversation" });
    }
};


export default { login, register, getAllUsers, getUsersWithConversation }; 

