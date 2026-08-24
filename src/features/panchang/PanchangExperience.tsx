'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { browserLocation, fallbackLocation, knownLocations } from '@/lib/location/locations'
import { panchangProvider } from '@/lib/panchang/fixture-provider'
import { track } from '@/lib/analytics'
import type { PanchangLocation, PanchangResult } from '@/lib/panchang/types'
import { localDateForTimezone, shiftLocalDate } from '@/lib/panchang/date'
import { localeTags } from '@/i18n/config'
import { useSiteLocale } from '@/i18n/SiteLocaleProvider'

const STORAGE_KEY = 'brahminbooking:panchang-location:v1'

export function PanchangExperience() {
  const t = useTranslations('site')
  const { locale } = useSiteLocale()
  const [location, setLocation] = useState<PanchangLocation>(fallbackLocation)
  const [date, setDate] = useState(() => localDateForTimezone(new Date(), fallbackLocation.timezone))
  const [result, setResult] = useState<PanchangResult | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [messageKey, setMessageKey] = useState('fallback')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedId = window.localStorage.getItem(STORAGE_KEY)
      const saved = knownLocations.find((item) => item.id === savedId)
      if (saved) { setLocation(saved); setMessageKey('saved') }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    let active = true
    panchangProvider.getDailyPanchang({ localDate: date, location, locale }).then((next) => { if (active) { setResult(next); setLoadError(false) } }).catch(() => { if (active) setLoadError(true) })
    return () => { active = false }
  }, [location, date, retryKey, locale])

  const chooseLocation = (id: string) => {
    const next = knownLocations.find((item) => item.id === id) ?? fallbackLocation
    setResult(null); setLocation(next)
    window.localStorage.setItem(STORAGE_KEY, next.id)
    setMessageKey('savedNow')
    track('location_changed', { route: '/panchang/', location_method: 'manual' })
  }

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) { setMessageKey('unavailableLocation'); return }
    setMessageKey('waiting')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setResult(null); setLocation(browserLocation(coords.latitude, coords.longitude)); setMessageKey('usingCoordinates'); track('location_changed', { route: '/panchang/', location_method: 'browser' }) },
      () => setMessageKey('permissionDenied'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 900000 },
    )
  }

  return (
    <>
      <section className="location-bar" aria-labelledby="location-heading">
        <div><p className="section-kicker">{t('panchang.locationKicker')}</p><h2 id="location-heading">{t('panchang.locationTitle')}</h2><p>{t(`panchang.${messageKey}`)}</p></div>
        <div className="location-controls">
          <label><span>{t('panchang.city')}</span><select value={knownLocations.some((item) => item.id === location.id) ? location.id : ''} onChange={(event) => chooseLocation(event.target.value)}><option value="" disabled>{t('panchang.chooseCity')}</option>{knownLocations.map((item) => <option key={item.id} value={item.id}>{item.label}, {item.region}</option>)}</select></label>
          <button type="button" onClick={requestCurrentLocation}>{t('panchang.useLocation')}</button>
        </div>
      </section>

      <nav className="date-navigation" aria-label={t('panchang.dateNav')}><button onClick={() => { setResult(null); setDate((value) => shiftLocalDate(value, -1)) }}>← {t('panchang.previous')}</button><button onClick={() => { setResult(null); setDate(localDateForTimezone(new Date(), location.timezone)) }}>{t('panchang.today')}</button><button onClick={() => { setResult(null); setDate((value) => shiftLocalDate(value, 1)) }}>{t('panchang.next')} →</button></nav>
      <section className="panchang-result" aria-live="polite">
        {loadError ? <div className="result-error"><h2>{t('panchang.unavailable')}</h2><p>{t('panchang.unavailableCopy')}</p><button onClick={() => setRetryKey((value) => value + 1)}>{t('panchang.retry')}</button></div> : !result ? <p className="result-loading">{t('panchang.loading')}</p> : (
          <>
            <div className={`fixture-banner fixture-banner--${result.status}`}><strong>{result.status === 'fixture' ? t('panchang.fixture') : result.status === 'stale' ? t('panchang.stale') : t('panchang.provider')}</strong><span>{result.status === 'fixture' ? t('panchang.fixtureCopy') : result.status === 'stale' ? t('panchang.lastGenerated', { date: new Date(result.source.calculatedAt).toLocaleString(localeTags[locale]) }) : t('panchang.sourceName', { name: result.source.name })}</span></div>
            <div className="panchang-result__heading"><div><p className="section-kicker">{result.localDate}</p><h2>{result.location.label}</h2><p>{result.location.region} · {result.location.timezone}</p></div><span className="panchang-sun" aria-hidden="true">☼</span></div>
            <dl className="panchang-facts">
              <div><dt>{t('panchang.facts.vaar')}</dt><dd>{result.vaar}</dd></div><div><dt>{t('panchang.facts.tithi')}</dt><dd>{result.tithi}<small>{t('common.ends')} {result.tithiEnd}</small></dd></div><div><dt>{t('panchang.facts.paksha')}</dt><dd>{result.paksha}</dd></div><div><dt>{t('panchang.facts.nakshatra')}</dt><dd>{result.nakshatra}<small>{t('common.ends')} {result.nakshatraEnd}</small></dd></div>
              <div><dt>{t('panchang.facts.yoga')}</dt><dd>{result.yoga}<small>{t('common.ends')} {result.yogaEnd}</small></dd></div><div><dt>{t('panchang.facts.karana')}</dt><dd>{result.karana}<small>{t('common.ends')} {result.karanaEnd}</small></dd></div><div><dt>{t('panchang.facts.sunrise')}</dt><dd>{result.sunrise}</dd></div><div><dt>{t('panchang.facts.sunset')}</dt><dd>{result.sunset}</dd></div>
              <div><dt>{t('panchang.facts.moonrise')}</dt><dd>{result.moonrise}</dd></div><div><dt>{t('panchang.facts.moonset')}</dt><dd>{result.moonset}</dd></div><div><dt>{t('panchang.facts.amanta')}</dt><dd>{result.lunarMonth}</dd></div><div><dt>{t('panchang.facts.purnimanta')}</dt><dd>{result.purnimantaMonth}</dd></div>
              <div><dt>{t('panchang.facts.vikram')}</dt><dd>{result.vikramSamvat}</dd></div><div><dt>{t('panchang.facts.shaka')}</dt><dd>{result.shakaSamvat}</dd></div><div><dt>{t('panchang.facts.surya')}</dt><dd>{result.suryaRashi}</dd></div><div><dt>{t('panchang.facts.chandra')}</dt><dd>{result.chandraRashi}</dd></div>
              <div><dt>{t('panchang.facts.rahu')}</dt><dd>{result.rahuKaal}</dd></div><div><dt>{t('panchang.facts.yamaganda')}</dt><dd>{result.yamaganda}</dd></div><div><dt>{t('panchang.facts.gulika')}</dt><dd>{result.gulikaKaal}</dd></div><div><dt>{t('panchang.facts.abhijit')}</dt><dd>{result.abhijitMuhurat}</dd></div>
              <div><dt>{t('panchang.facts.brahma')}</dt><dd>{result.brahmaMuhurat}</dd></div><div><dt>{t('panchang.facts.dur')}</dt><dd>{result.durMuhurat}</dd></div><div><dt>{t('panchang.festivals')}</dt><dd>{result.festivals.length ? result.festivals.join(', ') : t('panchang.noneFixture')}</dd></div><div><dt>{t('panchang.vrats')}</dt><dd>{result.vrats.length ? result.vrats.join(', ') : t('panchang.noneFixture')}</dd></div>
            </dl>
            <div className="source-panel"><p><strong>{t('common.source')}:</strong> {result.source.name} · {result.source.calculationVersion}</p><p><strong>{t('common.generated')}:</strong> {new Date(result.source.calculatedAt).toLocaleString(localeTags[locale])} · {t('panchang.expires')} {new Date(result.source.expiresAt).toLocaleString(localeTags[locale])}</p><p><strong>{t('common.coordinates')}:</strong> {result.location.latitude.toFixed(4)}, {result.location.longitude.toFixed(4)} · {result.location.timezone}</p><p><strong>{t('common.editorialReview')}:</strong> {result.source.editorialReviewVersion}</p><ul>{result.source.conventions.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </>
        )}
      </section>
    </>
  )
}
