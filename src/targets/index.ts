import type { ClaudePlugin } from "../types/claude"
import type { OpenCodeBundle } from "../types/opencode"
import type { OpenClawBundle } from "../types/openclaw"
import type { CodexBundle } from "../types/codex"
import { convertClaudeToOpenCode, type ClaudeToOpenCodeOptions } from "../converters/claude-to-opencode"
import { convertClaudeToOpenClaw } from "../converters/claude-to-openclaw"
import { convertClaudeToCodex } from "../converters/claude-to-codex"
import { writeOpenCodeBundle } from "./opencode"
import { writeOpenClawBundle } from "./openclaw"
import { writeCodexBundle } from "./codex"

export type TargetHandler<TBundle = unknown> = {
  name: string
  implemented: boolean
  convert: (plugin: ClaudePlugin, options: ClaudeToOpenCodeOptions) => TBundle | null
  write: (outputRoot: string, bundle: TBundle) => Promise<void>
}

export const targets: Record<string, TargetHandler> = {
  opencode: {
    name: "opencode",
    implemented: true,
    convert: convertClaudeToOpenCode,
    write: writeOpenCodeBundle,
  },
  openclaw: {
    name: "openclaw",
    implemented: true,
    convert: convertClaudeToOpenClaw as unknown as TargetHandler<OpenClawBundle>["convert"],
    write: writeOpenClawBundle as unknown as TargetHandler<OpenClawBundle>["write"],
  },
  codex: {
    name: "codex",
    implemented: true,
    convert: convertClaudeToCodex as TargetHandler<CodexBundle>["convert"],
    write: writeCodexBundle as TargetHandler<CodexBundle>["write"],
  },
}
