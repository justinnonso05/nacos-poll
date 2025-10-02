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
import { Plus, FileText } from 'lucide-react';
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
  election: Election;
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
    manifesto: '',
    photoUrl: '',
    electionId: election.id,
    positionId: '',
  });

  // File preview states
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedManifestoFile, setSelectedManifestoFile] = useState<File | null>(null);
  const [manifestoPreviewName, setManifestoPreviewName] = useState<string | null>(null);

  // Upload states
  const [photoUploading, setPhotoUploading] = useState(false);
  const [manifestoUploading, setManifestoUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const manifestoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      fetchPositions();
      setFormData((prev) => ({
        ...prev,
        electionId: election.id,
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

  // Handle photo file selection for preview
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // Handle manifesto file selection for preview
  const handleManifestoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedManifestoFile(file);
    setManifestoPreviewName(file.name);
  };

  // Upload photo
  const handlePhotoUpload = async () => {
    if (!selectedPhotoFile) return;

    setPhotoUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', selectedPhotoFile);
    formDataUpload.append('type', 'candidate');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      const result = await response.json();

      if (response.ok && result.url) {
        setFormData((prev) => ({ ...prev, photoUrl: result.url }));
        toast.success('Photo uploaded successfully!');
        setSelectedPhotoFile(null);
        setPhotoPreview(null);
      } else {
        toast.error(result.error || 'Photo upload failed');
      }
    } catch (error) {
      toast.error('Photo upload error');
    } finally {
      setPhotoUploading(false);
    }
  };

  // Upload manifesto
  const handleManifestoUpload = async () => {
    if (!selectedManifestoFile) return;

    setManifestoUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', selectedManifestoFile);
    formDataUpload.append('type', 'manifesto');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      const result = await response.json();

      if (response.ok && result.url) {
        setFormData((prev) => ({ ...prev, manifesto: result.url }));
        toast.success('Manifesto uploaded successfully!');
        setSelectedManifestoFile(null);
        setManifestoPreviewName(null);
      } else {
        toast.error(result.error || 'Manifesto upload failed');
      }
    } catch (error) {
      toast.error('Manifesto upload error');
    } finally {
      setManifestoUploading(false);
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

        // Reset all states
        setFormData({
          name: '',
          manifesto: '',
          photoUrl: '',
          electionId: election.id,
          positionId: '',
        });
        setSelectedPhotoFile(null);
        setPhotoPreview(null);
        setSelectedManifestoFile(null);
        setManifestoPreviewName(null);

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

      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
              className='h-11'
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

          {/* Photo Upload Section */}
          <div>
            <Label className="mb-2">Candidate Photo</Label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handlePhotoFileChange}
              disabled={photoUploading}
              title="Select candidate photo"
              className="block w-full h-11 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-muted file:text-muted-foreground"
            />

            {/* Photo Preview */}
            {photoPreview && (
              <div className="mt-2 space-y-2">
                <Image
                  src={photoPreview}
                  alt="Photo Preview"
                  width={96}
                  height={96}
                  className="w-24 h-24 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handlePhotoUpload}
                  disabled={photoUploading}
                >
                  {photoUploading ? 'Uploading...' : 'Upload Photo'}
                </Button>
              </div>
            )}

            {/* Uploaded Photo */}
            {formData.photoUrl && !photoPreview && (
              <div className="mt-2">
                <Image
                  src={formData.photoUrl}
                  alt="Uploaded Photo"
                  width={96}
                  height={96}
                  className="w-24 h-24 object-cover rounded-lg border"
                />
                <p className="text-sm text-green-600 mt-1">✓ Photo uploaded</p>
              </div>
            )}
          </div>

          {/* Manifesto Upload Section */}
          <div>
            <Label className="mb-2">Manifesto Document (PDF only)</Label>
            <input
              type="file"
              accept=".pdf"
              ref={manifestoInputRef}
              onChange={handleManifestoFileChange}
              disabled={manifestoUploading}
              title="Select manifesto document (PDF only)"
              className="block w-full h-11 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-muted file:text-muted-foreground"
            />

            {/* Manifesto Preview */}
            {manifestoPreviewName && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  <span className="text-sm">{manifestoPreviewName}</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleManifestoUpload}
                  disabled={manifestoUploading}
                >
                  {manifestoUploading ? 'Uploading...' : 'Upload Manifesto'}
                </Button>
              </div>
            )}

            {/* Uploaded Manifesto */}
            {formData.manifesto && !manifestoPreviewName && (
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(formData.manifesto, '_blank')}
                >
                  <FileText className="h-4 w-4 mr-2 text-red-600" />
                  View Uploaded Manifesto
                </Button>
                <p className="text-sm text-green-600 mt-1">✓ Manifesto uploaded</p>
              </div>
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
