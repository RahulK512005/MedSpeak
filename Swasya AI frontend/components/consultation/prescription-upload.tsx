'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Camera, X } from 'lucide-react'

interface PrescriptionUploadProps {
  onComplete: (image: string) => void
}

export default function PrescriptionUpload({ onComplete }: PrescriptionUploadProps) {
  const [image, setImage] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImage(result)
      // Simulated OCR extraction - in production, send to /api/upload-image
      setExtractedText('Paracetamol 500mg - Twice daily\nAmoxicillin 250mg - Three times daily\nRest for 3-5 days')
    }
    reader.readAsDataURL(file)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleRemoveImage = () => {
    setImage(null)
    setExtractedText('')
  }

  return (
    <div className="space-y-6">
      {!image ? (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors">
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 px-6 py-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Upload size={24} className="text-primary" />
                <span className="text-sm font-medium">Upload Image</span>
              </button>
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center gap-2 px-6 py-4 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors"
              >
                <Camera size={24} className="text-accent" />
                <span className="text-sm font-medium">Take Photo</span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Supports JPG, PNG. Max 5MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={image || "/placeholder.svg"}
              alt="Prescription"
              className="w-full h-64 object-cover rounded-lg"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              <X size={20} />
            </button>
          </div>

          {extractedText && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Extracted Medications</label>
              <div className="bg-primary/5 border border-primary/30 rounded-lg p-4 text-sm">
                {extractedText.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1" onClick={() => onComplete('')}>
          {image ? 'Skip' : 'Cancel'}
        </Button>
        <Button
          onClick={() => onComplete(image || '')}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          Save Consultation
        </Button>
      </div>
    </div>
  )
}
