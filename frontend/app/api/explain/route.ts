import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiCache } from "../../../lib/cache";
import { trySourcify, tryBlockscout, fetchBytecode, enrichSelectors } from "../../../lib/sources";

const Q = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  chainId: z.string().default("1")
});

async function callRoma(payload: any) {
  const base = process.env.ROMA_API_BASE;
  if (!base) return null;
  try {
    const res = await fetch(`${base}/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, chainId } = Q.parse(body);
    const key = `${chainId}:${address.toLowerCase()}`;
    const cached = apiCache.get(key);
    if (cached) return NextResponse.json(cached);

    const s = await trySourcify(chainId, address);
    if (s?.abi) {
      const roma = await callRoma({ mode: "abi", address, chainId, abi: s.abi, metadata: s.metadata });
      const result = {
        source: s.source,
        address,
        chainId,
        abi: s.abi,
        roma: roma ?? null,
        summary: roma?.summary ?? summarizeABI(s.abi)
      };
      apiCache.set(key, result);
      return NextResponse.json(result);
    }

    const b = await tryBlockscout(chainId, address);
    if (b?.abi) {
      const roma = await callRoma({ mode: "abi", address, chainId, abi: b.abi });
      const result = {
        source: b.source,
        address,
        chainId,
        abi: b.abi,
        roma: roma ?? null,
        summary: roma?.summary ?? summarizeABI(b.abi)
      };
      apiCache.set(key, result);
      return NextResponse.json(result);
    }

    const r = await fetchBytecode(chainId, address);
    if (r?.bytecode) {
      const selectors = extractSelectors(r.bytecode);
      const enriched = await enrichSelectors(selectors);
      const roma = await callRoma({ mode: "selectors", address, chainId, selectors, candidates: enriched });
      const result = {
        source: "rpc",
        address,
        chainId,
        bytecodePreview: r.bytecode.slice(0, 120) + "...",
        selectors,
        candidates: enriched,
        roma: roma ?? null,
        summary: roma?.summary ?? summarizeFromSelectors(enriched)
      };
      apiCache.set(key, result);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Contract not found or no data available" }, { status: 404 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 400 });
  }
}

function summarizeABI(abi: any[]): string {
  try {
    const f = abi.filter((x:any)=>x.type==="function");
    const ev = abi.filter((x:any)=>x.type==="event");
    const write = f.filter((x:any)=>x.stateMutability !== "view" && x.stateMutability !== "pure");
    const read = f.filter((x:any)=>x.stateMutability === "view" || x.stateMutability === "pure");
    const hasOwnable = f.some((x:any)=>x.name?.toLowerCase().includes("owner"));
    const hasPausable = f.some((x:any)=>x.name?.toLowerCase().includes("pause"));
    return [
      `Functions total: ${f.length}. Read: ${read.length}. Write: ${write.length}. Events: ${ev.length}.`,
      hasOwnable ? "Ownership functions detected." : "",
      hasPausable ? "Pause or emergency controls detected." : "",
      "Review functions and events below for a clearer idea of purpose."
    ].filter(Boolean).join(" ");
  } catch {
    return "ABI parsed. Explore the sections for details.";
  }
}

function extractSelectors(bytecode: string): string[] {
  const cleaned = bytecode.replace(/^0x/, "");
  const selectors = new Set<string>();
  for (let i=0; i<cleaned.length-10; i+=2) {
    if (cleaned.slice(i, i+2).toLowerCase() === "63") {
      const sig = "0x" + cleaned.slice(i+2, i+10);
      if (/^0x[0-9a-fA-F]{8}$/.test(sig)) selectors.add(sig);
    }
  }
  return Array.from(selectors);
}

function summarizeFromSelectors(map: Record<string,string[]>): string {
  const all = Object.values(map).flat();
  if (all.length === 0) return "Unverified contract. Functions inferred from bytecode. No common signatures found.";
  const known = all.slice(0, 8).join(", ");
  return `Unverified contract. Likely functions include: ${known}. This is a best effort inference from 4byte signatures.`;
}
