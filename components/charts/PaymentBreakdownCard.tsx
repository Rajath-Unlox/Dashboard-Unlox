"use client";

import React, { useEffect, useState } from "react";
import { type DateRange } from "react-day-picker";

type PaymentOption = {
    label: string;
    percentage: number;
    color: string;
};

type Payment = {
    pay_option: string;
    timestamp: string;
};

interface PaymentBreakdownCardProps {
    selectedDateRange?: DateRange | undefined
}

const PaymentBreakdownCard: React.FC<PaymentBreakdownCardProps> = ({ selectedDateRange }) => {
    const [paymentData, setPaymentData] = useState<PaymentOption[]>([]);
    const [growth, setGrowth] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // Helper function to format date in local timezone (YYYY-MM-DD)
    const formatDateLocal = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        fetch("http://localhost:5000/api/payment/myCounselor", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((payments: Payment[]) => {
                // Filter data by selected date range if provided
                let filteredPayments = payments;
                if (selectedDateRange?.from || selectedDateRange?.to) {
                    filteredPayments = payments.filter((payment) => {
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

                if (!filteredPayments || filteredPayments.length === 0) {
                    setPaymentData([
                        { label: "Full Payment", percentage: 0, color: "#3b82f6" },
                        // { label: "Installments", percentage: 0, color: "#10b981" },
                        { label: "Pre-payment", percentage: 0, color: "#f59e0b" },
                    ]);
                    setGrowth(0);
                    setLoading(false);
                    return;
                }

                // --- Percentages ---
                const total = filteredPayments.length;
                const counts = {
                    "Full Payment": filteredPayments.filter((p) => p.pay_option === "full").length,
                    // "Installments": filteredPayments.filter((p) => p.pay_option === "Installments").length,
                    "Pre-payment": filteredPayments.filter((p) => p.pay_option === "pre").length,
                };

                setPaymentData([
                    {
                        label: "Full Payment",
                        percentage: Math.round((counts["Full Payment"] / total) * 100),
                        color: "#3b82f6",
                    },
                    //   {
                    //     label: "Installments",
                    //     percentage: Math.round((counts["Installments"] / total) * 100),
                    //     color: "#10b981",
                    //   },
                    {
                        label: "Pre-payment",
                        percentage: Math.round((counts["Pre-payment"] / total) * 100),
                        color: "#f59e0b",
                    },
                ]);

                // --- Growth Calculation ---
                const now = new Date();
                const thisMonth = now.getMonth();
                const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
                const thisYear = now.getFullYear();
                const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

                // Use full dataset for growth calculation, not filtered data
                const thisMonthPayments = payments.filter((p) => {
                    const d = new Date(p.timestamp);
                    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
                }).length;

                const lastMonthPayments = payments.filter((p) => {
                    const d = new Date(p.timestamp);
                    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
                }).length;

                let percentageGrowth = 0;
                if (lastMonthPayments > 0) {
                    percentageGrowth = ((thisMonthPayments - lastMonthPayments) / lastMonthPayments) * 100;
                } else if (thisMonthPayments > 0) {
                    percentageGrowth = 100; // new growth if last month was zero
                }

                setGrowth(Math.round(percentageGrowth));
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [selectedDateRange]);

    return (
        <div className="rounded-xl p-6 shadow-sm border max-w-md mx-auto">
            {/* Card Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                    Payment Options{" "}
                    {selectedDateRange?.from &&
                        selectedDateRange?.to &&
                        (selectedDateRange.from.toDateString() ===
                            selectedDateRange.to.toDateString()
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
                </h3>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {/* Payment Options Legend */}
                    <div className="space-y-4">
                        {paymentData.map((option, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: option.color }}
                                    />
                                    <span className="text-sm font-medium">
                                        {option.label}
                                    </span>
                                </div>
                                <span className="text-sm font-semibold">
                                    {option.percentage}%
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Dynamic Growth Indicator */}
                    {!selectedDateRange && (
                        <div className="flex items-center gap-2 mt-4 text-xs">
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                className={growth && growth >= 0 ? "text-green-500" : "text-red-500"}
                            >
                                <path
                                    d={growth && growth >= 0 ? "M2 8L6 4L10 8" : "M2 4L6 8L10 4"}
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span className={growth && growth >= 0 ? "text-green-500" : "text-red-500"}>
                                {growth}%
                            </span>
                            <span className="text-gray-400">from last month</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PaymentBreakdownCard;
