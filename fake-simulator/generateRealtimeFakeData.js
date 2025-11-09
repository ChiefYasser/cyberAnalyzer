// generateRealtimeFakeData.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";

dotenv.config();

const {
  MONGO_URI,
  LOG_INTERVAL_MS = "120000",
  ALERT_INTERVAL_MS = "600000",
  ACTIVITY_INTERVAL_MS = "900000",
  INITIAL_DEVICES = "5",
  INITIAL_USERS = "3"
} = process.env;

const LOG_INTERVAL = parseInt(LOG_INTERVAL_MS, 10);
const ALERT_INTERVAL = parseInt(ALERT_INTERVAL_MS, 10);
const ACTIVITY_INTERVAL = parseInt(ACTIVITY_INTERVAL_MS, 10);
const INIT_DEV = parseInt(INITIAL_DEVICES, 10);
const INIT_USERS = parseInt(INITIAL_USERS, 10);

if (!MONGO_URI) {
  console.error("ERROR: MONGO_URI not set in .env file. Please add it and re-run.");
  process.exit(1);
}

await mongoose.connect(MONGO_URI, {});

console.log("Connected to MongoDB successfully");

// Schema definitions
const deviceSchema = new mongoose.Schema({
  name: String,
  type: String,
  status: String,
  ipAddress: String,
  createdAt: Date,
});

const logSchema = new mongoose.Schema({
  device: mongoose.Schema.Types.ObjectId,
  sourceIP: String,
  destinationIP: String,
  attackType: String,
  severity: String,
  rawMessage: String,
  timestamp: Date,
});

const alertSchema = new mongoose.Schema({
  device: mongoose.Schema.Types.ObjectId,
  alertType: String,
  severity: String,
  description: String,
  status: { type: String, default: "Open" },
  createdAt: Date,
});

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  role: String,
  createdAt: Date
});

const activitySchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId,
  action: String,
  description: String,
  timestamp: Date,
});

const Device = mongoose.model("Device", deviceSchema, "devices");
const Log = mongoose.model("Log", logSchema, "logs");
const Alert = mongoose.model("Alert", alertSchema, "alerts");
const User = mongoose.model("User", userSchema, "users");
const Activity = mongoose.model("Activity", activitySchema, "activities");

// Utility functions
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function ensureInitialUsers() {
  const count = await User.countDocuments();
  if (count > 0) {
    console.log(`Found ${count} existing users. Skipping user seeding.`);
    return;
  }

  console.log(`Seeding ${INIT_USERS} users...`);
  const seed = [
    { username: "admin", email: "admin@cyber.com", role: "admin" },
    { username: "alice", email: "alice@cyber.com", role: "analyst" },
    { username: "bob", email: "bob@cyber.com", role: "analyst" },
  ];

  const toCreate = [];
  for (let i = 0; i < INIT_USERS; i++) {
    const base = seed[i] || {
      username: faker.internet.userName().toLowerCase(),
      email: faker.internet.email().toLowerCase(),
      role: "analyst"
    };
    toCreate.push({ ...base, createdAt: new Date() });
  }
  await User.insertMany(toCreate);
  console.log("User seeding completed.");
}

async function ensureInitialDevices() {
  const count = await Device.countDocuments();
  if (count > 0) {
    console.log(`Found ${count} existing devices. Skipping device seeding.`);
    return;
  }

  console.log(`Seeding ${INIT_DEV} devices...`);
  const types = ["Server", "Firewall", "Router", "Switch", "Workstation"];
  const statuses = ["Active", "Inactive", "Maintenance"];
  const docs = [];
  for (let i = 0; i < INIT_DEV; i++) {
    docs.push({
      name: `${rand(["Web","DB","Auth","Edge","Proxy"])}-${faker.word.noun()}-${i}`,
      ipAddress: faker.internet.ip(),
      type: rand(types),
      status: rand(statuses),
      createdAt: new Date()
    });
  }
  await Device.insertMany(docs);
  console.log("Device seeding completed.");
}

async function createLogForDevice(device) {
  const attackTypes = ["Brute Force","DDoS","Port Scan","SQL Injection","Malware","Info","HealthCheck"];
  const attack = rand(attackTypes);
  const severity = attack === "Info" || attack === "HealthCheck" ? "Low" : rand(["Medium","High","Critical"]);
  const log = new Log({
    device: device._id,
    sourceIP: faker.internet.ip(),
    destinationIP: device.ipAddress,
    attackType: attack,
    severity,
    rawMessage: `${attack} - ${faker.hacker.phrase()}`,
    timestamp: new Date()
  });
  return await log.save();
}

async function maybeCreateAlertFromLog(log) {
  if (["Medium","High","Critical"].includes(log.severity)) {
    const level = log.severity === "Critical" ? "Critical" : (log.severity === "High" ? "High" : "Warning");
    const alert = new Alert({
      device: log.device,
      alertType: log.attackType,
      severity: level,
      description: `Auto alert from log ${log._id}`,
      status: "Open",
      createdAt: new Date()
    });
    const saved = await alert.save();
    console.log(`Alert created: ${saved.severity} - ${saved.alertType}`);
    return saved;
  }
  return null;
}

async function createRandomActivity() {
  const users = await User.find({});
  if (!users || users.length === 0) return;
  const user = rand(users);
  const actions = [
    { action: "Logged in", desc: `${user.username} logged in` },
    { action: "Failed login", desc: `${user.username} had a failed login` },
    { action: "Viewed logs", desc: `${user.username} viewed logs` },
    { action: "Acknowledged alert", desc: `${user.username} acknowledged an alert` },
    { action: "Generated report", desc: `${user.username} generated a report` },
    { action: "Updated device", desc: `${user.username} updated device config` },
  ];
  const chosen = rand(actions);

  if (chosen.action === "Acknowledged alert") {
    const openAlert = await Alert.findOne({ status: "Open" });
    if (openAlert) {
      openAlert.status = "Resolved";
      await openAlert.save();
      chosen.desc = `${user.username} resolved alert ${openAlert._id}`;
    } else {
      chosen.desc = `${user.username} tried to acknowledge an alert but none open`;
    }
  }

  const activity = new Activity({
    user: user._id,
    action: chosen.action,
    description: chosen.desc,
    timestamp: new Date()
  });
  await activity.save();
  console.log(`Activity logged: ${chosen.action} by ${user.username}`);
}

// Device cache to avoid repeated database queries
let devicesCache = [];
async function reloadDevicesCache() {
  devicesCache = await Device.find({}).lean();
  if (!devicesCache || devicesCache.length === 0) {
    await ensureInitialDevices();
    devicesCache = await Device.find({}).lean();
  }
}

// Main execution
async function start() {
  console.log("Starting data simulator...");
  await ensureInitialUsers();
  await ensureInitialDevices();
  await reloadDevicesCache();

  // Generate a log for a random device every LOG_INTERVAL
  setInterval(async () => {
    try {
      if (!devicesCache.length) await reloadDevicesCache();
      const device = rand(devicesCache);
      const savedLog = await createLogForDevice(device);
      await maybeCreateAlertFromLog(savedLog);
    } catch (err) {
      console.error("Error generating log:", err);
    }
  }, LOG_INTERVAL);

  // Generate explicit alert occasionally
  setInterval(async () => {
    try {
      if (!devicesCache.length) await reloadDevicesCache();
      const device = rand(devicesCache);
      const savedLog = await createLogForDevice(device);
      await maybeCreateAlertFromLog(savedLog);
    } catch (err) {
      console.error("Error generating alert:", err);
    }
  }, ALERT_INTERVAL);

  // Generate user activities
  setInterval(async () => {
    try {
      await createRandomActivity();
    } catch (err) {
      console.error("Error generating activity:", err);
    }
  }, ACTIVITY_INTERVAL);

  console.log(`Simulator running. Logs every ${LOG_INTERVAL/1000}s, alerts every ${ALERT_INTERVAL/1000}s, activities every ${ACTIVITY_INTERVAL/1000}s`);
}

start().catch(e => {
  console.error("Simulator failed to start:", e);
  process.exit(1);
});