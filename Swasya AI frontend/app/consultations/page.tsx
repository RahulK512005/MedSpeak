'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'
import ConsultationGrid from '@/components/dashboard/consultation-grid'
import ConsultationDetailModal from '@/components/consultation/consultation-detail-modal'
import { consultationApi, Consultation } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function ConsultationsPage() {
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
        setConsultations(data)
        setFilteredConsultations(data)
      } catch (error: any) {
        console.error('Failed to fetch consultations:', error)
        setConsultations([])
        setFilteredConsultations([])
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
          c.uhid.toLowerCase().includes(query) ||
          c.summary.toLowerCase().includes(query)
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
              <h1 className="text-3xl font-bold mb-2">All Consultations</h1>
              <p className="text-muted-foreground mb-6">View and manage all patient consultations</p>
              
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  placeholder="Search by patient name, UHID, or summary..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading consultations...</p>
              </div>
            ) : filteredConsultations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery ? 'No consultations found matching your search' : 'No consultations yet'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredConsultations.map((consultation) => (
                  <div
                    key={consultation._id || consultation.uhid}
                    onClick={() => handleViewDetails(consultation)}
                    className="cursor-pointer"
                  >
                    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">{consultation.uhid}</p>
                          <h3 className="font-bold text-lg">{consultation.patientName}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {consultation.age}y, {consultation.gender}
                      </p>
                      <p className="text-sm text-foreground line-clamp-2">{consultation.summary}</p>
                    </div>
                  </div>
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

