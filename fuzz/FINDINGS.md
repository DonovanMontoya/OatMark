# Fuzz Testing Findings

Results from fuzzing OatMark's pure utility modules (`utils/ValidationUtils.js`,
`utils/GeoUtils.js`, `utils/upchargeEmojis.js`) plus code review of the call
sites that consume their output. Reproduce with:

```bash
node fuzz/fuzz.mjs
```

Each finding below was confirmed with concrete inputs (shown in the harness
output). Ordered by severity.

---

## High — crashes

### 1. `upchargeEmojis` functions throw on non-string `upCharge` → shop list crash

`getUpchargeEmoji`, `getFormattedUpcharge`, and `getUpchargeColor` all call
`upcharge.toLowerCase()` assuming a string (`utils/upchargeEmojis.js:22,46,61`).
`ShopCard` calls two of them unconditionally on every card with raw Firestore
data (`components/ShopCard.js:64,67`), and `HomeScreen` does the same for the
selected shop (`HomeScreen.js:1192,1202`).

One document in `coffee_shops` with a numeric `upCharge` (e.g. `1.5` written
before validation existed, or edited in the Firebase console) throws
`upcharge.toLowerCase is not a function` during render and takes down the whole
shop list. Note `getFormattedUpcharge`'s optional chaining (`upcharge?.`)
doesn't help — a number is not nullish, so `.toLowerCase()` is still invoked.

Fix: coerce with `String(upcharge)` at the top of each function (or bail out
for non-strings).

### 2. `getDistanceMeters` has no input validation → crash on missing location

Every other function in `utils/GeoUtils.js` validates its inputs;
`getDistanceMeters` (line 40) does not. `getDistanceMeters(loc, undefined)`
throws `Cannot read properties of undefined (reading 'latitude')`.

`HomeScreen`'s Firestore path filters shops through `isValidLocation` first,
but `ShopCard.js:91` and the sort comparator at `HomeScreen.js:650` will crash
if a shop without a valid `location` ever reaches them (e.g. via a cache
written by an older app version, or a future caller). Also, passing objects
with missing/NaN fields returns `NaN` silently, which scrambles the
distance sort (a NaN comparator result makes `Array.sort` order undefined).

---

## High — money data corruption

### 3. `validateUpcharge` accepts negative prices as positive

Input `"-5"` → sanitized `"$5.00"`, `isValid: true`. The regex
`replace(/[^0-9.]/g, '')` strips the minus sign *before* the `price < 0` check
(`utils/ValidationUtils.js:202,222`), so the negative check is dead code.

The native `SubmitShopScreen` keypad filters input as you type, but
`AdminScreen.js:94` and web/paste paths feed arbitrary strings through this
validator.

### 4. `validateUpcharge` silently mangles digit-and-letter input

Strip-then-parse concatenates all digits in the string:

| Input | Stored value |
|---|---|
| `1e3` (user means 1000) | `$13.00` |
| `3 for 2` | `$32.00` |
| `a1b2c3` | `$123.00` |
| `costs 3 dollars and 50 cents` | `$350` → rejected only because > 99.99 |

The user's intent is misread and stored without any warning. Safer approach:
validate the string matches `^\$?\d{1,2}(\.\d{1,2})?$` after trimming, and
reject anything else instead of stripping.

---

## High — data integrity

### 5. `sanitizeTextInput` truncation splits emoji, producing invalid UTF-16

`substring(0, maxLength)` (`utils/ValidationUtils.js:24`) cuts at UTF-16 code
units. A 49-character shop name followed by an emoji gets cut through the
middle of the surrogate pair, leaving an unpaired high surrogate at the end of
the "sanitized" string. This is invalid UTF-16: it renders as `�`, and
unpaired surrogates are rejected or mangled by UTF-8 encoders (including the
Firestore wire protocol) and by `JSON.parse` round-trips.

Fuzzing also showed lone surrogates in the *input* pass straight through — the
control-character filter `[\x00-\x1f\x7f]` doesn't touch them.

Fix: truncate with code-point awareness (`[...input].slice(0, maxLength).join('')`)
and strip unpaired surrogates.

---

## Medium — spoofing / validation gaps

### 6. Invisible and bidi-control shop names pass validation

- `validateShopName("​​")` (two zero-width spaces) → **valid**. The
  name renders as nothing. `trim()` doesn't remove zero-width characters
  (they're not Unicode whitespace), and the sanitizer only strips ASCII
  control characters.
- `U+202E` (right-to-left override) survives sanitization →
  `"‮evilShop"` is valid and renders reversed, a classic display-spoofing
  primitive.
- The `/^\s*$/` whitespace check at `utils/ValidationUtils.js:140` is dead
  code: input was already trimmed, so a whitespace-only string is `''` and
  is caught by the length check first.

Fix: strip Unicode `Cf` (format) characters — `/\p{Cf}/gu` — in
`sanitizeTextInput`, then re-check length.

### 7. `validateEmoji` validates length, not emoji-ness — and rejects real emoji

`utils/ValidationUtils.js:254` only checks `length > 4`:

- `"HACK"`, `"abcd"`, `"<b>!"` (post-sanitization) → accepted as the shop's "emoji".
- Non-strings pass through untouched: `validateEmoji(42)` returns
  `sanitized: 42` (a number) which is written to Firestore as-is
  (`SubmitShopScreen.js:264`).
- Legitimate multi-codepoint emoji are rejected: 👨‍👩‍👧‍👦 (11 UTF-16 units) and
  🏳️‍🌈 (6 units) silently become ☕.
- `result.isValid` is always `true`, so callers can never tell rejection happened.

Fix: check against an emoji regex (`/^\p{Extended_Pictographic}/u`-based) or
validate membership in the app's own `EmojiSelector` list.

---

## Medium — geo math

### 8. `getDestinationPoint`'s validation doesn't catch `NaN`

`typeof NaN === 'number'` and `NaN < 0` is `false`, so `NaN` distance, bearing,
or coordinates pass all three guards (`utils/GeoUtils.js:70-83`) and return
`{latitude: NaN, longitude: NaN}`. Use `Number.isFinite()` instead of `typeof`.

### 9. Pole/antimeridian breakage in the square-boundary helpers

- `calculateSquareCorners` near the poles produces latitudes > 90° and
  longitude offsets of hundreds of degrees (fuzz example: center lat 89.998 →
  corner lng −1245°). `metersPerDegreeLongitude(±90)` ≈ 0, so the division
  blows up. These corners are drawn on the map in `SubmitShopScreen.js:460,497`.
- `getDestinationPoint` doesn't wrap longitude, returning values like 185.6°.
- `getDistanceMeters` returns `NaN` for near-antipodal points: floating-point
  error pushes the haversine `a_val` slightly above 1 and
  `Math.sqrt(1 - a_val)` goes negative (2,705 hits in 200k iterations). Clamp
  with `Math.min(1, a_val)`.

Not urgent for a coffee-shop app (nobody submits a café at the South Pole),
but they're silent invariant violations in shared utilities.

---

## Low — UX / consistency

### 10. `getFormattedUpcharge` renders `"💰 +undefined"`

For missing/empty `upCharge`, `getUpchargeEmoji` correctly falls back to 💰,
but `getFormattedUpcharge` then returns `` `${emoji} +${upcharge}` `` →
`"💰 +undefined"`, `"💰 +null"`, or `"💰 +"` (`utils/upchargeEmojis.js:50`).
`ShopCard.js:67` calls it unguarded, so any shop missing `upCharge` displays
this literally. (`HomeScreen.js:332` guards; the card doesn't.)

### 11. Corrupt cache timestamp makes the shop cache immortal

In `services/ShopCache.js:62`, if the cached `timestamp` is missing or
non-numeric, `cacheAge` is `NaN` and `NaN > CACHE_EXPIRATION_TIME` is `false`
→ the cache is treated as *fresh forever*. Meanwhile `isCacheValid()`
(line 101, `NaN < CACHE_EXPIRATION_TIME` → `false`) reports the same cache as
*invalid* — the two functions disagree on the same data. Also
`loadFavoritesFromCache` never checks the parsed value is an array.

### 12. `handleNetworkError` always reports "offline" on native

`utils/ErrorUtils.js:139` checks `!navigator?.onLine`. In React Native,
`navigator` exists but `onLine` is `undefined`, so `isOffline` is always
`true` and every network error shows the "You appear to be offline" message
regardless of actual connectivity.

### 13. `isValidEmail` length check runs on the untrimmed string

`utils/ValidationUtils.js:38` tests the regex on `email.trim()` but the length
cap on the raw `email`. An email that is valid after trimming can be rejected
because of surrounding whitespace. Cosmetic, since the form likely trims first.

---

## Summary of recommended fixes (by file)

| File | Fix |
|---|---|
| `utils/upchargeEmojis.js` | Coerce `upcharge` to string at the top of all three functions; fix `+undefined` formatting |
| `utils/ValidationUtils.js` | Reject (don't strip-and-reinterpret) malformed prices; strip `\p{Cf}` chars; code-point-safe truncation; real emoji validation; `Number.isFinite` everywhere |
| `utils/GeoUtils.js` | Add input validation to `getDistanceMeters`; clamp haversine `a_val` to ≤ 1; use `Number.isFinite` in guards; wrap longitudes |
| `services/ShopCache.js` | Treat non-numeric timestamps as expired; validate parsed cache shape |
| `utils/ErrorUtils.js` | Use `@react-native-community/netinfo` (or drop the offline guess) instead of `navigator.onLine` |
