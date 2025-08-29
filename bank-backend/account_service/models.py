from sqlalchemy import Column, Integer, String, Float
from .database import Base

class Account(Base):
    __tablename__ = "accounts"
    id = Column(Integer, primary_key=True, index=True)
    account_no = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, index=True)  # linked to auth user id
    name = Column(String, nullable=False)
    dob = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    aadhar = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    balance = Column(Float, default=0.0)
