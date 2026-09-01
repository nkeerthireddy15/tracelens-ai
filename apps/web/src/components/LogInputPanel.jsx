import {
  FileText,
  LoaderCircle,
  Sparkles,
  Trash2
} from 'lucide-react'

const MAX_LOG_LENGTH = 50_000

function LogInputPanel({
  log,
  isLoading,
  onLogChange,
  onPreview,
  onClear,
  onUseExample
}) {
  const characterCount = log.length
  const isNearLimit = characterCount > MAX_LOG_LENGTH * 0.9
  const cannotSubmit =
    isLoading ||
    log.trim().length === 0 ||
    characterCount > MAX_LOG_LENGTH

  function handleSubmit(event) {
    event.preventDefault()

    if (!cannotSubmit) {
      onPreview()
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-2xl shadow-black/20">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-400/10 text-blue-300">
            <FileText size={18} aria-hidden="true" />
          </div>

          <div>
            <h2 className="font-medium text-white">
              Raw production log
            </h2>
            <p className="text-xs text-zinc-500">
              Paste an error, stack trace or deployment failure
            </p>
          </div>
        </div>

        {log && (
          <button
            type="button"
            onClick={onClear}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={15} aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="production-log" className="sr-only">
          Production log
        </label>

        <textarea
          id="production-log"
          value={log}
          onChange={(event) => onLogChange(event.target.value)}
          placeholder={`Paste a production error here...

Example:
MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
Authorization: Bearer production-token`}
          spellCheck="false"
          className="min-h-96 w-full resize-y bg-transparent px-5 py-5 font-mono text-sm leading-7 text-zinc-200 outline-none placeholder:text-zinc-600 focus:bg-white/[0.015]"
        />

        <div className="border-t border-white/10 px-5 py-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onUseExample}
              disabled={isLoading}
              className="text-sm font-medium text-violet-300 transition hover:text-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Use example incident
            </button>

            <p
              className={`text-xs tabular-nums ${
                isNearLimit
                  ? 'text-amber-300'
                  : 'text-zinc-500'
              }`}
            >
              {characterCount.toLocaleString()} /{' '}
              {MAX_LOG_LENGTH.toLocaleString()}
            </p>
          </div>

          <button
            type="submit"
            disabled={cannotSubmit}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                  aria-hidden="true"
                />
                Redacting sensitive data...
              </>
            ) : (
              <>
                <Sparkles size={17} aria-hidden="true" />
                Preview secure redaction
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  )
}

export default LogInputPanel