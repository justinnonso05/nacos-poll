'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, MoreHorizontal, Users, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import CreatePositionDialog from "./CreatePositionDialog"
import PositionDetailModal from "./PositionDetailModal"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Position {
  id: string
  name: string
  description: string | null  // Change from undefined to null
  order: number
  maxCandidates: number
  _count: {
    candidates: number
  }
}

interface PositionsTableProps {
  positions: Position[]
}

export default function PositionsTable({ positions: initialPositions }: PositionsTableProps) {
  const [positions, setPositions] = useState<Position[]>(initialPositions)
  const [loading, setLoading] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

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

  const handleViewPosition = (position: Position) => {
    setSelectedPosition(position)
    setShowDetailModal(true)
  }

  const handleUpdatePosition = (updatedPosition: Position) => {
    setPositions(prev => 
      prev.map(p => p.id === updatedPosition.id ? updatedPosition : p)
    )
  }

  const handleDeletePosition = async (positionId: string, positionName: string) => {
    if (!confirm(`Are you sure you want to delete the position "${positionName}"?`)) return

    setLoading(true)
    try {
      const response = await fetch(`/api/positions/${positionId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok && result.status === 'success') {
        toast.success('Position deleted successfully')
        setPositions(prev => prev.filter(p => p.id !== positionId))
      } else {
        toast.error(result.message || 'Failed to delete position')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Electoral Positions ({positions.length})</CardTitle>
            <CreatePositionDialog onPositionCreated={fetchPositions} />
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Position Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Candidates</TableHead>
                <TableHead>Max Candidates</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {positions
                .sort((a, b) => a.order - b.order)
                .map((position) => (
                <TableRow key={position.id}>
                  <TableCell>
                    <Badge variant="outline">{position.order}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{position.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                      {position.description || 'No description'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{position._count.candidates}</span>
                    </div>
                  </TableCell>
                  <TableCell>{position.maxCandidates}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={loading}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewPosition(position)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewPosition(position)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Position
                        </DropdownMenuItem>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuItem
                                onClick={() => handleDeletePosition(position.id, position.name)}
                                className="text-destructive"
                                disabled={position._count.candidates > 0}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </TooltipTrigger>
                            {position._count.candidates > 0 && (
                              <TooltipContent>
                                You cannot delete a position with assigned candidates. Please reassign or remove candidates first.
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {positions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No positions found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first electoral position to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Position Detail Modal */}
      <PositionDetailModal
        position={selectedPosition}
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onUpdate={handleUpdatePosition}
      />
    </>
  )
}