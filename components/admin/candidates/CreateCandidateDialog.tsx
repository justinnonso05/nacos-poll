'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface Position {
  id: string;
  name: string;
  maxCandidates: number;
  _count: {
    candidates: number;
  };
}

interface Election {
  id: string;
  title: string;
}

interface CreateCandidateDialogProps {
  election: Election; // <-- Only pass the current election
  onCandidateCreated?: () => void;
}

export default function CreateCandidateDialog({
  election,
  onCandidateCreated,
}: CreateCandidateDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    manifesto: '', // (optional: keep for text)
    manifestoUrl: '', // <-- Add this for the file URL
    photoUrl: '',
    electionId: election.id, // <-- Set default electionId
    positionId: '',
  });
  const [uploading, setUploading] = useState(false);
  const [manifestoUploading, setManifestoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      fetchPositions();
      setFormData((prev) => ({
        ...prev,
        electionId: election.id, // <-- Always set electionId on open
      }));
    }
  }, [open, election.id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          photoUrl: formData.photoUrl || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        toast.success(result.message || 'Candidate created successfully');
        setOpen(false);
        setFormData({
          name: '',
          manifesto: '', // (optional: keep for text)
          manifestoUrl: '', // <-- Reset this
          photoUrl: '',
          electionId: election.id, // <-- Reset to current election
          positionId: '',
        });
        onCandidateCreated?.();
      } else {
        toast.error(result.message || 'Failed to create candidate');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'candidate');
    // Optionally, pass candidateId if updating after creation

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (response.ok && result.url) {
        setFormData((prev) => ({ ...prev, photoUrl: result.url }));
        toast.success('Image uploaded!');
      } else {
        toast.error(result.error || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload error');
    } finally {
      setUploading(false);
    }
  };

  // Manifesto upload handler
  const handleManifestoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setManifestoUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('type', 'manifesto');
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      const result = await response.json();
      if (response.ok && result.url) {
        setFormData((prev) => ({ ...prev, manifesto: result.url }));
        toast.success('Manifesto uploaded!');
      } else {
        toast.error(result.error || 'Manifesto upload failed');
      }
    } catch (error) {
      toast.error('Manifesto upload error');
    } finally {
      setManifestoUploading(false);
    }
  };

  const selectedPosition = positions.find((p) => p.id === formData.positionId);
  const canAddMore = selectedPosition
    ? selectedPosition._count.candidates < selectedPosition.maxCandidates
    : true;

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
            <Label htmlFor="name" className="mb-2">
              Candidate Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Full name of candidate"
              required
            />
          </div>

          <div>
            <Label htmlFor="position" className="mb-2">
              Position
            </Label>
            <Select
              value={formData.positionId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, positionId: value }))}
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
            <Label htmlFor="photoUrl" className="mb-2">
              Photo (Upload)
            </Label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              disabled={uploading}
              title="Upload candidate photo"
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-muted file:text-muted-foreground"
            />
            {formData.photoUrl && (
              <div className="mt-2">
                <Image
                  src={formData.photoUrl}
                  alt="Candidate Preview"
                  width={96}
                  height={96}
                  className="w-24 h-24 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="manifestoUrl" className="mb-2">
              Manifesto Document (PDF only)
            </Label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleManifestoUpload}
              disabled={manifestoUploading}
              title="Upload candidate manifesto (PDF only)"
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-muted file:text-muted-foreground"
            />
            {formData.manifestoUrl && (
              <a
                href={formData.manifestoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline mt-2 block"
              >
                View Uploaded Manifesto
              </a>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !canAddMore} className="flex-1">
              {loading ? 'Creating...' : 'Create Candidate'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
