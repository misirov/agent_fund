from typing import Dict, List, Union, Optional
import openai
import os
import logging

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    """
    A class for analyzing sentiment in text using OpenAI's API.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the sentiment analyzer.
        
        Args:
            api_key: OpenAI API key. If None, will try to get from environment variable.
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key not provided and OPENAI_API_KEY environment variable not set")
        
        openai.api_key = self.api_key
    
    async def analyze_sentiment(self, text: str) -> Dict[str, Union[str, float]]:
        """
        Analyze the sentiment of a text.
        
        Args:
            text: The text to analyze
            
        Returns:
            Dictionary containing sentiment analysis results
        """
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a sentiment analysis assistant. Analyze the sentiment of the following text and respond with a JSON object containing 'sentiment' (positive, negative, or neutral), 'confidence' (0-1), and 'explanation'."},
                    {"role": "user", "content": text}
                ],
                temperature=0.3,
                max_tokens=150
            )
            
            # Extract the sentiment analysis from the response
            analysis = response.choices[0].message.content
            
            # Parse the JSON response
            import json
            try:
                result = json.loads(analysis)
                return result
            except json.JSONDecodeError:
                logger.error(f"Failed to parse sentiment analysis response: {analysis}")
                return {
                    "sentiment": "neutral",
                    "confidence": 0.5,
                    "explanation": "Failed to parse sentiment analysis"
                }
                
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {str(e)}")
            return {
                "sentiment": "neutral",
                "confidence": 0.5,
                "explanation": f"Error: {str(e)}"
            }
    
    async def analyze_multiple(self, texts: List[str]) -> List[Dict[str, Union[str, float]]]:
        """
        Analyze the sentiment of multiple texts.
        
        Args:
            texts: List of texts to analyze
            
        Returns:
            List of dictionaries containing sentiment analysis results
        """
        results = []
        for text in texts:
            result = await self.analyze_sentiment(text)
            results.append(result)
        return results


if __name__ == "__main__":
    # Example usage
    import asyncio
    
    async def test_sentiment():
        analyzer = SentimentAnalyzer()
        
        texts = [
            "I love this project! The team is doing an amazing job.",
            "This is terrible. I've lost all my money because of this.",
            "The market seems stable today. No major changes."
        ]
        
        results = await analyzer.analyze_multiple(texts)
        for text, result in zip(texts, results):
            print(f"Text: {text}")
            print(f"Sentiment: {result['sentiment']}")
            print(f"Confidence: {result['confidence']}")
            print(f"Explanation: {result['explanation']}")
            print()
    
    asyncio.run(test_sentiment())
