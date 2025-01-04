const onnxruntime = require("onnxruntime-node");
const fs = require("fs");
const path = require("path");

class DDoSDetector {
  constructor(modelPath) {
    this.config = JSON.parse(
      fs.readFileSync(path.join(modelPath, "config.json"), "utf-8")
    );
    this.modelPath = path.join(modelPath, "model.onnx");
    this.tokenizer = null;
    this.session = null;
    this.labelMapping = this.config.label_mapping;
  }

  async initialize() {
    // Load ONNX model
    this.session = await onnxruntime.InferenceSession.create(this.modelPath);

    // Initialize tokenizer
    this.tokenizer = {
      pad_token_id: this.config.pad_token_id,
      max_length: this.config.max_length,
    };
  }

  preprocessInput(features) {
    // Convert features to string
    const featureStr = features.join(" ");

    // Tokenize (simplified version - you'll need to implement proper tokenization)
    const tokens = featureStr.split(" ").map((x) => parseInt(x) || 0);

    // Pad or truncate to max_length
    const paddedTokens = tokens.slice(0, this.config.max_length);
    while (paddedTokens.length < this.config.max_length) {
      paddedTokens.push(this.tokenizer.pad_token_id);
    }

    // Create attention mask
    const attentionMask = paddedTokens.map((x) =>
      x !== this.tokenizer.pad_token_id ? 1 : 0
    );

    return {
      inputIds: new Float32Array(paddedTokens),
      attentionMask: new Float32Array(attentionMask),
    };
  }

  async predict(features) {
    if (!this.session) {
      throw new Error("Model not initialized. Call initialize() first.");
    }

    // Preprocess input
    const preprocessed = this.preprocessInput(features);

    // Create ONNX tensor
    const feeds = {
      input_ids: new onnxruntime.Tensor("float32", preprocessed.inputIds, [
        1,
        this.config.max_length,
      ]),
      attention_mask: new onnxruntime.Tensor(
        "float32",
        preprocessed.attentionMask,
        [1, this.config.max_length]
      ),
    };

    // Run inference
    const results = await this.session.run(feeds);
    const logits = results.logits.data;

    // Calculate softmax probabilities
    const exp_logits = logits.map(Math.exp);
    const sum_exp = exp_logits.reduce((a, b) => a + b, 0);
    const probabilities = exp_logits.map((exp) => exp / sum_exp);

    // Get prediction
    const predictionIndex = probabilities.indexOf(Math.max(...probabilities));
    const predictionLabel = this.labelMapping[predictionIndex];

    return {
      prediction: predictionLabel,
      confidence: probabilities[predictionIndex],
      probabilities: Object.fromEntries(
        Object.values(this.labelMapping).map((label, i) => [
          label,
          probabilities[i],
        ])
      ),
    };
  }
}

module.exports = DDoSDetector;
