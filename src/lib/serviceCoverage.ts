// Per-city service tier. Determines whether FitRoam offers concierge booking
// or discovery-only redirection. Hardcoded for MVP; becomes a DB table later.

export type ServiceTier = 'concierge' | 'discovery'

export interface ServiceCoverage {
  citySlug:        string
  cityName:        string  // canonical display name
  serviceTier:     ServiceTier
  conciergeHours?: string  // human-readable, e.g. "7am-11pm GMT"
}

// All listed cities default to 'discovery'. Flip to 'concierge' when
// fulfilment is ready in that city.
const COVERAGE: Record<string, ServiceCoverage> = {
  // No cities are concierge-active yet. Architecture in place.
  // When ready, add e.g.:
  //   london: { citySlug: 'london', cityName: 'London',
  //             serviceTier: 'concierge', conciergeHours: '7am-11pm GMT' },
}

export function getServiceCoverage(citySlug: string | null | undefined): ServiceCoverage {
  if (!citySlug) {
    return { citySlug: '', cityName: '', serviceTier: 'discovery' }
  }
  return COVERAGE[citySlug.toLowerCase()] ?? {
    citySlug,
    cityName:    citySlug,
    serviceTier: 'discovery',
  }
}

export function isConciergeActive(citySlug: string | null | undefined): boolean {
  return getServiceCoverage(citySlug).serviceTier === 'concierge'
}
