'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Square, Loader } from 'lucide-react'
import { aiApi } from '@/lib/api'

interface RecordingControlsProps {
  onComplete: (transcript: string, summary: string) => void
}

export default function RecordingControls({ onComplete }: RecordingControlsProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<'idle' | 'listening' | 'transcribing' | 'summarizing'>('idle')
  const [transcript, setTranscript] = useState('')
  const [summary, setSummary] = useState('')
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef<string>('')

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const handleStartRecording = async () => {
    try {
      // Try Web Speech API first (real-time transcription)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        finalTranscriptRef.current = '' // Reset transcript
        const recognition = new SpeechRecognition()
        recognitionRef.current = recognition
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event: any) => {
          let interimTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscriptRef.current += transcript + ' '
            } else {
              interimTranscript += transcript
            }
          }
          const fullTranscript = finalTranscriptRef.current + interimTranscript
          setTranscript(fullTranscript)
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          if (event.error === 'no-speech') {
            setStatus('idle')
            setIsRecording(false)
            recognition.stop()
          }
        }

        recognition.onend = async () => {
          setIsRecording(false)
          const currentTranscript = finalTranscriptRef.current.trim() || transcript.trim()
          if (currentTranscript && currentTranscript.length > 0) {
            setStatus('summarizing')
            setIsProcessing(true)
            try {
              const result = await aiApi.generateSummary(currentTranscript, 'gemini')
              setSummary(result.summary)
            } catch (error) {
              console.error('Error generating summary:', error)
              setSummary('Summary generation failed. Ensure Ollama is running or Gemini API is configured.')
            } finally {
              setStatus('idle')
              setIsProcessing(false)
            }
          } else {
            console.log('No transcript available for summary generation')
            setStatus('idle')
            setIsProcessing(false)
          }
        }

        recognition.start()
        setIsRecording(true)
        setStatus('listening')
      } else {
        // Fallback: Use MediaRecorder API
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
        })
        mediaRecorderRef.current = mediaRecorder
        
        const chunks: Blob[] = []
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data)
          }
        }
        
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: mediaRecorder.mimeType })
          setAudioChunks(chunks)
          await processAudio(audioBlob)
        }
        
        mediaRecorder.start()
        setIsRecording(true)
        setStatus('listening')
      }
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
      setStatus('idle')
      setIsRecording(false)
    }
  }

  const handleStopRecording = () => {
    // Stop Web Speech API if active
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
      return
    }
    
    // Stop MediaRecorder if active
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      setIsRecording(false)
      setStatus('transcribing')
      setIsProcessing(true)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Try to use Web Speech API for real-time transcription
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        // Use Web Speech API
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onresult = async (event: any) => {
          const transcriptText = event.results[0][0].transcript
          setTranscript(transcriptText)
          
          if (transcriptText && transcriptText.trim().length > 0) {
            setStatus('summarizing')
            // Generate AI summary
            try {
              const result = await aiApi.generateSummary(transcriptText, 'gemini')
              setSummary(result.summary)
            } catch (error) {
              console.error('Error generating summary:', error)
              setSummary('Summary generation failed. Ensure Ollama is running or Gemini API is configured.')
            } finally {
              setStatus('idle')
              setIsProcessing(false)
            }
          } else {
            setStatus('idle')
            setIsProcessing(false)
          }
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          // Fallback to manual input
          handleManualInput()
        }

        recognition.start()
      } else {
        // Fallback: manual input or send to backend
        handleManualInput()
      }
    } catch (error) {
      console.error('Error processing audio:', error)
      handleManualInput()
    }
  }

  const handleManualInput = async () => {
    const manualTranscript = prompt('Please enter the consultation transcript (or leave empty to skip):')
    if (manualTranscript && manualTranscript.trim().length > 0) {
      setTranscript(manualTranscript)
      setStatus('summarizing')
      try {
        const result = await aiApi.generateSummary(manualTranscript, 'gemini')
        setSummary(result.summary)
      } catch (error) {
        console.error('Error generating summary:', error)
        setSummary('Summary generation failed. Ensure Ollama is running or Gemini API is configured.')
      }
    }
    setStatus('idle')
    setIsProcessing(false)
  }

  const getStatusColor = () => {
    switch (status) {
      case 'listening':
        return 'text-red-500'
      case 'transcribing':
        return 'text-blue-500'
      case 'summarizing':
        return 'text-purple-500'
      default:
        return 'text-muted-foreground'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'listening':
        return 'Listening...'
      case 'transcribing':
        return 'Transcribing...'
      case 'summarizing':
        return 'Generating Summary...'
      default:
        return 'Ready to record'
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 border border-border rounded-lg p-8 text-center">
        <div className={`text-sm font-medium mb-4 ${getStatusColor()}`}>
          {getStatusText()}
        </div>
        <div className="flex justify-center gap-4">
          {!isRecording ? (
            <Button
              size="lg"
              onClick={handleStartRecording}
              disabled={isProcessing}
              className="bg-red-500 hover:bg-red-600 text-white gap-2 min-w-48"
            >
              <Mic size={20} />
              Start Recording
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleStopRecording}
              className="bg-red-500 hover:bg-red-600 text-white gap-2 min-w-48"
            >
              <Square size={20} />
              Stop Recording
            </Button>
          )}
        </div>
      </div>

      {transcript && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Transcript</label>
          <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm min-h-24">
            {transcript}
          </div>
        </div>
      )}

      {summary && (
        <div className="space-y-2">
          <label className="text-sm font-medium">AI Summary</label>
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-sm min-h-24">
            {summary}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1" onClick={() => onComplete(transcript, summary)}>
          Skip
        </Button>
        <Button
          onClick={() => onComplete(transcript, summary)}
          disabled={!summary && !transcript}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
