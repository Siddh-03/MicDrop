import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Mic, Menu, LogOut, User, LayoutDashboard } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { authState, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()



  const isActive = (path: string) => location.pathname === path

  const handleLogout = async () => {
    await logout()
    
    navigate('/auth/login')
  }
  const isAuthenticated = authState?.status === 'authenticated' 

  const navItems = isAuthenticated
    ? [
        { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
        { label: "Join Session", path: "/join" },
        { label: "About", path: "/about" },
      ]
    : [
        { label: "Home", path: "/" },
        { label: "Join Session", path: "/join" },
        { label: "About", path: "/about" },
      ];

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-primary/10 rounded-lg"><Mic className="h-6 w-6 text-primary" /></div>
            <span className="text-xl font-bold text-foreground">MicDrop🎤</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Link to="/auth/login">
                <Button variant="default" size="sm" className={isActive("/auth/login") ? "bg-primary text-primary-foreground" : ""}>
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <Button variant="outline" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Link to="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="default" className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
