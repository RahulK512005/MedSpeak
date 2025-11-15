'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UserCheck, Stethoscope, Heart, Shield, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleSelect = async (role: string) => {
    setSelectedRole(role)
    setIsLoading(true)
    
    // Add loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800))
    
    if (role === 'nurse') {
      router.push('/nurse-dashboard')
    } else if (role === 'doctor') {
      router.push('/doctor-dashboard')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-2xl">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
              MedSpeak
            </h1>
            <p className="text-blue-200/80 text-lg">AI-Powered Healthcare Platform</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400 font-medium">Secure & HIPAA Compliant</span>
            </div>
          </div>

          {/* Role Selection Card */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-white mb-2">Choose Your Role</h2>
                <p className="text-blue-200/70">Select your professional role to access your dashboard</p>
              </div>

              <div className="space-y-4">
                {/* Doctor Button */}
                <Button
                  onClick={() => handleRoleSelect('doctor')}
                  disabled={isLoading}
                  className={`w-full h-20 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-2 border-blue-500/30 shadow-xl transition-all duration-300 transform hover:scale-105 group ${
                    selectedRole === 'doctor' ? 'scale-105 ring-4 ring-blue-400/50' : ''
                  } ${isLoading && selectedRole === 'doctor' ? 'animate-pulse' : ''}`}
                  variant="default"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                      <Stethoscope className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-semibold text-white">Doctor</div>
                      <div className="text-sm text-blue-100/80">Patient Management & Diagnosis</div>
                    </div>
                  </div>
                  {isLoading && selectedRole === 'doctor' && (
                    <Sparkles className="w-5 h-5 text-white ml-auto animate-spin" />
                  )}
                </Button>

                {/* Nurse Button */}
                <Button
                  onClick={() => handleRoleSelect('nurse')}
                  disabled={isLoading}
                  className={`w-full h-20 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 border-2 border-emerald-500/30 shadow-xl transition-all duration-300 transform hover:scale-105 group ${
                    selectedRole === 'nurse' ? 'scale-105 ring-4 ring-emerald-400/50' : ''
                  } ${isLoading && selectedRole === 'nurse' ? 'animate-pulse' : ''}`}
                  variant="default"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                      <UserCheck className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-semibold text-white">Nurse</div>
                      <div className="text-sm text-emerald-100/80">Patient Care & Consultations</div>
                    </div>
                  </div>
                  {isLoading && selectedRole === 'nurse' && (
                    <Sparkles className="w-5 h-5 text-white ml-auto animate-spin" />
                  )}
                </Button>
              </div>

              {/* Features */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="text-blue-200/80">
                    <div className="text-2xl font-bold text-white">24/7</div>
                    <div className="text-xs">AI Support</div>
                  </div>
                  <div className="text-blue-200/80">
                    <div className="text-2xl font-bold text-white">100%</div>
                    <div className="text-xs">Secure</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-blue-200/60 text-sm">
              Powered by Advanced AI Technology
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}