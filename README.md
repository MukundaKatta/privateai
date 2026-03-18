# PrivateAI

**Self-Hosted Local AI Model Server & Management Dashboard**

PrivateAI is a management dashboard for running AI models locally with full privacy. Deploy, monitor, and interact with models running on your own hardware through an OpenAI-compatible API, without sending data to external services.

## Features

- **Local Model Management** -- Start, stop, and manage locally deployed AI models
- **OpenAI-Compatible API** -- Drop-in replacement API for chat completions and embeddings
- **Model Dashboard** -- Real-time status, latency, and request metrics per model
- **Usage Monitoring** -- Track tokens, latency, and endpoint usage with detailed logs
- **Resource Tracking** -- Monitor GPU, CPU, and RAM usage across running models
- **API Endpoint Reference** -- Built-in documentation with copy-to-clipboard examples
- **Settings Panel** -- Configure model parameters, quantization, and server options
- **Multi-Model Support** -- Run multiple models concurrently with independent controls

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (Auth, Database, SSR)
- **State Management:** Zustand
- **Charts:** Recharts
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Compatible hardware for running local AI models

### Installation

```bash
git clone <repository-url>
cd privateai
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   └── page.tsx          # Main dashboard (tabbed interface)
├── components/           # Reusable UI components
└── lib/
    └── supabase/         # Supabase client configuration
```

