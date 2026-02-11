import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"
import os from "os"
import { writeOpenClawBundle } from "../src/targets/openclaw"
import type { OpenClawBundle } from "../src/types/openclaw"

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

describe("writeOpenClawBundle", () => {
  test("writes config, agents, plugins, and skills", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-test-"))
    const bundle: OpenClawBundle = {
      config: { $schema: "https://openclaw.ai/config.json" },
      agents: [{ name: "agent-one", content: "Agent content" }],
      plugins: [{ name: "hook.ts", content: "export {}" }],
      skillDirs: [
        {
          name: "skill-one",
          sourceDir: path.join(import.meta.dir, "fixtures", "sample-plugin", "skills", "skill-one"),
        },
      ],
    }

    await writeOpenClawBundle(tempRoot, bundle)

    expect(await exists(path.join(tempRoot, "openclaw.json"))).toBe(true)
    expect(await exists(path.join(tempRoot, ".openclaw", "agents", "agent-one.md"))).toBe(true)
    expect(await exists(path.join(tempRoot, ".openclaw", "plugins", "hook.ts"))).toBe(true)
    expect(await exists(path.join(tempRoot, ".openclaw", "skills", "skill-one", "SKILL.md"))).toBe(true)
  })

  test("writes directly into a .openclaw output root", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-root-"))
    const outputRoot = path.join(tempRoot, ".openclaw")
    const bundle: OpenClawBundle = {
      config: { $schema: "https://openclaw.ai/config.json" },
      agents: [{ name: "agent-one", content: "Agent content" }],
      plugins: [],
      skillDirs: [
        {
          name: "skill-one",
          sourceDir: path.join(import.meta.dir, "fixtures", "sample-plugin", "skills", "skill-one"),
        },
      ],
    }

    await writeOpenClawBundle(outputRoot, bundle)

    expect(await exists(path.join(outputRoot, "openclaw.json"))).toBe(true)
    expect(await exists(path.join(outputRoot, "agents", "agent-one.md"))).toBe(true)
    expect(await exists(path.join(outputRoot, "skills", "skill-one", "SKILL.md"))).toBe(true)
    expect(await exists(path.join(outputRoot, ".openclaw"))).toBe(false)
  })

  test("writes directly into ~/.config/openclaw style output root", async () => {
    // Simulates the global install path: ~/.config/openclaw
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "config-openclaw-"))
    const outputRoot = path.join(tempRoot, ".config", "openclaw")
    const bundle: OpenClawBundle = {
      config: { $schema: "https://openclaw.ai/config.json" },
      agents: [{ name: "agent-one", content: "Agent content" }],
      plugins: [],
      skillDirs: [
        {
          name: "skill-one",
          sourceDir: path.join(import.meta.dir, "fixtures", "sample-plugin", "skills", "skill-one"),
        },
      ],
    }

    await writeOpenClawBundle(outputRoot, bundle)

    // Should write directly, not nested under .openclaw
    expect(await exists(path.join(outputRoot, "openclaw.json"))).toBe(true)
    expect(await exists(path.join(outputRoot, "agents", "agent-one.md"))).toBe(true)
    expect(await exists(path.join(outputRoot, "skills", "skill-one", "SKILL.md"))).toBe(true)
    expect(await exists(path.join(outputRoot, ".openclaw"))).toBe(false)
  })

  test("backs up existing openclaw.json before overwriting", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-backup-"))
    const outputRoot = path.join(tempRoot, ".openclaw")
    const configPath = path.join(outputRoot, "openclaw.json")

    // Create existing config
    await fs.mkdir(outputRoot, { recursive: true })
    const originalConfig = { $schema: "https://openclaw.ai/config.json", custom: "value" }
    await fs.writeFile(configPath, JSON.stringify(originalConfig, null, 2))

    const bundle: OpenClawBundle = {
      config: { $schema: "https://openclaw.ai/config.json", new: "config" },
      agents: [],
      plugins: [],
      skillDirs: [],
    }

    await writeOpenClawBundle(outputRoot, bundle)

    // New config should be written
    const newConfig = JSON.parse(await fs.readFile(configPath, "utf8"))
    expect(newConfig.new).toBe("config")

    // Backup should exist with original content
    const files = await fs.readdir(outputRoot)
    const backupFileName = files.find((f) => f.startsWith("openclaw.json.bak."))
    expect(backupFileName).toBeDefined()

    const backupContent = JSON.parse(await fs.readFile(path.join(outputRoot, backupFileName!), "utf8"))
    expect(backupContent.custom).toBe("value")
  })
})
