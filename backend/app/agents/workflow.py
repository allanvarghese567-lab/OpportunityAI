"""
Multi-agent research workflow for Phase 2.
Sequential orchestrator that emits SSE events.
"""

import asyncio
from datetime import datetime, timezone
from typing import Any, AsyncGenerator, Dict, Optional

from app.adapters.mock_adapter import MockResearchAdapter
from app.services.finance import build_scenario_set, calculate_net_profit


class AgentEvent:
    def __init__(self, agent: str, event_type: str, message: str, data: Optional[Dict] = None):
        self.agent = agent
        self.event_type = event_type
        self.message = message
        self.data = data or {}
        self.timestamp = datetime.now(timezone.utc).isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "agent": self.agent,
            "type": self.event_type,
            "message": self.message,
            "data": self.data,
            "timestamp": self.timestamp,
        }


async def run_research_workflow(
    config: Dict[str, Any],
) -> AsyncGenerator[AgentEvent, None]:
    starting_capital = float(config.get("starting_capital", 1))
    target = float(config.get("target_ending_cash", 2))
    location = config.get("location")
    currency = config.get("currency", "INR")
    opp_prefs = config.get("opportunity_preferences", {})
    types = opp_prefs.get("types", ["product", "resale", "service", "commission"])
    risk_limits = config.get("risk_limits", {})
    max_capital = float(risk_limits.get("max_capital_at_risk", starting_capital))

    # Agent 1: Configuration Validator
    yield AgentEvent("configuration_validator", "start", "Validating configuration…")
    await asyncio.sleep(0.4)

    warnings = []
    if target <= starting_capital:
        warnings.append("Target ending cash is not higher than starting capital.")
    if max_capital < starting_capital:
        warnings.append("Max capital at risk is lower than starting capital.")

    if warnings:
        for w in warnings:
            yield AgentEvent("configuration_validator", "warning", w)
    else:
        yield AgentEvent("configuration_validator", "result", "Configuration looks valid.", {"status": "valid"})
    await asyncio.sleep(0.3)

    # Agent 2: Market Researcher
    yield AgentEvent("market_researcher", "start", "Searching for opportunities…")
    await asyncio.sleep(0.5)

    adapter = MockResearchAdapter()
    candidates = await adapter.search(
        location=location,
        opportunity_types=types,
        max_capital=max_capital,
        currency=currency,
    )

    yield AgentEvent("market_researcher", "progress", f"Found {len(candidates)} candidate opportunities.", {"count": len(candidates)})
    await asyncio.sleep(0.3)

    # Agent 3: Financial Analyst
    yield AgentEvent("financial_analyst", "start", "Running financial calculations…")
    await asyncio.sleep(0.4)

    analyzed = []
    for cand in candidates:
        mid_price = (cand.observed_selling_price_low + cand.observed_selling_price_high) / 2
        profit = calculate_net_profit(
            acquisition_cost=cand.estimated_acquisition_cost,
            selling_price=mid_price,
            fees=mid_price * 0.02,
        )
        scenarios = build_scenario_set(
            starting_capital=starting_capital,
            base_acq=cand.estimated_acquisition_cost,
            base_sell=mid_price,
            fees=mid_price * 0.02,
        )
        for sc in scenarios.values():
            sc["meets_target"] = float(sc["ending_cash"]) >= target

        analyzed.append({
            "name": cand.name,
            "category": cand.category,
            "target_customer": cand.target_customer,
            "problem_solved": cand.problem_solved,
            "demand_evidence": cand.demand_evidence,
            "estimated_acquisition_cost": cand.estimated_acquisition_cost,
            "observed_selling_price_low": cand.observed_selling_price_low,
            "observed_selling_price_high": cand.observed_selling_price_high,
            "estimated_time_to_sale": cand.estimated_time_to_sale,
            "confidence": cand.confidence,
            "main_risks": cand.main_risks,
            "required_capital": cand.required_capital,
            "notes": cand.notes,
            "financials": {k: str(v) for k, v in profit.items()},
            "scenarios": {
                k: {sk: str(sv) if not isinstance(sv, bool) else sv for sk, sv in sc.items()}
                for k, sc in scenarios.items()
            },
            "evidence": [
                {
                    "source_url": e.source_url,
                    "source_name": e.source_name,
                    "claim": e.claim,
                    "verification_status": e.verification_status,
                }
                for e in cand.evidence
            ],
        })

    yield AgentEvent("financial_analyst", "result", f"Analyzed {len(analyzed)} opportunities with full scenario sets.", {"opportunities": analyzed})
    await asyncio.sleep(0.3)

    # Agent 5: Risk & Evidence Validator
    yield AgentEvent("risk_validator", "start", "Validating evidence and risk…")
    await asyncio.sleep(0.4)

    validated = []
    for opp in analyzed:
        status = "PARTIALLY_VERIFIED"
        if opp["confidence"] == "high" and opp["evidence"]:
            status = "VERIFIED"
        elif opp["confidence"] == "low" or not opp["evidence"]:
            status = "UNVERIFIED"
        if opp["required_capital"] > max_capital:
            status = "REJECTED"
        opp["verification_status"] = status
        validated.append(opp)

    yield AgentEvent("risk_validator", "result", f"Validation complete. {sum(1 for o in validated if o['verification_status'] != 'REJECTED')} candidates remain.", {"opportunities": validated})
    await asyncio.sleep(0.3)

    # Agent 6: Executor / Strategy Selector
    yield AgentEvent("executor", "start", "Ranking strategies…")
    await asyncio.sleep(0.4)

    eligible = [o for o in validated if o["verification_status"] != "REJECTED"]

    def score(o):
        s = 0
        if o["confidence"] == "high":
            s += 3
        elif o["confidence"] == "medium":
            s += 2
        else:
            s += 1
        if o["scenarios"]["base_case"].get("meets_target"):
            s += 5
        s -= o["required_capital"] / max(max_capital, 1)
        return s

    ranked = sorted(eligible, key=score, reverse=True)
    recommendation = ranked[0] if ranked else None

    yield AgentEvent(
        "executor",
        "result",
        "Strategy ranking complete." if recommendation else "No viable strategy found under current constraints.",
        {"recommendation": recommendation, "ranked_opportunities": ranked},
    )

    yield AgentEvent("workflow", "done", "Research run finished.", {
        "total_candidates": len(candidates),
        "eligible": len(eligible),
        "has_recommendation": recommendation is not None,
    })
