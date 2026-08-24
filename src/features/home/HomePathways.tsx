'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'

const pathways = [
  { key: 'ceremony', href: '/book/', symbol: 'दीप' },
  { key: 'ritual', href: '/pujas/', symbol: 'ॐ' },
  { key: 'observance', href: '/festivals/', symbol: 'तिथि' },
] as const

export function HomePathways() {
  const t = useTranslations('site')
  const reduceMotion = useReducedMotion()

  return (
    <section className="home-pathways" aria-labelledby="home-pathways-title">
      <div className="home-pathways__heading">
        <p className="section-kicker">{t('home.pathwaysKicker')}</p>
        <h2 id="home-pathways-title">{t('home.pathwaysTitle')}</h2>
        <p>{t('home.pathwaysCopy')}</p>
      </div>
      <div className="home-pathways__grid">
        {pathways.map((item, index) => (
          <motion.article
            className="pathway-card"
            key={item.key}
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            whileHover={reduceMotion ? undefined : { y: -6 }}
            transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pathway-card__symbol" aria-hidden="true">{item.symbol}</div>
            <span>0{index + 1}</span>
            <h3>{t(`home.pathway${item.key[0].toUpperCase()}${item.key.slice(1)}Title`)}</h3>
            <p>{t(`home.pathway${item.key[0].toUpperCase()}${item.key.slice(1)}Copy`)}</p>
            <Link href={item.href}>{t(`home.pathway${item.key[0].toUpperCase()}${item.key.slice(1)}Cta`)} <b aria-hidden="true">↗</b></Link>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
