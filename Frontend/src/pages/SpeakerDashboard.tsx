import { useEffect, useState, useRef } from "react"; // Import useRef
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Mic,
  Users,
  Play,
  QrCode,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Square,
  Loader2,
  XCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface SessionDetails {
  _id: string;
  title: string;
  sessionCode: string;
  status: "upcoming" | "active" | "completed";
  scheduledFor: string;
  gracePeriod: number;
}

const SpeakerDashboard = () => {
  const { sessionCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ✅ Use a ref to hold the socket instance.
  // This ensures the same socket connection is used across all re-renders.
  const socketRef = useRef<Socket | null>(null);

  const [session, setSession] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [audienceCount, setAudienceCount] = useState(0);
  const [positiveVotes, setPositiveVotes] = useState(0);
  const [negativeVotes, setNegativeVotes] = useState(0);
  const [alertTriggered, setAlertTriggered] = useState(false);

  const totalVotes = positiveVotes + negativeVotes;
  const positivePercentage =
    totalVotes > 0 ? Math.round((positiveVotes / totalVotes) * 100) : 0;

  const engagementMessage =
    positivePercentage >= 60
      ? "🎉 Great job! Your audience is highly engaged."
      : positivePercentage >= 40
      ? "👍 Good engagement. Keep it up!"
      : "⚠️ Consider adjusting your approach to re-engage your audience.";

  // This useEffect for fetching data is fine, no changes needed.
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/sessions/${sessionCode}`,
          { credentials: "include" }
        );
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to fetch session.");
        }
        const data: SessionDetails = await response.json();
        setSession(data);
      } catch (err: any) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSessionData();
  }, [sessionCode, toast]);

  useEffect(() => {
    if (session?.status !== "active") {
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io(API_BASE_URL);
      const socket = socketRef.current;

      socket.on("connect", () => {
        console.log("Speaker connected with socket ID:", socket.id);
        socket.emit("join-session", sessionCode);
      });

      socket.on("disconnect", () => {
        console.log("Speaker disconnected from WebSocket.");
      });

      socket.on(
        "update-stats",
        (stats: { audience: number; positive: number; negative: number }) => {
          console.log("[Client] Received update-stats event:", stats);
          // This will now reliably update the state.
          setAudienceCount(stats.audience);
          setPositiveVotes(stats.positive);
          setNegativeVotes(stats.negative);

          const total = stats.positive + stats.negative;
          const score = total > 0 ? (stats.positive / total) * 100 : 0;
          setAlertTriggered(score < 40);
        }
      );
    }

    return () => {
      if (socketRef.current) {
        console.log("Cleanup: Disconnecting socket.");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [session?.status, sessionCode]); 

  const handleStartSession = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/sessions/${sessionCode}/start`,
        { method: "PATCH", credentials: "include" }
      );
      if (!response.ok) throw new Error("Failed to start session.");
      const data = await response.json();
      setSession(data.session);
      toast({ title: "Session is now live!" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  const handleEndSession = async () => {
    if (!window.confirm("End this session? This action is final.")) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/sessions/${sessionCode}/end`,
        { method: "PATCH", credentials: "include" }
      );
      if (!response.ok) throw new Error("Failed to end session.");
      const data = await response.json();
      setSession(data.session);
      toast({ title: "Session has ended." });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  const generateQRCodeUrl = () => {
    const joinUrl = `${window.location.origin}/join?code=${sessionCode}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      joinUrl
    )}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Error: {error || "Could not load session"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/10">
      <main className="max-w-4xl mx-auto p-6">
        {session.status === "upcoming" && (
          <div className="space-y-8 text-center">
            <h2 className="text-3xl font-bold">Session is Ready</h2>
            <p className="text-muted-foreground">Share the code to begin.</p>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-gradient-card border shadow-card">
                <CardHeader className="text-center">
                  <CardTitle>Session Code</CardTitle>
                </CardHeader>
                <CardContent className="p-6 bg-primary/10 rounded-lg text-5xl font-mono font-bold text-primary tracking-widest">
                  {sessionCode}
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border shadow-card">
                <CardHeader className="text-center">
                  <CardTitle>QR Code</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <img
                    src={generateQRCodeUrl()}
                    alt="QR Code"
                    className="w-40 h-40"
                  />
                </CardContent>
              </Card>
            </div>
            <Button
              onClick={handleStartSession}
              variant="hero"
              size="lg"
              className="px-12 py-6 text-lg"
            >
              <Play className="h-5 w-5 mr-2" /> Start Session
            </Button>
          </div>
        )}

        {session.status === "active" && (
          <div className="space-y-8">
            {alertTriggered && (
              <Card className="border-destructive bg-destructive/10">
                <CardContent className="pt-6 flex gap-3 items-start">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-1" />
                  <div>
                    <h4 className="font-semibold text-destructive">
                      Engagement Alert
                    </h4>
                    <p className="text-sm text-destructive/80">
                      Engagement dropped below 40%! Consider re-engaging your
                      audience.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <h2 className="text-3xl font-bold text-center">Session is Live</h2>
            <p className="text-muted-foreground text-center">
              Monitoring audience feedback
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Audience
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{audienceCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Engagement Score
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {positivePercentage}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Votes
                  </CardTitle>
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalVotes}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  Live Engagement Gauge
                </CardTitle>
                <CardDescription className="text-center">
                  Real-time breakdown
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-500/10 rounded-lg text-center">
                    <TrendingUp className="h-4 w-4 text-green-600 mx-auto" />
                    <div className="text-2xl">{positiveVotes}</div>
                    <p className="text-sm text-green-700">Engaged</p>
                  </div>
                  <div className="p-4 bg-red-500/10 rounded-lg text-center">
                    <TrendingDown className="h-4 w-4 text-red-600 mx-auto" />
                    <div className="text-2xl">{negativeVotes}</div>
                    <p className="text-sm text-red-700">Losing Me</p>
                  </div>
                </div>
                <Progress value={positivePercentage} className="h-4" />
                <p className="text-center text-sm text-muted-foreground">
                  {engagementMessage}
                </p>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                onClick={handleEndSession}
                variant="destructive"
                size="lg"
              >
                <Square className="h-5 w-5 mr-2" /> End Session
              </Button>
            </div>
          </div>
        )}

        {session.status === "completed" && (
          <div className="text-center py-16">
            <Card className="max-w-md mx-auto bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl">Session Completed</CardTitle>
                <CardDescription>
                  This session has ended. View analytics in Dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/dashboard")}>
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default SpeakerDashboard;
