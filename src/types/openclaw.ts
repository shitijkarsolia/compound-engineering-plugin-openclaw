export type OpenClawPermission = "allow" | "ask" | "deny"

export type OpenClawConfig = {
  $schema?: string
  model?: string
  default_agent?: string
  tools?: Record<string, boolean>
  permission?: Record<string, OpenClawPermission | Record<string, OpenClawPermission>>
  agent?: Record<string, OpenClawAgentConfig>
  command?: Record<string, OpenClawCommandConfig>
  mcp?: Record<string, OpenClawMcpServer>
}

export type OpenClawAgentConfig = {
  description?: string
  mode?: "primary" | "subagent"
  model?: string
  temperature?: number
  tools?: Record<string, boolean>
  permission?: Record<string, OpenClawPermission>
}

export type OpenClawCommandConfig = {
  description?: string
  model?: string
  agent?: string
  template: string
}

export type OpenClawMcpServer = {
  type: "local" | "remote"
  command?: string[]
  url?: string
  environment?: Record<string, string>
  headers?: Record<string, string>
  enabled?: boolean
}

export type OpenClawAgentFile = {
  name: string
  content: string
}

export type OpenClawPluginFile = {
  name: string
  content: string
}

export type OpenClawBundle = {
  config: OpenClawConfig
  agents: OpenClawAgentFile[]
  plugins: OpenClawPluginFile[]
  skillDirs: { sourceDir: string; name: string }[]
}
