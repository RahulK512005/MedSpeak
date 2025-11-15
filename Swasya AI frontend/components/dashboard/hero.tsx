'use client'

import { Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardHeroProps {
  onNewConsultation: () => void
}

export default function DashboardHero({ onNewConsultation }: DashboardHeroProps) {
  return (
    <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-2">Welcome Back</h1>
        <p className="text-muted-foreground mb-6">Create a new consultation or review patient records</p>
        <Button
          size="lg"
          onClick={onNewConsultation}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <Mic size={20} />
          Start New Consultation
        </Button>
      </div>
    </div>
  )
}
