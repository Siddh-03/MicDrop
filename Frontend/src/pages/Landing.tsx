import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Navbar from "@/components/Navbar"
import { Mic, Users, TrendingUp, ArrowRight, Clock, Vote, Zap } from "lucide-react"
import { Link } from "react-router-dom"

const Landing = () => {
  return (
    <>
      {/* <Navbar /> */}
      <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            MicDrop🎤
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Earn it. Or we'll drop it for you.
          </p>
          <p className="text-lg text-primary-foreground/80 mb-12 max-w-3xl mx-auto">
            Real-time feedback tool for speakers. Get honest, anonymous feedback to improve your presentations and save everyone's time.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-card/10 backdrop-blur-md border-primary-foreground/20 hover:bg-card/15 transition-all duration-300 hover:scale-105 hover:shadow-glow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-primary/20 rounded-full w-fit">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl text-primary-foreground mb-2">For Speakers & Organizers</CardTitle>
              <CardDescription className="text-primary-foreground/80 text-base">
                Create sessions, track engagement, and get real-time feedback during your presentations
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/auth/login">
                <Button variant="speaker" size="lg" className="w-full text-lg py-6">
                  Create a Session
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card/10 backdrop-blur-md border-primary-foreground/20 hover:bg-card/15 transition-all duration-300 hover:scale-105 hover:shadow-glow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-accent/20 rounded-full w-fit">
                <Vote className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl text-primary-foreground mb-2">For Audience Members</CardTitle>
              <CardDescription className="text-primary-foreground/80 text-base">
                Join live sessions and provide anonymous feedback to help speakers improve
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/join">
                <Button variant="audience" size="lg" className="w-full text-lg py-6">
                  Join a Session
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-12">
            How MicDrop Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-6 p-4 bg-primary-foreground/10 rounded-full w-fit backdrop-blur-sm">
                <Mic className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-primary-foreground mb-3">1. Create</h3>
              <p className="text-primary-foreground/80">
                Speakers set up a session with a grace period and get a unique code
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 p-4 bg-primary-foreground/10 rounded-full w-fit backdrop-blur-sm">
                <Vote className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-primary-foreground mb-3">2. Vote</h3>
              <p className="text-primary-foreground/80">
                Audience members join anonymously and vote "Engaged" or "Losing Me"
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 p-4 bg-primary-foreground/10 rounded-full w-fit backdrop-blur-sm">
                <TrendingUp className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-primary-foreground mb-3">3. React</h3>
              <p className="text-primary-foreground/80">
                Speakers get real-time feedback and alerts when engagement drops
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-card/5 backdrop-blur-sm border-primary-foreground/10 text-center">
            <CardContent className="pt-6">
              <Clock className="h-8 w-8 text-primary-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary-foreground mb-2">Grace Period</h3>
              <p className="text-primary-foreground/70 text-sm">
                Set a buffer time before feedback starts
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/5 backdrop-blur-sm border-primary-foreground/10 text-center">
            <CardContent className="pt-6">
              <Zap className="h-8 w-8 text-primary-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary-foreground mb-2">Real-time</h3>
              <p className="text-primary-foreground/70 text-sm">
                Instant feedback as your talk progresses
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/5 backdrop-blur-sm border-primary-foreground/10 text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-primary-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary-foreground mb-2">Anonymous</h3>
              <p className="text-primary-foreground/70 text-sm">
                Honest feedback without fear of judgment
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 px-6 border-t border-primary-foreground/10">
        <div className="flex justify-center gap-8">
          <Link to="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
            About
          </Link>
          <Link to="/faq" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
            FAQ
          </Link>
        </div>
        <p className="text-primary-foreground/60 text-sm mt-4">
          © 2024 MicDrop. Improving presentations, one feedback at a time.
        </p>
      </footer>
    </div>
    </>
  )
}

export default Landing