import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { PROVIDER_ENV_VARS, getProviderRemediationHint, isProviderEnvConfigured } from "./provider-env.ts";

describe("PROVIDER_ENV_VARS", () => {
  it("has entries for all major providers", () => {
    const expected = [
      "anthropic", "openai", "github-copilot", "google", "google-vertex",
      "xai", "groq", "mistral", "openrouter", "azure-openai-responses",
      "amazon-bedrock",
    ];
    for (const p of expected) {
      assert.ok(PROVIDER_ENV_VARS[p], `missing entry for ${p}`);
    }
  });

  it("envVar is always the first or primary var in allEnvVars", () => {
    for (const [provider, entry] of Object.entries(PROVIDER_ENV_VARS)) {
      assert.ok(
        entry.allEnvVars.includes(entry.envVar),
        `${provider}: envVar '${entry.envVar}' not in allEnvVars [${entry.allEnvVars}]`,
      );
    }
  });

  it("anthropic lists ANTHROPIC_OAUTH_TOKEN before ANTHROPIC_API_KEY (matches pi priority)", () => {
    const entry = PROVIDER_ENV_VARS["anthropic"];
    const oauthIdx = entry.allEnvVars.indexOf("ANTHROPIC_OAUTH_TOKEN");
    const apiKeyIdx = entry.allEnvVars.indexOf("ANTHROPIC_API_KEY");
    assert.ok(oauthIdx < apiKeyIdx, "OAuth token should have higher priority than API key");
  });

  it("github-copilot lists COPILOT_GITHUB_TOKEN first (matches pi priority)", () => {
    const entry = PROVIDER_ENV_VARS["github-copilot"];
    assert.equal(entry.allEnvVars[0], "COPILOT_GITHUB_TOKEN");
  });

  it("amazon-bedrock uses AWS_PROFILE as primary (not AWS_ACCESS_KEY_ID)", () => {
    const entry = PROVIDER_ENV_VARS["amazon-bedrock"];
    assert.equal(entry.envVar, "AWS_PROFILE");
  });

  it("all entries have non-empty description", () => {
    for (const [provider, entry] of Object.entries(PROVIDER_ENV_VARS)) {
      assert.ok(entry.description.length > 0, `${provider} has empty description`);
    }
  });
});

describe("getProviderRemediationHint", () => {
  it("returns undefined for unknown providers", () => {
    assert.equal(getProviderRemediationHint("nonexistent"), undefined);
  });

  it("returns /secrets configure for simple API key providers", () => {
    const hint = getProviderRemediationHint("openai");
    assert.ok(hint?.includes("/secrets configure OPENAI_API_KEY"));
  });

  it("returns OAuth hint for github-copilot", () => {
    const hint = getProviderRemediationHint("github-copilot");
    assert.ok(hint?.includes("/login github"), `got: ${hint}`);
  });

  it("returns aws sso hint for bedrock", () => {
    const hint = getProviderRemediationHint("amazon-bedrock");
    assert.ok(hint?.includes("aws sso login"), `got: ${hint}`);
  });

  it("returns gcloud hint for vertex", () => {
    const hint = getProviderRemediationHint("google-vertex");
    assert.ok(hint?.includes("gcloud auth"), `got: ${hint}`);
  });

  it("mentions both OAuth and API key for anthropic", () => {
    const hint = getProviderRemediationHint("anthropic");
    assert.ok(hint?.includes("ANTHROPIC_API_KEY"), `got: ${hint}`);
    assert.ok(hint?.includes("ANTHROPIC_OAUTH_TOKEN"), `got: ${hint}`);
  });
});

describe("isProviderEnvConfigured", () => {
  it("returns false for unknown provider", () => {
    assert.equal(isProviderEnvConfigured("nonexistent"), false);
  });

  it("returns false when no env vars set", () => {
    // Save and clear
    const saved = process.env.CEREBRAS_API_KEY;
    delete process.env.CEREBRAS_API_KEY;
    try {
      assert.equal(isProviderEnvConfigured("cerebras"), false);
    } finally {
      if (saved !== undefined) process.env.CEREBRAS_API_KEY = saved;
    }
  });

  it("returns true when primary env var is set", () => {
    const saved = process.env.GROQ_API_KEY;
    process.env.GROQ_API_KEY = "test-key";
    try {
      assert.equal(isProviderEnvConfigured("groq"), true);
    } finally {
      if (saved !== undefined) process.env.GROQ_API_KEY = saved;
      else delete process.env.GROQ_API_KEY;
    }
  });
});
