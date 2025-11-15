'use client'

import { useState, useEffect } from 'react'
import { dashboardApi, PatientWithConsultation } from '@/lib/dashboard-api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Clock, User, AlertCircle, CheckCircle, Phone, Video, X } from 'lucide-react'



export default function DoctorDashboard() {
  const [patients, setPatients] = useState<PatientWithConsultation[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientWithConsultation | null>(null)
  const [loading, setLoading] = useState(true)
  const [emergencyDialog, setEmergencyDialog] = useState<PatientWithConsultation | null>(null)
  const [medicineRecommendations, setMedicineRecommendations] = useState('')
  const [loadingMedicines, setLoadingMedicines] = useState(false)

  const generateMedicineRecommendations = async (symptoms: string, consultationId?: string) => {
    setLoadingMedicines(true)
    try {
      const response = await fetch('http://localhost:5000/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: `You are a medical assistant. Based on these symptoms: "${symptoms}"\n\nProvide ONLY these bullet points for medicine recommendations:\n• Primary medication: [Main treatment with dosage]\n• Secondary medication: [Supporting treatment if needed]\n• Symptomatic relief: [For immediate symptom management]\n• Duration: [Treatment duration]\n• Precautions: [Important warnings]\n• Follow-up: [When to return if symptoms persist]\n\nDo not provide additional text or explanations. Only return the bullet points. Always include disclaimer about consulting healthcare professionals.`
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        const recommendations = data.summary || data.response || 'Medicine recommendations generation failed'
        // Extract only bullet points if there's extra text
        const bulletPoints = recommendations.split('\n').filter(line => line.trim().startsWith('•')).join('\n')
        const finalRecommendations = bulletPoints || recommendations
        setMedicineRecommendations(finalRecommendations)
        
        // Save to database
        if (consultationId) {
          try {
            await fetch(`http://localhost:5000/api/summary/update-consultation/${consultationId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ medicineRecommendations: finalRecommendations })
            })
          } catch (error) {
            console.error('Failed to save medicine recommendations to database:', error)
          }
        }
      } else {
        setMedicineRecommendations('Failed to generate medicine recommendations. Please try again.')
      }
    } catch (error) {
      console.error('Failed to generate medicine recommendations:', error)
      setMedicineRecommendations('Error generating recommendations. Please check your connection.')
    } finally {
      setLoadingMedicines(false)
    }
  }

  useEffect(() => {
    if (selectedPatient?.latestConsultation) {
      if (selectedPatient.latestConsultation.medicineRecommendations) {
        setMedicineRecommendations(selectedPatient.latestConsultation.medicineRecommendations)
      } else if (selectedPatient.latestConsultation.transcript) {
        generateMedicineRecommendations(
          selectedPatient.latestConsultation.transcript,
          selectedPatient.latestConsultation._id
        )
      }
    }
  }, [selectedPatient])

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await dashboardApi.getPatients()
        // Sort patients: emergency first, then by latest consultation date
        const sortedPatients = data.sort((a, b) => {
          const aIsEmergency = isEmergencyCase(a)
          const bIsEmergency = isEmergencyCase(b)
          
          if (aIsEmergency && !bIsEmergency) return -1
          if (!aIsEmergency && bIsEmergency) return 1
          
          const aDate = a.latestConsultation?.date || a.createdAt
          const bDate = b.latestConsultation?.date || b.createdAt
          return new Date(bDate).getTime() - new Date(aDate).getTime()
        })
        
        setPatients(sortedPatients)
        if (sortedPatients.length > 0) {
          setSelectedPatient(sortedPatients[0])
          
          // Check for emergency cases and show dialog
          const emergencyPatient = sortedPatients.find(p => isEmergencyCase(p))
          if (emergencyPatient) {
            setEmergencyDialog(emergencyPatient)
          }
        }
      } catch (error) {
        console.error('Error fetching patients:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
  }, [])

  const isEmergencyCase = (patient: PatientWithConsultation): boolean => {
    const symptoms = patient.latestConsultation?.transcript?.toLowerCase() || ''
    const emergencyKeywords = ['chest pain', 'shortness of breath', 'severe pain', 'bleeding', 'unconscious', 'emergency', 'urgent']
    return emergencyKeywords.some(keyword => symptoms.includes(keyword))
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!selectedPatient) {
    return <div className="flex h-screen items-center justify-center">No patients found</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Patient List Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Patient Queue</h2>
          <p className="text-sm text-gray-600">{patients.length} patients</p>
        </div>
        
        <ScrollArea className="h-full">
          <div className="p-2">
            {patients.map((patient) => (
              <Card 
                key={patient._id}
                className={`mb-2 cursor-pointer transition-colors ${
                  selectedPatient._id === patient._id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPatient(patient)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {patient.name}
                        </h3>
                        <Badge variant={isEmergencyCase(patient) ? 'destructive' : 'secondary'}>
                          {isEmergencyCase(patient) ? <AlertCircle className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                          {isEmergencyCase(patient) ? 'Emergency' : 'Active'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        {patient.age} / {patient.gender}
                      </p>
                      
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {patient.latestConsultation?.aiSummary || 'No recent consultation'}
                      </p>
                      
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {patient.latestConsultation ? new Date(patient.latestConsultation.date).toLocaleString() : 'No consultation'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Patient Details */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>
                  {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {selectedPatient.name}
                </h1>
                <p className="text-gray-600">
                  {selectedPatient.age} years old • {selectedPatient.gender === 'M' ? 'Male' : 'Female'}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
              <Button variant="outline" size="sm">
                <Video className="w-4 h-4 mr-2" />
                Video Call
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Symptoms */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Symptoms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{selectedPatient.latestConsultation?.transcript || 'No symptoms recorded'}</p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {selectedPatient.latestConsultation ? `Reported ${new Date(selectedPatient.latestConsultation.date).toLocaleString()}` : 'No consultation date'}
                </div>
              </CardContent>
            </Card>

            {/* AI Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Summary from Prescription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Medications:</h4>
                    <div className="text-sm text-gray-700">
                      {loadingMedicines ? (
                        <p>Generating medicine recommendations...</p>
                      ) : medicineRecommendations ? (
                        <div className="whitespace-pre-line">{medicineRecommendations}</div>
                      ) : (
                        selectedPatient.latestConsultation?.aiSummary || 'No AI summary available'
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <Badge variant="secondary">Medium</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border-l-2 border-blue-200 pl-3">
                    <p className="text-sm font-medium text-gray-900">Last Visit</p>
                    <p className="text-sm text-gray-600">Routine checkup - 2 weeks ago</p>
                  </div>
                  <div className="border-l-2 border-green-200 pl-3">
                    <p className="text-sm font-medium text-gray-900">Allergies</p>
                    <p className="text-sm text-gray-600">No known allergies</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Mark Emergency
                </Button>
                <Button variant="outline" className="w-full">
                  Print Slip
                </Button>
                <Button variant="outline" className="w-full">
                  Add Follow-up
                </Button>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Mark as Seen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Emergency Patient Dialog */}
      <Dialog open={!!emergencyDialog} onOpenChange={() => setEmergencyDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Emergency Case Alert
            </DialogTitle>
          </DialogHeader>
          
          {emergencyDialog && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback className="bg-red-100 text-red-700">
                    {emergencyDialog.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{emergencyDialog.name}</h3>
                  <p className="text-sm text-gray-600">
                    {emergencyDialog.age} years • {emergencyDialog.gender === 'M' ? 'Male' : 'Female'}
                  </p>
                  <p className="text-xs text-gray-500">ID: {emergencyDialog.uhid}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Emergency Symptoms:</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                  {emergencyDialog.latestConsultation?.transcript || 'No symptoms recorded'}
                </p>
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                Reported: {emergencyDialog.latestConsultation ? 
                  new Date(emergencyDialog.latestConsultation.date).toLocaleString() : 
                  'No consultation date'
                }
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button 
                  onClick={() => {
                    setSelectedPatient(emergencyDialog)
                    setEmergencyDialog(null)
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  View Patient
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEmergencyDialog(null)}
                  className="flex-1"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}