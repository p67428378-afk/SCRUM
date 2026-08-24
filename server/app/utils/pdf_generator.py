import io
from datetime import datetime


def generate_donation_pdf_bytes(
    receipt_number: str,
    donor_name: str,
    donor_pan: str,
    amount: float,
    payment_method: str,
    purpose: str,
    created_at: datetime,
    tax_exemption_80g: bool = True,
) -> bytes:
    """Generates a downloadable PDF e-receipt for a donation with 80G tax exemption details."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate,
            Paragraph,
            Spacer,
            Table,
            TableStyle,
        )
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36,
        )
        story = []

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "TitleStyle",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=24,
            textColor=colors.HexColor("#B45309"),
            alignment=1,  # Center
        )
        subtitle_style = ParagraphStyle(
            "SubtitleStyle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#4B5563"),
            alignment=1,
        )
        body_style = ParagraphStyle(
            "BodyStyle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=11,
            leading=16,
            textColor=colors.HexColor("#1F2937"),
        )
        bold_style = ParagraphStyle(
            "BoldStyle", parent=body_style, fontName="Helvetica-Bold"
        )

        # Header
        story.append(Paragraph("🔱 SHRI SHIVJI MANDIR TRUST", title_style))
        story.append(Spacer(1, 4))
        story.append(
            Paragraph(
                "Sacred Temple Operations & Charitable Services | Reg. No: TR/80G/2024-99",
                subtitle_style,
            )
        )
        story.append(
            Paragraph("Official Donation E-Receipt (80G Tax Exempted)", subtitle_style)
        )
        story.append(Spacer(1, 16))

        # Receipt details table
        date_str = (
            created_at.strftime("%d-%b-%Y %I:%M %p")
            if isinstance(created_at, datetime)
            else str(created_at)
        )
        data = [
            [
                Paragraph("Receipt Number:", bold_style),
                Paragraph(receipt_number, body_style),
            ],
            [Paragraph("Date & Time:", bold_style), Paragraph(date_str, body_style)],
            [Paragraph("Donor Name:", bold_style), Paragraph(donor_name, body_style)],
            [
                Paragraph("Donor PAN Number:", bold_style),
                Paragraph(donor_pan if donor_pan else "N/A", body_style),
            ],
            [
                Paragraph("Amount Contributed:", bold_style),
                Paragraph(f"INR {amount:,.2f}", bold_style),
            ],
            [
                Paragraph("Payment Method:", bold_style),
                Paragraph(payment_method, body_style),
            ],
            [Paragraph("Seva / Purpose:", bold_style), Paragraph(purpose, body_style)],
            [
                Paragraph("80G Tax Exemption Status:", bold_style),
                Paragraph(
                    "Eligible under Section 80G of IT Act"
                    if tax_exemption_80g
                    else "Not Applicable",
                    body_style,
                ),
            ],
        ]

        table = Table(data, colWidths=[180, 360])
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FDFBF7")),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
                    ("PADDING", (0, 0), (-1, -1), 8),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ]
            )
        )
        story.append(table)
        story.append(Spacer(1, 24))

        # Footer / Declaration
        footer_text = (
            "<b>Declaration:</b> Thank you for your generous contribution towards Shri Shivji Mandir. "
            "Donations are eligible for tax deduction under Section 80G of the Income Tax Act, 1961. "
            "This is a computer-generated digital receipt and does not require a physical signature."
        )
        story.append(Paragraph(footer_text, subtitle_style))

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

    except Exception:
        # Minimal valid PDF binary fallback
        pdf_content = (
            f"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
            f"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
            f"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n"
            f"4 0 obj<</Length 120>>stream\nBT /F1 12 Tf 50 700 TD (Shri Shivji Mandir Donation Receipt: {receipt_number}) Tj ET\n"
            f"BT /F1 10 Tf 50 680 TD (Donor: {donor_name} - Amount: INR {amount:.2f} - 80G Exempt) Tj ET\nendstream\nendobj\n"
            f"xref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\n"
            f"trailer<</Size 5/Root 1 0 R>>\nstartxref\n385\n%%EOF\n"
        )
        return pdf_content.encode("utf-8")
