"""
Pure, deterministic financial calculation functions.
NEVER trust LLM arithmetic — all money math goes through here.
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Dict, Optional


def quantize(value: Decimal | float | int | str) -> Decimal:
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def calculate_net_profit(
    acquisition_cost: Decimal | float,
    selling_price: Decimal | float,
    fees: Decimal | float = 0,
    shipping: Decimal | float = 0,
    other_costs: Decimal | float = 0,
) -> Dict[str, Decimal]:
    acq = quantize(acquisition_cost)
    sell = quantize(selling_price)
    fee = quantize(fees)
    ship = quantize(shipping)
    other = quantize(other_costs)

    total_cost = acq + fee + ship + other
    gross_profit = sell - acq
    net_profit = sell - total_cost
    margin_pct = (net_profit / sell * 100) if sell > 0 else Decimal("0")

    return {
        "acquisition_cost": acq,
        "selling_price": sell,
        "fees": fee,
        "shipping": ship,
        "other_costs": other,
        "total_cost": quantize(total_cost),
        "gross_profit": quantize(gross_profit),
        "net_profit": quantize(net_profit),
        "margin_pct": quantize(margin_pct),
    }


def calculate_ending_cash(
    starting_capital: Decimal | float,
    net_profit: Decimal | float,
) -> Decimal:
    return quantize(Decimal(str(starting_capital)) + Decimal(str(net_profit)))


def calculate_roi(
    net_profit: Decimal | float,
    capital_invested: Decimal | float,
) -> Decimal:
    invested = Decimal(str(capital_invested))
    if invested <= 0:
        return Decimal("0")
    return quantize(Decimal(str(net_profit)) / invested * 100)


def evaluate_scenario(
    starting_capital: Decimal | float,
    acquisition_cost: Decimal | float,
    selling_price: Decimal | float,
    fees: Decimal | float = 0,
    shipping: Decimal | float = 0,
    other_costs: Decimal | float = 0,
    probability: Optional[float] = None,
) -> Dict[str, Any]:
    profit_data = calculate_net_profit(
        acquisition_cost, selling_price, fees, shipping, other_costs
    )
    ending = calculate_ending_cash(starting_capital, profit_data["net_profit"])
    roi = calculate_roi(profit_data["net_profit"], profit_data["total_cost"])

    result = {
        **profit_data,
        "starting_capital": quantize(starting_capital),
        "ending_cash": ending,
        "roi_pct": roi,
        "capital_at_risk": profit_data["total_cost"],
        "meets_target": None,
    }
    if probability is not None:
        result["probability"] = probability
    return result


def build_scenario_set(
    starting_capital: Decimal | float,
    base_acq: Decimal | float,
    base_sell: Decimal | float,
    fees: Decimal | float = 0,
    shipping: Decimal | float = 0,
) -> Dict[str, Dict[str, Any]]:
    """Generate best / base / downside / no-sale scenarios."""
    sc = quantize(starting_capital)
    acq = quantize(base_acq)
    sell = quantize(base_sell)

    return {
        "best_case": evaluate_scenario(
            sc, acq * Decimal("0.9"), sell * Decimal("1.15"), fees, shipping
        ),
        "base_case": evaluate_scenario(sc, acq, sell, fees, shipping),
        "downside": evaluate_scenario(
            sc, acq * Decimal("1.1"), sell * Decimal("0.85"), fees * Decimal("1.2"), shipping
        ),
        "no_sale": evaluate_scenario(sc, acq, Decimal("0"), fees, shipping),
        "delayed_sale": evaluate_scenario(
            sc, acq, sell * Decimal("0.95"), fees, shipping * Decimal("1.5")
        ),
    }
