import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { Mic, ArrowLeft, Users } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

const JoinSession = () => {
  const [sessionCode, setSessionCode] = useState("")
  const navigate = useNavigate()

  const handleJoinSession = () => {
    if (sessionCode.trim()) {
      // In a real app, this would validate the session code
      navigate(`/session/${sessionCode}/voting`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      {/* Header */}
      

      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 py-12">
        <Card className="bg-gradient-card border shadow-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-accent/20 rounded-full w-fit">
              <Users className="h-8 w-8 text-accent-foreground" />
            </div>
            <CardTitle className="text-2xl mb-2">Join Session</CardTitle>
            <CardDescription>
              Enter the session code provided by the speaker to join the live feedback session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sessionCode" className="text-sm font-medium">
                Session Code
              </Label>
              <Input
                id="sessionCode"
                type="text"
                placeholder="Enter 6-digit code (e.g., ABC123)"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                className="text-center text-lg tracking-widest font-mono"
                maxLength={6}
              />
            </div>
            
            <Button 
              onClick={handleJoinSession}
              disabled={sessionCode.length < 6}
              variant="audience"
              size="lg"
              className="w-full"
            >
              Join Session
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Don't have a session code?
              </p>
              <Link to="/" className="text-primary hover:underline text-sm">
                Ask the speaker for the code
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-8 bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold mb-2">How it works</h3>
              <p className="text-sm text-muted-foreground">
                Once you join, you'll be able to provide anonymous feedback during the presentation. 
                Vote "Engaged" when you're following along or "Losing Me" when you need clarification.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default JoinSession