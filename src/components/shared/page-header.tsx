interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/** Consistent title/description/primary-action band used at the top of every dashboard page. */
export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  );
}
