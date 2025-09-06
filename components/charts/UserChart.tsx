"use client";

import { useState, useMemo, useEffect } from "react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const chartConfig = {
  users: {
    label: "Users",
    color: "#0373ff",
  },
} satisfies ChartConfig;

interface User {
  createdAt: string; // ISO date string
}

export function UserChart() {
  const [users, setUsers] = useState<User[]>([]);
  const [startDate, setStartDate] = useState("2025-08-01");
  const [endDate, setEndDate] = useState("2025-08-05");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Aggregate user count by date
  const filteredData = useMemo(() => {
    return users.filter(
      (user) => {
        const date = user.createdAt?.slice(0, 10);
        return date >= startDate && date <= endDate;
      }
    );
  }, [users, startDate, endDate]);

  const totalUsers = filteredData.length;

  const chartData = [{ name: "Blu App", users: totalUsers }];

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle>Blu App Users</CardTitle>
          <CardDescription>User count by date</CardDescription>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2 border rounded hover:bg-gray-100 flex items-center">
              <CalendarIcon className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3 space-y-2">
            <div className="flex gap-2 flex-col">
              <div className="flex gap-1 items-center justify-between">
                <label className="font-semibold text-sm">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded px-2 py-1 text-xs"
                />
              </div>
              <div className="flex gap-1 items-center justify-between">
                <label className="font-semibold text-sm">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border rounded px-2 py-1 text-xs"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>

      <CardContent className="flex flex-1 items-center pb-0">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[200px]"
          >
            <RadialBarChart
              data={chartData}
              endAngle={180}
              innerRadius={80}
              outerRadius={130}
            >
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 16}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {totalUsers.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 4}
                            className="fill-muted-foreground"
                          >
                            Users
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </PolarRadiusAxis>
              <RadialBar
                dataKey="users"
                fill="#0373ff"
                cornerRadius={5}
                className="stroke-transparent stroke-2"
              />
            </RadialBarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}