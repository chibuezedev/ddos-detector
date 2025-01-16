const express = require("express");
const DDoSProtectionMiddleware = require("./middleware/detector");

const app = express();

// initialise DDoS protection middleware
const ddosProtection = new DDoSProtectionMiddleware({
  blockOnDetection: true,
  logDetections: true,
  threshold: 0.8,
  pythonServerUrl: "http://127.0.0.1:8000/predict",
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DDoS protection middleware BEFORE your routes
// Note: This ensures every request is checked
app.use(ddosProtection.middleware());

// Your routes come after the middleware
app.get("/", (req, res) => {
  console.log("Detection result:", req.ddosDetection);
  res.send("Hello World!");
});

app.post("/api/data", (req, res) => {
  res.json({ message: "Data received" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
