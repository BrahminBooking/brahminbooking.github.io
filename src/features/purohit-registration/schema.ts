import { z } from 'zod'

const optionalNumber = (minimum: number, maximum: number) =>
  z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
    z.number('invalidNumber').int('invalidNumber').min(minimum, 'tooSmall').max(maximum, 'tooLarge').optional(),
  )

const requiredNumber = (minimum: number, maximum: number) =>
  z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? Number.NaN : Number(value)),
    z.number('required').int('invalidNumber').min(minimum, 'tooSmall').max(maximum, 'tooLarge'),
  )

export const purohitRegistrationSchema = z
  .object({
    fullName: z.string().trim().min(2, 'required').max(120, 'tooLong'),
    displayName: z.string().trim().max(120, 'tooLong').optional(),
    phone: z.string().trim().regex(/^\+?[0-9][0-9\s-]{8,16}$/, 'invalidPhone'),
    whatsapp: z.string().trim().regex(/^$|^\+?[0-9][0-9\s-]{8,16}$/, 'invalidPhone').optional(),
    email: z.string().trim().email('invalidEmail').or(z.literal('')).optional(),
    preferredContact: z.enum(['phone', 'whatsapp']),
    preferredTime: z.string().trim().max(100, 'tooLong').optional(),
    birthYear: optionalNumber(1920, new Date().getFullYear() - 18),
    aadhaarAvailable: z.enum(['yes', 'no', 'prefer-not']),
    aadhaarLastFour: z.string().trim().regex(/^$|^[0-9]{4}$/, 'invalidAadhaar').optional(),

    city: z.string().trim().min(2, 'required').max(100, 'tooLong'),
    district: z.string().trim().min(2, 'required').max(100, 'tooLong'),
    state: z.string().trim().min(2, 'required').max(100, 'tooLong'),
    country: z.string().trim().min(2, 'required').max(100, 'tooLong'),
    postalCode: z.string().trim().regex(/^[0-9A-Za-z -]{4,10}$/, 'invalidPostalCode'),
    serviceAreas: z.string().trim().min(2, 'required').max(500, 'tooLong'),
    travelRadiusKm: requiredNumber(0, 1000),

    spokenLanguages: z.array(z.string()).min(1, 'selectOne'),
    ritualLanguages: z.array(z.string()).min(1, 'selectOne'),
    tradition: z.string().trim().min(1, 'required'),
    traditionOther: z.string().trim().max(100, 'tooLong').optional(),
    guruName: z.string().trim().max(160, 'tooLong').optional(),
    affiliation: z.string().trim().max(240, 'tooLong').optional(),
    experienceYears: requiredNumber(0, 80),
    background: z.string().trim().min(20, 'backgroundShort').max(2000, 'tooLong'),

    pujas: z.array(z.string()),
    samskaras: z.array(z.string()),
    otherServices: z.string().trim().max(500, 'tooLong').optional(),
    serviceModes: z.array(z.string()).min(1, 'selectOne'),
    samagriCapability: z.enum(['all', 'some', 'none']),
    samagriNotes: z.string().trim().max(500, 'tooLong').optional(),
    dakshinaMin: optionalNumber(0, 10_000_000),
    dakshinaMax: optionalNumber(0, 10_000_000),
    chargeNotes: z.string().trim().max(500, 'tooLong').optional(),

    referenceName: z.string().trim().max(120, 'tooLong').optional(),
    referenceRelationship: z.string().trim().max(120, 'tooLong').optional(),
    referencePhone: z.string().trim().regex(/^$|^\+?[0-9][0-9\s-]{8,16}$/, 'invalidPhone').optional(),
    referenceInstitution: z.string().trim().max(160, 'tooLong').optional(),
    referralCode: z.string().trim().max(40, 'tooLong').optional(),
    discoverySource: z.string().trim().max(160, 'tooLong').optional(),

    truthConsent: z.boolean().refine(Boolean, 'consentRequired'),
    contactConsent: z.boolean().refine(Boolean, 'consentRequired'),
    privacyConsent: z.boolean().refine(Boolean, 'consentRequired'),
    publicProfilePermission: z.boolean(),
    website: z.string().max(0).optional(),
  })
  .superRefine((data, context) => {
    if (data.aadhaarAvailable !== 'yes' && data.aadhaarLastFour) {
      context.addIssue({ code: 'custom', path: ['aadhaarLastFour'], message: 'invalidAadhaar' })
    }
    if (data.tradition === 'other' && !data.traditionOther) {
      context.addIssue({ code: 'custom', path: ['traditionOther'], message: 'required' })
    }
    if (data.pujas.length === 0 && data.samskaras.length === 0 && !data.otherServices) {
      context.addIssue({ code: 'custom', path: ['pujas'], message: 'selectService' })
    }
    if (data.dakshinaMin !== undefined && data.dakshinaMax !== undefined && data.dakshinaMax < data.dakshinaMin) {
      context.addIssue({ code: 'custom', path: ['dakshinaMax'], message: 'rangeOrder' })
    }
    if (data.referenceName && !data.referencePhone) {
      context.addIssue({ code: 'custom', path: ['referencePhone'], message: 'required' })
    }
    if (data.referencePhone && !data.referenceName) {
      context.addIssue({ code: 'custom', path: ['referenceName'], message: 'required' })
    }
  })

export type PurohitRegistrationValues = z.infer<typeof purohitRegistrationSchema>
export type PurohitRegistrationInput = z.input<typeof purohitRegistrationSchema>

export const defaultRegistrationValues: PurohitRegistrationInput = {
  fullName: '',
  displayName: '',
  phone: '',
  whatsapp: '',
  email: '',
  preferredContact: 'whatsapp',
  preferredTime: '',
  birthYear: undefined,
  aadhaarAvailable: 'prefer-not',
  aadhaarLastFour: '',
  city: '',
  district: '',
  state: '',
  country: 'India',
  postalCode: '',
  serviceAreas: '',
  travelRadiusKm: 25,
  spokenLanguages: [],
  ritualLanguages: [],
  tradition: '',
  traditionOther: '',
  guruName: '',
  affiliation: '',
  experienceYears: 0,
  background: '',
  pujas: [],
  samskaras: [],
  otherServices: '',
  serviceModes: [],
  samagriCapability: 'some',
  samagriNotes: '',
  dakshinaMin: undefined,
  dakshinaMax: undefined,
  chargeNotes: '',
  referenceName: '',
  referenceRelationship: '',
  referencePhone: '',
  referenceInstitution: '',
  referralCode: '',
  discoverySource: '',
  truthConsent: false,
  contactConsent: false,
  privacyConsent: false,
  publicProfilePermission: false,
  website: '',
}
