"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

interface User {
  id: string
  email: string
  name: string | null
  createdAt: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: User }>(
        "/api/auth/me",
      )
      setUser(res.data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (email: string, password: string) => {
    const res = await api.post<{ success: boolean; data: { accessToken: string } }>(
      "/api/auth/login",
      { email, password },
    )
    api.setToken(res.data.accessToken)
    await fetchUser()
    router.push("/dashboard")
  }

  const register = async (
    email: string,
    password: string,
    name: string,
  ) => {
    const res = await api.post<{
      success: boolean
      data: { user: User; accessToken: string }
    }>("/api/auth/register", { email, password, name })
    api.setToken(res.data.accessToken)
    setUser(res.data.user)
    router.push("/dashboard")
  }

  const logout = useCallback(() => {
    api.removeToken()
    setUser(null)
    router.push("/login")
  }, [router])

  return { user, loading, login, register, logout }
}
