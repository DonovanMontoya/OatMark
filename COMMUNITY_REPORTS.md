# Community Reports: Consensus-Based Trust

Shops no longer just *have* data — they have a stream of community reports
that continuously confirm or dispute what's displayed. The shop page shows
*why* the data is trusted ("✓ Confirmed 2w ago · 3 confirmations"), not
just a checkmark.

## Data model

```
coffee_shops/{shopId}
  ├─ oatMilk, upCharge, ...        (displayed values, unchanged)
  ├─ lastConfirmedAt: Timestamp    ─┐
  ├─ lastOnSiteConfirmedAt         │ materialized consensus counters,
  ├─ confirmCount: number          │ updated in the same batch as each
  ├─ disputeCount: number          │ report so reads stay one doc
  ├─ lastDisputedAt                │
  └─ lastDisputeOnSite: boolean    ─┘

coffee_shops/{shopId}/reports/{userId}
  ├─ type: 'confirm' | 'dispute'
  ├─ onSite: boolean               (user was within 150 m of the shop)
  ├─ createdAt, userId
  ├─ brandAtReport, upChargeAtReport   (what the user saw)
  └─ suggestedBrand, suggestedUpCharge (disputes only: what it actually is)
```

One report doc per user per shop (doc id = uid): re-reporting overwrites,
which bounds volume and makes the rate limit enforceable in rules. Repeat
reports of the same type within 24 h are ignored client-side.

## Consensus rules (utils/reportLogic.js, unit-tested)

| Event | Effect |
|---|---|
| Confirm | `lastConfirmedAt = now`, `confirmCount + 1` |
| Confirm **on site** | also clears disputes — being at the counter outweighs remote reports |
| Dispute | `disputeCount + 1`; suggestions stored on the report for admin review |

Derived status, shown on cards and the shop detail view:

- **disputed** — 2+ disputes, or a single on-site dispute
- **fresh** — confirmed (or created) within the last 90 days
- **stale** — no confirmation in 90+ days; the UI asks "still accurate?"
- **unverified** — no usable timestamps at all

Disputes never edit the listing directly — they flag the shop and carry the
suggested correction; admins fix the listing with the existing Manage flow.

## On-site weighting

The app already knows the user's location. A report made within 150 m of
the shop (`ONSITE_RADIUS_METERS`) is marked `onSite` and weighted as the
strongest trust signal — it's cheap Sybil resistance grounded in physics.

## Required Firestore security rules

The client materializes counters itself (there are no Cloud Functions in
this project), so rules must constrain what a report write can touch:

```
match /coffee_shops/{shopId} {
  allow read: if true;

  // Community writes may only touch the consensus counters —
  // never the shop's displayed data
  allow update: if request.auth != null
    && request.resource.data.diff(resource.data).affectedKeys().hasOnly([
      'lastConfirmedAt', 'lastOnSiteConfirmedAt', 'confirmCount',
      'disputeCount', 'lastDisputedAt', 'lastDisputeOnSite'
    ]);

  match /reports/{userId} {
    allow read: if request.auth != null;
    allow create, update: if request.auth != null
      && request.auth.uid == userId
      && request.resource.data.type in ['confirm', 'dispute'];
  }
}
```

(Admin edit/manage rules stay as they are — layer these on top.)

## Known v1 simplifications

- Consensus is computed client-side and trusted; rules limit blast radius
  but a hostile client can still inflate counters. Server-side aggregation
  (Cloud Function on report write) is the upgrade path.
- `confirmCount` counts confirmations, not unique confirmers — a user
  re-confirming after the cooldown increments it again.
- Disputed shops are flagged visually but there is no dedicated admin
  "disputed queue" yet; the reports subcollection holds the suggestions.
