import { promises as fs } from "fs";
import path from "path";

async function main() {
  const configPath = path.join(process.cwd(), "openclaw.json");
  console.log(`Loading config from ${configPath}...`);

  try {
    const configContent = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(configContent);

    if (!config.$schema || !config.$schema.includes("openclaw.ai")) {
      throw new Error("Invalid $schema in openclaw.json");
    }

    console.log("✓ Config loaded and schema verified.");

    // Check for agents
    const agentsDir = path.join(process.cwd(), ".openclaw", "agents");
    const agents = await fs.readdir(agentsDir);

    if (agents.length === 0) {
      throw new Error("No agents found in .openclaw/agents");
    }

    console.log(`✓ Found ${agents.length} agents.`);

    // Load first agent
    const firstAgent = agents[0];
    const agentContent = await fs.readFile(path.join(agentsDir, firstAgent), "utf-8");

    if (!agentContent.includes("mode: subagent") && !agentContent.includes("mode: primary")) {
       console.warn("⚠️ Agent content missing expected 'mode' frontmatter");
    }

    console.log(`✓ Successfully loaded agent: ${firstAgent}`);
    console.log("Mock OpenClaw runtime verification passed!");

  } catch (error) {
    console.error("❌ Runtime verification failed:", error);
    process.exit(1);
  }
}

main();
