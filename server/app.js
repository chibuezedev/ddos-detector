const express = require("express");
const DDoSProtectionMiddleware = require("./DDoSProtectionMiddleware");

const app = express();

// Initialize DDoS protection
const ddosProtection = new DDoSProtectionMiddleware("./model_path", {
  blockOnDetection: true,
  logDetections: true,
  threshold: 0.8,
});

// Apply as global middleware
app.use(express.json());
app.use(ddosProtection.middleware());

app.get("/", (req, res) => {
  // You can access detection results
  console.log("Detection result:", req.ddosDetection);
  res.send("Hello World!");
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
