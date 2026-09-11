from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "CarbonCopilot Backend"}

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["app"] == "CarbonCopilot AI"

def test_demo_factories():
    response = client.get("/api/v1/demo/factories")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) == 3

def test_auth_login():
    response = client.post("/api/v1/auth/login", json={
        "email": "demo@carboncopilot.ai",
        "password": "demo1234"
    })
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert "token" in res_data["data"]

def test_load_demo_factory():
    response = client.post("/api/v1/demo/load/1")
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["data"]["industry"]["company_name"] == "Surat Eco-Weave Textiles"
    ass_id = res_data["data"]["assessment_id"]
    assert ass_id is not None

    # Test simulator calculate
    sim_resp = client.post(f"/api/v1/simulator/calculate?assessment_id={ass_id}", json={
        "solar_percentage": 40.0,
        "recycled_material_percentage": 30.0,
        "waste_recovery_percentage": 50.0,
        "transport_reduction_percentage": 20.0
    })
    assert sim_resp.status_code == 200
    sim_data = sim_resp.json()
    assert sim_data["success"] is True
    assert sim_data["data"]["avoided_co2e_t"] > 0
    assert sim_data["data"]["reduction_percentage"] > 0
