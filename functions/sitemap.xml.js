// Cloudflare Pages Function: serves /sitemap.xml automatically.
// Lists every main page, plus every blog post found in your Google Sheet (Insights tab),
// so new blogs reach Google without you editing anything.
const PAGES = [
  '', 'inbound', 'inbound/compare', 'inbound/tax', 'inbound/routes', 'inbound/faq',
  'outbound', 'outbound/compare', 'outbound/tax', 'outbound/routes', 'outbound/faq',
  'presentations', 'accreditation', 'insights', 'team', 'contact', 'terms', 'privacy',
];

function parseCSV(t) {
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) { if (ch === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cur); cur = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; row.push(cur); cur = ''; rows.push(row); row = []; }
    else cur += ch;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(c => String(c).trim() !== ''));
}

// must match slugify() in assets/app.js
function slugify(s) {
  let t = String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (t.length > 70) t = t.slice(0, 70).replace(/-[^-]*$/, '');
  return t;
}
const xml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function onRequest({ request, env }) {
  const origin = new URL(request.url).origin;
  let sheetId = '';
  try {
    const cfg = await (await env.ASSETS.fetch(new URL('/config.js', request.url))).text();
    sheetId = (cfg.match(/sheetId\s*:\s*["']([^"']+)["']/) || [])[1] || '';
  } catch (e) { /* ignore */ }

  const posts = [];
  if (sheetId) {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&headers=1&sheet=Insights`;
      const rows = parseCSV(await (await fetch(url, { cf: { cacheTtl: 600 } })).text());
      const head = rows[0].map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
      const ix = k => head.indexOf(k);
      if (ix('title') >= 0) {
        const seen = {};
        for (const r of rows.slice(1)) {
          const vis = String(r[ix('visible')] ?? 'yes').trim().toLowerCase();
          if (/^(no|false|0|hide|hidden)$/.test(vis)) continue;
          let s = slugify(r[ix('slug')]) || slugify(r[ix('title')]) || 'post';
          if (seen[s]) s += '-' + (++seen[s]); else seen[s] = 1;
          const d = String(r[ix('date')] || '').trim();
          posts.push({ loc: `${origin}/insights/${s}`, lastmod: /^\d{4}-\d{2}-\d{2}/.test(d) ? d.slice(0, 10) : '' });
        }
      }
    } catch (e) { /* sheet not reachable: sitemap still lists the main pages */ }
  }

  const urls = [
    ...PAGES.map(p => ({ loc: `${origin}/${p}`, lastmod: '' })),
    ...posts,
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url><loc>${xml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n') + `\n</urlset>\n`;
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=600' } });
}
