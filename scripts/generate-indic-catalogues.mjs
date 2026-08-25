#!/usr/bin/env node

/**
 * Offline catalogue drafting with AI4Bharat IndicTrans2 ONNX.
 *
 * This script is intentionally not part of the website build. It creates
 * repository-owned draft catalogues that must pass automated checks and copy
 * review before a locale is enabled. Model execution is local and no product
 * or applicant data is sent to a translation service.
 *
 * The ONNX loading/generation flow is adapted from Hari Sekhon's public
 * IndicTrans2 browser demo:
 * https://github.com/Hari31416/indictrans2-onnx-export
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const repoRoot = path.resolve(import.meta.dirname, '..')
const nodeModules = process.env.INDIC_TRANSLATION_NODE_MODULES
const modelDir = process.env.INDIC_TRANSLATION_MODEL_DIR

if (!nodeModules || !modelDir) {
  throw new Error('Set INDIC_TRANSLATION_NODE_MODULES and INDIC_TRANSLATION_MODEL_DIR before running this drafting tool.')
}

const requireFromTool = createRequire(path.join(nodeModules, 'package.json'))
const ort = requireFromTool('onnxruntime-node')
const transformersUrl = pathToFileURL(path.join(nodeModules, '@huggingface/transformers/dist/transformers.mjs')).href
const { AutoTokenizer, env } = await import(transformersUrl)

env.allowLocalModels = false
env.allowRemoteModels = true

const locales = {
  as: { model: 'asm_Beng', label: 'অসমীয়া' },
  bn: { model: 'ben_Beng', label: 'বাংলা' },
  brx: { model: 'brx_Deva', label: 'बड़ो' },
  doi: { model: 'doi_Deva', label: 'डोगरी' },
  ks: { model: 'kas_Arab', label: 'کٲشُر' },
  kok: { model: 'kok_Deva', label: 'कोंकणी' },
  mai: { model: 'mai_Deva', label: 'मैथिली' },
  ml: { model: 'mal_Mlym', label: 'മലയാളം' },
  mni: { model: 'mni_Beng', label: 'মৈতৈলোন্' },
  mr: { model: 'mar_Deva', label: 'मराठी' },
  ne: { model: 'npi_Deva', label: 'नेपाली' },
  or: { model: 'ory_Orya', label: 'ଓଡ଼ିଆ' },
  pa: { model: 'pan_Guru', label: 'ਪੰਜਾਬੀ' },
  sa: { model: 'san_Deva', label: 'संस्कृतम्' },
  sat: { model: 'sat_Olck', label: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  sd: { model: 'snd_Arab', label: 'سنڌي' },
  ta: { model: 'tam_Taml', label: 'தமிழ்' },
  te: { model: 'tel_Telu', label: 'తెలుగు' },
}

const args = new Set(process.argv.slice(2))
const requested = process.argv.find((arg) => arg.startsWith('--locales='))?.split('=')[1]?.split(',')
const localeCodes = requested ?? Object.keys(locales)
const force = args.has('--force')
const smoke = args.has('--smoke')
const repair = args.has('--repair')

for (const code of localeCodes) {
  if (!(code in locales)) throw new Error(`Unknown locale: ${code}`)
}

const tokenizerMeta = JSON.parse(await fs.readFile(path.join(modelDir, 'tokenizer_meta.json'), 'utf8'))
const generationConfig = JSON.parse(await fs.readFile(path.join(modelDir, 'generation_config.json'), 'utf8'))

async function loadTokenizer(filename, name) {
  const tokenizerData = JSON.parse(await fs.readFile(path.join(modelDir, filename), 'utf8'))
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (input, options) => {
    const url = input.toString()
    if (url.endsWith('/tokenizer.json')) return new Response(JSON.stringify(tokenizerData), { headers: { 'content-type': 'application/json' } })
    if (url.endsWith('/tokenizer_config.json')) return new Response(JSON.stringify({ tokenizer_class: 'PreTrainedTokenizerFast' }), { headers: { 'content-type': 'application/json' } })
    return originalFetch(input, options)
  }
  try {
    return await AutoTokenizer.from_pretrained(name)
  } finally {
    globalThis.fetch = originalFetch
  }
}

process.stdout.write('Loading local IndicTrans2 tokenizers and ONNX sessions…\n')
const [srcTokenizer, tgtTokenizer] = await Promise.all([
  loadTokenizer('tokenizer_src.json', 'brahminbooking-indic-src'),
  loadTokenizer('tokenizer_tgt.json', 'brahminbooking-indic-tgt'),
])

const [enc, dec, decPast] = await Promise.all([
  ort.InferenceSession.create(path.join(modelDir, 'encoder_model.onnx'), { executionProviders: ['cpu'] }),
  ort.InferenceSession.create(path.join(modelDir, 'decoder_model.onnx'), { executionProviders: ['cpu'] }),
  ort.InferenceSession.create(path.join(modelDir, 'decoder_with_past_model.onnx'), { executionProviders: ['cpu'] }),
])
const numLayers = (dec.outputNames.length - 1) / 4

function getPastFeed(outputs) {
  const feed = {}
  for (let index = 0; index < numLayers; index += 1) {
    feed[`past_key_values.${index}.decoder.key`] = outputs[`present.${index}.decoder.key`]
    feed[`past_key_values.${index}.decoder.value`] = outputs[`present.${index}.decoder.value`]
    feed[`past_key_values.${index}.encoder.key`] = outputs[`present.${index}.encoder.key`]
    feed[`past_key_values.${index}.encoder.value`] = outputs[`present.${index}.encoder.value`]
  }
  return feed
}

const scriptRanges = {
  pa: 0x0a00, gu: 0x0a80, or: 0x0b00, ta: 0x0b80, te: 0x0c00,
  kn: 0x0c80, ml: 0x0d00, hi: 0x0900, mr: 0x0900, kK: 0x0900,
  sa: 0x0900, ne: 0x0900, sd: 0x0900, bn: 0x0980, as: 0x0980,
}

const floresToIso = {
  asm_Beng: 'as', ben_Beng: 'bn', brx_Deva: 'hi', doi_Deva: 'hi', guj_Gujr: 'gu',
  hin_Deva: 'hi', kan_Knda: 'kn', kas_Arab: 'ur', kok_Deva: 'hi', mai_Deva: 'hi',
  mal_Mlym: 'ml', mar_Deva: 'mr', mni_Beng: 'bn', npi_Deva: 'ne', ory_Orya: 'or',
  pan_Guru: 'pa', san_Deva: 'hi', sat_Olck: 'or', snd_Arab: 'ur', tam_Taml: 'ta',
  tel_Telu: 'te', urd_Arab: 'ur',
}

function correctTamilOffset(offset) {
  if (offset >= 0x15 && offset <= 0x28 && offset !== 0x1c) {
    const remainder = (offset - 0x15) % 5
    if (remainder !== 0 && remainder !== 4) offset = 0x15 + 5 * Math.floor((offset - 0x15) / 5)
  }
  if ([0x2b, 0x2c, 0x2d].includes(offset)) offset = 0x2a
  if (offset === 0x36) offset = 0x37
  return offset
}

function transliterateFromDevanagari(text, targetLanguage) {
  const targetIso = floresToIso[targetLanguage]
  const sourceStart = scriptRanges.hi
  const targetStart = scriptRanges[targetIso]
  if (targetStart === undefined) return text

  return [...text].map((character) => {
    let offset = character.codePointAt(0) - sourceStart
    if (offset < 0 || offset > 0x6f || character === '।' || character === '॥') return character
    if (targetIso === 'ta') offset = correctTamilOffset(offset)
    return String.fromCodePoint(targetStart + offset)
  }).join('')
}

async function translateRaw(text, targetLanguage) {
  const sourceLanguage = 'eng_Latn'
  const sourceTag = await srcTokenizer(sourceLanguage, { add_special_tokens: false })
  const targetTag = await srcTokenizer(targetLanguage, { add_special_tokens: false })
  const textResult = await srcTokenizer(text.startsWith(' ') ? text : ` ${text}`)
  const sourceId = Number(sourceTag.input_ids.data[0])
  const targetId = Number(targetTag.input_ids.data[0])
  const textIds = Array.from(textResult.input_ids.data, Number)
  const safeIds = [sourceId, targetId, ...textIds].map((id) => id < tokenizerMeta.src_dict_size ? id : Number(tokenizerMeta.unk_id))
  const mask = [1, 1, ...Array.from(textResult.attention_mask.data, Number)]
  const inputIds = new ort.Tensor('int64', BigInt64Array.from(safeIds, BigInt), [1, safeIds.length])
  const attentionMask = new ort.Tensor('int64', BigInt64Array.from(mask, BigInt), [1, mask.length])
  const encoded = await enc.run({ input_ids: inputIds, attention_mask: attentionMask })

  const startId = BigInt(generationConfig.decoder_start_token_id ?? 2)
  const eosId = BigInt(generationConfig.eos_token_id ?? 2)
  let decoderInput = new ort.Tensor('int64', BigInt64Array.from([startId]), [1, 1])
  const outputIds = [Number(startId)]
  let previous = null

  for (let step = 0; step < 160; step += 1) {
    const output = step === 0
      ? await dec.run({ input_ids: decoderInput, encoder_hidden_states: encoded.last_hidden_state, encoder_attention_mask: attentionMask })
      : await decPast.run({ input_ids: decoderInput, encoder_attention_mask: attentionMask, ...getPastFeed(previous) })
    previous = output
    const logits = output.logits
    const vocabulary = logits.dims[2]
    const offset = (logits.dims[1] - 1) * vocabulary
    let nextId = 0
    let maximum = -Infinity
    for (let index = 0; index < vocabulary; index += 1) {
      const value = logits.data[offset + index]
      if (value > maximum) { maximum = value; nextId = index }
    }
    outputIds.push(nextId)
    if (BigInt(nextId) === eosId) break
    decoderInput = new ort.Tensor('int64', BigInt64Array.from([BigInt(nextId)]), [1, 1])
  }

  const safeOutput = outputIds.map((id) => id < tokenizerMeta.tgt_dict_size ? id : Number(tokenizerMeta.unk_id))
  const decoded = await tgtTokenizer.decode(safeOutput, { skip_special_tokens: true })
  return transliterateFromDevanagari(decoded, targetLanguage).trim()
}

const exactPreservePattern = /(BrahminBooking|Aadhaar|WhatsApp|Supabase|BB-DEMO-|\{[^}]+\}|https?:\/\/\S+|\b[A-Z]{2,}(?:-[A-Z]+)*\b)/g
const cache = new Map()

function addTranslationContext(text) {
  const reviewFriendlySource = {
    'Maximum amount must be greater than or equal to minimum.': 'Maximum amount cannot be less than minimum amount.',
    'Your application is private. We never ask for your full Aadhaar number or bank details here.': 'Your application is private. Do not enter bank details here. For Aadhaar, enter only the last four digits; never enter all twelve digits.',
    'Optional. Enter only the last four digits—never the full Aadhaar number.': 'Optional. For Aadhaar, enter only the last four digits; never enter all twelve digits.',
    'How did you hear about BrahminBooking?': 'How did you hear about this platform?',
    'I permit BrahminBooking to contact me and any reference I have provided for verification.': "I allow this platform's verification team to contact me and any reference I provided.",
    'After approval, BrahminBooking may prepare and publish my public profile. I can withdraw this permission later.': 'After approval, I allow this platform to prepare and publish my public profile. I can withdraw this permission later.',
    'BrahminBooking collects registration information to evaluate and onboard Purohits, Brahmins, temples and coordinators. Applications are not public.': 'This platform collects registration information to evaluate and onboard Purohits, Brahmins, temples and coordinators. Applications are private.',
    'We collect the identity, contact, location, tradition, experience, services, optional reference and consent information entered in the form. We may collect optional Aadhaar availability and the last four digits only. We do not collect the full Aadhaar number, bank details or payment details in this form.': 'We collect the identity, contact, location, tradition, experience, services, optional reference and consent information entered in the form. For Aadhaar, we record only whether it is available and optionally its last four digits. Never enter all twelve Aadhaar digits, bank details or payment details in this form.',
    'Access is limited to authorized verification staff and service providers needed to operate Supabase. To correct or delete an application or withdraw public-profile permission, reply to the verification team\'s message or use the coordinator channel through which you were referred. Retention periods will be finalized before the external pilot.': 'Access is limited to authorized verification staff and service providers needed to operate the platform database. To correct or delete an application or withdraw public-profile permission, reply to the verification team or contact your coordinator. Retention periods will be finalized before the external pilot.',
    'BrahminBooking facilitates requests. Ritual guidance and final arrangements are confirmed directly with the assigned Purohit.': 'This platform facilitates requests. Confirm ritual guidance and final arrangements directly with the assigned Purohit.',
    'How BrahminBooking helps': 'How this platform helps',
    'Tell us the essentials. A person from the BrahminBooking team will review the request and coordinate availability. Nothing is confirmed or charged today.': 'Tell us the essentials. A person from our team will review the request and coordinate availability. Nothing is confirmed or charged today.',
    'I consent to BrahminBooking contacting me to coordinate this request and handling these details under the privacy notice. I understand this is a request, not a confirmed booking.': 'I consent to the platform team contacting me to coordinate this request and handling these details under the privacy notice. I understand this is a request, not a confirmed booking.',
  }
  const contextualText = reviewFriendlySource[text] ?? text
  return contextualText
    .replace(/\bBook a Purohit\b/g, 'Reserve a Purohit')
    .replace(/\bBook a Puja\b/g, 'Reserve a Puja')
    .replace(/^Book$/g, 'Reserve')
}

async function translateText(text, targetLanguage) {
  if (!/[A-Za-z]/.test(text)) return text
  const cacheKey = `${targetLanguage}\u0000${text}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  const contextualText = addTranslationContext(text)
  const protectedTerms = []
  const protectedText = contextualText.replace(exactPreservePattern, (term) => {
    const index = protectedTerms.push(term) - 1
    return ` [[${index}]] `
  })
  let result = await translateRaw(protectedText, targetLanguage)
  let canRestore = true
  for (let index = 0; index < protectedTerms.length; index += 1) {
    const token = new RegExp(`\\[\\[\\s*${index}\\s*\\]\\]`)
    if (!token.test(result)) { canRestore = false; break }
    result = result.replace(token, protectedTerms[index])
  }

  if (!canRestore) {
    const pieces = contextualText.split(exactPreservePattern)
    const translatedPieces = []
    for (const piece of pieces) {
      if (!piece || exactPreservePattern.test(piece) || !/[A-Za-z]/.test(piece)) {
        exactPreservePattern.lastIndex = 0
        translatedPieces.push(piece)
        continue
      }
      exactPreservePattern.lastIndex = 0
      translatedPieces.push(await translateRaw(addTranslationContext(piece.trim()), targetLanguage))
    }
    result = translatedPieces.join(' ')
  }

  result = result.replace(/\s+([.,;:!?])/g, '$1').replace(/\s{2,}/g, ' ').trim()
  cache.set(cacheKey, result)
  return result
}

async function translateValue(value, targetLanguage, progress) {
  if (typeof value === 'string') {
    progress.done += 1
    const output = await translateText(value, targetLanguage)
    if (progress.done % 20 === 0) process.stdout.write(`  ${progress.done}/${progress.total}\n`)
    return output
  }
  if (Array.isArray(value)) return Promise.all(value.map((item) => translateValue(item, targetLanguage, progress)))
  if (value && typeof value === 'object') {
    const output = {}
    for (const [key, child] of Object.entries(value)) output[key] = await translateValue(child, targetLanguage, progress)
    return output
  }
  return value
}

function countStrings(value) {
  if (typeof value === 'string') return 1
  if (Array.isArray(value)) return value.reduce((total, item) => total + countStrings(item), 0)
  if (value && typeof value === 'object') return Object.values(value).reduce((total, item) => total + countStrings(item), 0)
  return 0
}

function placeholders(value) {
  return [...String(value).matchAll(/\{[^}]+\}/g)].map((match) => match[0]).sort()
}

async function repairValue(source, translated, targetLanguage, progress) {
  if (typeof source === 'string') {
    const needsRepair = /BrahminBooking|Aadhaar|WhatsApp|Supabase|BB-DEMO-|\bBook(?: a (?:Purohit|Puja))?\b/.test(source)
      || JSON.stringify(placeholders(source)) !== JSON.stringify(placeholders(translated))
    if (!needsRepair) return translated
    progress.done += 1
    return translateText(source, targetLanguage)
  }
  if (Array.isArray(source)) {
    return Promise.all(source.map((item, index) => repairValue(item, translated[index], targetLanguage, progress)))
  }
  if (source && typeof source === 'object') {
    const output = { ...translated }
    for (const [key, child] of Object.entries(source)) output[key] = await repairValue(child, translated[key], targetLanguage, progress)
    return output
  }
  return translated
}

if (smoke) {
  for (const code of localeCodes) {
    const translated = await translateText(process.env.INDIC_SMOKE_TEXT ?? 'Book a trusted Purohit for your family.', locales[code].model)
    process.stdout.write(`${code}\t${translated}\n`)
  }
  process.exit(0)
}

const sources = [
  { source: path.join(repoRoot, 'src/messages/en.json'), target: (code) => path.join(repoRoot, `src/messages/${code}.json`) },
  { source: path.join(repoRoot, 'src/messages/site/en.json'), target: (code) => path.join(repoRoot, `src/messages/site/${code}.json`) },
  { source: path.join(repoRoot, 'src/messages/content-en.json'), target: (code) => path.join(repoRoot, `src/messages/content/${code}.json`) },
]

for (const code of localeCodes) {
  process.stdout.write(`Drafting ${locales[code].label} (${code})…\n`)
  for (const catalogue of sources) {
    const targetPath = catalogue.target(code)
    await fs.mkdir(path.dirname(targetPath), { recursive: true })
    if (repair) {
      const source = JSON.parse(await fs.readFile(catalogue.source, 'utf8'))
      const translated = JSON.parse(await fs.readFile(targetPath, 'utf8'))
      const progress = { done: 0 }
      const repaired = await repairValue(source, translated, locales[code].model, progress)
      await fs.writeFile(targetPath, `${JSON.stringify(repaired, null, 2)}\n`)
      process.stdout.write(`  repaired ${path.relative(repoRoot, targetPath)} (${progress.done} messages)\n`)
      continue
    }
    if (!force) {
      try { await fs.access(targetPath); process.stdout.write(`  keeping existing ${path.relative(repoRoot, targetPath)}\n`); continue } catch { /* generate */ }
    }
    const source = JSON.parse(await fs.readFile(catalogue.source, 'utf8'))
    const progress = { done: 0, total: countStrings(source) }
    const translated = await translateValue(source, locales[code].model, progress)
    await fs.writeFile(targetPath, `${JSON.stringify(translated, null, 2)}\n`)
    process.stdout.write(`  wrote ${path.relative(repoRoot, targetPath)} (${progress.total} messages)\n`)
  }
}
