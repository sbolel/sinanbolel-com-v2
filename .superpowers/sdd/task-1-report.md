Task 1 report

Branch: `sbolel/deps-upgrade-stack`

Summary:

- Updated the 9 selected PR #228 comment targets to import DOM-specific React Router APIs from `react-router/dom`, exactly as specified in the brief.
- Split the mixed test imports in `src/views/Dashboard/Dashboard.test.tsx` and `src/layouts/AppLayout/AppLayout.test.tsx` so `useLoaderData` remains on `react-router` while `BrowserRouter` moves to `react-router/dom`.
- Added one directly related adjacent test-support fix in `config/jest/reactRouterDom.cjs` so Jest resolves `react-router/dom` to the DOM runtime entry that actually exports `BrowserRouter`, `Link`, and `createBrowserRouter` for this dependency version.

Files changed:

- `src/router/router.tsx`
- `src/components/HeaderAuthButton.tsx`
- `src/components/AppDrawerButton.tsx`
- `src/views/Dashboard/Dashboard.test.tsx`
- `src/layouts/AppLayout/AppLayout.test.tsx`
- `src/layouts/AppLayout/AppDrawerButtonList.test.tsx`
- `src/components/Header.test.tsx`
- `src/components/HeaderAuthButton.test.tsx`
- `src/components/AppDrawerButton.test.tsx`
- `config/jest/reactRouterDom.cjs`

Validation:

- Ran with `MISE_NODE_VERSION=22.22.3`
- Command:
  `yarn jest src/router/router.test.ts src/views/Dashboard/Dashboard.test.tsx src/layouts/AppLayout/AppLayout.test.tsx src/layouts/AppLayout/AppDrawerButtonList.test.tsx src/components/Header.test.tsx src/components/HeaderAuthButton.test.tsx src/components/AppDrawerButton.test.tsx`
- Result: 7 test suites passed, 17 tests passed

Self-review:

- Verified the app code diff is limited to import path changes in the requested files.
- Verified the two mixed-import tests keep `useLoaderData` on `react-router`.
- Verified the Jest shim change is the minimal fix needed for the branch’s current React Router 8.2.0 test resolution behavior.
- No additional behavioral changes were introduced.

Notes:

- The task brief’s ownership list did not include `config/jest/reactRouterDom.cjs`, but this adjacent change was required because the existing Jest mapper targeted `dom-export.js`, which does not export `BrowserRouter`, `Link`, or `createBrowserRouter` in the installed package.
