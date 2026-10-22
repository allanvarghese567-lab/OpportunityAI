"""Reporting Agent – generates structured reports from validated data only."""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


def generate_report(
    project_name: str,
    project_id: int,
    configuration: Dict[str, Any],
    recommendation: Optional[Dict[str, Any]],
    approval: Optional[Dict[str, Any]],
    actions: List[Dict[str, Any]],
    outcome: Optional[Dict[str, Any]],
) -> Dict[str, Any]:
    variance = None
    if outcome and outcome.get("actual_ending_cash") is not None:
        target = float(outcome.get("target_ending_cash", 0))
        actual = float(outcome["actual_ending_cash"])
        starting = float(outcome.get("starting_capital", 0))
        projected_profit = None
        if recommendation and recommendation.get("financials"):
            try:
                projected_profit = float(recommendation["financials"].get("net_profit", 0))
            except (TypeError, ValueError):
                projected_profit = None
        actual_profit = actual - starting
        variance = {
            "target_ending_cash": target,
            "actual_ending_cash": actual,
            "gap_to_target": round(actual - target, 2),
            "projected_net_profit": projected_profit,
            "actual_net_profit": round(actual_profit, 2),
            "profit_variance": round(actual_profit - (projected_profit or 0), 2) if projected_profit is not None else None,
            "total_spent": float(outcome.get("total_spent", 0)),
            "total_received": float(outcome.get("total_received", 0)),
        }

    action_summary = {
        "total": len(actions),
        "authorized": sum(1 for a in actions if a.get("status") in ("authorized", "executed")),
        "executed": sum(1 for a in actions if a.get("status") == "executed"),
        "failed": sum(1 for a in actions if a.get("status") == "failed"),
        "pending": sum(1 for a in actions if a.get("status") == "pending"),
    }

    return {
        "project_id": project_id,
        "project_name": project_name,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "configuration": {
            "starting_capital": configuration.get("starting_capital"),
            "target_ending_cash": configuration.get("target_ending_cash"),
            "currency": configuration.get("currency"),
            "location": configuration.get("location"),
            "risk_limits": configuration.get("risk_limits"),
        },
        "recommendation": recommendation,
        "approval": {
            "status": approval.get("status") if approval else None,
            "decided_at": approval.get("decided_at") if approval else None,
            "rejection_reason": approval.get("rejection_reason") if approval else None,
        } if approval else None,
        "actions": action_summary,
        "action_details": actions,
        "outcome": outcome,
        "variance": variance,
        "lessons": outcome.get("lessons") if outcome else None,
        "summary": outcome.get("summary") if outcome else None,
    }
