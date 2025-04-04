import os
from openai import OpenAI
from src.models.database import Comment, User, get_db_session

class SentimentAnalyzer:
    def __init__(self, api_key=None):
        self.client = OpenAI(api_key=api_key or os.environ.get("OPENAI_API_KEY"))
        self.db_session = get_db_session()
    
    def analyze_comment(self, username, platform, content):
        """
        Analyze a user comment to determine if it's about a ReFi project and its sentiment.
        
        Args:
            username (str): The username of the commenter
            platform (str): The platform where the comment was made (e.g., "discord")
            content (str): The content of the comment
            
        Returns:
            dict: Analysis results including project name and sentiment score
        """
        # Get or create user
        user = self.db_session.query(User).filter_by(username=username, platform=platform).first()
        if not user:
            user = User(username=username, platform=platform)
            self.db_session.add(user)
            self.db_session.commit()
        
        # Create system prompt for analysis
        system_prompt = """
        You are an AI specialized in analyzing conversations about Regenerative Finance (ReFi) projects.
        Your task is to:
        1. Determine if the comment is discussing a specific ReFi project
        2. If yes, identify the project name
        3. Rate the sentiment toward the project on a scale of 0-10, where:
           - 0-3: Negative sentiment (criticism, concerns, disappointment)
           - 4-6: Neutral sentiment (factual, questioning, balanced)
           - 7-10: Positive sentiment (praise, excitement, optimism)
        
        Respond in JSON format:
        {
            "is_refi_related": true/false,
            "project_name": "Project Name" or null,
            "sentiment_score": 0-10 or null,
            "confidence": 0-1,
            "reasoning": "Brief explanation of your analysis"
        }
        """
        
        # Call OpenAI API
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": content}
            ],
            response_format={"type": "json_object"}
        )
        
        # Parse the response
        analysis = response.choices[0].message.content
        
        try:
            import json
            result = json.loads(analysis)
            
            # Save to database if ReFi related
            if result.get("is_refi_related", False) and result.get("project_name"):
                comment = Comment(
                    user_id=user.id,
                    content=content,
                    project_name=result.get("project_name"),
                    sentiment_score=result.get("sentiment_score")
                )
                self.db_session.add(comment)
                self.db_session.commit()
            
            return result
        except Exception as e:
            print(f"Error parsing analysis: {e}")
            return {
                "is_refi_related": False,
                "error": str(e)
            }
    
    def aggregate_project_sentiment(self, project_name, days=7):
        """
        Calculate the aggregate sentiment for a project over the specified time period.
        
        Args:
            project_name (str): The name of the project
            days (int): Number of days to look back
            
        Returns:
            float: Aggregate sentiment score (0-10)
        """
        from datetime import datetime, timedelta
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        comments = self.db_session.query(Comment).filter(
            Comment.project_name == project_name,
            Comment.created_at >= cutoff_date
        ).all()
        
        if not comments:
            return None
        
        total_score = sum(comment.sentiment_score for comment in comments)
        return total_score / len(comments)