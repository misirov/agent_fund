import asyncio
import logging
import os
from datetime import datetime

from dotenv import load_dotenv
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import Discord client
try:
    from discord_bot import DiscordClient
except ImportError:
    from app.agents.discord_bot import DiscordClient

class SimpleDiscordBot:
    """
    A simple Discord bot that reads messages and prints them to the terminal.
    """
    
    def __init__(self):
        """Initialize the bot"""
        self.discord_client = DiscordClient(os.getenv("DISCORD_TOKEN"))
        
        # Register message handler
        self.discord_client.add_message_handler(self.handle_message)
        
        logger.info("Bot initialized")
    
    async def handle_message(self, message):
        """Handle incoming Discord messages by printing them to the terminal"""
        # Format the message with timestamp, author, and content
        timestamp = message.created_at.strftime("%Y-%m-%d %H:%M:%S")
        author = message.author.name
        channel = message.channel.name
        content = message.content
        
        # Print the message to the terminal
        print(f"[{timestamp}] #{channel} - {author}: {content}")
        logger.info(f"Message from {author} in {channel}: {content}")
    
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
    bot = SimpleDiscordBot()
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
