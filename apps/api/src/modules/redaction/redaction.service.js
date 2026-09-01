import {
  redactStructuredData,
  textDetectors
} from './redaction.detectors.js'

function mergeCounts(target, source) {
  for (const [type, count] of Object.entries(source)) {
    target[type] = (target[type] || 0) + count
  }
}

export function redactLog(log) {
  if (typeof log !== 'string') {
    throw new TypeError('Log must be a string')
  }

  const summaryTypes = {}

  const structuredResult = redactStructuredData(log)

  let redactedLog = structuredResult.redactedLog

  mergeCounts(summaryTypes, structuredResult.counts)

  for (const detector of textDetectors) {
    const result = detector.redact(redactedLog)

    redactedLog = result.redactedText

    if (result.count > 0) {
      summaryTypes[detector.type] =
        (summaryTypes[detector.type] || 0) + result.count
    }
  }

  const totalRedactions = Object.values(summaryTypes).reduce(
    (total, count) => total + count,
    0
  )

  return {
    redactedLog,
    summary: {
      totalRedactions,
      types: summaryTypes
    }
  }
}