// Firestore layer: loaded lazily after sign-in so the auth screen paints
// without waiting on ~350 kB of database SDK.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  initializeFirestore,
  setDoc,
  writeBatch,
  type Firestore,
} from "firebase/firestore"
import { getAuth, type User } from "firebase/auth"
import type { FocusSession, Goal, Skill, ZenithState } from "../types"
import { firebaseApp } from "./firebase"
import {
  enqueue,
  fingerprint,
  outbox,
  seedSynced,
  settle,
  syncedMap,
  type Bucket,
  type Op,
} from "./syncQueue"

let db: Firestore | null = null

function services() {
  const app = firebaseApp()
  // Optional fields (stepId, prediction…) are often undefined; without this
  // flag Firestore rejects the whole write.
  db ||= initializeFirestore(app, { ignoreUndefinedProperties: true })
  return { db, uid: getAuth(app).currentUser?.uid }
}

export async function ensureProfile(current: User) {
  const { db: database } = services()
  await setDoc(
    doc(database, "users", current.uid),
    {
      displayName:
        current.displayName || current.email?.split("@")[0] || "Zenith member",
      email: current.email || "",
      photoURL: current.photoURL || null,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  )
}

export async function purgeUserData(uid: string) {
  const { db: database } = services()
  // diagnostics are unreadable to clients; the onUserDeleted function wipes them.
  const buckets = ["goals", "focusSessions", "skills"]
  for (const bucket of buckets) {
    const snapshot = await getDocs(collection(database, "users", uid, bucket))
    for (let i = 0; i < snapshot.docs.length; i += 450) {
      const batch = writeBatch(database)
      snapshot.docs.slice(i, i + 450).forEach((item) => batch.delete(item.ref))
      await batch.commit()
    }
  }
  await deleteDoc(doc(database, "users", uid))
}

export async function loadCloudState(): Promise<ZenithState | null> {
  const { db: database, uid } = services()
  if (!uid) return null
  const [goalSnapshot, sessionSnapshot, skillSnapshot] = await Promise.all([
    getDocs(collection(database, "users", uid, "goals")),
    getDocs(collection(database, "users", uid, "focusSessions")),
    getDocs(collection(database, "users", uid, "skills")),
  ])
  const cloud: ZenithState = {
    goals: goalSnapshot.docs.map((item) => item.data() as Goal),
    sessions: sessionSnapshot.docs.map((item) => item.data() as FocusSession),
    skills: skillSnapshot.docs.map((item) => item.data() as Skill),
  }
  // The cloud is now the known baseline: only diverging docs get written.
  const baseline: Record<string, number> = {}
  const record = (bucket: Bucket, items: { id: string }[]) =>
    items.forEach((item) => (baseline[`${bucket}/${item.id}`] = fingerprint(item)))
  record("goals", cloud.goals)
  record("focusSessions", cloud.sessions)
  record("skills", cloud.skills)
  seedSynced(uid, baseline)
  return cloud
}

export type SyncStatus = "synced" | "syncing" | "offline" | "error"
let statusListener: (status: SyncStatus, pending: number) => void = () => {}
export function onSyncStatus(listener: typeof statusListener) {
  statusListener = listener
}

// Diff the state against the last-acknowledged fingerprints: changed docs
// become sets, vanished docs become deletes. Deletion needs no special API.
export function syncState(state: ZenithState) {
  const { uid } = services()
  if (!uid) return
  const synced = syncedMap(uid)
  const queued = new Map(outbox(uid).map((op) => [op.key, op]))
  const ops: Op[] = []
  const live = new Set<string>()
  const scan = (bucket: Bucket, items: { id: string }[]) =>
    items.forEach((item) => {
      const key = `${bucket}/${item.id}`
      live.add(key)
      const print = fingerprint(item)
      const pending = queued.get(key)
      if (pending ? pending.fingerprint === print : synced[key] === print) return
      ops.push({ key, bucket, id: item.id, op: "set", payload: item, fingerprint: print })
    })
  scan("goals", state.goals)
  scan("focusSessions", state.sessions)
  scan("skills", state.skills)
  Object.keys(synced).forEach((key) => {
    if (live.has(key) || queued.get(key)?.op === "delete") return
    const [bucket, id] = key.split("/") as [Bucket, string]
    ops.push({ key, bucket, id, op: "delete" })
  })
  enqueue(uid, ops)
  void flush()
}

// verifiedXp/verifiedAt are server-owned (rules reject client changes);
// omitting them lets merge-writes keep whatever the server last set.
function writable(op: Op) {
  if (op.bucket !== "skills") return op.payload as object
  const { verifiedXp: _xp, verifiedAt: _at, ...rest } = op.payload as Skill
  return rest
}

let flushing = false
let retryTimer = 0
let failures = 0

export async function flush(): Promise<void> {
  const { uid } = services()
  if (!uid || flushing) return
  const ops = outbox(uid)
  if (!ops.length) return statusListener("synced", 0)
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return statusListener("offline", ops.length)
  }
  flushing = true
  statusListener("syncing", ops.length)
  const { db: database } = services()
  try {
    for (let i = 0; i < ops.length; i += 400) {
      const chunk = ops.slice(i, i + 400)
      const batch = writeBatch(database)
      chunk.forEach((op) => {
        const ref = doc(database, "users", uid, op.bucket, op.id)
        if (op.op === "delete") batch.delete(ref)
        else batch.set(ref, writable(op), { merge: true })
      })
      await batch.commit()
      settle(uid, chunk)
    }
    failures = 0
    flushing = false
    const left = outbox(uid).length
    if (left) return flush()
    statusListener("synced", 0)
  } catch (error) {
    flushing = false
    failures++
    statusListener(navigator.onLine ? "error" : "offline", outbox(uid).length)
    // A doc the rules permanently reject must not block the rest forever:
    // retry one by one and quarantine only the offenders.
    if ((error as { code?: string })?.code === "permission-denied" && failures >= 3) {
      report(error, "sync-permission-denied")
      await quarantine(uid, ops)
    }
    window.clearTimeout(retryTimer)
    retryTimer = window.setTimeout(() => void flush(), Math.min(60_000, 1000 * 2 ** failures))
  }
}

async function quarantine(uid: string, ops: Op[]) {
  const { db: database } = services()
  for (const op of ops) {
    const ref = doc(database, "users", uid, op.bucket, op.id)
    try {
      if (op.op === "delete") await deleteDoc(ref)
      else await setDoc(ref, writable(op), { merge: true })
      settle(uid, [op])
    } catch (error) {
      // Rejected by rules: drop from the outbox; the local copy stays intact.
      if ((error as { code?: string })?.code === "permission-denied") settle(uid, [op])
    }
  }
  failures = 0
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => void flush())
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void flush()
  })
}

// Crash reports go to the owner's own subcollection; rules cap their size.
let reported = 0
export function report(error: unknown, context = "runtime") {
  const { db: database, uid } = services()
  if (!uid || reported >= 5) return
  reported++
  const err = error as { message?: string; stack?: string }
  void addDoc(collection(database, "users", uid, "diagnostics"), {
    context: context.slice(0, 60),
    message: String(err?.message || error).slice(0, 500),
    stack: String(err?.stack || "").slice(0, 2000),
    agent: navigator.userAgent.slice(0, 200),
    at: new Date().toISOString(),
  }).catch(() => undefined)
}

