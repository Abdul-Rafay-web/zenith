// Durable outbox for cloud writes. Lives in localStorage (no Firebase import)
// so it survives reloads, app kills and long offline stretches. The Firebase
// layer drains it; this module only knows how to remember.
import { hash } from "./mastery"

export type Bucket = "goals" | "focusSessions" | "skills"

export interface Op {
  key: string
  bucket: Bucket
  id: string
  op: "set" | "delete"
  payload?: unknown
  fingerprint?: number
}

const prefix = (uid: string) => `zenith:v2:${uid}`

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded: keep the in-memory queue; next flush may free space.
  }
}

// Key order from Firestore differs from ours; sort so equal docs hash equal.
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null"
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`
  return `{${Object.keys(value as Record<string, unknown>)
    .filter((k) => (value as Record<string, unknown>)[k] !== undefined)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`)
    .join(",")}}`
}

export const fingerprint = (doc: unknown) => hash(stableStringify(doc))

export function outbox(uid: string): Op[] {
  return read<Op[]>(`${prefix(uid)}:outbox`, [])
}

export function enqueue(uid: string, ops: Op[]) {
  if (!ops.length) return
  const map = new Map(outbox(uid).map((op) => [op.key, op]))
  ops.forEach((op) => map.set(op.key, op))
  write(`${prefix(uid)}:outbox`, [...map.values()])
}

export function settle(uid: string, done: Op[]) {
  const synced = syncedMap(uid)
  const doneKeys = new Map(done.map((op) => [op.key, op]))
  done.forEach((op) => {
    if (op.op === "delete") delete synced[op.key]
    else synced[op.key] = op.fingerprint ?? 0
  })
  // Only drop ops that weren't superseded while the batch was in flight.
  const rest = outbox(uid).filter((op) => {
    const sent = doneKeys.get(op.key)
    return !sent || sent.fingerprint !== op.fingerprint || sent.op !== op.op
  })
  write(`${prefix(uid)}:outbox`, rest)
  write(`${prefix(uid)}:synced`, synced)
}

export function syncedMap(uid: string): Record<string, number> {
  return read<Record<string, number>>(`${prefix(uid)}:synced`, {})
}

export function seedSynced(uid: string, entries: Record<string, number>) {
  write(`${prefix(uid)}:synced`, entries)
}

export function pendingDeletes(uid: string) {
  return new Set(outbox(uid).filter((op) => op.op === "delete").map((op) => op.key))
}

export function clearScope(uid: string) {
  ;["", ":outbox", ":synced"].forEach((suffix) =>
    localStorage.removeItem(`${prefix(uid)}${suffix}`),
  )
}
