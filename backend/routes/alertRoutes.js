import express from "express";
import Alert from "../models/alert.js";

const router = express.Router();

// Add alert
router.post("/add", async (req, res) => {
  const newAlert = new Alert(req.body);
  await newAlert.save();
  res.json({ message: "Alert created" });
});

// Get all alerts
router.get("/", async (req, res) => {
  const alerts = await Alert.find().populate("relatedLog assignedTo");
  res.json(alerts);
});

// Update alert status
router.put("/:id/status", async (req, res) => {
  const alert = await Alert.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(alert);
});

export default router;
