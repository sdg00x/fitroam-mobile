// Pass-through to the UserContext. Every caller still imports useUser
// from this file — but the actual state lives in src/context/UserProvider.tsx.
// This removes the per-screen race condition (each screen used to load
// from AsyncStorage on its own, which raced fetch calls).

import { useUserContext, type User } from '../context/UserProvider'

export type { User }

export function useUser() {
  return useUserContext()
}

// Validation helpers — used by GetAccessForm
export function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

export function isValidUKPhone(s: string): boolean {
  const clean = s.replace(/[\s\-()]/g, '')
  return /^(\+44|0)7\d{9}$/.test(clean)
}

export function isValidName(s: string): boolean {
  return s.trim().length >= 2
}
