import React, { createContext, useContext, useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { UserRecord } from '@/types/crm'

interface AuthContextType {
  user: UserRecord | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => void
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserRecord | null>(() => {
    return (pb.authStore.record as unknown as UserRecord) || null
  })
  const [token, setToken] = useState<string | null>(pb.authStore.token || null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshAuth = () => {
    const currentRecord = (pb.authStore.record as unknown as UserRecord) || null
    const currentToken = pb.authStore.token || null
    setUser(currentRecord)
    setToken(currentToken)
  }

  useEffect(() => {
    // Listen to pb authStore changes
    const unsub = pb.authStore.onChange((newToken, record) => {
      setToken(newToken)
      setUser((record as unknown as UserRecord) || null)
    })

    // Check validity on mount
    if (pb.authStore.isValid) {
      setUser((pb.authStore.record as unknown as UserRecord) || null)
      setToken(pb.authStore.token)
    } else {
      pb.authStore.clear()
      setUser(null)
      setToken(null)
    }
    setIsLoading(false)

    return () => {
      unsub()
    }
  }, [])

  const logout = () => {
    pb.authStore.clear()
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
