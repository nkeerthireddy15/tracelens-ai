export const REDACTION_LABELS = Object.freeze({
  email: '[REDACTED_EMAIL]',
  password: '[REDACTED_PASSWORD]',
  apiKey: '[REDACTED_API_KEY]',
  token: '[REDACTED_TOKEN]',
  jwt: '[REDACTED_JWT]',
  authorization: '[REDACTED_AUTH]',
  secret: '[REDACTED_SECRET]',
  username: '[REDACTED_USERNAME]'
})

export const SENSITIVE_KEY_RULES = [
  {
    type: 'email',
    pattern: /^(email|emailAddress|userEmail)$/i
  },
  {
    type: 'password',
    pattern: /^(password|passwd|pwd|databasePassword)$/i
  },
  {
    type: 'apiKey',
    pattern: /^(apiKey|api_key|api-key)$/i
  },
  {
    type: 'authorization',
    pattern: /^(authorization|authHeader)$/i
  },
  {
    type: 'token',
    pattern:
      /^(token|accessToken|access_token|refreshToken|refresh_token|idToken|id_token)$/i
  },
  {
    type: 'secret',
    pattern:
      /^(secret|clientSecret|client_secret|apiSecret|api_secret)$/i
  }
]