"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Users, 
  Target, 
  Star, 
  Filter,
  Search,
  Play,
  Archive,
  Award,
  TrendingUp
} from "lucide-react"

// Mock data for contests
const mockContests = {
  upcoming: [
    {
      id: 1,
      title: "Weekly Contest #45",
      description: "Solve algorithmic problems in 90 minutes",
      startTime: "2024-01-20T14:00:00Z",
      duration: 90,
      participants: 1247,
      problems: 4,
      difficulty: "Medium",
      prizes: ["$500", "$300", "$200"],
      isRated: true,
      type: "Algorithmic"
    },
    {
      id: 2,
      title: "Monthly Challenge",
      description: "Advanced data structures and algorithms",
      startTime: "2024-01-25T16:00:00Z",
      duration: 120,
      participants: 2834,
      problems: 6,
      difficulty: "Hard",
      prizes: ["$1000", "$600", "$400"],
      isRated: true,
      type: "Marathon"
    },
    {
      id: 3,
      title: "Beginner's Cup",
      description: "Perfect for new programmers",
      startTime: "2024-01-22T10:00:00Z",
      duration: 60,
      participants: 567,
      problems: 3,
      difficulty: "Easy",
      prizes: ["Trophy", "Medal", "Certificate"],
      isRated: false,
      type: "Educational"
    }
  ],
  live: [
    {
      id: 4,
      title: "Speed Coding Challenge",
      description: "Test your coding speed",
      startTime: "2024-01-15T13:00:00Z",
      duration: 45,
      participants: 892,
      problems: 5,
      difficulty: "Medium",
      timeRemaining: 25,
      isRated: true,
      type: "Speed"
    }
  ],
  past: [
    {
      id: 5,
      title: "Winter Programming Contest",
      description: "Year-end grand contest",
      startTime: "2024-01-10T15:00:00Z",
      duration: 180,
      participants: 3421,
      problems: 8,
      difficulty: "Hard",
      winner: "Alice Johnson",
      isRated: true,
      type: "Grand Prix"
    },
    {
      id: 6,
      title: "Data Structures Mastery",
      description: "Focus on advanced data structures",
      startTime: "2024-01-08T12:00:00Z",
      duration: 120,
      participants: 1876,
      problems: 5,
      difficulty: "Medium",
      winner: "Bob Smith",
      isRated: true,
      type: "Thematic"
    }
  ]
}

const getContestTypeColor = (type) => {
  switch (type) {
    case "Algorithmic": return "bg-blue-500 hover:bg-blue-600"
    case "Marathon": return "bg-purple-500 hover:bg-purple-600"
    case "Educational": return "bg-green-500 hover:bg-green-600"
    case "Speed": return "bg-red-500 hover:bg-red-600"
    case "Grand Prix": return "bg-yellow-500 hover:bg-yellow-600"
    case "Thematic": return "bg-indigo-500 hover:bg-indigo-600"
    default: return "bg-gray-500 hover:bg-gray-600"
  }
}

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "Easy": return "text-green-600 bg-green-50 border-green-200"
    case "Medium": return "text-yellow-600 bg-yellow-50 border-yellow-200"
    case "Hard": return "text-red-600 bg-red-50 border-red-200"
    default: return "text-gray-600 bg-gray-50 border-gray-200"
  }
}

const formatTimeRemaining = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function ContestCard({ contest, type }) {
  const isUpcoming = type === 'upcoming'
  const isLive = type === 'live'
  const isPast = type === 'past'

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{contest.title}</CardTitle>
              {contest.isRated && (
                <Badge variant="secondary" className="text-xs">
                  Rated
                </Badge>
              )}
              {isLive && (
                <Badge className="bg-red-500 hover:bg-red-600 text-xs animate-pulse">
                  LIVE
                </Badge>
              )}
            </div>
            <CardDescription>{contest.description}</CardDescription>
          </div>
          <Badge className={getContestTypeColor(contest.type)}>
            {contest.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{formatDate(contest.startTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{contest.duration} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{contest.participants.toLocaleString()} participants</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-500" />
            <span>{contest.problems} problems</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className={getDifficultyColor(contest.difficulty)}>
            {contest.difficulty}
          </Badge>
          {contest.prizes && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Trophy className="h-4 w-4" />
              <span>{contest.prizes[0]}</span>
            </div>
          )}
        </div>

        {isLive && contest.timeRemaining && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Time Remaining</span>
              <span className="font-medium">{formatTimeRemaining(contest.timeRemaining)}</span>
            </div>
            <Progress value={(contest.timeRemaining / contest.duration) * 100} className="h-2" />
          </div>
        )}

        {isPast && contest.winner && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
            <Trophy className="h-4 w-4 text-yellow-600" />
            <span className="text-sm">Winner: <strong>{contest.winner}</strong></span>
          </div>
        )}

        <div className="flex gap-2">
          {isUpcoming && (
            <Button className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Register
            </Button>
          )}
          {isLive && (
            <Button className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Join Contest
            </Button>
          )}
          {isPast && (
            <Button variant="outline" className="flex-1">
              <Archive className="h-4 w-4 mr-2" />
              View Results
            </Button>
          )}
          <Button variant="outline" size="sm">
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ContestsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const stats = {
    totalContests: 156,
    activeParticipants: 8932,
    totalPrizes: "$125,000",
    avgRating: 1847
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900">Contests</h1>
          </div>
          <p className="text-lg text-gray-600">
            Compete in programming contests and climb the leaderboard
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Contests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalContests}</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Participants</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeParticipants.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Prizes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPrizes}</p>
                </div>
                <Award className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search contests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="algorithmic">Algorithmic</SelectItem>
                  <SelectItem value="marathon">Marathon</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="speed">Speed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contest Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">
              Upcoming ({mockContests.upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="live">
              Live ({mockContests.live.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({mockContests.past.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockContests.upcoming.map((contest) => (
                <ContestCard key={contest.id} contest={contest} type="upcoming" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="live" className="space-y-6">
            {mockContests.live.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockContests.live.map((contest) => (
                  <ContestCard key={contest.id} contest={contest} type="live" />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Live Contests</h3>
                  <p className="text-gray-600">Check back later for live contests</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockContests.past.map((contest) => (
                <ContestCard key={contest.id} contest={contest} type="past" />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="mt-12">
          <CardContent className="text-center py-12">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Ready to Compete?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of programmers in our contests. Improve your skills, win prizes, 
              and climb the global leaderboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                <Star className="h-5 w-5 mr-2" />
                Register for Next Contest
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/leaderboard">
                  View Leaderboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
