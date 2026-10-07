// Server-side authority for progress. Clients write optimistically (so the
// app works offline); this trigger replays the shared mastery rules from the
// last verified checkpoint and overwrites anything that doesn't add up.
import { initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { onDocumentWritten } from "firebase-functions/v2/firestore"
import { onSchedule } from "firebase-functions/v2/scheduler"
import { logger } from "firebase-functions"
import { auth } from "firebase-functions/v1"
import { LOG_LIMIT, verifySkill } from "../../src/lib/mastery"
import type { PracticeLog, Skill } from "../../src/types"

initializeApp()
const db = getFirestore()

export const verifySkillProgress = onDocumentWritten(
  { document: "users/{uid}/skills/{skillId}", region: "us-central1", maxInstances: 20 },
  async (event) => {
    const after = event.data?.after
    if (!after?.exists) return
    const before = event.data?.before.data() as Skill | undefined
    const skill = after.data() as Skill
    const log = (Array.isArray(skill.log) ? skill.log : []).slice(-LOG_LIMIT) as PracticeLog[]

    // Checkpoint lives on the doc but rules forbid clients from changing it,
    // so `before` is always server-authored.
    const verified = verifySkill(event.params.skillId, before, log)

    const drift =
      skill.verifiedXp !== verified.xp ||
      skill.verifiedAt !== verified.verifiedAt ||
      skill.xp !== verified.xp ||
      skill.currentLevel !== verified.currentLevel ||
      skill.repetitions !== verified.repetitions ||
      skill.nextReviewAt !== verified.nextReviewAt

    // No-op when already consistent: this is also what stops the trigger
    // from looping on its own write.
    if (!drift) return

    if (skill.xp !== undefined && skill.xp !== verified.xp) {
      logger.warn("xp corrected", {
        uid: event.params.uid,
        skillId: event.params.skillId,
        claimed: skill.xp,
        verified: verified.xp,
      })
    }

    await after.ref.update({
      xp: verified.xp,
      verifiedXp: verified.xp,
      verifiedAt: verified.verifiedAt,
      currentLevel: verified.currentLevel,
      repetitions: verified.repetitions,
      nextReviewAt: verified.nextReviewAt,
      updatedAt: new Date().toISOString(),
    })
  },
)

// Crash reports are write-only from clients; keep them from piling up.
export const pruneDiagnostics = onSchedule(
  { schedule: "every day 03:00", region: "us-central1" },
  async () => {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const stale = await db.collectionGroup("diagnostics").where("at", "<", cutoff).limit(2000).get()
    const writer = db.bulkWriter()
    stale.docs.forEach((item) => writer.delete(item.ref))
    await writer.close()
    logger.info("pruned diagnostics", { count: stale.size })
  },
)

// Backstop for account deletion: whatever the client couldn't remove
// (crash reports, writes that landed mid-delete) is wiped recursively.
export const onUserDeleted = auth.user().onDelete(async (user) => {
  await db.recursiveDelete(db.doc(`users/${user.uid}`))
  logger.info("user data erased", { uid: user.uid })
})
