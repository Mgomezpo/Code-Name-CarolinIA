import { NextResponse } from "next/server"

let sections: Record<string, any> = {}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  return NextResponse.json(
    sections[params.id] || { objective: "", audience: "", channels: "", kpis: "" },
  )
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const data = await req.json()
  sections[params.id] = { ...(sections[params.id] || {}), ...data }
  return NextResponse.json(sections[params.id])
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  delete sections[params.id]
  return NextResponse.json({}, { status: 204 })
}
