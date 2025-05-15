import mongoose from "mongoose";

const detectionSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  content: { type: String, required: true },
  result: { type: String, required: true }, // 'smishing' | 'safe'
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Detection", detectionSchema);
