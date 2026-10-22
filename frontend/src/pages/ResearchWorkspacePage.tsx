import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "../lib/api";
import {
  ArrowLeft, Play, Loader2, CheckCircle2, AlertTriangle,
  Search, Calculator, Shield, Trophy,
} from "lucide-react";

interface AgentEvent {
  agent: string;
  type: string;
  message: string;
  data?: any;
  timestamp: string;
}

const AGENT_META: Record<string, { label: string; icon: any; color: string }> = {
  configuration_validator: { label: "Config Validator", icon: Shield, color: "text-slate-600" },
  market_researcher: { label: "Market Researcher", icon: Search, color: "text-blue-600" },
  financial_analyst: { label: "Financial Analyst", icon: Calculator, color: "text-purple-600" },
  scenario_planner: { label: "Scenario Planner", icon: Calculator, color: "text-indigo-600" },
  risk_validator: { label: "Risk Validator", icon: AlertTriangle, color: "text-amber-600" },
  executor: { label: "Executor", icon: Trophy, color: "text-green-600" },
  workflow: { label: "Workflow", icon: CheckCircle2, color: "text-slate-800" },
};

export default function ResearchWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.get(projectId) as Promise<any>,
    enabled: !!projectId,
  });

  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [done, setDone] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [events]);

  async function startResearch() {
    setRunning(true);
    setEvents([]);
    setOpportunities([]);
    setRecommendation(null);
    setDone(false);

    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/v1/research/projects/${projectId}/runs`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await fetch(`/api/v1/research/projects/${projectId}/stream`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok || !res.body) throw new Error("Failed to open research stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const line = part.trim();
          if (line.startsWith("data: ")) {
            try {
              const evt: AgentEvent = JSON.parse(line.slice(6));
              setEvents((prev) => [...prev, evt]);

              if (evt.agent === "financial_analyst" && evt.type === "result") {
                setOpportunities(evt.data?.opportunities || []);
              }
              if (evt.agent === "scenario_planner" && evt.type === "result") {
                if (evt.data?.opportunities) setOpportunities(evt.data.opportunities);
              }
              if (evt.agent === "risk_validator" && evt.type === "result") {
                setOpportunities(evt.data?.opportunities || []);
              }
              if (evt.agent === "executor" && evt.type === "result") {
                setRecommendation(evt.data?.recommendation || null);
                if (evt.data?.ranked_opportunities) {
                  setOpportunities(evt.data.ranked_opportunities);
                  sessionStorage.setItem(
                    `research-results-${projectId}`,
                    JSON.stringify({
                      opportunities: evt.data.ranked_opportunities,
                      recommendation: evt.data.recommendation,
                    })
                  );
                }
              }
              if (evt.type === "done") {
                setDone(true);
                setRunning(false);
              }
            } catch { /* ignore */ }
          }
        }
      }
    } catch (err: any) {
      setEvents((prev) => [
        ...prev,
        { agent: "workflow", type: "error", message: err.message || "Research failed", timestamp: new Date().toISOString() },
      ]);
    } finally {
      setRunning(false);
      setDone(true);
    }
  }

  const latestConfig = project?.configurations?.[0];

  return (
    <div>
      <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to project
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Research Workspace</h1>
          <p className="text-slate-500 mt-1">{project?.name || "…"} — live multi-agent research</p>
        </div>
        <button onClick={startResearch} disabled={running || !latestConfig}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {running ? (<><Loader2 className="w-4 h-4 animate-spin" /> Running…</>) : (<><Play className="w-4 h-4" /> Start Research</>)}
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white border rounded-xl shadow-sm flex flex-col max-h-[600px]">
          <div className="px-4 py-3 border-b font-medium text-sm">Agent Activity</div>
          <div ref={logRef} className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
            {events.length === 0 && (
              <p className="text-slate-400 text-center py-8">Click “Start Research” to begin the multi-agent workflow.</p>
            )}
            {events.map((evt, i) => {
              const meta = AGENT_META[evt.agent] || AGENT_META.workflow;
              const Icon = meta.icon;
              return (
                <div key={i} className="flex gap-2">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${meta.color}`} />
                  <div>
                    <span className="font-medium text-xs text-slate-500">{meta.label}</span>
                    <p className={evt.type === "error" ? "text-red-600" : evt.type === "warning" ? "text-amber-700" : "text-slate-800"}>{evt.message}</p>
                  </div>
                </div>
              );
            })}
            {running && (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" /> Agents working…
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {done && opportunities.length > 0 && (
            <div className="flex justify-end">
              <Link to={`/projects/${projectId}/opportunities`} className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline">
                Open Opportunity Explorer →
              </Link>
            </div>
          )}

          {recommendation && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-green-700" />
                <h2 className="font-semibold text-green-900">Recommended Strategy</h2>
              </div>
              <h3 className="text-lg font-medium">{recommendation.name}</h3>
              <p className="text-sm text-green-800 mt-1">{recommendation.problem_solved}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-green-700">Required capital:</span> <strong>{latestConfig?.currency} {recommendation.required_capital}</strong></div>
                <div><span className="text-green-700">Est. time:</span> <strong>{recommendation.estimated_time_to_sale}</strong></div>
                <div><span className="text-green-700">Confidence:</span> <strong>{recommendation.confidence}</strong></div>
                <div><span className="text-green-700">Verification:</span> <strong>{recommendation.verification_status}</strong></div>
              </div>
              {recommendation.financials && (
                <div className="mt-3 text-sm bg-white/60 rounded-lg p-3">
                  <span className="text-green-700">Base net profit:</span> <strong>{latestConfig?.currency} {recommendation.financials.net_profit}</strong>
                  {" · "}
                  <span className="text-green-700">Margin:</span> <strong>{recommendation.financials.margin_pct}%</strong>
                </div>
              )}
            </div>
          )}

          {opportunities.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Opportunities ({opportunities.length})</h2>
              <div className="space-y-3">
                {opportunities.map((opp, i) => (
                  <Link key={i} to={`/projects/${projectId}/opportunities/${encodeURIComponent(opp.id || opp.name)}`}
                    className="block bg-white border rounded-xl p-4 hover:border-blue-200 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium">{opp.name}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">{opp.category} · {opp.target_customer}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        opp.verification_status === "VERIFIED" ? "bg-green-50 text-green-700"
                        : opp.verification_status === "REJECTED" ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                      }`}>{opp.verification_status || opp.confidence}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">{opp.demand_evidence}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>Cost: {latestConfig?.currency} {opp.estimated_acquisition_cost}</span>
                      <span>Sell: {latestConfig?.currency} {opp.observed_selling_price_low}–{opp.observed_selling_price_high}</span>
                      <span>Time: {opp.estimated_time_to_sale}</span>
                      {opp.financials && <span className="text-blue-600 font-medium">Net: {latestConfig?.currency} {opp.financials.net_profit}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {done && opportunities.length === 0 && !recommendation && (
            <div className="border border-dashed rounded-xl p-8 text-center text-slate-500">
              Research finished — no eligible opportunities found under current constraints.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
