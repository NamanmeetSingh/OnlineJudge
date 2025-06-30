"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Trophy, 
  Code, 
  Target, 
  Calendar, 
  TrendingUp, 
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Award,
  Zap,
  Loader2
} from "lucide-react"
import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/hooks/useAuth"

export default function DashboardPage() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await authApi.getDashboard()
        if (response.data?.success) {
          setDashboardData(response.data.data)
        } else {
          setError('Failed to load dashboard data')
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "wrong":
      case "rejected":  
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const then = new Date(date)
    const diffInMinutes = Math.floor((now - then) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p>No dashboard data available</p>
        </div>
      </div>
    )
  }

  const { stats, recentSubmissions, achievements } = dashboardData

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Track your coding progress and achievements</p>
        </div>
        <Avatar className="h-16 w-16">
          <AvatarImage src={dashboardData.user.avatar || "/api/placeholder/64/64"} />
          <AvatarFallback>
            {dashboardData.user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.problemsSolved}</div>
            <p className="text-xs text-muted-foreground">
              of {stats.totalProblems} total
            </p>
            <Progress 
              value={(stats.problemsSolved / stats.totalProblems) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streak} days</div>
            <p className="text-xs text-muted-foreground">
              Keep it up!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.points.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +125 this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Rank</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{stats.rank}</div>
            <p className="text-xs text-muted-foreground">
              ↑ 23 from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Your latest problem-solving attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSubmissions && recentSubmissions.length > 0 ? (
                  recentSubmissions.map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(submission.status)}
                        <div>
                          <p className="font-medium">{submission.problem}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTimeAgo(submission.time)}
                            {submission.language && ` • ${submission.language}`}
                            {submission.runtime && ` • ${submission.runtime}ms`}
                          </p>
                        </div>
                      </div>
                      <Badge className={getDifficultyColor(submission.difficulty)}>
                        {submission.difficulty}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No submissions yet. Start solving problems!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Your coding milestones and badges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements && achievements.length > 0 ? (
                  achievements.map((achievement, index) => (
                    <div 
                      key={achievement.id || index} 
                      className={`p-4 border rounded-lg ${achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <Award className={`h-8 w-8 ${achievement.earned ? 'text-green-600' : 'text-gray-400'}`} />
                        <div>
                          <p className={`font-medium ${achievement.earned ? 'text-green-800' : 'text-gray-600'}`}>
                            {achievement.name}
                          </p>
                          <p className={`text-sm ${achievement.earned ? 'text-green-600' : 'text-gray-500'}`}>
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No achievements yet. Keep solving problems to earn badges!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Problem Categories</CardTitle>
                <CardDescription>Your progress across different topics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Arrays & Strings</span>
                    <span className="text-sm">12/20</span>
                  </div>
                  <Progress value={60} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Dynamic Programming</span>
                    <span className="text-sm">8/15</span>
                  </div>
                  <Progress value={53} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Trees & Graphs</span>
                    <span className="text-sm">15/25</span>
                  </div>
                  <Progress value={60} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">System Design</span>
                    <span className="text-sm">3/10</span>
                  </div>
                  <Progress value={30} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Goals</CardTitle>
                <CardDescription>Track your weekly objectives</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Solve 10 problems this week</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Maintain 7-day streak</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm">Participate in weekend contest</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <span className="text-sm">Complete medium difficulty problem</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
