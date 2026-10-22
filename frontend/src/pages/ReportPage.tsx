import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText, TrendingUp, TrendingDown } from "lucide-react";

const API = "/api/v1";

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);

  const { data: report, isLoading, error } = useQuery({
    queryKey: ["report", projectId],
    queryFn: async () => {
      const res = await fetch(`${API}/execution/projects/${projectId}/report`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Failed to load report");
      return res.json();
    },
  });

  if (isLoading) return <div className="text-slate-400">Generating report…</div>;
  if (error || !report) {
    return (
      <div>
        <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="border border-dashed rounded-xl p-12 text-center text-slate-500">
          Report not available yet. Complete research, approval, and execution first.
        </div>
      </div>
    );
  }

  const currency = report.configuration?.currency || "INR";
  const variance = report.variance;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to project
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <FileText className="w-6 h-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Report</h1>
          <p className="text-slate-500 text-sm">{report.project_name} · Generated {new Date(report.generated_at).toLocaleString()}</p>
        </div>
      </div>

      <section className="bg-white border rounded-xl p-5 mb-4">
        <h2 className="font-semibold mb-3">Configuration</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-slate-500">Starting capital:</span> <strong>{currency} {report.configuration?.starting_capital}</strong></div>
          <div><span className="text-slate-500">Target ending cash:</span> <strong>{currency} {report.configuration?.target_ending_cash}</strong></div>
          <div><span className="text-slate-500">Location:</span> <strong>{report.configuration?.location || "—"}</strong></div>
          <div><span className="text-slate-500">Max capital at risk:</span> <strong>{currency} {report.configuration?.risk_limits?.max_capital_at_risk ?? "—"}</strong></div>
        </div>
      </section>

      {report.recommendation && (
        <section className="bg-white border rounded-xl p-5 mb-4">
          <h2 className="font-semibold mb-3">Recommended Strategy</h2>
          <p className="font-medium">{report.recommendation.name}</p>
          <p className="text-sm text-slate-600 mt-1">{report.recommendation.problem_solved}</p>
        </section>
      )}

      {report.approval && (
        <section className="bg-white border rounded-xl p-5 mb-4">
          <h2 className="font-semibold mb-3">Approval</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            report.approval.status === "approved" ? "bg-green-50 text-green-700"
            : report.approval.status === "rejected" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"
          }`}>{report.approval.status}</span>
          {report.approval.decided_at && <p className="text-sm text-slate-500 mt-2">Decided: {new Date(report.approval.decided_at).toLocaleString()}</p>}
        </section>
      )}

      <section className="bg-white border rounded-xl p-5 mb-4">
        <h2 className="font-semibold mb-3">Execution Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
          <div className="bg-slate-50 rounded-lg p-3 text-center"><p className="text-2xl font-bold">{report.actions?.total ?? 0}</p><p className="text-xs text-slate-500">Total</p></div>
          <div className="bg-blue-50 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-blue-700">{report.actions?.authorized ?? 0}</p><p className="text-xs text-slate-500">Authorized</p></div>
          <div className="bg-green-50 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-green-700">{report.actions?.executed ?? 0}</p><p className="text-xs text-slate-500">Executed</p></div>
          <div className="bg-red-50 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-red-700">{report.actions?.failed ?? 0}</p><p className="text-xs text-slate-500">Failed</p></div>
        </div>
      </section>

      {variance && (
        <section className="bg-white border rounded-xl p-5 mb-4">
          <h2 className="font-semibold mb-3">Projected vs Actual</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div><p className="text-slate-500">Target ending cash</p><p className="text-lg font-semibold">{currency} {variance.target_ending_cash}</p></div>
            <div><p className="text-slate-500">Actual ending cash</p><p className="text-lg font-semibold">{currency} {variance.actual_ending_cash}</p></div>
            <div>
              <p className="text-slate-500">Gap to target</p>
              <p className={`text-lg font-semibold flex items-center gap-1 ${variance.gap_to_target >= 0 ? "text-green-700" : "text-red-700"}`}>
                {variance.gap_to_target >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {currency} {variance.gap_to_target}
              </p>
            </div>
            <div><p className="text-slate-500">Actual net profit</p><p className="text-lg font-semibold">{currency} {variance.actual_net_profit}</p></div>
          </div>
        </section>
      )}

      <p className="text-xs text-slate-400 text-center mt-6">Report generated only from persisted, validated records. No invented numbers.</p>
    </div>
  );
}
