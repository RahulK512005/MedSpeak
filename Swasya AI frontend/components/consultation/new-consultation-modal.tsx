'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { patientApi, consultationApi } from '@/lib/api'
import RecordingControls from './recording-controls'
import PrescriptionUpload from './prescription-upload'

interface NewConsultationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function NewConsultationModal({
  open,
  onOpenChange,
}: NewConsultationModalProps) {
  const [step, setStep] = useState<'info' | 'recording' | 'prescription'>('info')
  const [formData, setFormData] = useState({
    uhid: '',
    patientName: '',
    age: '',
    gender: '',
  })
  const [loading, setLoading] = useState(false)
  const [patientId, setPatientId] = useState<string>('')
  const [transcript, setTranscript] = useState('')
  const [summary, setSummary] = useState('')
  const [prescriptionImage, setPrescriptionImage] = useState<string>('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNext = async () => {
    if (formData.uhid && formData.patientName && formData.age && formData.gender) {
      setLoading(true)
      try {
        // Try to get existing patient first, or create new one
        let patient
        try {
          patient = await patientApi.getById(formData.uhid)
          setPatientId(patient._id || '')
        } catch (error) {
          // Patient doesn't exist, create new one
          patient = await patientApi.create({
            uhid: formData.uhid,
            name: formData.patientName,
            age: parseInt(formData.age),
            gender: formData.gender
          })
          setPatientId(patient._id || '')
        }
        setStep('recording')
      } catch (error: any) {
        console.error('Failed to create/get patient:', error)
        alert(`Failed to create patient: ${error?.message || 'Please try again.'}`)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleRecordingComplete = (recordingTranscript: string, recordingSummary: string) => {
    console.log('Recording completed with:', { transcript: recordingTranscript, summary: recordingSummary })
    setTranscript(recordingTranscript || '')
    setSummary(recordingSummary || '')
    setStep('prescription')
  }

  const handlePrescriptionComplete = (image: string) => {
    setPrescriptionImage(image)
    handleSaveConsultation(image)
  }

  const handleSaveConsultation = async (image: string) => {
    if (!formData.uhid) {
      alert('Please fill in all patient information')
      return
    }
    
    setLoading(true)
    try {
      const finalSummary = summary || transcript || 'No summary available'
      const finalTranscript = transcript || ''
      
      const consultationData = {
        uhid: formData.uhid,
        patientName: formData.patientName,
        age: parseInt(formData.age),
        gender: formData.gender,
        timestamp: new Date().toISOString(),
        summary: finalSummary,
        transcripts: finalTranscript,
        prescriptions: image ? 1 : 0,
        prescriptionImage: image || '',
        status: 'completed' as const
      }
      
      console.log('Final consultation data:', consultationData)
      
      console.log('Saving consultation with data:', consultationData)
      
      const result = await consultationApi.create(consultationData)
      console.log('Consultation saved successfully:', result)
      
      alert('Consultation saved successfully!')
      handleClose()
      // Refresh the page to show new consultation
      window.location.reload()
    } catch (error: any) {
      console.error('Failed to save consultation - Full error:', error)
      console.error('Error stack:', error?.stack)
      console.error('Error name:', error?.name)
      console.error('Error message:', error?.message)
      
      let errorMessage = 'Failed to save consultation. Please try again.'
      if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      alert(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('info')
    setFormData({ uhid: '', patientName: '', age: '', gender: '' })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 'info' && (
          <>
            <DialogHeader>
              <DialogTitle>New Consultation</DialogTitle>
              <DialogDescription>
                Enter patient information to start a new consultation
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="uhid" className="text-sm font-medium">
                    UHID
                  </Label>
                  <Input
                    id="uhid"
                    name="uhid"
                    placeholder="e.g., UH-2024-001"
                    value={formData.uhid}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="patientName" className="text-sm font-medium">
                    Patient Name
                  </Label>
                  <Input
                    id="patientName"
                    name="patientName"
                    placeholder="Full name"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age" className="text-sm font-medium">
                    Age
                  </Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="Age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Gender
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, gender: value }))
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="O">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {loading ? 'Creating...' : 'Continue'}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'recording' && (
          <>
            <DialogHeader>
              <DialogTitle>Record Consultation</DialogTitle>
              <DialogDescription>
                Record the patient consultation or add notes
              </DialogDescription>
            </DialogHeader>
            <RecordingControls onComplete={handleRecordingComplete} />
          </>
        )}

        {step === 'prescription' && (
          <>
            <DialogHeader>
              <DialogTitle>Upload Prescription</DialogTitle>
              <DialogDescription>
                Upload prescription image or notes
              </DialogDescription>
            </DialogHeader>
            <PrescriptionUpload 
              onComplete={(image) => handlePrescriptionComplete(image)} 
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
