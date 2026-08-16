// Centralized app configuration.
//
// SECURITY: the API endpoint is read from an environment variable rather
// than hardcoded, so it never has to be committed to source control and
// can differ safely between local/staging/production without code changes.
// Set it in a local, gitignored .env file — see .env.example.
const RAW_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

if (!RAW_ENDPOINT) {
  // Fail loudly at build/boot rather than silently posting resumes nowhere
  // (or to a stale default) if the env var was never set.
  throw new Error(
    "VITE_API_ENDPOINT is not set. Copy .env.example to .env and set it to your backend's upload route."
  );
}

let endpointURL;
try {
  endpointURL = new URL(RAW_ENDPOINT);
} catch {
  throw new Error(`VITE_API_ENDPOINT is not a valid URL: "${RAW_ENDPOINT}"`);
}

const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(endpointURL.hostname);

// SECURITY: refuse to ship a build that silently sends resume PDFs over
// plaintext HTTP to a non-local host. Loopback is allowed so local dev
// against `uvicorn` on http://127.0.0.1:8000 keeps working.
if (!isLocalhost && endpointURL.protocol !== "https:" && import.meta.env.PROD) {
  throw new Error(
    `VITE_API_ENDPOINT ("${RAW_ENDPOINT}") must use https:// in production builds.`
  );
}

export const API_ENDPOINT = endpointURL.toString();

// Hard ceiling enforced client-side, matched to the copy in the upload UI.
// This is a UX guard, not a security boundary — the backend must enforce
// its own size limit independently (see note in README).
export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

// Abort any request that hangs longer than this so a stalled connection
// can't leave the UI (or an open socket) hanging indefinitely.
export const REQUEST_TIMEOUT_MS = 30_000;
