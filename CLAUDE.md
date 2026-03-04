# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Initial setup (install deps + generate Prisma client + run migrations)
npm run setup

# Development server (Turbopack)
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Run all tests
npm test

# Run a single test file
npx vitest run src/lib/__tests__/file-system.test.ts

# Reset database
npm run db:reset

# Regenerate Prisma client after schema changes
npx prisma generate

# Run a new migration
npx prisma migrate dev
```

## Architecture

UIGen is an AI-powered React component generator. Users chat with an AI that generates React components visible in a live preview — no files are ever written to the host filesystem.

### Request Flow

1. User submits a message in the chat (`ChatInterface`)
2. `ChatContext` (wraps Vercel AI SDK's `useChat`) sends the message + serialized virtual FS to `POST /api/chat`
3. The API route calls Claude with two tools: `str_replace_editor` and `file_manager`
4. The AI creates/edits files in a server-side `VirtualFileSystem` instance
5. Tool call results stream back to the client; `FileSystemContext.handleToolCall` applies the same mutations to the client-side FS
6. `PreviewFrame` reacts to `refreshTrigger`, transforms files with Babel standalone, builds an import map, and renders into a sandboxed `<iframe>` via `srcdoc`

### Virtual File System (`src/lib/file-system.ts`)

`VirtualFileSystem` is the core data structure — an in-memory tree of `FileNode` objects. It exists on both client and server:
- Server: reconstructed per-request from the serialized JSON sent by the client
- Client: held in `FileSystemContext`, mutated via tool call callbacks

The VFS is serialized as `Record<string, FileNode>` (flat map of path → node) for transmission and storage.

### AI Tools (`src/lib/tools/`)

Two tools are given to the LLM:
- **`str_replace_editor`**: `view`, `create`, `str_replace`, `insert` commands — delegates to `VirtualFileSystem` methods
- **`file_manager`**: `rename` and `delete` operations

The tool instances are built per-request with `buildStrReplaceTool(fileSystem)` / `buildFileManagerTool(fileSystem)` so each request gets its own FS instance.

### Preview Pipeline (`src/lib/transform/jsx-transformer.ts`)

When the FS changes, `PreviewFrame` calls `createImportMap(files)` which:
1. Transforms all `.js/.jsx/.ts/.tsx` files with Babel standalone (supports TypeScript + automatic JSX runtime)
2. Creates blob URLs for each transformed file
3. Builds an ES module import map — local imports via blob URLs, third-party packages auto-resolved to `https://esm.sh/<package>`
4. Handles missing imports by generating placeholder modules
5. Returns the map + collected CSS styles

`createPreviewHTML` wraps this in a full HTML document with Tailwind CDN, error boundaries, and `ReactDOM.createRoot`.

**Important constraint**: The entry point for the preview is always `/App.jsx` (or `/App.tsx`, `/index.jsx`, `/index.tsx`). The AI system prompt enforces this.

**`@/` alias** in virtual FS files maps to the root `/` of the virtual FS (e.g., `@/components/Foo` → `/components/Foo`), not to `src/`.

### AI Provider (`src/lib/provider.ts`)

- Uses `claude-haiku-4-5` via `@ai-sdk/anthropic` when `ANTHROPIC_API_KEY` is set
- Falls back to `MockLanguageModel` (deterministic static responses) when no key is present — useful for development/testing without an API key

### Authentication (`src/lib/auth.ts`)

- JWT-based sessions via `jose`, stored in an httpOnly cookie (`auth-token`)
- Passwords hashed with `bcrypt`
- Sessions expire after 7 days
- `JWT_SECRET` env var; defaults to `"development-secret-key"` if unset
- `src/middleware.ts` protects `/api/projects` and `/api/filesystem` routes

### Data Persistence (Prisma + SQLite)

Schema in `prisma/schema.prisma`. Generated client output goes to `src/generated/prisma/`.

- `Project.messages` — JSON string of the chat message history
- `Project.data` — JSON string of the serialized `VirtualFileSystem`
- Projects are saved/updated in the `onFinish` callback of `streamText` in the chat API route
- Anonymous users' work is tracked in `sessionStorage` via `src/lib/anon-work-tracker.ts`

### Context Providers

Both providers wrap the main layout in `app/main-content.tsx`:
- **`FileSystemProvider`** — owns the client-side `VirtualFileSystem`, exposes CRUD operations and `refreshTrigger` for re-rendering the preview
- **`ChatProvider`** — owns the `useChat` hook, passes tool call events to `FileSystemContext.handleToolCall`

### Testing

Tests use Vitest + jsdom + `@testing-library/react`. Test files live in `__tests__/` directories next to the code they test. Vitest is configured via `vite.config` (uses `vite-tsconfig-paths` for `@/` alias resolution in tests).
