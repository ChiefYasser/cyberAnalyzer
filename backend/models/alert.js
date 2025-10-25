import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  message:      { type: String, required: true },
  level:        { type: String, enum: ["Info", "Warning", "Critical"], default: "Info" },
  relatedLog:   { type: mongoose.Schema.Types.ObjectId, ref: "Log" },
  assignedTo:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status:       { type: String, enum: ["Open", "In Progress", "Resolved"], default: "Open" },
  createdAt:    { type: Date, default: Date.now },
  resolvedAt:   Date,
});

export default mongoose.model("Alert", alertSchema);
