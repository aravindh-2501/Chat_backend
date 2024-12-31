import mongoose from "mongoose";

const { Schema, model } = mongoose;

const MessageSchema = new Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.virtual("messageId").get(function () {
  return this._id.toString();
});

// Optionally, include virtuals when converting to JSON
MessageSchema.set("toJSON", {
  virtuals: true,
});

const Message = model("Message", MessageSchema);

export default Message;
