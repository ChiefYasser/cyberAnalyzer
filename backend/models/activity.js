import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action:      String,
  description: String,
  date:        { type: Date, default: Date.now },
});

export default mongoose.model("Activity", activitySchema);
