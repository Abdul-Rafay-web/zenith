import type { Goal, PracticeLog, Skill, ZenithState } from "../types"
import {
  clampMinutes,
  clampQuality,
  DAY,
  isBonusRep,
  LOG_LIMIT,
  verifySkill,
  xpForRep,
} from "./mastery"

const LEGACY_STORAGE_KEY = "zenith:v1"
const STORAGE_PREFIX = "zenith:v2"

const now = new Date()
const iso = now.toISOString()

export const seedState: ZenithState = {
  goals: [
    {
      id: "backend-mastery",
      title: "Master backend engineering",
      why: "Build systems that stay calm under pressure.",
      horizon: "Sep 30",
      weeklyMinutes: 420,
      status: "active",
      accent: "blue",
      createdAt: iso,
      updatedAt: iso,
      steps: [
        {
          id: "data-model",
          title: "Design the Firestore data model",
          minutes: 45,
          completed: true,
        },
        {
          id: "security-rules",
          title: "Write ownership security rules",
          minutes: 35,
          completed: false,
        },
        {
          id: "sync-engine",
          title: "Prototype the offline sync queue",
          minutes: 60,
          completed: false,
        },
        {
          id: "load-test",
          title: "Run the first load test",
          minutes: 50,
          completed: false,
        },
      ],
    },
    {
      id: "run-10k",
      title: "Run a confident 10K",
      why: "Build an engine that carries me further.",
      horizon: "Aug 18",
      weeklyMinutes: 180,
      status: "active",
      accent: "apricot",
      createdAt: iso,
      updatedAt: iso,
      steps: [
        {
          id: "easy-run",
          title: "Easy 4K recovery run",
          minutes: 32,
          completed: true,
        },
        {
          id: "tempo-run",
          title: "Tempo intervals",
          minutes: 40,
          completed: false,
        },
        {
          id: "long-run",
          title: "Weekend long run",
          minutes: 55,
          completed: false,
        },
      ],
    },
    {
      id: "quiet-mornings",
      title: "Protect quiet mornings",
      why: "Start from intention, not reaction.",
      horizon: "Ongoing",
      weeklyMinutes: 105,
      status: "active",
      accent: "mint",
      createdAt: iso,
      updatedAt: iso,
      steps: [
        {
          id: "journal",
          title: "Write a one-page morning note",
          minutes: 15,
          completed: false,
        },
        {
          id: "phone-free",
          title: "Keep the first hour phone-free",
          minutes: 60,
          completed: false,
        },
      ],
    },
  ],
  sessions: [],
  skills: [
    {
      id: "systems-design",
      title: "Systems design",
      purpose: "Reason clearly about reliable systems under real constraints.",
      target: "Design and defend a production architecture",
      currentLevel: 2,
      totalMinutes: 85,
      repetitions: 2,
      confidence: 58,
      nextReviewAt: iso,
      createdAt: iso,
      updatedAt: iso,
    },
  ],
}

export const emptyState: ZenithState = {
  goals: [],
  sessions: [],
  skills: [],
}

export function loadState(scope = "guest"): ZenithState {
  try {
    const key = `${STORAGE_PREFIX}:${scope}`
    let saved = localStorage.getItem(key)
    if (!saved && scope === "guest") {
      saved = localStorage.getItem(LEGACY_STORAGE_KEY)
    }
    if (!saved) return emptyState
    const parsed = JSON.parse(saved) as Partial<ZenithState>
    return {
      goals: parsed.goals || [],
      sessions: parsed.sessions || [],
      skills: parsed.skills || [],
    }
  } catch {
    return emptyState
  }
}

export function saveState(state: ZenithState, scope = "guest") {
  localStorage.setItem(`${STORAGE_PREFIX}:${scope}`, JSON.stringify(state))
}

// `deleted` holds "bucket/id" keys still waiting in the outbox, so a cloud
// copy can't resurrect something the user removed while offline.
export function mergeStates(
  local: ZenithState,
  cloud: ZenithState,
  deleted: Set<string> = new Set(),
): ZenithState {
  const goals = new Map(local.goals.map((goal) => [goal.id, goal]))
  cloud.goals.forEach((cloudGoal) => {
    const localGoal = goals.get(cloudGoal.id)
    if (
      !localGoal ||
      new Date(cloudGoal.updatedAt).getTime() >
        new Date(localGoal.updatedAt).getTime()
    ) {
      goals.set(cloudGoal.id, cloudGoal)
    }
  })

  const sessions = new Map(
    local.sessions.map((session) => [session.id, session]),
  )
  cloud.sessions.forEach((session) => sessions.set(session.id, session))

  return {
    goals: [...goals.values()].filter((goal) => !deleted.has(`goals/${goal.id}`)),
    sessions: [...sessions.values()]
      .filter((session) => !deleted.has(`focusSessions/${session.id}`))
      .sort((a, b) => a.completedAt.localeCompare(b.completedAt)),
    skills: mergeSkills(local.skills, cloud.skills).filter(
      (skill) => !deleted.has(`skills/${skill.id}`),
    ),
  }
}

function mergeSkills(local: Skill[], cloud: Skill[]) {
  const skills = new Map(local.map((skill) => [skill.id, skill]))
  cloud.forEach((cloudSkill) => {
    const localSkill = skills.get(cloudSkill.id)
    if (
      !localSkill ||
      new Date(cloudSkill.updatedAt).getTime() >
        new Date(localSkill.updatedAt).getTime()
    ) {
      skills.set(cloudSkill.id, cloudSkill)
    }
  })
  return [...skills.values()]
}

const dayKey = (date: Date) => date.toISOString().slice(0, 10)

export interface PracticeInput {
  subskillId?: string
  prediction?: number
  minutes?: number
}

export interface PracticeResult {
  skill: Skill
  xp: number
  bonus: boolean
  levelUp: boolean
  predictionError?: number
}

export function completeSkillPractice(
  skill: Skill,
  quality: number,
  input: PracticeInput = {},
  now = new Date(),
): PracticeResult {
  const at = now.toISOString()
  const entry: PracticeLog = {
    at,
    subskillId: input.subskillId,
    quality: clampQuality(quality),
    prediction: input.prediction,
    minutes: clampMinutes(input.minutes ?? 25),
    xp: 0,
  }
  entry.xp = xpForRep(skill.id, entry)

  // Replay from the skill's own optimistic state; the server repeats this
  // from its verified checkpoint and corrects any drift.
  const optimistic = verifySkill(
    skill.id,
    { ...skill, verifiedXp: skill.xp || 0, verifiedAt: skill.lastPracticedAt || "" },
    [entry],
    now,
  )

  const subskills = (skill.subskills || []).map((sub) =>
    sub.id === input.subskillId
      ? {
          ...sub,
          reps: sub.reps + 1,
          strength: Math.max(
            0,
            Math.min(100, Math.round(sub.strength * 0.65 + entry.quality * 20 * 0.35)),
          ),
        }
      : sub,
  )
  const gained = optimistic.xp - (skill.xp || 0)

  return {
    xp: gained,
    bonus: isBonusRep(skill.id, at),
    levelUp: optimistic.currentLevel > skill.currentLevel,
    predictionError:
      input.prediction !== undefined ? entry.quality - input.prediction : undefined,
    skill: {
      ...skill,
      subskills,
      xp: optimistic.xp,
      repetitions: optimistic.repetitions,
      nextReviewAt: optimistic.nextReviewAt,
      currentLevel: Math.max(skill.currentLevel, optimistic.currentLevel),
      confidence: Math.round(skill.confidence * 0.7 + entry.quality * 20 * 0.3),
      totalMinutes: skill.totalMinutes + entry.minutes,
      lastPracticedAt: at,
      updatedAt: at,
      log: [...(skill.log || []).slice(-(LOG_LIMIT - 1)), { ...entry, xp: gained }],
    },
  }
}

// "Never miss twice": a single skipped day keeps the chain alive.
export function practiceChain(skill: Skill) {
  const days = new Set((skill.log || []).map((entry) => entry.at.slice(0, 10)))
  let chain = 0
  let misses = 0
  for (let offset = 0; offset < 365; offset++) {
    const key = dayKey(new Date(Date.now() - offset * DAY))
    if (days.has(key)) {
      chain++
      misses = 0
    } else if (offset > 0) {
      misses++
      if (misses >= 2) break
    }
  }
  const practicedToday = days.has(dayKey(new Date()))
  const atRisk = !practicedToday && !days.has(dayKey(new Date(Date.now() - DAY)))
  return { chain, practicedToday, atRisk }
}

// Interleave: aim the next rep at the weakest component.
export function weakestSubskill(skill: Skill) {
  return [...(skill.subskills || [])].sort(
    (a, b) => a.strength - b.strength || a.reps - b.reps,
  )[0]
}

export function progressFor(goal: Goal) {
  if (!goal.steps.length) return 0
  return Math.round(
    (goal.steps.filter((step) => step.completed).length / goal.steps.length) *
      100,
  )
}

export function nextStep(goals: Goal[]) {
  return goals
    .flatMap((goal) =>
      goal.steps
        .filter((step) => !step.completed)
        .map((step) => ({ goal, step })),
    )
    .sort((a, b) => a.step.minutes - b.step.minutes)[0]
}
