interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1.5 px-6 py-8 text-center">
      <div className="mb-1 h-px w-8 bg-hairline-strong" />
      <p className="label-xs">{title}</p>
      <p className="max-w-[26ch] text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
