"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Award, Star, TrendingUp, Users, Search, Filter } from "lucide-react"

// Mock data for leaderboard
const mockLeaderboard = [
  { id: 1, rank: 1, name: "Alice Johnson", avatar: "/avatars/alice.jpg", points: 2850, problemsSolved: 145, contests: 12, rating: 2156, trend: "up", badge: "Grandmaster" },
  { id: 2, rank: 2, name: "Bob Smith", avatar: "/avatars/bob.jpg", points: 2720, problemsSolved: 132, contests: 10, rating: 2089, trend: "up", badge: "Master" },
  { id: 3, rank: 3, name: "Carol Davis", avatar: "/avatars/carol.jpg", points: 2650, problemsSolved: 128, contests: 11, rating: 2034, trend: "down", badge: "Master" },
  { id: 4, rank: 4, name: "David Wilson", avatar: "/avatars/david.jpg", points: 2580, problemsSolved: 125, contests: 9, rating: 1987, trend: "up", badge: "Expert" },
  { id: 5, rank: 5, name: "Emma Brown", avatar: "/avatars/emma.jpg", points: 2510, problemsSolved: 119, contests: 8, rating: 1923, trend: "stable", badge: "Expert" },
  { id: 6, rank: 6, name: "Frank Miller", avatar: "/avatars/frank.jpg", points: 2445, problemsSolved: 115, contests: 7, rating: 1876, trend: "up", badge: "Expert" },
  { id: 7, rank: 7, name: "Grace Lee", avatar: "/avatars/grace.jpg", points: 2380, problemsSolved: 112, contests: 6, rating: 1834, trend: "down", badge: "Candidate Master" },
  { id: 8, rank: 8, name: "Henry Taylor", avatar: "/avatars/henry.jpg", points: 2315, problemsSolved: 108, contests: 5, rating: 1789, trend: "up", badge: "Candidate Master" },
  { id: 9, rank: 9, name: "Ivy Anderson", avatar: "/avatars/ivy.jpg", points: 2250, problemsSolved: 104, contests: 4, rating: 1745, trend: "stable", badge: "Specialist" },
  { id: 10, rank: 10, name: "Jack White", avatar: "/avatars/jack.jpg", points: 2185, problemsSolved: 101, contests: 3, rating: 1698, trend: "up", badge: "Specialist" },
]

const mockStats = {
  totalUsers: 25847,
  activeUsers: 8932,
  totalProblems: 1247,
  contestsHeld: 156
}

const getBadgeColor = (badge) => {
  switch (badge) {
    case "Grandmaster": return "bg-purple-500 hover:bg-purple-600"
    case "Master": return "bg-red-500 hover:bg-red-600"
    case "Expert": return "bg-blue-500 hover:bg-blue-600"
    case "Candidate Master": return "bg-green-500 hover:bg-green-600"
    case "Specialist": return "bg-yellow-500 hover:bg-yellow-600"
    default: return "bg-gray-500 hover:bg-gray-600"
  }
}

const getTrendIcon = (trend) => {
  switch (trend) {
    case "up": return <TrendingUp className="h-4 w-4 text-green-500" />
    case "down": return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
    default: return <div className="h-4 w-4" />
  }
}

export default function LeaderboardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [timeFilter, setTimeFilter] = useState("all-time")
  const [categoryFilter, setCategoryFilter] = useState("overall")

  const filteredLeaderboard = mockLeaderboard.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          </div>
          <p className="text-lg text-gray-600">
            Compete with the best programmers and climb the ranks
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.activeUsers.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Problems</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.totalProblems.toLocaleString()}</p>
                </div>
                <Award className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contests Held</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.contestsHeld}</p>
                </div>
                <Medal className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overall" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="overall">Overall</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="contests">Contests</TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-time">All Time</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="overall" className="space-y-6">
            {/* Top 3 Podium */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Performers
                </CardTitle>
                <CardDescription>
                  The best of the best on our platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredLeaderboard.slice(0, 3).map((user, index) => (
                    <div key={user.id} className="text-center">
                      <div className="relative mb-4">
                        <Avatar className="h-20 w-20 mx-auto border-4 border-yellow-400">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="text-lg font-bold">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-2 -right-2">
                          {index === 0 && <Trophy className="h-8 w-8 text-yellow-500" />}
                          {index === 1 && <Medal className="h-8 w-8 text-gray-400" />}
                          {index === 2 && <Award className="h-8 w-8 text-orange-600" />}
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{user.name}</h3>
                      <Badge className={`mb-2 ${getBadgeColor(user.badge)}`}>
                        {user.badge}
                      </Badge>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4" />
                          {user.points} pts
                        </p>
                        <p>{user.problemsSolved} problems solved</p>
                        <p>Rating: {user.rating}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Full Leaderboard Table */}
            <Card>
              <CardHeader>
                <CardTitle>Full Rankings</CardTitle>
                <CardDescription>
                  Complete leaderboard with detailed statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Badge</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                        <TableHead className="text-right">Problems</TableHead>
                        <TableHead className="text-right">Contests</TableHead>
                        <TableHead className="text-right">Rating</TableHead>
                        <TableHead className="w-16">Trend</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeaderboard.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <div className="flex items-center justify-center">
                              {user.rank <= 3 && (
                                <div className="mr-2">
                                  {user.rank === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
                                  {user.rank === 2 && <Medal className="h-4 w-4 text-gray-400" />}
                                  {user.rank === 3 && <Award className="h-4 w-4 text-orange-600" />}
                                </div>
                              )}
                              {user.rank}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getBadgeColor(user.badge)}>
                              {user.badge}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {user.points.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">{user.problemsSolved}</TableCell>
                          <TableCell className="text-right">{user.contests}</TableCell>
                          <TableCell className="text-right font-medium">{user.rating}</TableCell>
                          <TableCell className="text-center">
                            {getTrendIcon(user.trend)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Rankings</CardTitle>
                <CardDescription>
                  Top performers this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  Monthly leaderboard data would be displayed here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contest Rankings</CardTitle>
                <CardDescription>
                  Performance in competitive programming contests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  Contest leaderboard data would be displayed here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
