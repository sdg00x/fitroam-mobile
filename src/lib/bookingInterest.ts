import { API_BASE } from './api'

export interface RecordBookingInterestInput {
  userId: string
  gymId: string
  email: string
  tripId?: string
  source?: 'gym_card' | 'trip_detail'
}

export interface BookingInterestResponse {
  ok: true
  id: string
  pricePence: number
  gymName: string
  createdAt: string
}

export interface BookingInterestError {
  ok: false
  error: string
}

/**
 * Records early-access interest in a verified gym's day-pass booking.
 * Fakedoor: writes a row server-side, fires an email alert to the founder.
 * Does NOT actually book anything.
 */
export async function recordBookingInterest(
  input: RecordBookingInterestInput,
): Promise<BookingInterestResponse | BookingInterestError> {
  try {
    const res = await fetch(`${API_BASE}/api/booking-interest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': input.userId,
      },
      body: JSON.stringify({
        gymId: input.gymId,
        email: input.email,
        tripId: input.tripId,
        source: input.source ?? 'gym_card',
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, error: data?.error ?? `HTTP ${res.status}` }
    }
    return { ok: true, ...data }
  } catch (err: any) {
    return { ok: false, error: err?.message ?? 'Network error' }
  }
}
