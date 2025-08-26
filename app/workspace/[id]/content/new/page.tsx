"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, Sparkles, Save } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

interface Campaign {
  id: string
  name: string
}

export default function NewContentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [contentData, setContentData] = useState({
    title: "",
    content: "",
    content_type: "",
    platform: "",
    campaign_id: "",
    scheduled_date: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCampaigns()
  }, [params.id])

  const loadCampaigns = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { data } = await supabase
      .from("campaigns")
      .select("id, name")
      .eq("workspace_id", params.id)
      .order("created_at", { ascending: false })

    if (data) {
      setCampaigns(data)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setContentData((prev) => ({ ...prev, [field]: value }))
  }

  const generateAIContent = async () => {
    if (!contentData.campaign_id || !contentData.platform || !contentData.content_type) {
      alert("Please select campaign, platform, and content type first")
      return
    }

    setLoading(true)

    try {
      const campaign = campaigns.find((c) => c.id === contentData.campaign_id)
      const prompt = `Create ${contentData.content_type} content for ${contentData.platform} for the campaign "${campaign?.name}". Make it engaging and platform-appropriate.`

      const res = await fetch("/api/ai/generate-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          campaignType: contentData.content_type,
          targetAudience: "",
          budget: "",
          duration: "",
        }),
      })

      if (!res.ok) throw new Error("Failed to generate content")

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let generatedContent = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          generatedContent += decoder.decode(value, { stream: true })
        }
      }

      setContentData((prev) => ({
        ...prev,
        content: generatedContent,
        title: `${contentData.content_type} for ${contentData.platform}`,
      }))
    } catch (error) {
      alert("Failed to generate AI content")
    } finally {
      setLoading(false)
    }
  }

  const saveContent = async () => {
    if (!contentData.title || !contentData.content || !contentData.campaign_id) {
      alert("Please fill in all required fields")
      return
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("content_pieces").insert({
      ...contentData,
      created_by: user.id,
      scheduled_date: contentData.scheduled_date || null,
      ai_generated: loading,
    })

    if (!error) {
      router.push(`/workspace/${params.id}/calendar`)
    } else {
      alert("Failed to save content")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Calendar
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Create New Content</h1>
          <p className="text-slate-600 mt-2">Create and schedule content for your campaigns</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Content Details</CardTitle>
              <CardDescription>Define your content parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="campaign">Campaign</Label>
                <Select onValueChange={(value) => handleInputChange("campaign_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select onValueChange={(value) => handleInputChange("platform", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="content_type">Content Type</Label>
                  <Select onValueChange={(value) => handleInputChange("content_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="post">Post</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="reel">Reel</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="carousel">Carousel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={contentData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Content title"
                />
              </div>

              <div>
                <Label htmlFor="scheduled_date">Scheduled Date & Time</Label>
                <Input
                  id="scheduled_date"
                  type="datetime-local"
                  value={contentData.scheduled_date}
                  onChange={(e) => handleInputChange("scheduled_date", e.target.value)}
                />
              </div>

              <Button
                onClick={generateAIContent}
                disabled={loading || !contentData.campaign_id || !contentData.platform}
                className="w-full bg-transparent"
                variant="outline"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {loading ? "Generating..." : "Generate AI Content"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Write or edit your content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={contentData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  placeholder="Write your content here..."
                  rows={15}
                  className="resize-none"
                />

                <div className="flex gap-2">
                  <Button onClick={saveContent} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Save Content
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Calendar className="w-4 h-4 mr-2" />
                    Save & Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
