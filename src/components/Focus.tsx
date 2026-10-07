import { useEffect, useState } from "react"
import type React from "react"
import {
  Check,
  Pause,
  Play,
  RotateCcw,
} from "./icons"
import { IconButton } from "./ui"
import type { ZenithState } from "../types"

export default function Focus({
  state,
  selection,
  onSelect,
  onComplete,
}: {
  state: ZenithState
  selection: { goalId: string; stepId?: string } | null
  onSelect: (goalId: string, stepId?: string) => void
  onComplete: (elapsed: number) => void
}) {
  const selectedGoal =
    state.goals.find((goal) => goal.id === selection?.goalId) || state.goals[0]
  const selectedStep =
    selectedGoal?.steps.find((step) => step.id === selection?.stepId) ||
    selectedGoal?.steps.find((step) => !step.completed)
  // A custom length overrides the step's own estimate until the step changes.
  const [customMinutes, setCustomMinutes] = useState<number | null>(null)
  const targetSeconds = (customMinutes || selectedStep?.minutes || 25) * 60
  const [remaining, setRemaining] = useState(targetSeconds)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    setCustomMinutes(null)
  }, [selectedStep?.id])

  useEffect(() => {
    setRemaining(targetSeconds)
    setRunning(false)
  }, [targetSeconds, selectedStep?.id])

  const activeMinutes = targetSeconds / 60
  const setLength = (value: number) =>
    setCustomMinutes(Math.min(180, Math.max(1, Math.round(value))))

  useEffect(() => {
    if (!running) return
    const deadline = Date.now() + remaining * 1000
    const timer = window.setInterval(() => {
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setRemaining(next)
      if (next === 0) {
        setRunning(false)
        onComplete(targetSeconds)
      }
    }, 250)
    return () => window.clearInterval(timer)
  }, [running])

  const elapsed = targetSeconds - remaining
  const timerProgress = Math.max(0, elapsed / targetSeconds)
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60

  return (
    <main className="screen focus-screen">
      <div className="focus-heading">
        <p className="eyebrow">Focus capsule</p>
        <h1>Stay with one thing.</h1>
      </div>
      <div
        className={`timer-shell ${running ? "timer-running" : ""}`}
        style={{ "--timer-progress": timerProgress } as React.CSSProperties}
      >
        <div className="timer-ring">
          <div className="timer-face">
            <span>{running ? "IN FOCUS" : "READY"}</span>
            <strong>
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </strong>
            <small>{selectedGoal?.title}</small>
          </div>
        </div>
        <span className="timer-orbit-dot" />
      </div>
      {!running && elapsed === 0 && (
        <div className="timer-length" role="group" aria-label="Session length">
          {[15, 25, 45, 60, 90].map((value) => (
            <button
              type="button"
              key={value}
              className={activeMinutes === value ? "active" : ""}
              onClick={() => setLength(value)}
            >
              {value}
            </button>
          ))}
          <label className="timer-custom">
            <button type="button" aria-label="One minute less" onClick={() => setLength(activeMinutes - 1)}>
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={180}
              value={activeMinutes}
              aria-label="Custom minutes"
              onChange={(event) => {
                const value = Number(event.target.value)
                if (value > 0) setLength(value)
              }}
            />
            <span>min</span>
            <button type="button" aria-label="One minute more" onClick={() => setLength(activeMinutes + 1)}>
              +
            </button>
          </label>
        </div>
      )}
      <div className="focus-task">
        <span>NOW FOCUSING ON</span>
        <strong>{selectedStep?.title || "Choose a next move"}</strong>
      </div>
      <div className="timer-controls">
        <IconButton
          label="Restart timer"
          onClick={() => {
            setRunning(false)
            setRemaining(targetSeconds)
          }}
        >
          <RotateCcw size={19} />
        </IconButton>
        <button
          type="button"
          className="timer-toggle"
          onClick={() => setRunning((value) => !value)}
        >
          {running ? (
            <Pause size={25} />
          ) : (
            <Play size={25} />
          )}
          <span>{running ? "Pause" : "Begin"}</span>
        </button>
        <IconButton
          label="Complete session"
          onClick={() => onComplete(Math.max(elapsed, 60))}
        >
          <Check size={20} />
        </IconButton>
      </div>
      <div className="focus-picker">
        <span>Up next</span>
        {state.goals
          .flatMap((goal) =>
            goal.steps
              .filter((step) => !step.completed)
              .map((step) => ({ goal, step })),
          )
          .slice(0, 3)
          .map(({ goal, step }) => (
            <button
              type="button"
              key={step.id}
              onClick={() => onSelect(goal.id, step.id)}
              className={step.id === selectedStep?.id ? "is-selected" : ""}
            >
              <span>{step.title}</span>
              <small>{step.minutes} min</small>
            </button>
          ))}
      </div>
    </main>
  )
}
