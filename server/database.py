import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/app.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from server.models import Continent, Country, PortfolioInvestment  # noqa: F401

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()


def seed_data(db):
    from server.models import Continent, Country, PortfolioInvestment

    if db.query(Continent).first() is not None:
        return

    continents_data = [
        {"name": "Europe", "code": "EU"},
        {"name": "Asia", "code": "AS"},
        {"name": "North America", "code": "NA"},
        {"name": "South America", "code": "SA"},
        {"name": "Africa", "code": "AF"},
        {"name": "Oceania", "code": "OC"},
    ]

    continent_map = {}
    for c_data in continents_data:
        cont = Continent(name=c_data["name"], code=c_data["code"])
        db.add(cont)
        db.flush()
        continent_map[c_data["name"]] = cont

    countries_data = [
        {
            "name": "Germany",
            "code": "DE",
            "capital": "Berlin",
            "population": 83200000,
            "region": "Western Europe",
            "continent": "Europe",
            "portfolio_status": "Active",
            "total_investment_usd": 150000000.0,
            "investments": [
                {
                    "asset_name": "Berlin Logistics Hub",
                    "sector": "Real Estate",
                    "amount_usd": 75000000.0,
                    "status": "Performing",
                    "date_added": "2024-01-15",
                },
                {
                    "asset_name": "Munich Renewable Energy",
                    "sector": "Renewable Energy",
                    "amount_usd": 75000000.0,
                    "status": "Performing",
                    "date_added": "2024-03-20",
                },
            ],
        },
        {
            "name": "France",
            "code": "FR",
            "capital": "Paris",
            "population": 67700000,
            "region": "Western Europe",
            "continent": "Europe",
            "portfolio_status": "Active",
            "total_investment_usd": 120000000.0,
            "investments": [
                {
                    "asset_name": "Paris Innovation Center",
                    "sector": "Technology",
                    "amount_usd": 60000000.0,
                    "status": "Performing",
                    "date_added": "2024-02-10",
                },
                {
                    "asset_name": "Lyon Biotech Park",
                    "sector": "Healthcare",
                    "amount_usd": 60000000.0,
                    "status": "Performing",
                    "date_added": "2024-04-05",
                },
            ],
        },
        {
            "name": "Japan",
            "code": "JP",
            "capital": "Tokyo",
            "population": 125800000,
            "region": "East Asia",
            "continent": "Asia",
            "portfolio_status": "Active",
            "total_investment_usd": 200000000.0,
            "investments": [
                {
                    "asset_name": "Tokyo Tech Park",
                    "sector": "Technology",
                    "amount_usd": 120000000.0,
                    "status": "Performing",
                    "date_added": "2023-11-01",
                },
                {
                    "asset_name": "Osaka Automation Lab",
                    "sector": "Robotics",
                    "amount_usd": 80000000.0,
                    "status": "Performing",
                    "date_added": "2024-01-20",
                },
            ],
        },
        {
            "name": "United States",
            "code": "US",
            "capital": "Washington D.C.",
            "population": 331900000,
            "region": "Northern America",
            "continent": "North America",
            "portfolio_status": "Active",
            "total_investment_usd": 500000000.0,
            "investments": [
                {
                    "asset_name": "Silicon Valley Hub",
                    "sector": "Technology",
                    "amount_usd": 300000000.0,
                    "status": "Performing",
                    "date_added": "2023-08-15",
                },
                {
                    "asset_name": "Texas Wind Farm",
                    "sector": "Renewable Energy",
                    "amount_usd": 200000000.0,
                    "status": "Performing",
                    "date_added": "2023-12-10",
                },
            ],
        },
        {
            "name": "Brazil",
            "code": "BR",
            "capital": "Brasilia",
            "population": 214300000,
            "region": "South America",
            "continent": "South America",
            "portfolio_status": "Under Review",
            "total_investment_usd": 45000000.0,
            "investments": [
                {
                    "asset_name": "Sao Paulo AgTech",
                    "sector": "Agriculture",
                    "amount_usd": 45000000.0,
                    "status": "In Development",
                    "date_added": "2024-05-01",
                },
            ],
        },
        {
            "name": "Kenya",
            "code": "KE",
            "capital": "Nairobi",
            "population": 53700000,
            "region": "Eastern Africa",
            "continent": "Africa",
            "portfolio_status": "Pipeline",
            "total_investment_usd": 25000000.0,
            "investments": [
                {
                    "asset_name": "Nairobi Solar Grid",
                    "sector": "Energy",
                    "amount_usd": 25000000.0,
                    "status": "Pipeline",
                    "date_added": "2024-06-12",
                },
            ],
        },
    ]

    for c_item in countries_data:
        cont_obj = continent_map.get(c_item["continent"])
        if not cont_obj:
            target_name = c_item["continent"].lower()
            for cont_name, obj in continent_map.items():
                if target_name in cont_name.lower() or cont_name.lower() in target_name:
                    cont_obj = obj
                    break
        if not cont_obj:
            continue
        country = Country(
            continent_id=cont_obj.id,
            name=c_item["name"],
            code=c_item["code"],
            capital=c_item["capital"],
            population=c_item["population"],
            region=c_item["region"],
            portfolio_status=c_item["portfolio_status"],
            total_investment_usd=c_item["total_investment_usd"],
        )
        db.add(country)
        db.flush()

        for inv in c_item["investments"]:
            investment = PortfolioInvestment(
                country_id=country.id,
                asset_name=inv["asset_name"],
                sector=inv["sector"],
                amount_usd=inv["amount_usd"],
                status=inv["status"],
                date_added=inv["date_added"],
            )
            db.add(investment)

    try:
        db.commit()
    except Exception:
        db.rollback()
