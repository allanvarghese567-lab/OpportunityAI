import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, LayoutGrid, List } from "lucide-react";

function loadOpportunities(projectId: number): any[] {
  try {
    const raw = sessionStorage.getItem(`research-results-${projectId}`);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return data.opportunities || [];
  } catch {
    return [];
  }
}

export default function OpportunityExplorerPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const [searchParams] = useSearchParams();
  const currency = searchParams.get("currency") || "INR";

  const allOpps = useMemo(() => loadOpportunities(projectId), [projectId]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("score");
  const [view, setView] = useState<"cards" | "table">("cards");

  const categories = useMemo(() => {
    const set = new Set(allOpps.map((o) => o.category));
    return ["all", ...Array.from(set)];
  }, [allOpps]);

  const filtered = useMemo(() => {
    let list = [...allOpps];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (o) =>
          o.name?.toLowerCase().includes(q) ||
          o.problem_solved?.toLowerCase().includes(q) ||
          o.target_customer?.toLowerCase().includes(q)
      );
    }
    if (category !== "all") list = list.filter((o) => o.category === category);
    if (sort === "profit") {
      list.sort((a, b) => parseFloat(b.financials?.net_profit || "0") - parseFloat(a.financials?.net_profit || "0"));
    } else if (sort === "capital") {
      list.sort((a, b) => a.required_capital - b.required_capital);
    } else if (sort === "confidence") {
      const rank: Record<string, number> = { high: 3, medium: 2, low: 1 };
      list.sort((a, b) => (rank[b.confidence] || 0) - (rank[a.confidence] || 0));
    }
    return list;
  }, [allOpps, query, category, sort]);

  if (allOpps.length === 0) {
    return (
      <div>
        <Link to={`/projects/${projectId}/research`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Research
        </Link>
        <div className="border border-dashed rounded-xl p-12 text-center text-slate-500">
          <p className="font-medium">No research results yet</p>
          <p className="text-sm mt-1">Run a research workflow first, then return here to explore opportunities.</p>
          <Link to={`/projects/${projectId}/research`} className="inline-block mt-4 text-blue-600 text-sm font-medium hover:underline">
            Go to Research Workspace →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link to={`/projects/${projectId}/research`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Research
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Opportunity Explorer</h1>
          <p className="text-slate-500 mt-1">{filtered.length} of {allOpps.length} opportunities</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setView("cards")} className={`p-2 rounded-lg ${view === "cards" ? "bg-blue-50 text-blue-700" : "text-slate-400 hover:bg-slate-100"}`}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setView("table")} className={`p-2 rounded-lg ${view === "table" ? "bg-blue-50 text-blue-700" : "text-slate-400 hover:bg-slate-100"}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search opportunities…"
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          {categories.map((c) => (
            <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="score">Best match</option>
          <option value="profit">Highest profit</option>
          <option value="capital">Lowest capital</option>
          <option value="confidence">Highest confidence</option>
        </select>
      </div>

      {view === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((opp) => (
            <Link key={opp.id || opp.name}
              to={`/projects/${projectId}/opportunities/${encodeURIComponent(opp.id || opp.name)}`}
              className="block bg-white border rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900 leading-snug">{opp.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  opp.verification_status === "VERIFIED" ? "bg-green-50 text-green-700"
                  : opp.verification_status === "REJECTED" ? "bg-red-50 text-red-700"
                  : "bg-amber-50 text-amber-700"
                }`}>{opp.verification_status || opp.confidence}</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">{opp.category} · {opp.target_customer}</p>
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">{opp.problem_solved}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                <span>Capital: {currency} {opp.required_capital}</span>
                {opp.financials && <span className="text-blue-600 font-medium">Net: {currency} {opp.financials.net_profit}</span>}
                <span>{opp.estimated_time_to_sale}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Capital</th>
                <th className="px-4 py-3 font-medium">Net Profit</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((opp) => (
                <tr key={opp.id || opp.name} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link to={`/projects/${projectId}/opportunities/${encodeURIComponent(opp.id || opp.name)}`}
                      className="font-medium text-blue-600 hover:underline">{opp.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{opp.category}</td>
                  <td className="px-4 py-3">{currency} {opp.required_capital}</td>
                  <td className="px-4 py-3">{currency} {opp.financials?.net_profit ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      opp.verification_status === "VERIFIED" ? "bg-green-50 text-green-700"
                      : opp.verification_status === "REJECTED" ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                    }`}>{opp.verification_status || opp.confidence}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
