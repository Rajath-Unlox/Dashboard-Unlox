"use client"
import { CalendarChart } from "@/components/charts/CalendarChart"
import PaymentTable from "@/components/Tables/PaymentTable"
import { PaymentStatsChart } from "@/components/charts/PaymentStatsChart"
import Navbar from "@/components/Navbar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AuthProvider } from "@/components/Providers/AuthProvider"
import ProtectedRouteWrapper from "@/components/ProtectedRouteWrapper"

const page = () => {
  return (
    <>
      <AuthProvider>
        <ProtectedRouteWrapper allowedRoles={["employee","admin"]}>
          <SidebarProvider>
            <div className="sticky top-0 z-50 w-full">
              <Navbar />
              <div className="min-h-screen flex flex-col bg-background p-4 w-full"> {/* full height */}
                <div className="flex-1 h-full min-h-0 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-2 md:grid-cols-1"> {/* grid fills remaining space */}
                  <div className="bg-card rounded-lg border h-full flex flex-col">
                    <CalendarChart />
                  </div>
                  <div className="bg-card rounded-lg border h-full flex flex-col">
                    <PaymentStatsChart />
                  </div>
                  <div className="bg-card rounded-lg border lg:col-span-2 xl:col-span-2 h-full flex flex-col">
                    <PaymentTable />
                  </div>
                </div>
              </div>
            </div>
          </SidebarProvider>
        </ProtectedRouteWrapper>
      </AuthProvider>
    </>
  )
}



export default page
