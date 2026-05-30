
from fastapi import FastAPI
from server.database import engine, Base
from server.routers import books, patrons, loans, search

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(books.router, prefix="/api/v1/books", tags=["books"])
app.include_router(patrons.router, prefix="/api/v1/patrons", tags=["patrons"])
app.include_router(loans.router, prefix="/api/v1/loans", tags=["loans"])
app.include_router(search.router, prefix="/api/v1/search", tags=["search"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Library Management System"}
