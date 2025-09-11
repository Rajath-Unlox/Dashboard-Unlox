"use client"

import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CalendarIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { DayButton, type DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"

interface Payment {
  name: string
  email: string
  phone_number: string
  course_name: string
  course_type: string
  pay_option: string
  batch: string
  payment_status: string
  amount: number
  timestamp: string
}

interface PaymentsByDate {
  [key: string]: Payment[]
}

// Helper function to format date in local timezone (YYYY-MM-DD)
function formatDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function PaymentCalendarDayButton({
  day,
  paymentsData,
  ...props
}: React.ComponentProps<typeof DayButton> & {
  paymentsData: PaymentsByDate
}) {
  const dateKey = formatDateLocal(day.date)
  const dayPayments = paymentsData[dateKey] || []

  // Count payments by status
  const successCount = dayPayments.filter(p => p.payment_status === 'success').length
  const pendingCount = dayPayments.filter(p => p.payment_status === 'pending').length
  const failedCount = dayPayments.filter(p => p.payment_status === 'failed').length

  // Determine dot color based on payment status priority
  const getDotColor = () => {
    if (failedCount > 0) return 'bg-red-500'
    if (pendingCount > 0) return 'bg-yellow-500'
    if (successCount > 0) return 'bg-green-500'
    return null
  }

  const dotColor = getDotColor()
  const totalAmount = dayPayments.reduce((sum, payment) => sum + payment.amount, 0)

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount)

  if (dayPayments.length === 0) {
    return <CalendarDayButton day={day} {...props} />
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative w-full h-full">
          <CalendarDayButton day={day} {...props} />
          {dotColor && (
            <div className={cn(
              "absolute top-1 right-1 w-2 h-2 rounded-full",
              dotColor
            )} />
          )}
        </div>
      </TooltipTrigger>

    </Tooltip>
  )
}

interface CalendarChartProps {
  onDateRangeSelect?: (dateRange: DateRange | undefined) => void
  selectedDateRange?: DateRange | undefined
}

export function CalendarChart({ onDateRangeSelect, selectedDateRange }: CalendarChartProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(selectedDateRange)
  const [paymentsData, setPaymentsData] = useState<PaymentsByDate>({})
  const [loading, setLoading] = useState(true)

  const handleDateRangeSelect = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange)
    onDateRangeSelect?.(newDateRange)
  }

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
      .then((data: Payment[]) => {
        // Group payments by date
        const groupedPayments: PaymentsByDate = {}
        data.forEach((payment) => {
          const dateKey = formatDateLocal(new Date(payment.timestamp))
          if (!groupedPayments[dateKey]) {
            groupedPayments[dateKey] = []
          }
          groupedPayments[dateKey].push(payment)
        })
        setPaymentsData(groupedPayments)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-foreground">Payment Calendar</CardTitle>
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex justify-center items-center p-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading payments...</div>
        ) : (
          <div className="flex min-w-0 flex-col gap-2 w-full">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              numberOfMonths={1}
              className="rounded-lg border shadow-sm w-full"
              components={{
                DayButton: (props) => (
                  <PaymentCalendarDayButton {...props} paymentsData={paymentsData} />
                )
              }}
            />
            {dateRange?.from && dateRange?.to && (
              <div className="text-muted-foreground text-center text-xs">
                {dateRange.from.toDateString() === dateRange.to.toDateString()
                  ? dateRange.from.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                  : `${dateRange.from.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })} - ${dateRange.to.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}`}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}