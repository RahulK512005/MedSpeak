'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight, FileText, Clock, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface Consultation {
  _id?: string
  id?: string
  uhid: string
  patientName: string
  age: number
  gender: string
  timestamp: string
  summary: string
  prescriptions: number
  aiModel?: string
  status: 'completed' | 'in-progress'
}

interface ConsultationCardProps {
  consultation: Consultation
  onViewDetails: (consultation: Consultation) => void
  onDelete?: (id: string) => void
}

export default function ConsultationCard({
  consultation,
  onViewDetails,
  onDelete,
}: ConsultationCardProps) {
  const date = new Date(consultation.timestamp)
  const formattedDate = format(date, 'MMM dd, yyyy')
  const formattedTime = format(date, 'hh:mm a')

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground">{consultation.uhid}</p>
            <h3 className="font-bold text-lg">{consultation.patientName}</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            consultation.status === 'completed'
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {consultation.status === 'completed' ? 'Completed' : 'In Progress'}
          </span>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{consultation.age}y, {consultation.gender}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 text-sm">
          <Clock size={16} className="text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{formattedDate}</p>
            <p className="text-muted-foreground text-xs">{formattedTime}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-foreground line-clamp-2">{consultation.summary}</p>
        </div>

        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">{consultation.prescriptions} Rx</span>
          </div>
          {consultation.aiModel && (
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
              {consultation.aiModel}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onViewDetails(consultation)}
          >
            View Details
            <ChevronRight size={16} />
          </Button>
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(consultation._id || consultation.id || '')
              }}
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
