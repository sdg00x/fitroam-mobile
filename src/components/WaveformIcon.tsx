import React from 'react'
import Svg, { Rect } from 'react-native-svg'

type Props = {
  size?: number
  color?: string
}

/**
 * FitRoam waveform mark. 5 vertical bars with alternating heights — center
 * tallest, descending outward. Reads as "audio / voice / signal" and works
 * at icon-button scale or top-bar wordmark scale.
 */
export function WaveformIcon({ size = 24, color = '#000' }: Props) {
  // viewBox 24x24. Bars are 2.5w with 1.5w gaps, centered.
  // Heights: 6, 12, 18, 12, 6 (px in viewBox units)
  const bars = [
    { x: 2.5,  h: 6  },
    { x: 7,    h: 12 },
    { x: 11.5, h: 18 },
    { x: 16,   h: 12 },
    { x: 20.5, h: 6  },
  ]
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {bars.map((bar, i) => (
        <Rect
          key={i}
          x={bar.x}
          y={(24 - bar.h) / 2}
          width={2.5}
          height={bar.h}
          rx={1.25}
          fill={color}
        />
      ))}
    </Svg>
  )
}
