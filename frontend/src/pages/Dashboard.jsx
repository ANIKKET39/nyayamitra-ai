import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import {
  FileText, Mail, ClipboardCheck, MessageSquareText, Download, FileClock,
} from "lucide-react";
import { getDashboardSummary, API_BASE_URL } from "../api/client";
import { PageHeader, Spinner, Badge } from "../components/ui";

const COLORS = ["#2563EB", "#60A5FA", "#93C5FD", "#1E40AF", "#3B82F6"];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboardSummary()
      .then(setData)
      .catch(() => setError("Could not load dashboard. Please ensure the backend is running."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading dashboard..." />;
  if (error)
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center text-sm text-red-600">{error}</div>
    );

  const { stats, complaint_type_breakdown, recent_documents } = data;

  const statCards = [
    { icon: FileText, label: "RTI Applications", value: stats.rti_generated, color: "bg-brand-600" },
    { icon: Mail, label: "Complaint Letters", value: stats.complaints_generated, color: "bg-indigo-600" },
    { icon: ClipboardCheck, label: "Eligibility Checks", value: stats.eligibility_checks, color: "bg-blue-500" },
    { icon: MessageSquareText, label: "Chat Sessions", value: stats.chat_sessions, color: "bg-cyan-600" },
  ];

  const barData = statCards.map((s) => ({ name: s.label.split(" ")[0], value: s.value }));

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
      <PageHeader
        eyebrow="Your Dashboard"
        title="Documents & Activity Overview"
        subtitle="Track every RTI application, complaint letter, and eligibility check you've generated."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="card p-5">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color} text-white`}>
              <s.icon size={18} />
            </span>
            <p className="mt-4 text-2xl font-extrabold text-ink">{s.value}</p>
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-3">
          <h3 className="mb-4 text-sm font-bold text-ink">Activity Overview</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 13 }}
                cursor={{ fill: "#EFF4FF" }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#2563EB" maxBarSize={56} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold text-ink">Complaint Types</h3>
          {complaint_type_breakdown?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={complaint_type_breakdown}
                  dataKey="count"
                  nameKey="type"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {complaint_type_breakdown.map((entry, i) => (
                    <Cell key={entry.type} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[260px] items-center justify-center text-sm text-slate-400">
              No complaint letters generated yet
            </div>
          )}
        </div>
      </div>

      <div className="card mt-8 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink">
          <FileClock size={16} className="text-brand-600" /> Recent Documents
        </h3>
        {recent_documents?.length ? (
          <div className="divide-y divide-slate-50">
            {recent_documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between gap-4 py-3.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge tone="brand">{doc.type}</Badge>
                    <span className="text-xs text-slate-400">
                      {new Date(doc.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-ink">{doc.title}</p>
                </div>
                <a
                  href={`${API_BASE_URL}${doc.download_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary shrink-0 px-3 py-1.5 text-xs"
                >
                  <Download size={13} /> PDF
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-slate-400">
            No documents generated yet. Try the RTI Generator or Complaint Letter tools!
          </div>
        )}
      </div>
    </div>
  );
}
