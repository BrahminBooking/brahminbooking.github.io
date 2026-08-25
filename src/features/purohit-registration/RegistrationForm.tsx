'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { cloneElement, useEffect, useId, useMemo, useState } from 'react'
import { useForm, type FieldError, type FieldErrors, type Path, type UseFormRegister } from 'react-hook-form'
import {
  formSteps,
  languageOptions,
  pujaOptions,
  samskaraOptions,
  serviceModeOptions,
  traditionOptions,
} from './options'
import {
  defaultRegistrationValues,
  purohitRegistrationSchema,
  type PurohitRegistrationInput,
  type PurohitRegistrationValues,
} from './schema'
import { submitPurohitRegistration, type SubmissionReceipt } from './submit'
import type { SupportedLocale } from './RegistrationExperience'

const DRAFT_KEY = 'brahminbooking-purohit-draft'

const fieldsByStep: Record<(typeof formSteps)[number], Path<PurohitRegistrationInput>[]> = {
  identity: ['fullName', 'phone', 'whatsapp', 'email', 'preferredContact', 'birthYear', 'aadhaarAvailable', 'aadhaarLastFour'],
  location: ['city', 'district', 'state', 'country', 'postalCode', 'serviceAreas', 'travelRadiusKm'],
  practice: ['spokenLanguages', 'ritualLanguages', 'tradition', 'traditionOther', 'experienceYears', 'background'],
  services: ['pujas', 'samskaras', 'otherServices', 'serviceModes', 'samagriCapability', 'dakshinaMin', 'dakshinaMax'],
  trust: ['referenceName', 'referencePhone', 'referenceRelationship', 'referenceInstitution', 'referralCode'],
  consent: ['truthConsent', 'contactConsent', 'privacyConsent', 'publicProfilePermission'],
}

interface RegistrationFormProps {
  locale: SupportedLocale
  localeLabels: Record<SupportedLocale, string>
  onLocaleChange: (locale: SupportedLocale) => void
}

export function RegistrationForm({ locale, localeLabels, onLocaleChange }: RegistrationFormProps) {
  const t = useTranslations('registration')
  const [stepIndex, setStepIndex] = useState(0)
  const [receipt, setReceipt] = useState<SubmissionReceipt | null>(null)
  const [submitError, setSubmitError] = useState('')

  const form = useForm<PurohitRegistrationInput, unknown, PurohitRegistrationValues>({
    resolver: zodResolver(purohitRegistrationSchema),
    defaultValues: defaultRegistrationValues,
    mode: 'onBlur',
  })
  const { register, watch, trigger, handleSubmit, reset, formState: { errors, isSubmitting } } = form
  const aadhaarAvailable = watch('aadhaarAvailable')
  const tradition = watch('tradition')
  const currentStep = formSteps[stepIndex]

  useEffect(() => {
    try {
      const draft = window.localStorage.getItem(DRAFT_KEY)
      if (draft) reset({ ...defaultRegistrationValues, ...JSON.parse(draft) })
    } catch {
      window.localStorage.removeItem(DRAFT_KEY)
    }
  }, [reset])

  useEffect(() => {
    // React Hook Form's subscription is intentionally non-rendering and is used
    // only to persist a device-local draft.
    // eslint-disable-next-line react-hooks/incompatible-library
    const subscription = watch((values) => {
      const safeDraft = { ...values, aadhaarLastFour: '', truthConsent: false, contactConsent: false, privacyConsent: false, publicProfilePermission: false, website: '' }
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(safeDraft))
    })
    return () => subscription.unsubscribe()
  }, [watch])

  const progress = useMemo(() => ((stepIndex + 1) / formSteps.length) * 100, [stepIndex])

  async function continueToNextStep() {
    const isValid = await trigger(fieldsByStep[currentStep], { shouldFocus: true })
    if (isValid) {
      setSubmitError('')
      setStepIndex((current) => Math.min(current + 1, formSteps.length - 1))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  async function onSubmit(values: PurohitRegistrationValues) {
    setSubmitError('')
    try {
      const result = await submitPurohitRegistration(values, locale)
      setReceipt(result)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      const key = error instanceof Error ? error.message : 'submissionFailed'
      setSubmitError(translateError(t, key))
    }
  }

  function startAgain() {
    reset(defaultRegistrationValues)
    setStepIndex(0)
    setReceipt(null)
  }

  if (receipt) {
    return (
      <main className="page-shell success-shell">
        <BrandMark />
        <section className="success-card" aria-live="polite">
          <span className="success-symbol" aria-hidden="true">✓</span>
          <p className="eyebrow">{t('success.eyebrow')}</p>
          <h1>{t('success.title')}</h1>
          <p>{t('success.description')}</p>
          <strong className="reference-number">{receipt.applicationNumber}</strong>
          <p className="muted">{t('success.followup')}</p>
          <div className="success-actions">
            <button type="button" className="button button-secondary" onClick={startAgain}>{t('buttons.startAgain')}</button>
            <Link className="button button-primary" href="/">{t('buttons.home')}</Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <header className="site-header">
        <BrandMark />
        <label className="language-select">
          <span>{t('languageLabel')}</span>
          <select value={locale} onChange={(event) => onLocaleChange(event.target.value as SupportedLocale)}>
            {(Object.keys(localeLabels) as SupportedLocale[]).map((value) => (
              <option key={value} value={value}>{localeLabels[value]}</option>
            ))}
          </select>
        </label>
      </header>

      <div className="registration-layout">
        <aside className="form-intro">
          <p className="eyebrow">{t('eyebrow')}</p>
          <h1>{t('title')}</h1>
          <p className="lede">{t('description')}</p>
          <div className="privacy-callout">{t('privacyNote')}</div>
          <p className="draft-note">{t('draftNotice')}</p>
        </aside>

        <section className="form-card">
          <div className="progress-copy">
            <span>{t('stepCount', { current: stepIndex + 1, total: formSteps.length })}</span>
            <strong>{t(`steps.${currentStep}`)}</strong>
          </div>
          <div className="progress-track" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {currentStep === 'identity' && (
              <Step title={t('sections.identityTitle')} description={t('sections.identityDescription')}>
                <InputField label={t('fields.fullName')} required error={fieldError(errors, 'fullName', t)}><input autoComplete="name" {...register('fullName')} /></InputField>
                <InputField label={t('fields.displayName')} optional={t('optional')} error={fieldError(errors, 'displayName', t)}><input {...register('displayName')} /></InputField>
                <div className="field-grid">
                  <InputField label={t('fields.phone')} required error={fieldError(errors, 'phone', t)}><input type="tel" inputMode="tel" autoComplete="tel" {...register('phone')} /></InputField>
                  <InputField label={t('fields.whatsapp')} optional={t('optional')} error={fieldError(errors, 'whatsapp', t)}><input type="tel" inputMode="tel" {...register('whatsapp')} /></InputField>
                </div>
                <InputField label={t('fields.email')} optional={t('optional')} error={fieldError(errors, 'email', t)}><input type="email" autoComplete="email" {...register('email')} /></InputField>
                <RadioGroup label={t('fields.preferredContact')} name="preferredContact" options={[['whatsapp', t('options.whatsapp')], ['phone', t('options.phone')]]} register={register} />
                <div className="field-grid">
                  <InputField label={t('fields.preferredTime')} optional={t('optional')} error={fieldError(errors, 'preferredTime', t)}><input {...register('preferredTime')} /></InputField>
                  <InputField label={t('fields.birthYear')} optional={t('optional')} error={fieldError(errors, 'birthYear', t)}><input type="number" inputMode="numeric" min="1920" max={new Date().getFullYear() - 18} {...register('birthYear')} /></InputField>
                </div>
                <RadioGroup label={t('fields.aadhaarAvailable')} name="aadhaarAvailable" options={[['yes', t('options.yes')], ['no', t('options.no')], ['prefer-not', t('options.preferNot')]]} register={register} />
                {aadhaarAvailable === 'yes' && <InputField label={t('fields.aadhaarLastFour')} optional={t('optional')} help={t('fields.aadhaarHelp')} error={fieldError(errors, 'aadhaarLastFour', t)}><input type="text" inputMode="numeric" maxLength={4} pattern="[0-9]{4}" autoComplete="off" {...register('aadhaarLastFour')} /></InputField>}
                <Honeypot register={register} />
              </Step>
            )}

            {currentStep === 'location' && (
              <Step title={t('sections.locationTitle')} description={t('sections.locationDescription')}>
                <InputField label={t('fields.city')} required error={fieldError(errors, 'city', t)}><input autoComplete="address-level2" {...register('city')} /></InputField>
                <div className="field-grid">
                  <InputField label={t('fields.district')} required error={fieldError(errors, 'district', t)}><input {...register('district')} /></InputField>
                  <InputField label={t('fields.state')} required error={fieldError(errors, 'state', t)}><input autoComplete="address-level1" {...register('state')} /></InputField>
                </div>
                <div className="field-grid">
                  <InputField label={t('fields.country')} required error={fieldError(errors, 'country', t)}><input autoComplete="country-name" {...register('country')} /></InputField>
                  <InputField label={t('fields.postalCode')} required error={fieldError(errors, 'postalCode', t)}><input inputMode="numeric" autoComplete="postal-code" {...register('postalCode')} /></InputField>
                </div>
                <InputField label={t('fields.serviceAreas')} required help={t('fields.serviceAreasHelp')} error={fieldError(errors, 'serviceAreas', t)}><textarea rows={3} {...register('serviceAreas')} /></InputField>
                <InputField label={t('fields.travelRadiusKm')} required error={fieldError(errors, 'travelRadiusKm', t)}><input type="number" inputMode="numeric" min="0" max="1000" {...register('travelRadiusKm')} /></InputField>
              </Step>
            )}

            {currentStep === 'practice' && (
              <Step title={t('sections.practiceTitle')} description={t('sections.practiceDescription')}>
                <CheckboxGrid label={t('fields.spokenLanguages')} name="spokenLanguages" options={languageOptions.map((option) => [option.value, option.value === 'other' ? t('common.other') : t(option.labelKey)])} register={register} error={fieldError(errors, 'spokenLanguages', t)} />
                <CheckboxGrid label={t('fields.ritualLanguages')} name="ritualLanguages" options={languageOptions.map((option) => [option.value, option.value === 'other' ? t('common.other') : t(option.labelKey)])} register={register} error={fieldError(errors, 'ritualLanguages', t)} />
                <InputField label={t('fields.tradition')} required error={fieldError(errors, 'tradition', t)}><select {...register('tradition')}><option value="">—</option>{traditionOptions.map((value) => <option key={value} value={value}>{value === 'other' ? t('common.other') : t(`traditions.${value}`)}</option>)}</select></InputField>
                {tradition === 'other' && <InputField label={t('fields.traditionOther')} required error={fieldError(errors, 'traditionOther', t)}><input {...register('traditionOther')} /></InputField>}
                <div className="field-grid">
                  <InputField label={t('fields.guruName')} optional={t('optional')} error={fieldError(errors, 'guruName', t)}><input {...register('guruName')} /></InputField>
                  <InputField label={t('fields.experienceYears')} required error={fieldError(errors, 'experienceYears', t)}><input type="number" inputMode="numeric" min="0" max="80" {...register('experienceYears')} /></InputField>
                </div>
                <InputField label={t('fields.affiliation')} optional={t('optional')} error={fieldError(errors, 'affiliation', t)}><input {...register('affiliation')} /></InputField>
                <InputField label={t('fields.background')} required help={t('fields.backgroundHelp')} error={fieldError(errors, 'background', t)}><textarea rows={5} {...register('background')} /></InputField>
              </Step>
            )}

            {currentStep === 'services' && (
              <Step title={t('sections.servicesTitle')} description={t('sections.servicesDescription')}>
                <CheckboxGrid label={t('fields.pujas')} name="pujas" options={pujaOptions.map((value) => [value, t(`pujas.${value}`)])} register={register} error={fieldError(errors, 'pujas', t)} />
                <CheckboxGrid label={t('fields.samskaras')} name="samskaras" options={samskaraOptions.map((value) => [value, t(`samskaras.${value}`)])} register={register} error={fieldError(errors, 'samskaras', t)} />
                <InputField label={t('fields.otherServices')} optional={t('optional')} error={fieldError(errors, 'otherServices', t)}><textarea rows={3} {...register('otherServices')} /></InputField>
                <CheckboxGrid label={t('fields.serviceModes')} name="serviceModes" options={serviceModeOptions.map((value) => [value, t(`modes.${value}`)])} register={register} error={fieldError(errors, 'serviceModes', t)} />
                <RadioGroup label={t('fields.samagriCapability')} name="samagriCapability" options={[['all', t('options.samagriAll')], ['some', t('options.samagriSome')], ['none', t('options.samagriNone')]]} register={register} />
                <InputField label={t('fields.samagriNotes')} optional={t('optional')} error={fieldError(errors, 'samagriNotes', t)}><textarea rows={2} {...register('samagriNotes')} /></InputField>
                <div className="field-grid">
                  <InputField label={t('fields.dakshinaMin')} optional={t('optional')} error={fieldError(errors, 'dakshinaMin', t)}><input type="number" inputMode="numeric" min="0" {...register('dakshinaMin')} /></InputField>
                  <InputField label={t('fields.dakshinaMax')} optional={t('optional')} error={fieldError(errors, 'dakshinaMax', t)}><input type="number" inputMode="numeric" min="0" {...register('dakshinaMax')} /></InputField>
                </div>
                <InputField label={t('fields.chargeNotes')} optional={t('optional')} error={fieldError(errors, 'chargeNotes', t)}><textarea rows={2} {...register('chargeNotes')} /></InputField>
              </Step>
            )}

            {currentStep === 'trust' && (
              <Step title={t('sections.trustTitle')} description={t('sections.trustDescription')}>
                <p className="section-note">{t('fields.referencePermission')}</p>
                <div className="field-grid">
                  <InputField label={t('fields.referenceName')} optional={t('optional')} error={fieldError(errors, 'referenceName', t)}><input {...register('referenceName')} /></InputField>
                  <InputField label={t('fields.referenceRelationship')} optional={t('optional')} error={fieldError(errors, 'referenceRelationship', t)}><input {...register('referenceRelationship')} /></InputField>
                </div>
                <div className="field-grid">
                  <InputField label={t('fields.referencePhone')} optional={t('optional')} error={fieldError(errors, 'referencePhone', t)}><input type="tel" inputMode="tel" {...register('referencePhone')} /></InputField>
                  <InputField label={t('fields.referenceInstitution')} optional={t('optional')} error={fieldError(errors, 'referenceInstitution', t)}><input {...register('referenceInstitution')} /></InputField>
                </div>
                <InputField label={t('fields.referralCode')} optional={t('optional')} error={fieldError(errors, 'referralCode', t)}><input autoCapitalize="characters" {...register('referralCode')} /></InputField>
                <InputField label={t('fields.discoverySource')} optional={t('optional')} error={fieldError(errors, 'discoverySource', t)}><input {...register('discoverySource')} /></InputField>
              </Step>
            )}

            {currentStep === 'consent' && (
              <Step title={t('sections.consentTitle')} description={t('sections.consentDescription')}>
                <ConsentField label={t('fields.truthConsent')} name="truthConsent" register={register} error={fieldError(errors, 'truthConsent', t)} />
                <ConsentField label={t('fields.contactConsent')} name="contactConsent" register={register} error={fieldError(errors, 'contactConsent', t)} />
                <ConsentField label={t('fields.privacyConsent')} name="privacyConsent" register={register} error={fieldError(errors, 'privacyConsent', t)} />
                <Link className="section-link" href="/privacy/" target="_blank">{t('privacyLink')} <span aria-hidden="true">↗</span></Link>
                <ConsentField label={t('fields.publicProfilePermission')} name="publicProfilePermission" register={register} optional={t('optional')} error={fieldError(errors, 'publicProfilePermission', t)} />
              </Step>
            )}

            {submitError && <div className="form-error" role="alert">{submitError}</div>}
            {Object.keys(errors).length > 0 && currentStep === 'consent' && <div className="form-error" role="alert">{t('errors.generic')}</div>}

            <div className="form-actions">
              {stepIndex > 0 && <button type="button" className="button button-secondary" onClick={() => setStepIndex((current) => current - 1)}>{t('buttons.back')}</button>}
              {stepIndex < formSteps.length - 1 ? (
                <button type="button" className="button button-primary" onClick={continueToNextStep}>{t('buttons.continue')}</button>
              ) : (
                <button type="submit" className="button button-primary" disabled={isSubmitting}>{isSubmitting ? t('buttons.submitting') : t('buttons.submit')}</button>
              )}
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

function BrandMark() {
  return <Link href="/" className="brand"><span className="brand-symbol" aria-hidden="true">ॐ</span><span><strong>BrahminBooking</strong><small>Verified with care</small></span></Link>
}

function Step({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <div className="form-step"><div className="step-heading"><h2>{title}</h2><p>{description}</p></div>{children}</div>
}

function InputField({ label, required, optional, help, error, children }: { label: string; required?: boolean; optional?: string; help?: string; error?: string; children: React.ReactElement<{ 'aria-invalid'?: boolean; 'aria-describedby'?: string }> }) {
  const id = useId()
  const helpId = help ? `${id}-help` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined
  const control = cloneElement(children, { 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })
  return <label className="field"><span className="field-label">{label}{required && <b aria-hidden="true">*</b>}{optional && !required && <em>{optional}</em>}</span>{control}{help && <small id={helpId}>{help}</small>}{error && <span className="field-error" id={errorId} role="alert">{error}</span>}</label>
}

type Register = UseFormRegister<PurohitRegistrationInput>

function CheckboxGrid({ label, name, options, register, error }: { label: string; name: Path<PurohitRegistrationInput>; options: readonly (readonly [string, string])[]; register: Register; error?: string }) {
  return <fieldset className="choice-field"><legend>{label}<b aria-hidden="true">*</b></legend><div className="choice-grid">{options.map(([value, optionLabel]) => <label className="choice" key={value}><input type="checkbox" value={value} {...register(name)} /><span>{optionLabel}</span></label>)}</div>{error && <span className="field-error" role="alert">{error}</span>}</fieldset>
}

function RadioGroup({ label, name, options, register }: { label: string; name: Path<PurohitRegistrationInput>; options: readonly (readonly [string, string])[]; register: Register }) {
  return <fieldset className="choice-field"><legend>{label}<b aria-hidden="true">*</b></legend><div className="choice-grid compact">{options.map(([value, optionLabel]) => <label className="choice" key={value}><input type="radio" value={value} {...register(name)} /><span>{optionLabel}</span></label>)}</div></fieldset>
}

function ConsentField({ label, name, register, optional, error }: { label: string; name: 'truthConsent' | 'contactConsent' | 'privacyConsent' | 'publicProfilePermission'; register: Register; optional?: string; error?: string }) {
  return <div><label className="consent-choice"><input type="checkbox" {...register(name)} /><span>{label}{optional && <em>{optional}</em>}</span></label>{error && <span className="field-error" role="alert">{error}</span>}</div>
}

function Honeypot({ register }: { register: Register }) {
  return <div className="website-field" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" {...register('website')} /></label></div>
}

function fieldError(errors: FieldErrors<PurohitRegistrationInput>, field: keyof PurohitRegistrationInput, t: ReturnType<typeof useTranslations<'registration'>>) {
  const error = errors[field] as FieldError | undefined
  return error?.message ? translateError(t, error.message) : undefined
}

function translateError(t: ReturnType<typeof useTranslations<'registration'>>, key: string) {
  const knownKeys = ['required', 'invalidNumber', 'tooSmall', 'tooLarge', 'tooLong', 'invalidPhone', 'invalidEmail', 'invalidPostalCode', 'invalidAadhaar', 'selectOne', 'selectService', 'rangeOrder', 'backgroundShort', 'consentRequired', 'serviceUnavailable', 'submissionFailed', 'invalidReceipt']
  return t(knownKeys.includes(key) ? `errors.${key}` : 'errors.generic')
}
