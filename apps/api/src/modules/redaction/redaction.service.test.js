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

  assert.match(result.redactedLog, /\[REDACTED_EMAIL\]/)
  assert.match(result.redactedLog, /\[REDACTED_PASSWORD\]/)
  assert.match(result.redactedLog, /\[REDACTED_API_KEY\]/)
  assert.match(result.redactedLog, /\[REDACTED_TOKEN\]/)
  assert.match(result.redactedLog, /\[REDACTED_JWT\]/)
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

  assert.equal(parsedResult.user.email, '[REDACTED_EMAIL]')
  assert.equal(parsedResult.user.password, '[REDACTED_PASSWORD]')
  assert.equal(parsedResult.apiKey, '[REDACTED_API_KEY]')
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
  const rawLog = 'User admin@example.com received status 500'
  const originalLog = rawLog

  redactLog(rawLog)

  assert.equal(rawLog, originalLog)
})