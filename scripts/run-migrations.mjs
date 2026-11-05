import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing from .env");
  process.exit(1);
}

const migrationsDir = join(process.cwd(), "supabase", "migrations");
const files = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

await client.query(`
  create table if not exists public.schema_migrations (
    version text primary key,
    applied_at timestamptz not null default now()
  );
`);

const appliedResult = await client.query("select version from public.schema_migrations");
const applied = new Set(appliedResult.rows.map((row) => row.version));

for (const file of files) {
  if (applied.has(file)) {
    console.log(`skip  ${file}`);
    continue;
  }
  const sql = readFileSync(join(migrationsDir, file), "utf8");
  console.log(`apply ${file}`);
  try {
    await client.query("begin");
    await client.query(sql);
    await client.query("insert into public.schema_migrations (version) values ($1)", [file]);
    await client.query("commit");
    console.log(`done  ${file}`);
  } catch (error) {
    await client.query("rollback");
    console.error(`failed ${file}`);
    console.error(error.message);
    if (error.position) console.error(`position ${error.position}`);
    if (error.where) console.error(error.where);
    process.exitCode = 1;
    break;
  }
}

await client.end();
