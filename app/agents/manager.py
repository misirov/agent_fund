from web3 import Web3
import json
import os

# Connect to Anvil
RPC_URL = "http://127.0.0.1:8545"
web3 = Web3(Web3.HTTPProvider(RPC_URL))

# Check connection
if web3.is_connected():
    print(f"Connected to {RPC_URL}")
    print(f"Current block number: {web3.eth.block_number}")
else:
    print(f"Failed to connect to {RPC_URL}")
    exit(1)

# Contract details
FUND_ADDRESS = "0xA15BB66138824a1c7167f5E85b957d04Dd34E468"
FUND_ADDRESS = web3.to_checksum_address(FUND_ADDRESS)

# Load ABI from file
script_dir = os.path.dirname(os.path.abspath(__file__))
abi_path = os.path.join(script_dir, '../../frontend/src/fund_abi.json')

with open(abi_path, 'r') as f:
    fund_abi = json.load(f)

# Create contract instance
fund_contract = web3.eth.contract(address=FUND_ADDRESS, abi=fund_abi)

# Check if contract exists
code = web3.eth.get_code(FUND_ADDRESS)
if code == b'':
    print(f"No contract found at address {FUND_ADDRESS}")
    exit(1)
else:
    print(f"Contract exists at address {FUND_ADDRESS}")

# Try to call contract functions
try:
    # Get contract functions
    functions = [func for func in dir(fund_contract.functions) if not func.startswith('_')]
    print(f"Available functions: {functions}")
    
    # Try to call totalSupply
    try:
        total_supply = fund_contract.functions.totalSupply().call()
        print(f"Total Supply: {web3.from_wei(total_supply, 'ether')} ETH")
    except Exception as e:
        print(f"Error calling totalSupply: {e}")
    
    # Try to call totalShares
    try:
        total_shares = fund_contract.functions.totalShares().call()
        print(f"Total Shares: {web3.from_wei(total_shares, 'ether')} shares")
    except Exception as e:
        print(f"Error calling totalShares: {e}")
    
    # Try to call owner
    try:
        owner = fund_contract.functions.owner().call()
        print(f"Owner: {owner}")
    except Exception as e:
        print(f"Error calling owner: {e}")
    
    # Try to call token
    try:
        token = fund_contract.functions.token().call()
        print(f"Token: {token}")
    except Exception as e:
        print(f"Error calling token: {e}")
    
    # Get past events
    try:
        # Get block range
        latest_block = web3.eth.block_number
        from_block = max(0, latest_block - 10000)
        
        # Get deposit events
        deposit_events = fund_contract.events.sharesMinted.get_logs(fromBlock=from_block, toBlock='latest')
        print(f"Found {len(deposit_events)} deposit events")
        
        for event in deposit_events[:5]:  # Show first 5 events
            print(f"Deposit: {event['args']}")
        
        # Get withdrawal events
        withdraw_events = fund_contract.events.withdrawnShares.get_logs(fromBlock=from_block, toBlock='latest')
        print(f"Found {len(withdraw_events)} withdrawal events")
        
        for event in withdraw_events[:5]:  # Show first 5 events
            print(f"Withdrawal: {event['args']}")
    except Exception as e:
        print(f"Error getting events: {e}")

except Exception as e:
    print(f"Error interacting with contract: {e}") 