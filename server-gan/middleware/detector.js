const axios = require("axios");
const uaParser = require("ua-parser-js");
const geoip = require("geoip-lite");
const Prediction = require("../models/prediction");

class DDoSProtectionMiddleware {

  constructor(options = {}) {
    this.options = {
      blockThreshold: 0.7,
      requestWindow: 60000,
      pythonEndpoint: "http://localhost:8000/predict",
      uaHistorySize: 10,
      ...options,
    };

    this.requestHistory = new Map();
    this.uaHistory = new Map();
    this.requestTimings = new Map();
  }

  _ipToInt(ip) {
    return (
      ip
        .split(".")
        .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
    );
  }

  _calculateUAVariance(ip, currentUA) {
    const history = this.uaHistory.get(ip) || [];

    history.push(currentUA);

    if (history.length > this.options.uaHistorySize) {
      history.shift();
    }

    this.uaHistory.set(ip, history);

    if (history.length < 2) return 0;

    const lengths = history.map((ua) => ua.length);
    const mean = lengths.reduce((a, b) => a + b) / lengths.length;
    const variance =
      lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;

    return Math.min(10, variance / 100);
  }

  _getRequestRate(ip) {
    const now = Date.now();
    const history = this.requestHistory.get(ip) || [];

    // Filter requests within time window
    const recentRequests = history.filter(
      (t) => now - t < this.options.requestWindow
    );
    recentRequests.push(now);
    this.requestHistory.set(ip, recentRequests);

    return recentRequests.length;
  }
  _startRequestTimer(ip) {
    this.requestTimings.set(ip, process.hrtime());
  }

  _getRequestDuration(ip) {
    const startTime = this.requestTimings.get(ip);
    if (!startTime) return 0.05;

    const [seconds, nanoseconds] = process.hrtime(startTime);
    return seconds + nanoseconds / 1e9;
  }

  extractFeatures(req) {
    const ip = req.ip;
    const now = new Date();
    const ua = uaParser(req.headers["user-agent"] || "");
    const geo = geoip.lookup(ip) || {};

    return {
      source_ip: this._ipToInt(ip),
      day_of_week: now.getDay(),
      hour_of_day: now.getHours(),
      http_method: req.method,
      url_path: req.path,
      user_agent: req.headers["user-agent"] || "",
      content_length: parseInt(req.headers["content-length"]) || 0,
      http_version: "HTTP/1.0",
      num_headers: Object.keys(req.headers).length,
      headers_length: Buffer.byteLength(JSON.stringify(req.headers)),
      is_proxy: req.headers["x-forwarded-for"] ? 1 : 0,
      cookie_present: req.headers.cookie ? 1 : 0,
      request_duration: this._getRequestDuration(ip),
      req_rate_1min: this._getRequestRate(ip),
      ua_variance: this._calculateUAVariance(
        ip,
        req.headers["user-agent"] || ""
      ),
      tls_version: req.secure ? "TLS 1.3" : "None",
      geo_location: geo.country || "Unknown",
      device_type: ua.device.type || "desktop",
      entropy_rate: 0.8,
      packet_size_var: 1.2,
      timestamp: new Date().toISOString(),
    };
  }

  middleware() {
    return async (req, res, next) => {
      try {
        const ip = req.ip;
        this._startRequestTimer(ip); // Start request timer
        const features = this.extractFeatures(req);

        const response = await axios.post(
          this.options.pythonEndpoint,
          features
        );
        const { is_ddos, confidence, risk_level } = response.data;

        await Prediction.create({
          ip: req.ip,
          features,
          is_ddos,
          confidence,
          risk_level,
          timestamp: new Date(),
        });

        if (is_ddos && confidence >= this.options.blockThreshold) {
          return res.status(429).json({
            error: "Request blocked",
            message: "Potential DDoS activity detected",
            confidence,
            risk_level,
          });
        }
        console.log("Received", is_ddos, confidence, risk_level);
        req.ddosInfo = { is_ddos, confidence, risk_level };
        next();
      } catch (error) {
        console.error("DDoS check failed:", error);
        next();
      }
    };
  }
}

module.exports = DDoSProtectionMiddleware;
