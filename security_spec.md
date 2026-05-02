# Security Specification - DigiProduct Revenue Tracker

## Data Invariants
1. A revenue entry must have a valid `sourceId` pointing to an existing `incomeSources` document owned by the same user.
2. A user can only read and write their own data.
3. Amounts must be positive numbers.
4. Dates must be in YYYY-MM-DD format.

## The "Dirty Dozen" Payloads

1. **Identity Spoofing**: Attempting to create an `incomeSource` with another user's `userId`.
2. **Resource Hijacking**: Attempting to read another user's `revenueEntries`.
3. **Invalid Type**: Attempting to set `amount` to a string.
4. **Extreme Value**: Attempting to set `amount` to a massive number to cause overflow or display issues.
5. **Shadow Field**: Attempting to add an `isAdmin` field to a user profile (though not using user profiles yet, good to keep in mind).
6. **Orphaned Write**: Creating a `revenueEntry` for a `sourceId` that doesn't exist.
7. **Cross-User Leak**: Attempting to list all `incomeSources` without a filter on `userId`.
8. **Immutable Field Change**: Attempting to change the `userId` of an existing entry.
9. **Timestamp Spoofing**: Sending a client-side `createdAt` timestamp instead of a server timestamp.
10. **ID Poisoning**: Using a 2KB string as a document ID.
11. **State Jump**: Attempting to modify a "system-only" field (if any).
12. **Blanket Read**: Authenticated user trying to list all `userGoals` in the system.

## Test Runner (Logic Overview)
The `firestore.rules` will be tested against these cases. Each rule block will explicitly check `request.auth.uid == resource.data.userId` for reads and `request.auth.uid == request.resource.data.userId` for writes.

## Conflicts Matrix
- `incomeSources`: Owner-only access.
- `revenueEntries`: Owner-only access.
- `userGoals`: Owner-only access (single document per user approach usually, but we'll use a collection keyed by userId or document with userId field).
