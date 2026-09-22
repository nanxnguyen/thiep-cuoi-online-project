// Pure seating-chart logic for /cong-cu/so-do-cho-ngoi — no localStorage/DOM here (kept testable under
// plain `node --test`); the page owns reading/writing its own localStorage key with these helpers.
export const SEATING_STORAGE_KEY = "moc:tools:seating";
export type Table = { id: string; name: string; capacity: number };
export type Assignments = Record<string, string>; // guestId -> tableId

export function countByTable(assignments: Assignments): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const tableId of Object.values(assignments)) counts[tableId] = (counts[tableId] ?? 0) + 1;
  return counts;
}

// Returns the new assignments map, or null if the table doesn't exist or is already at capacity
// (moving a guest already at that table back onto it always succeeds — it doesn't add a new occupant).
export function assignGuest(assignments: Assignments, guestId: string, tableId: string, tables: readonly Table[]): Assignments | null {
  const table = tables.find((t) => t.id === tableId);
  if (!table) return null;
  if (assignments[guestId] !== tableId) {
    const occupied = countByTable(assignments)[tableId] ?? 0;
    if (occupied >= table.capacity) return null;
  }
  return { ...assignments, [guestId]: tableId };
}

export function unassignGuest(assignments: Assignments, guestId: string): Assignments {
  const rest = { ...assignments };
  delete rest[guestId];
  return rest;
}

export function unassignedGuestIds(guestIds: readonly string[], assignments: Assignments): string[] {
  return guestIds.filter((id) => !(id in assignments));
}
