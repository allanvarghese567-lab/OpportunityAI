import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { projectsApi } from "../lib/api";
import {
  PlusCircle, FolderOpen, CheckCircle2, Search, ShieldCheck, Trophy, BarChart3,
} from "lucide-react";
import SpeakButton from "../components/SpeakButton";

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-slate-600", bg: "bg-slate-100" },
  configured: { label: "Configured", color: "text-green-700", bg: "bg-green-50" },
  researching: { label: "Researching", color: "text-blue-700", bg: "bg-blue-50" },
  approved: { label: "Approved", color: "text-emerald-700", bg: "bg-emerald-50" },
  rejected: { label: "Rejected", color: "text-red-700", bg: "bg-red-50" },
  completed: { label: "Completed", color: "text-purple-700", bg: "bg-purple-50" },
};

export default function DashboardPage() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.list() as Promise<any[]>,
  });

  const stats = useMemo(() => {
    const total = projects.length;
    const byStatus: Record<string, number> = {};
    for (const p of projects) byStatus[p.status] = (byStatus[p.status] || 0) + 1;
    return {
      total,
      configured: byStatus.configured || 0,
      researching: byStatus.researching || 0,
      approved: byStatus.approved || 0,
      completed: byStatus.completed || 0,
      rejected: byStatus.rejected || 0,
      draft: byStatus.draft || 0,
    };
  }, [projects]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Your opportunity research overview</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <SpeakButton
            label="Speak"
            text={`Welcome to ARTHA AI. You have ${stats.total} projects. ${stats.configured} configured, ${stats.researching} researching, ${stats.approved} approved, ${stats.completed} completed. Discover value, engineer opportunity, build wealth.`}
          />
          <Link to="/projects/new"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <PlusCircle className="w-4 h-4" /> New Project
          </Link>
        </div>
      </div>

      {!isLoading && projects.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          <StatCard icon={FolderOpen} label="Total" value={stats.total} color="text-slate-700" bg="bg-slate-50" />
          <StatCard icon={CheckCircle2} label="Configured" value={stats.configured} color="text-green-700" bg="bg-green-50" />
          <StatCard icon={Search} label="Researching" value={stats.researching} color="text-blue-700" bg="bg-blue-50" />
          <StatCard icon={ShieldCheck} label="Approved" value={stats.approved} color="text-emerald-700" bg="bg-emerald-50" />
          <StatCard icon={Trophy} label="Completed" value={stats.completed} color="text-purple-700" bg="bg-purple-50" />
        </div>
      )}

      {!isLoading && projects.length > 0 && (
        <div className="bg-white border rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <h2 className="font-semibold text-sm">Status distribution</h2>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
            {stats.total > 0 && (
              <>
                {stats.draft > 0 && <div className="bg-slate-400" style={{ width: `${(stats.draft / stats.total) * 100}%` }} />}
                {stats.configured > 0 && <div className="bg-green-400" style={{ width: `${(stats.configured / stats.total) * 100}%` }} />}
                {stats.researching > 0 && <div className="bg-blue-400" style={{ width: `${(stats.researching / stats.total) * 100}%` }} />}
                {stats.approved > 0 && <div className="bg-emerald-500" style={{ width: `${(stats.approved / stats.total) * 100}%` }} />}
                {stats.completed > 0 && <div className="bg-purple-400" style={{ width: `${(stats.completed / stats.total) * 100}%` }} />}
                {stats.rejected > 0 && <div className="bg-red-400" style={{ width: `${(stats.rejected / stats.total) * 100}%` }} />}
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
            <LegendDot color="bg-slate-400" label="Draft" />
            <LegendDot color="bg-green-400" label="Configured" />
            <LegendDot color="bg-blue-400" label="Researching" />
            <LegendDot color="bg-emerald-500" label="Approved" />
            <LegendDot color="bg-purple-400" label="Completed" />
            <LegendDot color="bg-red-400" label="Rejected" />
          </div>
        </div>
      )}

      <h2 className="font-semibold mb-4">Projects</h2>
      {isLoading ? (
        <div className="text-slate-400">Loading projects…</div>
      ) : projects.length === 0 ? (
        <div className="border border-dashed rounded-xl p-8 sm:p-12 text-center">
          <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-medium text-slate-700">No projects yet</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">Create your first opportunity research project to get started.</p>
          <Link to="/projects/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <PlusCircle className="w-4 h-4" /> Create Project
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p: any) => {
            const meta = STATUS_META[p.status] || STATUS_META.draft;
            return (
              <Link key={p.id} to={`/projects/${p.id}`}
                className="block bg-white border rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all active:scale-[0.99]">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 leading-snug">{p.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${meta.bg} ${meta.color}`}>{meta.label}</span>
                </div>
                {p.description && <p className="text-sm text-slate-500 mt-2 line-clamp-2">{p.description}</p>}
                <p className="text-xs text-slate-400 mt-3">Updated {new Date(p.updated_at).toLocaleDateString()}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: number; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-transparent`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-slate-500 font-medium">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />{label}
    </span>
  );
}
