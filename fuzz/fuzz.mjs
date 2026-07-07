/**
 * Fuzz harness for OatMark pure utility modules.
 *
 * Usage: node fuzz/fuzz.mjs
 *
 * The repo's utils use ES module syntax but package.json has no "type": "module",
 * so this harness copies them to a temp dir as .mjs before importing.
 *
 * Each section generates randomized/adversarial inputs and checks invariants
 * (no throws, no NaN/invalid output, sanitized output actually sanitized, etc).
 * Violations are grouped and printed with up to 3 concrete repro examples.
 */
import { mkdtempSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const utilsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'utils');
const tmp = mkdtempSync(join(tmpdir(), 'oatmark-fuzz-'));
for (const f of ['ValidationUtils', 'GeoUtils', 'upchargeEmojis']) {
  copyFileSync(join(utilsDir, `${f}.js`), join(tmp, `${f}.mjs`));
}
const {
  isValidEmail, validateShopName, validateUpcharge, validateEmoji,
} = await import(pathToFileURL(join(tmp, 'ValidationUtils.mjs')));
const {
  getDistanceMeters, getDestinationPoint, calculateSquareCorners,
  isPointInSquare, getNearestPointOnSquare,
} = await import(pathToFileURL(join(tmp, 'GeoUtils.mjs')));
const {
  getUpchargeEmoji, getFormattedUpcharge, getUpchargeColor,
} = await import(pathToFileURL(join(tmp, 'upchargeEmojis.mjs')));

const realError = console.error, realWarn = console.warn;
console.error = () => {}; console.warn = () => {};

const findings = new Map();
function report(key, example) {
  if (!findings.has(key)) findings.set(key, { count: 0, examples: [] });
  const f = findings.get(key);
  f.count++;
  if (f.examples.length < 3) f.examples.push(example);
}

let seed = 12345;
function rnd() {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return ((seed >>> 0) / 4294967296);
}
function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }

const ZWSP = '​', ZWJ = '‍', RLO = '‮', BOM = '﻿';
const weirdChars = ['<', '>', '"', "'", '&', '\\', ' ',
  ZWSP, ZWJ, RLO, BOM, ' ', ' ', '　',
  '\u{1F600}', '\u{1F468}‍\u{1F469}‍\u{1F467}‍\u{1F466}',
  '☕', '\uD83D', '\uDE00', 'é', '中', '؀', '١'];
function randomString(maxLen = 60) {
  const len = Math.floor(rnd() * maxLen);
  let s = '';
  for (let i = 0; i < len; i++) {
    const r = rnd();
    if (r < 0.5) s += String.fromCharCode(32 + Math.floor(rnd() * 95));
    else if (r < 0.8) s += pick(weirdChars);
    else s += String.fromCharCode(Math.floor(rnd() * 0xFFFF));
  }
  return s;
}
function randomNumberString() {
  return pick([
    () => String((rnd() * 200 - 100).toFixed(Math.floor(rnd() * 4))),
    () => `-${(rnd() * 100).toFixed(2)}`,
    () => `$${(rnd() * 100).toFixed(2)}`,
    () => `${Math.floor(rnd() * 10)}e${Math.floor(rnd() * 5)}`,
    () => `${(rnd() * 100).toFixed(2)}${pick(['abc', '$', ' USD', '..', '.'])}`,
    () => randomString(10),
    () => pick(['Infinity', '-Infinity', 'NaN', 'free', 'FREE', 'Free ', '0x10', '1,50', '1.2.3', '..', '.', '', ' ', '00.001', '99.999', '99.994999']),
  ])();
}
const hasUnpairedSurrogate = (s) => {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c >= 0xD800 && c <= 0xDBFF) {
      const n = s.charCodeAt(i + 1);
      if (!(n >= 0xDC00 && n <= 0xDFFF)) return true;
      i++;
    } else if (c >= 0xDC00 && c <= 0xDFFF) return true;
  }
  return false;
};
// zero-width chars, bidi controls, odd spaces, regular whitespace
const INVISIBLES = /^[​-‏‪-‮⁠﻿­  - 　\s]*$/u;

const N = 200000;

// ---------- 1. validateUpcharge ----------
for (let i = 0; i < N; i++) {
  const input = randomNumberString();
  const isFree = rnd() < 0.1;
  let r;
  try { r = validateUpcharge(input, isFree); }
  catch (e) { report('validateUpcharge THROWS', { input, err: e.message }); continue; }
  if (r.isValid && !isFree) {
    const v = parseFloat(r.sanitized.replace(/[^0-9.-]/g, ''));
    if (/^\s*-/.test(String(input)) && v > 0) {
      report('validateUpcharge: negative input accepted as positive price', { input, sanitized: r.sanitized });
    }
    if (/\de\d/i.test(String(input))) {
      report('validateUpcharge: exponent-style input silently mangled', { input, sanitized: r.sanitized });
    }
    if (v > 99.99) report('validateUpcharge: sanitized exceeds 99.99 cap', { input, sanitized: r.sanitized });
  }
}
for (const input of ['-5', '-0.50', ' -1.25', '1e3', '2e2', 'costs 3 dollars and 50 cents', '3 for 2', 'a1b2c3', '1 2 3']) {
  const r = validateUpcharge(input, false);
  report('validateUpcharge targeted (informational)', { input, isValid: r.isValid, sanitized: r.sanitized });
}

// ---------- 2. sanitizeTextInput / validateShopName ----------
for (let i = 0; i < N; i++) {
  const input = randomString(80);
  let r;
  try { r = validateShopName(input); }
  catch (e) { report('validateShopName THROWS', { input, err: e.message }); continue; }
  if (hasUnpairedSurrogate(r.sanitized)) {
    report('sanitizeTextInput: output contains unpaired surrogate (invalid UTF-16)', { inputSample: JSON.stringify(input.slice(0, 20)), tail: JSON.stringify(r.sanitized.slice(-4)) });
  }
  if (r.isValid && INVISIBLES.test(r.sanitized)) {
    report('validateShopName: accepts name made only of invisible characters', { codepoints: [...r.sanitized].map(c => 'U+' + c.codePointAt(0).toString(16)).join(' ').slice(0, 60) });
  }
}
{
  const name = 'A'.repeat(49) + '\u{1F600}extra';
  const r = validateShopName(name);
  if (hasUnpairedSurrogate(r.sanitized)) report('sanitizeTextInput: substring(0,50) splits surrogate pair at maxLength boundary', { tail: JSON.stringify(r.sanitized.slice(-2)), isValid: r.isValid });
}
{
  const r = validateShopName(ZWSP + ZWSP);
  if (r.isValid) report('validateShopName: two zero-width spaces pass as valid 2-char name', { sanitized: JSON.stringify(r.sanitized) });
  const r2 = validateShopName(RLO + 'evilShop');
  if (r2.isValid && r2.sanitized.includes(RLO)) report('sanitizeTextInput: bidi-override control chars survive (display spoofing)', { sanitized: JSON.stringify(r2.sanitized) });
}

// ---------- 3. validateEmoji ----------
for (const input of ['abcd', 'HACK', 42, {}, [], true,
  '\u{1F468}‍\u{1F469}‍\u{1F467}‍\u{1F466}', '\u{1F3F3}️‍\u{1F308}',
  null, undefined, '\uD83D']) {
  let r;
  try { r = validateEmoji(input); }
  catch (e) { report('validateEmoji THROWS', { input: String(input), err: e.message }); continue; }
  const desc = { input: typeof input === 'string' ? JSON.stringify(input) : `${typeof input}:${String(input)}`, sanitized: typeof r.sanitized === 'string' ? JSON.stringify(r.sanitized) : `${typeof r.sanitized}:${String(r.sanitized)}`, isValid: r.isValid };
  if (typeof r.sanitized !== 'string') report('validateEmoji: non-string sanitized output', desc);
  else if (typeof input === 'string' && input.length <= 4 && !/\p{Extended_Pictographic}/u.test(input) && r.sanitized === input && input !== '') report('validateEmoji: arbitrary non-emoji text accepted', desc);
  else if (typeof input === 'string' && input.length > 4 && /\p{Extended_Pictographic}/u.test(input) && r.sanitized === '☕') report('validateEmoji: legitimate multi-codepoint emoji (ZWJ family/flag) rejected', desc);
}

// ---------- 4. upchargeEmojis with realistic Firestore values ----------
for (const v of [1.5, 0, 'Free', '$1.50', '', null, undefined, true, { amount: 1 }]) {
  for (const [name, fn] of [['getUpchargeEmoji', getUpchargeEmoji], ['getFormattedUpcharge', getFormattedUpcharge], ['getUpchargeColor', getUpchargeColor]]) {
    try {
      const out = fn(v);
      if (name === 'getFormattedUpcharge' && /\+(undefined|null|true|\[object|$)/.test(String(out))) {
        report('getFormattedUpcharge: renders broken text to user', { input: `${typeof v}:${String(v)}`, out });
      }
    } catch (e) {
      report(`${name} THROWS on non-string upCharge`, { input: `${typeof v}:${JSON.stringify(v)}`, err: e.message });
    }
  }
}

// ---------- 5. getDistanceMeters ----------
for (let i = 0; i < N; i++) {
  const a = { latitude: rnd() * 180 - 90, longitude: rnd() * 360 - 180 };
  const b = rnd() < 0.3
    ? { latitude: -a.latitude + (rnd() - 0.5) * 1e-9, longitude: a.longitude + 180 + (rnd() - 0.5) * 1e-9 }
    : { latitude: rnd() * 180 - 90, longitude: rnd() * 360 - 180 };
  const d = getDistanceMeters(a, b);
  if (Number.isNaN(d)) report('getDistanceMeters: NaN for valid antipodal coords (haversine FP domain error)', { a, b });
  else if (d < 0) report('getDistanceMeters: negative distance', { a, b, d });
}
// Invalid input must not throw (NaN with a logged error is the contract)
for (const [a, b] of [[{}, {}], [{ latitude: 1, longitude: 2 }, undefined], [null, null]]) {
  try { getDistanceMeters(a, b); }
  catch (e) { report('getDistanceMeters THROWS on missing location', { a: JSON.stringify(a), b: JSON.stringify(b), err: e.message }); }
}

// ---------- 6. getDestinationPoint ----------
for (let i = 0; i < N / 10; i++) {
  const start = { latitude: rnd() * 180 - 90, longitude: rnd() * 360 - 180 };
  const dist = rnd() * 20000;
  const bearing = rnd() * 720 - 360;
  const dest = getDestinationPoint(start, dist, bearing);
  if (!Number.isFinite(dest.latitude) || !Number.isFinite(dest.longitude)) {
    report('getDestinationPoint: non-finite output', { start, dist, bearing, dest });
  } else if (dest.longitude > 180 || dest.longitude < -180) {
    report('getDestinationPoint: longitude out of [-180,180] (no wrap normalization)', { startLng: start.longitude.toFixed(3), destLng: dest.longitude.toFixed(3) });
  }
}
{
  const dest = getDestinationPoint({ latitude: 40, longitude: -105 }, NaN, 90);
  if (Number.isNaN(dest.latitude)) report('getDestinationPoint: NaN distance passes validation (typeof NaN === number, NaN<0 false)', { dest });
  const dest3 = getDestinationPoint({ latitude: 40, longitude: -105 }, 100, NaN);
  if (Number.isNaN(dest3.latitude)) report('getDestinationPoint: NaN bearing passes validation', { dest3 });
}

// ---------- 7. square boundary functions ----------
for (let i = 0; i < N / 4; i++) {
  const center = { latitude: rnd() * 180 - 90, longitude: rnd() * 360 - 180 };
  const dist = rnd() * 5000;
  const point = { latitude: rnd() * 180 - 90, longitude: rnd() * 360 - 180 };
  const nearest = getNearestPointOnSquare(point, center, dist);
  if (!Number.isFinite(nearest.latitude) || !Number.isFinite(nearest.longitude)) {
    report('getNearestPointOnSquare: non-finite output', { point, center, dist });
  } else if (!isPointInSquare(nearest, center, dist)) {
    report('getNearestPointOnSquare: returned point NOT in square (contract violation)', { point: { lat: point.latitude.toFixed(4), lng: point.longitude.toFixed(4) }, center: { lat: center.latitude.toFixed(4), lng: center.longitude.toFixed(4) }, dist: dist.toFixed(1) });
  }
  const corners = calculateSquareCorners(center, dist);
  for (const c of corners) {
    if (Math.abs(c.latitude) > 90 || !Number.isFinite(c.longitude) || Math.abs(c.longitude) > 180) {
      report('calculateSquareCorners: corner outside valid lat/lng range (poles/antimeridian)', { center: { lat: center.latitude.toFixed(3), lng: center.longitude.toFixed(3) }, dist: dist.toFixed(0), corner: { lat: c.latitude.toFixed(3), lng: c.longitude.toFixed(3) } });
      break;
    }
  }
}

// ---------- 8. isValidEmail edge ----------
{
  const padded = '   ' + 'a'.repeat(248) + '@bb.cc   '; // trimmed length 254 = valid
  const r = isValidEmail(padded);
  if (!r && padded.trim().length <= 254) report('isValidEmail: rejects valid email due to untrimmed length check', { rawLen: padded.length, trimmedLen: padded.trim().length });
}

console.error = realError; console.warn = realWarn;
console.log('\n=== FUZZ RESULTS ===\n');
for (const [key, f] of findings) {
  console.log(`>> ${key}  (hits: ${f.count})`);
  for (const ex of f.examples) console.log('   ', JSON.stringify(ex));
  console.log();
}
if (findings.size === 0) console.log('No invariant violations found.');
