<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownPreview from '@/components/MarkdownPreview.vue'
import { getNote, removeNote } from '@/composables/useNotes'
import { useAuth } from '@/composables/useAuth'
import type { Note } from '@/types/note'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const note = ref<Note | null>(null)
const loading = ref(true)
const error = ref('')
const deleting = ref(false)
const id = String(route.params.id)

onMounted(async () => {
  if (!user.value) return
  try {
    note.value = await getNote(user.value.uid, id)
    if (!note.value) await router.replace({ name: 'notes' })
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '讀取筆記失敗。'
  } finally {
    loading.value = false
  }
})

async function deleteCurrentNote() {
  if (!user.value || !note.value || !window.confirm(`確定要刪除「${note.value.title}」嗎？`)) return
  deleting.value = true
  try {
    await removeNote(user.value.uid, id)
    await router.push({ name: 'notes' })
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '刪除筆記失敗。'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <section class="detail-view">
    <p v-if="loading" class="status-message">載入筆記中...</p>
    <p v-else-if="error" class="form-error">{{ error }}</p>
    <template v-else-if="note">
      <div class="page-heading detail-heading">
        <div>
          <RouterLink class="back-link" :to="{ name: 'notes' }">返回筆記</RouterLink>
          <h1>{{ note.title }}</h1>
        </div>
        <div class="form-actions">
          <RouterLink class="button button-primary" :to="{ name: 'review', params: { id: note.id } }">開始複習</RouterLink>
          <RouterLink class="button button-outline" :to="{ name: 'note-edit', params: { id: note.id } }">編輯</RouterLink>
          <button class="button button-danger" type="button" :disabled="deleting" @click="deleteCurrentNote">{{ deleting ? '刪除中' : '刪除' }}</button>
        </div>
      </div>
      <article class="note-content">
        <MarkdownPreview :content="note.content" />
      </article>
    </template>
  </section>
</template>

