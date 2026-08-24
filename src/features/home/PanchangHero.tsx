'use client'

import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { CurrentDate } from '@/components/CurrentDate'

type PanchangTab = 'day' | 'windows' | 'source'

const tabs: PanchangTab[] = ['day', 'windows', 'source']

export function PanchangHero() {
  const t = useTranslations('site')
  const reduceMotion = useReducedMotion()
  const [activeTab, setActiveTab] = useState<PanchangTab>('day')

  const entrance = reduceMotion
    ? undefined
    : { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }

  return (
    <section className="panchang-hero" aria-labelledby="panchang-hero-title">
      <div className="panchang-hero__glow panchang-hero__glow--one" aria-hidden="true" />
      <div className="panchang-hero__glow panchang-hero__glow--two" aria-hidden="true" />

      <motion.div
        className="panchang-hero__copy"
        initial={reduceMotion ? false : 'hidden'}
        animate={reduceMotion ? undefined : 'visible'}
        variants={entrance}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="panchang-hero__eyebrow"><span aria-hidden="true">✦</span> {t('home.todayIn')} Bengaluru</p>
        <h1 id="panchang-hero-title">{t('home.beginWith')} <em>{t('home.todayWord')}</em></h1>
        <p className="panchang-hero__lede">{t('home.panchangLede')}</p>

        <div className="panchang-hero__actions">
          <motion.div whileHover={reduceMotion ? undefined : { y: -3 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
            <Link className="panchang-primary-cta" href="/book/">
              <span>{t('home.bookPurohit')}</span><b aria-hidden="true">→</b>
            </Link>
          </motion.div>
          <Link className="panchang-secondary-cta" href="/panchang/">{t('home.fullPanchang')} <span aria-hidden="true">↗</span></Link>
        </div>

        <div className="panchang-hero__reassurance" aria-label={t('home.bookingReassurance')}>
          <span>✓ {t('home.noAccount')}</span>
          <span>✓ {t('home.humanCoordinated')}</span>
        </div>
      </motion.div>

      <motion.aside
        id="today"
        className="panchang-daily"
        aria-label={t('home.preview')}
        initial={reduceMotion ? false : { opacity: 0, y: 30, scale: 0.98 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="panchang-daily__head">
          <div><span className="panchang-live-dot" aria-hidden="true" />{t('home.todayPanchang')}</div>
          <Link href="/panchang/" aria-label={t('home.change')}><span aria-hidden="true">⌖</span> Bengaluru</Link>
        </div>

        <div className="panchang-celestial">
          <motion.div
            className="panchang-celestial__orbit"
            aria-hidden="true"
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
          ><span>☾</span></motion.div>
          <div className="panchang-celestial__sun" aria-hidden="true">☼</div>
          <div className="panchang-celestial__date"><CurrentDate /><strong>Bengaluru · IST</strong></div>
        </div>

        <div className="panchang-tabs" role="tablist" aria-label={t('home.panchangDetails')}>
          {tabs.map((tab) => (
            <button
              key={tab}
              id={`panchang-tab-${tab}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls="panchang-tabpanel"
              onClick={() => setActiveTab(tab)}
            >
              {activeTab === tab && <motion.span className="panchang-tabs__active" layoutId="panchang-tab-active" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <span>{t(`home.tab${tab[0].toUpperCase()}${tab.slice(1)}`)}</span>
            </button>
          ))}
        </div>

        <div id="panchang-tabpanel" className="panchang-tabpanel" role="tabpanel" aria-labelledby={`panchang-tab-${activeTab}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'day' && <DayDetails t={t} />}
              {activeTab === 'windows' && <WindowDetails t={t} />}
              {activeTab === 'source' && <SourceDetails t={t} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="panchang-daily__foot">
          <p><span aria-hidden="true">ⓘ</span> {t('home.fixture')}</p>
          <Link href="/panchang/">{t('home.exploreDetails')} <span aria-hidden="true">→</span></Link>
        </div>
      </motion.aside>
    </section>
  )
}

function DayDetails({ t }: { t: ReturnType<typeof useTranslations<'site'>> }) {
  return <dl className="panchang-fact-grid">
    <div><dt>{t('home.tithi')}</dt><dd>Shukla Dwadashi <small>{t('home.until')} 14:18</small></dd></div>
    <div><dt>{t('home.nakshatra')}</dt><dd>Purva Ashadha <small>{t('home.until')} 18:42</small></dd></div>
    <div><dt>{t('home.pakshaMonth')}</dt><dd>Shukla · Shravana</dd></div>
    <div><dt>{t('home.sunriseSunset')}</dt><dd>06:09 · 18:36</dd></div>
  </dl>
}

function WindowDetails({ t }: { t: ReturnType<typeof useTranslations<'site'>> }) {
  return <dl className="panchang-window-list">
    <div className="is-auspicious"><dt>{t('home.abhijit')}</dt><dd>12:00–12:50 <small>{t('home.auspiciousWindow')}</small></dd></div>
    <div><dt>{t('home.rahu')}</dt><dd>07:43–09:17 <small>{t('home.avoidForBeginnings')}</small></dd></div>
    <div><dt>{t('home.brahma')}</dt><dd>04:33–05:21 <small>{t('home.beforeSunrise')}</small></dd></div>
  </dl>
}

function SourceDetails({ t }: { t: ReturnType<typeof useTranslations<'site'>> }) {
  return <div className="panchang-source-detail">
    <span aria-hidden="true">◎</span>
    <div><strong>{t('home.sourceTitle')}</strong><p>{t('home.sourceCopy')}</p><small>Asia/Kolkata · Bengaluru fallback</small></div>
  </div>
}
