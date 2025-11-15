'use client'

import { useState, useEffect } from 'react'
import ConsultationCard from '@/components/dashboard/consultation-card'
import ConsultationDetailModal from '@/components/consultation/consultation-detail-modal'
import { consultationApi, Consultation } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function ConsultationGrid() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const data = await consultationApi.getAll()
        setConsultations(data)
        setFilteredConsultations(data)
      } catch (error: any) {
        console.error('Failed to fetch consultations:', error)
        // Set empty array if backend is unavailable
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

  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleViewDetails = (consultation: Consultation) => {
    setSelectedConsultation(consultation)
    setIsDetailOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this consultation?')) return
    
    try {
      await consultationApi.delete(id)
      const updatedConsultations = consultations.filter(c => c._id !== id && c.id !== id)
      setConsultations(updatedConsultations)
      setFilteredConsultations(updatedConsultations)
    } catch (error: any) {
      console.error('Failed to delete consultation:', error)
      if (error.message?.includes('backend') || error.message?.includes('connect')) {
        // Fallback: delete locally when backend is unavailable
        const updatedConsultations = consultations.filter(c => c._id !== id && c.id !== id)
        setConsultations(updatedConsultations)
        setFilteredConsultations(updatedConsultations)
        alert('Backend unavailable. Consultation removed locally only.')
      } else {
        alert('Failed to delete consultation. Please try again.')
      }
    }
  }

  return (
    <>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Recent Consultations</h2>
          <p className="text-muted-foreground mb-4">Manage and review patient consultations</p>
          
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
            <p className="text-muted-foreground mb-4">Loading consultations...</p>
          </div>
        ) : filteredConsultations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No consultations found matching your search' : 'No consultations yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConsultations.map((consultation) => (
              <ConsultationCard
                key={consultation._id || consultation.uhid}
                consultation={consultation}
                onViewDetails={handleViewDetails}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {selectedConsultation && (
        <ConsultationDetailModal
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          consultation={selectedConsultation}
        />
      )}
    </>
  )
}
