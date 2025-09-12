import { NextResponse } from "next/server"
import { generatePdf } from "@/lib/pdf"

export async function POST(req: Request) {
  const { planId } = await req.json()
  const pdf = await generatePdf(planId)
  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
    },
  })
}
