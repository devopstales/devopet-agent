# Micro-Extension Absorption — Behavioral Spec

## Requirement: Auto-compact behavior preserved in project-memory

### Scenario: context pressure triggers compaction
- Given context usage exceeds 70% (default AUTO_COMPACT_PERCENT)
- And at least 60 seconds have passed since the last compaction
- When a turn ends
- Then compaction is triggered automatically

### Scenario: compaction cooldown prevents rapid re-triggers
- Given a compaction just completed
- When the next turn ends within 60 seconds at >70% usage
- Then compaction is NOT triggered

## Requirement: Version check preserved in bootstrap

### Scenario: hourly poll detects new release
- Given omegon-pi 0.13.1 is installed
- And npm registry has 0.14.0 available
- When the hourly version check fires
- Then a notification is displayed that a newer version is available

## Requirement: Session log preserved in project-memory

### Scenario: structured session entries appended
- Given a session is active
- When tool calls and messages occur
- Then structured log entries are appended to the session log file

## Requirement: Terminal title preserved in dashboard

### Scenario: terminal title reflects git branch
- Given the working directory is a git repository on branch `main`
- When the dashboard updates
- Then the terminal title includes the branch name

### Scenario: terminal title shows active cleave run
- Given a cleave dispatch is running with 3 children
- When the terminal title updates
- Then it reflects the active cleave state

## Requirement: Tool renderers preserved in dashboard

### Scenario: all registerToolRenderer calls execute
- Given the dashboard extension loads
- When tool results are displayed
- Then custom renderers for view, web_search, chronos, render_diagram, render_native_diagram, render_excalidraw, generate_image_local, render_composition_still, render_composition_video, set_model_tier, set_thinking_level, ask_local_model, manage_ollama, list_local_models, switch_to_offline_driver, manage_tools, and whoami are active
