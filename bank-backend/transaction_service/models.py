from sqlalchemy import Column, Integer, String, Float
from .database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True)  # deposit/withdraw/transfer
    src_account = Column(String, nullable=True)
    dst_account = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
