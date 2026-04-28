import { useState, useEffect } from 'react'
import * as Location from 'expo-location'

interface LocationState {
  lat:         number | null
  lng:         number | null
  cityName:    string
  loading:     boolean
  error:       string | null
  refresh:     () => void
}

// Fallback to London if location unavailable
const LONDON = { lat: 51.5074, lng: -0.1278, cityName: 'London' }

export function useLocation(): LocationState {
  const [lat,      setLat]      = useState<number | null>(null)
  const [lng,      setLng]      = useState<number | null>(null)
  const [cityName, setCityName] = useState('Locating...')
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  async function getLocation() {
    try {
      setLoading(true)
      setError(null)

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status !== 'granted') {
        // Permission denied — fall back to London silently
        setLat(LONDON.lat)
        setLng(LONDON.lng)
        setCityName(LONDON.cityName)
        return
      }

      // Get coordinates
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      const { latitude, longitude } = loc.coords
      setLat(latitude)
      setLng(longitude)

      // Reverse geocode to get city name
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude })

      if (place) {
        const city = place.city ?? place.region ?? place.country ?? 'Here'
        setCityName(city)
      }

    } catch (err) {
      // Any error — fall back to London
      setLat(LONDON.lat)
      setLng(LONDON.lng)
      setCityName(LONDON.cityName)
      setError('Could not detect location — showing London')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { getLocation() }, [])

  return { lat, lng, cityName, loading, error, refresh: getLocation }
}