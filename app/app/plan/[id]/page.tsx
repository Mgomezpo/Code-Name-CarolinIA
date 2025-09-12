"use client"

import { useEffect, useState } from "react"
import Button from "@/components/Button"

const sectionKeys = ["objective", "audience", "channels", "kpis"] as const

interface Props {
  params: { id: string }
}

type SectionKey = (typeof sectionKeys)[number]

export default function PlanDetail({ params }: Props) {
  const [sections, setSections] = useState<Record<SectionKey, string>>({
    objective: "",
    audience: "",
    channels: "",
    kpis: "",
  })
  const [hasGenerated, setHasGenerated] = useState(false)

  useEffect(() => {
    fetch(`/api/plans/${params.id}`)
      .then((res) => res.json())
      .then((data) => setSections((prev) => ({ ...prev, ...data })))
      .catch(() => {})
  }, [params.id])

  const save = async (key: SectionKey, value: string) => {
    setSections((prev) => ({ ...prev, [key]: value }))
    await fetch(`/api/plans/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    })
  }

  const generate = async () => {
    await fetch("/api/generate-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: params.id }),
    })
    setHasGenerated(true)
  }

  const downloadPdf = async () => {
    const res = await fetch("/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: params.id }),
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "plan.pdf"
    a.click()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-foreground">Plan {params.id}</h1>
      {sectionKeys.map((key) => (
        <div key={key}>
          <label className="mb-1 block text-sm capitalize text-foreground">{key}</label>
          <textarea
            className="w-full rounded-md border border-border bg-background p-2 text-foreground"
            value={sections[key]}
            onChange={(e) => setSections((prev) => ({ ...prev, [key]: e.target.value }))}
            onBlur={(e) => save(key, e.target.value)}
          />
        </div>
      ))}
      <div className="pt-2 space-x-2">
        <Button onClick={generate}>Generar plan (7 días)</Button>
        {hasGenerated && (
          <button
            className="inline-flex items-center rounded-md px-4 py-2 bg-primary text-primary-foreground"
            onClick={downloadPdf}
          >
            Descargar PDF
          </button>
        )}
      </div>
    </div>
  )
}
