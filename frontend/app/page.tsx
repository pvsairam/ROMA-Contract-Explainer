"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, Button, Input, Select, StatusIndicator, LogsViewer } from "../components/ui";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Summary = {
  source: "sourcify" | "blockscout" | "rpc";
  address: string;
  chainId: string;
  abi?: any[];
  summary?: string;
  bytecodePreview?: string;
  selectors?: string[];
  candidates?: Record<string, string[]>;
  roma?: {
    source: string;
    summary?: string;
  };
};

export default function Page() {
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState("1");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [romaStatus, setRomaStatus] = useState<"online" | "offline" | "checking">("checking");

  useEffect(() => {
    async function checkRomaStatus() {
      try {
        const res = await fetch("/api/roma-health", { signal: AbortSignal.timeout(3000) });
        const data = await res.json();
        setRomaStatus(data.status === "online" ? "online" : "offline");
      } catch {
        setRomaStatus("offline");
      }
    }
    checkRomaStatus();
    const interval = setInterval(checkRomaStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  async function onExplain() {
    setError(null);
    setData(null);
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError("Please enter a valid EVM address");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, chainId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch");
      setData(json);
    } catch (e:any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function downloadJSON() {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.address}-${data.chainId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl space-y-6 md:space-y-8">
        <header className="text-center space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            ROMA Contract Explainer
          </motion.h1>
          <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto">
            Paste any EVM contract address. Get instant, easy-to-understand explanations.
          </p>
          <StatusIndicator status={romaStatus} />
        </header>

        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input placeholder="0x..." value={address} onChange={(e)=>setAddress(e.target.value)} />
            </div>
            <div className="w-full sm:w-40">
              <Select value={chainId} onChange={setChainId} />
            </div>
            <Button onClick={onExplain} disabled={loading} className="w-full sm:w-32">
              {loading ? "Explaining..." : "Explain"}
            </Button>
          </div>
          {loading && <div className="w-full h-2 rounded shimmer" />}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </Card>

        {data && (
          <div className="space-y-4 md:space-y-6">
            <Card>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-bold">Contract Overview</h2>
                {data.roma?.source === "roma" && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                    <span className="text-xs font-semibold text-purple-700">AI Powered by ROMA</span>
                  </div>
                )}
              </div>
              
              <div className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-slate-500">Source:</span>
                    <span className="ml-2 font-medium capitalize">{data.source}</span>
                  </div>
                  <div className="sm:col-span-2 break-all">
                    <span className="text-slate-500">Address:</span>
                    <span className="ml-2 font-mono text-xs">{data.address}</span>
                  </div>
                </div>
              </div>

              {data.summary && (
                <div className="prose prose-sm md:prose-base max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {data.summary}
                  </ReactMarkdown>
                </div>
              )}
              
              {data.bytecodePreview && (
                <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="font-medium text-sm mb-2">Bytecode Preview</p>
                  <code className="block text-xs font-mono break-all text-slate-600">{data.bytecodePreview}</code>
                </div>
              )}
            </Card>

            {data.abi && (
              <Card>
                <h3 className="text-lg md:text-xl font-bold mb-4">Functions</h3>
                <div className="space-y-3 max-h-[400px] overflow-auto pr-2 scrollbar-thin">
                  {data.abi.filter((x:any)=>x.type==="function").map((f:any, i:number)=>(
                    <div key={i} className="border-l-4 border-indigo-400 rounded-r-lg p-3 bg-gradient-to-r from-white to-indigo-50/50 hover:shadow-md transition-shadow">
                      <div className="font-semibold text-slate-800">{f.name}</div>
                      <div className="text-xs md:text-sm text-slate-600 mt-1">
                        <span className="font-medium">Inputs:</span> {(f.inputs||[]).map((p:any)=>`${p.type} ${p.name}`).join(", ") || "none"}
                      </div>
                      <div className="text-xs mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          f.stateMutability === "view" || f.stateMutability === "pure" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-orange-100 text-orange-700"
                        }`}>
                          {f.stateMutability}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {data.abi && (
              <Card>
                <h3 className="text-lg md:text-xl font-bold mb-4">Events</h3>
                <div className="space-y-3">
                  {data.abi.filter((x:any)=>x.type==="event").map((e:any, i:number)=>(
                    <div key={i} className="border-l-4 border-purple-400 rounded-r-lg p-3 bg-gradient-to-r from-white to-purple-50/50 hover:shadow-md transition-shadow">
                      <div className="font-semibold text-slate-800">{e.name}</div>
                      <div className="text-xs md:text-sm text-slate-600 mt-1">
                        <span className="font-medium">Parameters:</span> {(e.inputs||[]).map((p:any)=>`${p.type} ${p.name}`).join(", ") || "none"}
                      </div>
                    </div>
                  ))}
                  {data.abi.filter((x:any)=>x.type==="event").length===0 && (
                    <p className="text-slate-500 text-sm italic">No events found in this contract.</p>
                  )}
                </div>
              </Card>
            )}

            {!data.abi && data.selectors && (
              <Card>
                <h3 className="text-lg md:text-xl font-bold mb-4">Inferred Function Selectors</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.selectors.map((s, i)=>(
                    <div key={i} className="border rounded-lg p-3 bg-gradient-to-br from-white to-slate-50 hover:shadow-md transition-shadow">
                      <div className="font-mono text-sm font-semibold text-indigo-600">{s}</div>
                      <div className="text-xs text-slate-600 mt-1">
                        <span className="font-medium">Matches:</span> {(data.candidates?.[s]||[]).join(", ") || "unknown"}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={downloadJSON}>📥 Download JSON</Button>
              <LogsViewer />
            </div>
          </div>
        )}

        <footer className="pt-8 md:pt-12 pb-4 text-center text-xs md:text-sm text-slate-500">
          Built with &lt;3 by <a className="underline hover:text-indigo-600 transition-colors" href="https://x.com/xtestnet" target="_blank" rel="noreferrer">xtestnet</a>
        </footer>
      </div>
    </main>
  );
}
