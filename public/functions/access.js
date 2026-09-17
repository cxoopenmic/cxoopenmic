const CRM_ACCESS_PATH = "/crm/access";
const PLATFORM_ORIGIN = "https://crm-worker.cxoopenmic.workers.dev";

async function proxyAccess(request) {
  const requestUrl = new URL(request.url);
  const upstreamUrl = new URL(CRM_ACCESS_PATH, PLATFORM_ORIGIN);
  upstreamUrl.search = requestUrl.search;

  const upstreamRequest = new Request(upstreamUrl, request);
  const response = await fetch(upstreamRequest);
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("Cloudflare-CDN-Cache-Control", "no-store");
  headers.set("Content-Location", "/access");
  headers.append("Vary", "Cookie");
  headers.append("Vary", "Authorization");

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
      "Cache-Control": "private, no-store, max-age=0",
      "Cloudflare-CDN-Cache-Control": "no-store"
    }
  });
}
