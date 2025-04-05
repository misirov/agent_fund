from typing import Dict, List, Union, Optional, Any
from openai import OpenAI
from pydantic import BaseModel
import os
import logging

logger = logging.getLogger(__name__)

class TextInformation(BaseModel):
    protocol_name: str | None
    sentiment_score: float | None  # -1.0 to 1.0
    confidence: float | None
    technical_indicators: list[str] | None
    risk_assessment: str | None
    community_consensus: float | None  # 0.0 to 1.0

class SentimentAnalyzer:
    """
    A class for analyzing sentiment in text using OpenAI's API.
    """
    def __init__(self, api_key: str, model:str):
        self.api_key = api_key
        self.model = model
        if not self.api_key:
            raise ValueError("OpenAI API key not provided and OPENAI_API_KEY environment variable not set")
        
        self.client = OpenAI(api_key=self.api_key)

    def analyze_message(self, message: str, structure: Any):
        system_instructions = """
        You are acting as a crypto investment analyst. Extract information from messages related to:
        1. Protocol/token mentions and their context
        2. Sentiment (positive/negative/neutral)
        3. Technical analysis indicators
        4. Risk assessments
        5. Community consensus
        
        Provide a sentiment score from -1.0 (very negative) to 1.0 (very positive).
        Analysis must be short and concise, capturing the essence of the message.
        """
        
        response = self.client.beta.chat.completions.parse(
            model=self.model,
            messages=[
                {"role": "system", "content": system_instructions},
                {"role": "user", "content": message},
            ],
            response_format=structure,
        )

        return response.choices[0].message.parsed






if __name__ == "__main__":


    sa = SentimentAnalyzer(
        api_key=os.getenv("OPENAI_API_KEY"),
        model="gpt-4o-2024-08-06"
    )

    res = sa.analyze_message("morho is a great protocol, its TVL is 1b, we should invest in it", structure=TextInformation)
    print(res)