const CRM_ACCESS_PATH = "/crm/access";
const PLATFORM_ORIGIN = "https://cxoopenmic.com";

async function proxyAccess(request) {
  const requestUrl = new URL(request.url);
  const upstreamUrl = new URL(CRM_ACCESS_PATH, PLATFORM_ORIGIN);
  upstreamUrl.search = requestUrl.search;

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
