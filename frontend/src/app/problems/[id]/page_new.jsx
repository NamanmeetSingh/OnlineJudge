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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  RotateCcw,
  AlertCircle,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { problemsApi, executionApi, submissionsApi } from "@/lib/api"
import { LANGUAGES, SUBMISSION_STATUS } from "@/constants"

export default function ProblemPage() {
  const params = useParams()
  const problemSlug = params.id

  const [problem, setProblem] = useState(null)
  const [testCases, setTestCases] = useState([])
  const [code, setCode] = useState("")
  const [customInput, setCustomInput] = useState("")
  const [language, setLanguage] = useState(LANGUAGES.JAVASCRIPT)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [runResult, setRunResult] = useState(null)
  const [submissionResult, setSubmissionResult] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Language templates
  const codeTemplates = {
    [LANGUAGES.JAVASCRIPT]: `function solution() {
    // Write your code here
    
}`,
    [LANGUAGES.PYTHON]: `def solution():
    # Write your code here
    pass`,
    [LANGUAGES.CPP]: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    // Write your code here
    return 0;
}`,
    [LANGUAGES.C]: `#include <stdio.h>

int main() {
    // Write your code here
    return 0;
}`,
    [LANGUAGES.JAVA]: `public class Solution {
    public static void main(String[] args) {
        // Write your code here
    }
}`
  };

  // Fetch problem data
  useEffect(() => {
    if (problemSlug) {
      fetchProblem()
    }
  }, [problemSlug])

  // Update code template when language changes
  useEffect(() => {
    if (codeTemplates[language] && !code.trim()) {
      setCode(codeTemplates[language])
    }
  }, [language])

  const fetchProblem = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [problemResponse, testCasesResponse] = await Promise.all([
        problemsApi.getProblem(problemSlug),
        problemsApi.getTestCases(problemSlug).catch(() => ({ data: { testCases: [] } }))
      ])

      if (problemResponse.success) {
        setProblem(problemResponse.data.problem)
        setTestCases(testCasesResponse.data?.testCases || [])
        
        // Set initial code template
        if (!code.trim()) {
          setCode(codeTemplates[language])
        }
      } else {
        setError('Problem not found')
      }
    } catch (err) {
      console.error('Error fetching problem:', err)
      setError(err.message || 'Failed to load problem')
    } finally {
      setIsLoading(false)
    }
  }

  const runCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first')
      return
    }

    try {
      setIsRunning(true)
      setRunResult(null)

      const response = await executionApi.runCode({
        code,
        language,
        stdin: customInput
      })

      if (response.success) {
        setRunResult(response.data)
        toast.success('Code executed successfully')
      } else {
        toast.error('Code execution failed')
      }
    } catch (err) {
      console.error('Run code error:', err)
      toast.error(err.message || 'Failed to run code')
    } finally {
      setIsRunning(false)
    }
  }

  const submitCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first')
      return
    }

    if (!problem) {
      toast.error('Problem data not loaded')
      return
    }

    try {
      setIsSubmitting(true)
      setSubmissionResult(null)

      // Create submission
      const submissionResponse = await submissionsApi.createSubmission({
        problemId: problem._id,
        code,
        language
      })

      if (submissionResponse.success) {
        setSubmissionResult(submissionResponse.data.submission)
        
        if (submissionResponse.data.submission.status === SUBMISSION_STATUS.ACCEPTED) {
          toast.success('Congratulations! Your solution was accepted!')
        } else {
          toast.error(`Submission ${submissionResponse.data.submission.status}`)
        }
      } else {
        toast.error('Submission failed')
      }
    } catch (err) {
      console.error('Submit code error:', err)
      toast.error(err.message || 'Failed to submit code')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return "bg-green-100 text-green-800"
      case 'medium': return "bg-yellow-100 text-yellow-800"  
      case 'hard': return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case SUBMISSION_STATUS.ACCEPTED: return "text-green-600"
      case SUBMISSION_STATUS.WRONG_ANSWER: return "text-red-600"
      case SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED: return "text-orange-600"
      case SUBMISSION_STATUS.RUNTIME_ERROR: return "text-purple-600"
      case SUBMISSION_STATUS.COMPILATION_ERROR: return "text-red-600"
      default: return "text-gray-600"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case SUBMISSION_STATUS.ACCEPTED: return <CheckCircle className="w-4 h-4" />
      case SUBMISSION_STATUS.WRONG_ANSWER: return <XCircle className="w-4 h-4" />
      case SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED: return <Clock className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading problem...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center text-red-600 mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Error Loading Problem</h3>
            <p className="text-gray-600 text-center mb-4">{error}</p>
            <Button onClick={fetchProblem} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!problem) {
    return <div>Problem not found</div>
  }

  return (
    <div className="flex h-screen">
      {/* Left Panel - Problem Description */}
      <div className="w-1/2 flex flex-col border-r">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <Badge className={getDifficultyColor(problem.difficulty)}>
              {problem.difficulty}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              <span>Acceptance: {Math.round(problem.acceptanceRate || 0)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <TestTube className="w-4 h-4" />
              <span>Submissions: {problem.totalSubmissions || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Code className="w-4 h-4" />
              <span>Points: {problem.points || 0}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Tabs defaultValue="description" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mx-6 mt-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="hints">Hints</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="flex-1 p-6">
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: problem.description?.replace(/\n/g, '<br>') || 'No description available' }} />
                
                {problem.constraints && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Constraints:</h3>
                    <div dangerouslySetInnerHTML={{ __html: problem.constraints.replace(/\n/g, '<br>') }} />
                  </div>
                )}

                {problem.inputFormat && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Input Format:</h3>
                    <div dangerouslySetInnerHTML={{ __html: problem.inputFormat.replace(/\n/g, '<br>') }} />
                  </div>
                )}

                {problem.outputFormat && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Output Format:</h3>
                    <div dangerouslySetInnerHTML={{ __html: problem.outputFormat.replace(/\n/g, '<br>') }} />
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="examples" className="flex-1 p-6">
              <div className="space-y-6">
                {problem.sampleTestCases && problem.sampleTestCases.length > 0 ? (
                  problem.sampleTestCases.map((testCase, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Example {index + 1}:</h4>
                      <div className="space-y-2">
                        <div>
                          <strong>Input:</strong>
                          <pre className="bg-white p-2 mt-1 rounded border text-sm">{testCase.input}</pre>
                        </div>
                        <div>
                          <strong>Output:</strong>
                          <pre className="bg-white p-2 mt-1 rounded border text-sm">{testCase.output}</pre>
                        </div>
                        {testCase.explanation && (
                          <div>
                            <strong>Explanation:</strong>
                            <p className="mt-1 text-sm">{testCase.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No examples available</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="hints" className="flex-1 p-6">
              <div className="space-y-4">
                {problem.hints && problem.hints.length > 0 ? (
                  problem.hints.map((hint, index) => (
                    <Alert key={index}>
                      <Lightbulb className="h-4 w-4" />
                      <AlertDescription>{hint}</AlertDescription>
                    </Alert>
                  ))
                ) : (
                  <p className="text-gray-500">No hints available</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="w-1/2 flex flex-col">
        {/* Editor Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Label htmlFor="language">Language:</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={LANGUAGES.JAVASCRIPT}>JavaScript</SelectItem>
                <SelectItem value={LANGUAGES.PYTHON}>Python</SelectItem>
                <SelectItem value={LANGUAGES.CPP}>C++</SelectItem>
                <SelectItem value={LANGUAGES.C}>C</SelectItem>
                <SelectItem value={LANGUAGES.JAVA}>Java</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={runCode}
              disabled={isRunning}
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Run
            </Button>
            <Button 
              onClick={submitCode}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Submit
            </Button>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your code here..."
            className="flex-1 font-mono text-sm resize-none border-0 focus:ring-0"
          />
        </div>

        {/* Bottom Panel - Input/Output */}
        <div className="h-64 border-t">
          <Tabs defaultValue="input" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="input">Input</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
              <TabsTrigger value="result">Result</TabsTrigger>
            </TabsList>
            
            <TabsContent value="input" className="flex-1 p-4">
              <div className="h-full">
                <Label htmlFor="custom-input" className="text-sm">Custom Input:</Label>
                <Textarea
                  id="custom-input"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter test input here..."
                  className="mt-2 h-32 font-mono text-sm"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="output" className="flex-1 p-4">
              <div className="h-full">
                <Label className="text-sm">Output:</Label>
                <pre className="mt-2 h-32 bg-gray-50 p-3 rounded border overflow-auto font-mono text-sm">
                  {runResult?.output || 'No output yet. Click "Run" to execute your code.'}
                </pre>
                {runResult?.error && (
                  <div className="mt-2">
                    <Label className="text-sm text-red-600">Error:</Label>
                    <pre className="mt-1 h-20 bg-red-50 p-3 rounded border overflow-auto font-mono text-sm text-red-700">
                      {runResult.error}
                    </pre>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="result" className="flex-1 p-4">
              <div className="h-full">
                <Label className="text-sm">Submission Result:</Label>
                {submissionResult ? (
                  <div className="mt-2 space-y-2">
                    <div className={`flex items-center gap-2 ${getStatusColor(submissionResult.status)}`}>
                      {getStatusIcon(submissionResult.status)}
                      <span className="font-semibold">{submissionResult.status}</span>
                    </div>
                    
                    {submissionResult.passedTestCases !== undefined && (
                      <div className="text-sm">
                        Test Cases: {submissionResult.passedTestCases}/{submissionResult.totalTestCases} passed
                      </div>
                    )}
                    
                    {submissionResult.executionTime && (
                      <div className="text-sm">
                        Execution Time: {submissionResult.executionTime}ms
                      </div>
                    )}
                    
                    {submissionResult.memoryUsed && (
                      <div className="text-sm">
                        Memory Used: {submissionResult.memoryUsed}MB
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-gray-500">No submission yet. Click "Submit" to test your solution.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
