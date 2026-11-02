'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { getCountdown, getAdvent, statusText } = require('../src/countdown');
const { buildMessages, formatMessage } = require('../src/messages');

const at = (y, m, d, h = 0, min = 0) => new Date(y, m - 1, d, h, min);

test('counts calendar days (sleeps) to Christmas Day', () => {
  const c = getCountdown(at(2026, 11, 2, 10), 'christmasDay');
  assert.equal(c.isToday, false);
  assert.equal(c.sleeps, 53);
  assert.equal(c.label, 'Christmas');
  assert.equal(c.days, 52, 'full days, matching the clock');
  assert.equal(statusText(c), '🎄 52 days to Christmas');
});

test('Christmas Eve target counts to the 24th', () => {
  const c = getCountdown(at(2026, 11, 2, 10), 'christmasEve');
  assert.equal(c.sleeps, 52);
  assert.equal(statusText(c), '🎄 51 days to Christmas Eve');
});

test('switches to hours and minutes inside the last day', () => {
  const c = getCountdown(at(2026, 12, 24, 19, 30), 'christmasDay');
  assert.equal(c.sleeps, 1);
  assert.equal(statusText(c), '🎄 4h 30m to Christmas');
});

test('the whole day is Christmas, then it rolls over to next year', () => {
  assert.equal(getCountdown(at(2026, 12, 25, 0, 0), 'christmasDay').isToday, true);
  assert.equal(getCountdown(at(2026, 12, 25, 23, 59), 'christmasDay').isToday, true);
  assert.equal(statusText(getCountdown(at(2026, 12, 25, 12), 'christmasDay')), '🎄 Merry Christmas!');
  const after = getCountdown(at(2026, 12, 26, 9), 'christmasDay');
  assert.equal(after.isToday, false);
  assert.equal(after.target.getFullYear(), 2027);
  assert.equal(after.sleeps, 364);
});

test('clock parts add up to the remaining time', () => {
  const c = getCountdown(at(2026, 12, 20, 13, 45), 'christmasDay');
  assert.equal(c.days, 4);
  assert.equal(c.hours, 10);
  assert.equal(c.minutes, 15);
  assert.equal(c.seconds, 0);
});

test('singular day wording', () => {
  const c = getCountdown(at(2026, 12, 23, 23, 30), 'christmasEve');
  assert.equal(c.sleeps, 1);
  assert.equal(statusText(c), '🎄 0h 30m to Christmas Eve');
  assert.equal(statusText(getCountdown(at(2026, 12, 23, 10), 'christmasDay')), '🎄 1 day to Christmas');
});

test('advent lights', () => {
  assert.deepEqual(getAdvent(at(2026, 11, 2)), { lit: 0, today: 0, startsIn: 29 });
  assert.deepEqual(getAdvent(at(2026, 12, 1)), { lit: 1, today: 1, startsIn: 0 });
  assert.deepEqual(getAdvent(at(2026, 12, 24)), { lit: 24, today: 24, startsIn: 0 });
  assert.deepEqual(getAdvent(at(2026, 12, 27)), { lit: 24, today: 0, startsIn: 0 });
});

test('messages fill placeholders and skip {days} on the day itself', () => {
  const c = getCountdown(at(2026, 11, 2), 'christmasEve');
  assert.equal(formatMessage('{days} sleeps until {target}', c), '52 sleeps until Christmas Eve');
  const today = getCountdown(at(2026, 12, 25, 12), 'christmasDay');
  assert.equal(formatMessage('{days} to go', today), null);
  assert.deepEqual(buildMessages(['  hi  ', '', 42, '{days} left'], c), ['hi', '52 left']);
  assert.ok(buildMessages([], c).length > 10, 'falls back to built-in messages');
  assert.ok(buildMessages([], today).every((m) => !m.includes('{')), 'no raw placeholders on Christmas');
});
