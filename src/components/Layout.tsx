import React, { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Columns3, Bot, Target, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads', path: '/leads', icon: Users },
    { name: 'Kanban', path: '/kanban', icon: Columns3 },
    { name: 'Agenda IA', path: '/agenda-ia', icon: Bot },
  ]

  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard Comercial'
    if (pathname.startsWith('/leads/')) return 'Detalhes do Lead'
    if (pathname.startsWith('/leads')) return 'Central de Leads'
    if (pathname.startsWith('/kanban')) return 'Funil de Vendas (Kanban)'
    if (pathname.startsWith('/agenda-ia')) return 'Agenda & Assistente IA'
    return 'VendaForte CRM'
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'VF'

  const NavContent = () => (
    <div className="flex h-full flex-col justify-between bg-[#0B1220] text-white">
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-white/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-[#10B981]">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white text-base">VendaForte</span>
            <span className="ml-1 text-xs font-semibold uppercase text-[#10B981]">CRM</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5 px-3 py-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname.startsWith(item.path)

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileDrawerOpen(false)}
                className={`relative flex items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-[#10B981]" />
                )}
                <Icon className={`h-5 w-5 ${isActive ? 'text-[#10B981]' : 'text-gray-400'}`} />
                {item.name}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* User profile card at footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-xs font-bold text-white shadow-sm">
              {userInitials}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-semibold text-white">
                {user?.name || 'Vendedor'}
              </p>
              <p className="truncate text-[11px] text-gray-400">
                {user?.email || 'comercial@vendaforte.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
            aria-label="Sair do sistema"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-red-400 transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      {/* Desktop Sidebar (260px) */}
      <aside className="hidden md:flex md:w-[260px] md:flex-col md:fixed md:inset-y-0 z-30">
        <NavContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative flex w-[260px] flex-col z-10">
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1 text-gray-300 hover:text-white"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
            <NavContent />
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="flex flex-1 flex-col md:pl-[260px]">
        {/* Header (64px) */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#E5E7EB] bg-white px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-[#1F2937]">
              {getPageTitle(location.pathname)}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
