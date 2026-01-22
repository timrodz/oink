# AGENTS.md

This is a desktop application built with Tauri.

## Project Technologies

- Backend: Rust
- Frontend: React
- Framework: Tauri

All application logic must be built with Rust, and the frontend must be used for rendering / manipulating data from the backend.

## Development practics

### Backend

- typecheck: Prefer `cargo clippy` over `cargo check`

### Frontend

- lint: `bun lint`
- typecheck: `bun typecheck`

## Rules

- Add or update tests even if not asked to.
- Run type checks and linters before committing work
- After working on a feature/bug fix, open a pull request with a brief summary of the goal
- Update documentation with findings and changes to systems
