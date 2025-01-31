const express = require("express");
const mongoose = require("mongoose")
const dotenv = require("dotenv");
const cors = require("cors")

const DDoSProtectionMiddleware = require("./middleware/detector");
const authRoutes = require("./routes/auth")
const detectionRoutes = require("./routes/prediction")

const app = express();
dotenv.config();

const ddosProtection = new DDoSProtectionMiddleware({
  blockThreshold: 0.75,
  pythonEndpoint: process.env.ML_ENDPOINT || 'http://localhost:8000/predict'
});


app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DDoS protection middleware
app.use(ddosProtection.middleware());


app.get("/", (req, res) => {
  res.json({ 
    message: 'Access granted',
    ddosStatus: req.ddosInfo 
  });
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
