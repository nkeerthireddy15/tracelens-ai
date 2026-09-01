const TYPE_LABELS = {
  databaseCredentials: 'Database credentials',
  bearerToken: 'Bearer tokens',
  jwt: 'JWTs',
  password: 'Passwords',
  apiKey: 'API keys',
  authorization: 'Authorization values',
  secret: 'Client secrets',
  email: 'Email addresses'
}

function RedactionSummary({ summary }) {
  if (!summary || summary.totalRedactions === 0) {
    return (
      <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-200">
        No supported sensitive values were detected.
      </div>
    )
  }

  return (
    <div>
      <p className="mb-3 text-sm text-zinc-400">
        <span className="font-semibold text-white">
          {summary.totalRedactions}
        </span>{' '}
        sensitive{' '}
        {summary.totalRedactions === 1 ? 'value' : 'values'}{' '}
        removed
      </p>

      <div className="flex flex-wrap gap-2">
        {Object.entries(summary.types).map(([type, count]) => (
          <span
            key={type}
            className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-200"
          >
            {TYPE_LABELS[type] || type}: {count}
          </span>
        ))}
      </div>
    </div>
  )
}

export default RedactionSummary