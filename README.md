# nacos-poll

AI-powered e‑voting and manifesto insights platform built with Next.js

nacos-poll is a multi-tenant, association-focused electronic voting platform that combines secure voting flows with AI-powered manifesto processing and conversational insights. It supports tenant/association management, candidate and voter imports, election lifecycle controls, voting UI for authenticated voters, result exports, and AI features that summarize and let users ask questions about candidate manifestos.

Table of contents
- Quick start
- What this project does
- AI capabilities (what's implemented)
- Core voting features
- Architecture and important paths
- Configuration / environment variables
- How AI flows work (technical)
- Security, privacy, and cost notes
- Contributing

Quick start (development)
1. Clone and install

```bash
git clone https://github.com/justinnonso05/nacos-poll.git
cd nacos-poll
npm install
```

2. Create a `.env.local` with the environment variables listed below.

3. Run the development server

```bash
npm run dev
```

4. Open http://localhost:3000

What this project does (high level)
- Multi-tenant e‑voting for associations (Superadmin platform + tenant association admins)
- Upload and manage candidates (name, photo, manifesto PDF, citations/achievements)
- Upload voter lists (CSV/XLSX) and manage voter credentials
- Start/pause/end elections, monitor progress, and export results/analytics
- Voter-facing flow: candidate list, preview selections, cast vote (one vote per voter)
- Public results page after election ends
- AI features for manifesto indexing, summarization, semantic search, conversational Q&A, and automated FAQ generation

AI capabilities (implemented)
The repo includes concrete implementations for these AI features:

- Manifesto indexing
  - Uploaded manifesto PDFs are validated, had text extracted, chunked, embedded using HuggingFace sentence-transformers (all-MiniLM-L6-v2), and stored into a Supabase vector table (manifesto_embeddings).
  - API route: POST `app/api/ai/index-manifesto` — supports `action=add|update|remove`.

- Manifesto summarization
  - Summaries are generated using LangChain's ChatGoogleGenerativeAI client configured to use Gemini (model `gemini-pro-latest`). Summaries are used for candidate overviews and stored on candidate records.
  - Helper: `lib/ai/manifesto-ai.ts` (function `generateManifestoSummary`).

- Conversational manifesto Q&A
  - Users can ask free‑text questions about candidates/elections. The server performs vector search to retrieve top manifesto chunks, builds a context prompt, and invokes the LLM to return an answer with quoted sources and similarity metadata.
  - API route: POST `app/api/ai/manifesto-qa` (requires NextAuth session).
  - Client UI: `components/manifesto/ManifestoQAChat.tsx`.

- Automated FAQ generation & regeneration
  - A script (`scripts/generate-faq.ts`) runs a curated list of frequent questions against the manifesto Q&A pipeline and persists answers in the `frequentlyAskedQuestion` table via Prisma.
  - API endpoints: GET `app/api/ai/faq`, POST `app/api/ai/regenerate-faq`.

- Upload pipeline integration
  - Manifesto PDF uploads (app/api/upload) validate PDFs, extract text, optionally call `generateManifestoSummary`, then index manifesto chunks in Supabase via `ManifestoVectorStore`.

Core voting & platform features (concrete)
- RBAC: Superadmin, Association Admin (tenant), Voter. Flows and permission checks are implemented in components and API routes.
- Election lifecycle: create, schedule (startAt / endAt), manual start/pause/end, only one active election per association enforced by management UI logic.
- Candidate management: create/edit/delete candidates, upload photo, upload manifesto PDF, view manifesto summaries.
- Voter management: upload voter lists (CSV/XLSX), issue credentials, one-vote-per-voter enforcement.
- Voting UI: `components/voting/VotingInterface.tsx` drives voter interactions, preview, and final cast.
- Results & analytics: admin dashboards and export endpoints for CSV/PDF post-election. Public results page available after an election ends.

Architecture & important repo paths (where to look)
- UI components: `components/` (voting, admin, manifesto UI, etc.)
- Server APIs: `app/api/` — election control, candidates, votes, uploads, AI routes
  - `app/api/ai/manifesto-qa/route.ts`
  - `app/api/ai/index-manifesto/route.ts`
  - `app/api/ai/faq/route.ts`
  - `app/api/ai/regenerate-faq/route.ts`
  - `app/api/upload/route.ts`
- AI helpers: `lib/ai/manifesto-ai.ts`, `lib/ai/supabase-vector-store.ts`
- Scripts: `scripts/generate-faq.ts`
- DB layer: Prisma schema + `lib/prisma` usage throughout

Configuration / environment variables
Create `.env.local` (do not commit secrets). Example variables used by the code:

```
DATABASE_URL=postgresql://user:pass@localhost:5432/db
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role
HUGGINGFACE_API_KEY=hf_xxx
GOOGLE_API_KEY=AIza...
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
ENABLE_AI=true
```

Notes on env usage:
- `SUPABASE_SERVICE_ROLE_KEY` is used server-side for direct writes to the vector table. Keep it secret and scoped to server environments only.
- `HUGGINGFACE_API_KEY` is used for embedding generation (HuggingFaceInferenceEmbeddings).
- `GOOGLE_API_KEY` is used by LangChain's ChatGoogleGenerativeAI to call Gemini.

How the AI flows work (technical summary)
1. Manifesto upload (`app/api/upload`) — PDF validated and converted to text, optional summary generated via `generateManifestoSummary`, then `ManifestoVectorStore.addManifesto` is called.
2. `ManifestoVectorStore.addManifesto` splits the manifesto into chunks (~1000 chars with overlap), generates embeddings (HuggingFace), and inserts chunk rows into the Supabase `manifesto_embeddings` table with metadata (candidateId, electionId, chunk_index, etc.).
3. When a user asks a question (`/api/ai/manifesto-qa`), the backend:
   - Runs a vector search (top-k) to retrieve relevant chunks.
   - Composes a context prompt from the chunks and the user's question.
   - Invokes the LLM (Gemini) via LangChain to generate an answer with supporting quotes and similarity scores.
4. FAQ generation (`scripts/generate-faq.ts`) runs a set of curated questions through `askAboutManifestos` and persists the results to Prisma.



---

If you want, I can also:
- add a `.env.example` file to the repo,
- or open a branch & PR with this README replacement.
