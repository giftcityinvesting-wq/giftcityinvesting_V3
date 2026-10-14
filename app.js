/* GIFT City Investing: single-page app (v2).
   All content comes from Google Sheets (or data/fallback.json for anything missing). */
(() => {
'use strict';

const CFG = window.GCI_CONFIG || {};
const state = { data: {}, fb: {}, S: {}, C: {} };
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const GRIDS = ['Compare_Inbound', 'Compare_Outbound', 'Tax_Inbound', 'Tax_Outbound', 'Routes_Inbound', 'Routes_Outbound'];

/* =====================================================================
   HELPERS
   ===================================================================== */
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = u => { u = String(u || '').trim(); if (!u) return ''; return /^(https?:|mailto:|tel:|#|\/)/i.test(u) ? u : 'https://' + u; };
const hrefOf = u => { u = safeUrl(u); return u.startsWith('#/') ? '/' + u.slice(2) : u; };
const on = v => !/^(no|false|0|hide|hidden)$/i.test(String(v ?? 'yes').trim());
const byOrder = (a, b) => (parseFloat(a.order) || 0) - (parseFloat(b.order) || 0);
const S = (k, d = '') => (state.S[k] !== undefined && state.S[k] !== '' ? state.S[k] : d);
const C = (k, d = '') => (state.C[k] !== undefined && state.C[k] !== '' ? state.C[k] : d);
const list = name => (state.data[name] || []).filter(r => on(r.visible)).sort(byOrder);
const initials = n => String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
const isPH = u => !u || /REPLACE/i.test(u);
const ACCENTS = ['indigo', 'teal', 'violet', 'amber', 'pink'];
const accent = (a, i = 0) => ACCENTS.includes(String(a).toLowerCase()) ? String(a).toLowerCase() : ACCENTS[i % ACCENTS.length];
const GRADS = ['linear-gradient(135deg,#4a5bff,#7b4dff)', 'linear-gradient(135deg,#0fb89e,#2d7bff)', 'linear-gradient(135deg,#8c4dff,#d24dff)', 'linear-gradient(135deg,#ff9f1c,#ff5f6d)', 'linear-gradient(135deg,#ff4d94,#8a4dff)'];
const gradFor = i => GRADS[i % GRADS.length];
const canvaEmbed = u => { u = safeUrl(u); if (!/canva\.com/i.test(u)) return u; if (/embed/i.test(u)) return u; return u.replace(/[?#].*$/, '').replace(/\/$/, '') + '?embed'; };
const toast = msg => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 4200); };
const siteName = () => S('site_name', 'GIFT City Investing');
const plain = s => String(s ?? '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_#>`]+/g, '').replace(/\s+/g, ' ').trim();
const slugify = s => { let t = String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); if (t.length > 70) t = t.slice(0, 70).replace(/-[^-]*$/, ''); return t; };
const parseDate = d => { const m = String(d || '').match(/^(\d{4})-(\d{2})-(\d{2})/); const t = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(d); return isNaN(t) ? null : t; };
const fmtDate = d => { const t = parseDate(d); return t ? t.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : esc(d); };

/* inline formatting: **bold**, *italic*, [text](link), line breaks */
const inline = v => esc(v)
  .replace(/\*\*([^\s*](?:[^*]*[^\s*])?)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^\s*](?:[^*]*[^\s*])?)\*/g, '<em>$1</em>')
  .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => {
    const h = hrefOf(u.replace(/&amp;/g, '&'));
    const ext = /^https?:/i.test(h) && h.indexOf(location.origin) !== 0;
    return `<a href="${esc(h)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`;
  })
  .replace(/\r?\n/g, '<br>');

/* block formatting for blogs and legal text (each text line = one paragraph) */
function md(src) {
  const out = []; let lst = null;
  const flush = () => { if (lst) { out.push(`<${lst.t}>${lst.items.map(i => `<li>${inline(i)}</li>`).join('')}</${lst.t}>`); lst = null; } };
  for (const raw of String(src ?? '').replace(/\r/g, '').split('\n')) {
    const l = raw.trim(); let m;
    if (!l) { flush(); continue; }
    if ((m = l.match(/^(#{1,3})\s+(.*)$/))) { flush(); const n = m[1].length + 1; out.push(`<h${n}>${inline(m[2])}</h${n}>`); }
    else if (/^(-{3,}|\*{3,})$/.test(l)) { flush(); out.push('<hr>'); }
    else if ((m = l.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/))) { flush(); out.push(`<figure>${imgTag(m[2].replace(/&amp;/g, '&'), m[1], '', 1400)}${m[1] ? `<figcaption>${esc(m[1])}</figcaption>` : ''}</figure>`); }
    else if ((m = l.match(/^>\s?(.*)$/))) { flush(); out.push(`<blockquote>${inline(m[1])}</blockquote>`); }
    else if ((m = l.match(/^[-•]\s+(.*)$/))) { if (!lst || lst.t !== 'ul') { flush(); lst = { t: 'ul', items: [] }; } lst.items.push(m[1]); }
    else if ((m = l.match(/^\d+[.)]\s+(.*)$/))) { if (!lst || lst.t !== 'ol') { flush(); lst = { t: 'ol', items: [] }; } lst.items.push(m[1]); }
    else { flush(); out.push(`<p>${inline(l)}</p>`); }
  }
  flush();
  return out.join('');
}

/* images: Google Drive share links are converted to a direct image address */
const driveId = u => {
  u = String(u || '');
  const m = u.match(/drive\.google\.com\/file\/d\/([\w-]{10,})/) || u.match(/(?:drive|docs)\.google\.com\/[^\s?#]*\?(?:[^#\s]*&)?id=([\w-]{10,})/);
  return m ? m[1] : '';
};
function imgUrl(u, w = 1400) {
  u = String(u || '').trim(); if (!u) return '';
  const id = driveId(u);
  if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;
  if (/dropbox\.com/i.test(u)) return safeUrl(u).replace(/[?&]dl=\d/, '').replace(/\?.*$/, '') + '?raw=1';
  return safeUrl(u);
}
function imgTag(u, alt = '', cls = '', w = 1400, eager = false) {
  const src = imgUrl(u, w); if (!src) return '';
  const id = driveId(u);
  return `<img class="${esc(cls)}" src="${esc(src)}" alt="${esc(alt)}" ${eager ? '' : 'loading="lazy"'} decoding="async" referrerpolicy="no-referrer"${id ? ` data-did="${id}"` : ''}>`;
}

/* =====================================================================
   ICONS
   ===================================================================== */
const st = 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';
const ICON = {
  linkedin: `<svg viewBox="0 0 24 24"><text x="12" y="17.5" text-anchor="middle" font-size="15.5" font-weight="800" font-family="Inter,Arial,sans-serif" fill="currentColor">in</text></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M5 4.5l14 15M19 4.5l-14 15"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" ${st}><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r=".6" fill="currentColor"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24"><text x="12.5" y="20" text-anchor="middle" font-size="22" font-weight="800" font-family="Inter,Arial,sans-serif" fill="currentColor">f</text></svg>`,
  youtube: `<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="4.5" fill="currentColor"/><path d="M10 9l5 3-5 3z" fill="#fff"/></svg>`,
  discord: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>`,
  blog: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M5 5h14M5 9.500h10M5 14h14M5 18.500h8"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" ${st}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.500 7l8.500 6 8.500-6"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" ${st}><path d="M5 4h4l2 5-2.500 1.500a11 11 0 005 5L15 13l5 2v3.500a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" ${st}><path d="M12 3a9 9 0 00-7.700 13.600L3 21l4.500-1.200A9 9 0 1012 3z"/><path d="M9 8.500c0 3.500 3 6.500 6.500 6.500l1-1.800-2-1-1 .8a5 5 0 01-2.300-2.300l.8-1-1-2z"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" ${st}><path d="M12 21.500s7-6.200 7-11.800a7 7 0 10-14 0c0 5.600 7 11.800 7 11.800z"/><circle cx="12" cy="9.700" r="2.500"/></svg>`,
  play: `<svg viewBox="0 0 24 24"><path d="M7 4.500v15l13-7.500z" fill="#fff"/></svg>`,
  left: `<svg viewBox="0 0 24 24" ${st}><path d="M15 5l-7 7 7 7"/></svg>`,
  right: `<svg viewBox="0 0 24 24" ${st}><path d="M9 5l7 7-7 7"/></svg>`,
  arrow: `<svg width="16" height="16" viewBox="0 0 24 24" ${st}><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  copy: `<svg width="18" height="18" viewBox="0 0 24 24" ${st}><rect x="9" y="9" width="11" height="11" rx="2.500"/><path d="M5 15V6a2 2 0 012-2h9"/></svg>`
};

/* =====================================================================
   DATA LOADING (Google Sheets via the public gviz CSV endpoint)
   ===================================================================== */
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
const norm = h => String(h).trim().toLowerCase().replace(/\s+/g, '_');
function toObjects(rows) {
  if (!rows.length) return [];
  const head = rows[0].map(norm);
  return rows.slice(1).map(r => { const o = {}; head.forEach((h, i) => { if (h) o[h] = (r[i] ?? '').trim(); }); return o; });
}
function trimGrid(rows) {
  const w = rows.reduce((m, r) => { for (let i = r.length - 1; i >= 0; i--) if (String(r[i]).trim() !== '') return Math.max(m, i + 1); return m; }, 0);
  return rows.map(r => Array.from({ length: w }, (_, i) => String(r[i] ?? '').trim()));
}
async function fetchRows(name) {
  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(CFG.sheetId)}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(name)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const t = await r.text();
  if (/^\s*</.test(t)) throw new Error('not csv');
  return parseCSV(t);
}
/* Google silently returns the FIRST tab when a tab name does not exist, so we check the headings. */
const firstKey = n => { const f = state.fb[n]; return f && f[0] && !Array.isArray(f[0]) ? Object.keys(f[0])[0] : null; };
function validRows(name, rows) {
  if (!rows || !rows.length) return false;
  const h0 = String(rows[0][0] || '').trim().toLowerCase();
  if (/^how to use/.test(h0)) return false;
  if (GRIDS.includes(name)) return rows[0].length >= 2 && h0 !== 'key';
  const k = firstKey(name);
  return !k || rows[0].map(norm).includes(k);
}
async function loadFromSheet(names) {
  const res = await Promise.all(names.map(n => fetchRows(n).catch(() => null)));
  const out = {}; let ok = 0;
  names.forEach((n, i) => {
    if (!validRows(n, res[i])) return;
    const v = GRIDS.includes(n) ? trimGrid(res[i]) : toObjects(res[i]);
    if (v.length) { out[n] = v; ok++; }
  });
  return ok ? out : null;
}
const CACHE_KEY = 'gci:data:v2';
const readCache = () => { try { const c = JSON.parse(localStorage.getItem(CACHE_KEY)); return c && c.data ? c : null; } catch { return null; } };
const writeCache = data => { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), sheet: CFG.sheetId, data })); } catch { } };

/* Settings and Content merge key by key, so keys missing from your sheet still fall back to the sample text. */
function applyData(data) {
  state.data = data; state.S = {}; state.C = {};
  const fold = (tab, target) => [...(state.fb[tab] || []), ...(data[tab] || [])].forEach(r => { if (r && r.key) target[r.key] = r.value; });
  fold('Settings', state.S); fold('Content', state.C);
}

/* =====================================================================
   SEO: title, description, hidden hashtags, social tags, structured data
   ===================================================================== */
function metaTag(attr, key, val) {
  let m = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!m) { m = document.createElement('meta'); m.setAttribute(attr, key); document.head.appendChild(m); }
  m.setAttribute('content', val);
}
const originUrl = p => location.origin + p;
function canonicalUrl() { return originUrl(location.pathname.length > 1 ? location.pathname.replace(/\/+$/, '') : '/'); }
function hashtags(extra) {
  const base = list('Hashtags').map(h => String(h.hashtag || '').replace(/^#+/, '').trim());
  return [...new Set([...(extra || []), ...base].filter(Boolean))];
}
function orgLD() {
  const same = list('Socials').map(s => s.url).filter(u => /^https?:/i.test(u));
  const logo = S('logo_footer') ? imgUrl(S('logo_footer'), 600) : originUrl('/assets/favicon.png');
  return [
    { '@context': 'https://schema.org', '@type': 'Organization', name: siteName(), url: originUrl('/'), logo, email: S('email'), telephone: S('phone'), address: S('address'), sameAs: same },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: siteName(), url: originUrl('/'), description: S('tagline'), keywords: hashtags().join(', ') }
  ];
}
function setHead(o) {
  const title = o.title || siteName(), desc = o.description || S('tagline');
  const image = o.image ? imgUrl(o.image, 1200) : (S('og_image') ? imgUrl(S('og_image'), 1200) : originUrl('/assets/og-default.png'));
  document.title = title;
  metaTag('name', 'description', desc);
  metaTag('name', 'keywords', hashtags(o.tags).join(', '));
  metaTag('name', 'robots', o.noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large');
  metaTag('property', 'og:title', title); metaTag('property', 'og:description', desc);
  metaTag('property', 'og:type', o.type || 'website'); metaTag('property', 'og:url', canonicalUrl());
  metaTag('property', 'og:image', image); metaTag('property', 'og:site_name', siteName());
  metaTag('name', 'twitter:card', 'summary_large_image'); metaTag('name', 'twitter:title', title);
  metaTag('name', 'twitter:description', desc); metaTag('name', 'twitter:image', image);
  let l = document.head.querySelector('link[rel="canonical"]');
  if (!l) { l = document.createElement('link'); l.rel = 'canonical'; document.head.appendChild(l); }
  l.href = canonicalUrl();
  let s = $('#ld');
  if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'ld'; document.head.appendChild(s); }
  s.textContent = JSON.stringify([...orgLD(), ...(o.ld || [])]);
}
const TAB_LABEL = { funds: '', compare: 'Compare funds', tax: 'Tax benefits', routes: 'Investment routes', faq: 'FAQ' };
function pageSEO(page, sub) {
  const row = list('SEO').find(r => String(r.page).trim().toLowerCase() === page);
  let title = row && row.title, desc = row && row.description;
  if (page === 'home') { title = title || `${siteName()} | ${S('tagline')}`; desc = desc || C('hero_subtitle'); }
  else if (page === 'terms' || page === 'privacy') { title = title || `${page === 'terms' ? 'Terms of Use' : 'Privacy Policy'} | ${siteName()}`; desc = desc || S('tagline'); }
  else { title = title || `${plain(C(page + '_title'))} | ${siteName()}`; desc = desc || C(page + '_subtitle'); }
  if ((page === 'inbound' || page === 'outbound') && TAB_LABEL[sub]) title = `${TAB_LABEL[sub]}: ${title}`;
  return { title, description: plain(desc) };
}
const faqLD = rows => rows.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: rows.map(r => ({ '@type': 'Question', name: plain(r.q), acceptedAnswer: { '@type': 'Answer', text: plain(r.a) } })) }] : [];

/* =====================================================================
   SHARED UI PIECES
   ===================================================================== */
const NAV = [
  ['home', 'Home', '/'], ['inbound', 'Inbound Funds', '/inbound'], ['outbound', 'Outbound Funds', '/outbound'],
  ['presentations', 'Presentations', '/presentations'], ['accreditation', 'Accreditation', '/accreditation'], ['insights', 'Insights', '/insights'], ['team', 'Team', '/team']
];
const logoMark = cls => `<span class="mark ${cls || ''}"><i></i><i></i><i></i><i></i></span>`;
function logoHTML(where) {
  const u = S(where === 'nav' ? 'logo_nav' : 'logo_footer');
  const name = `<span>${esc(siteName())}</span>`;
  if (u) return imgTag(u, siteName(), 'logo-img ' + where, 600, true) + (/^(yes|true|1)$/i.test(S('logo_show_name')) ? name : '');
  return logoMark(where === 'footer' ? 'lg' : '') + name;
}
function head(eyebrow, title, sub, center) {
  return `<div class="head ${center ? 'center' : ''} reveal"><span class="eyebrow">${esc(eyebrow)}</span><h2 class="h2">${inline(title)}</h2>${sub ? `<p class="lead">${inline(sub)}</p>` : ''}</div>`;
}
const orbs = `<div class="orbs"><span class="orb o1"></span><span class="orb o2"></span><span class="orb o3"></span></div>`;
function pageHero(key) {
  return `<section class="phero dark">${orbs}<div class="wrap">
    <span class="eyebrow reveal">${esc(C(key + '_eyebrow'))}</span>
    <h1 class="h1 reveal" style="--i:1;font-size:clamp(40px,7vw,84px)">${inline(C(key + '_title'))}</h1>
    <p class="lead reveal" style="--i:2">${inline(C(key + '_subtitle'))}</p></div></section>`;
}
function ctaBlock() {
  return `<section class="sec" style="padding-top:0"><div class="wrap"><div class="cta reveal zoom">
    <h2 class="h2">${inline(C('cta_title', 'Ready to invest through GIFT City?'))}</h2>
    <p>${inline(C('cta_subtitle'))}</p>
    <a class="btn btn-primary" href="/contact">${esc(C('cta_button', 'Get in touch'))} ${ICON.arrow}</a></div></div></section>`;
}
const presCard = (p, i) => {
  const soon = isPH(p.url);
  return `<button class="pcard a-${accent(p.accent, i)} ${soon ? 'soon' : ''} reveal" style="--i:${i}" ${soon ? 'disabled' : `data-pres="${esc(p.url)}" data-title="${esc(p.title)}"`}>
    <span class="chip" style="margin-bottom:auto">${esc(p.category || 'Presentation')}</span>
    <h3>${esc(p.title)}</h3><p>${esc(p.description)}</p>
    <span class="go">${soon ? 'Coming soon' : `Watch presentation ${ICON.arrow}`}</span></button>`;
};
const fundPresentations = () => list('Funds').filter(f => !isPH(f.presentation_url)).map((f, i) => ({ category: 'Fund', title: f.name + ' presentation', description: f.tagline, url: f.presentation_url, accent: f.accent || ACCENTS[i % 5] }));
const consent = () => `<label class="check"><input type="checkbox" name="consent" required><span>I agree to the <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms</a>.</span></label>`;
const hp = `<input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">`;

/* ----- comparison-style tables with merged cells ----- */
/* A merged cell in Google Sheets exports as ONE value followed by empty cells. We rebuild the merge:
   an empty cell joins the value to its left (colspan) and/or above it (rowspan). Type a dash for a real empty cell. */
function buildGrid(rows) {
  const R = rows.length, W = Math.max(...rows.map(r => r.length));
  const g = rows.map(r => Array.from({ length: W }, (_, c) => String(r[c] ?? '').trim()));
  /* 1) horizontal: empty cells to the right of a value belong to that value (the first column never extends sideways) */
  const own = g.map(() => Array(W).fill(false)), run = g.map(() => Array(W).fill(1));
  for (let r = 0; r < R; r++) for (let c = 1; c < W; c++) if (g[r][c] !== '') {
    let j = c + 1; while (j < W && g[r][j] === '') { own[r][j] = true; j++; }
    run[r][c] = j - c;
  }
  /* 2) vertical: a value also grows downward over rows that are completely empty under its width */
  const used = g.map(() => Array(W).fill(false)), out = [];
  for (let r = 0; r < R; r++) {
    const line = [];
    for (let c = 0; c < W; c++) {
      if (used[r][c]) continue;
      const v = g[r][c]; const cs = v !== '' ? run[r][c] : 1; let rs = 1;
      if (v !== '' && r > 0) {
        const free = rr => { for (let k = c; k < c + cs; k++) if (g[rr][k] !== '' || own[rr][k] || used[rr][k]) return false; return true; };
        while (r + rs < R && free(r + rs)) rs++;
      }
      for (let i = r; i < r + rs; i++) for (let j = c; j < c + cs; j++) used[i][j] = true;
      line.push({ r, c, v, cs, rs });
    }
    out.push(line);
  }
  return { cells: out, cols: W };
}
function gridTable(rows) {
  if (!rows || rows.length < 1) return '';
  const { cells, cols } = buildGrid(rows);
  const n = Math.max(1, cols - 1);
  const hl = new Set(); cells[0].forEach(x => { if (x.c > 0 && /gift/i.test(x.v)) for (let k = 0; k < x.cs; k++) hl.add(x.c + k); });
  const cls = x => [x.cs > 1 || x.rs > 1 ? 'mg' : '', x.cs === 1 && hl.has(x.c) ? 'colhl' : ''].filter(Boolean).join(' ');
  const span = x => `${x.cs > 1 ? ` colspan="${x.cs}"` : ''}${x.rs > 1 ? ` rowspan="${x.rs}"` : ''}`;
  return `<div class="tbl-wrap reveal zoom"><table class="cmp" style="--n:${n}">
    <colgroup><col class="c0">${'<col>'.repeat(n)}</colgroup>
    <thead><tr>${cells[0].map(x => `<th${span(x)} class="${cls(x)}">${inline(x.v)}</th>`).join('')}</tr></thead>
    <tbody>${cells.slice(1).map(line => `<tr>${line.map(x => x.c === 0 ? `<th scope="row"${span(x)} class="${cls(x)}">${inline(x.v)}</th>` : `<td${span(x)} class="${cls(x)}">${inline(x.v)}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>`;
}

/* =====================================================================
   PAGES
   ===================================================================== */
const pages = {};
const benefitCards = aud => `<div class="cards">${list('Benefits').filter(b => b.audience === aud).map((b, i) => `
  <div class="card c${(i % 3) + 1}"><div class="ico">${i + 1}</div><h3>${esc(b.title)}</h3><p>${esc(b.description)}</p></div>`).join('')}</div>`;

pages.home = () => {
  const stats = list('Stats'), ben = list('Benefits');
  const audiences = [...new Set(ben.map(b => b.audience))];
  const tl = list('Timeline');
  const funds = list('Funds').filter(f => on(f.show_in_carousel));
  const gift = list('Presentations').find(p => /gift/i.test(p.category)) || list('Presentations')[0];
  const pres = list('Presentations').slice(0, 3);
  return `
  <section class="hero dark">${orbs}<div class="gridbg"></div>
    <div class="wrap hero-inner">
      <span class="pill reveal">${esc(C('hero_eyebrow'))}</span>
      <h1 class="h1 reveal grad-wrap" style="--i:1"><span class="grad-text">${esc(C('hero_title'))}</span></h1>
      <p class="lead reveal" style="--i:2">${inline(C('hero_subtitle'))}</p>
      <div class="cta-row reveal" style="--i:3">
        <a class="btn btn-primary" href="${esc(hrefOf(C('hero_cta_primary_link', '/presentations')))}">${esc(C('hero_cta_primary_label', 'Explore GIFT City'))}</a>
        <a class="btn btn-ghost" href="${esc(hrefOf(C('hero_cta_secondary_link', '/contact')))}">${esc(C('hero_cta_secondary_label', 'Talk to us'))}</a>
      </div>
    </div>
    ${stats.length ? `<div class="hero-stats"><div class="wrap"><div class="stat-strip reveal" style="--i:4">${stats.map(s => `
      <div class="stat"><b>${esc(s.prefix)}<span data-count="${esc(parseFloat(s.value) || 0)}">${esc(s.value)}</span>${esc(s.suffix)}</b><span>${esc(s.label)}</span></div>`).join('')}</div></div></div>` : ''}
  </section>

  <section class="sec"><div class="wrap split">
    <div class="about-text reveal"><span class="eyebrow">${esc(C('about_eyebrow'))}</span>
      <h2 class="h2">${inline(C('about_title'))}</h2>
      ${String(C('about_text')).split(/\r?\n/).filter(x => x.trim()).map(x => `<p>${inline(x)}</p>`).join('')}
    </div>
    <div class="reveal zoom" style="--i:2">
      <div class="vcard" ${gift && !isPH(gift.url) ? `data-pres="${esc(gift.url)}" data-title="${esc(gift.title)}"` : 'data-soon="1"'} role="button" tabindex="0">
        <div class="vcard-in"><div class="play">${ICON.play}</div><div class="h3">${esc(C('about_button', 'Watch the presentation'))}</div></div>
      </div>
    </div>
  </div></section>

  ${ben.length ? `<section class="sec soft"><div class="wrap">
    ${head(C('benefits_eyebrow'), C('benefits_title'), C('benefits_subtitle'))}
    <div class="seg reveal" id="benseg"><span class="thumb"></span>${audiences.map((a, i) => `<button data-aud="${esc(a)}" class="${i ? '' : 'on'}">${esc(a)}</button>`).join('')}</div>
    <div id="benpanel" class="panel">${benefitCards(audiences[0])}</div>
  </div></section>` : ''}

  ${tl.length ? `<section class="sec dark"><div class="wrap">
    ${head(C('timeline_eyebrow'), C('timeline_title'), C('timeline_subtitle'), true)}
    <div class="tl" id="tl"><div class="tl-line"><div class="tl-fill" id="tlfill"></div></div>
      ${tl.map(t => `<div class="tl-item reveal"><span class="tl-dot"></span><div class="tl-card"><div class="tl-year">${esc(t.year)}</div><h3>${esc(t.title)}</h3><p>${esc(t.description)}</p></div></div>`).join('')}
    </div></div></section>` : ''}

  ${funds.length ? `<section class="sec" style="padding-bottom:30px"><div class="wrap car-head">
      <div>${head(C('funds_eyebrow'), C('funds_title'), C('funds_subtitle'))}</div>
      <div class="car-nav reveal"><button data-car="-1" aria-label="Previous">${ICON.left}</button><button data-car="1" aria-label="Next">${ICON.right}</button></div>
    </div>
    <div class="track" id="track">${funds.map((f, i) => `
      <article class="fcard a-${accent(f.accent, i)}"><span class="chip">${esc(f.type)} fund</span>
        <h3>${esc(f.name)}</h3><p class="tag">${esc(f.tagline)}</p>
        <div class="acts"><a class="btn" href="/${f.type === 'outbound' ? 'outbound' : 'inbound'}">Learn more</a>
        ${isPH(f.presentation_url) ? '' : `<button class="btn o" data-pres="${esc(f.presentation_url)}" data-title="${esc(f.name)}">Presentation</button>`}</div></article>`).join('')}
    </div></section>` : ''}

  ${pres.length ? `<section class="sec"><div class="wrap">
    ${head(C('presentations_eyebrow'), C('presentations_title'), C('presentations_subtitle'))}
    <div class="pgrid">${pres.map((p, i) => presCard({ ...p, accent: ACCENTS[(i + 1) % 5] }, i)).join('')}</div>
    <div class="reveal" style="margin-top:34px"><a class="link" href="/presentations">View all presentations ${ICON.arrow}</a></div>
  </div></section>` : ''}

  ${ctaBlock()}`;
};

/* ----- inbound / outbound ----- */
const TABS = [['funds', 'Funds'], ['compare', 'Compare'], ['tax', 'Tax benefits'], ['routes', 'Investment routes'], ['faq', 'FAQ']];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function tabBody(type, tab) {
  const funds = list('Funds').filter(f => f.type === type);
  const note = S('disclaimer') ? `<p class="note">${esc(S('disclaimer'))}</p>` : '';
  const gridTab = (prefix, eyebrow, title, sub) => {
    const rows = state.data[`${prefix}_${cap(type)}`];
    if (!rows || !rows.length) return `<div class="wrap"><p class="lead">Coming soon.</p></div>`;
    return `<div class="wrap">${head(eyebrow, title, sub)}${gridTable(rows)}${note}</div>`;
  };
  if (tab === 'compare') return gridTab('Compare', 'Compare', type === 'inbound' ? 'Inbound funds, side by side.' : 'Outbound funds vs direct equity.', 'Every parameter in one table. Scroll sideways to see more funds.');
  if (tab === 'tax') return gridTab('Tax', 'Tax benefits', 'Keep more of what you earn.', 'How investing through GIFT City compares with the traditional route.');
  if (tab === 'routes') return gridTab('Routes', 'Investment routes', 'Choose your route.', 'The GIFT City route and the traditional route, compared.');
  if (tab === 'faq') {
    const f = list('FAQ').filter(x => x.type === type);
    return `<div class="wrap">${head('FAQ', 'Questions, answered.', '', true)}
      <div class="faq">${f.map((x, i) => `<div class="fq reveal" style="--i:${i}"><button class="fq-q" aria-expanded="false">${esc(x.question)}<i></i></button><div class="fq-a"><div><p>${inline(x.answer)}</p></div></div></div>`).join('')}</div></div>`;
  }
  return `<div class="wrap">${head(type === 'inbound' ? 'Inbound funds' : 'Outbound funds', 'Choose your fund.', 'Open any fund for details or watch its presentation.')}
    <div class="fgrid">${funds.map((f, i) => `
      <article class="fpage reveal" style="--i:${i}">
        <div class="top a-${accent(f.accent, i)}"><span>${esc(f.amc)}</span><h3>${esc(f.name)}</h3></div>
        <div class="body"><p><strong>${esc(f.tagline)}</strong></p>
          <div class="metrics"><div><b>${esc(f.category)}</b><small>Category</small></div><div><b>${esc(f.min_investment)}</b><small>Minimum</small></div><div><b>${esc(f.risk)}</b><small>Risk</small></div></div>
          <ul class="hl">${String(f.highlights || '').split('|').filter(x => x.trim()).map(h => `<li>${esc(h.trim())}</li>`).join('')}</ul>
          <div class="acts"><button class="btn btn-light btn-sm" data-fund="${esc(f.id)}">Details</button>
            ${isPH(f.presentation_url) ? '' : `<button class="btn btn-primary btn-sm" data-pres="${esc(f.presentation_url)}" data-title="${esc(f.name)}">Presentation</button>`}
            ${f.factsheet_url ? `<a class="btn btn-light btn-sm" target="_blank" rel="noopener" href="${esc(safeUrl(f.factsheet_url))}">Factsheet</a>` : ''}</div></div></article>`).join('')}</div></div>`;
}
const fundPage = type => sub => {
  const tab = TABS.some(t => t[0] === sub) ? sub : 'funds';
  return `${pageHero(type)}
    <div class="tabbar"><div class="tabs" id="tabs">${TABS.map(t => `<a href="/${type}/${t[0]}" data-tab="${t[0]}" class="${t[0] === tab ? 'on' : ''}">${t[1]}</a>`).join('')}</div></div>
    <div class="tabpanel" id="tabpanel">${tabBody(type, tab)}</div>${ctaBlock()}`;
};
pages.inbound = fundPage('inbound');
pages.outbound = fundPage('outbound');

pages.presentations = () => {
  const p = list('Presentations'), f = fundPresentations();
  return `${pageHero('presentations')}<section class="sec" style="padding-top:70px"><div class="wrap">
    ${p.length ? `<h3 class="sub-h">GIFT City & investing</h3><div class="pgrid">${p.map((x, i) => presCard({ ...x, accent: ACCENTS[(i + 1) % 5] }, i)).join('')}</div>` : ''}
    ${f.length ? `<h3 class="sub-h">Fund presentations</h3><div class="pgrid">${f.map((x, i) => presCard(x, i)).join('')}</div>` : ''}
  </div></section>${ctaBlock()}`;
};

/* ----- accreditation ----- */
function sealSVG(text, center) {
  let t = String(text || 'Accredited Investor ·').toUpperCase(); const base = t;
  while (t.length < 34) t += ' ' + base;
  const star = Array.from({ length: 10 }, (_, i) => { const a = (-90 + i * 36) * Math.PI / 180, r = i % 2 ? 11 : 28; return `${(150 + r * Math.cos(a)).toFixed(1)},${(206 + r * Math.sin(a)).toFixed(1)}`; }).join(' ');
  const lines = String(center || '').split(/\s+/); const half = Math.ceil(lines.length / 2);
  const l1 = lines.slice(0, half).join(' '), l2 = lines.slice(half).join(' ');
  return `<svg viewBox="0 0 300 300" role="img" aria-label="${esc(center)}">
    <defs><linearGradient id="sealg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b6cff"/><stop offset=".5" stop-color="#ff5fa8"/><stop offset="1" stop-color="#ffb53d"/></linearGradient>
    <path id="sealpath" d="M150,150 m-112,0 a112,112 0 1,1 224,0 a112,112 0 1,1 -224,0"/></defs>
    <circle cx="150" cy="150" r="146" fill="none" stroke="url(#sealg)" stroke-width="1.6" opacity=".7"/>
    <circle cx="150" cy="150" r="130" fill="none" stroke="url(#sealg)" stroke-width="2.4"/>
    <circle cx="150" cy="150" r="92" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="1" stroke-dasharray="1 5" stroke-linecap="round"/>
    <g class="spin"><text font-size="13.5" font-weight="600" fill="#fff" letter-spacing="1"><textPath href="#sealpath" textLength="690" lengthAdjust="spacing">${esc(t)}</textPath></text></g>
    <text x="150" y="146" text-anchor="middle" font-size="17" font-style="italic" font-weight="600" fill="#fff" font-family="Georgia,serif">${esc(l1)}</text>
    <text x="150" y="168" text-anchor="middle" font-size="17" font-style="italic" font-weight="600" fill="#fff" font-family="Georgia,serif">${esc(l2)}</text>
    <polygon points="${star}" fill="none" stroke="url(#sealg)" stroke-width="2" stroke-linejoin="round"/></svg>`;
}
pages.accreditation = () => {
  const rows = list('Accreditation_Page');
  const sec = s => rows.filter(r => String(r.section).trim().toLowerCase() === s);
  const stats = sec('stat'), ben = sec('benefit'), prod = sec('product'), crit = sec('criteria'), steps = sec('step'), faq = sec('faq');
  let seq = []; if (prod.length) while (seq.length < 8) seq = seq.concat(prod);
  const mq = seq.map(p => `<div class="mq-card"><small>${esc(p.value)}</small><b>${esc(p.title)}</b></div>`).join('');
  return `
  <section class="phero dark acc-hero">${orbs}<div class="wrap acc-grid">
    <div>
      <span class="pill reveal">${esc(C('accreditation_eyebrow'))}</span>
      <h1 class="h1 reveal" style="--i:1;font-size:clamp(40px,6.4vw,78px);margin:24px 0 22px">${inline(C('accreditation_title'))}</h1>
      <p class="lead reveal" style="--i:2">${inline(C('accreditation_subtitle'))}</p>
      <div class="cta-row reveal" style="--i:3;justify-content:flex-start;margin-top:34px"><button class="btn btn-primary" data-scroll="acc-apply">${esc(C('acc_cta_label', 'Begin your application'))} ${ICON.arrow}</button></div>
    </div>
    <div class="seal reveal zoom" style="--i:2">${sealSVG(C('acc_seal_text'), C('acc_seal_center'))}</div>
  </div>
  ${stats.length ? `<div class="wrap"><div class="stat-strip reveal" style="--i:3;margin-top:56px">${stats.map(s => {
    const m = String(s.value).match(/^(\D*?)(\d[\d,]*\.?\d*)(.*)$/);
    const v = m ? `${esc(m[1])}<span data-count="${esc(m[2].replace(/,/g, ''))}">${esc(m[2])}</span>${esc(m[3])}` : esc(s.value);
    return `<div class="stat"><b>${v}</b><span>${esc(s.title)}</span></div>`;
  }).join('')}</div></div>` : ''}
  </section>

  <section class="sec"><div class="wrap">
    ${head(C('acc_what_eyebrow'), C('acc_what_title'), C('acc_what_text'))}
    <div class="cards">${ben.map((b, i) => `<div class="card dcard reveal" style="--i:${i}"><div class="ring">${esc(b.value || i + 1)}</div><h3>${esc(b.title)}</h3><p>${esc(b.description)}</p></div>`).join('')}</div>
    <div class="gateway reveal zoom"><h2 class="h2">${inline(C('acc_gateway_title'))}</h2><p>${inline(C('acc_gateway_text'))}</p></div>
  </div></section>

  ${prod.length ? `<section class="sec" style="padding:0 0 clamp(60px,9vw,110px)"><div class="wrap"><span class="eyebrow reveal">${esc(C('acc_products_eyebrow'))}</span></div>
    <div class="mq reveal"><div class="mq-track">${mq}${mq}</div></div></section>` : ''}

  ${crit.length ? `<section class="sec dark"><div class="wrap">
    ${head(C('acc_criteria_eyebrow'), C('acc_criteria_title'), C('acc_criteria_text'))}
    <div class="crit" style="--n:${Math.min(crit.length, 4)}">${crit.map((c, i) => `<div class="crit-card reveal" style="--i:${i}"><small>${esc(c.title)}</small><b>${esc(c.value)}</b><p>${esc(c.description)}</p>${i < crit.length - 1 ? '<span class="or">OR</span>' : ''}</div>`).join('')}</div>
  </div></section>` : ''}

  ${steps.length ? `<section class="sec soft"><div class="wrap">
    ${head(C('acc_steps_eyebrow'), C('acc_steps_title'), C('acc_steps_text'))}
    <div class="acc-steps">${steps.map((s, i) => `<div class="acc-step reveal" style="--i:${i}"><span class="num">${String(i + 1).padStart(2, '0')}</span><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p></div>`).join('')}</div>
  </div></section>` : ''}

  <section class="sec" id="acc-apply"><div class="wrap">
    <div class="apply reveal zoom">
      <div class="apply-l"><span class="eyebrow">${esc(C('acc_final_eyebrow'))}</span><h2 class="h2">${inline(C('acc_final_title'))}</h2>
        <h3 style="margin-top:26px">${esc(C('acc_form_title'))}</h3><p>${inline(C('acc_form_text'))}</p></div>
      <form class="form" data-lead="accreditation">
        <div class="row2"><label>Name<input name="name" required autocomplete="name"></label><label>Email<input name="email" type="email" required autocomplete="email"></label></div>
        <div class="row2"><label>Phone<input name="phone" type="tel" autocomplete="tel"></label>
          <label>Route you may qualify under<select name="route">${crit.map(c => `<option>${esc(c.title)}</option>`).join('')}<option>Not sure yet</option></select></label></div>
        <input type="hidden" name="interest" value="Accreditation">
        <label>Message (optional)<textarea name="message" style="min-height:90px"></textarea></label>
        ${hp}${consent()}
        <button class="btn btn-primary" type="submit" style="justify-content:center">${esc(C('acc_cta_label', 'Begin your application'))}</button>
      </form>
    </div>
  </div></section>

  ${faq.length ? `<section class="sec" style="padding-top:0"><div class="wrap">
    ${head(C('acc_faq_eyebrow'), C('acc_faq_title'), '', true)}
    <div class="faq">${faq.map((x, i) => `<div class="fq reveal" style="--i:${i}"><button class="fq-q" aria-expanded="false">${esc(x.title)}<i></i></button><div class="fq-a"><div><p>${inline(x.description)}</p></div></div></div>`).join('')}</div>
  </div></section>` : ''}`;
};

/* ----- insights (blog) ----- */
function posts() {
  const seen = {};
  return list('Insights').map(p => {
    let s = slugify(p.slug) || slugify(p.title) || 'post';
    if (seen[s]) s += '-' + (++seen[s]); else seen[s] = 1;
    return { ...p, _slug: s };
  }).sort((a, b) => ((parseDate(b.date) || 0) - (parseDate(a.date) || 0)));
}
function postCard(p, i, big) {
  const ext = !p.content && p.link;
  const href = ext ? safeUrl(p.link) : `/insights/${p._slug}`;
  return `<a class="post reveal ${big ? 'big' : ''}" style="--i:${i % 3}" data-cat="${esc(p.category)}" href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}>
    <div class="img" style="--g:${gradFor(i)}"><span class="ini">${esc(initials(plain(p.title)))}</span>${imgTag(p.image, plain(p.title), '', 1000)}</div>
    <div class="tx"><div class="cat">${esc(p.category)}</div><h3 class="h3">${inline(p.title)}</h3><p>${inline(p.summary)}</p>
    <div class="foot"><span>${fmtDate(p.date)}</span><span class="rd">Read article ${ICON.arrow}</span></div></div></a>`;
}
function insightsList() {
  const all = posts();
  const feat = all.find(p => /^(yes|true|1)$/i.test(p.featured));
  const rest = all.filter(p => p !== feat);
  const cats = [...new Set(all.map(p => p.category).filter(Boolean))];
  return `${pageHero('insights')}<section class="sec" style="padding-top:70px"><div class="wrap">
    ${cats.length > 1 ? `<div class="chips" id="chips"><button class="on" data-cat="">All</button>${cats.map(c => `<button data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>` : ''}
    <div class="pgrid" id="posts">${feat ? postCard(feat, 0, true) : ''}${rest.map((p, i) => postCard(p, i + 1)).join('')}</div>
  </div></section>${ctaBlock()}`;
}
function article(slug) {
  const all = posts(); const p = all.find(x => x._slug === slug);
  if (!p) return null;
  const i = all.indexOf(p);
  const words = plain(p.content || p.summary).split(/\s+/).length, mins = Math.max(1, Math.round(words / 200));
  const url = canonicalUrl(), enc = encodeURIComponent;
  const rel = all.filter(x => x !== p).slice(0, 2);
  return `<article>
    <section class="phero dark art-hero">${orbs}<div class="wrap narrow">
      <a class="back reveal" href="/insights">← All insights</a>
      <div class="meta-row reveal" style="--i:1">${p.category ? `<span class="cat-pill">${esc(p.category)}</span>` : ''}<span>${fmtDate(p.date)}</span><span>${mins} min read</span>${p.author ? `<span>By ${esc(p.author)}</span>` : ''}</div>
      <h1 class="h1 reveal" style="--i:2;font-size:clamp(32px,5.2vw,60px);text-align:left">${inline(p.title)}</h1>
      <p class="lead reveal" style="--i:3;text-align:left;margin:0">${inline(p.summary)}</p></div></section>
    ${p.image ? `<div class="wrap narrow"><div class="art-cover reveal zoom" style="--g:${gradFor(i)}">${imgTag(p.image, plain(p.title), '', 1600, true)}</div></div>` : ''}
    <section class="sec" style="padding-top:56px"><div class="wrap narrow">
      <div class="prose">${md(p.content || p.summary)}</div>
      <div class="share"><span>Share this article</span>
        <button class="sh" data-copy="${esc(url)}" aria-label="Copy link">${ICON.copy} Copy link</button>
        <a class="sh" target="_blank" rel="noopener" href="https://wa.me/?text=${enc(plain(p.title) + ' ' + url)}">${ICON.whatsapp} WhatsApp</a>
        <a class="sh" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}">${ICON.linkedin} LinkedIn</a>
        <a class="sh" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(plain(p.title))}">${ICON.x} Post</a></div>
      ${S('disclaimer') ? `<p class="note" style="margin-top:34px">${esc(S('disclaimer'))}</p>` : ''}
    </div></section>
    ${rel.length ? `<section class="sec soft"><div class="wrap"><div class="head reveal"><span class="eyebrow">Keep reading</span><h2 class="h2" style="font-size:clamp(28px,4vw,44px)">More insights</h2></div>
      <div class="pgrid">${rel.map((x, k) => postCard(x, all.indexOf(x) + k)).join('')}</div></div></section>` : ''}
    ${ctaBlock()}</article>`;
}
pages.insights = sub => (sub ? (article(sub) || pages.notfound()) : insightsList());

/* ----- team, contact, legal ----- */
pages.team = () => `${pageHero('team')}<section class="sec" style="padding-top:70px"><div class="wrap"><div class="cards team">
  ${list('Team').map((m, i) => `<div class="card person reveal" style="--i:${i % 3}">
    <div class="portrait" style="--g:${gradFor(i)}"><span class="ini">${esc(initials(m.name))}</span>${imgTag(m.photo, m.name, '', 900)}</div>
    <h3>${esc(m.name)}</h3><div class="role">${esc(m.role)}</div><p>${inline(m.bio)}</p>
    ${m.linkedin ? `<a class="in" target="_blank" rel="noopener" aria-label="LinkedIn" href="${esc(safeUrl(m.linkedin))}">${ICON.linkedin}</a>` : ''}</div>`).join('')}
  </div></div></section>${ctaBlock()}`;

pages.contact = () => {
  const wa = String(S('whatsapp_number')).replace(/\D/g, '');
  return `${pageHero('contact')}<section class="sec" style="padding-top:70px"><div class="wrap contact-grid">
    <div class="stack reveal">
      ${S('email') ? `<a class="ci" href="mailto:${esc(S('email'))}"><span class="ic">${ICON.mail}</span><span><small>Email</small><b>${esc(S('email'))}</b></span></a>` : ''}
      ${S('phone') ? `<a class="ci" href="tel:${esc(String(S('phone')).replace(/[^\d+]/g, ''))}"><span class="ic">${ICON.phone}</span><span><small>Phone</small><b>${esc(S('phone'))}</b></span></a>` : ''}
      ${wa ? `<a class="ci" target="_blank" rel="noopener" href="https://wa.me/${wa}"><span class="ic">${ICON.whatsapp}</span><span><small>WhatsApp</small><b>Chat on WhatsApp</b></span></a>` : ''}
      ${S('address') ? `<a class="ci" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(S('address'))}"><span class="ic">${ICON.pin}</span><span><small>Visit us</small><b>${esc(S('address'))}</b></span></a>` : ''}
    </div>
    <form class="form reveal" style="--i:2" data-lead="contact">
      <div class="row2"><label>Name<input name="name" required autocomplete="name"></label><label>Email<input name="email" type="email" required autocomplete="email"></label></div>
      <div class="row2"><label>Phone<input name="phone" type="tel" autocomplete="tel"></label>
        <label>I am interested in<select name="interest"><option>Inbound funds</option><option>Outbound funds</option><option>Accreditation</option><option>GIFT City setup</option><option>Something else</option></select></label></div>
      <label>Message<textarea name="message" required></textarea></label>
      ${hp}${consent()}
      <button class="btn btn-primary" type="submit" style="justify-content:center">Send message</button>
    </form></div></section>`;
};
const legal = (title, key) => () => `<section class="phero dark">${orbs}<div class="wrap"><h1 class="h1" style="font-size:clamp(38px,6vw,72px)">${title}</h1></div></section>
  <section class="sec" style="padding-top:60px"><div class="wrap narrow"><div class="prose legal">${md(C(key))}</div></div></section>`;
pages.terms = legal('Terms of Use', 'terms_text');
pages.privacy = legal('Privacy Policy', 'privacy_text');
pages.notfound = () => `<section class="phero dark" style="min-height:70vh;display:grid;align-items:center">${orbs}<div class="wrap">
  <span class="eyebrow">404</span><h1 class="h1" style="font-size:clamp(40px,7vw,84px)">Page not found.</h1>
  <p class="lead" style="margin-bottom:30px">The page you are looking for has moved or does not exist.</p><a class="btn btn-primary" href="/">Back to home</a></div></section>`;

/* =====================================================================
   CHROME: nav, footer, favicon
   ===================================================================== */
function renderChrome() {
  $('.brand').innerHTML = logoHTML('nav');
  $('#navlinks').innerHTML = NAV.map(n => `<a href="${n[2]}" data-nav="${n[0]}">${n[1]}</a>`).join('') + `<a href="/contact" data-nav="contact" class="m-only">Contact</a>`;
  const an = $('#announce'); if (S('announcement')) { an.hidden = false; an.textContent = S('announcement'); } else an.hidden = true;
  if (S('favicon')) $$('link[rel~="icon"]').forEach((l, i) => { if (i === 0) { l.href = imgUrl(S('favicon'), 256); l.removeAttribute('type'); l.removeAttribute('sizes'); } else l.remove(); });

  const socials = list('Socials').filter(s => s.url && ICON[String(s.name).toLowerCase()]);
  const wa = String(S('whatsapp_number')).replace(/\D/g, '');
  const col = (t, items) => `<div class="f-col"><h4>${t}</h4><ul>${items.map(i => `<li><a href="${i[1]}">${i[0]}</a></li>`).join('')}</ul></div>`;
  $('#footer').innerHTML = `<div class="f-grid">
    <div class="f-brand"><a href="/" class="logo">${logoHTML('footer')}</a>
      <p>${esc(S('footer_description'))}</p>
      <div class="f-social">${socials.map(s => `<a target="_blank" rel="noopener" aria-label="${esc(s.name)}" href="${esc(safeUrl(s.url))}">${ICON[String(s.name).toLowerCase()]}</a>`).join('')}</div></div>
    ${col('Company', [['About', '/'], ['Team', '/team'], ['Accreditation', '/accreditation'], ['Insights', '/insights'], ['Contact', '/contact']])}
    ${col('Funds', [['Inbound funds', '/inbound'], ['Outbound funds', '/outbound'], ['Compare funds', '/inbound/compare'], ['Presentations', '/presentations'], ['GIFT City', '/']])}
    ${col('Resources', [['Tax benefits', '/inbound/tax'], ['Investment routes', '/outbound/routes'], ['FAQ', '/inbound/faq'], ['Terms', '/terms'], ['Privacy', '/privacy']])}
    <div class="f-col f-contact"><h4>Get in touch</h4><ul>
      ${S('email') ? `<li>${ICON.mail}<a href="mailto:${esc(S('email'))}">${esc(S('email'))}</a></li>` : ''}
      ${S('phone') ? `<li>${ICON.phone}<a href="tel:${esc(String(S('phone')).replace(/[^\d+]/g, ''))}">${esc(S('phone'))}</a></li>` : ''}
      ${wa ? `<li>${ICON.whatsapp}<a target="_blank" rel="noopener" href="https://wa.me/${wa}">Chat on WhatsApp</a></li>` : ''}
      ${S('address') ? `<li>${ICON.pin}<span>${esc(S('address'))}</span></li>` : ''}</ul></div>
  </div>
  <div class="f-bottom">${S('disclaimer') ? `<p class="f-disc">${esc(S('disclaimer'))}</p><div style="height:22px"></div>` : ''}<hr>
    <div class="f-bar"><span>${esc(S('copyright'))}</span><button id="totop">Back to top</button></div></div>`;
  setActiveNav();
}
function setActiveNav() { const { page } = route(); $$('#navlinks a').forEach(a => a.classList.toggle('active', a.dataset.nav === page)); }

/* =====================================================================
   ROUTER (clean URLs such as /inbound/compare and /insights/my-post)
   ===================================================================== */
function route() {
  const parts = location.pathname.split('/').filter(Boolean).map(x => { try { return decodeURIComponent(x).toLowerCase(); } catch { return x.toLowerCase(); } });
  let page = parts[0] || 'home'; const sub = parts[1] || '';
  if (page === 'index.html') page = 'home';
  if (!pages[page] || page === 'notfound') return { page: 'notfound', sub: '' };
  return { page, sub };
}
let current = { page: null, sub: null };
const tabbed = p => p === 'inbound' || p === 'outbound';

function render(force) {
  const { page, sub } = route();
  const main = $('#main');
  closeMenu();
  if (!force && page === current.page && tabbed(page)) {
    const tab = TABS.some(t => t[0] === sub) ? sub : 'funds';
    $$('#tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
    const panel = $('#tabpanel'); panel.innerHTML = tabBody(page, tab); panel.classList.remove('page'); void panel.offsetWidth; panel.classList.add('page');
    $('#tabs a.on')?.scrollIntoView({ inline: 'center', block: 'nearest' });
    const bar = $('.tabbar'); if (bar) window.scrollTo({ top: Math.max(0, bar.offsetTop - 52 + 2), behavior: 'smooth' });
    current.sub = tab; headFor(page, tab); afterRender(); return;
  }
  const html = pages[page](sub);
  main.innerHTML = `<div class="page">${html}</div>`;
  if (!force || page !== current.page) window.scrollTo(0, 0);
  current = { page, sub };
  setActiveNav(); headFor(page, sub); afterRender();
}
function headFor(page, sub) {
  if (page === 'notfound') return setHead({ title: `Page not found | ${siteName()}`, description: S('tagline'), noindex: true });
  if (page === 'insights' && sub) {
    const p = posts().find(x => x._slug === sub);
    if (!p) return setHead({ title: `Page not found | ${siteName()}`, noindex: true });
    const tags = String(p.tags || '').split(',').map(x => x.trim()).filter(Boolean);
    const d = parseDate(p.date);
    return setHead({
      title: `${plain(p.title)} | ${siteName()}`, description: plain(p.summary), image: p.image, type: 'article', tags,
      ld: [{ '@context': 'https://schema.org', '@type': 'Article', headline: plain(p.title), description: plain(p.summary), image: p.image ? imgUrl(p.image, 1200) : undefined, datePublished: d ? d.toISOString().slice(0, 10) : undefined, author: { '@type': 'Organization', name: p.author || siteName() }, publisher: { '@type': 'Organization', name: siteName() }, mainEntityOfPage: canonicalUrl(), keywords: tags.join(', ') || undefined }]
    });
  }
  const o = pageSEO(page, sub);
  if ((page === 'inbound' || page === 'outbound') && sub === 'faq') o.ld = faqLD(list('FAQ').filter(x => x.type === page).map(x => ({ q: x.question, a: x.answer })));
  if (page === 'accreditation') o.ld = faqLD(list('Accreditation_Page').filter(r => String(r.section).toLowerCase() === 'faq').map(x => ({ q: x.title, a: x.description })));
  setHead(o);
}
function go(url) {
  const cur = location.pathname + location.search + location.hash;
  if (url === cur) { scrollTo({ top: 0, behavior: 'smooth' }); return; }
  history.pushState({}, '', url); render();
  const h = location.hash.slice(1); if (h) setTimeout(() => document.getElementById(h)?.scrollIntoView({ behavior: 'smooth' }), 80);
}

/* =====================================================================
   BEHAVIOURS
   ===================================================================== */
let io, cio;
function afterRender() {
  io?.disconnect(); cio?.disconnect();
  io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));
  cio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));
  placeThumb(); initDrag(); onScroll();
  setTimeout(() => $$('.reveal').forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight) el.classList.add('in'); }), 60);
}
function countUp(el) {
  const to = parseFloat(el.dataset.count) || 0, t0 = performance.now(), dur = 1600;
  const dec = String(el.dataset.count).includes('.') ? 1 : 0;
  (function f(t) { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4); el.textContent = (to * e).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ','); if (p < 1) requestAnimationFrame(f); })(t0);
}
function placeThumb() {
  const seg = $('#benseg'); if (!seg) return;
  const b = $('button.on', seg), th = $('.thumb', seg); if (!b) return;
  th.style.left = b.offsetLeft + 'px'; th.style.width = b.offsetWidth + 'px';
}
function initDrag() {
  const tr = $('#track'); if (!tr) return;
  let down = false, sx = 0, sl = 0, moved = false;
  tr.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = tr.scrollLeft; });
  addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; tr.classList.add('drag'); } tr.scrollLeft = sl - dx; });
  addEventListener('pointerup', () => { down = false; tr.classList.remove('drag'); });
  tr.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
}
function onScroll() {
  const h = document.documentElement, max = h.scrollHeight - innerHeight;
  $('#progress').style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
  const tl = $('#tl'), fill = $('#tlfill');
  if (tl && fill) { const r = tl.getBoundingClientRect(); const p = Math.min(1, Math.max(0, (innerHeight * .6 - r.top) / r.height)); fill.style.height = (p * 100) + '%'; }
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', placeThumb);
addEventListener('pointermove', e => {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const x = (e.clientX / innerWidth - .5), y = (e.clientY / innerHeight - .5);
  $$('.hero .orb').forEach((o, i) => { o.style.translate = `${x * (40 + i * 25)}px ${y * (40 + i * 25)}px`; });
}, { passive: true });

function closeMenu() { $('#navlinks')?.classList.remove('open'); $('#burger')?.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
function openModal(html, wide) {
  const m = $('#modal'); $('#modal-body').innerHTML = html; $('.modal-card', m).classList.toggle('wide', !!wide);
  m.hidden = false; document.body.style.overflow = 'hidden';
}
function closeModal() { const m = $('#modal'); m.hidden = true; $('#modal-body').innerHTML = ''; document.body.style.overflow = ''; }
function openPresentation(url, title) {
  const src = canvaEmbed(url), open = safeUrl(url);
  openModal(`<div class="embed"><iframe src="${esc(src)}" allowfullscreen loading="lazy" allow="fullscreen"></iframe></div>
    <div class="mbar"><b>${esc(title)}</b><a class="btn btn-light btn-sm" target="_blank" rel="noopener" href="${esc(open)}">Open in a new tab ${ICON.arrow}</a></div>`, true);
}
function openFund(id) {
  const f = list('Funds').find(x => x.id === id); if (!f) return;
  const i = list('Funds').indexOf(f);
  openModal(`<div class="mpad"><div class="top a-${accent(f.accent, i)}"><span class="chip">${esc(f.type)} fund · ${esc(f.amc)}</span><h3 style="margin-top:14px">${esc(f.name)}</h3><p style="opacity:.9">${esc(f.tagline)}</p></div>
    <p class="lead" style="font-size:19px">${inline(f.description)}</p>
    <div class="metrics" style="margin:26px 0"><div><b>${esc(f.category)}</b><small>Category</small></div><div><b>${esc(f.min_investment)}</b><small>Minimum</small></div><div><b>${esc(f.risk)}</b><small>Risk</small></div></div>
    <ul class="hl">${String(f.highlights || '').split('|').filter(x => x.trim()).map(h => `<li>${esc(h.trim())}</li>`).join('')}</ul>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:28px">
      ${isPH(f.presentation_url) ? '' : `<button class="btn btn-primary" data-pres="${esc(f.presentation_url)}" data-title="${esc(f.name)}">Watch presentation</button>`}
      <a class="btn btn-light" href="/contact" data-close>Talk to us</a></div></div>`);
}

/* images that fail to load: try the second Google Drive address, then fall back to the gradient / default logo */
document.addEventListener('error', e => {
  const t = e.target; if (!t || t.tagName !== 'IMG') return;
  if (t.dataset.did && !t.dataset.alt) { t.dataset.alt = '1'; t.src = `https://lh3.googleusercontent.com/d/${t.dataset.did}=w1400`; return; }
  if (t.classList.contains('logo-img')) {
    const w = document.createElement('span');
    w.innerHTML = logoMark(t.classList.contains('footer') ? 'lg' : '') + `<span>${esc(siteName())}</span>`;
    t.replaceWith(...w.childNodes); return;
  }
  t.style.display = 'none'; t.classList.add('broken');
}, true);

document.addEventListener('click', e => {
  const t = e.target;
  const pres = t.closest('[data-pres]'); if (pres) { e.preventDefault(); openPresentation(pres.dataset.pres, pres.dataset.title); return; }
  if (t.closest('[data-soon]')) { toast('This presentation link is not added yet. Add it in the Google Sheet.'); return; }
  const fund = t.closest('[data-fund]'); if (fund) { openFund(fund.dataset.fund); return; }
  if (t.closest('[data-close]')) { closeModal(); if (!t.closest('a[href]')) return; }
  const fq = t.closest('.fq-q'); if (fq) { const p = fq.parentElement, o = p.classList.toggle('open'); fq.setAttribute('aria-expanded', o); return; }
  const aud = t.closest('[data-aud]'); if (aud) {
    $$('#benseg button').forEach(b => b.classList.toggle('on', b === aud)); placeThumb();
    const p = $('#benpanel'); p.innerHTML = benefitCards(aud.dataset.aud); p.classList.remove('panel'); void p.offsetWidth; p.classList.add('panel'); return;
  }
  const car = t.closest('[data-car]'); if (car) { const tr = $('#track'), w = (tr.querySelector('.fcard')?.offsetWidth || 340) + 24; tr.scrollBy({ left: w * +car.dataset.car, behavior: 'smooth' }); return; }
  const chip = t.closest('#chips button'); if (chip) {
    $$('#chips button').forEach(b => b.classList.toggle('on', b === chip));
    $$('#posts .post').forEach(p => { p.style.display = !chip.dataset.cat || p.dataset.cat === chip.dataset.cat ? '' : 'none'; }); return;
  }
  const sc = t.closest('[data-scroll]'); if (sc) { document.getElementById(sc.dataset.scroll)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  const cp = t.closest('[data-copy]'); if (cp) { const v = cp.dataset.copy; (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => toast('Link copied'), () => { prompt('Copy this link', v); }); return; }
  if (t.closest('#totop')) { scrollTo({ top: 0, behavior: 'smooth' }); return; }
  if (t.closest('#burger')) { const b = $('#burger'), n = $('#navlinks'), o = n.classList.toggle('open'); b.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : ''; return; }

  /* internal links navigate without a page reload */
  const a = t.closest('a[href]');
  if (a && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !a.target && !a.hasAttribute('download')) {
    const u = new URL(a.href, location.href);
    if (u.origin === location.origin && !/\.[a-z0-9]{2,5}$/i.test(u.pathname)) { e.preventDefault(); go(u.pathname + u.search + u.hash); }
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeMenu(); }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList?.contains('vcard')) { e.preventDefault(); e.target.click(); }
});
addEventListener('popstate', () => render());

/* ----- forms: contact + accreditation. Submissions go to your private Google Sheet via Apps Script ----- */
document.addEventListener('submit', async e => {
  const f = e.target; if (!f.matches || !f.matches('form[data-lead]')) return;
  e.preventDefault();
  const d = Object.fromEntries(new FormData(f));
  if (d.website) return;                       // honeypot: bots fill this, humans never see it
  delete d.website; d.source = f.dataset.lead; d.page = location.pathname; d.consent = d.consent ? 'yes' : '';
  const ep = S('form_endpoint'), btn = $('button[type=submit]', f), label = btn.textContent;
  if (ep) {
    btn.disabled = true; btn.textContent = 'Sending…';
    try {
      const gas = /script\.google(usercontent)?\.com/i.test(ep);
      const res = await fetch(ep, gas ? { method: 'POST', mode: 'no-cors', body: new URLSearchParams(d) }
        : { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(d) });
      if (!gas && !res.ok) throw new Error('bad response');
      f.reset(); toast('Thank you! We have received your details and will get back to you shortly.');
    } catch { toast('Sorry, we could not send that. Please email or call us directly.'); }
    btn.disabled = false; btn.textContent = label;
  } else {
    const body = Object.entries(d).filter(([k, v]) => v && !['source', 'page', 'consent'].includes(k)).map(([k, v]) => `${k}: ${v}`).join('\n');
    location.href = `mailto:${S('email')}?subject=${encodeURIComponent('Enquiry: ' + (d.interest || d.source))}&body=${encodeURIComponent(body)}`;
  }
});

/* =====================================================================
   BOOT
   ===================================================================== */
async function boot() {
  /* old links like /#/inbound/compare keep working */
  if (/^#\/./.test(location.hash)) history.replaceState({}, '', '/' + location.hash.slice(2));
  else if (location.pathname === '/home' || location.pathname === '/index.html') history.replaceState({}, '', '/');
  const fallback = await fetch('/data/fallback.json').then(r => r.json()).catch(() => ({}));
  state.fb = fallback;
  const names = Object.keys(fallback);
  const cached = CFG.sheetId ? readCache() : null;
  applyData(cached && cached.sheet === CFG.sheetId ? { ...fallback, ...cached.data } : fallback);
  renderChrome(); render(true);
  setTimeout(() => $('#splash').classList.add('done'), 350);

  if (!CFG.sheetId) return;
  const fresh = cached && cached.sheet === CFG.sheetId && (Date.now() - cached.t) < (CFG.cacheMinutes || 5) * 60000;
  if (fresh) return;
  const live = await loadFromSheet(names);
  if (!live) { console.warn('[GCI] Could not read the Google Sheet. Check the sheetId and sharing (Anyone with the link: Viewer). Showing fallback content.'); return; }
  const merged = { ...fallback, ...live };
  writeCache(live);
  if (JSON.stringify(merged) !== JSON.stringify(state.data)) { applyData(merged); renderChrome(); render(true); }
}
boot();
})();
