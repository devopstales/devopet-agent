## ADDED Requirements

### Requirement: @tintinweb/pi-tasks dependency and manifest registration

The system SHALL declare **[@tintinweb/pi-tasks](https://www.npmjs.com/package/@tintinweb/pi-tasks)** as an **`npm` dependency** with a **pinned or semver-bounded** version compatible with devopet’s pi stack, and SHALL register the extension in **`package.json` `pi.extensions`** using the correct path after install.

#### Scenario: Install resolves

- **WHEN** the operator runs **`npm install`** at the devopet package root
- **THEN** **`@tintinweb/pi-tasks`** SHALL install or the change SHALL document a supported workaround (for example version alignment or deferral)

### Requirement: Task tools and slash command

The system SHALL expose the upstream **Task*** tools (**TaskCreate**, **TaskList**, **TaskGet**, **TaskUpdate**, **TaskOutput**, **TaskStop**, **TaskExecute**) and the **`/tasks`** command per **@tintinweb/pi-tasks** behavior, subject only to devopet-wide tool policy and keybinding conflict documentation.

#### Scenario: Tasks command opens menu

- **WHEN** the user runs **`/tasks`** in an interactive session with the extension loaded
- **THEN** the interactive tasks menu SHALL be available per upstream behavior

### Requirement: Storage and environment semantics

The system SHALL document upstream **task storage** modes (**memory** / **session** / **project**), default file locations under **`.pi/tasks/`**, **`tasks-config.json`**, and environment variables **`PI_TASKS`** and **`PI_TASKS_DEBUG`** as defined by **@tintinweb/pi-tasks**, without redefining those semantics in v1.

#### Scenario: Operator uses PI_TASKS override

- **WHEN** the operator sets **`PI_TASKS`** per upstream documentation (for example `off`, a named list, or a path)
- **THEN** devopet documentation SHALL point to that behavior and SHALL not contradict the extension’s contract without a dedicated migration change

### Requirement: TaskExecute without pi-subagents

When **@tintinweb/pi-subagents** is not installed, the system SHALL preserve upstream behavior: **TaskExecute** SHALL fail with a **clear, upstream-style message**; all other task tools SHALL remain usable.

#### Scenario: TaskExecute without subagents extension

- **WHEN** **`TaskExecute`** is invoked and **pi-subagents** is not present
- **THEN** the tool response SHALL indicate that subagent execution is unavailable per upstream, not an opaque devopet error

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
