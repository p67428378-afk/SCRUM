def test_list_scenarios(client):
    response = client.get("/api/v1/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3
    scenario_types = [s["scenario_type"] for s in data]
    assert "Conservative" in scenario_types
    assert "Balanced" in scenario_types
    assert "Aggressive" in scenario_types


def test_evaluate_balanced_scenario(client):
    response = client.post(
        "/api/v1/scenarios/evaluate",
        json={"scenario_type": "Balanced", "cluster_name": "Small Town Value Cluster"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_type"] == "Balanced"
    assert "projected_sales_lift_pct" in data
    assert "projected_pb_share_pct" in data
    assert "projected_capacity_pct" in data
    assert "recommended_actions" in data
    assert data["recommended_actions"]["GROW"] == 12
    assert data["recommended_actions"]["MAINTAIN"] == 10
    assert data["recommended_actions"]["SWAP"] == 4
    assert data["recommended_actions"]["REDUCE"] == 2


def test_evaluate_aggressive_scenario(client):
    response = client.post(
        "/api/v1/scenarios/evaluate",
        json={"scenario_type": "Aggressive", "cluster_name": "Small Town Value Cluster"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_type"] == "Aggressive"
    assert data["projected_pb_share_pct"] >= 30.0
    assert data["recommended_actions"]["GROW"] >= 12


def test_guardrails_check_passed(client):
    response = client.post(
        "/api/v1/guardrails/check",
        json={
            "scenario_type": "Balanced",
            "projected_pb_share_pct": 28.0,
            "projected_capacity_pct": 85.0,
            "in_stock_rate": 96.5
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["overall_status"] == "PASSED"
    assert len(data["checks"]) == 3
    assert all(c["status"] == "PASSED" for c in data["checks"])


def test_guardrails_check_failed(client):
    response = client.post(
        "/api/v1/guardrails/check",
        json={
            "scenario_type": "Balanced",
            "projected_pb_share_pct": 18.0,  # Below 20% -> FAILED
            "projected_capacity_pct": 105.0,  # Above 100% -> FAILED
            "in_stock_rate": 96.5
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["overall_status"] == "FAILED"
    failed_rules = [c["rule"] for c in data["checks"] if c["status"] == "FAILED"]
    assert len(failed_rules) >= 2
