from typing import Any, Dict, List, Optional
from contract_registry import get_contract_info, is_known_contract
import os

try:
    import dspy
    from openai import OpenAI
    
    # Initialize DSPy with OpenAI
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        lm = dspy.LM('openai/gpt-4o-mini', api_key=openai_api_key)
        dspy.configure(lm=lm)
        ROMA_AVAILABLE = True
        print("✅ ROMA (DSPy + OpenAI) initialized successfully")
    else:
        ROMA_AVAILABLE = False
        print("⚠️  OPENAI_API_KEY not found, using fallback mode")
except Exception as e:
    ROMA_AVAILABLE = False
    print(f"⚠️  ROMA not available: {e}, using fallback mode")

def _abi_summary(abi: List[dict], address: Optional[str] = None) -> Dict[str, Any]:
    fx = [x for x in abi if x.get("type") == "function"]
    ev = [x for x in abi if x.get("type") == "event"]
    write = [x for x in fx if x.get("stateMutability") not in ("view","pure")]
    read = [x for x in fx if x.get("stateMutability") in ("view","pure")]
    
    # Check if this is a known contract first
    if address:
        contract_info = get_contract_info(address)
        if contract_info:
            # Build summary using known contract info
            function_explanation = f"\n\n**Functions Breakdown:**\n"
            function_explanation += f"- **{len(read)} Read-Only Functions**: These let you check information without changing anything (like checking your bank balance).\n"
            function_explanation += f"- **{len(write)} State-Changing Functions**: These actually modify the contract's data (like making a purchase or transfer).\n"
            function_explanation += f"- **{len(ev)} Events**: These are notifications that the contract emits when important things happen (like transaction receipts)."
            
            summary = f"**Contract Name**: {contract_info['name']}\n\n"
            summary += f"**Contract Type**: {contract_info['type']}\n\n"
            summary += contract_info['description']
            summary += function_explanation
            summary += "\n\n**Verification**: ✅ This is a verified, well-known contract used by millions."
            
            return {"summary": summary}
    
    # Detect common patterns for unknown contracts
    has_owner = any("owner" in (x.get("name","").lower()) for x in fx)
    has_pause = any("pause" in (x.get("name","").lower()) for x in fx)
    has_transfer = any("transfer" in (x.get("name","").lower()) for x in fx)
    has_approve = any("approve" in (x.get("name","").lower()) for x in fx)
    has_mint = any("mint" in (x.get("name","").lower()) for x in fx)
    has_burn = any("burn" in (x.get("name","").lower()) for x in fx)
    has_balance = any("balance" in (x.get("name","").lower()) for x in fx)
    has_upgrade = any("upgrade" in (x.get("name","").lower()) for x in fx)
    has_fallback = any(x.get("type") == "fallback" for x in abi)
    has_receive = any(x.get("type") == "receive" for x in abi)
    
    # Advanced pattern detection
    has_swap = any("swap" in (x.get("name","").lower()) for x in fx)
    has_liquidity = any("liquidity" in (x.get("name","").lower()) for x in fx)
    has_fulfill = any("fulfill" in (x.get("name","").lower()) for x in fx)
    has_match = any("match" in (x.get("name","").lower()) for x in fx)
    has_deposit = any("deposit" in (x.get("name","").lower()) for x in fx)
    has_borrow = any("borrow" in (x.get("name","").lower()) for x in fx)
    has_repay = any("repay" in (x.get("name","").lower()) for x in fx)
    has_stake = any("stake" in (x.get("name","").lower()) for x in fx)
    has_token_uri = any("tokenuri" in (x.get("name","").lower()) for x in fx)
    has_owner_of = any("ownerof" in (x.get("name","").lower()) for x in fx)
    
    # Enhanced contract type detection with priority order
    contract_type = "Smart Contract"
    type_explanation = ""
    
    # Check for specific DeFi/Web3 patterns first (more specific)
    if has_fulfill or has_match:
        contract_type = "NFT Marketplace or Trading Protocol"
        type_explanation = "This appears to be a marketplace contract that facilitates trading between buyers and sellers. It matches orders and handles the exchange of NFTs or tokens, similar to how eBay matches buyers with sellers but in a decentralized way."
    elif has_swap and has_liquidity:
        contract_type = "DEX (Decentralized Exchange)"
        type_explanation = "This is a decentralized exchange contract that allows users to swap tokens and provide liquidity. Think of it as an automated currency exchange where users can trade one cryptocurrency for another without a middleman."
    elif has_swap:
        contract_type = "DEX Router or Trading Contract"
        type_explanation = "This contract facilitates token swaps - trading one cryptocurrency for another. It's like a currency exchange service but fully automated and decentralized."
    elif has_borrow and has_repay and has_deposit:
        contract_type = "Lending/Borrowing Protocol"
        type_explanation = "This is a lending protocol where users can deposit crypto to earn interest or borrow against their deposits. Think of it as a decentralized bank where you can be both the lender and borrower."
    elif has_stake:
        contract_type = "Staking Contract"
        type_explanation = "This contract allows users to stake (lock up) their tokens to earn rewards over time. It's similar to a savings account where you earn interest for keeping your money deposited."
    elif has_token_uri and has_owner_of:
        contract_type = "NFT Contract (ERC-721)"
        type_explanation = "This is an NFT contract that manages unique digital items - each token is one-of-a-kind. Think of it like a certificate of authenticity for digital collectibles, art, or game items."
    elif has_transfer and has_approve and has_balance:
        contract_type = "Token Contract (ERC-20)"
        type_explanation = "This is a digital token contract, similar to a digital currency or asset. It allows users to own, send, and receive tokens. Think of it like a bank ledger that tracks who owns what."
    elif has_upgrade:
        contract_type = "Proxy or Upgradeable Contract"
        type_explanation = "This is a proxy contract that can be upgraded. Think of it as a forwarding address - it points to another contract that contains the actual logic, allowing the developers to fix bugs or add features without changing the address."
    elif has_fallback or has_receive:
        contract_type = "Wallet or Payment Contract"
        type_explanation = "This contract can receive cryptocurrency payments directly. It acts like a smart wallet that can hold and manage funds."
    elif has_owner and has_pause:
        contract_type = "Managed Contract"
        type_explanation = "This contract has an administrator who can control certain functions and even pause operations if needed. Think of it like a business with a manager who has special permissions."
    elif has_owner:
        contract_type = "Owned Contract"
        type_explanation = "This contract has an owner with special privileges. The owner can perform administrative actions that regular users cannot."
    
    # Build detailed capabilities description
    capabilities = []
    capability_explanations = []
    
    if has_transfer:
        capabilities.append("transfers")
        capability_explanations.append("**Transfers**: Users can send tokens or assets to other addresses, like sending money to a friend.")
    
    if has_approve:
        capabilities.append("approvals")
        capability_explanations.append("**Approvals**: Users can give permission to other contracts or addresses to spend their tokens on their behalf, like authorizing a subscription payment.")
    
    if has_mint:
        capabilities.append("minting")
        capability_explanations.append("**Minting**: New tokens can be created. This is like a central bank printing money, though typically only authorized users can do this.")
    
    if has_burn:
        capabilities.append("burning")
        capability_explanations.append("**Burning**: Tokens can be permanently destroyed, reducing the total supply. This is like shredding cash - it's gone forever.")
    
    if has_owner:
        capabilities.append("ownership controls")
        capability_explanations.append("**Ownership**: Special administrative functions are restricted to the contract owner for security and governance.")
    
    if has_pause:
        capabilities.append("emergency pause")
        capability_explanations.append("**Emergency Pause**: The contract can be paused in case of security issues or emergencies, freezing all operations temporarily.")
    
    if has_upgrade:
        capabilities.append("upgradeability")
        capability_explanations.append("**Upgradeability**: The contract logic can be updated or improved over time without changing the contract address.")
    
    # Function breakdown explanation
    function_explanation = f"\n\n**Functions Breakdown:**\n"
    function_explanation += f"- **{len(read)} Read-Only Functions**: These let you check information without changing anything (like checking your bank balance).\n"
    function_explanation += f"- **{len(write)} State-Changing Functions**: These actually modify the contract's data (like making a purchase or transfer).\n"
    function_explanation += f"- **{len(ev)} Events**: These are notifications that the contract emits when important things happen (like transaction receipts)."
    
    # Security considerations
    security_notes = "\n\n**What to Watch For:**\n"
    if has_owner and not has_pause:
        security_notes += "• This contract has an owner with special powers. Make sure you trust who controls it.\n"
    if has_mint and not has_owner:
        security_notes += "• Anyone might be able to create new tokens - verify the minting restrictions.\n"
    if has_upgrade:
        security_notes += "• This contract can be upgraded. The owner could potentially change how it works in the future.\n"
    if len(write) > len(read) * 2:
        security_notes += "• This contract has many state-changing functions. Review what each one does before interacting.\n"
    if not ev:
        security_notes += "• This contract doesn't emit events, making it harder to track what happens on-chain.\n"
    if not security_notes.strip().endswith(":"):
        security_notes += "\n"
    security_notes += "• Always verify the contract is from a trusted source before sending money or signing transactions."
    
    # Build the comprehensive summary
    summary_parts = [
        f"**Contract Type**: {contract_type}",
        f"\n{type_explanation}",
        function_explanation
    ]
    
    if capability_explanations:
        summary_parts.append("\n\n**Key Capabilities:**")
        for cap_exp in capability_explanations:
            summary_parts.append(f"\n{cap_exp}")
    
    summary_parts.append(security_notes)
    
    return {"summary": "".join(summary_parts)}

def _selector_summary(candidates: Dict[str, List[str]]) -> Dict[str, Any]:
    flat = []
    for sig, cands in candidates.items():
        for c in cands:
            flat.append(c)
    uniq = list(dict.fromkeys(flat))[:12]
    
    if not uniq:
        summary = "**⚠️ Unverified Contract**\n\n"
        summary += "This contract's source code hasn't been verified on block explorers, so we can only analyze its bytecode. "
        summary += "We couldn't find matching function signatures in our database.\n\n"
        summary += "**What this means**: This could be a custom contract, a very new contract, or potentially an obfuscated contract. "
        summary += "**Recommendation**: Exercise extreme caution. Only interact with this contract if you completely trust its source."
        return {"summary": summary}
    
    # Enhanced pattern detection
    has_erc20 = any(s in ["transfer(address,uint256)", "approve(address,uint256)", "balanceOf(address)"] for s in uniq)
    has_erc721 = any(s in ["safeTransferFrom(address,address,uint256)", "ownerOf(uint256)"] for s in uniq)
    has_owner = any("owner" in s.lower() for s in uniq)
    has_pause = any("pause" in s.lower() for s in uniq)
    has_mint = any("mint" in s.lower() for s in uniq)
    has_swap = any("swap" in s.lower() for s in uniq)
    has_stake = any("stake" in s.lower() for s in uniq)
    
    # Determine likely contract type
    contract_hint = ""
    explanation = ""
    
    if has_erc721:
        contract_hint = "NFT Contract (ERC-721)"
        explanation = "This appears to be an NFT contract - it manages unique digital items like art, collectibles, or game items. Each token has a unique ID."
    elif has_erc20:
        contract_hint = "Token Contract (ERC-20)"
        explanation = "This looks like a fungible token contract - it creates a digital currency or token where each unit is identical, like dollars or points."
    elif has_swap:
        contract_hint = "Exchange or DEX Contract"
        explanation = "This appears to be a decentralized exchange contract that allows users to swap between different tokens, like a currency exchange."
    elif has_stake:
        contract_hint = "Staking Contract"
        explanation = "This looks like a staking contract where users can lock up their tokens to earn rewards, similar to a savings account with interest."
    elif has_owner and has_pause:
        contract_hint = "Managed Contract"
        explanation = "This is a contract with administrative controls, allowing an owner to manage operations and pause functionality if needed."
    else:
        contract_hint = "Custom Contract"
        explanation = "This is a custom smart contract with specialized functionality."
    
    # Build comprehensive summary
    summary_parts = [
        "**⚠️ Unverified Contract** (Source code not verified on block explorers)\n",
        f"\n**Likely Type**: {contract_hint}",
        f"\n{explanation}\n",
        f"\n**Detected Functions** (inferred from bytecode):\n"
    ]
    
    # Group functions by purpose for clarity
    for i, func in enumerate(uniq[:8], 1):
        summary_parts.append(f"{i}. `{func}`\n")
    
    if len(uniq) > 8:
        summary_parts.append(f"\n...and {len(uniq) - 8} more functions\n")
    
    summary_parts.append("\n**Important Notes:**\n")
    summary_parts.append("• These function names are **best guesses** based on bytecode signatures - they may not be 100% accurate.\n")
    summary_parts.append("• Without verified source code, we can't see the actual implementation or security measures.\n")
    summary_parts.append("• **Recommendation**: Be extremely cautious. Only interact with unverified contracts if you completely trust the source.\n")
    summary_parts.append("• Consider asking the contract developers to verify the source code on a block explorer like Etherscan.")
    
    return {"summary": "".join(summary_parts)}

def run_roma_for_abi(abi: List[dict], address: Optional[str] = None) -> Dict[str, Any]:
    # PRIORITY ORDER:
    # 1. Contract Registry (famous contracts) - handled before this function
    # 2. Fallback Pattern Detection (FREE) - always try first
    # 3. ROMA AI (COSTS $) - ONLY if fallback gives generic/unhelpful result
    
    # Always try free fallback first
    fallback_result = _abi_summary(abi, address)
    
    # Check if fallback gave us a good result or just generic info
    summary_text = fallback_result.get("summary", "")
    is_generic = (
        "Smart Contract" in summary_text and 
        len(summary_text) < 500  # Short generic response
    )
    
    # Only use AI as LAST RESORT if fallback is too generic AND AI is available
    if is_generic and ROMA_AVAILABLE:
        try:
            print("ℹ️  Fallback too generic, using AI as last resort...")
            class ContractExplainer(dspy.Signature):
                """Explain a smart contract in simple, non-technical language."""
                context = dspy.InputField(desc="Smart contract ABI information")
                explanation = dspy.OutputField(desc="Simple, friendly explanation with formatting")
            
            predictor = dspy.ChainOfThought(ContractExplainer)
            context = f"Analyze this contract with {len(abi)} ABI entries. ABI: {str(abi[:15])}"
            result = predictor(context=context)
            return {"summary": result.explanation, "source": "roma"}
        except Exception as e:
            print(f"⚠️  AI failed: {e}, using fallback anyway")
    
    # Use free fallback (either it's good, or AI isn't available/failed)
    return {**fallback_result, "source": "fallback"}

def run_roma_for_selectors(candidates: Dict[str, List[str]]) -> Dict[str, Any]:
    # PRIORITY ORDER:
    # 1. Contract Registry (famous contracts) - handled before this function
    # 2. Fallback Pattern Detection (FREE) - always try first
    # 3. ROMA AI (COSTS $) - ONLY if fallback gives generic/unhelpful result
    
    # Always try free fallback first
    fallback_result = _selector_summary(candidates)
    
    # Check if fallback gave us useful pattern detection or just generic warning
    summary_text = fallback_result.get("summary", "")
    is_generic = (
        "custom smart contract" in summary_text.lower() and
        len(summary_text) < 600  # Short generic response
    )
    
    # Only use AI as LAST RESORT if fallback is too generic AND AI is available
    if is_generic and ROMA_AVAILABLE:
        try:
            print("ℹ️  Fallback too generic for unverified contract, using AI as last resort...")
            flat = []
            for sig, cands in candidates.items():
                for c in cands:
                    flat.append(c)
            uniq = list(dict.fromkeys(flat))[:12]
            
            class UnverifiedContractExplainer(dspy.Signature):
                """Explain an unverified smart contract based on function signatures."""
                functions = dspy.InputField(desc="List of detected function signatures")
                explanation = dspy.OutputField(desc="Simple explanation with security warnings")
            
            predictor = dspy.ChainOfThought(UnverifiedContractExplainer)
            context = f"Functions detected: {', '.join(uniq)}"
            result = predictor(functions=context)
            return {"summary": result.explanation, "source": "roma"}
        except Exception as e:
            print(f"⚠️  AI failed: {e}, using fallback anyway")
    
    # Use free fallback (either it's good, or AI isn't available/failed)
    return {**fallback_result, "source": "fallback"}
