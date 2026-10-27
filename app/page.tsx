import { AuthControls } from "@/components/AuthControls";
import { WardrobeAgent } from "@/components/WardrobeAgent";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-sm font-semibold tracking-wide">AI Wardrobe</span>
        <AuthControls />
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-6 py-12 sm:px-10">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Personal styling</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Get dressed with confidence.</h1>
          <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
            Your wardrobe assistant is ready to help with outfit ideas and everyday styling.
          </p>
        </div>
        <WardrobeAgent />
      </main>
    </div>
  );
}
