import React from "react"
import { cn } from "@/lib/utils"

export default function Button(
  { className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      className={cn(
        "inline-flex items-center rounded-md border border-border px-4 py-2 bg-transparent text-foreground transition-colors hover:bg-primary hover:text-primary-foreground",
        className,
      )}
      {...props}
    />
  )
}
