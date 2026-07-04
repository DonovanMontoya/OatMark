# Manual Steps Before Shipping

Owner to-do list for the three open PRs. Everything code-side is done;
these are the steps only you can do.

## 1. Merge order

- [ ] Merge **#13** (fuzz fixes) — independent, merge any time
- [ ] Merge **#14** (filter chips) — independent, merge any time
- [ ] Merge **#15** (community reports) — stacked on #14's branch.
      Merge #14 first; GitHub retargets #15 to `main` automatically.
      **Do not merge #15 before completing step 2.**

## 2. Firestore security rules (required for #15)

Without this, confirm/dispute either fails with permission-denied (if your
rules are restrictive) or — worse — leaves shop listings editable by any
authenticated client (if they're permissive).

Firebase Console → **Firestore Database** → **Rules** tab → edit → **Publish**.

Merge the following into your existing rules (keep your current admin,
`pendingShops`, and `users` rules as they are — this only adds the
community-report paths):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /coffee_shops/{shopId} {
      allow read: if true;

      // Community consensus writes: authenticated users may update ONLY
      // the counter fields — never the shop's displayed data.
      // (Keep your existing admin update/delete rules alongside this.)
      allow update: if request.auth != null
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly([
          'lastConfirmedAt', 'lastOnSiteConfirmedAt', 'confirmCount',
          'disputeCount', 'lastDisputedAt', 'lastDisputeOnSite'
        ]);

      // One report doc per user, keyed by their uid
      match /reports/{userId} {
        allow read: if request.auth != null;
        allow create, update: if request.auth != null
          && request.auth.uid == userId
          && request.resource.data.type in ['confirm', 'dispute']
          && request.resource.data.userId == userId;
      }
    }

    // ... your existing rules for pendingShops, users, etc. ...
  }
}
```

- [ ] Rules merged and published
- [ ] Sanity check in the console **Rules Playground**:
      - authenticated update to `coffee_shops/{id}` touching only
        `confirmCount` + `lastConfirmedAt` → **allowed**
      - authenticated update touching `oatMilk` or `upCharge` → **denied**
        (unless it matches your admin rule)
      - write to `coffee_shops/{id}/reports/<other-user's-uid>` → **denied**

## 3. On-device verification (nothing in these PRs was device-tested)

- [ ] **#14 filters:** chips render in light + dark theme; brand + price
      filters compose; map markers shrink with the list; "Clear filters"
      empty state works
- [ ] **#15 reports:** tap "Still accurate" → success alert, shop shows
      "✓ Confirmed today"; repeat within 24 h → "Already counted";
      "Report a change" → modal validates and submits; check Firestore
      console for the report doc under `coffee_shops/{id}/reports/{uid}`
- [ ] Confirm while physically at a café (or spoof location) → alert says
      "Confirmed on site"

## 4. Optional decisions

- [ ] Badges are positive-only (✓ / ⚠, never a stale badge) since the
      community is small. When confirmations actually flow, consider
      restoring a stale badge in `ShopCard.getFreshnessBadge` and/or
      tuning `FRESHNESS_WINDOW_DAYS` in `utils/reportLogic.js` (90).
- [ ] No data migration or backfill is needed — counter fields appear
      lazily as reports come in. Nothing to run.
- [ ] When submissions grow: consider a Cloud Function to compute the
      consensus counters server-side (upgrade path noted in
      `COMMUNITY_REPORTS.md`).
