import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

connect_args = {}
poolclass = None

if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    poolclass = StaticPool

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    poolclass=poolclass,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)


def seed_data(db):
    import uuid
    from datetime import datetime, timedelta, timezone
    from sqlalchemy.exc import IntegrityError
    from server.models import Artist, Discography, Country, Venue, Concert, TicketTier

    # 1. Seed Artist
    artist = db.query(Artist).filter(Artist.name == "Aria Vance").first()
    if not artist:
        artist = Artist(
            id=uuid.uuid4(),
            name="Aria Vance",
            bio="Aria Vance is an internationally acclaimed singer-songwriter known for her ethereal vocals and genre-bending pop-folk melodies. With multiple platinum albums and a dedicated global fanbase, she continues to push the boundaries of contemporary music.",
            monthly_listeners=45000000,
            hero_image_url="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60",
        )
        db.add(artist)
        try:
            db.commit()
            db.refresh(artist)
        except IntegrityError:
            db.rollback()
            artist = db.query(Artist).filter(Artist.name == "Aria Vance").first()

    # 2. Seed Discography
    albums = [
        {
            "title": "Whispers in the Wind",
            "release_year": 2021,
            "cover_image_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=60",
            "track_count": 12,
        },
        {
            "title": "Midnight Echoes",
            "release_year": 2023,
            "cover_image_url": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=60",
            "track_count": 14,
        },
        {
            "title": "Ethereal",
            "release_year": 2025,
            "cover_image_url": "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&auto=format&fit=crop&q=60",
            "track_count": 10,
        },
    ]
    for album_data in albums:
        existing_album = (
            db.query(Discography)
            .filter(Discography.title == album_data["title"])
            .first()
        )
        if not existing_album:
            album = Discography(
                id=uuid.uuid4(),
                artist_id=artist.id,
                title=album_data["title"],
                release_year=album_data["release_year"],
                cover_image_url=album_data["cover_image_url"],
                track_count=album_data["track_count"],
            )
            db.add(album)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()

    # 3. Seed Countries
    countries_data = [
        {
            "name": "United States",
            "code": "US",
            "currency_code": "USD",
            "currency_symbol": "$",
        },
        {
            "name": "United Kingdom",
            "code": "GB",
            "currency_code": "GBP",
            "currency_symbol": "£",
        },
        {
            "name": "Germany",
            "code": "DE",
            "currency_code": "EUR",
            "currency_symbol": "€",
        },
        {"name": "Japan", "code": "JP", "currency_code": "JPY", "currency_symbol": "¥"},
    ]
    countries = {}
    for c_data in countries_data:
        country = db.query(Country).filter(Country.code == c_data["code"]).first()
        if not country:
            country = Country(
                id=uuid.uuid4(),
                name=c_data["name"],
                code=c_data["code"],
                currency_code=c_data["currency_code"],
                currency_symbol=c_data["currency_symbol"],
            )
            db.add(country)
            try:
                db.commit()
                db.refresh(country)
            except IntegrityError:
                db.rollback()
                country = (
                    db.query(Country).filter(Country.code == c_data["code"]).first()
                )
        countries[c_data["code"]] = country

    # 4. Seed Venues
    venues_data = [
        {
            "country_code": "US",
            "name": "Madison Square Garden",
            "city": "New York",
            "capacity": 20000,
        },
        {
            "country_code": "GB",
            "name": "The O2 Arena",
            "city": "London",
            "capacity": 20000,
        },
        {
            "country_code": "DE",
            "name": "Mercedes-Benz Arena",
            "city": "Berlin",
            "capacity": 17000,
        },
        {
            "country_code": "JP",
            "name": "Tokyo Dome",
            "city": "Tokyo",
            "capacity": 55000,
        },
    ]
    venues = {}
    for v_data in venues_data:
        country = countries[v_data["country_code"]]
        venue = db.query(Venue).filter(Venue.name == v_data["name"]).first()
        if not venue:
            venue = Venue(
                id=uuid.uuid4(),
                country_id=country.id,
                name=v_data["name"],
                city=v_data["city"],
                capacity=v_data["capacity"],
            )
            db.add(venue)
            try:
                db.commit()
                db.refresh(venue)
            except IntegrityError:
                db.rollback()
                venue = db.query(Venue).filter(Venue.name == v_data["name"]).first()
        venues[v_data["name"]] = venue

    # 5. Seed Concerts & Ticket Tiers
    concerts_data = [
        {
            "venue_name": "Madison Square Garden",
            "tour_name": "Ethereal Echoes Tour - New York",
            "event_date": datetime.now(timezone.utc) + timedelta(days=45),
            "status": "On Sale",
            "min_price_usd": 85.00,
            "tiers": [
                {
                    "tier_name": "General Admission",
                    "capacity": 10000,
                    "price_local": 85.00,
                },
                {
                    "tier_name": "Premium Reserved",
                    "capacity": 8000,
                    "price_local": 150.00,
                },
                {
                    "tier_name": "VIP Experience",
                    "capacity": 2000,
                    "price_local": 350.00,
                },
            ],
        },
        {
            "venue_name": "The O2 Arena",
            "tour_name": "Ethereal Echoes Tour - London",
            "event_date": datetime.now(timezone.utc) + timedelta(days=60),
            "status": "On Sale",
            "min_price_usd": 95.00,
            "tiers": [
                {
                    "tier_name": "Standard Standing",
                    "capacity": 10000,
                    "price_local": 75.00,
                },
                {
                    "tier_name": "Lower Tier Seating",
                    "capacity": 7000,
                    "price_local": 120.00,
                },
                {"tier_name": "VIP Lounge", "capacity": 3000, "price_local": 280.00},
            ],
        },
        {
            "venue_name": "Mercedes-Benz Arena",
            "tour_name": "Ethereal Echoes Tour - Berlin",
            "event_date": datetime.now(timezone.utc) + timedelta(days=75),
            "status": "On Sale",
            "min_price_usd": 90.00,
            "tiers": [
                {"tier_name": "Arena Standing", "capacity": 8000, "price_local": 80.00},
                {
                    "tier_name": "Tier 1 Seating",
                    "capacity": 6000,
                    "price_local": 110.00,
                },
                {
                    "tier_name": "Golden Circle VIP",
                    "capacity": 3000,
                    "price_local": 250.00,
                },
            ],
        },
        {
            "venue_name": "Tokyo Dome",
            "tour_name": "Ethereal Echoes Tour - Tokyo",
            "event_date": datetime.now(timezone.utc) + timedelta(days=90),
            "status": "On Sale",
            "min_price_usd": 100.00,
            "tiers": [
                {
                    "tier_name": "General Admission",
                    "capacity": 30000,
                    "price_local": 11000.00,
                },
                {
                    "tier_name": "S Seat Reserved",
                    "capacity": 20000,
                    "price_local": 18000.00,
                },
                {"tier_name": "SS Seat VIP", "capacity": 5000, "price_local": 35000.00},
            ],
        },
    ]

    for c_data in concerts_data:
        venue = venues[c_data["venue_name"]]
        country = db.query(Country).filter(Country.id == venue.country_id).first()
        existing_concert = (
            db.query(Concert).filter(Concert.tour_name == c_data["tour_name"]).first()
        )
        if not existing_concert:
            concert = Concert(
                id=uuid.uuid4(),
                artist_id=artist.id,
                venue_id=venue.id,
                tour_name=c_data["tour_name"],
                event_date=c_data["event_date"],
                status=c_data["status"],
                min_price_usd=c_data["min_price_usd"],
            )
            db.add(concert)
            try:
                db.commit()
                db.refresh(concert)
            except IntegrityError:
                db.rollback()
                concert = (
                    db.query(Concert)
                    .filter(Concert.tour_name == c_data["tour_name"])
                    .first()
                )
        else:
            concert = existing_concert

        for t_data in c_data["tiers"]:
            existing_tier = (
                db.query(TicketTier)
                .filter(
                    TicketTier.concert_id == concert.id,
                    TicketTier.tier_name == t_data["tier_name"],
                )
                .first()
            )
            if not existing_tier:
                tier = TicketTier(
                    id=uuid.uuid4(),
                    concert_id=concert.id,
                    tier_name=t_data["tier_name"],
                    total_capacity=t_data["capacity"],
                    available_seats=t_data["capacity"],
                    price_local=t_data["price_local"],
                    currency_code=country.currency_code,
                )
                db.add(tier)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
