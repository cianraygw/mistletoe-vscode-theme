'use strict';

// Smoke test: runs activate() against a minimal stub of the vscode API.
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const config = {};
const registered = {};
const items = [];
let providers = {};
let configListener;
const shown = [];

const vscode = {
  StatusBarAlignment: { Left: 1, Right: 2 },
  ConfigurationTarget: { Global: 1 },
  window: {
    createStatusBarItem(id, alignment, priority) {
      const item = { id, alignment, priority, text: '', visible: false, disposed: false,
        show() { this.visible = true; }, hide() { this.visible = false; }, dispose() { this.disposed = true; } };
      items.push(item);
      return item;
    },
    registerWebviewViewProvider(id, provider) {
      providers[id] = provider;
      return { dispose() {} };
    },
    showInformationMessage(msg) { shown.push(msg); },
  },
  commands: {
    registerCommand(id, fn) { registered[id] = fn; return { dispose() {} }; },
    executeCommand(id) { return Promise.resolve(id); },
  },
  workspace: {
    getConfiguration(section) {
      return {
        get: (key, def) => (`${section}.${key}` in config ? config[`${section}.${key}`] : def),
        update: async (key, value) => { config[`${section}.${key}`] = value; },
      };
    },
    onDidChangeConfiguration(fn) { configListener = fn; return { dispose() {} }; },
  },
};

const load = Module._load;
Module._load = function (request, ...rest) {
  return request === 'vscode' ? vscode : load.call(this, request, ...rest);
};

test('activates, rotates messages, renders the view and cleans up', async (t) => {
  t.mock.timers.enable({ apis: ['setInterval', 'setTimeout'] });
  const ext = require('../src/extension');
  const context = { subscriptions: [] };
  ext.activate(context);

  const countdown = items.find((i) => i.id === 'mistletoe.countdown');
  const ticker = items.find((i) => i.id === 'mistletoe.ticker');
  assert.ok(countdown.visible && ticker.visible);
  assert.match(countdown.text, /^🎄 (\d+ days? to Christmas|\d+h \d+m to Christmas|Merry Christmas!)$/);
  assert.equal(countdown.command, 'mistletoe.showCountdown');
  assert.ok(ticker.priority > countdown.priority, 'ticker sits left of the countdown');

  // Typewriter finishes, then the next message arrives after the interval.
  t.mock.timers.tick(5000);
  const first = ticker.text;
  assert.ok(first.length > 3);
  t.mock.timers.tick(15000 + 5000);
  assert.notEqual(ticker.text, first);

  // Command skips ahead immediately.
  const before = ticker.text;
  registered['mistletoe.nextMessage']();
  t.mock.timers.tick(5000);
  assert.notEqual(ticker.text, before);

  // Settings are honoured live.
  config['mistletoe.ticker.enabled'] = false;
  config['mistletoe.countdown.target'] = 'christmasEve';
  configListener({ affectsConfiguration: (s) => s === 'mistletoe' });
  assert.equal(ticker.visible, false);
  assert.match(countdown.text, /Christmas Eve|Merry Christmas/);
  registered['mistletoe.nextMessage']();
  assert.equal(shown.length, 1, 'falls back to a notification when the ticker is off');

  // Webview renders with a nonce-locked CSP and the reused countdown logic.
  const view = { webview: { cspSource: 'vscode-resource:', options: {}, html: '' }, onDidDispose() {} };
  providers['mistletoe.view'].resolveWebviewView(view);
  assert.equal(view.webview.options.enableScripts, true);
  const nonce = view.webview.html.match(/'nonce-([a-z0-9]+)'/)[1];
  assert.equal(nonce.length, 32);
  assert.ok(view.webview.html.includes(`<script nonce="${nonce}">`));
  assert.ok(view.webview.html.includes('function getCountdown('));
  assert.ok(view.webview.html.includes('"target":"christmasEve"'));
  const script = view.webview.html.match(/<script nonce="[a-z0-9]+">([\s\S]*)<\/script>/)[1];
  assert.doesNotThrow(() => new Function(script), 'webview script parses');

  // Toggle command flips both status bar features.
  await registered['mistletoe.toggleStatusBar']();
  assert.equal(config['mistletoe.countdown.enabled'], false);

  for (const d of context.subscriptions) d.dispose();
  assert.ok(items.every((i) => i.disposed));
});
