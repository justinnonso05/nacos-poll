'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Edit, Trash2, MoreHorizontal, Eye, Vote, ChevronLeft, ChevronRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import CreateCandidateDialog from "./CreateCandidateDialog"
import CandidateDetailModal from "./CandidateDetailModal"

interface Candidate {
  id: string
  name: string
  manifesto: string | null
  photoUrl: string | null
  election: {
    id: string
    title: string
    startAt: string    // Changed from Date to string
    endAt: string      // Changed from Date to string
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

interface Election {
  id: string
  title: string
}

interface CandidatesTableProps {
  candidates: Candidate[]
  elections: Election[]
}

export default function CandidatesTable({ candidates: initialCandidates, elections }: CandidatesTableProps) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedElection, setSelectedElection] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Filter candidates
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.position.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.election.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesElection = selectedElection === 'all' || candidate.election.id === selectedElection

    return matchesSearch && matchesElection
  })

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentCandidates = filteredCandidates.slice(startIndex, startIndex + itemsPerPage)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedElection])

  const fetchCandidates = async (electionId?: string) => {
    try {
      const url = electionId ? `/api/candidates?electionId=${electionId}` : '/api/candidates'
      const response = await fetch(url)
      const result = await response.json()
      
      if (response.ok && result.status === 'success') {
        setCandidates(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error)
    }
  }

  const handleViewCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setShowDetailModal(true)
  }

  const handleUpdateCandidate = (updatedCandidate: Candidate) => {
    setCandidates(prev => 
      prev.map(c => c.id === updatedCandidate.id ? updatedCandidate : c)
    )
  }

  const handleDeleteCandidate = async (candidateId: string, candidateName: string) => {
    if (!confirm(`Are you sure you want to delete "${candidateName}"?`)) return

    setLoading(true)
    try {
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok && result.status === 'success') {
        toast.success('Candidate deleted successfully')
        setCandidates(prev => prev.filter(c => c.id !== candidateId))
      } else {
        toast.error(result.message || 'Failed to delete candidate')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Candidates ({filteredCandidates.length})</CardTitle>
            <CreateCandidateDialog 
              elections={elections} 
              onCandidateCreated={() => fetchCandidates()} 
            />
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedElection} onValueChange={setSelectedElection}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by election" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Elections</SelectItem>
                {elections.map((election) => (
                  <SelectItem key={election.id} value={election.id}>
                    {election.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Election</TableHead>
                <TableHead>Votes</TableHead>
                <TableHead>Manifesto</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentCandidates
                .sort((a, b) => a.position.order - b.position.order)
                .map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage 
                          src={candidate.photoUrl || undefined}  // Fix: Handle null values
                          alt={candidate.name}
                        />
                        <AvatarFallback>
                          {getInitials(candidate.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{candidate.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{candidate.position.name}</Badge>
                  </TableCell>
                  <TableCell>{candidate.election.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Vote className="h-4 w-4 text-muted-foreground" />
                      <span>{candidate._count.votes}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                      {candidate.manifesto || 'No manifesto provided'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={loading}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewCandidate(candidate)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewCandidate(candidate)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Candidate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteCandidate(candidate.id, candidate.name)}
                          className="text-destructive"
                          disabled={candidate._count.votes > 0}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {currentCandidates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || selectedElection !== 'all' ? 'No candidates found matching your criteria' : 'No candidates found'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCandidates.length)} of {filteredCandidates.length} candidates
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidate Detail Modal */}
      <CandidateDetailModal
        candidate={selectedCandidate}
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onUpdate={handleUpdateCandidate}
      />
    </>
  )
}