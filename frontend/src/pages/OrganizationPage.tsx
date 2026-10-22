import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Building2, Users, Key, Webhook, ScrollText, Plus, Copy, Check, ArrowLeft } from "lucide-react";

const API = "/api/v1";
function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` };
}

export default function OrganizationPage() {
  const [tab, setTab] = useState<"orgs" | "members" | "keys" | "webhooks" | "audit">("orgs");
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: orgs = [], refetch: refetchOrgs } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await fetch(`${API}/enterprise/organizations`, { headers: authHeaders() });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const orgId = selectedOrg || (orgs as any[])[0]?.id;

  const { data: members = [] } = useQuery({
    queryKey: ["members", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const res = await fetch(`${API}/enterprise/organizations/${orgId}/members`, { headers: authHeaders() });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!orgId,
  });

  const { data: apiKeys = [], refetch: refetchKeys } = useQuery({
    queryKey: ["api-keys", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const res = await fetch(`${API}/enterprise/organizations/${orgId}/api-keys`, { headers: authHeaders() });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!orgId,
  });

  const { data: webhooks = [], refetch: refetchHooks } = useQuery({
    queryKey: ["webhooks", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const res = await fetch(`${API}/enterprise/organizations/${orgId}/webhooks`, { headers: authHeaders() });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!orgId,
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ["audit", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const res = await fetch(`${API}/enterprise/organizations/${orgId}/audit?limit=30`, { headers: authHeaders() });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!orgId && tab === "audit",
  });

  async function createOrg() {
    setCreating(true); setError("");
    try {
      const res = await fetch(`${API}/enterprise/organizations`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ name: orgName, slug: orgSlug }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed");
      setOrgName(""); setOrgSlug(""); refetchOrgs();
    } catch (err: any) { setError(err.message); }
    finally { setCreating(false); }
  }

  async function createApiKey() {
    if (!orgId) return;
    setError("");
    try {
      const res = await fetch(`${API}/enterprise/organizations/${orgId}/api-keys`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ name: "Default key", scopes: ["read", "research"] }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed");
      const data = await res.json();
      setNewKey(data.raw_key);
      refetchKeys();
    } catch (err: any) { setError(err.message); }
  }

  async function createWebhook() {
    if (!orgId) return;
    const url = prompt("Webhook URL:");
    if (!url) return;
    setError("");
    try {
      const res = await fetch(`${API}/enterprise/organizations/${orgId}/webhooks`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ url, events: ["research.completed", "approval.decided", "action.executed"] }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed");
      refetchHooks();
    } catch (err: any) { setError(err.message); }
  }

  const tabs = [
    { id: "orgs" as const, label: "Organizations", icon: Building2 },
    { id: "members" as const, label: "Members", icon: Users },
    { id: "keys" as const, label: "API Keys", icon: Key },
    { id: "webhooks" as const, label: "Webhooks", icon: Webhook },
    { id: "audit" as const, label: "Audit Log", icon: ScrollText },
  ];

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Enterprise</h1>
      <p className="text-slate-500 mb-6">Organizations, team access, API keys, webhooks, and audit trail</p>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

      {(orgs as any[]).length > 0 && (
        <div className="mb-4">
          <select value={orgId || ""} onChange={(e) => setSelectedOrg(Number(e.target.value))} className="border rounded-lg px-3 py-2 text-sm">
            {(orgs as any[]).map((o) => <option key={o.id} value={o.id}>{o.name} ({o.plan})</option>)}
          </select>
        </div>
      )}

      <div className="flex gap-1 border-b mb-6 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap ${
                tab === t.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}>
              <Icon className="w-4 h-4" />{t.label}
            </button>
          );
        })}
      </div>

      {tab === "orgs" && (
        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-5">
            <h3 className="font-semibold mb-3">Create organization</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Organization name" className="border rounded-lg px-3 py-2 text-sm" />
              <input value={orgSlug} onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="slug" className="border rounded-lg px-3 py-2 text-sm" />
            </div>
            <button onClick={createOrg} disabled={creating || !orgName || !orgSlug}
              className="mt-3 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              <Plus className="w-4 h-4" />{creating ? "Creating…" : "Create"}
            </button>
          </div>
          {(orgs as any[]).map((o) => (
            <div key={o.id} className="bg-white border rounded-xl p-4 flex justify-between items-center">
              <div><p className="font-medium">{o.name}</p><p className="text-sm text-slate-500">/{o.slug} · {o.plan}</p></div>
              <button onClick={() => setSelectedOrg(o.id)} className="text-sm text-blue-600 hover:underline">Select</button>
            </div>
          ))}
        </div>
      )}

      {tab === "members" && (
        <div className="space-y-3">
          {(members as any[]).map((m) => (
            <div key={m.id} className="bg-white border rounded-xl p-4 flex justify-between">
              <div>
                <p className="font-medium text-sm">{m.user_email || `User #${m.user_id}`}</p>
                <p className="text-xs text-slate-500">Joined {new Date(m.created_at).toLocaleDateString()}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium self-center">{m.role}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "keys" && (
        <div className="space-y-4">
          <button onClick={createApiKey} disabled={!orgId}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            <Plus className="w-4 h-4" /> Generate API Key
          </button>
          {newKey && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-medium text-amber-900 mb-1">Copy this key now — it won’t be shown again</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-white border rounded px-2 py-1 flex-1 break-all">{newKey}</code>
                <button onClick={() => { navigator.clipboard.writeText(newKey); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-2 hover:bg-amber-100 rounded">
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
          {(apiKeys as any[]).map((k) => (
            <div key={k.id} className="bg-white border rounded-xl p-4">
              <p className="font-medium text-sm">{k.name}</p>
              <p className="text-xs text-slate-500">{k.key_prefix}… · {(k.scopes || []).join(", ")} · {k.is_active ? "active" : "revoked"}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "webhooks" && (
        <div className="space-y-4">
          <button onClick={createWebhook} disabled={!orgId}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            <Plus className="w-4 h-4" /> Add Webhook
          </button>
          {(webhooks as any[]).map((w) => (
            <div key={w.id} className="bg-white border rounded-xl p-4">
              <p className="font-medium text-sm break-all">{w.url}</p>
              <p className="text-xs text-slate-500 mt-1">Events: {(w.events || []).join(", ")} · {w.is_active ? "active" : "inactive"}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "audit" && (
        <div className="space-y-2">
          {(auditLogs as any[]).map((log) => (
            <div key={log.id} className="bg-white border rounded-xl px-4 py-3 text-sm flex justify-between gap-3">
              <div>
                <span className="font-medium">{log.action}</span>
                <span className="text-slate-500"> · {log.resource_type}</span>
              </div>
              <span className="text-xs text-slate-400 shrink-0">{new Date(log.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
