import { redactLog } from './redaction.service.js'
import { redactionPreviewSchema } from './redaction.schema.js'

export function previewRedaction(req, res) {
  const validationResult = redactionPreviewSchema.safeParse(
    req.body
  )

  if (!validationResult.success) {
    const logIsTooLarge = validationResult.error.issues.some(
      (issue) =>
        issue.path[0] === 'log' &&
        issue.code === 'too_big'
    )

    return res.status(logIsTooLarge ? 413 : 400).json({
      success: false,
      message: logIsTooLarge
        ? 'Log is too large'
        : 'Invalid request',
      errors: validationResult.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'request',
        message: issue.message
      }))
    })
  }

  const result = redactLog(validationResult.data.log)

  return res.status(200).json({
    success: true,
    data: result
  })
}