import { cn } from '../lib/utils';

/** The EcomFlow mark: three lines of copy forming an E, on the brand violet. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn('size-8 shrink-0', className)}>
      <rect width="32" height="32" rx="9" fill="var(--primary)" />
      <path d="M10.5 10h11M10.5 16h7.5M10.5 22h11" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Mark and name together, as in the sidebar and the site header. */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <BrandMark />
      <span className="text-[15px] font-semibold tracking-tight text-fg" dir="ltr">
        EcomFlow <span className="text-primary-ink">AI</span>
      </span>
    </span>
  );
}
