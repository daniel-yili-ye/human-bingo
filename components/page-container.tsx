type PageContainerProps = {
  title: string;
  description?: React.ReactNode;
  /** Controls rendered opposite the title. */
  actions?: React.ReactNode;
  /** Use the full site width on large screens (for side-by-side layouts). */
  wide?: boolean;
  children: React.ReactNode;
};

/** Narrow app column with a ruled page heading. */
export function PageContainer({
  title,
  description,
  actions,
  wide,
  children,
}: PageContainerProps) {
  return (
    // data-page sets --page-max on <body>, which the site header shares.
    <main
      data-page={wide ? "editor" : "narrow"}
      className="mx-auto w-full max-w-(--page-max) flex-1 space-y-6 px-4 pt-6 pb-16"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
          {description && <p className="text-pretty text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </main>
  );
}
