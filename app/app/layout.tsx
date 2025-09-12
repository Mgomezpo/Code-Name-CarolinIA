import type { ReactNode } from "react"
import Sidebar from "@/components/Sidebar"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
