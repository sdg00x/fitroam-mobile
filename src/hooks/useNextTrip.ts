import { useState, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import { useUser } from './useUser'
import { Trip } from '../components/TripCard'

const API_BASE = 'http://192.168.0.64:3000'

interface Result {
  trip:        Trip | null
  daysAway:    number | null
  legCount:    number
  nightCount:  number
  loading:     boolean
  refresh:     () => Promise<void>
}

function daysUntil(iso: string): number {
  const today  = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(iso); target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function useNextTrip(): Result {
  const { user } = useUser()
  const [trip,    setTrip]    = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTrips = useCallback(async () => {    if (!user?.id) {
      setTrip(null)
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`${API_BASE}/api/trips`, {
        headers: { 'x-user-id': user.id },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const trips: Trip[] = data.trips || []
      const today = new Date(); today.setHours(0, 0, 0, 0)

      // Find soonest upcoming trip (last leg's departOn >= today)
      const upcoming = trips
        .filter(t => {
          const lastLeg = t.legs[t.legs.length - 1]
          if (!lastLeg) return false
          const lastDepart = new Date(lastLeg.departOn)
          lastDepart.setHours(0, 0, 0, 0)
          return lastDepart >= today
        })
        .sort((a, b) => {
          const aArrive = new Date(a.legs[0]?.arriveOn ?? 0).getTime()
          const bArrive = new Date(b.legs[0]?.arriveOn ?? 0).getTime()
          return aArrive - bArrive
        })
      setTrip(upcoming[0] ?? null)
    } catch {
      setTrip(null)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useFocusEffect(useCallback(() => { fetchTrips() }, [fetchTrips]))

  let daysAway:   number | null = null
  let nightCount: number        = 0
  if (trip && trip.legs.length > 0) {
    const firstLeg = trip.legs[0]
    const lastLeg  = trip.legs[trip.legs.length - 1]
    daysAway   = Math.max(0, daysUntil(firstLeg.arriveOn))
    nightCount = Math.round(
      (new Date(lastLeg.departOn).getTime() - new Date(firstLeg.arriveOn).getTime())
        / (1000 * 60 * 60 * 24)
    )
  }

  return {
    trip,
    daysAway,
    legCount:   trip?.legs.length ?? 0,
    nightCount,
    loading,
    refresh: fetchTrips,
  }
}
