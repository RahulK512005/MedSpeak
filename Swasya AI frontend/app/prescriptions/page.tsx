'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'
import ConsultationDetailModal from '@/components/consultation/consultation-detail-modal'
import { consultationApi, Consultation } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Search, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function PrescriptionsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const data = await consultationApi.getAll()
        // Filter only consultations with prescriptions
        const withPrescriptions = data.filter(c => c.prescriptions > 0 || c.prescriptionImage)
        setConsultations(withPrescriptions)
        setFilteredConsultations(withPrescriptions)
      } catch (error) {
        console.error('Failed to fetch prescriptions:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchConsultations()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredConsultations(consultations)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = consultations.filter(
        (c) =>
          c.patientName.toLowerCase().includes(query) ||
          c.uhid.toLowerCase().includes(query)
      )
      setFilteredConsultations(filtered)
    }
  }, [searchQuery, consultations])

  const handleViewDetails = (consultation: Consultation) => {
    setSelectedConsultation(consultation)
    setIsDetailOpen(true)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Prescriptions</h1>
              <p className="text-muted-foreground mb-6">View all patient prescriptions</p>
              
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  placeholder="Search by patient name or UHID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading prescriptions...</p>
              </div>
            ) : filteredConsultations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery ? 'No prescriptions found matching your search' : 'No prescriptions available'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredConsultations.map((consultation) => (
                  <Card
                    key={consultation._id || consultation.uhid}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleViewDetails(consultation)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">{consultation.uhid}</p>
                          <h3 className="font-bold text-lg">{consultation.patientName}</h3>
                        </div>
                        <FileText size={20} className="text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {consultation.age}y, {consultation.gender}
                      </p>
                    </CardHeader>
                    <CardContent>
                      {consultation.prescriptionImage ? (
                        <div className="mb-3">
                          <img
                            src={consultation.prescriptionImage}
                            alt="Prescription"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="mb-3 flex items-center justify-center h-32 bg-muted rounded-lg">
                          <FileText size={32} className="text-muted-foreground" />
                        </div>
                      )}
                      <p className="text-sm font-medium">
                        {consultation.prescriptions} {consultation.prescriptions === 1 ? 'prescription' : 'prescriptions'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      {selectedConsultation && (
        <ConsultationDetailModal
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          consultation={selectedConsultation}
        />
      )}
    </div>
  )
}

