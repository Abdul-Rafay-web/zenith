import React, { useEffect, useMemo, useState } from "react"
import type {
  AttachedDoc,
  Evidence,
  MetricDef,
  TaskTemplate,
  TrackEnrollment,
  TrackTemplate,
  ZenithState,
} from "../types"
import DocumentSection from "./DocumentSection"
import {
  ALL_TRACKS,
  getTrackById,
  NEUROCHEMICALS,
  type NeurochemicalInfo,
} from "../data/tracks"
import {
  advancePhase,
  calculateAdherence,
  checkPhaseUnlock,
  type DeduplicatedTask,
  getDeduplicatedTasks,
  getEnrolledTracks,
  getNeurochemicalWheel,
  getTrackHabitChain,
  MAX_RECOMMENDED_TRACKS,
  todayDateStr,
} from "../lib/tracks"
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleDot,
  Flame,
  Info,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  X,
} from "./icons"
import { IconButton } from "./ui"

interface TracksProps {
  state: ZenithState
  onEnroll: (trackId: string, variant?: "male" | "strength-energy") => void
  onUnenroll: (trackId: string) => void
  onToggleTask: (taskId: string) => void
  onAdvancePhase: (trackId: string) => void
  onLogMetric: (trackId: string, metricId: string, value: number | string) => void
  onRecordUrgeSurf: (trackId: string, durationSeconds: number) => void
  onSetIntention: (trackId: string, key: string, trigger: string, plan: string) => void
  onOpenFocus?: (title: string, minutes: number) => void
  onAddTrackDocument?: (trackId: string, doc: AttachedDoc) => void
  onRemoveTrackDocument?: (trackId: string, docId: string) => void
}

function EvidenceBadge({ evidence }: { evidence: Evidence }) {
  const meta = {
    strong: { label: "Strong Evidence", class: "evidence-strong" },
    moderate: { label: "Moderate Evidence", class: "evidence-moderate" },
    emerging: { label: "Emerging / Mixed", class: "evidence-emerging" },
  }[evidence]

  return <span className={`evidence-pill ${meta.class}`}>{meta.label}</span>
}

// ----------------------------------------------------------------------
// 1. Why Sheet / Mechanism Drawer
// ----------------------------------------------------------------------
function WhySheet({
  task,
  onClose,
}: {
  task: DeduplicatedTask | TaskTemplate
  onClose: () => void
}) {
  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <section
        className="sheet why-sheet"
        role="dialog"
        aria-labelledby="why-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        <IconButton label="Close" onClick={onClose} className="sheet-close">
          <X size={19} />
        </IconButton>

        <div className="why-header">
          <div className="why-eyebrow">
            <EvidenceBadge evidence={task.evidence} />
            {task.window && <span className="window-pill">{task.window}</span>}
          </div>
          <h2 id="why-title">{task.title}</h2>
        </div>

        <div className="why-content">
          <div className="why-block">
            <h3>Biological Mechanism</h3>
            <p>{task.why}</p>
          </div>

          <div className="why-block">
            <h3>Academic Source & Citation</h3>
            <p className="source-citation">
              <strong>Ref:</strong> {task.source}
            </p>
          </div>

          {"contributingTracks" in task && task.contributingTracks && (
            <div className="why-block">
              <h3>Contributing Tracks</h3>
              <div className="contributing-chips">
                {task.contributingTracks.map((ct) => (
                  <span key={ct.trackId} className="track-badge-chip">
                    {ct.trackTitle}
                  </span>
                ))}
              </div>
              <p className="why-subtext">
                Completing this shared foundation task simultaneously credits all
                enrolled tracks.
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          className="primary-button sheet-submit"
          onClick={onClose}
        >
          Got it
        </button>
      </section>
    </div>
  )
}

// ----------------------------------------------------------------------
// 2. 5-Min Cyclic Sighing Breathwork Tool (Balban et al. 2023)
// ----------------------------------------------------------------------
function CyclicSighingModal({
  onClose,
  onComplete,
}: {
  onClose: () => void
  onComplete: () => void
}) {
  const [running, setRunning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(300) // 5 minutes
  const [breathPhase, setBreathPhase] = useState<
    "inhale1" | "inhale2" | "exhale"
  >("inhale1")
  const [cycleSeconds, setCycleSeconds] = useState(0)

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onComplete()
          return 0
        }
        return prev - 1
      })
      setCycleSeconds((prev) => {
        const next = (prev + 0.1) % 10
        // Inhale 1: 0 - 3s
        // Inhale 2: 3 - 4.5s
        // Exhale: 4.5 - 10s
        if (next < 3) setBreathPhase("inhale1")
        else if (next < 4.5) setBreathPhase("inhale2")
        else setBreathPhase("exhale")
        return next
      })
    }, 100)
    return () => clearInterval(timer)
  }, [running, onComplete])

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const timeFormatted = `${mins}:${secs < 10 ? "0" : ""}${secs}`

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <section
        className="sheet breathing-modal"
        role="dialog"
        aria-labelledby="breathing-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        <IconButton label="Close" onClick={onClose} className="sheet-close">
          <X size={19} />
        </IconButton>

        <h2 id="breathing-title">5-Min Cyclic Sighing</h2>
        <p className="breathing-subtitle">
          Two deep nasal inhales followed by a prolonged, unforced mouth exhale.
          Demonstrated in Cell Reports Medicine (Balban 2023) to reduce autonomic
          cortisol and enhance positive affect faster than standard meditation.
        </p>

        <div className="pacer-container">
          <div className={`pacer-circle ${running ? breathPhase : ""}`}>
            <div className="pacer-inner">
              <span className="pacer-instruction">
                {!running
                  ? "Tap Start"
                  : breathPhase === "inhale1"
                    ? "Deep Nasal Inhale"
                    : breathPhase === "inhale2"
                      ? "Top Off Inhale"
                      : "Slow Passive Exhale"}
              </span>
              <span className="pacer-timer">{timeFormatted}</span>
            </div>
          </div>
        </div>

        <div className="breathing-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => setRunning(!running)}
          >
            {running ? <Pause size={18} /> : <Play size={18} />}
            {running ? "Pause Pacer" : "Start 5-Min Session"}
          </button>
          {secondsLeft < 300 && (
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                setSecondsLeft(300)
                setRunning(false)
              }}
            >
              <RotateCcw size={16} /> Reset
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

// ----------------------------------------------------------------------
// 3. 10-Min Urge Surfing Station (Bowen et al. 2009)
// ----------------------------------------------------------------------
function UrgeSurfingModal({
  onClose,
  onSurfSuccess,
}: {
  onClose: () => void
  onSurfSuccess: (seconds: number) => void
}) {
  const [running, setRunning] = useState(true)
  const [secondsLeft, setSecondsLeft] = useState(600) // 10 minutes

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [running])

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const timeFormatted = `${mins}:${secs < 10 ? "0" : ""}${secs}`

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <section
        className="sheet urge-modal"
        role="dialog"
        aria-labelledby="urge-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        <IconButton label="Close" onClick={onClose} className="sheet-close">
          <X size={19} />
        </IconButton>

        <div className="urge-header">
          <span className="urge-eyebrow">Mindfulness-Based Relapse Prevention</span>
          <h2 id="urge-title">Urge Surfing Station</h2>
        </div>

        <div className="urge-timer-display">
          <span className="urge-digits">{timeFormatted}</span>
          <p className="urge-guide">
            Cravings crest and subside like an ocean wave within 7–10 minutes.
            Do not resist or judge the impulse. Locate where it registers in your
            body (chest, throat, hands). Breathe into that sensation.
          </p>
        </div>

        <div className="urge-principles">
          <div className="urge-step">
            <strong>1. Notice & Name:</strong> &ldquo;I am experiencing an urge to check feeds.&rdquo;
          </div>
          <div className="urge-step">
            <strong>2. Track Bodily Tension:</strong> Observe heartbeat, tightness, or restless fingers.
          </div>
          <div className="urge-step">
            <strong>3. Ride the Crest:</strong> The urge naturally peaks, breaks, and fades.
          </div>
        </div>

        <div className="urge-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              onSurfSuccess(600 - secondsLeft)
              onClose()
            }}
          >
            <Check size={18} /> I Surfed the Urge (Log Win)
          </button>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>
      </section>
    </div>
  )
}

// ----------------------------------------------------------------------
// 4. Implementation Intention Editor ("If X, then I will Y")
// ----------------------------------------------------------------------
function ImplementationIntentionModal({
  trackId,
  existing,
  onSave,
  onClose,
}: {
  trackId: string
  existing?: { trigger: string; plan: string }
  onSave: (trigger: string, plan: string) => void
  onClose: () => void
}) {
  const [trigger, setTrigger] = useState(
    existing?.trigger || "I feel the reflexive urge to open infinite feeds",
  )
  const [plan, setPlan] = useState(
    existing?.plan || "I will put my phone face down and take 3 deep nasal breaths",
  )

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <section
        className="sheet intention-modal"
        role="dialog"
        aria-labelledby="intent-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        <IconButton label="Close" onClick={onClose} className="sheet-close">
          <X size={19} />
        </IconButton>

        <h2 id="intent-title">Implementation Intention</h2>
        <p className="intent-desc">
          Based on Peter Gollwitzer&apos;s meta-analyses (2006). Pre-committing an
          explicit &ldquo;If-Then&rdquo; script automates your response when executive
          willpower is depleted.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (trigger.trim() && plan.trim()) {
              onSave(trigger.trim(), plan.trim())
              onClose()
            }
          }}
          className="intent-form"
        >
          <label>
            <span>IF THIS TRIGGER HAPPENS:</span>
            <input
              type="text"
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              placeholder="e.g. I open my browser during work"
              required
            />
          </label>

          <label>
            <span>THEN I WILL EXECUTE THIS ACTION:</span>
            <input
              type="text"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="e.g. Close the tab and drink a glass of water"
              required
            />
          </label>

          <div className="intent-preview">
            <strong>Active Rule:</strong>
            <p>
              &ldquo;If <em>{trigger || "..."}</em>, then I will{" "}
              <em>{plan || "..."}</em>.&rdquo;
            </p>
          </div>

          <button type="submit" className="primary-button sheet-submit">
            Save Implementation Rule
          </button>
        </form>
      </section>
    </div>
  )
}

// ----------------------------------------------------------------------
// 5. Track Detail & Enrollment Modal
// ----------------------------------------------------------------------
function TrackDetailModal({
  track,
  enrollment,
  onEnroll,
  onUnenroll,
  onClose,
  onAddDocument,
  onRemoveDocument,
}: {
  track: TrackTemplate
  enrollment?: TrackEnrollment
  onEnroll: (trackId: string, variant?: "male" | "strength-energy") => void
  onUnenroll: (trackId: string) => void
  onClose: () => void
  onAddDocument?: (doc: AttachedDoc) => void
  onRemoveDocument?: (docId: string) => void
}) {
  const [selectedVariant, setSelectedVariant] = useState<
    "male" | "strength-energy"
  >(enrollment?.variant || "male")
  const [ageConfirmed, setAgeConfirmed] = useState(false)

  const isTestosterone = track.id === "track-testosterone-restore"

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <section
        className="sheet track-detail-sheet"
        role="dialog"
        aria-labelledby="track-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        <IconButton label="Close" onClick={onClose} className="sheet-close">
          <X size={19} />
        </IconButton>

        <div className="track-detail-header">
          <span className="track-category-tag">{track.category}</span>
          <h2 id="track-detail-title">{track.title}</h2>
          <p className="track-tagline">{track.tagline}</p>
        </div>

        {track.disclaimer && (
          <div className="track-disclaimer-box">
            <strong>Scientific & Medical Notice:</strong>
            <p>{track.disclaimer}</p>
          </div>
        )}

        {isTestosterone && !enrollment && (
          <div className="track-variant-selector">
            <h3>Protocol Variant</h3>
            <div className="variant-options">
              <label
                className={`variant-card ${selectedVariant === "male" ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="variant"
                  value="male"
                  checked={selectedVariant === "male"}
                  onChange={() => setSelectedVariant("male")}
                />
                <strong>Male Endocrine Protocol</strong>
                <small>Targets Leydig cell output, compound lifts, and aromatase control.</small>
              </label>
              <label
                className={`variant-card ${selectedVariant === "strength-energy" ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="variant"
                  value="strength-energy"
                  checked={selectedVariant === "strength-energy"}
                  onChange={() => setSelectedVariant("strength-energy")}
                />
                <strong>Strength & Metabolic Vitality</strong>
                <small>Hormone-neutral variant for women & general metabolic health.</small>
              </label>
            </div>
            {track.gate === "18+" && (
              <label className="gate-checkbox">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                />
                <span>I confirm I am 18 years of age or older.</span>
              </label>
            )}
          </div>
        )}

        <div className="expectations-section">
          <h3>What to Realistically Expect in 12 Weeks</h3>
          <ul className="expectations-list">
            {track.expectedOutcomes.map((outcome, idx) => (
              <li key={idx}>
                <Check size={16} /> <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="phases-section">
          <h3>12-Week Phase Progression</h3>
          <div className="phases-timeline">
            {track.phases.map((phase) => (
              <div key={phase.n} className="phase-card">
                <div className="phase-badge">Phase {phase.n}</div>
                <div className="phase-meta">
                  <strong>{phase.title}</strong>
                  <span className="weeks-tag">
                    Weeks {phase.weeks[0]}–{phase.weeks[1]}
                  </span>
                  <p>{phase.unlockRule}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {enrollment && onAddDocument && onRemoveDocument && (
          <DocumentSection
            title="Track Lab Results & Attached Documents"
            description="Attach blood work, hormone panels, habit notes, or scientific guides for this track."
            documents={enrollment.documents || []}
            onAddDocument={onAddDocument}
            onRemoveDocument={onRemoveDocument}
          />
        )}

        <div className="track-sheet-actions">
          {enrollment ? (
            <button
              type="button"
              className="danger-button"
              onClick={() => {
                onUnenroll(track.id)
                onClose()
              }}
            >
              Unenroll from Track
            </button>
          ) : (
            <button
              type="button"
              className="primary-button sheet-submit"
              disabled={isTestosterone && track.gate === "18+" && !ageConfirmed}
              onClick={() => {
                onEnroll(track.id, selectedVariant)
                onClose()
              }}
            >
              Enroll in 12-Week Protocol <ChevronRight size={18} />
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

// ----------------------------------------------------------------------
// 6. Metric Log Modal
// ----------------------------------------------------------------------
function MetricLogModal({
  metric,
  trackId,
  onSave,
  onClose,
}: {
  metric: MetricDef
  trackId: string
  onSave: (value: number | string) => void
  onClose: () => void
}) {
  const [val, setVal] = useState<string>("")

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <section
        className="sheet metric-log-modal"
        role="dialog"
        aria-labelledby="metric-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        <IconButton label="Close" onClick={onClose} className="sheet-close">
          <X size={19} />
        </IconButton>

        <h2 id="metric-title">Log {metric.name}</h2>
        {metric.description && <p className="metric-desc">{metric.description}</p>}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (val !== "") {
              onSave(Number(val) || val)
              onClose()
            }
          }}
          className="metric-form"
        >
          {metric.type === "scale1-5" ? (
            <div className="scale-selector">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  type="button"
                  key={num}
                  className={`scale-btn ${val === String(num) ? "active" : ""}`}
                  onClick={() => setVal(String(num))}
                >
                  {num}
                </button>
              ))}
            </div>
          ) : (
            <div className="metric-input-wrapper">
              <input
                type="number"
                step="any"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                placeholder={`Value (${metric.unit})`}
                required
                autoFocus
              />
              <span className="unit-label">{metric.unit}</span>
            </div>
          )}

          <button type="submit" className="primary-button sheet-submit">
            Save Log
          </button>
        </form>
      </section>
    </div>
  )
}

// ----------------------------------------------------------------------
// 7. Interactive Chemical Wheel SVG Component
// ----------------------------------------------------------------------
function ChemicalWheel({
  state,
  onSelectChemical,
}: {
  state: ZenithState
  onSelectChemical: (info: NeurochemicalInfo) => void
}) {
  const statuses = useMemo(() => getNeurochemicalWheel(state), [state])

  // Radial slice calculations
  const total = statuses.length
  const radius = 100
  const center = 120

  return (
    <div className="chemical-wheel-card">
      <div className="chemical-wheel-header">
        <div>
          <h3>Neurochemical Activation Wheel</h3>
          <small>Fill your neurochemical balance through daily biological inputs</small>
        </div>
      </div>

      <div className="wheel-display">
        <svg viewBox="0 0 240 240" className="wheel-svg" role="img" aria-label="Neurochemical Wheel">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="26" />
          {statuses.map((stat, idx) => {
            const angleStep = 360 / total
            const startAngle = idx * angleStep - 90
            const endAngle = startAngle + angleStep - 2
            const activeRadius = radius
            const pct = Math.max(0.12, stat.score / 100)
            const strokeDash = `${(pct * 550) / total} 1000`

            return (
              <circle
                key={stat.key}
                cx={center}
                cy={center}
                r={activeRadius}
                fill="none"
                stroke={stat.color}
                strokeWidth={stat.score > 0 ? "26" : "6"}
                strokeDasharray={strokeDash}
                transform={`rotate(${startAngle} ${center} ${center})`}
                opacity={stat.score > 0 ? 0.95 : 0.25}
                className="wheel-slice"
                onClick={() => onSelectChemical(NEUROCHEMICALS[stat.key])}
              />
            )
          })}
          <circle cx={center} cy={center} r="68" fill="var(--night-raised)" />
          <text
            x={center}
            y={center - 6}
            textAnchor="middle"
            fill="var(--paper)"
            fontSize="18"
            fontWeight="700"
          >
            {Math.round(
              statuses.reduce((acc, s) => acc + s.score, 0) / Math.max(1, total),
            )}%
          </text>
          <text
            x={center}
            y={center + 14}
            textAnchor="middle"
            fill="var(--paper-muted)"
            fontSize="10"
            fontFamily="var(--mono)"
          >
            BALANCE
          </text>
        </svg>

        <div className="wheel-legend">
          {statuses.map((stat) => (
            <button
              type="button"
              key={stat.key}
              className={`legend-chip ${stat.score > 0 ? "active" : ""}`}
              onClick={() => onSelectChemical(NEUROCHEMICALS[stat.key])}
            >
              <i style={{ background: stat.color }} />
              <span>{stat.name}</span>
              <strong style={{ color: stat.color }}>{stat.score}%</strong>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// Main Transformation Tracks Screen
// ----------------------------------------------------------------------
export default function Tracks({
  state,
  onEnroll,
  onUnenroll,
  onToggleTask,
  onAdvancePhase,
  onLogMetric,
  onRecordUrgeSurf,
  onSetIntention,
  onOpenFocus,
  onAddTrackDocument,
  onRemoveTrackDocument,
}: TracksProps) {
  const [activeTab, setActiveTab] = useState<"protocol" | "browse">("protocol")
  const [selectedTaskForWhy, setSelectedTaskForWhy] =
    useState<DeduplicatedTask | null>(null)
  const [selectedTrackForDetail, setSelectedTrackForDetail] =
    useState<TrackTemplate | null>(null)
  const [breathingOpen, setBreathingOpen] = useState(false)
  const [urgeSurfingOpen, setUrgeSurfingOpen] = useState(false)
  const [intentionModalTrackId, setIntentionModalTrackId] = useState<
    string | null
  >(null)
  const [activeMetricForLog, setActiveMetricForLog] = useState<{
    metric: MetricDef
    trackId: string
  } | null>(null)
  const [selectedChemInfo, setSelectedChemInfo] =
    useState<NeurochemicalInfo | null>(null)
  const [filterWindow, setFilterWindow] = useState<
    "all" | "wake" | "morning" | "day" | "evening" | "bed"
  >("all")

  const enrolledTracks = useMemo(() => getEnrolledTracks(state), [state])
  const deduplicatedTasks = useMemo(
    () => getDeduplicatedTasks(state, todayDateStr()),
    [state],
  )

  const filteredTasks = useMemo(() => {
    if (filterWindow === "all") return deduplicatedTasks
    return deduplicatedTasks.filter((t) => t.window === filterWindow)
  }, [deduplicatedTasks, filterWindow])

  const hasMoreThan3 = (state.enrollments || []).length > MAX_RECOMMENDED_TRACKS

  return (
    <div className="tracks-screen">
      {/* Screen Header */}
      <section className="tracks-hero">
        <div className="tracks-hero-header">
          <div>
            <span className="eyebrow">Transformation Protocols</span>
            <h1>Research Tracks</h1>
          </div>
          <div className="tab-pill-switcher">
            <button
              type="button"
              className={activeTab === "protocol" ? "active" : ""}
              onClick={() => setActiveTab("protocol")}
            >
              My Protocol ({enrolledTracks.length})
            </button>
            <button
              type="button"
              className={activeTab === "browse" ? "active" : ""}
              onClick={() => setActiveTab("browse")}
            >
              Browse All ({ALL_TRACKS.length})
            </button>
          </div>
        </div>

        {hasMoreThan3 && (
          <div className="warning-banner">
            <Info size={18} />
            <span>
              You have enrolled in more than 3 tracks. Habit research (Lally 2010)
              proves adherence falls sharply when spreading focus across too many
              changes at once.
            </span>
          </div>
        )}
      </section>

      {/* VIEW A: Active Protocol Dashboard */}
      {activeTab === "protocol" && (
        <div className="protocol-container">
          {enrolledTracks.length === 0 ? (
            <div className="empty-protocol-card">
              <Sparkles size={36} className="empty-icon" />
              <h3>No Active Transformation Tracks</h3>
              <p>
                Enroll in a 12-week evidence-backed track to build cognitive
                capacities, endocrine resilience, and digital focus.
              </p>
              <button
                type="button"
                className="primary-button"
                onClick={() => setActiveTab("browse")}
              >
                Browse Transformation Tracks <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <>
              {/* Active Tracks Phase Status Bar */}
              <div className="enrolled-tracks-strip">
                {enrolledTracks.map(({ enrollment, template }) => {
                  const unlockInfo = checkPhaseUnlock(enrollment, template)
                  const habitChain = getTrackHabitChain(enrollment)
                  const currentPhaseObj = template.phases.find(
                    (p) => p.n === enrollment.phase,
                  )

                  return (
                    <div key={enrollment.trackId} className="track-status-card">
                      <div className="track-status-top">
                        <div>
                          <h4>{template.title}</h4>
                          <span className="phase-pill">
                            Phase {enrollment.phase}: {currentPhaseObj?.title}
                          </span>
                        </div>
                        <IconButton
                          label="Track Details"
                          onClick={() => setSelectedTrackForDetail(template)}
                        >
                          <ChevronRight size={17} />
                        </IconButton>
                      </div>

                      <div className="adherence-gauge">
                        <div className="adherence-label">
                          <span>14-Day Adherence:</span>
                          <strong>{unlockInfo.adherence}%</strong>
                        </div>
                        <div className="adherence-bar-bg">
                          <div
                            className="adherence-bar-fill"
                            style={{
                              width: `${Math.min(100, unlockInfo.adherence)}%`,
                            }}
                          />
                          <div
                            className="adherence-threshold-line"
                            style={{ left: "70%" }}
                            title="70% Unlock Threshold"
                          />
                        </div>
                      </div>

                      <div className="track-status-bottom">
                        <span
                          className={`chain-badge ${habitChain.atRisk ? "at-risk" : ""}`}
                        >
                          <Flame size={14} /> {habitChain.chain}-day chain
                        </span>
                        {unlockInfo.canUnlock && enrollment.phase < 3 && (
                          <button
                            type="button"
                            className="unlock-phase-btn"
                            onClick={() => onAdvancePhase(enrollment.trackId)}
                          >
                            <Sparkles size={14} /> Unlock Phase {unlockInfo.nextPhase}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Special interactive tools for active tracks */}
              {enrolledTracks.some((e) =>
                e.template.id === "track-neurochemical-balance",
              ) && (
                <ChemicalWheel
                  state={state}
                  onSelectChemical={(chem) => setSelectedChemInfo(chem)}
                />
              )}

              {/* Daily Action Plan */}
              <div className="daily-protocol-section">
                <div className="section-title-bar">
                  <div>
                    <h3>Today&apos;s Protocol Tasks</h3>
                    <small>Shared foundation items credit across all contributing tracks</small>
                  </div>
                  <div className="window-filters">
                    {(["all", "wake", "morning", "day", "evening", "bed"] as const).map(
                      (win) => (
                        <button
                          type="button"
                          key={win}
                          className={`filter-btn ${filterWindow === win ? "active" : ""}`}
                          onClick={() => setFilterWindow(win)}
                        >
                          {win.toUpperCase()}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="tasks-grid">
                  {filteredTasks.length === 0 ? (
                    <div className="empty-tasks-card">
                      <p>No tasks scheduled for the &ldquo;{filterWindow}&rdquo; window.</p>
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`task-row ${task.completed ? "completed" : ""}`}
                      >
                        <button
                          type="button"
                          className="task-checkbox"
                          onClick={() => onToggleTask(task.id)}
                          aria-label={`Toggle ${task.title}`}
                        >
                          {task.completed && <Check size={16} strokeWidth={3} />}
                        </button>

                        <div
                          className="task-body"
                          onClick={() => setSelectedTaskForWhy(task)}
                        >
                          <div className="task-title-line">
                            <strong className="task-title">{task.title}</strong>
                            <EvidenceBadge evidence={task.evidence} />
                          </div>

                          <div className="task-meta-line">
                            {task.minutes && (
                              <span className="task-minutes-pill">
                                ⏱ {task.minutes} min
                              </span>
                            )}
                            <span className="task-window-pill">{task.window}</span>
                            {task.contributingTracks.length > 1 && (
                              <span className="shared-badge">
                                Shared across {task.contributingTracks.length} tracks
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="task-actions-strip">
                          {task.kind === "timer" && onOpenFocus && (
                            <IconButton
                              label="Launch Focus Session"
                              onClick={() =>
                                onOpenFocus(task.title, task.minutes || 25)
                              }
                            >
                              <CircleDot size={18} />
                            </IconButton>
                          )}
                          {task.id === "neuro-cyclic-sighing" && (
                            <button
                              type="button"
                              className="interactive-action-btn"
                              onClick={() => setBreathingOpen(true)}
                            >
                              Pacer
                            </button>
                          )}
                          {task.id === "attn-urge-surfing" && (
                            <button
                              type="button"
                              className="interactive-action-btn"
                              onClick={() => setUrgeSurfingOpen(true)}
                            >
                              Surf Urge
                            </button>
                          )}
                          {task.id === "attn-implementation-intention" && (
                            <button
                              type="button"
                              className="interactive-action-btn"
                              onClick={() =>
                                setIntentionModalTrackId("track-attention-reset")
                              }
                            >
                              Rule
                            </button>
                          )}
                          <IconButton
                            label="Why / Scientific Mechanism"
                            onClick={() => setSelectedTaskForWhy(task)}
                          >
                            <Info size={18} />
                          </IconButton>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Metrics Logging Section */}
              <div className="metrics-quicklog-section">
                <h3>Track Metrics & Self-Monitoring</h3>
                <div className="metrics-chips">
                  {enrolledTracks.flatMap(({ template, enrollment }) =>
                    template.metrics.map((metric) => {
                      const todayLog = enrollment.metrics?.find(
                        (m) =>
                          m.metricId === metric.id &&
                          m.date === todayDateStr(),
                      )

                      return (
                        <button
                          type="button"
                          key={`${enrollment.trackId}-${metric.id}`}
                          className={`metric-chip ${todayLog ? "logged" : ""}`}
                          onClick={() =>
                            setActiveMetricForLog({
                              metric,
                              trackId: enrollment.trackId,
                            })
                          }
                        >
                          <span>{metric.name}</span>
                          <strong>
                            {todayLog !== undefined
                              ? `${todayLog.value} ${metric.unit}`
                              : `Log +`}
                          </strong>
                        </button>
                      )
                    }),
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* VIEW B: Browse All 5 Tracks */}
      {activeTab === "browse" && (
        <div className="browse-tracks-grid">
          {ALL_TRACKS.map((track) => {
            const isEnrolled = enrolledTracks.some(
              (e) => e.template.id === track.id,
            )

            return (
              <div
                key={track.id}
                className={`browse-track-card ${isEnrolled ? "enrolled" : ""}`}
                onClick={() => setSelectedTrackForDetail(track)}
              >
                <div className="browse-card-top">
                  <span className="track-category-tag">{track.category}</span>
                  {track.gate && (
                    <span className="gate-badge">{track.gate}</span>
                  )}
                  {isEnrolled && (
                    <span className="active-enrolled-badge">Active</span>
                  )}
                </div>
                <h3>{track.title}</h3>
                <p className="browse-tagline">{track.tagline}</p>

                <div className="browse-card-footer">
                  <span className="duration-tag">{track.durationWeeks} Weeks</span>
                  <span className="view-details-link">
                    Explore Protocol <ChevronRight size={15} />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals & Sheets */}
      {selectedTaskForWhy && (
        <WhySheet
          task={selectedTaskForWhy}
          onClose={() => setSelectedTaskForWhy(null)}
        />
      )}

      {selectedTrackForDetail && (
        <TrackDetailModal
          track={selectedTrackForDetail}
          enrollment={
            enrolledTracks.find(
              (e) => e.template.id === selectedTrackForDetail.id,
            )?.enrollment
          }
          onEnroll={onEnroll}
          onUnenroll={onUnenroll}
          onClose={() => setSelectedTrackForDetail(null)}
          onAddDocument={
            onAddTrackDocument
              ? (doc) => onAddTrackDocument(selectedTrackForDetail.id, doc)
              : undefined
          }
          onRemoveDocument={
            onRemoveTrackDocument
              ? (docId) => onRemoveTrackDocument(selectedTrackForDetail.id, docId)
              : undefined
          }
        />
      )}

      {breathingOpen && (
        <CyclicSighingModal
          onClose={() => setBreathingOpen(false)}
          onComplete={() => {
            onToggleTask("neuro-cyclic-sighing")
            setBreathingOpen(false)
          }}
        />
      )}

      {urgeSurfingOpen && (
        <UrgeSurfingModal
          onClose={() => setUrgeSurfingOpen(false)}
          onSurfSuccess={(seconds) => {
            onRecordUrgeSurf("track-attention-reset", seconds)
            onToggleTask("attn-urge-surfing")
          }}
        />
      )}

      {intentionModalTrackId && (
        <ImplementationIntentionModal
          trackId={intentionModalTrackId}
          existing={
            enrolledTracks.find(
              (e) => e.enrollment.trackId === intentionModalTrackId,
            )?.enrollment.implementationIntentions?.["default"]
          }
          onSave={(trigger, plan) => {
            onSetIntention(intentionModalTrackId, "default", trigger, plan)
            onToggleTask("attn-implementation-intention")
          }}
          onClose={() => setIntentionModalTrackId(null)}
        />
      )}

      {activeMetricForLog && (
        <MetricLogModal
          metric={activeMetricForLog.metric}
          trackId={activeMetricForLog.trackId}
          onSave={(val) =>
            onLogMetric(
              activeMetricForLog.trackId,
              activeMetricForLog.metric.id,
              val,
            )
          }
          onClose={() => setActiveMetricForLog(null)}
        />
      )}

      {selectedChemInfo && (
        <div
          className="sheet-backdrop"
          onClick={() => setSelectedChemInfo(null)}
          role="presentation"
        >
          <section
            className="sheet chemical-detail-sheet"
            role="dialog"
            aria-labelledby="chem-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-handle" />
            <IconButton
              label="Close"
              onClick={() => setSelectedChemInfo(null)}
              className="sheet-close"
            >
              <X size={19} />
            </IconButton>

            <div className="chem-header">
              <span
                className="chem-color-indicator"
                style={{ background: selectedChemInfo.color }}
              />
              <h2 id="chem-title">{selectedChemInfo.name}</h2>
              <span className="chem-role">{selectedChemInfo.role}</span>
            </div>

            <div className="chem-body">
              <p>{selectedChemInfo.description}</p>
              <div className="chem-block">
                <strong>Daily Biological Practice:</strong>
                <p>{selectedChemInfo.dailyPractice}</p>
              </div>
              <div className="chem-block">
                <strong>Scientific Evidence:</strong>
                <p>{selectedChemInfo.source}</p>
              </div>
            </div>

            <button
              type="button"
              className="primary-button sheet-submit"
              onClick={() => setSelectedChemInfo(null)}
            >
              Done
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
