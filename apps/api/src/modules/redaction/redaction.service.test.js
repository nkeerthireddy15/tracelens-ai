import test from 'node:test'
import assert from 'node:assert/strict'
import { redactLog } from './redaction.service.js'

test('redacts supported secrets from unstructured logs', () => {
  const jwt =
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

  const rawLog = `
User john@example.com failed authentication
password=SuperSecret123
api_key=gemini-key-123
Authorization: Bearer production-token-456
Session token: ${jwt}
MongoDB: mongodb+srv://admin:databasePassword@cluster.mongodb.net/app
Error: ECONNREFUSED 127.0.0.1:27017
`

  const result = redactLog(rawLog)

  assert.equal(
    result.redactedLog.includes('john@example.com'),
    false
  )

  assert.equal(
    result.redactedLog.includes('SuperSecret123'),
    false
  )

  assert.equal(
    result.redactedLog.includes('gemini-key-123'),
    false
  )

  assert.equal(
    result.redactedLog.includes('production-token-456'),
    false
  )

  assert.equal(result.redactedLog.includes(jwt), false)

  assert.equal(
    result.redactedLog.includes('databasePassword'),
    false
  )

  assert.match(
    result.redactedLog,
    /\[REDACTED_EMAIL\]/
  )

  assert.match(
    result.redactedLog,
    /\[REDACTED_PASSWORD\]/
  )

  assert.match(
    result.redactedLog,
    /\[REDACTED_API_KEY\]/
  )

  assert.match(
    result.redactedLog,
    /\[REDACTED_TOKEN\]/
  )

  assert.match(
    result.redactedLog,
    /\[REDACTED_JWT\]/
  )

  assert.match(
    result.redactedLog,
    /mongodb\+srv:\/\/\[REDACTED_USERNAME\]:\[REDACTED_PASSWORD\]@/
  )

  assert.deepEqual(result.summary, {
    totalRedactions: 6,
    types: {
      databaseCredentials: 1,
      bearerToken: 1,
      jwt: 1,
      password: 1,
      apiKey: 1,
      email: 1
    }
  })
})

test('redacts sensitive keys from structured JSON', () => {
  const rawLog = JSON.stringify({
    user: {
      email: 'john@example.com',
      password: 'SuperSecret123'
    },
    apiKey: 'gemini-key-123',
    status: 500
  })

  const result = redactLog(rawLog)
  const parsedResult = JSON.parse(result.redactedLog)

  assert.equal(
    parsedResult.user.email,
    '[REDACTED_EMAIL]'
  )

  assert.equal(
    parsedResult.user.password,
    '[REDACTED_PASSWORD]'
  )

  assert.equal(
    parsedResult.apiKey,
    '[REDACTED_API_KEY]'
  )

  assert.equal(parsedResult.status, 500)

  assert.equal(result.summary.totalRedactions, 3)

  assert.deepEqual(result.summary.types, {
    email: 1,
    password: 1,
    apiKey: 1
  })
})

test('preserves useful incident evidence', () => {
  const rawLog =
    'MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017'

  const result = redactLog(rawLog)

  assert.equal(result.redactedLog, rawLog)

  assert.deepEqual(result.summary, {
    totalRedactions: 0,
    types: {}
  })
})

test('does not mutate the provided value', () => {
  const rawLog =
    'User admin@example.com received status 500'

  const originalLog = rawLog

  redactLog(rawLog)

  assert.equal(rawLog, originalLog)
})

test('does not redact or recount already-redacted values', () => {
  const log = `
email=[REDACTED_EMAIL]
password=[REDACTED_PASSWORD]
Authorization: Bearer [REDACTED_TOKEN]
`

  const firstResult = redactLog(log)
  const secondResult = redactLog(firstResult.redactedLog)

  assert.equal(firstResult.redactedLog, log)
  assert.equal(secondResult.redactedLog, log)

  assert.deepEqual(firstResult.summary, {
    totalRedactions: 0,
    types: {}
  })

  assert.deepEqual(secondResult.summary, {
    totalRedactions: 0,
    types: {}
  })
})

test('detects sensitive field names regardless of casing', () => {
  const log = `
PASSWORD=UpperCasePassword
Api_Key=ProductionApiKey
User=admin@example.com
`

  const result = redactLog(log)

  assert.equal(
    result.redactedLog.includes('UpperCasePassword'),
    false
  )

  assert.equal(
    result.redactedLog.includes('ProductionApiKey'),
    false
  )

  assert.equal(
    result.redactedLog.includes('admin@example.com'),
    false
  )

  assert.deepEqual(result.summary, {
    totalRedactions: 3,
    types: {
      password: 1,
      apiKey: 1,
      email: 1
    }
  })
})

test('redacts quoted sensitive assignments', () => {
  const log = `
password="QuotedPassword"
api_key='QuotedApiKey'
client_secret="QuotedClientSecret"
`

  const result = redactLog(log)

  assert.match(
    result.redactedLog,
    /password="\[REDACTED_PASSWORD\]"/
  )

  assert.match(
    result.redactedLog,
    /api_key='\[REDACTED_API_KEY\]'/
  )

  assert.match(
    result.redactedLog,
    /client_secret="\[REDACTED_SECRET\]"/
  )

  assert.equal(result.summary.totalRedactions, 3)
})

test('redacts sensitive values in nested objects and arrays', () => {
  const log = JSON.stringify({
    project: {
      users: [
        {
          email: 'first@example.com'
        },
        {
          password: 'NestedPassword'
        }
      ],
      configuration: {
        clientSecret: 'NestedClientSecret'
      }
    },
    metadata: {
      traceId: 'trace-12345',
      status: 500
    }
  })

  const result = redactLog(log)
  const parsedResult = JSON.parse(result.redactedLog)

  assert.equal(
    parsedResult.project.users[0].email,
    '[REDACTED_EMAIL]'
  )

  assert.equal(
    parsedResult.project.users[1].password,
    '[REDACTED_PASSWORD]'
  )

  assert.equal(
    parsedResult.project.configuration.clientSecret,
    '[REDACTED_SECRET]'
  )

  assert.equal(
    parsedResult.metadata.traceId,
    'trace-12345'
  )

  assert.equal(parsedResult.metadata.status, 500)
  assert.equal(result.summary.totalRedactions, 3)
})

test('falls back to text detection for malformed JSON', () => {
  const log =
    '{"password":"BrokenJsonPassword","status":500'

  const result = redactLog(log)

  assert.equal(
    result.redactedLog.includes('BrokenJsonPassword'),
    false
  )

  assert.match(
    result.redactedLog,
    /"password":"\[REDACTED_PASSWORD\]"/
  )

  assert.equal(result.summary.totalRedactions, 1)
  assert.equal(result.summary.types.password, 1)
})

test('preserves hashes, trace IDs, IP addresses and error codes', () => {
  const log = `
traceId=4bf92f3577b34da6a3ce929d0e0e4736
commit=9fceb02d0ae598e95dc970b74767f19372d61af8
requestId=req_01HZX5QAG4J7CFV8R2D3
host=10.10.20.15
port=5432
errorCode=ECONNREFUSED
status=500
`

  const result = redactLog(log)

  assert.equal(result.redactedLog, log)

  assert.deepEqual(result.summary, {
    totalRedactions: 0,
    types: {}
  })
})