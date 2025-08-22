import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Mic, ThumbsUp, ThumbsDown, Clock, Users, Star } from "lucide-react";
import { useParams } from "react-router-dom";

type VoteType = "positive" | "negative" | null;

const AudienceVoting = () => {
  const { sessionCode } = useParams();
  const [currentVote, setCurrentVote] = useState<VoteType>(null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [graceTimeLeft, setGraceTimeLeft] = useState(3); // 5 minutes in seconds
  const [sessionActive, setSessionActive] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackType, setFeedbackType] = useState<VoteType>(null);
  const [rating, setRating] = useState<string>("");
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);

  useEffect(() => {
    // Simulate grace period countdown
    const timer = setInterval(() => {
      setGraceTimeLeft((prev) => {
        if (prev <= 1) {
          setIsWaiting(false);
          setSessionActive(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVote = (vote: VoteType) => {
    setCurrentVote(vote);
    setFeedbackType(vote);
    setShowFeedbackDialog(true);
    // In a real app, this would send the vote to the backend
  };

  const handleIssueToggle = (issue: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  const submitFeedback = () => {
    if (feedbackType === "positive" && !rating) {
      toast({
        title: "Please provide a rating",
        description: "Rate the speaker from 1 to 5 stars",
        variant: "destructive",
      });
      return;
    }

    if (feedbackType === "negative" && selectedIssues.length === 0) {
      toast({
        title: "Please select feedback",
        description: "Choose at least one area for improvement",
        variant: "destructive",
      });
      return;
    }

    // Submit feedback logic here
    toast({
      title: "Feedback submitted!",
      description:
        feedbackType === "positive"
          ? `Thank you for rating ${rating} stars!`
          : "Your feedback will help the speaker improve.",
    });

    setShowFeedbackDialog(false);
    setRating("");
    setSelectedIssues([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-6 py-8">
        {isWaiting ? (
          /* Waiting State */
          <Card className="bg-gradient-card border shadow-card text-center">
            <CardContent className="pt-8 pb-8">
              <div className="mb-6 p-4 bg-muted/50 rounded-full w-fit mx-auto">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Session Starting Soon</h2>
              <p className="text-muted-foreground mb-6">
                The speaker has a grace period before feedback begins
              </p>

              <div className="space-y-4">
                <div className="text-3xl font-mono font-bold text-primary">
                  {formatTime(graceTimeLeft)}
                </div>
                <Progress
                  value={((300 - graceTimeLeft) / 300) * 100}
                  className="w-full"
                />
              </div>

              <div className="mt-8 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Once the timer ends, you'll be able to provide real-time
                  feedback using the voting buttons below.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Active Voting State */
          <div className="space-y-6">
            <Card className="bg-gradient-card border shadow-card text-center">
              <CardContent className="pt-6 pb-6">
                <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit mx-auto">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">Session Active</h2>
                <p className="text-muted-foreground text-sm">
                  Provide anonymous feedback to help the speaker
                </p>
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
                <ThumbsUp className="h-6 w-6 mr-3" />
                Engaged
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
                <ThumbsDown className="h-6 w-6 mr-3" />
                Losing Me
              </Button>
            </div>

            {/* Info */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4 pb-4">
                <p className="text-sm text-muted-foreground text-center">
                  Your feedback is anonymous and helps the speaker adjust their
                  presentation in real-time. You can change your vote at any
                  time.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {feedbackType === "positive"
                ? "Rate the Speaker"
                : "Help Us Understand"}
            </DialogTitle>
          </DialogHeader>

          {feedbackType === "positive" ? (
            <div className="space-y-6">
              <p className="text-muted-foreground">
                Great! You're engaged. How would you rate this speaker overall?
              </p>

              <RadioGroup value={rating} onValueChange={setRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={star.toString()}
                      id={`star-${star}`}
                    />
                    <Label
                      htmlFor={`star-${star}`}
                      className="flex items-center cursor-pointer"
                    >
                      <div className="flex items-center">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < star
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                        <span className="ml-2">
                          {star} star{star !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-muted-foreground">
                What could the speaker improve? Select all that apply:
              </p>

              <div className="space-y-3">
                {[
                  "Speaking too fast",
                  "Content is unclear",
                  "Not engaging enough",
                ].map((issue) => (
                  <div key={issue} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={issue}
                      checked={selectedIssues.includes(issue)}
                      onChange={() => handleIssueToggle(issue)}
                      className="rounded border border-input"
                    />
                    <Label htmlFor={issue} className="cursor-pointer">
                      {issue}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowFeedbackDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={submitFeedback} className="flex-1">
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AudienceVoting;
