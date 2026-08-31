'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch, type Path } from 'react-hook-form'
import { approvedPujaGuides } from '@/content/pujas'
import { PlaceSearchInput } from '@/components/PlaceSearchInput'
import { track } from '@/lib/analytics'
import { bookingDraftSchema, bookingRequestSchema, type BookingDraftValues, type BookingRequestValues } from './schema'
import { saveReceipt, submitBookingRequest } from './submit'

const DRAFT_KEY = 'brahminbooking:booking-draft:v1'
const bookingSteps = ['occasion', 'preferences', 'contact', 'review'] as const
type BookingStep = (typeof bookingSteps)[number]

const fieldsByStep: Record<BookingStep, Path<BookingRequestValues>[]> = {
  occasion: ['serviceSlug', 'serviceOther', 'preferredDate', 'dateFlexible'],
  preferences: ['city', 'area', 'serviceMode', 'timeWindow', 'language', 'tradition', 'samagriAssistance', 'attendeeCount'],
  contact: ['fullName', 'phone', 'email', 'whatsapp', 'notes'],
  review: ['contactConsent'],
}

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
  const registrationT = useTranslations('registration')
  const formRef = useRef<HTMLFormElement>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [submissionError, setSubmissionError] = useState('')
  const { register, handleSubmit, setValue, control, reset, trigger, watch, formState: { errors, isSubmitting } } = useForm<BookingRequestValues>({ resolver: zodResolver(bookingRequestSchema), defaultValues: defaults, mode: 'onBlur' })
  const serviceSlug = useWatch({ control, name: 'serviceSlug' })
  const summary = useWatch({ control })
  const currentStep = bookingSteps[stepIndex]

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const parsed = bookingDraftSchema.safeParse(JSON.parse(raw))
      if (parsed.success) reset({ ...defaults, ...parsed.data })
      else window.localStorage.removeItem(DRAFT_KEY)
    } catch {
      window.localStorage.removeItem(DRAFT_KEY)
    }
  }, [reset])

  useEffect(() => {
    // Persist planning context only; never retain contact details, notes or
    // consent in the browser draft.
    // React Hook Form's subscription is intentionally non-rendering.
    // eslint-disable-next-line react-hooks/incompatible-library
    const subscription = watch((values) => {
      const draft: BookingDraftValues = {
        serviceSlug: values.serviceSlug,
        serviceOther: values.serviceOther,
        preferredDate: values.preferredDate,
        dateFlexible: values.dateFlexible,
        timeWindow: values.timeWindow,
        city: values.city,
        area: values.area,
        serviceMode: values.serviceMode,
        language: values.language,
        tradition: values.tradition,
        samagriAssistance: values.samagriAssistance,
        attendeeCount: values.attendeeCount,
      }
      const parsed = bookingDraftSchema.safeParse(draft)
      if (parsed.success) window.localStorage.setItem(DRAFT_KEY, JSON.stringify(parsed.data))
    })
    return () => subscription.unsubscribe()
  }, [watch])

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
      window.localStorage.removeItem(DRAFT_KEY)
      track('booking_step_completed', { route: '/book/', action: 'review' })
      track('booking_request_submitted', { route: '/book/', service_category: values.serviceSlug })
      router.push('/booking/requested/')
    } catch (error) {
      setSubmissionError(error instanceof Error && error.message === 'serviceUnavailable' ? t('book.serviceUnavailable') : t('book.sendFailed'))
    }
  }

  function focusStep(step: BookingStep) {
    window.requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>(`[data-booking-step="${step}"] h2`)?.focus()
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  async function continueToNextStep() {
    const valid = await trigger(fieldsByStep[currentStep], { shouldFocus: true })
    if (!valid) return
    setSubmissionError('')
    track('booking_step_completed', { route: '/book/', action: currentStep })
    const nextIndex = Math.min(stepIndex + 1, bookingSteps.length - 1)
    setStepIndex(nextIndex)
    focusStep(bookingSteps[nextIndex])
  }

  function returnToPreviousStep() {
    const previousIndex = Math.max(stepIndex - 1, 0)
    setStepIndex(previousIndex)
    focusStep(bookingSteps[previousIndex])
  }

  const errorFor = (name: keyof BookingRequestValues) => {
    const message = errors[name]?.message ? String(errors[name]?.message) : ''
    return message ? <span className="booking-error">{validationErrorKeys[message] ? t(`book.errors.${validationErrorKeys[message]}`) : message}</span> : null
  }

  return <form ref={formRef} className="booking-form" onSubmit={handleSubmit(onSubmit)} noValidate>
    <div className="booking-progress" role="progressbar" aria-valuemin={1} aria-valuemax={bookingSteps.length} aria-valuenow={stepIndex + 1} aria-label={registrationT('stepCount', { current: stepIndex + 1, total: bookingSteps.length })}>
      <div><span>{registrationT('stepCount', { current: stepIndex + 1, total: bookingSteps.length })}</span><strong>{t(`book.${currentStep}`)}</strong></div>
      <div className="booking-progress__track" aria-hidden="true"><span style={{ width: `${((stepIndex + 1) / bookingSteps.length) * 100}%` }} /></div>
    </div>

    {currentStep === 'occasion' && <div className="booking-section" data-booking-step="occasion"><div className="booking-section__number">01</div><div className="booking-section__content">
      <h2 tabIndex={-1}>{t('book.occasion')}</h2><p>{t('book.occasionCopy')}</p>
      <label className="booking-field"><span>{t('book.service')} <b>*</b></span><select {...register('serviceSlug')}><option value="">{t('common.choose')}</option>{approvedPujaGuides.map((guide) => <option key={guide.slug} value={guide.slug}>{guide.name}</option>)}<option value="other">{t('book.anotherService')}</option><option value="unsure">{t('book.unsure')}</option></select>{errorFor('serviceSlug')}</label>
      {serviceSlug === 'other' && <label className="booking-field"><span>{t('book.describe')} <b>*</b></span><input {...register('serviceOther')} />{errorFor('serviceOther')}</label>}
      <div className="booking-pair"><label className="booking-field"><span>{t('book.preferredDate')}</span><input type="date" {...register('preferredDate')} />{errorFor('preferredDate')}</label><label className="check-card"><input type="checkbox" {...register('dateFlexible')} /><span><strong>{t('book.flexible')}</strong><small>{t('book.flexibleCopy')}</small></span></label></div>
      <div className="booking-step-actions"><button className="booking-submit" type="button" onClick={continueToNextStep}>{registrationT('buttons.continue')} <span aria-hidden="true">→</span></button></div>
    </div></div>}

    {currentStep === 'preferences' && <div className="booking-section" data-booking-step="preferences"><div className="booking-section__number">02</div><div className="booking-section__content">
      <h2 tabIndex={-1}>{t('book.preferences')}</h2><p>{t('book.preferencesCopy')}</p>
      <div className="booking-pair"><label className="booking-field"><span>{t('book.city')} <b>*</b></span><PlaceSearchInput {...register('city')} autoComplete="address-level2" />{errorFor('city')}</label><label className="booking-field"><span>{t('book.area')} <b>*</b></span><input {...register('area')} autoComplete="address-level3" />{errorFor('area')}</label></div>
      <div className="booking-pair"><label className="booking-field"><span>{t('book.setting')} <b>*</b></span><select {...register('serviceMode')}><option value="home">{t('book.home')}</option><option value="temple">{t('book.temple')}</option><option value="remote">{t('book.remote')}</option><option value="unsure">{t('book.notSure')}</option></select></label><label className="booking-field"><span>{t('book.time')} <b>*</b></span><select {...register('timeWindow')}><option value="morning">{t('book.morning')}</option><option value="afternoon">{t('book.afternoon')}</option><option value="evening">{t('book.evening')}</option><option value="flexible">{t('book.discuss')}</option></select></label></div>
      <div className="booking-pair"><label className="booking-field"><span>{t('book.ritualLanguage')} <b>*</b></span><select {...register('language')}><option value="">{t('common.choose')}</option><option value="hindi">हिंदी</option><option value="kannada">ಕನ್ನಡ</option><option value="gujarati">ગુજરાતી</option><option value="sanskrit">संस्कृत</option><option value="english">English</option><option value="other">{t('book.anotherLanguage')}</option></select>{errorFor('language')}</label><label className="booking-field"><span>{t('book.samagri')} <b>*</b></span><select {...register('samagriAssistance')}><option value="all">{t('book.allSamagri')}</option><option value="some">{t('book.someSamagri')}</option><option value="none">{t('book.familyArranges')}</option><option value="unsure">{t('book.notSure')}</option></select></label></div>
      <div className="booking-pair"><label className="booking-field"><span>{t('book.tradition')} <em>{t('common.optional')}</em></span><input {...register('tradition')} /></label><label className="booking-field"><span>{t('book.attendees')} <em>{t('common.optional')}</em></span><input {...register('attendeeCount')} inputMode="numeric" />{errorFor('attendeeCount')}</label></div>
      <div className="booking-step-actions"><button className="booking-back" type="button" onClick={returnToPreviousStep}>← {registrationT('buttons.back')}</button><button className="booking-submit" type="button" onClick={continueToNextStep}>{registrationT('buttons.continue')} <span aria-hidden="true">→</span></button></div>
    </div></div>}

    {currentStep === 'contact' && <div className="booking-section" data-booking-step="contact"><div className="booking-section__number">03</div><div className="booking-section__content">
      <h2 tabIndex={-1}>{t('book.contact')}</h2><p>{t('book.contactCopy')}</p>
      <div className="booking-pair"><label className="booking-field"><span>{t('book.name')} <b>*</b></span><input {...register('fullName')} autoComplete="name" />{errorFor('fullName')}</label><label className="booking-field"><span>{t('book.mobile')} <b>*</b></span><input {...register('phone')} inputMode="tel" autoComplete="tel" />{errorFor('phone')}</label></div>
      <label className="booking-field"><span>{t('book.email')} <em>{t('common.optional')}</em></span><input {...register('email')} type="email" autoComplete="email" />{errorFor('email')}</label>
      <label className="check-card check-card--wide"><input type="checkbox" {...register('whatsapp')} /><span><strong>{t('book.whatsapp')}</strong><small>{t('book.whatsappCopy')}</small></span></label>
      <label className="booking-field"><span>{t('book.notes')} <em>{t('common.optional')}</em></span><textarea {...register('notes')} rows={4} /></label>
      <div className="booking-step-actions"><button className="booking-back" type="button" onClick={returnToPreviousStep}>← {registrationT('buttons.back')}</button><button className="booking-submit" type="button" onClick={continueToNextStep}>{registrationT('buttons.continue')} <span aria-hidden="true">→</span></button></div>
    </div></div>}

    {currentStep === 'review' && <div className="booking-section booking-review" data-booking-step="review"><div className="booking-section__number">04</div><div className="booking-section__content">
      <h2 tabIndex={-1}>{t('book.review')}</h2><p>{t('book.reviewCopy')}</p>
      <dl><div><dt>{t('book.service')}</dt><dd>{approvedPujaGuides.find((guide) => guide.slug === summary.serviceSlug)?.name || summary.serviceOther || t('common.notSelected')}</dd></div><div><dt>{t('book.place')}</dt><dd>{summary.city ? `${summary.area || t('common.areaPending')}, ${summary.city}` : t('common.notEntered')}</dd></div><div><dt>{t('book.dateTime')}</dt><dd>{summary.preferredDate || (summary.dateFlexible ? t('common.flexibleDate') : t('common.notSelected'))} · {summary.timeWindow}</dd></div><div><dt>{t('book.language')}</dt><dd>{summary.language || t('common.notSelected')}</dd></div></dl>
      <label className="consent-panel"><input type="checkbox" {...register('contactConsent')} /><span>{t('book.consent')} <b>*</b>{errorFor('contactConsent')}</span></label>
      <label className="website-field">{t('book.leaveBlank')}<input {...register('website')} tabIndex={-1} autoComplete="off" /></label>
      {submissionError && <div className="form-error" role="alert">{submissionError}</div>}
      <div className="booking-step-actions"><button className="booking-back" type="button" onClick={returnToPreviousStep} disabled={isSubmitting}>← {registrationT('buttons.back')}</button><button className="booking-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? t('book.sending') : t('book.submit')} <span aria-hidden="true">→</span></button></div>
      <p className="submit-note">{t('book.submitNote')}</p>
    </div></div>}
  </form>
}
