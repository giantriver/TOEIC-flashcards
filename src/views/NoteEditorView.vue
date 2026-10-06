<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import { createNote, getNote, updateNote } from '@/composables/useNotes'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const noteId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')
const isEditing = computed(() => Boolean(noteId.value))
const title = ref('')
const content = ref('')
const loading = ref(isEditing.value)
const saving = ref(false)
const error = ref('')

onMounted(async () => {
  if (!isEditing.value || !user.value) return
  try {
    const note = await getNote(user.value.uid, noteId.value)
    if (!note) {
      await router.replace({ name: 'notes' })
      return
    }
    title.value = note.title
    content.value = note.content
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '讀取筆記失敗。'
  } finally {
    loading.value = false
  }
})

async function save() {
  if (!user.value) return
  saving.value = true
  error.value = ''
  try {
    const input = { title: title.value, content: content.value }
    const id = isEditing.value
      ? (await updateNote(user.value.uid, noteId.value, input), noteId.value)
      : await createNote(user.value.uid, input)
    await router.push({ name: 'note-detail', params: { id } })
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '儲存筆記失敗。'
  } finally {
    saving.value = false
  }
}

function cancel() {
  router.push(isEditing.value ? { name: 'note-detail', params: { id: noteId.value } } : { name: 'notes' })
}
</script>

<template>
  <section class="editor-view">
    <div class="page-heading compact-heading">
      <div>
        <p class="eyebrow">{{ isEditing ? '編輯筆記' : '新增筆記' }}</p>
        <h1>{{ isEditing ? '更新內容' : '建立筆記' }}</h1>
      </div>
    </div>
    <p v-if="loading" class="status-message">載入筆記中...</p>
    <template v-else>
      <p v-if="error" class="form-error">{{ error }}</p>
      <MarkdownEditor v-model:title="title" v-model:content="content" :saving="saving" @save="save" @cancel="cancel" />
    </template>
  </section>
</template>

