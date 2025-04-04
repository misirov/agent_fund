from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class FundBase(BaseModel):
    name: str
    description: str
    target_amount: float
    duration_days: int
    creator_address: str

class FundCreate(FundBase):
    pass

class FundResponse(FundBase):
    id: int
    current_amount: float
    created_at: datetime
    status: str
    
    class Config:
        from_attributes = True

class ContributionBase(BaseModel):
    contributor_address: str
    amount: float
    transaction_hash: str

class ContributionCreate(ContributionBase):
    pass

class ContributionResponse(ContributionBase):
    id: int
    fund_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True 