import { streamText } from "ai"
import { xai } from "@ai-sdk/xai"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt, campaignType, targetAudience, budget, duration } = await request.json()

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 })
    }

    const systemPrompt = `You are an expert media planning strategist. Generate comprehensive campaign plans with specific insights, messages, actions, and channel recommendations.

Context:
- Campaign Type: ${campaignType || "General"}
- Target Audience: ${targetAudience || "Not specified"}
- Budget: ${budget || "Not specified"}
- Duration: ${duration || "Not specified"}

Provide your response in a structured format with:
1. Campaign Overview
2. Key Messages (3-5 main messages)
3. Recommended Actions (specific tactics)
4. Channel Strategy (which platforms and why)
5. Content Calendar Suggestions
6. KPIs to track

Be specific, actionable, and creative.`

    const result = streamText({
      model: xai("grok-4", {
        apiKey: process.env.XAI_API_KEY,
      }),
      prompt: prompt,
      system: systemPrompt,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Error generating campaign:", error)
    return new Response("Failed to generate campaign", { status: 500 })
  }
}
