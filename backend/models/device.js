import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ipAddress: { type: String, required: true },
  type: { type: String, enum: ["Server", "Router", "Firewall", "PC", "Other"], default: "Other" },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  lastChecked: { type: Date, default: Date.now },
});

export default mongoose.model("Device", deviceSchema);