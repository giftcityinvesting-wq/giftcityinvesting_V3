// Cloudflare Pages Function: serves /robots.txt and points search engines to your sitemap.
export async function onRequest({ request }) {
  const origin = new URL(request.url).origin;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
}
