import express from "express";
import Device from "../models/device.js";

const router = express.Router();

// Add device
router.post("/add", async (req, res) => {
  const newDevice = new Device(req.body);
  await newDevice.save();
  res.json({ message: "Device added" });
});

// Get all devices
router.get("/", async (req, res) => {
  const devices = await Device.find();
  res.json(devices);
});

// Update device
router.put("/:id", async (req, res) => {
  const device = await Device.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(device);
});

// Delete device
router.delete("/:id", async (req, res) => {
  await Device.findByIdAndDelete(req.params.id);
  res.json({ message: "Device deleted" });
});

export default router;
