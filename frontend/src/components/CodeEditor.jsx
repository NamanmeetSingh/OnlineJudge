import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';
import {
  PlayIcon,
  DocumentTextIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CodeEditor = ({ problem }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const editorRef = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [supportedLanguages, setSupportedLanguages] = useState({});
  const [executionMode, setExecutionMode] = useState('function'); // 'function' or 'raw'

  // Load supported languages on component mount
  useEffect(() => {
    const defaultLanguages = {
      python: {
        name: 'Python',
        defaultCode: getDefaultCode('python')
      },
      javascript: {
        name: 'JavaScript',
        defaultCode: getDefaultCode('javascript')
      },
      java: {
        name: 'Java',
        defaultCode: getDefaultCode('java')
      },
      cpp: {
        name: 'C++',
        defaultCode: getDefaultCode('cpp')
      },
      c: {
        name: 'C',
        defaultCode: getDefaultCode('c')
      }
    };

    const loadSupportedLanguages = async () => {
      try {
        const response = await ApiService.getSupportedLanguages();
        if (response.success) {
          const langMap = {};
          response.data.forEach(lang => {
            langMap[lang.name.toLowerCase()] = {
              name: lang.displayName,
              defaultCode: getDefaultCode(lang.name.toLowerCase())
            };
          });
          setSupportedLanguages(langMap);
        }
      } catch (error) {
        console.error('Failed to load supported languages:', error);
        // Fallback to default languages
        setSupportedLanguages(defaultLanguages);
      }
    };

    loadSupportedLanguages();
  }, []);

  // Update code when problem changes
  useEffect(() => {
    if (problem && Object.keys(supportedLanguages).length > 0) {
      let starterCode = '';
      if (problem.starterCode && problem.starterCode[selectedLanguage]) {
        starterCode = problem.starterCode[selectedLanguage];
      } else {
        const langConfig = supportedLanguages[selectedLanguage] || {
          name: selectedLanguage,
          defaultCode: getDefaultCode(selectedLanguage)
        };
        starterCode = langConfig.defaultCode;
      }
      setCode(starterCode);
    }
  }, [problem, selectedLanguage, supportedLanguages]);

  const getDefaultCode = (language) => {
    // If we have a problem with function signature, use it
    if (problem?.functionSignature?.[language]) {
      const signature = problem.functionSignature[language];
      
      switch (language) {
        case 'python':
          const pyParams = signature.parameters.join(', ');
          return `def ${signature.functionName}(${pyParams}):\n    # Write your code here\n    pass`;
        
        case 'javascript':
          const jsParams = signature.parameters.join(', ');
          return `function ${signature.functionName}(${jsParams}) {\n    // Write your code here\n    \n}`;
        
        case 'cpp':
          const cppParams = signature.parameters.join(', ');
          return `#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    ${signature.returnType} ${signature.functionName}(${cppParams}) {\n        // Write your code here\n        return ${signature.returnType === 'int' ? '0' : signature.returnType === 'string' ? '""' : 'nullptr'};\n    }\n};`;
        
        case 'java':
          const javaParams = signature.parameters.join(', ');
          return `public class Solution {\n    public ${signature.returnType} ${signature.functionName}(${javaParams}) {\n        // Write your code here\n        return ${signature.returnType === 'int' ? '0' : signature.returnType === 'String' ? '""' : 'null'};\n    }\n}`;
        
        case 'c':
          const cParams = signature.parameters.join(', ');
          return `#include <stdio.h>\n\n${signature.returnType} ${signature.functionName}(${cParams}) {\n    // Write your code here\n    return ${signature.returnType === 'int' ? '0' : signature.returnType === 'char*' ? '""' : 'NULL'};\n}`;
        
        default:
          return `// Write your code here for ${language}`;
      }
    }
    
    // Fallback to default templates if no function signature
    const defaultCodes = {
      python: `def solution():\n    # Write your code here\n    pass`,
      javascript: `function solution() {\n    // Write your code here\n    \n}`,
      cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int solve() {\n        // Write your code here\n        return 0;\n    }\n};`,
      java: `public class Solution {\n    public int solve() {\n        // Write your code here\n        return 0;\n    }\n}`,
      c: `#include <stdio.h>\n\nint solution() {\n    // Write your code here\n    return 0;\n}`
    };
    
    return defaultCodes[language] || `// Write your code here for ${language}`;
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    
    // Use problem's starter code if available, otherwise use default
    let starterCode = '';
    if (problem?.starterCode && problem.starterCode[lang]) {
      starterCode = problem.starterCode[lang];
    } else {
      const langConfig = supportedLanguages[lang] || {
        name: lang,
        defaultCode: getDefaultCode(lang)
      };
      starterCode = langConfig.defaultCode;
    }
    
    setCode(starterCode);
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    
    // Use problem's starter code if available, otherwise use default
    let starterCode = '';
    if (problem?.starterCode && problem.starterCode[selectedLanguage]) {
      starterCode = problem.starterCode[selectedLanguage];
    } else {
      const langConfig = supportedLanguages[selectedLanguage] || {
        name: selectedLanguage,
        defaultCode: getDefaultCode(selectedLanguage)
      };
      starterCode = langConfig.defaultCode;
    }
    
    setCode(starterCode);
  };

  const runCode = async () => {
    console.log('Run code called, user:', user);
    console.log('User exists:', !!user);
    
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    if (!user) {
      toast.error('Please login to run code');
      return;
    }

    setIsRunning(true);
    setOutput('Running code...');

    try {
      let response;
      
      if (executionMode === 'function' && problem?.functionSignature?.[selectedLanguage]) {
        // Use function-based execution (LeetCode style)
        response = await ApiService.executeFunctionCode({
          code,
          language: selectedLanguage,
          problemId: problem.id,
          timeLimit: 10
        });
        
        if (response.success) {
          const result = response.data;
          let outputText = '';
          
          if (result.status === 'accepted' || result.status === 'wrong_answer') {
            outputText = `${result.overallPassed ? '✅' : '❌'} Function Test Results\n\n`;
            outputText += `Test Cases Passed: ${result.passedCount}/${result.totalCount}\n\n`;
            
            // Show individual test results
            result.results.forEach((testResult, index) => {
              const status = testResult.passed ? '✅ PASS' : '❌ FAIL';
              outputText += `Test Case ${index + 1}: ${status}\n`;
                              if (!testResult.passed) {
                  outputText += `  Input: ${testResult.input}\n`;
                  outputText += `  Expected: ${testResult.expectedOutput}\n`;
                  outputText += `  Got: ${testResult.actualOutput}\n`;
                  if (testResult.error) {
                    outputText += `  Error: ${testResult.error}\n`;
                  }
                }
              outputText += '\n';
            });
            
            outputText += `Execution Time: ${result.executionTime}ms`;
          } else {
            outputText = `❌ Execution Failed\n\n`;
            outputText += `Error: ${result.error || 'Unknown error'}\n`;
          }
          
          setOutput(outputText);
          
          if (result.overallPassed) {
            toast.success('All sample test cases passed!');
          } else {
            toast.error('Some test cases failed');
          }
        }
      } else {
        // Use raw execution mode
        const inputToUse = customInput || (problem?.examples?.[0]?.input || '');
        
        response = await ApiService.executeCode({
          code,
          language: selectedLanguage,
          input: inputToUse,
          timeLimit: 10
        });

        if (response.success) {
          const result = response.data;
          let outputText = '';
          
          if (result.status === 'success') {
            outputText = `✅ Execution Successful\n\n`;
            
            // Show which input was used
            if (customInput) {
              outputText += `Custom Input:\n${customInput}\n\n`;
            } else if (problem?.examples?.[0]?.input) {
              outputText += `Sample Input (Example 1):\n${problem.examples[0].input}\n\n`;
            }
            
            outputText += `Output:\n${result.output}\n\n`;
            
            // If we used sample input, show expected output for comparison
            if (!customInput && problem?.examples?.[0]?.output) {
              outputText += `Expected Output:\n${problem.examples[0].output}\n\n`;
              
              // Simple comparison (normalize whitespace)
              const actualOutput = result.output.trim();
              const expectedOutput = problem.examples[0].output.trim();
              if (actualOutput === expectedOutput) {
                outputText += `✅ Output matches expected result!\n\n`;
              } else {
                outputText += `❓ Output differs from expected result. Check your logic.\n\n`;
              }
            }
            
            outputText += `Execution Time: ${result.executionTime}ms\n`;
            outputText += `Memory Used: ${result.memoryUsed} bytes`;
          } else {
            outputText = `❌ Execution Failed\n\n`;
            outputText += `Error:\n${result.error}\n\n`;
            if (result.output) {
              outputText += `Output:\n${result.output}\n\n`;
            }
            outputText += `Execution Time: ${result.executionTime}ms`;
          }
          
          setOutput(outputText);
          
          if (result.status === 'success') {
            toast.success('Code executed successfully!');
          } else {
            toast.error('Code execution failed');
          }
        }
      }

      if (!response.success) {
        throw new Error(response.message || 'Execution failed');
      }
    } catch (error) {
      console.error('Code execution error:', error);
      setOutput(`❌ Execution Error\n\n${error.message}`);
      toast.error(error.message || 'Failed to execute code');
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    console.log('Submit code called, user:', user);
    console.log('User exists:', !!user);
    
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    if (!user) {
      toast.error('Please login to submit solution');
      return;
    }

    if (!problem?.id) {
      toast.error('Problem ID not found');
      return;
    }

    setIsSubmitting(true);
    setOutput('Submitting solution...');

    try {
      let response;
      
      if (executionMode === 'function' && problem?.functionSignature?.[selectedLanguage]) {
        // Use function-based submission (LeetCode style)
        response = await ApiService.submitFunctionSolution({
          code,
          language: selectedLanguage,
          problemId: problem.id
        });
      } else {
        // Use raw submission mode
        response = await ApiService.submitSolution({
          code,
          language: selectedLanguage,
          problemId: problem.id
        });
      }

      if (response.success) {
        const result = response.data;
        
        // Create submission object for display
        const newSubmission = {
          id: result.submissionId,
          timestamp: new Date().toLocaleString(),
          status: result.status,
          runtime: `${result.executionTime}ms`,
          memory: `${Math.round(result.memoryUsed / 1024)}KB`,
          language: supportedLanguages[selectedLanguage]?.name || selectedLanguage,
          testsPassed: result.passedTestCases,
          totalTests: result.totalTestCases
        };

        setSubmissions([newSubmission, ...submissions]);

        // Display detailed results
        let outputText = '';
        
        if (result.status === 'accepted') {
          outputText = `🎉 Accepted!\n\n`;
          outputText += `Passed: ${result.passedTestCases}/${result.totalTestCases} test cases\n`;
          outputText += `Execution Time: ${result.executionTime}ms\n`;
          outputText += `Memory Used: ${Math.round(result.memoryUsed / 1024)}KB\n\n`;
          toast.success('Solution accepted!');
        } else {
          outputText = `❌ ${result.status.replace('_', ' ').toUpperCase()}\n\n`;
          outputText += `Passed: ${result.passedTestCases}/${result.totalTestCases} test cases\n`;
          outputText += `Execution Time: ${result.executionTime}ms\n`;
          outputText += `Memory Used: ${Math.round(result.memoryUsed / 1024)}KB\n\n`;
          
          // Show first failed test case details
          if (result.testCaseResults && result.testCaseResults.length > 0) {
            const failedTest = result.testCaseResults.find(tc => tc.status !== 'passed');
            if (failedTest) {
              outputText += `Failed Test Case ${failedTest.testCaseNumber}:\n`;
              outputText += `Input: ${failedTest.input}\n`;
              outputText += `Expected: ${failedTest.expectedOutput}\n`;
              outputText += `Your Output: ${failedTest.actualOutput}\n`;
              if (failedTest.error) {
                outputText += `Error: ${failedTest.error}\n`;
              }
            }
          }
          
          toast.error('Solution not accepted. Check the output for details.');
        }
        
        setOutput(outputText);
        
        // Switch to submissions tab to show the new submission
        setActiveTab('submissions');
        
      } else {
        throw new Error(response.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setOutput(`❌ Submission Error\n\n${error.message}`);
      toast.error(error.message || 'Failed to submit solution');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAIAssistance = async () => {
    if (!user) {
      toast.error('Please login to use AI assistance');
      return;
    }

    setShowAIAssistant(true);
    setAiResponse('🤖 Analyzing your code with Gemini AI...');

    try {
      const response = await ApiService.getAIAssistance({
        code: code || 'No code provided',
        language: selectedLanguage,
        problem: problem,
        question: 'Please analyze my code and provide suggestions for improvement.'
      });

      if (response.success) {
        setAiResponse(response.data.analysis);
        toast.success('AI analysis completed!');
      } else {
        throw new Error(response.message || 'AI assistance failed');
      }
    } catch (error) {
      console.error('AI assistance error:', error);
      const errorMessage = `❌ AI Analysis Failed\n\n${error.message || 'Unable to connect to AI service'}\n\nPlease try again later or check your internet connection.`;
      setAiResponse(errorMessage);
      toast.error('AI assistance failed');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {problem?.title || 'Loading...'}
          </h1>
          <div className="flex items-center space-x-4">
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {Object.keys(supportedLanguages).length > 0 
                ? Object.entries(supportedLanguages).map(([key, lang]) => (
                    <option key={key} value={key}>
                      {lang.name}
                    </option>
                  ))
                : ['python', 'javascript', 'java', 'cpp', 'c'].map((key) => (
                    <option key={key} value={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </option>
                  ))
              }
            </select>
            
            {/* Execution Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Mode:</span>
              <select
                value={executionMode}
                onChange={(e) => setExecutionMode(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="function">LeetCode Style</option>
                <option value="raw">Raw Code</option>
              </select>
            </div>

            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md transition-colors"
            >
              <PlayIcon className="h-4 w-4" />
              <span>{isRunning ? 'Running...' : 'Run'}</span>
            </button>
            <button
              onClick={submitCode}
              disabled={isSubmitting || isRunning}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
            >
              <DocumentTextIcon className="h-4 w-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
            </button>
            <button
              onClick={getAIAssistance}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
            >
              <SparklesIcon className="h-4 w-4" />
              <span>AI Help</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {['description', 'submissions', 'discussions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-800">
            {activeTab === 'description' && (
              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {problem?.title || 'Two Sum'}
                </h2>
                
                <div className="flex items-center space-x-4 mb-6">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                    Easy
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Acceptance Rate: 49.1%
                  </span>
                </div>

                <div className="text-gray-700 dark:text-gray-300 space-y-4">
                  <p>
                    {problem?.description || 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.'}
                  </p>
                  
                  <p>
                    You may assume that each input would have exactly one solution, and you may not use the same element twice.
                  </p>
                  
                  <p>You can return the answer in any order.</p>

                  {problem?.examples?.map((example, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Example {idx + 1}:</h4>
                      <pre className="text-sm">
{`Input: ${example.input}
Output: ${example.output}${example.explanation ? `
Explanation: ${example.explanation}` : ''}`}
                      </pre>
                    </div>
                  )) || (
                    <>
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Example 1:</h4>
                        <pre className="text-sm">
{`Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`}
                        </pre>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Example 2:</h4>
                        <pre className="text-sm">
{`Input: nums = [3,2,4], target = 6
Output: [1,2]`}
                        </pre>
                      </div>
                    </>
                  )}

                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Constraints:</h4>
                    <div className="text-sm whitespace-pre-line">
                      {problem?.constraints || `2 ≤ nums.length ≤ 10⁴
-10⁹ ≤ nums[i] ≤ 10⁹
-10⁹ ≤ target ≤ 10⁹
Only one valid answer exists.`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  My Submissions
                </h3>
                {submissions.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No submissions yet.</p>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {submission.status === 'Accepted' ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircleIcon className="h-5 w-5 text-red-500" />
                            )}
                            <span className={`font-medium ${
                              submission.status === 'Accepted' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {submission.status}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {submission.timestamp}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div>Runtime: {submission.runtime}</div>
                          <div>Memory: {submission.memory}</div>
                          <div>Language: {submission.language}</div>
                          <div>Tests: {submission.testsPassed}/{submission.totalTests}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'discussions' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Discussions
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Join the discussion about this problem with other developers.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          <div className="flex-1 flex flex-col">
            {/* Function Signature Display */}
            {executionMode === 'function' && problem?.functionSignature?.[selectedLanguage] && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-t-lg p-3">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Function Signature:
                </div>
                <div className="font-mono text-sm text-blue-900 dark:text-blue-100">
                  {(() => {
                    const signature = problem.functionSignature[selectedLanguage];
                    switch (selectedLanguage) {
                      case 'python':
                        return `def ${signature.functionName}(${signature.parameters.join(', ')}): -> ${signature.returnType}`;
                      case 'javascript':
                        return `function ${signature.functionName}(${signature.parameters.join(', ')}) -> ${signature.returnType}`;
                      case 'cpp':
                      case 'java':
                        return `${signature.returnType} ${signature.functionName}(${signature.parameters.join(', ')})`;
                      case 'c':
                        return `${signature.returnType} ${signature.functionName}(${signature.parameters.join(', ')})`;
                      default:
                        return `${signature.functionName}(${signature.parameters.join(', ')}) -> ${signature.returnType}`;
                    }
                  })()}
                </div>
              </div>
            )}
            
            <Editor
              height="100%"
              defaultLanguage={selectedLanguage}
              value={code}
              onChange={setCode}
              theme={isDark ? 'vs-dark' : 'light'}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'on',
                folding: true,
                showFoldingControls: 'always'
              }}
            />
          </div>

          {/* Output Panel */}
          <div className="h-2/5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Output
                </h3>
                <div className="flex items-center space-x-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    Custom Input:
                  </label>
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter test input..."
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 font-mono text-sm text-gray-800 dark:text-gray-200 overflow-y-auto" style={{height: 'calc(100% - 60px)'}}>
              <pre className="whitespace-pre-wrap">{output || 'Click "Run" to execute your code with custom input, or "Submit" to test against all test cases'}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl max-h-2xl overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-purple-600" />
                AI Code Assistant
              </h3>
              <button
                onClick={() => setShowAIAssistant(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                {aiResponse}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
