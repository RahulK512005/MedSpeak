'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { FileText, Clock, Download, History, FileCheck } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import jsPDF from 'jspdf'

interface Consultation {
  _id?: string
  id?: string
  uhid: string
  patientName: string
  age: number
  gender: string
  timestamp: string
  summary: string
  transcripts?: string
  bulletSummary?: string
  medicineRecommendations?: string
  prescriptions: number
  prescriptionImage?: string
  aiModel?: string
}

interface ConsultationDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consultation: Consultation
}

export default function ConsultationDetailModal({
  open,
  onOpenChange,
  consultation,
}: ConsultationDetailModalProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('summary')
  const [bulletSummary, setBulletSummary] = useState('')
  const [loadingSummary, setLoadingSummary] = useState(false)
  const date = new Date(consultation.timestamp)
  const formattedDate = format(date, 'MMMM dd, yyyy')
  const formattedTime = format(date, 'hh:mm a')

  useEffect(() => {
    if (activeTab === 'summary') {
      if (consultation.bulletSummary) {
        setBulletSummary(consultation.bulletSummary)
      } else if (consultation.transcripts) {
        generateBulletSummary()
      }
    }
  }, [consultation, activeTab])

  const generateBulletSummary = async () => {
    if (!consultation.transcripts) return
    
    setLoadingSummary(true)
    try {
      const response = await fetch('http://localhost:5000/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: `You are a medical assistant. Convert this consultation transcript into ONLY structured bullet points:\n\nTranscript: "${consultation.transcripts}"\n\nProvide ONLY these bullet points:\n• Chief Complaint: [Main reason for visit]\n• Symptoms: [List key symptoms]\n• Duration: [How long present]\n• Current medications: [Any mentioned]\n• Patient concerns: [Specific worries]\n\nDo not provide additional text or explanations. Only return the bullet points.`
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        const summary = data.summary || data.response || 'Summary generation failed'
        // Extract only bullet points if there's extra text
        const bulletPoints = summary.split('\n').filter(line => line.trim().startsWith('•')).join('\n')
        setBulletSummary(bulletPoints || summary)
        
        // Save to database
        if (consultation._id && data.response) {
          try {
            await fetch(`http://localhost:5000/api/summary/update-consultation/${consultation._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bulletSummary: data.summary || data.response })
            })
          } catch (error) {
            console.error('Failed to save summary to database:', error)
          }
        }
      } else {
        setBulletSummary('Failed to generate summary. Please try again.')
      }
    } catch (error) {
      console.error('Failed to generate summary:', error)
      setBulletSummary('Error generating summary. Please check your connection.')
    } finally {
      setLoadingSummary(false)
    }
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    let yPos = 20

    // Title
    doc.setFontSize(18)
    doc.text('CONSULTATION REPORT', 105, yPos, { align: 'center' })
    yPos += 10

    // Patient Information
    doc.setFontSize(14)
    doc.text('Patient Information', 20, yPos)
    yPos += 8
    doc.setFontSize(11)
    doc.text(`Name: ${consultation.patientName}`, 20, yPos)
    yPos += 6
    doc.text(`UHID: ${consultation.uhid}`, 20, yPos)
    yPos += 6
    doc.text(`Age: ${consultation.age}`, 20, yPos)
    yPos += 6
    doc.text(`Gender: ${consultation.gender}`, 20, yPos)
    yPos += 10

    // Consultation Details
    doc.setFontSize(14)
    doc.text('Consultation Details', 20, yPos)
    yPos += 8
    doc.setFontSize(11)
    doc.text(`Date: ${formattedDate}`, 20, yPos)
    yPos += 6
    doc.text(`Time: ${formattedTime}`, 20, yPos)
    yPos += 6
    doc.text(`AI Model: ${consultation.aiModel || 'N/A'}`, 20, yPos)
    yPos += 10

    // Summary
    doc.setFontSize(14)
    doc.text('Summary', 20, yPos)
    yPos += 8
    doc.setFontSize(11)
    const summaryLines = doc.splitTextToSize(consultation.summary, 170)
    doc.text(summaryLines, 20, yPos)
    yPos += summaryLines.length * 6 + 5

    // Transcript
    if (consultation.transcripts) {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      doc.setFontSize(14)
      doc.text('Transcript', 20, yPos)
      yPos += 8
      doc.setFontSize(11)
      const transcriptLines = doc.splitTextToSize(consultation.transcripts, 170)
      doc.text(transcriptLines, 20, yPos)
      yPos += transcriptLines.length * 6 + 5
    }

    // Prescriptions
    if (consultation.prescriptions > 0) {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      doc.setFontSize(14)
      doc.text('Prescriptions', 20, yPos)
      yPos += 8
      doc.setFontSize(11)
      doc.text(`Number of Prescriptions: ${consultation.prescriptions}`, 20, yPos)
    }

    // Save PDF
    doc.save(`Consultation_${consultation.uhid}_${format(date, 'yyyy-MM-dd')}.pdf`)
  }

  const handleViewHistory = () => {
    onOpenChange(false)
    router.push('/history')
  }

  const handleViewConsultations = () => {
    onOpenChange(false)
    router.push('/consultations')
  }

  const handleViewPrescription = () => {
    setActiveTab('prescription')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Consultation Details</DialogTitle>
          <DialogDescription>
            {consultation.patientName} ({consultation.uhid})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">UHID</p>
                  <p className="font-medium">{consultation.uhid}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Age</p>
                  <p className="font-medium">{consultation.age}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="font-medium">{consultation.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">AI Model</p>
                  <p className="font-medium">{consultation.aiModel || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock size={20} />
                Consultation Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{formattedDate}</p>
              <p className="text-muted-foreground">{formattedTime}</p>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="prescription">Prescription</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  {loadingSummary ? (
                    <p className="text-muted-foreground">Generating bullet point summary...</p>
                  ) : bulletSummary ? (
                    <div className="text-foreground leading-relaxed whitespace-pre-line">
                      {bulletSummary}
                    </div>
                  ) : (
                    <p className="text-foreground leading-relaxed">
                      {consultation.summary}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transcript" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  {consultation.transcripts ? (
                    <p className="text-foreground leading-relaxed">
                      {consultation.transcripts}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">No transcript available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prescription" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  {consultation.prescriptionImage ? (
                    <img
                      src={consultation.prescriptionImage || "/placeholder.svg"}
                      alt="Prescription"
                      className="w-full rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
                      <FileText size={20} />
                      <span>No prescription image</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              onClick={handleViewHistory}
              className="gap-2"
            >
              <History size={16} />
              History
            </Button>
            <Button
              variant="outline"
              onClick={handleViewConsultations}
              className="gap-2"
            >
              <FileCheck size={16} />
              Consultations
            </Button>
            <Button
              variant="outline"
              onClick={handleViewPrescription}
              className="gap-2"
              disabled={consultation.prescriptions === 0}
            >
              <FileText size={16} />
              Prescription
            </Button>
            <Button
              onClick={handleExportPDF}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Download size={16} />
              Export PDF
            </Button>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
