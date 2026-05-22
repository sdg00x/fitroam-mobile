// Maps a user's training pattern + the current day of the week
// to today's session name, focus, and equipment needs.
//
// NOTE: This is the hardcoded version. The build status doc tracks
// a follow-up to wire this into the match engine so "Today's training"
// queries gyms for the right equipment (step 17 — sprinkles).

export interface DailyTraining {
  hasPattern:     boolean
  dayLabel:       string       // e.g. "Push day", "Full body", "Rest day"
  focus:          string       // e.g. "Chest, shoulders, triceps"
  description:    string       // longer human sentence
  equipment:      string[]     // pills shown on the home card
  dayOfCycle?:    number       // 1-indexed within the rotation
  cycleLength?:   number
  rotation?:      string[]     // for the pips at the top of the card
  rotationToday?: number       // 0-indexed pip to highlight
}

// Helper — day of week, 0 = Sunday, 1 = Monday, ...
function dayOfWeek(date = new Date()): number {
  return date.getDay()
}

// Helper — for PPL/UL rotations that aren't weekly-aligned,
// we use day-of-year modulo cycle length to pick today's day
function dayOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

const PPL_ROTATION = ['Push', 'Pull', 'Legs', 'Rest']
const PPL_DETAILS: Record<string, { focus: string; equipment: string[]; description: string }> = {
  Push: {
    focus:       'Chest, shoulders, triceps',
    equipment:   ['Bench', 'Dumbbells', 'Cables'],
    description: "You'll want bench, dumbbells, and cables nearby.",
  },
  Pull: {
    focus:       'Back, biceps, rear delts',
    equipment:   ['Pull-up bar', 'Cables', 'Barbell'],
    description: 'Bars, cables, and a pulldown station will cover today.',
  },
  Legs: {
    focus:       'Quads, hamstrings, glutes',
    equipment:   ['Squat rack', 'Leg press', 'Barbell'],
    description: 'Need a squat rack and ideally a leg press.',
  },
  Rest: {
    focus:       'Recovery',
    equipment:   [],
    description: 'Walk, mobility, sauna. Train tomorrow.',
  },
}

const UL_ROTATION = ['Upper', 'Lower', 'Rest', 'Upper', 'Lower', 'Rest', 'Rest']
const UL_DETAILS: Record<string, { focus: string; equipment: string[]; description: string }> = {
  Upper: {
    focus:       'Chest, back, shoulders, arms',
    equipment:   ['Bench', 'Cables', 'Dumbbells'],
    description: 'Full upper body — bench, cables, and dumbbells.',
  },
  Lower: {
    focus:       'Quads, hamstrings, glutes, calves',
    equipment:   ['Squat rack', 'Leg press', 'Hamstring curl'],
    description: 'Lower work — rack, leg press, hamstring curl.',
  },
  Rest: {
    focus:       'Recovery',
    equipment:   [],
    description: 'Mobility and recovery today.',
  },
}

// Body-part split — classic Mon-Fri layout
const BODY_PART_BY_DAY: Record<number, { day: string; focus: string; equipment: string[]; description: string }> = {
  1: { day: 'Chest day',     focus: 'Chest, triceps',     equipment: ['Bench', 'Dumbbells', 'Cables'],        description: 'Bench, incline, and cables for triceps.' },
  2: { day: 'Back day',      focus: 'Back, biceps',       equipment: ['Pull-up bar', 'Rows', 'Cables'],       description: 'Bars and rows. Cables for arms.' },
  3: { day: 'Leg day',       focus: 'Quads, hamstrings',  equipment: ['Squat rack', 'Leg press'],             description: 'Squat rack and a leg press.' },
  4: { day: 'Shoulder day',  focus: 'Shoulders, traps',   equipment: ['Dumbbells', 'Cables'],                 description: 'Dumbbells and cables. Maybe a shoulder press machine.' },
  5: { day: 'Arms day',      focus: 'Biceps, triceps',    equipment: ['Dumbbells', 'Cables', 'EZ bar'],       description: 'Cable station and a good dumbbell set.' },
  6: { day: 'Active rest',   focus: 'Mobility',           equipment: [],                                       description: 'Walk, stretch, recover.' },
  0: { day: 'Rest day',      focus: 'Recovery',           equipment: [],                                       description: 'Rest day. Train tomorrow.' },
}

export function computeDailyTraining(pattern: string | null | undefined, now = new Date()): DailyTraining {
  if (!pattern) {
    return {
      hasPattern:  false,
      dayLabel:    'Pattern not set',
      focus:       '',
      description: 'Set your training pattern to get daily prompts.',
      equipment:   [],
    }
  }

  if (pattern === 'ppl') {
    const idx = dayOfYear(now) % PPL_ROTATION.length
    const day = PPL_ROTATION[idx]
    const details = PPL_DETAILS[day]
    return {
      hasPattern:    true,
      dayLabel:      day === 'Rest' ? 'Rest day' : `${day} day`,
      focus:         details.focus,
      description:   details.description,
      equipment:     details.equipment,
      dayOfCycle:    idx + 1,
      cycleLength:   PPL_ROTATION.length,
      rotation:      PPL_ROTATION,
      rotationToday: idx,
    }
  }

  if (pattern === 'upper_lower') {
    // 7-day pattern: U L R U L R R
    const idx = dayOfWeek(now)
    const day = UL_ROTATION[idx]
    const details = UL_DETAILS[day]
    return {
      hasPattern:    true,
      dayLabel:      day === 'Rest' ? 'Rest day' : `${day} day`,
      focus:         details.focus,
      description:   details.description,
      equipment:     details.equipment,
      dayOfCycle:    idx + 1,
      cycleLength:   7,
      rotation:      UL_ROTATION,
      rotationToday: idx,
    }
  }

  if (pattern === 'full_body') {
    return {
      hasPattern:  true,
      dayLabel:    'Full body',
      focus:       'Compound lifts, every major group',
      description: 'A rack, barbell, and dumbbells covers you.',
      equipment:   ['Squat rack', 'Barbell', 'Dumbbells'],
    }
  }

  if (pattern === 'body_part') {
    const idx = dayOfWeek(now)
    const details = BODY_PART_BY_DAY[idx]
    return {
      hasPattern:    true,
      dayLabel:      details.day,
      focus:         details.focus,
      description:   details.description,
      equipment:     details.equipment,
      dayOfCycle:    idx === 0 ? 7 : idx,
      cycleLength:   7,
      rotation:      ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Rest', 'Rest'],
      rotationToday: idx === 0 ? 6 : idx - 1,
    }
  }

  if (pattern === 'program') {
    return {
      hasPattern:  true,
      dayLabel:    'Continue your program',
      focus:       'Following your plan',
      description: 'A well-equipped gym with rack, bar, and accessories.',
      equipment:   ['Squat rack', 'Barbell', 'Dumbbells'],
    }
  }

  if (pattern === 'freestyle') {
    return {
      hasPattern:  true,
      dayLabel:    'Train what you feel',
      focus:       'Whatever you bring today',
      description: 'A flexible gym with full equipment range.',
      equipment:   ['Free weights', 'Machines', 'Cables'],
    }
  }

  // Unknown pattern — fallback
  return {
    hasPattern:  false,
    dayLabel:    'Train today',
    focus:       '',
    description: 'Update your training pattern for daily prompts.',
    equipment:   [],
  }
}
