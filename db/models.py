from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from db.main import Base

class FundStatus(enum.Enum):
    FUNDRAISING = "fundraising"
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"

class Fund(Base):
    __tablename__ = "funds"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    target_amount = Column(Float)
    current_amount = Column(Float, default=0.0)
    duration_days = Column(Integer)
    creator_address = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default=FundStatus.FUNDRAISING.value)
    
    contributions = relationship("Contribution", back_populates="fund")
    investments = relationship("Investment", back_populates="fund")

class Contribution(Base):
    __tablename__ = "contributions"

    id = Column(Integer, primary_key=True, index=True)
    fund_id = Column(Integer, ForeignKey("funds.id"))
    contributor_address = Column(String)
    amount = Column(Float)
    transaction_hash = Column(String, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    fund = relationship("Fund", back_populates="contributions")

class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    fund_id = Column(Integer, ForeignKey("funds.id"))
    asset_name = Column(String)
    asset_address = Column(String)
    amount = Column(Float)
    transaction_hash = Column(String, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    fund = relationship("Fund", back_populates="investments") 