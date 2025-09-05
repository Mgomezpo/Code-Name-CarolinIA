"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MessageSquare } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

interface Campaign {
  id: string
  name: string
  description: string
  type: string
  target_audience: string
  budget: string
  duration: string
  objectives: string
  ai_generated_plan: string
}

export default function CampaignChatPage({ params }: { params: { id: string; campaignId: string } }) {
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatting, setIsChatting] = useState(false)

  useEffect(() => {
    loadCampaign()
  }, [params.campaignId])

  const loadCampaign = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { data } = await supabase.from("campaigns").select("*").eq("id", params.campaignId).single()
    if (data) {
      setCampaign(data)
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !campaign) return

    const newMessage = { role: "user", content: chatInput }
    setChatMessages((prev) => [...prev, newMessage])
    setChatInput("")
    setIsChatting(true)

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, newMessage],
          campaignContext: campaign,
        }),
      })

      if (!res.ok) throw new Error("Failed to get AI response")

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let aiMessage = ""

      setChatMessages((prev) => [...prev, { role: "assistant", content: "" }])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          aiMessage += chunk

          setChatMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: "assistant", content: aiMessage }
            return updated
          })
        }
      }
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Failed to get AI response" },
      ])
    } finally {
      setIsChatting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/workspace/${params.id}/campaigns/${params.campaignId}/editor`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaign
          </Link>
        </Button>
        {campaign && (
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{campaign.name} - AI Chat</h1>
        )}
        <Card className="h-[700px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Ask me anything about your campaign</p>
                  </div>
                </div>
              ) : (
                chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] p-3 rounded-lg text-sm ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-900"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about your campaign..."
                disabled={isChatting}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button type="submit" size="sm" disabled={isChatting || !chatInput.trim()}>
                {isChatting ? "..." : "Send"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
