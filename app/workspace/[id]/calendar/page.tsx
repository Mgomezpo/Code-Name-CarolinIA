"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

interface ContentPiece {
  id: string
  title: string
  content: string
  content_type: string
  platform: string
  scheduled_date: string
  status: string
  campaign_id: string
  campaigns: {
    name: string
    workspace_id: string
  }
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  contentPieces: ContentPiece[]
}

export default function CalendarPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [contentPieces, setContentPieces] = useState<ContentPiece[]>([])
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")

  useEffect(() => {
    loadContentPieces()
  }, [currentDate, params.id])

  useEffect(() => {
    generateCalendarDays()
  }, [currentDate, contentPieces])

  const loadContentPieces = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    const { data, error } = await supabase
      .from("content_pieces")
      .select(`
        *,
        campaigns!inner(name, workspace_id)
      `)
      .gte("scheduled_date", startOfMonth.toISOString())
      .lte("scheduled_date", endOfMonth.toISOString())
      .eq("campaigns.workspace_id", params.id)

    if (data) {
      setContentPieces(data)
    }
    setLoading(false)
  }

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const firstDayOfWeek = firstDayOfMonth.getDay()

    const days: CalendarDay[] = []

    // Add days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevMonth = month === 0 ? 11 : month - 1
      const prevYear = month === 0 ? year - 1 : year
      const lastDayOfPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate()
      const date = new Date(prevYear, prevMonth, lastDayOfPrevMonth - i)

      // Validate date before adding
      if (!isNaN(date.getTime())) {
        days.push({
          date,
          isCurrentMonth: false,
          contentPieces: [],
        })
      }
    }

    // Add days of current month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day)

      // Validate date before processing
      if (!isNaN(date.getTime())) {
        const dayContentPieces = contentPieces.filter((piece) => {
          if (!piece.scheduled_date) return false
          const pieceDate = new Date(piece.scheduled_date)
          return !isNaN(pieceDate.getTime()) && pieceDate.toDateString() === date.toDateString()
        })

        days.push({
          date,
          isCurrentMonth: true,
          contentPieces:
            selectedPlatform === "all"
              ? dayContentPieces
              : dayContentPieces.filter((piece) => piece.platform === selectedPlatform),
        })
      }
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = month === 11 ? 0 : month + 1
      const nextYear = month === 11 ? year + 1 : year
      const date = new Date(nextYear, nextMonth, day)

      // Validate date before adding
      if (!isNaN(date.getTime())) {
        days.push({
          date,
          isCurrentMonth: false,
          contentPieces: [],
        })
      }
    }

    setCalendarDays(days)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getPlatformColor = (platform: string) => {
    const colors = {
      instagram: "bg-pink-100 text-pink-800",
      facebook: "bg-blue-100 text-blue-800",
      linkedin: "bg-indigo-100 text-indigo-800",
      twitter: "bg-sky-100 text-sky-800",
      tiktok: "bg-gray-100 text-gray-800",
    }
    return colors[platform as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      scheduled: "bg-blue-100 text-blue-800",
      published: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workspace
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Content Calendar</h1>
              <p className="text-slate-600 mt-2">Plan and schedule your content across platforms</p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Platforms</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter</option>
                <option value="tiktok">TikTok</option>
              </select>
              <Button className="bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] hover:from-[hsl(var(--color-primary))] hover:to-[hsl(var(--color-accent))]">
                <Plus className="w-4 h-4 mr-2" />
                New Content
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-slate-600">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border border-slate-200 rounded-lg ${
                    day.isCurrentMonth ? "bg-white" : "bg-slate-50"
                  } ${day.date.toDateString() === new Date().toDateString() ? "ring-2 ring-blue-500" : ""}`}
                >
                  <div
                    className={`text-sm font-medium mb-2 ${day.isCurrentMonth ? "text-slate-900" : "text-slate-400"}`}
                  >
                    {!isNaN(day.date.getTime()) ? day.date.getDate() : ""}
                  </div>

                  <div className="space-y-1">
                    {day.contentPieces.slice(0, 3).map((piece) => (
                      <div
                        key={piece.id}
                        className="p-1 rounded text-xs cursor-pointer hover:shadow-sm transition-shadow"
                        style={{ backgroundColor: "#f8fafc" }}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <Badge
                            variant="secondary"
                            className={`text-xs px-1 py-0 ${getPlatformColor(piece.platform)}`}
                          >
                            {piece.platform}
                          </Badge>
                          <Badge variant="secondary" className={`text-xs px-1 py-0 ${getStatusColor(piece.status)}`}>
                            {piece.status}
                          </Badge>
                        </div>
                        <p className="text-slate-700 truncate font-medium">{piece.title}</p>
                        <p className="text-slate-500 text-xs truncate">{piece.campaigns?.name}</p>
                      </div>
                    ))}

                    {day.contentPieces.length > 3 && (
                      <div className="text-xs text-slate-500 text-center py-1">
                        +{day.contentPieces.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contentPieces.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {contentPieces.filter((p) => p.status === "scheduled").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {contentPieces.filter((p) => p.status === "published").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {contentPieces.filter((p) => p.status === "draft").length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
