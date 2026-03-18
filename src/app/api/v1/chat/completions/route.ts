import { NextRequest, NextResponse } from "next/server";

// OpenAI-compatible /v1/chat/completions endpoint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { model, messages, temperature = 0.7, max_tokens = 2048, stream = false } = body;

    // Route to local model server (Ollama)
    const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

    if (stream) {
      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: model || "llama3", messages, stream: true }),
      });

      // Transform Ollama stream to OpenAI-compatible stream
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) return controller.close();
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              break;
            }
            const chunk = decoder.decode(value);
            try {
              const parsed = JSON.parse(chunk);
              const openAIChunk = {
                id: `chatcmpl-${Date.now()}`,
                object: "chat.completion.chunk",
                created: Math.floor(Date.now() / 1000),
                model,
                choices: [{
                  index: 0,
                  delta: { content: parsed.message?.content || "" },
                  finish_reason: parsed.done ? "stop" : null,
                }],
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(openAIChunk)}\n\n`));
            } catch {}
          }
        },
      });

      return new Response(readable, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
      });
    }

    // Non-streaming
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: model || "llama3", messages, stream: false }),
    });

    const data = await response.json();
    const content = data.message?.content || "";

    return NextResponse.json({
      id: `chatcmpl-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model,
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      choices: [{
        index: 0,
        message: { role: "assistant", content },
        finish_reason: "stop",
      }],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Service unavailable";
    return NextResponse.json({
      error: { message, type: "server_error", code: "service_unavailable" },
    }, { status: 503 });
  }
}
