'use client'

import { useEffect, useState } from 'react'
import { browserLocation, fallbackLocation, knownLocations } from '@/lib/location/locations'
import { panchangProvider } from '@/lib/panchang/fixture-provider'
import { track } from '@/lib/analytics'
import type { PanchangLocation, PanchangResult } from '@/lib/panchang/types'
import { localDateForTimezone, shiftLocalDate } from '@/lib/panchang/date'

const STORAGE_KEY = 'brahminbooking:panchang-location:v1'

export function PanchangExperience() {
  const [location, setLocation] = useState<PanchangLocation>(fallbackLocation)
  const [date, setDate] = useState(() => localDateForTimezone(new Date(), fallbackLocation.timezone))
  const [result, setResult] = useState<PanchangResult | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [message, setMessage] = useState('Using a changeable fallback location until you choose one.')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedId = window.localStorage.getItem(STORAGE_KEY)
      const saved = knownLocations.find((item) => item.id === savedId)
      if (saved) { setLocation(saved); setMessage('Using your saved manual location.') }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    let active = true
    panchangProvider.getDailyPanchang({ localDate: date, location, locale: 'en' }).then((next) => { if (active) { setResult(next); setLoadError(false) } }).catch(() => { if (active) setLoadError(true) })
    return () => { active = false }
  }, [location, date, retryKey])

  const chooseLocation = (id: string) => {
    const next = knownLocations.find((item) => item.id === id) ?? fallbackLocation
    setResult(null); setLocation(next)
    window.localStorage.setItem(STORAGE_KEY, next.id)
    setMessage('Saved on this device. You can change it at any time.')
    track('location_changed', { route: '/panchang/', location_method: 'manual' })
  }

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) { setMessage('Browser location is unavailable. Please choose a city.'); return }
    setMessage('Waiting for browser permission…')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setResult(null); setLocation(browserLocation(coords.latitude, coords.longitude)); setMessage('Using browser coordinates for this session only.'); track('location_changed', { route: '/panchang/', location_method: 'browser' }) },
      () => setMessage('Location permission was not granted. Please choose a city instead.'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 900000 },
    )
  }

  return (
    <>
      <section className="location-bar" aria-labelledby="location-heading">
        <div><p className="section-kicker">Location changes the day</p><h2 id="location-heading">Panchang for your place</h2><p>{message}</p></div>
        <div className="location-controls">
          <label><span>City</span><select value={knownLocations.some((item) => item.id === location.id) ? location.id : ''} onChange={(event) => chooseLocation(event.target.value)}><option value="" disabled>Choose a city</option>{knownLocations.map((item) => <option key={item.id} value={item.id}>{item.label}, {item.region}</option>)}</select></label>
          <button type="button" onClick={requestCurrentLocation}>Use current location</button>
        </div>
      </section>

      <nav className="date-navigation" aria-label="Panchang date"><button onClick={() => { setResult(null); setDate((value) => shiftLocalDate(value, -1)) }}>← Previous day</button><button onClick={() => { setResult(null); setDate(localDateForTimezone(new Date(), location.timezone)) }}>Today</button><button onClick={() => { setResult(null); setDate((value) => shiftLocalDate(value, 1)) }}>Next day →</button></nav>
      <section className="panchang-result" aria-live="polite">
        {loadError ? <div className="result-error"><h2>Panchang is unavailable</h2><p>We will never replace a failed result with fabricated data. Booking requests remain available.</p><button onClick={() => setRetryKey((value) => value + 1)}>Retry</button></div> : !result ? <p className="result-loading">Preparing the daily view…</p> : (
          <>
            <div className={`fixture-banner fixture-banner--${result.status}`}><strong>{result.status === 'fixture' ? 'Development fixture' : result.status === 'stale' ? 'Stale Panchang data' : 'Provider result'}</strong><span>{result.status === 'fixture' ? 'Illustrative values only · Not for religious decisions' : result.status === 'stale' ? `Last generated ${new Date(result.source.calculatedAt).toLocaleString()}` : `Source: ${result.source.name}`}</span></div>
            <div className="panchang-result__heading"><div><p className="section-kicker">{result.localDate}</p><h2>{result.location.label}</h2><p>{result.location.region} · {result.location.timezone}</p></div><span className="panchang-sun" aria-hidden="true">☼</span></div>
            <dl className="panchang-facts">
              <div><dt>Vaar</dt><dd>{result.vaar}</dd></div><div><dt>Tithi</dt><dd>{result.tithi}<small>ends {result.tithiEnd}</small></dd></div><div><dt>Paksha</dt><dd>{result.paksha}</dd></div><div><dt>Nakshatra</dt><dd>{result.nakshatra}<small>ends {result.nakshatraEnd}</small></dd></div>
              <div><dt>Yoga</dt><dd>{result.yoga}<small>ends {result.yogaEnd}</small></dd></div><div><dt>Karana</dt><dd>{result.karana}<small>ends {result.karanaEnd}</small></dd></div><div><dt>Sunrise</dt><dd>{result.sunrise}</dd></div><div><dt>Sunset</dt><dd>{result.sunset}</dd></div>
              <div><dt>Moonrise</dt><dd>{result.moonrise}</dd></div><div><dt>Moonset</dt><dd>{result.moonset}</dd></div><div><dt>Amanta month</dt><dd>{result.lunarMonth}</dd></div><div><dt>Purnimanta month</dt><dd>{result.purnimantaMonth}</dd></div>
              <div><dt>Vikram Samvat</dt><dd>{result.vikramSamvat}</dd></div><div><dt>Shaka Samvat</dt><dd>{result.shakaSamvat}</dd></div><div><dt>Surya Rashi</dt><dd>{result.suryaRashi}</dd></div><div><dt>Chandra Rashi</dt><dd>{result.chandraRashi}</dd></div>
              <div><dt>Rahu Kalam</dt><dd>{result.rahuKaal}</dd></div><div><dt>Yamaganda</dt><dd>{result.yamaganda}</dd></div><div><dt>Gulika Kalam</dt><dd>{result.gulikaKaal}</dd></div><div><dt>Abhijit Muhurta</dt><dd>{result.abhijitMuhurat}</dd></div>
              <div><dt>Brahma Muhurta</dt><dd>{result.brahmaMuhurat}</dd></div><div><dt>Dur Muhurta</dt><dd>{result.durMuhurat}</dd></div><div><dt>Festivals</dt><dd>{result.festivals.length ? result.festivals.join(', ') : 'None in fixture'}</dd></div><div><dt>Vrats</dt><dd>{result.vrats.length ? result.vrats.join(', ') : 'None in fixture'}</dd></div>
            </dl>
            <div className="source-panel"><p><strong>Source:</strong> {result.source.name} · {result.source.calculationVersion}</p><p><strong>Generated:</strong> {new Date(result.source.calculatedAt).toLocaleString()} · expires {new Date(result.source.expiresAt).toLocaleString()}</p><p><strong>Coordinates:</strong> {result.location.latitude.toFixed(4)}, {result.location.longitude.toFixed(4)} · {result.location.timezone}</p><p><strong>Editorial review:</strong> {result.source.editorialReviewVersion}</p><ul>{result.source.conventions.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </>
        )}
      </section>
    </>
  )
}
