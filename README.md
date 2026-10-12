# Local D1 PRAGMA integrity_check reproduction — issue #16227

Small standalone Miniflare example, with no application framework, accounts,
production binding, API credentials, or preexisting database. Two fictional tables
and two rows are created through the Worker env.DB binding. Both PRAGMAs execute
independently through that same binding. SQL authorization is unchanged.

## Numbered reproduction steps

1. Install Node.js >=22.0.0 and pnpm 11.25.0. Node 24.19.0 on Linux x64 was
   actually tested. Node 24.21.0/Linux ARM64 Docker has NOT been tested here.
2. Extract this archive into a new folder and open a terminal in its directory.
3. Acquire the pinned public dependencies (this step needs registry access):

   ```sh
   pnpm install --frozen-lockfile --ignore-scripts
   ```

   Stop on any installation error. Do not bypass pnpm policy checks or enable
   lifecycle scripts merely to force a passing result. The lockfile contains only
   this public dependency graph. Its Miniflare sharp override pins 0.35.4 to match
   the installed graph used for the executed observation. No framework is needed.
4. Execute the reproduction:

   ```sh
   pnpm run repro
   ```

   This launches local workerd through Miniflare, creates fresh temporary D1 storage,
   dispatches one in-process request to the Worker, prints JSON, disposes Miniflare
   and removes only its newly allocated temporary directory. No ports are published
   by Docker, no Cloudflare account is contacted, and no deployment command exists.
5. Run the focused tests:

   ```sh
   pnpm test
   ```

   Expected for the currently observed behavior: 3 passed, 0 failed, 0 skipped.
   One test actually executes the reproduction against another fresh D1 binding.
   The others verify standalone source safeguards and recorded-result privacy.

## Expected versus observed

For valid synthetic parent/child records:

- foreign_key_check is expected to execute and return no violations.
- integrity_check would normally return an `ok` row if supported. If D1 intentionally
  prohibits it, clarification of that restriction and a supported full-integrity
  verification method is requested; this example does not assert API support.

Observed independently in local D1:

```text
PRAGMA foreign_key_check: executed; results: []
PRAGMA integrity_check: failed
message: D1_ERROR: not authorized: SQLITE_AUTH
cause: not authorized: SQLITE_AUTH
```

Both outcomes are printed even if one fails. `reproduced: true` describes the
reported authorization behavior, NOT a successful full-integrity verification.
If a runtime supports integrity_check, the script reports that result and exits
with status 1 because the reported issue did not reproduce. Do not alter that test
expectation to manufacture success.

## Environment and execution evidence

- Miniflare 4.20260515.0; workerd 1.20260515.1 from the locked dependency graph.
- Node v24.19.0; Linux x64; pnpm 11.25.0.
- Four separate fresh-D1 executions observed SQLITE_AUTH: initial manual run,
  recorded-results run, and two automated integration-test runs.
- Automated suite: 3 passed, 0 failed, 0 skipped.
- The minimal example does NOT require @cloudflare/vite-plugin or Wrangler.
- Their integration versions and Linux ARM64/Node24.21 Docker are not independently
  tested by this reproduction. Do not describe this result as Docker verification.
- Existing installed public dependencies were linked temporarily for Work execution.
  That link and all node_modules are excluded from the archive.
- Fresh installation was NOT completed. An offline frozen-lockfile-only attempt
  failed with ERR_PNPM_NO_OFFLINE_META because pnpm supply-chain verification lacked
  registry metadata. No policy bypass was attempted. The dependency closure and
  lockfile references were statically verified; online installation remains pending.

## Network/security boundaries

Miniflare cf:false and CLOUDFLARE_CF_FETCH_ENABLED=false prevent automatic Cloudflare
metadata fetching. The Worker outboundService responds 503; the Worker performs
only local D1 operations. This is not a claim of OS-level network isolation. Existing
Docker protections were not changed or exercised. There is no Chromium or browser.
No authorizer is disabled and no quick_check substitution is used.

## Separate storage question

See STORAGE_QUESTION.md. Extra SQLite-shaped files were NOT investigated or
reproduced in this standalone test. This reproduction supports only the PRAGMA issue.

## Privacy and publication

The archive includes generic source, manifests/lockfile, tests, synthetic result
JSON and documentation only. It includes no application code, original migrations,
private configuration, credentials, generated dependencies or database contents.
Public publication requires separate owner approval. A full clean-install/ARM64
run would improve evidence but is not claimed by the observations above.
