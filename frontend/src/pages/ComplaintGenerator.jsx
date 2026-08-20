import { useState } from "react";
import {
  Mail, Download, RotateCcw, CheckCircle2, ShoppingBag, Home, Building2, Landmark,
} from "lucide-react";
import { generateComplaint, API_BASE_URL } from "../api/client";
import { PageHeader, ProgressSteps, Spinner } from "../components/ui";

const STEPS = ["Complaint Type", "Details", "Your Info", "Review"];

const TYPES = [
  { id: "consumer", label: "Consumer Complaint", icon: ShoppingBag, desc: "Defective products, refunds, poor service" },
  { id: "landlord", label: "Landlord / Security Deposit", icon: Home, desc: "Deposit disputes, rental issues" },
  { id: "workplace", label: "Workplace Grievance", icon: Building2, desc: "Unpaid dues, unfair treatment" },
  { id: "municipal", label: "Municipal Complaint", icon: Landmark, desc: "Civic issues: roads, garbage, water" },
];

const initialForm = {
  complaint_type: "",
  subject_hint: "",
  description: "",
  desired_resolution: "",
  applicant_name: "",
  applicant_address: "",
  applicant_contact: "",
  recipient_name: "",
  recipient_address: "",
};

export default function ComplaintGenerator() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const canStep1 = form.subject_hint && form.description;
  const canStep2 = form.applicant_name && form.applicant_address && form.recipient_name;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await generateComplaint(form);
      setResult(res);
      setStep(4);
    } catch (err) {
      setError("Failed to generate complaint letter. Please make sure the backend is running.");
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

  const selectedType = TYPES.find((t) => t.id === form.complaint_type);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
      <PageHeader
        eyebrow="Complaint Letter Generator"
        title="Draft a professional complaint letter"
        subtitle="Choose your complaint type, add the details, and download a formal, ready-to-send PDF letter."
      />

      {step < 4 && (
        <div className="card mt-8 p-6 sm:p-8">
          <ProgressSteps steps={STEPS} current={step} />

          <div className="mt-8">
            {step === 0 && (
              <div className="grid gap-3 sm:grid-cols-2 animate-fadeUp">
                {TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setForm((f) => ({ ...f, complaint_type: t.id }));
                      setStep(1);
                    }}
                    className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      form.complaint_type === t.id ? "border-brand-500 bg-brand-50" : "border-slate-200"
                    }`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                      <t.icon size={17} />
                    </span>
                    <span className="text-sm font-bold text-ink">{t.label}</span>
                    <span className="text-xs text-slate-500">{t.desc}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5 animate-fadeUp">
                <div>
                  <label className="label-text">Brief Subject</label>
                  <input
                    className="input-field"
                    placeholder="e.g. Defective mobile phone purchased on 12 July"
                    value={form.subject_hint}
                    onChange={update("subject_hint")}
                  />
                </div>
                <div>
                  <label className="label-text">Describe what happened</label>
                  <textarea
                    className="input-field min-h-[110px] resize-none"
                    placeholder="Explain the issue in detail..."
                    value={form.description}
                    onChange={update("description")}
                  />
                </div>
                <div>
                  <label className="label-text">Desired Resolution (optional)</label>
                  <input
                    className="input-field"
                    placeholder="e.g. Full refund within 15 days"
                    value={form.desired_resolution}
                    onChange={update("desired_resolution")}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-fadeUp">
                <h3 className="text-sm font-bold text-slate-500">Your Details</h3>
                <input
                  className="input-field"
                  placeholder="Your full name"
                  value={form.applicant_name}
                  onChange={update("applicant_name")}
                />
                <textarea
                  className="input-field min-h-[80px] resize-none"
                  placeholder="Your address"
                  value={form.applicant_address}
                  onChange={update("applicant_address")}
                />
                <input
                  className="input-field"
                  placeholder="Your contact number (optional)"
                  value={form.applicant_contact}
                  onChange={update("applicant_contact")}
                />

                <h3 className="pt-2 text-sm font-bold text-slate-500">Recipient Details</h3>
                <input
                  className="input-field"
                  placeholder="e.g. ABC Electronics Pvt Ltd / Landlord name / HR Manager"
                  value={form.recipient_name}
                  onChange={update("recipient_name")}
                />
                <textarea
                  className="input-field min-h-[80px] resize-none"
                  placeholder="Recipient address (optional)"
                  value={form.recipient_address}
                  onChange={update("recipient_address")}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fadeUp">
                <h3 className="font-semibold text-ink">Review your letter details</h3>
                <ReviewRow label="Type" value={selectedType?.label} />
                <ReviewRow label="Subject" value={form.subject_hint} />
                <ReviewRow label="Description" value={form.description} />
                <ReviewRow label="From" value={form.applicant_name} />
                <ReviewRow label="To" value={form.recipient_name} />
                {error && <p className="text-sm font-medium text-red-600">{error}</p>}
                {loading && <Spinner label="Drafting your complaint letter..." />}
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
            {step === 0 ? null : step < 3 ? (
              <button
                className="btn-primary"
                onClick={() => setStep((s) => s + 1)}
                disabled={(step === 1 && !canStep1) || (step === 2 && !canStep2)}
              >
                Continue
              </button>
            ) : (
              <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
                <Mail size={16} /> Generate Letter
              </button>
            )}
          </div>
        </div>
      )}

      {step === 4 && result && (
        <div className="card mt-8 space-y-6 p-6 sm:p-8 animate-fadeUp">
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
            <CheckCircle2 size={20} />
            <span className="text-sm font-semibold">Your complaint letter has been generated successfully!</span>
          </div>

          <div>
            <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Subject</h3>
            <p className="text-sm text-ink">{result.content.subject}</p>
          </div>
          <div>
            <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Opening</h3>
            <p className="text-sm text-ink">{result.content.opening_paragraph}</p>
          </div>
          <div>
            <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Legal Reference</h3>
            <p className="text-sm text-ink">{result.content.relevant_law_reference}</p>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">
            <a
              href={`${API_BASE_URL}${result.pdf_download_url}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              <Download size={16} /> Download PDF
            </a>
            <button className="btn-secondary" onClick={reset}>
              <RotateCcw size={16} /> Generate Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-50 pb-2 sm:flex-row sm:justify-between">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-sm text-ink sm:max-w-md sm:text-right">{value}</span>
    </div>
  );
}
