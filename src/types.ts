export type GoalStatus = "active" | "paused" | "complete"

export interface Step {
  id: string
  title: string
  minutes: number
  completed: boolean
}

export interface AttachedDoc {
  id: string
  name: string
  url?: string
  dataUrl?: string
  type: "pdf" | "link" | "doc" | "note"
  size?: string
  addedAt: string
}

export interface Goal {
  id: string
  title: string
  why: string
  horizon: string
  weeklyMinutes: number
  status: GoalStatus
  accent: "blue" | "apricot" | "mint"
  steps: Step[]
  documents?: AttachedDoc[]
  createdAt: string
  updatedAt: string
}

export interface FocusSession {
  id: string
  goalId: string
  stepId?: string
  title: string
  plannedSeconds: number
  actualSeconds: number
  completedAt: string
}

export interface SubSkill {
  id: string
  title: string
  strength: number
  reps: number
}

export interface PracticeLog {
  at: string
  subskillId?: string
  quality: number
  prediction?: number
  minutes: number
  xp: number
}

export interface Skill {
  id: string
  title: string
  purpose: string
  target: string
  currentLevel: number
  totalMinutes: number
  repetitions: number
  confidence: number
  nextReviewAt: string
  lastPracticedAt?: string
  subskills?: SubSkill[]
  links?: string[]
  documents?: AttachedDoc[]
  intention?: string
  identity?: string
  xp?: number
  verifiedXp?: number
  verifiedAt?: string
  reminderTime?: string
  log?: PracticeLog[]
  createdAt: string
  updatedAt: string
}

export type Evidence = "strong" | "moderate" | "emerging"
export type TaskKind = "once" | "daily" | "timer" | "weekly" | "metric" | "skill"
export type TaskWindow = "wake" | "morning" | "day" | "evening" | "bed"

export interface Phase {
  n: 1 | 2 | 3
  title: string
  weeks: [number, number]
  unlockRule: string
}

export interface TaskTemplate {
  id: string
  title: string
  kind: TaskKind
  minutes?: number
  window?: TaskWindow
  weeklyTarget?: number
  phaseFrom: 1 | 2 | 3
  progression?: string
  why: string
  evidence: Evidence
  source: string
  sharedKey?: string
  chemicalKey?: string
  actionLabel?: string
  setupSteps?: string[]
}

export interface MetricDef {
  id: string
  name: string
  unit: string
  frequency: "daily" | "weekly" | "monthly" | "once"
  type: "number" | "scale1-5" | "scale1-10" | "photo" | "test"
  phaseFrom?: 1 | 2 | 3
  description?: string
}

export interface MetricLog {
  id: string
  metricId: string
  trackId: string
  date: string
  value: number | string
  timestamp: string
}

export interface TrackTemplate {
  id: string
  title: string
  tagline: string
  durationWeeks: 12
  phases: Phase[]
  tasks: TaskTemplate[]
  metrics: MetricDef[]
  disclaimer?: string
  gate?: "18+" | "male"
  variantOf?: string
  category: "cognition" | "hormones" | "focus" | "vitality" | "neurochemistry"
  expectedOutcomes: string[]
}

export interface TrackEnrollment {
  id: string
  trackId: string
  startedAt: string
  phase: 1 | 2 | 3
  completions: Record<string, string[]>
  metrics: MetricLog[]
  variant?: "male" | "strength-energy"
  urgeSurfs?: Array<{ timestamp: string; durationSeconds: number }>
  implementationIntentions?: Record<string, { trigger: string; plan: string }>
  documents?: AttachedDoc[]
}

export interface ZenithState {
  goals: Goal[]
  sessions: FocusSession[]
  skills: Skill[]
  enrollments: TrackEnrollment[]
}

