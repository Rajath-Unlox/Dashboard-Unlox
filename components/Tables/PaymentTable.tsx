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
  createdAt: string;
}

const PaymentRow = ({ payment }: { payment: Payment }) => {
  return (
    <div className="flex items-center justify-between border p-4 rounded-lg transition">
      <div className="flex flex-col">
        <h1 className="text-lg font-medium">{payment.name}</h1>
        <p className="text-sm text-gray-500">{payment.course_name}</p>
        <p className="text-sm text-gray-500">{payment.pay_option}</p>
      </div>
      <div className="text-sm text-gray-400">
        {new Date(payment.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

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
    .then((data) => {
      const sorted = data.sort(
        (a: Payment, b: Payment) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
    <Card className="w-full mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Payments</CardTitle>
          <CardDescription>Recent payment records</CardDescription>
        </div>
        <CardAction>
          <MoreVertical className="text-gray-500 cursor-pointer" />
        </CardAction>
      </CardHeader>

      <CardContent className="h-[300px] overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div>Loading...</div>
        ) : payments.length === 0 ? (
          <div>No payments found.</div>
        ) : (
          payments.map((payment, index) => (
            <PaymentRow key={index} payment={payment} />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentTable;
