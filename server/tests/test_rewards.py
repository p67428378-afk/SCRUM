def test_get_reward_balance(client, auth_headers):
    res = client.get("/api/v1/rewards/balance", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "points_balance" in data
    assert isinstance(data["points_balance"], int)
