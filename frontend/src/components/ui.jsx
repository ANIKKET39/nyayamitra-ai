import { Loader2 } from "lucide-react";

export function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto max-w-3xl text-center animate-fadeUp">
      {eyebrow && <span className="section-eyebrow mb-4">{eyebrow}</span>}
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-3 text-base text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function Spinner({ label = "Working..." }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
      <Loader2 className="animate-spin" size={20} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export function ProgressSteps({ steps, current }) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                  isDone
                    ? "bg-brand-600 text-white"
                    : isActive
                    ? "bg-brand-100 text-brand-700 ring-4 ring-brand-50"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`hidden text-xs font-medium sm:block ${
                  isActive ? "text-brand-700" : "text-slate-400"
                }`}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 rounded transition-all duration-500 ${
                  isDone ? "bg-brand-600" : "bg-slate-100"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Badge({ children, tone = "brand" }) {
  const tones = {
    brand: "bg-brand-50 text-brand-700",
    gray: "bg-slate-100 text-slate-600",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
