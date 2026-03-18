"use client";

import { useState, useEffect } from "react";
import {
  Server, Shield, Activity, Cpu, BarChart3, Settings, RefreshCw,
  Check, X, Copy, ArrowUpRight, Clock, Zap, Database, Terminal
} from "lucide-react";

interface ModelInfo {
  id: string;
  status: "running" | "stopped" | "loading";
  size: string;
  quantization: string;
  requests: number;
  avgLatency: number;
  memoryUsage: number;
}

interface UsageLog {
  timestamp: string;
  model: string;
  tokens: number;
  latency: number;
  endpoint: string;
}

type Tab = "dashboard" | "models" | "api" | "monitoring" | "settings";

const mockModels: ModelInfo[] = [
  { id: "llama3:latest", status: "running", size: "4.7 GB", quantization: "Q4_K_M", requests: 1247, avgLatency: 245, memoryUsage: 4.2 },
  { id: "mistral:latest", status: "running", size: "4.1 GB", quantization: "Q4_K_M", requests: 892, avgLatency: 189, memoryUsage: 3.8 },
  { id: "codellama:latest", status: "stopped", size: "3.8 GB", quantization: "Q4_0", requests: 456, avgLatency: 312, memoryUsage: 0 },
  { id: "phi3:latest", status: "stopped", size: "2.2 GB", quantization: "Q4_K_M", requests: 234, avgLatency: 125, memoryUsage: 0 },
];

const mockLogs: UsageLog[] = [
  { timestamp: "2024-03-15 14:23:01", model: "llama3:latest", tokens: 1250, latency: 234, endpoint: "/v1/chat/completions" },
  { timestamp: "2024-03-15 14:22:45", model: "mistral:latest", tokens: 890, latency: 178, endpoint: "/v1/chat/completions" },
  { timestamp: "2024-03-15 14:22:12", model: "llama3:latest", tokens: 2100, latency: 456, endpoint: "/v1/chat/completions" },
  { timestamp: "2024-03-15 14:21:58", model: "llama3:latest", tokens: 340, latency: 89, endpoint: "/v1/embeddings" },
  { timestamp: "2024-03-15 14:21:30", model: "mistral:latest", tokens: 1560, latency: 267, endpoint: "/v1/chat/completions" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [models, setModels] = useState<ModelInfo[]>(mockModels);
  const [copied, setCopied] = useState(false);
  const [activeModel, setActiveModel] = useState("llama3:latest");
  const [serverStatus, setServerStatus] = useState<"online" | "offline">("online");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const apiUrl = `${baseUrl}/api/v1`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleModel = (id: string) => {
    setModels(models.map((m) =>
      m.id === id ? { ...m, status: m.status === "running" ? "stopped" as const : "running" as const, memoryUsage: m.status === "running" ? 0 : parseFloat(m.size) * 0.9 } : m
    ));
  };

  const tabs: { key: Tab; icon: React.ComponentType<{ size?: number }>; label: string }[] = [
    { key: "dashboard", icon: Activity, label: "Dashboard" },
    { key: "models", icon: Cpu, label: "Models" },
    { key: "api", icon: Terminal, label: "API" },
    { key: "monitoring", icon: BarChart3, label: "Monitoring" },
    { key: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-brand-400" />
            <h1 className="text-lg font-bold">PrivateAI</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">Local API Server</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === tab.key ? "bg-brand-600/20 text-brand-400" : "text-gray-400 hover:bg-gray-800"}`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${serverStatus === "online" ? "bg-green-400" : "bg-red-400"}`} />
            <span className="text-sm">{serverStatus === "online" ? "Server Online" : "Server Offline"}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{models.filter((m) => m.status === "running").length} models active</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Requests", value: models.reduce((s, m) => s + m.requests, 0).toLocaleString(), icon: Zap, color: "text-blue-400" },
                { label: "Active Models", value: models.filter((m) => m.status === "running").length, icon: Cpu, color: "text-green-400" },
                { label: "Avg Latency", value: `${Math.round(models.filter((m) => m.requests > 0).reduce((s, m) => s + m.avgLatency, 0) / models.filter((m) => m.requests > 0).length)}ms`, icon: Clock, color: "text-yellow-400" },
                { label: "Memory Used", value: `${models.reduce((s, m) => s + m.memoryUsage, 0).toFixed(1)} GB`, icon: Database, color: "text-purple-400" },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">{stat.label}</span>
                    <stat.icon size={16} className={stat.color} />
                  </div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="font-medium mb-4">Active Models</h3>
                <div className="space-y-3">
                  {models.filter((m) => m.status === "running").map((m) => (
                    <div key={m.id} className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">{m.id}</p>
                          <p className="text-xs text-gray-500">{m.size} | {m.quantization}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">{m.memoryUsage} GB</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="font-medium mb-4">Quick Start</h3>
                <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm space-y-2">
                  <p className="text-gray-500"># Replace OpenAI base URL</p>
                  <p className="text-green-400">export OPENAI_API_BASE={apiUrl}</p>
                  <p className="text-gray-500 mt-3"># Use with Python</p>
                  <p className="text-blue-400">from openai import OpenAI</p>
                  <p className="text-blue-400">client = OpenAI(base_url=&quot;{apiUrl}&quot;)</p>
                  <p className="text-blue-400">response = client.chat.completions.create(</p>
                  <p className="text-blue-400">  model=&quot;llama3:latest&quot;,</p>
                  <p className="text-blue-400">  messages=[&#123;&quot;role&quot;: &quot;user&quot;, &quot;content&quot;: &quot;Hello&quot;&#125;]</p>
                  <p className="text-blue-400">)</p>
                </div>
                <button onClick={() => copyToClipboard(`OPENAI_API_BASE=${apiUrl}`)} className="mt-3 flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy endpoint"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "models" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Model Management</h2>
            <div className="space-y-4">
              {models.map((model) => (
                <div key={model.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${model.status === "running" ? "bg-green-900/30" : "bg-gray-800"}`}>
                        <Cpu size={18} className={model.status === "running" ? "text-green-400" : "text-gray-500"} />
                      </div>
                      <div>
                        <h3 className="font-medium">{model.id}</h3>
                        <p className="text-sm text-gray-500">{model.size} | {model.quantization} | {model.requests.toLocaleString()} requests</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${model.status === "running" ? "bg-green-900/30 text-green-400" : "bg-gray-800 text-gray-500"}`}>
                        {model.status}
                      </span>
                      <button onClick={() => toggleModel(model.id)} className={`px-4 py-2 rounded-lg text-sm font-medium ${model.status === "running" ? "bg-red-600/20 text-red-400 hover:bg-red-600/30" : "bg-green-600/20 text-green-400 hover:bg-green-600/30"}`}>
                        {model.status === "running" ? "Stop" : "Start"}
                      </button>
                    </div>
                  </div>
                  {model.status === "running" && (
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-800">
                      <div><p className="text-xs text-gray-500">Avg Latency</p><p className="text-sm font-medium">{model.avgLatency}ms</p></div>
                      <div><p className="text-xs text-gray-500">Memory</p><p className="text-sm font-medium">{model.memoryUsage} GB</p></div>
                      <div><p className="text-xs text-gray-500">Requests/hr</p><p className="text-sm font-medium">{Math.round(model.requests / 24)}</p></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "api" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">API Documentation</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
              <h3 className="font-medium mb-2">Base URL</h3>
              <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
                <code className="text-brand-400 flex-1">{apiUrl}</code>
                <button onClick={() => copyToClipboard(apiUrl)}><Copy size={14} className="text-gray-500" /></button>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { method: "POST", path: "/v1/chat/completions", desc: "Create chat completion (streaming supported)" },
                { method: "GET", path: "/v1/models", desc: "List available models" },
                { method: "POST", path: "/v1/embeddings", desc: "Generate embeddings" },
              ].map((endpoint) => (
                <div key={endpoint.path} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${endpoint.method === "GET" ? "bg-green-900/30 text-green-400" : "bg-blue-900/30 text-blue-400"}`}>
                      {endpoint.method}
                    </span>
                    <code className="text-sm">{endpoint.path}</code>
                  </div>
                  <p className="text-sm text-gray-500">{endpoint.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-6">
              <h3 className="font-medium mb-4">Example Request</h3>
              <pre className="bg-gray-950 rounded-lg p-4 text-sm font-mono overflow-x-auto text-gray-300">
{`curl ${apiUrl}/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${activeModel}",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ],
    "temperature": 0.7,
    "stream": false
  }'`}
              </pre>
            </div>
          </div>
        )}

        {activeTab === "monitoring" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Usage Monitoring</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-medium mb-4">Request Log</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="text-left py-2">Timestamp</th>
                    <th className="text-left py-2">Model</th>
                    <th className="text-left py-2">Endpoint</th>
                    <th className="text-right py-2">Tokens</th>
                    <th className="text-right py-2">Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {mockLogs.map((log, i) => (
                    <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-2 text-gray-400">{log.timestamp}</td>
                      <td className="py-2">{log.model}</td>
                      <td className="py-2 font-mono text-xs">{log.endpoint}</td>
                      <td className="py-2 text-right">{log.tokens.toLocaleString()}</td>
                      <td className="py-2 text-right">{log.latency}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            <div className="space-y-6 max-w-2xl">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                <h3 className="font-medium">Server Configuration</h3>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Ollama URL</label>
                  <input defaultValue="http://localhost:11434" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Default Model</label>
                  <select value={activeModel} onChange={(e) => setActiveModel(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
                    {models.map((m) => <option key={m.id} value={m.id}>{m.id}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Rate Limit (req/min)</label>
                  <input type="number" defaultValue={60} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">API Key (optional)</label>
                  <input type="password" placeholder="Leave empty for no auth" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
                </div>
                <button className="bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg text-sm font-medium">Save Settings</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
