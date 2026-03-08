# SpendLens

**AI-powered expense intelligence for Indian bank statements.**

Upload a CSV or PDF statement from HDFC, ICICI, SBI, Axis, or Kotak — and get a full dashboard in seconds: category breakdowns, monthly trends, anomaly insights, and a natural language chat interface.

> 🔒 Your data never leaves your session. Nothing is stored, logged, or sent to any third-party except Google Gemini for analysis.

---

## Live Demo

[spendlens.vercel.app](https://spendlens.vercel.app) — or embedded in [Mithun's portfolio](https://mithun-portfolio.vercel.app)

---

## Features

- **Drag-and-drop upload** — CSV or PDF, up to 5MB
- **AI parsing** — Gemini 1.5 Flash categorizes every transaction automatically
- **Spending pie chart** — Category breakdown with warm editorial color palette
- **Monthly bar chart** — Spent vs credited, month by month
- **AI Insights** — Anomaly detection, pattern recognition, savings tips
- **Transaction table** — Sort by date/amount, filter by category, search, paginated
- **Natural language chat** — Ask "How much did I spend on Swiggy?" and get an answer
- **Export** — Download filtered transactions as CSV
- **Zero persistence** — Everything lives in `sessionStorage` only

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI | Google Gemini API (`gemini-2.5-flash-lite`) |
| Charts | Recharts |
| Upload | react-dropzone |
| Icons | lucide-react |
| PDF | pdf-parse |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/) (free tier works)

### Setup

```bash
git clone https://github.com/mithun-srinivasa/spendlens
cd spendlens
npm install
cp .env.example .env.local
```

Add your key to `.env.local`:
```
GEMINI_API_KEY=your_key_here
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key from AI Studio |

---

## Supported Bank Formats

Works best with CSV exports from:
- **HDFC** — Account Statement CSV
- **ICICI** — Detailed Statement CSV
- **SBI** — Account Statement download
- **Axis** — Transaction History CSV
- **Kotak** — e-Statement CSV

PDF support is available but CSV exports give better results.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Fonts, metadata
│   ├── page.tsx            # Landing / upload page
│   ├── dashboard/
│   │   └── page.tsx        # Main dashboard
│   └── api/
│       ├── analyze/route.ts  # Gemini analysis endpoint
│       └── chat/route.ts     # Chat Q&A endpoint
├── components/             # All UI components
├── lib/                    # parseCSV, parsePDF, gemini client
└── types/                  # Shared TypeScript types
```

---

## Privacy

- ❌ No database
- ❌ No authentication  
- ❌ No analytics that capture file content
- ✅ Files are processed in-memory in a single API request
- ✅ Results stored only in the browser's `sessionStorage`
- ✅ Session is cleared when you navigate to a new analysis

---

## License

MIT — free to use, fork, and adapt.

Built by [Mithun Srinivasa](https://mithun-portfolio.vercel.app)
