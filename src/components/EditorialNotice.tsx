export function EditorialNotice({ reviewedBy, reviewedAt }: { reviewedBy: string; reviewedAt: string }) {
  return <aside className="editorial-notice"><span aria-hidden="true">✓</span><div><strong>Reviewed introduction</strong><p>{reviewedBy} · Last reviewed {reviewedAt}. Practices vary; confirm your family&apos;s final vidhi and samagri with the officiating Purohit.</p></div></aside>
}
