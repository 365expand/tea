# Graph Report - tea  (2026-11-05)

## Corpus Check
- 173 files · ~4,011,823 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 549 nodes · 1199 edges · 42 communities (29 shown, 13 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 85 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]

## God Nodes (most connected - your core abstractions)
1. `createSupabaseAdminClient()` - 174 edges
2. `getAdminContext()` - 72 edges
3. `formatCurrency()` - 45 edges
4. `logActivity()` - 43 edges
5. `createSupabaseServerClient()` - 27 edges
6. `formatDate()` - 27 edges
7. `sendEmail()` - 18 edges
8. `getSetting()` - 18 edges
9. `compilerOptions` - 16 edges
10. `useCart()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `generateMetadata()` --calls--> `createSupabaseAdminClient()`  [INFERRED]
  src/app/(storefront)/category/[slug]/page.tsx → src/lib/supabase/admin.ts
- `CategoryDetailPage()` --calls--> `createSupabaseAdminClient()`  [INFERRED]
  src/app/(storefront)/category/[slug]/page.tsx → src/lib/supabase/admin.ts
- `FaqsPage()` --calls--> `createSupabaseAdminClient()`  [INFERRED]
  src/app/(storefront)/faqs/page.tsx → src/lib/supabase/admin.ts
- `generateMetadata()` --calls--> `createSupabaseAdminClient()`  [INFERRED]
  src/app/(storefront)/product/[slug]/page.tsx → src/lib/supabase/admin.ts
- `ProductsCatalogPage()` --calls--> `createSupabaseAdminClient()`  [INFERRED]
  src/app/(storefront)/products/page.tsx → src/lib/supabase/admin.ts

## Import Cycles
- 1-file cycle: `src/app/(storefront)/products/[slug]/page.tsx -> src/app/(storefront)/products/[slug]/page.tsx`

## Hyperedges (group relationships)
- **Graphify Skill Architecture** — skill_graphify, ref_add_watch, ref_exports, ref_extraction_spec, ref_github_merge, ref_hooks, ref_query, ref_transcribe, ref_update [EXTRACTED 1.00]

## Communities (42 total, 13 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (10): AdminHeader(), AdminHeaderProps, AdminLayoutShell(), AdminLayoutShellProps, AdminSidebar(), AdminSidebarProps, AdminDashboardLayout(), requireAdmin() (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (65): PUT(), generateMetadata(), RootLayout(), sitemap(), GET(), POST(), POST(), GET() (+57 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (27): Category, CategoryManager(), Subcategory, ExpenseRow, FinanceManager(), FinanceManagerProps, FinanceOverview, InvoiceRow (+19 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (34): dependencies, dotenv, framer-motion, lucide-react, next, nodemailer, pg, react (+26 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 6 - "Community 6"
Cohesion: 0.20
Nodes (11): graphify, This is NOT the Next.js you know, Add and Watch Reference, Exports and Benchmark Reference, Extraction Subagent Specification, GitHub and Merge Reference, Hooks and Integration Reference, Query, Path, and Explain Reference (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.40
Nodes (4): applied, client, files, migrationsDir

### Community 13 - "Community 13"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 16 - "Community 16"
Cohesion: 0.07
Nodes (47): CustomerAccountPage(), POST(), COURIER_PRESETS, OrderDetailManager(), OrderDetailProps, OrderListManager(), OrderSummary, PrintButton() (+39 more)

### Community 17 - "Community 17"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 18 - "Community 18"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 19 - "Community 19"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 25 - "Community 25"
Cohesion: 0.07
Nodes (29): SettingsManager(), SettingsMap, CategoriesClient(), CategoryItem, ProductRelationItem, SubcategoryItem, CategoriesOverviewPage(), metadata (+21 more)

### Community 26 - "Community 26"
Cohesion: 0.29
Nodes (7): metadata, AboutHeroSequence(), AboutCtaSection(), AboutFounderNote(), AboutImpactStats(), AboutPillars(), AboutProcessTimeline()

### Community 27 - "Community 27"
Cohesion: 0.24
Nodes (4): metadata, metadata, CmsPageRenderer(), metadata

### Community 28 - "Community 28"
Cohesion: 0.32
Nodes (6): ProductListManager(), ProductListManagerProps, ProductRow, ProductStatusBadge(), ProductsPage(), ProductsPageProps

### Community 29 - "Community 29"
Cohesion: 0.38
Nodes (5): FaqItem, FaqsClient(), FALLBACK_FAQS, FaqsPage(), metadata

### Community 30 - "Community 30"
Cohesion: 0.47
Nodes (4): CouponItem, CouponManager(), AdminCouponsPage(), metadata

### Community 31 - "Community 31"
Cohesion: 0.47
Nodes (4): FaqItem, FaqManager(), AdminFaqsPage(), metadata

### Community 32 - "Community 32"
Cohesion: 0.60
Nodes (3): CustomerAddressesPage(), AddressItem, CustomerAddressManager()

### Community 37 - "Community 37"
Cohesion: 0.47
Nodes (4): InquiryItem, InquiryManager(), AdminInquiriesPage(), metadata

### Community 40 - "Community 40"
Cohesion: 0.10
Nodes (20): metadata, ProductsCatalogPage(), CategoryDetailPage(), CategoryPageProps, generateMetadata(), ProductsPageProps, BrewingRitualSection(), STEPS (+12 more)

### Community 41 - "Community 41"
Cohesion: 0.60
Nodes (3): CustomerList(), CustomerRow, CustomersPage()

## Knowledge Gaps
- **161 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+156 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createSupabaseAdminClient()` connect `Community 2` to `Community 32`, `Community 1`, `Community 3`, `Community 37`, `Community 40`, `Community 41`, `Community 14`, `Community 16`, `Community 25`, `Community 28`, `Community 29`, `Community 30`, `Community 31`?**
  _High betweenness centrality (0.256) - this node is a cross-community bridge._
- **Why does `env()` connect `Community 1` to `Community 16`, `Community 2`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `formatCurrency()` connect `Community 16` to `Community 2`, `Community 3`, `Community 40`, `Community 41`, `Community 28`, `Community 30`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 42 inferred relationships involving `createSupabaseAdminClient()` (e.g. with `CategoriesOverviewPage()` and `CategoriesPage()`) actually correct?**
  _`createSupabaseAdminClient()` has 42 INFERRED edges - model-reasoned connections that need verification._
- **Are the 18 inferred relationships involving `getAdminContext()` (e.g. with `DELETE()` and `PUT()`) actually correct?**
  _`getAdminContext()` has 18 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `formatCurrency()` (e.g. with `CustomerDetailPage()` and `CustomerOrderDetailPage()`) actually correct?**
  _`formatCurrency()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `logActivity()` (e.g. with `DELETE()` and `PUT()`) actually correct?**
  _`logActivity()` has 12 INFERRED edges - model-reasoned connections that need verification._