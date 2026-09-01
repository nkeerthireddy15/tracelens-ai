import {
  REDACTION_LABELS,
  SENSITIVE_KEY_RULES
} from './redaction.constants.js'

function isAlreadyRedacted(value) {
  return (
    typeof value === 'string' &&
    /^\[REDACTED_[A-Z_]+\]$/.test(value)
  )
}

function findSensitiveKeyRule(key) {
  return SENSITIVE_KEY_RULES.find((rule) =>
    rule.pattern.test(key)
  )
}

function redactObjectValue(value, counts) {
  if (Array.isArray(value)) {
    return value.map((item) => redactObjectValue(item, counts))
  }

  if (
    value === null ||
    typeof value !== 'object'
  ) {
    return value
  }

  const redactedObject = {}

  for (const [key, nestedValue] of Object.entries(value)) {
    const rule = findSensitiveKeyRule(key)

    if (rule && !isAlreadyRedacted(nestedValue)) {
      redactedObject[key] = REDACTION_LABELS[rule.type]
      counts[rule.type] = (counts[rule.type] || 0) + 1
      continue
    }

    redactedObject[key] = redactObjectValue(
      nestedValue,
      counts
    )
  }

  return redactedObject
}

export function redactStructuredData(log) {
  try {
    const parsedLog = JSON.parse(log)

    if (
      parsedLog === null ||
      typeof parsedLog !== 'object'
    ) {
      return {
        isStructured: false,
        redactedLog: log,
        counts: {}
      }
    }

    const counts = {}
    const redactedValue = redactObjectValue(parsedLog, counts)

    return {
      isStructured: true,
      redactedLog: JSON.stringify(redactedValue, null, 2),
      counts
    }
  } catch {
    return {
      isStructured: false,
      redactedLog: log,
      counts: {}
    }
  }
}

function createTextDetector(type, pattern, replacement) {
  return {
    type,

    redact(text) {
      let count = 0

      const redactedText = text.replace(
        pattern,
        (...argumentsList) => {
          count += 1

          if (typeof replacement === 'function') {
            return replacement(...argumentsList)
          }

          return replacement
        }
      )

      return {
        redactedText,
        count
      }
    }
  }
}

const databaseCredentialsDetector = createTextDetector(
  'databaseCredentials',
  /\b(mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis):\/\/([^:\s/@]+):([^@\s/]+)@/gi,
  (match, protocol) =>
    `${protocol}://${REDACTION_LABELS.username}:${REDACTION_LABELS.password}@`
)

const bearerTokenDetector = createTextDetector(
  'bearerToken',
  /(\b(?:authorization\s*:\s*)?bearer\s+)(?!\[REDACTED_)([A-Za-z0-9._~+/=-]+)/gi,
  (match, prefix) =>
    `${prefix}${REDACTION_LABELS.token}`
)

const jwtDetector = createTextDetector(
  'jwt',
  /\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/g,
  REDACTION_LABELS.jwt
)

const passwordDetector = createTextDetector(
  'password',
  /(\b(?:password|passwd|pwd)\b\s*[:=]\s*)(["']?)(?!\[REDACTED_)([^\s,;}"']+)\2/gi,
  (match, prefix, quote) =>
    `${prefix}${quote}${REDACTION_LABELS.password}${quote}`
)

const apiKeyDetector = createTextDetector(
  'apiKey',
  /(\b(?:api[_-]?key|apikey)\b\s*[:=]\s*)(["']?)(?!\[REDACTED_)([^\s,;}"']+)\2/gi,
  (match, prefix, quote) =>
    `${prefix}${quote}${REDACTION_LABELS.apiKey}${quote}`
)

const authorizationDetector = createTextDetector(
  'authorization',
  /(\bauthorization\s*:\s*)(?!bearer\b)(?:basic\s+)?(?!\[REDACTED_)([^\s,;]+)/gi,
  (match, prefix) =>
    `${prefix}${REDACTION_LABELS.authorization}`
)

const secretDetector = createTextDetector(
  'secret',
  /(\b(?:client[_-]?secret|api[_-]?secret)\b\s*[:=]\s*)(["']?)(?!\[REDACTED_)([^\s,;}"']+)\2/gi,
  (match, prefix, quote) =>
    `${prefix}${quote}${REDACTION_LABELS.secret}${quote}`
)

const emailDetector = createTextDetector(
  'email',
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  REDACTION_LABELS.email
)

export const textDetectors = [
  databaseCredentialsDetector,
  bearerTokenDetector,
  jwtDetector,
  passwordDetector,
  apiKeyDetector,
  authorizationDetector,
  secretDetector,
  emailDetector
]