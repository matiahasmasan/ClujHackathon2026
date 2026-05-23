/**
 * Simulated append-only ledger (a tiny "blockchain") kept in localStorage.
 *
 * Each entry stores a SHA-256 `hash` computed over its own fields plus the
 * previous entry's hash (`prevHash`). This chains the entries together: if any
 * past entry is edited or removed, the recomputed hashes no longer line up and
 * verify() reports exactly where the chain breaks. Nothing here is meant for
 * real security — it demonstrates tamper-evidence for the demo.
 */

const STORAGE_KEY = "care_ledger";
const GENESIS_HASH = "0".repeat(64);

/** SHA-256 of a string, returned as lowercase hex. */
export async function sha256Hex(input) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Canonical string that a row's hash is computed from. */
function canonical(entry) {
  return [
    entry.id,
    entry.createdAt,
    entry.actor,
    entry.action,
    JSON.stringify(entry.payload),
    entry.prevHash,
  ].join("|");
}

/** Read the raw entries from localStorage (no verification). */
export function loadLedger() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLedger(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/**
 * Append a new event to the ledger, chaining it to the last entry.
 * Returns the updated list of entries.
 */
export async function appendLedger({ actor, action, payload }) {
  const entries = loadLedger();
  const prev = entries[entries.length - 1];
  const entry = {
    id: entries.length + 1,
    createdAt: new Date().toISOString(),
    actor,
    action,
    payload,
    prevHash: prev ? prev.hash : GENESIS_HASH,
  };
  entry.hash = await sha256Hex(canonical(entry));
  const next = [...entries, entry];
  saveLedger(next);
  return next;
}

/**
 * Recompute the whole chain and report integrity.
 * Returns { valid: boolean, brokenAt: number|null } where brokenAt is the id
 * of the first tampered/broken entry.
 */
export async function verifyLedger() {
  const entries = loadLedger();
  let prevHash = GENESIS_HASH;
  for (const entry of entries) {
    // The link to the previous entry must match…
    if (entry.prevHash !== prevHash) {
      return { valid: false, brokenAt: entry.id };
    }
    // …and the stored hash must match a fresh recomputation of the contents.
    const expected = await sha256Hex(canonical(entry));
    if (expected !== entry.hash) {
      return { valid: false, brokenAt: entry.id };
    }
    prevHash = entry.hash;
  }
  return { valid: true, brokenAt: null };
}

/**
 * DEMO ONLY: tamper with an entry's payload WITHOUT recomputing its hash,
 * so verify() will detect the broken chain. Returns the (now corrupt) entries.
 */
export function tamperLedger(id, changes) {
  const entries = loadLedger();
  const target = entries.find((e) => e.id === id);
  if (target) {
    target.payload = { ...target.payload, ...changes };
    saveLedger(entries);
  }
  return entries;
}

export function clearLedger() {
  localStorage.removeItem(STORAGE_KEY);
}

/** Seed a few realistic care events if the ledger is empty. */
export async function seedLedger() {
  clearLedger();
  await appendLedger({
    actor: "Dr. Elena Marin",
    action: "medication.taken",
    payload: { senior: "Ion Pop", medication: "Aspirin", dose: "100mg", time: "08:00" },
  });
  await appendLedger({
    actor: "Dr. Elena Marin",
    action: "medication.taken",
    payload: { senior: "Maria Ene", medication: "Metformin", dose: "500mg", time: "08:15" },
  });
  await appendLedger({
    actor: "Andrei Ionescu",
    action: "senior.diagnoses_updated",
    payload: {
      senior: "Ion Pop",
      from: "hypertension",
      to: "hypertension, type 2 diabetes",
    },
  });
  return loadLedger();
}

/** Human-readable label for an action. */
export const ACTION_LABELS = {
  "medication.taken": "Medication administered",
  "medication.created": "Medication added",
  "medication.updated": "Medication updated",
  "medication.deleted": "Medication removed",
  "senior.diagnoses_updated": "Diagnoses updated",
  "senior.assigned": "Senior assigned to caregiver",
};
