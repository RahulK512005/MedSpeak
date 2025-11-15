'use client'

import { Bell, Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Navbar() {
  return (
    <nav className="border-b border-border bg-card h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden">
          <Menu size={24} />
        </button>
        <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md">
          <Search size={18} className="text-muted-foreground" />
          <Input placeholder="Search consultations..." className="border-0 bg-muted" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">Dr. Amit Kumar</p>
            <p className="text-xs text-muted-foreground">Health Assistant</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent"></div>
        </div>
      </div>
    </nav>
  )
}
