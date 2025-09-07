import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Trash2,
  Edit,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- INTERFACES ---
interface UserData {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
}
interface SessionData {
  _id: string;
  title: string;
  sessionCode: string;
  status: "upcoming" | "active" | "completed";
  scheduledFor: string;
  gracePeriod: string;
}

const Dashboard = () => {
  // --- HOOKS ---
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- STATE ---
  const [user, setUser] = useState<UserData | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllSessions, setShowAllSessions] = useState(false); // NEW: State for "View All" button

  // State for the update modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionData | null>(
    null
  );
  const [updatedTitle, setUpdatedTitle] = useState("");
  const [updatedDate, setUpdatedDate] = useState("");
  const [updatedTime, setUpdatedTime] = useState("");
  const [updatedGracePeriod, setUpdatedGracePeriod] = useState("15");

  // --- DERIVED STATE & MEMOS ---
  const today = new Date().toISOString().split("T")[0];
  const minTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    const currentTime = now.toTimeString().split(" ")[0].substring(0, 5);
    return updatedDate === today ? currentTime : "";
  }, [updatedDate, today]);

  // NEW: Memoized list of sessions to display based on the "View All" state
  const displayedSessions = useMemo(() => {
    const sortedSessions = [...sessions].sort(
      (a, b) =>
        new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime()
    );
    return showAllSessions ? sortedSessions : sortedSessions.slice(0, 3);
  }, [sessions, showAllSessions]);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: "include",
        });
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            navigate("/auth/login");
            return;
          }
          throw new Error("Authentication check failed.");
        }
        const userData: UserData = await userResponse.json();
        setUser(userData);

        const sessionsResponse = await fetch(`${API_BASE_URL}/api/sessions`, {
          credentials: "include",
        });
        if (!sessionsResponse.ok) throw new Error("Failed to fetch sessions.");
        const sessionsData: SessionData[] = await sessionsResponse.json();
        setSessions(sessionsData);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load dashboard data. Please log in again.",
        });
        navigate("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, toast]);

  // --- EVENT HANDLERS ---
  const handleDeleteSession = async (
    event: React.MouseEvent,
    sessionId: string
  ) => {
    event.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this session?"))
      return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/sessions/${sessionId}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete session.");
      }
      setSessions(sessions.filter((session) => session._id !== sessionId));
      toast({ title: "Success", description: "Session deleted." });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleUpdateSession = async () => {
    if (!editingSession) return;
    const scheduledFor = new Date(`${updatedDate}T${updatedTime}`);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/sessions/${editingSession._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: updatedTitle,
            scheduledFor: scheduledFor.toISOString(),
            gracePeriod: updatedGracePeriod,
          }),
          credentials: "include",
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update session.");
      }
      const updatedSessionData = await response.json();
      setSessions(
        sessions.map((s) =>
          s._id === editingSession._id ? updatedSessionData : s
        )
      );
      setIsModalOpen(false);
      setEditingSession(null);
      toast({ title: "Success", description: "Session updated." });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const openUpdateModal = (event: React.MouseEvent, session: SessionData) => {
    event.stopPropagation();
    setEditingSession(session);
    setUpdatedTitle(session.title);
    setUpdatedGracePeriod(session.gracePeriod);
    const sessionDate = new Date(session.scheduledFor);
    setUpdatedDate(sessionDate.toISOString().split("T")[0]);
    setUpdatedTime(sessionDate.toTimeString().split(" ")[0].substring(0, 5));
    setIsModalOpen(true);
  };

  const handleSessionClick = (session: SessionData) => {
    if (session.status === "completed") {
      toast({
        title: "Session Completed",
        description: "This session has already ended and cannot be accessed.",
      });
      return;
    }
    navigate(`/session/${session.sessionCode}/dashboard`);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Dashboard...
      </div>
    );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/10">
        <main className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, {user?.username}!
            </h2>
            <p className="text-muted-foreground">
              Manage your speaking sessions and track your presentation
              improvements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sessions
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sessions.length}</div>
                <p className="text-xs text-muted-foreground">
                  All time presentations
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Engagement
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0%</div>
                <p className="text-xs text-muted-foreground">No data yet</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Audience
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No data yet</p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Link to="/create-session">
  <Card className="bg-card text-card-foreground dark:bg-gradient-primary dark:text-primary-foreground hover:shadow-glow transition-all duration-300 hover:scale-105 cursor-pointer">
    <CardContent className="pt-6">
      <div className="flex items-center gap-4">
        {/* Icon Background */}
        <div className="p-3 bg-primary/10 dark:bg-white/20 rounded-lg">
          {/* Icon Color */}
          <Plus className="h-6 w-6 text-primary dark:text-primary-foreground" />
        </div>
        <div>
          <h4 className="font-semibold">Create New Session</h4>
          <p className="text-sm text-muted-foreground">
            Start a new presentation feedback session
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</Link>
              <Card className="bg-accent text-accent-foreground hover:shadow-card transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent-foreground/10 rounded-lg">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold">View Analytics</h4>
                      <p className="text-sm opacity-90">
                        Analyze your speaking performance
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Recent Sessions</h3>
              {sessions.length > 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllSessions(!showAllSessions)}
                >
                  {showAllSessions ? "Show Less" : "View All"}
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {displayedSessions.length > 0 ? (
                displayedSessions.map((session) => (
                  <Card
                    key={session._id}
                    className="bg-gradient-card border shadow-card hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => handleSessionClick(session)}
                  >
                    <CardContent className="pt-6 flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{session.title}</h4>
                        <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(session.scheduledFor).toLocaleString([], {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </div>
                          <Badge
                            variant={
                              session.status === "active"
                                ? "destructive"
                                : session.status === "upcoming"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {session.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Grace: {session.gracePeriod} min
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4 hidden sm:block">
                          <p className="text-sm text-muted-foreground">
                            Session Code
                          </p>
                          <p className="text-2xl font-bold text-primary">
                            {session.sessionCode}
                          </p>
                        </div>
                        {session.status === "upcoming" && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => openUpdateModal(e, session)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={(e) => handleDeleteSession(e, session._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-gradient-card border shadow-card text-center">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">
                      You have no recent sessions.
                    </p>
                    <Link to="/create-session">
                      <Button variant="link" className="mt-2">
                        Create one now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Session</DialogTitle>
            <DialogDescription>
              Make changes to your upcoming session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={updatedTitle}
                onChange={(e) => setUpdatedTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={updatedDate}
                min={today}
                onChange={(e) => setUpdatedDate(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={updatedTime}
                min={minTime}
                onChange={(e) => setUpdatedTime(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gracePeriod" className="text-right">
                Grace Period
              </Label>
              <Select
                value={updatedGracePeriod}
                onValueChange={setUpdatedGracePeriod}
              >
                <SelectTrigger className="col-span-3">
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
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSession}
              variant="outline"
              disabled={!updatedTitle.trim() || !updatedDate || !updatedTime}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard;
