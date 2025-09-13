"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  workspaceId: string
}

function getLinks(id: string) {
  return [
    { href: `/workspace/${id}`, label: "Plan de mercadeo" },
    { href: `/workspace/${id}/settings`, label: "Configuración" },
  ]
}

export default function Sidebar({ workspaceId }: SidebarProps) {
  const pathname = usePathname()
  const links = getLinks(workspaceId)

  return (
    <aside className="w-64 bg-muted border-r border-border p-4">
      <h2 className="text-xl font-semibold mb-6">IREAL</h2>
      <nav className="space-y-2">
        {links.map((l) => {
          const active = pathname === l.href
          return (
            <Link
              key={l.href}
              href={l.href}
              className={
                "block px-3 py-2 rounded-md border border-transparent " +
                (active ? "text-primary" : "text-foreground") +
                " hover:border-primary"
              }
            >
              {l.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
