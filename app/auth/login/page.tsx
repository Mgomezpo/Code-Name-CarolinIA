"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      setIsLoading(true)
      setError?.(null) // opcional si tienes estado de error

      // 1) Login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw new Error(`Auth: ${signInError.message}`)

      // 2) Obtener usuario
      const { data: userData, error: getUserError } = await supabase.auth.getUser()
      if (getUserError) throw new Error(`GetUser: ${getUserError.message}`)

      const user = userData?.user
      if (!user) throw new Error("User not found after sign-in")

      // 3) Buscar workspace (no falla si no existe)
      let { data: workspace, error: wsSelectError } = await supabase
        .from("workspaces")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle()

      if (wsSelectError) throw new Error(`Workspaces select: ${wsSelectError.message}`)

      // 4) Crear si no existe
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

        if (createError) throw new Error(`Workspaces insert: ${createError.message}`)
        workspace = newWorkspace
      }

      // 5) Navegar
      if (!workspace?.id) throw new Error("Workspace id missing")
      router.push(`/workspace/${workspace.id}`)
    } catch (error: unknown) {
      console.error(error)
      setError?.(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading?.(false)
    }
  } // Added missing closing brace for handleLogin function

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-orange-50 to-red-50 p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 to-orange-500 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">MP</span>
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-900">Welcome back</CardTitle>
            <CardDescription className="text-gray-600">Sign in to your MediaPlan AI account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
              </div>
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>
              )}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
