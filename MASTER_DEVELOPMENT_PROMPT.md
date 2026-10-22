# MASTER DEVELOPMENT PROMPT
AI-Powered Opportunity Research & Execution Platform
Stack: React + TypeScript + FastAPI + Python

Act as a principal software architect, senior full-stack engineer, AI systems engineer, UX designer, database engineer, and application security engineer.

Build a production-oriented, interactive web application named OpportunityAI.

The application helps users discover legitimate business opportunities, research markets, analyze profitability, evaluate positive and negative outcomes, select strategies, and execute approved actions through a controlled multi-agent AI workflow.

The core example is:

A user starts with ₹1, wants to reach ₹2 in ending cash within one day, and asks the system to find a realistic product, service, resale, commission, or other legitimate economic opportunity.

The system must not assume that the target is achievable. It must research available evidence, calculate all relevant costs, compare alternative strategies, disclose uncertainty, and recommend a feasible approach only when the evidence supports it.

Build a functioning application with a complete frontend, backend, persistence, AI integration layer, interactive workflow, tests, and setup instructions.

Do not stop after producing a design, implementation plan, mockup, or sample components. Implement the application and verify it wherever the available environment permits.

## 1. Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui or an equivalent accessible component system
- React Router
- TanStack Query
- React Hook Form
- Zod
- Recharts
- Lucide icons
- Server-Sent Events for streaming workflow updates

### Backend
- Python
- FastAPI
- Pydantic v2
- SQLAlchemy 2.x
- Alembic
- PostgreSQL
- PostgreSQL-backed durable workflow state
- LangGraph for multi-agent orchestration
- HTTPX for asynchronous external API calls
- SSE endpoints for frontend updates
- Structured logging and OpenTelemetry-compatible tracing

Use compatible, stable dependency versions and pin them in dependency files.

SQLite may be supported as an optional local development mode, but PostgreSQL is the primary database.

Use environment variables for configuration. Never hardcode secrets.

## 2. Product Objectives

Build an interactive SaaS-style application that allows users to:

- Create and manage opportunity research projects.
- Configure financial targets, deadlines, market preferences, and risk limits.
- Confirm their configuration before research begins.
- Run multi-agent research workflows.
- Inspect discovered opportunities with evidence.
- Compare financial scenarios including downside cases.
- Receive ranked strategy recommendations.
- Approve or reject strategies.
- Authorize individual external actions under risk controls.
- Track actual outcomes against projections.
- Generate auditable reports.

## 3. Core User Journey

### Configuration Wizard (multi-step)
- Objective: starting capital, target ending cash, deadline, location, currency.
- Opportunity preferences: product, service, resale, commission, digital, local, etc.
- Resources and constraints: available time, skills, inventory, tools, platforms, legal restrictions.
- Risk limits: maximum capital at risk, maximum single loss, prohibited activities, approval thresholds.
- Priorities: speed, profit, safety, simplicity, evidence quality.
- Confirmation screen with summary and explicit user confirmation.

### Research Workspace
- Live workflow progress via SSE.
- Agent activity logs.
- Discovered opportunities with evidence cards.
- Financial analysis panels.
- Scenario explorer (best / base / downside / no-sale / delayed).
- Risk validation results.
- Executor recommendation with rationale.
- Approval controls.

### Execution and Tracking
- Authorized action list.
- Capital commitment tracking.
- Actual receipts and outcomes.
- Variance analysis (projected vs realized).
- Final report generation.

## 4. Data Model (high-level)

- Users
- Projects
- Configurations (versioned drafts and confirmed snapshots)
- Research runs / workflow instances
- Opportunities
- Evidence items
- Financial models and scenarios
- Risk assessments
- Strategy recommendations
- Approvals
- Execution actions
- Outcome records
- Audit logs

## 5. AI Multi-Agent Architecture

Implement separate logical agents orchestrated through LangGraph.

### Agent 1: Configuration Validator
Validates the confirmed user configuration.
Outputs:
- Valid or invalid status
- Missing fields
- Constraint conflicts
- Feasibility warnings
- Normalized configuration

It must not perform market research.

### Agent 2: Market Researcher
Finds opportunities using registered research adapters.
Investigates:
- Existing market demand
- Established products
- Niche markets
- Local market inefficiencies
- Emerging trends
- Commission-based opportunities
- Digital services
- Customer problems and willingness to pay

Return structured evidence with source URL, source name, observation date, claim supported, and verification status.

### Agent 3: Financial Analyst
Performs structured calculations and financial scenario evaluation.

Use deterministic Python functions for arithmetic. The LLM may interpret findings but must not be the authoritative calculator.

### Agent 4: Scenario Planner
Generates positive, base, and negative outcomes and identifies alternative opportunities.

Each fallback must be independently evaluated for cost, feasibility, and risk.

### Agent 5: Risk and Evidence Validator
Independently checks:
- Evidence quality
- Price comparability
- Market claims
- Missing costs
- Legal restrictions
- Platform restrictions
- Unsupported assumptions
- Exposure limits
- Unsafe or deceptive proposals

Return: VERIFIED, PARTIALLY_VERIFIED, UNVERIFIED, or REJECTED.

Verification does not mean profitability is guaranteed.

### Agent 6: Executor and Strategy Selector
Ranks eligible opportunities according to the user's confirmed priorities.

Must consider:
- Evidence quality
- Expected net benefit
- Downside exposure
- Capital required
- Deadline feasibility
- Operational difficulty
- Liquidity
- Fallback quality
- User constraints

It must return a decision with an explicit rationale.

It must not bypass approval gates or invoke unauthorized external tools.

### Agent 7: Reporting Agent
Generates reports from validated structured data and actual execution records.

It must not invent numbers or sources.

## 6. Frontend Screens

### A. Dashboard
Active projects, recent research runs, opportunities awaiting approval, approved executions, completed runs, actual realized profit or loss, recent activity, upcoming deadlines.

Include charts for:
- Opportunity status distribution
- Projected versus actual results
- Capital allocation and exposure
- Execution outcomes over time

Clearly distinguish projected values from realized financial results.

### B. New Opportunity Project
Implement the complete multi-step configuration wizard described above.

Use inline validation, accessible controls, progress indicators, previous/next navigation, save-draft support, and a final confirmation screen.

The wizard must work on mobile and desktop.

### C. Research Workspace
Display:
- Project configuration summary
- Current workflow state
- Research progress
- Agent activity
- Discovered opportunities
- Evidence references
- Research questions and unresolved uncertainties
- Pause and cancel controls where supported

Show real backend workflow events.

Do not simulate live progress with fake percentages or invented agent messages.

### D. Opportunity Explorer
Display candidate opportunities in cards or a table.

Each opportunity must include:
- Name
- Category
- Target customer
- Problem solved
- Demand evidence
- Estimated acquisition cost
- Observed selling-price range
- Estimated net profit
- Estimated time to sale
- Confidence level
- Evidence verification state
- Main risks
- Required capital

Provide: Sorting, Filtering, Search, Side-by-side comparison, Opportunity details, Source links, Shortlisting, Rejection with a reason.

Clearly label estimated, observed, verified, and unknown values.

### E. Opportunity Detail
Include tabs for:
- Overview
- Market research
- Financial analysis
- Scenario analysis
- Risk validation
- Execution plan
- Evidence and sources
- Audit history

Show all assumptions and calculations.

### F. Financial Analysis
Display:
- Starting capital
- Total cash committed
- Acquisition and production costs
- Fees and taxes where applicable
- Delivery and operating costs
- Estimated revenue
- Estimated net profit
- Ending cash
- Break-even price
- Return on invested capital
- Capital at risk

Use charts and scenario comparison tables.

Allow users to modify assumptions in a simulation panel without altering the original confirmed configuration.

Recalculate projections using deterministic backend functions.

### G. Scenario Explorer
Represent each opportunity as a scenario tree.

Required scenarios:
- Best case
- Base case
- Downside
- No sale
- Delayed sale
- Price drop
- Higher costs
- Platform restriction
- Legal or compliance issue
- Recovery / alternative opportunity

Show probability ranges only when supported by evidence; otherwise mark as qualitative.

### H. Approval and Execution
Present the executor recommendation with full rationale, evidence summary, risk summary, and capital requirements.

User actions:
- Approve strategy
- Reject strategy
- Request deeper research
- Modify constraints and re-run
- Authorize individual external actions

Every sensitive action requires backend authorization checks.

### I. Reports and Audit
Generate downloadable reports containing:
- Configuration snapshot
- Research timeline
- Opportunities considered
- Evidence sources
- Financial models
- Scenario analysis
- Risk assessments
- Approvals
- Execution log
- Actual outcomes
- Variance analysis
- Lessons and open questions

## 7. Backend Architecture

FastAPI application with clear separation of concerns:
- Auth and user management
- Project and configuration APIs
- Workflow orchestration endpoints
- SSE streaming endpoints
- Opportunity and evidence APIs
- Financial calculation services (pure functions)
- Approval and execution gateways
- Reporting services
- Admin and settings

Use dependency injection, Pydantic models, and comprehensive error handling.

All monetary calculations must go through tested pure functions. Never trust LLM arithmetic.

## 8. Persistence and Workflow State

PostgreSQL primary store.

Use SQLAlchemy models and Alembic migrations.

LangGraph checkpointing backed by PostgreSQL so long-running research can resume after process restarts.

Version configuration snapshots immutably once confirmed.

## 9. Security Requirements

- Authentication (prefer OAuth or JWT with refresh).
- Authorization on every project-scoped and execution-scoped endpoint.
- Encrypted storage of third-party API credentials.
- No secrets in frontend or logs.
- Rate limiting and input validation.
- Audit logging of all approvals and external actions.
- Clear separation between projected and realized financial data.

## 10. Research Adapters

Design a pluggable research adapter interface so different data sources can be registered:
- Web search
- Marketplace APIs
- Price comparison services
- Local classifieds
- Commission platforms
- Public data sources

Adapters return structured Evidence objects. The Market Researcher agent consumes them.

## 11. Implementation Phases

### Phase 1 – Foundation
- Repository structure
- Frontend scaffolding (Vite + React + TypeScript + Tailwind + shadcn)
- Backend scaffolding (FastAPI + SQLAlchemy + Alembic)
- Auth skeleton
- Database models for User, Project, Configuration
- Basic project CRUD
- Configuration wizard UI (all steps)
- Save draft / confirm configuration

### Phase 2 – Research Core
- LangGraph workflow skeleton
- Configuration Validator agent
- Market Researcher agent with at least one research adapter (even if mocked initially)
- Financial Analyst with pure calculation functions
- SSE progress streaming
- Research Workspace UI showing real events

### Phase 3 – Analysis and Validation
- Scenario Planner
- Risk and Evidence Validator
- Opportunity Explorer and Detail views
- Financial and Scenario panels

### Phase 4 – Execution Control
- Executor / Strategy Selector
- Approval flows
- Execution action authorization
- Outcome tracking
- Reporting agent and report generation

### Phase 5 – Polish and Hardening
- Dashboard with real metrics
- Charts
- Mobile responsiveness
- Comprehensive tests
- Documentation
- Deployment notes

## 12. Acceptance Criteria

The application is ready for its initial release when a user can:

- Sign in.
- Create a project.
- Configure the objective and risk constraints.
- Review and confirm the configuration.
- Start a research run.
- Observe real workflow progress.
- Inspect sourced opportunities.
- Compare financial outcomes.
- Explore negative scenarios and recovery options.
- Review the executor's recommendation.
- Approve or reject the strategy.
- Authorize individual external actions.
- Track actual execution outcomes.
- View an auditable final report.

Start by creating the repository and implementing Phase 1. Continue through the remaining phases until the full application is implemented, tested, and documented, subject to available tools and credentials.

## How the completed application should behave

1. **Configure first**  
   The user sets starting capital, target, deadline, location, allowed opportunities, resources, and risk limits. The application saves a configuration draft.

2. **Research and validate**  
   The agents gather evidence, calculate financial outcomes, challenge assumptions, and find fallback options.

3. **Select and approve**  
   The executor ranks the candidates and presents a recommended strategy. The user can approve, reject, or request more analysis.

4. **Execute and measure**  
   The app runs authorized actions, tracks spending and receipts, enforces risk limits, and reports the actual outcome.

## Three important implementation decisions

1. **Persist workflow state**: use PostgreSQL and durable LangGraph checkpoints so research can resume after a restart.

2. **Separate AI reasoning from financial calculations**: let the agents reason about opportunities, but use tested Python functions for all monetary calculations.

3. **Enforce approvals in FastAPI**: hiding an Execute button in React is not security. Every sensitive action must be checked by the backend against the user's permissions, budget, and approval record.

This prompt is intended to produce a full-stack application rather than just an AI chatbot. The research integrations will still need appropriate API credentials, and real-world purchasing or selling will require separately configured, authorized execution adapters.
