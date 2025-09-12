import { NextResponse } from "next/server"

let plans: { id: string; name: string }[] = []

export async function GET() {
  return NextResponse.json(plans)
}

export async function POST() {
  const id = (plans.length + 1).toString()
  const plan = { id, name: `Plan ${id}` }
  plans.push(plan)
  return NextResponse.json(plan, { status: 201 })
}
