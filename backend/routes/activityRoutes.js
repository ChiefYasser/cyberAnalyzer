import express from "express";
import Activity from "../models/activity.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  const activity = new Activity(req.body);
  await activity.save();
  res.json({ message: "Activity logged" });
});

router.get("/", async (req, res) => {
  const activities = await Activity.find().populate("user");
  res.json(activities);
});

export default router;
