import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="home-shell">
      <nav className="home-nav"><span className="brand"><span className="brand-symbol" aria-hidden="true">ॐ</span><span><strong>BrahminBooking</strong><small>Trusted religious service network</small></span></span></nav>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Supply registration is now open</p>
          <h1>Serve families with trust, dignity and tradition.</h1>
          <p className="lede">Join a carefully verified network of Purohits and Brahmins serving Hindu religious needs across India.</p>
          <Link className="button button-primary hero-button" href="/register-as-brahmin/">Register as a Purohit / Brahmin <span aria-hidden="true">→</span></Link>
          <p className="hero-note">No login required · English · हिंदी · ગુજરાતી · ಕನ್ನಡ</p>
        </div>
        <div className="trust-panel">
          <span className="mandala" aria-hidden="true">ॐ</span>
          <p>Institution-supported verification</p>
          <div className="trust-list"><span>Identity</span><span>Tradition</span><span>Experience</span><span>Affiliation</span></div>
        </div>
      </section>
      <footer>Built for service, guided by trust.</footer>
    </main>
  )
}
