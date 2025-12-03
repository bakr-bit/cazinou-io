# Toplist Rank Field Migration

**Date:** 2025-12-03
**Status:** Ready to deploy
**Purpose:** Replace manual rank field with native Sanity drag-and-drop ordering

## Problem

Each toplist entry had a manual `rank` field. Reordering required editing every affected entry individually (e.g., moving item from position 8 to 4 required updating 5 entries). This took ~15 minutes for a 50-entry list.

## Solution

Remove the `rank` field and use Sanity's native array ordering. Array position = display rank.

---

## Changes Made

### 1. Migration Script (NEW FILE)
**File:** `studio/scripts/migrateToplistRanks.ts`

- Finds all documents containing topListObject (homePage, infoPage, lotoPageSettings, page, loto, themedSlotsPage)
- Sorts listItems by current rank
- Removes the rank field from each item
- Run with: `npx sanity exec scripts/migrateToplistRanks.ts --with-user-token`
- Use `--dry-run` flag to preview changes

### 2. Sanity Schema Update
**File:** `studio/src/schemaTypes/objects/topListObject.ts`

Changes:
- Removed the `rank` field from listItem object
- Removed the unique rank validation
- Added description: "Drag items to reorder. Position in the list determines the rank."
- Updated preview to not reference rank

### 3. Frontend Component Update
**File:** `frontend/app/components/Toplist.tsx`

Changes:
- Removed `rank?: number` from `TopListItem` type (line 28)
- Removed `sortListItems` function (was sorting by rank)
- Renamed `fallbackRank` to `getRank` (now just returns `index + 1`)
- Removed `useMemo` import (no longer needed)
- Main component now uses `data.listItems` directly instead of sorting

---

## Deployment Order

**IMPORTANT:** Run migration BEFORE deploying frontend changes.

1. **Run migration (dry-run first)**:
   ```bash
   cd studio
   npx sanity exec scripts/migrateToplistRanks.ts --with-user-token --dry-run
   npx sanity exec scripts/migrateToplistRanks.ts --with-user-token
   ```

2. **Deploy frontend** - After migration, arrays are in correct order

3. **Deploy Sanity Studio** - New interface will have drag-and-drop

---

## Dry Run Results (2025-12-03)

- 36 documents with toplists found
- Most have sequential ranks (1, 2, 3...) - array order matches rank order
- One exception: "Top cazinouri online Franța" has gaps (1, 2, 4, 6, 7, 8)
- Migration will sort and fix all

---

## Rollback Plan

If issues occur:
1. Revert frontend changes (restore sorting by rank)
2. Run a reverse migration script to add rank = index + 1 to all items

---

## Files Summary

| File | Action | Status |
|------|--------|--------|
| `studio/scripts/migrateToplistRanks.ts` | Created | ✅ Done |
| `studio/src/schemaTypes/objects/topListObject.ts` | Modified | ✅ Done |
| `frontend/app/components/Toplist.tsx` | Modified | ✅ Done |

---

## After Migration

- Reorder toplist items by dragging in Sanity Studio
- No more manual rank number editing
- Position in array = display rank
