import { z } from 'zod'

export const bookingRequestSchema = z.object({
  serviceSlug: z.string().trim().min(1, 'Choose a ceremony or service.'),
  serviceOther: z.string().trim().max(120).optional(),
  preferredDate: z.string().optional(),
  dateFlexible: z.boolean(),
  timeWindow: z.enum(['morning', 'afternoon', 'evening', 'flexible']),
  city: z.string().trim().min(2, 'Enter the city or town.').max(100),
  area: z.string().trim().min(2, 'Enter the locality or area.').max(160),
  serviceMode: z.enum(['home', 'temple', 'remote', 'unsure']),
  language: z.string().trim().min(1, 'Choose a preferred language.'),
  tradition: z.string().trim().max(120).optional(),
  samagriAssistance: z.enum(['all', 'some', 'none', 'unsure']),
  attendeeCount: z.string().trim().regex(/^$|^[0-9]{1,4}$/, 'Enter an approximate number.').optional(),
  fullName: z.string().trim().min(2, 'Enter your name.').max(120),
  phone: z.string().trim().regex(/^\+?[0-9\s()-]{8,18}$/, 'Enter a valid phone number.'),
  email: z.union([z.literal(''), z.string().email('Enter a valid email address.')]),
  whatsapp: z.boolean(),
  notes: z.string().trim().max(800).optional(),
  contactConsent: z.literal(true, { error: 'Consent is required so the team can coordinate your request.' }),
  website: z.string().max(0).optional(),
}).superRefine((values, context) => {
  if (values.serviceSlug === 'other' && !values.serviceOther) context.addIssue({ code: 'custom', path: ['serviceOther'], message: 'Describe the requested service.' })
  if (!values.preferredDate && !values.dateFlexible) context.addIssue({ code: 'custom', path: ['preferredDate'], message: 'Choose a date or mark it flexible.' })
})

// Only ceremony-planning preferences are persisted on the device. Contact
// details, notes, consent and the honeypot are intentionally excluded.
export const bookingDraftSchema = z.object({
  serviceSlug: z.string().max(80).optional(),
  serviceOther: z.string().max(120).optional(),
  preferredDate: z.string().max(10).optional(),
  dateFlexible: z.boolean().optional(),
  timeWindow: z.enum(['morning', 'afternoon', 'evening', 'flexible']).optional(),
  city: z.string().max(100).optional(),
  area: z.string().max(160).optional(),
  serviceMode: z.enum(['home', 'temple', 'remote', 'unsure']).optional(),
  language: z.string().max(40).optional(),
  tradition: z.string().max(120).optional(),
  samagriAssistance: z.enum(['all', 'some', 'none', 'unsure']).optional(),
  attendeeCount: z.string().max(4).optional(),
}).strict()

export type BookingRequestValues = z.infer<typeof bookingRequestSchema>
export type BookingDraftValues = z.infer<typeof bookingDraftSchema>
