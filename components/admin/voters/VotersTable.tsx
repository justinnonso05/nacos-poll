'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Eye, Mail, Trash2, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import VoterDetailModal from './VoterDetailModal';
import { toast } from 'sonner';
import type { Voter } from '@prisma/client'; // Add this import

interface VotersTableProps {
  voters: Voter[];
}

export default function VotersTable({ voters: initialVoters }: VotersTableProps) {
  const [voters, setVoters] = useState<Voter[]>(initialVoters);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoters, setSelectedVoters] = useState<string[]>([]);
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter voters based on search term FIRST
  const filteredVoters = voters.filter(
    (voter) =>
      voter.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Then apply pagination to filtered results
  const totalPages = Math.ceil(filteredVoters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVoters = filteredVoters.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedVoters([]); // Also clear selections when searching
  }, [searchTerm]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVoters(currentVoters.map((voter) => voter.id));
    } else {
      setSelectedVoters([]);
    }
  };

  const handleSelectVoter = (voterId: string, checked: boolean) => {
    if (checked) {
      setSelectedVoters((prev) => [...prev, voterId]);
    } else {
      setSelectedVoters((prev) => prev.filter((id) => id !== voterId));
    }
  };

  const handleViewVoter = (voter: Voter) => {
    setSelectedVoter(voter);
    setShowDetailModal(true);
  };

  const handleSendNotification = (voterIds: string[]) => {
    // TODO: Implement send notification
    toast.success(`Sending credentials to ${voterIds.length} voter(s)`);
  };

  const handleDeleteVoters = async (voterIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${voterIds.length} voter(s)?`)) return;

    try {
      let res;
      if (voterIds.length === 1) {
        // Single delete
        res = await fetch(`/api/voters/${voterIds[0]}`, {
          method: 'DELETE',
        });
      } else {
        // Bulk delete
        res = await fetch(`/api/voters/${voterIds[0]}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: voterIds }),
        });
      }
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `Deleted ${voterIds.length} voter(s)`);
        setVoters((prev) => prev.filter((voter) => !voterIds.includes(voter.id)));
        setSelectedVoters([]);
      } else {
        toast.error(data.message || 'Failed to delete voters');
      }
    } catch (error) {
      toast.error('Failed to delete voters');
    }
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
    setSelectedVoters([]); // Clear selections when changing pages
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    setSelectedVoters([]); // Clear selections when changing pages
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedVoters([]); // Clear selections when changing pages
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>All Voters ({filteredVoters.length})</CardTitle>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search voters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* Bulk Actions */}
            {selectedVoters.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendNotification(selectedVoters)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Credentials ({selectedVoters.length})
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteVoters(selectedVoters)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedVoters.length})
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedVoters.length === currentVoters.length && currentVoters.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentVoters.map((voter) => (
              <TableRow key={voter.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedVoters.includes(voter.id)}
                    onCheckedChange={(checked) => handleSelectVoter(voter.id, checked === true)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {voter.first_name} {voter.last_name}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{voter.email}</TableCell>
                <TableCell>{voter.studentId}</TableCell>
                <TableCell>{voter.level}</TableCell>
                <TableCell>
                  <Badge variant={voter.hasVoted ? 'default' : 'secondary'}>
                    {voter.hasVoted ? 'Voted' : 'Not Voted'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewVoter(voter)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSendNotification([voter.id])}>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Credentials
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteVoters([voter.id])}
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

        {currentVoters.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? 'No voters found matching your search' : 'No voters found'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredVoters.length)} of{' '}
              {filteredVoters.length} voters
              {searchTerm && <span> (filtered from {voters.length} total)</span>}
            </div>

            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {/* First page */}
                {currentPage > 3 && (
                  <>
                    <Button
                      variant={1 === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(1)}
                    >
                      1
                    </Button>
                    {currentPage > 4 && <span className="text-muted-foreground">...</span>}
                  </>
                )}

                {/* Pages around current page */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === currentPage ||
                      page === currentPage - 1 ||
                      page === currentPage + 1 ||
                      (currentPage <= 3 && page <= 5) ||
                      (currentPage >= totalPages - 2 && page >= totalPages - 4)
                  )
                  .map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}

                {/* Last page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <span className="text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={totalPages === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Voter Detail Modal */}
      <VoterDetailModal
        voter={selectedVoter}
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onUpdate={(updatedVoter) => {
          setVoters((prev) => prev.map((v) => (v.id === updatedVoter.id ? updatedVoter : v)));
        }}
      />
    </Card>
  );
}
