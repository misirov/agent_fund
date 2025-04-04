import discord
import asyncio
import os
from typing import List, Optional, Callable, Any
import logging

logger = logging.getLogger(__name__)

class DiscordClient:
    """
    A client for interacting with Discord.
    Allows reading messages and posting replies.
    """
    
    def __init__(self, token: Optional[str] = None):
        """
        Initialize the Discord client.
        
        Args:
            token: Discord bot token. If None, will try to get from environment variable.
        """
        self.token = token or os.getenv("DISCORD_TOKEN")
        if not self.token:
            raise ValueError("Discord token not provided and DISCORD_TOKEN environment variable not set")
        
        intents = discord.Intents.default()
        intents.messages = True
        intents.message_content = True  # Required to read message content
        
        self.client = discord.Client(intents=intents)
        self.message_handlers = []
        
        @self.client.event
        async def on_ready():
            logger.info(f"Logged in as {self.client.user}")
        
        @self.client.event
        async def on_message(message):
            # Don't respond to our own messages
            if message.author == self.client.user:
                return
            
            # Process message with all registered handlers
            for handler in self.message_handlers:
                await handler(message)
    
    def add_message_handler(self, handler: Callable[[discord.Message], Any]):
        """
        Add a message handler function that will be called for each new message.
        
        Args:
            handler: Async function that takes a discord.Message object
        """
        self.message_handlers.append(handler)
    
    async def send_message(self, channel_id: int, content: str) -> discord.Message:
        """
        Send a message to a specific channel.
        
        Args:
            channel_id: The ID of the channel to send the message to
            content: The content of the message
            
        Returns:
            The sent message object
        """
        channel = self.client.get_channel(channel_id)
        if not channel:
            raise ValueError(f"Channel with ID {channel_id} not found")
        
        return await channel.send(content)
    
    async def reply_to_message(self, message: discord.Message, content: str) -> discord.Message:
        """
        Reply to a specific message.
        
        Args:
            message: The message to reply to
            content: The content of the reply
            
        Returns:
            The sent message object
        """
        return await message.reply(content)
    
    async def get_channel_history(self, channel_id: int, limit: int = 100) -> List[discord.Message]:
        """
        Get the message history from a channel.
        
        Args:
            channel_id: The ID of the channel
            limit: Maximum number of messages to retrieve
            
        Returns:
            List of messages
        """
        channel = self.client.get_channel(channel_id)
        if not channel:
            raise ValueError(f"Channel with ID {channel_id} not found")
        
        messages = []
        async for message in channel.history(limit=limit):
            messages.append(message)
        
        return messages
    
    def run(self):
        """Run the Discord client (blocking)"""
        self.client.run(self.token)
    
    async def start(self):
        """Start the Discord client (non-blocking)"""
        await self.client.start(self.token)
    
    async def close(self):
        """Close the Discord client connection"""
        await self.client.close()


# Example usage
async def example_message_handler(message):
    """Example handler that echoes messages"""
    if message.content.startswith('!echo'):
        content = message.content[6:]  # Remove '!echo ' from the message
        await message.channel.send(f"Echo: {content}")

if __name__ == "__main__":
    # Example of how to use the client
    discord_client = DiscordClient()
    
    # Add a message handler
    discord_client.add_message_handler(example_message_handler)
    
    # Run the client (blocking)
    discord_client.run()
