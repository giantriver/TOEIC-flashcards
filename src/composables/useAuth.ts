import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, type User } from 'firebase/auth'
import { computed, readonly, ref } from 'vue'
import { auth } from '@/lib/firebase'

const user = ref<User | null>(null)
const isReady = ref(false)
const error = ref('')
let initialized = false
let resolveReady: (() => void) | undefined
const readyPromise = new Promise<void>((resolve) => {
  resolveReady = resolve
})

export function initAuth() {
  if (initialized) return
  initialized = true
  onAuthStateChanged(auth, (nextUser) => {
    user.value = nextUser
    isReady.value = true
    resolveReady?.()
  })
}

export async function waitForAuthReady() {
  initAuth()
  if (!isReady.value) await readyPromise
}

export function useAuth() {
  initAuth()

  async function signIn() {
    error.value = ''
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : '登入失敗，請稍後再試。'
      throw caught
    }
  }

  async function signOutUser() {
    error.value = ''
    await signOut(auth)
  }

  return {
    user: readonly(user),
    isReady: readonly(isReady),
    error: readonly(error),
    isSignedIn: computed(() => user.value !== null),
    signIn,
    signOutUser,
  }
}

