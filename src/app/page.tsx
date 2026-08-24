import Link from 'next/link'
import { Reveal } from '@/components/Reveal'
import { JsonLd } from '@/components/JsonLd'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { approvedPujaGuides } from '@/content/pujas'
import { HomePathways } from '@/features/home/HomePathways'
import { PanchangHero } from '@/features/home/PanchangHero'
import { T } from '@/i18n/T'

export const metadata = { robots: { index: false, follow: true } }

const rituals = [
  { number: '01', title: 'Griha Pravesh', note: 'ritual1Note', meta: 'ritual1Meta' },
  { number: '02', title: 'Satyanarayan Puja', note: 'ritual2Note', meta: 'ritual2Meta' },
  { number: '03', title: 'Vivah Sanskar', note: 'ritual3Note', meta: 'ritual3Meta' },
]

export default function HomePage() {
  return (
    <div className="consumer-page home-v2">
      <JsonLd value={{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'BrahminBooking', url: 'https://brahminbooking.github.io/', description: 'Panchang, puja guidance and trusted Purohit requests.' }} />
      <SiteHeader />
      <main>
        <PanchangHero />

        <section className="trust-ribbon" aria-label="How BrahminBooking helps">
          <p><span aria-hidden="true">✦</span> <T id="home.trust1" /></p><p><span aria-hidden="true">✦</span> <T id="home.trust2" /></p><p><span aria-hidden="true">✦</span> <T id="home.trust3" /></p>
        </section>

        <HomePathways />

        <section className="service-finder" aria-labelledby="service-finder-title">
          <div><p className="section-kicker"><T id="home.finderKicker" /></p><h2 id="service-finder-title"><T id="home.finderTitle" /></h2></div>
          <form action="/book/" method="get">
            <label><span><T id="home.ceremony" /></span><select name="puja" defaultValue=""><option value="">Choose one</option>{approvedPujaGuides.map((guide) => <option value={guide.slug} key={guide.slug}>{guide.name}</option>)}</select></label>
            <label><span><T id="home.city" /></span><input name="city" /></label>
            <label><span><T id="home.date" /></span><input name="date" type="date" /></label>
            <label><span><T id="home.language" /></span><select name="language" defaultValue=""><option value="">—</option><option value="hindi">हिंदी</option><option value="kannada">ಕನ್ನಡ</option><option value="gujarati">ગુજરાતી</option><option value="english">English</option></select></label>
            <button type="submit"><T id="home.bookPurohit" /> <span aria-hidden="true">→</span></button>
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
