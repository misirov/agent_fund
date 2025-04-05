from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from db.main import get_db
from app.types import (
    DiscordUserCreate, DiscordUserResponse,
    DiscordChannelCreate, DiscordChannelResponse,
    DiscordMessageCreate, DiscordMessageResponse
)
from db.models import DiscordUser, DiscordChannel, DiscordMessage

app = FastAPI(title="CeloAIFund")

@app.get("/")
def read_root():
    return {"message": "Welcome to CeloAIFund - AI-managed investment fund on Celo"}

# Discord User endpoints
@app.post("/users/", response_model=DiscordUserResponse)
def create_user(user: DiscordUserCreate, db: Session = Depends(get_db)):
    db_user = db.query(DiscordUser).filter(DiscordUser.discord_id == user.discord_id).first()
    if db_user:
        return db_user
    
    db_user = DiscordUser(
        discord_id=user.discord_id,
        username=user.username
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/", response_model=List[DiscordUserResponse])
def list_users(db: Session = Depends(get_db)):
    users = db.query(DiscordUser).all()
    return users

@app.get("/users/{user_id}", response_model=DiscordUserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(DiscordUser).filter(DiscordUser.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Discord Channel endpoints
@app.post("/channels/", response_model=DiscordChannelResponse)
def create_channel(channel: DiscordChannelCreate, db: Session = Depends(get_db)):
    db_channel = db.query(DiscordChannel).filter(DiscordChannel.discord_id == channel.discord_id).first()
    if db_channel:
        return db_channel
    
    db_channel = DiscordChannel(
        discord_id=channel.discord_id,
        name=channel.name
    )
    db.add(db_channel)
    db.commit()
    db.refresh(db_channel)
    return db_channel

@app.get("/channels/", response_model=List[DiscordChannelResponse])
def list_channels(db: Session = Depends(get_db)):
    channels = db.query(DiscordChannel).all()
    return channels

# Discord Message endpoints
@app.post("/messages/", response_model=DiscordMessageResponse)
def create_message(message: DiscordMessageCreate, db: Session = Depends(get_db)):
    db_message = db.query(DiscordMessage).filter(DiscordMessage.discord_id == message.discord_id).first()
    if db_message:
        return db_message
    
    db_message = DiscordMessage(
        discord_id=message.discord_id,
        user_id=message.user_id,
        channel_id=message.channel_id,
        content=message.content,
        sentiment_score=message.sentiment_score,
        protocol_name=message.protocol_name,
        confidence=message.confidence,
        technical_indicators=message.technical_indicators,
        risk_assessment=message.risk_assessment,
        community_consensus=message.community_consensus,
        created_at=message.created_at
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@app.get("/messages/", response_model=List[DiscordMessageResponse])
def list_messages(limit: int = 100, db: Session = Depends(get_db)):
    messages = db.query(DiscordMessage).order_by(DiscordMessage.created_at.desc()).limit(limit).all()
    return messages

@app.get("/channels/{channel_id}/messages/", response_model=List[DiscordMessageResponse])
def get_channel_messages(channel_id: int, limit: int = 100, db: Session = Depends(get_db)):
    messages = db.query(DiscordMessage).filter(
        DiscordMessage.channel_id == channel_id
    ).order_by(DiscordMessage.created_at.desc()).limit(limit).all()
    return messages

@app.get("/protocols/", response_model=List[str])
def get_protocols(db: Session = Depends(get_db)):
    """Get a list of all protocols mentioned in messages"""
    protocols = db.query(DiscordMessage.protocol_name).filter(
        DiscordMessage.protocol_name.isnot(None)
    ).distinct().all()
    return [p[0] for p in protocols if p[0]]

@app.get("/protocols/{protocol_name}/sentiment", response_model=dict)
def get_protocol_sentiment(protocol_name: str, db: Session = Depends(get_db)):
    """Get average sentiment for a specific protocol"""
    messages = db.query(DiscordMessage).filter(
        DiscordMessage.protocol_name == protocol_name
    ).all()
    
    if not messages:
        raise HTTPException(status_code=404, detail="Protocol not found")
    
    # Calculate average sentiment
    total_sentiment = sum(m.sentiment_score or 0 for m in messages)
    avg_sentiment = total_sentiment / len(messages) if messages else 0
    
    # Calculate average confidence
    total_confidence = sum(m.confidence or 0 for m in messages)
    avg_confidence = total_confidence / len(messages) if messages else 0
    
    return {
        "protocol": protocol_name,
        "message_count": len(messages),
        "average_sentiment": avg_sentiment,
        "average_confidence": avg_confidence,
        "latest_message": messages[0].content if messages else None,
        "latest_risk_assessment": messages[0].risk_assessment if messages else None
    } 