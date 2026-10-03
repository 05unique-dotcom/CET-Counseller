// Stub: the real @vercel/oidc loads node:fs at startup and crashes the published server.
// This app never uses Vercel OIDC auth.
export async function getVercelOidcToken() { throw new Error("Vercel OIDC unavailable"); }
export function getVercelOidcTokenSync() { throw new Error("Vercel OIDC unavailable"); }
export function getContext() { return {}; }
