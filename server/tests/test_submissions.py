def test_submit_assortment_plan(client):
    payload = {
        "user_id": "category_mgr_01",
        "scenario_type": "Balanced",
        "cluster_name": "Small Town Value Cluster",
        "actions_summary": {
            "grow": 12,
            "maintain": 10,
            "swap": 4,
            "reduce": 2
        }
    }
    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "audit_code" in data
    assert data["audit_code"].startswith("AUD-")
    assert data["user_id"] == "category_mgr_01"
    assert data["scenario_type"] == "Balanced"
    assert data["total_sku_actions"] == 28
    assert "submitted_at" in data

    # Test get list
    list_resp = client.get("/api/v1/submissions")
    assert list_resp.status_code == 200
    list_data = list_resp.json()
    assert len(list_data) >= 1

    # Test get by audit_code
    code = data["audit_code"]
    code_resp = client.get(f"/api/v1/submissions/{code}")
    assert code_resp.status_code == 200
    assert code_resp.json()["audit_code"] == code
