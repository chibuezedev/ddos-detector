import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Alert, AlertTitle, AlertDescription } from "./ui/alertComponent";
import {
  BarChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Shield, AlertTriangle, Activity, Network } from "lucide-react";

const NetworkDashboard = () => {

  const [alerts] = useState([
    {
      id: 1,
      type: "Potential DDoS",
      severity: "high",
      timestamp: "2024-10-24 10:30:00",
      details: "Unusual spike in traffic from IP range 192.168.1.x",
    },
    {
      id: 2,
      type: "Port Scan",
      severity: "medium",
      timestamp: "2024-10-24 10:28:30",
      details: "Sequential port scanning detected from 10.0.0.5",
    },
  ]);

  const trafficData = [
    { time: "10:00", normal: 150, suspicious: 5 },
    { time: "10:10", normal: 200, suspicious: 8 },
    { time: "10:20", normal: 180, suspicious: 12 },
    { time: "10:30", normal: 220, suspicious: 25 },
  ];

  const protocolData = [
    { name: "TCP", normal: 450, malicious: 20 },
    { name: "UDP", normal: 300, malicious: 15 },
    { name: "ICMP", normal: 100, malicious: 8 },
    { name: "HTTP", normal: 200, malicious: 12 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Network Intrusion Detection System
        </h1>
        <p className="text-gray-600">
          Real-time network traffic analysis and threat detection
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Threat Level</p>
                <p className="text-2xl font-bold">Medium</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Active Alerts</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Traffic Rate</p>
                <p className="text-2xl font-bold">1.2K/s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Network className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Active Connections</p>
                <p className="text-2xl font-bold">842</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Section */}
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
                    {alert.timestamp}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Network Traffic Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart width={500} height={300} data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="normal"
                stroke="#3b82f6"
                name="Normal Traffic"
              />
              <Line
                type="monotone"
                dataKey="suspicious"
                stroke="#ef4444"
                name="Suspicious Traffic"
              />
            </LineChart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Protocol Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart width={500} height={300} data={protocolData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="normal" fill="#3b82f6" name="Normal Traffic" />
              <Bar
                dataKey="malicious"
                fill="#ef4444"
                name="Malicious Traffic"
              />
            </BarChart>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NetworkDashboard;
