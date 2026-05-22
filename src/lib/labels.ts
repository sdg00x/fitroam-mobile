// Translates database/profile slugs into human-readable display labels.
// Single source of truth so every screen shows the same language for the same value.

const ACTIVITIES: Record<string, string> = {
  lifting:          'Lifting',
  staying_in_shape: 'Staying in shape',
  powerlifting:     'Powerlifting',
  bodybuilding:     'Bodybuilding',
  crossfit:         'CrossFit / Hyrox',
  calisthenics:     'Calisthenics',
}

const LIFESTYLE: Record<string, string> = {
  home_base:        'Home base',
  frequent_travel:  'Frequent travel',
  nomad:            'Digital nomad',
  between_cities:   'Between cities',
  planning_trip:    'Planning a trip',
  work_trips:       'Work trips',
}

const FACILITIES: Record<string, string> = {
  commercial_gym: 'Commercial gyms',
  boutique:       'Boutique studios',
  outdoor:        'Outdoor parks',
  pool:           'Swimming pools',
  hotel:          'Hotel gyms',
  home:           'Home / Airbnb',
}

const MONTHLY_BUDGET: Record<string, string> = {
  under_20:    'Under £20',
  '20_to_40':  '£20 – £40',
  '40_to_80':  '£40 – £80',
  over_80:     'Over £80',
}

const TRAVEL_BUDGET: Record<string, string> = {
  free_only:    'Free / hotel gyms',
  under_10:     'Under £10/day',
  '10_to_20':   '£10–£20/day',
  any_quality:  'Whatever it takes',
}

const PRIORITIES: Record<string, string> = {
  '24hr':        '24-hour access',
  beginner:      'Beginner friendly',
  serious:       'Serious lifters only',
  cleanliness:   'Cleanliness',
  deadlift:      'Deadlift platform',
  quiet:         'Quiet at peak times',
  equipment:     'Equipment variety',
  community:     'Strong community',
  pool:          'Pool',
  amenities:     'Showers & amenities',
}

const PATTERNS: Record<string, string> = {
  ppl:         'Push / Pull / Legs',
  upper_lower: 'Upper / Lower',
  full_body:   'Full body',
  body_part:   'Body-part split',
  program:     'Following a program',
  freestyle:   'Freestyle',
}

export function labelForActivity(slug: string): string {
  return ACTIVITIES[slug] ?? slug
}

export function labelForLifestyle(slug: string): string {
  return LIFESTYLE[slug] ?? slug
}

export function labelForFacility(slug: string): string {
  return FACILITIES[slug] ?? slug
}

export function labelForMonthlyBudget(slug: string): string {
  return MONTHLY_BUDGET[slug] ?? slug
}

export function labelForTravelBudget(slug: string): string {
  return TRAVEL_BUDGET[slug] ?? slug
}

export function labelForPriority(slug: string): string {
  return PRIORITIES[slug] ?? slug
}

export function labelForPattern(slug: string | null | undefined): string {
  if (!slug) return 'Not set'
  return PATTERNS[slug] ?? slug
}

export function labelsForActivities(slugs: string[]): string {
  if (!slugs || slugs.length === 0) return 'None'
  return slugs.map(labelForActivity).join(', ')
}

export function labelsForLifestyle(slugs: string[]): string {
  if (!slugs || slugs.length === 0) return 'None'
  return slugs.map(labelForLifestyle).join(', ')
}

export function labelsForPriorities(slugs: string[]): string {
  if (!slugs || slugs.length === 0) return 'None'
  return slugs.map(labelForPriority).join(', ')
}

export function labelForDistance(minutes: number): string {
  if (minutes <= 5)  return 'Walking distance'
  if (minutes <= 20) return 'Short distance'
  return "I'll travel for it"
}

// Avatar color by primary activity — gives a subtle personalization
const AVATAR_COLORS: Record<string, string> = {
  lifting:      '#c8ff57',
  calisthenics: '#a5e8ff',
  running:      '#ffb685',
  cycling:      '#ffea73',
  crossfit:     '#ff8b8b',
  yoga:         '#d4a5ff',
  swimming:     '#80d8ff',
  martial_arts: '#ff9ec7',
  classes:      '#b4ffb4',
  climbing:     '#ffd180',
}

export function avatarColorForActivity(slug: string): string {
  return AVATAR_COLORS[slug] ?? '#c8ff57'
}

export function initialsFromName(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
