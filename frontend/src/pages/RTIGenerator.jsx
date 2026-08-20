import { useState } from "react";
import { FileText, Download, RotateCcw, CheckCircle2 } from "lucide-react";
import { generateRTI, API_BASE_URL } from "../api/client";
import { PageHeader, ProgressSteps, Spinner } from "../components/ui";

const STEPS = ["Issue Details", "Your Details", "Review & Generate"];

const initialForm = {
  department: "",
  issue: "",
  location: "",
  applicant_name: "",
  applicant_address: "",
  applicant_contact: "",
};

export default function RTIGenerator() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const canProceedStep0 = form.department && form.issue && form.location;
  const canProceedStep1 = form.applicant_name && form.applicant_address;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await generateRTI(form);
      setResult(res);
      setStep(3);
    } catch (err) {
      setError("Failed to generate RTI application. Please check the backend is running.");
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

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
      <PageHeader
        eyebrow="RTI Draft Generator"
        title="Generate your RTI application"
        subtitle="File a Right to Information request in three quick steps — get a legally formatted, downloadable PDF."
      />

      {step < 3 && (
        <div className="card mt-8 p-6 sm:p-8">
          <ProgressSteps steps={STEPS} current={step} />

          <div className="mt-8">
            {step === 0 && (
              <div className="space-y-5 animate-fadeUp">
                <div>
                  <label className="label-text">Department / Public Authority</label>
                  <input
                    className="input-field"
                    placeholder="e.g. Municipal Corporation of Delhi"
                    value={form.department}
                    onChange={update("department")}
                  />
                </div>
                <div>
                  <label className="label-text">Describe your issue</label>
                  <textarea
                    className="input-field min-h-[110px] resize-none"
                    placeholder="e.g. Delay of 3 months in issuing my birth certificate despite submitting all documents"
                    value={form.issue}
                    onChange={update("issue")}
                  />
                </div>
                <div>
                  <label className="label-text">Location / Jurisdiction</label>
                  <input
                    className="input-field"
                    placeholder="e.g. Delhi"
                    value={form.location}
                    onChange={update("location")}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5 animate-fadeUp">
                <div>
                  <label className="label-text">Full Name</label>
                  <input
                    className="input-field"
                    placeholder="e.g. Ramesh Kumar"
                    value={form.applicant_name}
                    onChange={update("applicant_name")}
                  />
                </div>
                <div>
                  <label className="label-text">Address</label>
                  <textarea
                    className="input-field min-h-[90px] resize-none"
                    placeholder="Your full postal address"
                    value={form.applicant_address}
                    onChange={update("applicant_address")}
                  />
                </div>
                <div>
                  <label className="label-text">Contact Number (optional)</label>
                  <input
                    className="input-field"
                    placeholder="e.g. 9876543210"
                    value={form.applicant_contact}
                    onChange={update("applicant_contact")}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fadeUp">
                <h3 className="font-semibold text-ink">Review your details</h3>
                <ReviewRow label="Department" value={form.department} />
                <ReviewRow label="Issue" value={form.issue} />
                <ReviewRow label="Location" value={form.location} />
                <ReviewRow label="Applicant" value={form.applicant_name} />
                <ReviewRow label="Address" value={form.applicant_address} />
                {form.applicant_contact && <ReviewRow label="Contact" value={form.applicant_contact} />}
                {error && <p className="text-sm font-medium text-red-600">{error}</p>}
                {loading && <Spinner label="Drafting your RTI application..." />}
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
                disabled={(step === 0 && !canProceedStep0) || (step === 1 && !canProceedStep1)}
              >
                Continue
              </button>
            ) : (
              <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
                <FileText size={16} /> Generate RTI PDF
              </button>
            )}
          </div>
        </div>
      )}

      {step === 3 && result && (
        <div className="card mt-8 space-y-6 p-6 sm:p-8 animate-fadeUp">
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
            <CheckCircle2 size={20} />
            <span className="text-sm font-semibold">Your RTI application has been generated successfully!</span>
          </div>

          <div>
            <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Subject</h3>
            <p className="text-sm text-ink">{result.content.subject}</p>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Information Requested</h3>
            <ol className="ml-4 list-decimal space-y-1.5 text-sm text-ink">
              {result.content.information_requested.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </div>

          {result.content.grounds && (
            <div>
              <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Grounds</h3>
              <p className="text-sm text-ink">{result.content.grounds}</p>
            </div>
          )}

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
