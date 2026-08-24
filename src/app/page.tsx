import Link from 'next/link'
import { Reveal } from '@/components/Reveal'
import { JsonLd } from '@/components/JsonLd'
import { CurrentDate } from '@/components/CurrentDate'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { approvedFestivalGuides } from '@/content/festivals'
import { approvedPujaGuides } from '@/content/pujas'
import { LocalizedGuideText } from '@/content/LocalizedGuideText'
import { T } from '@/i18n/T'

export const metadata = { robots: { index: false, follow: true } }

const rituals = [
  { number: '01', title: 'Griha Pravesh', note: 'ritual1Note', meta: 'ritual1Meta' },
  { number: '02', title: 'Satyanarayan Puja', note: 'ritual2Note', meta: 'ritual2Meta' },
  { number: '03', title: 'Vivah Sanskar', note: 'ritual3Note', meta: 'ritual3Meta' },
]

export default function HomePage() {
  return (
    <div className="consumer-page">
      <JsonLd value={{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'BrahminBooking', url: 'https://brahminbooking.github.io/', description: 'Panchang, puja guidance and trusted Purohit requests.' }} />
      <SiteHeader />
      <main>
        <section className="editorial-hero">
          <div className="hero-ornament" aria-hidden="true"><span>श्री</span></div>
          <Reveal className="editorial-hero__copy">
            <p className="section-kicker"><T id="home.heroKicker" /></p>
            <h1><T id="home.heroLine1" /><br /><em><T id="home.heroLine2" /></em></h1>
            <p className="editorial-hero__lede"><T id="home.heroLede" /></p>
            <div className="hero-actions">
              <Link className="consumer-button consumer-button--primary" href="/book/"><T id="home.find" /> <span aria-hidden="true">→</span></Link>
              <Link className="text-link" href="/panchang/"><T id="home.explore" /> <span aria-hidden="true">↗</span></Link>
            </div>
            <p className="hero-location"><T id="home.showing" /> <strong>Bengaluru, Karnataka</strong> · <Link href="/panchang/"><T id="home.change" /></Link></p>
          </Reveal>
          <Reveal className="today-card-wrap" delay={0.12}><aside id="today" className="today-card" aria-label="Today’s Panchang preview">
            <div className="today-card__topline"><span><T id="home.preview" /></span><CurrentDate /></div>
            <div className="today-card__sun"><span aria-hidden="true">☼</span><p><T id="home.vaar" /><br /><strong>Bengaluru</strong></p></div>
            <dl className="today-card__grid">
              <div><dt><T id="home.tithi" /></dt><dd>Shukla Dwadashi <small><T id="home.until" /> 14:18</small></dd></div><div><dt><T id="home.nakshatra" /></dt><dd>Purva Ashadha <small><T id="home.until" /> 18:42</small></dd></div>
              <div><dt><T id="home.pakshaMonth" /></dt><dd>Shukla · Shravana</dd></div><div><dt><T id="home.sunriseSunset" /></dt><dd>06:09 · 18:36</dd></div>
            </dl>
            <div className="today-window"><span><T id="home.window" /></span><strong>Abhijit Muhurta · 12:00–12:50</strong></div>
            <p className="fixture-note"><T id="home.fixture" /></p>
            <Link className="today-card__link" href="/panchang/"><T id="home.fullPanchang" /> <span aria-hidden="true">→</span></Link>
          </aside></Reveal>
        </section>

        <section className="trust-ribbon" aria-label="How BrahminBooking helps">
          <p><span aria-hidden="true">✦</span> <T id="home.trust1" /></p><p><span aria-hidden="true">✦</span> <T id="home.trust2" /></p><p><span aria-hidden="true">✦</span> <T id="home.trust3" /></p>
        </section>

        <section className="home-discovery">
          <div className="home-two-up">
            <section>
              <div className="home-section-title"><p className="section-kicker"><T id="home.festivalKicker" /></p><h2><T id="home.festivalTitle1" /><br /><T id="home.festivalTitle2" /></h2></div>
              <article className="observance-card"><span><T id="home.reviewedFestival" /></span><h3>{approvedFestivalGuides[0].name}</h3><p><LocalizedGuideText kind="festival" slug={approvedFestivalGuides[0].slug} field="summary" fallback={approvedFestivalGuides[0].summary} /></p><div><small><T id="home.regional" /></small><small><T id="home.noDate" /></small></div><Link className="text-link" href={`/festivals/${approvedFestivalGuides[0].slug}/`}><T id="common.learnMore" /> <b aria-hidden="true">↗</b></Link></article>
            </section>
            <section>
              <div className="home-section-title"><p className="section-kicker"><T id="home.pujaKicker" /></p><h2><T id="home.pujaTitle1" /><br /><T id="home.pujaTitle2" /></h2></div>
              <article className="observance-card observance-card--puja"><span><T id="home.illustrative" /></span><h3>{approvedPujaGuides[3].name}</h3><p><T id="home.pujaCopy" /></p><div><small><T id="home.homeTemple" /></small><small><LocalizedGuideText kind="puja" slug={approvedPujaGuides[3].slug} field="duration" fallback={approvedPujaGuides[3].duration} /></small></div><Link className="text-link" href={`/book/?puja=${approvedPujaGuides[3].slug}`}><T id="home.requestThis" /> <b aria-hidden="true">→</b></Link></article>
            </section>
          </div>
          <p className="fixture-strip"><T id="home.fixtureStrip" /></p>
        </section>

        <section className="service-finder" aria-labelledby="service-finder-title">
          <div><p className="section-kicker"><T id="home.finderKicker" /></p><h2 id="service-finder-title"><T id="home.finderTitle" /></h2></div>
          <form action="/book/" method="get">
            <label><span><T id="home.ceremony" /></span><select name="puja" defaultValue=""><option value="">Choose one</option>{approvedPujaGuides.map((guide) => <option value={guide.slug} key={guide.slug}>{guide.name}</option>)}</select></label>
            <label><span><T id="home.city" /></span><input name="city" /></label>
            <label><span><T id="home.date" /></span><input name="date" type="date" /></label>
            <label><span><T id="home.language" /></span><select name="language" defaultValue=""><option value="">—</option><option value="hindi">हिंदी</option><option value="kannada">ಕನ್ನಡ</option><option value="gujarati">ગુજરાતી</option><option value="english">English</option></select></label>
            <button type="submit"><T id="home.find" /> <span aria-hidden="true">→</span></button>
          </form>
        </section>

        <section className="ritual-section">
          <div className="section-heading">
            <div><p className="section-kicker"><T id="home.ritualKicker" /></p><h2><T id="home.ritualTitle1" /><br /><T id="home.ritualTitle2" /></h2></div>
            <p><T id="home.ritualIntro" /></p>
          </div>
          <Reveal><div className="ritual-list">
            {rituals.map((ritual) => (
              <Link className="ritual-row" href="/pujas/" key={ritual.number}>
                <span className="ritual-row__number">{ritual.number}</span>
                <span><strong>{ritual.title}</strong><small><T id={`home.${ritual.note}`} /></small></span>
                <span className="ritual-row__meta"><T id={`home.${ritual.meta}`} /></span><span className="ritual-row__arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div></Reveal>
          <Link className="text-link ritual-all" href="/pujas/"><T id="home.browseGuides" /> <span aria-hidden="true">→</span></Link>
        </section>

        <section id="temples" className="verification-section">
          <div><p className="section-kicker"><T id="home.verificationKicker" /></p><h2><T id="home.verificationTitle1" /><br /><T id="home.verificationTitle2" /></h2><p><T id="home.verificationCopy" /></p></div>
          <dl><div><dt><T id="home.identity" /></dt><dd><T id="home.identityCopy" /></dd></div><div><dt><T id="home.references" /></dt><dd><T id="home.referencesCopy" /></dd></div><div><dt><T id="home.affiliation" /></dt><dd><T id="home.affiliationCopy" /></dd></div><div><dt><T id="home.practice" /></dt><dd><T id="home.practiceCopy" /></dd></div></dl>
        </section>

        <section id="how-it-works" className="process-section">
          <div className="home-section-title"><p className="section-kicker"><T id="home.processKicker" /></p><h2><T id="home.processTitle" /></h2></div>
          <ol>{[1,2,3,4].map((step) => <li key={step}><span>0{step}</span><strong><T id={`home.step${step}`} /></strong><p><T id={`home.step${step}Copy`} /></p></li>)}</ol>
        </section>

        <section className="booking-callout">
          <div className="booking-callout__motif" aria-hidden="true">ॐ</div>
          <div><p className="section-kicker"><T id="home.calloutKicker" /></p><h2><T id="home.calloutTitle" /></h2></div>
          <div><p><T id="home.calloutCopy" /></p><Link className="consumer-button consumer-button--light" href="/book/"><T id="home.start" /> <span aria-hidden="true">→</span></Link></div>
        </section>
        <section className="provider-invitation"><div><p className="section-kicker"><T id="home.providerKicker" /></p><h2><T id="home.providerTitle" /></h2></div><Link className="text-link" href="/register-as-brahmin/"><T id="home.providerCta" /> <span aria-hidden="true">→</span></Link></section>
      </main>
      <SiteFooter />
    </div>
  )
}
