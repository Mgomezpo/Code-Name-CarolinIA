import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Sparkles, Calendar, Users, Zap } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    let { data: workspace } = await supabase.from("workspaces").select("id").eq("owner_id", user.id).single()

    // If no workspace exists, create one automatically
    if (!workspace) {
      const { data: newWorkspace, error: createError } = await supabase
        .from("workspaces")
        .insert({
          name: "My Workspace",
          description: "Your personal media planning workspace",
          owner_id: user.id,
        })
        .select("id")
        .single()

      if (!createError && newWorkspace) {
        workspace = newWorkspace
      }
    }

    if (workspace) {
      redirect(`/workspace/${workspace.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] rounded-lg flex items-center justify-center text-black">
                <span className="text-white font-bold text-sm">IR</span>
              </div>
              <span className="font-bold text-xl text-foreground">Ireal</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] hover:from-[hsl(var(--color-primary))] hover:to-[hsl(var(--color-accent))]"
              >
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--color-primary)/0.1)] via-[hsl(var(--color-accent)/0.1)] to-[hsl(var(--color-destructive)/0.1)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Plataforma con IA para Planes de Medios
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 font-sans">
              Autogestiona tus{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--color-primary))] via-[hsl(var(--color-accent))] to-[hsl(var(--color-destructive))] bg-clip-text text-[rgba(184,0,35,1)]">
                Planes de Medios
              </span>{" "}
              con IA
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto font-serif">
              La plataforma inteligente que permite a creadores de contenido y agencias de marketing digital crear,
              gestionar y publicar campañas completas con ayuda de inteligencia artificial.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[hsl(var(--color-primary))] via-[hsl(var(--color-accent))] to-[hsl(var(--color-destructive))] hover:opacity-90 text-white"
                asChild
              >
                <Link href="/auth/signup">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/auth/login">Ver Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-sans">
              Todo lo que necesitas para tus campañas
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-serif">
              Desde la generación de insights hasta la publicación automática en redes sociales
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="font-sans">Generación con IA</CardTitle>
                <CardDescription className="font-serif">
                  Crea insights, mensajes y acciones automáticamente con inteligencia artificial avanzada
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="font-sans">Calendario Dinámico</CardTitle>
                <CardDescription className="font-serif">
                  Organiza y programa todo tu contenido en un calendario visual e intuitivo
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-sans">Colaboración en Tiempo Real</CardTitle>
                <CardDescription className="font-serif">
                  Trabaja en equipo con sincronización automática y comentarios en vivo
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="font-sans">Publicación Nativa</CardTitle>
                <CardDescription className="font-serif">
                  Publica directamente en Instagram, Facebook y LinkedIn desde la plataforma
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="font-sans">Canvas Visual</CardTitle>
                <CardDescription className="font-serif">
                  Interfaz visual tipo Notion para crear y editar planes de medios intuitivamente
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-sans">Workspace Personal</CardTitle>
                <CardDescription className="font-serif">
                  Tu espacio de trabajo personal donde puedes organizar todos tus proyectos y campañas
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-sans">
            ¿Listo para revolucionar tus planes de medios?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 font-serif">
            Únete a cientos de agencias y creadores que ya están ahorrando tiempo y mejorando sus resultados
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-[hsl(var(--color-primary))] via-[hsl(var(--color-accent))] to-[hsl(var(--color-destructive))] hover:opacity-90 text-white"
            asChild
          >
            <Link href="/auth/signup">
              Comenzar Ahora - Es Gratis
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
