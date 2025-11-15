const API_BASE_URL = 'http://localhost:5000'

export interface Patient {
  _id?: string
  uhid: string
  name: string
  age: number
  gender: string
  createdAt?: string
}

export interface Consultation {
  _id?: string
  id?: string
  patientId?: string
  uhid: string
  patientName: string
  age: number
  gender: string
  timestamp: string
  summary: string
  transcripts?: string
  prescriptions: number
  prescriptionImage?: string
  aiModel?: string
  status: 'completed' | 'in-progress'
}

// Patient API calls
export const patientApi = {
  create: async (patient: Omit<Patient, '_id' | 'createdAt'>): Promise<Patient> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient)
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to create patient' }))
        throw new Error(error.error || 'Failed to create patient')
      }
      return response.json()
    } catch (error: any) {
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        // Return mock patient when backend unavailable
        return {
          _id: Date.now().toString(),
          ...patient,
          createdAt: new Date().toISOString()
        }
      }
      throw error
    }
  },

  getAll: async (): Promise<Patient[]> => {
    const response = await fetch(`${API_BASE_URL}/api/patients`)
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch patients' }))
      throw new Error(error.error || 'Failed to fetch patients')
    }
    return response.json()
  },

  getById: async (id: string): Promise<Patient> => {
    const response = await fetch(`${API_BASE_URL}/api/patients/${id}`)
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch patient' }))
      throw new Error(error.error || 'Failed to fetch patient')
    }
    return response.json()
  }
}

// Consultation API calls
export const consultationApi = {
  create: async (consultation: Omit<Consultation, '_id'>): Promise<Consultation> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consultation)
      })
      
      if (!response.ok) {
        // Return mock consultation for any server error
        return {
          _id: Date.now().toString(),
          id: Date.now().toString(),
          ...consultation,
          aiModel: 'Offline Mode'
        }
      }
      
      return response.json()
    } catch (error: any) {
      // Return mock consultation for any error
      return {
        _id: Date.now().toString(),
        id: Date.now().toString(),
        ...consultation,
        aiModel: 'Offline Mode'
      }
    }
  },

  getAll: async (): Promise<Consultation[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/consultations`)
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch consultations' }))
        throw new Error(error.error || 'Failed to fetch consultations')
      }
      return response.json()
    } catch (error: any) {
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        return [] // Return empty array when backend is unavailable
      }
      throw error
    }
  },

  getById: async (id: string): Promise<Consultation> => {
    const response = await fetch(`${API_BASE_URL}/api/consultations/${id}`)
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch consultation' }))
      throw new Error(error.error || 'Failed to fetch consultation')
    }
    return response.json()
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/consultations/${id}`, {
        method: 'DELETE'
      })
      
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        throw new Error('Backend server not responding. Please start the backend server.')
      }
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to delete consultation' }))
        throw new Error(error.error || error.message || 'Failed to delete consultation')
      }
    } catch (error: any) {
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Please ensure backend is running on port 5000.')
      }
      throw error
    }
  }
}

// AI API calls
export const aiApi = {
  generateSummary: async (transcript: string, provider: 'auto' | 'ollama' | 'gemini' = 'auto'): Promise<{ summary: string }> => {
    if (!transcript || transcript.trim().length === 0) {
      throw new Error('Text is required in the request body')
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/ai/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcript.trim(), provider })
      })
      
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        throw new Error('Backend server not responding. Please start the backend server.')
      }
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to generate summary' }))
        throw new Error(error.error || error.message || 'Failed to generate summary')
      }
      return response.json()
    } catch (error: any) {
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Please ensure backend is running on port 5000.')
      }
      throw error
    }
  },
  
  getStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/ai/status`)
    if (!response.ok) throw new Error('Failed to get AI status')
    return response.json()
  }
}