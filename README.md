

# CeloAIFund [Unifinshed]

An AI-managed investment fund built on the Celo blockchain. This project uses AI agents to make investment decisions and manage a decentralized fund similar to ai16z.

## Features

- AI-powered investment decisions on Celo assets
- Token deployment on Celo blockchain
- User contribution and redemption functionality
- Transparent fund management and performance tracking

## Technology Stack

- FastAPI: Backend API framework
- PostgreSQL: Database for storing fund data
- LangGraph: AI agent orchestration with OpenAI models
- Celo Blockchain: For token deployment and transactions
- Docker & Docker Compose: Infrastructure and deployment

## Setup

1. Clone the repository
2. Run `docker compose up` to start all services
3. Install dependencies with `pip install -r requirements.txt`
4. Run migrations with `alembic upgrade head`
5. Start the application with `uvicorn app.main:app --reload`

## Project Structure

- `app/`: Main application code
- `db/`: Database models and configuration
- `alembic/`: Database migrations
- `agents/`: AI agent definitions and logic
- `blockchain/`: Celo blockchain integration
