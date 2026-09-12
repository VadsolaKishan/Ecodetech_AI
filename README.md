# EcoDetect AI

> **Detect. Recommend. Simulate. Reduce.**  
> *From emissions to action.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ecodetech--ai.vercel.app-00C7B7?style=for-the-badge&logo=vercel&logoColor=white)](https://ecodetech-ai.vercel.app/)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi&logoColor=white)]()
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=flat&logo=react&logoColor=black)]()
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%206-3178C6?style=flat&logo=typescript&logoColor=white)]()
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2015-336791?style=flat&logo=postgresql&logoColor=white)]()
[![Scikit-Learn](https://img.shields.io/badge/ML-Isolation%20Forest-F7931E?style=flat&logo=scikitlearn&logoColor=white)]()
[![Status](https://img.shields.io/badge/Audit-43%2F43%20Tests%20Passed-brightgreen?style=flat)]()

EcoDetect AI is an enterprise-grade industrial sustainability platform designed to help manufacturing facilities pinpoint process emission leak-points and take immediate, cost-modeled decarbonization actions through circular economy interventions.

> **"We don't just calculate carbon. We tell industries what to do next."**

🌐 **Live Application URL**: [https://ecodetech-ai.vercel.app/](https://ecodetech-ai.vercel.app/)

---

## 🏆 Hackathon & Team Details

| Item | Description |
|---|---|
| **Hackathon & Event** | **HackOut'26** • Ideation Round |
| **Theme** | **Circular Carbon Ecosystem** |
| **Problem Statement** | **Industrial Emission Leak-Point Detector & Circular Alternative Recommender** |
| **Live Deployment** | [https://ecodetech-ai.vercel.app/](https://ecodetech-ai.vercel.app/) |
| **Team Name** | **Eat-Code-Sleep** |
| **Team Tagline** | *‘Detect. Explain. Recommend. Simulate. Act.’* |

### 👥 Team Members & Roles

- **Darshan Thummar** — **Team Leader** *(Full Stack & AI Agent Architecture)*
- **Kishan Vadsolva** — **Member** *(Backend & Carbon Calculation Engines)*
- **Prince Suvagiya** — **Member** *(Frontend & UI/UX Analytics)*

---

## 🔑 Demo Login Credentials (Ready to Test)

The project includes pre-configured accounts across all **4 system roles** connected to our demonstration facility (*Shree Gujarat Textile Works Pvt. Ltd.*, Ahmedabad, India):

| Role | Name | Email | Password | Access Scope |
|---|---|---|---|---|
| **Factory Owner** | Rajesh Patel | `rajesh.patel@carboncopilot.ai` | `RajeshPatel@Carbon2026!` | **Full Access** to own factory & operations |
| **Sustainability Consultant** | Priya Shah | `priya.shah@carboncopilot.ai` | `PriyaShah@Carbon2026!` | **Full Access** to assigned factories |
| **Regulator / Auditor** | Amit Desai | `amit.desai@carboncopilot.ai` | `AmitDesai@Carbon2026!` | **Strictly READ-ONLY** audit inspection |
| **System Admin** | Arjun Mehta | `arjun.mehta@carboncopilot.ai` | `ArjunMehta@Carbon2026!` | **Global Governance**, users, rules & logs |

> 💡 **Tip for Judges**: Try the live app at [https://ecodetech-ai.vercel.app/](https://ecodetech-ai.vercel.app/) and log in as **Rajesh Patel** to experience the complete decarbonization workflow, or as **Amit Desai** to verify read-only regulatory enforcement.

---

## 👥 Role-Based Access Control (RBAC)

EcoDetect AI enforces strict multi-tenant authorization at the API dependency layer (`app.api.deps`):

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
