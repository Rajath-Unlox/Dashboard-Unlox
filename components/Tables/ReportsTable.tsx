import React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MoreVertical } from "lucide-react";

type ReportStatus = "Resolved" | "Pending";

interface Report {
  name: string;
  report: string;
  status: ReportStatus;
}

const reports: Report[] = [
  { name: "John Doe", report: "Issue with course access", status: "Resolved" },
  {
    name: "Jane Smith",
    report: "Unable to submit assignment",
    status: "Pending",
  },
  { name: "Mark Taylor", report: "Payment not reflecting", status: "Resolved" },
  {
    name: "Alice Johnson",
    report: "Broken link in Week 3 material",
    status: "Pending",
  },
  {
    name: "Robert Brown",
    report: "Confusion about exam schedule",
    status: "Pending",
  },
  { name: "Emma Davis", report: "Blockchain AI Issue", status: "Resolved" },
  { name: "Michael Lee", report: "Cloud Computing Page not loading", status: "Resolved" },
];

const statusColors: Record<ReportStatus, string> = {
  Resolved: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
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
        {status}
      </span>
    </div>
  );
};

const ReportsTable: React.FC = () => {
  return (
    <Card className="w-full mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Reports</CardTitle>
          <CardDescription>List of submitted issues</CardDescription>
        </div>
        <CardAction>
          <MoreVertical className="text-gray-500 cursor-pointer" />
        </CardAction>
      </CardHeader>

      <CardContent className="h-[300px] overflow-y-auto p-4 space-y-2">
        {reports.map((report, index) => (
          <ReportRow key={index} {...report} />
        ))}
      </CardContent>
    </Card>
  );
};

export default ReportsTable;
