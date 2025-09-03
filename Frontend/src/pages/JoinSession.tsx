import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const JoinSession = () => {
  const [sessionCode, setSessionCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleJoinSession = async () => {
    if (!sessionCode.trim() || sessionCode.length < 6) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/sessions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join session.');
      }

      navigate(`/session/${data.sessionCode}/voting`);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Could not join session",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      <main className="max-w-md mx-auto px-6 py-12">
        <Card className="bg-gradient-card border shadow-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-accent/20 rounded-full w-fit">
              <Users className="h-8 w-8 text-accent-foreground" />
            </div>
            <CardTitle className="text-2xl mb-2">Join Session</CardTitle>
            <CardDescription>
              Enter the 6-digit code from the speaker to join.
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
                placeholder="123ABC"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                className="text-center text-lg tracking-widest font-mono"
                maxLength={6}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinSession()}
              />
            </div>
            
            <Button 
              onClick={handleJoinSession}
              disabled={sessionCode.length < 6 || isLoading}
              variant="audience"
              size="lg"
              className="w-full"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Validating...' : 'Join Session'}
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

export default JoinSession;