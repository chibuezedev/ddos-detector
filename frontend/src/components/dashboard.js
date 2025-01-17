/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Alert, AlertTitle, AlertDescription } from "./ui/alertComponent";
import { Shield, AlertTriangle, Activity, Network } from "lucide-react";
import axios from "axios";

import NetworkChart from "./dashboardChart";

const DDoSDashboard = () => {
  const [realtimeData, setRealtimeData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    benignCount: 0,
    ddosCount: 0,
    ddosAttackCount: 0,
    averageConfidence: 0,
    uniqueIPs: new Set(),
  });

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/model/detection");
      const data = response.data.data;
  
      const avgConfidence =
        data.reduce((acc, curr) => acc + curr.confidence, 0) / data.length;
      const uniqueIPs = [...new Set(data.map((d) => d.ip))];
  
      setStats({
        totalRequests: data.length,
        benignCount: data.filter((d) => d.prediction === "Benign").length,
        ddosCount: data.filter((d) => d.prediction === "DDoS").length,
        ddosAttackCount: data.filter((d) => d.prediction === "DDoS-ACK").length,
        averageConfidence: avgConfidence,
        uniqueIPs: uniqueIPs,
      });
  
      checkForAlert(data);
  
      setRealtimeData((prev) => {
        const newData = [...prev, ...data].slice(-20); // Keep last 20 records
        return newData;
      });
    } catch (error) {
      console.error("Error fetching detection data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3600000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const checkForAlert = (detections) => {
    detections.forEach((detection) => {
      if (detection.prediction !== "Benign" && detection.confidence > 0.6) {
        const newAlert = {
          id: detection._id,
          type: `${detection.prediction} Detected`,
          severity: detection.prediction === "DDoS" ? "high" : "medium",
          timestamp: detection.timestamp,
          details: `${detection.prediction} detected from IP: ${
            detection.ip
          } (Confidence: ${(detection.confidence * 100).toFixed(1)}%)`,
          packets: detection.features.Packets,
        };
        setAlerts((prev) => [newAlert, ...prev].slice(0, 5));
      }
    });
  };

  const getThreatLevel = () => {
    const attackRate =
      (stats.ddosCount + stats.ddosAttackCount) / stats.totalRequests;
    if (attackRate > 0.3) return "High";
    if (attackRate > 0.1) return "Medium";
    return "Low";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">DDoS Detection System</h1>
        <p className="text-gray-600">
          Real-time traffic analysis and attack detection
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Shield
                className={`h-8 w-8 ${
                  getThreatLevel() === "High"
                    ? "text-red-500"
                    : getThreatLevel() === "Medium"
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
              />
              <div>
                <p className="text-sm text-gray-500">Threat Level</p>
                <p className="text-2xl font-bold">{getThreatLevel()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Network className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Unique IPs</p>
                <p className="text-2xl font-bold">{stats.uniqueIPs[0]}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Detection Confidence</p>
                <p className="text-2xl font-bold">
                  {(stats.averageConfidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">DDoS Detections</p>
                <p className="text-2xl font-bold">{stats.ddosCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Alert
                key={alert.id}
                variant={alert.severity === "high" ? "destructive" : "default"}
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="font-medium">{alert.type}</AlertTitle>
                <AlertDescription>
                  {alert.details}
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(alert.timestamp).toLocaleString()} | Packets:{" "}
                    {alert.packets}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      <NetworkChart data={realtimeData} />
    </div>
  );
};

export default DDoSDashboard;
