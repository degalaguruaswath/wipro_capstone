import os
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
import httpx

from .database import SessionLocal, engine, Base
from .models import Transaction

SERVICE_PORT = int(os.getenv("SERVICE_PORT", "8003"))
CORS = os.getenv("CORS_ORIGINS", "*")
ACCOUNT_SERVICE_URL = os.getenv("ACCOUNT_SERVICE_URL", "http://localhost:8002")

app = FastAPI(title="Transaction Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS.split(",")] if CORS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DepositDTO(BaseModel):
    account_no: str
    amount: float = Field(gt=0)

class WithdrawDTO(BaseModel):
    account_no: str
    amount: float = Field(gt=0)

class TransferDTO(BaseModel):
    from_account: str
    to_account: str
    amount: float = Field(gt=0)

class TransactionDTO(BaseModel):
    id: int
    type: str
    src_account: Optional[str] = None
    dst_account: Optional[str] = None
    amount: float

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

Base.metadata.create_all(bind=engine)

@app.get("/health")
def health():
    return {"ok": True, "service": "transactions"}

@app.get("/", response_model=List[TransactionDTO])
def list_transactions(account_no: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Transaction)
    if account_no:
        q = q.filter((Transaction.src_account == account_no) | (Transaction.dst_account == account_no))
    return [TransactionDTO(**t.__dict__) for t in q.all()]

@app.post("/deposit", response_model=TransactionDTO)
async def deposit(dto: DepositDTO, db: Session = Depends(get_db)):
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(f"{ACCOUNT_SERVICE_URL}/_internal/add_balance/{dto.account_no}", params={"amount": dto.amount})
        if r.status_code != 200:
            raise HTTPException(status_code=r.status_code, detail=r.json().get("detail", "Failed to deposit"))
    t = Transaction(type="deposit", src_account=None, dst_account=dto.account_no, amount=dto.amount)
    db.add(t)
    db.commit()
    db.refresh(t)
    return TransactionDTO(**t.__dict__)

@app.post("/withdraw", response_model=TransactionDTO)
async def withdraw(dto: WithdrawDTO, db: Session = Depends(get_db)):
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(f"{ACCOUNT_SERVICE_URL}/_internal/subtract_balance/{dto.account_no}", params={"amount": dto.amount})
        if r.status_code != 200:
            raise HTTPException(status_code=r.status_code, detail=r.json().get("detail", "Failed to withdraw"))
    t = Transaction(type="withdraw", src_account=dto.account_no, dst_account=None, amount=dto.amount)
    db.add(t)
    db.commit()
    db.refresh(t)
    return TransactionDTO(**t.__dict__)

@app.post("/transfer", response_model=TransactionDTO)
async def transfer(dto: TransferDTO, db: Session = Depends(get_db)):
    if dto.from_account == dto.to_account:
        raise HTTPException(status_code=400, detail="from_account and to_account must differ")
    async with httpx.AsyncClient(timeout=30.0) as client:
        r1 = await client.post(f"{ACCOUNT_SERVICE_URL}/_internal/subtract_balance/{dto.from_account}", params={"amount": dto.amount})
        if r1.status_code != 200:
            raise HTTPException(status_code=r1.status_code, detail=r1.json().get("detail", "Failed to debit source"))
        try:
            r2 = await client.post(f"{ACCOUNT_SERVICE_URL}/_internal/add_balance/{dto.to_account}", params={"amount": dto.amount})
            if r2.status_code != 200:
                # Attempt to rollback debit
                await client.post(f"{ACCOUNT_SERVICE_URL}/_internal/add_balance/{dto.from_account}", params={"amount": dto.amount})
                raise HTTPException(status_code=r2.status_code, detail=r2.json().get("detail", "Failed to credit destination"))
        except Exception as e:
            # Best-effort rollback
            await client.post(f"{ACCOUNT_SERVICE_URL}/_internal/add_balance/{dto.from_account}", params={"amount": dto.amount})
            raise
    t = Transaction(type="transfer", src_account=dto.from_account, dst_account=dto.to_account, amount=dto.amount)
    db.add(t)
    db.commit()
    db.refresh(t)
    return TransactionDTO(**t.__dict__)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=SERVICE_PORT, reload=False)
