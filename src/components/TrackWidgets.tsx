import React, { useMemo, useState } from "react"
import type { TrackEnrollment, ZenithState } from "../types"
import { BrainCircuit, Check, Flame, Info, Sparkles, Zap } from "./icons"
import { todayDateStr } from "../lib/tracks"

// ======================================================================
// 1. Sharper Mind: Interactive Synaptic Architecture & Plasticity Core
// ======================================================================
interface HubInfo {
  id: string
  name: string
  region: string
  color: string
  score: number
  description: string
  protocolLever: string
  x: number
  y: number
}

export function SharperMindWidget({
  enrollment,
  state,
}: {
  enrollment?: TrackEnrollment
  state: ZenithState
}) {
  const [selectedHubId, setSelectedHubId] = useState<string>("prefrontal")

  const todayStr = todayDateStr()
  const todayDone = useMemo(
    () => new Set(enrollment?.completions?.[todayStr] || []),
    [enrollment, todayStr],
  )

  // Compute live scores based on completions
  const hubs: HubInfo[] = useMemo(() => {
    const sleepDone = todayDone.has("foundation-sleep")
    const learnDone = todayDone.has("mind-deep-learning")
    const recallDone = todayDone.has("mind-retrieval") || todayDone.has("mind-teach-back")
    const cardioDone = todayDone.has("foundation-move") || todayDone.has("mind-hiit-bdnf")
    const lightDone = todayDone.has("foundation-light")

    return [
      {
        id: "prefrontal",
        name: "Prefrontal Executive",
        region: "Dorsolateral Prefrontal Cortex",
        color: "#60a5fa",
        score: learnDone ? 95 : 45,
        description: "Governs working memory holding, high-order schema synthesis, and selective attentional filtering.",
        protocolLever: "25–90 min Deep Learning Block + Focused-Attention Meditation",
        x: 150,
        y: 50,
      },
      {
        id: "hippocampal",
        name: "Hippocampal Encoding",
        region: "Dentate Gyrus & CA3",
        color: "#34d399",
        score: cardioDone || recallDone ? 90 : 40,
        description: "Drives adult neurogenesis and synaptic long-term potentiation (LTP) for rapid declarative memory consolidation.",
        protocolLever: "Zone-2 Aerobic Cardio & Active Recall Practice",
        x: 235,
        y: 115,
      },
      {
        id: "adenosine",
        name: "Adenosine Clearance",
        region: "Basal Forebrain & Glymphatics",
        color: "#c084fc",
        score: sleepDone ? 95 : 35,
        description: "Slow-wave delta sleep drains neurotoxic metabolites and clears accumulated adenosine sleep pressure.",
        protocolLever: "7–9h Sleep Window & 90-min Caffeine Delay",
        x: 205,
        y: 205,
      },
      {
        id: "plasticity",
        name: "Synaptic Dendritic Density",
        region: "Cerebral Cortex Network",
        color: "#fbbf24",
        score: todayDone.size >= 3 ? 88 : 50,
        description: "Promotes dendritic spine arborization and structural cortical rewiring in response to cognitive novelty.",
        protocolLever: "Dual N-Back Training & Weekly Novelty Exploration",
        x: 95,
        y: 205,
      },
      {
        id: "gating",
        name: "Attentional Beam Gating",
        region: "Anterior Cingulate Cortex",
        color: "#f87171",
        score: lightDone ? 85 : 45,
        description: "Suppresses sensory distractions and detects cognitive errors before they derail working memory.",
        protocolLever: "Morning Sunlight Melanopsin Pulse & Monotasking",
        x: 65,
        y: 115,
      },
    ]
  }, [todayDone])

  const selectedHub = hubs.find((h) => h.id === selectedHubId) || hubs[0]
  const avgSynapticScore = Math.round(
    hubs.reduce((acc, h) => acc + h.score, 0) / hubs.length,
  )

  return (
    <div className="track-widget-card synaptic-core-widget">
      <div className="widget-header">
        <div>
          <span className="widget-tag">COGNITIVE ARCHITECTURE</span>
          <h3>Synaptic Plasticity Core</h3>
        </div>
        <div className="widget-score-pill">
          <BrainCircuit size={15} style={{ color: "#60a5fa" }} />
          <strong>{avgSynapticScore}%</strong>
          <small>Network Activation</small>
        </div>
      </div>

      <div className="synaptic-display-layout">
        {/* Interactive SVG Constellation */}
        <div className="synaptic-svg-wrapper">
          <svg viewBox="0 0 300 260" className="synaptic-svg">
            <defs>
              <linearGradient id="coreGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Background pulsating core */}
            <circle cx="150" cy="140" r="42" fill="url(#coreGlow)" />
            <circle cx="150" cy="140" r="65" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" fill="none" />

            {/* Connecting Synaptic Arcs */}
            {hubs.map((h1, i) =>
              hubs.slice(i + 1).map((h2) => (
                <line
                  key={`${h1.id}-${h2.id}`}
                  x1={h1.x}
                  y1={h1.y}
                  x2={h2.x}
                  y2={h2.y}
                  stroke={selectedHubId === h1.id || selectedHubId === h2.id ? "rgba(138, 108, 255, 0.45)" : "rgba(255,255,255,0.08)"}
                  strokeWidth={selectedHubId === h1.id || selectedHubId === h2.id ? 2 : 1}
                  strokeDasharray={selectedHubId === h1.id || selectedHubId === h2.id ? "none" : "2 2"}
                />
              ))
            )}

            {/* Center Node */}
            <circle cx="150" cy="140" r="14" fill="#18112b" stroke="#8a6cff" strokeWidth="2" />
            <text x="150" y="144" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
              LTP
            </text>

            {/* Interactive Hub Nodes */}
            {hubs.map((hub) => {
              const isSelected = hub.id === selectedHubId
              return (
                <g
                  key={hub.id}
                  onClick={() => setSelectedHubId(hub.id)}
                  style={{ cursor: "pointer" }}
                  className="synaptic-node-group"
                >
                  <circle
                    cx={hub.x}
                    cy={hub.y}
                    r={isSelected ? 18 : 14}
                    fill="#130d24"
                    stroke={hub.color}
                    strokeWidth={isSelected ? 3 : 1.5}
                    filter={isSelected ? `drop-shadow(0 0 10px ${hub.color})` : undefined}
                  />
                  <circle cx={hub.x} cy={hub.y} r={isSelected ? 6 : 4} fill={hub.color} />
                  <text
                    x={hub.x}
                    y={hub.y + (hub.y > 140 ? 25 : -20)}
                    fill={isSelected ? "#ffffff" : "rgba(243, 238, 251, 0.65)"}
                    fontSize="9.5"
                    fontWeight={isSelected ? "bold" : "normal"}
                    fontFamily="var(--mono)"
                    textAnchor="middle"
                  >
                    {hub.name.split(" ")[0]}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Selected Hub Detail Card */}
        <div className="hub-detail-card" style={{ borderColor: `${selectedHub.color}40` }}>
          <div className="hub-detail-top">
            <span className="hub-dot" style={{ background: selectedHub.color }} />
            <div>
              <strong>{selectedHub.name}</strong>
              <small>{selectedHub.region}</small>
            </div>
            <span className="hub-score-badge" style={{ color: selectedHub.color }}>
              {selectedHub.score}%
            </span>
          </div>
          <p className="hub-desc">{selectedHub.description}</p>
          <div className="hub-lever">
            <span>KEY PROTOCOL LEVER:</span>
            <strong>{selectedHub.protocolLever}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

// ======================================================================
// 2. Testosterone & Vitality: Endocrine Peak & Biomarker Vitality Matrix
// ======================================================================
export function TestosteroneWidget({
  enrollment,
}: {
  enrollment?: TrackEnrollment
}) {
  const todayStr = todayDateStr()
  const todayDone = useMemo(
    () => new Set(enrollment?.completions?.[todayStr] || []),
    [enrollment, todayStr],
  )

  const pillars = useMemo(() => {
    const sleepScore = todayDone.has("foundation-sleep") ? 100 : 40
    const liftScore = todayDone.has("t-compound-session") || todayDone.has("foundation-lift") ? 95 : 50
    const fatScore = todayDone.has("t-whole-food-plate") ? 90 : 50
    const stressScore = todayDone.has("t-stress-buffer") || todayDone.has("foundation-alcohol") ? 95 : 45

    return [
      {
        id: "leydig",
        name: "Leydig Cell Output",
        score: sleepScore,
        color: "#f59e0b",
        desc: "Deep slow-wave sleep drives nocturnal LH pulses that stimulate Leydig cell steroidogenesis.",
      },
      {
        id: "androgen",
        name: "Androgen Receptor Density",
        score: liftScore,
        color: "#ef4444",
        desc: "Heavy compound resistance training upregulates muscle androgen receptor sensitivity.",
      },
      {
        id: "substrate",
        name: "Cholesterol & Lipid Substrate",
        score: fatScore,
        color: "#10b981",
        desc: "Whole-food saturated and monounsaturated fats supply direct precursors for testosterone synthesis.",
      },
      {
        id: "cortisol",
        name: "Aromatase & Cortisol Buffer",
        score: stressScore,
        color: "#6366f1",
        desc: "Low visceral fat and alcohol absence prevent aromatase conversion of testosterone into estrogen.",
      },
    ]
  }, [todayDone])

  const overallEndocrineScore = Math.round(
    pillars.reduce((acc, p) => acc + p.score, 0) / pillars.length,
  )

  return (
    <div className="track-widget-card endocrine-matrix-widget">
      <div className="widget-header">
        <div>
          <span className="widget-tag">MALE ENDOCRINE MATRIX</span>
          <h3>Androgenic Vitality Dial</h3>
        </div>
        <div className="widget-score-pill">
          <Zap size={15} style={{ color: "#f59e0b" }} />
          <strong>{overallEndocrineScore}%</strong>
          <small>Endocrine Potential</small>
        </div>
      </div>

      <div className="endocrine-gauge-container">
        <svg viewBox="0 0 240 135" className="gauge-svg">
          {/* Gauge Background Arc */}
          <path
            d="M 30 120 A 90 90 0 0 1 210 120"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Gauge Fill Arc (180 deg max) */}
          <path
            d="M 30 120 A 90 90 0 0 1 210 120"
            fill="none"
            stroke="url(#tGrad)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * (overallEndocrineScore / 100))}
            style={{ transition: "stroke-dashoffset 800ms ease" }}
          />
          <defs>
            <linearGradient id="tGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <text x="120" y="105" fill="#ffffff" fontSize="28" fontWeight="800" fontFamily="var(--mono)" textAnchor="middle">
            {overallEndocrineScore}%
          </text>
          <text x="120" y="122" fill="rgba(243,238,251,0.6)" fontSize="9.5" fontFamily="var(--mono)" textAnchor="middle">
            PEAK ANDROGEN POTENTIAL
          </text>
        </svg>

        <div className="endocrine-pillars-grid">
          {pillars.map((p) => (
            <div key={p.id} className="endocrine-pillar-item">
              <div className="pillar-top">
                <i style={{ background: p.color }} />
                <span>{p.name}</span>
                <strong style={{ color: p.color }}>{p.score}%</strong>
              </div>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ======================================================================
// 3. Attention Reset: Dopamine Waveform & Attentional Sensitivity Curve
// ======================================================================
export function AttentionResetWidget({
  enrollment,
  onOpenUrgeSurf,
}: {
  enrollment?: TrackEnrollment
  onOpenUrgeSurf?: () => void
}) {
  const [curveMode, setCurveMode] = useState<"resensitized" | "spiked">("resensitized")

  const todayStr = todayDateStr()
  const todayDone = useMemo(
    () => new Set(enrollment?.completions?.[todayStr] || []),
    [enrollment, todayStr],
  )

  const urgeSurfCount = enrollment?.urgeSurfs?.length || 0

  return (
    <div className="track-widget-card dopamine-waveform-widget">
      <div className="widget-header">
        <div>
          <span className="widget-tag">NEURAL ATTENTION CIRCUIT</span>
          <h3>Dopamine Baseline Curve</h3>
        </div>
        <div className="curve-switcher">
          <button
            type="button"
            className={curveMode === "resensitized" ? "active" : ""}
            onClick={() => setCurveMode("resensitized")}
          >
            Reset Protocol
          </button>
          <button
            type="button"
            className={curveMode === "spiked" ? "active" : ""}
            onClick={() => setCurveMode("spiked")}
          >
            Spike & Crash
          </button>
        </div>
      </div>

      <div className="waveform-display">
        <svg viewBox="0 0 320 140" className="waveform-svg">
          {/* Baseline reference line */}
          <line x1="20" y1="85" x2="300" y2="85" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
          <text x="24" y="80" fill="rgba(243,238,251,0.5)" fontSize="9" fontFamily="var(--mono)">
            TONIC BASELINE
          </text>

          {curveMode === "resensitized" ? (
            /* Steady High Baseline Curve */
            <>
              <path
                d="M 20 85 Q 70 82, 110 75 T 180 70 T 240 72 T 300 70"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="180" cy="70" r="5" fill="#10b981" />
              <text x="180" y="55" fill="#10b981" fontSize="9.5" fontWeight="bold" fontFamily="var(--mono)" textAnchor="middle">
                Sustained Drive & Focus
              </text>
            </>
          ) : (
            /* Rollercoaster Cheap Spike & Deep Sub-Baseline Crash */
            <>
              <path
                d="M 20 85 Q 50 18, 90 22 T 130 120 T 190 125 T 250 115 T 300 100"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="90" cy="22" r="5" fill="#f43f5e" />
              <text x="90" y="14" fill="#f43f5e" fontSize="9" fontWeight="bold" fontFamily="var(--mono)" textAnchor="middle">
                Algorithmic Spike
              </text>
              <circle cx="160" cy="123" r="5" fill="#f43f5e" />
              <text x="160" y="137" fill="#f87171" fontSize="9" fontWeight="bold" fontFamily="var(--mono)" textAnchor="middle">
                Sub-Baseline Crash
              </text>
            </>
          )}
        </svg>

        <div className="dopamine-metrics-bar">
          <div className="dopamine-stat">
            <span>Urges Surfed:</span>
            <strong>{urgeSurfCount}</strong>
          </div>
          <div className="dopamine-stat">
            <span>D2 Sensitivity:</span>
            <strong style={{ color: "#34d399" }}>
              {todayDone.has("attn-friction-rules") && todayDone.has("attn-boredom-tolerance") ? "High" : "Rebuilding"}
            </strong>
          </div>
          {onOpenUrgeSurf && (
            <button type="button" className="urge-quick-btn" onClick={onOpenUrgeSurf}>
              <Flame size={14} /> Launch Urge Surfer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ======================================================================
// 4. Skin & Hair: Dermal & Follicular Regeneration Matrix
// ======================================================================
export function SkinAndHairWidget({
  enrollment,
}: {
  enrollment?: TrackEnrollment
}) {
  const [selectedLayer, setSelectedLayer] = useState<number>(1)

  const layers = [
    {
      level: 1,
      title: "Stratum Corneum Barrier",
      depth: "Surface 15–20 µm",
      color: "#38bdf8",
      factor: "Transepidermal Water Loss (TEWL)",
      score: 92,
      protocol: "Daily SPF 30+ & Ceramide Hydration",
      insight: "Preventing UV-A photoaging and preserving lipid bilayer integrity halts 80% of dermal damage.",
    },
    {
      level: 2,
      title: "Dermal Extracellular Matrix",
      depth: "Papillary Dermis 1–2 mm",
      color: "#ec4899",
      factor: "Fibroblast Collagen Synthesis",
      score: 85,
      protocol: "Nightly Retinoid + Vitamin C + Glymphatic Sleep",
      insight: "Stimulates Type-I pro-collagen gene expression and downregulates matrix metalloproteinases (MMPs).",
    },
    {
      level: 3,
      title: "Follicular Dermal Papilla",
      depth: "Hair Bulb Subcutis 3–4 mm",
      color: "#a855f7",
      factor: "Microvascular Perfusion & Anagen",
      score: 88,
      protocol: "Daily 4-Min Scalp Massage & Protein/Ferritin Sufficiency",
      insight: "Upregulates noggin and stimulates microcirculation, maintaining the prolonged active growth (anagen) phase.",
    },
  ]

  const activeLayer = layers.find((l) => l.level === selectedLayer) || layers[0]

  return (
    <div className="track-widget-card dermal-regen-widget">
      <div className="widget-header">
        <div>
          <span className="widget-tag">CELLULAR DERMATOLOGY</span>
          <h3>Tissue Regeneration Depth</h3>
        </div>
        <div className="layer-depth-selector">
          {layers.map((l) => (
            <button
              key={l.level}
              type="button"
              className={selectedLayer === l.level ? "active" : ""}
              onClick={() => setSelectedLayer(l.level)}
              style={{
                borderColor: selectedLayer === l.level ? l.color : "transparent",
              }}
            >
              L{l.level}
            </button>
          ))}
        </div>
      </div>

      <div className="dermal-layer-display">
        <div className="dermal-ring-diagram">
          <svg viewBox="0 0 160 160" className="dermal-ring-svg">
            {layers.map((l, idx) => {
              const radius = 30 + idx * 24
              const isSelected = selectedLayer === l.level
              return (
                <circle
                  key={l.level}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke={l.color}
                  strokeWidth={isSelected ? 6 : 2}
                  strokeOpacity={isSelected ? 1 : 0.3}
                  strokeDasharray={isSelected ? "none" : "3 3"}
                  style={{ cursor: "pointer", transition: "all 300ms ease" }}
                  onClick={() => setSelectedLayer(l.level)}
                />
              )
            })}
            <circle cx="80" cy="80" r="16" fill="#18112b" stroke="#ffffff" strokeWidth="1" />
            <text x="80" y="84" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="var(--mono)" textAnchor="middle">
              REGEN
            </text>
          </svg>
        </div>

        <div className="layer-info-card" style={{ borderLeftColor: activeLayer.color }}>
          <div className="layer-title-row">
            <div>
              <strong>{activeLayer.title}</strong>
              <small>{activeLayer.depth} · {activeLayer.factor}</small>
            </div>
            <span className="layer-score-pill" style={{ color: activeLayer.color }}>
              {activeLayer.score}%
            </span>
          </div>
          <p className="layer-insight">{activeLayer.insight}</p>
          <div className="layer-action">
            <span>ACTIVE PROTOCOL:</span>
            <strong>{activeLayer.protocol}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
