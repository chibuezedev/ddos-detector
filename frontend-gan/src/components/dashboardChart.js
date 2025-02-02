import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Bar,
} from "recharts";

const NetworkChart = ({ data }) => {
  const formattedData = data.map((item) => ({
    timestamp: new Date(item.timestamp).getTime(),
    features: item.features,
    confidence: item.confidence,
    prediction: item.prediction,
    risk_level: item.risk_level,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Traffic Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={["auto", "auto"]}
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="features.req_rate_1min"
                stroke="#3b82f6"
                name="Requests/min"
              />
              <Line
                type="monotone"
                dataKey="features.headers_length"
                stroke="#ef4444"
                name="Headers Size"
              />
              <Line
                type="monotone"
                dataKey="features.content_length"
                stroke="#22c55e"
                name="Content Size"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detection Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedData.slice(-5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <YAxis domain={[0, 1]} />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleString()}
                formatter={(value) => `${(value * 100).toFixed(1)}%`}
              />
              <Legend />
              <Bar
                dataKey={(datum) =>
                  datum.prediction === "normal" ? datum.confidence : null
                }
                name="Normal Traffic"
                fill="#22c55e"
                fillOpacity={0.8}
                maxBarSize={50}
              />
              <Bar
                dataKey={(datum) =>
                  datum.prediction === "ddos" ? datum.confidence : null
                }
                name="DDoS Attack"
                fill="#ef4444"
                fillOpacity={0.8}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkChart;
