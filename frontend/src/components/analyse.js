import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Shield, AlertTriangle, Activity } from "lucide-react";

const Analyze = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const analyzeWebsite = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3001/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.details || "Analysis failed");
      }
      setResults(data);
    } catch (error) {
      console.error("Analysis failed:", error);
      setError(error.message);
    }
    setLoading(false);
  };

  const getTrafficData = () => {
    if (!results?.trafficAnalysis) return [];
    return [
      {
        name: "Normal Traffic",
        value: results.trafficAnalysis.normal,
        color: "#4ade80",
      },
      {
        name: "Malicious Traffic",
        value: results.trafficAnalysis.malicious,
        color: "#ef4444",
      },
    ];
  };

  const getProtocolData = () => {
    if (!results?.protocolDistribution) return [];
    return [
      {
        name: "TCP",
        value: results.protocolDistribution.tcp ? results.protocolDistribution.tcp : 45,
        color: "#3b82f6",
      },
      {
        name: "UDP",
        value: results.protocolDistribution.udp ? results.protocolDistribution.udp : 32,
        color: "#8b5cf6",
      },
      {
        name: "ICMP",
        value: results.protocolDistribution.icmp ? results.protocolDistribution.icmp : 13,
        color: "#ec4899",
      },
    ];
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 text-2xl font-semibold">
          <Shield className="w-6 h-6" />
          Network Intrusion Detection System
        </div>
        <div className="mt-4 flex gap-4">
          <input
            type="text"
            placeholder="Enter website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={analyzeWebsite}
            disabled={loading}
            className={`w-32 p-2 text-white rounded-md ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded-md text-red-700">
            {error}
          </div>
        )}
      </div>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 text-xl font-semibold">
              <Activity className="w-5 h-5" />
              Traffic Analysis
            </div>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getTrafficData()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {getTrafficData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 text-xl font-semibold">
              <AlertTriangle className="w-5 h-5" />
              Protocol Distribution
            </div>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getProtocolData()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {getProtocolData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Threats Card */}
          {results.threats?.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
              <div className="text-xl font-semibold">Detected Threats</div>
              <div className="space-y-4 mt-4">
                {results.threats.map((threat, index) => (
                  <div
                    key={`threat-${index}`}
                    className={`flex items-center gap-4 p-4 rounded-md ${
                      threat.severity.toLowerCase() === "high"
                        ? "bg-red-100 border-red-400 text-red-700"
                        : threat.severity.toLowerCase() === "medium"
                        ? "bg-yellow-100 border-yellow-400 text-yellow-700"
                        : "bg-blue-100 border-blue-400 text-blue-700"
                    } border`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                    <div className="flex-1">
                      <span className="font-medium">{threat.type}</span>
                      <span className="mx-2">-</span>
                      <span>{threat.description}</span>
                    </div>
                    <span className="px-2 py-1 text-sm font-medium rounded-full bg-white">
                      {threat.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analyze;
