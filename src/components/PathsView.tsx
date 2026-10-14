import React, { useMemo, useState } from "react"
import type {
  AttachedDoc,
  Evidence,
  Goal,
  MetricDef,
  MetricLog,
  TaskTemplate,
  TrackEnrollment,
  TrackTemplate,
  ZenithState,
} from "../types"
import { ALL_TRACKS, getTrackById, NEUROCHEMICALS, type NeurochemicalInfo } from "../data/tracks"
import {
  advancePhase,
  checkPhaseUnlock,
  getTrackHabitChain,
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
  Map as MapIcon,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "./icons"
import { IconButton } from "./ui"
import DocumentSection from "./DocumentSection"
import { getTaskGuide } from "../data/tracks/taskInstructions"
import {
  AttentionResetWidget,
  SharperMindWidget,
  SkinAndHairWidget,
  TestosteroneWidget,
} from "./TrackWidgets"
import { ChemicalWheel } from "./Tracks"
import { progressFor } from "../lib/store"

interface PathsViewProps {
  state: ZenithState
  goals: Goal[]
  onOpenGoal: (goal: Goal) => void
  onAddGoal: () => void
  onEnrollTrack: (trackId: string, variant?: "male" | "strength-energy") => void
  onUnenrollTrack: (trackId: string) => void
  onToggleTrackTask: (taskId: string, trackId: string) => void
  onAdvancePhase: (trackId: string) => void
  onLogTrackMetric: (trackId: string, metricId: string, value: number | string) => void
  onRecordUrgeSurf: (trackId: string, durationSeconds: number) => void
  onSetIntention: (trackId: string, key: string, trigger: string, plan: string) => void
  onStartFocus?: (goalId: string, stepId?: string) => void
  onAddTrackDocument?: (trackId: string, doc: AttachedDoc) => void
  onRemoveTrackDocument?: (trackId: string, docId: string) => void
  initialTrackId?: string | null
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
// Enhanced Why & How-To Sheet
// ----------------------------------------------------------------------
function TaskDetailSheet({
  task,
  onClose,
}: {
  task: TaskTemplate
  onClose: () => void
}) {
  const guide = getTaskGuide(task.id, task.title, task.why)

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <section
        className="sheet why-sheet task-howto-sheet"
        role="dialog"
        aria-labelledby="howto-title"
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
            <span className="timing-pill">⏱️ {guide.timing}</span>
          </div>
          <h2 id="howto-title">{task.title}</h2>
        </div>

        <div className="why-content">
          {/* How to Execute (Step-by-Step) */}
          <div className="why-block howto-block">
            <h3>How to Do This Task (Step-by-Step Protocol)</h3>
            <div className="step-guide-list">
              {guide.steps.map((step, idx) => (
                <div key={idx} className="step-guide-item">
                  <span className="step-guide-num">{idx + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Biological Mechanism */}
          <div className="why-block">
            <h3>Biological Mechanism</h3>
            <p>{task.why}</p>
          </div>

          {/* Tips Grid */}
          <div className="tips-grid">
            <div className="tip-box protip">
              <span className="tip-label">💡 Pro-Tip</span>
              <p>{guide.proTip}</p>
            </div>
            <div className="tip-box pitfall">
              <span className="tip-label">⚠️ Common Pitfall</span>
              <p>{guide.commonPitfall}</p>
            </div>
          </div>

          {/* Peer-Reviewed Citation */}
          <div className="why-block">
            <h3>Academic Source & Citation</h3>
            <p className="source-citation">
              <strong>Ref:</strong> {task.source}
            </p>
          </div>
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
// Metric Logger Modal
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
        aria-labelledby="metric-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        <IconButton label="Close" onClick={onClose} className="sheet-close">
          <X size={19} />
        </IconButton>

        <h2 id="metric-modal-title">Log {metric.name}</h2>
        {metric.description && <p className="metric-desc">{metric.description}</p>}

        <div className="metric-form">
          {metric.type === "scale1-5" || metric.type === "scale1-10" ? (
            <div className="scale-selector">
              {Array.from(
                { length: metric.type === "scale1-5" ? 5 : 10 },
                (_, i) => i + 1,
              ).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`scale-btn ${val === String(n) ? "active" : ""}`}
                  onClick={() => setVal(String(n))}
                >
                  {n}
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
                placeholder={`Enter ${metric.unit}`}
                autoFocus
              />
              <span className="unit-label">{metric.unit}</span>
            </div>
          )}

          <button
            type="button"
            className="primary-button sheet-submit"
            disabled={!val}
            onClick={() => {
              if (val) {
                onSave(val)
                onClose()
              }
            }}
          >
            Save Metric Entry
          </button>
        </div>
      </section>
    </div>
  )
}

// ----------------------------------------------------------------------
// Main PathsView Component
// ----------------------------------------------------------------------
export default function PathsView({
  state,
  goals,
  onOpenGoal,
  onAddGoal,
  onEnrollTrack,
  onUnenrollTrack,
  onToggleTrackTask,
  onAdvancePhase,
  onLogTrackMetric,
  onRecordUrgeSurf,
  onSetIntention,
  onStartFocus,
  onAddTrackDocument,
  onRemoveTrackDocument,
  initialTrackId = null,
}: PathsViewProps) {
  const [sectionTab, setSectionTab] = useState<"tracks" | "custom">("tracks")
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(initialTrackId)
  const [activeTaskForHowTo, setActiveTaskForHowTo] = useState<TaskTemplate | null>(null)
  const [taskFilterWindow, setTaskFilterWindow] = useState<string>("all")
  const [activeMetricForLog, setActiveMetricForLog] = useState<{
    metric: MetricDef
    trackId: string
  } | null>(null)
  const [selectedChemInfo, setSelectedChemInfo] = useState<NeurochemicalInfo | null>(null)
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<"male" | "strength-energy">("male")

  const todayStr = todayDateStr()

  // Track Enrollment Map
  const enrollmentMap = useMemo(() => {
    const map = new globalThis.Map<string, TrackEnrollment>()
    ;(state.enrollments || []).forEach((e) => map.set(e.trackId, e))
    return map
  }, [state.enrollments])

  // Current Track when in Detail View
  const currentTrack = useMemo(() => {
    if (!selectedTrackId) return null
    return ALL_TRACKS.find((t) => t.id === selectedTrackId) || null
  }, [selectedTrackId])

  const currentEnrollment = useMemo(() => {
    if (!selectedTrackId) return undefined
    return enrollmentMap.get(selectedTrackId)
  }, [selectedTrackId, enrollmentMap])

  // Filter tasks for the selected track
  const trackTasks = useMemo(() => {
    if (!currentTrack) return []
    const phase = currentEnrollment?.phase || 1
    const available = currentTrack.tasks.filter((t) => t.phaseFrom <= phase)

    if (taskFilterWindow === "all") return available
    if (taskFilterWindow === "morning") return available.filter((t) => t.window === "wake" || t.window === "morning")
    if (taskFilterWindow === "day") return available.filter((t) => t.window === "day")
    if (taskFilterWindow === "evening") return available.filter((t) => t.window === "evening")
    if (taskFilterWindow === "bed") return available.filter((t) => t.window === "bed")
    if (taskFilterWindow === "weekly") return available.filter((t) => t.kind === "weekly" || t.kind === "once" || !t.window)
    return available
  }, [currentTrack, currentEnrollment, taskFilterWindow])

  // Count active tasks completed today in this track
  const completedTaskCount = useMemo(() => {
    if (!currentTrack || !currentEnrollment) return 0
    const todayDone = new Set(currentEnrollment.completions?.[todayStr] || [])
    return currentTrack.tasks.filter((t) => todayDone.has(t.id)).length
  }, [currentTrack, currentEnrollment, todayStr])

  // ====================================================================
  // VIEW 1: Dedicated Track Protocol View
  // ====================================================================
  if (currentTrack) {
    const isEnrolled = Boolean(currentEnrollment)
    const habitChain = currentEnrollment ? getTrackHabitChain(currentEnrollment) : { chain: 0, atRisk: false }
    const unlockInfo = currentEnrollment ? checkPhaseUnlock(currentEnrollment, currentTrack) : { canUnlock: false, adherence: 0, nextPhase: 2 }
    const currentPhaseObj = currentTrack.phases.find((p) => p.n === (currentEnrollment?.phase || 1))

    return (
      <main className="screen track-detail-screen">
        {/* Top Navigation */}
        <div className="track-screen-top-bar">
          <button
            type="button"
            className="ghost-button back-to-paths-btn"
            onClick={() => setSelectedTrackId(null)}
          >
            <ArrowLeft size={16} /> Back to Tracks
          </button>
          <span className="track-screen-category-badge">{currentTrack.category.toUpperCase()}</span>
        </div>

        {/* Track Hero Banner */}
        <div className="track-hero-banner">
          <div className="track-hero-main">
            <span className="eyebrow">12-Week Transformation Protocol</span>
            <h1>{currentTrack.title}</h1>
            <p className="track-tagline-text">{currentTrack.tagline}</p>
          </div>

          <div className="track-status-header-card">
            {isEnrolled ? (
              <div className="enrolled-status-box">
                <div className="status-badge-row">
                  <span className="active-protocol-badge">
                    <Sparkles size={13} /> Active Protocol · Phase {currentEnrollment!.phase}
                  </span>
                  <span className={`chain-badge ${habitChain.atRisk ? "at-risk" : ""}`}>
                    <Flame size={13} /> {habitChain.chain}-day chain
                  </span>
                </div>

                <div className="adherence-gauge-strip">
                  <div className="adherence-label-row">
                    <span>14-Day Adherence:</span>
                    <strong>{unlockInfo.adherence}%</strong>
                  </div>
                  <div className="adherence-bar-track">
                    <div
                      className="adherence-bar-progress"
                      style={{ width: `${Math.min(100, unlockInfo.adherence)}%` }}
                    />
                    <div className="adherence-goal-tick" style={{ left: "70%" }} title="70% Phase Unlock Threshold" />
                  </div>
                </div>

                {unlockInfo.canUnlock && currentEnrollment!.phase < 3 && (
                  <button
                    type="button"
                    className="unlock-phase-cta-btn"
                    onClick={() => onAdvancePhase(currentTrack.id)}
                  >
                    <Sparkles size={15} /> Unlock Phase {unlockInfo.nextPhase}
                  </button>
                )}
              </div>
            ) : (
              <div className="un-enrolled-action-box">
                {currentTrack.id === "track-testosterone-restore" && currentTrack.gate === "18+" && (
                  <label className="gate-check-label">
                    <input
                      type="checkbox"
                      checked={ageConfirmed}
                      onChange={(e) => setAgeConfirmed(e.target.checked)}
                    />
                    <span>I confirm I am 18 years of age or older.</span>
                  </label>
                )}
                <button
                  type="button"
                  className="primary-button enroll-cta-btn"
                  disabled={currentTrack.id === "track-testosterone-restore" && !ageConfirmed}
                  onClick={() => onEnrollTrack(currentTrack.id, selectedVariant)}
                >
                  <Sparkles size={16} /> Enroll in 12-Week Protocol
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bespoke Interactive Visual Widget for THIS Track */}
        <section className="track-widget-section">
          {currentTrack.id === "track-sharper-mind" && (
            <SharperMindWidget enrollment={currentEnrollment} state={state} />
          )}
          {currentTrack.id === "track-testosterone-restore" && (
            <TestosteroneWidget enrollment={currentEnrollment} />
          )}
          {currentTrack.id === "track-attention-reset" && (
            <AttentionResetWidget
              enrollment={currentEnrollment}
              onOpenUrgeSurf={() => onRecordUrgeSurf(currentTrack.id, 600)}
            />
          )}
          {currentTrack.id === "track-skin-and-hair" && (
            <SkinAndHairWidget enrollment={currentEnrollment} />
          )}
          {currentTrack.id === "track-neurochemical-balance" && (
            <ChemicalWheel
              state={state}
              onSelectChemical={(chem: NeurochemicalInfo) => setSelectedChemInfo(chem)}
            />
          )}
        </section>

        {/* Protocol Tasks for THIS Track (Grouped by Window) */}
        <section className="track-tasks-section">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Protocol Check-In</p>
              <h2>Today&apos;s Protocol Tasks</h2>
            </div>
            {isEnrolled && (
              <span className="tasks-completed-pill">
                {completedTaskCount} of {trackTasks.length} Done Today
              </span>
            )}
          </div>

          {/* Time Window Tabs */}
          <div className="window-filter-tabs">
            {[
              { id: "all", label: "All Tasks" },
              { id: "morning", label: "🌅 Morning" },
              { id: "day", label: "☀️ Daytime" },
              { id: "evening", label: "🌆 Evening" },
              { id: "bed", label: "🌙 Bedtime" },
              { id: "weekly", label: "⚡ Weekly" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={taskFilterWindow === tab.id ? "active" : ""}
                onClick={() => setTaskFilterWindow(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Task List (Clean, Independent, Pure to this track) */}
          <div className="track-task-list">
            {trackTasks.map((task) => {
              const isDone = Boolean(
                currentEnrollment?.completions?.[todayStr]?.includes(task.id),
              )

              return (
                <article
                  key={task.id}
                  className={`track-task-card ${isDone ? "is-complete" : ""}`}
                >
                  <button
                    type="button"
                    className={`task-check-circle ${isDone ? "checked" : ""}`}
                    aria-label={`Toggle ${task.title}`}
                    onClick={() => {
                      if (!isEnrolled) {
                        onEnrollTrack(currentTrack.id, selectedVariant)
                      }
                      onToggleTrackTask(task.id, currentTrack.id)
                    }}
                  >
                    {isDone && <Check size={16} />}
                  </button>

                  <div className="task-body">
                    <div className="task-meta-line">
                      <EvidenceBadge evidence={task.evidence} />
                      {task.window && <span className="window-pill">{task.window}</span>}
                      {task.minutes && <span className="duration-pill">{task.minutes} min</span>}
                      {task.weeklyTarget && <span className="target-pill">{task.weeklyTarget}x/week</span>}
                    </div>

                    <strong className="task-title-text">{task.title}</strong>
                    <p className="task-why-text">{task.why}</p>

                    <div className="task-actions-row">
                      {task.kind === "timer" && onStartFocus && (
                        <button
                          type="button"
                          className="task-timer-btn"
                          onClick={() => onStartFocus("track", undefined)}
                        >
                          <Play size={14} /> Begin {task.minutes || 25}m Focus
                        </button>
                      )}
                      <button
                        type="button"
                        className="task-howto-btn"
                        onClick={() => setActiveTaskForHowTo(task)}
                      >
                        <Info size={14} /> How to do this
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* Track Documents & Lab Results */}
        <section className="track-docs-section">
          <DocumentSection
            title="Track Lab Results & Attached Documents"
            description="Attach blood work, hormone panels, habit notes, or scientific guides for this track."
            documents={currentEnrollment?.documents || []}
            onAddDocument={(doc) => {
              if (onAddTrackDocument) onAddTrackDocument(currentTrack.id, doc)
            }}
            onRemoveDocument={(docId) => {
              if (onRemoveTrackDocument) onRemoveTrackDocument(currentTrack.id, docId)
            }}
          />
        </section>

        {/* Track Biomarkers & Metrics */}
        {currentTrack.metrics && currentTrack.metrics.length > 0 && (
          <section className="track-metrics-section">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Biomarker Tracking</p>
                <h2>Track Metrics & Logs</h2>
              </div>
            </div>

            <div className="track-metrics-grid">
              {currentTrack.metrics.map((m) => {
                const logs = currentEnrollment?.metrics?.filter((log: MetricLog) => log.metricId === m.id) || []
                const lastLog = logs[logs.length - 1]

                return (
                  <article key={m.id} className="track-metric-card">
                    <div className="metric-card-top">
                      <strong>{m.name}</strong>
                      <span className="metric-freq-tag">{m.frequency}</span>
                    </div>
                    {m.description && <p>{m.description}</p>}
                    <div className="metric-last-value">
                      <span>Latest:</span>
                      <strong>
                        {lastLog ? `${lastLog.value} ${m.unit}` : "Not logged yet"}
                      </strong>
                    </div>
                    <button
                      type="button"
                      className="log-metric-btn"
                      onClick={() => setActiveMetricForLog({ metric: m, trackId: currentTrack.id })}
                    >
                      <Plus size={14} /> Log Entry
                    </button>
                  </article>
                )
              })}
            </div>
          </section>
        )}

        {/* Unenroll Option if Enrolled */}
        {isEnrolled && (
          <div className="track-danger-zone">
            <button
              type="button"
              className="danger-link"
              onClick={() => {
                if (window.confirm(`Unenroll from "${currentTrack.title}"? Your completion history will be removed.`)) {
                  onUnenrollTrack(currentTrack.id)
                  setSelectedTrackId(null)
                }
              }}
            >
              Unenroll from Track
            </button>
          </div>
        )}

        {/* Modals */}
        {activeTaskForHowTo && (
          <TaskDetailSheet
            task={activeTaskForHowTo}
            onClose={() => setActiveTaskForHowTo(null)}
          />
        )}

        {activeMetricForLog && (
          <MetricLogModal
            metric={activeMetricForLog.metric}
            trackId={activeMetricForLog.trackId}
            onSave={(val) => onLogTrackMetric(activeMetricForLog.trackId, activeMetricForLog.metric.id, val)}
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
      </main>
    )
  }

  // ====================================================================
  // VIEW 2: Paths & Protocols Overview Screen
  // ====================================================================
  return (
    <main className="screen paths-screen">
      <div className="page-title">
        <p className="eyebrow">Your Long View</p>
        <h1>Paths & Protocols</h1>
        <p>12-week transformation tracks and personal milestone trajectories.</p>
      </div>

      {/* Segmented Section Switcher */}
      <div className="paths-segment-switcher">
        <button
          type="button"
          className={sectionTab === "tracks" ? "active" : ""}
          onClick={() => setSectionTab("tracks")}
        >
          <Sparkles size={16} /> 5 Transformation Tracks
        </button>
        <button
          type="button"
          className={sectionTab === "custom" ? "active" : ""}
          onClick={() => setSectionTab("custom")}
        >
          <MapIcon size={16} /> Custom Paths ({goals.length})
        </button>
      </div>

      {/* TAB A: 5 Transformation Tracks List */}
      {sectionTab === "tracks" && (
        <div className="tracks-overview-container">
          <div className="tracks-cards-grid">
            {ALL_TRACKS.map((track) => {
              const enrollment = enrollmentMap.get(track.id)
              const isEnrolled = Boolean(enrollment)
              const currentPhase = enrollment?.phase || 1
              const unlockInfo = enrollment ? checkPhaseUnlock(enrollment, track) : { adherence: 0 }

              return (
                <div
                  key={track.id}
                  className={`track-overview-card ${isEnrolled ? "enrolled" : ""}`}
                  onClick={() => setSelectedTrackId(track.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="track-card-top">
                    <span className="track-category-pill">{track.category.toUpperCase()}</span>
                    {isEnrolled ? (
                      <span className="active-badge">
                        <Sparkles size={12} /> Phase {currentPhase} Active
                      </span>
                    ) : (
                      <span className="duration-tag">12 Weeks</span>
                    )}
                  </div>

                  <h3>{track.title}</h3>
                  <p className="track-card-tagline">{track.tagline}</p>

                  {isEnrolled && (
                    <div className="track-card-adherence">
                      <div className="adherence-label-row">
                        <small>14-Day Adherence</small>
                        <strong>{unlockInfo.adherence}%</strong>
                      </div>
                      <div className="mini-progress-track">
                        <i style={{ width: `${Math.min(100, unlockInfo.adherence)}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="track-card-footer">
                    <span>{track.tasks.length} Evidence Protocols</span>
                    <button type="button" className="explore-track-btn">
                      {isEnrolled ? "View Protocol" : "Explore Track"} <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB B: Custom Paths List */}
      {sectionTab === "custom" && (
        <div className="custom-paths-container">
          {goals.length === 0 ? (
            <div className="empty-paths-card">
              <MapIcon size={36} className="empty-icon" />
              <h3>No Custom Paths Yet</h3>
              <p>Define a personal ambition and break it down into focused daily milestones.</p>
              <button type="button" className="primary-button" onClick={onAddGoal}>
                <Plus size={18} /> Set a New Direction
              </button>
            </div>
          ) : (
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

              <button type="button" className="new-path-button" onClick={onAddGoal}>
                <Plus size={20} />
                <span>
                  <strong>Set a new direction</strong>
                  <small>Turn an ambition into a path</small>
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
