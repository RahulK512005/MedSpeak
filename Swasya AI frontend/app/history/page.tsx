'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'
import ConsultationDetailModal from '@/components/consultation/consultation-detail-modal'
import { consultationApi, Consultation } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Search, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function HistoryPage() {
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
        // Sort by date, most recent first
        const sorted = data.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        setConsultations(sorted)
        setFilteredConsultations(sorted)
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

  // Group consultations by date
  const groupedConsultations = filteredConsultations.reduce((acc, consultation) => {
    const date = new Date(consultation.timestamp)
    const dateKey = format(date, 'yyyy-MM-dd')
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(consultation)
    return acc
  }, {} as Record<string, Consultation[]>)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Consultation History</h1>
              <p className="text-muted-foreground mb-6">View past consultations chronologically</p>
              
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
                <p className="text-muted-foreground">Loading history...</p>
              </div>
            ) : Object.keys(groupedConsultations).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery ? 'No consultations found matching your search' : 'No consultation history'}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedConsultations)
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .map(([dateKey, consultations]) => (
                    <div key={dateKey}>
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar size={20} className="text-primary" />
                        <h2 className="text-xl font-semibold">
                          {format(new Date(dateKey), 'MMMM dd, yyyy')}
                        </h2>
                        <span className="text-sm text-muted-foreground">
                          ({consultations.length} {consultations.length === 1 ? 'consultation' : 'consultations'})
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {consultations.map((consultation) => (
                          <Card
                            key={consultation._id || consultation.uhid}
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => handleViewDetails(consultation)}
                          >
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm text-muted-foreground">{consultation.uhid}</p>
                                  <h3 className="font-bold text-lg">{consultation.patientName}</h3>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(consultation.timestamp), 'hh:mm a')}
                                </span>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-foreground line-clamp-2">{consultation.summary}</p>
                            </CardContent>
                          </Card>
                        ))}
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

