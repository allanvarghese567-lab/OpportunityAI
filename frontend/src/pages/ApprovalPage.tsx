import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../lib/api";
import { ArrowLeft, CheckCircle2, XCircle, Trophy } from "lucide-react";

const API = "/api/v1";
function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` };
}

export default function ApprovalPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.get(projectId) as Promise<any>,
  });

  let recommendation: any = null;
  try {
    const raw = sessionStorage.getItem(`research-results-${projectId}`);
    if (raw) recommendation = JSON.parse(raw).recommendation;
  } catch { /* ignore */ }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  async function decide(status: "approved" | "rejected") {
    if (!recommendation) { setError("No recommendation found. Run research first."); return; }
    setLoading(true); setError("");
    try {
      const createRes = await fetch(`${API}/execution/projects/${projectId}/approvals`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ strategy_snapshot: recommendation, rationale: "User review of executor recommendation" }),
      });
      if (!createRes.ok) throw new Error((await createRes.json()).detail || "Failed to create approval");
      const approval = await createRes.json();

      const decideRes = await fetch(`${API}/execution/projects/${projectId}/approvals/${approval.id}/decide`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ status, rejection_reason: status === "rejected" ? rejectReason : undefined }),
      });
      if (!decideRes.ok) throw new Error((await decideRes.json()).detail || "Failed to decide");

      qc.invalidateQueries({ queryKey: ["project", projectId] });
      navigate(status === "approved" ? `/projects/${projectId}/execution` : `/projects/${projectId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const currency = project?.configurations?.[0]?.currency || "INR";

  return (
    <div className="max-w-2xl mx-auto">
      <Link to={`/projects/${projectId}/research`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Research
      </Link>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Approve Strategy</h1>
      <p className="text-slate-500 mb-8">Review the recommended strategy and approve or reject it.</p>

      {!recommendation ? (
        <div className="border border-dashed rounded-xl p-12 text-center text-slate-500">
          <p className="font-medium">No recommendation available</p>
          <p className="text-sm mt-1">Run a research workflow first.</p>
          <Link to={`/projects/${projectId}/research`} className="inline-block mt-4 text-blue-600 text-sm font-medium hover:underline">Go to Research Workspace →</Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-green-700" />
              <h2 className="font-semibold text-green-900">Recommended Strategy</h2>
            </div>
            <h3 className="text-lg font-medium">{recommendation.name}</h3>
            <p className="text-sm text-green-800 mt-1">{recommendation.problem_solved}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-green-700">Required capital:</span> <strong>{currency} {recommendation.required_capital}</strong></div>
              <div><span className="text-green-700">Est. time:</span> <strong>{recommendation.estimated_time_to_sale}</strong></div>
              <div><span className="text-green-700">Confidence:</span> <strong>{recommendation.confidence}</strong></div>
              <div><span className="text-green-700">Verification:</span> <strong>{recommendation.verification_status}</strong></div>
            </div>
            {recommendation.financials && (
              <div className="mt-3 text-sm bg-white/60 rounded-lg p-3">
                Net profit: <strong>{currency} {recommendation.financials.net_profit}</strong> · Margin: <strong>{recommendation.financials.margin_pct}%</strong>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          {showReject ? (
            <div className="bg-white border rounded-xl p-5 space-y-4">
              <h3 className="font-semibold">Rejection reason</h3>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Why are you rejecting this strategy?" />
              <div className="flex gap-3">
                <button onClick={() => decide("rejected")} disabled={loading}
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                  <XCircle className="w-4 h-4" />{loading ? "Rejecting…" : "Confirm Reject"}
                </button>
                <button onClick={() => setShowReject(false)} className="text-sm text-slate-600">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => decide("approved")} disabled={loading}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                <CheckCircle2 className="w-4 h-4" />{loading ? "Approving…" : "Approve Strategy"}
              </button>
              <button onClick={() => setShowReject(true)} disabled={loading}
                className="inline-flex items-center gap-2 border border-red-200 text-red-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50">
                <XCircle className="w-4 h-4" />Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
