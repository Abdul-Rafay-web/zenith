// Reminder scheduling. On Android/iOS (Capacitor) notifications are real OS
// alarms that fire with the app closed. On the web we can only fire while a
// tab is open, so the web path is a best-effort courtesy.
import { Capacitor } from "@capacitor/core"
import type { Skill } from "../types"
import { hash } from "./mastery"

const PREF = "zenith:reminders"
const native = Capacitor.isNativePlatform()
let webTimers: number[] = []

export const remindersEnabled = () => localStorage.getItem(PREF) === "1"

const plugin = () =>
  import("@capacitor/local-notifications").then((m) => m.LocalNotifications)

export async function enableReminders(): Promise<boolean> {
  let granted = false
  if (native) {
    const ln = await plugin()
    granted = (await ln.requestPermissions()).display === "granted"
    if (granted) {
      await ln.createChannel({
        id: "practice",
        name: "Practice reminders",
        importance: 4,
        vibration: true,
      })
    }
  } else if ("Notification" in window) {
    granted = (await Notification.requestPermission()) === "granted"
  }
  localStorage.setItem(PREF, granted ? "1" : "0")
  return granted
}

export async function disableReminders() {
  localStorage.setItem(PREF, "0")
  await clearAll()
}

async function clearAll() {
  webTimers.forEach((id) => window.clearTimeout(id))
  webTimers = []
  if (!native) return
  const ln = await plugin()
  const { notifications } = await ln.getPending()
  if (notifications.length) await ln.cancel({ notifications })
}

// Review alarms fire at the user's practice time on the due day, never at
// 3am because an interval happened to elapse overnight.
function reviewMoment(skill: Skill) {
  const [h, m] = (skill.reminderTime || "09:00").split(":").map(Number)
  const due = new Date(skill.nextReviewAt)
  due.setHours(h, m, 0, 0)
  if (due.getTime() < new Date(skill.nextReviewAt).getTime()) due.setDate(due.getDate() + 1)
  return due
}

export async function scheduleReminders(skills: Skill[]) {
  if (!remindersEnabled()) return
  await clearAll()
  const now = Date.now()

  if (native) {
    const ln = await plugin()
    const notifications = skills.flatMap((skill) => {
      const [hour, minute] = (skill.reminderTime || "09:00").split(":").map(Number)
      const base = hash(skill.id) % 1_000_000
      const items = [
        {
          id: base * 2,
          channelId: "practice",
          title: skill.title,
          body: skill.intention || `Time for a ${skill.title} rep. Two minutes counts.`,
          schedule: { on: { hour, minute }, allowWhileIdle: true },
        },
      ]
      const review = reviewMoment(skill)
      if (review.getTime() > now) {
        items.push({
          id: base * 2 + 1,
          channelId: "practice",
          title: `${skill.title} is ready for review`,
          body: "Your memory is at the sweet spot. Recall it now to lock it in.",
          schedule: { at: review, allowWhileIdle: true } as never,
        })
      }
      return items
    })
    if (notifications.length) await ln.schedule({ notifications })
    return
  }

  skills.forEach((skill) => {
    const delay = reviewMoment(skill).getTime() - now
    if (delay <= 0 || delay > 2 ** 31 - 1) return
    webTimers.push(
      window.setTimeout(
        () => new Notification(`${skill.title} is ready for review`, { body: skill.intention }),
        delay,
      ),
    )
  })
}
