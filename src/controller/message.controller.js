import Message from "../model/message-model.js";

const sendMessage = async (req, res) => {
  const { senderId, receiverId, text } = req.body;
  try {
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
    });

    await newMessage.save();

    // console.log("New message created:", newMessage);

    res.status(200).json({
      message: {
        messageId: newMessage.messageId,
        senderId,
        receiverId,
        text,
        status: newMessage.status,
        timestamp: newMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

const getConvo = async (req, res) => {
  const { id } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId: id, receiverId: req.query.receiver },
        { senderId: req.query.receiver, receiverId: id },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
};

export const markMessageAsDelivered = async (req, res) => {
  const { messageId, status } = req.body;

  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { status },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
};

const deleteMessage = async (req, res) => {
  const messageId = req.params.id;
  try {
    if (!messageId) {
      return res.status(404).json({ error: "Message Id not found" });
    }
    const message = await Message.findByIdAndUpdate(
      messageId,
      {
        isDeleted: true,
      },
      { new: true }
    );

    res.status(200).json({ success: true, message: message });
  } catch (error) {}
};

export default { sendMessage, getConvo, markMessageAsDelivered, deleteMessage };
