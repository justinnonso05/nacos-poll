'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, ChevronRight, Eye, CheckCircle2, Vote, Shield, Clock, User, LogOut } from "lucide-react"
import { toast } from "sonner"

interface Candidate {
  id: string
  name: string
  manifesto: string | null
  photoUrl: string | null
}

interface Position {
  id: string
  name: string
  description: string | null
  order: number
  candidates: Candidate[]
}

interface Election {
  id: string
  title: string
  description: string | null
  startAt: string
  endAt: string
}

interface VotingInterfaceProps {
  voter: {
    id: string
    email: string
    firstName: string
    lastName: string
    studentId: string
    association: string
  }
  election: Election
  positions: Position[]
}

export default function VotingInterface({ voter, election, positions }: VotingInterfaceProps) {
  const router = useRouter()
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0)
  const [selectedCandidates, setSelectedCandidates] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [casting, setCasting] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/voter/logout', { method: 'POST' })
    } catch (error) {
      // Ignore error for logout
    } finally {
      router.refresh()
    }
  }

  const handleCandidateSelect = (positionId: string, candidateId: string) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [positionId]: candidateId
    }))
  }

  const getCurrentPosition = () => {
    return positions[currentPositionIndex]
  }

  const canProceed = () => {
    const currentPosition = getCurrentPosition()
    return currentPosition && selectedCandidates[currentPosition.id]
  }

  const handleNext = () => {
    if (currentPositionIndex < positions.length - 1) {
      setCurrentPositionIndex(prev => prev + 1)
    } else {
      setShowPreview(true)
    }
  }

  const handlePrevious = () => {
    if (showPreview) {
      setShowPreview(false)
    } else if (currentPositionIndex > 0) {
      setCurrentPositionIndex(prev => prev - 1)
    }
  }

  const handleCastVotes = async () => {
    setCasting(true)
    try {
      const votes = Object.entries(selectedCandidates).map(([positionId, candidateId]) => ({
        positionId,
        candidateId
      }))

      const response = await fetch('/api/voting/cast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          electionId: election.id,
          votes
        })
      })

      const result = await response.json()

      if (response.ok && result.status === 'success') {
        toast.success("Your votes have been cast successfully!")
        setTimeout(() => {
          router.refresh()
        }, 2000)
      } else {
        if (response.status === 401) {
          router.refresh()
          return
        }
        toast.error(result.message || 'Failed to cast votes')
      }
    } catch (error) {
      toast.error('Failed to cast votes')
    } finally {
      setCasting(false)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const currentPosition = getCurrentPosition()
  const progress = showPreview ? 100 : ((currentPositionIndex + 1) / positions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{election.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{voter.firstName} {voter.lastName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Ends: {formatDate(election.endAt)}</span>
                </div>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-6 border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-900">
                {showPreview ? 'Review & Submit Vote' : `${currentPosition?.name} (${currentPositionIndex + 1} of ${positions.length})`}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2 bg-gray-100" />
          </CardContent>
        </Card>

        {/* Vote Preview */}
        {showPreview ? (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Eye className="h-5 w-5" />
                Review Your Selections
              </CardTitle>
              <Alert className="border-amber-200 bg-amber-50 mt-4">
                <Shield className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Important:</strong> Once submitted, your votes cannot be viewed or changed. 
                  You will be automatically logged out for security.
                </AlertDescription>
              </Alert>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 mb-6">
                {positions.map((position) => {
                  const selectedCandidateId = selectedCandidates[position.id]
                  const selectedCandidate = position.candidates?.find(c => c.id === selectedCandidateId)
                  
                  return (
                    <div key={position.id} className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">{position.name}</h3>
                      {selectedCandidate && (
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {selectedCandidate.photoUrl ? (
                              <img 
                                src={selectedCandidate.photoUrl} 
                                alt={selectedCandidate.name}
                                className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 font-medium">
                                {getInitials(selectedCandidate.name)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{selectedCandidate.name}</div>
                            <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800 hover:bg-green-100">
                              Selected
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handlePrevious} 
                  variant="outline" 
                  className="flex-1 h-12"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Edit
                </Button>
                <Button 
                  onClick={handleCastVotes} 
                  disabled={casting}
                  className="flex-1 h-12 bg-slate-900 hover:bg-slate-800"
                >
                  {casting ? "Submitting..." : "Submit Vote"}
                  <Vote className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Current Position Voting */
          currentPosition && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-gray-900 mb-1">{currentPosition.name}</CardTitle>
                    {currentPosition.description && (
                      <p className="text-gray-600 text-sm">{currentPosition.description}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    {currentPosition.candidates?.length || 0} Candidate{(currentPosition.candidates?.length || 0) !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {!currentPosition.candidates || currentPosition.candidates.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-6">No candidates available for this position.</p>
                    <div className="flex gap-4">
                      <Button 
                        onClick={handlePrevious} 
                        variant="outline"
                        disabled={currentPositionIndex === 0}
                        className="flex-1 h-12"
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <Button 
                        onClick={handleNext} 
                        className="flex-1 h-12"
                      >
                        {currentPositionIndex === positions.length - 1 ? 'Review Votes' : 'Skip Position'}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Candidates Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {currentPosition.candidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className={`group cursor-pointer transition-all duration-200 ${
                            selectedCandidates[currentPosition.id] === candidate.id
                              ? 'ring-2 ring-slate-900 ring-offset-2'
                              : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
                          }`}
                          onClick={() => handleCandidateSelect(currentPosition.id, candidate.id)}
                        >
                          <Card className="border-gray-200 py-2 h-full">
                            <CardContent className="p-2 text-center">
                              {/* Large Rectangular Image */}
                              <div className="relative mb-4">
                                {candidate.photoUrl ? (
                                  <img 
                                    src={candidate.photoUrl} 
                                    alt={candidate.name}
                                    className="w-full h-full object-cover rounded-lg mx-auto bg-gray-100 shadow-sm"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 rounded-lg mx-auto flex items-center justify-center text-gray-600 text-2xl font-medium shadow-sm">
                                    {getInitials(candidate.name)}
                                  </div>
                                )}
                                {selectedCandidates[currentPosition.id] === candidate.id && (
                                  <div className="absolute -top-2 -right-2 bg-slate-900 rounded-full p-2">
                                    <CheckCircle2 className="h-5 w-5 text-white" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Candidate Info */}
                              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                {candidate.name}
                              </h3>
                              <p className="text-sm text-gray-500 mb-3">
                                Running for {currentPosition.name}
                              </p>
                              
                              {/* Manifesto */}
                              {candidate.manifesto && (
                                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed text-left">
                                  {candidate.manifesto}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-4">
                      <Button 
                        onClick={handlePrevious} 
                        variant="outline"
                        disabled={currentPositionIndex === 0}
                        className="flex-1 h-12"
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous Position
                      </Button>
                      
                      <Button 
                        onClick={handleNext} 
                        disabled={!canProceed()}
                        className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-300"
                      >
                        {currentPositionIndex === positions.length - 1 ? 'Review Votes' : 'Next Position'}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>

                    {!canProceed() && (
                      <p className="text-center text-sm text-gray-500 mt-4">
                        Please select a candidate to continue
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  )
}