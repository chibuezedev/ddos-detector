const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ip: {
    type: String,
  },
  features: {
    type: mongoose.Schema.Types.Mixed,
  },
  prediction: {
    type: String,
    enum: ["ddos", "normal"],
  },
  confidence: {
    type: Number,
  },
  rawProbabilities: {
    type: mongoose.Schema.Types.Mixed,
  },
  is_ddos: {
    type: Boolean,
  },
  risk_level: {
    type: String,
    enum: ["Low", "Medium", "High"],
  },
});

const Prediction = mongoose.model("Prediction", predictionSchema);

module.exports = Prediction;
