import Message from "../model/message-model.js";

// Function to send a message
const sendMessage = async (req, res) => {
  const { sender, receiver, text } = req.body;
  // console.log({sender, receiver, text})
  try {
    const newMessage = await Message.create({ sender, receiver, text });
    res.status(200).json({ message: newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Function to get the conversation between two users
const getConvo = async (req, res) => {
  const { id } = req.params;
  try {
    // Retrieve all messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: id, receiver: req.query.receiver },
        { sender: req.query.receiver, receiver: id },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
};

export default { sendMessage, getConvo };
