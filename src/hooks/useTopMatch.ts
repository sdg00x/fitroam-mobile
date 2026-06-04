import { useState, useEffect } from 'react'
import { useProfile } from './useProfile'
import { GymData } from '../components/GymCard'
import { API_BASE } from '../lib/api'


export function useTopMatch(lat: number | null, lng: number | null) {
  const { profile } = useProfile()
  const [gym,     setGym]     = useState<GymData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (lat == null || lng == null) return
    let cancelled = false
    setLoading(true)
    const params = new URLSearchParams({
      lat:                 String(lat),
      lng:                 String(lng),
      primaryActivity:     profile.primaryActivity,
      activities:          profile.activities.join(','),
      facilityTypes:       profile.facilityTypes.join(','),
      lifestyle:           profile.lifestyle.join(','),
      priorities:          profile.priorities.join(','),
      maxDistanceMinutes:  String(profile.maxDistanceMinutes),
      monthlyBudget:       profile.monthlyBudget,
      travelDailyBudget:   profile.travelDailyBudget,
    })
    fetch(`${API_BASE}/api/gyms?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (cancelled) return
        const gyms: GymData[] = data.gyms || []
        setGym(gyms[0] ?? null)
      })
      .catch(() => { if (!cancelled) setGym(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [lat, lng, profile.primaryActivity, profile.activities.join(','), profile.priorities.join(',')])

  return { gym, loading }
}
