import { useState, useEffect } from 'react'

const API_BASE = 'http://192.168.0.64:3000'

export interface Weather {
  tempC:       number
  feelsLikeC:  number
  condition:   string
  description: string
  icon:        string
  city:        string
  country:     string
}

export function useWeather(lat: number | null, lng: number | null) {
  const [weather, setWeather] = useState<Weather | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    if (lat == null || lng == null) return
    let cancelled = false
    setLoading(true)
    setError(false)
    fetch(`${API_BASE}/api/weather?lat=${lat}&lng=${lng}`)
      .then(async (r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((data) => {
        if (!cancelled) setWeather(data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [lat, lng])

  return { weather, loading, error }
}

// Helper: map OpenWeatherMap condition to a Tabler icon name
export function weatherIconFor(condition: string): string {
  const c = condition.toLowerCase()
  if (c.includes('clear'))        return 'sun'
  if (c.includes('cloud'))        return 'cloud'
  if (c.includes('rain'))         return 'cloud-rain'
  if (c.includes('drizzle'))      return 'cloud-rain'
  if (c.includes('thunder'))      return 'cloud-bolt'
  if (c.includes('snow'))         return 'snowflake'
  if (c.includes('mist') || c.includes('fog') || c.includes('haze')) return 'mist'
  return 'sun'
}

// Greeting based on local hour
export function greetingFor(date = new Date()): string {
  const h = date.getHours()
  if (h < 5)  return 'Late night'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Late evening'
}
