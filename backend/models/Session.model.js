import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  eye_status: String,
  focus: String,
  head_pose: String,
  left_eye: String,
  right_eye: String,
  yawn_status: String,
  timestamp: { type: Date, default: Date.now },
});

const sessionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  results: [resultSchema],
  startedAt: { type: Date, default: Date.now },
});
const Session = mongoose.model("Session", sessionSchema);

export default Session;