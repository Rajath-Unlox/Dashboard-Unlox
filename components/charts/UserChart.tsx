"use client";

import { useState, useMemo } from "react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

// Example Blu App login data with dates
const allLoginData = [
  { date: "2025-08-01", users: 1500 },
  { date: "2025-08-02", users: 1800 },
  { date: "2025-08-03", users: 1700 },
  { date: "2025-08-04", users: 2000 },
  { date: "2025-08-05", users: 1900 },
];

const chartConfig = {
  users: {
    label: "Users",
    color: "#0373ff",
  },
} satisfies ChartConfig;

export function UserChart() {
  const [startDate, setStartDate] = useState("2025-08-01");
  const [endDate, setEndDate] = useState("2025-08-05");

  const filteredData = useMemo(() => {
    return allLoginData.filter(
      (item) => item.date >= startDate && item.date <= endDate
    );
  }, [startDate, endDate]);

  const totalUsers = filteredData.reduce((sum, d) => sum + d.users, 0);

  const chartData = [{ name: "Blu App", users: totalUsers }];

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle>Blu App Users</CardTitle>
          <CardDescription>User count by date</CardDescription>
        </div>
        {/* Date filter controls */}
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
      </CardContent>

      {/* <CardFooter className="flex-col gap-2 text-sm text-center">
        Showing data from <b>{startDate}</b> to <b>{endDate}</b>
      </CardFooter> */}
    </Card>
  );
}
