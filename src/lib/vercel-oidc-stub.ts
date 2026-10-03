// Stub for @vercel/oidc: the real package requires node:fs at load time, which
// crashes the edge server. This app never uses Vercel OIDC auth.
export async function getVercelOidcToken(): Promise<string> {
  throw new Error("Vercel OIDC is not available in this runtime");
}
export function getVercelOidcTokenSync(): string {
  throw new Error("Vercel OIDC is not available in this runtime");
}
export async function getContext() {
  return {};
}
export default { getVercelOidcToken, getVercelOidcTokenSync, getContext };
