"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { useState } from "react"

export type CalendarProps = {
  className?: string
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  mode?: "single"
}

function Calendar({ className, selected, onSelect, mode = "single", ...props }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day)
    onSelect?.(clickedDate)
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    const dayDate = new Date(year, month, day)
    return dayDate.toDateString() === selected.toDateString()
  }

  const isToday = (day: number) => {
    const dayDate = new Date(year, month, day)
    return dayDate.toDateString() === today.toDateString()
  }

  // Generate calendar days
  const calendarDays = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className={cn("p-3", className)} {...props}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-center pt-1 relative items-center">
          <button
            onClick={previousMonth}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-sm font-medium text-foreground">
            {monthNames[month]} {year}
          </div>
          <button
            onClick={nextMonth}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1",
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="w-full border-collapse space-y-1">
          {/* Day headers */}
          <div className="flex">
            {dayNames.map((day) => (
              <div key={day} className="text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1 mt-2">
            {calendarDays.map((day, index) => (
              <div key={index} className="h-9 w-9 text-center text-sm p-0 relative">
                {day && (
                  <button
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "h-9 w-9 p-0 font-normal text-foreground",
                      isSelected(day) &&
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                      isToday(day) && !isSelected(day) && "bg-accent text-accent-foreground",
                    )}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
