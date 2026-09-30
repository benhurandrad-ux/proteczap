/* ProtecZap · núcleo do front: cliente supabase, sessão, marca por host, contexto, roteador e helpers de UI.
   Carregado como script clássico depois de supabase-js (CDN) e config.js. */
(function () {
  'use strict';
  const PZ = window.PZ || {};

  /* ---------- DOM helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const initials = n => (n || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';
  const ico = (name, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="#${name}"/>  <symbol id="i-check2" viewBox="0 0 24 24"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></symbol>
  <symbol id="i-clip" viewBox="0 0 24 24"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></symbol>
  <symbol id="i-mic" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/></symbol>
  <symbol id="i-send" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></symbol>
  <symbol id="i-filter" viewBox="0 0 24 24"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></symbol>
  <symbol id="i-pause" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></symbol>
  <symbol id="i-play" viewBox="0 0 24 24"><path d="m5 3 14 9-14 9V3z"/></symbol>
  <symbol id="i-download" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></symbol>
  <symbol id="i-file" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></symbol>
  <symbol id="i-qr" viewBox="0 0 24 24"><rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/><rect x="3" y="16" width="5" height="5" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3M21 21v.01M12 7v3a2 2 0 0 1-2 2H7M3 12h.01M12 3h.01M12 16v.01M16 12h1M21 12v.01M12 21v-1"/></symbol>
  <symbol id="i-smart" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></symbol>
  <symbol id="i-swap" viewBox="0 0 24 24"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></symbol>
  <symbol id="i-reply" viewBox="0 0 24 24"><path d="M9 17 4 12l5-5"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></symbol>
  <symbol id="i-video" viewBox="0 0 24 24"><path d="m22 8-6 4 6 4V8z"/><rect x="2" y="6" width="14" height="12" rx="2"/></symbol>
  <symbol id="i-power" viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><path d="M12 2v10"/></symbol>
  <symbol id="i-sticker" viewBox="0 0 24 24"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z"/><path d="M15 3v6h6"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/></symbol>
</svg>`;
  const fmtPhone = d => {
    d = String(d || '').replace(/\D/g, '');
    if (d.startsWith('55') && d.length >= 12) d = d.slice(2);
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return d;
  };
  const phoneDigits = v => { let d = String(v || '').replace(/\D/g, ''); if (d.length === 10 || d.length === 11) d = '55' + d; return d; };
  const maskPhoneInput = el => el.addEventListener('input', () => {
    let d = el.value.replace(/\D/g, '').slice(0, 11);
    let out = d;
    if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    el.value = out;
  });
  const relTime = iso => {
    if (!iso) return '';
    const s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 60) return 'agora';
    if (s < 3600) return `há ${Math.floor(s / 60)} min`;
    if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
    return `há ${Math.floor(s / 86400)} d`;
  };
  const dt = iso => iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : '';
  const slugify = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/proteção|protecao|veicular|auto|associação|associacao|cooperativa|ltda|clube/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30);

  /* ---------- cor e contraste ---------- */
  const hexToRgb = hex => { const h = (hex || '#000000').replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const lum = hex => { const [r, g, b] = hexToRgb(hex).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const contrast = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const inkFor = hex => contrast(hex, '#ffffff') >= contrast(hex, '#0b0b0b') ? '#ffffff' : '#0b0b0b';
  const isHex = v => /^#[0-9a-fA-F]{6}$/.test(v || '');

  /* ---------- Supabase ---------- */
  const configured = !!(PZ.SUPABASE_URL && PZ.SUPABASE_ANON_KEY && window.supabase);
  let sb = null;
  if (configured) {
    sb = window.supabase.createClient(PZ.SUPABASE_URL, PZ.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  }
  const publicUrl = (bucket, path) => (path && sb) ? sb.storage.from(bucket).getPublicUrl(path).data.publicUrl : null;

  /* ---------- tenant: host, ?empresa= ou localStorage ---------- */
  const LS_TENANT = 'pz_empresa';
  function tenantFromHost() {
    const host = location.hostname.toLowerCase();
    const root = (PZ.ROOT_DOMAIN || '').toLowerCase();
    if (root && host.endsWith('.' + root)) {
      const label = host.slice(0, -(root.length + 1)).split('.').pop();
      if (label && !['www', 'app', 'admin', 'api', 'mail'].includes(label)) return { slug: label, host, source: 'host' };
      return { slug: null, host, source: 'root' };
    }
    if (root && host === root) return { slug: null, host, source: 'root' };
    return null;
  }
  function resolveTenant() {
    const fromHost = tenantFromHost();
    if (fromHost) return fromHost;
    const q = new URLSearchParams(location.search).get(PZ.FALLBACK_QUERY_PARAM || 'empresa');
    if (q !== null) {
      const slug = q.trim().toLowerCase();
      try { if (slug) localStorage.setItem(LS_TENANT, slug); else localStorage.removeItem(LS_TENANT); } catch (e) { /* sem storage */ }
      return { slug: slug || null, host: location.hostname, source: 'query' };
    }
    let saved = null; try { saved = localStorage.getItem(LS_TENANT); } catch (e) { /* sem storage */ }
    return { slug: saved || null, host: location.hostname, source: saved ? 'storage' : 'none' };
  }
  const tenant = resolveTenant();
  const inFallback = !tenantFromHost();
  /* Mantém ?empresa=slug nos links internos quando estamos fora do domínio da plataforma */
  const href = (page) => {
    if (!inFallback || !tenant.slug) return page;
    const u = new URL(page, location.href); u.searchParams.set(PZ.FALLBACK_QUERY_PARAM || 'empresa', tenant.slug); return u.pathname.split('/').pop() + u.search + u.hash;
  };
  /* Link público de uma página para um slug (convites, pré-visualização) */
  const publicLink = (slug, page) => {
    if (inFallback) { const u = new URL(page, location.href); u.searchParams.set(PZ.FALLBACK_QUERY_PARAM || 'empresa', slug); return u.toString(); }
    return `https://${slug}.${PZ.ROOT_DOMAIN}/${page}`;
  };

  /* ---------- marca ---------- */
  const platformBranding = () => ({
    mode: 'platform', company_id: null, slug: null, app_name: PZ.PLATFORM_NAME || 'ProtecZap', logo_path: null,
    primary_color: PZ.PLATFORM_COLOR || '#2B2B29', login_headline: 'Atendimento comercial pelo WhatsApp', hide_platform_credit: false
  });
  let branding = platformBranding();
  function faviconFor(b) {
    if (b.logo_url) return b.logo_url;
    const ink = inkFor(b.primary_color);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${b.primary_color}"/><text x="32" y="43" font-family="Inter,Arial,sans-serif" font-size="34" font-weight="700" text-anchor="middle" fill="${ink}">${esc((b.app_name || 'P')[0].toUpperCase())}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }
  function applyBranding(b) {
    branding = Object.assign(platformBranding(), b || {});
    if (branding.logo_path && !branding.logo_url) branding.logo_url = publicUrl('branding', branding.logo_path);
    const primary = isHex(branding.primary_color) ? branding.primary_color : (PZ.PLATFORM_COLOR || '#2B2B29');
    const root = document.documentElement;
    root.style.setProperty('--brand', primary);
    root.style.setProperty('--brand-ink', inkFor(primary));
    root.style.setProperty('--brand-ink-inv', inkFor(primary) === '#ffffff' ? '#0b0b0b' : '#ffffff');
    const suffix = document.title.includes('·') ? document.title.split('·').pop().trim() : '';
    document.title = suffix ? `${suffix} · ${branding.app_name}` : branding.app_name;
    let link = $('link[rel="icon"]'); if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.href = faviconFor(branding);
    $$('[data-brand-name]').forEach(e => e.textContent = branding.app_name);
    $$('[data-brand-initial]').forEach(e => e.textContent = (branding.app_name || 'P')[0].toUpperCase());
    $$('[data-brand-logo]').forEach(e => {
      if (branding.logo_url) e.innerHTML = `<img src="${esc(branding.logo_url)}" alt="${esc(branding.app_name)}">`;
      else e.innerHTML = `<span class="mark" data-brand-initial>${esc((branding.app_name || 'P')[0].toUpperCase())}</span>`;
    });
    $$('[data-brand-headline]').forEach(e => e.textContent = branding.login_headline || '');
    $$('[data-powered]').forEach(e => { e.textContent = `powered by ${PZ.PLATFORM_NAME}`; e.classList.toggle('hide', !!branding.hide_platform_credit); });
    document.documentElement.classList.add('branded');
    return branding;
  }
  async function resolveBranding() {
    if (!configured) return applyBranding(platformBranding());
    const key = tenant.slug || (tenant.source === 'root' ? tenant.host : '');
    if (!key) return applyBranding(platformBranding());
    try {
      const { data, error } = await sb.rpc('public_branding', { host: key });
      if (error) throw error;
      return applyBranding(data);
    } catch (e) {
      console.warn('public_branding falhou, usando marca da plataforma', e);
      return applyBranding(platformBranding());
    }
  }

  /* ---------- contexto e permissões ---------- */
  let ctxCache = null;
  async function ctx(force = false) {
    if (!configured) return null;
    if (ctxCache && !force) return ctxCache;
    const { data, error } = await sb.rpc('my_context');
    if (error) throw error;
    ctxCache = data; return data;
  }
  const can = key => !!(ctxCache && (ctxCache.is_super_admin || (ctxCache.permissions && ctxCache.permissions[key] === true)));
  const canAny = (...keys) => keys.some(can);

  async function requireSession(opts = {}) {
    if (!configured) return null;
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { location.replace(href('login.html') + (location.hash ? (href('login.html').includes('?') ? '&' : '?') + 'next=' + encodeURIComponent(location.hash) : '')); return null; }
    let c;
    try { c = await ctx(true); } catch (e) { console.error(e); toast('Não foi possível carregar seu acesso. Tente de novo.'); return null; }
    if (opts.admin && !c.is_super_admin) { location.replace(href('index.html')); return null; }
    if (!opts.admin) {
      if (!c.is_super_admin && !c.membership) { location.replace(href('entrar.html')); return null; }
      /* Validação do tenant: a conta precisa pertencer à empresa do host (ADR 2). Super admin passa. */
      if (branding.mode === 'company' && c.membership && c.membership.company_id !== branding.company_id && !c.is_super_admin) {
        await sb.auth.signOut();
        location.replace(href('login.html') + (href('login.html').includes('?') ? '&' : '?') + 'erro=empresa');
        return null;
      }
      if (c.membership && c.membership.is_active === false) {
        await sb.auth.signOut();
        location.replace(href('login.html') + (href('login.html').includes('?') ? '&' : '?') + 'erro=inativo');
        return null;
      }
    }
    return { session, ctx: c };
  }
  async function signOut() { if (sb) await sb.auth.signOut(); location.replace(href('login.html')); }

  /* Erros do Postgres em português: usa o hint quando existe */
  const errMsg = (e, fallback = 'Não deu certo. Tente de novo.') => {
    if (!e) return fallback;
    const hint = e.hint || (e.details && /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(e.details) ? e.details : '');
    if (hint) return hint;
    const m = e.message || String(e);
    const map = {
      'Invalid login credentials': 'E-mail ou senha não conferem.',
      'Email not confirmed': 'Confirme seu e-mail antes de entrar.',
      'User already registered': 'Este e-mail já tem conta. Entre com ele.',
      'Password should be at least 6 characters': 'A senha precisa ter pelo menos 8 caracteres.',
      'insufficient_privilege': 'Você não tem permissão para isso.',
      'plan_limit_users': 'Limite de usuários do plano atingido.',
      'slug_taken': 'Este endereço já está em uso.',
      'duplicate key value violates unique constraint "permission_profiles_company_id_name_key"': 'Já existe um perfil com este nome.'
    };
    for (const k in map) if (m.includes(k)) return map[k];
    return m.length < 140 ? m : fallback;
  };

  /* ---------- UI: toast, modal, sheet ---------- */
  let toastT, undoFn = null;
  function toast(txt, opts = {}) {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); t.innerHTML = '<span id="toast-txt"></span><button id="toast-undo" type="button">Desfazer</button>'; document.body.appendChild(t); $('#toast-undo', t).onclick = () => { t.classList.remove('open'); if (undoFn) undoFn(); undoFn = null; }; }
    $('#toast-txt', t).textContent = txt;
    undoFn = opts.undo || null;
    $('#toast-undo', t).style.display = undoFn ? '' : 'none';
    t.classList.toggle('bad', !!opts.bad);
    t.classList.add('open'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('open'), opts.ms || 4200);
  }
  function openModal(id) { const m = document.getElementById(id); if (!m) return; m.classList.add('open'); const f = $('input,select,textarea,button:not(.close)', m); if (f) setTimeout(() => f.focus(), 60); }
  function closeModals() { $$('.scrim.open').forEach(m => m.classList.remove('open')); $$('.drawer.open').forEach(d => d.classList.remove('open')); }
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]'); if (o) { openModal(o.dataset.open); return; }
    if (e.target.closest('[data-close]')) { const s = e.target.closest('.scrim,.drawer'); if (s) s.classList.remove('open'); else closeModals(); return; }
    if (e.target.classList && e.target.classList.contains('scrim') && e.target.classList.contains('open')) e.target.classList.remove('open');
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModals(); });
  /* Confirmação para o irreversível */
  function confirmModal({ title, text, ok = 'Confirmar', danger = false }) {
    return new Promise(res => {
      let m = $('#m-confirm');
      if (!m) { m = document.createElement('div'); m.id = 'm-confirm'; m.className = 'scrim'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); document.body.appendChild(m); }
      m.innerHTML = `<div class="modal"><div class="mh"><h2>${esc(title)}</h2><button class="btn icon ghost close" data-close aria-label="Fechar">${ico('i-x')}</button></div><p class="lead">${esc(text)}</p><div class="mf"><button class="btn lg" data-close type="button">Cancelar</button><button class="btn lg ${danger ? 'danger' : 'primary'}" id="m-confirm-ok" type="button">${esc(ok)}</button></div></div>`;
      m.classList.add('open');
      const done = v => { m.classList.remove('open'); res(v); };
      $('#m-confirm-ok', m).onclick = () => done(true);
      $$('[data-close]', m).forEach(b => b.addEventListener('click', () => done(false), { once: true }));
    });
  }
  function busy(btn, on, label) { if (!btn) return; if (on) { btn.dataset.label = btn.innerHTML; btn.classList.add('loading'); btn.disabled = true; btn.innerHTML = `<span class="spin"></span>${esc(label || 'Salvando')}`; } else { btn.classList.remove('loading'); btn.disabled = false; if (btn.dataset.label) btn.innerHTML = btn.dataset.label; } }
  async function copyText(txt) { try { await navigator.clipboard.writeText(txt); toast('Copiado.'); return true; } catch (e) { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('Copiado.'); } catch (e2) { toast('Não foi possível copiar. Selecione e copie manualmente.', { bad: true }); } ta.remove(); return false; } }

  /* Faixa "sem conexão" quando o Supabase não está configurado */
  function offlineBanner(target) {
    const el = document.createElement('div');
    el.className = 'banner warn'; el.id = 'ban-offline';
    el.innerHTML = `${ico('i-wifi-off', 'ic ic-sm')}<span>Sem conexão com o banco. Preencha SUPABASE_URL e SUPABASE_ANON_KEY em config.js para ativar login, equipe e marca. Você está vendo a tela em modo demonstração.</span>`;
    (target || document.body).prepend(el);
    return el;
  }

  /* ---------- mobile ---------- */
  const mq = window.matchMedia('(max-width: 768px)');
  const mqCompact = window.matchMedia('(min-width: 769px) and (max-width: 1180px)');
  /* Três patamares: celular (até 768), compacto (769 a 1180: barra lateral só com ícones e ficha em painel) e desktop */
  function syncMobile() { const app = $('#app') || document.body; [app, document.body].forEach(el => { el.classList.toggle('is-mobile', mq.matches); el.classList.toggle('is-compact', mqCompact.matches); }); }
  [mq, mqCompact].forEach(m => m.addEventListener ? m.addEventListener('change', syncMobile) : m.addListener(syncMobile));

  /* ---------- roteador por hash ---------- */
  function router(routes, onChange) {
    const go = () => {
      const raw = (location.hash || '').replace(/^#\/?/, '');
      const [path, qs] = raw.split('?');
      const name = routes[path] ? path : (routes[''] ? '' : Object.keys(routes)[0]);
      const params = Object.fromEntries(new URLSearchParams(qs || ''));
      $$('.screen').forEach(s => s.classList.toggle('active', s.id === 's-' + (name || 'home')));
      $$('[data-nav]').forEach(b => b.setAttribute('aria-current', b.dataset.nav === name ? 'page' : 'false'));
      try { routes[name](params); } catch (e) { console.error(e); }
      if (onChange) onChange(name, params);
      const main = $('#main'); if (main) main.scrollTop = 0;
    };
    window.addEventListener('hashchange', go);
    go();
    return go;
  }

  /* ---------- ícones (sprite do mock) ---------- */
  const ICONS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></symbol>
  <symbol id="i-x" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol>
  <symbol id="i-chev-d" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></symbol>
  <symbol id="i-chev-r" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></symbol>
  <symbol id="i-chev-l" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
  <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
  <symbol id="i-alert-tri" viewBox="0 0 24 24"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></symbol>
  <symbol id="i-alert" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></symbol>
  <symbol id="i-inbox" viewBox="0 0 24 24"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></symbol>
  <symbol id="i-msg" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></symbol>
  <symbol id="i-user" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></symbol>
  <symbol id="i-users" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></symbol>
  <symbol id="i-sliders" viewBox="0 0 24 24"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></symbol>
  <symbol id="i-chart" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></symbol>
  <symbol id="i-phone" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></symbol>
  <symbol id="i-more" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></symbol>
  <symbol id="i-refresh" viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></symbol>
  <symbol id="i-copy" viewBox="0 0 24 24"><rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></symbol>
  <symbol id="i-eye" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></symbol>
  <symbol id="i-eye-off" viewBox="0 0 24 24"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="M2 2l20 20"/></symbol>
  <symbol id="i-logout" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></symbol>
  <symbol id="i-wifi-off" viewBox="0 0 24 24"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></symbol>
  <symbol id="i-building" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></symbol>
  <symbol id="i-plug" viewBox="0 0 24 24"><path d="M12 22v-5M9 8V2M15 8V2"/><path d="M18 8v5a6 6 0 0 1-12 0V8z"/></symbol>
  <symbol id="i-image" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/></symbol>
  <symbol id="i-arrow-l" viewBox="0 0 24 24"><path d="M19 12H5m7 7-7-7 7-7"/></symbol>
  <symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></symbol>
  <symbol id="i-home" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></symbol>
  <symbol id="i-pencil" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></symbol>
  <symbol id="i-activity" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></symbol>
  <symbol id="i-server" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01M6 18h.01"/></symbol>
  <symbol id="i-key" viewBox="0 0 24 24"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 1 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></symbol>
  <symbol id="i-list" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></symbol>
  <symbol id="i-lock" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></symbol>
  <symbol id="i-columns" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18"/></symbol>
  <symbol id="i-link" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></symbol>
  <symbol id="i-mail" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></symbol>
  <symbol id="i-upload" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/></symbol>
  <symbol id="i-trash" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m1 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></symbol>
  <symbol id="i-next" viewBox="0 0 24 24"><path d="m5 4 10 8-10 8V4z"/><path d="M19 5v14"/></symbol>
  <symbol id="i-shuffle" viewBox="0 0 24 24"><path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="m4 4 5 5"/></symbol>
  <symbol id="i-repeat" viewBox="0 0 24 24"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></symbol>
  <symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></symbol>
  <symbol id="i-grip" viewBox="0 0 24 24"><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></symbol>
  <symbol id="i-up" viewBox="0 0 24 24"><path d="M7 17 17 7M7 7h10v10"/></symbol>
  <symbol id="i-down" viewBox="0 0 24 24"><path d="m7 7 10 10M17 7v10H7"/></symbol>
  <symbol id="i-table" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18M3 9h18M3 15h18"/></symbol>
  <symbol id="i-download" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></symbol>
  <symbol id="i-filter" viewBox="0 0 24 24"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></symbol>
  <symbol id="i-monitor" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></symbol>
  <symbol id="i-trend" viewBox="0 0 24 24"><path d="M22 7l-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></symbol>
  <symbol id="i-whatsapp" viewBox="0 0 24 24"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></symbol>
</svg>`;
  function mountIcons() { if (!$('#pz-icons')) { const d = document.createElement('div'); d.id = 'pz-icons'; d.innerHTML = ICONS; document.body.prepend(d); } }

  /* ---------- boot comum ---------- */
  document.addEventListener('DOMContentLoaded', () => { mountIcons(); syncMobile(); });

  /* ---------- fase 2: hora, dia, URL assinada, Edge Functions ---------- */
  const fmtTime = iso => iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
  const dayLabel = iso => {
    if (!iso) return '';
    const d = new Date(iso), t = new Date(); const y = new Date(t); y.setDate(t.getDate() - 1);
    const same = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    if (same(d, t)) return 'Hoje'; if (same(d, y)) return 'Ontem';
    const s = d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' }).replace('.', '');
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  const fmtBytes = n => { n = Number(n || 0); if (!n) return ''; if (n < 1024) return n + ' B'; if (n < 1048576) return Math.round(n / 1024) + ' KB'; return (n / 1048576).toFixed(1).replace('.', ',') + ' MB'; };
  const fmtDur = s => { s = Math.round(Number(s || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const signedCache = new Map();
  async function signedUrl(client, path, seconds = 600) {
    if (!path || !client) return null;
    const hit = signedCache.get(path); if (hit && hit.exp > Date.now()) return hit.url;
    const { data, error } = await client.storage.from('media').createSignedUrl(path, seconds);
    if (error || !data) return null;
    signedCache.set(path, { url: data.signedUrl, exp: Date.now() + (seconds - 30) * 1000 });
    return data.signedUrl;
  }
  /* Chama uma Edge Function com o JWT da sessão e o x-company-id (super admin dentro de uma empresa). */
  async function invoke(client, name, body, companyId) {
    if (!client) throw new Error('Sem conexão com o banco.');
    const { data: { session } } = await client.auth.getSession();
    if (!session) throw new Error('Sessão expirada. Entre de novo.');
    const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token, apikey: PZ.SUPABASE_ANON_KEY };
    if (companyId) headers['x-company-id'] = companyId;
    const res = await fetch(`${PZ.SUPABASE_URL}/functions/v1/${name}`, { method: 'POST', headers, body: JSON.stringify(body || {}) });
    let data = null; try { data = await res.json(); } catch (e) { data = null; }
    if (!res.ok) { const err = new Error((data && data.error && data.error.message) || `Erro ${res.status}`); err.code = data && data.error && data.error.code; err.status = res.status; err.details = data && data.error && data.error.details; throw err; }
    return data;
  }
  /* Texto de mensagem: escapa e transforma links http(s) em <a> seguros */
  const linkify = txt => esc(txt).replace(/(https?:\/\/[^\s<]+)/g, u => `<a class="link" href="${u}" target="_blank" rel="noopener noreferrer">${u}</a>`).replace(/\n/g, '<br>');

  window.pz = {
    PZ, sb, configured, tenant, inFallback, href, publicLink, publicUrl,
    $, $$, esc, initials, ico, fmtPhone, phoneDigits, maskPhoneInput, relTime, dt, slugify,
    lum, contrast, inkFor, isHex,
    get branding() { return branding; }, applyBranding, resolveBranding, platformBranding,
    ctx, can, canAny, requireSession, signOut, errMsg,
    toast, openModal, closeModals, confirmModal, busy, copyText, offlineBanner, router, syncMobile,
    fmtTime, dayLabel, fmtBytes, fmtDur, signedUrl, invoke, linkify
  };
})();
