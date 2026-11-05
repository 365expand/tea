# Graph Report - tea  (2026-11-03)

## Corpus Check
- 41 files · ~23,778 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 200 nodes · 218 edges · 25 communities (18 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `createSupabaseAdminClient()` - 14 edges
3. `What You Must Do When Invoked` - 12 edges
4. `/graphify` - 10 edges
5. `Graphify Skill Specification` - 9 edges
6. `graphify reference: extra exports and benchmark` - 8 edges
7. `scripts` - 7 edges
8. `env()` - 7 edges
9. `getAdminContext()` - 6 edges
10. `getSecret()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `graphify` --references--> `Graphify Skill Specification`  [EXTRACTED]
  AGENTS.md → .opencode/skills/graphify/SKILL.md
- `getSessionUser()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/lib/auth.ts → src/lib/supabase/server.ts
- `logActivity()` --calls--> `createSupabaseAdminClient()`  [EXTRACTED]
  src/lib/auth.ts → src/lib/supabase/admin.ts
- `logLogin()` --calls--> `createSupabaseAdminClient()`  [EXTRACTED]
  src/lib/auth.ts → src/lib/supabase/admin.ts
- `createSupabaseAdminClient()` --calls--> `env()`  [EXTRACTED]
  src/lib/supabase/admin.ts → src/lib/env.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Graphify Skill Architecture** — skill_graphify, ref_add_watch, ref_exports, ref_extraction_spec, ref_github_merge, ref_hooks, ref_query, ref_transcribe, ref_update [EXTRACTED 1.00]

## Communities (25 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.16
Nodes (9): AdminHeader(), AdminHeaderProps, AdminLayoutShellProps, AdminSidebar(), AdminSidebarProps, env(), required, createSupabaseBrowserClient() (+1 more)

### Community 2 - "Community 2"
Cohesion: 0.16
Nodes (21): AdminContext, getAdminContext(), getSessionUser(), logActivity(), logLogin(), requireAdmin(), requireUser(), getTransporter() (+13 more)

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (12): dependencies, dotenv, lucide-react, next, nodemailer, pg, react, react-dom (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (21): devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/nodemailer, @types/pg, @types/react (+13 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 6 - "Community 6"
Cohesion: 0.22
Nodes (10): graphify, Add and Watch Reference, Exports and Benchmark Reference, Extraction Subagent Specification, GitHub and Merge Reference, Hooks and Integration Reference, Query, Path, and Explain Reference, Transcription Reference (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.40
Nodes (4): applied, client, files, migrationsDir

### Community 13 - "Community 13"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 14 - "Community 14"
Cohesion: 0.33
Nodes (3): CartContext, CartContextType, CartItem

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 17 - "Community 17"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 18 - "Community 18"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 19 - "Community 19"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **112 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+107 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createSupabaseAdminClient()` connect `Community 2` to `Community 1`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `env()` connect `Community 1` to `Community 2`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 3` to `Community 4`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _112 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._