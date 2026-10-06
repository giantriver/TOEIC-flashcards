import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

function progressCollection(userId: string, noteId: string) {
  return collection(db, 'users', userId, 'notes', noteId, 'progress')
}

export async function getStarredCardIds(userId: string, noteId: string): Promise<Set<string>> {
  const snapshot = await getDocs(progressCollection(userId, noteId))
  return new Set(snapshot.docs.filter((item) => item.data().starred === true).map((item) => item.id))
}

export async function setCardStarred(userId: string, noteId: string, cardId: string, starred: boolean) {
  const progressRef = doc(db, 'users', userId, 'notes', noteId, 'progress', cardId)
  if (!starred) {
    await deleteDoc(progressRef)
    return
  }

  await setDoc(progressRef, { starred: true, updatedAt: serverTimestamp() })
}

