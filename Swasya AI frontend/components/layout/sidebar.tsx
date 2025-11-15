'use client'

import { BarChart3, Clock, FileText, Home, Settings, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: BarChart3, label: 'Consultations', href: '/consultations' },
    { icon: Clock, label: 'History', href: '/history' },
    { icon: FileText, label: 'Prescriptions', href: '/prescriptions' },
    { icon: Sparkles, label: 'AI Insights', href: '/insights' },
  ]

  return (
    <aside className="w-64 border-r border-border bg-sidebar text-sidebar-foreground flex flex-col hidden md:flex">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">MedSpeak</h1>
            <p className="text-xs text-sidebar-foreground/60">Healthcare AI</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-sidebar-accent/20 transition-colors">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  )
}
