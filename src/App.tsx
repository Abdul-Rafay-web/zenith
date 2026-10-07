import { lazy, Suspense, useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleDot,
  Cloud,
  CloudOff,
  Home,
  LogOut,
  Map,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings,
  Trash2,
  Sparkles,
  X,
} from "./components/icons"
import {
  completeSkillPractice,
  loadState,
  mergeStates,
  nextStep,
  progressFor,
  saveState,
} from "./lib/store"
import type { CloudUser } from "./lib/firebase"
import type { Goal, ZenithState } from "./types"
import type { SkillDraft } from "./components/Learn"
import { IconButton } from "./components/ui"

const Learn = lazy(() => import("./components/Learn"))
const Focus = lazy(() => import("./components/Focus"))
const Review = lazy(() => import("./components/Review"))
const Legal = lazy(() => import("./components/Legal"))
import type { PracticeInput } from "./lib/store"



type Screen = "today" | "paths" | "learn" | "focus" | "review"

// Summit mark: two stacked ridges rising to a single point, with the
// zenith star resting just above the peak.
function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 40 40" role="img" aria-label="Zenith">
      <defs>
        <linearGradient id="zm-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9b7bff" />
          <stop offset="1" stopColor="#3a1fb8" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#zm-tile)" />
      <path d="M7 31 20 13l13 18Z" fill="#ffffff" />
      <path d="M13.5 31 20 22l6.5 9Z" fill="#3a1fb8" />
      <circle cx="20" cy="7.5" r="2.6" fill="#c6f432" />
    </svg>
  )
}

function Header({
  cloudConnected,
  onAdd,
  user,
  onLogout,
  onAccount,
  sync,
}: {
  cloudConnected: boolean
  onAdd: () => void
  user: CloudUser | null
  onLogout: () => void
  onAccount: () => void
  sync: { status: string; pending: number }
}) {
  return (
    <header className="topbar">
      <div className="brand-lockup">
        <BrandMark />
        <span className="wordmark">ZENITH</span>
      </div>
      <div className="top-actions">
        <span
          className={`sync-state ${sync.status}`}
          title={
            !user
              ? "Guest mode: saved on this device only"
              : sync.pending
                ? `${sync.pending} change(s) queued, will upload automatically`
                : "All changes backed up"
          }
        >
          {cloudConnected && sync.status !== "offline" ? (
            <Cloud size={15} />
          ) : (
            <CloudOff size={15} />
          )}
          {!user
            ? "On device"
            : sync.status === "offline"
              ? `Offline · ${sync.pending}`
              : sync.status === "syncing"
                ? "Syncing"
                : sync.status === "error"
                  ? `Retrying · ${sync.pending}`
                  : "Synced"}
        </span>
        <IconButton label="Settings" onClick={onAccount}>
          <Settings size={17} />
        </IconButton>
        <IconButton label="Create a goal" onClick={onAdd}>
          <Plus size={19} strokeWidth={2.4} />
        </IconButton>
        {user && (
          <button
            type="button"
            className="account-chip"
            onClick={onAccount}
            title="Account"
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
            ) : (
              <span>{user.displayName.slice(0, 1).toUpperCase()}</span>
            )}
            <strong className="account-name">{user.displayName}</strong>
            <LogOut size={14} />
          </button>
        )}
        {!user && (
          <button type="button" className="sign-in-chip" onClick={onLogout}>
            Sign in
          </button>
        )}
      </div>
    </header>
  )
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.62-2.37l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.92A6.02 6.02 0 0 1 6.07 12c0-.67.12-1.32.32-1.92V7.46H3.04A10 10 0 0 0 2 12c0 1.63.39 3.17 1.04 4.54l3.35-2.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.95c1.47 0 2.8.51 3.84 1.5l2.87-2.88A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.46l3.35 2.62C7.18 7.71 9.39 5.95 12 5.95Z"
      />
    </svg>
  )
}

function friendlyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : ""
  if (message.includes("email-already-in-use"))
    return "An account already uses this email. Sign in instead."
  if (message.includes("invalid-credential"))
    return "The email or password does not match."
  if (message.includes("weak-password"))
    return "Use at least six characters for your password."
  if (message.includes("popup-closed"))
    return "Google sign-in was closed before it finished."
  if (message.includes("operation-not-allowed"))
    return "This sign-in method needs to be enabled in Firebase."
  return "Sign-in could not be completed. Check your connection and try again."
}

function AuthScreen({
  onContinueOffline,
  onLegal,
}: {
  onContinueOffline: () => void
  onLegal: (doc: "privacy" | "terms") => void
}) {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      const auth = await import("./lib/firebase")
      if (mode === "signup") {
        await auth.createAccount(name.trim(), email.trim(), password)
      } else {
        await auth.login(email.trim(), password)
      }
    } catch (caught) {
      setError(friendlyAuthError(caught))
    } finally {
      setBusy(false)
    }
  }

  async function googleLogin() {
    setBusy(true)
    setError("")
    try {
      const auth = await import("./lib/firebase")
      await auth.loginWithGoogle()
    } catch (caught) {
      setError(friendlyAuthError(caught))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-story">
        <div className="auth-brand">
          <BrandMark />
          <span className="wordmark">ZENITH</span>
        </div>
        <div className="auth-constellation" aria-hidden="true">
          <span />
          <span />
          <span />
          <i />
          <i />
        </div>
        <div className="auth-copy">
          <p className="eyebrow">A personal direction system</p>
          <h1>
            Your ambition,
            <br />
            made navigable.
          </h1>
          <p>
            Turn distant goals into clear paths, then protect the time to move
            through them.
          </p>
        </div>
        <div className="auth-proof">
          <span>PLAN</span>
          <i />
          <span>FOCUS</span>
          <i />
          <span>REFLECT</span>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <p className="eyebrow">
            {mode === "login" ? "Welcome back" : "Start your path"}
          </p>
          <h2>
            {mode === "login"
              ? "Return to your direction."
              : "Create your space."}
          </h2>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Your goals and focus history are waiting."
              : "A private place for the work that matters."}
          </p>
          <button
            type="button"
            className="google-button"
            disabled={busy}
            onClick={googleLogin}
          >
            <GoogleGlyph />
            Continue with Google
          </button>
          <div className="auth-divider">
            <span>or use email</span>
          </div>
          <form onSubmit={submit}>
            {mode === "signup" && (
              <label>
                Your name
                <input
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="What should Zenith call you?"
                />
              </label>
            )}
            <label>
              Email
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                required
                minLength={6}
                type="password"
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
              />
            </label>
            {mode === "login" && (
              <button
                type="button"
                className="forgot-link"
                onClick={async () => {
                  if (!email.trim()) {
                    setError("Enter your email first, then tap reset.")
                    return
                  }
                  try {
                    const auth = await import("./lib/firebase")
                    await auth.resetPassword(email.trim())
                    setError("")
                    setNotice("Reset link sent — check your inbox.")
                  } catch (caught) {
                    setError(friendlyAuthError(caught))
                  }
                }}
              >
                Forgot password?
              </button>
            )}
            {notice && <div className="auth-notice">{notice}</div>}
            {error && <div className="auth-error">{error}</div>}
            <button
              type="submit"
              className="primary-button auth-submit"
              disabled={busy}
            >
              {busy
                ? "Connecting..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
              {!busy && <ArrowRight size={17} />}
            </button>
          </form>
          <button
            type="button"
            className="auth-switch"
            onClick={() => {
              setMode((current) => (current === "login" ? "signup" : "login"))
              setError("")
            }}
          >
            {mode === "login"
              ? "New to Zenith? Create an account"
              : "Already have an account? Sign in"}
          </button>
          <p className="auth-legal">
            By continuing you agree to the{" "}
            <button type="button" onClick={() => onLegal("terms")}>Terms</button> and{" "}
            <button type="button" onClick={() => onLegal("privacy")}>Privacy Policy</button>.
          </p>
        </div>
      </section>
    </main>
  )
}

function GoalOrbit({
  goals,
  onSelect,
}: {
  goals: Goal[]
  onSelect: (goal: Goal) => void
}) {
  return (
    <div className="orbit-wrap" aria-label="Your goal constellation">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="orbit-center">
        <span>
          {goals.reduce((sum, goal) => sum + progressFor(goal), 0) > 0
            ? "Moving"
            : "Begin"}
        </span>
        <strong>
          {Math.round(
            goals.reduce((sum, goal) => sum + progressFor(goal), 0) /
              Math.max(goals.length, 1),
          )}
          %
        </strong>
      </div>
      {goals.slice(0, 3).map((goal, index) => (
        <button
          type="button"
          key={goal.id}
          className={`goal-node node-${index + 1} accent-${goal.accent}`}
          aria-label={`Open ${goal.title}`}
          onClick={() => onSelect(goal)}
        >
          <span>{progressFor(goal)}%</span>
        </button>
      ))}
      <div className="orbit-label orbit-label-one">CRAFT</div>
      <div className="orbit-label orbit-label-two">BODY</div>
      <div className="orbit-label orbit-label-three">SELF</div>
    </div>
  )
}

function Today({
  state,
  onOpenGoal,
  onFocus,
  onToggle,
}: {
  state: ZenithState
  onOpenGoal: (goal: Goal) => void
  onFocus: (goalId: string, stepId?: string) => void
  onToggle: (goalId: string, stepId: string) => void
}) {
  const recommended = nextStep(state.goals)
  const focusedMinutes = Math.round(
    state.sessions.reduce((sum, session) => sum + session.actualSeconds, 0) /
      60,
  )

  return (
    <main className="screen today-screen">
      <section className="intro">
        <div>
          <p className="eyebrow">Thursday · Your trajectory</p>
          <h1>
            Make room for
            <br />
            what matters.
          </h1>
        </div>
        <p className="intro-copy">
          One deliberate session is enough to keep your direction.
        </p>
      </section>

      <GoalOrbit goals={state.goals} onSelect={onOpenGoal} />

      {recommended && (
        <section className="next-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Best next move</p>
              <h2>Fits the time you have</h2>
            </div>
            <span className="recommendation-chip">
              <Sparkles size={13} /> Smart pick
            </span>
          </div>
          <article className="focus-card">
            <div className={`focus-accent accent-${recommended.goal.accent}`} />
            <div className="focus-card-top">
              <div className="goal-context">
                <span
                  className={`tiny-dot accent-${recommended.goal.accent}`}
                />
                {recommended.goal.title}
              </div>
              <span className="duration">{recommended.step.minutes} MIN</span>
            </div>
            <h3>{recommended.step.title}</h3>
            <p>{recommended.goal.why}</p>
            <div className="focus-card-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  onFocus(recommended.goal.id, recommended.step.id)
                }
              >
                <Play size={16} /> Begin focus
              </button>
              <button
                type="button"
                className="complete-button"
                onClick={() =>
                  onToggle(recommended.goal.id, recommended.step.id)
                }
              >
                <Check size={17} /> Mark done
              </button>
            </div>
          </article>
        </section>
      )}

      <section className="pulse-grid">
        <article className="metric-card">
          <span>This week</span>
          <strong>{focusedMinutes || 86}</strong>
          <small>focused minutes</small>
          <div className="mini-bars" aria-hidden="true">
            {[32, 54, 41, 78, 62, 26, 12].map((height, index) => (
              <i key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
        </article>
        <article className="metric-card momentum-card">
          <span>Momentum</span>
          <strong>Steady</strong>
          <small>4 of 7 days in motion</small>
          <div className="momentum-line">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </article>
      </section>
    </main>
  )
}

function Paths({
  goals,
  onOpenGoal,
  onAdd,
}: {
  goals: Goal[]
  onOpenGoal: (goal: Goal) => void
  onAdd: () => void
}) {
  return (
    <main className="screen paths-screen">
      <div className="page-title">
        <p className="eyebrow">Your long view</p>
        <h1>Paths</h1>
        <p>Plans change. Direction stays visible.</p>
      </div>
      <div className="goal-list">
        {goals.map((goal, index) => (
          <button
            type="button"
            className="goal-row"
            key={goal.id}
            onClick={() => onOpenGoal(goal)}
          >
            <span className={`goal-index accent-${goal.accent}`}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="goal-row-content">
              <span className="goal-row-meta">
                {goal.horizon} · {goal.steps.length} milestones
              </span>
              <strong>{goal.title}</strong>
              <span className="progress-track">
                <i style={{ width: `${progressFor(goal)}%` }} />
              </span>
            </span>
            <span className="goal-progress">{progressFor(goal)}%</span>
            <ChevronRight size={20} />
          </button>
        ))}
      </div>
      <button type="button" className="new-path-button" onClick={onAdd}>
        <Plus size={20} />
        <span>
          <strong>Set a new direction</strong>
          <small>Turn an ambition into a path</small>
        </span>
      </button>
    </main>
  )
}

function GoalDetail({
  goal,
  onBack,
  onToggle,
  onFocus,
  onAddStep,
  onDelete,
}: {
  goal: Goal
  onDelete: (goalId: string) => void
  onBack: () => void
  onToggle: (goalId: string, stepId: string) => void
  onFocus: (goalId: string, stepId?: string) => void
  onAddStep: (goalId: string, title: string, minutes: number) => void
}) {
  const progress = progressFor(goal)
  const [addingStep, setAddingStep] = useState(false)
  const [stepTitle, setStepTitle] = useState("")
  const [stepMinutes, setStepMinutes] = useState(25)
  return (
    <main className="screen detail-screen">
      <IconButton
        label="Back to paths"
        onClick={onBack}
        className="back-button"
      >
        <ArrowLeft size={19} />
      </IconButton>
      <button
        type="button"
        className="detail-delete"
        onClick={() => {
          if (window.confirm(`Delete "${goal.title}", its steps and focus history?`))
            onDelete(goal.id)
        }}
      >
        <Trash2 size={14} /> Delete path
      </button>
      <div className="detail-hero">
        <p className="eyebrow">Active path · Target {goal.horizon}</p>
        <h1>{goal.title}</h1>
        <p>{goal.why}</p>
        <div className="detail-progress">
          <strong>{progress}%</strong>
          <span>
            <i style={{ width: `${progress}%` }} />
          </span>
          <small>
            {goal.steps.filter((step) => step.completed).length} of{" "}
            {goal.steps.length} complete
          </small>
        </div>
      </div>
      <section className="roadmap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Current phase</p>
            <h2>Foundation</h2>
          </div>
          <div className="roadmap-actions">
            <span className="weekly-budget">
              {Math.round(goal.weeklyMinutes / 60)}h / week
            </span>
            <button
              type="button"
              className="mini-add-button"
              onClick={() => setAddingStep((current) => !current)}
            >
              <Plus size={15} /> Mini goal
            </button>
          </div>
        </div>
        {addingStep && (
          <form
            className="step-composer"
            onSubmit={(event) => {
              event.preventDefault()
              if (!stepTitle.trim()) return
              onAddStep(goal.id, stepTitle.trim(), stepMinutes)
              setStepTitle("")
              setStepMinutes(25)
              setAddingStep(false)
            }}
          >
            <label>
              Next mini goal
              <input
                autoFocus
                required
                value={stepTitle}
                onChange={(event) => setStepTitle(event.target.value)}
                placeholder="Describe one clear outcome"
              />
            </label>
            <label>
              Focus time
              <select
                value={stepMinutes}
                onChange={(event) => setStepMinutes(Number(event.target.value))}
              >
                <option value={15}>15 min</option>
                <option value={25}>25 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
              </select>
            </label>
            <button type="submit" className="primary-button">
              Add to path <ArrowRight size={15} />
            </button>
          </form>
        )}
        <div className="roadmap-list">
          {goal.steps.map((step, index) => (
            <article
              className={`roadmap-step ${step.completed ? "is-complete" : ""}`}
              key={step.id}
            >
              <button
                type="button"
                className="step-check"
                aria-label={
                  step.completed
                    ? `Mark ${step.title} incomplete`
                    : `Complete ${step.title}`
                }
                onClick={() => onToggle(goal.id, step.id)}
              >
                {step.completed ? <Check size={15} /> : index + 1}
              </button>
              <div>
                <strong>{step.title}</strong>
                <span>{step.minutes} min focus estimate</span>
              </div>
              {!step.completed && (
                <IconButton
                  label={`Focus on ${step.title}`}
                  onClick={() => onFocus(goal.id, step.id)}
                >
                  <Play size={16} />
                </IconButton>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function AddGoalSheet({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (title: string, why: string) => void
}) {
  const [title, setTitle] = useState("")
  const [why, setWhy] = useState("")
  return (
    <div className="sheet-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="goal-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-goal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" />
        <IconButton label="Close" onClick={onClose} className="sheet-close">
          <X size={19} />
        </IconButton>
        <p className="eyebrow">New direction</p>
        <h2 id="new-goal-title">What deserves your time?</h2>
        <label>
          Goal
          <input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Launch my first mobile app"
          />
        </label>
        <label>
          Why it matters
          <textarea
            value={why}
            onChange={(event) => setWhy(event.target.value)}
            placeholder="The reason I want to keep showing up..."
          />
        </label>
        <button
          type="button"
          className="primary-button sheet-submit"
          disabled={!title.trim()}
          onClick={() => onCreate(title.trim(), why.trim())}
        >
          Create path <ArrowRight size={17} />
        </button>
      </section>
    </div>
  )
}

function BottomNav({
  active,
  onChange,
}: {
  active: Screen
  onChange: (screen: Screen) => void
}) {
  const items: Array<{
    id: Screen
    label: string
    icon: React.ReactNode
  }> = [
    { id: "today", label: "Today", icon: <Home size={20} /> },
    { id: "paths", label: "Paths", icon: <Map size={20} /> },
    { id: "learn", label: "Learn", icon: <BrainCircuit size={20} /> },
    { id: "focus", label: "Focus", icon: <CircleDot size={21} /> },
    { id: "review", label: "Review", icon: <BarChart3 size={20} /> },
  ]
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {items.map((item) => (
        <button
          type="button"
          key={item.id}
          className={active === item.id ? "active" : ""}
          onClick={() => onChange(item.id)}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default function App() {
  const [state, setState] = useState<ZenithState>(() => loadState("guest"))
  const [screen, setScreen] = useState<Screen>("today")
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [focusSelection, setFocusSelection] = useState<{
    goalId: string
    stepId?: string
  } | null>(null)
  const [addingGoal, setAddingGoal] = useState(false)
  const [cloudConnected, setCloudConnected] = useState(false)
  const [user, setUser] = useState<CloudUser | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [dataReady, setDataReady] = useState(false)
  const [offlineMode, setOfflineMode] = useState(false)
  const [toast, setToast] = useState("")
  const [accountOpen, setAccountOpen] = useState(false)
  const [legal, setLegal] = useState<"privacy" | "terms" | null>(null)
  const [sync, setSync] = useState<{ status: string; pending: number }>({
    status: "synced",
    pending: 0,
  })
  const [reminders, setReminders] = useState(
    () => localStorage.getItem("zenith:reminders") === "1",
  )
  const [analyticsOn, setAnalyticsOn] = useState(
    () => localStorage.getItem("zenith:analytics-optout") !== "1",
  )
  const [voicePref, setVoiceState] = useState<"male" | "female" | "mute">(
    () => (localStorage.getItem("zenith:voice") as any) || "mute"
  )
  const [bgmOn, setBgmOn] = useState(
    () => localStorage.getItem("zenith:bgm") === "1"
  )

  const selectedGoal = useMemo(
    () => state.goals.find((goal) => goal.id === selectedGoalId),
    [state.goals, selectedGoalId],
  )

  useEffect(() => {
    let unsubscribe = () => {}
    // Never strand people on the splash: if auth can't answer (network,
    // blocked SDK), show sign-in with the guest bypass after 4s.
    const fallback = window.setTimeout(() => setAuthReady(true), 4000)
    import("./lib/firebase").then(({ observeAuth }) => {
      unsubscribe = observeAuth(async (current) => {
        window.clearTimeout(fallback)
        setUser(current)
        setAuthReady(true)
        setCloudConnected(Boolean(current))
        if (current) {
          setDataReady(false)
          setOfflineMode(false)
          const localUserState = loadState(current.uid)
          try {
            const { loadCloudState, onSyncStatus } = await import("./lib/cloud")
            onSyncStatus((status, pending) => setSync({ status, pending }))
            const cloud = await loadCloudState()
            const { pendingDeletes } = await import("./lib/syncQueue")
            setState(
              cloud
                ? mergeStates(localUserState, cloud, pendingDeletes(current.uid))
                : localUserState,
            )
          } catch {
            setCloudConnected(false)
            setState(localUserState)
          }
          setDataReady(true)
        } else {
          setState(loadState("guest"))
          setDataReady(true)
        }
      })
    })
    return () => {
      window.clearTimeout(fallback)
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!dataReady) return
    saveState(state, user?.uid || "guest")
    const timeout = window.setTimeout(() => {
      if (user) {
        import("./lib/cloud").then(({ syncState }) => syncState(state))
      }
    }, 500)
    return () => window.clearTimeout(timeout)
  }, [state, user, dataReady])

  // Re-plan alarms whenever skills change; debounced so a burst of edits
  // produces one reschedule.
  useEffect(() => {
    if (!dataReady || !reminders) return
    const timeout = window.setTimeout(() => {
      import("./lib/notifications").then(({ scheduleReminders }) =>
        scheduleReminders(state.skills),
      )
    }, 1500)
    return () => window.clearTimeout(timeout)
  }, [state.skills, reminders, dataReady])

  async function toggleReminders() {
    try {
      const mod = await import("./lib/notifications")
      if (reminders) {
        await mod.disableReminders()
        setReminders(false)
        setToast("Reminders off")
      } else {
        const granted = await mod.enableReminders()
        setReminders(granted)
        setToast(granted ? "Reminders on" : "Notifications are blocked in settings")
      }
    } catch (e) {
      setReminders(false)
      setToast("Failed to enable reminders on this device.")
    }
  }

  function toggleAnalytics() {
    const next = !analyticsOn
    localStorage.setItem("zenith:analytics-optout", next ? "0" : "1")
    setAnalyticsOn(next)
  }

  function track(event: string, params?: Record<string, string | number>) {
    import("./lib/firebase").then((mod) => mod.track(event, params))
  }

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(""), 2800)
    return () => window.clearTimeout(timeout)
  }, [toast])

  function openGoal(goal: Goal) {
    setSelectedGoalId(goal.id)
  }

  function toggleStep(goalId: string, stepId: string) {
    setState((current) => ({
      ...current,
      goals: current.goals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              updatedAt: new Date().toISOString(),
              steps: goal.steps.map((step) =>
                step.id === stepId
                  ? { ...step, completed: !step.completed }
                  : step,
              ),
            }
          : goal,
      ),
    }))
    setToast("Progress saved")
  }

  function startFocus(goalId: string, stepId?: string) {
    setFocusSelection({ goalId, stepId })
    setSelectedGoalId(null)
    setScreen("focus")
  }

  function completeSession(elapsed: number) {
    const goal = state.goals.find(
      (candidate) => candidate.id === focusSelection?.goalId,
    )
    const step = goal?.steps.find(
      (candidate) => candidate.id === focusSelection?.stepId,
    )
    if (!goal) return
    setState((current) => ({
      ...current,
      sessions: [
        ...current.sessions,
        {
          id: crypto.randomUUID(),
          goalId: goal.id,
          stepId: step?.id,
          title: step?.title || goal.title,
          plannedSeconds: (step?.minutes || 25) * 60,
          actualSeconds: elapsed,
          completedAt: new Date().toISOString(),
        },
      ],
    }))
    setToast("Focus capsule saved")
    setScreen("today")
    track("focus_completed", { seconds: elapsed })
  }

  function createGoal(title: string, why: string) {
    const timestamp = new Date().toISOString()
    setState((current) => ({
      ...current,
      goals: [
        ...current.goals,
        {
          id: crypto.randomUUID(),
          title,
          why: why || "A direction worth protecting.",
          horizon: "12 weeks",
          weeklyMinutes: 180,
          status: "active",
          accent: "blue",
          createdAt: timestamp,
          updatedAt: timestamp,
          steps: [
            {
              id: crypto.randomUUID(),
              title: "Define what done looks like",
              minutes: 20,
              completed: false,
            },
            {
              id: crypto.randomUUID(),
              title: "Take the smallest useful step",
              minutes: 25,
              completed: false,
            },
          ],
        },
      ],
    }))
    setAddingGoal(false)
    setScreen("paths")
    setToast("New path created")
  }

  function addStep(goalId: string, title: string, minutes: number) {
    setState((current) => ({
      ...current,
      goals: current.goals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              updatedAt: new Date().toISOString(),
              steps: [
                ...goal.steps,
                {
                  id: crypto.randomUUID(),
                  title,
                  minutes,
                  completed: false,
                },
              ],
            }
          : goal,
      ),
    }))
    setToast("Mini goal added to the path")
  }

  function addSkill(draft: SkillDraft) {
    const timestamp = new Date().toISOString()
    setState((current) => ({
      ...current,
      skills: [
        ...current.skills,
        {
          id: crypto.randomUUID(),
          title: draft.title,
          reminderTime: draft.reminderTime,
          purpose:
            draft.purpose || "Build capability through deliberate practice.",
          target: `Use ${draft.title} confidently in a real project`,
          identity: draft.identity,
          intention: draft.intention,
          subskills: draft.subskills.map((title) => ({
            id: crypto.randomUUID(),
            title,
            strength: 0,
            reps: 0,
          })),
          xp: 0,
          log: [],
          currentLevel: 1,
          totalMinutes: 0,
          repetitions: 0,
          confidence: 20,
          nextReviewAt: timestamp,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    }))
    setToast("Mastery path created")
    track("skill_created", { components: draft.subskills.length })
  }

  function addSubskill(skillId: string, title: string) {
    setState((current) => ({
      ...current,
      skills: current.skills.map((skill) =>
        skill.id === skillId
          ? {
              ...skill,
              updatedAt: new Date().toISOString(),
              subskills: [
                ...(skill.subskills || []),
                { id: crypto.randomUUID(), title, strength: 0, reps: 0 },
              ],
            }
          : skill,
      ),
    }))
    setToast("Component added to skill")
  }

  function recordSkillPractice(
    skillId: string,
    quality: number,
    input: PracticeInput,
  ) {
    const skill = state.skills.find((candidate) => candidate.id === skillId)
    if (!skill) return
    const result = completeSkillPractice(skill, quality, input)
    setState((current) => ({
      ...current,
      skills: current.skills.map((candidate) =>
        candidate.id === skillId ? result.skill : candidate,
      ),
    }))
    track("practice_completed", { quality, xp: result.xp })
    return result
  }

  // Removing from state is enough: the sync diff turns vanished docs into
  // queued cloud deletes that survive going offline.
  function deleteSkill(skillId: string) {
    setState((current) => ({
      ...current,
      skills: current.skills.filter((skill) => skill.id !== skillId),
    }))
    setToast("Skill removed")
  }

  function deleteGoal(goalId: string) {
    setState((current) => ({
      ...current,
      goals: current.goals.filter((goal) => goal.id !== goalId),
      sessions: current.sessions.filter((session) => session.goalId !== goalId),
    }))
    setSelectedGoalId(null)
    setScreen("paths")
    setToast("Path deleted")
  }

  async function handleDeleteAccount() {
    if (
      !window.confirm(
        "Permanently delete your account and all synced goals, sessions and skills? This cannot be undone.",
      )
    )
      return
    try {
      const { deleteAccount } = await import("./lib/firebase")
      const uid = user?.uid
      await deleteAccount()
      if (uid) (await import("./lib/syncQueue")).clearScope(uid)
      setAccountOpen(false)
      setToast("Account deleted")
    } catch (caught) {
      const code = (caught as { code?: string })?.code
      setToast(
        code === "auth/requires-recent-login"
          ? "For safety, sign in again, then delete your account"
          : "Could not delete account. Try again.",
      )
    }
  }

  async function handleLogout() {
    const { logout } = await import("./lib/firebase")
    await logout()
    setOfflineMode(false)
    setCloudConnected(false)
    setSelectedGoalId(null)
    setScreen("today")
  }

  if (!authReady) {
    return (
      <div className="auth-loading">
        <BrandMark />
        <span>Finding your direction</span>
      </div>
    )
  }

  if (!user && !offlineMode) {
    return (
<>
      <AuthScreen
        onLegal={setLegal}
        onContinueOffline={() => {
          setState(loadState("guest"))
          setDataReady(true)
          setOfflineMode(true)
        }}
      />
      {legal && (
        <Suspense fallback={null}>
          <Legal initial={legal} onClose={() => setLegal(null)} />
        </Suspense>
      )}
      </>
    )
  }

  return (
    <div className="app-shell">
      <div className="ambient-glow glow-one" />
      <div className="ambient-glow glow-two" />
      <Header
        cloudConnected={cloudConnected}
        onAdd={() => setAddingGoal(true)}
        user={user}
        onLogout={handleLogout}
        onAccount={() => setAccountOpen(true)}
        sync={sync}
      />
      <div className="content-shell">
        <Suspense fallback={<div className="screen-loading" aria-busy="true" />}>
        {selectedGoal ? (
          <GoalDetail
            goal={selectedGoal}
            onBack={() => setSelectedGoalId(null)}
            onToggle={toggleStep}
            onFocus={startFocus}
            onAddStep={addStep}
            onDelete={deleteGoal}
          />
        ) : (
          <>
            {screen === "today" && (
              <Today
                state={state}
                onOpenGoal={openGoal}
                onFocus={startFocus}
                onToggle={toggleStep}
              />
            )}
            {screen === "paths" && (
              <Paths
                goals={state.goals}
                onOpenGoal={openGoal}
                onAdd={() => setAddingGoal(true)}
              />
            )}
            {screen === "focus" && (
              <Focus
                state={state}
                selection={focusSelection}
                onSelect={(goalId, stepId) =>
                  setFocusSelection({ goalId, stepId })
                }
                onComplete={completeSession}
              />
            )}
            {screen === "learn" && (
              <Learn
                state={state}
                onAddSkill={addSkill}
                onAddSubskill={addSubskill}
                onPractice={recordSkillPractice}
                onDelete={deleteSkill}
              />
            )}
            {screen === "review" && <Review state={state} />}
          </>
        )}
        </Suspense>
      </div>
      {!selectedGoal && (
        <BottomNav
          active={screen}
          onChange={(next) => {
            setScreen(next)
            setSelectedGoalId(null)
          }}
        />
      )}
      {accountOpen && (
        <div
          className="sheet-backdrop"
          role="presentation"
          onMouseDown={() => setAccountOpen(false)}
        >
          <section
            className="goal-sheet account-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="sheet-handle" />
            <IconButton
              label="Close"
              onClick={() => setAccountOpen(false)}
              className="sheet-close"
            >
              <X size={19} />
            </IconButton>
            <p className="eyebrow">{user ? "Private space" : "Guest mode"}</p>
            <h2 id="account-title">{user ? user.displayName : "On this device"}</h2>
            {user && <p className="account-email">{user.email}</p>}
            <p className="account-note">
              {user
                ? "Only you can read or write your data. Every request is checked on the server against your account."
                : "Nothing leaves this device. Sign in to back up and sync across devices."}
            </p>
            <div className="settings-list">
              <button type="button" onClick={() => {
                const map = { mute: "male", male: "female", female: "mute" } as const;
                const next = map[voicePref];
                import("./lib/audio").then(m => {
                  m.setVoicePref(next);
                  setVoiceState(next);
                  if (next !== "mute") m.speakMotivation();
                })
              }}>
                <span>
                  <strong>Voice motivation</strong>
                  <small>Receive encouragement during focus sessions.</small>
                </span>
                <span style={{color: "var(--blue)", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase"}}>{voicePref}</span>
              </button>
              <button type="button" onClick={() => {
                const next = !bgmOn;
                import("./lib/audio").then(m => {
                  m.setBgmEnabled(next);
                  setBgmOn(next);
                })
              }}>
                <span>
                  <strong>Background music</strong>
                  <small>Plays automatically during focus capsules.</small>
                </span>
                <i className={`switch ${bgmOn ? "on" : ""}`} />
              </button>
              <button type="button" onClick={toggleReminders}>
                <span>
                  <strong>Practice reminders</strong>
                  <small>Your daily cue time and review-due alerts</small>
                </span>
                <i className={`switch ${reminders ? "on" : ""}`} />
              </button>
              <button type="button" onClick={toggleAnalytics}>
                <span>
                  <strong>Anonymous usage analytics</strong>
                  <small>Helps improve Zenith. Never includes your content.</small>
                </span>
                <i className={`switch ${analyticsOn ? "on" : ""}`} />
              </button>
              <button type="button" onClick={() => setLegal("privacy")}>
                <span><strong>Privacy Policy</strong></span>
                <ChevronRight size={15} />
              </button>
              <button type="button" onClick={() => setLegal("terms")}>
                <span><strong>Terms of Use</strong></span>
                <ChevronRight size={15} />
              </button>
            </div>
            <button
              type="button"
              className="primary-button sheet-submit"
              onClick={() => {
                setAccountOpen(false)
                handleLogout()
              }}
            >
              {user ? "Sign out" : "Sign in to sync"} <LogOut size={16} />
            </button>
            {user && (
              <button
                type="button"
                className="danger-link"
                onClick={handleDeleteAccount}
              >
                Delete account and all data
              </button>
            )}
          </section>
        </div>
      )}
      {legal && (
        <Suspense fallback={null}>
          <Legal initial={legal} onClose={() => setLegal(null)} />
        </Suspense>
      )}
      {addingGoal && (
        <AddGoalSheet
          onClose={() => setAddingGoal(false)}
          onCreate={createGoal}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={15} /> {toast}
        </div>
      )}
    </div>
  )
}
