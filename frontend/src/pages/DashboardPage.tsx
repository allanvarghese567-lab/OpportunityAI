import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { projectsApi } from "../lib/api";
import { PlusCircle, FolderOpen } from "lucide-react";

export default function DashboardPage() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.list() as Promise<any[]>,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-slate-500 mt-1">Manage your opportunity research projects</p>
        </div>
        <Link to="/projects/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <PlusCircle className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {isLoading ? (
        <div className="text-slate-400">Loading projects…</div>
      ) : projects.length === 0 ? (
        <div className="border border-dashed rounded-xl p-12 text-center">
          <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-medium text-slate-700">No projects yet</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">Create your first opportunity research project to get started.</p>
          <Link to="/projects/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <PlusCircle className="w-4 h-4" />
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p: any) => (
            <Link key={p.id} to={`/projects/${p.id}`}
              className="block bg-white border rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-slate-900">{p.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  p.status === "configured" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
                }`}>{p.status}</span>
              </div>
              {p.description && <p className="text-sm text-slate-500 mt-2 line-clamp-2">{p.description}</p>}
              <p className="text-xs text-slate-400 mt-3">Updated {new Date(p.updated_at).toLocaleDateString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
