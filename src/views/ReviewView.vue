<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Flashcard from '@/components/Flashcard.vue'
import { useAuth } from '@/composables/useAuth'
import { getNote } from '@/composables/useNotes'
import { getStarredCardIds, setCardStarred } from '@/composables/useReviewProgress'
import { parseFlashcards } from '@/lib/flashcardParser'
import type { Flashcard as FlashcardType } from '@/types/flashcard'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const title = ref('')
const allCards = ref<FlashcardType[]>([])
const reviewMode = ref<'all' | 'starred'>('all')
const starredCardIds = ref(new Set<string>())
const index = ref(0)
const flipped = ref(false)
const savingStar = ref(false)
const loading = ref(true)
const error = ref('')
const id = String(route.params.id)
const cards = computed(() => reviewMode.value === 'all'
  ? allCards.value
  : allCards.value.filter((card) => starredCardIds.value.has(card.id)))
const currentCard = computed(() => cards.value[index.value])
const isCurrentStarred = computed(() => currentCard.value ? starredCardIds.value.has(currentCard.value.id) : false)

function move(step: number) {
  if (!cards.value.length) return
  index.value = (index.value + step + cards.value.length) % cards.value.length
  flipped.value = false
}

function shuffle() {
  for (let position = allCards.value.length - 1; position > 0; position -= 1) {
    const target = Math.floor(Math.random() * (position + 1))
    ;[allCards.value[position], allCards.value[target]] = [allCards.value[target], allCards.value[position]]
  }
  index.value = 0
  flipped.value = false
}

function selectReviewMode(mode: 'all' | 'starred') {
  reviewMode.value = mode
  index.value = 0
  flipped.value = false
}

async function toggleStar() {
  if (!user.value || !currentCard.value || savingStar.value) return
  const cardId = currentCard.value.id
  const nextStarred = !starredCardIds.value.has(cardId)
  const previous = new Set(starredCardIds.value)
  const next = new Set(previous)
  nextStarred ? next.add(cardId) : next.delete(cardId)
  starredCardIds.value = next
  savingStar.value = true
  error.value = ''

  try {
    await setCardStarred(user.value.uid, id, cardId, nextStarred)
    if (reviewMode.value === 'starred' && !nextStarred) {
      index.value = Math.min(index.value, Math.max(cards.value.length - 1, 0))
      flipped.value = false
    }
  } catch (caught) {
    starredCardIds.value = previous
    error.value = caught instanceof Error ? caught.message : '更新待加強清單失敗。'
  } finally {
    savingStar.value = false
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
  if (event.key === 'ArrowLeft') move(-1)
  if (event.key === 'ArrowRight') move(1)
  if (event.key === ' ') {
    event.preventDefault()
    flipped.value = !flipped.value
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  if (!user.value) return
  try {
    const note = await getNote(user.value.uid, id)
    if (!note) {
      await router.replace({ name: 'notes' })
      return
    }
    title.value = note.title
    const [parsedCards, starred] = await Promise.all([
      Promise.resolve(parseFlashcards(note.content)),
      getStarredCardIds(user.value.uid, id),
    ])
    allCards.value = parsedCards
    starredCardIds.value = starred
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '讀取牌組失敗。'
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <section class="review-view">
    <div class="review-header">
      <div>
        <RouterLink class="back-link" :to="{ name: 'note-detail', params: { id } }">返回筆記</RouterLink>
        <h1>{{ title || '複習' }}</h1>
      </div>
      <button v-if="allCards.length" class="button button-outline" type="button" @click="shuffle">隨機排序</button>
    </div>
    <p v-if="loading" class="status-message">準備牌組中...</p>
    <p v-else-if="error" class="form-error">{{ error }}</p>
    <div v-else-if="!allCards.length" class="empty-state">
      <h2>找不到可複習的卡片</h2>
      <p>請用 `- **單字** `詞性` 中文意思` 的格式新增單字項目。</p>
      <RouterLink class="button button-primary" :to="{ name: 'note-edit', params: { id } }">編輯筆記</RouterLink>
    </div>
    <div v-else class="review-stage">
      <div class="review-mode" role="tablist" aria-label="複習範圍">
        <button :class="{ active: reviewMode === 'all' }" type="button" role="tab" @click="selectReviewMode('all')">全部 {{ allCards.length }}</button>
        <button :class="{ active: reviewMode === 'starred' }" type="button" role="tab" @click="selectReviewMode('starred')">待加強 {{ starredCardIds.size }}</button>
      </div>
      <div v-if="!cards.length" class="empty-state starred-empty">
        <h2>待加強清單目前是空的</h2>
        <p>在卡片右上角點選星星，即可把答不出來的單字集中複習。</p>
        <button class="button button-primary" type="button" @click="selectReviewMode('all')">回到全部單字</button>
      </div>
      <template v-else>
      <p class="review-count">{{ index + 1 }} / {{ cards.length }}</p>
      <Flashcard
        :card="currentCard"
        :flipped="flipped"
        :starred="isCurrentStarred"
        :star-disabled="savingStar"
        @flip="flipped = !flipped"
        @toggle-star="toggleStar"
      />
      <div class="review-controls">
        <button class="button button-outline" type="button" @click="move(-1)">上一張</button>
        <button class="button button-primary" type="button" @click="flipped = !flipped">翻面</button>
        <button class="button button-outline" type="button" @click="move(1)">下一張</button>
      </div>
      </template>
    </div>
  </section>
</template>

