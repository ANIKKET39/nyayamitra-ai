import { Scale } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Scale size={16} />
            </span>
            <span className="font-bold text-ink">NyayaMitra AI</span>
          </div>
          <p className="max-w-md text-sm text-slate-500">
            Built for OOSC 4.0 — AI for Civic and Legal Empowerment. NyayaMitra provides
            general legal information and drafting assistance; it is not a substitute
            for a licensed lawyer.
          </p>
        </div>
        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} NyayaMitra AI · Made with care for Indian citizens
        </div>
      </div>
    </footer>
  );
}
