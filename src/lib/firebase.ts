import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app"
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth"

const env = import.meta.env as Record<string, string | undefined>

const firebaseConfig = {
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
  apiKey: "AIzaSyB0O_qU-oNVY9bemlDULBBmFwyGreBnubA",
  authDomain: "zenith-d0775.firebaseapp.com",
  projectId: "zenith-d0775",
  storageBucket: "zenith-d0775.firebasestorage.app",
  messagingSenderId: "71386601069",
  appId: "1:71386601069:web:c95cc5e57d85e42735d164",
}

export interface CloudUser {
  uid: string
  displayName: string
  email: string
  photoURL?: string
}

let user: User | null = null

function services() {
  const fresh = !getApps().length
  const app = fresh ? initializeApp(firebaseConfig) : getApp()
  if (fresh) void startAppCheck(app)
  return { app, auth: getAuth(app) }
}

// App Check attests that requests come from this app. Enabled once a
// reCAPTCHA v3 site keys are public by design (they ship in every page), so a
// default is baked in. The secret key lives only in the Firebase console.
const APPCHECK_SITE_KEY = "6LeTwOMtAAAAAGXnNlhUfVVTc9tHw3bgbvnSngNV"

async function startAppCheck(app: FirebaseApp) {
  const siteKey = env.VITE_APPCHECK_SITE_KEY || APPCHECK_SITE_KEY
  if (!siteKey) return
  if (env.DEV && env.VITE_APPCHECK_DEBUG_TOKEN) {
    ;(self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN: string }).FIREBASE_APPCHECK_DEBUG_TOKEN =
      env.VITE_APPCHECK_DEBUG_TOKEN
  }
  const { initializeAppCheck, ReCaptchaV3Provider } = await import(
    "firebase/app-check"
  )
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  })
}

export function firebaseApp(): FirebaseApp {
  return services().app
}

export function currentUid() {
  return user?.uid
}

// Firestore is ~60% of the Firebase payload; keep it off the auth path.
const cloud = () => import("./cloud")
const ensureProfile = (current: User) =>
  cloud().then((mod) => mod.ensureProfile(current))

function publicUser(current: User): CloudUser {
  return {
    uid: current.uid,
    displayName:
      current.displayName || current.email?.split("@")[0] || "Zenith member",
    email: current.email || "",
    photoURL: current.photoURL || undefined,
  }
}

export function observeAuth(
  callback: (current: CloudUser | null) => void,
): () => void {
  const { auth } = services()
  return onAuthStateChanged(auth, (current) => {
    // Earlier builds used anonymous auth for sync. Those sessions are not
    // accounts, so migrate them back to the real authentication screen.
    if (current?.isAnonymous) {
      user = null
      void signOut(auth).finally(() => callback(null))
      return
    }
    user = current
    if (current) {
      void ensureProfile(current).catch(() => {
        // Authentication remains usable while Firestore is being configured.
      })
      callback(publicUser(current))
    } else {
      callback(null)
    }
  })
}

export async function createAccount(
  name: string,
  email: string,
  password: string,
) {
  const { auth } = services()
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName: name })
  user = credential.user
  await ensureProfile(credential.user).catch(() => undefined)
  return publicUser(credential.user)
}

export async function login(email: string, password: string) {
  const { auth } = services()
  const credential = await signInWithEmailAndPassword(auth, email, password)
  user = credential.user
  await ensureProfile(credential.user).catch(() => undefined)
  return publicUser(credential.user)
}

export async function loginWithGoogle() {
  const { auth } = services()
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: "select_account" })
  const credential = await signInWithPopup(auth, provider)
  user = credential.user
  await ensureProfile(credential.user).catch(() => undefined)
  return publicUser(credential.user)
}

export async function logout() {
  const { auth } = services()
  await signOut(auth)
  user = null
}

// Wipes every owned document, then the auth record. Firebase may require a
// recent sign-in; the caller surfaces auth/requires-recent-login.
export async function deleteAccount() {
  const { auth } = services()
  const current = auth.currentUser
  if (!current) return
  await (await cloud()).purgeUserData(current.uid)
  await deleteUser(current)
  user = null
}

export async function resetPassword(email: string) {
  const { auth } = services()
  await sendPasswordResetEmail(auth, email)
}

// Privacy-respecting usage analytics: off unless a measurement ID is set,
// and always off once the user opts out.
export async function track(event: string, params: Record<string, string | number> = {}) {
  const measurementId = env.VITE_FIREBASE_MEASUREMENT_ID
  if (!measurementId || localStorage.getItem("zenith:analytics-optout") === "1") return
  const { getAnalytics, isSupported, logEvent } = await import("firebase/analytics")
  if (!(await isSupported())) return
  const { app } = services()
  logEvent(getAnalytics(app), event, params)
}
