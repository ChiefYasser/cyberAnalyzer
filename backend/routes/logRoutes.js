import express from "express";
import Log from "../models/log.js";

const router = express.Router();

// Add log
router.post("/add", async (req, res) => {
  const newLog = new Log(req.body);
  await newLog.save();
  res.json({ message: "Log added" });
});

// Get all logs
router.get("/", async (req, res) => {
  const logs = await Log.find().populate("device");
  res.json(logs);
});

// Get logs by attack type
router.get("/attack/:type", async (req, res) => {
  const logs = await Log.find({ attackType: req.params.type });
  res.json(logs);
});

export default router;
