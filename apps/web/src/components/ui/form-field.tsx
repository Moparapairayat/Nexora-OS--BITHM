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
  "nexora-focus min-h-11 rounded-md border border-white/12 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 transition light:border-[color:var(--line)] light:bg-[#fbfdfc] light:text-[#15251f] light:placeholder:text-slate-400 light:shadow-[inset_0_1px_2px_rgba(26,58,43,0.035)] light:focus:border-emerald-400 light:focus:bg-white light:focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]";
