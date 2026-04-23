interface Props { title: string; subtitle?: string; }

export default function PageHeader({ title, subtitle }: Props) {
  return (
    <div className="pt-6 pb-2 animate-fade-up">
      <h2 className="text-3xl font-extrabold tracking-tight leading-none">{title}</h2>
      {subtitle && <p className="text-sm text-muted mt-1.5">{subtitle}</p>}
    </div>
  );
}
