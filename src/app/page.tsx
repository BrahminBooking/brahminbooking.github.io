import Link from 'next/link'
import { Reveal } from '@/components/Reveal'
import { JsonLd } from '@/components/JsonLd'
import { CurrentDate } from '@/components/CurrentDate'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { approvedFestivalGuides } from '@/content/festivals'
import { approvedPujaGuides } from '@/content/pujas'

export const metadata = { robots: { index: false, follow: true } }

const rituals = [
  { number: '01', title: 'Griha Pravesh', note: 'For a considered beginning in a new home', meta: 'Home ceremony · 2–4 hours' },
  { number: '02', title: 'Satyanarayan Puja', note: 'A prayer of gratitude, wellbeing and resolve', meta: 'Home or temple · 2–3 hours' },
  { number: '03', title: 'Vivah Sanskar', note: 'Wedding rites guided by family tradition', meta: 'Venue · Custom duration' },
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
            <p className="section-kicker">A more thoughtful way to honour tradition</p>
            <h1>Sacred ceremonies.<br /><em>Trusted hands.</em></h1>
            <p className="editorial-hero__lede">Find verified Purohits and temples for pujas, samskaras and sacred occasions—at home, at a temple or from wherever you are.</p>
            <div className="hero-actions">
              <Link className="consumer-button consumer-button--primary" href="/book/">Find a Purohit <span aria-hidden="true">→</span></Link>
              <Link className="text-link" href="/panchang/">Explore today&apos;s Panchang <span aria-hidden="true">↗</span></Link>
            </div>
            <p className="hero-location">Showing fixture timings for <strong>Bengaluru, Karnataka</strong> · <Link href="/panchang/">Change location</Link></p>
          </Reveal>
          <Reveal className="today-card-wrap" delay={0.12}><aside id="today" className="today-card" aria-label="Today’s Panchang preview">
            <div className="today-card__topline"><span>Today preview</span><CurrentDate /></div>
            <div className="today-card__sun"><span aria-hidden="true">☼</span><p>Illustrative Vaar · Somavara<br /><strong>Bengaluru</strong></p></div>
            <dl className="today-card__grid">
              <div><dt>Tithi</dt><dd>Shukla Dwadashi <small>until 14:18</small></dd></div><div><dt>Nakshatra</dt><dd>Purva Ashadha <small>until 18:42</small></dd></div>
              <div><dt>Paksha · month</dt><dd>Shukla · Shravana</dd></div><div><dt>Sunrise · sunset</dt><dd>06:09 · 18:36</dd></div>
            </dl>
            <div className="today-window"><span>Upcoming window</span><strong>Abhijit Muhurta · 12:00–12:50</strong></div>
            <p className="fixture-note">Development fixture · Not for religious decisions</p>
            <Link className="today-card__link" href="/panchang/">View full Panchang <span aria-hidden="true">→</span></Link>
          </aside></Reveal>
        </section>

        <section className="trust-ribbon" aria-label="How BrahminBooking helps">
          <p><span aria-hidden="true">✦</span> Human-coordinated requests</p><p><span aria-hidden="true">✦</span> Tradition and language considered</p><p><span aria-hidden="true">✦</span> Provider verification in progress</p>
        </section>

        <section className="home-discovery">
          <div className="home-two-up">
            <section>
              <div className="home-section-title"><p className="section-kicker">Location and tradition matter</p><h2>Festivals &amp;<br />observances today</h2></div>
              <article className="observance-card"><span>Reviewed festival guide</span><h3>{approvedFestivalGuides[0].name}</h3><p>{approvedFestivalGuides[0].summary}</p><div><small>Regional applicability varies</small><small>No live festival date asserted</small></div><Link className="text-link" href={`/festivals/${approvedFestivalGuides[0].slug}/`}>Learn more <b aria-hidden="true">↗</b></Link></article>
            </section>
            <section>
              <div className="home-section-title"><p className="section-kicker">Structured, reviewed mapping</p><h2>Pujas and sevas<br />for today</h2></div>
              <article className="observance-card observance-card--puja"><span>Illustrative recommendation</span><h3>{approvedPujaGuides[3].name}</h3><p>Commonly associated with an auspicious beginning. This development mapping is not a personalized religious recommendation.</p><div><small>Home · Temple</small><small>{approvedPujaGuides[3].duration}</small></div><Link className="text-link" href={`/book/?puja=${approvedPujaGuides[3].slug}`}>Request this puja <b aria-hidden="true">→</b></Link></article>
            </section>
          </div>
          <p className="fixture-strip">Development fixtures are isolated from approved editorial guides and are never generated by an LLM at request time.</p>
        </section>

        <section className="service-finder" aria-labelledby="service-finder-title">
          <div><p className="section-kicker">Find a service</p><h2 id="service-finder-title">Start with the essentials.</h2></div>
          <form action="/book/" method="get">
            <label><span>Puja or ceremony</span><select name="puja" defaultValue=""><option value="">Choose one</option>{approvedPujaGuides.map((guide) => <option value={guide.slug} key={guide.slug}>{guide.name}</option>)}</select></label>
            <label><span>City</span><input name="city" placeholder="Your city" /></label>
            <label><span>Preferred date</span><input name="date" type="date" /></label>
            <label><span>Language</span><select name="language" defaultValue=""><option value="">Choose</option><option value="hindi">Hindi</option><option value="kannada">Kannada</option><option value="gujarati">Gujarati</option><option value="english">English explanation</option></select></label>
            <button type="submit">Find a Purohit <span aria-hidden="true">→</span></button>
          </form>
        </section>

        <section className="ritual-section">
          <div className="section-heading">
            <div><p className="section-kicker">Begin with understanding</p><h2>Rituals for life&apos;s<br />meaningful moments.</h2></div>
            <p>Clear, respectful preparation notes—what the ritual signifies, what families commonly arrange, and what to confirm with your Purohit.</p>
          </div>
          <Reveal><div className="ritual-list">
            {rituals.map((ritual) => (
              <Link className="ritual-row" href="/pujas/" key={ritual.number}>
                <span className="ritual-row__number">{ritual.number}</span>
                <span><strong>{ritual.title}</strong><small>{ritual.note}</small></span>
                <span className="ritual-row__meta">{ritual.meta}</span><span className="ritual-row__arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div></Reveal>
          <Link className="text-link ritual-all" href="/pujas/">Browse all puja guides <span aria-hidden="true">→</span></Link>
        </section>

        <section id="temples" className="verification-section">
          <div><p className="section-kicker">Trust without shortcuts</p><h2>Verification is a record,<br />not a single badge.</h2><p>Our supply network is being built through institutional relationships and documented human review. The exact checks completed should be visible—not collapsed into a vague claim.</p></div>
          <dl><div><dt>Identity</dt><dd>Identity evidence can be reviewed privately.</dd></div><div><dt>References</dt><dd>Religious and community references can be recorded separately.</dd></div><div><dt>Affiliation</dt><dd>Temple or institution claims can be verified and dated.</dd></div><div><dt>Practice</dt><dd>Languages, traditions and services are documented for coordination.</dd></div></dl>
        </section>

        <section id="how-it-works" className="process-section">
          <div className="home-section-title"><p className="section-kicker">Human-assisted in the pilot</p><h2>How a request becomes an arrangement.</h2></div>
          <ol><li><span>01</span><strong>Tell us about the ceremony</strong><p>No account or payment is required.</p></li><li><span>02</span><strong>We review the details</strong><p>Language, tradition and location are considered.</p></li><li><span>03</span><strong>Availability is confirmed</strong><p>A coordinator speaks with you and the Purohit.</p></li><li><span>04</span><strong>Receive coordinated assistance</strong><p>Final expectations are agreed directly.</p></li></ol>
        </section>

        <section className="booking-callout">
          <div className="booking-callout__motif" aria-hidden="true">ॐ</div>
          <div><p className="section-kicker">A human process, by design</p><h2>Tell us what your family needs.</h2></div>
          <div><p>Share the occasion, place, language and preferred date. Our team will review your request and coordinate the next step—without asking you to create an account.</p><Link className="consumer-button consumer-button--light" href="/book/">Start a request <span aria-hidden="true">→</span></Link></div>
        </section>
        <section className="provider-invitation"><div><p className="section-kicker">For Purohits and Brahmins</p><h2>Serve more families through a trusted network.</h2></div><Link className="text-link" href="/register-as-brahmin/">Register as a Purohit <span aria-hidden="true">→</span></Link></section>
      </main>
      <SiteFooter />
    </div>
  )
}
