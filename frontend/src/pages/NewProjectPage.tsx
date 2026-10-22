import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { projectsApi } from "../lib/api";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const steps = ["Project Info", "Objective", "Preferences", "Resources", "Risk Limits", "Priorities", "Confirm"];

type FormData = {
  name: string;
  description?: string;
  starting_capital: number;
  target_ending_cash: number;
  deadline?: string;
  location?: string;
  currency: string;
  opportunity_types: string[];
  available_time: string;
  skills: string;
  max_capital_at_risk: number;
  max_single_loss: number;
  priority_speed: number;
  priority_profit: number;
  priority_safety: number;
  notes?: string;
};

export default function NewProjectPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      starting_capital: 1,
      target_ending_cash: 2,
      currency: "INR",
      opportunity_types: ["product", "resale", "service"],
      available_time: "1 day",
      skills: "",
      max_capital_at_risk: 1,
      max_single_loss: 1,
      priority_speed: 5,
      priority_profit: 5,
      priority_safety: 8,
      notes: "",
    },
  });

  const { register, watch, setValue, getValues } = form;
  const values = watch();

  function next() { setStep((s) => Math.min(s + 1, steps.length - 1)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  async function onSubmit() {
    setLoading(true);
    setError("");
    try {
      const data = getValues();
      const project = (await projectsApi.create({ name: data.name, description: data.description })) as any;
      const config = (await projectsApi.createConfig(project.id, {
        starting_capital: data.starting_capital,
        target_ending_cash: data.target_ending_cash,
        deadline: data.deadline || null,
        location: data.location || null,
        currency: data.currency,
        opportunity_preferences: { types: data.opportunity_types },
        resources: { available_time: data.available_time, skills: data.skills },
        risk_limits: { max_capital_at_risk: data.max_capital_at_risk, max_single_loss: data.max_single_loss },
        priorities: { speed: data.priority_speed, profit: data.priority_profit, safety: data.priority_safety },
        notes: data.notes,
      })) as any;
      await projectsApi.confirmConfig(project.id, config.id);
      navigate(`/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  const opportunityOptions = [
    { id: "product", label: "Physical Product" },
    { id: "resale", label: "Resale / Arbitrage" },
    { id: "service", label: "Service / Freelance" },
    { id: "commission", label: "Commission / Affiliate" },
    { id: "digital", label: "Digital Product" },
    { id: "local", label: "Local Market" },
  ];

  function toggleType(id: string) {
    const current = values.opportunity_types || [];
    setValue("opportunity_types", current.includes(id) ? current.filter((t) => t !== id) : [...current, id]);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">New Opportunity Project</h1>
      <p className="text-slate-500 mb-8">Configure your objective and constraints step by step.</p>

      <div className="flex gap-1 mb-8">
        {steps.map((label, i) => (
          <div key={label} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? "bg-blue-600" : "bg-slate-200"}`} />
            <p className={`text-[10px] mt-1 truncate ${i === step ? "text-blue-600 font-medium" : "text-slate-400"}`}>{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Project Info</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Project name *</label>
              <input {...register("name")} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. ₹1 → ₹2 in one day" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea {...register("description")} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Objective</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Starting capital *</label>
                <input type="number" step="0.01" {...register("starting_capital")} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target ending cash *</label>
                <input type="number" step="0.01" {...register("target_ending_cash")} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select {...register("currency")} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input {...register("location")} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Kerala, India" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Opportunity Preferences</h2>
            <div className="grid grid-cols-2 gap-3">
              {opportunityOptions.map((opt) => {
                const selected = (values.opportunity_types || []).includes(opt.id);
                return (
                  <button key={opt.id} type="button" onClick={() => toggleType(opt.id)}
                    className={`text-left border rounded-lg px-4 py-3 text-sm ${selected ? "border-blue-500 bg-blue-50 text-blue-800" : "hover:border-slate-300"}`}>
                    {selected && <Check className="w-4 h-4 inline mr-1.5" />}{opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Resources & Constraints</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Available time</label>
              <input {...register("available_time")} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 1 day" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Skills / tools you already have</label>
              <textarea {...register("skills")} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Risk Limits</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Maximum capital at risk ({values.currency})</label>
              <input type="number" step="0.01" {...register("max_capital_at_risk")} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Maximum single loss ({values.currency})</label>
              <input type="number" step="0.01" {...register("max_single_loss")} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h2 className="font-semibold text-lg">Priorities (1–10)</h2>
            {[{"key": "priority_speed", "label": "Speed"}, {"key": "priority_profit", "label": "Profit"}, {"key": "priority_safety", "label": "Safety"}].map((item) => (
              <div key={item.key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-slate-500">{(values as any)[item.key]}</span>
                </div>
                <input type="range" min={1} max={10} {...register(item.key as any)} className="w-full" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium mb-1">Additional notes</label>
              <textarea {...register("notes")} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Confirm Configuration</h2>
            <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-2">
              <p><strong>Project:</strong> {values.name}</p>
              <p><strong>Goal:</strong> {values.currency} {values.starting_capital} → {values.currency} {values.target_ending_cash}</p>
              <p><strong>Location:</strong> {values.location || "—"}</p>
              <p><strong>Types:</strong> {(values.opportunity_types || []).join(", ")}</p>
              <p><strong>Max capital at risk:</strong> {values.currency} {values.max_capital_at_risk}</p>
              <p><strong>Priorities:</strong> Speed {values.priority_speed} · Profit {values.priority_profit} · Safety {values.priority_safety}</p>
            </div>
            <p className="text-sm text-slate-500">Once confirmed, this configuration becomes immutable.</p>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex justify-between mt-8 pt-4 border-t">
          <button type="button" onClick={back} disabled={step === 0}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < steps.length - 1 ? (
            <button type="button" onClick={next}
              className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={onSubmit} disabled={loading}
              className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
              {loading ? "Creating…" : "Confirm & Create"} <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
