/* filepath: app/page.tsx */
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { ThemeToggle } from '@/components/theme-toggle'
import { toast } from "sonner"

export default function Home() {
  // Toast functions for different scenarios
  const showSuccessToast = () => {
    toast.success("Vote cast successfully! 🗳️", {
      description: "Your vote has been recorded securely and you will receive a confirmation email.",
      duration: 5000,
    })
  }

  const showErrorToast = () => {
    toast.error("Authentication failed ❌", {
      description: "Invalid voter credentials. Please check your Student ID and password.",
      duration: 6000,
    })
  }

  const showWarningToast = () => {
    toast.warning("Election ending soon! ⚠️", {
      description: "Voting closes in 2 hours. Make sure to cast your vote before 11:59 PM.",
      duration: 8000,
    })
  }

  const showInfoToast = () => {
    toast.info("Election update 📊", {
      description: "NACOS UNILAG election is active. Current turnout: 73% (1,247 voters)",
      duration: 5000,
    })
  }

  const showLoadingToast = () => {
    const loadingToast = toast.loading("Processing your vote...", {
      description: "Please wait while we securely record your ballot."
    })
    
    // Simulate processing time
    setTimeout(() => {
      toast.dismiss(loadingToast)
      toast.success("Vote processed successfully! 🎉")
    }, 3000)
  }

  const showCustomToast = () => {
    toast.custom((t) => (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🎓</span>
          <div>
            <h4 className="font-semibold">Welcome to NACOS Platform!</h4>
            <p className="text-sm opacity-90">Your secure e-voting experience starts here.</p>
          </div>
          <button 
            onClick={() => toast.dismiss(t)}
            className="ml-auto text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    ))
  }

  return (
    <div className="min-h-screen bg-background">
      <ThemeToggle />
      
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            🗳️ NACOS E-Voting Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive UI Component Testing & Theme Validation
          </p>
        </div>

        {/* Toast Demo Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Toast Notifications Demo</CardTitle>
            <CardDescription>Click buttons to test different notification types for the e-voting platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Voting Scenarios */}
            <div>
              <h4 className="text-sm font-medium mb-3">Voting Scenarios</h4>
              <div className="flex flex-wrap gap-3">
                <Button onClick={showSuccessToast} className="bg-green-600 hover:bg-green-700">
                  Cast Vote Success
                </Button>
                <Button onClick={showErrorToast} variant="destructive">
                  Authentication Error
                </Button>
                <Button onClick={showWarningToast} className="bg-yellow-600 hover:bg-yellow-700">
                  Election Warning
                </Button>
                <Button onClick={showInfoToast} className="bg-blue-600 hover:bg-blue-700">
                  Election Update
                </Button>
                <Button onClick={showLoadingToast} className="bg-purple-600 hover:bg-purple-700">
                  Processing Vote
                </Button>
                <Button onClick={showCustomToast} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Custom Welcome
                </Button>
              </div>
            </div>

            {/* Admin Scenarios */}
            <div>
              <h4 className="text-sm font-medium mb-3">Admin Scenarios</h4>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => toast.success("152 voters imported successfully!", {
                    description: "Credential emails will be sent within 5 minutes.",
                    action: {
                      label: "View Details",
                      onClick: () => console.log("View import details")
                    }
                  })}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  File Upload Success
                </Button>
                <Button 
                  onClick={() => toast.error("System maintenance required", {
                    description: "The platform will be unavailable from 2:00 AM - 4:00 AM.",
                    action: {
                      label: "Schedule",
                      onClick: () => console.log("Schedule maintenance")
                    }
                  })}
                  variant="destructive"
                >
                  System Maintenance
                </Button>
                <Button 
                  onClick={() => toast.warning("Low voter turnout detected", {
                    description: "Only 35% participation. Consider extending deadline.",
                    action: {
                      label: "Extend",
                      onClick: () => console.log("Extend deadline")
                    }
                  })}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Turnout Warning
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Testing Sections */}
        <Tabs defaultValue="buttons" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="buttons">Buttons & Actions</TabsTrigger>
            <TabsTrigger value="forms">Forms & Inputs</TabsTrigger>
            <TabsTrigger value="feedback">Feedback & Status</TabsTrigger>
            <TabsTrigger value="layout">Layout & Navigation</TabsTrigger>
          </TabsList>

          {/* Buttons & Actions Tab */}
          <TabsContent value="buttons" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>Testing all button styles and states</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Buttons */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Primary Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="default" 
                      onClick={() => toast.success("Vote cast!", {description: "Your ballot has been recorded."})}
                    >
                      Cast Vote
                    </Button>
                    <Button variant="default" disabled>Processing...</Button>
                    <Button variant="default" size="sm">Quick Action</Button>
                    <Button variant="default" size="lg">Large Button</Button>
                  </div>
                </div>

                {/* Secondary Buttons */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Secondary Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="secondary"
                      onClick={() => toast.info("Results loading...", {description: "Fetching latest election data."})}
                    >
                      View Results
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => toast.warning("Vote cancelled", {description: "Your vote selection has been cleared."})}
                    >
                      Cancel Vote
                    </Button>
                    <Button variant="ghost">Skip</Button>
                    <Button variant="link">Learn More</Button>
                  </div>
                </div>

                {/* Destructive Actions */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Destructive Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="destructive"
                      onClick={() => toast.error("Election deleted", {description: "This action cannot be undone."})}
                    >
                      Delete Election
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => toast.error("Candidate removed", {description: "The candidate has been removed from the ballot."})}
                    >
                      Remove Candidate
                    </Button>
                  </div>
                </div>

                {/* Icon Buttons */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Icon Buttons</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={() => toast.info("Analytics view", {description: "Opening election statistics."})}
                    >
                      📊
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => toast.info("Settings", {description: "Opening system configuration."})}
                    >
                      ⚙️
                    </Button>
                    <Button 
                      size="icon" 
                      variant="destructive"
                      onClick={() => toast.error("Item deleted", {description: "The selected item has been removed."})}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forms & Inputs Tab */}
          <TabsContent value="forms" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Components */}
              <Card>
                <CardHeader>
                  <CardTitle>Form Components</CardTitle>
                  <CardDescription>Input fields and form controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Text Inputs */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="voter@university.edu" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="Enter your password" />
                  </div>

                  {/* Select */}
                  <div className="space-y-2">
                    <Label>Association</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your association" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unilag">NACOS UNILAG</SelectItem>
                        <SelectItem value="unn">NACOS UNN</SelectItem>
                        <SelectItem value="ui">NACOS UI</SelectItem>
                        <SelectItem value="abu">NACOS ABU</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Textarea */}
                  <div className="space-y-2">
                    <Label htmlFor="manifesto">Candidate Manifesto</Label>
                    <Textarea 
                      id="manifesto" 
                      placeholder="Describe your vision for the association..." 
                      rows={4}
                    />
                  </div>

                  {/* Switch */}
                  <div className="flex items-center space-x-2">
                    <Switch id="notifications" />
                    <Label htmlFor="notifications">Enable vote notifications</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Selection Components */}
              <Card>
                <CardHeader>
                  <CardTitle>Selection Components</CardTitle>
                  <CardDescription>Checkboxes, radio buttons, and selections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Checkboxes */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Voting Preferences</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="email-results" />
                        <Label htmlFor="email-results">Email me results</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="sms-updates" />
                        <Label htmlFor="sms-updates">SMS updates</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="anonymous" defaultChecked />
                        <Label htmlFor="anonymous">Anonymous voting</Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Radio Group */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Election Type</Label>
                    <RadioGroup defaultValue="general">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="general" id="general" />
                        <Label htmlFor="general">General Election</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="special" id="special" />
                        <Label htmlFor="special">Special Election</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="referendum" id="referendum" />
                        <Label htmlFor="referendum">Referendum</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Feedback & Status Tab */}
          <TabsContent value="feedback" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Alerts & Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Alerts & Notifications</CardTitle>
                  <CardDescription>Status messages and alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTitle>Election Active</AlertTitle>
                    <AlertDescription>
                      Voting is currently in progress. You have until 11:59 PM to cast your vote.
                    </AlertDescription>
                  </Alert>

                  <Alert variant="destructive">
                    <AlertTitle>Invalid Credentials</AlertTitle>
                    <AlertDescription>
                      The voter ID or password you entered is incorrect. Please try again.
                    </AlertDescription>
                  </Alert>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Voter Turnout</span>
                      <span>73%</span>
                    </div>
                    <Progress value={73} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Results Processing</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Badges & Status Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle>Badges & Status</CardTitle>
                  <CardDescription>Status indicators and labels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Election Status</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Active</Badge>
                      <Badge variant="secondary">Scheduled</Badge>
                      <Badge variant="destructive">Ended</Badge>
                      <Badge variant="outline">Draft</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Voter Status</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-green-500">✅ Voted</Badge>
                      <Badge variant="secondary">⏳ Pending</Badge>
                      <Badge variant="destructive">❌ Ineligible</Badge>
                      <Badge variant="outline">👤 Registered</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Position Types</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-blue-500">President</Badge>
                      <Badge className="bg-purple-500">Vice President</Badge>
                      <Badge className="bg-orange-500">Secretary</Badge>
                      <Badge className="bg-green-500">Treasurer</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Layout & Navigation Tab */}
          <TabsContent value="layout" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Navigation Cards */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👑</span>
                  </div>
                  <CardTitle>Super Admin</CardTitle>
                  <CardDescription>Platform management and association oversight</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Manage associations</li>
                    <li>• Rent election setups</li>
                    <li>• Global analytics</li>
                    <li>• System configuration</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => toast.success("Super Admin access granted!", {
                      description: "Welcome to the platform management dashboard."
                    })}
                  >
                    Access Dashboard
                  </Button>
                </CardFooter>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <CardTitle>Association Admin</CardTitle>
                  <CardDescription>Election and candidate management</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Setup elections</li>
                    <li>• Manage candidates</li>
                    <li>• Upload voter lists</li>
                    <li>• View results</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => toast.info("Admin login required", {
                      description: "Please enter your association credentials to continue."
                    })}
                  >
                    Admin Login
                  </Button>
                </CardFooter>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🗳️</span>
                  </div>
                  <CardTitle>Voter Portal</CardTitle>
                  <CardDescription>Cast votes and view candidate information</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• View candidates</li>
                    <li>• Read manifestos</li>
                    <li>• Cast secure votes</li>
                    <li>• Check vote status</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={showSuccessToast} 
                    variant="secondary" 
                    className="w-full"
                  >
                    Start Voting
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Separator Demo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Layout Elements</h3>
              <Separator />
              <p className="text-muted-foreground">
                Separators help organize content sections and improve visual hierarchy.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Chart Colors Preview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Chart Color Palette</CardTitle>
            <CardDescription>Testing chart colors for election results visualization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-full h-16 bg-chart-1 rounded-lg mb-2"></div>
                <span className="text-xs text-muted-foreground">Chart 1</span>
              </div>
              <div className="text-center">
                <div className="w-full h-16 bg-chart-2 rounded-lg mb-2"></div>
                <span className="text-xs text-muted-foreground">Chart 2</span>
              </div>
              <div className="text-center">
                <div className="w-full h-16 bg-chart-3 rounded-lg mb-2"></div>
                <span className="text-xs text-muted-foreground">Chart 3</span>
              </div>
              <div className="text-center">
                <div className="w-full h-16 bg-chart-4 rounded-lg mb-2"></div>
                <span className="text-xs text-muted-foreground">Chart 4</span>
              </div>
              <div className="text-center">
                <div className="w-full h-16 bg-chart-5 rounded-lg mb-2"></div>
                <span className="text-xs text-muted-foreground">Chart 5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}