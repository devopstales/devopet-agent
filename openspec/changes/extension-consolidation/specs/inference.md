# Inference Extension — Behavioral Spec

## Requirement: All inference tools preserved with identical schemas

### Scenario: set_model_tier tool accepts tier parameter
- Given the inference extension is loaded
- When the agent calls `set_model_tier` with `{ tier: "victory", reason: "routine edit" }`
- Then the active model switches to the victory-tier candidate
- And the tool returns a confirmation with the resolved model ID

### Scenario: set_thinking_level tool accepts level parameter
- Given the inference extension is loaded
- When the agent calls `set_thinking_level` with `{ level: "high", reason: "complex debug" }`
- Then the thinking budget is set to high
- And the tool returns the new thinking level

### Scenario: switch_to_offline_driver resolves best local model
- Given Ollama is running with at least one model
- When the agent calls `switch_to_offline_driver` with `{ reason: "API down" }`
- Then a local model is selected from the hardware-aware preference list
- And the driver model switches to the selected local model

### Scenario: ask_local_model delegates to Ollama
- Given Ollama is running with at least one model
- When the agent calls `ask_local_model` with `{ prompt: "hello" }`
- Then the prompt is sent to the local model
- And the response text is returned

### Scenario: manage_ollama start/stop/status/pull
- Given the inference extension is loaded
- When the agent calls `manage_ollama` with `{ action: "status" }`
- Then the Ollama server status is returned

### Scenario: list_local_models returns available models
- Given Ollama is running
- When the agent calls `list_local_models`
- Then a list of available model IDs is returned

## Requirement: All inference commands preserved

### Scenario: /effort shows current tier
- Given a session is active
- When the operator runs `/effort`
- Then the current tier name, level, and settings are displayed

### Scenario: /effort cap locks ceiling
- Given the current effort tier is Substantial (3)
- When the operator runs `/effort cap`
- Then the effort ceiling is locked at level 3
- And attempts to upgrade past level 3 are rejected

### Scenario: /offline switches to local driver
- Given a session is active and Ollama is available
- When the operator runs `/offline`
- Then the driver switches to a local Ollama model

## Requirement: Effort session_start initialization preserved

### Scenario: effort tier resolves on session start
- Given PI_EFFORT env is not set and no config override exists
- When a session starts
- Then effort defaults to Substantial (level 3)
- And the driver model is set to the victory-tier candidate
- And thinking is set to low

## Requirement: Error recovery cascade preserved

### Scenario: upstream failure triggers model downgrade
- Given the driver model encounters a repeated API error
- When the recovery cascade activates
- Then the model downgrades to the next viable tier
- And a cooldown period prevents rapid re-attempts
