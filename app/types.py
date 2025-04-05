from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Discord User models
class DiscordUserBase(BaseModel):
    discord_id: str
    username: str

class DiscordUserCreate(DiscordUserBase):
    pass

class DiscordUserResponse(DiscordUserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Discord Channel models
class DiscordChannelBase(BaseModel):
    discord_id: str
    name: str

class DiscordChannelCreate(DiscordChannelBase):
    pass

class DiscordChannelResponse(DiscordChannelBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Discord Message models
class DiscordMessageBase(BaseModel):
    discord_id: str
    content: str
    created_at: datetime

class DiscordMessageCreate(DiscordMessageBase):
    user_id: int
    channel_id: int
    sentiment_score: Optional[float] = None
    protocol_name: Optional[str] = None
    confidence: Optional[float] = None
    technical_indicators: Optional[str] = None
    risk_assessment: Optional[str] = None
    community_consensus: Optional[float] = None

class DiscordMessageResponse(DiscordMessageBase):
    id: int
    user_id: int
    channel_id: int
    sentiment_score: Optional[float] = None
    protocol_name: Optional[str] = None
    confidence: Optional[float] = None
    technical_indicators: Optional[str] = None
    risk_assessment: Optional[str] = None
    community_consensus: Optional[float] = None
    stored_at: datetime
    
    class Config:
        from_attributes = True 
