import React from "react"
import { cn } from "@/lib/utils"

export default function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-md border border-border bg-muted p-4", className)} {...props} />
}
