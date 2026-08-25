'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'

export function PanchangHero() {
  const t = useTranslations('site')
  const reduceMotion = useReducedMotion()

  return (
    <section className="panchang-hero" aria-labelledby="panchang-hero-title">
      <div className="panchang-hero__glow panchang-hero__glow--one" aria-hidden="true" />
      <div className="panchang-hero__glow panchang-hero__glow--two" aria-hidden="true" />
      <motion.div className="panchang-hero__copy" initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, ease: [0.22, 1, 0.36, 1] }}>
        <p className="panchang-hero__eyebrow"><span aria-hidden="true">✦</span> {t('home.todayPanchang')}</p>
        <h1 id="panchang-hero-title">{t('home.beginWith')} <em>{t('home.todayWord')}</em></h1>
        <p className="panchang-hero__lede">{t('home.panchangLede')}</p>
        <div className="panchang-hero__actions">
          <motion.div whileHover={reduceMotion ? undefined : { y: -3 }} whileTap={reduceMotion ? undefined : { scale: .98 }}><Link className="panchang-primary-cta" href="/book/"><span>{t('home.bookPurohit')}</span><b aria-hidden="true">→</b></Link></motion.div>
          <Link className="panchang-secondary-cta" href="/panchang/">{t('home.fullPanchang')} <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="panchang-hero__reassurance" aria-label={t('home.bookingReassurance')}><span>✓ {t('home.noAccount')}</span><span>✓ {t('home.humanCoordinated')}</span></div>
      </motion.div>
      <motion.aside id="today" className="panchang-daily panchang-daily--empty" aria-label={t('panchang.unavailable')} initial={reduceMotion ? false : { opacity: 0, y: 30, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .75, delay: .12, ease: [0.22, 1, .36, 1] }}>
        <div className="panchang-empty-symbol" aria-hidden="true"><span>☼</span></div>
        <p className="section-kicker">{t('home.todayPanchang')}</p>
        <h2>{t('panchang.unavailable')}</h2>
        <p>{t('panchang.unavailableCopy')}</p>
        <div className="panchang-empty-actions"><Link href="/book/">{t('home.bookPurohit')} <span aria-hidden="true">→</span></Link><Link href="/panchang/">{t('home.exploreDetails')}</Link></div>
      </motion.aside>
    </section>
  )
}
