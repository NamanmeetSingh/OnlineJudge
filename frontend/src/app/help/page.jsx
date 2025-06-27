"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  HelpCircle, 
  Search, 
  Book, 
  Code, 
  Trophy, 
  Users, 
  MessageCircle,
  Settings,
  Shield,
  Zap,
  Target,
  Star,
  ChevronRight,
  ExternalLink,
  Mail,
  Phone
} from "lucide-react"

// Mock help content
const helpCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: <Star className="h-5 w-5" />,
    description: "New to CodeMaster? Start here!",
    articles: [
      { title: "Creating Your Account", slug: "creating-account", popular: true },
      { title: "First Problem Submission", slug: "first-submission", popular: true },
      { title: "Understanding the Interface", slug: "interface-guide" },
      { title: "Setting Up Your Profile", slug: "profile-setup" }
    ]
  },
  {
    id: "problems",
    title: "Problems & Solutions",
    icon: <Target className="h-5 w-5" />,
    description: "Learn how to solve coding problems",
    articles: [
      { title: "How to Read Problem Statements", slug: "reading-problems", popular: true },
      { title: "Understanding Test Cases", slug: "test-cases" },
      { title: "Common Algorithm Patterns", slug: "algorithm-patterns", popular: true },
      { title: "Time and Space Complexity", slug: "complexity-analysis" },
      { title: "Debugging Your Solutions", slug: "debugging-tips" }
    ]
  },
  {
    id: "contests",
    title: "Contests",
    icon: <Trophy className="h-5 w-5" />,
    description: "Everything about competitive programming",
    articles: [
      { title: "Joining Your First Contest", slug: "first-contest", popular: true },
      { title: "Contest Rules and Scoring", slug: "contest-rules" },
      { title: "Rating System Explained", slug: "rating-system" },
      { title: "Contest Strategies", slug: "contest-strategies" }
    ]
  },
  {
    id: "community",
    title: "Community",
    icon: <Users className="h-5 w-5" />,
    description: "Connect with other programmers",
    articles: [
      { title: "Discussion Guidelines", slug: "discussion-rules" },
      { title: "How to Ask Good Questions", slug: "asking-questions", popular: true },
      { title: "Contributing to Discussions", slug: "contributing" },
      { title: "Reporting Issues", slug: "reporting" }
    ]
  },
  {
    id: "account",
    title: "Account & Settings",
    icon: <Settings className="h-5 w-5" />,
    description: "Manage your account preferences",
    articles: [
      { title: "Profile Settings", slug: "profile-settings" },
      { title: "Notification Preferences", slug: "notifications" },
      { title: "Privacy Settings", slug: "privacy" },
      { title: "Account Security", slug: "security" }
    ]
  }
]

const faqData = [
  {
    question: "How do I start solving problems?",
    answer: "Navigate to the Problems page, filter by difficulty (start with Easy), read the problem statement carefully, and submit your solution using the code editor. Make sure to test your solution with the provided examples first."
  },
  {
    question: "What programming languages are supported?",
    answer: "We support Python, Java, C++, JavaScript, Go, Rust, and many more. You can select your preferred language from the dropdown in the code editor."
  },
  {
    question: "How does the rating system work?",
    answer: "Your rating is calculated based on your contest performance. Each contest participation affects your rating - solving problems correctly and quickly increases your rating, while poor performance may decrease it."
  },
  {
    question: "Can I see others' solutions?",
    answer: "Yes! Once you've successfully solved a problem, you can view other users' solutions to learn different approaches and optimize your own code."
  },
  {
    question: "How do I prepare for contests?",
    answer: "Practice regularly, focus on understanding algorithm patterns, time your solutions, and participate in practice contests. Review editorials and learn from your mistakes."
  },
  {
    question: "What if my solution times out?",
    answer: "This means your solution is too slow. Consider optimizing your algorithm, using more efficient data structures, or reducing the time complexity of your approach."
  },
  {
    question: "How can I improve my ranking?",
    answer: "Consistently solve problems, participate in contests, engage with the community, and continuously learn new algorithms and data structures."
  },
  {
    question: "Is there a mobile app?",
    answer: "Currently, we offer a responsive web application that works great on mobile devices. A dedicated mobile app is in development."
  }
]

const quickLinks = [
  { title: "Problem List", href: "/problems", icon: <Target className="h-4 w-4" /> },
  { title: "Contest Calendar", href: "/contests", icon: <Trophy className="h-4 w-4" /> },
  { title: "Leaderboard", href: "/leaderboard", icon: <Users className="h-4 w-4" /> },
  { title: "Discussions", href: "/discussions", icon: <MessageCircle className="h-4 w-4" /> },
  { title: "Profile Settings", href: "/profile", icon: <Settings className="h-4 w-4" /> }
]

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("getting-started")

  const filteredCategories = helpCategories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.articles.some(article => 
      article.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="h-10 w-10 text-blue-500" />
            <h1 className="text-4xl font-bold text-gray-900">Help Center</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to your questions and learn how to get the most out of CodeMaster
          </p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search for help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickLinks.map((link, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Link href={link.href} className="flex flex-col items-center gap-2 text-gray-700 hover:text-blue-600">
                    {link.icon}
                    <span className="text-sm font-medium">{link.title}</span>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  <div className="space-y-1 p-4">
                    {helpCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {category.icon}
                          <div>
                            <p className="font-medium">{category.title}</p>
                            <p className="text-xs text-gray-600">{category.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Need More Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
                <Button className="w-full" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Live Chat
                </Button>
                <div className="text-center text-sm text-gray-600">
                  Response time: 2-4 hours
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="articles" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="articles">Help Articles</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>

              <TabsContent value="articles" className="space-y-6">
                {/* Category Articles */}
                {filteredCategories.map((category) => (
                  <Card key={category.id} className={selectedCategory === category.id ? 'ring-2 ring-blue-200' : ''}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {category.icon}
                        <div>
                          <CardTitle>{category.title}</CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {category.articles.map((article, index) => (
                          <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                              <Book className="h-4 w-4 text-gray-500" />
                              <div>
                                <h4 className="font-medium">{article.title}</h4>
                                {article.popular && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    Popular
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="faq" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>
                      Quick answers to common questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {faqData.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Popular Resources */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Popular Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Code className="h-6 w-6 text-blue-500" />
                  <CardTitle className="text-lg">Algorithm Guide</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Comprehensive guide to common algorithms and data structures used in competitive programming.
                </p>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Guide
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-green-500" />
                  <CardTitle className="text-lg">Performance Tips</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Learn how to optimize your code for better performance and avoid common pitfalls.
                </p>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Read Tips
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  <CardTitle className="text-lg">Contest Prep</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Essential strategies and preparation techniques for competitive programming contests.
                </p>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get Prepared
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Still Need Help?</CardTitle>
              <CardDescription>
                Our support team is here to help you succeed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button size="lg" className="w-full">
                  <Mail className="h-5 w-5 mr-2" />
                  Email Support
                </Button>
                <Button size="lg" variant="outline" className="w-full">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Community Forum
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Average response time: 2-4 hours • Available 24/7
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
