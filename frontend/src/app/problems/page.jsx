"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock,
  Code,
  TrendingUp,
  Star,
  ChevronRight
} from "lucide-react"

export default function ProblemsPage() {
  const [problems, setProblems] = useState([])
  const [filteredProblems, setFilteredProblems] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // Mock problems data
  useEffect(() => {
    const mockProblems = [
      {
        id: 1,
        title: "Two Sum",
        difficulty: "Easy",
        category: "Array",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        acceptance: 85,
        submissions: 1250000,
        likes: 15420,
        status: "solved",
        tags: ["Array", "Hash Table"]
      },
      {
        id: 2,
        title: "Add Two Numbers",
        difficulty: "Medium",
        category: "Linked List",
        description: "You are given two non-empty linked lists representing two non-negative integers.",
        acceptance: 72,
        submissions: 890000,
        likes: 12350,
        status: "attempted",
        tags: ["Linked List", "Math", "Recursion"]
      },
      {
        id: 3,
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        category: "String",
        description: "Given a string s, find the length of the longest substring without repeating characters.",
        acceptance: 67,
        submissions: 756000,
        likes: 18900,
        status: "unsolved",
        tags: ["Hash Table", "String", "Sliding Window"]
      },
      {
        id: 4,
        title: "Median of Two Sorted Arrays",
        difficulty: "Hard",
        category: "Array",
        description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
        acceptance: 34,
        submissions: 234000,
        likes: 8920,
        status: "unsolved",
        tags: ["Array", "Binary Search", "Divide and Conquer"]
      },
      {
        id: 5,
        title: "Longest Palindromic Substring",
        difficulty: "Medium",
        category: "String",
        description: "Given a string s, return the longest palindromic substring in s.",
        acceptance: 45,
        submissions: 567000,
        likes: 11250,
        status: "solved",
        tags: ["String", "Dynamic Programming"]
      },
      {
        id: 6,
        title: "ZigZag Conversion",
        difficulty: "Medium",
        category: "String",
        description: "The string PAYPALISHIRING is written in a zigzag pattern on a given number of rows.",
        acceptance: 58,
        submissions: 345000,
        likes: 4560,
        status: "unsolved",
        tags: ["String"]
      },
      {
        id: 7,
        title: "Reverse Integer",
        difficulty: "Medium",
        category: "Math",
        description: "Given a signed 32-bit integer x, return x with its digits reversed.",
        acceptance: 62,
        submissions: 890000,
        likes: 7820,
        status: "attempted",
        tags: ["Math"]
      },
      {
        id: 8,
        title: "String to Integer (atoi)",
        difficulty: "Medium",
        category: "String",
        description: "Implement the myAtoi(string s) function, which converts a string to a 32-bit signed integer.",
        acceptance: 28,
        submissions: 456000,
        likes: 3240,
        status: "unsolved",
        tags: ["String"]
      },
    ]
    
    setProblems(mockProblems)
    setFilteredProblems(mockProblems)
    setIsLoading(false)
  }, [])

  // Filter problems based on search and filters
  useEffect(() => {
    let filtered = problems.filter(problem => 
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (difficultyFilter !== "all") {
      filtered = filtered.filter(problem => problem.difficulty === difficultyFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(problem => problem.category === categoryFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(problem => problem.status === statusFilter)
    }

    setFilteredProblems(filtered)
  }, [problems, searchTerm, difficultyFilter, categoryFilter, statusFilter])

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 border-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Hard":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "solved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "attempted":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "unsolved":
        return <XCircle className="h-4 w-4 text-gray-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getAcceptanceColor = (acceptance) => {
    if (acceptance >= 70) return "text-green-600"
    if (acceptance >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Problems</h1>
        <p className="text-muted-foreground">
          Solve coding challenges and improve your programming skills
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Code className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Problems</p>
                <p className="text-2xl font-bold">{problems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Solved</p>
                <p className="text-2xl font-bold">
                  {problems.filter(p => p.status === "solved").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Attempted</p>
                <p className="text-2xl font-bold">
                  {problems.filter(p => p.status === "attempted").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">
                  {Math.round((problems.filter(p => p.status === "solved").length / problems.length) * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search problems..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Array">Array</SelectItem>
                  <SelectItem value="String">String</SelectItem>
                  <SelectItem value="Linked List">Linked List</SelectItem>
                  <SelectItem value="Math">Math</SelectItem>
                  <SelectItem value="Dynamic Programming">Dynamic Programming</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="solved">Solved</SelectItem>
                  <SelectItem value="attempted">Attempted</SelectItem>
                  <SelectItem value="unsolved">Unsolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problems Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Status</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Acceptance</TableHead>
              <TableHead className="text-right">Submissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProblems.map((problem) => (
              <TableRow key={problem.id} className="hover:bg-muted/50">
                <TableCell>
                  {getStatusIcon(problem.status)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Link 
                      href={`/problems/${problem.id}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {problem.title}
                    </Link>
                    <div className="flex flex-wrap gap-1">
                      {problem.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getDifficultyColor(problem.difficulty)}>
                    {problem.difficulty}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{problem.category}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className={getAcceptanceColor(problem.acceptance)}>
                    {problem.acceptance}%
                  </span>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {problem.submissions.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/problems/${problem.id}`}>
                      Solve
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredProblems.length === 0 && (
        <Card className="mt-8">
          <CardContent className="pt-6 text-center">
            <div className="text-muted-foreground">
              <Code className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No problems found</p>
              <p>Try adjusting your search criteria or filters</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
