import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  periodStart: Date,
  periodEnd:   Date,
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  logs:        [{ type: mongoose.Schema.Types.ObjectId, ref: "Log" }],
  alerts:      [{ type: mongoose.Schema.Types.ObjectId, ref: "Alert" }],
  incidents:   [{ type: mongoose.Schema.Types.ObjectId, ref: "Incident" }],
  createdAt:   { type: Date, default: Date.now },
});

export default mongoose.model("Report", reportSchema);
