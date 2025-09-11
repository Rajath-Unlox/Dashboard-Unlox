"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TotalPaymentCard() {
  const [totalPayments, setTotalPayments] = useState<number>(0)
  const [edgeCount, setEdgeCount] = useState<number>(0)
  const [edgePlusCount, setEdgePlusCount] = useState<number>(0)
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
        setTotalPayments(data.length)

        // count based on course_type field
        const edge = data.filter((p: any) => p.course_type === "edge").length
        const edgePlus = data.filter((p: any) => p.course_type === "edge+").length

        setEdgeCount(edge)
        setEdgePlusCount(edgePlus)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
      <CardContent>
        
        <CardTitle className="text-sm font-medium dark:text-slate-400">
          Total Payments
        </CardTitle>
        <div className="flex items-center justify-between">
          {/* Left side - Main payment number */}
          <div>
            <div className="text-5xl font-bold text-slate-900 dark:text-slate-100">
              {loading ? "..." : totalPayments}
            </div>
          </div>

          {/* Right side - Edge metrics in vertical stack */}
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <div className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                {loading ? "..." : edgeCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Edge</div>
            </div>

            <div className="text-center">
              <div className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                {loading ? "..." : edgePlusCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Edge+</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
