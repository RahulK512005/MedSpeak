const API_BASE_URL = 'http://localhost:5000'

export interface PatientWithConsultation {
  _id: string
  name: string
  uhid: string
  age: number
  gender: string
  contact?: string
  createdAt: string
  latestConsultation?: {
    _id: string
    transcript?: string
    aiSummary?: string
    bulletSummary?: string
    medicineRecommendations?: string
    prescriptionData?: any
    doctorNotes?: string
    date: string
  }
}

export interface ConsultationWithPatient {
  _id: string
  patientId: {
    _id: string
    name: string
    uhid: string
    age: number
    gender: string
    contact?: string
  }
  transcript?: string
  aiSummary?: string
  bulletSummary?: string
  medicineRecommendations?: string
  prescriptionData?: any
  doctorNotes?: string
  date: string
}

export const dashboardApi = {
  getPatients: async (): Promise<PatientWithConsultation[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/patients`)
      if (!response.ok) {
        throw new Error('Failed to fetch patients')
      }
      return response.json()
    } catch (error) {
      console.error('Error fetching patients:', error)
      return []
    }
  },

  getConsultations: async (): Promise<ConsultationWithPatient[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/consultations`)
      if (!response.ok) {
        throw new Error('Failed to fetch consultations')
      }
      return response.json()
    } catch (error) {
      console.error('Error fetching consultations:', error)
      return []
    }
  }
}