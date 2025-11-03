# ROMA Contract Explainer

A light, elegant Next.js 15 app that explains any EVM smart contract with a hybrid data pipeline.

## Sources
1. Sourcify metadata and ABI
2. Blockscout ABI
3. Public RPC bytecode with selector inference and 4byte enrichment

## Quick start
```bash
npm install
npm run dev
```

## Deploy on Vercel
- Push to GitHub and import in Vercel. No changes needed.
- Optional: set WEB3_STORAGE_TOKEN for future IPFS upload feature.

## Notes
- No Etherscan dependency.
- Server caches responses with LRU for speed.
- Extend supported chains by editing BLOCKSCOUT_BY_CHAIN in lib/sources.ts.
