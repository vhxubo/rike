# Repository Agent Rules

## Verification is opt-in

Unless the user explicitly requests testing or acceptance work:

- Do not add or modify test files.
- Remove test files that are made obsolete by the current product change.
- Do not run tests, type checks, linters, builds, previews, development servers, screenshots, browser checks, or manual acceptance checks.
- Do not claim that changes were tested, verified, or accepted.

If the user authorizes one specific kind of verification, perform only that kind. Do not expand the scope to other verification commands or activities.

Normal implementation work should deliver code and documentation marked as unverified.
