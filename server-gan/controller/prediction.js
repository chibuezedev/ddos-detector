const Prediction = require("../models/prediction");

exports.getDetections = async (req, res) => {
  try {
    const detections = await Prediction.find();

    return res.status(200).json({ data: detections });
  } catch (error) {
    console.error("Error fetching detections:", error.message);
    return res.status(500).json({ error: error.message });
  }
};
