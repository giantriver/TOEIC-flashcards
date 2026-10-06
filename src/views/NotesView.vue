<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { getNotes } from '@/composables/useNotes'
import NoteCard from '@/components/NoteCard.vue'
import type { Note } from '@/types/note'

const { user } = useAuth()
const notes = ref<Note[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  if (!user.value) return
  try {
    notes.value = await getNotes(user.value.uid)
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '讀取筆記失敗。'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="notes-view">
    <div class="page-heading">
      <div>
        <p class="eyebrow">我的空間</p>
        <h1>筆記</h1>
      </div>
      <RouterLink class="button button-primary" :to="{ name: 'note-new' }">新增筆記</RouterLink>
    </div>
    <p v-if="loading" class="status-message">載入筆記中...</p>
    <p v-else-if="error" class="form-error">{{ error }}</p>
    <div v-else-if="notes.length" class="notes-list">
      <NoteCard v-for="note in notes" :key="note.id" :note="note" />
    </div>
    <div v-else class="empty-state">
      <h2>還沒有筆記</h2>
      <p>從一份 Markdown 單字筆記開始，建立你的複習牌組。</p>
      <RouterLink class="button button-primary" :to="{ name: 'note-new' }">建立第一份筆記</RouterLink>
    </div>
  </section>
</template>

