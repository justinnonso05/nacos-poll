'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MoreHorizontal, Users, Eye, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import CreatePositionDialog from './CreatePositionDialog';
import PositionDetailModal from './PositionDetailModal';

interface Position {
  id: string;
  name: string;
  description: string | null;
  order: number;
  maxCandidates: number;
  _count: {
    candidates: number;
  };
}

interface PositionsTableProps {
  positions: Position[];
}

export default function PositionsTable({ positions: initialPositions }: PositionsTableProps) {
  const [positions, setPositions] = useState<Position[]>(initialPositions);
  const [loading, setLoading] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/positions');
      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setPositions(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    }
  };

  const handleViewPosition = (position: Position) => {
    setSelectedPosition(position);
    setShowDetailModal(true);
  };

  const handleUpdatePosition = (updatedPosition: Position) => {
    setPositions((prev) => prev.map((p) => (p.id === updatedPosition.id ? updatedPosition : p)));
  };

  const handleDeleteClick = (position: Position) => {
    setPositionToDelete(position);
    setShowDeleteDialog(true);
  };

  const handleDeletePosition = async () => {
    if (!positionToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/positions/${positionToDelete.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        toast.success('Position deleted successfully');
        setPositions((prev) => prev.filter((p) => p.id !== positionToDelete.id));
        setShowDeleteDialog(false);
        setPositionToDelete(null);
      } else {
        toast.error(result.message || 'Failed to delete position');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const canDeletePosition = positionToDelete && positionToDelete._count.candidates === 0;

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
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(position)}
                            className="text-destructive"
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {canDeletePosition ? (
                <>
                  <Trash2 className="h-5 w-5 text-destructive" />
                  Delete Position
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Cannot Delete Position
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {canDeletePosition ? (
                <>
                  Are you sure you want to delete the position{' '}
                  <strong>{positionToDelete?.name}</strong>? This action cannot be undone.
                </>
              ) : (
                <>
                  Cannot delete the position <strong>{positionToDelete?.name}</strong> because it
                  has{' '}
                  <strong>
                    {positionToDelete?._count.candidates} candidate
                    {positionToDelete?._count.candidates !== 1 ? 's' : ''}
                  </strong>{' '}
                  assigned to it.
                  <br />
                  <br />
                  Please reassign or remove all candidates from this position before deleting it to
                  maintain election integrity.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setPositionToDelete(null);
              }}
            >
              Cancel
            </Button>
            {canDeletePosition && (
              <Button variant="destructive" onClick={handleDeletePosition} disabled={loading}>
                {loading ? 'Deleting...' : 'Delete Position'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Position Detail Modal */}
      <PositionDetailModal
        position={selectedPosition}
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onUpdate={handleUpdatePosition}
      />
    </>
  );
}
