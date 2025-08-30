import React from "react";
import { UserChart } from "@/components/charts/UserChart";
import { ReportsChart } from "@/components/charts/ReportChart";
import UserTable from "@/components/Tables/UserTable";
import ReportsTable from "@/components/Tables/ReportsTable";
const page = () => {
  return (
    <div className="w-full grid grid-cols-1 z-1 gap-4 lg:grid-cols-2 xl:grid-cols-2 md:grid-cols-1 p-4">
      <div className="bg-primary-foreground rounded-lg">
        <UserChart />
      </div>
      <div className="bg-primary-foreground rounded-lg">
        <ReportsChart />
      </div>
      <div className="bg-primary-foreground rounded-lg">
        <UserTable />
      </div>
      <div className="bg-primary-foreground rounded-lg">
        <ReportsTable />
      </div>
    </div>
  );
};

export default page;
