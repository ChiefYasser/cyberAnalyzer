import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: String,
  alerts:      [{ type: mongoose.Schema.Types.ObjectId, ref: "Alert" }],
  status:      { type: String, enum: ["Open", "Investigating", "Closed"], default: "Open" },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt:   { type: Date, default: Date.now },
  closedAt:    Date,
});

export default mongoose.model("Incident", incidentSchema);
