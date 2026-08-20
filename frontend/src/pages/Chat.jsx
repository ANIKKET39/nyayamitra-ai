import { useState, useRef, useEffect } from "react";
import {
  Send, Bot, User, Scale, FileClock, Landmark, ListChecks, ArrowRightCircle, Languages,
} from "lucide-react";
import { askRights } from "../api/client";
import { PageHeader, Spinner } from "../components/ui";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
];

const SUGGESTIONS = [
  "My employer hasn't paid my salary for 2 months",
  "My landlord is not returning my security deposit",
  "I bought a defective product and the shop won't refund me",
  "Police is refusing to file my FIR",
];

function GuidanceCard({ guidance }) {
  return (
    <div className="card mt-3 max-w-2xl space-y-4 p-5 animate-fadeUp">
      <p className="text-sm leading-relaxed text-ink">{guidance.plain_language_summary}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <InfoBlock icon={Scale} title="Applicable Rights" items={guidance.applicable_rights} />
        <InfoBlock icon={Landmark} title="Responsible Authority" text={guidance.responsible_authority} />
        <InfoBlock icon={ListChecks} title="Required Documents" items={guidance.required_documents} />
        <InfoBlock icon={FileClock} title="Timeline" text={guidance.timeline} />
      </div>

      <div className="rounded-xl bg-brand-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-700">
          <ArrowRightCircle size={16} /> Next Steps
        </div>
        <ol className="ml-4 list-decimal space-y-1 text-sm text-brand-900">
          {guidance.next_steps?.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>

      {guidance.disclaimer && (
        <p className="border-t border-slate-100 pt-3 text-xs italic text-slate-400">{guidance.disclaimer}</p>
      )}
    </div>
  );
}

function InfoBlock({ icon: Icon, title, items, text }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        <Icon size={14} className="text-brand-600" /> {title}
      </div>
      {items ? (
        <ul className="ml-4 list-disc space-y-0.5 text-sm text-ink">
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink">{text}</p>
      )}
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      type: "text",
      content:
        "Namaste! I'm your Rights Navigator. Describe any civic or legal problem you're facing — in English, Hindi, or Punjabi — and I'll explain your rights and what to do next.",
    },
  ]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(text) {
    const query = (text ?? input).trim();
    if (!query || loading) return;

    setMessages((m) => [...m, { role: "user", type: "text", content: query }]);
    setInput("");
    setLoading(true);

    try {
      const res = await askRights(query, language, sessionId);
      setSessionId(res.session_id);
      setMessages((m) => [...m, { role: "assistant", type: "guidance", content: res.guidance }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          type: "text",
          content:
            "Sorry, I couldn't reach the server right now. Please make sure the backend is running and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col px-5 py-10 lg:px-8">
      <PageHeader
        eyebrow="AI Rights Navigator"
        title="Ask about your rights"
        subtitle="Describe your situation in plain language — we'll explain the law, the authority to approach, and your next steps."
      />

      <div className="mt-6 flex items-center justify-center gap-2">
        <Languages size={15} className="text-slate-400" />
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              language === l.code ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="card mt-6 flex min-h-[55vh] flex-col p-5 sm:p-7">
        <div className="flex-1 space-y-5 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  m.role === "user" ? "bg-slate-800 text-white" : "bg-brand-600 text-white"
                }`}
              >
                {m.role === "user" ? <User size={15} /> : <Bot size={15} />}
              </div>
              <div className={m.role === "user" ? "flex justify-end" : ""}>
                {m.type === "text" ? (
                  <div
                    className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${
                      m.role === "user" ? "bg-brand-600 text-white" : "bg-slate-100 text-ink"
                    }`}
                  >
                    {m.content}
                  </div>
                ) : (
                  <GuidanceCard guidance={m.content} />
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                <Bot size={15} />
              </div>
              <Spinner label="Analyzing your rights..." />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 border-t border-slate-100 pt-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your problem..."
            className="input-field"
          />
          <button type="submit" className="btn-primary shrink-0" disabled={loading}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
