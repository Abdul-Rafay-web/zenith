// src/lib/audio.ts
export const MOTIVATION_LINES = [
  "Stay focused.",
  "You are doing great.",
  "One step at a time.",
  "Keep your eyes on the goal.",
  "Breathe, and continue.",
  "Progress is made in these quiet moments.",
  "Your future self will thank you for this.",
  "Embrace the struggle, it means you're growing.",
  "Focus is a muscle. You are building it right now.",
  "Every minute here is a vote for the person you want to become.",
  "Notice the movement. You are advancing.",
  "Small steps still move you forward.",
]

let bgm: HTMLAudioElement | null = null

export function setBgmEnabled(enabled: boolean) {
  localStorage.setItem("zenith:bgm", enabled ? "1" : "0")
  if (!enabled && bgm) bgm.pause()
}

export function isBgmEnabled() {
  return localStorage.getItem("zenith:bgm") === "1"
}

export function playBgm() {
  if (!isBgmEnabled()) return
  if (!bgm) {
    // We use a placeholder path, user needs to place bgm.mp3 in public/
    bgm = new Audio("/bgm.mp3") 
    bgm.loop = true
    bgm.volume = 0.2
  }
  bgm.play().catch(() => {})
}

export function pauseBgm() {
  bgm?.pause()
}

export function setVoicePref(pref: "male" | "female" | "mute") {
  localStorage.setItem("zenith:voice", pref)
}

export function getVoicePref(): "male" | "female" | "mute" {
  return (localStorage.getItem("zenith:voice") as any) || "mute"
}

export function speakMotivation() {
  const pref = getVoicePref()
  if (pref === "mute" || typeof window === "undefined" || !("speechSynthesis" in window)) return

  const line = MOTIVATION_LINES[Math.floor(Math.random() * MOTIVATION_LINES.length)]
  const utterance = new SpeechSynthesisUtterance(line)
  
  const voices = window.speechSynthesis.getVoices()
  
  const isFemale = (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes("female") || v.name.includes("Zira") || v.name.includes("Samantha") || v.name.includes("Victoria")
  const isMale = (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes("male") || v.name.includes("David") || v.name.includes("Alex") || v.name.includes("Daniel")

  let voice = voices.find(pref === "female" ? isFemale : isMale)
  // fallback to any english voice
  if (!voice) voice = voices.find((v) => v.lang.startsWith("en"))

  if (voice) utterance.voice = voice
  utterance.rate = 0.85 // soothing, calm pace
  utterance.pitch = pref === "female" ? 1.1 : 0.9

  window.speechSynthesis.speak(utterance)
}
