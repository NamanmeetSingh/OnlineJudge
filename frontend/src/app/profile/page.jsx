"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Settings, 
  Trophy, 
  Target, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone, 
  Github, 
  Linkedin, 
  Globe,
  Save,
  Upload,
  Eye,
  EyeOff,
  Bell,
  Shield,
  Trash2,
  Activity
} from "lucide-react"

// Mock user data
const mockUser = {
  id: "user_123",
  name: "John Doe",
  username: "johndoe",
  email: "john@example.com",
  phone: "+1 (555) 123-4567",
  bio: "Passionate software engineer with 5+ years of experience in competitive programming and full-stack development.",
  location: "San Francisco, CA",
  website: "https://johndoe.dev",
  github: "johndoe",
  linkedin: "john-doe",
  avatar: "/api/placeholder/100/100",
  coverImage: "/api/placeholder/800/200",
  joinedAt: "2023-01-15T00:00:00Z",
  lastActive: "2024-01-15T10:30:00Z",
  stats: {
    problemsSolved: 234,
    contestsParticipated: 18,
    ranking: 1247,
    points: 3450,
    streak: 12,
    accuracy: 87.5,
    maxRating: 1856,
    currentRating: 1834
  },
  badges: [
    { name: "Problem Solver", description: "Solved 100+ problems", color: "bg-blue-500" },
    { name: "Contest Warrior", description: "Participated in 10+ contests", color: "bg-purple-500" },
    { name: "Code Ninja", description: "Maintained 7-day streak", color: "bg-green-500" },
    { name: "Community Helper", description: "Helped 50+ users", color: "bg-orange-500" }
  ],
  preferences: {
    theme: "light",
    language: "en",
    notifications: {
      email: true,
      push: true,
      contest: true,
      discussion: false,
      achievement: true
    },
    privacy: {
      profilePublic: true,
      showStats: true,
      showActivity: true,
      showEmail: false
    }
  },
  recentActivity: [
    { type: "problem", title: "Solved 'Two Sum'", time: "2h ago" },
    { type: "contest", title: "Participated in Weekly Contest #45", time: "1d ago" },
    { type: "discussion", title: "Answered 'Binary Search Help'", time: "2d ago" },
    { type: "achievement", title: "Earned 'Problem Solver' badge", time: "3d ago" }
  ]
}

export default function ProfilePage() {
  const [user, setUser] = useState(mockUser)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const handleSave = () => {
    // API call to save user data
    setIsEditing(false)
  }

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Handle avatar upload
      console.log("Uploading avatar:", file)
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "problem": return <Target className="h-4 w-4 text-blue-500" />
      case "contest": return <Trophy className="h-4 w-4 text-purple-500" />
      case "discussion": return <User className="h-4 w-4 text-green-500" />
      case "achievement": return <Trophy className="h-4 w-4 text-orange-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-lg text-gray-600">
            Manage your profile and account settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xl">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer hover:bg-blue-600">
                        <Upload className="h-3 w-3" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-1">{user.name}</h2>
                  <p className="text-gray-600 mb-2">@{user.username}</p>
                  
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Badge className="bg-purple-500 hover:bg-purple-600">
                      Expert
                    </Badge>
                    <Badge variant="secondary">
                      {user.stats.points} pts
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{user.bio}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{user.location}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{user.stats.problemsSolved}</p>
                    <p className="text-sm text-gray-600">Problems Solved</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{user.stats.contestsParticipated}</p>
                    <p className="text-sm text-gray-600">Contests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{user.stats.streak}</p>
                    <p className="text-sm text-gray-600">Day Streak</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">#{user.stats.ranking}</p>
                    <p className="text-sm text-gray-600">Global Rank</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Problem Accuracy</span>
                    <span className="text-sm text-gray-600">{user.stats.accuracy}%</span>
                  </div>
                  <Progress value={user.stats.accuracy} className="h-2" />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Rating: {user.stats.currentRating}</span>
                  <span>Max: {user.stats.maxRating}</span>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {user.badges.map((badge, index) => (
                    <div key={index} className="text-center p-3 border rounded-lg hover:bg-gray-50">
                      <div className={`w-8 h-8 ${badge.color} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                        <Trophy className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-xs font-medium">{badge.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Profile Information */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your profile information and social links
                      </CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    >
                      {isEditing ? (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </>
                      ) : (
                        "Edit Profile"
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={user.name}
                          onChange={(e) => setUser({...user, name: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={user.username}
                          onChange={(e) => setUser({...user, username: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user.email}
                          onChange={(e) => setUser({...user, email: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={user.phone}
                          onChange={(e) => setUser({...user, phone: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={user.location}
                          onChange={(e) => setUser({...user, location: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={user.website}
                          onChange={(e) => setUser({...user, website: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={user.bio}
                        onChange={(e) => setUser({...user, bio: e.target.value})}
                        disabled={!isEditing}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="github">GitHub Username</Label>
                        <Input
                          id="github"
                          value={user.github}
                          onChange={(e) => setUser({...user, github: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin">LinkedIn Username</Label>
                        <Input
                          id="linkedin"
                          value={user.linkedin}
                          onChange={(e) => setUser({...user, linkedin: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                {/* Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      Configure how you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-gray-600">Receive notifications via email</p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={user.preferences.notifications.email}
                        onCheckedChange={(checked) => 
                          setUser({
                            ...user,
                            preferences: {
                              ...user.preferences,
                              notifications: {
                                ...user.preferences.notifications,
                                email: checked
                              }
                            }
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="contest-notifications">Contest Reminders</Label>
                        <p className="text-sm text-gray-600">Get notified about upcoming contests</p>
                      </div>
                      <Switch
                        id="contest-notifications"
                        checked={user.preferences.notifications.contest}
                        onCheckedChange={(checked) => 
                          setUser({
                            ...user,
                            preferences: {
                              ...user.preferences,
                              notifications: {
                                ...user.preferences.notifications,
                                contest: checked
                              }
                            }
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="achievement-notifications">Achievement Notifications</Label>
                        <p className="text-sm text-gray-600">Get notified when you earn badges</p>
                      </div>
                      <Switch
                        id="achievement-notifications"
                        checked={user.preferences.notifications.achievement}
                        onCheckedChange={(checked) => 
                          setUser({
                            ...user,
                            preferences: {
                              ...user.preferences,
                              notifications: {
                                ...user.preferences.notifications,
                                achievement: checked
                              }
                            }
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy */}
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>
                      Control what information is publicly visible
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="public-profile">Public Profile</Label>
                        <p className="text-sm text-gray-600">Make your profile visible to others</p>
                      </div>
                      <Switch
                        id="public-profile"
                        checked={user.preferences.privacy.profilePublic}
                        onCheckedChange={(checked) => 
                          setUser({
                            ...user,
                            preferences: {
                              ...user.preferences,
                              privacy: {
                                ...user.preferences.privacy,
                                profilePublic: checked
                              }
                            }
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-stats">Show Statistics</Label>
                        <p className="text-sm text-gray-600">Display your coding statistics</p>
                      </div>
                      <Switch
                        id="show-stats"
                        checked={user.preferences.privacy.showStats}
                        onCheckedChange={(checked) => 
                          setUser({
                            ...user,
                            preferences: {
                              ...user.preferences,
                              privacy: {
                                ...user.preferences.privacy,
                                showStats: checked
                              }
                            }
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>
                      Customize your experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <Select value={user.preferences.theme} onValueChange={(value) => 
                        setUser({
                          ...user,
                          preferences: {
                            ...user.preferences,
                            theme: value
                          }
                        })
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select value={user.preferences.language} onValueChange={(value) => 
                        setUser({
                          ...user,
                          preferences: {
                            ...user.preferences,
                            language: value
                          }
                        })
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your recent coding activities and achievements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          {getActivityIcon(activity.type)}
                          <div className="flex-1">
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-gray-600">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full">
                      <Shield className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Two-Factor Authentication
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Active Sessions
                    </Button>
                    <Separator />
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
