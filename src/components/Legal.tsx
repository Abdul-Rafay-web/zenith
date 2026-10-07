import { useState } from "react"
import { X } from "./icons"
import { IconButton } from "./ui"

// Fill these in before publishing: they appear in both documents.
export const LEGAL = {
  operator: "Zenith",
  contact: "rafay.art.276@gmail.com",
  jurisdiction: "Pakistan",
  updated: "7 October 2026",
}

type Doc = "privacy" | "terms"

const PRIVACY: [string, string][] = [
  [
    "What we collect",
    "Your account details (name, email and, with Google sign-in, profile photo). The content you create: goals, steps, focus sessions, skills and practice ratings. Technical crash reports (error message, stack trace, device type) if something breaks. Anonymous usage events, if analytics is enabled and you haven't opted out.",
  ],
  [
    "How it's stored",
    "Data is kept on your device and, when you're signed in, synced to Google Firebase (Cloud Firestore and Authentication). Security rules let only your own account read or write your records. Not even other Zenith users can see them. Guest mode keeps everything on the device only.",
  ],
  [
    "How we use it",
    "Only to run the app: syncing your data, scheduling practice reviews, sending reminders you turn on, checking that progress is genuine, and fixing bugs. We don't sell your data, show ads, or use your content to train AI models.",
  ],
  [
    "Notifications",
    "Review and practice reminders are scheduled on your device. Turn them off anytime in the app or in your device settings.",
  ],
  [
    "Sub-processors",
    "Google LLC (Firebase Authentication, Cloud Firestore, App Check and, if enabled, Google Analytics for Firebase). Their processing is covered by Google's data processing terms.",
  ],
  [
    "Your rights",
    "You can view and edit everything in the app. Delete account (account sheet) permanently erases your cloud data and login straight away, and removes the copy on that device. You can opt out of analytics in the account sheet. For anything else, email us and we'll reply within 30 days.",
  ],
  [
    "Retention",
    "We keep your data while your account exists and delete it when you delete your account. Crash reports are capped in size and deleted along with your account.",
  ],
  [
    "Children",
    "Zenith isn't directed at children under 13 (or the minimum age in your country), and we don't knowingly collect their data.",
  ],
]

const TERMS: [string, string][] = [
  [
    "Using Zenith",
    "Zenith is a personal tool for planning goals and practicing skills. You must give accurate account information and keep your password secure. One account per person.",
  ],
  [
    "Your content",
    "You own what you create. You give us only the limited permission needed to store, sync and show it back to you.",
  ],
  [
    "Fair play",
    "Don't tamper with the app, its servers or its progress system, or try to access other people's data. Progress and XP are checked by our security rules, and inflated values may be corrected.",
  ],
  [
    "No guarantees",
    "Zenith uses evidence-based learning methods, but results depend on your own practice. The app is provided \"as is\" and isn't medical, psychological or professional advice.",
  ],
  [
    "Liability",
    "To the extent allowed by law, we aren't liable for indirect or consequential losses, including lost data. Keep your own copies of anything critical.",
  ],
  [
    "Ending",
    "You can stop using Zenith and delete your account anytime. We may suspend accounts that break these terms.",
  ],
  [
    "Changes",
    "If these terms change in a meaningful way, we'll tell you in the app before the changes apply. These terms are governed by the laws of {jurisdiction}.",
  ],
]

export default function Legal({
  initial = "privacy",
  onClose,
}: {
  initial?: Doc
  onClose: () => void
}) {
  const [doc, setDoc] = useState<Doc>(initial)
  const sections = doc === "privacy" ? PRIVACY : TERMS
  return (
    <div className="sheet-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="goal-sheet legal-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" />
        <IconButton label="Close" onClick={onClose} className="sheet-close">
          <X size={19} />
        </IconButton>
        <div className="legal-tabs" role="tablist">
          {(["privacy", "terms"] as Doc[]).map((key) => (
            <button
              type="button"
              role="tab"
              key={key}
              aria-selected={doc === key}
              className={doc === key ? "active" : ""}
              onClick={() => setDoc(key)}
            >
              {key === "privacy" ? "Privacy" : "Terms"}
            </button>
          ))}
        </div>
        <h2 id="legal-title">
          {doc === "privacy" ? "Privacy Policy" : "Terms of Use"}
        </h2>
        <p className="legal-meta">
          {LEGAL.operator} · Last updated {LEGAL.updated}
        </p>
        <div className="legal-body">
          {sections.map(([title, copy]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{copy.replace("{jurisdiction}", LEGAL.jurisdiction)}</p>
            </article>
          ))}
          <p className="legal-contact">
            Questions: <a href={`mailto:${LEGAL.contact}`}>{LEGAL.contact}</a>
          </p>
        </div>
      </section>
    </div>
  )
}
