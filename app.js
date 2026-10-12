/* GIFT City Investing: single-page app. All content comes from Google Sheets (or data/fallback.json). */
(() => {
'use strict';

const CFG = window.GCI_CONFIG || {};
const state = { data: {}, S: {}, C: {} };
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------- helpers ---------- */
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rich = v => esc(v).replace(/\r?\n/g, '<br>');
const paras = v => String(v ?? '').split(/\r?\n/).filter(x => x.trim()).map(x => `<p>${esc(x)}</p>`).join('');
const safeUrl = u => { u = String(u || '').trim(); if (!u) return ''; return /^(https?:|mailto:|tel:|#|\/)/i.test(u) ? u : 'https://' + u; };
const on = v => !/^(no|false|0|hide|hidden)$/i.test(String(v ?? 'yes').trim());
const byOrder = (a, b) => (parseFloat(a.order) || 0) - (parseFloat(b.order) || 0);
const S = (k, d = '') => (state.S[k] !== undefined && state.S[k] !== '' ? state.S[k] : d);
const C = (k, d = '') => (state.C[k] !== undefined && state.C[k] !== '' ? state.C[k] : d);
const list = name => (state.data[name] || []).filter(r => on(r.visible)).sort(byOrder);
const initials = n => String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
const isPH = u => !u || /REPLACE/i.test(u);
const ACCENTS = ['indigo', 'teal', 'violet', 'amber', 'pink'];
const accent = (a, i = 0) => ACCENTS.includes(String(a).toLowerCase()) ? String(a).toLowerCase() : ACCENTS[i % ACCENTS.length];
const canvaEmbed = u => { u = safeUrl(u); if (!/canva\.com/i.test(u)) return u; if (/embed/i.test(u)) return u; return u.replace(/[?#].*$/, '').replace(/\/$/, '') + '?embed'; };
const toast = msg => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 3500); };

/* ---------- icons ---------- */
const st = 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';
const ICON = {
  linkedin: `<svg viewBox="0 0 24 24"><text x="12" y="17.5" text-anchor="middle" font-size="15.5" font-weight="800" font-family="Inter,Arial,sans-serif" fill="currentColor">in</text></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M5 4.5l14 15M19 4.5l-14 15"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" ${st}><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r=".6" fill="currentColor"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24"><text x="12.5" y="20" text-anchor="middle" font-size="22" font-weight="800" font-family="Inter,Arial,sans-serif" fill="currentColor">f</text></svg>`,
  youtube: `<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="4.5" fill="currentColor"/><path d="M10 9l5 3-5 3z" fill="#fff"/></svg>`,
  discord: `<svg viewBox="0 0 24 24"><path d="M5.5 6.5C7.5 5 9.5 4.6 9.5 4.6l.5 1a12 12 0 014 0l.5-1S16.5 5 18.5 6.5c2 3 2.7 6.4 2.4 10-1.6 1.2-3.2 1.8-3.2 1.8l-1-1.6c.6-.2 1-.5 1-.5-3.2 1.400-7.600 1.400-10.800 0 0 0 .4.300 1 .5l-1 1.600S4.100 17.700 2.600 16.500C2.300 12.900 3.500 9.500 5.500 6.500z" fill="currentColor"/><circle cx="9" cy="12.200" r="1.400" fill="#fff"/><circle cx="15" cy="12.200" r="1.400" fill="#fff"/></svg>`,
  blog: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M5 7h14M5 11.500h10M5 16h14M5 20.500h8" transform="translate(0 -2)"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" ${st}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.500 7l8.500 6 8.500-6"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" ${st}><path d="M5 4h4l2 5-2.500 1.500a11 11 0 005 5L15 13l5 2v3.500a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" ${st}><path d="M12 3a9 9 0 00-7.700 13.600L3 21l4.500-1.200A9 9 0 1012 3z"/><path d="M9 8.500c0 3.500 3 6.500 6.500 6.500l1-1.800-2-1-1 .8a5 5 0 01-2.300-2.300l.8-1-1-2z"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" ${st}><path d="M12 21.500s7-6.200 7-11.800a7 7 0 10-14 0c0 5.600 7 11.800 7 11.800z"/><circle cx="12" cy="9.700" r="2.500"/></svg>`,
  play: `<svg viewBox="0 0 24 24"><path d="M7 4.500v15l13-7.500z" fill="#fff"/></svg>`,
  left: `<svg viewBox="0 0 24 24" ${st}><path d="M15 5l-7 7 7 7"/></svg>`,
  right: `<svg viewBox="0 0 24 24" ${st}><path d="M9 5l7 7-7 7"/></svg>`,
  arrow: `<svg width="16" height="16" viewBox="0 0 24 24" ${st}><path d="M5 12h14M13 6l6 6-6 6"/></svg>`
};

/* ---------- CSV + sheet loading ---------- */
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
function toObjects(rows, raw) {
  if (!rows.length) return [];
  const head = rows[0].map(h => raw ? h.trim() : h.trim().toLowerCase().replace(/\s+/g, '_'));
  return rows.slice(1).map(r => { const o = {}; head.forEach((h, i) => { if (h) o[h] = (r[i] ?? '').trim(); }); return o; });
}
async function fetchSheet(name) {
  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(CFG.sheetId)}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const t = await r.text();
  if (/^\s*</.test(t)) throw new Error('not csv');
  return toObjects(parseCSV(t), /^Compare_/.test(name));
}
async function loadFromSheet(names) {
  const res = await Promise.all(names.map(n => fetchSheet(n).catch(() => null)));
  const out = {}; let ok = 0;
  names.forEach((n, i) => { if (res[i] && res[i].length) { out[n] = res[i]; ok++; } });
  return ok ? out : null;
}
const CACHE_KEY = 'gci:data:v1';
const readCache = () => { try { const c = JSON.parse(localStorage.getItem(CACHE_KEY)); return c && c.data ? c : null; } catch { return null; } };
const writeCache = data => { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), sheet: CFG.sheetId, data })); } catch { } };

function applyData(data) {
  state.data = data;
  state.S = {}; (data.Settings || []).forEach(r => { if (r.key) state.S[r.key] = r.value; });
  state.C = {}; (data.Content || []).forEach(r => { if (r.key) state.C[r.key] = r.value; });
}

/* ---------- shared UI pieces ---------- */
const NAV = [
  ['home', 'GIFT City'], ['inbound', 'Inbound Funds'], ['outbound', 'Outbound Funds'],
  ['presentations', 'Presentations'], ['accreditation', 'Accreditation'], ['insights', 'Insights'], ['team', 'Team']
];
const logoMark = cls => `<span class="mark ${cls || ''}"><i></i><i></i><i></i><i></i></span>`;
const siteName = () => S('site_name', 'GIFT City Investing');

function head(eyebrow, title, sub, center) {
  return `<div class="head ${center ? 'center' : ''} reveal"><span class="eyebrow">${esc(eyebrow)}</span><h2 class="h2">${esc(title)}</h2>${sub ? `<p class="lead">${esc(sub)}</p>` : ''}</div>`;
}
const orbs = `<div class="orbs"><span class="orb o1"></span><span class="orb o2"></span><span class="orb o3"></span></div>`;
function pageHero(key) {
  return `<section class="phero dark">${orbs}<div class="wrap">
    <span class="eyebrow reveal">${esc(C(key + '_eyebrow'))}</span>
    <h1 class="h1 reveal" style="--i:1;font-size:clamp(40px,7vw,84px)">${esc(C(key + '_title'))}</h1>
    <p class="lead reveal" style="--i:2">${esc(C(key + '_subtitle'))}</p></div></section>`;
}
function ctaBlock() {
  return `<section class="sec" style="padding-top:0"><div class="wrap"><div class="cta reveal zoom">
    <h2 class="h2">${esc(C('cta_title', 'Ready to invest through GIFT City?'))}</h2>
    <p>${esc(C('cta_subtitle'))}</p>
    <a class="btn btn-primary" href="#/contact">${esc(C('cta_button', 'Get in touch'))} ${ICON.arrow}</a></div></div></section>`;
}
const presCard = (p, i) => {
  const soon = isPH(p.url);
  return `<button class="pcard a-${accent(p.accent, i)} ${soon ? 'soon' : ''} reveal" style="--i:${i}" ${soon ? 'disabled' : `data-pres="${esc(p.url)}" data-title="${esc(p.title)}"`}>
    <span class="chip" style="margin-bottom:auto">${esc(p.category || 'Presentation')}</span>
    <h3>${esc(p.title)}</h3><p>${esc(p.description)}</p>
    <span class="go">${soon ? 'Coming soon' : `Watch presentation ${ICON.arrow}`}</span></button>`;
};
const fundPresentations = () => list('Funds').filter(f => !isPH(f.presentation_url)).map((f, i) => ({ category: 'Fund', title: f.name + ' presentation', description: f.tagline, url: f.presentation_url, accent: f.accent || ACCENTS[i % 5] }));

/* ---------- PAGES ---------- */
const pages = {};

pages.home = () => {
  const stats = list('Stats');
  const ben = list('Benefits');
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
      <p class="lead reveal" style="--i:2">${esc(C('hero_subtitle'))}</p>
      <div class="cta-row reveal" style="--i:3">
        <a class="btn btn-primary" href="${esc(safeUrl(C('hero_cta_primary_link', '#/presentations')))}">${esc(C('hero_cta_primary_label', 'Explore GIFT City'))}</a>
        <a class="btn btn-ghost" href="${esc(safeUrl(C('hero_cta_secondary_link', '#/contact')))}">${esc(C('hero_cta_secondary_label', 'Talk to us'))}</a>
      </div>
    </div>
    ${stats.length ? `<div class="hero-stats"><div class="wrap"><div class="stat-strip reveal" style="--i:4">${stats.map(s => `
      <div class="stat"><b>${esc(s.prefix)}<span data-count="${esc(parseFloat(s.value) || 0)}">${esc(s.value)}</span>${esc(s.suffix)}</b><span>${esc(s.label)}</span></div>`).join('')}</div></div></div>` : ''}
  </section>

  <section class="sec"><div class="wrap split">
    <div class="about-text reveal"><span class="eyebrow">${esc(C('about_eyebrow'))}</span>
      <h2 class="h2">${esc(C('about_title'))}</h2>
      ${paras(C('about_text'))}
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
      ${tl.map((t, i) => `<div class="tl-item reveal"><span class="tl-dot"></span><div class="tl-card"><div class="tl-year">${esc(t.year)}</div><h3>${esc(t.title)}</h3><p>${esc(t.description)}</p></div></div>`).join('')}
    </div></div></section>` : ''}

  ${funds.length ? `<section class="sec" style="padding-bottom:30px"><div class="wrap car-head">
      <div>${head(C('funds_eyebrow'), C('funds_title'), C('funds_subtitle'))}</div>
      <div class="car-nav reveal"><button data-car="-1" aria-label="Previous">${ICON.left}</button><button data-car="1" aria-label="Next">${ICON.right}</button></div>
    </div>
    <div class="track" id="track">${funds.map((f, i) => `
      <article class="fcard a-${accent(f.accent, i)}"><span class="chip">${esc(f.type)} fund</span>
        <h3>${esc(f.name)}</h3><p class="tag">${esc(f.tagline)}</p>
        <div class="acts"><a class="btn" href="#/${f.type === 'outbound' ? 'outbound' : 'inbound'}">Learn more</a>
        ${isPH(f.presentation_url) ? '' : `<button class="btn o" data-pres="${esc(f.presentation_url)}" data-title="${esc(f.name)}">Presentation</button>`}</div></article>`).join('')}
    </div></section>` : ''}

  ${pres.length ? `<section class="sec"><div class="wrap">
    ${head(C('presentations_eyebrow'), C('presentations_title'), C('presentations_subtitle'))}
    <div class="pgrid">${pres.map((p, i) => presCard({ ...p, accent: ACCENTS[(i + 1) % 5] }, i)).join('')}</div>
    <div class="reveal" style="margin-top:34px"><a class="link" href="#/presentations">View all presentations ${ICON.arrow}</a></div>
  </div></section>` : ''}

  ${ctaBlock()}`;
};
const benefitCards = aud => `<div class="cards">${list('Benefits').filter(b => b.audience === aud).map((b, i) => `
  <div class="card c${(i % 3) + 1}"><div class="ico">${i + 1}</div><h3>${esc(b.title)}</h3><p>${esc(b.description)}</p></div>`).join('')}</div>`;

/* tabbed fund pages (inbound / outbound) */
const TABS = [['funds', 'Funds'], ['compare', 'Compare'], ['tax', 'Tax benefits'], ['routes', 'Investment routes'], ['faq', 'FAQ']];
function tabBody(type, tab) {
  const funds = list('Funds').filter(f => f.type === type);
  if (tab === 'compare') {
    const rows = state.data[type === 'inbound' ? 'Compare_Inbound' : 'Compare_Outbound'] || [];
    if (!rows.length) return `<div class="wrap"><p class="lead">Comparison coming soon.</p></div>`;
    const cols = Object.keys(rows[0]);
    return `<div class="wrap">${head('Compare', type === 'inbound' ? 'Inbound funds, side by side.' : 'Outbound funds vs direct equity.', 'Swipe or scroll the table to compare every parameter.')}
      <div class="tbl-wrap reveal zoom"><table><thead><tr>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r => `<tr>${cols.map((c, i) => i === 0 ? `<th scope="row">${esc(r[c])}</th>` : `<td>${esc(r[c])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="note">${esc(S('disclaimer'))}</p></div>`;
  }
  if (tab === 'tax') {
    const t = list('Tax').filter(x => x.type === type);
    return `<div class="wrap">${head('Tax benefits', 'Keep more of what you earn.', 'How investing through GIFT City can be tax-efficient.')}
      <div class="cards">${t.map((x, i) => `<div class="card c${(i % 3) + 1} reveal" style="--i:${i}"><div class="ico">${i + 1}</div><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p></div>`).join('')}</div>
      <p class="note">${esc(S('disclaimer'))}</p></div>`;
  }
  if (tab === 'routes') {
    const r = list('Routes').filter(x => x.type === type);
    return `<div class="wrap">${head('Investment routes', 'Your path, step by step.', 'A simple journey from first conversation to first investment.', true)}
      <div class="steps">${r.map((x, i) => `<div class="step reveal" style="--i:${i}"><div class="n">${esc(x.step || i + 1)}</div><div><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p></div></div>`).join('')}</div></div>`;
  }
  if (tab === 'faq') {
    const f = list('FAQ').filter(x => x.type === type);
    return `<div class="wrap">${head('FAQ', 'Questions, answered.', '', true)}
      <div class="faq">${f.map((x, i) => `<div class="fq reveal" style="--i:${i}"><button class="fq-q" aria-expanded="false">${esc(x.question)}<i></i></button><div class="fq-a"><div><p>${rich(x.answer)}</p></div></div></div>`).join('')}</div></div>`;
  }
  /* funds */
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
function fundPage(type) {
  return (sub) => {
    const tab = TABS.some(t => t[0] === sub) ? sub : 'funds';
    return `${pageHero(type)}
    <div class="tabbar"><div class="tabs" id="tabs">${TABS.map(t => `<a href="#/${type}/${t[0]}" data-tab="${t[0]}" class="${t[0] === tab ? 'on' : ''}">${t[1]}</a>`).join('')}</div></div>
    <div class="tabpanel" id="tabpanel">${tabBody(type, tab)}</div>${ctaBlock()}`;
  };
}
pages.inbound = fundPage('inbound');
pages.outbound = fundPage('outbound');

pages.presentations = () => {
  const p = list('Presentations'); const f = fundPresentations();
  return `${pageHero('presentations')}<section class="sec" style="padding-top:70px"><div class="wrap">
    ${p.length ? `<h3 class="sub-h">GIFT City & investing</h3><div class="pgrid">${p.map((x, i) => presCard({ ...x, accent: ACCENTS[(i + 1) % 5] }, i)).join('')}</div>` : ''}
    ${f.length ? `<h3 class="sub-h">Fund presentations</h3><div class="pgrid">${f.map((x, i) => presCard(x, i)).join('')}</div>` : ''}
  </div></section>${ctaBlock()}`;
};

pages.accreditation = () => `${pageHero('accreditation')}<section class="sec" style="padding-top:70px"><div class="wrap"><div class="cards">
  ${list('Accreditation').map((a, i) => `<div class="card reveal" style="--i:${i}">
    ${a.image ? `<div class="acc-img" style="background-image:url('${esc(safeUrl(a.image))}')"></div>` : `<div class="acc-seal">✓</div>`}
    <span class="badge ${/active|valid|approved|registered/i.test(a.status || 'Active') ? '' : 'off'}">${esc(a.status || 'Active')}</span>
    <h3 style="margin-top:14px">${esc(a.title)}</h3><div class="iss">${esc(a.issuer)}</div><p>${esc(a.description)}</p>
    ${a.link ? `<p style="margin-top:16px"><a class="link" target="_blank" rel="noopener" href="${esc(safeUrl(a.link))}">View certificate ${ICON.arrow}</a></p>` : ''}</div>`).join('')}
  </div></div></section>${ctaBlock()}`;

const gradFor = i => ['linear-gradient(135deg,#4a5bff,#7b4dff)', 'linear-gradient(135deg,#0fb89e,#2d7bff)', 'linear-gradient(135deg,#8c4dff,#d24dff)', 'linear-gradient(135deg,#ff9f1c,#ff5f6d)', 'linear-gradient(135deg,#ff4d94,#8a4dff)'][i % 5];
const fmtDate = d => { const t = new Date(d); return isNaN(t) ? esc(d) : t.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); };
function postCard(p, i, big) {
  const inner = `<div class="img" style="background-image:${p.image ? `url('${esc(safeUrl(p.image))}')` : gradFor(i)}">${p.image ? '' : esc(initials(p.title))}</div>
    <div class="tx"><div class="meta"><b>${esc(p.category)}</b> · ${fmtDate(p.date)}</div><h3 class="h3">${esc(p.title)}</h3><p>${esc(p.summary)}</p>
    ${p.link ? `<span class="link">Read more ${ICON.arrow}</span>` : ''}</div>`;
  const cls = `post reveal ${big ? 'big' : ''}`;
  return p.link ? `<a class="${cls}" style="--i:${i % 3}" data-cat="${esc(p.category)}" target="_blank" rel="noopener" href="${esc(safeUrl(p.link))}">${inner}</a>` : `<div class="${cls}" style="--i:${i % 3}" data-cat="${esc(p.category)}">${inner}</div>`;
}
pages.insights = () => {
  const all = list('Insights').sort((a, b) => new Date(b.date) - new Date(a.date));
  const feat = all.find(p => /^(yes|true|1)$/i.test(p.featured));
  const rest = all.filter(p => p !== feat);
  const cats = [...new Set(all.map(p => p.category).filter(Boolean))];
  return `${pageHero('insights')}<section class="sec" style="padding-top:70px"><div class="wrap">
    ${cats.length > 1 ? `<div class="chips" id="chips"><button class="on" data-cat="">All</button>${cats.map(c => `<button data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>` : ''}
    <div class="pgrid" id="posts">${feat ? postCard(feat, 0, true) : ''}${rest.map((p, i) => postCard(p, i + 1)).join('')}</div>
  </div></section>${ctaBlock()}`;
};

pages.team = () => `${pageHero('team')}<section class="sec" style="padding-top:70px"><div class="wrap"><div class="cards">
  ${list('Team').map((m, i) => `<div class="card person reveal" style="--i:${i % 3}">
    <div class="avatar" style="background-image:${m.photo ? `url('${esc(safeUrl(m.photo))}')` : gradFor(i)}">${m.photo ? '' : esc(initials(m.name))}</div>
    <h3>${esc(m.name)}</h3><div class="role">${esc(m.role)}</div><p>${esc(m.bio)}</p>
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
    <form class="form reveal" style="--i:2" id="cform">
      <div class="row2"><label>Name<input name="name" required autocomplete="name"></label><label>Email<input name="email" type="email" required autocomplete="email"></label></div>
      <div class="row2"><label>Phone<input name="phone" type="tel" autocomplete="tel"></label>
        <label>I am interested in<select name="interest"><option>Inbound funds</option><option>Outbound funds</option><option>GIFT City setup</option><option>Something else</option></select></label></div>
      <label>Message<textarea name="message" required></textarea></label>
      <button class="btn btn-primary" type="submit" style="justify-content:center">Send message</button>
    </form></div></section>`;
};
const legal = (title, key) => () => `<section class="phero dark">${orbs}<div class="wrap"><h1 class="h1" style="font-size:clamp(38px,6vw,72px)">${title}</h1></div></section><section class="sec" style="padding-top:60px"><div class="wrap legal">${paras(C(key))}</div></section>`;
pages.terms = legal('Terms', 'terms_text');
pages.privacy = legal('Privacy', 'privacy_text');

/* ---------- chrome: nav + footer ---------- */
function renderChrome() {
  $('.brand').innerHTML = `${logoMark()}<span>${esc(siteName())}</span>`;
  $('#navlinks').innerHTML = NAV.map(n => `<a href="#/${n[0]}" data-nav="${n[0]}">${n[1]}</a>`).join('') + `<a href="#/contact" data-nav="contact" class="m-only">Contact</a>`;
  document.title = siteName() + (S('tagline') ? ' · ' + S('tagline') : '');
  const an = $('#announce'); if (S('announcement')) { an.hidden = false; an.textContent = S('announcement'); } else an.hidden = true;

  const socials = list('Socials').filter(s => s.url && ICON[String(s.name).toLowerCase()]);
  const wa = String(S('whatsapp_number')).replace(/\D/g, '');
  const col = (t, items) => `<div class="f-col"><h4>${t}</h4><ul>${items.map(i => `<li><a href="${i[1]}">${i[0]}</a></li>`).join('')}</ul></div>`;
  $('#footer').innerHTML = `<div class="f-grid">
    <div class="f-brand"><a href="#/home" class="logo">${logoMark('lg')}<span>${esc(siteName())}</span></a>
      <p>${esc(S('footer_description'))}</p>
      <div class="f-social">${socials.map(s => `<a target="_blank" rel="noopener" aria-label="${esc(s.name)}" href="${esc(safeUrl(s.url))}">${ICON[String(s.name).toLowerCase()]}</a>`).join('')}</div></div>
    ${col('Company', [['About', '#/home'], ['Team', '#/team'], ['Accreditation', '#/accreditation'], ['Insights', '#/insights'], ['Contact', '#/contact']])}
    ${col('Funds', [['Inbound funds', '#/inbound'], ['Outbound funds', '#/outbound'], ['Compare funds', '#/inbound/compare'], ['Presentations', '#/presentations'], ['GIFT City', '#/home']])}
    ${col('Resources', [['Tax benefits', '#/inbound/tax'], ['Investment routes', '#/outbound/routes'], ['FAQ', '#/inbound/faq'], ['Terms', '#/terms'], ['Privacy', '#/privacy']])}
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
function setActiveNav() {
  const { page } = parseHash();
  $$('#navlinks a').forEach(a => a.classList.toggle('active', a.dataset.nav === page));
}

/* ---------- router ---------- */
function parseHash() {
  const h = (location.hash || '#/home').replace(/^#\/?/, '').split('?')[0];
  const [page = 'home', sub = ''] = h.split('/');
  return { page: pages[page] ? page : 'home', sub };
}
let current = { page: null, sub: null };
const tabbed = p => p === 'inbound' || p === 'outbound';

function render(force) {
  const { page, sub } = parseHash();
  const main = $('#main');
  closeMenu();
  if (!force && page === current.page && tabbed(page)) {
    const tab = TABS.some(t => t[0] === sub) ? sub : 'funds';
    $$('#tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
    const panel = $('#tabpanel'); panel.innerHTML = tabBody(page, tab); panel.classList.remove('page'); void panel.offsetWidth; panel.classList.add('page');
    $('#tabs a.on')?.scrollIntoView({ inline: 'center', block: 'nearest' });
    const bar = $('.tabbar'); if (bar) window.scrollTo({ top: Math.max(0, bar.offsetTop - 52 + 2), behavior: 'smooth' });
    current.sub = tab; afterRender(); return;
  }
  main.innerHTML = `<div class="page">${pages[page](sub)}</div>`;
  if (!force || page !== current.page) window.scrollTo(0, 0);
  current = { page, sub };
  setActiveNav(); afterRender();
}

/* ---------- behaviours ---------- */
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

/* parallax orbs */
addEventListener('pointermove', e => {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const x = (e.clientX / innerWidth - .5), y = (e.clientY / innerHeight - .5);
  $$('.hero .orb').forEach((o, i) => { o.style.translate = `${x * (40 + i * 25)}px ${y * (40 + i * 25)}px`; });
}, { passive: true });

/* menu */
function closeMenu() { $('#navlinks')?.classList.remove('open'); $('#burger')?.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }

/* modal */
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
    <p class="lead" style="font-size:19px">${esc(f.description)}</p>
    <div class="metrics" style="margin:26px 0"><div><b>${esc(f.category)}</b><small>Category</small></div><div><b>${esc(f.min_investment)}</b><small>Minimum</small></div><div><b>${esc(f.risk)}</b><small>Risk</small></div></div>
    <ul class="hl">${String(f.highlights || '').split('|').filter(x => x.trim()).map(h => `<li>${esc(h.trim())}</li>`).join('')}</ul>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:28px">
      ${isPH(f.presentation_url) ? '' : `<button class="btn btn-primary" data-pres="${esc(f.presentation_url)}" data-title="${esc(f.name)}">Watch presentation</button>`}
      <a class="btn btn-light" href="#/contact" data-close>Talk to us</a></div></div>`);
}

/* global click delegation */
document.addEventListener('click', e => {
  const t = e.target;
  const pres = t.closest('[data-pres]'); if (pres) { e.preventDefault(); openPresentation(pres.dataset.pres, pres.dataset.title); return; }
  if (t.closest('[data-soon]')) { toast('This presentation link is not added yet. Add it in the Google Sheet.'); return; }
  const fund = t.closest('[data-fund]'); if (fund) { openFund(fund.dataset.fund); return; }
  if (t.closest('[data-close]')) { closeModal(); return; }
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
  if (t.closest('#totop')) { scrollTo({ top: 0, behavior: 'smooth' }); return; }
  if (t.closest('#burger')) { const b = $('#burger'), n = $('#navlinks'), o = n.classList.toggle('open'); b.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : ''; return; }
  const a = t.closest('a[href^="#/"]'); if (a && a.getAttribute('href') === location.hash) { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeMenu(); }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList?.contains('vcard')) { e.preventDefault(); e.target.click(); }
});
document.addEventListener('submit', async e => {
  if (e.target.id !== 'cform') return; e.preventDefault();
  const f = e.target, d = Object.fromEntries(new FormData(f)), ep = S('form_endpoint'), btn = $('button', f);
  if (ep) {
    btn.disabled = true; btn.textContent = 'Sending…';
    try { const r = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(d) }); if (!r.ok) throw 0; f.reset(); toast('Thank you! We will get back to you shortly.'); }
    catch { toast('Could not send. Please email us directly.'); }
    btn.disabled = false; btn.textContent = 'Send message';
  } else {
    const body = `Name: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone}\nInterested in: ${d.interest}\n\n${d.message}`;
    location.href = `mailto:${S('email')}?subject=${encodeURIComponent('Enquiry: ' + d.interest)}&body=${encodeURIComponent(body)}`;
  }
});
addEventListener('hashchange', () => render());

/* ---------- boot ---------- */
async function boot() {
  const fallback = await fetch('data/fallback.json').then(r => r.json()).catch(() => ({}));
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
