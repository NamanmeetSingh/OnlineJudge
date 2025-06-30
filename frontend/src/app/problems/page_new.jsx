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
  ChevronRight,
  AlertCircle,
  Loader2
} from "lucide-react"
import { problemsApi } from "@/lib/api"
import { DIFFICULTIES } from "@/constants"

export default function ProblemsPage() {
  const [problems, setProblems] = useState([])
  const [filteredProblems, setFilteredProblems] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  // Fetch problems from API
  useEffect(() => {
    fetchProblems()
  }, [currentPage, difficultyFilter])

  const fetchProblems = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = {
        page: currentPage,
        limit: 20
      }
      
      if (difficultyFilter !== "all") {
        params.difficulty = difficultyFilter
      }
      
      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      }

      const response = await problemsApi.getProblems(params)
      
      if (response.success) {
        setProblems(response.data.problems)
        setFilteredProblems(response.data.problems)
        setPagination(response.data.pagination)
      } else {
        setError('Failed to fetch problems')
      }
    } catch (err) {
      console.error('Error fetching problems:', err)
      setError(err.message || 'Failed to fetch problems')
      
      // Fallback to mock data if API fails
      const mockProblems = [
        {
          _id: "1",
          title: "Two Sum",
          slug: "two-sum",
          difficulty: "Easy",
          tags: ["Array", "Hash Table"],
          points: 100,
          acceptanceRate: 85,
          totalSubmissions: 1250000
        },
        {
          _id: "2", 
          title: "Add Two Numbers",
          slug: "add-two-numbers",
          difficulty: "Medium",
          tags: ["Linked List", "Math"],
          points: 200,
          acceptanceRate: 72,
          totalSubmissions: 890000
        }
      ]
      setProblems(mockProblems)
      setFilteredProblems(mockProblems)
    } finally {
      setIsLoading(false)
    }
  }

  // Search and filter logic
  useEffect(() => {
    if (searchTerm.trim()) {
      const debounceTimer = setTimeout(() => {
        fetchProblems()
      }, 500)
      
      return () => clearTimeout(debounceTimer)
    } else {
      filterProblems()
    }
  }, [searchTerm])

  const filterProblems = () => {
    let filtered = [...problems]

    if (statusFilter !== "all") {
      filtered = filtered.filter(problem => problem.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(problem => 
        problem.tags && problem.tags.includes(categoryFilter)
      )
    }

    setFilteredProblems(filtered)
  }

  useEffect(() => {
    filterProblems()
  }, [problems, statusFilter, categoryFilter])

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return "bg-green-100 text-green-800"
      case 'medium': return "bg-yellow-100 text-yellow-800"  
      case 'hard': return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'solved': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'attempted': return <Clock className="w-4 h-4 text-yellow-600" />
      default: return <XCircle className="w-4 h-4 text-gray-400" />
    }
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center text-red-600 mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Error Loading Problems</h3>
            <p className="text-gray-600 text-center mb-4">{error}</p>
            <Button onClick={fetchProblems} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Problems</h1>
        <p className="text-gray-600">
          Practice coding problems to improve your programming skills
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Problems</p>
                <p className="text-2xl font-bold">{pagination?.totalCount || problems.length}</p>
              </div>
              <Code className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Solved</p>
                <p className="text-2xl font-bold text-green-600">0</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attempted</p>
                <p className="text-2xl font-bold text-yellow-600">0</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acceptance Rate</p>
                <p className="text-2xl font-bold">0%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Problems</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by title, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
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
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Array">Array</SelectItem>
                  <SelectItem value="String">String</SelectItem>
                  <SelectItem value="Math">Math</SelectItem>
                  <SelectItem value="Dynamic Programming">Dynamic Programming</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="solved">Solved</SelectItem>
                  <SelectItem value="attempted">Attempted</SelectItem>
                  <SelectItem value="unsolved">Not Attempted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problems Table */}
      <Card>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2">Loading problems...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Status</TableHead>
                  <TableHead>Problem</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Acceptance</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProblems.map((problem) => (
                  <TableRow key={problem._id} className="hover:bg-gray-50">
                    <TableCell>
                      {getStatusIcon(problem.status)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <Link 
                          href={`/problems/${problem.slug}`}
                          className="font-medium hover:text-blue-600 transition-colors"
                        >
                          {problem.title}
                        </Link>
                        <div className="flex gap-1 mt-1">
                          {problem.tags?.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
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
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={problem.acceptanceRate || 0} 
                          className="w-16 h-2" 
                        />
                        <span className="text-sm text-gray-600">
                          {Math.round(problem.acceptanceRate || 0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{problem.points || 0}</span>
                    </TableCell>
                    <TableCell>
                      <Link href={`/problems/${problem.slug}`}>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!pagination.hasPrev}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button 
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!pagination.hasNext}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
