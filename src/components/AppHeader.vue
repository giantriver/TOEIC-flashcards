<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { user, signOutUser } = useAuth()

async function signOut() {
  await signOutUser()
  await router.push({ name: 'login' })
}
</script>

<template>
  <header class="app-header">
    <RouterLink class="brand" :to="user ? { name: 'notes' } : { name: 'login' }">TOEIC Flashcards</RouterLink>
    <nav v-if="user" class="header-actions" aria-label="帳號選單">
      <RouterLink class="text-link" :to="{ name: 'notes' }">我的筆記</RouterLink>
      <span class="user-name">{{ user.displayName || user.email }}</span>
      <button class="button button-quiet" type="button" @click="signOut">登出</button>
    </nav>
  </header>
</template>

