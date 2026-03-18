import { NextResponse } from "next/server";

export async function GET() {
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    const response = await fetch(`${ollamaUrl}/api/tags`);
    const data = await response.json();

    const models = (data.models || []).map((m: { name: string; modified_at: string; size: number }) => ({
      id: m.name,
      object: "model",
      created: new Date(m.modified_at).getTime() / 1000,
      owned_by: "local",
      permission: [],
      root: m.name,
      parent: null,
    }));

    return NextResponse.json({ object: "list", data: models });
  } catch {
    return NextResponse.json({
      object: "list",
      data: [
        { id: "llama3:latest", object: "model", created: Date.now() / 1000, owned_by: "local" },
        { id: "mistral:latest", object: "model", created: Date.now() / 1000, owned_by: "local" },
        { id: "codellama:latest", object: "model", created: Date.now() / 1000, owned_by: "local" },
      ],
    });
  }
}
