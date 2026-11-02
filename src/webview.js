// @ts-check
'use strict';

const { getCountdown, getAdvent } = require('./countdown');
const { formatMessage } = require('./messages');

/**
 * @param {{ cspSource: string, nonce: string, state: {
 *   target: string, messages: string[], snow: boolean, reduceMotion: string, intervalSeconds: number } }} opts
 */
function getHtml({ cspSource, nonce, state }) {
  const json = JSON.stringify(state).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style nonce="${nonce}">
  :root {
    --red: var(--vscode-charts-red, #f2606f);
    --gold: var(--vscode-charts-yellow, #f4c86a);
    --green: var(--vscode-charts-green, #a3d98c);
    --blue: var(--vscode-charts-blue, #8fd3ea);
    --plum: var(--vscode-charts-purple, #cdb4f5);
    --muted: var(--vscode-descriptionForeground, #a7bcb1);
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body { margin: 0; padding: 14px 14px 18px; overflow: hidden auto; font-family: var(--vscode-font-family); font-size: var(--vscode-font-size, 13px);
    color: var(--vscode-foreground); background: transparent; }
  #snow { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
  main { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 14px; max-width: 420px; margin: 0 auto; }
  .eyebrow { margin: 0; font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--red); text-align: center; }
  .clock { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .tile { text-align: center; padding: 10px 0 7px; border-radius: 8px; overflow: hidden;
    background: var(--vscode-editorWidget-background, rgba(127,127,127,.08));
    border: 1px solid var(--vscode-widget-border, var(--vscode-editorWidget-border, rgba(127,127,127,.2))); }
  .num { display: block; font-family: var(--vscode-editor-font-family, monospace); font-variant-numeric: tabular-nums;
    font-size: clamp(18px, 8vw, 30px); line-height: 1.1; font-weight: 600; color: var(--gold); }
  .num.drop { animation: drop .35s ease-out; }
  @keyframes drop { from { transform: translateY(-40%); opacity: 0; } to { transform: none; opacity: 1; } }
  .unit { display: block; margin-top: 3px; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
  .merry { text-align: center; font-size: clamp(22px, 9vw, 32px); font-weight: 700; line-height: 1.2; padding: 8px 0;
    background: linear-gradient(90deg, var(--red), var(--gold), var(--green)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .sub { margin: 0; text-align: center; color: var(--muted); }
  .lights svg { display: block; width: 100%; height: auto; overflow: visible; }
  .wire { fill: none; stroke: var(--muted); stroke-opacity: .45; stroke-width: 1.2; }
  .cap { fill: var(--muted); fill-opacity: .7; }
  .bulb { fill: currentColor; fill-opacity: .16; transition: fill-opacity .6s; }
  .bulb.lit { fill-opacity: 1; filter: drop-shadow(0 0 3px currentColor); }
  .bulb.today, .bulb.party { animation: twinkle 1.6s ease-in-out infinite; }
  @keyframes twinkle { 0%, 100% { fill-opacity: 1; } 50% { fill-opacity: .35; } }
  .c0 { color: var(--red); } .c1 { color: var(--gold); } .c2 { color: var(--green); } .c3 { color: var(--blue); } .c4 { color: var(--plum); }
  .ticker { position: relative; height: 30px; overflow: hidden; border-radius: 6px; cursor: pointer; user-select: none;
    background: var(--vscode-statusBar-background, #a8182e); color: var(--vscode-statusBar-foreground, #fff);
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
  .ticker span { position: absolute; top: 50%; left: 0; white-space: nowrap; transform: translate(0, -50%); }
  .ticker.still span { left: 50%; transform: translate(-50%, -50%); transition: opacity .4s; max-width: 92%; overflow: hidden; text-overflow: ellipsis; }
  .ticker.still span.fade { opacity: 0; }
  .hint { margin: -8px 0 0; font-size: 11px; text-align: center; color: var(--muted); opacity: .8; }
  @media (prefers-reduced-motion: reduce) { .num.drop, .bulb.today, .bulb.party { animation: none; } }
  body.calm .num.drop, body.calm .bulb.today, body.calm .bulb.party { animation: none; }
</style>
</head>
<body>
<canvas id="snow" aria-hidden="true"></canvas>
<main>
  <p class="eyebrow" id="eyebrow">Christmas in</p>
  <div class="clock" id="clock" role="timer" aria-label="Christmas countdown">
    <div class="tile"><span class="num" id="d">--</span><span class="unit">days</span></div>
    <div class="tile"><span class="num" id="h">--</span><span class="unit">hours</span></div>
    <div class="tile"><span class="num" id="m">--</span><span class="unit">min</span></div>
    <div class="tile"><span class="num" id="s">--</span><span class="unit">sec</span></div>
  </div>
  <div class="merry" id="merry" hidden>Merry Christmas!</div>
  <p class="sub" id="sub"></p>
  <section class="lights" aria-label="Advent calendar lights"><svg id="lights" viewBox="0 0 240 92" role="img"></svg></section>
  <p class="sub" id="advent"></p>
  <div class="ticker" id="ticker" title="Click for the next message" aria-live="polite"><span id="tick"></span></div>
  <p class="hint">Click the banner for the next message</p>
</main>
<script nonce="${nonce}">
(function () {
  const state = ${json};
  ${getCountdown.toString()}
  ${getAdvent.toString()}
  ${formatMessage.toString()}

  const pref = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
  const calm = state.reduceMotion === 'on' || (state.reduceMotion === 'auto' && pref);
  if (calm) document.body.classList.add('calm');
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');

  // Countdown clock
  const last = {};
  function setNum(id, value) {
    if (last[id] === value) return;
    const animate = !calm && id in last;
    last[id] = value;
    const el = $(id);
    el.textContent = value;
    if (animate) { el.classList.remove('drop'); void el.offsetWidth; el.classList.add('drop'); }
  }
  let current = getCountdown(new Date(), state.target);
  function tick() {
    current = getCountdown(new Date(), state.target);
    $('clock').hidden = current.isToday;
    $('eyebrow').hidden = current.isToday;
    $('merry').hidden = !current.isToday;
    $('eyebrow').textContent = current.label + ' in';
    if (!current.isToday) {
      setNum('d', String(current.days));
      setNum('h', pad(current.hours));
      setNum('m', pad(current.minutes));
      setNum('s', pad(current.seconds));
      const date = current.target.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
      $('sub').textContent = current.sleeps + (current.sleeps === 1 ? ' sleep' : ' sleeps') + ' · ' + date;
    } else {
      $('sub').textContent = 'Wishing you a cozy, bug-free Christmas 🎁';
    }
    drawAdvent();
  }

  // Advent lights: 24 bulbs on two sagging wires
  const NS = 'http://www.w3.org/2000/svg';
  const svg = $('lights');
  const bulbs = [];
  function make(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  [16, 60].forEach((y, row) => {
    const p0 = [6, y], p1 = [120, y + 22], p2 = [234, y];
    svg.appendChild(make('path', { class: 'wire', d: 'M' + p0 + ' Q' + p1 + ' ' + p2 }));
    for (let i = 0; i < 12; i++) {
      const t = (i + 0.5) / 12, u = 1 - t;
      const x = u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0];
      const yy = u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1];
      const n = row * 12 + i;
      const g = make('g', { transform: 'translate(' + x.toFixed(1) + ' ' + yy.toFixed(1) + ') rotate(' + ((i % 2 ? 8 : -8)) + ')' });
      g.appendChild(make('rect', { class: 'cap', x: -2.2, y: 0, width: 4.4, height: 3.2, rx: 0.8 }));
      const b = make('ellipse', { class: 'bulb c' + (n % 5), cx: 0, cy: 9, rx: 4.2, ry: 6 });
      const title = make('title', {});
      title.textContent = (n + 1) + ' December';
      b.appendChild(title);
      g.appendChild(b);
      svg.appendChild(g);
      bulbs.push(b);
    }
  });
  let lastAdvent = '';
  function drawAdvent() {
    const now = new Date();
    const a = getAdvent(now);
    const party = current.isToday || (now.getMonth() === 11 && now.getDate() > 24);
    const key = a.lit + ':' + a.today + ':' + party;
    if (key === lastAdvent) return;
    lastAdvent = key;
    bulbs.forEach((b, i) => {
      b.classList.toggle('lit', party || i < a.lit);
      b.classList.toggle('today', !party && i + 1 === a.today);
      b.classList.toggle('party', party);
      b.style.animationDelay = party ? ((i * 137) % 1600) + 'ms' : '';
    });
    $('advent').textContent = party
      ? 'All 24 advent lights are lit ✨'
      : a.lit
        ? 'Advent calendar: day ' + a.lit + ' of 24'
        : 'Advent calendar starts in ' + a.startsIn + (a.startsIn === 1 ? ' day' : ' days');
  }

  // Message banner: scrolls each message across, then rotates to the next
  const band = $('ticker'), tickEl = $('tick');
  let order = [], idx = -1, anim = null, timer = null, first = true;
  function messages() {
    return state.messages.map((m) => formatMessage(m, current)).filter((m) => m);
  }
  function nextMessage() {
    if (anim) { anim.cancel(); anim = null; }
    clearTimeout(timer);
    const list = messages();
    if (!list.length) { band.hidden = true; return; }
    if (!order.length || order.length !== list.length) {
      order = list.map((_, i) => i);
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      idx = -1;
    }
    idx = (idx + 1) % order.length;
    const text = list[order[idx]];
    if (calm) {
      band.classList.add('still');
      tickEl.classList.add('fade');
      setTimeout(() => { tickEl.textContent = text; tickEl.classList.remove('fade'); }, first ? 0 : 400);
      first = false;
      timer = setTimeout(nextMessage, Math.max(3, state.intervalSeconds) * 1000);
      return;
    }
    tickEl.textContent = text;
    const w = band.clientWidth, tw = tickEl.scrollWidth;
    const from = first ? 14 : w;
    first = false;
    const distance = from + tw;
    anim = tickEl.animate(
      [{ transform: 'translate(' + from + 'px, -50%)' }, { transform: 'translate(' + (-tw) + 'px, -50%)' }],
      { duration: (distance / 45) * 1000, easing: 'linear', delay: from < w ? 1800 : 0, fill: 'backwards' },
    );
    anim.onfinish = nextMessage;
  }
  band.addEventListener('click', nextMessage);

  // Snow
  const canvas = $('snow');
  const ctx = canvas.getContext('2d');
  let flakes = [], color = '#ffffff', lastFrame = 0, frame = 0, dpr = 1;
  function resize() {
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    const want = Math.min(110, Math.round((canvas.clientWidth * canvas.clientHeight) / 7000) * (current.isToday ? 2 : 1));
    while (flakes.length < want) flakes.push(newFlake(true));
    flakes.length = want;
  }
  // White flakes vanish on light themes, so tint them icy blue there.
  function snowColor() {
    const cl = document.body.classList;
    if (cl.contains('vscode-light') || cl.contains('vscode-high-contrast-light')) {
      return getComputedStyle(document.documentElement).getPropertyValue('--vscode-charts-blue').trim() || '#6b9bc3';
    }
    return getComputedStyle(document.body).color;
  }
  function newFlake(anywhere) {
    const r = 0.8 + Math.random() * 2.2;
    return { x: Math.random() * canvas.clientWidth, y: anywhere ? Math.random() * canvas.clientHeight : -5,
      r, vy: 12 + r * 9, sway: 6 + Math.random() * 14, phase: Math.random() * Math.PI * 2, a: 0.25 + Math.random() * 0.45 };
  }
  function snow(ts) {
    requestAnimationFrame(snow);
    if (ts - lastFrame < 33) return;
    const dt = Math.min(0.1, (ts - lastFrame) / 1000);
    lastFrame = ts;
    if (frame++ % 90 === 0) color = snowColor();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.fillStyle = color;
    for (const f of flakes) {
      f.y += f.vy * dt;
      f.phase += dt;
      const x = f.x + Math.sin(f.phase) * f.sway;
      if (f.y > canvas.clientHeight + 5) Object.assign(f, newFlake(false));
      ctx.globalAlpha = f.a;
      ctx.beginPath();
      ctx.arc(x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (state.snow && !calm) {
    resize();
    new ResizeObserver(resize).observe(document.body);
    requestAnimationFrame(snow);
  } else {
    canvas.hidden = true;
  }

  tick();
  setInterval(tick, 1000);
  nextMessage();
})();
</script>
</body>
</html>`;
}

module.exports = { getHtml };
