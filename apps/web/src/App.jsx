import { useState } from 'react'
import AppHeader from './components/AppHeader'
import LogInputPanel from './components/LogInputPanel'
import RedactionPreview from './components/RedactionPreview'
import SecurityNotice from './components/SecurityNotice'
import { previewRedaction } from './services/redactionApi'

const EXAMPLE_INCIDENT = `2026-09-01T16:40:22.451Z ERROR Database connection failed
Service: order-api
Environment: production
User: developer@example.com
password=ProductionPassword123
Authorization: Bearer production-access-token-456
MongoDB: mongodb+srv://admin:databasePassword@cluster.mongodb.net/orders

MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
    at Timeout._onTimeout (connection.js:284:30)
    at process.processTimers (node:internal/timers:512:7)`

function App() {
  const [log, setLog] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function handleLogChange(value) {
    setLog(value)

    // A previous preview becomes stale when the input changes.
    setResult(null)
    setError('')
  }

  function handleClear() {
    setLog('')
    setResult(null)
    setError('')
  }

  function handleUseExample() {
    setLog(EXAMPLE_INCIDENT)
    setResult(null)
    setError('')
  }

  async function handlePreview() {
    if (!log.trim() || isLoading) return

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const redactionResult = await previewRedaction(log)
      setResult(redactionResult)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'An unexpected error occurred.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 size-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 size-80 rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      <div className="relative">
        <AppHeader />

        <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
          <section className="mb-8 max-w-3xl">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-violet-300">
              Secure redaction workspace
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Investigate incidents without exposing secrets
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              Paste a production error or stack trace. TraceLens
              detects sensitive values and creates a sanitized
              preview before any AI analysis occurs.
            </p>
          </section>

          <div className="mb-6 max-w-3xl">
            <SecurityNotice />
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-2">
            <LogInputPanel
              log={log}
              isLoading={isLoading}
              onLogChange={handleLogChange}
              onPreview={handlePreview}
              onClear={handleClear}
              onUseExample={handleUseExample}
            />

            <RedactionPreview
              result={result}
              error={error}
              isLoading={isLoading}
            />
          </div>

          <footer className="mt-8 flex flex-col gap-2 border-t border-white/5 pt-6 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
            <p>
              TraceLens AI · Production incident intelligence
            </p>
            <p>
              Raw logs are never persisted during redaction preview
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}

export default App