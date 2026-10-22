import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "../lib/api";
import { ArrowLeft, Plus, ShieldCheck, Play, CheckCircle2, FileText } from "lucide-react";

const API = "/api/v1";
function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` };
}

export default function ExecutionPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.get(projectId) as Promise<any>,
  });

  const { data: actions = [], refetch } = useQuery({
    queryKey: ["actions", projectId],
    queryFn: async () => {
      const res = await fetch(`${API}/execution/projects/${projectId}/actions`, { headers: authHeaders() });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: approvals = [] } = useQuery({
    queryKey: ["approvals", projectId],
    queryFn: async () => {
      const res = await fetch(`${API}/execution/projects/${projectId}/approvals`, { headers: authHeaders() });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const approved = (approvals as any[]).find((a) => a.status === "approved");
  const currency = project?.configurations?.[0]?.currency || "INR";

  const [showForm, setShowForm] = useState(false);
  const [actionType, setActionType] = useState("purchase");
  const [description, setDescription] = useState("");
  const [estCost, setEstCost] = useState("0");
  const [estRevenue, setEstRevenue] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [execCost, setExecCost] = useState<Record<number, string>>({});
  const [execRevenue, setExecRevenue] = useState<Record<number, string>>({});

  async function addAction() {
    if (!approved) { setError("No approved strategy."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/execution/projects/${projectId}/approvals/${approved.id}/actions`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ action_type: actionType, description, estimated_cost: parseFloat(estCost) || 0, estimated_revenue: parseFloat(estRevenue) || 0 }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed");
      setShowForm(false); setDescription(""); setEstCost("0"); setEstRevenue("0");
      refetch();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function authorize(actionId: number) {
    setLoading(true);
    try {
      const res = await fetch(`${API}/execution/projects/${projectId}/actions/${actionId}/authorize`, { method: "POST", headers: authHeaders() });
      if (!res.ok) throw new Error((await res.json()).detail || "Authorize failed");
      refetch();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function execute(actionId: number) {
    setLoading(true);
    try {
      const res = await fetch(`${API}/execution/projects/${projectId}/actions/${actionId}/execute`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ actual_cost: parseFloat(execCost[actionId] || "0") || 0, actual_revenue: parseFloat(execRevenue[actionId] || "0") || 0 }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Execute failed");
      refetch();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = { pending: "bg-slate-100 text-slate-600", authorized: "bg-blue-50 text-blue-700", executed: "bg-green-50 text-green-700", failed: "bg-red-50 text-red-700" };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[s] || colors.pending}`}>{s}</span>;
  };

  return (
    <div>
      <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to project
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Execution Control</h1>
          <p className="text-slate-500 mt-1">Authorize and track individual actions under the approved strategy</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/projects/${projectId}/report`} className="inline-flex items-center gap-2 border px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
            <FileText className="w-4 h-4" /> Report
          </Link>
          {approved && (
            <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              <Plus className="w-4 h-4" /> Add Action
            </button>
          )}
        </div>
      </div>

      {!approved && (
        <div className="border border-dashed rounded-xl p-8 text-center text-slate-500 mb-6">
          <p className="font-medium">No approved strategy</p>
          <Link to={`/projects/${projectId}/approval`} className="inline-block mt-3 text-blue-600 text-sm font-medium hover:underline">Go to Approval →</Link>
        </div>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

      {showForm && (
        <div className="bg-white border rounded-xl p-5 mb-6 space-y-4">
          <h3 className="font-semibold">New Execution Action</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Action type</label>
              <select value={actionType} onChange={(e) => setActionType(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="purchase">Purchase</option>
                <option value="list_item">List for sale</option>
                <option value="collect_payment">Collect payment</option>
                <option value="deliver">Deliver</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="What will be done?" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Est. cost ({currency})</label>
              <input type="number" step="0.01" value={estCost} onChange={(e) => setEstCost(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Est. revenue ({currency})</label>
              <input type="number" step="0.01" value={estRevenue} onChange={(e) => setEstRevenue(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <button onClick={addAction} disabled={loading || !description} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Adding…" : "Add Action"}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {(actions as any[]).length === 0 && approved && (
          <div className="border border-dashed rounded-xl p-8 text-center text-slate-400 text-sm">No actions yet. Add an action to begin execution.</div>
        )}
        {(actions as any[]).map((action: any) => (
          <div key={action.id} className="bg-white border rounded-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{action.description}</h3>
                  {statusBadge(action.status)}
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {action.action_type} · Est. cost {currency} {action.estimated_cost}
                  {action.estimated_revenue > 0 && ` · Est. revenue ${currency} ${action.estimated_revenue}`}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {action.status === "pending" && (
                  <button onClick={() => authorize(action.id)} disabled={loading}
                    className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
                    <ShieldCheck className="w-3.5 h-3.5" /> Authorize
                  </button>
                )}
                {action.status === "authorized" && (
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex gap-2">
                      <input type="number" step="0.01" placeholder="Actual cost" value={execCost[action.id] || ""}
                        onChange={(e) => setExecCost({ ...execCost, [action.id]: e.target.value })} className="border rounded px-2 py-1 text-xs w-24" />
                      <input type="number" step="0.01" placeholder="Actual revenue" value={execRevenue[action.id] || ""}
                        onChange={(e) => setExecRevenue({ ...execRevenue, [action.id]: e.target.value })} className="border rounded px-2 py-1 text-xs w-28" />
                    </div>
                    <button onClick={() => execute(action.id)} disabled={loading}
                      className="inline-flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50">
                      <Play className="w-3.5 h-3.5" /> Record Execution
                    </button>
                  </div>
                )}
                {action.status === "executed" && (
                  <span className="inline-flex items-center gap-1 text-green-700 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Cost {currency} {action.actual_cost ?? "—"} · Revenue {currency} {action.actual_revenue ?? "—"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
