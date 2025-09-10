"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TotalPaymentCard() {
  const [totalPayments, setTotalPayments] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")

    if (!token) {
      console.error("No token found! User might not be logged in.")
      setLoading(false)
      return
    }

    fetch("http://localhost:5000/api/payment/myCounselor", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch payments")
        return res.json()
      })
      .then((data) => {
        setTotalPayments(data.length) // count payments
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <Card>
      <CardHeader >
        <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
      </CardHeader>
      <CardContent className="pt-">
        <div className="text-4xl font-bold mb-2">
          {loading ? "..." : totalPayments}
        </div>
      </CardContent>
    </Card>
  )
}
