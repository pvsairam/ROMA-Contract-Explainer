"""
Registry of well-known smart contracts with their metadata.
This helps provide accurate contract type detection for popular protocols.
"""

from typing import Dict, Optional

KNOWN_CONTRACTS: Dict[str, Dict[str, str]] = {
    # OpenSea
    "0x00000000000000adc04c56bf30ac9d3c0aaf14dc": {
        "name": "OpenSea Seaport",
        "type": "NFT Marketplace Protocol",
        "description": "OpenSea's decentralized NFT marketplace contract. It enables buying, selling, and trading NFTs with advanced features like Dutch auctions, bundle sales, and criteria-based offers. Think of it as the engine that powers NFT trades on OpenSea - it handles the complex logic of matching buyers with sellers and transferring assets securely."
    },
    
    # Uniswap
    "0x7a250d5630b4cf539739df2c5dacb4c659f2488d": {
        "name": "Uniswap V2 Router",
        "type": "DEX Router (Decentralized Exchange)",
        "description": "The main entry point for trading tokens on Uniswap V2. It's like a smart trading assistant that finds the best path to swap one token for another, calculates prices, and executes trades. This is what most users interact with when they use Uniswap."
    },
    "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45": {
        "name": "Uniswap V3 Router 2",
        "type": "DEX Router (Decentralized Exchange)",
        "description": "Advanced router for Uniswap V3 with improved efficiency and multi-hop swapping. It's the upgraded version that handles more complex trading strategies and provides better prices by routing through multiple pools."
    },
    "0x1f98431c8ad98523631ae4a59f267346ea31f984": {
        "name": "Uniswap V3 Factory",
        "type": "DEX Factory Contract",
        "description": "Creates new Uniswap V3 trading pools. Think of it as a pool creator - when someone wants to create a new market for trading two tokens, this contract sets it up. It's like the factory that builds new marketplaces."
    },
    
    # Aave
    "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2": {
        "name": "Aave V3 Pool",
        "type": "Lending Protocol",
        "description": "The core contract for Aave's lending and borrowing platform. Users can deposit cryptocurrency to earn interest or borrow against their deposits. Think of it as a decentralized bank where the community provides the funds and sets the interest rates through supply and demand."
    },
    
    # ENS
    "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e": {
        "name": "ENS Registry",
        "type": "Domain Name Registry",
        "description": "Ethereum Name Service registry that manages .eth domain names. It's like the internet's DNS but for Ethereum - it lets you use 'alice.eth' instead of '0x1234...'. This contract tracks who owns which names and where they point."
    },
    
    # Popular Tokens
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {
        "name": "USDC",
        "type": "Stablecoin (ERC-20 Token)",
        "description": "USD Coin - a stablecoin backed 1:1 by US dollars. Each USDC token represents one US dollar held in reserve. This is an upgradeable proxy contract managed by Circle, meaning they can update the underlying code while keeping the same token address."
    },
    "0xdac17f958d2ee523a2206206994597c13d831ec7": {
        "name": "USDT (Tether)",
        "type": "Stablecoin (ERC-20 Token)",
        "description": "Tether USD - one of the most widely used stablecoins. Like USDC, it aims to maintain a 1:1 peg with the US dollar. This is a proxy contract that can be upgraded by Tether."
    },
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": {
        "name": "Wrapped Ether (WETH)",
        "type": "Wrapped Native Token (ERC-20)",
        "description": "Wrapped ETH allows you to trade ETH like any other ERC-20 token. When you wrap ETH, you deposit native Ethereum and get WETH tokens in return (1:1). Think of it as putting your cash in an envelope so it can go through the same systems as checks."
    },
    "0x514910771af9ca656af840dff83e8264ecf986ca": {
        "name": "Chainlink Token (LINK)",
        "type": "ERC-20 Token",
        "description": "The utility token for Chainlink's decentralized oracle network. LINK is used to pay node operators for retrieving real-world data and bringing it onto the blockchain. It's a standard ERC-20 token with transfer, approval, and balance tracking."
    },
    
    # Popular NFTs
    "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d": {
        "name": "Bored Ape Yacht Club (BAYC)",
        "type": "NFT Collection (ERC-721)",
        "description": "One of the most famous NFT collections. Each Bored Ape is a unique digital art piece that also grants membership to an exclusive community. This ERC-721 contract manages ownership, transfers, and metadata for 10,000 unique apes."
    },
    "0xed5af388653567af2f388e6224dc7c4b3241c544": {
        "name": "Azuki",
        "type": "NFT Collection (ERC-721A)",
        "description": "A popular anime-inspired NFT collection using the ERC-721A standard for gas-efficient batch minting. The contract allows multiple NFTs to be minted in a single transaction, saving significant gas fees compared to standard ERC-721."
    },
    "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb": {
        "name": "CryptoPunks",
        "type": "NFT Collection (Pre-ERC-721)",
        "description": "The original NFT collection that started it all! Created before the ERC-721 standard existed, CryptoPunks uses a custom contract. It's like the vintage car of NFTs - historically significant and highly valuable, but built differently than modern NFTs."
    },
    
    # Multi-chain versions (Base)
    "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": {
        "name": "USDC (Base)",
        "type": "Stablecoin (ERC-20 Token)",
        "description": "USD Coin on Base (Coinbase's Layer 2). Same as Ethereum USDC - a stablecoin backed 1:1 by US dollars, but deployed on the Base network for faster and cheaper transactions."
    },
    
    # Multi-chain versions (Polygon)
    "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359": {
        "name": "USDC (Polygon)",
        "type": "Stablecoin (ERC-20 Token)",
        "description": "USD Coin on Polygon network. Same functionality as Ethereum USDC but on Polygon for lower transaction costs and faster confirmations."
    }
}

def get_contract_info(address: str) -> Optional[Dict[str, str]]:
    """
    Look up a contract by its address (case-insensitive).
    Returns contract metadata if found, None otherwise.
    """
    normalized_address = address.lower()
    return KNOWN_CONTRACTS.get(normalized_address)

def is_known_contract(address: str) -> bool:
    """Check if a contract address is in our registry."""
    return address.lower() in KNOWN_CONTRACTS
