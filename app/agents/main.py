import asyncio
import logging
import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()

try:
    from discord_bot import DiscordClient
    from sentiment_analyzer import SentimentAnalyzer, TextInformation
except ImportError:
    from app.agents.discord_bot import DiscordClient
    from app.agents.sentiment_analyzer import SentimentAnalyzer, TextInformation

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SimpleDiscordBot:
    """
    A Discord bot that reads messages, analyzes sentiment, and saves to the database.
    """
    
    def __init__(self, discord_token: str):
        """Initialize the bot"""
        self.discord_client = DiscordClient(discord_token)
        self.api_url = os.getenv("API_URL", "http://app:8000")
        
        # Initialize sentiment analyzer
        self.sentiment_analyzer = SentimentAnalyzer(
            api_key=os.getenv("OPENAI_API_KEY"),
            model=os.getenv("OPENAI_MODEL", "gpt-4o-2024-08-06")
        )
        
        # Register message handler
        self.discord_client.add_message_handler(self.handle_message)
        
        logger.info("Bot initialized with sentiment analysis capabilities")
    
    async def handle_message(self, message):
        """Handle incoming Discord messages by analyzing sentiment and saving to the database"""
        # Format the message with timestamp, author, and content
        timestamp = message.created_at.strftime("%Y-%m-%d %H:%M:%S")
        author = message.author.name
        channel = message.channel.name
        content = message.content
        
        # Print the message to the terminal
        print(f"[{timestamp}] #{channel} - {author}: {content}")
        logger.info(f"Message from {author} in {channel}: {content}")
        
        # Skip very short messages or bot messages
        if len(content) < 10 or message.author.bot:
            logger.info(f"Skipping message: too short or from bot")
            return
        
        try:
            # Analyze sentiment
            logger.info(f"Analyzing sentiment for message: {message.id}")
            sentiment_data = self.sentiment_analyzer.analyze_message(content, TextInformation)
            logger.info(f"Sentiment analysis complete: {sentiment_data}")
            
            # Save the user if not exists
            user_data = {
                "discord_id": str(message.author.id),
                "username": message.author.name
            }
            user_response = requests.post(f"{self.api_url}/users/", json=user_data)
            user = user_response.json()
            
            # Save the channel if not exists
            channel_data = {
                "discord_id": str(message.channel.id),
                "name": message.channel.name
            }
            channel_response = requests.post(f"{self.api_url}/channels/", json=channel_data)
            channel = channel_response.json()
            
            # Prepare technical indicators as JSON string
            technical_indicators = json.dumps(sentiment_data.technical_indicators) if sentiment_data.technical_indicators else None
            
            # Save the message with sentiment analysis
            message_data = {
                "discord_id": str(message.id),
                "user_id": user["id"],
                "channel_id": channel["id"],
                "content": message.content,
                "created_at": message.created_at.isoformat(),
                
                # Sentiment analysis data
                "sentiment_score": sentiment_data.sentiment_score,
                "protocol_name": sentiment_data.protocol_name,
                "confidence": sentiment_data.confidence,
                "technical_indicators": technical_indicators,
                "risk_assessment": sentiment_data.risk_assessment,
                "community_consensus": sentiment_data.community_consensus
            }
            
            response = requests.post(f"{self.api_url}/messages/", json=message_data)
            
            if response.status_code == 200:
                logger.info(f"Message saved to database with sentiment analysis: {message.id}")
            else:
                logger.error(f"Failed to save message: {response.status_code} - {response.text}")
                
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
    
    async def start(self):
        """Start the bot"""
        logger.info("Starting Discord bot")
        await self.discord_client.start()
    
    async def close(self):
        """Close the bot"""
        logger.info("Closing Discord bot")
        await self.discord_client.close()

async def main():
    """Main entry point for the bot"""
    bot = SimpleDiscordBot(os.getenv("DISCORD_TOKEN"))
    try:
        await bot.start()
        # Keep the bot running
        while True:
            await asyncio.sleep(60)  # Sleep for a minute
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received, shutting down")
    finally:
        await bot.close()



if __name__ == "__main__":
    asyncio.run(main())
