# CarbonCopilot AI

**Industrial Emission Leak-Point Detector & Circular Alternative Recommender**  
*Built for the HackOut'26 Industrial Decarbonization Problem Statement*

> **Tagline:** Detect. Recommend. Simulate. Reduce.  
> **Brand Philosophy:** *"Don't just calculate CO₂e—detect where emissions leak, explain why they happen, recommend high-ROI circular alternatives, simulate the future with live reactive sliders, and turn insights into a prioritized action plan."*

---

## 🏭 1. Problem Statement & Impact

Small and Medium Enterprises (SMEs) and factory operators account for over 45% of global industrial carbon emissions. However, existing tools are either:
1. **Generic carbon calculators** that output an aggregate tonnage number without pinpointing actionable leak points.
2. **Complex enterprise carbon accounting platforms** costing tens of thousands of dollars requiring certified auditors.

**CarbonCopilot AI** solves this bottleneck by providing an intelligent, transparent, and costed decarbonization copilot that pinpoints exact process leak points, explains their financial and environmental severity, matches them against circular economy interventions, and lets operators simulate future investments in real time.

### Target Users
- **Industrial SMEs & Plant Managers**: Discover where carbon is leaking and get practical circular interventions with clear payback periods.
- **Sustainability Consultants**: Produce audit-ready carbon balance sheets and GHG Protocol Scope 1-3 reports in minutes.
- **Industry Regulators & Auditing Agencies**: Verify deterministic calculation traces tied to official IPCC and CEA emission factors.

---

## ⚡ 2. Key Features

- 🔍 **Deterministic Carbon Calculation Engine**: Activity × Emission Factor traceability across Scope 1 (direct fuels), Scope 2 (grid electricity), and Scope 3 (purchased feedstock, waste, and logistics).
- 🚨 **Statistical Leak-Point Hotspot Detector**: Categorizes sources into Critical (>30%), High (15-30%), Medium (5-15%), and Low (<5%) with Scikit-Learn **Isolation Forest** anomaly detection.
- 💡 **AI Circular Recommendation Engine**: 30+ industrial interventions scored via multi-attribute optimization (30% CO₂ impact + 20% cost effectiveness + 20% feasibility + 15% savings + 15% circularity).
- 🎛️ **What-If Reactive Simulator (Killer Feature)**: Instantaneous dynamic sliders (Solar adoption, Recycled materials, Waste recovery, Logistics) recalculating avoided CO₂, CAPEX, annual savings, and payback periods in real-time.
- 📊 **Scenario Comparison Matrix**: Side-by-side comparative analysis of Baseline vs Solar Transition vs Recycled Feedstock vs Maximum Circularity with auto-recommended pathways.
- 📋 **Operational Action Roadmap**: Drag-and-drop / Kanban workflow (Planned, In Progress, Completed) tracking plant champions, target dates, and aggregate capital deployment.
- 📄 **Executive Audit Reports & PDF Export**: Instant downloadable executive reports with compliance disclaimers and transparent calculation assumptions.
- 🤖 **Zero-Hallucination AI Copilot Assistant**: Context-grounded assistant answering questions strictly from the active factory's telemetry data.
- 🚀 **1-Click Hackathon Judge Demo Engine**: Instant switcher between 3 real-world factories:
  1. **Surat Eco-Weave Textiles** (Gujarat) — Thermal coal & grid electricity heavy with virgin polyester.
  2. **Punjab Agro-Foods Ltd** (Ludhiana) — Food processing with organic waste methane leaks and cold chain diesel.
  3. **GreenPack Polymer Solutions** (Pune) — Packaging extruder with virgin resin inputs and long-distance freight.

---

## 🏗️ 3. Architecture & Tech Stack

```
                               ┌────────────────────────────────────────────────────────┐
                               │                    REACT FRONTEND                      │
                               │  Vite + TypeScript + Tailwind CSS + Recharts + Lucide  │
                               └───────────────────────────┬────────────────────────────┘
                                                           │ REST API / Axios (JWT)
                                                           ▼
                               ┌────────────────────────────────────────────────────────┐
                               │                   FASTAPI BACKEND                      │
                               │  app/api/v1: Auth, Profile, Assessment, Hotspots, etc. │
                               └──────┬────────────────────┬────────────────────┬───────┘
                                      │                    │                    │
              ┌───────────────────────┴────────┐ ┌─────────┴──────────┐ ┌───────┴────────────────────────┐
              ▼                                ▼ ▼                    ▼ ▼                                ▼
    ┌──────────────────┐           ┌──────────────────────┐ ┌────────────────────┐            ┌────────────────────┐
    │  CARBON ENGINE   │           │   HOTSPOT DETECTOR   │ │ RECOMMENDATION     │            │ WHAT-IF SIMULATOR  │
    │ Activity × Factor│           │ Isolation Forest +   │ │ Rule Knowledgebase │            │ Reactive Sliders   │
    │ Traceable GHG    │           │ Severity Classifier  │ │ + Multi-attr Score │            │ Scenario Compare   │
    └─────────┬────────┘           └──────────┬───────────┘ └─────────┬──────────┘            └─────────┬──────────┘
              │                               │                       │                                 │
              └───────────────────────────────┼───────────────────────┴─────────────────────────────────┘
                                              ▼
                               ┌──────────────────────────────┐
                               │  SQLAlchemy ORM + SQLite/PG  │
                               │ Emission Factors & Profiles  │
                               └──────────────────────────────┘
```

### Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS (Industrial Green Intelligence theme), Lucide Icons, Recharts, Axios, Canvas Confetti.
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy, SQLite (instant local run) & PostgreSQL ready, Passlib / bcrypt, PyJWT, Scikit-learn (Isolation Forest), Pandas, NumPy, ReportLab.
- **Containerization**: Docker, Docker Compose, Nginx.

---

## 📐 4. Carbon Calculation Methodology

Every number generated by CarbonCopilot is strictly traceable to verified emission factors and activity quantities:

$$\text{Emissions} = \text{Activity Quantity} \times \text{Emission Factor}$$

### Emission Factor Database Sources
- **Scope 1 (Direct)**:
  - Bituminous Coal: `2.42 kg CO₂e / kg` (IPCC / CEA India)
  - Industrial Diesel: `2.68 kg CO₂e / litre` (IPCC / DEFRA)
  - Piped Natural Gas: `2.02 kg CO₂e / m³` (DEFRA)
  - Commercial LPG: `2.98 kg CO₂e / kg` (IPCC)
  - Agro-Biomass Briquettes: `0.15 kg CO₂e / kg` (MNRE India / Biogenic net)
- **Scope 2 (Indirect Grid)**:
  - India National Grid Average: `0.716 kg CO₂e / kWh` (Central Electricity Authority CEA India v19)
  - On-site Solar PV (Lifecycle): `0.041 kg CO₂e / kWh` (NREL / IPCC)
- **Scope 3 (Supply Chain & Waste)**:
  - Virgin Polyester: `5.50 kg CO₂e / kg` vs Recycled PET (rPET): `1.80 kg CO₂e / kg` (Ecoinvent 3.9)
  - Virgin Steel: `1.89 kg CO₂e / kg` vs Recycled Steel: `0.45 kg CO₂e / kg` (WorldSteel)
  - Municipal Landfill: `0.58 kg CO₂e / kg` vs Recycling Diversion: `0.05 kg CO₂e / kg` (IPCC / WRAP)
  - Heavy Freight Trucking: `0.115 kg CO₂e / tonne-km` (GLEC Framework / DEFRA)

### Circularity Score Formulation
Normalized 0–100 scale synthesizing:
- Renewable energy share (25 pts)
- Recycled material feedstock ratio (30 pts)
- Waste diversion from landfills (30 pts)
- Supply chain locality & transport efficiency (15 pts)

---

## 🚀 5. Quick Start & Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Option A: Local Development (Fastest)

#### 1. Start the Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

#### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
- Open your browser at: `http://localhost:5173`

---

### Option B: Docker Compose
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

---

## 🔑 6. Demo Account Credentials

Judges can log in with:
- **Email:** `demo@carboncopilot.ai`
- **Password:** `demo1234`

Alternatively, click the **"HackOut'26 Demo Bar"** at the top of any page to switch between the 3 industrial facilities in 1 click!

---

## 🧪 7. Automated Testing

Run the comprehensive unit and API test suite:
```bash
cd backend
python -m pytest tests/ -v
```

All 7 test suites validate unit conversions, mathematical integrity of Scope 1/2/3 calculations, and REST API contracts.

---

## 🏆 8. Winning Presentation Flow (60-Second Hackathon Demo)

1. **Meet the Factory**: Load *Surat Eco-Weave Textiles*. Show the baseline of `615.9 tCO₂e/month` and `Intensity: 5.13 kg/unit`.
2. **Detect the Leak**: Open **Emission Hotspots**. Point out *Virgin Polyester* generating **46.6%** (Critical) and *Boiler Coal* generating **12.6%**.
3. **Inspect Circular Recommendations**: View *Priority 1: Substitute 40% Virgin Polyester with Recycled PET* cutting **129 tonnes CO₂e/yr** with a **23.1-month payback**.
4. **Simulate the Future**: Open the **What-If Simulator**. Move the *Solar Adoption* slider to 40% and *Recycled Material* to 45%. Watch emissions drop live to `412 tCO₂e` saving **₹14.2 Lakh/year**.
5. **Commit to Action**: Click **"Save Scenario"** (triggering celebration confetti) and view the committed initiatives in the **Action Roadmap**.
6. **Download Audit Report**: Go to **Audit Reports** and click **Download Official PDF** for an ISO-standard summary.

---

## ⚖️ 9. Responsible AI & Limitations

- **Decision-Support Focus**: CarbonCopilot AI provides engineering decision-support estimates. While based on verified IPCC and CEA factors, certified regulatory declarations require site-specific measurement verification.
- **Transparency First**: All underlying assumptions, emission factors, and financial payback models are fully disclosed in the UI and API documentation.

---

*CarbonCopilot AI — From Emissions to Action.*
