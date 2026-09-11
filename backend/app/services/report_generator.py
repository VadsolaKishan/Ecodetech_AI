import io
import os
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
            "disclaimer": "EcoDetect AI provides decision-support estimates based on IPCC/CEA emission factors and factory operational activity data. This document serves as an operational decarbonization and circular roadmap and should be audited with site-specific engineering verification for certified regulatory filings."
        }

    def generate_pdf(self, assessment_id: int) -> bytes:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont
        from reportlab.pdfgen import canvas

        # Register standard TrueType fonts if available for crisp typography & symbol support
        font_regular = "Helvetica"
        font_bold = "Helvetica-Bold"
        try:
            for regular_path, bold_path, name in [
                ("C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/segoeuib.ttf", "SegoeUI"),
                ("C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/arialbd.ttf", "Arial")
            ]:
                if os.path.exists(regular_path) and os.path.exists(bold_path):
                    pdfmetrics.registerFont(TTFont(name, regular_path))
                    pdfmetrics.registerFont(TTFont(f"{name}-Bold", bold_path))
                    font_regular = name
                    font_bold = f"{name}-Bold"
                    break
        except Exception:
            font_regular = "Helvetica"
            font_bold = "Helvetica-Bold"

        rupee = "₹" if font_regular != "Helvetica" else "Rs. "

        data = self.get_report_data(assessment_id)
        buffer = io.BytesIO()
        
        # 540pt printable width (612 - 36*2)
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=40
        )
        elements = []
        styles = getSampleStyleSheet()

        brand_style = ParagraphStyle(
            'ReportBrand',
            parent=styles['Normal'],
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#059669"),
            fontName=font_bold
        )
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontSize=15,
            leading=19,
            textColor=colors.HexColor("#111827"),
            fontName=font_bold
        )
        facility_style = ParagraphStyle(
            'FacilityStyle',
            parent=styles['Normal'],
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor("#4B5563"),
            fontName=font_regular
        )
        meta_right_style = ParagraphStyle(
            'MetaRight',
            parent=styles['Normal'],
            fontSize=8,
            leading=12,
            alignment=2,
            textColor=colors.HexColor("#4B5563"),
            fontName=font_regular
        )
        section_h_style = ParagraphStyle(
            'SectionH',
            parent=styles['Heading2'],
            fontSize=10,
            leading=13,
            textColor=colors.HexColor("#111827"),
            fontName=font_bold
        )
        table_th = ParagraphStyle(
            'TableTH',
            parent=styles['Normal'],
            fontSize=8,
            leading=10,
            fontName=font_bold,
            textColor=colors.HexColor("#374151")
        )
        cell_normal = ParagraphStyle(
            'CellNormal',
            parent=styles['Normal'],
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#1F2937"),
            fontName=font_regular
        )
        cell_bold = ParagraphStyle(
            'CellBold',
            parent=styles['Normal'],
            fontSize=8,
            leading=11,
            fontName=font_bold,
            textColor=colors.HexColor("#111827")
        )
        cell_green = ParagraphStyle(
            'CellGreen',
            parent=styles['Normal'],
            fontSize=8,
            leading=11,
            fontName=font_bold,
            textColor=colors.HexColor("#059669")
        )
        kpi_title_style = ParagraphStyle(
            'KpiTitle',
            parent=styles['Normal'],
            fontSize=7.5,
            leading=9,
            textColor=colors.HexColor("#6B7280"),
            fontName=font_bold,
            alignment=1
        )
        kpi_val_style = ParagraphStyle(
            'KpiVal',
            parent=styles['Normal'],
            fontSize=12.5,
            leading=15,
            fontName=font_bold,
            textColor=colors.HexColor("#111827"),
            alignment=1
        )

        # 1. Header Block (Two columns: Left title & company info, Right metadata)
        left_header = [
            Paragraph("ECODETECT AI <font color='#9CA3AF'>• OFFICIAL VERIFICATION REPORT</font>", brand_style),
            Spacer(1, 3),
            Paragraph(f"<b>{data['title']}</b>", title_style),
            Spacer(1, 3),
            Paragraph(f"Facility: <b>{data['company']['name']}</b> ({data['company']['industry_type']}) | Location: {data['company']['location']}", facility_style)
        ]
        right_header = [
            Paragraph(f"Audit Date: <b>{data['generated_at']}</b>", meta_right_style),
            Paragraph(f"Confidence: <font color='#059669'><b>{data['kpis']['confidence_level']}</b></font>", meta_right_style),
            Paragraph(f"Circularity Index: <font color='#0284C7'><b>{data['kpis']['circularity_score']}/100</b></font>", meta_right_style),
        ]
        header_table = Table([[left_header, right_header]], colWidths=[365, 175])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        elements.append(header_table)
        elements.append(Spacer(1, 7))
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E5E7EB"), spaceAfter=9))

        # 2. Section 1: Emissions Profile & Decarbonization Targets (4 KPI Boxes)
        elements.append(Paragraph("<b>1. Emissions Profile & Decarbonization Targets</b>", section_h_style))
        elements.append(Spacer(1, 5))
        
        tot_val = f"{data['kpis']['total_emissions_tco2e']:,.2f}" if isinstance(data['kpis']['total_emissions_tco2e'], (int, float)) else str(data['kpis']['total_emissions_tco2e'])
        s1_val = f"{data['kpis']['scope1_tco2e']:,.1f}" if isinstance(data['kpis']['scope1_tco2e'], (int, float)) else str(data['kpis']['scope1_tco2e'])
        s2_val = f"{data['kpis']['scope2_tco2e']:,.2f}" if isinstance(data['kpis']['scope2_tco2e'], (int, float)) else str(data['kpis']['scope2_tco2e'])
        s3_val = f"{data['kpis']['scope3_tco2e']:,.1f}" if isinstance(data['kpis']['scope3_tco2e'], (int, float)) else str(data['kpis']['scope3_tco2e'])

        kpi_cells = [
            [
                Paragraph("TOTAL EMISSIONS", kpi_title_style),
                Paragraph("SCOPE 1 DIRECT", kpi_title_style),
                Paragraph("SCOPE 2 ELECTRICITY", kpi_title_style),
                Paragraph("SCOPE 3 SUPPLY CHAIN", kpi_title_style)
            ],
            [
                Paragraph(f"{tot_val} tCO<sub>2</sub>e", kpi_val_style),
                Paragraph(f"{s1_val} tCO<sub>2</sub>e", kpi_val_style),
                Paragraph(f"{s2_val} tCO<sub>2</sub>e", kpi_val_style),
                Paragraph(f"{s3_val} tCO<sub>2</sub>e", kpi_val_style)
            ]
        ]
        kpi_table = Table(kpi_cells, colWidths=[135, 135, 135, 135])
        kpi_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F9FAFB")),
            ('BOX', (0, 0), (0, 1), 0.75, colors.HexColor("#E5E7EB")),
            ('BOX', (1, 0), (1, 1), 0.75, colors.HexColor("#E5E7EB")),
            ('BOX', (2, 0), (2, 1), 0.75, colors.HexColor("#E5E7EB")),
            ('BOX', (3, 0), (3, 1), 0.75, colors.HexColor("#E5E7EB")),
            ('TOPPADDING', (0, 0), (-1, 0), 6),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 2),
            ('TOPPADDING', (0, 1), (-1, 1), 2),
            ('BOTTOMPADDING', (0, 1), (-1, 1), 6),
        ]))
        elements.append(kpi_table)
        elements.append(Spacer(1, 10))

        # 3. Section 2: Detected Emission Hotspots & Leak Points
        elements.append(Paragraph("<b>2. Detected Emission Hotspots & Leak Points</b>", section_h_style))
        elements.append(Spacer(1, 5))
        hotspot_rows = [[
            Paragraph("<b>Hotspot Source</b>", table_th),
            Paragraph("<b>Category</b>", table_th),
            Paragraph("<b>Emissions (kg CO<sub>2</sub>e)</b>", table_th),
            Paragraph("<b>% Total</b>", table_th),
            Paragraph("<b>Severity</b>", table_th)
        ]]
        for h in data["hotspots"]:
            sev_color = "#DC2626" if h["severity"] == "Critical" else ("#D97706" if h["severity"] == "High" else "#2563EB")
            hotspot_rows.append([
                Paragraph(f"<b>{h['source']}</b>", cell_normal),
                Paragraph(h["category"], cell_normal),
                Paragraph(f"{h['emissions_kg']:,.0f}", cell_normal),
                Paragraph(f"<b>{h['percentage']}%</b>", cell_green),
                Paragraph(f"<b><font color='{sev_color}'>{h['severity'].upper()}</font></b>", cell_normal)
            ])
        if len(hotspot_rows) == 1:
            hotspot_rows.append([Paragraph("No hotspots detected for this assessment period.", cell_normal), "", "", "", ""])

        ht = Table(hotspot_rows, colWidths=[175, 95, 115, 75, 80], repeatRows=1)
        ht.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F3F4F6")),
            ('LINEBELOW', (0, 0), (-1, 0), 1, colors.HexColor("#D1D5DB")),
            ('LINEBELOW', (0, 1), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ('TOPPADDING', (0, 0), (-1, -1), 3.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(ht)
        elements.append(Spacer(1, 10))

        # 4. Section 3: High-Leverage Circular Interventions & ROI
        elements.append(Paragraph("<b>3. High-Leverage Circular Interventions & ROI</b>", section_h_style))
        elements.append(Spacer(1, 5))
        rec_rows = [[
            Paragraph("<b>Intervention</b>", table_th),
            Paragraph("<b>Avoided CO<sub>2</sub></b>", table_th),
            Paragraph(f"<b>CAPEX ({rupee})</b>", table_th),
            Paragraph(f"<b>Savings / Yr ({rupee})</b>", table_th),
            Paragraph("<b>Payback</b>", table_th)
        ]]
        for r in data["recommendations"]:
            capex_lakh = r['capex_inr'] / 100000.0
            savings_lakh = r['savings_inr'] / 100000.0
            rec_rows.append([
                Paragraph(f"<b>{r['title']}</b>", cell_normal),
                Paragraph(f"<b>{r['co2_cut_kg']:,.0f} kg</b> ({r['reduction_pct']}%)", cell_green),
                Paragraph(f"{rupee}{capex_lakh:.1f}L", cell_normal),
                Paragraph(f"<b>{rupee}{savings_lakh:.1f}L</b>", cell_green),
                Paragraph(f"{r['payback_months']} mos", cell_bold)
            ])
        if len(rec_rows) == 1:
            rec_rows.append([Paragraph("No circular recommendations generated yet.", cell_normal), "", "", "", ""])

        rt = Table(rec_rows, colWidths=[185, 125, 75, 80, 75], repeatRows=1)
        rt.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F3F4F6")),
            ('LINEBELOW', (0, 0), (-1, 0), 1, colors.HexColor("#D1D5DB")),
            ('LINEBELOW', (0, 1), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ('TOPPADDING', (0, 0), (-1, -1), 3.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(rt)
        elements.append(Spacer(1, 10))

        # 5. Section 4: Operational Action Roadmap
        elements.append(Paragraph("<b>4. Operational Action Roadmap</b>", section_h_style))
        elements.append(Spacer(1, 5))
        if data["action_plans"] and len(data["action_plans"]) > 0:
            act_rows = []
            for a in data["action_plans"]:
                status_color = "#059669" if a["status"] == "Completed" else ("#D97706" if a["status"] == "In Progress" else "#2563EB")
                left_cell = [
                    Paragraph(f"<b>{a['title']}</b>", cell_bold),
                    Paragraph(f"<font color='#6B7280' size=7.5>Owner: {a['owner']} • Target: {a['deadline']}</font>", cell_normal)
                ]
                right_cell = Paragraph(
                    f"<b><font color='{status_color}'>{a['status'].upper()}</font></b>",
                    ParagraphStyle('StatR', parent=cell_normal, alignment=2, fontName=font_bold)
                )
                act_rows.append([left_cell, right_cell])

            at = Table(act_rows, colWidths=[420, 120])
            at.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F9FAFB")),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
                ('RIGHTPADDING', (0, 0), (-1, -1), 8),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            elements.append(at)
        else:
            elements.append(Paragraph("<font color='#6B7280'><i>No operational action plan initiatives scheduled yet.</i></font>", cell_normal))
        elements.append(Spacer(1, 10))

        # 6. Section 5: Regulatory & Data Verification Note
        disclaimer_cell = [
            Paragraph("<b><font color='#059669'>Regulatory & Data Verification Note</font></b>", cell_bold),
            Spacer(1, 2),
            Paragraph(f"<font color='#4B5563' size=7.5>{data['disclaimer']}</font>", cell_normal)
        ]
        disc_table = Table([[disclaimer_cell]], colWidths=[540])
        disc_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F9FAFB")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(disc_table)

        # Numbered canvas for page footer
        class NumberedCanvas(canvas.Canvas):
            def __init__(self, *args, **kwargs):
                super().__init__(*args, **kwargs)
                self._saved_page_states = []

            def showPage(self):
                self._saved_page_states.append(dict(self.__dict__))
                self._startPage()

            def save(self):
                num_pages = len(self._saved_page_states)
                for state in self._saved_page_states:
                    self.__dict__.update(state)
                    self.draw_page_footer(num_pages)
                    canvas.Canvas.showPage(self)
                canvas.Canvas.save(self)

            def draw_page_footer(self, page_count):
                self.saveState()
                self.setFont(font_regular, 8)
                self.setFillColor(colors.HexColor("#9CA3AF"))
                # Thin divider
                self.setStrokeColor(colors.HexColor("#E5E7EB"))
                self.setLineWidth(0.5)
                self.line(36, 26, 576, 26)
                # Left footer
                self.drawString(36, 16, "EcoDetect AI • Verified Industrial Carbon Audit Report")
                # Right footer
                page_text = f"Page {self._pageNumber} of {page_count}"
                self.drawRightString(576, 16, page_text)
                self.restoreState()

        doc.build(elements, canvasmaker=NumberedCanvas)
        buffer.seek(0)
        return buffer.getvalue()
