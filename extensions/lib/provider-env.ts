// @secret ANTHROPIC_API_KEY "Anthropic API key for Claude models"
// @secret ANTHROPIC_OAUTH_TOKEN "Anthropic OAuth token (takes precedence over API key)"
// @secret OPENAI_API_KEY "OpenAI API key for GPT models"
// @secret COPILOT_GITHUB_TOKEN "GitHub Copilot token (primary, set by Copilot extension)"
// @secret GEMINI_API_KEY "Google Gemini API key"
// @secret XAI_API_KEY "xAI API key for Grok models"
// @secret GROQ_API_KEY "Groq API key for fast inference"
// @secret MISTRAL_API_KEY "Mistral API key for Mistral/Codestral models"
// @secret OPENROUTER_API_KEY "OpenRouter API key for multi-provider routing"
// @secret AZURE_OPENAI_API_KEY "Azure OpenAI API key"
// @secret CEREBRAS_API_KEY "Cerebras API key for fast inference"
// @secret HF_TOKEN "HuggingFace token for gated model access"

/**
 * Mapping from pi model provider names to their env var API keys.
 *
 * Mirrors the envMap in pi-ai's env-api-keys.js — must stay in sync.
 * Used by /providers to show remediation hints, and by bootstrap to
 * detect which providers are configured.
 *
 * SYNC CHECK: compare against vendor/pi-mono/packages/ai/dist/env-api-keys.js
 * when updating. If that file adds a new provider, add it here too.
 */
export interface ProviderEnvEntry {
  /** Primary env var name (the one users should configure) */
  envVar: string;
  /** All env vars checked by pi (in priority order) */
  allEnvVars: string[];
  /** Human-readable description */
  description: string;
}

export const PROVIDER_ENV_VARS: Record<string, ProviderEnvEntry> = {
  anthropic: {
    envVar: "ANTHROPIC_API_KEY",
    allEnvVars: ["ANTHROPIC_OAUTH_TOKEN", "ANTHROPIC_API_KEY"],
    description: "Claude models (opus, sonnet, haiku)",
  },
  openai: {
    envVar: "OPENAI_API_KEY",
    allEnvVars: ["OPENAI_API_KEY"],
    description: "GPT models",
  },
  "github-copilot": {
    envVar: "COPILOT_GITHUB_TOKEN",
    allEnvVars: ["COPILOT_GITHUB_TOKEN", "GH_TOKEN", "GITHUB_TOKEN"],
    description: "GitHub Copilot (Claude, GPT, Gemini, Grok via OAuth)",
  },
  google: {
    envVar: "GEMINI_API_KEY",
    allEnvVars: ["GEMINI_API_KEY"],
    description: "Google Gemini models",
  },
  "google-vertex": {
    envVar: "GOOGLE_CLOUD_API_KEY",
    allEnvVars: ["GOOGLE_CLOUD_API_KEY", "GOOGLE_APPLICATION_CREDENTIALS"],
    description: "Google Vertex AI (or ADC credentials)",
  },
  xai: {
    envVar: "XAI_API_KEY",
    allEnvVars: ["XAI_API_KEY"],
    description: "xAI Grok models",
  },
  groq: {
    envVar: "GROQ_API_KEY",
    allEnvVars: ["GROQ_API_KEY"],
    description: "Groq fast inference",
  },
  mistral: {
    envVar: "MISTRAL_API_KEY",
    allEnvVars: ["MISTRAL_API_KEY"],
    description: "Mistral / Codestral",
  },
  openrouter: {
    envVar: "OPENROUTER_API_KEY",
    allEnvVars: ["OPENROUTER_API_KEY"],
    description: "OpenRouter multi-provider gateway",
  },
  "azure-openai-responses": {
    envVar: "AZURE_OPENAI_API_KEY",
    allEnvVars: ["AZURE_OPENAI_API_KEY"],
    description: "Azure OpenAI",
  },
  "amazon-bedrock": {
    envVar: "AWS_PROFILE",
    allEnvVars: ["AWS_PROFILE", "AWS_ACCESS_KEY_ID", "AWS_BEARER_TOKEN_BEDROCK", "AWS_WEB_IDENTITY_TOKEN_FILE"],
    description: "AWS Bedrock (profile, IAM keys, bearer token, or IRSA)",
  },
  cerebras: {
    envVar: "CEREBRAS_API_KEY",
    allEnvVars: ["CEREBRAS_API_KEY"],
    description: "Cerebras fast inference",
  },
  huggingface: {
    envVar: "HF_TOKEN",
    allEnvVars: ["HF_TOKEN"],
    description: "HuggingFace gated model access",
  },
};

/**
 * Get remediation hint for an unconfigured provider.
 * Returns actionable text with the most appropriate fix path.
 */
export function getProviderRemediationHint(provider: string): string | undefined {
  const entry = PROVIDER_ENV_VARS[provider];
  if (!entry) return undefined;

  // Providers with CLI/OAuth auth paths get special handling
  switch (provider) {
    case "github-copilot":
      return "Run `/login github`, or set via `/secrets configure COPILOT_GITHUB_TOKEN`";
    case "amazon-bedrock":
      return "Run `aws sso login --profile <profile>` or `/secrets configure AWS_PROFILE`";
    case "google-vertex":
      return "Run `gcloud auth application-default login` or `/secrets configure GOOGLE_CLOUD_API_KEY`";
    case "anthropic":
      return "`/secrets configure ANTHROPIC_API_KEY` (or ANTHROPIC_OAUTH_TOKEN for OAuth)";
    default:
      return `\`/secrets configure ${entry.envVar}\``;
  }
}

/**
 * Check if a provider has any of its env vars set in process.env.
 * Useful for quick auth detection without going through pi's registry.
 */
export function isProviderEnvConfigured(provider: string): boolean {
  const entry = PROVIDER_ENV_VARS[provider];
  if (!entry) return false;
  return entry.allEnvVars.some(v => !!process.env[v]);
}
