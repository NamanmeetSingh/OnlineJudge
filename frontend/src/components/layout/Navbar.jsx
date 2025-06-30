"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  Code, 
  Trophy, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  Bell,
  Shield
} from "lucide-react"

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Prevent hydration mismatch by only checking auth after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    // This would typically check JWT token or session
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      if (token) {
        setIsAuthenticated(true)
        setUser({
          name: "John Doe",
          email: "john@example.com",
          avatar: "/api/placeholder/40/40",
          role: "user", // or "admin"
          points: 1250
        })
      }
    }
    checkAuth()
  }, [mounted])

  const handleLogout = () => {
    if (!mounted) return
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUser(null)
    router.push('/')
  }

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link 
        href="/problems" 
        className={`${mobile ? 'block py-2' : ''} text-foreground hover:text-primary transition-colors`}
        onClick={() => mobile && setIsOpen(false)}
      >
        Problems
      </Link>
      <Link 
        href="/leaderboard" 
        className={`${mobile ? 'block py-2' : ''} text-foreground hover:text-primary transition-colors`}
        onClick={() => mobile && setIsOpen(false)}
      >
        Leaderboard
      </Link>
      <Link 
        href="/contests" 
        className={`${mobile ? 'block py-2' : ''} text-foreground hover:text-primary transition-colors`}
        onClick={() => mobile && setIsOpen(false)}
      >
        Contests
      </Link>
      <Link 
        href="/discussions" 
        className={`${mobile ? 'block py-2' : ''} text-foreground hover:text-primary transition-colors`}
        onClick={() => mobile && setIsOpen(false)}
      >
        Discussions
      </Link>
    </>
  )

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Code className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CodeMaster
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Prevent hydration mismatch by only showing auth UI after mount */}
            {!mounted ? (
              <div className="w-20 h-8" /> // Placeholder to prevent layout shift
            ) : (
              <>
                {isAuthenticated ? (
              <>
                {/* Points Badge */}
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  <Trophy className="w-3 h-3 mr-1" />
                  {user?.points}
                </Badge>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
              </div>
            )}
              </>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks mobile />
                  {!isAuthenticated && (
                    <div className="flex flex-col space-y-2 pt-4">
                      <Button variant="ghost" asChild onClick={() => setIsOpen(false)}>
                        <Link href="/auth/login">Sign In</Link>
                      </Button>
                      <Button asChild onClick={() => setIsOpen(false)}>
                        <Link href="/auth/register">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}