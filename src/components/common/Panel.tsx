import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Panel({ title, actions, children, className, bodyClassName }: PanelProps) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col border border-hairline bg-surface",
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex h-8 shrink-0 items-center justify-between border-b border-hairline px-3">
          {title ? <h2 className="label-xs">{title}</h2> : <span />}
          {actions}
        </header>
      )}
      <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </section>
  );
}
