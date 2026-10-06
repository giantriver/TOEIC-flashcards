import type { Timestamp } from 'firebase/firestore'

export interface Note {
  id: string
  title: string
  content: string
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface NoteInput {
  title: string
  content: string
}

