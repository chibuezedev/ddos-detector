import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { ResponsiveContainer, LineChart, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Bar } from 'recharts';

const NetworkChart = ({ data }) => {
  const formattedData = data.map(item => ({
    timestamp: new Date(item.timestamp).getTime(),
    features: item.features,
    rawProbabilities: item.rawProbabilities
  }));
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Packet Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp"
                type="number"
                domain={['auto', 'auto']}
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => new Date(label).toLocaleString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="features.Packets"
                stroke="#3b82f6"
                name="Total Packets"
              />
              <Line
                type="monotone"
                dataKey="features.RxPackets"
                stroke="#ef4444"
                name="Rx Packets"
              />
              <Line
                type="monotone"
                dataKey="features.TxPackets"
                stroke="#22c55e"
                name="Tx Packets"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detection Probabilities</CardTitle>
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
                dataKey="rawProbabilities[0]"
                name="Benign"
                fill="#22c55e"
              />
              <Bar 
                dataKey="rawProbabilities[1]" 
                name="DDoS" 
                fill="#f97316" 
              />
              <Bar
                dataKey="rawProbabilities[2]"
                name="DDoS-Attack"
                fill="#ef4444"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkChart;