import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

export default function TeamPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/workspace/${params.id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workspace
          </Link>
        </Button>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage who has access to this workspace</CardDescription>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Team management coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
