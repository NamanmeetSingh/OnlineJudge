require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Problem = require('../src/models/Problem');
const User = require('../src/models/User');

// Sample problems with function signatures
const sampleProblems = [
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    difficulty: "Easy",
    category: "Array",
    tags: ["array", "hash-table", "two-pointers"],
    constraints: "2 ≤ nums.length ≤ 10⁴\n-10⁹ ≤ nums[i] ≤ 10⁹\n-10⁹ ≤ target ≤ 10⁹\nOnly one valid answer exists.",
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
    testCases: [
      {
        input: "[2,7,11,15]\n9",
        expectedOutput: "[0,1]",
        isHidden: false
      },
      {
        input: "[3,2,4]\n6",
        expectedOutput: "[1,2]",
        isHidden: false
      },
      {
        input: "[3,3]\n6",
        expectedOutput: "[0,1]",
        isHidden: false
      },
      {
        input: "[1,5,8,10,13]\n18",
        expectedOutput: "[2,4]",
        isHidden: true
      },
      {
        input: "[0,4,3,0]\n0",
        expectedOutput: "[0,3]",
        isHidden: true
      }
    ],
    functionSignature: {
      python: {
        className: null,
        functionName: "twoSum",
        parameters: ["nums", "target"],
        returnType: "List[int]"
      },
      javascript: {
        functionName: "twoSum",
        parameters: ["nums", "target"],
        returnType: "number[]"
      },
      java: {
        className: "Solution",
        functionName: "twoSum",
        parameters: ["int[] nums", "int target"],
        returnType: "int[]"
      },
      cpp: {
        className: "Solution",
        functionName: "twoSum",
        parameters: ["vector<int>& nums", "int target"],
        returnType: "vector<int>"
      },
      c: {
        functionName: "twoSum",
        parameters: ["int* nums", "int numsSize", "int target", "int* returnSize"],
        returnType: "int*"
      }
    },
    starterCode: {
      python: `def twoSum(nums, target):
    # Write your code here
    pass`,
      javascript: `function twoSum(nums, target) {
    // Write your code here
    
}`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[0];
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
        return {};
    }
};`,
      c: `int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Write your code here
    *returnSize = 2;
    return NULL;
}`
    },
    solution: {
      approach: "Use a hash map to store each number and its index. For each number, check if the complement (target - number) exists in the hash map.",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)"
    }
  },
  {
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order. Every close bracket has a corresponding open bracket of the same type.",
    difficulty: "Easy",
    category: "Stack",
    tags: ["stack", "string"],
    constraints: "1 ≤ s.length ≤ 10⁴\ns consists of parentheses only '()[]{}'",
    examples: [
      {
        input: "s = \"()\"",
        output: "true",
        explanation: "Simple valid parentheses."
      },
      {
        input: "s = \"()[]{}\"",
        output: "true",
        explanation: "Multiple valid parentheses."
      },
      {
        input: "s = \"(]\"",
        output: "false",
        explanation: "Invalid parentheses."
      }
    ],
    testCases: [
      {
        input: "()",
        expectedOutput: "true",
        isHidden: false
      },
      {
        input: "()[]{}",
        expectedOutput: "true",
        isHidden: false
      },
      {
        input: "(]",
        expectedOutput: "false",
        isHidden: false
      },
      {
        input: "([)]",
        expectedOutput: "false",
        isHidden: true
      },
      {
        input: "{[]}",
        expectedOutput: "true",
        isHidden: true
      }
    ],
    functionSignature: {
      python: {
        className: null,
        functionName: "isValid",
        parameters: ["s"],
        returnType: "bool"
      },
      javascript: {
        functionName: "isValid",
        parameters: ["s"],
        returnType: "boolean"
      },
      java: {
        className: "Solution",
        functionName: "isValid",
        parameters: ["String s"],
        returnType: "boolean"
      },
      cpp: {
        className: "Solution",
        functionName: "isValid",
        parameters: ["string s"],
        returnType: "bool"
      },
      c: {
        functionName: "isValid",
        parameters: ["char* s"],
        returnType: "bool"
      }
    },
    starterCode: {
      python: `def isValid(s):
    # Write your code here
    pass`,
      javascript: `function isValid(s) {
    // Write your code here
    
}`,
      java: `class Solution {
    public boolean isValid(String s) {
        // Write your code here
        return false;
    }
}`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        // Write your code here
        return false;
    }
};`,
      c: `bool isValid(char* s) {
    // Write your code here
    return false;
}`
    },
    solution: {
      approach: "Use a stack to keep track of opening brackets. For each closing bracket, check if it matches the top of the stack.",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)"
    }
  },
  {
    title: "Maximum Subarray",
    description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    difficulty: "Medium",
    category: "Dynamic Programming",
    tags: ["array", "dynamic-programming", "divide-and-conquer"],
    constraints: "1 ≤ nums.length ≤ 10⁵\n-10⁴ ≤ nums[i] ≤ 10⁴",
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum 6."
      },
      {
        input: "nums = [1]",
        output: "1",
        explanation: "The subarray [1] has the largest sum 1."
      },
      {
        input: "nums = [5,4,-1,7,8]",
        output: "23",
        explanation: "The subarray [5,4,-1,7,8] has the largest sum 23."
      }
    ],
    testCases: [
      {
        input: "[-2,1,-3,4,-1,2,1,-5,4]",
        expectedOutput: "6",
        isHidden: false
      },
      {
        input: "[1]",
        expectedOutput: "1",
        isHidden: false
      },
      {
        input: "[5,4,-1,7,8]",
        expectedOutput: "23",
        isHidden: false
      },
      {
        input: "[-1,-2,-3,-4]",
        expectedOutput: "-1",
        isHidden: true
      },
      {
        input: "[2,3,-2,4]",
        expectedOutput: "7",
        isHidden: true
      }
    ],
    functionSignature: {
      python: {
        className: null,
        functionName: "maxSubArray",
        parameters: ["nums"],
        returnType: "int"
      },
      javascript: {
        functionName: "maxSubArray",
        parameters: ["nums"],
        returnType: "number"
      },
      java: {
        className: "Solution",
        functionName: "maxSubArray",
        parameters: ["int[] nums"],
        returnType: "int"
      },
      cpp: {
        className: "Solution",
        functionName: "maxSubArray",
        parameters: ["vector<int>& nums"],
        returnType: "int"
      },
      c: {
        functionName: "maxSubArray",
        parameters: ["int* nums", "int numsSize"],
        returnType: "int"
      }
    },
    starterCode: {
      python: `def maxSubArray(nums):
    # Write your code here
    pass`,
      javascript: `function maxSubArray(nums) {
    // Write your code here
    
}`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Write your code here
        return 0;
    }
};`,
      c: `int maxSubArray(int* nums, int numsSize) {
    // Write your code here
    return 0;
}`
    },
    solution: {
      approach: "Use Kadane's algorithm to find the maximum subarray sum. Keep track of current sum and maximum sum seen so far.",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)"
    }
  }
];

async function populateProblems() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'online-judge'
    });
    console.log('Connected to MongoDB');

    // Find or create admin user
    let adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      console.log('Creating admin user...');
      adminUser = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123', // This will be hashed
        role: 'admin',
        isVerified: true
      });
      await adminUser.save();
      console.log('Admin user created');
    }

    // Clear existing problems
    await Problem.deleteMany({});
    console.log('Cleared existing problems');

    // Create problems
    for (const problemData of sampleProblems) {
      const problem = new Problem({
        ...problemData,
        createdBy: adminUser._id,
        lastUpdatedBy: adminUser._id
      });
      
      await problem.save();
      console.log(`Created problem: ${problem.title}`);
    }

    console.log(`Successfully created ${sampleProblems.length} problems`);
    
    // Display problem details
    const problems = await Problem.find({}).select('title slug difficulty category');
    console.log('\nCreated problems:');
    problems.forEach(p => {
      console.log(`- ${p.title} (${p.difficulty}) - ${p.category}`);
    });

  } catch (error) {
    console.error('Error populating problems:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  populateProblems();
}

module.exports = { populateProblems, sampleProblems };
