import express from "express";
import Report from "../models/report.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  const report = new Report(req.body);
  await report.save();
  res.json({ message: "Report generated" });
});

router.get("/", async (req, res) => {
  const reports = await Report.find().populate("logs alerts incidents generatedBy");
  res.json(reports);
});

export default router;
