import { createRouter, createWebHashHistory } from 'vue-router'
import { auth } from '@/lib/firebase'
import { waitForAuthReady } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'login', component: () => import('@/views/LoginView.vue') },
    { path: '/notes', name: 'notes', component: () => import('@/views/NotesView.vue'), meta: { requiresAuth: true } },
    { path: '/notes/new', name: 'note-new', component: () => import('@/views/NoteEditorView.vue'), meta: { requiresAuth: true } },
    { path: '/notes/:id', name: 'note-detail', component: () => import('@/views/NoteDetailView.vue'), meta: { requiresAuth: true } },
    { path: '/notes/:id/edit', name: 'note-edit', component: () => import('@/views/NoteEditorView.vue'), meta: { requiresAuth: true } },
    { path: '/notes/:id/review', name: 'review', component: () => import('@/views/ReviewView.vue'), meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  await waitForAuthReady()
  if (to.meta.requiresAuth && !auth.currentUser) return { name: 'login' }
  if (to.name === 'login' && auth.currentUser) return { name: 'notes' }
  return true
})

export default router

