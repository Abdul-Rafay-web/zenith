// Pure mastery rules shared by the client and Cloud Functions. The server
// replays these on every skill write, so nothing here may depend on the DOM,
// Math.random, or wall-clock state beyond the explicit `now` argument.
import type { PracticeLog, Skill } from "../types"

export const DAY = 24 * 60 * 60 * 1000
export const INTERVALS = [1, 3, 7, 14, 30, 60, 120]
export const XP_PER_LEVEL = 400
export const MAX_LEVEL = 5
export const MAX_COUNTED_REPS_PER_DAY = 12
export const MAX_MINUTES_PER_REP = 120
export const LOG_LIMIT = 60

// FNV-1a: stable across JS runtimes, so client and server agree on bonuses.
export function hash(input: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

// ~1 in 4 reps earns a surprise bonus, seeded by skill + timestamp.
export function isBonusRep(skillId: string, at: string) {
  return hash(`${skillId}|${at}`) % 4 === 0
}

export function clampQuality(quality: number) {
  return Math.max(1, Math.min(5, Math.round(quality)))
}

export function clampMinutes(minutes: number) {
  return Math.max(1, Math.min(MAX_MINUTES_PER_REP, Math.round(minutes || 1)))
}

// Effort beats fluency: hard-but-successful recall (3) is the desirable
// difficulty sweet spot, so it pays the most.
export function xpForRep(
  skillId: string,
  entry: Pick<PracticeLog, "at" | "quality" | "prediction" | "minutes">,
) {
  const quality = clampQuality(entry.quality)
  const effort = quality === 3 ? 40 : quality === 4 ? 32 : quality === 5 ? 24 : 18
  const time = Math.round(clampMinutes(entry.minutes) / 5) * 2
  const bonus = isBonusRep(skillId, entry.at) ? 25 : 0
  const calibrated =
    entry.prediction !== undefined &&
    entry.prediction !== null &&
    Math.abs(entry.prediction - quality) <= 1
      ? 10
      : 0
  return effort + time + bonus + calibrated
}

export function levelFor(xp: number) {
  return Math.min(MAX_LEVEL, 1 + Math.floor(xp / XP_PER_LEVEL))
}

// SM-2–style spacing: success stretches the gap, a lapse resets it.
export function schedule(repetitions: number, quality: number, at: Date) {
  const successful = clampQuality(quality) >= 3
  const next = successful ? repetitions + 1 : 0
  const days = successful ? INTERVALS[Math.min(next, INTERVALS.length - 1)] : 1
  return {
    repetitions: next,
    nextReviewAt: new Date(at.getTime() + days * DAY).toISOString(),
  }
}

export interface Verified {
  xp: number
  currentLevel: number
  repetitions: number
  nextReviewAt: string
  verifiedAt: string
}

// Authoritative replay: starting from the last verified checkpoint, credit
// only new, sane log entries. Used by the server; the client calls the same
// function so its optimistic numbers match what the server will confirm.
export function verifySkill(
  skillId: string,
  before: Partial<Skill> | undefined,
  log: PracticeLog[],
  now = new Date(),
): Verified {
  let xp = before?.verifiedXp ?? 0
  let repetitions = before?.repetitions ?? 0
  let nextReviewAt = before?.nextReviewAt ?? now.toISOString()
  let verifiedAt = before?.verifiedAt ?? ""
  const perDay = new Map<string, number>()
  const ceiling = now.getTime() + 5 * 60 * 1000

  const fresh = log
    .filter((entry) => entry.at > verifiedAt)
    .filter((entry) => {
      const time = Date.parse(entry.at)
      return Number.isFinite(time) && time <= ceiling
    })
    .sort((a, b) => a.at.localeCompare(b.at))

  for (const entry of fresh) {
    const day = entry.at.slice(0, 10)
    const count = (perDay.get(day) || 0) + 1
    perDay.set(day, count)
    verifiedAt = entry.at
    if (count > MAX_COUNTED_REPS_PER_DAY) continue
    xp += xpForRep(skillId, entry)
    const next = schedule(repetitions, entry.quality, new Date(entry.at))
    repetitions = next.repetitions
    nextReviewAt = next.nextReviewAt
  }

  return {
    xp,
    currentLevel: levelFor(xp),
    repetitions,
    nextReviewAt,
    verifiedAt,
  }
}
