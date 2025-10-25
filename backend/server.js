import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";


import { verifyToken } from "./middleware/authMiddleware.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/users", verifyToken, userRoutes);
app.use("/api/devices", verifyToken, deviceRoutes);
app.use("/api/logs", verifyToken, logRoutes);
app.use("/api/alerts", verifyToken, alertRoutes);
app.use("/api/incidents", verifyToken, incidentRoutes);
app.use("/api/activities", verifyToken, activityRoutes);
app.use("/api/reports", verifyToken, reportRoutes);

app.get("/", (req, res) => {
  res.send(" API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));