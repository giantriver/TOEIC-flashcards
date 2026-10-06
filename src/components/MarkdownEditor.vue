<script setup lang="ts">
import { ref } from 'vue'
import MarkdownPreview from '@/components/MarkdownPreview.vue'

defineProps<{ title: string; content: string; saving?: boolean }>()
defineEmits<{
  'update:title': [value: string]
  'update:content': [value: string]
  save: []
  cancel: []
}>()

const pane = ref<'editor' | 'preview'>('editor')
</script>

<template>
  <form class="editor-form" @submit.prevent="$emit('save')">
    <div class="editor-topline">
      <input
        class="title-input"
        :value="title"
        aria-label="筆記標題"
        placeholder="筆記標題"
        @input="$emit('update:title', ($event.target as HTMLInputElement).value)"
      />
      <div class="form-actions">
        <button class="button button-quiet" type="button" @click="$emit('cancel')">取消</button>
        <button class="button button-primary" type="submit" :disabled="saving">{{ saving ? '儲存中' : '儲存' }}</button>
      </div>
    </div>
    <div class="editor-tabs" role="tablist" aria-label="編輯模式">
      <button :class="{ active: pane === 'editor' }" type="button" role="tab" @click="pane = 'editor'">編輯</button>
      <button :class="{ active: pane === 'preview' }" type="button" role="tab" @click="pane = 'preview'">預覽</button>
    </div>
    <div class="editor-grid" :class="`show-${pane}`">
      <section class="editor-pane" aria-label="Markdown 編輯器">
        <textarea
          :value="content"
          placeholder="- **allocate** `v.` 分配、撥出\n  > The manager allocated more time to the project."
          @input="$emit('update:content', ($event.target as HTMLTextAreaElement).value)"
        />
      </section>
      <section class="preview-pane" aria-label="Markdown 預覽">
        <MarkdownPreview :content="content" />
      </section>
    </div>
  </form>
</template>

