import type {
  FocusSession,
  MetricLog,
  TaskTemplate,
  TrackEnrollment,
  TrackTemplate,
  ZenithState,
} from "../types"
import { ALL_TRACKS, getTrackById, NEUROCHEMICALS } from "../data/tracks"

export const MAX_RECOMMENDED_TRACKS = 3
export const MAX_DAILY_VISIBLE_TASKS = 8

export function todayDateStr(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

export function getEnrolledTracks(
  state: ZenithState,
): Array<{ enrollment: TrackEnrollment; template: TrackTemplate }> {
  return (state.enrollments || [])
    .map((enrollment) => {
      const template = getTrackById(enrollment.trackId, enrollment.variant)
      if (!template) return null
      return { enrollment, template }
    })
    .filter(Boolean) as Array<{
    enrollment: TrackEnrollment
    template: TrackTemplate
  }>
}

export function enrollInTrack(
  state: ZenithState,
  trackId: string,
  variant: "male" | "strength-energy" = "male",
): { state: ZenithState; warning?: string } {
  const existing = (state.enrollments || []).find((e) => e.trackId === trackId)
  if (existing) {
    return { state }
  }

  const newEnrollment: TrackEnrollment = {
    id: trackId,
    trackId,
    startedAt: new Date().toISOString(),
    phase: 1,
    completions: {},
    metrics: [],
    variant,
    urgeSurfs: [],
    implementationIntentions: {},
  }

  const nextEnrollments = [...(state.enrollments || []), newEnrollment]
  const warning =
    nextEnrollments.length > MAX_RECOMMENDED_TRACKS
      ? "You have enrolled in more than 3 tracks. Research shows habit formation is highest when focusing on 1–3 areas at once. Consider completing or pausing a track before adding more."
      : undefined

  return {
    state: {
      ...state,
      enrollments: nextEnrollments,
    },
    warning,
  }
}

export function unenrollTrack(state: ZenithState, trackId: string): ZenithState {
  return {
    ...state,
    enrollments: (state.enrollments || []).filter((e) => e.trackId !== trackId),
  }
}

export interface DeduplicatedTask {
  id: string
  sharedKey?: string
  title: string
  kind: TaskTemplate["kind"]
  minutes?: number
  window?: TaskTemplate["window"]
  phaseFrom: 1 | 2 | 3
  why: string
  evidence: TaskTemplate["evidence"]
  source: string
  chemicalKey?: string
  actionLabel?: string
  setupSteps?: string[]
  completed: boolean
  contributingTracks: Array<{
    trackId: string
    trackTitle: string
    taskId: string
  }>
}

export function getDeduplicatedTasks(
  state: ZenithState,
  dateStr = todayDateStr(),
): DeduplicatedTask[] {
  const enrolled = getEnrolledTracks(state)
  if (!enrolled.length) return []

  const taskMap = new Map<string, DeduplicatedTask>()

  enrolled.forEach(({ enrollment, template }) => {
    // Only show tasks appropriate for the current unlocked phase
    const availableTasks = template.tasks.filter(
      (t) => t.phaseFrom <= enrollment.phase,
    )

    availableTasks.forEach((task) => {
      const key = task.sharedKey ? `shared:${task.sharedKey}` : task.id
      const isCompleted = Boolean(
        enrollment.completions?.[dateStr]?.includes(task.id),
      )

      const existing = taskMap.get(key)
      if (existing) {
        existing.contributingTracks.push({
          trackId: template.id,
          trackTitle: template.title,
          taskId: task.id,
        })
        // If completed in ANY contributing track, mark as completed
        if (isCompleted) {
          existing.completed = true
        }
      } else {
        taskMap.set(key, {
          id: task.id,
          sharedKey: task.sharedKey,
          title: task.title,
          kind: task.kind,
          minutes: task.minutes,
          window: task.window || "day",
          phaseFrom: task.phaseFrom,
          why: task.why,
          evidence: task.evidence,
          source: task.source,
          chemicalKey: task.chemicalKey,
          actionLabel: task.actionLabel,
          setupSteps: task.setupSteps,
          completed: isCompleted,
          contributingTracks: [
            {
              trackId: template.id,
              trackTitle: template.title,
              taskId: task.id,
            },
          ],
        })
      }
    })
  })

  return Array.from(taskMap.values())
}

export function toggleTrackTask(
  state: ZenithState,
  targetTaskId: string,
  dateStr = todayDateStr(),
): ZenithState {
  const enrolled = getEnrolledTracks(state)
  if (!enrolled.length) return state

  // Identify target task and check if it has a sharedKey
  let sharedKey: string | undefined
  let foundTaskTemplate: TaskTemplate | undefined

  for (const { template } of enrolled) {
    const candidate = template.tasks.find((t) => t.id === targetTaskId)
    if (candidate) {
      foundTaskTemplate = candidate
      sharedKey = candidate.sharedKey
      break
    }
  }

  // Determine current completed state (if completed in any track, next state is uncompleted)
  let currentlyCompleted = false
  for (const { enrollment, template } of enrolled) {
    const trackTaskId = sharedKey
      ? template.tasks.find((t) => t.sharedKey === sharedKey)?.id
      : targetTaskId

    if (
      trackTaskId &&
      enrollment.completions?.[dateStr]?.includes(trackTaskId)
    ) {
      currentlyCompleted = true
      break
    }
  }

  const nextCompletedState = !currentlyCompleted

  // Update completions across all relevant tracks
  const nextEnrollments = state.enrollments.map((enrollment) => {
    const template = getTrackById(enrollment.trackId, enrollment.variant)
    if (!template) return enrollment

    const matchingTask = sharedKey
      ? template.tasks.find((t) => t.sharedKey === sharedKey)
      : template.tasks.find((t) => t.id === targetTaskId)

    if (!matchingTask) return enrollment

    const dayTasks = new Set(enrollment.completions?.[dateStr] || [])
    if (nextCompletedState) {
      dayTasks.add(matchingTask.id)
    } else {
      dayTasks.delete(matchingTask.id)
    }

    return {
      ...enrollment,
      completions: {
        ...enrollment.completions,
        [dateStr]: Array.from(dayTasks),
      },
    }
  })

  // If newly completed and kind is 'timer', automatically create a FocusSession!
  let nextSessions = state.sessions
  if (nextCompletedState && foundTaskTemplate && foundTaskTemplate.kind === "timer") {
    const minutes = foundTaskTemplate.minutes || 25
    const session: FocusSession = {
      id: crypto.randomUUID(),
      goalId: foundTaskTemplate.sharedKey || foundTaskTemplate.id,
      title: foundTaskTemplate.title,
      plannedSeconds: minutes * 60,
      actualSeconds: minutes * 60,
      completedAt: new Date().toISOString(),
    }
    nextSessions = [...state.sessions, session]
  }

  return {
    ...state,
    enrollments: nextEnrollments,
    sessions: nextSessions,
  }
}

export function calculateAdherence(
  enrollment: TrackEnrollment,
  track: TrackTemplate,
  windowDays = 14,
): { rate: number; completedCount: number; totalPossible: number } {
  const currentPhase = enrollment.phase
  const availableDailyTasks = track.tasks.filter(
    (t) => t.phaseFrom <= currentPhase && (t.kind === "daily" || t.kind === "timer"),
  )

  if (!availableDailyTasks.length) {
    return { rate: 100, completedCount: 0, totalPossible: 0 }
  }

  const today = new Date()
  let completedCount = 0
  let totalPossible = 0

  for (let offset = 0; offset < windowDays; offset++) {
    const d = new Date(today.getTime() - offset * 86400000)
    const key = todayDateStr(d)
    const completions = new Set(enrollment.completions?.[key] || [])

    availableDailyTasks.forEach((task) => {
      totalPossible++
      if (completions.has(task.id)) {
        completedCount++
      }
    })
  }

  const rate = totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0
  return { rate, completedCount, totalPossible }
}

export function checkPhaseUnlock(
  enrollment: TrackEnrollment,
  track: TrackTemplate,
): { canUnlock: boolean; nextPhase: 1 | 2 | 3; adherence: number } {
  if (enrollment.phase >= 3) {
    return { canUnlock: false, nextPhase: 3, adherence: 100 }
  }

  const { rate } = calculateAdherence(enrollment, track, 14)
  const nextPhase = (enrollment.phase + 1) as 1 | 2 | 3
  const canUnlock = rate >= 70

  return { canUnlock, nextPhase, adherence: rate }
}

export function advancePhase(state: ZenithState, trackId: string): ZenithState {
  return {
    ...state,
    enrollments: state.enrollments.map((enrollment) => {
      if (enrollment.trackId !== trackId || enrollment.phase >= 3) {
        return enrollment
      }
      return {
        ...enrollment,
        phase: (enrollment.phase + 1) as 1 | 2 | 3,
      }
    }),
  }
}

export function getTrackHabitChain(enrollment: TrackEnrollment): {
  chain: number
  activeToday: boolean
  atRisk: boolean
} {
  const dates = Object.keys(enrollment.completions || {}).filter(
    (d) => (enrollment.completions[d] || []).length > 0,
  )
  const set = new Set(dates)

  let chain = 0
  let consecutiveMisses = 0
  const now = new Date()

  for (let offset = 0; offset < 365; offset++) {
    const d = new Date(now.getTime() - offset * 86400000)
    const key = todayDateStr(d)

    if (set.has(key)) {
      chain++
      consecutiveMisses = 0
    } else if (offset > 0) {
      consecutiveMisses++
      // "Never miss twice" rule: exactly 1 missed day is tolerated without breaking the streak
      if (consecutiveMisses >= 2) break
    }
  }

  const todayKey = todayDateStr(now)
  const activeToday = set.has(todayKey)
  const yesterdayKey = todayDateStr(new Date(now.getTime() - 86400000))
  const atRisk = !activeToday && !set.has(yesterdayKey)

  return { chain, activeToday, atRisk }
}

export function logTrackMetric(
  state: ZenithState,
  trackId: string,
  metricId: string,
  value: number | string,
  dateStr = todayDateStr(),
): ZenithState {
  const log: MetricLog = {
    id: crypto.randomUUID(),
    trackId,
    metricId,
    date: dateStr,
    value,
    timestamp: new Date().toISOString(),
  }

  return {
    ...state,
    enrollments: state.enrollments.map((enrollment) => {
      if (enrollment.trackId !== trackId) return enrollment
      return {
        ...enrollment,
        metrics: [
          ...(enrollment.metrics || []).filter(
            (m) => !(m.metricId === metricId && m.date === dateStr),
          ),
          log,
        ],
      }
    }),
  }
}

export function recordUrgeSurf(
  state: ZenithState,
  trackId: string,
  durationSeconds = 600,
): ZenithState {
  return {
    ...state,
    enrollments: state.enrollments.map((e) => {
      if (e.trackId !== trackId) return e
      return {
        ...e,
        urgeSurfs: [
          ...(e.urgeSurfs || []),
          { timestamp: new Date().toISOString(), durationSeconds },
        ],
      }
    }),
  }
}

export function setImplementationIntention(
  state: ZenithState,
  trackId: string,
  key: string,
  trigger: string,
  plan: string,
): ZenithState {
  return {
    ...state,
    enrollments: state.enrollments.map((e) => {
      if (e.trackId !== trackId) return e
      return {
        ...e,
        implementationIntentions: {
          ...(e.implementationIntentions || {}),
          [key]: { trigger, plan },
        },
      }
    }),
  }
}

export interface NeurochemicalStatus {
  key: string
  name: string
  role: string
  color: string
  score: number // 0 to 100
  completed: number
  total: number
}

export function getNeurochemicalWheel(
  state: ZenithState,
  dateStr = todayDateStr(),
): NeurochemicalStatus[] {
  const enrolled = getEnrolledTracks(state)
  const neuroTrack = enrolled.find(
    (e) => e.template.id === "track-neurochemical-balance",
  )

  const activeCompletions = new Set(
    neuroTrack?.enrollment.completions?.[dateStr] || [],
  )

  const keys = Object.keys(NEUROCHEMICALS)

  return keys.map((key) => {
    const meta = NEUROCHEMICALS[key]
    // Find all tasks mapped to this chemical in the neurochemical track
    const mappedTasks =
      neuroTrack?.template.tasks.filter((t) => t.chemicalKey === key) || []

    const total = Math.max(1, mappedTasks.length)
    const completed = mappedTasks.filter((t) =>
      activeCompletions.has(t.id),
    ).length

    const score = Math.round((completed / total) * 100)

    return {
      key,
      name: meta.name,
      role: meta.role,
      color: meta.color,
      score,
      completed,
      total,
    }
  })
}
