// Renders a mock VS Code window per theme (syntax via shiki, chrome from the
// theme's own workbench colours) and screenshots it with headless Chrome.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHighlighter } from 'shiki';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { getHtml } = require('../src/webview.js');
const { getCountdown, statusText } = require('../src/countdown.js');
const { DEFAULT_MESSAGES } = require('../src/messages.js');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const code = `// Plan the sleigh route before midnight
import { Elf, Gift, type Route } from './workshop';

interface Stop {
  city: string;
  gifts: Gift[];
  chimney?: boolean;
}

const MAX_LOAD = 1_000_000; // grams of joy

@Wrapped('gold')
export class Sleigh {
  private reindeer = ['Dasher', 'Dancer', 'Comet', 'Vixen'];

  constructor(private readonly pilot: Elf) {}

  async deliver(stops: Stop[]): Promise<Route> {
    const route = stops.filter((s) => s.gifts.length > 0);
    for (const stop of route) {
      if (stop.chimney === false) continue;
      await this.pilot.drop(stop.gifts, { gentle: true });
    }
    return { stops: route.length, eta: \`\${Date.now() + 3_600}\` };
  }
}`;

const ACTIVE_LINE = 21;
const BRACKETS = { '(': 1, '[': 1, '{': 1, ')': -1, ']': -1, '}': -1 };

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function renderCode(lines, c, punct) {
  const lights = [1, 2, 3, 4, 5, 6].map((i) => c[`editorBracketHighlight.foreground${i}`]);
  let depth = 0;
  return lines
    .map((tokens, i) => {
      const html = tokens
        .map((t) => {
          const style = [
            t.fontStyle & 1 ? 'font-style:italic' : '',
            t.fontStyle & 2 ? 'font-weight:bold' : '',
          ].join(';');
          // Mimic VS Code bracket pair colourisation on punctuation tokens.
          if (t.color?.toLowerCase() === punct.toLowerCase() && /[()[\]{}]/.test(t.content)) {
            return [...t.content]
              .map((ch) => {
                if (!(ch in BRACKETS)) return `<span style="color:${t.color}">${esc(ch)}</span>`;
                if (BRACKETS[ch] < 0) depth--;
                const col = lights[((depth % 6) + 6) % 6];
                if (BRACKETS[ch] > 0) depth++;
                return `<span style="color:${col}">${esc(ch)}</span>`;
              })
              .join('');
          }
          return `<span style="color:${t.color};${style}">${esc(t.content)}</span>`;
        })
        .join('');
      const n = i + 1;
      const active = n === ACTIVE_LINE;
      const cursor = active ? `<span class="cursor"></span>` : '';
      return `<div class="line${active ? ' active' : ''}"><span class="ln">${n}</span><span class="src">${html}${cursor}</span></div>`;
    })
    .join('');
}

const icon = (d) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICONS = [
  icon('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'),
  icon('<circle cx="11" cy="11" r="6"/><path d="m20 20-4.3-4.3"/>'),
  icon('<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 7v10M18 10c0 4-6 3-11 7"/>'),
  icon('<path d="M8 5v14l11-7z"/>'),
  icon('<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><path d="M16.5 3.5v7M13 7h7"/>'),
];

const MISTLETOE_ICON = readFileSync(join(root, 'images', 'activity.svg'), 'utf8').replace('<svg ', '<svg width="24" height="24" ');

// The countdown webview as VS Code would show it, with the theme's colours as --vscode-* variables.
function viewHtml(theme) {
  const vars = Object.entries(theme.colors).map(([k, v]) => `--vscode-${k.replace(/\./g, '-')}: ${v};`).join(' ');
  const fonts = `--vscode-font-family: -apple-system, BlinkMacSystemFont, sans-serif; --vscode-font-size: 13px; --vscode-editor-font-family: 'SF Mono', Menlo, monospace;`;
  const html = getHtml({
    cspSource: "'self'",
    nonce: 'preview',
    state: { target: 'christmasDay', messages: DEFAULT_MESSAGES, snow: true, reduceMotion: 'off', intervalSeconds: 15 },
  });
  // Freeze the digit animation so the capture never lands mid-transition.
  return html
    .replace('<head>', `<head><style nonce="preview">html { ${vars} ${fonts} } .num.drop { animation: none !important; }</style>`)
    .replace('<body>', `<body class="vscode-${theme.type}">`);
}

function page(theme, codeHtml, extras = false) {
  const c = theme.colors;
  const files = [
    { name: 'src', dir: true, open: true, depth: 0 },
    { name: 'elves.ts', depth: 1 },
    { name: 'gifts.json', depth: 1, git: 'gitDecoration.untrackedResourceForeground', badge: 'U' },
    { name: 'sleigh.ts', depth: 1, active: true, git: 'gitDecoration.modifiedResourceForeground', badge: 'M' },
    { name: 'workshop.ts', depth: 1, git: 'gitDecoration.addedResourceForeground', badge: 'A' },
    { name: 'snow.css', depth: 1 },
    { name: 'README.md', depth: 0 },
    { name: 'package.json', depth: 0 },
  ];
  const tree = files
    .map((f) => {
      const color = f.git ? c[f.git] : f.dir ? c['sideBarTitle.foreground'] : c['sideBar.foreground'];
      const bg = f.active ? `background:${c['list.activeSelectionBackground']};outline:1px solid ${c['list.focusOutline']};outline-offset:-1px;` : '';
      const chevron = f.dir ? (f.open ? '⌄' : '›') : '';
      return `<div class="row" style="padding-left:${12 + f.depth * 14}px;color:${color};${bg}"><span class="chev">${chevron}</span>${esc(f.name)}${f.badge ? `<span class="gb">${f.badge}</span>` : ''}</div>`;
    })
    .join('');

  const term = [
    [c['terminal.ansiGreen'], '➜ ', c['terminal.ansiBlue'], 'north-pole ', c['terminal.foreground'], 'npm run deliver'],
    [c['terminal.ansiGreen'], '✔ ', c['terminal.foreground'], '4 reindeer harnessed ', c['terminal.ansiBrightBlack'], '(212ms)'],
    [c['terminal.ansiYellow'], '⚠ ', c['terminal.foreground'], 'chimney too narrow at ', c['terminal.ansiCyan'], 'Tromsø'],
    [c['terminal.ansiRed'], '✖ ', c['terminal.foreground'], 'cookies missing at ', c['terminal.ansiMagenta'], '24 houses'],
  ]
    .map((parts) => {
      let s = '';
      for (let i = 0; i < parts.length; i += 2) s += `<span style="color:${parts[i]}">${esc(parts[i + 1])}</span>`;
      return `<div>${s}</div>`;
    })
    .join('');

  return `<!doctype html><html><head><meta charset="utf-8"><style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 1200px; height: 860px; overflow: hidden; background: ${c['editor.background']};
  font: 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: ${c.foreground}; }
.win { display: grid; grid-template-rows: 34px 1fr 22px; height: 100%; }
.title { background: ${c['titleBar.activeBackground']}; color: ${c['titleBar.activeForeground']}; border-bottom: 1px solid ${c['titleBar.border']};
  display: flex; align-items: center; justify-content: center; position: relative; font-size: 12px; }
.lights { position: absolute; left: 14px; display: flex; gap: 8px; }
.lights i { width: 12px; height: 12px; border-radius: 50%; display: block; }
.cc { background: ${c['commandCenter.background']}; border: 1px solid ${c['commandCenter.border']}; color: ${c['commandCenter.foreground']};
  border-radius: 6px; padding: 3px 120px; }
.main { display: grid; grid-template-columns: 48px ${extras ? 300 : 240}px 1fr; min-height: 0; }
.view { border: 0; display: block; width: 100%; height: calc(100% - 57px); }
.ab { background: ${c['activityBar.background']}; border-right: 1px solid ${c['activityBar.border']}; padding-top: 4px; }
.ab div { height: 48px; display: flex; align-items: center; justify-content: center; color: ${c['activityBar.inactiveForeground']}; position: relative; }
.ab div.on { color: ${c['activityBar.foreground']}; box-shadow: inset 2px 0 0 ${c['activityBar.activeBorder']}; }
.ab .badge { position: absolute; right: 8px; bottom: 9px; background: ${c['activityBarBadge.background']}; color: ${c['activityBarBadge.foreground']};
  font-size: 9px; border-radius: 8px; min-width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-weight: 600; }
.sb { background: ${c['sideBar.background']}; border-right: 1px solid ${c['sideBar.border']}; color: ${c['sideBar.foreground']}; }
.sbt { height: 35px; display: flex; align-items: center; padding: 0 20px; font-size: 11px; letter-spacing: .5px; color: ${c['sideBarTitle.foreground']}; }
.sec { height: 22px; display: flex; align-items: center; padding: 0 8px; font-size: 11px; font-weight: 700; color: ${c['sideBarSectionHeader.foreground']}; }
.row { height: 22px; display: flex; align-items: center; font-size: 13px; position: relative; padding-right: 12px; }
.chev { width: 16px; display: inline-block; text-align: center; margin-right: 2px; color: ${c['icon.foreground']}; }
.gb { margin-left: auto; font-size: 11px; }
.ed { display: grid; grid-template-rows: 35px 22px 1fr 170px; min-width: 0; min-height: 0; }
.tabs { background: ${c['editorGroupHeader.tabsBackground']}; display: flex; border-bottom: 1px solid ${c['editorGroupHeader.tabsBorder']}; }
.tab { padding: 0 18px; display: flex; align-items: center; gap: 8px; background: ${c['tab.inactiveBackground']}; color: ${c['tab.inactiveForeground']};
  border-right: 1px solid ${c['tab.border']}; }
.tab.on { background: ${c['tab.activeBackground']}; color: ${c['tab.activeForeground']}; box-shadow: inset 0 1px 0 ${c['tab.activeBorderTop']};
  margin-bottom: -1px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: ${c['tab.activeModifiedBorder']}; }
.crumbs { background: ${c['breadcrumb.background']}; color: ${c['breadcrumb.foreground']}; font-size: 12px; display: flex; align-items: center; padding: 0 16px; gap: 6px; }
.crumbs b { font-weight: normal; color: ${c['breadcrumb.focusForeground']}; }
.code { background: ${c['editor.background']}; font: 13.5px/20px 'SF Mono', Menlo, Monaco, monospace; padding-top: 4px; overflow: hidden; white-space: pre; }
.line { display: flex; height: 20px; }
.line.active { background: ${c['editor.lineHighlightBackground']}; }
.ln { width: 56px; text-align: right; padding-right: 22px; color: ${c['editorLineNumber.foreground']}; flex: none; }
.line.active .ln { color: ${c['editorLineNumber.activeForeground']}; }
.cursor { display: inline-block; width: 2px; height: 18px; vertical-align: -4px; background: ${c['editorCursor.foreground']}; margin-left: 1px; }
.panel { background: ${c['panel.background']}; border-top: 1px solid ${c['panel.border']}; padding: 0 16px; }
.ptabs { display: flex; gap: 22px; height: 34px; align-items: center; font-size: 11px; letter-spacing: .4px; color: ${c['panelTitle.inactiveForeground']}; }
.ptabs .on { color: ${c['panelTitle.activeForeground']}; box-shadow: inset 0 -1px 0 ${c['panelTitle.activeBorder']}; padding: 9px 0 8px; }
.term { font: 13px/20px 'SF Mono', Menlo, monospace; padding-top: 4px; }
.status { background: ${c['statusBar.background']}; color: ${c['statusBar.foreground']}; display: flex; align-items: center; gap: 16px; padding: 0 10px; font-size: 12px; }
.status .r { margin-left: auto; display: flex; gap: 16px; }
.remote { background: ${c['statusBarItem.remoteBackground']}; color: ${c['statusBarItem.remoteForeground']}; height: 100%; display: flex; align-items: center; padding: 0 10px; margin-left: -10px; }
</style></head><body><div class="win">
<div class="title"><div class="lights"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i></div>
<div class="cc">north-pole</div></div>
<div class="main">
<div class="ab">${[...ICONS, MISTLETOE_ICON].map((s, i) => `<div class="${i === (extras ? 5 : 0) ? 'on' : ''}">${s}${i === 2 ? '<span class="badge">3</span>' : ''}</div>`).join('')}</div>
<div class="sb">${extras
    ? `<div class="sbt">MISTLETOE</div><div class="sec">⌄ CHRISTMAS COUNTDOWN</div><iframe class="view" srcdoc="${viewHtml(theme).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"></iframe>`
    : `<div class="sbt">EXPLORER</div><div class="sec">⌄ NORTH-POLE</div>${tree}`}</div>
<div class="ed">
<div class="tabs"><div class="tab on">sleigh.ts <span class="dot"></span></div><div class="tab">gifts.json</div><div class="tab">snow.css</div></div>
<div class="crumbs">src <span>›</span> <b>sleigh.ts</b> <span>›</span> <span style="color:${c['breadcrumb.foreground']}">Sleigh</span> <span>›</span> deliver</div>
<div class="code">${codeHtml}</div>
<div class="panel"><div class="ptabs"><span>PROBLEMS</span><span>OUTPUT</span><span class="on">TERMINAL</span><span>PORTS</span></div><div class="term">${term}</div></div>
</div></div>
<div class="status"><span class="remote">❄ North Pole</span><span>⎇ main*</span><span>⊗ 0 ⚠ 1</span>
<span class="r">${extras ? `<span>Deck the halls with well-linted code ✨</span><span>${statusText(getCountdown(new Date(), 'christmasDay'))}</span>` : ''}<span>Ln ${ACTIVE_LINE}, Col 58</span><span>Spaces: 2</span><span>UTF-8</span><span>TypeScript</span><span>${esc(theme.name)}</span></span></div>
</div></body></html>`;
}

const themes = ['mistletoe-midnight', 'mistletoe-frost'].map((id) => ({
  id,
  json: JSON.parse(readFileSync(join(root, 'themes', `${id}-color-theme.json`), 'utf8')),
}));

const highlighter = await createHighlighter({ themes: themes.map((t) => t.json), langs: ['typescript'] });

const shots = [
  ...themes.map((t) => ({ ...t, out: t.id.replace('mistletoe-', ''), extras: false })),
  { ...themes[0], out: 'extras', extras: true },
  { ...themes[1], out: 'extras-frost', extras: true },
];

for (const { id, json, out, extras } of shots) {
  const { tokens } = highlighter.codeToTokens(code, { lang: 'typescript', theme: json.name });
  const punct = json.tokenColors.find((t) => t.name === 'Punctuation').settings.foreground;
  const htmlPath = join(root, 'images', `preview-${out}.html`);
  const pngPath = join(root, 'images', `preview-${out}.png`);
  writeFileSync(htmlPath, page(json, renderCode(tokens, json.colors, punct), extras));
  if (!existsSync(CHROME)) {
    console.log(`Wrote ${htmlPath} (set CHROME=... to also screenshot)`);
    continue;
  }
  // A little virtual time lets the snow and the countdown view start up before the capture.
  const log = execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=2', '--enable-logging=stderr', '--v=0',
    '--virtual-time-budget=1500', '--window-size=1200,860', `--screenshot=${pngPath}`, `file://${htmlPath}`,
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  console.log(`Wrote ${pngPath}`);
  void log;
}
