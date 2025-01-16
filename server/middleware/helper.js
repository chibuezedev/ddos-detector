const onnxruntime = require("onnxruntime-node");
const fs = require("fs");
const path = require("path");

class DDoSDetector {
  constructor(modelPath) {
    try {
      this.config = JSON.parse(
        fs.readFileSync(path.join(modelPath, "config.json"), "utf-8")
      );
      this.modelPath = path.join(modelPath, "model.onnx");
      this.session = null;
      
      if (!this.config.num_features || !this.config.feature_names) {
        throw new Error("Invalid config: missing num_features or feature_names");
      }
      
      this.debug = false;
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error(`Could not find config file at ${path.join(modelPath, "config.json")}`);
      }
      throw error;
    }
  }

  setDebug(enabled) {
    this.debug = enabled;
    return this;
  }

  async initialize() {
    this.session = await onnxruntime.InferenceSession.create(this.modelPath);
    if (this.debug) {
      console.log("Model initialized with input names:", this.session.inputNames);
    }
  }

  scaleFeatures(features) {
    const scaledFeatures = new Float32Array(this.config.num_features);
    for (let i = 0; i < this.config.num_features; i++) {
      const value = features[i];
      const mean = this.config.scaler_mean[i];
      const scale = this.config.scaler_scale[i];
      scaledFeatures[i] = (value - mean) / scale;
    }
    return scaledFeatures;
  }

  async predict(features) {
    if (!this.session) {
      throw new Error("Model not initialized. Call initialize() first.");
    }

    try {
      if (this.debug) {
        console.log("Starting prediction with features:", features);
      }

      // Extract and validate features
      const featureArray = this.config.feature_names.map(name => {
        const value = features[name];
        if (typeof value !== 'number') {
          throw new Error(`Invalid feature value for ${name}: ${value}`);
        }
        return value;
      });

      const processedFeatures = this.config.expects_scaled_input ? 
        this.scaleFeatures(featureArray) : 
        new Float32Array(featureArray);

      // Create tensor with explicit shape
      const tensor = new onnxruntime.Tensor(
        'float32',
        processedFeatures,
        [1, this.config.num_features]
      );

      //  inference
      const feeds = { [this.session.inputNames[0]]: tensor };
      const results = await this.session.run(feeds);
      const outputData = Array.from(results[this.session.outputNames[0]].data);

      // results
      const predictionIndex = outputData.indexOf(Math.max(...outputData));
      const confidence = outputData[predictionIndex];
      const predictionLabel = this.config.classes[predictionIndex];

      return {
        prediction: predictionLabel,
        confidence,
        raw_output: outputData,
        features_used: this.config.feature_names,
        input_features: features
      };
    } catch (error) {
      if (this.debug) {
        console.error("Prediction failed:", error);
        console.error("Input features:", features);
      }
      throw error;
    }
  }

  validateFeatures(features) {
    const missingFeatures = this.config.feature_names.filter(name => !(name in features));
    if (missingFeatures.length > 0) {
      throw new Error(`Missing required features: ${missingFeatures.join(', ')}`);
    }
  }
}

module.exports = DDoSDetector;