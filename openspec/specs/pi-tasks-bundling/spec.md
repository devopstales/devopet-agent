# pi-tasks bundling (first-party)

## Purpose

Exposes Task* tools and **`/tasks`** through a first-party extension (e.g. **`tasks`** or **`ask-back`**). **[@tintinweb/pi-tasks](https://www.npmjs.com/package/@tintinweb/pi-tasks)** is a **behavioral reference**, not a mandatory npm dependency.

## Requirements

### Requirement: Task tools and slash command via devopet-owned extension

The system SHALL expose the **Task*** tools (**TaskCreate**, **TaskList**, **TaskGet**, **TaskUpdate**, **TaskOutput**, **TaskStop**, **TaskExecute**) and the **`/tasks`** command through a **first-party** extension registered in **`package.json` `pi.extensions`**. **Observable behavior** SHALL be **consistent with** **[@tintinweb/pi-tasks](https://www.npmjs.com/package/@tintinweb/pi-tasks)** documentation, subject only to devopet-wide tool policy and documented keybinding notes.

#### Scenario: Tasks command opens menu

- **WHEN** the user runs **`/tasks`** in an interactive session with the extension loaded
- **THEN** the interactive tasks menu SHALL be available per the reference model

#### Scenario: Package builds cleanly

- **WHEN** the devopet package is installed and built
- **THEN** extension registration SHALL not introduce unrecoverable peer conflicts, or required pi alignment SHALL be documented

### Requirement: Storage and environment semantics

The system SHALL implement **task storage** modes and env semantics **consistent with** the reference (**memory** / **session** / **project**, **`PI_TASKS`**, **`PI_TASKS_DEBUG`**, **`tasks-config.json`**). File locations MAY use **`.devopet/`** / **`~/.devopet`** per **`devopet-config-folders`** when adopted; otherwise document mapping from **`.pi/tasks/`**-style paths.

#### Scenario: Operator uses PI_TASKS override

- **WHEN** the operator sets **`PI_TASKS`** per documented behavior (for example `off`, a named list, or a path)
- **THEN** behavior SHALL match the reference contract unless a migration note explicitly differs

### Requirement: TaskExecute without pi-subagents

When **@tintinweb/pi-subagents** is not installed, **TaskExecute** SHALL fail with a **clear message** **consistent with** the reference (subagent execution unavailable); all other task tools SHALL remain usable.

#### Scenario: TaskExecute without subagents extension

- **WHEN** **`TaskExecute`** is invoked and **pi-subagents** is not present
- **THEN** the tool response SHALL indicate that subagent execution is unavailable in the same class of message as the reference, not an opaque devopet-only error
