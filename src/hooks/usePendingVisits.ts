import { useState, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import { useUserContext } from '../context/UserProvider'
import { API_BASE } from '../lib/api'


export interface PendingVisit {
  id:           string
  gymId:        string
  activatedAt:  string
  accessType:   string
  status:       string
  gym: {
    id:        string
    name:      string
    address:   string
    photoUrls: string[]
  }
}

export function usePendingVisits() {
  const [visits, setVisits] = useState<PendingVisit[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useUserContext()

  const load = useCallback(async () => {
    if (!user?.id) {
      setVisits([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/visits/pending`, {
        headers: { 'x-user-id': user.id },
      })
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      setVisits(data.visits || [])
    } catch (err) {
      console.warn('[usePendingVisits] load failed', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const confirm = useCallback(async (visit: PendingVisit, status: 'confirmed' | 'denied') => {
    if (!user?.id) return
    try {
      await fetch(`${API_BASE}/api/gyms/${visit.gymId}/visits/${visit.id}`, {
        method:  'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id':    user.id,
        },
        body: JSON.stringify({ status }),
      })
      // Remove from local pending list
      setVisits(prev => prev.filter(v => v.id !== visit.id))
    } catch (err) {
      console.warn('[usePendingVisits] confirm failed', err)
    }
  }, [user?.id])

  return { visits, loading, confirm, refresh: load }
}
