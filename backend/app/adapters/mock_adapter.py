"""Mock research adapter for Phase 2 — returns realistic sample opportunities."""

from datetime import datetime, timezone
from typing import List, Optional

from app.adapters.base import Evidence, OpportunityCandidate, ResearchAdapter


class MockResearchAdapter(ResearchAdapter):
    name = "mock_local_market"

    async def search(
        self,
        location: Optional[str],
        opportunity_types: List[str],
        max_capital: float,
        currency: str = "INR",
    ) -> List[OpportunityCandidate]:
        loc = location or "local area"
        now = datetime.now(timezone.utc)

        catalog = [
            OpportunityCandidate(
                name="Resell prepaid mobile recharges (local commission)",
                category="commission",
                target_customer="Daily wage workers without smartphones",
                problem_solved="People need small recharges but lack UPI/online access",
                demand_evidence=f"High footfall near bus stands and markets in {loc}",
                estimated_acquisition_cost=0.0,
                observed_selling_price_low=1.0,
                observed_selling_price_high=5.0,
                estimated_time_to_sale="same day",
                confidence="medium",
                main_risks=["Requires physical presence", "Low margin per transaction"],
                required_capital=1.0,
                evidence=[
                    Evidence(
                        source_url="https://example.com/local-recharge-demand",
                        source_name="Mock Local Survey",
                        observation_date=now,
                        claim="Small-value recharge demand remains strong in semi-urban areas",
                        verification_status="partially_verified",
                    )
                ],
                notes="Commission-based; starting capital mainly for float.",
            ),
            OpportunityCandidate(
                name="Buy & resell second-hand phone accessories",
                category="resale",
                target_customer="Students and budget phone users",
                problem_solved="Cheap earphones / chargers in high demand",
                demand_evidence="Consistent listings and sales on local classifieds",
                estimated_acquisition_cost=40.0,
                observed_selling_price_low=70.0,
                observed_selling_price_high=110.0,
                estimated_time_to_sale="1-3 days",
                confidence="medium",
                main_risks=["Quality variation", "Competition from online"],
                required_capital=50.0,
                evidence=[
                    Evidence(
                        source_url="https://example.com/olx-accessories",
                        source_name="Mock Classifieds Snapshot",
                        observation_date=now,
                        claim="Earphones and cables turn over quickly under ₹100",
                        verification_status="unverified",
                    )
                ],
            ),
            OpportunityCandidate(
                name="Offer basic smartphone help / setup service",
                category="service",
                target_customer="Elderly and first-time smartphone users",
                problem_solved="Confusion with apps, UPI, WhatsApp settings",
                demand_evidence="Word-of-mouth demand in residential colonies",
                estimated_acquisition_cost=0.0,
                observed_selling_price_low=50.0,
                observed_selling_price_high=150.0,
                estimated_time_to_sale="same day",
                confidence="low",
                main_risks=["Time intensive", "Trust required"],
                required_capital=0.0,
                evidence=[
                    Evidence(
                        source_url="https://example.com/local-service-demand",
                        source_name="Mock Community Feedback",
                        observation_date=now,
                        claim="Many older residents pay for simple phone assistance",
                        verification_status="unverified",
                    )
                ],
            ),
            OpportunityCandidate(
                name="Print & sell simple festival greeting cards",
                category="product",
                target_customer="Local shoppers during festival season",
                problem_solved="Affordable, local-language greeting cards",
                demand_evidence="Seasonal spike visible in previous years",
                estimated_acquisition_cost=15.0,
                observed_selling_price_low=30.0,
                observed_selling_price_high=50.0,
                estimated_time_to_sale="2-5 days",
                confidence="low",
                main_risks=["Seasonal only", "Inventory risk"],
                required_capital=30.0,
                evidence=[],
            ),
        ]

        results = []
        for opp in catalog:
            if opp.required_capital > max_capital * 1.5:
                continue
            if opportunity_types and opp.category not in opportunity_types:
                if not any(t in opp.category for t in opportunity_types):
                    continue
            results.append(opp)

        return results[:5]
