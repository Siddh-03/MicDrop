import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ThumbsUp, ThumbsDown, Clock, Users, Star, Loader2, XCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL;

type VoteType = "positive" | "negative";

interface SessionDetails {
  title: string;
  status: "upcoming" | "active" | "completed"; // Note: Your backend uses 'upcoming', let's align
  scheduledFor: string;
  gracePeriod: number; // in minutes
}

const AudienceVoting = () => {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Stable reference to the WebSocket connection
  const socketRef = useRef<Socket | null>(null);

  // State for session data and connection status
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // State for UI interaction
  const [graceTimeLeft, setGraceTimeLeft] = useState(0);
  const [currentVote, setCurrentVote] = useState<VoteType | null>(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  
  // State for the feedback dialog itself
  const [feedbackType, setFeedbackType] = useState<VoteType | null>(null);
  const [rating, setRating] = useState<string>("");
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);

  // Main useEffect to fetch data and connect to WebSocket
  useEffect(() => {
    // Step 1: Fetch initial session details to validate
    fetch(`${API_BASE_URL}/api/sessions/public/${sessionCode}`)
      .then(res => {
        if (!res.ok) return res.json().then(err => Promise.reject(new Error(err.message || "Session not found.")));
        return res.json();
      })
      .then((data: SessionDetails) => {
        if (data.status === "completed") {
          throw new Error("This session has already ended.");
        }
        setSession(data);

        // Step 2: If session is valid, connect the WebSocket
        const socket = io(`${API_BASE_URL}`);
        socketRef.current = socket;

        socket.on('connect', () => {
          console.log(`[Audience] Connected to WebSocket with ID: ${socket.id}`);
          setConnectionStatus('connected');
          socket.emit('join-session', sessionCode);
        });
        
        // Listen for the speaker to start the session
        socket.on('session-started', () => {
            console.log('[Audience] Session has started!');
            setSession(prev => prev ? { ...prev, status: 'active' } : null);
        });

        // Listen for the speaker to end the session
        socket.on('session-ended', () => {
          setErrorMessage("The speaker has ended this session.");
          setConnectionStatus('error');
          socket.disconnect();
        });

        // Set up countdown timer if session is upcoming
        if (data.status === 'upcoming') {
            const scheduledTime = new Date(data.scheduledFor).getTime();
            const gracePeriodMillis = data.gracePeriod * 60 * 1000;
            const endTime = scheduledTime + gracePeriodMillis;
            const timeLeft = Math.max(0, Math.round((endTime - Date.now()) / 1000));
            setGraceTimeLeft(timeLeft);
        }
      })
      .catch(err => {
        setErrorMessage(err.message);
        setConnectionStatus('error');
      });

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [sessionCode]);

  // 🔹 Grace countdown timer
  useEffect(() => {
    if (session?.status === "upcoming" && graceTimeLeft > 0) {
      const timer = setInterval(() => {
        setGraceTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [session, graceTimeLeft]);

  // Handle voting and open feedback dialog
  const handleVote = (vote: VoteType) => {
    if (socketRef.current?.connected) {
      // Send the simple vote immediately
      socketRef.current.emit('submit-vote', { sessionCode, voteType: vote });
      
      // Update UI and open dialog for more feedback
      setCurrentVote(vote);
      setFeedbackType(vote);
      setShowFeedbackDialog(true);
    }
  };
  
  // Handle detailed feedback submission from the dialog
  const submitFeedback = () => {
    if (feedbackType === "positive" && !rating) {
      toast({ variant: "destructive", title: "Please provide a rating" });
      return;
    }
    if (feedbackType === "negative" && selectedIssues.length === 0) {
      toast({ variant: "destructive", title: "Please select at least one issue" });
      return;
    }

    // Send detailed feedback to the server
    if (socketRef.current?.connected) {
        socketRef.current.emit('submit-feedback', {
            sessionCode,
            feedbackType,
            details: feedbackType === 'positive' ? { rating } : { issues: selectedIssues }
        });
    }

    toast({ title: "Feedback submitted!", description: "Thank you for your input." });
    setShowFeedbackDialog(false);
    setRating("");
    setSelectedIssues([]);
  };

  const handleIssueToggle = (issue: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // --- RENDER STATES ---

  if (connectionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading session...</p>
      </div>
    );
  }

  if (connectionStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-gradient-card border shadow-card text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mb-6 p-4 bg-destructive/20 rounded-full w-fit mx-auto">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p className="text-muted-foreground mb-6">{errorMessage}</p>
            <Button onClick={() => navigate("/join")}>Join Another Session</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isWaiting = session?.status === "upcoming" && graceTimeLeft > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      <main className="max-w-lg mx-auto px-6 py-8">
        {isWaiting ? (
          <Card className="bg-gradient-card border shadow-card text-center">
            <CardContent className="pt-8 pb-8">
              <div className="mb-6 p-4 bg-muted/50 rounded-full w-fit mx-auto">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{session?.title}</h2>
              <p className="text-muted-foreground mb-6">Session will begin shortly...</p>
              <div className="space-y-4">
                <div className="text-3xl font-mono font-bold text-primary">
                  {formatTime(graceTimeLeft)}
                </div>
                {session && <Progress
                  value={((session.gracePeriod * 60 - graceTimeLeft) / (session.gracePeriod * 60)) * 100}
                  className="w-full"
                />}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="bg-gradient-card border shadow-card text-center">
              <CardContent className="pt-6 pb-6">
                <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit mx-auto">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">{session?.title} is Live!</h2>
                <p className="text-muted-foreground text-sm">Provide anonymous real-time feedback</p>
                {currentVote && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm">
                      Your current feedback:{" "}
                      <span className="font-semibold capitalize">
                        {currentVote}
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              <Button onClick={() => handleVote("positive")} variant="outline"/* ... your styling ... */ >
                <ThumbsUp className="h-6 w-6 mr-3" /> Engaged
              </Button>
              <Button onClick={() => handleVote("negative")} variant="destructive" /* ... your styling ... */ >
                <ThumbsDown className="h-6 w-6 mr-3" /> Losing Me
              </Button>
            </div>
          </div>
        )}
      </main>

      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {feedbackType === "positive" ? "Rate the Speaker" : "Help Us Understand"}
            </DialogTitle>
          </DialogHeader>
          {feedbackType === "positive" ? (
             <div className="space-y-6 py-4">
                <p className="text-muted-foreground">How would you rate this speaker overall?</p>
                <RadioGroup value={rating} onValueChange={setRating} className="space-y-2">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <div key={star} className="flex items-center space-x-3">
                     <RadioGroupItem value={star.toString()} id={`star-${star}`} />
                     <Label htmlFor={`star-${star}`} className="flex items-center cursor-pointer text-base">
                       {Array.from({ length: 5 }).map((_, i) => (
                         <Star key={i} className={`h-5 w-5 ${ i < star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground" }`}/>
                       ))}
                       <span className="ml-3">{star} star{star > 1 ? 's' : ''}</span>
                     </Label>
                   </div>
                 ))}
               </RadioGroup>
             </div>
          ) : (
            <div className="space-y-6 py-4">
              <p className="text-muted-foreground">What could the speaker improve? Select all that apply:</p>
              <div className="space-y-3">
                {["Speaking too fast", "Content is unclear", "Not engaging enough"].map((issue) => (
                  <div key={issue} className="flex items-center space-x-3">
                    <input type="checkbox" id={issue} checked={selectedIssues.includes(issue)} onChange={() => handleIssueToggle(issue)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                    <Label htmlFor={issue} className="cursor-pointer text-base">{issue}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)} className="flex-1">Cancel</Button>
            <Button onClick={submitFeedback} className="flex-1" variant="ghost">Submit Feedback</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AudienceVoting;