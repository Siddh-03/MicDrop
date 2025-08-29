import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ThumbsUp, ThumbsDown, Clock, Users, Star, Loader2, XCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

type VoteType = "positive" | "negative" | null;

interface SessionDetails {
  title: string;
  status: "waiting" | "active" | "ended";
  scheduledFor: string;
  gracePeriod: number; // in minutes
}

const AudienceVoting = () => {
  const { sessionCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [session, setSession] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [graceTimeLeft, setGraceTimeLeft] = useState(0);
  const [currentVote, setCurrentVote] = useState<VoteType>(null);
  const [feedbackType, setFeedbackType] = useState<VoteType>(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  
  const [rating, setRating] = useState<string>("");
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);

  // 🔹 Fetch session details from backend
  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/sessions/public/${sessionCode}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Could not find session.");
        }
        const data: SessionDetails = await response.json();

        if (data.status === "ended") {
          throw new Error("This session has already ended.");
        }

        setSession(data);

        // Grace countdown
        const scheduledTime = new Date(data.scheduledFor).getTime();
        const gracePeriodMillis = data.gracePeriod * 60 * 1000;
        const endTime = scheduledTime + gracePeriodMillis;
        const timeLeft = Math.max(0, Math.round((endTime - Date.now()) / 1000));
        setGraceTimeLeft(timeLeft);
      } catch (err: any) {
        setError(err.message);
        toast({ variant: "destructive", title: "Error", description: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionCode, navigate, toast]);

  // 🔹 Grace countdown updater
  useEffect(() => {
    if (session?.status === "waiting" && graceTimeLeft > 0) {
      const timer = setInterval(() => {
        setGraceTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [session, graceTimeLeft]);

  // Helpers
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle voting
  const handleVote = (vote: VoteType) => {
    setCurrentVote(vote);
    setFeedbackType(vote);
    setShowFeedbackDialog(true);
    // TODO: WebSocket send to backend
  };

  const handleIssueToggle = (issue: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  // Handle feedback submit
  const submitFeedback = () => {
    if (feedbackType === "positive" && !rating) {
      toast({ variant: "destructive", title: "Please provide a rating", description: "Rate from 1–5" });
      return;
    }

    if (feedbackType === "negative" && selectedIssues.length === 0) {
      toast({ variant: "destructive", title: "Please select at least one issue" });
      return;
    }

    toast({
      title: "Feedback submitted!",
      description:
        feedbackType === "positive"
          ? `Thanks for rating ${rating} stars!`
          : "Your feedback will help improve.",
    });

    setShowFeedbackDialog(false);
    setRating("");
    setSelectedIssues([]);
  };

  // UI States
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-gradient-card border shadow-card text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mb-6 p-4 bg-destructive/20 rounded-full w-fit mx-auto">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate("/join")}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isWaiting = session?.status === "waiting" && graceTimeLeft > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      <main className="max-w-lg mx-auto px-6 py-8">
        {isWaiting ? (
          // 🟡 Waiting State
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
                <Progress
                  value={((session.gracePeriod * 60 - graceTimeLeft) / (session.gracePeriod * 60)) * 100}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          // 🟢 Active Voting State
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
                      <span className="font-semibold">
                        {currentVote === "positive" ? "Engaged" : "Losing Me"}
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voting Buttons */}
            <div className="grid grid-cols-1 gap-4">
              <Button
                onClick={() => handleVote("positive")}
                variant={currentVote === "positive" ? "default" : "outline"}
                size="lg"
                className={`py-8 text-lg font-semibold transition-all ${
                  currentVote === "positive"
                    ? "bg-green-500 hover:bg-green-600 text-white shadow-lg"
                    : "hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                }`}
              >
                <ThumbsUp className="h-6 w-6 mr-3" /> Engaged
              </Button>
              <Button
                onClick={() => handleVote("negative")}
                variant={currentVote === "negative" ? "destructive" : "outline"}
                size="lg"
                className={`py-8 text-lg font-semibold transition-all ${
                  currentVote === "negative"
                    ? "shadow-lg"
                    : "hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                }`}
              >
                <ThumbsDown className="h-6 w-6 mr-3" /> Losing Me
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {feedbackType === "positive" ? "Rate the Speaker" : "Help Us Understand"}
            </DialogTitle>
          </DialogHeader>

          {feedbackType === "positive" ? (
            // ⭐ Positive Feedback
            <div className="space-y-6">
              <p className="text-muted-foreground">How would you rate this speaker overall?</p>
              <RadioGroup value={rating} onValueChange={setRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="flex items-center space-x-2">
                    <RadioGroupItem value={star.toString()} id={`star-${star}`} />
                    <Label htmlFor={`star-${star}`} className="flex items-center cursor-pointer">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                        <span className="ml-2">{star} star{star !== 1 ? "s" : ""}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ) : (
            // ❌ Negative Feedback
            <div className="space-y-6">
              <p className="text-muted-foreground">What could the speaker improve? Select all that apply:</p>
              <div className="space-y-3">
                {["Speaking too fast", "Content is unclear", "Not engaging enough"].map((issue) => (
                  <div key={issue} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={issue}
                      checked={selectedIssues.includes(issue)}
                      onChange={() => handleIssueToggle(issue)}
                      className="rounded border border-input"
                    />
                    <Label htmlFor={issue} className="cursor-pointer">{issue}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={submitFeedback} className="flex-1">Submit</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AudienceVoting;
