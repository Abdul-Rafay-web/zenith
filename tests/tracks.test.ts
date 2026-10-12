import { describe, expect, it } from "vitest"
import type { ZenithState } from "../src/types"
import { ATTENTION_RESET_TRACK } from "../src/data/tracks"
import {
  advancePhase,
  calculateAdherence,
  checkPhaseUnlock,
  enrollInTrack,
  getDeduplicatedTasks,
  getNeurochemicalWheel,
  getTrackHabitChain,
  logTrackMetric,
  recordUrgeSurf,
  toggleTrackTask,
} from "../src/lib/tracks"

describe("Zenith Transformation Tracks Engine", () => {
  const baseState: ZenithState = {
    goals: [],
    sessions: [],
    skills: [],
    enrollments: [],
  }

  it("enrolls in a track and attaches correct initial phase and empty completions", () => {
    const { state, warning } = enrollInTrack(baseState, "track-sharper-mind")
    expect(state.enrollments.length).toBe(1)
    expect(state.enrollments[0].trackId).toBe("track-sharper-mind")
    expect(state.enrollments[0].phase).toBe(1)
    expect(warning).toBeUndefined()
  })

  it("warns when user enrolls in more than 3 tracks", () => {
    let s = baseState
    s = enrollInTrack(s, "track-sharper-mind").state
    s = enrollInTrack(s, "track-testosterone-restore").state
    s = enrollInTrack(s, "track-attention-reset").state
    const fourth = enrollInTrack(s, "track-skin-and-hair")
    expect(fourth.state.enrollments.length).toBe(4)
    expect(fourth.warning).toBeDefined()
    expect(fourth.warning).toContain("more than 3 tracks")
  })

  it("deduplicates shared tasks across multiple active tracks and shows contributing badges", () => {
    let s = baseState
    s = enrollInTrack(s, "track-sharper-mind").state
    s = enrollInTrack(s, "track-testosterone-restore").state

    const tasks = getDeduplicatedTasks(s, "2026-10-12")
    // Both Sharper Mind and Testosterone Restore share foundation: sleep, light
    const sleepTasks = tasks.filter((t) => t.sharedKey === "sleep")
    expect(sleepTasks.length).toBe(1)
    expect(sleepTasks[0].contributingTracks.length).toBe(2)
    const titles = sleepTasks[0].contributingTracks.map((c) => c.trackTitle)
    expect(titles).toContain("Sharper Mind")
    expect(titles).toContain("Testosterone Restore")
  })

  it("completing a shared task credits all contributing tracks simultaneously", () => {
    let s = baseState
    s = enrollInTrack(s, "track-sharper-mind").state
    s = enrollInTrack(s, "track-testosterone-restore").state

    const tasks = getDeduplicatedTasks(s, "2026-10-12")
    const sleepTask = tasks.find((t) => t.sharedKey === "sleep")!

    // Toggle completion for the shared sleep task
    const updatedState = toggleTrackTask(s, sleepTask.id, "2026-10-12")

    const mindEnrollment = updatedState.enrollments.find(
      (e) => e.trackId === "track-sharper-mind",
    )!
    const tEnrollment = updatedState.enrollments.find(
      (e) => e.trackId === "track-testosterone-restore",
    )!

    expect(mindEnrollment.completions["2026-10-12"]).toContain("foundation-sleep")
    expect(tEnrollment.completions["2026-10-12"]).toContain("foundation-sleep")

    // Deduplicated list reflects completion
    const updatedTasks = getDeduplicatedTasks(updatedState, "2026-10-12")
    const updatedSleep = updatedTasks.find((t) => t.sharedKey === "sleep")!
    expect(updatedSleep.completed).toBe(true)
  })

  it("completing a timer-based track task automatically creates a FocusSession", () => {
    let s = baseState
    s = enrollInTrack(s, "track-sharper-mind").state

    const initialSessionsCount = s.sessions.length
    // Toggle deep learning timer task (25 minutes)
    const updatedState = toggleTrackTask(s, "mind-deep-learning", "2026-10-12")

    expect(updatedState.sessions.length).toBe(initialSessionsCount + 1)
    const newSession = updatedState.sessions[updatedState.sessions.length - 1]
    expect(newSession.title).toContain("Deep Learning")
    expect(newSession.actualSeconds).toBe(25 * 60)
  })

  it("calculates adherence and enforces phase unlocking rule at >=70%", () => {
    let s = baseState
    s = enrollInTrack(s, "track-attention-reset").state
    const enrollment = s.enrollments[0]
    const template = ATTENTION_RESET_TRACK

    // Low adherence: 0% -> cannot unlock
    const initialCheck = checkPhaseUnlock(enrollment, template)
    expect(initialCheck.canUnlock).toBe(false)
    expect(initialCheck.nextPhase).toBe(2)

    // Populate simulated completions for 12 of the last 14 days (85% adherence)
    const filledCompletions: Record<string, string[]> = {}
    const now = new Date()
    for (let i = 0; i < 14; i++) {
      const d = new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10)
      if (i < 12) {
        // Complete the daily tasks for this track
        filledCompletions[d] = [
          "foundation-sleep",
          "foundation-move",
          "attn-phone-other-room",
          "attn-deep-work-block",
          "attn-urge-surfing",
          "attn-reading-sustained",
          "attn-social-cap",
        ]
      }
    }

    const highAdherenceEnrollment = {
      ...enrollment,
      completions: filledCompletions,
    }

    const check = checkPhaseUnlock(highAdherenceEnrollment, template)
    expect(check.canUnlock).toBe(true)
    expect(check.adherence).toBeGreaterThanOrEqual(70)

    // Advancing phase upgrades phase 1 -> 2
    const advanced = advancePhase(
      { ...s, enrollments: [highAdherenceEnrollment] },
      "track-attention-reset",
    )
    expect(advanced.enrollments[0].phase).toBe(2)
  })

  it("implements the 'never miss twice' rule without fragile streaks resetting on a single miss", () => {
    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10)
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10)

    // Scenario A: Consistent, missed yesterday, but active today and 2 days ago -> chain remains intact!
    const enrollmentA = {
      id: "track-1",
      trackId: "track-sharper-mind",
      startedAt: threeDaysAgo,
      phase: 1 as const,
      completions: {
        [today]: ["foundation-sleep"],
        // yesterday missed!
        [twoDaysAgo]: ["foundation-sleep"],
        [threeDaysAgo]: ["foundation-sleep"],
      },
      metrics: [],
    }

    const chainA = getTrackHabitChain(enrollmentA)
    // 3 completed days counted, single skipped day did not reset chain to 0
    expect(chainA.chain).toBe(3)
    expect(chainA.activeToday).toBe(true)
    expect(chainA.atRisk).toBe(false)

    // Scenario B: Missed both today and yesterday -> at risk!
    const enrollmentB = {
      id: "track-1",
      trackId: "track-sharper-mind",
      startedAt: threeDaysAgo,
      phase: 1 as const,
      completions: {
        [twoDaysAgo]: ["foundation-sleep"],
        [threeDaysAgo]: ["foundation-sleep"],
      },
      metrics: [],
    }
    const chainB = getTrackHabitChain(enrollmentB)
    expect(chainB.atRisk).toBe(true)
  })

  it("records urge surfing and logs metrics", () => {
    let s = baseState
    s = enrollInTrack(s, "track-attention-reset").state
    s = recordUrgeSurf(s, "track-attention-reset", 600)

    expect(s.enrollments[0].urgeSurfs?.length).toBe(1)
    expect(s.enrollments[0].urgeSurfs?.[0].durationSeconds).toBe(600)

    s = logTrackMetric(s, "track-attention-reset", "metric-screentime-min", 45, "2026-10-12")
    expect(s.enrollments[0].metrics.length).toBe(1)
    expect(s.enrollments[0].metrics[0].value).toBe(45)
  })

  it("computes live neurochemical balance wheel score based on today's tasks", () => {
    let s = baseState
    s = enrollInTrack(s, "track-neurochemical-balance").state

    const initialWheel = getNeurochemicalWheel(s, "2026-10-12")
    expect(initialWheel.length).toBe(11) // 11 chemicals
    const cortisolInitial = initialWheel.find((c) => c.key === "cortisol")!
    expect(cortisolInitial.score).toBe(0)

    // Complete cyclic sighing (mapped to cortisol)
    s = toggleTrackTask(s, "neuro-cyclic-sighing", "2026-10-12")

    const updatedWheel = getNeurochemicalWheel(s, "2026-10-12")
    const cortisolUpdated = updatedWheel.find((c) => c.key === "cortisol")!
    expect(cortisolUpdated.score).toBeGreaterThan(0)
  })
})
