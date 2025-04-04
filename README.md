- alembic revision --autogenerate -m "add model xyz"
- alembic upgrade head
- docker compose up



# CeloAIFund

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
2. Run `docker-compose up -d` to start the PostgreSQL database
3. Install dependencies with `pip install -r requirements.txt`
4. Run migrations with `alembic upgrade head`
5. Start the application with `uvicorn app.main:app --reload`

## Project Structure

- `app/`: Main application code
- `db/`: Database models and configuration
- `alembic/`: Database migrations
- `agents/`: AI agent definitions and logic
- `blockchain/`: Celo blockchain integration

### User project description:

we are going to create a project that will use ai agents and web3 blockchain technology. the requirements for the project are the following:
"""
Build any AI agent on Celo focused on real world use cases.
Examples:
- Microloans
- ReFi
- DeFi
- User Experience
Qualification Requirements
- needs to have a token deployed on Celo or able to transact on Celo
- transactions need to be working
"""

we will focus on creating an ai managed fund, similar to daos.fun ai16z. this is what ai16z does on a high level
"""
The ai16z DAO operates on the daos.fun platform, which is a Solana-based platform designed to enable the creation and management of decentralized autonomous organizations (DAOs) for meme-focused funds. Here's how it works:
How daos.fun Works
Fundraising Stage:
Creators (who must be invited or approved) set a fundraising goal in SOL (Solana tokens) and a time limit, typically one week.
Contributors can invest in exchange for DAO tokens, which represent a share in the fund.
If the goal is not met, contributors can redeem their SOL, though early redemption incurs a 10% penalty.
Operational Stage:
Once fundraising is successful, creators use the collected funds to invest in meme tokens or other assets within the Solana ecosystem.
The value of DAO tokens fluctuates based on the fund's performance and market dynamics. Notably, the downside of token prices is capped at the original fundraising amount.
DAO tokens can be traded on secondary markets during this phase.
Redemption Stage:
At the fund's expiration (typically 3 months to 1 year), the DAO wallet is frozen, and profits are distributed to token holders.
Investors can redeem their underlying assets by burning their DAO tokens or selling them if the market value exceeds the initial fundraising amount.
Key Features of ai16z on daos.fun
Transparency: All fund activities and holdings are publicly visible, and creators link their social accounts to enhance trust.
Fair Pricing: All contributors purchase DAO tokens at the same price during fundraising.
AI Integration: ai16z leverages AI for investment decisions and community engagement. Token holders can influence decisions via Discord, with AI tracking and rewarding valuable contributions proportionally.
Focus Areas: ai16z invests in early-stage AI companies across diverse sectors such as robotics, healthcare automation, crypto, fintech disruption, and more.
"""

we will create our own system using
- FastAPI: to enable an api to call functions
- Postgresql: python postgresql to save data
- Langgraph: for agentic behavior, leveraging openai models
- Infrastructure: Docker + Docker compose

below is an example of how fastapi + postgresql looks like

```
postgres-fastapi/
├── README.md                  # Project documentation
├── alembic/                   # Database migration configuration and scripts
│   ├── README
│   ├── env.py                 # Alembic environment configuration
│   ├── script.py.mako         # Template for migration scripts
│   └── versions/              # Directory for migration version scripts
│       └── a52db8c61c6c_adding_users_model.py  # Migration script for users model
├── alembic.ini                # Alembic configuration file
├── app/                       # Main application directory
│   ├── __init__.py
│   ├── main.py                # FastAPI application entry point
│   ├── types.py               # Pydantic models for data validation
│   └── users/                 # User-related modules
│       ├── __init__.py
│       ├── routes.py          # User API endpoints
│       └── users.py           # User business logic
├── db/                        # Database-related modules
│   ├── __init__.py
│   ├── main.py                # Database configuration
│   └── models.py              # SQLAlchemy models
├── docker-compose.yml         # Docker Compose configuration for PostgreSQL
├── pyproject.toml             # Project metadata and dependencies (Rye)
├── requirements-dev.lock      # Locked development dependencies
├── requirements.lock          # Locked production dependencies
├── scripts/                   # Utility scripts
│   └── create_user.py         # Script to create a user
├── src/                       # Source directory for potential package distribution
│   └── postgres_fastapi/
│       └── __init__.py
└── test/                      # Test directory
    ├── __init__.py
    ├── conftest.py            # Test configuration and fixtures
    └── test_users.py          # User-related tests 
```

we will manage migrations with alembic.