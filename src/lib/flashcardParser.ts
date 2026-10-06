import type { Flashcard } from '@/types/flashcard'

const entryPattern = /^\s*[-*]\s+\*\*(.+?)\*\*\s+`([^`]+)`\s*(.*)$/
const quotePattern = /^\s*>\s?(.*)$/

function hashCardContent(value: string): string {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

function createCardId(front: string, partOfSpeech: string, meaning: string): string {
  return `card-${hashCardContent(`${front}\u0000${partOfSpeech}\u0000${meaning}`)}`
}

export function parseFlashcards(markdown: string): Flashcard[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const cards: Flashcard[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(entryPattern)
    if (!match) continue

    const [, rawFront, rawPartOfSpeech, rawRest] = match
    const [meaning, ...inlineNotes] = rawRest.split(/\s+>\s*/)
    const notes = inlineNotes.filter(Boolean).map((note) => note.trim())

    while (index + 1 < lines.length) {
      const nextLine = lines[index + 1].match(quotePattern)
      if (!nextLine) break
      notes.push(nextLine[1].trim())
      index += 1
    }

    cards.push({
      id: createCardId(rawFront.trim(), rawPartOfSpeech.trim(), meaning.trim()),
      front: rawFront.trim(),
      partOfSpeech: rawPartOfSpeech.trim(),
      meaning: meaning.trim(),
      notes: notes.filter(Boolean),
    })
  }

  return cards
}

