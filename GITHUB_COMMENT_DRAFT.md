I now have a standalone synthetic reproduction for the PRAGMA authorization issue,
independent of the application framework.

Reproduction link: **[ADD THE OWNER-APPROVED PUBLIC LINK HERE BEFORE POSTING]**

Tested: Miniflare 4.20260515.0, workerd 1.20260515.1, Node 24.19.0, Linux x64.
The example uses a fresh disposable D1 binding, two synthetic tables and two rows.

Steps:
1. Use pnpm 11.25.0 and Node >=22.
2. Run `pnpm install --frozen-lockfile --ignore-scripts`.
3. Run `pnpm run repro` (or `pnpm test`).

Actual outcomes through the same Worker `env.DB` binding:
- `PRAGMA foreign_key_check`: executes, returning `[]`.
- `PRAGMA integrity_check`: `D1_ERROR: not authorized: SQLITE_AUTH`;
  underlying cause: `not authorized: SQLITE_AUTH`.

Four independently fresh local-D1 executions observed this result. The automated
suite passed 3 tests with no failures/skips. No SQL authorization was bypassed.

Fresh dependency installation still needs confirmation: the execution used installed
pinned packages; an offline install-validation attempt lacked registry metadata.
Linux ARM64 Docker and Node24.21 were not tested in this standalone reproduction.

Could you confirm whether integrity_check is intentionally unsupported through
local D1, and the supported approach for full database-integrity verification?

The additional storage-file attribution question remains separate and was not
reproduced by this minimal example. No ownership inference is made from suffixes
or workerd open handles.
