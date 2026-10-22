"""Tests for Scenario Planner agent."""

from app.agents.scenario_planner import plan_scenarios


def test_plan_scenarios_structure():
    opp = {
        "estimated_acquisition_cost": 40,
        "observed_selling_price_low": 70,
        "observed_selling_price_high": 110,
    }
    plan = plan_scenarios(opp, starting_capital=100, target_ending_cash=150)
    assert "scenarios" in plan
    assert "summary" in plan
    for key in ("best_case", "base_case", "downside", "no_sale", "delayed_sale"):
        assert key in plan["scenarios"]
        sc = plan["scenarios"][key]
        assert "ending_cash" in sc
        assert "net_profit" in sc
        assert "narrative" in sc
        assert isinstance(sc["meets_target"], bool)


def test_recovery_when_target_not_met():
    opp = {
        "estimated_acquisition_cost": 50,
        "observed_selling_price_low": 55,
        "observed_selling_price_high": 60,
    }
    plan = plan_scenarios(opp, starting_capital=50, target_ending_cash=500)
    assert plan["recovery"] is not None
    assert "required_capital" in plan["recovery"]


def test_no_recovery_when_target_met():
    opp = {
        "estimated_acquisition_cost": 10,
        "observed_selling_price_low": 100,
        "observed_selling_price_high": 120,
    }
    plan = plan_scenarios(opp, starting_capital=50, target_ending_cash=60)
    assert plan["summary"]["base_meets_target"] is True
