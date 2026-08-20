import { Link } from "react-router-dom";
import {
  MessageSquareText, FileText, ClipboardCheck, Mail, ArrowRight,
  ShieldCheck, Languages, Sparkles, Clock, Users, CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: MessageSquareText,
    title: "Rights Navigator",
    desc: "Describe your problem in plain English, Hindi, or Punjabi and get clear guidance on your rights, the responsible authority, and next steps.",
    to: "/chat",
    color: "from-brand-500 to-brand-700",
  },
  {
    icon: FileText,
    title: "RTI Draft Generator",
    desc: "Generate a properly formatted RTI application in seconds — subject, requested information, legal format, and a downloadable PDF.",
    to: "/rti",
    color: "from-indigo-500 to-brand-700",
  },
  {
    icon: ClipboardCheck,
    title: "Scheme Eligibility Checker",
    desc: "Answer a few quick questions and discover which government schemes you qualify for, why, and how to apply.",
    to: "/schemes",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: Mail,
    title: "Complaint Letter Generator",
    desc: "Create professional complaint letters for consumer disputes, landlord issues, workplace grievances, and municipal complaints.",
    to: "/complaints",
    color: "from-brand-600 to-indigo-800",
  },
];

const stats = [
  { icon: Users, label: "Built for", value: "1.4B+ Citizens" },
  { icon: Languages, label: "Languages", value: "EN · HI · PA" },
  { icon: Clock, label: "Avg. draft time", value: "< 60 sec" },
  { icon: ShieldCheck, label: "Grounded in", value: "Indian Law" },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_-10%,#DBE6FE,transparent_45%),radial-gradient(circle_at_90%_10%,#EFF4FF,transparent_40%)]" />
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-16 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center animate-fadeUp">
            <span className="section-eyebrow">
              <Sparkles size={13} /> OOSC 4.0 · AI for Civic &amp; Legal Empowerment
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-ink sm:text-6xl">
              Know your rights.
              <br />
              <span className="text-brand-600">Generate documents.</span> Take action.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500">
              NyayaMitra AI helps every Indian citizen understand their legal rights,
              navigate government procedures, and generate ready-to-file legal
              documents — in plain language, in minutes.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/chat" className="btn-primary px-6 py-3 text-base">
                Ask about your rights <ArrowRight size={17} />
              </Link>
              <Link to="/dashboard" className="btn-secondary px-6 py-3 text-base">
                View Dashboard
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4 animate-fadeUp [animation-delay:150ms]">
            {stats.map((s) => (
              <div key={s.label} className="card flex flex-col items-center gap-1.5 px-4 py-5 text-center">
                <s.icon size={20} className="text-brand-600" />
                <span className="text-sm font-bold text-ink">{s.value}</span>
                <span className="text-xs text-slate-400">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">What you can do</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink">
            Four tools. One mission — legal clarity for everyone.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {features.map((f, i) => (
            <Link
              key={f.title}
              to={f.to}
              className="card group relative overflow-hidden p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-fadeUp"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-soft transition-transform group-hover:scale-110`}
              >
                <f.icon size={22} />
              </div>
              <h3 className="text-lg font-bold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                Try it now <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="section-eyebrow">How it works</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink">
              From confusion to action in three steps
            </h2>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              { step: "01", title: "Describe your issue", desc: "Type your problem in your own words, in English, Hindi, or Punjabi." },
              { step: "02", title: "Get AI-grounded guidance", desc: "Receive your rights, the responsible authority, required documents, and next steps." },
              { step: "03", title: "Download & act", desc: "Generate a ready-to-file RTI application or complaint letter as a polished PDF." },
            ].map((s) => (
              <div key={s.step} className="relative pl-2">
                <span className="text-4xl font-extrabold text-brand-100">{s.step}</span>
                <h3 className="mt-2 text-lg font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="card flex flex-col items-center gap-6 bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-center text-white sm:p-14">
          <CheckCircle2 size={32} className="text-brand-100" />
          <h2 className="max-w-2xl text-2xl font-bold sm:text-3xl">
            Legal empowerment shouldn't require a law degree.
          </h2>
          <p className="max-w-xl text-brand-100">
            NyayaMitra AI translates complex legal procedures into simple, actionable
            guidance — grounded in the RTI Act, Consumer Protection Act, and other
            Indian civic laws.
          </p>
          <Link to="/chat" className="btn-secondary bg-white px-6 py-3 text-base">
            Start with the Rights Navigator <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}
