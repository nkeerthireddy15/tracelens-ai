import { useState } from 'react'
import {
  AlertTriangle,
  Check,
  Copy,
  LoaderCircle,
  ScanSearch,
  ShieldCheck
} from 'lucide-react'
import RedactionSummary from './RedactionSummary'

function RedactionPreview({ result, error, isLoading }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!result?.redactedLog) return

    try {
      await navigator.clipboard.writeText(result.redactedLog)
      setCopied(true)

      window.setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section
      className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-2xl shadow-black/20"
      aria-live="polite"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
            <ShieldCheck size={18} aria-hidden="true" />
          </div>

          <div>
            <h2 className="font-medium text-white">
              Redacted preview
            </h2>

            <p className="text-xs text-zinc-500">
              Safe output for AI analysis
            </p>
          </div>
        </div>

        {result?.redactedLog && !isLoading && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            {copied ? (
              <>
                <Check
                  size={15}
                  className="text-emerald-300"
                  aria-hidden="true"
                />
                Copied
              </>
            ) : (
              <>
                <Copy size={15} aria-hidden="true" />
                Copy
              </>
            )}
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex min-h-96 flex-col items-center justify-center px-6 text-center">
          <LoaderCircle
            size={30}
            className="animate-spin text-violet-400"
            aria-hidden="true"
          />

          <p className="mt-4 font-medium text-white">
            Inspecting sensitive data
          </p>

          <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
            Applying structured, key-aware and format-aware
            detectors.
          </p>
        </div>
      )}

      {!isLoading && error && (
        <div
          role="alert"
          className="m-5 flex gap-3 rounded-xl border border-red-400/20 bg-red-400/5 p-4"
        >
          <AlertTriangle
            size={19}
            className="mt-0.5 shrink-0 text-red-300"
            aria-hidden="true"
          />

          <div>
            <p className="font-medium text-red-200">
              Redaction failed
            </p>

            <p className="mt-1 text-sm leading-6 text-zinc-400">
              {error}
            </p>
          </div>
        </div>
      )}

      {!isLoading && !error && !result && (
        <div className="flex min-h-96 flex-col items-center justify-center px-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-zinc-500">
            <ScanSearch size={25} aria-hidden="true" />
          </div>

          <p className="mt-4 font-medium text-zinc-300">
            Your sanitized preview will appear here
          </p>

          <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
            Paste a production log and run the secure
            redaction preview.
          </p>
        </div>
      )}

      {!isLoading && !error && result && (
        <>
          <div className="border-b border-white/10 p-5">
            <RedactionSummary summary={result.summary} />
          </div>

          <pre className="min-h-80 overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-sm leading-7 text-zinc-300">
            {result.redactedLog}
          </pre>
        </>
      )}
    </section>
  )
}

export default RedactionPreview