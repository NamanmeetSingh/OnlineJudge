"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Play, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock,
  ThumbsUp,
  MessageSquare,
  Code,
  Lightbulb,
  TestTube,
  RotateCcw
} from "lucide-react"
import { toast } from "sonner"

export default function ProblemPage() {
  const params = useParams()
  const problemId = params.id

  const [problem, setProblem] = useState(null)
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [submissionResult, setSubmissionResult] = useState(null)

  // Mock problem data
  useEffect(() => {
    const mockProblem = {
      id: parseInt(problemId),
      title: "Two Sum",
      difficulty: "Easy",
      category: "Array",
      description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
      examples: [
        {
          input: "nums = [2,7,11,15], target = 9",
          output: "[0,1]",
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
        },
        {
          input: "nums = [3,2,4], target = 6",
          output: "[1,2]",
          explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
        },
        {
          input: "nums = [3,3], target = 6", 
          output: "[0,1]",
          explanation: "Because nums[0] + nums[1] == 6, we return [0, 1]."
        }
      ],
      constraints: [
        "2 <= nums.length <= 10^4",
        "-10^9 <= nums[i] <= 10^9",
        "-10^9 <= target <= 10^9",
        "Only one valid answer exists."
      ],
      hints: [
        "A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it's best to try out brute force solutions for just for completeness. It is from these brute force solutions that you can come up with optimizations.",
        "So, if we fix one of the numbers, say x, we have to scan the entire array to find the next number y which is value - x where value is the input parameter. Can we change our array somehow so that this search becomes faster?",
        "The second train of thought is, without changing the array, can we use additional space somehow? Like maybe a hash map to speed up the search?"
      ],
      acceptance: 85,
      submissions: 1250000,
      likes: 15420,
      dislikes: 623,
      tags: ["Array", "Hash Table"],
      status: "unsolved"
    }
    setProblem(mockProblem)

    // Set default code template based on language
    setCode(getCodeTemplate(language))
  }, [problemId, language])

  const getCodeTemplate = (lang) => {
    const templates = {
      javascript: `function twoSum(nums, target) {
    // Write your solution here
    
}`,
      python: `def twoSum(nums, target):
    # Write your solution here
    pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        
    }
};`
    }
    return templates[lang] || templates.javascript
  }

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    setCode(getCodeTemplate(newLanguage))
    setTestResults(null)
    setSubmissionResult(null)
  }

  const handleRunCode = async () => {
    setIsRunning(true)
    setTestResults(null)

    try {
      // Simulate running test cases
      await new Promise(resolve => setTimeout(resolve, 2000))

      const mockResults = [
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", expected: "[0,1]", passed: true },
        { input: "nums = [3,2,4], target = 6", output: "[1,2]", expected: "[1,2]", passed: true },
        { input: "nums = [3,3], target = 6", output: "[0,1]", expected: "[0,1]", passed: true }
      ]

      setTestResults({
        passed: 3,
        total: 3,
        results: mockResults,
        runtime: "68 ms",
        memory: "42.1 MB"
      })

      toast.success("Test cases passed!")
    } catch (error) {
      toast.error("Error running code")
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmissionResult(null)

    try {
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 3000))

      const mockSubmission = {
        status: "Accepted",
        runtime: "68 ms",
        memory: "42.1 MB",
        language: language,
        passedTests: 3,
        totalTests: 3,
        submissionTime: new Date().toLocaleString()
      }

      setSubmissionResult(mockSubmission)
      toast.success("Solution accepted!")
    } catch (error) {
      toast.error("Submission failed")
    } finally {
      setIsSubmitting(false)
    }
  }

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

  if (!problem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Description */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl">{problem.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getDifficultyColor(problem.difficulty)}>
                      {problem.difficulty}
                    </Badge>
                    <Badge variant="secondary">{problem.category}</Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{problem.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{problem.dislikes}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: problem.description.replace(/\`([^`]+)\`/g, '<code>$1</code>') }} />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="examples" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="constraints">Constraints</TabsTrigger>
              <TabsTrigger value="hints">Hints</TabsTrigger>
            </TabsList>

            <TabsContent value="examples" className="space-y-4">
              {problem.examples.map((example, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">Example {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <strong>Input:</strong> <code className="bg-muted px-2 py-1 rounded">{example.input}</code>
                    </div>
                    <div>
                      <strong>Output:</strong> <code className="bg-muted px-2 py-1 rounded">{example.output}</code>
                    </div>
                    {example.explanation && (
                      <div>
                        <strong>Explanation:</strong> {example.explanation}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="constraints">
              <Card>
                <CardHeader>
                  <CardTitle>Constraints</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {problem.constraints.map((constraint, index) => (
                      <li key={index} className="text-sm">
                        • <code className="bg-muted px-1 py-0.5 rounded text-xs">{constraint}</code>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hints">
              <div className="space-y-3">
                {problem.hints.map((hint, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <p className="text-sm">{hint}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Code Editor */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Code Editor</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCode(getCodeTemplate(language))}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your solution here..."
                className="min-h-[300px] font-mono text-sm"
              />
            </CardContent>
          </Card>

          <div className="flex space-x-3">
            <Button
              onClick={handleRunCode}
              disabled={isRunning || !code.trim()}
              className="flex-1"
              variant="outline"
            >
              {isRunning ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Run Code
                </>
              )}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !code.trim()}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
          </div>

          {/* Test Results */}
          {testResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TestTube className="h-5 w-5 mr-2" />
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">
                        {testResults.passed}/{testResults.total} test cases passed
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Runtime: {testResults.runtime} | Memory: {testResults.memory}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {testResults.results.map((result, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Test Case {index + 1}</span>
                          {result.passed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="text-sm space-y-1">
                          <div><strong>Input:</strong> <code>{result.input}</code></div>
                          <div><strong>Output:</strong> <code>{result.output}</code></div>
                          <div><strong>Expected:</strong> <code>{result.expected}</code></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Result */}
          {submissionResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium text-green-800">
                    {submissionResult.status}
                  </div>
                  <div className="text-sm">
                    Runtime: {submissionResult.runtime} | Memory: {submissionResult.memory}
                  </div>
                  <div className="text-sm">
                    Passed {submissionResult.passedTests}/{submissionResult.totalTests} test cases
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}
