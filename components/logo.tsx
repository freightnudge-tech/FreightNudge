type LogoProps = {
  className?: string;
  showWordmark?: boolean;
};

export default function Logo({ className = "h-9 w-9", showWordmark = true }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`relative inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-500 shadow-[0_4px_14px_rgba(99,102,241,0.35)] ring-1 ring-inset ring-white/20 ${className}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[58%] w-[58%]"
          aria-hidden="true"
        >
          <path d="M3 17l6-6 4 3 8-8" />
          <path d="M15 6h6v6" />
        </svg>
      </span>
      {showWordmark && (
        <span className="text-lg font-extrabold tracking-tight">
          <span className="text-neutral-900 dark:text-white">Freight</span>
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Nudge
          </span>
        </span>
      )}
    </span>
  );
}