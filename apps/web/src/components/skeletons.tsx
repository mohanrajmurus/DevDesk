import { Skeleton } from "@/components/ui/skeleton"

/* ------------------------------------------------------------------ */
/* Shared primitives                                                    */
/* ------------------------------------------------------------------ */

/** One row in the Tasks / Time Logs / project task lists. */
function ListRowSkeleton() {
  return (
    <div className="border border-border rounded-xl px-4 py-3 bg-card flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-3">
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-14 rounded-full" />
        <Skeleton className="h-4 w-14 rounded-full" />
      </div>
    </div>
  )
}

export function ListRowsSkeleton({ rows = 6, className = "space-y-2" }: { rows?: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: rows }).map((_, i) => (
        <ListRowSkeleton key={i} />
      ))}
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="border border-border rounded-xl px-4 py-3.5 bg-card space-y-2">
      <Skeleton className="h-2.5 w-14" />
      <Skeleton className="h-7 w-16" />
    </div>
  )
}

export function NoteCardsSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="border border-border rounded-xl px-4 py-3.5 bg-card space-y-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-2.5 w-24 mt-1" />
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Per-screen skeletons                                                 */
/* ------------------------------------------------------------------ */

export function DashboardSkeleton() {
  return (
    <>
      <div className="mb-5.5 space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-44" />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-7 lg:gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-7">
          <section>
            <Skeleton className="h-4 w-32 mb-3" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <Skeleton className="size-[17px] rounded-[5px]" />
                  <Skeleton className="h-3.5 flex-1" />
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-4 w-[52px] rounded-md" />
                </div>
              ))}
            </div>
          </section>

          <section>
            <Skeleton className="h-4 w-36 mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[58px] w-full rounded-[10px]" />
              ))}
            </div>
          </section>
        </div>

        <section>
          <Skeleton className="h-4 w-40 mb-3" />
          <div className="space-y-3.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-[5px] w-full rounded-full" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

/** Just the project cards grid — the page keeps its real (interactive) header. */
export function ProjectsGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="border border-border rounded-xl px-4 py-3.5 bg-card">
          <div className="flex items-center gap-2">
            <Skeleton className="size-2 rounded-full" />
            <Skeleton className="h-3.5 w-32" />
          </div>
          <Skeleton className="h-4 w-16 rounded-full mt-2" />
          <div className="mt-2 space-y-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <div className="grid grid-cols-4 gap-1 mt-3.5 pt-3 border-t border-border">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex flex-col items-center gap-1">
                <Skeleton className="h-3.5 w-6" />
                <Skeleton className="h-2.5 w-8" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Everything below Profile's static title block. */
export function ProfileSkeleton() {
  return (
    <>
      <div className="bg-card border border-border rounded-xl p-6 mb-5">
        <div className="flex items-center gap-4.5">
          <Skeleton className="size-16 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-52" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full shrink-0" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <Skeleton className="h-2.5 w-28 mb-4" />
        {Array.from({ length: 3 }).map((_, row) => (
          <div key={row} className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, col) => (
              <div key={col} className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        ))}
        <div className="flex justify-end pt-4 border-t border-border">
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    </>
  )
}

/** Body of the task details drawer while the task loads. */
export function TaskDetailsSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5.5 space-y-5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-24 rounded-full" />
      </div>
      <Skeleton className="h-3.5 w-3/4" />
      <Skeleton className="h-3.5 w-32" />
      <Skeleton className="h-[90px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  )
}

/** Body of the note details dialog while the note loads. */
export function NoteDetailsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
    </div>
  )
}

/** Everything below ProjectDetails' static "Back to projects" link. */
export function ProjectDetailsSkeleton() {
  return (
    <>
      <div className="flex items-center gap-2.5 mb-5.5">
        <Skeleton className="size-3 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
      </div>

      <Skeleton className="h-4 w-2/3 max-w-[720px] mb-6" />

      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-border rounded-xl px-4 py-3.5 bg-card flex flex-col items-center gap-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-2.5 w-10" />
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-md" />
        ))}
      </div>

      <ListRowsSkeleton rows={4} className="space-y-2.5" />
    </>
  )
}
