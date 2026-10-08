export type GoalStatus = "active" | "paused" | "complete"

export interface Step {
  id: string
  title: string
  minutes: number
  completed: boolean
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

export interface ZenithState {
  goals: Goal[]
  sessions: FocusSession[]
  skills: Skill[]
}
