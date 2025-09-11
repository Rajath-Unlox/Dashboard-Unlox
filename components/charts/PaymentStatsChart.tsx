"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, TrendingUp, TrendingDown , CheckCircle, Clock, XCircle, Layers } from "lucide-react";
import { type DateRange } from "react-day-picker";

interface Payment {
  name: string;
  email: string;
  phone_number: string;
  course_name: string;
  course_type: string;
  pay_option: string;
  batch: string;
  payment_status: string;
  amount: number;
  timestamp: string;
}

interface PaymentStatsChartProps {
  selectedDateRange?: DateRange | undefined;
}

export function PaymentStatsChart({ selectedDateRange }: PaymentStatsChartProps) {
  const [totalPayments, setTotalPayments] = useState(0);
  const [displayedTotal, setDisplayedTotal] = useState(0);
  const [successfulPayments, setSuccessfulPayments] = useState(0);
  const [displayedSuccessful, setDisplayedSuccessful] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [displayedPending, setDisplayedPending] = useState(0);
  const [failedPayments, setFailedPayments] = useState(0);
  const [displayedFailed, setDisplayedFailed] = useState(0);
  const [edgeCount, setEdgeCount] = useState(0);
  const [edgePlusCount, setEdgePlusCount] = useState(0);
  const [monthlyGrowth, setMonthlyGrowth] = useState(0);
  const [loading, setLoading] = useState(true);

  const animationRef = useRef<number | null>(null);

  const animateCounter = (
    start: number,
    end: number,
    setter?: (value: number) => void
  ) => {
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + (end - start) * easeOutQuart);

      if (setter) setter(current);
      else setDisplayedTotal(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

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

        // ✅ Filter by selected date range
        let filteredData = data;
        if (selectedDateRange?.from || selectedDateRange?.to) {
          filteredData = data.filter((payment) => {
            const paymentDate = new Date(payment.timestamp);

            if (selectedDateRange.from && paymentDate < selectedDateRange.from) {
              return false;
            }

            if (selectedDateRange.to) {
              const endDate = new Date(selectedDateRange.to);
              endDate.setHours(23, 59, 59, 999); // Include entire end date
              if (paymentDate > endDate) {
                return false;
              }
            }

            return true;
          });
        }

        // ✅ Totals
        const newTotal = filteredData.length;
        setTotalPayments(newTotal);
        animateCounter(displayedTotal, newTotal);

        // ✅ Status counts
        const successful = filteredData.filter((p) => p.payment_status === "success").length;
        const pending = filteredData.filter((p) => p.payment_status === "pending").length;
        const failed = filteredData.filter((p) => p.payment_status === "failed").length;

        setSuccessfulPayments(successful);
        setPendingPayments(pending);
        setFailedPayments(failed);

        animateCounter(displayedSuccessful, successful, setDisplayedSuccessful);
        animateCounter(displayedPending, pending, setDisplayedPending);
        animateCounter(displayedFailed, failed, setDisplayedFailed);

        // ✅ Course type counts
        const edge = filteredData.filter((p) => p.course_type === "edge").length;
        const edgePlus = filteredData.filter((p) => p.course_type === "edge+").length;
        setEdgeCount(edge);
        setEdgePlusCount(edgePlus);

        // ✅ Growth calculation
        let growth = 0;

        if (selectedDateRange?.from && selectedDateRange?.to) {
          const rangeDays =
            Math.ceil(
              (selectedDateRange.to.getTime() - selectedDateRange.from.getTime()) /
              (1000 * 60 * 60 * 24)
            ) + 1; // inclusive days count

          const currentRangeStart = new Date(selectedDateRange.from);
          const currentRangeEnd = new Date(selectedDateRange.to);
          currentRangeEnd.setHours(23, 59, 59, 999);

          // previous range = same length, ending the day before current start
          const prevRangeEnd = new Date(currentRangeStart);
          prevRangeEnd.setDate(prevRangeEnd.getDate() - 1);
          prevRangeEnd.setHours(23, 59, 59, 999);

          const prevRangeStart = new Date(prevRangeEnd);
          prevRangeStart.setDate(prevRangeStart.getDate() - (rangeDays - 1));
          prevRangeStart.setHours(0, 0, 0, 0);

          const currentRangeSuccess = data.filter((p) => {
            const d = new Date(p.timestamp);
            return (
              p.payment_status === "success" &&
              d >= currentRangeStart &&
              d <= currentRangeEnd
            );
          }).length;

          const prevRangeSuccess = data.filter((p) => {
            const d = new Date(p.timestamp);
            return (
              p.payment_status === "success" &&
              d >= prevRangeStart &&
              d <= prevRangeEnd
            );
          }).length;

          growth =
            prevRangeSuccess === 0
              ? currentRangeSuccess > 0
                ? 100
                : 0
              : ((currentRangeSuccess - prevRangeSuccess) / prevRangeSuccess) * 100;
        } else {
          // fallback: monthly growth like before
          const now = new Date();
          const currentMonthSuccessPayments = data.filter(
            (p) =>
              p.payment_status === "success" &&
              new Date(p.timestamp).getMonth() === now.getMonth() &&
              new Date(p.timestamp).getFullYear() === now.getFullYear()
          ).length;

          const lastMonth = new Date();
          lastMonth.setMonth(now.getMonth() - 1);
          if (now.getMonth() === 0) {
            lastMonth.setFullYear(now.getFullYear() - 1);
          }

          const lastMonthSuccessPayments = data.filter(
            (p) =>
              p.payment_status === "success" &&
              new Date(p.timestamp).getMonth() === lastMonth.getMonth() &&
              new Date(p.timestamp).getFullYear() === lastMonth.getFullYear()
          ).length;

          growth =
            lastMonthSuccessPayments === 0
              ? currentMonthSuccessPayments > 0
                ? 100
                : 0
              : ((currentMonthSuccessPayments - lastMonthSuccessPayments) /
                lastMonthSuccessPayments) *
              100;
        }

        setMonthlyGrowth(Number(growth.toFixed(1)));
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedDateRange]);


  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);


  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const successPercentage =
    totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;
  const successStroke = (successPercentage / 100) * circumference;

  if (loading) return <div>Loading...</div>;

  return (
  <Card className="h-full">
    <CardHeader className="flex items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-foreground">
        Payment Statistics{" "}
        {selectedDateRange?.from &&
          selectedDateRange?.to &&
          (selectedDateRange.from.toDateString() === selectedDateRange.to.toDateString()
            ? `- ${selectedDateRange.from.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}`
            : `- ${selectedDateRange.from.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })} to ${selectedDateRange.to.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}`)}
      </CardTitle>
      <CreditCard className="h-5 w-5 text-muted-foreground" />
    </CardHeader>

    <CardContent className="p-6">
      {/* Circle Chart */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative w-[180px] h-[180px] mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r={radius} stroke="#e5e7eb" strokeWidth="12" fill="none" />
            <circle
              cx="90"
              cy="90"
              r={radius}
              stroke="#3b82f6"
              strokeWidth="12"
              strokeDasharray={`${successStroke} ${circumference - successStroke}`}
              strokeLinecap="round"
              fill="none"
              style={{
                transition: "stroke-dasharray 1s ease-in-out",
                transformOrigin: "center",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-2xl font-bold text-foreground transition-all duration-300">
              {displayedTotal}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>

        {/* Monthly / Range Growth */}
        <div className="flex items-center text-sm text-foreground">
          {monthlyGrowth > 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          ) : monthlyGrowth < 0 ? (
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          ) : (
            <TrendingUp className="h-4 w-4 text-gray-500 mr-1 rotate-90" />
          )}

          <span
            className={`${
              monthlyGrowth > 0
                ? "text-green-500"
                : monthlyGrowth < 0
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            {monthlyGrowth > 0 ? `+${monthlyGrowth}%` : `${monthlyGrowth}%`}
          </span>

          <span className="text-muted-foreground ml-1">
            {selectedDateRange?.from && selectedDateRange?.to
              ? `from last ${
                  Math.ceil(
                    (selectedDateRange.to.getTime() - selectedDateRange.from.getTime()) /
                      (1000 * 60 * 60 * 24)
                  ) + 1
                } day${
                  Math.ceil(
                    (selectedDateRange.to.getTime() - selectedDateRange.from.getTime()) /
                      (1000 * 60 * 60 * 24)
                  ) + 1 === 1
                    ? ""
                    : "s"
                }`
              : "from last month"}
          </span>
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-foreground">Successful</span>
          </div>
          <span className="text-sm font-semibold text-foreground transition-all duration-300">
            {displayedSuccessful}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-foreground">Pending</span>
          </div>
          <span className="text-sm font-semibold text-foreground transition-all duration-300">
            {displayedPending}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-foreground">Failed</span>
          </div>
          <span className="text-sm font-semibold text-foreground transition-all duration-300">
            {displayedFailed}
          </span>
        </div>

        {/* Edge count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-foreground">Edge</span>
          </div>
          <span className="text-sm font-semibold text-foreground transition-all duration-300">
            {edgeCount}
          </span>
        </div>

        {/* Edge+ count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-foreground">Edge+</span>
          </div>
          <span className="text-sm font-semibold text-foreground transition-all duration-300">
            {edgePlusCount}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
);

}
