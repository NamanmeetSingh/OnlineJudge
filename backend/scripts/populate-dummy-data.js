const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const User = require('../src/models/User');
const Problem = require('../src/models/Problem');
const Contest = require('../src/models/Contest');
const Discussion = require('../src/models/Discussion');

// Dummy users data
const dummyUsers = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: '123456',
    rating: 1850,
    problemsSolved: 145,
    contestsParticipated: 12,
    avatar: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=random'
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: '123456',
    rating: 1642,
    problemsSolved: 89,
    contestsParticipated: 8,
    avatar: 'https://ui-avatars.com/api/?name=Bob+Smith&background=random'
  },
  {
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    password: '123456',
    rating: 2103,
    problemsSolved: 267,
    contestsParticipated: 23,
    avatar: 'https://ui-avatars.com/api/?name=Charlie+Davis&background=random'
  },
  {
    name: 'Diana Wilson',
    email: 'diana@example.com',
    password: '123456',
    rating: 1456,
    problemsSolved: 67,
    contestsParticipated: 5,
    avatar: 'https://ui-avatars.com/api/?name=Diana+Wilson&background=random'
  },
  {
    name: 'Emma Brown',
    email: 'emma@example.com',
    password: '123456',
    rating: 1789,
    problemsSolved: 134,
    contestsParticipated: 15,
    avatar: 'https://ui-avatars.com/api/?name=Emma+Brown&background=random'
  },
  {
    name: 'Frank Miller',
    email: 'frank@example.com',
    password: '123456',
    rating: 1234,
    problemsSolved: 45,
    contestsParticipated: 3,
    avatar: 'https://ui-avatars.com/api/?name=Frank+Miller&background=random'
  },
  {
    name: 'Grace Taylor',
    email: 'grace@example.com',
    password: '123456',
    rating: 1923,
    problemsSolved: 189,
    contestsParticipated: 18,
    avatar: 'https://ui-avatars.com/api/?name=Grace+Taylor&background=random'
  },
  {
    name: 'Henry Anderson',
    email: 'henry@example.com',
    password: '123456',
    rating: 1567,
    problemsSolved: 78,
    contestsParticipated: 6,
    avatar: 'https://ui-avatars.com/api/?name=Henry+Anderson&background=random'
  },
  {
    name: 'Ivy Martinez',
    email: 'ivy@example.com',
    password: '123456',
    rating: 2045,
    problemsSolved: 234,
    contestsParticipated: 20,
    avatar: 'https://ui-avatars.com/api/?name=Ivy+Martinez&background=random'
  },
  {
    name: 'Jack Thompson',
    email: 'jack@example.com',
    password: '123456',
    rating: 1398,
    problemsSolved: 56,
    contestsParticipated: 4,
    avatar: 'https://ui-avatars.com/api/?name=Jack+Thompson&background=random'
  }
];

// Dummy problems data
const dummyProblems = [
  {
    title: 'Hello World',
    slug: 'hello-world',
    difficulty: 'Easy',
    category: 'Getting Started',
    description: 'Write a function that returns the string "Hello World".',
    examples: [
      {
        input: '',
        output: 'Hello World',
        explanation: 'Simply return the string "Hello World".'
      }
    ],
    constraints: 'No input is required. Output must be exactly "Hello World".',
    tags: ['basic', 'output'],
    totalSubmissions: 5000,
    acceptedSubmissions: 4800,
    testCases: [
      {
        input: '',
        expectedOutput: 'Hello World',
        isHidden: false
      }
    ],
    starterCode: {
      python: 'class Solution:\n    def helloWorld(self) -> str:\n        # Write your code here\n        pass',
      javascript: 'var helloWorld = function() {\n    // Write your code here\n    \n};',
      java: 'class Solution {\n    public String helloWorld() {\n        // Write your code here\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    string helloWorld() {\n        // Write your code here\n        \n    }\n};',
      c: 'char* helloWorld() {\n    // Write your code here\n    \n}'
    },
    functionSignature: {
      python: {
        className: 'Solution',
        functionName: 'helloWorld',
        parameters: [],
        returnType: 'str'
      },
      javascript: {
        functionName: 'helloWorld',
        parameters: [],
        returnType: 'string'
      },
      java: {
        className: 'Solution',
        functionName: 'helloWorld',
        parameters: [],
        returnType: 'String'
      },
      cpp: {
        className: 'Solution',
        functionName: 'helloWorld',
        parameters: [],
        returnType: 'string'
      },
      c: {
        functionName: 'helloWorld',
        parameters: [],
        returnType: 'char*'
      }
    }
  },
  {
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    category: 'Array',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    examples: [
      {
        input: '[2,7,11,15]\n9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: '[3,2,4]\n6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      }
    ],
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
    tags: ['array', 'hash table'],
    totalSubmissions: 2890,
    acceptedSubmissions: 1245,
    testCases: [
      {
        input: '[2,7,11,15]\n9',
        expectedOutput: '[0,1]',
        isHidden: false
      },
      {
        input: '[3,2,4]\n6',
        expectedOutput: '[1,2]',
        isHidden: false
      },
      {
        input: '[3,3]\n6',
        expectedOutput: '[0,1]',
        isHidden: true
      }
    ],
    starterCode: {
      cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        \n    }\n};',
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        \n    }\n}',
      python: 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write your code here\n        pass',
      javascript: 'var twoSum = function(nums, target) {\n    // Write your code here\n    \n};',
      c: '#include <stdio.h>\n#include <stdlib.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Write your code here\n    \n}'
    },
    functionSignature: {
      python: {
        className: 'Solution',
        functionName: 'twoSum',
        parameters: ['nums: List[int]', 'target: int'],
        returnType: 'List[int]'
      },
      javascript: {
        functionName: 'twoSum',
        parameters: ['nums', 'target'],
        returnType: 'number[]'
      },
      java: {
        className: 'Solution',
        functionName: 'twoSum',
        parameters: ['int[] nums', 'int target'],
        returnType: 'int[]'
      },
      cpp: {
        className: 'Solution',
        functionName: 'twoSum',
        parameters: ['vector<int>& nums', 'int target'],
        returnType: 'vector<int>'
      },
      c: {
        functionName: 'twoSum',
        parameters: ['int* nums', 'int numsSize', 'int target', 'int* returnSize'],
        returnType: 'int*'
      }
    }
  },
  {
    title: 'Add Two Numbers',
    slug: 'add-two-numbers',
    difficulty: 'Medium',
    category: 'Linked List',
    description: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.',
    examples: [
      {
        input: 'l1 = [2,4,3], l2 = [5,6,4]',
        output: '[7,0,8]',
        explanation: '342 + 465 = 807.'
      }
    ],
    constraints: 'The number of nodes in each linked list is in the range [1, 100].\n0 <= Node.val <= 9\nIt is guaranteed that the list represents a number that does not have leading zeros.',
    tags: ['linked list', 'math'],
    totalSubmissions: 2345,
    acceptedSubmissions: 890,
    testCases: [
      {
        input: '2 4 3\n5 6 4',
        expectedOutput: '7 0 8',
        isHidden: false
      },
      {
        input: '0\n0',
        expectedOutput: '0',
        isHidden: false
      },
      {
        input: '9 9 9 9 9 9 9\n9 9 9 9',
        expectedOutput: '8 9 9 9 0 0 0 1',
        isHidden: true
      }
    ],
    starterCode: {
      cpp: 'struct ListNode {\n    int val;\n    ListNode *next;\n    ListNode() : val(0), next(nullptr) {}\n    ListNode(int x) : val(x), next(nullptr) {}\n    ListNode(int x, ListNode *next) : val(x), next(next) {}\n};\n\nclass Solution {\npublic:\n    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n        \n    }\n};',
      java: 'class ListNode {\n    int val;\n    ListNode next;\n    ListNode() {}\n    ListNode(int val) { this.val = val; }\n    ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n}\n\npublic class Solution {\n    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {\n        \n    }\n}',
      python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\nclass Solution:\n    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:\n        '
    }
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    category: 'String',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      }
    ],
    constraints: '0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.',
    tags: ['hash table', 'string', 'sliding window'],
    totalSubmissions: 1890,
    acceptedSubmissions: 678,
    testCases: [
      {
        input: 'abcabcbb',
        expectedOutput: '3',
        isHidden: false
      },
      {
        input: 'bbbbb',
        expectedOutput: '1',
        isHidden: false
      },
      {
        input: 'pwwkew',
        expectedOutput: '3',
        isHidden: true
      }
    ],
    starterCode: {
      cpp: 'class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        \n    }\n};',
      java: 'class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        \n    }\n}',
      python: 'class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        '
    }
  },
  {
    title: 'Median of Two Sorted Arrays',
    slug: 'median-of-two-sorted-arrays',
    difficulty: 'Hard',
    category: 'Binary Search',
    description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
    examples: [
      {
        input: 'nums1 = [1,3], nums2 = [2]',
        output: '2.00000',
        explanation: 'merged array = [1,2,3] and median is 2.'
      }
    ],
    constraints: 'nums1.length == m\nnums2.length == n\n0 <= m <= 1000\n0 <= n <= 1000\n1 <= m + n <= 2000\n-10^6 <= nums1[i], nums2[i] <= 10^6',
    tags: ['array', 'binary search'],
    totalSubmissions: 1200,
    acceptedSubmissions: 234,
    starterCode: {
      cpp: 'class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        \n    }\n};',
      java: 'class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        \n    }\n}',
      python: 'class Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        '
    }
  },
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    examples: [
      {
        input: 's = "()"',
        output: 'true'
      },
      {
        input: 's = "()[]{}"',
        output: 'true'
      },
      {
        input: 's = "(]"',
        output: 'false'
      }
    ],
    constraints: '1 <= s.length <= 10^4\ns consists of parentheses only \'()[]{}\'',
    tags: ['string', 'stack'],
    totalSubmissions: 2234,
    acceptedSubmissions: 1567,
    starterCode: {
      cpp: 'class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};',
      java: 'class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}',
      python: 'class Solution:\n    def isValid(self, s: str) -> bool:\n        '
    }
  },
  {
    title: 'Add Two Integers',
    slug: 'add-two-integers',
    difficulty: 'Easy',
    category: 'Math',
    description: 'Given two integers a and b, return their sum.',
    examples: [
      {
        input: '2\n3',
        output: '5',
        explanation: '2 + 3 = 5'
      },
      {
        input: '-1\n1',
        output: '0',
        explanation: '-1 + 1 = 0'
      }
    ],
    constraints: '-10^9 <= a, b <= 10^9',
    tags: ['math', 'basic'],
    totalSubmissions: 3000,
    acceptedSubmissions: 2850,
    testCases: [
      {
        input: '2\n3',
        expectedOutput: '5',
        isHidden: false
      },
      {
        input: '-1\n1',
        expectedOutput: '0',
        isHidden: false
      },
      {
        input: '100\n200',
        expectedOutput: '300',
        isHidden: true
      }
    ],
    starterCode: {
      python: 'class Solution:\n    def addTwoIntegers(self, a: int, b: int) -> int:\n        # Write your code here\n        pass',
      javascript: 'var addTwoIntegers = function(a, b) {\n    // Write your code here\n    \n};',
      java: 'class Solution {\n    public int addTwoIntegers(int a, int b) {\n        // Write your code here\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    int addTwoIntegers(int a, int b) {\n        // Write your code here\n        \n    }\n};',
      c: 'int addTwoIntegers(int a, int b) {\n    // Write your code here\n    \n}'
    },
    functionSignature: {
      python: {
        className: 'Solution',
        functionName: 'addTwoIntegers',
        parameters: ['a: int', 'b: int'],
        returnType: 'int'
      },
      javascript: {
        functionName: 'addTwoIntegers',
        parameters: ['a', 'b'],
        returnType: 'number'
      },
      java: {
        className: 'Solution',
        functionName: 'addTwoIntegers',
        parameters: ['int a', 'int b'],
        returnType: 'int'
      },
      cpp: {
        className: 'Solution',
        functionName: 'addTwoIntegers',
        parameters: ['int a', 'int b'],
        returnType: 'int'
      },
      c: {
        functionName: 'addTwoIntegers',
        parameters: ['int a', 'int b'],
        returnType: 'int'
      }
    }
  }
];

// Dummy contests data
const dummyContests = [
  {
    name: 'Weekly Contest 123',
    slug: 'weekly-contest-123',
    description: 'Regular weekly programming contest with 4 problems',
    type: 'Rated',
    startTime: new Date('2024-01-15T14:00:00Z'),
    endTime: new Date('2024-01-15T15:30:00Z'),
    duration: 90,
    registrationStartTime: new Date('2024-01-10T00:00:00Z'),
    registrationEndTime: new Date('2024-01-15T13:00:00Z'),
    status: 'Finished',
    participants: [],
    problems: []
  },
  {
    name: 'Monthly Challenge February',
    slug: 'monthly-challenge-february',
    description: 'Monthly challenge with advanced algorithmic problems',
    type: 'Educational',
    startTime: new Date('2024-02-01T00:00:00Z'),
    endTime: new Date('2024-02-01T02:30:00Z'),
    duration: 150,
    registrationStartTime: new Date('2024-01-25T00:00:00Z'),
    registrationEndTime: new Date('2024-01-31T23:59:59Z'),
    status: 'Finished',
    participants: [],
    problems: []
  },
  {
    name: 'Spring Coding Marathon',
    slug: 'spring-coding-marathon',
    description: 'A 3-hour intensive coding marathon',
    type: 'Global',
    startTime: new Date('2024-03-15T16:00:00Z'),
    endTime: new Date('2024-03-15T19:00:00Z'),
    duration: 180,
    registrationStartTime: new Date('2024-03-10T00:00:00Z'),
    registrationEndTime: new Date('2024-03-15T15:00:00Z'),
    status: 'Upcoming',
    participants: [],
    problems: []
  }
];

// Dummy discussions data
const dummyDiscussions = [
  {
    title: 'How to approach Dynamic Programming problems?',
    slug: 'how-to-approach-dynamic-programming-problems',
    content: 'I\'m struggling with DP problems. Can someone share some tips and common patterns?',
    tags: ['dynamic programming', 'tips', 'beginner'],
    upvotes: 45,
    downvotes: 2,
    replies: []
  },
  {
    title: 'Best practices for competitive programming',
    slug: 'best-practices-for-competitive-programming',
    content: 'What are some best practices and common mistakes to avoid in competitive programming?',
    tags: ['competitive programming', 'best practices'],
    upvotes: 78,
    downvotes: 1,
    replies: []
  },
  {
    title: 'Time complexity analysis help',
    slug: 'time-complexity-analysis-help',
    content: 'Can someone help me understand the time complexity of this algorithm?',
    tags: ['time complexity', 'algorithm analysis'],
    upvotes: 23,
    downvotes: 0,
    replies: []
  }
];

async function populateDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('📊 Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Problem.deleteMany({});
    await Contest.deleteMany({});
    await Discussion.deleteMany({});

    console.log('🗑️ Cleared existing data');

    // Create users
    const hashedUsers = await Promise.all(
      dummyUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12)
      }))
    );

    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`👥 Created ${createdUsers.length} users`);

    // Create problems
    const problemsWithCreators = dummyProblems.map(problem => ({
      ...problem,
      createdBy: createdUsers[Math.floor(Math.random() * createdUsers.length)]._id
    }));

    const createdProblems = await Problem.insertMany(problemsWithCreators);
    console.log(`📝 Created ${createdProblems.length} problems`);

    // Update contests with problem references
    const updatedContests = dummyContests.map((contest, index) => {
      const contestProblems = createdProblems.slice(index * 2, (index + 1) * 2).map((problem, pIndex) => ({
        problem: problem._id,
        order: pIndex + 1,
        points: (pIndex + 1) * 100, // 100, 200, etc.
        penalty: 20
      }));

      return {
        ...contest,
        problems: contestProblems,
        createdBy: createdUsers[Math.floor(Math.random() * createdUsers.length)]._id
      };
    });

    const createdContests = await Contest.insertMany(updatedContests);
    console.log(`🏆 Created ${createdContests.length} contests`);

    // Create discussions with random authors
    const discussionsWithAuthors = dummyDiscussions.map(discussion => ({
      ...discussion,
      author: createdUsers[Math.floor(Math.random() * createdUsers.length)]._id,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last week
    }));

    const createdDiscussions = await Discussion.insertMany(discussionsWithAuthors);
    console.log(`💬 Created ${createdDiscussions.length} discussions`);

    console.log('✅ Database populated successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Problems: ${createdProblems.length}`);
    console.log(`   Contests: ${createdContests.length}`);
    console.log(`   Discussions: ${createdDiscussions.length}`);
    console.log('\n🔑 All user passwords: 123456');

  } catch (error) {
    console.error('❌ Error populating database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
  }
}

populateDatabase();
