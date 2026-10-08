import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  BrainCircuit,
  Flame,
  Info,
  Pause,
  Play,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "./icons"
import {
  practiceChain,
  weakestSubskill,
  type PracticeInput,
  type PracticeResult,
} from "../lib/store"
import type { Skill, ZenithState } from "../types"

export interface SkillDraft {
  title: string
  purpose: string
  identity: string
  intention: string
  reminderTime: string
  subskills: string[]
}

type Phase = "predict" | "practice" | "rate" | "reward"

const PROMPTS = [
  "From memory, explain {sub} as if teaching a beginner. Stop at the first gap.",
  "Produce one real example of {sub} without notes, then compare against a reference.",
  "Do the hardest version of {sub} you can barely manage. Note exactly where it breaks.",
  "Mix {sub} with an earlier component. Switching is supposed to feel harder.",
  "Recreate {sub} under a time limit, then fix the single biggest error.",
]

const REWARD_LINES = [
  "That struggle was the learning — effortful recall builds stronger memory.",
  "Another rep laid down. Skill is built in reps like this one.",
  "You showed up. Identity is built one vote at a time.",
  "Error found and fixed — that is what deliberate practice looks like.",
]

const LEVELS = ["Novice", "Apprentice", "Practitioner", "Expert", "Master"]

const PRINCIPLES: [string, string, string][] = [
  ["Retrieval", "Testing effect", "Recall before reviewing. Pulling from memory strengthens it far more than rereading does."],
  ["Spacing", "Forgetting curve", "Reviews land right as memory starts to fade: 1 → 3 → 7 → 14 → 30 → 60 → 120 days."],
  ["Prediction", "Reward prediction error", "You guess your score first. A gap between guess and result is a strong learning and dopamine signal."],
  ["Variable reward", "Novelty", "About one rep in four gives a surprise bonus, so the reward stays motivating instead of becoming routine."],
  ["Interleaving", "Discrimination", "Each rep targets your weakest component instead of whatever feels comfortable."],
  ["Identity", "Self-concept", "Each session counts as evidence for who you said you're becoming."],
  ["Intentions", "If–then plans", "\"When X, I will Y\" plans roughly double follow-through in studies."],
  ["Never miss twice", "Self-compassion", "One missed day never breaks your chain. Shame makes people quit; grace keeps them going."],
]

function fillPrompt(index: number, sub: string) {
  return PROMPTS[index % PROMPTS.length].replace("{sub}", sub)
}

function SkillWizard({
  onCancel,
  onCreate,
}: {
  onCancel: () => void
  onCreate: (draft: SkillDraft) => void
}) {
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState("")
  const [purpose, setPurpose] = useState("")
  const [identity, setIdentity] = useState("")
  const [cue, setCue] = useState("After my morning coffee")
  const [place, setPlace] = useState("at my desk")
  const [time, setTime] = useState("08:00")
  const [subs, setSubs] = useState(["Fundamentals", "Core technique", "Applied practice"])
  const [newSub, setNewSub] = useState("")
  const canNext = step === 0 ? title.trim().length > 0 : step === 2 ? subs.length > 0 : true

  function finish() {
    onCreate({
      title: title.trim(),
      purpose: purpose.trim(),
      identity: identity.trim() || `someone who practices ${title.trim()}`,
      intention: `${cue.trim()}, I will practice ${title.trim()} ${place.trim()}.`,
      reminderTime: time,
      subskills: subs,
    })
  }

  return (
    <section className="skill-wizard" aria-label="Learn a new skill">
      <header>
        <div className="wizard-dots">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} className={i <= step ? "on" : ""} />
          ))}
        </div>
        <button type="button" className="wizard-close" onClick={onCancel} aria-label="Cancel">
          <X size={16} />
        </button>
      </header>

      {step === 0 && (
        <div className="wizard-body">
          <p className="eyebrow">01 · Choose one craft</p>
          <h3>What will you master?</h3>
          <p className="wizard-hint">One skill at a time. Focusing on a single skill is the first rule of mastery.</p>
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Guitar, Spanish, system design…" />
          <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Why it matters to you" />
        </div>
      )}
      {step === 1 && (
        <div className="wizard-body">
          <p className="eyebrow">02 · Identity</p>
          <h3>Who are you becoming?</h3>
          <p className="wizard-hint">Every session counts as evidence for this identity.</p>
          <div className="identity-input">
            <span>I am becoming</span>
            <input autoFocus value={identity} onChange={(e) => setIdentity(e.target.value)} placeholder={`a ${title || "skilled"} practitioner`} />
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="wizard-body">
          <p className="eyebrow">03 · Deconstruct</p>
          <h3>Break it into components.</h3>
          <p className="wizard-hint">Experts practice parts, not the whole. Zenith targets your weakest part each time.</p>
          <div className="sub-chips">
            {subs.map((sub) => (
              <button type="button" key={sub} onClick={() => setSubs(subs.filter((s) => s !== sub))}>
                {sub} <X size={11} />
              </button>
            ))}
          </div>
          <form
            className="sub-add"
            onSubmit={(e) => {
              e.preventDefault()
              const value = newSub.trim()
              if (value && subs.length < 8 && !subs.includes(value)) setSubs([...subs, value])
              setNewSub("")
            }}
          >
            <input value={newSub} onChange={(e) => setNewSub(e.target.value)} placeholder="Add a component (max 8)" />
            <button type="submit" aria-label="Add component"><Plus size={15} /></button>
          </form>
        </div>
      )}
      {step === 3 && (
        <div className="wizard-body">
          <p className="eyebrow">04 · Implementation intention</p>
          <h3>Anchor it to your day.</h3>
          <div className="intention-line">
            <input value={cue} onChange={(e) => setCue(e.target.value)} />
            <span>, I will practice {title || "this"}</span>
            <input value={place} onChange={(e) => setPlace(e.target.value)} />
          </div>
          <label className="time-line">
            Usually around
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
          <p className="wizard-hint">If–then plans like this help people turn intent into action. Turn on reminders in Settings to get nudged at this time.</p>
        </div>
      )}

      <footer>
        {step > 0 && (
          <button type="button" className="ghost-button" onClick={() => setStep(step - 1)}>Back</button>
        )}
        <button
          type="button"
          className="primary-button"
          disabled={!canNext}
          onClick={() => (step === 3 ? finish() : setStep(step + 1))}
        >
          {step === 3 ? "Begin mastery path" : "Continue"} <ArrowRight size={15} />
        </button>
      </footer>
    </section>
  )
}

function PracticeStage({
  skill,
  due,
  onPractice,
}: {
  skill: Skill
  due: boolean
  onPractice: (quality: number, input: PracticeInput) => PracticeResult | undefined
}) {
  const target = weakestSubskill(skill)
  const subName = target?.title || skill.title
  const [phase, setPhase] = useState<Phase>("predict")
  const [prediction, setPrediction] = useState<number>()
  const [minutes, setMinutes] = useState(10)
  const [left, setLeft] = useState(0)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<PracticeResult>()
  const promptIndex = (skill.log?.length || 0) + (target?.reps || 0)
  const chain = practiceChain(skill)
  const xp = skill.xp || 0
  const levelProgress = ((xp % 400) / 400) * 100

  useEffect(() => {
    setPhase("predict")
    setPrediction(undefined)
    setResult(undefined)
    setRunning(false)
  }, [skill.id])

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setLeft((current) => {
        if (current <= 1) {
          setRunning(false)
          setPhase("rate")
          navigator.vibrate?.(120)
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  function rate(quality: number) {
    const elapsedMinutes = Math.max(1, Math.round((minutes * 60 - left) / 60))
    const outcome = onPractice(quality, {
      subskillId: target?.id,
      prediction,
      minutes: elapsedMinutes,
    })
    setResult(outcome)
    setPhase("reward")
    navigator.vibrate?.(outcome?.bonus ? [40, 60, 40] : 40)
  }

  const mm = String(Math.floor(left / 60)).padStart(2, "0")
  const ss = String(left % 60).padStart(2, "0")

  return (
    <section className="practice-stage">
      <div className="practice-main">
        <div className="practice-meta">
          <span>{due ? "DUE FOR REVIEW" : "NEXT PRACTICE"} · {subName.toUpperCase()}</span>
          <span className={`chain ${chain.atRisk ? "risk" : ""}`}>
            <Flame size={11} /> {chain.chain} DAY CHAIN
          </span>
        </div>
        <h2>{skill.title}</h2>
        {skill.identity && <p>Becoming {skill.identity}.</p>}

        {phase === "predict" && (
          <div className="phase">
            <div className="practice-prompt">
              <span>Step 1 · Predict</span>
              <strong>Before you start, how well do you expect to recall “{subName}”?</strong>
            </div>
            <div className="quality-check">
              <div>
                {[1, 2, 3, 4, 5].map((q) => (
                  <button type="button" key={q} className={prediction === q ? "picked" : ""} onClick={() => setPrediction(q)}>
                    {q}
                  </button>
                ))}
              </div>
              <small>Shaky ← your guess → fluent</small>
            </div>
            <div className="dose-row">
              <span>Dose</span>
              {[2, 10, 25].map((m) => (
                <button type="button" key={m} className={minutes === m ? "picked" : ""} onClick={() => setMinutes(m)}>
                  {m === 2 ? "2 min · bad day" : `${m} min`}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="stage-cta"
              disabled={!prediction}
              onClick={() => {
                setLeft(minutes * 60)
                setRunning(true)
                setPhase("practice")
              }}
            >
              Start rep <Play size={14} />
            </button>
          </div>
        )}

        {phase === "practice" && (
          <div className="phase">
            <div className="practice-prompt">
              <span>Step 2 · Retrieve without notes</span>
              <strong>{fillPrompt(promptIndex, subName)}</strong>
            </div>
            <div className="stage-timer">{mm}:{ss}</div>
            <div className="stage-actions">
              <button type="button" onClick={() => setRunning(!running)}>
                {running ? <Pause size={14} /> : <Play size={14} />} {running ? "Pause" : "Resume"}
              </button>
              <button type="button" onClick={() => { setRunning(false); setPhase("rate") }}>
                Finish early
              </button>
            </div>
          </div>
        )}

        {phase === "rate" && (
          <div className="phase">
            <div className="quality-check">
              <span>Step 3 · How did recall actually go?</span>
              <div>
                {[1, 2, 3, 4, 5].map((q) => (
                  <button type="button" key={q} onClick={() => rate(q)} aria-label={`Rate recall ${q} out of 5`}>
                    {q}
                  </button>
                ))}
              </div>
              <small>Failed ← honest self-rating → effortless</small>
            </div>
          </div>
        )}

        {phase === "reward" && result && (
          <div className="phase reward">
            <div className={`xp-burst ${result.bonus ? "bonus" : ""}`}>
              <Sparkles size={18} />
              <strong>+{result.xp} XP</strong>
              {result.bonus && <em>Surprise bonus +25</em>}
            </div>
            {result.levelUp && (
              <p className="level-up">Level up — you are now {LEVELS[result.skill.currentLevel - 1]}.</p>
            )}
            <p className="reward-line">
              {result.predictionError === undefined
                ? REWARD_LINES[promptIndex % REWARD_LINES.length]
                : result.predictionError > 0
                  ? "You beat your own prediction. Your skill is ahead of your self-image."
                  : result.predictionError < 0
                    ? "Harder than expected — good. You just found the next thing to work on."
                    : "Perfectly calibrated (+10). Knowing what you know is a mastery skill."}
            </p>
            <p className="reward-next">
              Next review · {new Date(result.skill.nextReviewAt).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}
            </p>
            <button type="button" className="stage-cta" onClick={() => { setPhase("predict"); setPrediction(undefined) }}>
              Another rep <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
      <aside className="mastery-meter">
        <span>{LEVELS[skill.currentLevel - 1].toUpperCase()}</span>
        <strong>{xp}</strong>
        <small className="xp-label">XP</small>
        <div>
          <i style={{ height: `${skill.currentLevel >= 5 ? 100 : levelProgress}%` }} />
        </div>
        <small>Level {skill.currentLevel} of 5</small>
      </aside>
    </section>
  )
}

export default function Learn({
  state,
  onAddSkill,
  onAddSubskill,
  onAddLink,
  onPractice,
  onDelete,
}: {
  state: ZenithState
  onAddSkill: (draft: SkillDraft) => void
  onAddSubskill: (skillId: string, title: string) => void
  onAddLink: (skillId: string, url: string) => void
  onPractice: (skillId: string, quality: number, input: PracticeInput) => PracticeResult | undefined
  onDelete: (skillId: string) => void
}) {
  const [adding, setAdding] = useState(false)
  const [showScience, setShowScience] = useState(false)
  const [newSubskill, setNewSubskill] = useState("")
  const [newLink, setNewLink] = useState("")
  const [selectedId, setSelectedId] = useState<string>()
  const due = useMemo(
    () => state.skills.filter((s) => new Date(s.nextReviewAt).getTime() <= Date.now()),
    [state.skills],
  )
  const featured =
    state.skills.find((s) => s.id === selectedId) || due[0] || state.skills[0]

  return (
    <main className="screen learn-screen">
      <div className="page-title learn-title">
        <div>
          <p className="eyebrow">Learn a skill · deliberate practice</p>
          <h1>Learn what lasts.</h1>
          <p>
            Predict, retrieve, rate, return. Each step is grounded in learning
            research and tuned to keep you practicing.
          </p>
        </div>
        <button type="button" className="mini-add-button" onClick={() => setAdding(true)}>
          <Plus size={15} /> Learn a skill
        </button>
      </div>

      {adding && (
        <SkillWizard
          onCancel={() => setAdding(false)}
          onCreate={(draft) => {
            onAddSkill(draft)
            setAdding(false)
          }}
        />
      )}

      {featured ? (
        <>
          {featured.intention && <p className="intention-banner">{featured.intention}</p>}
          <PracticeStage
            skill={featured}
            due={due.includes(featured)}
            onPractice={(q, input) => onPractice(featured.id, q, input)}
          />
          
          <div className="skill-links">
            <h3>Resources & Documents</h3>
            {featured.links && featured.links.length > 0 && (
              <ul className="link-list">
                {featured.links.map((link, i) => (
                  <li key={i}>
                    <a href={link} target="_blank" rel="noreferrer">{link}</a>
                  </li>
                ))}
              </ul>
            )}
            <form
              className="link-add"
              onSubmit={(e) => {
                e.preventDefault()
                if (newLink.trim()) {
                  onAddLink(featured.id, newLink.trim())
                  setNewLink("")
                }
              }}
            >
              <input 
                type="url" 
                placeholder="Paste a link to a PDF, Google Doc, etc." 
                value={newLink} 
                onChange={(e) => setNewLink(e.target.value)} 
              />
              <button type="submit"><Plus size={14}/></button>
            </form>
          </div>
        </>
      ) : (
        !adding && (
          <section className="empty-skill">
            <BrainCircuit size={30} />
            <h2>Choose your first craft.</h2>
            <p>Define one skill and Zenith will shape its practice rhythm.</p>
          </section>
        )
      )}

      {state.skills.length > 0 && (
        <section className="skill-library">
          <h2>Your skills</h2>
          {state.skills.map((skill) => (
            <article key={skill.id} className={skill.id === featured?.id ? "selected" : ""}>
              <span className="skill-level">L{skill.currentLevel}</span>
              <button type="button" className="skill-pick" onClick={() => setSelectedId(skill.id)}>
                <strong>{skill.title}</strong>
                <small>
                  {skill.totalMinutes} min · {practiceChain(skill).chain}-day chain
                </small>
                {skill.subskills && skill.subskills.length > 0 && (
                  <span className="sub-bars">
                    {skill.subskills.map((sub) => (
                      <i key={sub.id} title={`${sub.title} · ${sub.strength}%`}>
                        <b style={{ width: `${Math.max(4, sub.strength)}%` }} />
                      </i>
                    ))}
                  </span>
                )}
              </button>
              <span className="skill-confidence">{skill.confidence}%</span>
              <button
                type="button"
                className="skill-delete"
                aria-label={`Delete ${skill.title}`}
                onClick={() => {
                  if (window.confirm(`Delete "${skill.title}" and its history?`)) onDelete(skill.id)
                }}
              >
                <Trash2 size={13} />
              </button>
              {skill.id === featured?.id && (
                <form
                  className="sub-add"
                  style={{ marginTop: "10px", display: "flex", gap: "8px" }}
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (newSubskill.trim()) {
                      onAddSubskill(skill.id, newSubskill.trim())
                      setNewSubskill("")
                    }
                  }}
                >
                  <input
                    value={newSubskill}
                    onChange={(e) => setNewSubskill(e.target.value)}
                    placeholder="Add new subskill component"
                    style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "none", color: "white" }}
                  />
                  <button type="submit" className="primary-button" style={{ padding: "8px 12px", borderRadius: "8px" }}>
                    <Plus size={14} />
                  </button>
                </form>
              )}
            </article>
          ))}
        </section>
      )}

      <section className="learning-loop">
        <div className="section-heading" style={{ cursor: "pointer" }} onClick={() => setShowScience(!showScience)}>
          <div>
            <p className="eyebrow">The science behind each rep</p>
            <h2>Built for your brain, not against it</h2>
          </div>
          <button type="button" className="ghost-button">
            <Info size={16} /> {showScience ? "Hide" : "Learn more"}
          </button>
        </div>
        {showScience && (
          <div className="loop-grid principles">
            {PRINCIPLES.map(([label, tag, copy], i) => (
              <article key={label}>
                <span>{String(i + 1).padStart(2, "0")} · {tag}</span>
                <strong>{label}</strong>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
