"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Search, 
  Plus, 
  Pin, 
  Lock,
  Users,
  Clock,
  Eye,
  Filter,
  TrendingUp,
  Bookmark,
  Share,
  MoreVertical
} from "lucide-react"

// Mock data for discussions
const mockDiscussions = [
  {
    id: 1,
    title: "How to optimize time complexity for Two Sum problem?",
    content: "I've been working on the Two Sum problem and found multiple approaches. What's the most efficient way to solve it with O(n) time complexity?",
    author: {
      name: "Alice Johnson",
      avatar: "/avatars/alice.jpg",
      reputation: 1250,
      badge: "Expert"
    },
    category: "Algorithms",
    tags: ["array", "hashmap", "optimization"],
    createdAt: "2024-01-15T10:30:00Z",
    replies: 8,
    views: 142,
    likes: 15,
    dislikes: 2,
    isPinned: false,
    isLocked: false,
    isSolved: true
  },
  {
    id: 2,
    title: "Best practices for implementing binary search",
    content: "I often get confused with the boundary conditions in binary search. Can someone share the most reliable template?",
    author: {
      name: "Bob Smith",
      avatar: "/avatars/bob.jpg",
      reputation: 890,
      badge: "Intermediate"
    },
    category: "Data Structures",
    tags: ["binary-search", "template", "best-practices"],
    createdAt: "2024-01-14T16:45:00Z",
    replies: 12,
    views: 87,
    likes: 23,
    dislikes: 1,
    isPinned: true,
    isLocked: false,
    isSolved: true
  },
  {
    id: 3,
    title: "Dynamic Programming vs Greedy Algorithms",
    content: "When should I choose DP over greedy approach? Looking for clear decision criteria.",
    author: {
      name: "Carol Davis",
      avatar: "/avatars/carol.jpg",
      reputation: 2100,
      badge: "Master"
    },
    category: "Problem Solving",
    tags: ["dynamic-programming", "greedy", "strategy"],
    createdAt: "2024-01-14T09:20:00Z",
    replies: 18,
    views: 234,
    likes: 45,
    dislikes: 3,
    isPinned: false,
    isLocked: false,
    isSolved: false
  },
  {
    id: 4,
    title: "Graph traversal algorithms comparison",
    content: "Can someone explain the differences between BFS and DFS with practical examples?",
    author: {
      name: "David Wilson",
      avatar: "/avatars/david.jpg",
      reputation: 645,
      badge: "Beginner"
    },
    category: "Graph Theory",
    tags: ["bfs", "dfs", "traversal", "graphs"],
    createdAt: "2024-01-13T14:15:00Z",
    replies: 6,
    views: 98,
    likes: 12,
    dislikes: 0,
    isPinned: false,
    isLocked: false,
    isSolved: true
  },
  {
    id: 5,
    title: "Debugging strategies for competitive programming",
    content: "What are the most effective debugging techniques during contests when time is limited?",
    author: {
      name: "Emma Brown",
      avatar: "/avatars/emma.jpg",
      reputation: 1567,
      badge: "Expert"
    },
    category: "Contest Tips",
    tags: ["debugging", "contest", "strategies"],
    createdAt: "2024-01-13T11:00:00Z",
    replies: 14,
    views: 176,
    likes: 28,
    dislikes: 1,
    isPinned: false,
    isLocked: false,
    isSolved: false
  }
]

const categories = [
  "All Categories",
  "Algorithms",
  "Data Structures", 
  "Problem Solving",
  "Graph Theory",
  "Contest Tips",
  "Career Advice",
  "General Discussion"
]

const getBadgeColor = (badge) => {
  switch (badge) {
    case "Master": return "bg-purple-500 hover:bg-purple-600"
    case "Expert": return "bg-blue-500 hover:bg-blue-600"
    case "Intermediate": return "bg-green-500 hover:bg-green-600"
    case "Beginner": return "bg-yellow-500 hover:bg-yellow-600"
    default: return "bg-gray-500 hover:bg-gray-600"
  }
}

const getCategoryColor = (category) => {
  switch (category) {
    case "Algorithms": return "bg-blue-100 text-blue-800 border-blue-200"
    case "Data Structures": return "bg-green-100 text-green-800 border-green-200"
    case "Problem Solving": return "bg-purple-100 text-purple-800 border-purple-200"
    case "Graph Theory": return "bg-orange-100 text-orange-800 border-orange-200"
    case "Contest Tips": return "bg-red-100 text-red-800 border-red-200"
    default: return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  return date.toLocaleDateString()
}

function DiscussionCard({ discussion }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {discussion.isPinned && <Pin className="h-4 w-4 text-blue-500" />}
                {discussion.isLocked && <Lock className="h-4 w-4 text-red-500" />}
                <Link href={`/discussions/${discussion.id}`}>
                  <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors">
                    {discussion.title}
                  </h3>
                </Link>
                {discussion.isSolved && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Solved
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">
                {discussion.content}
              </p>
            </div>
          </div>

          {/* Author and Category */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={discussion.author.avatar} alt={discussion.author.name} />
                <AvatarFallback>
                  {discussion.author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{discussion.author.name}</p>
                <div className="flex items-center gap-2">
                  <Badge size="sm" className={getBadgeColor(discussion.author.badge)}>
                    {discussion.author.badge}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {discussion.author.reputation} rep
                  </span>
                </div>
              </div>
            </div>
            <Badge variant="outline" className={getCategoryColor(discussion.category)}>
              {discussion.category}
            </Badge>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {discussion.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{discussion.replies}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{discussion.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                <span>{discussion.likes}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatTimeAgo(discussion.createdAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DiscussionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [sortBy, setSortBy] = useState("recent")
  const [isNewDiscussionOpen, setIsNewDiscussionOpen] = useState(false)

  const filteredDiscussions = mockDiscussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "All Categories" || discussion.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const stats = {
    totalDiscussions: 1247,
    activeUsers: 432,
    solvedToday: 89,
    newPosts: 23
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-900">Discussions</h1>
            </div>
            <Dialog open={isNewDiscussionOpen} onOpenChange={setIsNewDiscussionOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Discussion
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Start a New Discussion</DialogTitle>
                  <DialogDescription>
                    Ask a question or start a discussion with the community
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input placeholder="What's your question or topic?" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Content</label>
                    <Textarea 
                      placeholder="Describe your question or topic in detail..."
                      className="min-h-[120px]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tags</label>
                    <Input placeholder="Add tags separated by commas" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsNewDiscussionOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsNewDiscussionOpen(false)}>
                      Post Discussion
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-lg text-gray-600">
            Connect with the community, ask questions, and share knowledge
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Discussions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDiscussions.toLocaleString()}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Solved Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.solvedToday}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Posts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.newPosts}</p>
                </div>
                <Plus className="h-8 w-8 text-orange-500" />
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
                  placeholder="Search discussions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="replies">Most Replies</SelectItem>
                  <SelectItem value="views">Most Views</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Discussions List */}
        <div className="space-y-6">
          {filteredDiscussions.map((discussion) => (
            <DiscussionCard key={discussion.id} discussion={discussion} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Discussions
          </Button>
        </div>
      </div>
    </div>
  )
}
