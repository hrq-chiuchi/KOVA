// Runs Admin GraphQL against the dev store through the Shopify CLI. By default it uses the CLI's
// stored store auth (`shopify store execute`); `app: true` runs as the installed KOVA Core app
// (`shopify app execute`), which is required for objects the app owns, such as its cart transform.
// No token is read or written by these scripts.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const STORE = process.env.KOVA_STORE ?? "kova-ne5bx2j5.myshopify.com";
const APP_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function gql(query, variables = {}, { mutate = false, app = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "kova-gql-"));
  try {
    writeFileSync(join(dir, "q.graphql"), query);
    writeFileSync(join(dir, "v.json"), JSON.stringify(variables));
    const files = ["--query-file", join(dir, "q.graphql"), "--variable-file", join(dir, "v.json"), "--output-file", join(dir, "out.json")];
    const args = app
      ? ["app", "execute", "--path", APP_DIR, "-s", STORE, ...files]
      : ["store", "execute", "-s", STORE, "-j", ...files];
    if (mutate && !app) args.push("--allow-mutations");
    try {
      execFileSync("shopify", args, { stdio: ["ignore", "ignore", "pipe"] });
    } catch (error) {
      throw new Error(`GraphQL failed:\n${error.stderr?.toString() ?? error.message}`);
    }
    const out = JSON.parse(readFileSync(join(dir, "out.json"), "utf8"));
    return out.data ?? out;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// Throws when a mutation payload reports userErrors, so a partial write never passes silently.
export function check(payload, label) {
  const errors = payload?.userErrors ?? [];
  if (errors.length) throw new Error(`${label}: ${JSON.stringify(errors)}`);
  return payload;
}
