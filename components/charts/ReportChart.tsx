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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const chartConfig = {
  resolved: {
    label: "Resolved",
    color: "#0373ff",
  },
  unresolved: {
    label: "Unresolved",
    color: "#bac9f7",
  },
} satisfies ChartConfig;

interface Report {
  status: "resolved" | "pending";
  createdAt: string; // ISO date string
}

export function ReportsChart() {
  const [reports, setReports] = useState<Report[]>([]);
  const [startDate, setStartDate] = useState("2025-08-01");
  const [endDate, setEndDate] = useState("2025-08-05");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/reports")
      .then((res) => res.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter reports by date range
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const date = report.createdAt?.slice(0, 10);
      return date >= startDate && date <= endDate;
    });
  }, [reports, startDate, endDate]);


  // Aggregate counts

  const aggregatedData = useMemo(() => {
    const resolved = filteredReports.filter((r) => r.status === "resolved").length;
    const unresolved = filteredReports.filter((r) => r.status === "pending").length;
    return { resolved, unresolved, total: resolved + unresolved };
  }, [filteredReports]);

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
        )}
      </CardContent>
    </Card>
  );
}