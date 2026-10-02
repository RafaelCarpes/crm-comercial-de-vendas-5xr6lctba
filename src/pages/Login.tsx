import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Target, Lock, Mail, ArrowRight } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/context/AuthContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { refreshAuth } = useAuth()

  const [email, setEmail] = useState('rafaelcarpes@hotmail.com')
  const [password, setPassword] = useState('Skip@Pass')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await pb.collection('users').authWithPassword(email.trim(), password)
      refreshAuth()
      navigate(from, { replace: true })
    } catch (err: unknown) {
      console.error('Erro no login:', err)
      setError('Credenciais inválidas. Verifique seu e-mail e senha.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F3F4F6] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
        {/* Logo and Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B1220] shadow-md">
            <Target className="h-8 w-8 text-[#10B981]" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#1F2937]">VendaForte CRM</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Centralize seus leads e feche mais vendas</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-xs font-semibold text-[#1F2937]">
              E-mail corporativo
            </Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@vendaforte.com"
                className="h-11 pl-10 focus-visible:border-[#10B981] focus-visible:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold text-[#1F2937]">
                Senha
              </Label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-[#1E40AF] hover:text-[#1E3A8A] hover:underline"
              >
                Esqueceu sua senha?
              </Link>
            </div>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 pl-10 focus-visible:border-[#10B981] focus-visible:ring-emerald-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#10B981] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#059669] focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                Entrar no CRM
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 rounded-lg bg-gray-50 p-3 text-center text-xs text-gray-500">
          Acesso restrito ao time comercial. Contate o administrador para obter permissões.
        </div>
      </div>
    </div>
  )
}
