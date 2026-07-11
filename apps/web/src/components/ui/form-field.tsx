export function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-200 light:text-slate-800">
      {label}
      {children}
    </label>
  );
}

export const inputClass =
  "nexora-focus min-h-11 rounded-md border border-white/12 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 light:border-slate-200 light:bg-white/85 light:text-slate-950";
