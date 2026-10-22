"""Pluggable research adapter interface."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional


@dataclass
class Evidence:
    source_url: str
    source_name: str
    observation_date: datetime
    claim: str
    verification_status: str
    raw_data: Dict[str, Any] = field(default_factory=dict)


@dataclass
class OpportunityCandidate:
    name: str
    category: str
    target_customer: str
    problem_solved: str
    demand_evidence: str
    estimated_acquisition_cost: float
    observed_selling_price_low: float
    observed_selling_price_high: float
    estimated_time_to_sale: str
    confidence: str
    main_risks: List[str]
    required_capital: float
    evidence: List[Evidence] = field(default_factory=list)
    notes: Optional[str] = None


class ResearchAdapter(ABC):
    name: str = "base"

    @abstractmethod
    async def search(
        self,
        location: Optional[str],
        opportunity_types: List[str],
        max_capital: float,
        currency: str = "INR",
    ) -> List[OpportunityCandidate]:
        ...
