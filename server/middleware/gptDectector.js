const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiDDoSController {
  constructor(options = {}) {
    this.options = {
      apiKey: process.env.GEMINI_API_KEY,
      modelName: "gemini-pro",
      blockThreshold: 0.7,
      ...options,
    };

    this.genAI = new GoogleGenerativeAI(this.options.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: this.options.modelName,
    });
  }

  _extractFeatures(req) {
    return {
      Packets: Number(req.query.Packets || req.body.Packets || 0),
      Bytes: Number(req.query.Bytes || req.body.Bytes || 0),
      "Tx Packets": Number(
        req.query["Tx Packets"] || req.body["Tx Packets"] || 0
      ),
      "Tx Bytes": Number(req.query["Tx Bytes"] || req.body["Tx Bytes"] || 0),
      "Rx Packets": Number(
        req.query["Rx Packets"] || req.body["Rx Packets"] || 0
      ),
      "Rx Bytes": Number(req.query["Rx Bytes"] || req.body["Rx Bytes"] || 0),
      "tcp.srcport": Number(
        req.query["tcp.srcport"] || req.body["tcp.srcport"] || 0
      ),
      "tcp.dstport": Number(
        req.query["tcp.dstport"] || req.body["tcp.dstport"] || 0
      ),
      "ip.proto": Number(req.query["ip.proto"] || req.body["ip.proto"] || 0),
      "frame.len": Number(req.query["frame.len"] || req.body["frame.len"] || 0),
    };
  }

  async classifyRequest(features) {
    try {
      const prompt = this._buildPrompt(features);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const classification = this._parseResponse(response.text());

      return classification;
    } catch (error) {
      console.error("Gemini classification failed:", error);
      return {
        is_ddos: false,
        confidence: 0,
        risk_level: "unknown",
      };
    }
  }

  _buildPrompt(features) {
    return `You are a DDoS detection system. Analyze this network traffic data for DDoS patterns.
Return ONLY a JSON object without any markdown formatting, code blocks, or additional text.
The JSON must contain exactly these fields: "is_ddos" (boolean), "confidence" (number 0-1), "risk_level" (string: "low", "medium", or "high").

Network Features:
Packets: ${features.Packets}
Bytes: ${features.Bytes}
Tx Packets: ${features["Tx Packets"]}
Tx Bytes: ${features["Tx Bytes"]}
Rx Packets: ${features["Rx Packets"]}
Rx Bytes: ${features["Rx Bytes"]}
Source Port: ${features["tcp.srcport"]}
Destination Port: ${features["tcp.dstport"]}
IP Protocol: ${features["ip.proto"]}
Frame Length: ${features["frame.len"]}`;
  }

  _parseResponse(responseText) {
    try {
      let cleanedResponse = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const startIdx = cleanedResponse.indexOf("{");
      const endIdx = cleanedResponse.lastIndexOf("}") + 1;
      if (startIdx === -1 || endIdx === 0) {
        throw new Error("No valid JSON found in response");
      }

      cleanedResponse = cleanedResponse.slice(startIdx, endIdx);

      const parsed = JSON.parse(cleanedResponse);

      return {
        is_ddos: Boolean(parsed.is_ddos),
        confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0)),
        risk_level: String(parsed.risk_level).toLowerCase() || "unknown",
      };
    } catch (error) {
      console.error("Failed to parse Gemini response:", error);
      return {
        is_ddos: false,
        confidence: 0,
        risk_level: "unknown",
      };
    }
  }

  middleware() {
    return async (req, res, next) => {
      try {
        const features = this._extractFeatures(req);
        const classification = await this.classifyRequest(features);

        req.ddosInfo = classification;


        if (
          classification.is_ddos &&
          classification.confidence >= this.options.blockThreshold
        ) {
          return res.status(429).json({
            error: "Request blocked",
            message: "Potential DDoS activity detected",
            ...classification,
          });
        }

        next();
      } catch (error) {
        console.error("DDoS middleware error:", error);
        next();
      }
    };
  }
}

module.exports = GeminiDDoSController;
