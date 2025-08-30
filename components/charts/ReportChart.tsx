"use client";

import { useState, useMemo } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Example reports data with dates
const allReportData = [
  { date: "2025-08-01", resolved: 100, unresolved: 30 },
  { date: "2025-08-02", resolved: 120, unresolved: 20 },
  { date: "2025-08-03", resolved: 80, unresolved: 25 },
  { date: "2025-08-04", resolved: 90, unresolved: 15 },
  { date: "2025-08-05", resolved: 110, unresolved: 10 },
];

const chartConfig = {
  resolved: {
    label: "Resolved",
    color: "#0373ff", // blue
  },
  unresolved: {
    label: "Unresolved",
    color: "#bac9f7", // light blue
  },
} satisfies ChartConfig;

export function ReportsChart() {
  const [startDate, setStartDate] = useState("2025-08-01");
  const [endDate, setEndDate] = useState("2025-08-05");

  // Filter and aggregate reports within date range
  const filteredData = useMemo(() => {
    return allReportData.filter(
      (item) => item.date >= startDate && item.date <= endDate
    );
  }, [startDate, endDate]);

  const aggregatedData = useMemo(() => {
    const resolved = filteredData.reduce((sum, d) => sum + d.resolved, 0);
    const unresolved = filteredData.reduce((sum, d) => sum + d.unresolved, 0);
    return { resolved, unresolved, total: resolved + unresolved };
  }, [filteredData]);

  const chartData = [
    {
      name: "Reports",
      resolved: aggregatedData.resolved,
      unresolved: aggregatedData.unresolved,
    },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle>Reports</CardTitle>
          <CardDescription>Resolved & Unresolved</CardDescription>
        </div>

        {/* Date filters */}
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
                          {aggregatedData.total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Reports
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="resolved"
              stackId="a"
              cornerRadius={5}
              fill="#0373ff"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="unresolved"
              stackId="a"
              cornerRadius={5}
              fill="#bac9f7"
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
