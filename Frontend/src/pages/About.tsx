import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ThemeToggle } from "@/components/theme-toggle"
import { Mic, ArrowLeft, Target, Users, Zap, Shield, Clock, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"

const About = () => {
  const faqs = [
    {
      question: "Is the feedback really anonymous?",
      answer: "Yes, absolutely. MicDrop doesn't collect any personal information from audience members. No names, emails, or login required. Participants simply join with a session code and vote anonymously."
    },
    {
      question: "Isn't this mean to speakers?",
      answer: "Not at all! MicDrop is designed to help speakers improve. The feedback is constructive and private - only the speaker sees the real-time data. It's about saving everyone's time and making presentations more effective."
    },
    {
      question: "How does the grace period work?",
      answer: "Speakers set a grace period (5-30 minutes) when creating a session. During this time, the audience can join but can't vote yet. This gives speakers time to find their rhythm before feedback begins."
    },
    {
      question: "What happens when engagement drops?",
      answer: "When negative feedback reaches a threshold (typically 60% 'Losing Me' votes), the speaker gets a private alert. This could be a subtle vibration or visual cue - only they know about it."
    },
    {
      question: "Can I use this for any type of presentation?",
      answer: "Yes! MicDrop works for business presentations, lectures, workshops, training sessions, conference talks, and any speaking engagement where audience feedback is valuable."
    },
    {
      question: "Do I need to install an app?",
      answer: "No apps required! MicDrop works entirely in your web browser. Speakers and audience members can access everything through their mobile browser or computer."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/10">
      

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* About Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-6">About MicDrop🎤</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Revolutionizing presentations through honest, real-time feedback. 
            Because time is precious, and great speaking skills are built on truth.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="bg-gradient-card border shadow-card mb-12">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-primary/20 rounded-full w-fit">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Our Mission</CardTitle>
            <CardDescription>
              Save time and improve public speaking through honest feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground leading-relaxed">
              We believe that everyone deserves honest feedback to improve their communication skills. 
              Traditional presentation feedback is often delayed, sugar-coated, or non-existent. 
              MicDrop changes that by providing real-time, anonymous feedback that helps speakers 
              adjust on-the-fly and audiences stay engaged.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Save Time</h3>
                <p className="text-sm text-muted-foreground">
                  No more sitting through disengaging presentations
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Improve Skills</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time feedback leads to immediate improvement
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Safe Space</h3>
                <p className="text-sm text-muted-foreground">
                  Anonymous feedback creates honest communication
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Helps Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gradient-card border shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-6 w-6 text-primary" />
                <CardTitle>For Speakers</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">Get immediate feedback during your presentation</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">Adjust your approach when engagement drops</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">Build confidence with positive feedback</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">Track improvement over multiple sessions</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-6 w-6 text-accent-foreground" />
                <CardTitle>For Audiences</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">Provide honest feedback without fear of judgment</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">Help speakers improve in real-time</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">Contribute to better presentations for everyone</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">No signup required - just join and vote</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="bg-gradient-card border shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Frequently Asked Questions</CardTitle>
            <CardDescription className="text-center">
              Everything you need to know about MicDrop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Presentations?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of speakers who are already using MicDrop to improve their communication skills.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/">
              <Button variant="hero" size="lg">
                Get Started
              </Button>
            </Link>
            <Link to="/join">
              <Button variant="outline" size="lg">
                Join a Session
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default About