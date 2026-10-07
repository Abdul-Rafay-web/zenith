import { describe, expect, it } from "vitest"
import {
  DAY,
  INTERVALS,
  isBonusRep,
  levelFor,
  MAX_COUNTED_REPS_PER_DAY,
  schedule,
  verifySkill,
  xpForRep,
} from "../src/lib/mastery"
import { completeSkillPractice, mergeStates, practiceChain } from "../src/lib/store"
import { fingerprint } from "../src/lib/syncQueue"
import type { PracticeLog, Skill } from "../src/types"

const T0 = new Date("2026-10-01T09:00:00.000Z")

function skill(overrides: Partial<Skill> = {}): Skill {
  return {
    id: "skill-1",
    title: "Spanish",
    purpose: "",
    target: "",
    currentLevel: 1,
    totalMinutes: 0,
    repetitions: 0,
    confidence: 20,
    nextReviewAt: T0.toISOString(),
    createdAt: T0.toISOString(),
    updatedAt: T0.toISOString(),
    xp: 0,
    log: [],
    subskills: [{ id: "a", title: "Verbs", strength: 0, reps: 0 }],
    ...overrides,
  }
}

const rep = (at: Date, quality: number, extra: Partial<PracticeLog> = {}): PracticeLog => ({
  at: at.toISOString(),
  quality,
  minutes: 10,
  xp: 0,
  ...extra,
})

describe("schedule", () => {
  it("walks the expanding interval ladder on success", () => {
    let reps = 0
    let at = T0
    for (const days of INTERVALS.slice(1)) {
      const next = schedule(reps, 4, at)
      expect(Date.parse(next.nextReviewAt) - at.getTime()).toBe(days * DAY)
      reps = next.repetitions
      at = new Date(next.nextReviewAt)
    }
  })

  it("caps at the longest interval", () => {
    const next = schedule(99, 5, T0)
    expect(Date.parse(next.nextReviewAt) - T0.getTime()).toBe(120 * DAY)
  })

  it("resets to one day after a lapse", () => {
    const next = schedule(5, 2, T0)
    expect(next.repetitions).toBe(0)
    expect(Date.parse(next.nextReviewAt) - T0.getTime()).toBe(DAY)
  })
})

describe("xp", () => {
  it("rewards effortful success over effortless recall", () => {
    const at = "2026-10-01T10:00:00.000Z"
    const base = { at, minutes: 10 }
    const bonus = isBonusRep("s", at) ? 25 : 0
    expect(xpForRep("s", { ...base, quality: 3 }) - bonus).toBe(44)
    expect(xpForRep("s", { ...base, quality: 5 }) - bonus).toBe(28)
  })

  it("bonus is deterministic and roughly 1 in 4", () => {
    let hits = 0
    for (let i = 0; i < 4000; i++) {
      const at = new Date(T0.getTime() + i * 61_000).toISOString()
      expect(isBonusRep("s", at)).toBe(isBonusRep("s", at))
      if (isBonusRep("s", at)) hits++
    }
    expect(hits / 4000).toBeGreaterThan(0.2)
    expect(hits / 4000).toBeLessThan(0.3)
  })

  it("adds a calibration bonus when the prediction is within one", () => {
    const at = T0.toISOString()
    const plain = xpForRep("s", { at, quality: 4, minutes: 10 })
    expect(xpForRep("s", { at, quality: 4, minutes: 10, prediction: 3 })).toBe(plain + 10)
    expect(xpForRep("s", { at, quality: 4, minutes: 10, prediction: 1 })).toBe(plain)
  })

  it("clamps forged inputs", () => {
    const at = T0.toISOString()
    expect(xpForRep("s", { at, quality: 99, minutes: 99999 })).toBe(
      xpForRep("s", { at, quality: 5, minutes: 120 }),
    )
  })

  it("levels every 400 xp up to 5", () => {
    expect(levelFor(0)).toBe(1)
    expect(levelFor(399)).toBe(1)
    expect(levelFor(400)).toBe(2)
    expect(levelFor(1e9)).toBe(5)
  })
})

describe("verifySkill (server authority)", () => {
  it("matches the client's optimistic result", () => {
    const now = new Date(T0.getTime() + 60_000)
    const result = completeSkillPractice(skill(), 3, { subskillId: "a", prediction: 3, minutes: 10 }, now)
    const server = verifySkill("skill-1", undefined, result.skill.log!, now)
    expect(server.xp).toBe(result.skill.xp)
    expect(server.nextReviewAt).toBe(result.skill.nextReviewAt)
    expect(server.currentLevel).toBe(result.skill.currentLevel)
  })

  it("ignores a forged xp field entirely", () => {
    const log = [rep(T0, 4)]
    const forged = verifySkill("skill-1", undefined, log, T0)
    expect(forged.xp).toBe(xpForRep("skill-1", log[0]))
  })

  it("only credits entries newer than the checkpoint", () => {
    const first = [rep(T0, 4)]
    const checkpoint = verifySkill("skill-1", undefined, first, T0)
    const later = new Date(T0.getTime() + DAY)
    const replay = verifySkill(
      "skill-1",
      { verifiedXp: checkpoint.xp, verifiedAt: checkpoint.verifiedAt, repetitions: checkpoint.repetitions },
      [...first, rep(later, 4)],
      later,
    )
    expect(replay.xp).toBe(checkpoint.xp + xpForRep("skill-1", rep(later, 4)))
  })

  it("rejects future-dated entries", () => {
    const future = new Date(T0.getTime() + DAY)
    expect(verifySkill("skill-1", undefined, [rep(future, 5)], T0).xp).toBe(0)
  })

  it("stops crediting after the daily cap", () => {
    const log = Array.from({ length: 30 }, (_, i) => rep(new Date(T0.getTime() + i * 60_000), 3))
    const now = new Date(T0.getTime() + DAY / 2)
    const capped = verifySkill("skill-1", undefined, log, now)
    const expected = log
      .slice(0, MAX_COUNTED_REPS_PER_DAY)
      .reduce((sum, entry) => sum + xpForRep("skill-1", entry), 0)
    expect(capped.xp).toBe(expected)
  })
})

describe("practice chain", () => {
  const today = new Date()
  const ago = (days: number) => new Date(today.getTime() - days * DAY)

  it("survives a single missed day (never miss twice)", () => {
    const s = skill({ log: [rep(ago(0), 4), rep(ago(2), 4), rep(ago(3), 4)] })
    expect(practiceChain(s).chain).toBe(3)
  })

  it("breaks after two consecutive missed days", () => {
    const s = skill({ log: [rep(ago(0), 4), rep(ago(3), 4)] })
    expect(practiceChain(s).chain).toBe(1)
  })

  it("flags risk when neither today nor yesterday has practice", () => {
    expect(practiceChain(skill({ log: [rep(ago(2), 4)] })).atRisk).toBe(true)
  })
})

describe("merge & sync", () => {
  it("lets a pending offline delete beat the cloud copy", () => {
    const s = skill()
    const merged = mergeStates(
      { goals: [], sessions: [], skills: [] },
      { goals: [], sessions: [], skills: [s] },
      new Set([`skills/${s.id}`]),
    )
    expect(merged.skills).toHaveLength(0)
  })

  it("fingerprints ignore key order and undefined fields", () => {
    expect(fingerprint({ a: 1, b: { c: 2, d: undefined } })).toBe(fingerprint({ b: { c: 2 }, a: 1 }))
  })
})
