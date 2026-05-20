// Pragmatic hardcoded UK city list — replaced by Google Places autocomplete in step 4.
// Used by the Add Trip flow so the user can pick a city without typing coordinates.

export interface City {
  name:     string
  slug:     string
  country:  string
  lat:      number
  lng:      number
}

export const UK_CITIES: City[] = [
  { name: 'London',         slug: 'london',         country: 'UK', lat: 51.5074, lng: -0.1278 },
  { name: 'Manchester',     slug: 'manchester',     country: 'UK', lat: 53.4808, lng: -2.2426 },
  { name: 'Birmingham',     slug: 'birmingham',     country: 'UK', lat: 52.4862, lng: -1.8904 },
  { name: 'Leeds',          slug: 'leeds',          country: 'UK', lat: 53.8008, lng: -1.5491 },
  { name: 'Liverpool',      slug: 'liverpool',      country: 'UK', lat: 53.4084, lng: -2.9916 },
  { name: 'Bristol',        slug: 'bristol',        country: 'UK', lat: 51.4545, lng: -2.5879 },
  { name: 'Edinburgh',      slug: 'edinburgh',      country: 'UK', lat: 55.9533, lng: -3.1883 },
  { name: 'Glasgow',        slug: 'glasgow',        country: 'UK', lat: 55.8642, lng: -4.2518 },
  { name: 'Nottingham',     slug: 'nottingham',     country: 'UK', lat: 52.9548, lng: -1.1581 },
  { name: 'Sheffield',      slug: 'sheffield',      country: 'UK', lat: 53.3811, lng: -1.4701 },
  { name: 'Newcastle',      slug: 'newcastle',      country: 'UK', lat: 54.9783, lng: -1.6178 },
  { name: 'Cardiff',        slug: 'cardiff',        country: 'UK', lat: 51.4816, lng: -3.1791 },
  { name: 'Brighton',       slug: 'brighton',       country: 'UK', lat: 50.8225, lng: -0.1372 },
  { name: 'Cambridge',      slug: 'cambridge',      country: 'UK', lat: 52.2053, lng:  0.1218 },
  { name: 'Oxford',         slug: 'oxford',         country: 'UK', lat: 51.7520, lng: -1.2577 },
  { name: 'York',           slug: 'york',           country: 'UK', lat: 53.9590, lng: -1.0815 },
  { name: 'Bath',           slug: 'bath',           country: 'UK', lat: 51.3811, lng: -2.3590 },
]
