// Cloudflare Pages Function: runs on every request.
// It replaces the __ORIGIN__ placeholder in index.html's social tags with your real domain,
// so link previews (WhatsApp, LinkedIn, X) get a correct absolute image address.
export async function onRequest(context) {
  const res = await context.next();
  const type = res.headers.get('content-type') || '';
  if (!type.includes('text/html')) return res;
  const origin = new URL(context.request.url).origin;
  const fix = {
    element(el) {
      for (const attr of ['content', 'href']) {
        const v = el.getAttribute(attr);
        if (v && v.indexOf('__ORIGIN__') === 0) el.setAttribute(attr, v.replace('__ORIGIN__', origin));
      }
    },
  };
  return new HTMLRewriter().on('meta', fix).on('link', fix).transform(res);
}
