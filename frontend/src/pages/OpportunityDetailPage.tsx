import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, TrendingUp, AlertTriangle, FileText, BarChart3, Shield, BookOpen } from "lucide-react";

function loadOpportunity(projectId: number, oppId: string): any | null {
  try {
    const raw = sessionStorage.getItem(`research-results-${projectId}`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const opps = data.opportunities || [];
    return opps.find((o: any) => o.id === oppId || o.name === decodeURIComponent(oppId)) || null;
  } catch {
    return null;
  }
}

const TABS = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "financial", label: "Financial", icon: TrendingUp },
  { id: "scenarios", label: "Scenarios", icon: BarChart3 },
  { id: "risk", label: "Risk", icon: Shield },
  { id: "evidence", label: "Evidence", icon: BookOpen },
];

export default function OpportunityDetailPage() {
  const { id, oppId } = useParams<{ id: string; oppId: string }>();
  const projectId = Number(id);
  const [tab, setTab] = useState("overview");
  const opp = useMemo(() => loadOpportunity(projectId, oppId || ""), [projectId, oppId]);

  if (!opp) {
    return (
      <div>
        <Link to={`/projects/${projectId}/opportunities`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Explorer
        </Link>
        <div className="border border-dashed rounded-xl p-12 text-center text-slate-500">Opportunity not found. Run research first.</div>
      </div>
    );
  }

  const currency = "INR";
  const plan = opp.scenario_plan;
  const scenarios = plan?.scenarios || opp.scenarios || {};

  return (
    <div>
      <Link to={`/projects/${projectId}/opportunities`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Explorer
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{opp.name}</h1>
          <p className="text-slate-500 mt-1">{opp.category} · {opp.target_customer}</p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
          opp.verification_status === "VERIFIED" ? "bg-green-50 text-green-700"
          : opp.verification_status === "REJECTED" ? "bg-red-50 text-red-700"
          : "bg-amber-50 text-amber-700"
        }`}>{opp.verification_status || opp.confidence}</span>
      </div>

      <div className="flex gap-1 border-b mb-6 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}>
              <Icon className="w-4 h-4" />{t.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold mb-3">Problem & Demand</h2>
            <p className="text-sm text-slate-700">{opp.problem_solved}</p>
            <p className="text-sm text-slate-500 mt-2">{opp.demand_evidence}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white border rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Required capital</p>
              <p className="text-lg font-semibold">{currency} {opp.required_capital}</p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Est. time to sale</p>
              <p className="text-lg font-semibold">{opp.estimated_time_to_sale}</p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Confidence</p>
              <p className="text-lg font-semibold capitalize">{opp.confidence}</p>
            </div>
          </div>
          {opp.notes && <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">{opp.notes}</div>}
        </div>
      )}

      {tab === "financial" && opp.financials && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ["Acquisition cost", opp.financials.acquisition_cost],
              ["Selling price", opp.financials.selling_price],
              ["Total cost", opp.financials.total_cost],
              ["Net profit", opp.financials.net_profit],
              ["Gross profit", opp.financials.gross_profit],
              ["Margin %", `${opp.financials.margin_pct}%`],
              ["Fees", opp.financials.fees],
              ["Capital at risk", opp.financials.total_cost],
            ].map(([label, value]) => (
              <div key={label as string} className="bg-white border rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="text-lg font-semibold">
                  {typeof value === "string" && value.includes("%") ? value : `${currency} ${value}`}
                </p>
              </div>
            ))}
          </div>
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold mb-2">Price range observed</h2>
            <p className="text-sm text-slate-600">Low: {currency} {opp.observed_selling_price_low} · High: {currency} {opp.observed_selling_price_high}</p>
          </div>
        </div>
      )}

      {tab === "scenarios" && (
        <div className="space-y-4">
          {Object.entries(scenarios).map(([key, sc]: [string, any]) => (
            <div key={key} className={`bg-white border rounded-xl p-5 ${sc.meets_target ? "border-green-200" : ""}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold capitalize">{key.replace(/_/g, " ")}</h3>
                {sc.meets_target !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    sc.meets_target ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
                  }`}>{sc.meets_target ? "Meets target" : "Below target"}</span>
                )}
              </div>
              {sc.narrative && <p className="text-sm text-slate-600 mb-3">{sc.narrative}</p>}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div><span className="text-slate-500">Ending cash</span><p className="font-medium">{currency} {sc.ending_cash}</p></div>
                <div><span className="text-slate-500">Net profit</span><p className="font-medium">{currency} {sc.net_profit}</p></div>
                <div><span className="text-slate-500">ROI</span><p className="font-medium">{sc.roi_pct}%</p></div>
                <div><span className="text-slate-500">Capital at risk</span><p className="font-medium">{currency} {sc.capital_at_risk}</p></div>
              </div>
            </div>
          ))}
          {plan?.recovery && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h3 className="font-semibold text-blue-900 mb-1">Recovery alternative</h3>
              <p className="text-sm text-blue-800">{plan.recovery.description}</p>
              <p className="text-sm mt-2 text-blue-700">Required capital: {currency} {plan.recovery.required_capital} · Est. net: {currency} {plan.recovery.estimated_net}</p>
            </div>
          )}
        </div>
      )}

      {tab === "risk" && (
        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Main risks
            </h2>
            {opp.main_risks?.length ? (
              <ul className="space-y-2">{opp.main_risks.map((r: string, i: number) => (
                <li key={i} className="text-sm text-slate-700 flex gap-2"><span className="text-amber-500">•</span> {r}</li>
              ))}</ul>
            ) : <p className="text-sm text-slate-500">No specific risks listed.</p>}
          </div>
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold mb-2">Verification status</h2>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              opp.verification_status === "VERIFIED" ? "bg-green-50 text-green-700"
              : opp.verification_status === "REJECTED" ? "bg-red-50 text-red-700"
              : "bg-amber-50 text-amber-700"
            }`}>{opp.verification_status}</span>
            <p className="text-xs text-slate-500 mt-2">Verification reflects evidence quality, not guaranteed profitability.</p>
          </div>
        </div>
      )}

      {tab === "evidence" && (
        <div className="space-y-3">
          {opp.evidence?.length ? opp.evidence.map((e: any, i: number) => (
            <div key={i} className="bg-white border rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{e.source_name}</p>
                  <p className="text-sm text-slate-600 mt-1">{e.claim}</p>
                  {e.source_url && <a href={e.source_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">{e.source_url}</a>}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">{e.verification_status}</span>
              </div>
            </div>
          )) : (
            <div className="border border-dashed rounded-xl p-8 text-center text-slate-500 text-sm">No structured evidence attached.</div>
          )}
        </div>
      )}
    </div>
  );
}
