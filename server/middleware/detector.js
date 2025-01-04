const express = require("express");
const DDoSDetector = require("./helper");

class DDoSProtectionMiddleware {
  constructor(modelPath, options = {}) {
    this.detector = new DDoSDetector(modelPath);
    this.options = {
      blockOnDetection: true,
      logDetections: true,
      threshold: 0.8, // Confidence threshold for blocking
      ...options,
    };

    // Initialize the detector
    this.initialize();
  }

  async initialize() {
    await this.detector.initialize();
    console.log("DDoS Protection Middleware initialized");
  }

  extractFeatures(req) {
    // Extract relevant features from request
    const srcIP = req.ip.replace("::ffff:", ""); // Handle IPv6-mapped IPv4 addresses
    const dstIP = req.get("host");
    const srcPort = req.socket.remotePort;
    const dstPort = req.socket.localPort;
    const protocol = req.protocol === "https" ? 6 : 1; // TCP=6, UDP=1
    const packetLength = JSON.stringify(req.body).length;

    // Convert IPs to numbers (simplified)
    const ipToNum = (ip) =>
      ip
        .split(".")
        .reduce(
          (sum, num, idx) => sum + parseInt(num) * Math.pow(256, 3 - idx),
          0
        );

    return [
      ipToNum(srcIP),
      ipToNum(dstIP),
      srcPort,
      dstPort,
      protocol,
      packetLength,
      1, // flags (simplified)
      1, // packets count (simplified)
      packetLength, // bytes (using packet length as approximation)
    ];
  }

  middleware() {
    return async (req, res, next) => {
      try {
        // Extract features from the request
        const features = this.extractFeatures(req);

        // Get prediction
        const result = await this.detector.predict(features);

        // Add detection result to request object
        req.ddosDetection = result;

        // Log if enabled
        if (this.options.logDetections) {
          console.log("DDoS Detection:", {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            prediction: result.prediction,
            confidence: result.confidence,
            path: req.path,
          });
        }

        // Block if malicious and blocking is enabled
        if (
          this.options.blockOnDetection &&
          result.prediction !== "Benign" &&
          result.confidence > this.options.threshold
        ) {
          return res.status(403).json({
            error: "Access denied",
            reason: "Suspicious traffic pattern detected",
          });
        }

        next();
      } catch (error) {
        console.error("DDoS detection error:", error);
        // Don't block on error, just continue
        next();
      }
    };
  }
}

module.exports = DDoSProtectionMiddleware;
