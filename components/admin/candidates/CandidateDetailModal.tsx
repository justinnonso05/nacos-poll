'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Edit, Save, X, Vote, Calendar, User } from "lucide-react"
import { toast } from "sonner"

interface Candidate {
  id: string
  name: string
  manifesto: string | null
  photoUrl: string | null
  election: {
    id: string
    title: string
    startAt: string  // Changed from Date to string
    endAt: string    // Changed from Date to string
    isActive: boolean
  }
  position: {
    id: string
    name: string
    order: number
  }
  _count: {
    votes: number
  }
}

interface CandidateDetailModalProps {
  candidate: Candidate | null
  open: boolean
  onClose: () => void
  onUpdate: (candidate: Candidate) => void
}

export default function CandidateDetailModal({ candidate, open, onClose, onUpdate }: CandidateDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    manifesto: '',
    photoUrl: ''
  })

  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name || '',
        manifesto: candidate.manifesto || '',
        photoUrl: candidate.photoUrl || ''
      })
    }
  }, [candidate])

  const handleSave = async () => {
    if (!candidate) return

    setLoading(true)
    try {
      const response = await fetch(`/api/candidates/${candidate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok && result.status === 'success') {
        onUpdate({ ...candidate, ...result.data })
        setIsEditing(false)
        toast.success(result.message || 'Candidate updated successfully')
      } else {
        toast.error(result.message || 'Failed to update candidate')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (candidate) {
      setFormData({
        name: candidate.name || '',
        manifesto: candidate.manifesto || '',
        photoUrl: candidate.photoUrl || ''
      })
    }
    setIsEditing(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
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

  if (!candidate) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Candidate Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Candidate Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Candidate Profile</CardTitle>
                
                <div className="flex items-center gap-2">
                  <Badge variant={candidate.election.isActive ? "default" : "secondary"}>
                    {candidate.election.isActive ? "Active Election" : "Inactive"}
                  </Badge>
                  
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Photo and Basic Info */}
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="w-24 h-24">
                    <AvatarImage 
                      src={(isEditing ? formData.photoUrl : candidate.photoUrl) || undefined}  // Fix: Handle null values
                      alt={candidate.name}
                    />
                    <AvatarFallback className="text-lg">
                      {getInitials(candidate.name)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="w-full">
                      <Label htmlFor="photoUrl" className="text-xs">Photo URL</Label>
                      <Input
                        id="photoUrl"
                        type="url"
                        value={formData.photoUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
                        placeholder="https://example.com/photo.jpg"
                        className="text-xs"
                      />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <Label htmlFor="name">Candidate Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      className="font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Position</div>
                        <div className="text-sm text-muted-foreground">{candidate.position.name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Vote className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Votes Received</div>
                        <div className="text-lg font-bold text-primary">{candidate._count.votes}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manifesto */}
              <div>
                <Label htmlFor="manifesto">Manifesto</Label>
                <Textarea
                  id="manifesto"
                  value={formData.manifesto}
                  onChange={(e) => setFormData(prev => ({ ...prev, manifesto: e.target.value }))}
                  disabled={!isEditing}
                  rows={6}
                  placeholder="Candidate's campaign manifesto and promises..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Election Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Election Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <Label>Election Title</Label>
                <div className="font-medium">{candidate.election.title}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatDate(candidate.election.startAt)}</span>
                  </div>
                </div>

                <div>
                  <Label>End Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatDate(candidate.election.endAt)}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Election Status</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={candidate.election.isActive ? "default" : "secondary"}>
                    {candidate.election.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vote Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vote Statistics</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-primary mb-2">
                  {candidate._count.votes}
                </div>
                <div className="text-muted-foreground">
                  Total Votes Received
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  {candidate.election.isActive 
                    ? "Election is currently active" 
                    : "Final vote count"
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}