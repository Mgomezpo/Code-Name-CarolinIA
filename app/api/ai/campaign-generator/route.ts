import { streamText } from "ai"
import { xai } from "@ai-sdk/xai"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt, campaignData } = await request.json()

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 })
    }

    const systemPrompt = `You are an expert media planning strategist and creative director. You help content creators and marketing agencies develop comprehensive media plans with strategic insights, compelling messages, and actionable recommendations.

Context: ${campaignData ? JSON.stringify(campaignData) : "No campaign context provided"}

Your responses should be:
- Strategic and data-driven
- Creative and engaging
- Actionable with specific recommendations
- Formatted in clear, structured sections
- Focused on media planning, content strategy, and campaign optimization

Always provide practical insights that can be immediately implemented in media campaigns.`

    const result = streamText({
      model: xai("grok-4"),
      prompt: prompt,
      system: systemPrompt,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Error generating campaign insights:", error)
    return new Response("Failed to generate campaign insights", { status: 500 })
  }
}
