const express = require('express');
const axios = require('axios');

class DDoSProtectionMiddleware {
  constructor(options = {}) {
    this.options = {
      blockOnDetection: true,
      logDetections: true,
      threshold: 0.8,
      timeWindow: 60000, // 1 minute window
      pythonServerUrl: 'http://127.0.0.1:8000/predict',
      ...options
    };

    this.trafficStats = new Map();
  }

  updateTrafficStats(ip, bytes) {
    const now = Date.now();
    const stats = this.trafficStats.get(ip) || {
      packets: 0,
      bytes: 0,
      txPackets: 0,
      txBytes: 0,
      rxPackets: 0,
      rxBytes: 0,
      lastUpdate: now
    };

    if (now - stats.lastUpdate > this.options.timeWindow) {
      stats.packets = 0;
      stats.bytes = 0;
      stats.txPackets = 0;
      stats.txBytes = 0;
      stats.rxPackets = 0;
      stats.rxBytes = 0;
    }

    stats.packets++;
    stats.bytes += bytes;
    stats.rxPackets++;
    stats.rxBytes += bytes;
    stats.lastUpdate = now;

    this.trafficStats.set(ip, stats);
    return stats;
  }

  extractFeatures(req) {
    const srcPort = req.socket.remotePort || 0;
    const dstPort = req.socket.localPort || 80;
    const protocol = req.protocol === "https" ? 6 : 1;
    const frameLen = req.headers['content-length'] ? 
      parseInt(req.headers['content-length']) : 0;

    const stats = this.updateTrafficStats(req.ip, frameLen);

    return {
      'Packets': stats.packets,
      'Bytes': stats.bytes,
      'Tx Packets': stats.txPackets,
      'Tx Bytes': stats.txBytes,
      'Rx Packets': stats.rxPackets,
      'Rx Bytes': stats.rxBytes,
      'tcp.srcport': srcPort,
      'tcp.dstport': dstPort,
      'ip.proto': protocol,
      'frame.len': frameLen
    };
  }

  cleanupOldStats() {
    const now = Date.now();
    for (const [ip, stats] of this.trafficStats.entries()) {
      if (now - stats.lastUpdate > this.options.timeWindow) {
        this.trafficStats.delete(ip);
      }
    }
  }

  middleware() {
    return async (req, res, next) => {
      try {
        this.cleanupOldStats();
        const features = this.extractFeatures(req);

        // Send features to Python server for prediction
        const response = await axios.post(this.options.pythonServerUrl, features);
        const result = response.data;

        // Add detection result to request object
        req.ddosDetection = result;

        if (this.options.logDetections) {
          console.log("DDoS Detection:", {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            prediction: result.prediction,
            confidence: result.confidence,
            features
          });
        }

        if (
          this.options.blockOnDetection &&
          result.prediction === "DDoS" &&
          result.confidence > this.options.threshold
        ) {
          return res.status(403).json({
            error: "Access denied",
            reason: "Suspicious traffic pattern detected",
            confidence: result.confidence
          });
        }

        next();
      } catch (error) {
        console.error("DDoS detection error:", error);
        next();
      }
    };
  }
}

module.exports = DDoSProtectionMiddleware;