import mongoose from "mongoose";

const { Schema, model } = mongoose;

const roomSchema = new Schema(
  {
    roomName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    roomType: {
      type: String,
      enum: ["private", "group"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
