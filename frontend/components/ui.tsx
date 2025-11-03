"use client";
import { motion } from "framer-motion";
import { useState } from "react";

function cn(...cls: any[]) {
  return cls.filter(Boolean).join(" ");
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      className={cn("glass p-6", className)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "rounded-lg px-4 py-2 font-medium border",
        "bg-white hover:bg-mist border-soft-gray text-ink",
        "shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        props.className
      )}
    />
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-lg border px-3 py-2",
        "bg-white/90 border-soft-gray placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-soft-blue"
      )}
    />
  );
}

export function Select({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { k: "1", v: "Ethereum" },
    { k: "8453", v: "Base" },
    { k: "10", v: "Optimism" },
    { k: "137", v: "Polygon" },
    { k: "42161", v: "Arbitrum" }
  ];
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border bg-white/90 px-3 py-2 border-soft-gray focus:outline-none focus:ring-2 focus:ring-soft-blue"
    >
      {options.map(o => <option key={o.k} value={o.k}>{o.v}</option>)}
    </select>
  );
}

export function StatusIndicator({ status }: { status: "online" | "offline" | "checking" }) {
  const statusConfig = {
    online: { color: "bg-green-500", text: "ROMA Online", ringColor: "ring-green-400" },
    offline: { color: "bg-red-500", text: "ROMA Offline", ringColor: "ring-red-400" },
    checking: { color: "bg-yellow-500", text: "Checking...", ringColor: "ring-yellow-400" }
  };
  
  const config = statusConfig[status];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200 shadow-sm"
    >
      <div className="relative">
        <div className={cn("w-2.5 h-2.5 rounded-full", config.color)} />
        {status === "online" && (
          <div className={cn("absolute inset-0 rounded-full animate-ping", config.color, "opacity-75")} />
        )}
      </div>
      <span className="text-xs font-medium text-slate-700">{config.text}</span>
    </motion.div>
  );
}

export function LogsViewer() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch("/api/roma-health");
      const data = await res.json();
      setLogs([
        `[${new Date().toLocaleTimeString()}] Health check: ${JSON.stringify(data)}`,
        `[${new Date().toLocaleTimeString()}] Service status: ${data.status === 'online' ? 'Online ✓' : 'Offline ✗'}`,
        `[${new Date().toLocaleTimeString()}] Response: ${res.ok ? 'Success' : 'Failed'}`
      ]);
    } catch (e: any) {
      setLogs([
        `[${new Date().toLocaleTimeString()}] Error: ${e.message}`,
        `[${new Date().toLocaleTimeString()}] ROMA service may be offline`
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchLogs();
        }}
        className="w-full sm:w-auto"
      >
        🔍 {isOpen ? "Hide" : "View"} ROMA Logs
      </Button>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl shadow-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">ROMA Service Logs</h3>
              <div className="flex gap-2">
                <button
                  onClick={fetchLogs}
                  disabled={loading}
                  className="px-3 py-1 text-sm bg-indigo-100 hover:bg-indigo-200 rounded-lg text-indigo-700 font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-green-400 min-h-[200px] max-h-[400px] overflow-auto">
              {logs.length === 0 && <div className="text-slate-500">No logs yet. Click Refresh to fetch logs.</div>}
              {logs.map((log, i) => (
                <div key={i} className="mb-1">{log}</div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> ROMA service runs on port 8000. Check workflow logs in Replit for detailed service logs.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
