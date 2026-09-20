/** Server-only helpers for the Lovable AI Gateway. */

const RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

export function getLovableAiGatewayRunId(request: Request): string | undefined {
  return request.headers.get(RUN_ID_HEADER) ?? undefined;
}

export type LovableAiGatewayRunIdFetch = {
  fetch: typeof fetch;
  getRunId: () => string | undefined;
};

/**
 * Wraps fetch so the gateway-minted run id is sent on follow-up requests and
 * captured for the response headers.
 */
export function createLovableAiGatewayRunIdFetch(
  initialRunId?: string,
): LovableAiGatewayRunIdFetch {
  let runId = initialRunId;

  const wrapped: typeof fetch = async (input, init) => {
    const headers = new Headers(init?.headers);
    if (runId) headers.set(RUN_ID_HEADER, runId);
    const response = await fetch(input as RequestInfo, { ...init, headers });
    const returned = response.headers.get(RUN_ID_HEADER);
    if (returned) runId = returned;
    return response;
  };

  return { fetch: wrapped, getRunId: () => runId };
}

export function getLovableAiGatewayResponseHeaders(
  base?: HeadersInit,
  extra?: Record<string, string>,
): Record<string, string> {
  const headers = new Headers(base);
  for (const [key, value] of Object.entries(extra ?? {})) headers.set(key, value);
  return Object.fromEntries(headers.entries());
}

export function withLovableAiGatewayRunIdHeader(
  response: Response,
  runIdFetch: LovableAiGatewayRunIdFetch,
): Response {
  const runId = runIdFetch.getRunId();
  if (!runId) return response;
  const headers = new Headers(response.headers);
  headers.set(RUN_ID_HEADER, runId);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
