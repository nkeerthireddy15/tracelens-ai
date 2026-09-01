import { ShieldCheck, Sparkles } from 'lucide-react'

function AppHeader() {
  return (
    <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500 text-white shadow-lg shadow-violet-500/20">
            <ShieldCheck size={21} aria-hidden="true" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold tracking-tight text-white">
                TraceLens AI
              </p>

              <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2 py-0.5 text-xs font-medium text-violet-300">
                MVP
              </span>
            </div>

            <p className="text-xs text-zinc-500">
              Secure incident intelligence
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 text-sm text-zinc-400 sm:flex">
          <Sparkles
            size={16}
            className="text-violet-400"
            aria-hidden="true"
          />
          AI analysis coming next
        </div>
      </div>
    </header>
  )
}

export default AppHeader