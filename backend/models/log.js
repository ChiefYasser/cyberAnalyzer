import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  sourceIP: String,
  destinationIP: String,
  device: { type: mongoose.Schema.Types.ObjectId, ref: "Device" },
  attackType: { type: String, enum: ["DDoS", "Brute Force", "SQL Injection", "Port Scan", "Malware", "Unknown"], default: "Unknown" },
  severity: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
  timestamp: { type: Date, default: Date.now },
  rawMessage: String,
});

export default mongoose.model("Log", logSchema);