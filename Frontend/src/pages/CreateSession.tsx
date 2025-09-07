import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import { Mic, ArrowLeft, Clock, Settings, CheckCircle, Calendar } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "@/components/ui/use-toast"

const API_BASE_URL = import.meta.env.VITE_API_URL;

const CreateSession = () => {
  const [sessionTitle, setSessionTitle] = useState("")
  const [gracePeriod, setGracePeriod] = useState("15")
  const [sessionDate, setSessionDate] = useState("")
  const [sessionTime, setSessionTime] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [sessionCreated, setSessionCreated] = useState(false)
  const [sessionCode, setSessionCode] = useState("")
  const navigate = useNavigate()
  const { toast } = useToast()

  // Date/Time validation logic
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1);
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);
  const minTime = useMemo(() => {
    return sessionDate === today ? currentTime : "";
  }, [sessionDate, today, currentTime]);

  const handleCreateSession = async () => {
    setIsCreating(true)
    const scheduledFor = new Date(`${sessionDate}T${sessionTime}`);

    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: sessionTitle, 
          scheduledFor: scheduledFor.toISOString(),
          gracePeriod: gracePeriod 
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create session.');
      }

      setSessionCode(data.sessionCode); 
      setSessionCreated(true);
      toast({ title: "Success!", description: "Session created successfully." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message,
      });
    } finally {
      setIsCreating(false);
    }
  }

  const handleStartSession = () => {
    navigate(`/session/${sessionCode}/dashboard`)
  }

  if (sessionCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/10">
        <main className="max-w-lg mx-auto px-6 py-8">
          <Card className="bg-gradient-card border shadow-glow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-green-500/20 rounded-full w-fit">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-600">Session Created!</CardTitle>
              <CardDescription>
                Your session "{sessionTitle}" is ready to go
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Session Code</p>
                <div className="text-4xl font-mono font-bold text-primary tracking-widest">
                  {sessionCode}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Share this code with your audience
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Grace Period:</span>
                  <span className="font-medium">{gracePeriod} minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-yellow-600">Waiting to start</span>
                </div>
              </div>
              <Button 
                onClick={handleStartSession}
                variant="hero"
                size="lg"
                className="w-full"
              >
                Go to Live Dashboard
              </Button>
              <div className="text-center">
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary">
                  Back to Dashboard
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/10">
      
      <main className="max-w-lg mx-auto px-6 py-8">
        <Card className="bg-gradient-card border shadow-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-primary/20 rounded-full w-fit">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Create New Session</CardTitle>
            <CardDescription>
              Set up your presentation for real-time audience feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sessionTitle">Session Title</Label>
              <Input
                id="sessionTitle"
                type="text"
                placeholder="e.g., Product Launch Presentation"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="sessionDate">Date</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="sessionDate" type="date" className="pl-10" value={sessionDate} min={today} onChange={(e) => setSessionDate(e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sessionTime">Time</Label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="sessionTime" type="time" className="pl-10" value={sessionTime} min={minTime} onChange={(e) => setSessionTime(e.target.value)} />
                    </div>
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gracePeriod">Grace Period</Label>
              <Select value={gracePeriod} onValueChange={setGracePeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="20">20 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm mb-1">How it works</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>1. Your session gets a unique 6-digit code</li>
                    <li>2. Audience joins using the code</li>
                    <li>3. Grace period gives you time to start</li>
                    <li>4. Real-time feedback begins automatically</li>
                  </ul>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleCreateSession}
              disabled={!sessionTitle.trim() || !sessionDate || !sessionTime || isCreating}
              variant="speaker"
              size="lg"
              className="w-full"
            >
              {isCreating ? "Creating Session..." : "Create Session"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default CreateSession
