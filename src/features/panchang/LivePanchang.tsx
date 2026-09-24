'use client'

import { useEffect, useId, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { motion, useReducedMotion } from 'motion/react'
import { knownLocations } from '../../lib/location/locations'
import { getLivePanchang, isFreshPanchang, type LivePanchang as Snapshot } from '../../lib/panchang/live'

export function LivePanchang({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('site')
  const locale = useLocale()
  const reduced = useReducedMotion()
  const id = useId()
  // No silent default city: users select the location whose timings they need.
  const [city, setCity] = useState('')
  const [result, setResult] = useState<Snapshot | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const location = knownLocations.find((item) => item.id === city)
    if (!location) return
    let disposed = false
    let timer: ReturnType<typeof setTimeout>
    let pending = false
    const refresh = async () => {
      if (pending) return
      pending = true
      setResult(null)
      setStatus('loading')
      try {
        const value = await getLivePanchang(location)
        if (disposed) return
        setResult(value)
        setStatus('ready')
        clearTimeout(timer)
        timer = setTimeout(() => void refresh(), Math.max(1, Date.parse(value.expires_at) - Date.now() + 100))
      } catch {
        if (!disposed) { setResult(null); setStatus('error') }
      } finally { pending = false }
    }
    const visible = () => { if (document.visibilityState === 'visible') void refresh() }
    void refresh()
    document.addEventListener('visibilitychange', visible)
    window.addEventListener('focus', visible)
    return () => { disposed = true; clearTimeout(timer); document.removeEventListener('visibilitychange', visible); window.removeEventListener('focus', visible) }
  }, [city, attempt])
  const format = (value: string) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: result?.day.timezone ?? 'Asia/Kolkata' }).format(new Date(value))
  const ready = result && isFreshPanchang(result) ? result : null
  return <div className={`live-panchang${compact ? ' live-panchang--compact' : ''}`}>
    <p className="section-kicker">{t('home.todayPanchang')}</p>
    <label htmlFor={id}>{t('panchang.chooseCity')}</label>
    <select id={id} value={city} onChange={(event) => { setResult(null); setStatus('idle'); setCity(event.target.value) }}>
      <option value="">{t('common.choose')}</option>
      {knownLocations.map((location) => <option key={location.id} value={location.id}>{location.label}, {location.region}</option>)}
    </select>
    <div aria-live="polite" aria-busy={status === 'loading'}>
      {status === 'idle' && <p>{t('panchang.pageIntro')}</p>}
      {status === 'loading' && <p>{t('panchang.loading')}</p>}
      {status === 'error' && <div role="alert"><h2>{t('panchang.unavailable')}</h2><p>{t('panchang.unavailableCopy')}</p><button type="button" className="consumer-button" onClick={() => setAttempt((n) => n + 1)}>{t('panchang.retry')}</button></div>}
      {ready && <motion.div key={`${city}-${ready.current.tithi.index}`} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="live-panchang__notice">{t('astronomicalPreview')}</p>
        <p>{t('panchang.localDate')}: {ready.civil_date} · {ready.day.timezone}</p>
        <dl className="live-panchang__facts">
          {(['tithi', 'nakshatra', 'yoga', 'karana'] as const).slice(0, compact ? 2 : 4).map((key) => <div key={key}><dt>{t(`panchang.facts.${key}`)}</dt><dd>{ready.current[key].name}<small>{t('common.ends')} {format(ready.current[key].ends_at)}</small></dd></div>)}
          <div><dt>{t('panchang.facts.sunrise')}</dt><dd>{format(ready.day.sunrise)}</dd></div>
          <div><dt>{t('panchang.facts.sunset')}</dt><dd>{format(ready.day.sunset)}</dd></div>
          {!compact && <>
            <div><dt>{t('panchang.facts.vaar')}</dt><dd>{ready.day.vaar}</dd></div>
            <div><dt>{t('panchang.facts.paksha')}</dt><dd>{ready.current.paksha}</dd></div>
            {(['rahu_kalam', 'yamaganda', 'gulika'] as const).map((key) => <div key={key}><dt>{t(`panchang.facts.${key === 'rahu_kalam' ? 'rahu' : key}`)}</dt><dd>{format(ready.day[key].start)} – {format(ready.day[key].end)}</dd></div>)}
            {(['moonrise', 'moonset'] as const).map((key) => ready.day[key] && <div key={key}><dt>{t(`panchang.facts.${key}`)}</dt><dd>{format(ready.day[key])}</dd></div>)}
          </>}
        </dl>
        <footer className="live-panchang__source">
          <a href={ready.source_url} target="_blank" rel="noreferrer">{t('panchang.sourceName', { name: 'KRIPA' })} ↗</a>
          <p>{t('common.coordinates')}: {ready.day.latitude}, {ready.day.longitude}</p>
          <p>{t('panchang.dateNav')}: {ready.day.date} · {ready.day.profile}</p>
          <p>{t('panchang.lastGenerated', { date: format(ready.generated_at) })} · {t('panchang.expires')} {format(ready.expires_at)}</p>
          {!compact && <p>{ready.day.calculation_version} · Swiss Ephemeris {ready.day.ephemeris_version}</p>}
        </footer>
      </motion.div>}
    </div>
  </div>
}
