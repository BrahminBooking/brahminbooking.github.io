'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { approvedPujaGuides } from '@/content/pujas'
import { PlaceSearchInput } from '@/components/PlaceSearchInput'
import { track } from '@/lib/analytics'
import { bookingRequestSchema, type BookingRequestValues } from './schema'
import { saveReceipt, submitBookingRequest } from './submit'

const defaults: BookingRequestValues = {
  serviceSlug: '', serviceOther: '', preferredDate: '', dateFlexible: false, timeWindow: 'flexible',
  city: '', area: '', serviceMode: 'home', language: '', tradition: '', samagriAssistance: 'unsure',
  attendeeCount: '', fullName: '', phone: '', email: '', whatsapp: true, notes: '',
  contactConsent: false as true, website: '',
}

const validationErrorKeys: Record<string, string> = {
  'Choose a ceremony or service.': 'service', 'Enter the city or town.': 'city', 'Enter the locality or area.': 'area',
  'Choose a preferred language.': 'language', 'Enter an approximate number.': 'attendees', 'Enter your name.': 'name',
  'Enter a valid phone number.': 'phone', 'Enter a valid email address.': 'email',
  'Consent is required so the team can coordinate your request.': 'consent', 'Describe the requested service.': 'describe',
  'Choose a date or mark it flexible.': 'date',
}

export function BookingForm() {
  const router = useRouter()
  const t = useTranslations('site')
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
        service: approvedPujaGuides.find((guide) => guide.slug === values.serviceSlug)?.name ?? values.serviceOther ?? t('book.religiousService'),
        place: `${values.area}, ${values.city}`, date: values.preferredDate || t('common.flexibleDate'),
      } })
      for (const action of ['occasion', 'preferences', 'contact', 'review']) track('booking_step_completed', { route: '/book/', action })
      track('booking_request_submitted', { route: '/book/', service_category: values.serviceSlug })
      router.push('/booking/requested/')
    } catch (error) {
      setSubmissionError(error instanceof Error && error.message === 'serviceUnavailable' ? t('book.serviceUnavailable') : t('book.sendFailed'))
    }
  }

  const errorFor = (name: keyof BookingRequestValues) => {
    const message = errors[name]?.message ? String(errors[name]?.message) : ''
    return message ? <span className="booking-error">{validationErrorKeys[message] ? t(`book.errors.${validationErrorKeys[message]}`) : message}</span> : null
  }

  return <form className="booking-form" onSubmit={handleSubmit(onSubmit)} noValidate>
    <div className="booking-section"><div className="booking-section__number">01</div><div className="booking-section__content">
      <h2>{t('book.occasion')}</h2><p>{t('book.occasionCopy')}</p>
      <label className="booking-field"><span>{t('book.service')} <b>*</b></span><select {...register('serviceSlug')}><option value="">{t('common.choose')}</option>{approvedPujaGuides.map((guide) => <option key={guide.slug} value={guide.slug}>{guide.name}</option>)}<option value="other">{t('book.anotherService')}</option><option value="unsure">{t('book.unsure')}</option></select>{errorFor('serviceSlug')}</label>
      {serviceSlug === 'other' && <label className="booking-field"><span>{t('book.describe')} <b>*</b></span><input {...register('serviceOther')} />{errorFor('serviceOther')}</label>}
      <div className="booking-pair"><label className="booking-field"><span>{t('book.preferredDate')}</span><input type="date" {...register('preferredDate')} />{errorFor('preferredDate')}</label><label className="check-card"><input type="checkbox" {...register('dateFlexible')} /><span><strong>{t('book.flexible')}</strong><small>{t('book.flexibleCopy')}</small></span></label></div>
    </div></div>

    <div className="booking-section"><div className="booking-section__number">02</div><div className="booking-section__content">
      <h2>{t('book.preferences')}</h2><p>{t('book.preferencesCopy')}</p>
      <div className="booking-pair"><label className="booking-field"><span>{t('book.city')} <b>*</b></span><PlaceSearchInput {...register('city')} autoComplete="address-level2" />{errorFor('city')}</label><label className="booking-field"><span>{t('book.area')} <b>*</b></span><input {...register('area')} autoComplete="address-level3" />{errorFor('area')}</label></div>
      <div className="booking-pair"><label className="booking-field"><span>{t('book.setting')} <b>*</b></span><select {...register('serviceMode')}><option value="home">{t('book.home')}</option><option value="temple">{t('book.temple')}</option><option value="remote">{t('book.remote')}</option><option value="unsure">{t('book.notSure')}</option></select></label><label className="booking-field"><span>{t('book.time')} <b>*</b></span><select {...register('timeWindow')}><option value="morning">{t('book.morning')}</option><option value="afternoon">{t('book.afternoon')}</option><option value="evening">{t('book.evening')}</option><option value="flexible">{t('book.discuss')}</option></select></label></div>
      <div className="booking-pair"><label className="booking-field"><span>{t('book.ritualLanguage')} <b>*</b></span><select {...register('language')}><option value="">{t('common.choose')}</option><option value="hindi">हिंदी</option><option value="kannada">ಕನ್ನಡ</option><option value="gujarati">ગુજરાતી</option><option value="sanskrit">संस्कृत</option><option value="english">English</option><option value="other">{t('book.anotherLanguage')}</option></select>{errorFor('language')}</label><label className="booking-field"><span>{t('book.samagri')} <b>*</b></span><select {...register('samagriAssistance')}><option value="all">{t('book.allSamagri')}</option><option value="some">{t('book.someSamagri')}</option><option value="none">{t('book.familyArranges')}</option><option value="unsure">{t('book.notSure')}</option></select></label></div>
      <div className="booking-pair"><label className="booking-field"><span>{t('book.tradition')} <em>{t('common.optional')}</em></span><input {...register('tradition')} /></label><label className="booking-field"><span>{t('book.attendees')} <em>{t('common.optional')}</em></span><input {...register('attendeeCount')} inputMode="numeric" />{errorFor('attendeeCount')}</label></div>
    </div></div>

    <div className="booking-section"><div className="booking-section__number">03</div><div className="booking-section__content">
      <h2>{t('book.contact')}</h2><p>{t('book.contactCopy')}</p>
      <div className="booking-pair"><label className="booking-field"><span>{t('book.name')} <b>*</b></span><input {...register('fullName')} autoComplete="name" />{errorFor('fullName')}</label><label className="booking-field"><span>{t('book.mobile')} <b>*</b></span><input {...register('phone')} inputMode="tel" autoComplete="tel" />{errorFor('phone')}</label></div>
      <label className="booking-field"><span>{t('book.email')} <em>{t('common.optional')}</em></span><input {...register('email')} type="email" autoComplete="email" />{errorFor('email')}</label>
      <label className="check-card check-card--wide"><input type="checkbox" {...register('whatsapp')} /><span><strong>{t('book.whatsapp')}</strong><small>{t('book.whatsappCopy')}</small></span></label>
      <label className="booking-field"><span>{t('book.notes')} <em>{t('common.optional')}</em></span><textarea {...register('notes')} rows={4} /></label>
    </div></div>

    <div className="booking-section booking-review"><div className="booking-section__number">04</div><div className="booking-section__content">
      <h2>{t('book.review')}</h2><p>{t('book.reviewCopy')}</p>
      <dl><div><dt>{t('book.service')}</dt><dd>{approvedPujaGuides.find((guide) => guide.slug === summary.serviceSlug)?.name || summary.serviceOther || t('common.notSelected')}</dd></div><div><dt>{t('book.place')}</dt><dd>{summary.city ? `${summary.area || t('common.areaPending')}, ${summary.city}` : t('common.notEntered')}</dd></div><div><dt>{t('book.dateTime')}</dt><dd>{summary.preferredDate || (summary.dateFlexible ? t('common.flexibleDate') : t('common.notSelected'))} · {summary.timeWindow}</dd></div><div><dt>{t('book.language')}</dt><dd>{summary.language || t('common.notSelected')}</dd></div></dl>
      <label className="consent-panel"><input type="checkbox" {...register('contactConsent')} /><span>{t('book.consent')} <b>*</b>{errorFor('contactConsent')}</span></label>
      <label className="website-field">{t('book.leaveBlank')}<input {...register('website')} tabIndex={-1} autoComplete="off" /></label>
      {submissionError && <div className="form-error" role="alert">{submissionError}</div>}
      <button className="booking-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? t('book.sending') : t('book.submit')} <span aria-hidden="true">→</span></button>
      <p className="submit-note">{t('book.submitNote')}</p>
    </div></div>
  </form>
}
