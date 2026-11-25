export default function Loading() {
  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col">
      <div className="h-16 border-b border-white/[0.08] px-4 sm:px-8 flex items-center justify-between">
        <div className="h-8 w-32 rounded-lg bg-white/[0.06] animate-pulse" />
        <div className="h-8 w-24 rounded-lg bg-white/[0.06] animate-pulse" />
      </div>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="h-8 w-64 rounded-xl bg-white/[0.06] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-36 rounded-2xl bg-white/[0.04] border border-white/[0.06] animate-pulse" />
          <div className="h-36 rounded-2xl bg-white/[0.04] border border-white/[0.06] animate-pulse" />
          <div className="h-36 rounded-2xl bg-white/[0.04] border border-white/[0.06] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
