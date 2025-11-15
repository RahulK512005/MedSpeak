'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type AIProvider = 'gemma2:2b' | 'gemini'

interface AIModelContextType {
  selectedProvider: AIProvider
  setSelectedProvider: (provider: AIProvider) => void
}

const AIModelContext = createContext<AIModelContextType | undefined>(undefined)

export function AIModelProvider({ children }: { children: ReactNode }) {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('gemma2:2b')

  return (
    <AIModelContext.Provider value={{ selectedProvider, setSelectedProvider }}>
      {children}
    </AIModelContext.Provider>
  )
}

export function useAIModel() {
  const context = useContext(AIModelContext)
  if (context === undefined) {
    throw new Error('useAIModel must be used within an AIModelProvider')
  }
  return context
}