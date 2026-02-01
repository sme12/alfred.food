# Editable Shopping Lists - Backend Implementation Plan

## Design Decisions
- **Storage**: New Redis key `meal-planner:custom:{weekKey}` (keeps AI plan immutable)
- **ID format**: `custom-{uuid}` prefix distinguishes from AI items (`item-{hash}`)
- **Checked state**: Shared `checkedIds` set (prefix prevents collisions)
- **Remove behavior**: Hard delete (remove from array, no soft-delete)

## Schema Changes

**File: `schemas/mealPlanResponse.ts`**

Add:
```typescript
export const CustomShoppingItemSchema = z.object({
  id: z.string(),                // "custom-{uuid}"
  name: z.string(),
  amount: z.string(),
  category: CategorySchema,      // reuse existing 7 categories
  createdAt: z.string(),         // ISO timestamp for ordering
});
export type CustomShoppingItem = z.infer<typeof CustomShoppingItemSchema>;
```

## API Routes

**New file: `app/api/plans/[weekKey]/custom/route.ts`**

| Method | Description |
|--------|-------------|
| GET | Return `{ customItems: CustomShoppingItem[] }` |
| PUT | Accept `{ customItems: CustomShoppingItem[] }`, replace in Redis |

Pattern matches existing checked/deleted routes.

**Update: `app/api/plans/[weekKey]/route.ts`**

DELETE handler: add `meal-planner:custom:{weekKey}` to cleanup.

## Hook Modifications

**File: `hooks/usePlans.ts`**

1. Add `customItems: CustomShoppingItem[]` to state
2. Fetch `/api/plans/{weekKey}/custom` in parallel with existing calls
3. Add mutations:
   - `addCustomItem(item: {name, amount, category})` - generates id + createdAt, optimistic update, PUT
   - `updateCustomItem(id, {name?, amount?, category?})` - optimistic update, PUT
   - `removeCustomItem(id)` - filter from array, optimistic update, PUT
   - Also remove from checkedIds if present

## Files to Modify
1. [schemas/mealPlanResponse.ts](schemas/mealPlanResponse.ts) - add CustomShoppingItemSchema
2. [app/api/plans/[weekKey]/custom/route.ts](app/api/plans/[weekKey]/custom/route.ts) - new file, GET+PUT
3. [app/api/plans/[weekKey]/route.ts](app/api/plans/[weekKey]/route.ts) - update DELETE cleanup
4. [hooks/usePlans.ts](hooks/usePlans.ts) - extend state + mutations

## Backward Compatibility
All changes are additive - existing plans unaffected:
- New Redis key `custom:{weekKey}` - old plans don't have it → API returns `{ customItems: [] }`
- Schema addition - `CustomShoppingItemSchema` is new type, existing schemas unchanged
- Hook state - `customItems` defaults to empty array when key missing
- DELETE cleanup - `redis.del()` silently ignores non-existent keys

No migration needed. Old plans work as-is with empty custom items.

## Verification
1. `pnpm tsc --noEmit` - type check passes
2. Manual test: load existing old plan, verify no errors, customItems = []
3. Manual test: add custom item via API, verify persisted in Redis
4. Manual test: delete plan, verify custom items cleaned up
5. Manual test: check/uncheck custom item, verify shared checkedIds works

## Unresolved Questions
None - all backend questions resolved.
