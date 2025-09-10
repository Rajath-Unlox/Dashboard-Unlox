"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, TrendingUp, CheckCircle, Clock, XCircle } from "lucide-react";

interface Payment {
  payment_status: string;
  createdAt: string;
}

export function PaymentStatsChart() {
  const [totalPayments, setTotalPayments] = useState(0);
  const [successfulPayments, setSuccessfulPayments] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [failedPayments, setFailedPayments] = useState(0);
  const [monthlyGrowth, setMonthlyGrowth] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No token found! User might not be logged in.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:5000/api/payment/myCounselor", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch payments");
        return res.json();
      })
      .then((data: Payment[]) => {
        setLoading(false);

        setTotalPayments(data.length);
        const successful = data.filter((p) => p.payment_status === "success").length;
        const pending = data.filter((p) => p.payment_status === "pending").length;
        const failed = data.filter((p) => p.payment_status === "failed").length;

        setSuccessfulPayments(successful);
        setPendingPayments(pending);
        setFailedPayments(failed);

        // Monthly growth calculation
        const now = new Date();
        const currentMonthPayments = data.filter(
          (p) =>
            p.payment_status === "success" &&
            new Date(p.createdAt).getMonth() === now.getMonth() &&
            new Date(p.createdAt).getFullYear() === now.getFullYear()
        ).length;

        const lastMonth = new Date();
        lastMonth.setMonth(now.getMonth() - 1);
        const lastMonthPayments = data.filter(
          (p) =>
            p.payment_status === "success" &&
            new Date(p.createdAt).getMonth() === lastMonth.getMonth() &&
            new Date(p.createdAt).getFullYear() === lastMonth.getFullYear()
        ).length;

        const growth =
          lastMonthPayments === 0
            ? 100
            : ((currentMonthPayments - lastMonthPayments) / lastMonthPayments) * 100;
        setMonthlyGrowth(Number(growth.toFixed(1)));
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // SVG circle calculations
  const radius = 70; // bigger circle
  const circumference = 2 * Math.PI * radius;
  const successPercentage =
    totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;
  const successStroke = (successPercentage / 100) * circumference;

  if (loading) return <div>Loading...</div>;

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          Payment Statistics
        </CardTitle>
        <CreditCard className="h-5 w-5 text-muted-foreground" />
      </CardHeader>

      <CardContent className="p-6">
        {/* Circle Chart */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative w-[180px] h-[180px] mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
              {/* Outer circle - total payments */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="none"
              />
              {/* Blue arc - successful payments */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                stroke="#3b82f6"
                strokeWidth="12"
                strokeDasharray={`${successStroke} ${circumference - successStroke}`}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="text-2xl font-bold text-foreground">{totalPayments}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>

          {/* Monthly Growth */}
          <div className="flex items-center text-sm text-foreground">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">
              {monthlyGrowth > 0 ? `+${monthlyGrowth}%` : `${monthlyGrowth}%`}
            </span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-foreground">Successful</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{successfulPayments}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-foreground">Pending</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{pendingPayments}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-foreground">Failed</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{failedPayments}</span>
          </div>

          
        </div>
      </CardContent>
    </Card>
  );
}
