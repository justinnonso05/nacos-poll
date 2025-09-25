'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Edit, Save, X, Building } from "lucide-react"
import { toast } from "sonner"

interface AssociationSectionProps {
  association: any
}

export default function AssociationSection({ association }: AssociationSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: association.name,
    description: association.description || '',
    logoUrl: association.logoUrl || ''
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/association/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Association details updated successfully')
        setIsEditing(false)
      } else {
        toast.error('Failed to update association details')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: association.name,
      description: association.description || '',
      logoUrl: association.logoUrl || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Association Details</h3>
          <p className="text-muted-foreground">Manage your organization information</p>
        </div>
        
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

      <div className="grid gap-4 max-w-md">
        <div>
          <Label htmlFor="associationName" className="mb-2">Association Name</Label>
          <Input
            id="associationName"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            disabled={!isEditing}
          />
        </div>

        <div>
          <Label htmlFor="associationDescription" className="mb-2">Description</Label>
          <Textarea
            id="associationDescription"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            disabled={!isEditing}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="logoUrl" className="mb-2">Logo URL</Label>
          <Input
            id="logoUrl"
            type="url"
            value={formData.logoUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
            disabled={!isEditing}
            placeholder="https://example.com/logo.png"
          />
        </div>
      </div>
    </div>
  )
}