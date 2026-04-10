// ---------------------------------------------------------------------------
// build-schema.ts — Generate JSON Schema from Zod config schema
// ---------------------------------------------------------------------------
import { zodToJsonSchema } from "zod-to-json-schema"
import { OpenCodeFlutterConfigSchema } from "../src/config/index.js"
import { writeFileSync, mkdirSync } from "node:fs"
import { resolve, dirname } from "node:path"

const outPath = resolve(import.meta.dirname ?? ".", "../dist/opencode-flutter.schema.json")
mkdirSync(dirname(outPath), { recursive: true })

const jsonSchema = zodToJsonSchema(OpenCodeFlutterConfigSchema, {
    name: "OpenCodeFlutterConfig",
    $refStrategy: "none",
})

writeFileSync(outPath, JSON.stringify(jsonSchema, null, 2) + "\n")
console.log(`[build-schema] Wrote ${outPath}`)
