import React from "react";
import { MoreVertical } from "lucide-react";

type PaymentOption = {
    label: string;
    percentage: number;
    color: string;
};

const PaymentBreakdownCard: React.FC = () => {
    const paymentData: PaymentOption[] = [
        { label: "Full Payment", percentage: 60, color: "#3b82f6" },
        { label: "Installments", percentage: 40, color: "#10b981" },
        { label: "Pre-payment", percentage: 0, color: "#f59e0b" },
    ];

    const radius = 65;
    const circumference = 2 * Math.PI * radius;

    const getStrokeDashArray = (percentage: number) => {
        const strokeLength = (percentage / 100) * circumference;
        return `${strokeLength} ${circumference}`;
    };

    const getStrokeDashOffset = (startPercentage: number) => {
        return -(startPercentage / 100) * circumference;
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 max-w-md mx-auto">
            {/* Card Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    Payment Options
                </h3>
            </div>

            

            {/* Payment Options Legend */}
            <div className="space-y-4">
                {paymentData.map((option, index) => (
                    <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: option.color }}
                            />
                            <span className="text-sm font-medium text-gray-700">
                                {option.label}
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                            {option.percentage}%
                        </span>
                    </div>
                ))}
            </div>

            {/* Growth Indicator */}
            <div className="flex items-center gap-2 mt-4 text-xs">
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    className="text-green-500"
                >
                    <path
                        d="M2 8L6 4L10 8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <span className="text-green-500">+12%</span>
                <span className="text-gray-500">from last month</span>
            </div>
        </div>
    );
};

export default PaymentBreakdownCard;
