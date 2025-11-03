import ky from "ky";

const BLOCKSCOUT_BY_CHAIN: Record<string, string> = {
  "1": "https://eth.blockscout.com",
  "8453": "https://base.blockscout.com",
  "10": "https://optimism.blockscout.com",
  "137": "https://polygon.blockscout.com",
  "42161": "https://arbitrum.blockscout.com"
};

export async function trySourcify(chainId: string, address: string) {
  try {
    const res = await ky.get(
      `https://repo.sourcify.dev/contracts/full_match/${chainId}/${address}/metadata.json`,
      { timeout: 5000 }
    );
    if (res.ok) {
      const meta = await res.json<any>();
      const abi = meta?.output?.abi;
      if (abi) return { source: "sourcify", abi, metadata: meta };
    }
  } catch {}
  return null;
}

export async function tryBlockscout(chainId: string, address: string) {
  const base = BLOCKSCOUT_BY_CHAIN[chainId];
  if (!base) return null;
  try {
    const url = `${base}/api?module=contract&action=getabi&address=${address}`;
    const res = await ky.get(url, { timeout: 6000 }).json<any>();
    if (res?.status === "1" && res?.result) {
      return { source: "blockscout", abi: JSON.parse(res.result) };
    }
  } catch {}
  return null;
}

export async function fetchBytecode(chainId: string, address: string) {
  const RPCS: Record<string, string[]> = {
    "1": ["https://eth.llamarpc.com", "https://cloudflare-eth.com"],
    "8453": ["https://mainnet.base.org"],
    "10": ["https://mainnet.optimism.io"],
    "137": ["https://polygon-rpc.com"],
    "42161": ["https://arb1.arbitrum.io/rpc"]
  };
  const endpoints = RPCS[chainId] || RPCS["1"];
  for (const rpc of endpoints) {
    try {
      const json = await ky.post(rpc, {
        timeout: 6000,
        json: { jsonrpc: "2.0", id: 1, method: "eth_getCode", params: [address, "latest"] }
      }).json<any>();
      const code = json?.result;
      if (code && code !== "0x") return { source: "rpc", bytecode: code, rpc };
    } catch {}
  }
  return null;
}

export async function enrichSelectors(shaSigs: string[]) {
  const out: Record<string,string[]> = {};
  for (const sig of shaSigs.slice(0, 32)) {
    try {
      const res = await ky.get(
        `https://www.4byte.directory/api/v1/signatures/?hex_signature=${sig}`,
        { timeout: 5000 }
      ).json<any>();
      out[sig] = res?.results?.map((r:any) => r.text_signature).slice(0, 3) || [];
    } catch {
      out[sig] = [];
    }
  }
  return out;
}
