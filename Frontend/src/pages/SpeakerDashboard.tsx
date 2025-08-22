import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Mic, Users, Play, QrCode, BarChart3, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { useParams } from "react-router-dom"

const SpeakerDashboard = () => {
  const { sessionCode } = useParams()
  const [sessionStarted, setSessionStarted] = useState(false)
  const [audienceCount, setAudienceCount] = useState(3)
  const [positiveVotes, setPositiveVotes] = useState(2)
  const [negativeVotes, setNegativeVotes] = useState(1)
  const [engagementScore, setEngagementScore] = useState(67)
  const [alertTriggered, setAlertTriggered] = useState(false)

  const totalVotes = positiveVotes + negativeVotes
  const positivePercentage = totalVotes > 0 ? (positiveVotes / totalVotes) * 100 : 50

  useEffect(() => {
    if (sessionStarted) {
      // Simulate real-time feedback updates
      const interval = setInterval(() => {
        setAudienceCount(prev => Math.max(1, prev + Math.floor(Math.random() * 3) - 1))
        setPositiveVotes(prev => Math.max(0, prev + Math.floor(Math.random() * 2)))
        setNegativeVotes(prev => Math.max(0, prev + Math.floor(Math.random() * 2)))
        
        const newPositive = positiveVotes + Math.floor(Math.random() * 2)
        const newNegative = negativeVotes + Math.floor(Math.random() * 2)
        const newTotal = newPositive + newNegative
        const newScore = newTotal > 0 ? (newPositive / newTotal) * 100 : 50
        setEngagementScore(Math.round(newScore))
        
        // Trigger alert if engagement drops below 40%
        if (newScore < 40 && !alertTriggered) {
          setAlertTriggered(true)
          // In a real app, this would send a notification/vibration
        }
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [sessionStarted, positiveVotes, negativeVotes, alertTriggered])

  const handleStartSession = () => {
    setSessionStarted(true)
  }

  const generateQRCodeUrl = () => {
    const joinUrl = `${window.location.origin}/join`
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${joinUrl}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mic className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">MicDrop🎤</h1>
              <p className="text-sm text-muted-foreground">Session: {sessionCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={sessionStarted ? "default" : "secondary"}>
              {sessionStarted ? "Live" : "Ready"}
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        {!sessionStarted ? (
          /* Pre-Session State */
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Session Ready to Start</h2>
              <p className="text-muted-foreground">
                Share the session code with your audience and start when ready
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-gradient-card border shadow-card">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">Session Code</CardTitle>
                  <CardDescription>Share this code with your audience</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="p-6 bg-primary/10 rounded-lg">
                    <div className="text-5xl font-mono font-bold text-primary tracking-widest">
                      {sessionCode}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Audience can join at micdrop.app/join
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border shadow-card">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">QR Code</CardTitle>
                  <CardDescription>For easy mobile access</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <img 
                      src={generateQRCodeUrl()} 
                      alt="QR Code for session"
                      className="mx-auto w-32 h-32"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Scan to join the session
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Card className="bg-muted/50 mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-medium">{audienceCount} people waiting</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    People are joining your session. Start when you're ready to begin.
                  </p>
                </CardContent>
              </Card>
              
              <Button 
                onClick={handleStartSession}
                variant="hero"
                size="lg"
                className="px-12 py-6 text-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Session
              </Button>
            </div>
          </div>
        ) : (
          /* Live Session State */
          <div className="space-y-8">
            {/* Alert Banner */}
            {alertTriggered && (
              <Card className="border-destructive bg-destructive/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <div>
                      <h4 className="font-semibold text-destructive">Engagement Alert</h4>
                      <p className="text-sm text-destructive/80">
                        Audience engagement has dropped below 40%. Consider adjusting your approach.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Live Feedback</h2>
              <p className="text-muted-foreground">
                Real-time audience engagement for your presentation
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-card border shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Audience Size</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{audienceCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Active participants
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{engagementScore}%</div>
                  <p className="text-xs text-muted-foreground">
                    Overall positive feedback
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalVotes}</div>
                  <p className="text-xs text-muted-foreground">
                    Feedback responses
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Live Engagement Gauge */}
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-center">Live Engagement Gauge</CardTitle>
                <CardDescription className="text-center">
                  Real-time audience feedback breakdown
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2" style={{ 
                    color: positivePercentage >= 60 ? '#10b981' : positivePercentage >= 40 ? '#f59e0b' : '#ef4444' 
                  }}>
                    {Math.round(positivePercentage)}%
                  </div>
                  <p className="text-muted-foreground">Positive Engagement</p>
                </div>

                <Progress value={positivePercentage} className="h-4" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-500/10 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-green-700">Engaged</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{positiveVotes}</div>
                  </div>
                  <div className="text-center p-4 bg-red-500/10 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="font-semibold text-red-700">Losing Me</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">{negativeVotes}</div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {positivePercentage >= 60 
                      ? "🎉 Great job! Your audience is highly engaged."
                      : positivePercentage >= 40 
                      ? "👍 Good engagement. Keep it up!"
                      : "⚠️ Consider adjusting your approach to re-engage your audience."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

export default SpeakerDashboard