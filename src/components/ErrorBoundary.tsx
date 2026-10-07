import { Component, type ReactNode } from "react"

function report(error: unknown, context: string) {
  import("../lib/cloud").then((mod) => mod.report(error, context)).catch(() => undefined)
}

// Global handlers catch async failures that never reach React.
export function installCrashReporting() {
  window.addEventListener("error", (event) => report(event.error || event.message, "window.error"))
  window.addEventListener("unhandledrejection", (event) => report(event.reason, "unhandledrejection"))
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    report(error, "react")
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="crash-screen">
        <p className="eyebrow">Something slipped</p>
        <h1>Your progress is safe.</h1>
        <p>Everything is saved on this device. Reload to pick up where you left off.</p>
        <button type="button" className="primary-button" onClick={() => location.reload()}>
          Reload Zenith
        </button>
      </main>
    )
  }
}
