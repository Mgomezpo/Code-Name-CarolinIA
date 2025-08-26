"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Sparkles, MessageSquare, Target } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

export default function NewCampaignPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [campaignData, setCampaignData] = useState({
    name: "",
    description: "",
    type: "",
    target_audience: "",
    budget: "",
    duration: "",
    objectives: "",
  })

  const [aiResponse, setAiResponse] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatting, setIsChatting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setCampaignData((prev) => ({ ...prev, [field]: value }))
  }

  const generateCampaignPlan = async () => {
    if (!campaignData.name || !campaignData.objectives) return

    setIsGenerating(true)
    setAiResponse("")

    const prompt = `Create a comprehensive media plan for: ${campaignData.name}
    
Description: ${campaignData.description}
Objectives: ${campaignData.objectives}
Target Audience: ${campaignData.target_audience}
Budget: ${campaignData.budget}
Duration: ${campaignData.duration}`

    try {
      const res = await fetch("/api/ai/generate-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          campaignType: campaignData.type,
          targetAudience: campaignData.target_audience,
          budget: campaignData.budget,
          duration: campaignData.duration,
        }),
      })

      if (!res.ok) throw new Error("Failed to generate campaign")

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          fullResponse += chunk
          setAiResponse(fullResponse)
        }
      }
    } catch (error) {
      setAiResponse("Error: Failed to generate campaign plan")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

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
          campaignContext: campaignData,
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
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Error: Failed to get AI response" }])
    } finally {
      setIsChatting(false)
    }
  }

  const saveCampaign = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("campaigns").insert({
      ...campaignData,
      workspace_id: params.id,
      created_by: user.id,
      ai_generated_plan: aiResponse,
    })

    if (!error) {
      router.push(`/workspace/${params.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workspace
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Create New Campaign</h1>
          <p className="text-slate-600 mt-2">Use AI to generate comprehensive media plans</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campaign Setup */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Campaign Details
                </CardTitle>
                <CardDescription>Define your campaign parameters for AI generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={campaignData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Summer Product Launch"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={campaignData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Brief description of the campaign"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Campaign Type</Label>
                    <Select onValueChange={(value) => handleInputChange("type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brand-awareness">Brand Awareness</SelectItem>
                        <SelectItem value="product-launch">Product Launch</SelectItem>
                        <SelectItem value="lead-generation">Lead Generation</SelectItem>
                        <SelectItem value="sales-conversion">Sales Conversion</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={campaignData.duration}
                      onChange={(e) => handleInputChange("duration", e.target.value)}
                      placeholder="e.g., 3 months"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="target_audience">Target Audience</Label>
                  <Input
                    id="target_audience"
                    value={campaignData.target_audience}
                    onChange={(e) => handleInputChange("target_audience", e.target.value)}
                    placeholder="e.g., Young professionals 25-35"
                  />
                </div>

                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    value={campaignData.budget}
                    onChange={(e) => handleInputChange("budget", e.target.value)}
                    placeholder="e.g., $50,000"
                  />
                </div>

                <div>
                  <Label htmlFor="objectives">Campaign Objectives</Label>
                  <Textarea
                    id="objectives"
                    value={campaignData.objectives}
                    onChange={(e) => handleInputChange("objectives", e.target.value)}
                    placeholder="What do you want to achieve with this campaign?"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={generateCampaignPlan}
                  disabled={!campaignData.name || !campaignData.objectives || isGenerating}
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGenerating ? "Generating Plan..." : "Generate AI Campaign Plan"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* AI Generated Plan & Chat */}
          <div className="space-y-6">
            <Tabs defaultValue="plan" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="plan">AI Generated Plan</TabsTrigger>
                <TabsTrigger value="chat">AI Assistant</TabsTrigger>
              </TabsList>

              <TabsContent value="plan">
                <Card className="h-[600px]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-orange-600" />
                      Campaign Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isGenerating ? (
                      <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-slate-600">Generating your campaign plan...</p>
                        </div>
                      </div>
                    ) : aiResponse ? (
                      <div className="prose prose-sm max-w-none h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm">{aiResponse}</pre>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-96 text-slate-500">
                        <div className="text-center">
                          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Fill in campaign details and click "Generate AI Campaign Plan"</p>
                        </div>
                      </div>
                    )}

                    {aiResponse && (
                      <div className="mt-4 pt-4 border-t">
                        <Button onClick={saveCampaign} className="w-full">
                          Save Campaign
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chat">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                      AI Assistant
                    </CardTitle>
                    <CardDescription>Chat with AI to refine your campaign strategy</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {chatMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-slate-500">
                          <div className="text-center">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Start a conversation with the AI assistant</p>
                          </div>
                        </div>
                      ) : (
                        chatMessages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-900"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={handleChatSubmit} className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask the AI assistant..."
                        disabled={isChatting}
                      />
                      <Button type="submit" disabled={isChatting || !chatInput.trim()}>
                        {isChatting ? "..." : "Send"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
