from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from agents import run_roma_for_abi, run_roma_for_selectors

app = FastAPI(title="ROMA Contract Explainer Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AbiPayload(BaseModel):
    mode: str = Field("abi", pattern="^(abi|selectors)$")
    address: str
    chainId: str
    abi: Optional[List[dict]] = None
    metadata: Optional[dict] = None
    selectors: Optional[List[str]] = None
    candidates: Optional[Dict[str, List[str]]] = None

@app.get("/health")
def health():
    return {"ok": True, "service": "ROMA Contract Explainer"}

@app.post("/explain")
def explain(p: AbiPayload):
    if p.mode == "abi" and p.abi:
        return run_roma_for_abi(p.abi, p.address)
    if p.mode == "selectors" and p.candidates:
        return run_roma_for_selectors(p.candidates)
    return {"summary": "No content to analyze"}
