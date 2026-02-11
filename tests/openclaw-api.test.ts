import { describe, expect, test } from "bun:test"
import path from "path"
import { promises as fs } from "fs"
import os from "os"
import {
  loadClaudePlugin,
  convertClaudeToOpenClaw,
  writeOpenClawBundle
} from "../src/openclaw"

const fixtureRoot = path.join(import.meta.dir, "fixtures", "sample-plugin")

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

describe("OpenClaw Programmatic API", () => {
  test("can load, convert, and write using exported functions", async () => {
    // 1. Load
    const plugin = await loadClaudePlugin(fixtureRoot)
    expect(plugin.manifest.name).toBe("compound-engineering")

    // 2. Convert
    const bundle = convertClaudeToOpenClaw(plugin, {
      agentMode: "subagent",
      permissions: "broad"
    })
    expect(bundle.config.$schema).toContain("openclaw.ai")
    expect(bundle.agents.length).toBeGreaterThan(0)

    // 3. Write
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-api-"))
    await writeOpenClawBundle(tempRoot, bundle)

    expect(await exists(path.join(tempRoot, "openclaw.json"))).toBe(true)
    expect(await exists(path.join(tempRoot, ".openclaw", "agents", "repo-research-analyst.md"))).toBe(true)
  })
})
