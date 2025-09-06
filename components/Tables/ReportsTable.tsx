"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MoreVertical } from "lucide-react";

type ReportStatus = "resolved" | "pending";

interface Report {
  name: string;
  report: string;
  status: ReportStatus;
}

const statusColors: Record<ReportStatus, string> = {
  resolved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
};

const ReportRow: React.FC<Report> = ({ name, report, status }) => {
  return (
    <div className="flex items-center justify-between border p-4 rounded-lg transition">
      <div className="flex flex-col">
        <h1 className="text-lg font-medium">{name}</h1>
        <p className="text-sm text-gray-500">{report}</p>
      </div>
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
};

const ReportsTable: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
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

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>List of submitted issues</CardDescription>
        </div>
        <CardAction>
          <MoreVertical className="text-gray-500 cursor-pointer" />
        </CardAction>
      </CardHeader>

      <CardContent className="h-[300px] overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div>Loading...</div>
        ) : reports.length === 0 ? (
          <div>No reports found.</div>
        ) : (
          reports
            .slice(-5) 
            .reverse()
            .map((report, index) => (
              <ReportRow key={index} {...report} />
            ))
        )}
      </CardContent>
    </Card>
  );
};

export default ReportsTable;