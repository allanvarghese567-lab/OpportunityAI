import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "../lib/api";
import { ArrowLeft, CheckCircle2, FlaskConical } from "lucide-react";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.get(projectId) as Promise<any>,
    enabled: !!projectId,
  });

  if (isLoading) return <div className="text-slate-400">Loading project…</div>;
  if (!project) return <div className="text-red-600">Project not found</div>;

  const latestConfig = project.configurations?.[0];

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to projects
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          {project.description && <p className="text-slate-500 mt-1">{project.description}</p>}
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
          project.status === "configured" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
        }`}>{project.status}</span>
      </div>

      {latestConfig ? (
        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold">Configuration <span className="text-slate-400 font-normal">({latestConfig.status})</span></h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Objective</p>
              <p className="font-medium text-lg">{latestConfig.currency} {latestConfig.starting_capital} → {latestConfig.currency} {latestConfig.target_ending_cash}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Location</p>
              <p className="font-medium">{latestConfig.location || "—"}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Opportunity types</p>
              <p className="font-medium">{(latestConfig.opportunity_preferences?.types || []).join(", ") || "—"}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Max capital at risk</p>
              <p className="font-medium">{latestConfig.currency} {latestConfig.risk_limits?.max_capital_at_risk ?? "—"}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Priorities</p>
              <p className="font-medium">Speed {latestConfig.priorities?.speed ?? "—"} · Profit {latestConfig.priorities?.profit ?? "—"} · Safety {latestConfig.priorities?.safety ?? "—"}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Confirmed at</p>
              <p className="font-medium">{latestConfig.confirmed_at ? new Date(latestConfig.confirmed_at).toLocaleString() : "—"}</p>
            </div>
          </div>

          {latestConfig.notes && (
            <div>
              <p className="text-slate-500 text-sm mb-1">Notes</p>
              <p className="text-sm">{latestConfig.notes}</p>
            </div>
          )}

          <div className="pt-4 border-t space-y-3">
            <p className="text-sm text-slate-500">Configuration confirmed. Continue the workflow:</p>
            <div className="flex flex-wrap gap-2">
              <Link to={`/projects/${projectId}/research`}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                <FlaskConical className="w-4 h-4" /> Research
              </Link>
              <Link to={`/projects/${projectId}/opportunities`}
                className="inline-flex items-center gap-2 border px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                Opportunities
              </Link>
              <Link to={`/projects/${projectId}/approval`}
                className="inline-flex items-center gap-2 border px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                Approval
              </Link>
              <Link to={`/projects/${projectId}/execution`}
                className="inline-flex items-center gap-2 border px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                Execution
              </Link>
              <Link to={`/projects/${projectId}/report`}
                className="inline-flex items-center gap-2 border px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                Report
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-dashed rounded-xl p-8 text-center text-slate-500">No configuration found.</div>
      )}
    </div>
  );
}
