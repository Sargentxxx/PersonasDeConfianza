"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface UserGrowthData {
  date: string; // "Jan", "Feb", etc.
  clients: number;
  reps: number;
}

const UserGrowthChart = ({ data }: { data: UserGrowthData[] }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend />
          <Bar
            dataKey="clients"
            name="Clientes"
            stackId="a"
            fill="#14B8A6"
            radius={[0, 0, 4, 4]}
          />
          <Bar
            dataKey="reps"
            name="Representantes"
            stackId="a"
            fill="#3B82F6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserGrowthChart;
