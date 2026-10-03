// Stub for @vercel/oidc: the real package loads node:fs at startup, which
// crashes the published server. This app never uses Vercel OIDC auth.
export async function getVercelOidcToken(): Promise<string> {
  throw new Error("Vercel OIDC is not available in this runtime");
}
export function getVercelOidcTokenSync(): string {
  throw new Error("Vercel OIDC is not available in this runtime");
}
export function getContext() {
  return {};
}
export default { getVercelOidcToken, getVercelOidcTokenSync, getContext };
