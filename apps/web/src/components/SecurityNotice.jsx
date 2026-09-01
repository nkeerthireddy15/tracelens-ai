import { LockKeyhole } from 'lucide-react'

function SecurityNotice() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
        <LockKeyhole size={16} aria-hidden="true" />
      </div>

      <div>
        <p className="text-sm font-medium text-emerald-200">
          Privacy boundary enabled
        </p>

        <p className="mt-1 text-sm leading-6 text-zinc-400">
          Raw logs are processed in memory and are not stored.
          Only sanitized content will be eligible for AI
          analysis.
        </p>
      </div>
    </div>
  )
}

export default SecurityNotice