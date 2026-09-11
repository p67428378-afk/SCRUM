def test_list_bins(client):
    response = client.get("/api/v1/bins")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_telemetry_update(client):
    bins_res = client.get("/api/v1/bins")
    bin_id = bins_res.json()[0]["id"]

    response = client.post(
        f"/api/v1/bins/{bin_id}/telemetry", json={"fill_level_pct": 92}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["fill_level_pct"] == 92
    assert data["status"] == "Overflowing"
