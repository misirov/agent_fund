from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from db.main import Base

class DiscordUser(Base):
    __tablename__ = "discord_users"

    id = Column(Integer, primary_key=True, index=True)
    discord_id = Column(String, unique=True, index=True)
    username = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    messages = relationship("DiscordMessage", back_populates="user")

class DiscordChannel(Base):
    __tablename__ = "discord_channels"

    id = Column(Integer, primary_key=True, index=True)
    discord_id = Column(String, unique=True, index=True)
    name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    messages = relationship("DiscordMessage", back_populates="channel")

class DiscordMessage(Base):
    __tablename__ = "discord_messages"

    id = Column(Integer, primary_key=True, index=True)
    discord_id = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("discord_users.id"))
    channel_id = Column(Integer, ForeignKey("discord_channels.id"))
    content = Column(Text)
    
    # Sentiment analysis fields
    sentiment_score = Column(Float, nullable=True)  # -1.0 to 1.0
    protocol_name = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    technical_indicators = Column(Text, nullable=True)  # Store as JSON string
    risk_assessment = Column(String, nullable=True)
    community_consensus = Column(Float, nullable=True)  # 0.0 to 1.0
    
    created_at = Column(DateTime(timezone=True))
    stored_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("DiscordUser", back_populates="messages")
    channel = relationship("DiscordChannel", back_populates="messages") 