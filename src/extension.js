// @ts-check
'use strict';

const vscode = require('vscode');
const { getCountdown, statusText, tooltipText } = require('./countdown');
const { buildMessages, sourceMessages } = require('./messages');
const { getHtml } = require('./webview');

const MAX_TICKER_CHARS = 64;

function settings() {
  const c = vscode.workspace.getConfiguration('mistletoe');
  return {
    countdownEnabled: c.get('countdown.enabled', true),
    target: c.get('countdown.target', 'christmasDay'),
    tickerEnabled: c.get('ticker.enabled', true),
    tickerStyle: c.get('ticker.style', 'typewriter'),
    intervalSeconds: Math.max(3, Number(c.get('ticker.intervalSeconds', 15)) || 15),
    messages: c.get('messages', []),
    snow: c.get('snow.enabled', true),
    reduceMotion: String(vscode.workspace.getConfiguration('workbench').get('reduceMotion', 'auto')),
  };
}

/** @param {string} text */
function graphemes(text) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return [...new Intl.Segmenter().segment(text)].map((s) => s.segment);
  }
  return [...text];
}

/** @param {string} text */
function fit(text) {
  const g = graphemes(text);
  return g.length <= MAX_TICKER_CHARS ? text : g.slice(0, MAX_TICKER_CHARS - 1).join('') + '…';
}

class Countdown {
  constructor() {
    this.item = vscode.window.createStatusBarItem('mistletoe.countdown', vscode.StatusBarAlignment.Right, 10000);
    this.item.name = 'Mistletoe: Christmas Countdown';
    this.item.command = 'mistletoe.showCountdown';
    this.timer = setInterval(() => this.update(), 30000);
    this.update();
  }

  update() {
    const s = settings();
    if (!s.countdownEnabled) {
      this.item.hide();
      return;
    }
    const c = getCountdown(new Date(), s.target);
    this.item.text = statusText(c);
    this.item.tooltip = tooltipText(c);
    this.item.show();
  }

  dispose() {
    clearInterval(this.timer);
    this.item.dispose();
  }
}

class Ticker {
  constructor() {
    // Highest priority = leftmost of the right-hand items, so its changing width never shifts other items.
    this.item = vscode.window.createStatusBarItem('mistletoe.ticker', vscode.StatusBarAlignment.Right, 10001);
    this.item.name = 'Mistletoe: Festive Messages';
    this.item.command = 'mistletoe.nextMessage';
    this.index = Math.floor(Math.random() * 1000);
    /** @type {NodeJS.Timeout | undefined} */ this.timer = undefined;
    /** @type {NodeJS.Timeout | undefined} */ this.typer = undefined;
    this.restart();
  }

  restart() {
    this.stop();
    this.next();
  }

  next() {
    this.stop();
    const s = settings();
    if (!s.tickerEnabled) {
      this.item.hide();
      return;
    }
    const list = buildMessages(s.messages, getCountdown(new Date(), s.target));
    if (!list.length) {
      this.item.hide();
      return;
    }
    this.index = (this.index + 1) % list.length;
    const text = fit(list[this.index]);
    this.item.tooltip = `${text}\n\nClick for the next message`;
    this.item.accessibilityInformation = { label: text };
    this.item.show();
    if (s.tickerStyle === 'typewriter' && s.reduceMotion !== 'on') {
      const chars = graphemes(text);
      let n = 1;
      this.item.text = chars[0];
      this.typer = setInterval(() => {
        n += 1;
        this.item.text = chars.slice(0, n).join('');
        if (n >= chars.length) {
          clearInterval(this.typer);
          this.typer = undefined;
        }
      }, 35);
    } else {
      this.item.text = text;
    }
    this.timer = setTimeout(() => this.next(), s.intervalSeconds * 1000);
  }

  stop() {
    clearTimeout(this.timer);
    clearInterval(this.typer);
    this.timer = undefined;
    this.typer = undefined;
  }

  dispose() {
    this.stop();
    this.item.dispose();
  }
}

class CountdownViewProvider {
  constructor() {
    /** @type {vscode.WebviewView | undefined} */ this.view = undefined;
  }

  /** @param {vscode.WebviewView} view */
  resolveWebviewView(view) {
    this.view = view;
    view.webview.options = { enableScripts: true, localResourceRoots: [] };
    view.onDidDispose(() => {
      this.view = undefined;
    });
    this.render();
  }

  render() {
    if (!this.view) return;
    const s = settings();
    const nonce = [...Array(32)].map(() => Math.floor(Math.random() * 36).toString(36)).join('');
    this.view.webview.html = getHtml({
      cspSource: this.view.webview.cspSource,
      nonce,
      state: {
        target: s.target,
        messages: sourceMessages(s.messages),
        snow: s.snow,
        reduceMotion: s.reduceMotion,
        intervalSeconds: s.intervalSeconds,
      },
    });
  }
}

/** @param {vscode.ExtensionContext} context */
function activate(context) {
  const countdown = new Countdown();
  const ticker = new Ticker();
  const provider = new CountdownViewProvider();

  context.subscriptions.push(
    countdown,
    ticker,
    vscode.window.registerWebviewViewProvider('mistletoe.view', provider),
    vscode.commands.registerCommand('mistletoe.showCountdown', () =>
      vscode.commands.executeCommand('mistletoe.view.focus'),
    ),
    vscode.commands.registerCommand('mistletoe.nextMessage', () => {
      if (settings().tickerEnabled) {
        ticker.next();
        return;
      }
      const s = settings();
      const list = buildMessages(s.messages, getCountdown(new Date(), s.target));
      if (list.length) vscode.window.showInformationMessage(list[Math.floor(Math.random() * list.length)]);
    }),
    vscode.commands.registerCommand('mistletoe.toggleStatusBar', async () => {
      const c = vscode.workspace.getConfiguration('mistletoe');
      const on = c.get('countdown.enabled', true) || c.get('ticker.enabled', true);
      await c.update('countdown.enabled', !on, vscode.ConfigurationTarget.Global);
      await c.update('ticker.enabled', !on, vscode.ConfigurationTarget.Global);
    }),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('mistletoe') || e.affectsConfiguration('workbench.reduceMotion')) {
        countdown.update();
        ticker.restart();
        provider.render();
      }
    }),
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
