"""
test_backend.py - Test suite for Bovine Mastitis FastAPI service.
"""

import sys
import os
from fastapi.testclient import TestClient

# Ensure backend package is on path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert "Healthy" in data["classes"]
    print("✓ Health endpoint passed")

def test_predict_healthy():
    payload = {
        "pH": 6.5,
        "EC": 4.2,
        "SCC": 1.2,
        "Season": "Winter",
        "LactationStage": "Mid",
        "Parity": "2nd",
        "MilkYield": "5-10"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_stage"] == "Healthy"
    assert data["probabilities"]["Healthy"] > 0.5
    assert "biomarkers" in data
    assert "clinical_explanation" in data
    assert "veterinary_recommendation" in data
    print("✓ Predict Healthy passed")

def test_predict_subclinical():
    payload = {
        "pH": 6.8,
        "EC": 5.1,
        "SCC": 3.6,
        "Season": "Rainy",
        "LactationStage": "Mid",
        "Parity": "3rd",
        "MilkYield": "5-10"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_stage"] == "Subclinical"
    assert data["probabilities"]["Subclinical"] > 0.4
    print("✓ Predict Subclinical passed")

def test_predict_clinical():
    payload = {
        "pH": 7.3,
        "EC": 6.8,
        "SCC": 42.0,
        "Season": "Summer",
        "LactationStage": "Early",
        "Parity": "4th and above",
        "MilkYield": "0-4"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_stage"] == "Clinical"
    assert data["probabilities"]["Clinical"] > 0.8
    print("✓ Predict Clinical passed")

def test_validation_error():
    # pH out of bounds (9.0 > 8.0)
    invalid_payload = {
        "pH": 9.0,
        "EC": 4.2,
        "SCC": 1.2,
        "Season": "Winter",
        "LactationStage": "Mid",
        "Parity": "2nd",
        "MilkYield": "5-10"
    }
    response = client.post("/predict", json=invalid_payload)
    assert response.status_code == 422
    print("✓ Validation error handling passed")

def test_batch_prediction():
    records = [
        {"id": "COW-001", "pH": 6.5, "EC": 4.1, "SCC": 1.1, "Season": "Winter", "LactationStage": "Mid", "Parity": "2nd", "MilkYield": "5-10"},
        {"id": "COW-002", "pH": 7.2, "EC": 6.5, "SCC": 25.0, "Season": "Summer", "LactationStage": "Early", "Parity": "4th and above", "MilkYield": "0-4"}
    ]
    response = client.post("/predict/batch", json=records)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["predicted_stage"] == "Healthy"
    assert data[1]["predicted_stage"] == "Clinical"
    print("✓ Batch prediction passed")

def test_metrics_endpoint():
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "test_accuracy" in data
    assert "feature_importance" in data
    assert len(data["feature_importance"]) > 0
    assert "benchmark_scores" in data
    print("✓ Metrics endpoint passed")

def test_rfid_endpoints():
    # 1. Get all cows
    res = client.get("/cows")
    assert res.status_code == 200
    cows = res.json()
    assert len(cows) > 0
    print(f"✓ Retrieved {len(cows)} registered cows")

    # 2. Get specific cow profile with predictions
    test_rfid = "RFID-IND-1001"
    res_cow = client.get(f"/cows/{test_rfid}")
    assert res_cow.status_code == 200
    cow_data = res_cow.json()
    assert cow_data["rfid"] == test_rfid
    assert "predictions" in cow_data
    assert len(cow_data["predictions"]) > 0
    print(f"✓ Fetched profile and {len(cow_data['predictions'])} history records for {test_rfid}")

    # 3. Register new cow
    new_rfid = "RFID-TEST-9999"
    res_reg = client.post("/cows", json={
        "rfid": new_rfid,
        "name": "Champa",
        "breed": "Sahiwal",
        "notes": "Automated unit test cow"
    })
    assert res_reg.status_code == 200
    assert res_reg.json()["rfid"] == new_rfid
    print(f"✓ Successfully registered new cow {new_rfid}")

    # 4. Predict with RFID auto-save
    pred_payload = {
        "rfid": new_rfid,
        "pH": 6.55,
        "EC": 4.25,
        "SCC": 1.20,
        "Season": "Winter",
        "LactationStage": "Mid",
        "Parity": "2nd",
        "MilkYield": "5-10"
    }
    res_pred = client.post("/predict", json=pred_payload)
    assert res_pred.status_code == 200
    pred_data = res_pred.json()
    assert pred_data["saved_to_history"] is True
    assert "history_record_id" in pred_data
    assert pred_data["predicted_stage"] == "Healthy"
    print(f"✓ Auto-saved prediction for {new_rfid} (Record #{pred_data['history_record_id']})")

if __name__ == "__main__":
    test_health_endpoint()
    test_predict_healthy()
    test_predict_subclinical()
    test_predict_clinical()
    test_validation_error()
    test_batch_prediction()
    test_metrics_endpoint()
    test_rfid_endpoints()
    print("\n🎉 ALL BACKEND & RFID TESTS PASSED SUCCESSFULLY!")
