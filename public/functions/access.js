const CRM_ACCESS_PATH = "/crm/access";

async function proxyAccess(request) {
  const upstreamUrl = new URL(request.url);
  upstreamUrl.pathname = CRM_ACCESS_PATH;

  const upstreamRequest = new Request(upstreamUrl, request);
  const response = await fetch(upstreamRequest);
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("Content-Location", "/access");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export function onRequestGet({ request }) {
  return proxyAccess(request);
}

export function onRequestHead({ request }) {
  return proxyAccess(request);
}

export function onRequest() {
  return new Response("Method not allowed.", {
    status: 405,
    headers: {
      "Allow": "GET",
      "Cache-Control": "no-store"
    }
  });
}
