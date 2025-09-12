"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Button from "@/components/Button"
import Card from "@/components/Card"
import Link from "next/link"

interface Plan {
  id: string
  name: string
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch("/api/plans")
      .then((res) => res.json())
      .then(setPlans)
      .catch(() => {})
  }, [])

  const createPlan = async () => {
    const res = await fetch("/api/plans", { method: "POST" })
    const plan = await res.json()
    router.push(`/app/plan/${plan.id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Plan de mercadeo</h1>
        <Button onClick={createPlan}>Crear plan</Button>
      </div>
      <div className="space-y-2">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <Link href={`/app/plan/${plan.id}`} className="text-foreground">
              {plan.name}
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
