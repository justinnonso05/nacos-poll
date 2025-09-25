'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Users, Vote, Eye, Plus, Play, Pause, Square } from "lucide-react"
import CreateElectionDialog from "./CreateElectionDialog"
import { toast } from "sonner"

interface ElectionManagementSectionProps {
  election: any
  status: string
  associationId: string
  isSuper: boolean
}

export default function ElectionManagementSection({ 
  election, 
  status, 
  associationId, 
  isSuper 
}: ElectionManagementSectionProps) {
  const [loading, setLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const getStatusBadge = () => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Active</Badge>
      case 'PAUSED':
        return <Badge variant="secondary">Paused</Badge>
      case 'NOT_STARTED':
        return <Badge variant="outline">Not Started</Badge>
      case 'ENDED':
        return <Badge variant="destructive">Ended</Badge>
      default:
        return <Badge variant="outline">No Election</Badge>
    }
  }

  const handleToggleElection = async () => {
    if (!election) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/election/${election.id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !election.isActive })
      })

      if (response.ok) {
        toast.success(`Election ${election.isActive ? 'paused' : 'started'} successfully`)
        window.location.reload()
      } else {
        toast.error('Failed to update election status')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!election) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">No Election Created</h3>
          <p className="text-muted-foreground">Create your first election to get started</p>
        </div>
        {isSuper && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Election
          </Button>
        )}
        <CreateElectionDialog 
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          associationId={associationId}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Election Info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{election.title}</h3>
          <p className="text-muted-foreground">{election.description}</p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Election Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-medium">
              {new Date(election.startAt).toLocaleDateString()} - {new Date(election.endAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Candidates</p>
            <p className="text-2xl font-bold">{election._count?.candidates || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Vote className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Total Votes</p>
            <p className="text-2xl font-bold">{election._count?.votes || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>

        {/* Allow both superadmins and normal admins to control election status */}
        {status !== 'ENDED' && (
          <Button 
            onClick={handleToggleElection}
            disabled={loading}
            variant={election.isActive ? "secondary" : "default"}
          >
            {election.isActive ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause Election
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Election
              </>
            )}
          </Button>
        )}

        {status === 'ENDED' && (
          <Button variant="secondary">
            <Square className="h-4 w-4 mr-2" />
            Election Ended
          </Button>
        )}
      </div>
    </div>
  )
}