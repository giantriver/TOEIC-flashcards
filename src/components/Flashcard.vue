<script setup lang="ts">
import { computed } from 'vue'
import type { Flashcard as FlashcardType } from '@/types/flashcard'

const props = defineProps<{ card: FlashcardType; flipped: boolean; starred: boolean; starDisabled?: boolean }>()
defineEmits<{ flip: []; 'toggle-star': [] }>()

const youglishUrl = computed(() => `https://youglish.com/pronounce/${encodeURIComponent(props.card.front)}/english`)
</script>

<template>
  <article
    class="flashcard"
    :class="{ flipped }"
    role="button"
    tabindex="0"
    @click="$emit('flip')"
    @keydown.enter="$emit('flip')"
    @keydown.space.prevent="$emit('flip')"
  >
    <span class="flashcard-inner">
      <span class="flashcard-face flashcard-front">
        <span class="card-tools">
          <a
            class="youglish-button"
            :href="youglishUrl"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="在 YouGlish 聆聽發音"
            title="在 YouGlish 聆聽發音"
            @click.stop
          >▶</a>
          <button
            class="star-button"
            :class="{ starred }"
            type="button"
            :aria-label="starred ? '移出待加強清單' : '加入待加強清單'"
            :title="starred ? '移出待加強清單' : '加入待加強清單'"
            :disabled="starDisabled"
            @click.stop="$emit('toggle-star')"
          >{{ starred ? '★' : '☆' }}</button>
        </span>
        <small>單字</small>
        <strong>{{ card.front }}</strong>
        <em>{{ card.partOfSpeech }}</em>
        <span class="flip-hint">點擊翻面</span>
      </span>
      <span class="flashcard-face flashcard-back">
        <span class="card-tools">
          <a
            class="youglish-button"
            :href="youglishUrl"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="在 YouGlish 聆聽發音"
            title="在 YouGlish 聆聽發音"
            @click.stop
          >▶</a>
          <button
            class="star-button"
            :class="{ starred }"
            type="button"
            :aria-label="starred ? '移出待加強清單' : '加入待加強清單'"
            :title="starred ? '移出待加強清單' : '加入待加強清單'"
            :disabled="starDisabled"
            @click.stop="$emit('toggle-star')"
          >{{ starred ? '★' : '☆' }}</button>
        </span>
        <small>意思</small>
        <strong>{{ card.meaning || '尚未填寫意思' }}</strong>
        <span v-if="card.notes.length" class="card-notes">
          <span v-for="note in card.notes" :key="note">{{ note }}</span>
        </span>
        <span class="flip-hint">點擊翻面</span>
      </span>
    </span>
  </article>
</template>

