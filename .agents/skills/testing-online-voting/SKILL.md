---
name: testing-online-voting
description: Run local browser tests for the voting app, including face models, synthetic cameras, seeded auth, and duplicate-vote checks.
---

# Local browser testing

## Devin Secrets Needed
- None for local testing. Use the throwaway JWT_SECRET in the local `.env`, initialized according to the environment blueprint. Never expose tokens in artifacts.

## Services and dependency cache
- Start from the repo root with `npm run dev`: Express uses 5000 and Vite uses 3000.
- Inspect and terminate only stale processes belonging to this app before starting. Capture stdout so nodemon restarts can be counted.
- After changing face-api.js/TensorFlow dependencies, install client dependencies and remove generated `client/node_modules/.vite` before restarting Vite. Confirm one deduplicated tfjs-core with `npm ls --prefix client face-api.js @tensorflow/tfjs-core`.
- Use `npm run fetch-models` if `client/public/models` is absent. Verify runtime requests, not merely files: four manifests and five shards should load locally without CDN fallback.
- WebGL may be unavailable on the test desktop. A CPU-backend warning is not itself a failure; confirm camera controls and actual detection behavior.

## Camera and authenticated testing
- Relaunch Chrome with `--use-fake-device-for-media-stream --use-fake-ui-for-media-stream`, preserving its other launch arguments and debugging connection.
- The default fake device displays a pattern, not a face. Test Start Camera, Login with Face and registration Capture Face. A no-face message is expected, but this does not prove successful biometric registration/login.
- If explicitly authorized to bypass the camera for voting tests, POST multipart `/api/auth/register` with unique name/email/voterId, an image fixture, and JSON-stringified faceDescriptor. Store returned token and user in localStorage keys `token` and `user`, then reload.
- Storage is origin-specific: repeat authorized authentication setup for the built client on port 5000.
- Normal authenticated users currently have access to Admin Panel; no separate admin credentials are required.

## High-value voting checks
- Create a uniquely named election through Admin Panel with two candidates.
- Open its voting URL in two tabs before either votes. Submit in the first tab, then submit a different candidate in the stale tab to verify the actual server duplicate-rejection message.
- End the election and confirm persisted 1/0 candidate totals in Admin and disappearance from Active Elections.
- Delete only your election through the UI. Deleting an election may leave vote records; identify and disclose test data rather than restoring the entire datastore over unrelated changes.
- Compare the server PID and count startup/restart log lines before and after registration uploads, vote writes and election lifecycle mutations.
- After `npm run build`, navigate directly to Express `/dashboard`. Unknown client URLs such as `/archive` may return SPA HTML yet show a blank view if no matching React route exists; distinguish HTTP fallback from a functioning page. `/api/nope` should return JSON 404 rather than SPA HTML.
