def test_create_donation(client, devotee_auth_headers):
    payload = {
        "donor_name": "Priya Patel",
        "donor_email": "priya@example.com",
        "donor_phone": "9876543210",
        "donor_pan": "ABCDE1234F",
        "amount": 1008.00,
        "payment_method": "UPI",
        "tax_exemption_80g": True,
        "purpose": "Temple Annadanam Fund",
    }
    response = client.post(
        "/api/v1/donations", json=payload, headers=devotee_auth_headers
    )
    assert response.status_code == 201
    donation = response.json()
    assert donation["donor_name"] == "Priya Patel"
    assert donation["amount"] == 1008.00
    assert donation["receipt_number"].startswith("80G-SHIV-")


def test_download_receipt_pdf(client, devotee_auth_headers):
    # 1. Create a donation first
    payload = {
        "donor_name": "Anil Gupta",
        "donor_pan": "XYZPK9876Q",
        "amount": 5000.00,
        "payment_method": "Credit Card",
    }
    create_res = client.post(
        "/api/v1/donations", json=payload, headers=devotee_auth_headers
    )
    assert create_res.status_code == 201
    donation_id = create_res.json()["id"]

    # 2. Download receipt
    receipt_res = client.get(f"/api/v1/donations/{donation_id}/receipt")
    assert receipt_res.status_code == 200
    assert receipt_res.headers["content-type"] == "application/pdf"
    assert len(receipt_res.content) > 100
    assert receipt_res.content.startswith(b"%PDF")


def test_my_donations(client, devotee_auth_headers):
    response = client.get(
        "/api/v1/donations/my-donations", headers=devotee_auth_headers
    )
    assert response.status_code == 200
    donations = response.json()
    assert len(donations) >= 1
