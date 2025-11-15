'use client'

import { useState, useEffect } from 'react'
import { dashboardApi } from '@/lib/dashboard-api'
import Sidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'
import DashboardHero from '@/components/dashboard/hero'
import ConsultationGrid from '@/components/dashboard/consultation-grid'
import NewConsultationModal from '@/components/consultation/new-consultation-modal'

export default function NurseDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [patients, setPatients] = useState([])
  const [consultations, setConsultations] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsData, consultationsData] = await Promise.all([
          dashboardApi.getPatients(),
          dashboardApi.getConsultations()
        ])
        setPatients(patientsData)
        setConsultations(consultationsData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <DashboardHero onNewConsultation={() => setIsModalOpen(true)} />
          <ConsultationGrid />
        </main>
      </div>
      <NewConsultationModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}