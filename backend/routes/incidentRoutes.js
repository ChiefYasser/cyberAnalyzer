import express from "express";
import Incident from "../models/incident.js";

const router = express.Router();

// Add incident
router.post("/add", async (req, res) => {
  const incident = new Incident(req.body);
  await incident.save();
  res.json({ message: "Incident created" });
});

// Get all incidents
router.get("/", async (req, res) => {
  const incidents = await Incident.find().populate("alerts createdBy");
  res.json(incidents);
});

// Update incident status
router.put("/:id/status", async (req, res) => {
  const incident = await Incident.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(incident);
});

export default router;
