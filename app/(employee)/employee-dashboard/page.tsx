"use client"
import { CalendarChart } from "@/components/charts/CalendarChart"
import PaymentTable from "@/components/Tables/PaymentTable"
import { PaymentStatsChart } from "@/components/charts/PaymentStatsChart"
import Navbar from "@/components/Navbar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AuthProvider } from "@/components/Providers/AuthProvider"
import ProtectedRouteWrapper from "@/components/ProtectedRouteWrapper"
import { EmpAppSidebar } from "@/components/EmpAppSidebar"
import { TotalPaymentCard } from "@/components/charts/TotalPaymentCard"
import PaymentBreakdownCard from "@/components/charts/PaymentBreakdownCard"
import { useState } from "react"
import { type DateRange } from "react-day-picker"

const page = () => {
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(undefined)

  return (
    <>
      <div className="min-h-screen flex flex-col bg-background p-4 w-full"> {/* full height */}
        {/* Grid for 3 columns */}
        <div className="flex-1 h-full min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-card rounded-lg h-full flex flex-col p-2 space-y-2 w-full">
            <div className="w-full">
              <TotalPaymentCard />
            </div>
            <PaymentStatsChart selectedDateRange={selectedDateRange} />
          </div>
          <div className="bg-card rounded-lg h-full flex flex-col p-2 space-y-2 w-full">
            <div className="w-full">
              <CalendarChart onDateRangeSelect={setSelectedDateRange} selectedDateRange={selectedDateRange} />
            </div>
            <div className="w-full">
              <PaymentBreakdownCard selectedDateRange={selectedDateRange} />
            </div>
          </div>
          <div className="bg-card rounded-lg h-full flex flex-col p-2 space-y-2 w-full">
            <PaymentTable selectedDateRange={selectedDateRange} />
{}          </div>
        </div>
      </div>
    </>
  )
}



export default page
