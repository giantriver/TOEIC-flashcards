import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Note, NoteInput } from '@/types/note'

function notesCollection(userId: string) {
  return collection(db, 'users', userId, 'notes')
}

function asNote(id: string, data: Record<string, unknown>): Note {
  return {
    id,
    title: typeof data.title === 'string' ? data.title : '未命名筆記',
    content: typeof data.content === 'string' ? data.content : '',
    createdAt: (data.createdAt as Note['createdAt']) ?? null,
    updatedAt: (data.updatedAt as Note['updatedAt']) ?? null,
  }
}

export async function getNotes(userId: string): Promise<Note[]> {
  const snapshot = await getDocs(query(notesCollection(userId), orderBy('updatedAt', 'desc')))
  return snapshot.docs.map((item) => asNote(item.id, item.data()))
}

export async function getNote(userId: string, noteId: string): Promise<Note | null> {
  const snapshot = await getDoc(doc(db, 'users', userId, 'notes', noteId))
  return snapshot.exists() ? asNote(snapshot.id, snapshot.data()) : null
}

export async function createNote(userId: string, input: NoteInput): Promise<string> {
  const note = await addDoc(notesCollection(userId), {
    title: input.title.trim() || '未命名筆記',
    content: input.content,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return note.id
}

export async function updateNote(userId: string, noteId: string, input: NoteInput) {
  await updateDoc(doc(db, 'users', userId, 'notes', noteId), {
    title: input.title.trim() || '未命名筆記',
    content: input.content,
    updatedAt: serverTimestamp(),
  })
}

export async function removeNote(userId: string, noteId: string) {
  await deleteDoc(doc(db, 'users', userId, 'notes', noteId))
}

