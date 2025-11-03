# ROMA Service

A FastAPI microservice that integrates Sentient's ROMA (Recursive Open Meta-Agent) framework to provide AI-powered smart contract explanations.

## Features

- FastAPI REST API with `/explain` endpoint
- Integrates with ROMA for natural language contract analysis
- Fallback to heuristic analysis when ROMA is unavailable
- CORS-enabled for cross-origin requests
- Health check endpoint at `/health`

## Quick Start

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Optional: Install ROMA (requires git)
pip install git+https://github.com/sentient-agi/ROMA.git

# Run the service
python -m uvicorn main:app --reload --port 8001
```

The service will be available at `http://localhost:8001`

- API docs: `http://localhost:8001/docs`
- Health check: `http://localhost:8001/health`

### Deploy to Replit

1. Create a new Python Repl
2. Upload these files
3. Run: `python -m uvicorn main:app --host 0.0.0.0 --port 8001`
4. Copy the deployment URL

### Deploy to Render/Fly/Railway

```bash
# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --host 0.0.0.0 --port $PORT
```

## Integration with Next.js UI

Set the environment variable in your Next.js app:

```bash
ROMA_API_BASE=https://your-roma-service.onrender.com
```

## API Usage

### POST /explain

Analyze a smart contract and return a natural language explanation.

**Request Body:**

```json
{
  "mode": "abi",
  "address": "0x...",
  "chainId": "1",
  "abi": [...]
}
```

or

```json
{
  "mode": "selectors",
  "address": "0x...",
  "chainId": "1",
  "selectors": ["0x12345678"],
  "candidates": {
    "0x12345678": ["transfer(address,uint256)"]
  }
}
```

**Response:**

```json
{
  "summary": "This appears to be a Token Contract with 15 functions...",
  "source": "roma"
}
```

## Architecture

```
Next.js API → ROMA Service → ROMA Framework
                    ↓
         Natural Language Explanation
```

## ROMA Integration

When ROMA is available, the service uses it to generate intelligent, context-aware contract explanations. When unavailable, it falls back to rule-based heuristics.

## Credits

Built with:
- [Sentient ROMA](https://github.com/sentient-agi/ROMA)
- FastAPI
- Uvicorn
