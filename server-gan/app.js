const express = require("express");
const mongoose = require("mongoose")
const dotenv = require("dotenv");
const cors = require("cors")

const DDoSProtectionMiddleware = require("./middleware/detector");
const authRoutes = require("./routes/auth")
const detectionRoutes = require("./routes/prediction")

const app = express();
dotenv.config();

// initialise DDoS protection middleware
const ddosProtection = new DDoSProtectionMiddleware({
  blockOnDetection: true,
  logDetections: true,
  threshold: 0.8,
  pythonServerUrl: "http://127.0.0.1:8000/predict",
});

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DDoS protection middleware BEFORE other routes
// Note: This ensures every request is checked
app.use(ddosProtection.middleware());

app.get("/", (req, res) => {
  console.log("Detection result:", req.ddosDetection);
  res.json("Hello World!");
});


app.use("/auth", authRoutes)
app.use("/model", detectionRoutes)

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
