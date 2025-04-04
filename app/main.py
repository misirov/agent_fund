from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from db.main import get_db
from app.types import FundCreate, FundResponse, ContributionCreate
from db.models import Fund, Contribution

app = FastAPI(title="CeloAIFund")

@app.get("/")
def read_root():
    return {"message": "Welcome to CeloAIFund - AI-managed investment fund on Celo"}

@app.post("/funds/", response_model=FundResponse)
def create_fund(fund: FundCreate, db: Session = Depends(get_db)):
    db_fund = Fund(
        name=fund.name,
        description=fund.description,
        target_amount=fund.target_amount,
        duration_days=fund.duration_days,
        creator_address=fund.creator_address
    )
    db.add(db_fund)
    db.commit()
    db.refresh(db_fund)
    return db_fund

@app.get("/funds/", response_model=list[FundResponse])
def list_funds(db: Session = Depends(get_db)):
    funds = db.query(Fund).all()
    return funds

@app.get("/funds/{fund_id}", response_model=FundResponse)
def get_fund(fund_id: int, db: Session = Depends(get_db)):
    fund = db.query(Fund).filter(Fund.id == fund_id).first()
    if fund is None:
        raise HTTPException(status_code=404, detail="Fund not found")
    return fund

@app.post("/funds/{fund_id}/contribute")
def contribute_to_fund(fund_id: int, contribution: ContributionCreate, db: Session = Depends(get_db)):
    fund = db.query(Fund).filter(Fund.id == fund_id).first()
    if fund is None:
        raise HTTPException(status_code=404, detail="Fund not found")
    
    db_contribution = Contribution(
        fund_id=fund_id,
        contributor_address=contribution.contributor_address,
        amount=contribution.amount,
        transaction_hash=contribution.transaction_hash
    )
    db.add(db_contribution)
    db.commit()
    db.refresh(db_contribution)
    return {"status": "success", "contribution_id": db_contribution.id} 