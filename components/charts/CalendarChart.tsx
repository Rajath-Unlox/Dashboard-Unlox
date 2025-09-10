"use client"

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"

export function CalendarChart() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Calendar</CardTitle>
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex justify-center items-center p-4">
        <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border text-foreground" />
      </CardContent>
    </Card>
  )
}
