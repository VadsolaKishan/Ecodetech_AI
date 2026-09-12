import logging
from typing import Dict, Any, List, Optional
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT_TEMPLATE = """You are EcoDetect AI, an expert industrial decarbonization copilot and senior sustainability engineer.
Your mission is to provide factory owners, plant managers, and sustainability teams with precise, verified, actionable insights to reduce carbon footprint (Scope 1, 2, 3) and increase circularity while maximizing financial ROI.

PLANT AND ASSESSMENT CONTEXT:
----------------------------------
{context_str}
----------------------------------

BEHAVIOR AND GUIDELINES:
1. Ground your answers strictly in the plant context provided above.
2. Emphasize financial clarity: always cite CAPEX (₹), Annual Savings (₹/yr), and Payback Periods (months/years) when discussing interventions.
3. Be specific with emission numbers (tCO₂e or kg CO₂e) and percentages when discussing hotspots or reduction potential.
4. Avoid hallucinations. If specific plant data (e.g. boiler model, water usage) is not in the context, clearly state that it has not been logged yet in this assessment, and suggest how the user can input it.
5. Provide actionable engineering recommendations (e.g., VFDs, heat recovery, solar PV, circular materials, waste-to-energy).
6. Format responses clearly with Markdown: use bolding for metrics, bullet points for lists, and concise summaries.
7. Keep responses professional, confident, concise, and focused on industrial decarbonization.
"""

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or settings.LLM_API_KEY
        self.model_name = settings.GEMINI_MODEL or "gemini-3.6-flash"
        self._client = None
        
        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Could not initialize google.genai Client: {e}. REST fallback will be used.")

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    def _format_context_for_prompt(self, context: Dict[str, Any]) -> str:
        lines = []
        if not context:
            return "No assessment data available."
            
        lines.append(f"Factory Name: {context.get('factory_name', 'Industrial Plant')}")
        lines.append(f"Industry Sector: {context.get('industry_type', 'Manufacturing')}")
        lines.append(f"Location: {context.get('factory_location', 'Not specified')}")
        lines.append(f"Monthly Production: {context.get('monthly_production', 'N/A')} {context.get('production_unit', 'tonnes')}")
        lines.append(f"Total Carbon Footprint: {context.get('total_emissions_tco2e', 0)} tCO₂e")
        lines.append(f"  - Scope 1 (Direct): {context.get('scope1', 0)} tCO₂e")
        lines.append(f"  - Scope 2 (Electricity/Grid): {context.get('scope2', 0)} tCO₂e")
        lines.append(f"  - Scope 3 (Supply Chain/Materials/Waste/Transport): {context.get('scope3', 0)} tCO₂e")
        lines.append(f"Circularity Score: {context.get('circularity_score', 0)} / 100")
        lines.append(f"Emission Intensity: {context.get('emission_intensity', 0)} tCO₂e per unit output")
        
        hotspots = context.get('hotspots_detail', [])
        if hotspots:
            lines.append("\nVerified Emission Hotspots (Sorted by Impact):")
            for h in hotspots[:5]:
                lines.append(f"  - {h.get('name')}: {h.get('pct')}% of total emissions ({h.get('emissions_kg', 0):,.0f} kg CO₂e) | Category: {h.get('category')} | Severity: {h.get('severity')}")
                
        recs = context.get('recommendations_detail', [])
        if recs:
            lines.append("\nGenerated Decarbonization Recommendations:")
            for r in recs[:5]:
                lines.append(
                    f"  - [{r.get('category')}] {r.get('title')}: "
                    f"CO₂ Reduction: {r.get('co2_reduction_kg', 0):,.0f} kg CO₂e ({r.get('reduction_pct', 0)}%) | "
                    f"CAPEX: ₹{r.get('cost_inr', 0):,.0f} | "
                    f"Annual Savings: ₹{r.get('savings_inr', 0):,.0f}/yr | "
                    f"Payback: {r.get('payback_months', 0)} months | "
                    f"Feasibility: {r.get('feasibility', 'Medium')} | "
                    f"Rationale: {r.get('reason', '')}"
                )

        energy = context.get('energy_sources', [])
        if energy:
            lines.append(f"\nEnergy Sources Logged: {', '.join(energy)}")

        return "\n".join(lines)

    def generate_chat_response(
        self,
        message: str,
        context: Dict[str, Any],
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        context_str = self._format_context_for_prompt(context)
        system_instruction = SYSTEM_PROMPT_TEMPLATE.format(context_str=context_str)

        # 1. If Gemini API Key is configured, attempt live LLM generation
        if self.is_configured():
            try:
                # Attempt with google.genai SDK
                if self._client:
                    from google.genai import types
                    
                    contents = []
                    if history:
                        for h in history[-8:]:  # keep last 8 turns for context window
                            role = "user" if h.get("role") in ["user", "human"] else "model"
                            content_text = h.get("content", "").strip()
                            if content_text:
                                contents.append(types.Content(
                                    role=role,
                                    parts=[types.Part.from_text(text=content_text)]
                                ))
                    
                    contents.append(types.Content(
                        role="user",
                        parts=[types.Part.from_text(text=message)]
                    ))

                    config = types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.4,
                        max_output_tokens=1024,
                    )

                    response = self._client.models.generate_content(
                        model=self.model_name,
                        contents=contents,
                        config=config
                    )

                    if response and response.text:
                        return {
                            "response": response.text.strip(),
                            "model_used": self.model_name,
                            "is_llm_active": True
                        }
            except Exception as e:
                logger.warning(f"google.genai SDK call failed: {e}. Trying direct REST API fallback...")

            # Attempt REST fallback with httpx
            try:
                rest_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
                
                rest_contents = []
                if history:
                    for h in history[-8:]:
                        role = "user" if h.get("role") in ["user", "human"] else "model"
                        content_text = h.get("content", "").strip()
                        if content_text:
                            rest_contents.append({"role": role, "parts": [{"text": content_text}]})
                
                rest_contents.append({"role": "user", "parts": [{"text": message}]})

                payload = {
                    "systemInstruction": {"parts": [{"text": system_instruction}]},
                    "contents": rest_contents,
                    "generationConfig": {
                        "temperature": 0.4,
                        "maxOutputTokens": 1024
                    }
                }

                with httpx.Client(timeout=15.0) as http_client:
                    res = http_client.post(rest_url, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            if parts and "text" in parts[0]:
                                return {
                                    "response": parts[0]["text"].strip(),
                                    "model_used": f"{self.model_name} (REST)",
                                    "is_llm_active": True
                                }
                    else:
                        logger.error(f"Gemini REST API error {res.status_code}: {res.text}")
            except Exception as rest_err:
                logger.error(f"Gemini REST call failed: {rest_err}")

        # 2. Fallback to Grounded Heuristic Engine
        fallback_resp = self._heuristic_grounded_response(message, context)
        
        # If no key was configured, append helpful hint
        if not self.is_configured():
            fallback_resp += (
                "\n\n> 💡 **Gemini AI:** Add your `GEMINI_API_KEY` to `backend/.env` to unlock live conversational reasoning with Google Gemini."
            )

        return {
            "response": fallback_resp,
            "model_used": "EcoDetect Grounded Engine",
            "is_llm_active": False
        }

    def _heuristic_grounded_response(self, message: str, context: Dict[str, Any]) -> str:
        msg = message.lower().strip()
        factory = context.get("factory_name", "your facility")
        hotspots = context.get("hotspots_detail", [])
        recs = context.get("recommendations_detail", [])

        # Hotspot query
        if any(w in msg for w in ["biggest", "where", "largest", "highest emission", "hotspot", "leak"]):
            if not hotspots:
                return f"No hotspot data has been calculated yet for **{factory}**. Please complete data input and run the assessment analysis."
            top_lines = [
                f"• **{h['name']}** ({h['category']}): **{h['pct']}%** of total footprint ({h['emissions_kg']:,.0f} kg CO₂e) — *Severity: {h['severity']}*"
                for h in hotspots[:3]
            ]
            return (
                f"Based on verified carbon accounting for **{factory}**, your highest emission contributors are:\n\n"
                + "\n".join(top_lines) +
                f"\n\n**Strategic Takeaway:** **{hotspots[0]['name']}** accounts for **{hotspots[0]['pct']}%** of your total footprint. Prioritizing interventions here yields the highest decarbonization leverage."
            )

        # Solar simulation query
        if "solar" in msg:
            import re
            numbers = re.findall(r'\b\d+\b', msg)
            pct = float(numbers[0]) if numbers else 40.0
            if pct > 100:
                pct = 100.0
            
            scope2 = context.get("scope2", 0)
            avoided = round(scope2 * (pct / 100.0), 2)
            capex = round(avoided * 38000, 0)
            savings = round(avoided * 8200, 0)
            payback = round((capex / savings * 12), 1) if savings > 0 else 36.0

            return (
                f"Simulating **{pct:.0f}% Solar Transition** for **{factory}**:\n\n"
                f"• **CO₂ Avoided:** **{avoided:,.1f} tonnes CO₂e/yr**\n"
                f"• **Scope 2 Reduction:** **{pct:.0f}%** reduction in grid electricity footprint\n"
                f"• **Estimated CAPEX:** ₹{capex:,.0f}\n"
                f"• **Annual Operating Savings:** ₹{savings:,.0f}/year\n"
                f"• **Estimated Payback Period:** **{payback:.1f} months**\n"
                f"• **Circularity Impact:** Increases clean energy reliance and circularity rating."
            )

        # Fastest ROI / Payback
        if any(w in msg for w in ["fastest roi", "payback", "roi", "quickest", "cheapest", "fastest"]):
            if not recs:
                return f"No recommendations have been generated yet for **{factory}**. Please run the AI analysis to generate prioritized actions."
            fastest = min(recs, key=lambda r: r.get("payback_months", 999))
            return (
                f"The highest ROI circular decarbonization action for **{factory}** is:\n\n"
                f"⭐ **{fastest.get('title')}**\n"
                f"• **Payback Period:** Just **{fastest.get('payback_months')} months**\n"
                f"• **Annual Cost Savings:** ₹{fastest.get('savings_inr', 0):,.0f}/year\n"
                f"• **Initial Investment (CAPEX):** ₹{fastest.get('cost_inr', 0):,.0f}\n"
                f"• **CO₂ Cut:** {fastest.get('co2_reduction_kg', 0):,.0f} kg CO₂e ({fastest.get('reduction_pct', 0)}%)\n\n"
                f"**Rationale:** {fastest.get('reason', 'High financial return with immediate emission reductions.')}"
            )

        # Priority / What to implement first
        if any(w in msg for w in ["first", "priority", "start", "implement"]):
            if not recs:
                return f"No recommendations are available yet. Complete and run your carbon assessment to view priority interventions."
            p1 = recs[0]
            return (
                f"EcoDetect AI recommends implementing **Priority 1: {p1.get('title')}** first:\n\n"
                f"• **Target Area:** {p1.get('category')}\n"
                f"• **CO₂ Reduction:** {p1.get('co2_reduction_kg', 0):,.0f} kg CO₂e\n"
                f"• **Capital Investment:** ₹{p1.get('cost_inr', 0):,.0f}\n"
                f"• **Annual Savings:** ₹{p1.get('savings_inr', 0):,.0f}/year\n"
                f"• **Payback:** {p1.get('payback_months')} months | Feasibility: **{p1.get('feasibility')}**\n\n"
                f"**Strategic Rationale:** {p1.get('reason')}"
            )

        # Electricity / Energy query
        if any(w in msg for w in ["electricity", "energy", "power", "grid", "boiler", "efficiency"]):
            energy_recs = [r for r in recs if r.get("category") == "Energy"]
            if energy_recs:
                recs_str = "\n".join([
                    f"• **{r.get('title')}**: Saves ₹{r.get('savings_inr', 0):,.0f}/yr (Payback: {r.get('payback_months')} mos, CO₂ cut: {r.get('co2_reduction_kg', 0):,.0f} kg)"
                    for r in energy_recs[:3]
                ])
                return (
                    f"To optimize energy consumption and Scope 2 emissions ({context.get('scope2', 0)} tCO₂e) at **{factory}**:\n\n"
                    f"{recs_str}\n\n"
                    f"You can also run what-if solar scenarios in the simulator to evaluate rooftop or captive renewable generation."
                )

        # Circularity / Materials / Waste query
        if any(w in msg for w in ["circular", "circularity", "waste", "recycle", "material"]):
            circ_score = context.get("circularity_score", 0)
            mat_recs = [r for r in recs if r.get("category") in ["Materials", "Waste", "Circularity"]]
            recs_text = ""
            if mat_recs:
                recs_text = "\n\n**Recommended Actions:**\n" + "\n".join([
                    f"• **{r.get('title')}** — Saves ₹{r.get('savings_inr', 0):,.0f}/yr (Payback: {r.get('payback_months')} mos)"
                    for r in mat_recs[:2]
                ])
            return (
                f"**Circularity Health for {factory}:**\n\n"
                f"• **Current Circularity Score:** **{circ_score}/100**\n"
                f"• **Scope 3 Footprint:** {context.get('scope3', 0)} tCO₂e (Raw materials, process waste & transport)\n"
                f"{recs_text}\n\n"
                f"Increasing recycled material blending and process scrap diversion will directly boost your circularity score and lower virgin procurement costs."
            )

        # Default overview
        return (
            f"Hello! I am **EcoDetect AI**, your industrial decarbonization and ecological copilot for **{factory}**.\n\n"
            f"**Operational Snapshot:**\n"
            f"• **Total Footprint:** **{context.get('total_emissions_tco2e', 0)} tCO₂e** (Scope 1: {context.get('scope1', 0)}t | Scope 2: {context.get('scope2', 0)}t | Scope 3: {context.get('scope3', 0)}t)\n"
            f"• **Top Emission Hotspot:** {context.get('top_hotspot', 'N/A')} ({context.get('top_hotspot_pct', 0)}%)\n"
            f"• **Circularity Rating:** {context.get('circularity_score', 0)}/100\n"
            f"• **Top Decarbonization Action:** {context.get('top_rec', 'N/A')}\n\n"
            f"**Ask me anything, such as:**\n"
            f"- *'Where are my biggest emissions and how do I reduce them?'*\n"
            f"- *'How much CO₂ and money do I save with 40% solar?'*\n"
            f"- *'Which intervention has the fastest payback period?'*\n"
            f"- *'What should be our priority milestone for Q3 decarbonization?'*"
        )
