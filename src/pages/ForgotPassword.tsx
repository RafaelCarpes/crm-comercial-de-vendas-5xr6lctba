import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Target, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await pb.collection('users').requestPasswordReset(email.trim())
      setIsSuccess(true)
    } catch (err: unknown) {
      console.error('Erro na solicitação:', err)
      // Even if email is not found, security best practice or generic message
      setError('Ocorreu um erro ao processar o pedido. Verifique o e-mail informado.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F3F4F6] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1220] shadow-md">
            <Target className="h-6 w-6 text-[#10B981]" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#1F2937]">Recuperar Senha</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Informe seu e-mail para receber um link de redefinição
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-[#10B981]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm text-gray-700">
              Se houver uma conta associada a <strong>{email}</strong>, você receberá um link com as
              instruções para redefinir sua senha.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#10B981] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#059669]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-xs font-semibold text-[#1F2937]">
                E-mail cadastrado
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@empresa.com"
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
                'Enviar link de recuperação'
              )}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar para o login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
