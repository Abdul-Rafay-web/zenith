import {
  ArrowRight,
  BarChart3,
} from "./icons"
import { progressFor } from "../lib/store"
import type { ZenithState } from "../types"

export default function Review({ state }: { state: ZenithState }) {
  const completed = state.goals.reduce(
    (sum, goal) => sum + goal.steps.filter((step) => step.completed).length,
    0,
  )
  return (
    <main className="screen review-screen">
      <div className="page-title">
        <p className="eyebrow">Weekly reflection</p>
        <h1>Notice the movement.</h1>
        <p>Progress becomes useful when you pause long enough to see it.</p>
      </div>
      <section className="review-hero">
        <div className="review-number">
          <span>THIS WEEK</span>
          <strong>{completed}</strong>
          <small>meaningful moves</small>
        </div>
        <div className="review-stat">
          <BarChart3 size={21} />
          <span>
            <strong>Steady pace</strong>
            <small>Your plan still fits your capacity.</small>
          </span>
        </div>
      </section>
      <section className="reflection-card">
        <p className="eyebrow">A quiet question</p>
        <h2>What made progress feel easier this week?</h2>
        <textarea
          aria-label="Weekly reflection"
          placeholder="A protected morning, a smaller first step..."
        />
        <button type="button" className="primary-button">
          Save reflection <ArrowRight size={17} />
        </button>
      </section>
      <section className="review-list">
        <h2>Path health</h2>
        {state.goals.map((goal) => (
          <div key={goal.id}>
            <span className={`tiny-dot accent-${goal.accent}`} />
            <strong>{goal.title}</strong>
            <small>
              {progressFor(goal) > 20 ? "On track" : "Building pace"}
            </small>
          </div>
        ))}
      </section>
    </main>
  )
}
