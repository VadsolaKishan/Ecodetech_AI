# CarbonCopilot AI

> **Detect. Recommend. Simulate. Reduce.**  
> *From emissions to action.*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi&logoColor=white)]()
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=flat&logo=react&logoColor=black)]()
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%206-3178C6?style=flat&logo=typescript&logoColor=white)]()
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2015-336791?style=flat&logo=postgresql&logoColor=white)]()
[![Scikit-Learn](https://img.shields.io/badge/ML-Isolation%20Forest-F7931E?style=flat&logo=scikitlearn&logoColor=white)]()
[![Status](https://img.shields.io/badge/Audit-43%2F43%20Tests%20Passed-brightgreen?style=flat)]()

CarbonCopilot AI is an enterprise-grade industrial sustainability platform designed to help manufacturing facilities pinpoint process emission leak-points and take immediate, cost-modeled decarbonization actions through circular economy interventions.

> **"We don't just calculate carbon. We tell industries what to do next."**

---

## 🔑 Demo Login Credentials (Ready to Test)

The project includes pre-configured accounts across all **4 system roles** connected to our demonstration facility (*Shree Gujarat Textile Works Pvt. Ltd.*, Ahmedabad, India):

| Role | Name | Email | Password | Access Scope |
|---|---|---|---|---|
| **Factory Owner** | Rajesh Patel | `rajesh.patel@carboncopilot.ai` | `RajeshPatel@Carbon2026!` | **Full Access** to own factory & operations |
| **Sustainability Consultant** | Priya Shah | `priya.shah@carboncopilot.ai` | `PriyaShah@Carbon2026!` | **Full Access** to assigned factories |
| **Regulator / Auditor** | Amit Desai | `amit.desai@carboncopilot.ai` | `AmitDesai@Carbon2026!` | **Strictly READ-ONLY** audit inspection |
| **System Admin** | Arjun Mehta | `arjun.mehta@carboncopilot.ai` | `ArjunMehta@Carbon2026!` | **Global Governance**, users, rules & logs |

> 💡 **Tip for Judges**: Log in as **Rajesh Patel** to experience the complete decarbonization workflow, or as **Amit Desai** to verify read-only regulatory enforcement.

---

## 👥 Role-Based Access Control (RBAC)

CarbonCopilot AI enforces strict multi-tenant authorization at the API dependency layer (`app.api.deps`):

### 1. Factory Owner (`factory_owner`)
- **Primary Persona**: Industrial plant owner, managing director, or plant manager.
- **Access**: Full operational control over their registered factory and assessments.
- **Can Do**: Create & edit factory profiles, run carbon calculations, view leak-point hotspots, adjust what-if simulation sliders, manage action plans, generate audit reports, export PDFs.
- **Restrictions**: Cannot access administrative consoles (`/admin/users`, `/admin/emission-factors`). Cannot access data belonging to other industrial facilities.

### 2. Sustainability Consultant (`sustainability_consultant`)
- **Primary Persona**: Environmental consultant or ESG advisory auditor.
- **Access**: Multi-factory operational management restricted to facilities explicitly assigned via `factory_assignments`.
- **Can Do**: Run assessments on assigned client facilities, perform what-if simulations, formulate action plans, export compliance reports.
- **Restrictions**: Attempts to access unassigned facilities return `403 Forbidden`. Administrative user endpoints are blocked.

### 3. Regulator / Auditor (`regulator_auditor`)
- **Primary Persona**: Environmental protection officer, pollution board auditor, or corporate compliance inspector.
- **Access**: **Strictly READ-ONLY** inspection access.
- **Can Do**: Inspect factory profiles, assessments, Scope 1-3 breakdowns, emission factors, hotspot detections, circular recommendations, and download audit report PDFs.
- **Restrictions**: **All write operations (POST, PUT, DELETE) are permanently blocked** by backend guards (`HTTP 403 Forbidden`). Cannot alter facility data, change emission factors, or access user administration.

### 4. System Administrator (`admin`)
- **Primary Persona**: Platform operations and governance lead.
- **Access**: Full global administrative control.
- **Can Do**: Manage user accounts and active statuses, assign consultants to factories, curate the emission factors library, tune circular recommendation rule templates, review audit trails.
- **Safeguards**: System protects against accidental self-demotion of the sole active administrator.

---

## 📊 Comprehensive Role Access Matrix

| Platform Feature / Page | Factory Owner | Sustainability Consultant | Regulator / Auditor | Admin |
|---|:---:|:---:|:---:|:---:|
| **Executive Dashboard** | Full (Own Plant) | Full (Assigned) | Read-Only | Full |
| **Factory Profile** | View & Edit | Assigned (Read) | Read-Only | Full |
| **Carbon Assessments** | View & Create | Assigned (Create) | Read-Only | Full |
| **Emissions Breakdown (Scope 1, 2, 3)**| Full | Full | Read-Only | Full |
| **Hotspot Leak-Point Ranking** | Full | Full | Read-Only | Full |
| **Circular Recommendations** | Full | Full | Read-Only | Full |
| **Circularity Score (0–100)** | Full | Full | Read-Only | Full |
| **What-If Reactive Simulator** | Full | Full | Read-Only | Full |
| **Scenario Comparison Matrix** | Full | Full | Read-Only | Full |
| **Action Plan Roadmap** | Full (Own) | Full (Assigned) | Read-Only | Full |
| **Audit Reports** | View & Generate | View & Generate | Read-Only | Full |
| **Printable PDF Export** | Export | Export | Export | Full |
| **Assessment History Registry** | View (Own) | View (Assigned) | Read-Only | Full |
| **AI Copilot Assistant** | Active | Active | Restricted | Active |
| **Audit Trail Logs** | Denied (403) | Denied (403) | Read-Only | Full |
| **Emission Factors Library** | Denied (403) | Denied (403) | Read-Only | View & Edit |
| **Knowledge Base Rules** | Denied (403) | Denied (403) | Read-Only | View & Edit |
| **User Account Management** | Denied (403) | Denied (403) | Denied (403) | Full |
| **Consultant Facility Assignment**| Denied (403) | Denied (403) | Denied (403) | Full |

---

## ⚡ 60-Second Winning Hackathon Flow

```text
[1. Login] ────────▶ [2. Dashboard] ────────▶ [3. Hotspots] ────────▶ [4. Recommendations]
  Rajesh Patel         Total: 23,005 tCO2e      Top: Virgin Cotton      Procure Recycled Blends
  factory_owner        Scope 1/2/3 Breakdown    59.3% (Critical Leak)   Cuts 3,412 tCO2e (14 mo ROI)
                                                                                  │
                                                                                  ▼
[8. Audit PDF] ◀─── [7. Action Plan] ◀─── [6. Scenarios] ◀─── [5. What-If Simulator]
  One-Click Download   Milestones & Ownership   Baseline vs Combined    Reactive Sliders:
  ReportLab Generated  Planned / In Progress    -31.2% CO2e Reduction   Solar 50%, Recycled 35%
```

1. **Sign In**: Navigate to `/login` and authenticate as **Rajesh Patel** (`factory_owner`).
2. **Review Telemetry**: Open the Dashboard to observe **23,005.74 tCO2e** gross emissions and a low Circularity Score of **37.7 / 100** (*Linear Economy Risk*).
3. **Inspect Leak-Points**: Open **Hotspots** to discover that **Virgin Raw Cotton** represents **59.3%** of the entire plant's footprint, followed by **Grid Electricity** at **18.8%**.
4. **Evaluate Solutions**: Open **AI Recommendations** to review cost-modeled circular interventions totaling **₹3.10 Crore** in annual operational savings and **4,867.73 tCO2e** in reductions.
5. **Simulate the Future**: Open the **What-If Simulator**, drag the sliders (50% Solar, 35% Recycled Cotton, 90% Waste Recovery), and observe emissions drop by **-31.2% (-7,172.4 tCO2e)** while the circularity score surges to **78.4 / 100**.
6. **Deploy & Export**: Add the winning roadmap to the **Action Plan** and export the **Sustainability Audit PDF Report**.

---

## 🏭 Verified Demonstration Dataset (Indian Context)

All demo analytics are grounded in a coherent, realistic dataset reflecting industrial textile manufacturing in India:

- **Facility**: `Shree Gujarat Textile Works Pvt. Ltd.` (Ahmedabad, Gujarat, India)
- **Sector**: Textile Manufacturing (Cotton & Blended Fabric) | **Capacity**: 8,000 tonnes/year
- **Energy**: 6,500,000 kWh Grid Electricity, 45,000 L Diesel, 1,200,000 kWh Natural Gas, 500,000 kWh Rooftop Solar
- **Materials**: 6,500 tonnes Virgin Cotton (Shankar-6), 1,000 tonnes Polyester, 500 tonnes Recycled Fiber
- **Waste & Freight**: 550 tonnes solid scrap (60% recovery rate), 8,000 tonnes freight over 400 km average haul
- **Total Calculated Emissions**: **`23,005.74 tCO2e`** (Scope 1: `363.00t`, Scope 2: `4,324.94t`, Scope 3: `18,317.80t`)

> *Note: Shree Gujarat Textile Works Pvt. Ltd. is a demonstration dataset designed for hackathon evaluation and industrial benchmarking.*

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND CLIENT (REACT 19)                      │
│   TypeScript 6 • Vite • Tailwind CSS • Recharts • Lucide • Axios       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / JWT REST API
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND API (FASTAPI)                           │
│   OAuth2 Bearer Auth • Multi-Tenant RBAC Guards • Pydantic Schemas    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION ENGINES                             │
│   • CarbonCalculationEngine: Activity × EF (Scope 1, 2, 3 Accounting) │
│   • HotspotDetectionEngine: Isolation Forest Outlier Leak-Detection   │
│   • RecommendationEngine: Multi-Attribute Circularity Optimizer       │
│   • SimulatorService: Real-time What-If Reactive Decarbonization       │
│   • CircularityScoringEngine: 0-100 Material Circularity Index        │
│   • ReportService: ReportLab Executive PDF Document Generator          │
│   • AssistantService: Context-Grounded Operational Copilot             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SQLAlchemy 2.0 ORM
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     DATABASE (POSTGRESQL - 21 TABLES)                  │
│   Neon Cloud Serverless PostgreSQL / Local PostgreSQL 15+ over SSL     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Architecture (21 Application Tables)

The application database comprises **exactly 21 tables**:

```text
1.  roles                         -> Core system roles (factory_owner, consultant, auditor, admin)
2.  users                         -> User authentication, hashed credentials, and role bindings
3.  industries                    -> Industrial facility metadata, location, workforce, production
4.  factories                     -> Physical plant unit records
5.  factory_assignments           -> Relational mapping of consultants & auditors to facilities
6.  assessments                   -> Annual carbon accounting cycles & circularity ratings
7.  energy_inputs                 -> Energy consumption records (grid, diesel, gas, solar)
8.  material_inputs               -> Feedstock records (virgin cotton, polyester, recycled yarns)
9.  waste_inputs                  -> Industrial scrap records (cutting, packaging, recovery rates)
10. transport_inputs              -> Logistics freight records (distances, vehicle types, tonne-km)
11. emission_factors              -> Official emission factor database (CEA India, IPCC)
12. emission_results              -> Computed Scope 1, 2, and 3 emission records
13. emission_hotspots             -> Isolation Forest ranked process leak-points
14. data_confidence               -> Pedigree and uncertainty ratings across activity vectors
15. recommendation_knowledge_base -> Circular decarbonization rule templates
16. recommendations               -> Generated plant interventions with ROI, CAPEX, and savings
17. scenarios                     -> What-if simulation configurations
18. scenario_results              -> Computed simulation outputs (avoided CO2e, financial payback)
19. action_plans                  -> Decarbonization project milestones & champion ownership
20. reports                       -> Executive sustainability audit report metadata
21. audit_logs                    -> Complete security and operational event trail
```

---

## 💻 Technology Stack

### Frontend
- **Framework**: React 19.2.8 with TypeScript 6.0.2
- **Build Tool**: Vite 8.3.0
- **Routing**: React Router DOM 7.18.3
- **Styling**: Tailwind CSS 3.4.17 (Custom dark industrial theme)
- **Charts**: Recharts 3.10.1 (Donuts, comparative bar charts, area projections)
- **Icons**: Lucide React 1.45.0
- **HTTP**: Axios 1.20.0 with automatic JWT interceptors

### Backend
- **Framework**: Python 3.10+ / FastAPI 0.110.0
- **Server**: Uvicorn ASGI with multi-threading
- **Validation**: Pydantic v2 & Pydantic-Settings
- **Database & ORM**: SQLAlchemy 2.0+ with connection pooling and TCP keepalive
- **Security**: Passlib (Bcrypt) + Python-Jose (JWT HS256)
- **Machine Learning**: Scikit-Learn 1.4.0 (Isolation Forest), NumPy, Pandas
- **PDF Generation**: ReportLab 4.1.0

### Database & DevOps
- **Database**: PostgreSQL 15+ (tested on Neon Serverless Cloud PostgreSQL)
- **Containerization**: Docker & Docker Compose

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL (Local or Cloud URI)

### 1. Setup Backend
```bash
cd backend
python -m venv .venv

# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:
```env
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require
JWT_SECRET=carboncopilot_secure_jwt_secret_key_2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000","*"]
VITE_API_URL=http://localhost:8000/api/v1
ENVIRONMENT=development
```

Run the backend server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*API Documentation live at:* `http://localhost:8000/docs`

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
*Web Application live at:* `http://localhost:5173`

---

### Docker Compose (One-Command Setup)
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 📡 API Reference Overview

All endpoints are versioned under `/api/v1`:

| Domain | Method & Path | Description | Access |
|---|---|---|---|
| **Auth** | `POST /auth/login` | Authenticate & receive JWT bearer token | Public |
| **Auth** | `POST /auth/register` | Register new user (Admin role blocked) | Public |
| **Auth** | `GET /auth/me` | Fetch authenticated profile & permissions | All Roles |
| **Factory** | `GET /industry/profile` | Retrieve factory metadata | All Roles |
| **Factory** | `PUT /industry/profile` | Update factory metadata | Owner, Admin |
| **Assessments**| `GET /assessments` | List accessible carbon assessments | All Roles |
| **Assessments**| `POST /assessments` | Create new assessment cycle | Owner, Consultant, Admin |
| **Analysis** | `POST /assessments/{id}/calculate` | Run carbon accounting & hotspot pipeline | Owner, Consultant, Admin |
| **Analysis** | `GET /assessments/{id}/emissions` | Retrieve Scope 1, 2, 3 footprint breakdown | All Roles |
| **Hotspots** | `GET /assessments/{id}/hotspots` | Retrieve Isolation Forest ranked leak-points| All Roles |
| **Recommendations**| `GET /assessments/{id}/recommendations`| Retrieve circular interventions with ROI | All Roles |
| **Simulator**| `POST /simulator/calculate` | Execute dynamic what-if simulation | All Roles |
| **Simulator**| `GET /simulator/compare/{id}` | Retrieve scenario comparison presets | All Roles |
| **Simulator**| `POST /simulator/scenario` | Commit custom scenario to roadmap | Owner, Consultant, Admin |
| **Action Plan**| `GET /action-plans` | List decarbonization roadmap items | All Roles |
| **Action Plan**| `POST /action-plans` | Create new action commitment | Owner, Consultant, Admin |
| **Action Plan**| `PUT /action-plans/{id}` | Update action status (Planned/In Progress/Done)| Owner, Consultant, Admin |
| **Dashboard**| `GET /dashboard/summary` | Executive summary telemetry & KPIs | All Roles |
| **Reports** | `GET /reports/{id}` | Structured audit report details | All Roles |
| **Reports** | `GET /reports/{id}/pdf` | Download formatted executive PDF report | All Roles |
| **AI Copilot**| `POST /assistant/chat` | Context-grounded technical queries | Owner, Consultant, Admin |
| **Admin** | `GET /admin/users` | Manage user accounts and active statuses | Admin Only |
| **Admin** | `GET /admin/industries` | Assign consultants to factories | Admin, Consultant, Regulator |
| **Admin** | `GET /admin/emission-factors` | Query official emission factor library | Admin, Regulator |
| **Admin** | `GET /admin/audit-logs` | Inspect system-wide security audit trail | Admin, Regulator |

---

## 🧪 Verification & Audit Results

The application has been verified via our automated test runner:

```text
======================================================================
CarbonCopilot AI — Full System Automated Verification
======================================================================
>>> Phase 33: Authentication & Security Testing  ... [9/9 PASSED]
>>> Phase 27: Factory Owner Complete Testing      ... [11/11 PASSED]
>>> Phase 28: Sustainability Consultant Testing  ... [4/4 PASSED]
>>> Phase 29: Regulator / Auditor Testing         ... [7/7 PASSED]
>>> Phase 30: Admin Complete Testing              ... [6/6 PASSED]
>>> Phase 36: Database Integrity & Table Counts   ... [6/6 PASSED]
======================================================================
FINAL RESULT: 43 / 43 TESTS PASSED (100% PASS RATE)
FRONTEND BUILD: 0 TypeScript errors | 2,531 Vite modules built
======================================================================
```

---

## 📄 License & Acknowledgements

- **License**: Not yet specified.
- **Problem Statement**: Built for the *HackOut'26 Industrial Decarbonization & Circular Economy Challenge*.
- **Data Standards**: GHG Protocol Corporate Accounting Standard, India Central Electricity Authority (CEA) Baseline Database v20.0, IPCC EFDB.
