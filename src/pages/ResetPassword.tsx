import React, { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Target, Lock, CheckCircle2, AlertCircle } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== passwordConfirm) {
      setError('As senhas não coincidem.')
      return
    }

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    if (!token) {
      setError('Token de validação ausente ou expirado.')
      return
    }

    setIsLoading(true)

    try {
      await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm)
      setIsSuccess(true)
    } catch (err: unknown) {
      console.error('Erro ao redefinir senha:', err)
      setError('Falha ao redefinir a senha. O link pode ter expirado ou ser inválido.')
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
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#1F2937]">
            Definir nova senha
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Crie uma senha forte com no mínimo 8 caracteres
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-[#10B981]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-gray-800">
              Sua senha foi redefinida com sucesso!
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#10B981] py-2.5 text-sm font-semibold text-white hover:bg-[#059669]"
            >
              Ir para o Login
            </button>
          </div>
        ) : !token ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <p className="text-sm text-red-600">
              Nenhum token de redefinição foi encontrado na URL. Por favor, solicite um novo link de
              recuperação.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex w-full items-center justify-center rounded-lg bg-[#10B981] py-2.5 text-sm font-semibold text-white hover:bg-[#059669]"
            >
              Solicitar novo link
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
              <Label htmlFor="password" className="text-xs font-semibold text-[#1F2937]">
                Nova senha
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 8 caracteres"
                  className="h-11 pl-10 focus-visible:border-[#10B981] focus-visible:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="passwordConfirm" className="text-xs font-semibold text-[#1F2937]">
                Confirmar nova senha
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="passwordConfirm"
                  type="password"
                  required
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Repita a nova senha"
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
                'Salvar nova senha'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
