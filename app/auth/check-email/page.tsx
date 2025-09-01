import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail } from "lucide-react"

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--color-primary)/0.1)] via-[hsl(var(--color-accent)/0.1)] to-[hsl(var(--color-destructive)/0.1)] p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-900">Check your email</CardTitle>
            <CardDescription className="text-gray-600">
              We've sent you a confirmation link to complete your registration.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Click the link in your email to verify your account and start using Ireal.
            </p>
            <div className="pt-4">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/auth/login">Back to sign in</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
