import os
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from database import Base
import jwt

from database import SessionLocal, engine, Base
from models import Account

SERVICE_PORT = int(os.getenv("SERVICE_PORT", "8001"))
CORS = os.getenv("CORS_ORIGINS", "*")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-change-me")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI(title="Auth Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS.split(",")] if CORS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RegisterDTO(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "customer"

class LoginDTO(BaseModel):
    email: EmailStr
    password: str

class UserDTO(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

Base.metadata.create_all(bind=engine)

@app.get("/health")
def health():
    return {"ok": True, "service": "auth"}

@app.post("/register")
def register(dto: RegisterDTO, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == dto.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    u = User(
        name=dto.name,
        email=dto.email,
        role=dto.role or "customer",
        password_hash=pwd_context.hash(dto.password)
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return {"ok": True, "user": {"id": u.id, "name": u.name, "email": u.email, "role": u.role}}

@app.post("/login")
def login(dto: LoginDTO, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.email == dto.email).first()
    if not u or not pwd_context.verify(dto.password, u.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = jwt.encode({"sub": str(u.id), "name": u.name, "email": u.email, "role": u.role}, JWT_SECRET, algorithm="HS256")
    return {"ok": True, "token": token, "user": {"id": u.id, "name": u.name, "email": u.email, "role": u.role}}

@app.get("/me")
def me(authorization: Optional[str] = None, db: Session = Depends(get_db)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ",1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"ok": True, "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=SERVICE_PORT, reload=False)
