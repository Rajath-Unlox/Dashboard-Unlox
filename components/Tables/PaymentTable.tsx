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

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "success":
      return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
    case "pending":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
    case "failed":
      return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark";
  }
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

const formatDate = (timestamp: string) =>
  new Date(timestamp).toLocaleDateString("en-IN", { 
    day: "2-digit", 
    month: "short", 
    year: "numeric" 
  });

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500", 
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-teal-500"
  ];
  const index = name.length % colors.length;
  return colors[index];
};

const PaymentRow = ({ payment }: { payment: Payment }) => (
  <div className="flex items-center justify-between py-4 px-0 border-b border-gray-100 last:border-b-0 transition-colors duration-200">
    <div className="flex items-center space-x-4 flex-1">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(payment.name)}`}>
        {getInitials(payment.name)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-base leading-tight">
          {payment.name}
        </div>
        <div className="text-sm mt-0.5">
          {payment.course_name}
        </div>
      </div>
    </div>

    <div className="flex items-center space-x-6">
      <div className="text-right">
        <div className="font-semibold text-base">
          {formatAmount(payment.amount)}
        </div>
        <div className="text-sm mt-0.5">
          {formatDate(payment.timestamp)}
        </div>
      </div>
      
      <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(payment.payment_status)}`}>
        {payment.payment_status}
      </div>
      
      
    </div>
  </div>
);

const PaymentTable = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.error("No token found! User might not be logged in.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:5000/api/payment/todays-payments", {
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
      .then((data) => {
        const sorted = data.sort(
          (a: Payment, b: Payment) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setPayments(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <Card className="w-full h-full mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Todays Payments</CardTitle>
        </div>
        
      </CardHeader>

      <CardContent className="h-full overflow-y-auto p-6 space-y-0">
        {loading ? (
          <div>Loading...</div>
        ) : payments.length === 0 ? (
          <div>No payments found.</div>
        ) : (
          payments.map((payment, index) => <PaymentRow key={index} payment={payment} />)
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentTable;