import { NextResponse } from "next/server"
import { grokGenerate } from "@/lib/grok"

export async function POST(req: Request) {
  const { planId } = await req.json()
  const days = await grokGenerate(planId)
  return NextResponse.json({ planId, days })
}
