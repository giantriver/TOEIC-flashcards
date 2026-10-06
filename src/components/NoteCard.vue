<script setup lang="ts">
import { computed } from 'vue'
import type { Note } from '@/types/note'

const props = defineProps<{ note: Note }>()
const updatedAt = computed(() => {
  if (!props.note.updatedAt) return '剛建立'
  return new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short' }).format(props.note.updatedAt.toDate())
})
</script>

<template>
  <article class="note-card">
    <RouterLink class="note-card-main" :to="{ name: 'note-detail', params: { id: note.id } }">
      <h2>{{ note.title }}</h2>
      <p>{{ note.content.trim() || '尚未輸入內容' }}</p>
      <time>{{ updatedAt }}</time>
    </RouterLink>
    <RouterLink class="button button-outline" :to="{ name: 'review', params: { id: note.id } }">複習</RouterLink>
  </article>
</template>

