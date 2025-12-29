'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in by checking for token
    const token = getTokenFromCookie()
    if (token) {
      // Token exists, user is considered logged in
      // You could decode the token to get user info, but for now we'll just check token existence
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = (token: string, userData: User) => {
    // Store token in cookie
    document.cookie = `token=${token}; path=/; max-age=604800` // 7 days
    setUser(userData)
  }

  const logout = () => {
    document.cookie = 'token=; path=/; max-age=0'
    setUser(null)
    window.location.href = '/auth/login'
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!getTokenFromCookie(),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie.split(';')
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='))
  return tokenCookie ? tokenCookie.split('=')[1] : null
}

