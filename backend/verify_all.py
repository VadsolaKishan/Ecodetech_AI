import requests

BASE = "http://127.0.0.1:8000"

def test():
    print("1. Health check...")
    r = requests.get(f"{BASE}/health")
    assert r.status_code == 200 and r.json()["status"] == "healthy"
    print("   [PASS] Health check passed")

    print("2. Demo factories...")
    r = requests.get(f"{BASE}/api/v1/demo/factories")
    assert r.status_code == 200
    factories = r.json()["data"]
    print(f"   [PASS] Loaded {len(factories)} demo factories: {[f['name'] for f in factories]}")

    print("3. Load Demo 1 (Surat Eco-Weave Textiles)...")
    r = requests.post(f"{BASE}/api/v1/demo/load/1")
    assert r.status_code == 200
    data1 = r.json()["data"]
    token = data1["token"]
    ass_id = data1["assessment_id"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"   [PASS] Loaded factory: {data1['industry']['company_name']}, assessment_id: {ass_id}")

    print("4. Dashboard Summary...")
    r = requests.get(f"{BASE}/api/v1/dashboard/summary?assessment_id={ass_id}", headers=headers)
    assert r.status_code == 200
    dash = r.json()["data"]
    print(f"   [PASS] Headline: {dash['headline']}")
    print(f"   [PASS] Total Footprint: {dash['kpis']['total_emissions_tco2e']} tCO2e (Potential cut: {dash['kpis']['potential_reduction_pct']}%)")
    print(f"   [PASS] Top Hotspot: {dash['kpis']['top_hotspot']} ({dash['kpis']['top_hotspot_pct']}%)")
    print(f"   [PASS] Circularity Score: {dash['kpis']['circularity_score']}/100")

    print("5. Ranked Hotspots...")
    r = requests.get(f"{BASE}/api/v1/assessments/{ass_id}/hotspots", headers=headers)
    assert r.status_code == 200
    hotspots = r.json()["data"]
    print(f"   [PASS] Found {len(hotspots)} hotspots:")
    for h in hotspots[:3]:
        print(f"     • {h['source_name']}: {h['percentage_contribution']}% ({h['severity']})")

    print("6. AI Circular Recommendations...")
    r = requests.get(f"{BASE}/api/v1/assessments/{ass_id}/recommendations", headers=headers)
    assert r.status_code == 200
    recs = r.json()["data"]
    print(f"   [PASS] Found {len(recs)} ranked recommendations:")
    for rec in recs[:3]:
        print(f"     • Priority {rec['priority_rank']}: {rec['title']} (CO2 cut: {rec['reduction_percentage']}%, Payback: {rec['payback_months']} mos)")

    print("7. What-If Simulator live calculation...")
    r = requests.post(
        f"{BASE}/api/v1/simulator/calculate?assessment_id={ass_id}",
        json={
            "solar_percentage": 40.0,
            "recycled_material_percentage": 45.0,
            "waste_recovery_percentage": 60.0,
            "transport_reduction_percentage": 25.0
        },
        headers=headers
    )
    assert r.status_code == 200
    sim = r.json()["data"]
    print(f"   [PASS] Avoided CO2e: {sim['avoided_co2e_t']} tonnes ({sim['reduction_percentage']}%)")
    print(f"   [PASS] Simulated Footprint: {sim['simulated_co2e_t']} tCO2e (Baseline: {sim['baseline_co2e_t']} tCO2e)")
    print(f"   [PASS] Annual Savings: INR {sim['estimated_annual_savings_inr']:,.0f}/yr | Payback: {sim['payback_months']} mos")
    print(f"   [PASS] New Circularity Score: {sim['new_circularity_score']}/100 (+{sim['circularity_delta']} pts)")

    print("8. Multi-Scenario Comparison Matrix...")
    r = requests.get(f"{BASE}/api/v1/simulator/compare/{ass_id}", headers=headers)
    assert r.status_code == 200
    scenarios = r.json()["data"]
    print(f"   [PASS] {len(scenarios)} scenarios generated:")
    for s in scenarios:
        rec_tag = " [RECOMMENDED]" if s["is_recommended"] else ""
        print(f"     • {s['name']}{rec_tag}: {s['result_co2e_tonnes']} tCO2e (Cut: {s['reduction_percentage']}%)")

    print("9. Action Roadmap...")
    r = requests.get(f"{BASE}/api/v1/action-plans?assessment_id={ass_id}", headers=headers)
    assert r.status_code == 200
    plans = r.json()["data"]
    print(f"   [PASS] {len(plans)} action roadmap items found:")
    for p in plans[:2]:
        print(f"     • [{p['status']}] {p['title']} (Owner: {p['owner']}, Target: {p['deadline']})")

    print("10. AI Assistant Grounded Query...")
    r = requests.post(
        f"{BASE}/api/v1/assistant/chat",
        json={
            "assessment_id": ass_id,
            "message": "Where are my biggest emissions?"
        },
        headers=headers
    )
    assert r.status_code == 200
    chat_res = r.json()["data"]["response"]
    print("   [PASS] Copilot Answer snippet:")
    print("     " + "\n     ".join([line.encode('ascii', 'ignore').decode() for line in chat_res.split("\n")[:4]]))

    print("11. Executive Audit Report...")
    r = requests.get(f"{BASE}/api/v1/reports/{ass_id}", headers=headers)
    assert r.status_code == 200
    rep = r.json()["data"]
    print(f"   [PASS] Report compiled for: {rep['company']['name']} ({rep['title']})")

    print("\n=======================================================")
    print("ALL 11 CORE BACKEND & API VERIFICATION TESTS PASSED 100%!")
    print("=======================================================")

if __name__ == "__main__":
    test()
