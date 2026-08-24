'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { approvedPujaGuides } from '@/content/pujas'
import { track } from '@/lib/analytics'
import { bookingRequestSchema, type BookingRequestValues } from './schema'
import { saveReceipt, submitBookingRequest } from './submit'

const defaults: BookingRequestValues = {
  serviceSlug: '', serviceOther: '', preferredDate: '', dateFlexible: false, timeWindow: 'flexible',
  city: '', area: '', serviceMode: 'home', language: '', tradition: '', samagriAssistance: 'unsure',
  attendeeCount: '', fullName: '', phone: '', email: '', whatsapp: true, notes: '',
  contactConsent: false as true, website: '',
}

export function BookingForm() {
  const router = useRouter()
  const [submissionError, setSubmissionError] = useState('')
  const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting } } = useForm<BookingRequestValues>({ resolver: zodResolver(bookingRequestSchema), defaultValues: defaults })
  const serviceSlug = useWatch({ control, name: 'serviceSlug' })
  const summary = useWatch({ control })

  useEffect(() => {
    track('booking_request_started', { route: '/book/' })
    const params = new URLSearchParams(window.location.search)
    const selected = params.get('puja')
    if (selected && approvedPujaGuides.some((guide) => guide.slug === selected)) setValue('serviceSlug', selected)
    const city = params.get('city'), date = params.get('date'), language = params.get('language')
    if (city) setValue('city', city); if (date) setValue('preferredDate', date); if (language) setValue('language', language)
  }, [setValue])

  const onSubmit = async (values: BookingRequestValues) => {
    setSubmissionError('')
    try {
      const receipt = await submitBookingRequest(values)
      saveReceipt({ ...receipt, summary: {
        service: approvedPujaGuides.find((guide) => guide.slug === values.serviceSlug)?.name ?? values.serviceOther ?? 'Religious service',
        place: `${values.area}, ${values.city}`, date: values.preferredDate || 'Flexible date',
      } })
      for (const action of ['occasion', 'preferences', 'contact', 'review']) track('booking_step_completed', { route: '/book/', action })
      track('booking_request_submitted', { route: '/book/', service_category: values.serviceSlug })
      router.push('/booking/requested/')
    } catch (error) {
      setSubmissionError(error instanceof Error && error.message === 'serviceUnavailable' ? 'Request service is not connected yet. Please return shortly or contact the team directly.' : 'We could not send the request. Please check your connection and try again.')
    }
  }

  const errorFor = (name: keyof BookingRequestValues) => errors[name]?.message ? <span className="booking-error">{String(errors[name]?.message)}</span> : null

  return <form className="booking-form" onSubmit={handleSubmit(onSubmit)} noValidate>
    <div className="booking-section"><div className="booking-section__number">01</div><div className="booking-section__content">
      <h2>The occasion</h2><p>Start with what you know. The team can help clarify the exact service.</p>
      <label className="booking-field"><span>Ceremony or service <b>*</b></span><select {...register('serviceSlug')}><option value="">Choose one</option>{approvedPujaGuides.map((guide) => <option key={guide.slug} value={guide.slug}>{guide.name}</option>)}<option value="other">Another puja or religious service</option><option value="unsure">I am not sure yet</option></select>{errorFor('serviceSlug')}</label>
      {serviceSlug === 'other' && <label className="booking-field"><span>Describe the service <b>*</b></span><input {...register('serviceOther')} placeholder="For example, annual family shraddha" />{errorFor('serviceOther')}</label>}
      <div className="booking-pair"><label className="booking-field"><span>Preferred date</span><input type="date" {...register('preferredDate')} />{errorFor('preferredDate')}</label><label className="check-card"><input type="checkbox" {...register('dateFlexible')} /><span><strong>My date is flexible</strong><small>We can discuss suitable dates.</small></span></label></div>
    </div></div>

    <div className="booking-section"><div className="booking-section__number">02</div><div className="booking-section__content">
      <h2>Place and preferences</h2><p>These details help us coordinate manually with the right network.</p>
      <div className="booking-pair"><label className="booking-field"><span>City or town <b>*</b></span><input {...register('city')} autoComplete="address-level2" />{errorFor('city')}</label><label className="booking-field"><span>Locality or area <b>*</b></span><input {...register('area')} autoComplete="address-level3" />{errorFor('area')}</label></div>
      <div className="booking-pair"><label className="booking-field"><span>Setting <b>*</b></span><select {...register('serviceMode')}><option value="home">At home / venue</option><option value="temple">At a temple</option><option value="remote">Remote guidance</option><option value="unsure">Not sure</option></select></label><label className="booking-field"><span>Preferred time window <b>*</b></span><select {...register('timeWindow')}><option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option><option value="flexible">Flexible / discuss</option></select></label></div>
      <div className="booking-pair"><label className="booking-field"><span>Preferred ritual language <b>*</b></span><select {...register('language')}><option value="">Choose one</option><option value="hindi">Hindi</option><option value="kannada">Kannada</option><option value="gujarati">Gujarati</option><option value="sanskrit">Sanskrit</option><option value="english">English explanation</option><option value="other">Another language</option></select>{errorFor('language')}</label><label className="booking-field"><span>Samagri assistance <b>*</b></span><select {...register('samagriAssistance')}><option value="all">Please arrange all samagri</option><option value="some">Help with some samagri</option><option value="none">Family will arrange</option><option value="unsure">Not sure yet</option></select></label></div>
      <div className="booking-pair"><label className="booking-field"><span>Family tradition or sampradaya <em>Optional</em></span><input {...register('tradition')} placeholder="Add if known" /></label><label className="booking-field"><span>Approximate attendees <em>Optional</em></span><input {...register('attendeeCount')} inputMode="numeric" placeholder="For example, 12" />{errorFor('attendeeCount')}</label></div>
    </div></div>

    <div className="booking-section"><div className="booking-section__number">03</div><div className="booking-section__content">
      <h2>How we can reach you</h2><p>No account is needed. Your details remain private and are used to coordinate this request.</p>
      <div className="booking-pair"><label className="booking-field"><span>Your name <b>*</b></span><input {...register('fullName')} autoComplete="name" />{errorFor('fullName')}</label><label className="booking-field"><span>Mobile number <b>*</b></span><input {...register('phone')} inputMode="tel" autoComplete="tel" />{errorFor('phone')}</label></div>
      <label className="booking-field"><span>Email <em>Optional</em></span><input {...register('email')} type="email" autoComplete="email" />{errorFor('email')}</label>
      <label className="check-card check-card--wide"><input type="checkbox" {...register('whatsapp')} /><span><strong>This number is available on WhatsApp</strong><small>We may use it for request coordination only.</small></span></label>
      <label className="booking-field"><span>Attendee or ceremony context <em>Optional</em></span><textarea {...register('notes')} rows={4} placeholder="Family context, accessibility needs, preferred call time, or other details" /></label>
    </div></div>

    <div className="booking-section booking-review"><div className="booking-section__number">04</div><div className="booking-section__content">
      <h2>Review and request</h2><p>Please confirm these essentials. A request does not reserve a Purohit or create a charge.</p>
      <dl><div><dt>Service</dt><dd>{approvedPujaGuides.find((guide) => guide.slug === summary.serviceSlug)?.name || summary.serviceOther || 'Not selected'}</dd></div><div><dt>Place</dt><dd>{summary.city ? `${summary.area || 'Area pending'}, ${summary.city}` : 'Not entered'}</dd></div><div><dt>Date and time</dt><dd>{summary.preferredDate || (summary.dateFlexible ? 'Flexible date' : 'Not selected')} · {summary.timeWindow}</dd></div><div><dt>Language</dt><dd>{summary.language || 'Not selected'}</dd></div></dl>
      <label className="consent-panel"><input type="checkbox" {...register('contactConsent')} /><span>I consent to BrahminBooking contacting me to coordinate this request and handling these details under the privacy notice. I understand this is a request, not a confirmed booking. <b>*</b>{errorFor('contactConsent')}</span></label>
      <label className="website-field">Leave blank<input {...register('website')} tabIndex={-1} autoComplete="off" /></label>
      {submissionError && <div className="form-error" role="alert">{submissionError}</div>}
      <button className="booking-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending securely…' : 'Request booking'} <span aria-hidden="true">→</span></button>
      <p className="submit-note">No payment now · No account required · Human follow-up</p>
    </div></div>
  </form>
}
