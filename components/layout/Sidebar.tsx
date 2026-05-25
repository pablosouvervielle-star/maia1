'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  MessageSquarePlus,
  FlaskConical,
  Settings,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patients', label: 'Pacientes', icon: Users },
  { href: '/consultation/new', label: 'Nueva Consulta', icon: MessageSquarePlus },
  { href: '/research', label: 'Investigación', icon: FlaskConical },
  { href: '/settings', label: 'Configuración', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
      style={{
        background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
        borderRight: '1px solid rgba(129,140,248,0.15)',
      }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4"
        style={{ borderColor: 'rgba(129,140,248,0.15)' }}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
            <Stethoscope className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-black tracking-widest text-white">MAIA</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return collapsed ? (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200',
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-indigo-300/60 hover:text-indigo-200 hover:bg-indigo-500/10'
                  )}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                    boxShadow: '0 0 16px rgba(99,102,241,0.4)',
                  } : {}}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          ) : (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'text-white shadow-lg'
                  : 'text-indigo-300/60 hover:text-indigo-200 hover:bg-indigo-500/10'
              )}
              style={isActive ? {
                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                boxShadow: '0 0 16px rgba(99,102,241,0.3)',
              } : {}}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t p-2" style={{ borderColor: 'rgba(129,140,248,0.15)' }}>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-indigo-300/50 hover:text-indigo-200 hover:bg-indigo-500/10"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  )
}
