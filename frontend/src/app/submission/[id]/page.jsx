"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Code, 
  User, 
  Calendar, 
  Zap, 
  MemoryStick,
  ArrowLeft,
  Copy,
  Download,
  Share
} from "lucide-react"

// Mock data for submission
const mockSubmission = {
  id: "sub_123456789",
  problemId: "1",
  problemTitle: "Two Sum",
  difficulty: "Easy",
  user: {
    name: "John Doe",
    avatar: "/avatars/john.jpg"
  },
  language: "Python",
  status: "Accepted",
  verdict: "Accepted",
  score: 100,
  executionTime: 45,
  memoryUsed: 256,
  submittedAt: "2024-01-15T10:30:00Z",
  code: `def twoSum(nums, target):
    """
    Given an array of integers nums and an integer target,
    return indices of the two numbers such that they add up to target.
    """
    # Create a hashmap to store number and its index
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        # Check if complement exists in hashmap
        if complement in num_map:
            return [num_map[complement], i]
        
        # Store current number and its index
        num_map[num] = i
    
    # Return empty list if no solution found
    return []

# Test the function
if __name__ == "__main__":
    # Test case 1
    nums1 = [2, 7, 11, 15]
    target1 = 9
    result1 = twoSum(nums1, target1)
    print(f"Input: nums = {nums1}, target = {target1}")
    print(f"Output: {result1}")
    
    # Test case 2
    nums2 = [3, 2, 4]
    target2 = 6
    result2 = twoSum(nums2, target2)
    print(f"Input: nums = {nums2}, target = {target2}")
    print(f"Output: {result2}")`,
  testResults: [
    {
      testCase: 1,
      input: "[2,7,11,15], target = 9",
      expectedOutput: "[0,1]",
      actualOutput: "[0,1]",
      status: "Passed",
      executionTime: 12,
      memoryUsed: 64
    },
    {
      testCase: 2,
      input: "[3,2,4], target = 6",
      expectedOutput: "[1,2]",
      actualOutput: "[1,2]",
      status: "Passed",
      executionTime: 8,
      memoryUsed: 48
    },
    {
      testCase: 3,
      input: "[3,3], target = 6",
      expectedOutput: "[0,1]",
      actualOutput: "[0,1]",
      status: "Passed",
      executionTime: 6,
      memoryUsed: 32
    },
    {
      testCase: 4,
      input: "[-1,-2,-3,-4,-5], target = -8",
      expectedOutput: "[2,4]",
      actualOutput: "[2,4]",
      status: "Passed",
      executionTime: 10,
      memoryUsed: 52
    }
  ],
  compilerOutput: "Successfully compiled and executed.\nAll test cases passed.",
  statistics: {
    totalTestCases: 4,
    passedTestCases: 4,
    failedTestCases: 0,
    accuracy: 100,
    avgExecutionTime: 9,
    maxMemoryUsed: 64
  }
}

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "accepted":
    case "passed":
      return "bg-green-500 hover:bg-green-600 text-white"
    case "wrong answer":
    case "failed":
      return "bg-red-500 hover:bg-red-600 text-white"
    case "time limit exceeded":
      return "bg-yellow-500 hover:bg-yellow-600 text-white"
    case "memory limit exceeded":
      return "bg-orange-500 hover:bg-orange-600 text-white"
    case "runtime error":
      return "bg-purple-500 hover:bg-purple-600 text-white"
    case "compilation error":
      return "bg-gray-500 hover:bg-gray-600 text-white"
    default:
      return "bg-blue-500 hover:bg-blue-600 text-white"
  }
}

const getStatusIcon = (status) => {
  switch (status.toLowerCase()) {
    case "accepted":
    case "passed":
      return <CheckCircle className="h-4 w-4" />
    case "wrong answer":
    case "failed":
      return <XCircle className="h-4 w-4" />
    case "time limit exceeded":
      return <Clock className="h-4 w-4" />
    default:
      return <XCircle className="h-4 w-4" />
  }
}

export default function SubmissionDetailsPage() {
  const params = useParams()
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchSubmission = async () => {
      setLoading(true)
      // In real app, fetch submission by ID
      setTimeout(() => {
        setSubmission(mockSubmission)
        setLoading(false)
      }, 1000)
    }

    fetchSubmission()
  }, [params.id])

  const copyCode = async () => {
    if (submission?.code) {
      await navigator.clipboard.writeText(submission.code)
      // You could add a toast notification here
    }
  }

  const shareSubmission = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Submission for ${submission.problemTitle}`,
        url: window.location.href
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      // You could add a toast notification here
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="text-center py-12">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Submission Not Found</h2>
              <p className="text-gray-600">The submission you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/problems" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Problems
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Submission #{submission.id}
              </h1>
              <p className="text-lg text-gray-600">
                Problem: <Link href={`/problems/${submission.problemId}`} className="text-blue-600 hover:underline">
                  {submission.problemTitle}
                </Link>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={copyCode}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
              <Button variant="outline" size="sm" onClick={shareSubmission}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Submission Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Submission Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      {getStatusIcon(submission.status)}
                    </div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge className={getStatusColor(submission.status)}>
                      {submission.status}
                    </Badge>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <Zap className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm text-gray-600">Runtime</p>
                    <p className="font-semibold">{submission.executionTime}ms</p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <MemoryStick className="h-5 w-5 mx-auto mb-2 text-purple-500" />
                    <p className="text-sm text-gray-600">Memory</p>
                    <p className="font-semibold">{submission.memoryUsed}KB</p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <CheckCircle className="h-5 w-5 mx-auto mb-2 text-green-500" />
                    <p className="text-sm text-gray-600">Score</p>
                    <p className="font-semibold">{submission.score}/100</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{submission.user.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(submission.submittedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    <span>{submission.language}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code and Results */}
            <Tabs defaultValue="code" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="code">Source Code</TabsTrigger>
                <TabsTrigger value="results">Test Results</TabsTrigger>
                <TabsTrigger value="output">Compiler Output</TabsTrigger>
              </TabsList>
              
              <TabsContent value="code">
                <Card>
                  <CardHeader>
                    <CardTitle>Source Code</CardTitle>
                    <CardDescription>
                      {submission.language} solution for {submission.problemTitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96 w-full rounded-md border">
                      <pre className="p-4 text-sm font-mono">
                        <code>{submission.code}</code>
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="results">
                <Card>
                  <CardHeader>
                    <CardTitle>Test Results</CardTitle>
                    <CardDescription>
                      Detailed results for each test case
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {submission.testResults.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Test Case {result.testCase}</h4>
                          <Badge className={getStatusColor(result.status)}>
                            {getStatusIcon(result.status)}
                            <span className="ml-1">{result.status}</span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Input:</p>
                            <code className="bg-gray-100 p-2 rounded block">{result.input}</code>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Expected Output:</p>
                            <code className="bg-gray-100 p-2 rounded block">{result.expectedOutput}</code>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Actual Output:</p>
                            <code className="bg-gray-100 p-2 rounded block">{result.actualOutput}</code>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Performance:</p>
                            <div className="space-y-1">
                              <p>Runtime: {result.executionTime}ms</p>
                              <p>Memory: {result.memoryUsed}KB</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="output">
                <Card>
                  <CardHeader>
                    <CardTitle>Compiler Output</CardTitle>
                    <CardDescription>
                      Compilation and execution logs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48 w-full rounded-md border">
                      <pre className="p-4 text-sm font-mono text-gray-700">
                        {submission.compilerOutput}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>
                  Performance summary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Accuracy</span>
                    <span className="text-sm text-gray-600">{submission.statistics.accuracy}%</span>
                  </div>
                  <Progress value={submission.statistics.accuracy} className="h-2" />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Test Cases</span>
                    <span className="text-sm font-medium">{submission.statistics.totalTestCases}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Passed</span>
                    <span className="text-sm font-medium text-green-600">{submission.statistics.passedTestCases}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Failed</span>
                    <span className="text-sm font-medium text-red-600">{submission.statistics.failedTestCases}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Runtime</span>
                    <span className="text-sm font-medium">{submission.statistics.avgExecutionTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Max Memory</span>
                    <span className="text-sm font-medium">{submission.statistics.maxMemoryUsed}KB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  variant="outline"
                  asChild
                >
                  <Link href={`/problems/${submission.problemId}`}>
                    View Problem
                  </Link>
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={copyCode}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
