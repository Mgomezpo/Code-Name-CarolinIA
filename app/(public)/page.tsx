import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <Link
        href="/auth/login"
        className="inline-flex items-center rounded-md border border-border px-4 py-2 bg-transparent text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        Entrar
      </Link>
    </div>
  )
}
