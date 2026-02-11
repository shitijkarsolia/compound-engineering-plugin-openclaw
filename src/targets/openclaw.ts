import path from "path"
import { backupFile, copyDir, ensureDir, writeJson, writeText } from "../utils/files"
import type { OpenClawBundle } from "../types/openclaw"

export async function writeOpenClawBundle(outputRoot: string, bundle: OpenClawBundle): Promise<void> {
  const paths = resolveOpenClawPaths(outputRoot)
  await ensureDir(paths.root)

  const backupPath = await backupFile(paths.configPath)
  if (backupPath) {
    console.log(`Backed up existing config to ${backupPath}`)
  }
  await writeJson(paths.configPath, bundle.config)

  const agentsDir = paths.agentsDir
  for (const agent of bundle.agents) {
    await writeText(path.join(agentsDir, `${agent.name}.md`), agent.content + "\n")
  }

  if (bundle.plugins.length > 0) {
    const pluginsDir = paths.pluginsDir
    for (const plugin of bundle.plugins) {
      await writeText(path.join(pluginsDir, plugin.name), plugin.content + "\n")
    }
  }

  if (bundle.skillDirs.length > 0) {
    const skillsRoot = paths.skillsDir
    for (const skill of bundle.skillDirs) {
      await copyDir(skill.sourceDir, path.join(skillsRoot, skill.name))
    }
  }
}

function resolveOpenClawPaths(outputRoot: string) {
  const base = path.basename(outputRoot)
  // Global install: ~/.config/openclaw (basename is "openclaw")
  // Project install: .openclaw (basename is ".openclaw")
  if (base === "openclaw" || base === ".openclaw") {
    return {
      root: outputRoot,
      configPath: path.join(outputRoot, "openclaw.json"),
      agentsDir: path.join(outputRoot, "agents"),
      pluginsDir: path.join(outputRoot, "plugins"),
      skillsDir: path.join(outputRoot, "skills"),
    }
  }

  // Custom output directory - nest under .openclaw subdirectory
  return {
    root: outputRoot,
    configPath: path.join(outputRoot, "openclaw.json"),
    agentsDir: path.join(outputRoot, ".openclaw", "agents"),
    pluginsDir: path.join(outputRoot, ".openclaw", "plugins"),
    skillsDir: path.join(outputRoot, ".openclaw", "skills"),
  }
}
