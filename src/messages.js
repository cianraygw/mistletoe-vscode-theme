// @ts-check
'use strict';

const DEFAULT_MESSAGES = [
  'Ho ho ho! May all your builds be green 🎄',
  'The best gift? A test suite that passes first time 🎁',
  'Deck the halls with well-linted code ✨',
  'May your merge conflicts be few and your cocoa warm ☕',
  'Friendly reminder: no deploys on Christmas Eve 🎅',
  '{days} sleeps until {target}. Have you pushed your branch? 🛷',
  'Snow is falling, and so is your bug count ❄️',
  'Take a break and grab a gingerbread cookie 🍪',
  'All is calm, all is bright: zero warnings tonight ⭐',
  'Wrap your functions with care 🎀',
  'Jingle all the way… to production 🔔',
  'Leave some cookies out for the on-call elf 🧝',
  'Under the mistletoe? Time to pair program 🌿',
  'Unwrap one small refactor a day 🎄',
];

// Self-contained: the webview reuses it via Function.prototype.toString().
/**
 * Fill in {days} and {target}; returns null when the message makes no sense today.
 * @param {string} message
 * @param {{ isToday: boolean, sleeps: number, label: string }} c
 */
function formatMessage(message, c) {
  if (c.isToday && message.includes('{days}')) return null;
  return message.replace(/\{days\}/g, String(c.sleeps)).replace(/\{target\}/g, c.label);
}

/**
 * The user's messages when they set any, otherwise the built-in ones (unformatted).
 * @param {unknown} custom
 * @returns {string[]}
 */
function sourceMessages(custom) {
  const own = Array.isArray(custom) ? custom.filter((m) => typeof m === 'string' && m.trim()).map((m) => m.trim()) : [];
  return own.length ? own : DEFAULT_MESSAGES;
}

/**
 * @param {unknown} custom
 * @param {{ isToday: boolean, sleeps: number, label: string }} c
 * @returns {string[]}
 */
function buildMessages(custom, c) {
  return /** @type {string[]} */ (sourceMessages(custom).map((m) => formatMessage(m, c)).filter((m) => m !== null));
}

module.exports = { DEFAULT_MESSAGES, formatMessage, sourceMessages, buildMessages };
