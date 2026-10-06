<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { signIn, error } = useAuth()
const loading = ref(false)

async function login() {
  loading.value = true
  try {
    await signIn()
    await router.push({ name: 'notes' })
  } catch {
    // The composable exposes a readable error for the form.
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="login-view">
    <p class="eyebrow">Vocabulary workspace</p>
    <h1>把 TOEIC 筆記變成可複習的單字卡</h1>
    <p class="login-copy">用 Markdown 記下單字、詞性與例句，隨時切換成專注的複習模式。</p>
    <button class="button button-primary button-large" type="button" :disabled="loading" @click="login">
      {{ loading ? '登入中' : '使用 Google 登入' }}
    </button>
    <p v-if="error" class="form-error">{{ error }}</p>
  </section>
</template>

