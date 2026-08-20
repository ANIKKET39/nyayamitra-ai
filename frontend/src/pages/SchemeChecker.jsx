import { useState } from "react";
import {
  ClipboardCheck, CheckCircle2, RotateCcw, IndianRupee, MapPin, User, Briefcase, GraduationCap, Sparkles,
} from "lucide-react";
import { checkEligibility } from "../api/client";
import { PageHeader, ProgressSteps, Spinner, Badge } from "../components/ui";

const STEPS = ["Basics", "Location & Income", "Occupation", "Results"];

const INDIAN_STATES = [
  "Andhra Pradesh", "Bihar", "Delhi", "Gujarat", "Haryana", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Uttar Pradesh",
  "West Bengal", "Other",
];

const initialForm = {
  age: "",
  gender: "",
  state: "",
  income: "",
  occupation: "",
  student_status: "no",
};

export default function SchemeChecker() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const select = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const canStep0 = form.age && form.gender;
  const canStep1 = form.state && form.income !== "";

  async function handleCheck() {
    setLoading(true);
    setError(null);
    try {
      const res = await checkEligibility({
        age: Number(form.age),
        gender: form.gender,
        state: form.state,
        income: Number(form.income),
        occupation: form.occupation,
        student_status: form.student_status,
      });
      setResult(res);
      setStep(3);
    } catch (err) {
      setError("Failed to check eligibility. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setForm(initialForm);
    setStep(0);
    setResult(null);
    setError(null);
  }

  function reasonFor(schemeId) {
    return result?.reasoning?.schemes?.find((s) => s.scheme_id === schemeId);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
      <PageHeader
        eyebrow="Scheme Eligibility Checker"
        title="Find government schemes you qualify for"
        subtitle="Answer a few quick questions and we'll match you against real central government schemes."
      />

      {step < 3 && (
        <div className="card mt-8 p-6 sm:p-8">
          <ProgressSteps steps={STEPS} current={step} />

          <div className="mt-8">
            {step === 0 && (
              <div className="space-y-5 animate-fadeUp">
                <div>
                  <label className="label-text flex items-center gap-1.5">
                    <User size={14} /> Your Age
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="e.g. 24"
                    value={form.age}
                    onChange={update("age")}
                  />
                </div>
                <div>
                  <label className="label-text">Gender</label>
                  <div className="flex gap-2">
                    {["male", "female", "other"].map((g) => (
                      <button
                        key={g}
                        onClick={() => select("gender", g)}
                        className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                          form.gender === g
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5 animate-fadeUp">
                <div>
                  <label className="label-text flex items-center gap-1.5">
                    <MapPin size={14} /> State
                  </label>
                  <select className="input-field" value={form.state} onChange={update("state")}>
                    <option value="">Select your state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-text flex items-center gap-1.5">
                    <IndianRupee size={14} /> Annual Household Income (₹)
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="e.g. 150000"
                    value={form.income}
                    onChange={update("income")}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-fadeUp">
                <div>
                  <label className="label-text flex items-center gap-1.5">
                    <Briefcase size={14} /> Occupation
                  </label>
                  <select className="input-field" value={form.occupation} onChange={update("occupation")}>
                    <option value="">Select occupation</option>
                    <option value="farmer">Farmer</option>
                    <option value="self-employed">Self-employed / Trader</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="salaried">Salaried</option>
                    <option value="any">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label-text flex items-center gap-1.5">
                    <GraduationCap size={14} /> Are you currently a student?
                  </label>
                  <div className="flex gap-2">
                    {["yes", "no"].map((v) => (
                      <button
                        key={v}
                        onClick={() => select("student_status", v)}
                        className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                          form.student_status === v
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                {error && <p className="text-sm font-medium text-red-600">{error}</p>}
                {loading && <Spinner label="Matching you against schemes..." />}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              className="btn-secondary"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || loading}
            >
              Back
            </button>
            {step < 2 ? (
              <button
                className="btn-primary"
                onClick={() => setStep((s) => s + 1)}
                disabled={(step === 0 && !canStep0) || (step === 1 && !canStep1)}
              >
                Continue
              </button>
            ) : (
              <button className="btn-primary" onClick={handleCheck} disabled={loading}>
                <ClipboardCheck size={16} /> Check Eligibility
              </button>
            )}
          </div>
        </div>
      )}

      {step === 3 && result && (
        <div className="mt-8 space-y-5 animate-fadeUp">
          <div className="card flex items-center gap-3 bg-emerald-50 px-4 py-3 text-emerald-700">
            <CheckCircle2 size={20} />
            <span className="text-sm font-semibold">
              You are eligible for {result.matched_schemes.length} scheme{result.matched_schemes.length !== 1 ? "s" : ""}!
            </span>
          </div>

          {result.reasoning?.encouragement_note && (
            <div className="flex items-center gap-2 px-1 text-sm text-slate-500">
              <Sparkles size={14} className="text-brand-500" /> {result.reasoning.encouragement_note}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {result.matched_schemes.map((scheme) => {
              const reason = reasonFor(scheme.id);
              return (
                <div key={scheme.id} className="card p-5">
                  <Badge tone="brand">{scheme.category}</Badge>
                  <h3 className="mt-2.5 text-base font-bold text-ink">{scheme.name}</h3>
                  <p className="mt-1.5 text-sm text-slate-500">{scheme.description}</p>

                  {reason?.why_eligible && (
                    <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">
                      {reason.why_eligible}
                    </p>
                  )}

                  <div className="mt-3">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">Benefits</h4>
                    <ul className="ml-4 mt-1 list-disc space-y-0.5 text-sm text-ink">
                      {scheme.benefits.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">Required Documents</h4>
                    <p className="mt-1 text-sm text-slate-600">{scheme.required_documents.join(", ")}</p>
                  </div>

                  {reason?.recommended_first_step && (
                    <p className="mt-3 text-xs font-medium text-slate-500">
                      <span className="font-bold text-ink">Next step: </span>
                      {reason.recommended_first_step}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {result.matched_schemes.length === 0 && (
            <div className="card p-8 text-center text-sm text-slate-500">
              No exact matches found for your profile. Try adjusting your details, or check back
              soon as we add more schemes.
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button className="btn-secondary" onClick={reset}>
              <RotateCcw size={16} /> Check Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
