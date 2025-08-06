"use client"

import React, { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UploadTrainingFormProps {
  onUpload?: (file: File) => void
}

export default function UploadTrainingForm({ onUpload }: UploadTrainingFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Allow PDF, DOC, DOCX, and video files under 10MB
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "video/mp4",
        "video/webm",
        "video/ogg"
      ]
      
      if (!allowedTypes.includes(file.type) || file.size > 10 * 1024 * 1024) {
        setError("Please upload a PDF, DOC, DOCX, or video file under 10MB.")
        setSelectedFile(null)
        return
      }
      setError(null)
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setError("No file selected.")
      return
    }
    
    setUploading(true)
    setError(null)
    
    try {
      await onUpload?.(selectedFile)
      // Reset form
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch {
      setError("Failed to upload file. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Training Material
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="training-file">Training File</Label>
            <Input
              ref={fileInputRef}
              id="training-file"
              type="file"
              accept=".pdf,.doc,.docx,.mp4,.webm,.ogg"
              onChange={handleFileChange}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Supported formats: PDF, DOC, DOCX, MP4, WebM, OGG (max 10MB)
            </p>
          </div>
          
          {selectedFile && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{selectedFile.name}</span>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button
            type="submit"
            className="w-full"
            disabled={!selectedFile || uploading}
          >
            {uploading ? "Uploading..." : "Upload Training Material"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}