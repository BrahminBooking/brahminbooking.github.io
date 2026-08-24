import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="consumer-footer">
      <div className="consumer-footer__inner">
        <div><span className="footer-mark" aria-hidden="true">ॐ</span><p>Tradition, carefully coordinated.</p></div>
        <div className="footer-links">
          <Link href="/panchang/">Panchang</Link><Link href="/pujas/">Puja guides</Link><Link href="/festivals/">Festivals</Link><Link href="/privacy/">Privacy</Link>
        </div>
        <p className="footer-note">BrahminBooking facilitates requests. Ritual guidance and final arrangements are confirmed directly with the assigned Purohit.</p>
      </div>
    </footer>
  )
}
