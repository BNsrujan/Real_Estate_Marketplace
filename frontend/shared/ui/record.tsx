import { cn } from "@/lib/utils";

export function RecordPage({
  eyebrow,
  title,
  action,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl", className)}>
      <header className="mb-8 flex items-end justify-between gap-6 border-b border-hairline-strong pb-5">
        <div>
          {eyebrow && <p className="label mb-2">{eyebrow}</p>}
          <h1 className="display text-3xl sm:text-4xl text-ink">{title}</h1>
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}

export function FigureRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-px border border-hairline bg-hairline sm:grid-cols-4">
      {children}
    </div>
  );
}

export function Figure({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="bg-parchment px-5 py-6">
      <p className="label mb-3">{label}</p>
      <p
        className={cn(
          "figure text-3xl",
          accent ? "text-vermilion" : "text-ink",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function Register({
  columns,
  children,
  empty,
}: {
  columns: string[];
  children: React.ReactNode;
  empty?: React.ReactNode;
}) {
  return (
    <div className="border border-hairline">
      <div className="hidden border-b border-hairline-strong bg-parchment-deep sm:flex">
        {columns.map((column) => (
          <div key={column} className="label flex-1 px-4 py-3">
            {column}
          </div>
        ))}
      </div>
      {empty ?? <div className="divide-y divide-hairline">{children}</div>}
    </div>
  );
}

export function RegisterRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 px-4 py-4 transition-colors duration-[120ms] hover:bg-parchment-deep/60 sm:flex-row sm:items-center sm:gap-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Cell({
  label,
  children,
  className,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex-1 min-w-0", className)}>
      {label && <p className="label mb-1 sm:hidden">{label}</p>}
      {children}
    </div>
  );
}

export function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="border-b border-hairline py-3">
      <p className="label mb-1.5">{label}</p>
      <p className={cn("text-sm text-ink", mono && "figure")}>{value}</p>
    </div>
  );
}

export function EmptyRecord({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div
        aria-hidden="true"
        className="mb-5 h-10 w-10 border border-hairline-strong"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent, transparent 4px, var(--hairline) 4px, var(--hairline) 5px)",
        }}
      />
      <p className="display text-xl text-ink">{title}</p>
      {hint && <p className="mt-2 max-w-sm text-sm text-ink-muted">{hint}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
