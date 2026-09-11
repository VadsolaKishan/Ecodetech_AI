# CarbonCopilot AI

> **Detect. Recommend. Simulate. Reduce.**  
> *From emissions to action.*

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)]()
[![React](https://img.shields.io/badge/frontend-React%2019-61DAFB.svg?logo=react&logoColor=black)]()
[![TypeScript](https://img.shields.io/badge/language-TypeScript%206-3178C6.svg?logo=typescript&logoColor=white)]()
[![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL%2015-336791.svg?logo=postgresql&logoColor=white)]()
[![License](https://img.shields.io/badge/license-Not%20Specified-lightgrey.svg)]()

CarbonCopilot AI is an enterprise-grade, AI-powered industrial sustainability and decarbonization platform. It enables manufacturing plants and industrial operators to pinpoint where their carbon emissions originate, evaluate environmental and economic impacts, and determine actionable steps toward emission reduction through circular economy interventions.

> **"We don't just calculate carbon. We tell industries what to do next."**

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [AI / ML Architecture](#ai--ml-architecture)
- [User Roles & Access Control (RBAC)](#user-roles--access-control-rbac)
- [Role Access Matrix](#role-access-matrix)
- [Demo Accounts](#demo-accounts)
- [Registration & Authentication](#registration--authentication)
- [Database Architecture & Schema](#database-architecture--schema)
- [Database Data Policy](#database-data-policy)
- [Carbon Calculation Engine](#carbon-calculation-engine)
- [Hotspot Detection Engine](#hotspot-detection-engine)
- [Circular Recommendation Engine](#circular-recommendation-engine)
- [What-If Reactive Simulator](#what-if-reactive-simulator)
- [Scenario Comparison & Before vs After](#scenario-comparison--before-vs-after)
- [Data Confidence & Assumptions](#data-confidence--assumptions)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Directory Structure](#project-directory-structure)
- [API Documentation](#api-documentation)
- [Installation & Local Setup](#installation--local-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [60-Second Hackathon Demo Flow](#60-second-hackathon-demo-flow)
- [Verification & Testing](#verification--testing)
- [Page Directory](#page-directory)
- [Security & Compliance](#security--compliance)
- [Responsible Data & Limitations](#responsible-data--limitations)
- [Future Roadmap](#future-roadmap)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Overview

Small and Medium Enterprises (SMEs) and industrial operators represent over 45% of global manufacturing emissions. Most factory operators recognize their environmental footprint but face significant hurdles:
- **Opacity**: Inability to identify specific processes, fuels, or feedstocks driving total emissions.
- **Complexity**: Traditional carbon accounting tools yield high-level aggregate numbers without process-level granularity.
- **Inaction**: Lack of tailored, costed circular alternatives with quantifiable ROI, payback periods, and regulatory alignment.
- **High Cost**: Enterprise carbon accounting platforms often cost tens of thousands of dollars and demand specialized auditors.

CarbonCopilot AI bridges this gap with an intuitive, end-to-end platform that translates raw industrial activity data into prioritized, cost-modeled decarbonization roadmaps.

```text
Factory Data ──▶ Carbon Calculation ──▶ Emission Breakdown ──▶ Hotspot Detection
      │
      ▼
Circular Recommendations ──▶ Cost & Savings Modeling ──▶ What-If Simulation
      │
      ▼
Scenario Comparison ──▶ Prioritized Action Plan ──▶ Audit Report & PDF Export
```

---

## Problem Statement

**Challenge Focus**: Industrial Emission Leak-Point Detector & Circular Alternative Recommender

Modern manufacturing consumes heterogeneous energy vectors (grid electricity, diesel backup, thermal gas/coal), virgin raw materials, and complex logistics chains, while generating high-volume solid, thermal, and chemical waste streams.

CarbonCopilot AI takes verified process-level activity data:
- **Energy Vectors**: Grid electricity, captive power, diesel generators, natural gas, boiler fuels.
- **Material Feedstocks**: Virgin vs. recycled material inputs, polymers, fibers, chemicals.
- **Waste Streams**: Process scraps, cutting waste, packaging, hazardous sludge, recycling loops.
- **Logistics & Freight**: Inbound raw material logistics and outbound distribution.

It deterministically identifies primary emission leak-points, calculates Scope 1, Scope 2, and Scope 3 footprints according to the GHG Protocol, and scores circular economy interventions.

### Target Personas
1. **Factory Owners & Plant Managers**: Discover process-level leak points, review practical circular interventions, and evaluate financial payback.
2. **Sustainability Consultants**: Manage assigned client facilities, run what-if simulations, and structure operational action plans.
3. **Regulators & Environmental Auditors**: Conduct read-only inspections, verify emission factors, audit logs, and compliance disclosures.
4. **System Administrators**: Oversee user lifecycle, manage emission factor libraries, tune recommendation rules, and audit system integrity.

---

## Key Features

- **Industrial Profile Management**: Configurable factory profiles detailing production capacity, operating hours, workforce, and energy infrastructure.
- **Multi-Vector Carbon Assessment**: Comprehensive input wizards capturing energy consumption, raw materials, solid waste, and transport logistics.
- **Deterministic Carbon Calculation**: Exact greenhouse gas accounting ($CO_2e = \text{Activity} \times \text{Emission Factor}$) across GHG Protocol Scope 1, Scope 2, and Scope 3.
- **Categorical Emission Breakdown**: Visual apportionment of emissions across fuels, electricity, raw materials, waste disposal, and transport.
- **Statistical Hotspot Detection**: Automated identification and ranking of process emission leak-points classified by severity (*Critical*, *High*, *Medium*, *Low*).
- **Multi-Attribute Recommendation Engine**: Tailored circular interventions scored on CO₂ reduction potential, CAPEX, annual OPEX savings, feasibility, and payback.
- **What-If Reactive Simulator**: Dynamic simulation sliders (Solar adoption, Recycled feedstock %, Waste recovery %, Freight optimization) yielding real-time projections.
- **Scenario Comparison Matrix**: Side-by-side comparative analytics evaluating Current Baseline vs. Renewable Transition vs. Circular Materials vs. Combined Roadmap.
- **Circularity Scoring (0–100)**: Quantitative circular economy score evaluating material circularity, waste diversion rates, and renewable energy adoption.
- **Operational Action Roadmap**: Milestone-driven implementation tracker capturing project owners, investment costs, expected CO₂ savings, and status (*Planned*, *In Progress*, *Completed*).
- **Executive Audit Reports**: Automated generation of comprehensive sustainability audit reports summarizing corporate footprints, hotspots, and roadmaps.
- **Executive PDF Export**: Instant client-side and server-side PDF generation formatted for stakeholder presentation and compliance filing.
- **Assessment History**: Historical registry allowing facility operators to track footprint trends and longitudinal reductions.
- **Data Confidence & Uncertainty**: Transparent confidence scores based on input completeness, emission factor pedigree, and data quality.
- **Context-Grounded AI Assistant**: Technical copilot answering queries grounded directly in active factory telemetry, calculation outputs, and simulator models.

---

## How It Works

```text
┌────────────────────────────────────────────────────────┐
│               1. Factory Profile Setup                 │
│ Capacity, location, operating hours, process vectors  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             2. Carbon Assessment Inputs                │
│ Energy (kWh/L), Materials (t), Waste (t), Transport    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│          3. Deterministic Carbon Calculation           │
│   CO₂e = Activity × Emission Factor (Scope 1, 2, 3)    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│       4. Statistical Hotspot Anomaly Detection         │
│  Isolation Forest + Contribution Severity Classification│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│       5. Multi-Attribute Recommendation Engine         │
│    Scored: 30% CO₂ + 20% Cost + 20% Feas + 15% ROI     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│          6. What-If Reactive Simulation                │
│  Real-time sliders for Solar, Recycled %, Waste Recovery│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│      7. Scenario Comparison & Action Planning          │
│ Side-by-side trade-offs, milestones, payback, ownership│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│        8. Audit Report & Executive PDF Export          │
│ Compliance disclosures, factor sources, printable PDF  │
└────────────────────────────────────────────────────────┘
```

---

## AI / ML Architecture

CarbonCopilot AI separates deterministic accounting from machine learning and heuristic intelligence to guarantee mathematical integrity.

```text
                    ┌─────────────────────────────────────────────────────────┐
                    │                      User Telemetry                     │
                    └────────────────────────────┬────────────────────────────┘
                                                 │
                   ┌─────────────────────────────┴─────────────────────────────┐
                   ▼                                                           ▼
┌─────────────────────────────────────┐                     ┌─────────────────────────────────────┐
│    Deterministic Engine (Math)      │                     │        Machine Learning & AI        │
├─────────────────────────────────────┤                     ├─────────────────────────────────────┤
│ • Activity × Emission Factor        │                     │ • Isolation Forest Anomaly Detection│
│ • Scope 1, 2, 3 GHG Apportionment   │                     │ • Multi-Criteria Ranking Optimization│
│ • Mass-Balance Material Accounting  │                     │ • Dynamic Simulation Engine         │
│ • Unit Tariffs & Financial Payback  │                     │ • Context-Grounded AI Copilot       │
└─────────────────────────────────────┘                     └─────────────────────────────────────┘
```

### 1. Deterministic Calculation
Authoritative emissions accounting follows the GHG Protocol Corporate Standard. Numerical calculations are never delegated to stochastic LLMs:
$$\text{Emissions } (\text{kg CO}_2\text{e}) = \text{Activity Quantity} \times \text{Emission Factor}$$

### 2. Statistical Machine Learning (`Isolation Forest`)
- **Module**: `app.services.hotspot_detector.HotspotDetectionEngine`
- **Algorithm**: `sklearn.ensemble.IsolationForest(contamination=0.25, random_state=42)`
- **Input Features**: Process-level emissions distribution array across all activity vectors.
- **Output**: Detection of statistical outlier leak-points combined with percentage contribution thresholding ($>30\%$ Critical, $15\text{--}30\%$ High, $5\text{--}15\%$ Medium, $<5\%$ Low).

### 3. Multi-Criteria Recommendation Algorithm
- **Module**: `app.services.recommendation_engine.RecommendationEngine`
- **Methodology**: Multi-Attribute Decision Matrix scoring potential circular interventions across 5 weighted dimensions:
$$\text{Score} = \text{CO}_2 \text{ Impact } (30\%) + \text{Cost Effectiveness } (20\%) + \text{Feasibility } (20\%) + \text{Annual Savings } (15\%) + \text{Circularity Boost } (15\%)$$

### 4. AI Assistant & LLM Integration
- **Module**: `app.services.assistant_service.AssistantService`
- **Role**: Explains technical concepts, interprets simulation results, and generates natural-language operational guidance.
- **Guardrails**: Responses are grounded directly in the verified database records of the active assessment. When an external LLM API key (`LLM_API_KEY`) is provided, it handles natural language queries; otherwise, the rule-based telemetry engine provides responses without external dependencies.

---

## User Roles & Access Control (RBAC)

The system implements Role-Based Access Control enforced at the API dependency layer (`app.api.deps`). There are **exactly 4 system roles**:

```text
roles: factory_owner | sustainability_consultant | regulator_auditor | admin
```

### 1. Factory Owner (`factory_owner`)
- **Persona**: Industrial plant owner, managing director, or factory operations head.
- **Scope**: Full management over their own registered factory facility and assessments.
- **Permissions**: Create and edit factory profile, run assessments, trigger carbon calculations, simulate what-if scenarios, manage action plans, export PDF reports.
- **Isolation**: Cannot view or modify data from other facilities. Cannot access administrative endpoints.

### 2. Sustainability Consultant (`sustainability_consultant`)
- **Persona**: External ESG advisor or environmental auditor managing multiple client plants.
- **Scope**: Multi-factory access restricted strictly to facilities explicitly assigned via `factory_assignments`.
- **Permissions**: View assigned factories, create/update assessments on assigned plants, run simulations, update action plans, generate audit reports.
- **Isolation**: Direct API attempts to access unassigned factories result in `403 Forbidden`. Cannot access `/admin/users`.

### 3. Regulator / Auditor (`regulator_auditor`)
- **Persona**: Government environmental agency officer, pollution control board inspector, or ISO/BRSR compliance auditor.
- **Scope**: **Strictly READ-ONLY** access across assigned or authorized facilities.
- **Permissions**: View factory profiles, assessments, emission calculations, hotspots, AI recommendations, emission factors library, audit logs, and export reports.
- **Restrictions**: Cannot perform write operations (POST, PUT, DELETE) on factory profiles, assessments, recommendations, scenarios, action plans, or emission factors (enforced with `HTTP 403 Forbidden`).

### 4. System Administrator (`admin`)
- **Persona**: Platform operator and compliance governance lead.
- **Scope**: Global administrative access across all system entities.
- **Permissions**: Manage user accounts and active statuses, assign consultants to factories, curate the emission factors database, manage the recommendation knowledge base, review security audit logs.
- **Safeguards**: Cannot accidentally demote or delete the sole active administrator.

---

## Role Access Matrix

| Page / Capability | Factory Owner | Sustainability Consultant | Regulator / Auditor | Admin |
|---|:---:|:---:|:---:|:---:|
| **Dashboard** | Full (Own) | Full (Assigned) | Read-Only | Full |
| **Factory Profile** | View & Edit | Assigned (Read) | Read-Only | Full |
| **Assessments** | View & Create | Assigned (View & Create) | Read-Only | Full |
| **Carbon Analysis** | Full | Full | Read-Only | Full |
| **Hotspots Detection** | Full | Full | Read-Only | Full |
| **AI Recommendations** | Full | Full | Read-Only | Full |
| **Circularity Score** | Full | Full | Read-Only | Full |
| **What-If Simulator** | Full | Full | Read-Only | Full |
| **Scenario Comparison** | Full | Full | Read-Only | Full |
| **Action Plan Roadmap** | View & Edit | View & Edit | Read-Only | Full |
| **Audit Reports** | View & Generate | View & Generate | Read-Only | Full |
| **PDF Export** | Export | Export | Export | Full |
| **Assessment History** | View (Own) | View (Assigned) | Read-Only | Full |
| **AI Copilot Assistant** | Active | Active | Restricted | Active |
| **Audit Trail Logs** | Denied (403) | Denied (403) | Read-Only | Full |
| **Emission Factors Library** | Denied (403) | Denied (403) | Read-Only | View & Edit |
| **Knowledge Base Rules** | Denied (403) | Denied (403) | Read-Only | View & Edit |
| **User Management** | Denied (403) | Denied (403) | Denied (403) | Full |
| **Consultant Assignment** | Denied (403) | Denied (403) | Denied (403) | Full |

---

## Demo Accounts

The project is pre-configured with 4 initial accounts corresponding to each role:

| Persona Name | Assigned Role | Access Scope |
|---|---|---|
| **Rajesh Patel** | `factory_owner` | Shree Gujarat Textile Works Pvt. Ltd. |
| **Priya Shah** | `sustainability_consultant` | Assigned Consultant to Shree Gujarat Textile Works |
| **Amit Desai** | `regulator_auditor` | Inspection Auditor (Read-Only) |
| **Arjun Mehta** | `admin` | Global System Administrator |

> **Security Notice**: Passwords are securely hashed using bcrypt (`$2b$`) in the PostgreSQL database. Passwords and secret keys are never committed in plaintext. Initial credentials can be reset or authenticated through environment configuration.

---

## Registration & Authentication

- **Public Registration (`POST /api/v1/auth/register`)**:
  - Open to: `factory_owner`, `sustainability_consultant`, `regulator_auditor`.
  - Self-service registration with `role = admin` is **strictly rejected with HTTP 400 Bad Request**.
- **Admin Provisioning**:
  - Administrator accounts can only be created by an existing administrator via `POST /api/v1/admin/users` or during system initialization.
- **Session Security**:
  - Stateless JSON Web Tokens (JWT) signed using HMAC-SHA256 (`HS256`).
  - Passwords hashed using standard `passlib[bcrypt]` with dynamic salt.
  - Backend dependency verification (`get_current_user`, `require_roles`) validates token signatures, expiration timestamps, and active user status on every request.

---

## Database Architecture & Schema

The application database is PostgreSQL (compatible with local PostgreSQL 15+ and serverless cloud databases like Neon).

The schema comprises **exactly 21 application tables**:

```text
roles (4 core roles)
  └── users (authentication & profile)
        ├── industries (factory metadata & operational profile)
        │     └── factories (physical plant records)
        ├── factory_assignments (consultant assignments & auditor jurisdictions)
        ├── assessments (annual carbon balance sheets)
        │     ├── energy_inputs (grid, diesel, gas, solar)
        │     ├── material_inputs (virgin cotton, polyester, recycled yarns)
        │     ├── waste_inputs (cutting scrap, packaging, diversion rates)
        │     ├── transport_inputs (inbound & outbound freight tonne-km)
        │     ├── emission_results (calculated Scope 1, 2, 3 footprint records)
        │     ├── emission_hotspots (Isolation Forest ranked leak-points)
        │     ├── data_confidence (vector-level confidence scores)
        │     ├── recommendations (actionable circular interventions)
        │     ├── scenarios (what-if decarbonization simulation runs)
        │     │     └── scenario_results (simulated emissions & financial ROI)
        │     ├── action_plans (milestone roadmap & deployment status)
        │     └── reports (sustainability audit report metadata)
        ├── emission_factors (reference emission factors: CEA, IPCC)
        ├── recommendation_knowledge_base (circular intervention rules)
        └── audit_logs (security, access, and calculation event trails)
```

### Summary of Core Tables

1. `roles`: Master system roles (`factory_owner`, `sustainability_consultant`, `regulator_auditor`, `admin`).
2. `users`: Credentials, full names, assigned role foreign keys, and account status.
3. `industries`: Industrial facility records (company name, sector, location, production volume, employees).
4. `factories`: Linked physical manufacturing plant profiles.
5. `factory_assignments`: Unified relational mapping of consultants and auditors to specific factory facilities.
6. `assessments`: Carbon audit cycles tracking reporting periods, totals, and circularity scores.
7. `energy_inputs`: Energy activity records (electricity kWh, diesel liters, natural gas kWh, solar generation).
8. `material_inputs`: Feedstock activity records (virgin materials, recycled polymers, packaging).
9. `waste_inputs`: Industrial waste records (generation tonnes, diversion rates, disposal routes).
10. `transport_inputs`: Freight logistics records (vehicle types, transport distances, freight mass).
11. `emission_factors`: Reference emission factor database (kg CO₂e/unit, source, region, vintage).
12. `emission_results`: Deterministically calculated emissions linked to specific activity inputs.
13. `emission_hotspots`: Ranked emission leak-points categorized by contribution and severity.
14. `data_confidence`: Category-level confidence ratings evaluating completeness and data pedigree.
15. `recommendation_knowledge_base`: Decarbonization rule templates for industrial circularity.
16. `recommendations`: Dynamically generated interventions with cost, savings, and feasibility scores.
17. `scenarios`: What-if simulation configurations (solar %, recycled %, waste recovery %, freight %).
18. `scenario_results`: Calculated outputs from what-if runs (avoided CO₂, CAPEX, annual savings, payback).
19. `action_plans`: Execution roadmap items tracking champions, deadlines, budgets, and progress status.
20. `reports`: Generated executive sustainability audit reports.
21. `audit_logs`: Security and operational audit log trail recording user actions, IP addresses, and timestamps.

---

## Database Data Policy

The platform includes **one realistic Indian textile manufacturing dataset** for demonstration:

- **Factory Name**: `Shree Gujarat Textile Works Pvt. Ltd.`
- **Location**: `Ahmedabad, Gujarat, India`
- **Sector**: `Textile Manufacturing` (Cotton & Blended Fabrics)
- **Annual Production**: `8,000 tonnes / year`
- **Workforce**: 280 employees | **Operating Hours**: 20 hours/day

> **Disclaimer**: *Shree Gujarat Textile Works Pvt. Ltd.* is a demonstration dataset designed for hackathon evaluation and industrial benchmarking. It does not represent a real commercial entity. All emission figures, hotspots, and recommendations are dynamically computed from activity inputs and emission factors.

---

## Carbon Calculation Engine

Calculations follow the GHG Protocol Corporate Accounting and Reporting Standard.

### 1. Scope 1 — Direct Emissions
Combustion of fossil fuels owned or controlled by the industrial facility:
$$\text{Scope 1} = (\text{Diesel Litres} \times \text{EF}_{\text{diesel}}) + (\text{Natural Gas kWh} \times \text{EF}_{\text{gas}})$$
- **Diesel Backup Generators**: $45,000\text{ L} \times 2.68\text{ kg CO}_2\text{e/L} = 120.60\text{ tCO}_2\text{e}$
- **Natural Gas Boilers**: $1,200,000\text{ kWh} \times 0.202\text{ kg CO}_2\text{e/kWh} = 242.40\text{ tCO}_2\text{e}$
- **Total Scope 1**: **$363.00\text{ tCO}_2\text{e}$**

### 2. Scope 2 — Indirect Grid Electricity
Purchased grid electricity consumed for textile spinning, weaving, and finishing:
$$\text{Scope 2} = (\text{Grid kWh} - \text{Clean Solar Offset}) \times \text{EF}_{\text{grid}}$$
- **Grid Consumption**: $6,500,000\text{ kWh}$ ($500,000\text{ kWh}$ onsite solar generation offset)
- **Grid Emission Factor**: $0.716\text{ kg CO}_2\text{e/kWh}$ (Central Electricity Authority India - CEA Grid Baseline)
- **Total Scope 2**: **$4,324.94\text{ tCO}_2\text{e}$**

### 3. Scope 3 — Value Chain & Materials
Upstream purchased materials, solid waste management, and logistics freight:
$$\text{Scope 3} = \sum (\text{Material}_i \times \text{EF}_i) + \sum (\text{Waste}_j \times \text{EF}_j) + (\text{Freight Tonnes} \times \text{Distance km} \times \text{EF}_{\text{freight}})$$
- **Virgin Raw Cotton (Shankar-6)**: $6,500\text{ t} \times 2.10\text{ tCO}_2\text{e/t} = 13,650.00\text{ tCO}_2\text{e}$
- **Polyester Staple Fibre**: $1,000\text{ t} \times 3.40\text{ tCO}_2\text{e/t} = 3,400.00\text{ tCO}_2\text{e}$
- **Recycled Blended Fibre**: $500\text{ t} \times 0.55\text{ tCO}_2\text{e/t} = 275.00\text{ tCO}_2\text{e}$
- **Inbound & Outbound Transport**: $8,000\text{ t} \times 400\text{ avg km} \times 0.142\text{ kg CO}_2\text{e/t-km} = 908.80\text{ tCO}_2\text{e}$
- **Solid Waste (Scrap & Packaging)**: $550\text{ t} \text{ (with 60\% recovery loop)} = 84.00\text{ tCO}_2\text{e}$
- **Total Scope 3**: **$18,317.80\text{ tCO}_2\text{e}$**

$$\mathbf{\text{Total Annual Footprint}} = 363.00 + 4,324.94 + 18,317.80 = \mathbf{23,005.74\text{ tCO}_2\text{e}}$$

---

## Hotspot Detection Engine

The Hotspot Detector uses **Isolation Forest** outlier detection combined with proportional contribution thresholding:

$$\text{Contribution } \% = \frac{\text{Source Emissions (kg CO}_2\text{e)}}{\text{Total Emissions (kg CO}_2\text{e)}} \times 100$$

### Verified Demonstration Hotspot Ranking

| Rank | Emission Source | Scope | Annual CO₂e | Contribution % | Severity |
|:---:|---|:---:|:---:|:---:|:---:|
| **1** | **Virgin Raw Cotton (Shankar-6)** | Scope 3 | 13,650.00 t | **59.3%** | 🔴 *Critical* |
| **2** | **Grid Electricity (Torrent Power)** | Scope 2 | 4,324.94 t | **18.8%** | 🔴 *Critical* |
| **3** | **Polyester Staple Fibre (Virgin)** | Scope 3 | 3,400.00 t | **14.8%** | 🟠 *High* |
| **4** | **Inbound & Outbound Logistics Trucks** | Scope 3 | 908.80 t | **4.0%** | 🟡 *Medium* |
| **5** | **Natural Gas Boiler Combustion** | Scope 1 | 242.40 t | **1.1%** | 🟢 *Low* |
| **6** | **Diesel Backup Generator Sets** | Scope 1 | 120.60 t | **0.5%** | 🟢 *Low* |

---

## Circular Recommendation Engine

Interventions are matched to detected hotspots and evaluated using multi-attribute optimization.

### Demonstration Interventions
- **Total Potential CO₂ Cut**: **$4,867.73\text{ tCO}_2\text{e/year}$**
- **Total Potential Annual Savings**: **₹3,09,75,100 (~₹3.10 Crore / year)**

1. **Procure Mechanically Recycled Cotton & rPET Polyester Blends**  
   *Targets*: Virgin Cotton & Virgin Polyester ($74.1\%$ of factory footprint)  
   *CO₂ Cut*: $3,412.50\text{ tCO}_2\text{e}$ | *CAPEX*: ₹2,40,000 | *Annual Savings*: ₹1,24,800 | *Payback*: 14 months | *Circularity Boost*: $+25$ pts
2. **On-Site Rooftop Solar PV Installation (1.5 MWp)**  
   *Targets*: Grid Electricity ($18.8\%$ of factory footprint)  
   *CO₂ Cut*: $1,211.00\text{ tCO}_2\text{e}$ | *CAPEX*: ₹6,30,00,000 | *Annual Savings*: ₹1,62,50,000 | *Payback*: 36 months | *Circularity Boost*: $+18$ pts
3. **Establish Circular Take-Back for Fabric Cutting & Yarn Scrap**  
   *Targets*: Fabric & Yarn Scraps ($550\text{ t/year}$)  
   *CO₂ Cut*: $185.00\text{ tCO}_2\text{e}$ | *CAPEX*: ₹1,50,000 | *Annual Savings*: ₹97,500 | *Payback*: 10 months | *Circularity Boost*: $+22$ pts
4. **Supply Chain Backhaul Consolidation & High-Payload Logistics**  
   *Targets*: Logistics Freight ($908.8\text{ tCO}_2\text{e}$)  
   *CO₂ Cut*: $181.76\text{ tCO}_2\text{e}$ | *CAPEX*: ₹1,80,000 | *Annual Savings*: ₹81,000 | *Payback*: 8 months | *Circularity Boost*: $+10$ pts
5. **Install Waste Heat Recovery Economizer on Gas Boiler Flue**  
   *Targets*: Natural Gas Combustion ($242.4\text{ tCO}_2\text{e}$)  
   *CO₂ Cut*: $48.48\text{ tCO}_2\text{e}$ | *CAPEX*: ₹8,50,000 | *Annual Savings*: ₹3,23,000 | *Payback*: 20 months | *Circularity Boost*: $+12$ pts

---

## What-If Reactive Simulator

The simulator allows industrial decision-makers to adjust decarbonization levers using real-time parameter controls:

```text
[Solar Adoption %]          ─────●──────────  50%
[Recycled Material Input %] ────────●───────  35%
[Solid Waste Recovery %]    ─────────────●──  90%
[Freight Route Reduction %] ────●───────────  20%
```

The engine dynamically computes:
- Projected Gross Carbon Footprint ($tCO_2e$)
- Total Avoided Emissions ($tCO_2e$) and Reduction Percentage ($\%$)
- Capital Expenditure (CAPEX) Estimate in ₹ INR
- Projected Annual Operational Savings in ₹ INR
- Breakeven Payback Horizon (months)
- Projected Circularity Index ($0\text{--}100$)

---

## Scenario Comparison & Before vs After

| Scenario Name | Key Levers Applied | Projected CO₂e | Avoided CO₂e (%) | Annual Savings | Payback | Circularity Score |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Current Baseline** | Status Quo | $23,005.7\text{ t}$ | $0.0\text{ t } (0.0\%)$ | ₹0 | — | $37.7\text{ / }100$ |
| **Aggressive Renewable** | 50% Rooftop Solar | $20,843.2\text{ t}$ | $-2,162.5\text{ t } (9.4\%)$ | ₹1,62,50,000 | 48 mo | $45.2\text{ / }100$ |
| **Circular Materials** | 35% Recycled Yarns | $18,228.2\text{ t}$ | $-4,777.5\text{ t } (20.8\%)$ | ₹1,36,50,000 | 18 mo | $62.7\text{ / }100$ |
| **Maximum Waste Diversion**| 90% Scrap Recovery | $22,955.3\text{ t}$ | $-50.4\text{ t } (0.2\%)$ | ₹21,00,000 | 12 mo | $49.7\text{ / }100$ |
| **Combined Decarbonization**| Solar + Recycled + Waste | $\mathbf{15,833.3\text{ t}}$ | $\mathbf{-7,172.4\text{ t } (31.2\%)}$ | $\mathbf{₹3,29,08,800}$ | $\mathbf{26\text{ mo}}$ | $\mathbf{78.4\text{ / }100}$ |

---

## Data Confidence & Assumptions

CarbonCopilot AI makes estimation assumptions transparent:
- **Calculation Basis**: CEA CO₂ Baseline Database for the Indian Power Sector (v20.0), IPCC Guidelines for National Greenhouse Gas Inventories.
- **Data Confidence Matrix**: Category scores based on documentation pedigree (Utility bills: *High*, Fuel receipts: *High*, Material weighbridge slips: *High*, Average freight distance: *Medium*).
- **Financial Benchmarks**: Energy rates benchmarked to Gujarat industrial tariffs (₹8.50/kWh grid, ₹4.30/kWh rooftop solar LCOE).

---

## Technology Stack

### Frontend
- **Framework**: React 19.2.8 with TypeScript 6.0.2
- **Build Tool**: Vite 8.3.0
- **Routing**: React Router DOM 7.18.3
- **Styling**: Tailwind CSS 3.4.17 with custom industrial dark-mode palette
- **Data Visualization**: Recharts 3.10.1 (multi-axis bar charts, donut charts, area graphs)
- **Icons**: Lucide React 1.45.0
- **HTTP Client**: Axios 1.20.0 with automatic JWT interceptors

### Backend
- **Framework**: Python 3.10+ / FastAPI 0.110.0
- **Server**: Uvicorn (ASGI) with worker threading
- **Data Validation & Schemas**: Pydantic v2 & Pydantic-Settings
- **ORM & Database Toolkit**: SQLAlchemy 2.0+ with connection pooling and TCP keepalive
- **Authentication & Security**: Passlib (Bcrypt) + Python-Jose (JWT HS256)
- **Machine Learning & Analytics**: Scikit-learn 1.4.0 (Isolation Forest), NumPy 1.26.0, Pandas 2.2.0
- **Document Generation**: ReportLab 4.1.0 (PDF rendering engine)
- **Database Driver**: Psycopg2-binary 2.9.9

### Infrastructure & Database
- **Primary Database**: PostgreSQL 15+ (tested on Neon Serverless Cloud PostgreSQL over SSL)
- **Containerization**: Docker & Docker Compose (multi-stage builds)

---

## System Architecture

```text
               ┌────────────────────────────────────────────────────────┐
               │                     CLIENT BROWSER                     │
               │        React 19 + TypeScript + Tailwind CSS            │
               │   State Management, Role Guards, Recharts Visuals      │
               └───────────────────────────┬────────────────────────────┘
                                           │ HTTPS / JSON REST API
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │                   FASTAPI APPLICATION                  │
               │   JWT Authentication Interceptors, RBAC Role Checks    │
               └─────┬─────────────────────┬──────────────────────┬─────┘
                     │                     │                      │
       ┌─────────────┴─────┐      ┌────────┴──────────┐   ┌───────┴────────────┐
       ▼                   ▼      ▼                   ▼   ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Auth Router │    │Industry/Plant│    │ Assessments  │ │   Analysis   │ │  Simulator   │
└──────────────┘    └──────────────┘    └──────────────┘ └──────────────┘ └──────────────┘
       │                   │                   │                 │                │
       └───────────────────┴─────────┬─────────┴─────────────────┴────────────────┘
                                     │
                                     ▼
               ┌────────────────────────────────────────────────────────┐
               │                  APPLICATION SERVICES                  │
               │  • CarbonCalculationEngine (Deterministic Accounting)  │
               │  • HotspotDetectionEngine (Isolation Forest ML)        │
               │  • RecommendationEngine (Multi-Criteria Optimization)  │
               │  • SimulatorService (Reactive Decarbonization Models)  │
               │  • CircularityScoringEngine (Mass-Balance Scoring)     │
               │  • ReportService (ReportLab PDF Generation Engine)     │
               │  • AssistantService (Context-Grounded Copilot)         │
               └───────────────────────────┬────────────────────────────┘
                                           │ SQLAlchemy 2.0 ORM
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │                  POSTGRESQL DATABASE                   │
               │  21 Application Tables (Users, Inputs, Results, Logs)   │
               └────────────────────────────────────────────────────────┘
```

---

## Project Directory Structure

```text
Carbon_Copilot_Ai/
├── docker-compose.yml              # Multi-container orchestration (DB, API, Frontend)
├── README.md                       # Comprehensive project documentation
│
├── backend/                        # FastAPI Backend Application
│   ├── Dockerfile                  # Production container definition
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Sample environment template
│   └── app/
│       ├── main.py                 # Application factory, lifespan, CORS, route mounts
│       ├── api/
│       │   ├── deps.py             # RBAC role checkers, factory isolation dependencies
│       │   └── v1/
│       │       ├── auth.py         # Authentication (register, login, me, logout)
│       │       ├── industry.py     # Factory & industrial profile management
│       │       ├── assessment.py   # Carbon assessments lifecycle
│       │       ├── analysis.py     # Emissions calculation, hotspots, recommendations
│       │       ├── simulator.py    # What-if simulation and scenario comparison
│       │       ├── action_plan.py  # Decarbonization roadmap milestones
│       │       ├── dashboard.py    # Summary telemetry and KPI endpoints
│       │       ├── reports.py      # Audit report retrieval and PDF export
│       │       ├── assistant.py    # Context-grounded AI copilot chat
│       │       └── admin.py        # Users, factor library, rules, audit logs
│       ├── core/
│       │   ├── config.py           # Pydantic settings and environment management
│       │   ├── roles.py            # UserRole enum and granular permission definitions
│       │   └── security.py         # Bcrypt password hashing and JWT token handling
│       ├── database/
│       │   └── session.py          # SQLAlchemy engine, session maker, pool keepalives
│       ├── models/
│       │   └── models.py           # 21 SQLAlchemy ORM database models
│       ├── schemas/
│       │   └── schemas.py          # Pydantic request/response validation schemas
│       └── services/
│           ├── carbon_calculator.py    # Scope 1, 2, 3 carbon calculation engine
│           ├── circularity_score.py    # Material circularity index scoring engine
│           ├── hotspot_detector.py     # Isolation Forest hotspot leak-point engine
│           ├── recommendation_engine.py# Multi-criteria circular alternative recommender
│           ├── simulator_service.py    # Real-time what-if simulation engine
│           ├── report_generator.py     # Report data structuring & ReportLab PDF engine
│           ├── assistant_service.py    # Context-grounded telemetry chat assistant
│           └── audit_service.py        # Security & event audit trail logger
│
└── frontend/                       # React 19 Client Application
    ├── package.json                # NPM packages and script configurations
    ├── vite.config.ts              # Vite bundler configuration
    ├── tsconfig.json               # TypeScript compiler options
    ├── tailwind.config.js          # Industrial theme tokens and color definitions
    └── src/
        ├── App.tsx                 # Root router, shell layout, and route guards
        ├── main.tsx                # React DOM entrypoint
        ├── index.css               # Global styles and industrial dark-mode utilities
        ├── context/
        │   └── AuthContext.tsx     # Authentication state provider, JWT lifecycle
        ├── components/
        │   ├── Navbar.tsx          # Top navigation, plant metadata, assistant toggle
        │   ├── Sidebar.tsx         # Role-filtered navigation sidebar
        │   ├── ProtectedRoute.tsx  # JWT authentication route guard
        │   ├── RoleGuard.tsx       # RBAC role-level authorization route guard
        │   ├── PermissionGuard.tsx # Read-only state badge and action restrictor
        │   └── AiAssistantModal.tsx# Floating AI copilot interface
        ├── pages/
        │   ├── LandingPage.tsx     # Hero landing page and feature overview
        │   ├── LoginPage.tsx       # Secure user login interface
        │   ├── RegisterPage.tsx    # Role-based self-service registration
        │   ├── DashboardPage.tsx   # Executive carbon dashboard with KPIs and trends
        │   ├── AssessmentWizardPage.tsx # Input wizard for energy, materials, waste, logistics
        │   ├── HotspotsPage.tsx    # Leak-point ranking and severity analysis
        │   ├── RecommendationsPage.tsx # Circular recommendations with ROI & payback
        │   ├── SimulatorPage.tsx   # What-if reactive sliders interface
        │   ├── ScenarioComparisonPage.tsx # Side-by-side scenario matrix
        │   ├── ActionPlanPage.tsx  # Kanban roadmap tracking planned actions
        │   ├── ReportsPage.tsx     # Audit report viewer and PDF downloader
        │   ├── ProfilePage.tsx     # Factory facility metadata editor
        │   ├── HistoryPage.tsx     # Historical assessment registry
        │   ├── AdminUsersPage.tsx  # Admin user management and status toggles
        │   ├── AdminIndustriesPage.tsx # Consultant facility assignment console
        │   ├── EmissionFactorsPage.tsx # Emission factor library manager
        │   ├── RecommendationKnowledgePage.tsx # Circular rule base editor
        │   ├── AuditLogsPage.tsx   # Security audit trail log viewer
        │   ├── UnauthorizedPage.tsx# 401 unauthenticated notification page
        │   ├── ForbiddenPage.tsx   # 403 access denied notification page
        │   └── NotFoundPage.tsx    # 404 resource not found page
        ├── services/
        │   └── api.ts              # Axios API client functions with typed responses
        └── types/
            ├── index.ts            # TypeScript interfaces for platform domain entities
            └── roles.ts            # Role enum definitions and permission sets
```

---

## API Documentation

All endpoints are versioned under `/api/v1` and return standardized responses:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional status message",
  "error": null
}
```

### 1. Authentication (`/api/v1/auth`)
- `POST /register`: Register a new account (`factory_owner`, `sustainability_consultant`, `regulator_auditor`).
- `POST /login`: Authenticate with email and password to receive a JWT bearer token.
- `GET /me`: Fetch authenticated user profile and permissions.
- `POST /logout`: Terminate session and record audit event.

### 2. Factory Profile (`/api/v1/industry`)
- `GET /profile`: Retrieve active factory profile metadata (supports optional `?factory_id=` query).
- `PUT /profile`: Update factory metadata (Restricted to Factory Owner and Admin).

### 3. Assessments (`/api/v1/assessments`)
- `GET /`: List all assessments accessible to the authenticated role.
- `POST /`: Create a new annual carbon assessment cycle.
- `GET /{id}`: Retrieve detailed assessment records including all input activity data.
- `DELETE /{id}`: Delete an assessment record (Owner and Admin only).

### 4. Carbon Analysis & Hotspots (`/api/v1`)
- `POST /assessments/{id}/calculate`: Trigger the deterministic calculation and hotspot detection pipeline.
- `GET /assessments/{id}/emissions`: Retrieve calculated emissions broken down across Scope 1, 2, and 3.
- `GET /assessments/{id}/hotspots`: Retrieve ranked emission hotspots with severity levels.
- `GET /assessments/{id}/recommendations`: Retrieve matched circular recommendations with costs and payback.

### 5. What-If Simulator (`/api/v1/simulator`)
- `POST /calculate`: Run dynamic what-if simulation against customized parameter levers.
- `GET /compare/{assessment_id}`: Retrieve standardized scenario comparison presets.
- `POST /scenario`: Save a custom simulation run to the scenario comparison registry.

### 6. Action Plan (`/api/v1/action-plans`)
- `GET /`: List action plan items for the active assessment.
- `POST /`: Create a new action plan commitment from a recommendation.
- `PUT /{item_id}`: Update action plan status (*Planned*, *In Progress*, *Completed*).
- `DELETE /{item_id}`: Remove an action plan item.

### 7. Dashboard Analytics (`/api/v1/dashboard`)
- `GET /summary`: Retrieve executive KPI summary (Total $CO_2e$, Scope breakdown, circularity, top hotspot).

### 8. Audit Reports & PDF (`/api/v1/reports`)
- `GET /{assessment_id}`: Retrieve structured audit report content.
- `GET /{assessment_id}/pdf`: Generate and stream downloadable audit report PDF.
- `POST /{assessment_id}/generate`: Compile and store report metadata.

### 9. AI Assistant (`/api/v1/assistant`)
- `POST /chat`: Submit queries to the context-grounded AI copilot.

### 10. Admin & Governance (`/api/v1/admin`)
- `GET /users`: List all platform users and status flags (Admin only).
- `POST /users`: Provision user accounts directly (Admin only).
- `PUT /users/{id}/role`: Update user role with sole-admin protections.
- `PUT /users/{id}/status`: Toggle user account active status.
- `GET /industries`: View all registered factories and their consultant assignments.
- `POST /industries/assign-consultant`: Assign a sustainability consultant to a facility.
- `GET /emission-factors`: Query the emission factor database.
- `POST /emission-factors`: Register a new reference emission factor.
- `PUT /emission-factors/{id}`: Update an existing emission factor.
- `GET /recommendation-knowledge`: Query circular intervention rule templates.
- `POST /recommendation-knowledge`: Add new decarbonization rules.
- `GET /audit-logs`: Inspect chronological platform audit trails (Admin & Regulator).

---

## Installation & Local Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Python**: `v3.10` or higher
- **PostgreSQL**: `v14.0` or higher (local service or remote connection URI)
- **Git**: `v2.30` or higher

### 1. Clone Repository
```bash
git clone https://github.com/VadsolaKishan/Carbon_Copilot_Ai.git
cd Carbon_Copilot_Ai
```

### 2. Backend Setup
```bash
cd backend

# Create and activate Python virtual environment
# Windows:
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux:
# python3 -m venv .venv
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install
```

---

## Environment Variables

### Backend Configuration (`backend/.env`)
Create a `.env` file in the `backend/` directory based on `backend/.env.example`:

```env
# PostgreSQL Database Connection URI
DATABASE_URL=postgresql://user:password@localhost:5432/carboncopilot?sslmode=require

# JWT Authentication
JWT_SECRET=your-secure-random-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS Allowed Origins
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000","*"]
VITE_API_URL=http://localhost:8000/api/v1

# Environment
ENVIRONMENT=development

# Optional External Integrations (Platform operates fully without these)
LLM_API_KEY=
WEATHER_API_KEY=
MAPS_API_KEY=
```

### Frontend Configuration (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## Database Setup

The application uses SQLAlchemy to automatically initialize all 21 tables during the FastAPI startup lifespan without requiring manual SQL files:

```bash
# Verify backend connection and schema initialization
cd backend
python -c "from app.main import app; print('Database connected successfully.')"
```

---

## Running the Application

### Option A: Running with Native Processes

1. **Start the FastAPI Backend**:
   ```bash
   cd backend
   # Ensure virtual environment is active
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   *API will be operational at:* `http://localhost:8000`  
   *Interactive Swagger Documentation:* `http://localhost:8000/docs`

2. **Start the React Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   *Application will be live at:* `http://localhost:5173`

---

### Option B: Running with Docker Compose

To spin up PostgreSQL, the FastAPI backend, and the React frontend simultaneously:

```bash
docker-compose up --build
```
- **Web Application**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **PostgreSQL Database**: `localhost:5432`

---

## 60-Second Hackathon Demo Flow

Follow this rapid demonstration workflow:

```text
1. Login
   └── Navigate to http://localhost:5173/login
   └── Sign in as Factory Owner (Rajesh Patel)

2. Executive Dashboard
   └── Inspect plant headline for "Shree Gujarat Textile Works Pvt. Ltd."
   └── Review Total Carbon Footprint: 23,005.74 tCO2e
   └── Review Scope breakdown: Scope 1 (363t), Scope 2 (4,325t), Scope 3 (18,318t)
   └── Observe initial Circularity Score: 37.7 / 100 (Linear Economy Risk)

3. Hotspots Leak-Point Analysis
   └── Click "Hotspots" in the sidebar
   └── Point out Top Leak Point: Virgin Raw Cotton (59.3% of emissions, Critical)
   └── Highlight Grid Electricity (18.8% of emissions, Critical)

4. Circular Recommendations
   └── Navigate to "AI Recommendations"
   └── Show prioritized recommendations with verified financial models
   └── Highlight "Procure Mechanically Recycled Cotton" (Cuts 3,412.5 tCO2e, 14-month payback)
   └── Highlight "1.5 MWp Rooftop Solar PV" (Cuts 1,211 tCO2e, ₹1.62 Cr annual savings)

5. What-If Reactive Simulator
   └── Open "What-If Simulator"
   └── Move the sliders:
       • Solar Adoption: 50%
       • Recycled Materials: 35%
       • Waste Recovery: 90%
   └── Watch the impact recalculate:
       • Avoided CO2e: -7,172.4 tCO2e (-31.2%)
       • Projected Annual Savings: ₹3.29 Crore
       • Projected Circularity Score jumps from 37.7 ──▶ 78.4

6. Scenario Comparison
   └── Open "Scenarios" to compare the Baseline against the Combined Roadmap
   └── Commit the optimal scenario to the facility Action Plan

7. Action Roadmap & PDF Export
   └── View "Action Plan" showing prioritized commitments and progress status
   └── Navigate to "Reports" and click "Download PDF" for the audit report
```

---

## Verification & Testing

The platform includes an end-to-end automated verification test suite:

```bash
cd backend
python -u scripts/verify_all.py
```

### Verified Test Results (43 / 43 Tests Passed)
- **Authentication & Security (9 tests)**: Validated login across all 4 roles, password rejection, token expiration, public admin registration blocking, bcrypt hash verification.
- **Factory Owner Authorization (11 tests)**: Validated dashboard telemetry, factory metadata, assessment queries, Scope 1/2/3 breakdown, 12 detected hotspots, 5 recommendations, simulator compare presets, action plans, and ReportLab PDF export.
- **Sustainability Consultant RBAC (4 tests)**: Validated access to assigned plant (`Shree Gujarat Textile Works`), verified cross-factory protection, confirmed `HTTP 403` block on unassigned plants and administrative endpoints.
- **Regulator / Auditor RBAC (7 tests)**: Confirmed read-only access to factory profiles, assessments, emission factors, and audit logs. Verified that write operations (POST/PUT) are rejected with `HTTP 403 Forbidden`.
- **Admin Management (6 tests)**: Validated user registry query, industry management, emission factor curation, recommendation rule base queries, audit trails, and sole-admin demotion safeguards.
- **Database Integrity & Table Counts (6 tests)**: Verified that testing left zero dirty test records and confirmed the presence of all 21 tables.

### Frontend Production Build
```bash
cd frontend
npm run build
```
- **TypeScript**: 0 compiler errors (`tsc -b`).
- **Bundler**: Vite built 2,531 modules into `dist/` with 0 bundling errors.

---

## Page Directory

The React client contains **21 pages** organized across platform roles:

### Public Pages
- `LandingPage.tsx` (`/`): Value proposition, platform architecture, and feature overview.
- `LoginPage.tsx` (`/login`): User authentication interface.
- `RegisterPage.tsx` (`/register`): Role-based self-service registration.
- `UnauthorizedPage.tsx` (`/unauthorized`): `401 Unauthorized` handling.
- `ForbiddenPage.tsx` (`/forbidden`): `403 Forbidden` handling.
- `NotFoundPage.tsx` (`/*`): `404 Not Found` handling.

### Core Industrial Pages (Owner & Consultant)
- `DashboardPage.tsx` (`/dashboard`): Executive telemetry, KPIs, scope breakdowns, and circularity.
- `AssessmentWizardPage.tsx` (`/assessment/new`): Multi-step input wizard for process data.
- `HotspotsPage.tsx` (`/hotspots`): Leak-point ranking and severity distribution.
- `RecommendationsPage.tsx` (`/recommendations`): Cost-modeled circular interventions.
- `SimulatorPage.tsx` (`/simulator`): Dynamic what-if reactive levers.
- `ScenarioComparisonPage.tsx` (`/scenarios`): Comparative analysis of decarbonization pathways.
- `ActionPlanPage.tsx` (`/action-plan`): Roadmap tracker with milestone statuses.
- `ReportsPage.tsx` (`/reports`): Audit report viewer and PDF downloader.
- `ProfilePage.tsx` (`/profile`): Industrial facility profile editor.
- `HistoryPage.tsx` (`/history`): Longitudinal assessment registry.

### Governance & Administration (Admin & Regulator)
- `AuditLogsPage.tsx` (`/audit-logs`): Security and event audit trail viewer.
- `EmissionFactorsPage.tsx` (`/admin/emission-factors`): Reference factor library manager.
- `RecommendationKnowledgePage.tsx` (`/admin/recommendation-knowledge`): Decarbonization rule base editor.
- `AdminUsersPage.tsx` (`/admin/users`): User accounts console and status toggles.
- `AdminIndustriesPage.tsx` (`/admin/industries`): Plant registry and consultant assignment console.

---

## Security & Compliance

- **No Secrets in Source Control**: Passwords, JWT secrets, and keys are excluded from git.
- **Bcrypt Password Security**: Passwords hashed using bcrypt with individual salts; plain text credentials are never persisted.
- **IDOR Protection**: All API endpoints inspect factory ownership and explicit assignment relationships before returning records.
- **Server-Side Enforcement**: Client-side UI hiding is backed by server-side dependency guards (`require_roles`, `verify_factory_access`).
- **Comprehensive Audit Logging**: Sensitive events (authentication, calculations, role changes, PDF downloads) are recorded in the `audit_logs` table.

---

## Responsible Data & Limitations

- **Input Completeness**: Calculation accuracy depends on the fidelity of activity data provided by the plant.
- **Emission Factor Vintage**: Reference factors represent average national and regional baselines (e.g., CEA India, IPCC); facility-specific test data should be utilized where available.
- **Financial Projections**: CAPEX, annual savings, and payback periods are modeled estimates for pre-feasibility analysis. Formal engineering audits are advised before capital deployment.
- **Demonstration Context**: The included *Shree Gujarat Textile Works Pvt. Ltd.* dataset is a demonstration setup designed for hackathon evaluation.

---

## Future Roadmap

The following capabilities represent planned extensions:

- [ ] **Direct IoT Sensor Ingestion**: Real-time integration with smart energy meters and flow sensors via MQTT/Modbus.
- [ ] **Automated Utility Bill OCR**: Document extraction pipelines for electricity and gas invoices.
- [ ] **Multi-Facility Corporate Rollup**: Parent corporation dashboards aggregating footprints across multiple plant sites.
- [ ] **Supplier Scope 3 Portal**: Collaborative portal for suppliers to submit verified primary emission factor disclosures.
- [ ] **Regulatory BRSR / CBAM Auto-Filer**: Automated generation of statutory compliance filings for India SEBI BRSR and EU Carbon Border Adjustment Mechanism (CBAM).

---

## Deployment

### Production Topology
```text
React 19 Frontend (Vercel / Nginx)
        │
        ▼ HTTPS
FastAPI Backend (Render / Railway / Cloud Run / VPS)
        │
        ▼ SSL / TLS
Neon Serverless PostgreSQL (or AWS RDS / Supabase)
```

### Production Environment Checklist
- Ensure `ENVIRONMENT=production` in backend configuration.
- Set a strong, randomly generated `JWT_SECRET`.
- Specify explicit production domain names in `CORS_ORIGINS`.
- Verify database connection strings enforce `sslmode=require`.

---

## Contributing

1. Fork the repository and create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Implement your enhancements adhering to existing code conventions.
3. Verify backend imports and execution:
   ```bash
   python -c "from app.main import app; print('Backend valid.')"
   ```
4. Verify frontend compilation:
   ```bash
   npm run build
   ```
5. Commit changes with clear commit messages:
   ```bash
   git commit -m "feat: enhance recommendation scoring weights"
   ```
6. Push to your branch and open a Pull Request.

---

## License

License: Not yet specified.

---

## Acknowledgements

- **HackOut'26**: Industrial Decarbonization and Circular Economy Challenge.
- **Central Electricity Authority (CEA), Govt. of India**: Reference Indian Grid Emission Factors (v20.0).
- **Intergovernmental Panel on Climate Change (IPCC)**: Emission Factor Database (EFDB).
- **GHG Protocol**: Corporate Accounting and Reporting Standard.
