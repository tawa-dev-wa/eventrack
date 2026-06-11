import { cn } from "../lib/utils";

export function PageHeader({
  title,
  description,
  meta,
  action,
  className,
}: {
  title: string;
  description?: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-brand-neutral/70 pb-5 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight text-brand-primary sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-brand-primary/50 sm:text-base">
            {description}
          </p>
        )}
        {meta ? <div className="mt-3">{meta}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
