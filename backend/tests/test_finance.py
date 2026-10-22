"""Unit tests for pure financial calculation functions."""

from decimal import Decimal

from app.services.finance import (
    quantize,
    calculate_net_profit,
    calculate_ending_cash,
    calculate_roi,
    build_scenario_set,
)


class TestQuantize:
    def test_rounds_to_two_decimals(self):
        assert quantize(1.005) == Decimal("1.01")
        assert quantize("3.14159") == Decimal("3.14")

    def test_integer(self):
        assert quantize(5) == Decimal("5.00")


class TestNetProfit:
    def test_basic_profit(self):
        result = calculate_net_profit(acquisition_cost=40, selling_price=100, fees=2, shipping=5)
        assert result["total_cost"] == Decimal("47.00")
        assert result["net_profit"] == Decimal("53.00")
        assert result["gross_profit"] == Decimal("60.00")
        assert result["margin_pct"] == Decimal("53.00")

    def test_zero_sale(self):
        result = calculate_net_profit(acquisition_cost=50, selling_price=0)
        assert result["net_profit"] == Decimal("-50.00")
        assert result["margin_pct"] == Decimal("0")

    def test_no_fees(self):
        result = calculate_net_profit(acquisition_cost=10, selling_price=25)
        assert result["net_profit"] == Decimal("15.00")
        assert result["fees"] == Decimal("0.00")


class TestEndingCash:
    def test_positive(self):
        assert calculate_ending_cash(100, 25) == Decimal("125.00")

    def test_loss(self):
        assert calculate_ending_cash(100, -30) == Decimal("70.00")


class TestROI:
    def test_positive_roi(self):
        assert calculate_roi(50, 100) == Decimal("50.00")

    def test_zero_invested(self):
        assert calculate_roi(10, 0) == Decimal("0")


class TestScenarioSet:
    def test_all_scenarios_present(self):
        scenarios = build_scenario_set(starting_capital=100, base_acq=40, base_sell=80, fees=2)
        assert set(scenarios.keys()) == {"best_case", "base_case", "downside", "no_sale", "delayed_sale"}

    def test_base_case_math(self):
        scenarios = build_scenario_set(starting_capital=100, base_acq=40, base_sell=80, fees=2)
        base = scenarios["base_case"]
        assert base["net_profit"] == Decimal("38.00")
        assert base["ending_cash"] == Decimal("138.00")

    def test_no_sale_loses_capital(self):
        scenarios = build_scenario_set(starting_capital=100, base_acq=40, base_sell=80, fees=2)
        no_sale = scenarios["no_sale"]
        assert no_sale["net_profit"] == Decimal("-42.00")
        assert float(no_sale["ending_cash"]) < 100
