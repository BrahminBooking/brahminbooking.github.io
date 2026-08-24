import type { PanchangLocation } from '../panchang/types'

export const knownLocations: PanchangLocation[] = [
  { id: 'bengaluru', label: 'Bengaluru', region: 'Karnataka', latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata', source: 'manual' },
  { id: 'ahmedabad', label: 'Ahmedabad', region: 'Gujarat', latitude: 23.0225, longitude: 72.5714, timezone: 'Asia/Kolkata', source: 'manual' },
  { id: 'delhi', label: 'Delhi', region: 'Delhi', latitude: 28.6139, longitude: 77.209, timezone: 'Asia/Kolkata', source: 'manual' },
  { id: 'varanasi', label: 'Varanasi', region: 'Uttar Pradesh', latitude: 25.3176, longitude: 82.9739, timezone: 'Asia/Kolkata', source: 'manual' },
  { id: 'chennai', label: 'Chennai', region: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707, timezone: 'Asia/Kolkata', source: 'manual' },
]

export const fallbackLocation: PanchangLocation = { ...knownLocations[0], source: 'fallback' }

export function browserLocation(latitude: number, longitude: number): PanchangLocation {
  return { id: 'current-location', label: 'Current location', region: 'Coordinates kept on this device', latitude, longitude, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata', source: 'browser' }
}
