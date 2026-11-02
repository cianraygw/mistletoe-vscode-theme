// @ts-check
'use strict';

const DAY_MS = 86400000;

// getCountdown and getAdvent must stay self-contained: the webview reuses
// their source via Function.prototype.toString().

/**
 * Time left until the next Christmas Day (25 Dec) or Christmas Eve (24 Dec), local time.
 * @param {Date} now
 * @param {string} target 'christmasDay' | 'christmasEve'
 */
function getCountdown(now, target) {
  const day = target === 'christmasEve' ? 24 : 25;
  const label = target === 'christmasEve' ? 'Christmas Eve' : 'Christmas';
  let year = now.getFullYear();
  const start = new Date(year, 11, day);
  const end = new Date(year, 11, day + 1);
  if (now >= start && now < end) {
    return { isToday: true, label, target: start, ms: 0, days: 0, hours: 0, minutes: 0, seconds: 0, sleeps: 0 };
  }
  if (now >= end) year += 1;
  const when = new Date(year, 11, day);
  const ms = when.getTime() - now.getTime();
  const sec = Math.floor(ms / 1000);
  // Calendar-day difference, immune to DST shifts.
  const sleeps = Math.round(
    (Date.UTC(year, 11, day) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000,
  );
  return {
    isToday: false,
    label,
    target: when,
    ms,
    days: Math.floor(sec / 86400),
    hours: Math.floor(sec / 3600) % 24,
    minutes: Math.floor(sec / 60) % 60,
    seconds: sec % 60,
    sleeps,
  };
}

/**
 * Advent calendar progress: one light per day from 1 to 24 December.
 * @param {Date} now
 */
function getAdvent(now) {
  const month = now.getMonth();
  const date = now.getDate();
  if (month === 11) {
    return { lit: Math.min(date, 24), today: date <= 24 ? date : 0, startsIn: 0 };
  }
  const y = now.getFullYear();
  const startsIn = Math.round((Date.UTC(y, 11, 1) - Date.UTC(y, month, date)) / 86400000);
  return { lit: 0, today: 0, startsIn };
}

/** @param {ReturnType<typeof getCountdown>} c */
function statusText(c) {
  if (c.isToday) return '🎄 Merry Christmas!';
  if (c.ms < DAY_MS) return `🎄 ${c.hours}h ${c.minutes}m to ${c.label}`;
  return `🎄 ${c.days} ${c.days === 1 ? 'day' : 'days'} to ${c.label}`;
}

/** @param {ReturnType<typeof getCountdown>} c */
function tooltipText(c) {
  const date = c.target.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  if (c.isToday) return `Merry Christmas! 🎁\n${date}`;
  return `${c.sleeps} ${c.sleeps === 1 ? 'sleep' : 'sleeps'} until ${c.label}\n${date}\n\nClick to open the countdown`;
}

module.exports = { getCountdown, getAdvent, statusText, tooltipText };
