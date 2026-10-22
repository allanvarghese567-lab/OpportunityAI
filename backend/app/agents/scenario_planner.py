"""
Scenario Planner agent – generates structured positive / base / negative
outcomes and recovery alternatives for each opportunity.
"""

from decimal import Decimal
from typing import Any, Dict

from app.services.finance import build_scenario_set, quantize


def plan_scenarios(
    opportunity: Dict[str, Any],
    starting_capital: float,
    target_ending_cash: float,
) -> Dict[str, Any]:
    acq = float(opportunity.get("estimated_acquisition_cost", 0))
    low = float(opportunity.get("observed_selling_price_low", 0))
    high = float(opportunity.get("observed_selling_price_high", 0))
    mid = (low + high) / 2 if high > 0 else 0
    fees = mid * 0.02

    raw = build_scenario_set(
        starting_capital=starting_capital,
        base_acq=acq,
        base_sell=mid,
        fees=fees,
    )

    narratives = {
        "best_case": (
            f"Optimistic: acquire below expected cost and sell near the top of the "
            f"observed range. Ending cash could reach {raw['best_case']['ending_cash']}."
        ),
        "base_case": (
            f"Most likely path using mid-point prices. "
            f"Net profit ≈ {raw['base_case']['net_profit']}, "
            f"ending cash ≈ {raw['base_case']['ending_cash']}."
        ),
        "downside": (
            f"Costs run higher and selling price softens. "
            f"Net profit shrinks to ≈ {raw['downside']['net_profit']}."
        ),
        "no_sale": (
            "Worst operational outcome: item acquired but never sold. "
            f"Capital of {raw['no_sale']['capital_at_risk']} is tied up or lost."
        ),
        "delayed_sale": (
            "Sale takes longer than expected, increasing holding / shipping cost. "
            f"Ending cash ≈ {raw['delayed_sale']['ending_cash']}."
        ),
    }

    scenarios = {}
    for key, data in raw.items():
        scenarios[key] = {
            **{k: str(v) if not isinstance(v, bool) else v for k, v in data.items()},
            "meets_target": float(data["ending_cash"]) >= target_ending_cash,
            "narrative": narratives.get(key, ""),
        }

    recovery = None
    if not scenarios["base_case"]["meets_target"]:
        recovery = {
            "name": "Pivot: lower-capital service alternative",
            "description": (
                "If the primary opportunity under-performs, fall back to a "
                "zero-inventory service (e.g. phone help / local errand) "
                "that requires only time and can still generate cash the same day."
            ),
            "required_capital": "0",
            "estimated_net": str(quantize(Decimal(str(starting_capital)) * Decimal("0.5"))),
        }

    return {
        "scenarios": scenarios,
        "recovery": recovery,
        "summary": {
            "best_ending_cash": scenarios["best_case"]["ending_cash"],
            "base_ending_cash": scenarios["base_case"]["ending_cash"],
            "downside_ending_cash": scenarios["downside"]["ending_cash"],
            "base_meets_target": scenarios["base_case"]["meets_target"],
        },
    }
