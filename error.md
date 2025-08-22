[21:50:12.128] Running build in Washington, D.C., USA (East) – iad1
[21:50:12.128] Build machine configuration: 2 cores, 8 GB
[21:50:12.159] Cloning github.com/Shupo00/yaritakunaiyo3 (Branch: main, Commit: 2665ea2)
[21:50:12.411] Previous build caches not available
[21:50:12.687] Cloning completed: 526.000ms
[21:50:13.563] Running "vercel build"
[21:50:13.955] Vercel CLI 46.0.2
[21:50:14.929] Installing dependencies...
[21:50:18.316] npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
[21:50:18.634] npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
[21:50:18.917] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[21:50:19.249] npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
[21:50:19.250] npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
[21:50:20.892] npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
[21:50:25.340] 
[21:50:25.340] added 277 packages in 10s
[21:50:25.341] 
[21:50:25.341] 58 packages are looking for funding
[21:50:25.341]   run `npm fund` for details
[21:50:25.398] Detected Next.js version: 14.2.32
[21:50:25.401] Running "npm run build"
[21:50:25.517] 
[21:50:25.517] > yaritakunaiyo3@0.1.0 build
[21:50:25.517] > next build
[21:50:25.518] 
[21:50:26.091] Attention: Next.js now collects completely anonymous telemetry regarding usage.
[21:50:26.091] This information is used to shape Next.js' roadmap and prioritize features.
[21:50:26.092] You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[21:50:26.092] https://nextjs.org/telemetry
[21:50:26.092] 
[21:50:26.151]   ▲ Next.js 14.2.32
[21:50:26.151]   - Experiments (use with caution):
[21:50:26.151]     · typedRoutes
[21:50:26.151] 
[21:50:26.211]    Creating an optimized production build ...
[21:50:45.944]  ✓ Compiled successfully
[21:50:45.944]    Skipping validation of types
[21:50:45.945]    Skipping linting
[21:50:46.212]    Collecting page data ...
[21:50:47.829]    Generating static pages (0/7) ...
[21:50:48.328]    Generating static pages (1/7) 
[21:50:48.339]    Generating static pages (3/7) 
[21:50:48.433]    Generating static pages (5/7) 
[21:50:48.689]  ⨯ useSearchParams() should be wrapped in a suspense boundary at page "/auth". Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
[21:50:48.690]     at p (/vercel/path0/.next/server/chunks/982.js:21:97386)
[21:50:48.691]     at o (/vercel/path0/.next/server/chunks/982.js:21:108322)
[21:50:48.691]     at o (/vercel/path0/.next/server/app/auth/page.js:1:2500)
[21:50:48.691]     at nj (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
[21:50:48.691]     at nM (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
[21:50:48.691]     at nN (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
[21:50:48.691]     at nI (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47011)
[21:50:48.691]     at nM (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47718)
[21:50:48.691]     at nM (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
[21:50:48.691]     at nN (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
[21:50:48.692] 
[21:50:48.692] Error occurred prerendering page "/auth". Read more: https://nextjs.org/docs/messages/prerender-error
[21:50:48.692] 
[21:50:48.692]  ✓ Generating static pages (7/7)
[21:50:48.702] 
[21:50:48.703] > Export encountered errors on following paths:
[21:50:48.703] 	/auth/page: /auth
[21:50:48.731] Error: Command "npm run build" exited with 1