export const languageOptions = [
  { value: 'hindi', labelKey: 'languages.hindi' },
  { value: 'sanskrit', labelKey: 'languages.sanskrit' },
  { value: 'english', labelKey: 'languages.english' },
  { value: 'gujarati', labelKey: 'languages.gujarati' },
  { value: 'kannada', labelKey: 'languages.kannada' },
  { value: 'marathi', labelKey: 'languages.marathi' },
  { value: 'telugu', labelKey: 'languages.telugu' },
  { value: 'tamil', labelKey: 'languages.tamil' },
  { value: 'bengali', labelKey: 'languages.bengali' },
  { value: 'other', labelKey: 'common.other' },
] as const

export const traditionOptions = [
  'smarta',
  'vaishnava',
  'shaiva',
  'shakta',
  'swaminarayan',
  'madhva',
  'ramanandi',
  'other',
] as const

export const pujaOptions = [
  'ganesh-puja',
  'satyanarayan-puja',
  'griha-pravesh',
  'rudrabhishek',
  'lakshmi-puja',
  'navagraha-puja',
  'havan-homa',
  'vastu-puja',
] as const

export const samskaraOptions = [
  'vivaha',
  'upanayana',
  'namakarana',
  'annaprashana',
  'mundan',
  'antyeshti',
  'shraddha',
] as const

export const serviceModeOptions = ['home', 'temple', 'remote'] as const

export const formSteps = [
  'identity',
  'location',
  'practice',
  'services',
  'trust',
  'consent',
] as const

export type FormStep = (typeof formSteps)[number]
