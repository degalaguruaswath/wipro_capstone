import os, random
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from sqlalchemy import select
from .database import SessionLocal, engine, Base
from .models import Account

SERVICE_PORT = int(os.getenv("SERVICE_PORT", "8002"))
CORS = os.getenv("CORS_ORIGINS", "*")

app = FastAPI(title="Account Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS.split(",")] if CORS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OpenAccountDTO(BaseModel):
    user_id: int
    name: str
    dob: Optional[str] = None
    gender: Optional[str] = None
    aadhar: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    initial_deposit: float = Field(ge=0, default=0.0)

class UpdateAccountDTO(BaseModel):
    phone: Optional[str] = None
    email: Optional[EmailStr] = None

class AccountDTO(BaseModel):
    account_no: str
    user_id: int
    name: str
    dob: Optional[str] = None
    gender: Optional[str] = None
    aadhar: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    balance: float

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

Base.metadata.create_all(bind=engine)

def generate_account_no(db: Session) -> str:
    # Simple generator: 12-digit number, ensure unique
    for _ in range(10):
        acc = "".join(str(random.randint(0,9)) for _ in range(12))
        if not db.query(Account).filter(Account.account_no == acc).first():
            return acc
    raise RuntimeError("Failed to generate account number")

@app.get("/health")
def health():
    return {"ok": True, "service": "accounts"}

@app.post("/", response_model=AccountDTO)
def open_account(dto: OpenAccountDTO, db: Session = Depends(get_db)):
    acc_no = generate_account_no(db)
    a = Account(
        account_no=acc_no,
        user_id=dto.user_id,
        name=dto.name,
        dob=dto.dob,
        gender=dto.gender,
        aadhar=dto.aadhar,
        phone=dto.phone,
        email=dto.email,
        balance=float(dto.initial_deposit or 0.0),
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return AccountDTO(**a.__dict__)

@app.get("/{account_no}", response_model=AccountDTO)
def get_account(account_no: str, db: Session = Depends(get_db)):
    a = db.query(Account).filter(Account.account_no == account_no).first()
    if not a:
        raise HTTPException(status_code=404, detail="Account not found")
    return AccountDTO(**a.__dict__)

@app.patch("/{account_no}", response_model=AccountDTO)
def update_account(account_no: str, dto: UpdateAccountDTO, db: Session = Depends(get_db)):
    a = db.query(Account).filter(Account.account_no == account_no).first()
    if not a:
        raise HTTPException(status_code=404, detail="Account not found")
    if dto.phone is not None:
        a.phone = dto.phone
    if dto.email is not None:
        a.email = dto.email
    db.commit()
    db.refresh(a)
    return AccountDTO(**a.__dict__)

@app.get("/", response_model=List[AccountDTO])
def list_accounts(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(Account)
    if user_id is not None:
        q = q.filter(Account.user_id == user_id)
    return [AccountDTO(**a.__dict__) for a in q.all()]

# Internal endpoints for transaction-service
@app.post("/_internal/add_balance/{account_no}")
def internal_add(account_no: str, amount: float, db: Session = Depends(get_db)):
    a = db.query(Account).filter(Account.account_no == account_no).first()
    if not a:
        raise HTTPException(status_code=404, detail="Account not found")
    a.balance += float(amount)
    db.commit()
    return {"ok": True, "balance": a.balance}

@app.post("/_internal/subtract_balance/{account_no}")
def internal_sub(account_no: str, amount: float, db: Session = Depends(get_db)):
    a = db.query(Account).filter(Account.account_no == account_no).first()
    if not a:
        raise HTTPException(status_code=404, detail="Account not found")
    if a.balance < float(amount):
        raise HTTPException(status_code=400, detail="Insufficient funds")
    a.balance -= float(amount)
    db.commit()
    return {"ok": True, "balance": a.balance}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=SERVICE_PORT, reload=False)
