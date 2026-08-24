import { describe, expect, it } from 'vitest'
import { purohitRegistrationSchema } from './schema'

const validRegistration = {
  fullName: 'Acharya Ramesh Sharma',
  displayName: 'Acharya Ramesh',
  phone: '+91 98765 43210',
  whatsapp: '',
  email: '',
  preferredContact: 'phone' as const,
  preferredTime: '',
  birthYear: 1980,
  aadhaarAvailable: 'yes' as const,
  aadhaarLastFour: '1234',
  city: 'Ahmedabad',
  district: 'Ahmedabad',
  state: 'Gujarat',
  country: 'India',
  postalCode: '380001',
  serviceAreas: 'Ahmedabad, Gandhinagar',
  travelRadiusKm: 50,
  spokenLanguages: ['hindi', 'gujarati'],
  ritualLanguages: ['hindi', 'sanskrit'],
  tradition: 'smarta',
  traditionOther: '',
  guruName: '',
  affiliation: '',
  experienceYears: 20,
  background: 'Traditional study under my guru and twenty years of puja service.',
  pujas: ['ganesh-puja'],
  samskaras: [],
  otherServices: '',
  serviceModes: ['home', 'temple'],
  samagriCapability: 'all' as const,
  samagriNotes: '',
  dakshinaMin: 1100,
  dakshinaMax: 5100,
  chargeNotes: '',
  referenceName: '',
  referenceRelationship: '',
  referencePhone: '',
  referenceInstitution: '',
  referralCode: '',
  discoverySource: '',
  truthConsent: true,
  contactConsent: true,
  privacyConsent: true,
  publicProfilePermission: false,
  website: '',
}

describe('purohit registration validation', () => {
  it('accepts a complete application without a reference', () => {
    expect(purohitRegistrationSchema.safeParse(validRegistration).success).toBe(true)
  })

  it('never accepts a full Aadhaar number', () => {
    const result = purohitRegistrationSchema.safeParse({ ...validRegistration, aadhaarLastFour: '123456789012' })
    expect(result.success).toBe(false)
  })

  it('does not retain Aadhaar digits when availability is declined', () => {
    const result = purohitRegistrationSchema.safeParse({ ...validRegistration, aadhaarAvailable: 'no', aadhaarLastFour: '1234' })
    expect(result.success).toBe(false)
  })

  it('requires at least one described service', () => {
    const result = purohitRegistrationSchema.safeParse({ ...validRegistration, pujas: [], samskaras: [], otherServices: '' })
    expect(result.success).toBe(false)
  })

  it('requires reference name and phone to be supplied together', () => {
    const result = purohitRegistrationSchema.safeParse({ ...validRegistration, referenceName: 'Pandit Mohan', referencePhone: '' })
    expect(result.success).toBe(false)
  })
})
