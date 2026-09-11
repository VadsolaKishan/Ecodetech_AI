import io
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.models import Assessment, Industry, EmissionHotspot, Recommendation, ActionPlan

class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def get_report_data(self, assessment_id: int) -> Dict[str, Any]:
        assessment = self.db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise ValueError(f"Assessment {assessment_id} not found")

        industry = assessment.industry
        hotspots = self.db.query(EmissionHotspot).filter(EmissionHotspot.assessment_id == assessment_id).order_by(EmissionHotspot.percentage_contribution.desc()).all()
        recommendations = self.db.query(Recommendation).filter(Recommendation.assessment_id == assessment_id).order_by(Recommendation.priority_rank.asc()).all()
        actions = self.db.query(ActionPlan).filter(ActionPlan.assessment_id == assessment_id).all()

        return {
            "assessment_id": assessment.id,
            "title": f"Industrial Carbon Audit & Circular Transition Plan — {industry.company_name if industry else 'Facility'}",
            "generated_at": assessment.updated_at.strftime("%B %d, %Y"),
            "company": {
                "name": industry.company_name if industry else "Factory Operator",
                "industry_type": industry.industry_type if industry else "General Manufacturing",
                "location": industry.factory_location if industry else "Industrial Zone",
                "monthly_production": f"{industry.monthly_production:,.0f} {industry.production_unit}" if industry else "100 tonnes",
                "operating_hours": f"{industry.operating_hours_per_day} hrs/day" if industry else "16 hrs/day",
                "employees": industry.number_of_employees if industry else 50
            },
            "kpis": {
                "total_emissions_tco2e": assessment.total_emissions_tco2e,
                "scope1_tco2e": assessment.scope1_tco2e,
                "scope2_tco2e": assessment.scope2_tco2e,
                "scope3_tco2e": assessment.scope3_tco2e,
                "emission_intensity": f"{assessment.emission_intensity} kg CO₂e / unit",
                "circularity_score": assessment.circularity_score,
                "potential_reduction_tco2e": assessment.potential_reduction_tco2e,
                "potential_savings_inr": f"₹{assessment.potential_savings_inr:,.0f}",
                "confidence_level": assessment.confidence_level
            },
            "hotspots": [
                {
                    "source": h.source_name,
                    "category": h.category,
                    "emissions_kg": h.emissions_kg_co2e,
                    "percentage": h.percentage_contribution,
                    "severity": h.severity,
                    "score": h.hotspot_score,
                    "explanation": h.explanation
                }
                for h in hotspots
            ],
            "recommendations": [
                {
                    "rank": r.priority_rank,
                    "title": r.title,
                    "category": r.category,
                    "co2_cut_kg": r.estimated_co2_reduction_kg,
                    "reduction_pct": r.reduction_percentage,
                    "capex_inr": r.implementation_cost_inr,
                    "savings_inr": r.annual_savings_inr,
                    "payback_months": r.payback_months,
                    "feasibility": r.feasibility,
                    "reason": r.reason
                }
                for r in recommendations
            ],
            "action_plans": [
                {
                    "title": a.title,
                    "priority": a.priority,
                    "status": a.status,
                    "owner": a.owner,
                    "deadline": a.deadline,
                    "capex": a.estimated_cost_inr,
                    "co2_reduction": a.expected_co2_reduction_kg
                }
                for a in actions
            ],
            "disclaimer": "CarbonCopilot provides decision-support estimates based on IPCC/CEA emission factors and factory operational activity data. This document serves as an operational decarbonization and circular roadmap and should be audited with site-specific engineering verification for certified regulatory filings."
        }

    def generate_pdf(self, assessment_id: int) -> bytes:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors

        data = self.get_report_data(assessment_id)
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        elements = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#065F46")
        )
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#4B5563")
        )
        h2_style = ParagraphStyle(
            'Heading2Custom',
            parent=styles['Heading2'],
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#111827")
        )

        elements.append(Paragraph(f"<b>CarbonCopilot AI</b> — Industrial Decarbonization Report", title_style))
        elements.append(Paragraph(f"Facility: <b>{data['company']['name']}</b> ({data['company']['industry_type']}) | Date: {data['generated_at']}", subtitle_style))
        elements.append(Spacer(1, 12))

        # KPI Summary Table
        kpi_table_data = [
            ["Metric", "Value", "Metric", "Value"],
            ["Total Carbon Footprint", f"{data['kpis']['total_emissions_tco2e']} tCO₂e", "Circularity Score", f"{data['kpis']['circularity_score']}/100"],
            ["Scope 1 Direct", f"{data['kpis']['scope1_tco2e']} tCO₂e", "Potential CO₂ Cut", f"{data['kpis']['potential_reduction_tco2e']} tCO₂e"],
            ["Scope 2 Electricity", f"{data['kpis']['scope2_tco2e']} tCO₂e", "Annual Savings", f"{data['kpis']['potential_savings_inr']}"],
            ["Scope 3 Supply Chain", f"{data['kpis']['scope3_tco2e']} tCO₂e", "Data Confidence", f"{data['kpis']['confidence_level']}"]
        ]
        t = Table(kpi_table_data, colWidths=[130, 130, 130, 130])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#ECFDF5")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#065F46")),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 14))

        # Hotspots Table
        elements.append(Paragraph("<b>Emission Hotspots & Leak-Point Detection</b>", h2_style))
        hotspot_table_data = [["Rank / Source", "Category", "Emissions (kg CO₂e)", "% Total", "Severity"]]
        for h in data["hotspots"][:5]:
            hotspot_table_data.append([
                h["source"],
                h["category"],
                f"{h['emissions_kg']:,.0f}",
                f"{h['percentage']}%",
                h["severity"]
            ])
        ht = Table(hotspot_table_data, colWidths=[180, 80, 110, 60, 90])
        ht.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F3F4F6")),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(ht)
        elements.append(Spacer(1, 14))

        # Recommendations Table
        elements.append(Paragraph("<b>Top AI Circular Interventions & Financial ROI</b>", h2_style))
        rec_table_data = [["Priority Action", "CO₂ Avoided", "CAPEX (₹)", "Savings/Yr (₹)", "Payback"]]
        for r in data["recommendations"][:5]:
            rec_table_data.append([
                r["title"][:38] + ("..." if len(r["title"]) > 38 else ""),
                f"{r['co2_cut_kg']:,.0f} kg ({r['reduction_pct']}%)",
                f"₹{r['capex_inr']:,.0f}",
                f"₹{r['savings_inr']:,.0f}",
                f"{r['payback_months']} mos"
            ])
        rt = Table(rec_table_data, colWidths=[200, 90, 80, 80, 70])
        rt.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F3F4F6")),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(rt)
        elements.append(Spacer(1, 14))

        # Disclaimer
        elements.append(Paragraph(f"<font size=7 color='#6B7280'><b>Audit Disclaimer:</b> {data['disclaimer']}</font>", styles['Normal']))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
