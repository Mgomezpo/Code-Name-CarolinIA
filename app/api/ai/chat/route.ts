import { streamText } from "ai"
import { xai } from "@ai-sdk/xai"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { messages, campaignContext } = await request.json()

    if (!messages || messages.length === 0) {
      return new Response("Messages are required", { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]

    const systemPrompt = `You are an AI media planning assistant integrated into MediaPlan AI platform. Help users refine their campaigns, suggest improvements, and answer questions about media planning strategies.

${campaignContext ? `Current Campaign Context: ${JSON.stringify(campaignContext)}` : ""}

Be helpful, creative, and provide actionable insights for media planning and campaign optimization.`

    const result = streamText({
      model: xai("grok-4", {
        apiKey: process.env.XAI_API_KEY,
      }),
      prompt: lastMessage.content,
      system: systemPrompt,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Error in AI chat:", error)
    return new Response("Failed to get AI response", { status: 500 })
  }
}
