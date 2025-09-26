'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { toast } from "sonner"

interface Position {
  id: string
  name: string
  maxCandidates: number
  _count: {
    candidates: number
  }
}

interface Election {
  id: string
  title: string
}

interface CreateCandidateDialogProps {
  elections: Election[]
  onCandidateCreated?: () => void
}

export default function CreateCandidateDialog({ elections, onCandidateCreated }: CreateCandidateDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [positions, setPositions] = useState<Position[]>([])
  const [formData, setFormData] = useState({
    name: '',
    manifesto: '',
    photoUrl: '',
    electionId: '',
    positionId: ''
  })

  useEffect(() => {
    if (open) {
      fetchPositions()
    }
  }, [open])

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/positions')
      const result = await response.json()
      
      if (response.ok && result.status === 'success') {
        setPositions(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch positions:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          photoUrl: formData.photoUrl || undefined
        })
      })

      const result = await response.json()

      if (response.ok && result.status === 'success') {
        toast.success(result.message || 'Candidate created successfully')
        setOpen(false)
        setFormData({
          name: '',
          manifesto: '',
          photoUrl: '',
          electionId: '',
          positionId: ''
        })
        onCandidateCreated?.()
      } else {
        toast.error(result.message || 'Failed to create candidate')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const selectedPosition = positions.find(p => p.id === formData.positionId)
  const canAddMore = selectedPosition ? selectedPosition._count.candidates < selectedPosition.maxCandidates : true

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Candidate</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Candidate Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Full name of candidate"
              required
            />
          </div>

          <div>
            <Label htmlFor="election">Election</Label>
            <Select
              value={formData.electionId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, electionId: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an election" />
              </SelectTrigger>
              <SelectContent>
                {elections.map((election) => (
                  <SelectItem key={election.id} value={election.id}>
                    {election.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="position">Position</Label>
            <Select
              value={formData.positionId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, positionId: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((position) => (
                  <SelectItem 
                    key={position.id} 
                    value={position.id}
                    disabled={position._count.candidates >= position.maxCandidates}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span>{position.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({position._count.candidates}/{position.maxCandidates})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPosition && !canAddMore && (
              <p className="text-sm text-destructive mt-1">
                Maximum candidates reached for this position
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="photoUrl">Photo URL (Optional)</Label>
            <Input
              id="photoUrl"
              type="url"
              value={formData.photoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div>
            <Label htmlFor="manifesto">Manifesto (Optional)</Label>
            <Textarea
              id="manifesto"
              value={formData.manifesto}
              onChange={(e) => setFormData(prev => ({ ...prev, manifesto: e.target.value }))}
              placeholder="Candidate's manifesto or campaign message"
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !canAddMore} className="flex-1">
              {loading ? "Creating..." : "Create Candidate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}