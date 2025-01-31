const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const DDoSProtectionMiddleware = require("./middleware/detector");
const authRoutes = require("./routes/auth");
const detectionRoutes = require("./routes/prediction");
const GeminiDDoSController = require("./middleware/gptDectector");

const app = express();
dotenv.config();

// initialise DDoS protection middleware
const ddosProtection = new DDoSProtectionMiddleware({
  blockOnDetection: true,
  logDetections: true,
  threshold: 0.8,
  pythonServerUrl: "http://127.0.0.1:8000/predict",
});

const ddosController = new GeminiDDoSController({
  apiKey: process.env.GOOGLE_API_KEY,
  blockThreshold: 0.8,
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DDoS protection middleware BEFORE other routes
// Note: This ensures every request is checked

app.use(ddosProtection.middleware()); // CUSTOM DDOS MIDDLEWARE
app.use(ddosController.middleware()); // GPT MIDDLEWARE

app.get("/", (req, res) => {
  console.log("Detection result:", req.ddosDetection);
  res.json("Hello World!");
});

app.get("/check-ddos", async (req, res) => {
  try {
    const features = ddosController._extractFeatures(req);
    const classification = await ddosController.classifyRequest(features);
    console.log("Classification:", classification);
    res.json(classification);
  } catch (error) {
    console.error("Classification failed:", error);
    res.status(500).json({ error: "Classification failed" });
  }
});

app.use("/auth", authRoutes);
app.use("/model", detectionRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

mongoose
  .connect(process.env.MONGO, {})
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log("MongoDB connection error:", error));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
