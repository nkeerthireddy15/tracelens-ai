import test from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import app from '../../app.js'

test('POST /api/v1/redactions/preview returns sanitized logs', async () => {
  const response = await request(app)
    .post('/api/v1/redactions/preview')
    .send({
      log: `
User john@example.com failed login
password=SuperSecret123
Error: ECONNREFUSED 127.0.0.1:27017
`
    })

  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)

  assert.equal(
    response.body.data.redactedLog.includes(
      'john@example.com'
    ),
    false
  )

  assert.equal(
    response.body.data.redactedLog.includes(
      'SuperSecret123'
    ),
    false
  )

  assert.match(
    response.body.data.redactedLog,
    /\[REDACTED_EMAIL\]/
  )

  assert.match(
    response.body.data.redactedLog,
    /\[REDACTED_PASSWORD\]/
  )

  assert.match(
    response.body.data.redactedLog,
    /ECONNREFUSED 127\.0\.0\.1:27017/
  )

  assert.deepEqual(response.body.data.summary, {
    totalRedactions: 2,
    types: {
      password: 1,
      email: 1
    }
  })
})

test('POST /api/v1/redactions/preview rejects a missing log', async () => {
  const response = await request(app)
    .post('/api/v1/redactions/preview')
    .send({})

  assert.equal(response.status, 400)
  assert.equal(response.body.success, false)
  assert.equal(response.body.message, 'Invalid request')
})

test('POST /api/v1/redactions/preview rejects an empty log', async () => {
  const response = await request(app)
    .post('/api/v1/redactions/preview')
    .send({
      log: '   '
    })

  assert.equal(response.status, 400)
  assert.equal(response.body.success, false)

  assert.equal(
    response.body.errors[0].message,
    'Log cannot be empty'
  )
})

test('POST /api/v1/redactions/preview rejects oversized logs', async () => {
  const response = await request(app)
    .post('/api/v1/redactions/preview')
    .send({
      log: 'a'.repeat(50_001)
    })

  assert.equal(response.status, 413)
  assert.equal(response.body.success, false)
  assert.equal(response.body.message, 'Log is too large')
})

test('POST /api/v1/redactions/preview rejects unknown fields', async () => {
  const response = await request(app)
    .post('/api/v1/redactions/preview')
    .send({
      log: 'Error: connection failed',
      rawPassword: 'This field should not be accepted'
    })

  assert.equal(response.status, 400)
  assert.equal(response.body.success, false)
})

test('does not echo raw logs in validation errors', async () => {
  const secretValue = 'DO_NOT_RETURN_THIS_SECRET'

  const response = await request(app)
    .post('/api/v1/redactions/preview')
    .send({
      log: `${secretValue}${'a'.repeat(50_001)}`
    })

  assert.equal(response.status, 413)

  const serializedResponse = JSON.stringify(response.body)

  assert.equal(
    serializedResponse.includes(secretValue),
    false
  )

  assert.equal(
    Object.hasOwn(response.body, 'log'),
    false
  )
})