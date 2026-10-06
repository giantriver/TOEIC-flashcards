# TOEIC Flashcards — Project Plan

## 1. Project Overview

Build a personal TOEIC vocabulary study web app where:

- The user can create and manage multiple Markdown notes.
- Each Markdown note represents one independent study set.
- Each note can be opened and converted into its own flashcard deck.
- The Markdown note is the **single source of truth**.
- Flashcards are generated dynamically from the note content.
- The MVP does **not** store generated flashcards separately in Firestore.
- The app is deployed to GitHub Pages.
- Firebase is used for authentication and cloud note storage.

Repository:

```text
TOEIC-flashcards
```

Expected GitHub Pages URL:

```text
https://giantriver.github.io/TOEIC-flashcards/
```

---

# 2. Tech Stack

Use:

```text
Vue 3
Vite
TypeScript
Vue Router
Firebase Authentication
Cloud Firestore
Markdown parser / renderer
GitHub Pages
GitHub Actions
```

Recommended packages:

```text
firebase
marked
dompurify
```

Optional:

```text
@vueuse/core
```

Do not introduce a backend server.

Do not use:

```text
Cloud Functions
Firebase Hosting
Firebase Storage
Realtime Database
paid Firebase services
```

unless clearly required later.

---

# 3. Firebase Status

Firebase project has already been created.

Project name:

```text
TOEIC-flashcards
```

Firebase Web App has already been registered.

Cloud Firestore has already been created.

Firebase Authentication has already been configured with:

```text
Google Sign-In
```

GitHub Pages authorized domain has already been added:

```text
giantriver.github.io
```

Firestore Security Rules are intended to use this structure:

```text
users/{uid}/notes/{noteId}
```

and only allow authenticated users to access their own notes.

Expected rules:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{uid}/notes/{noteId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == uid;
    }

  }
}
```

Do not loosen these rules to public read/write access.

---

# 4. Firebase Configuration

Do not hard-code the Firebase config directly in application source files.

Use a local `.env` file.

Example:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Create:

```text
.env.example
```

with the same keys but empty values.

Make sure:

```text
.env
```

is ignored by Git.

Firebase initialization should live in a dedicated file, for example:

```text
src/lib/firebase.ts
```

---

# 5. Core Product Concept

The app is organized around **notes**, not individual vocabulary entries.

Example:

```text
Test 1 - Part 7
Test 2 - Part 5
Test 3 - Part 6
Prepositions
Business Vocabulary
```

Each one is a separate Markdown note.

One note:

```text
Markdown Note
    ↓
Markdown Parser
    ↓
Flashcard Deck
```

Therefore:

```text
1 note = 1 flashcard deck
```

The user should be able to review different notes independently.

---

# 6. Firestore Data Model

Use:

```text
users
└── {uid}
    └── notes
        └── {noteId}
            ├── title
            ├── content
            ├── createdAt
            └── updatedAt
```

Each note document:

```ts
interface Note {
  id: string
  title: string
  content: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

Example:

```json
{
  "title": "Test 1 - Part 7",
  "content": "## 單字、片語\n\n- **postpone** `v.` 延後；延期",
  "createdAt": "...",
  "updatedAt": "..."
}
```

Use Firestore server timestamps where appropriate.

Do not create a separate `cards` collection in the MVP.

---

# 7. Authentication

Use Firebase Authentication with Google Sign-In.

Required behavior:

```text
App opened
    ↓
Check authentication state
    ↓
Not signed in
    → show login page

Signed in
    → enter notes dashboard
```

The app should provide:

- Sign in with Google
- Sign out
- Persistent login state
- Basic user information in the UI:
  - display name
  - email
  - profile photo if available

All Firestore reads/writes must use:

```text
users/{currentUser.uid}/...
```

Never trust a UID from route parameters or user input.

---

# 8. Pages / Routes

Recommended routes:

```text
/
    Login or redirect to notes

/notes
    Notes dashboard

/notes/new
    Create new Markdown note

/notes/:id
    View note

/notes/:id/edit
    Edit note

/notes/:id/review
    Review flashcards generated from note
```

Use Vue Router.

Protected routes must require Firebase Authentication.

---

# 9. Notes Dashboard

The main dashboard should display all notes belonging to the logged-in user.

Each note card should show at least:

```text
Title
Last updated time
Open
Review
Edit
Delete
```

Recommended layout:

```text
TOEIC Flashcards

[ + New Note ]

┌──────────────────────┐
│ Test 1 - Part 7      │
│ Updated: 2026/10/06  │
│                      │
│ Open  Review  Edit   │
└──────────────────────┘

┌──────────────────────┐
│ Test 2 - Part 5      │
│ Updated: ...         │
└──────────────────────┘
```

Sort notes by:

```text
updatedAt descending
```

Include an empty state when no notes exist.

---

# 10. Markdown Editor

The user must be able to create and edit notes directly inside the website.

Editor requirements:

- Title input
- Markdown textarea/editor
- Markdown preview
- Save button
- Cancel/back action
- Unsaved-state handling if practical
- Proper loading state
- Proper error state

Preferred layout on desktop:

```text
┌──────────────────────┬──────────────────────┐
│ Markdown Editor      │ Preview              │
│                      │                      │
│ ...                  │ Rendered Markdown    │
│                      │                      │
└──────────────────────┴──────────────────────┘
```

On mobile:

```text
Editor / Preview tabs
```

Markdown rendering must be sanitized before inserting HTML into the DOM.

Use a library such as:

```text
marked
+
DOMPurify
```

Do not directly render unsafe raw HTML.

---

# 11. Markdown Flashcard Syntax

The app should support normal Markdown, but only explicitly formatted vocabulary entries should become flashcards.

Primary flashcard syntax:

```markdown
- **word or phrase** `part-of-speech` Chinese meaning
```

Example:

```markdown
- **improvement** `n.` 改善；改進
- **carry out** `phr.` 執行；進行
- **postpone** `v.` 延後；延期
- **exhibit** `v./n.` 展示；展覽品
```

Optional supplementary lines immediately following a vocabulary entry:

```markdown
- **upon** `prep.` 在……時；一……就……
  > upon + 名詞
  > upon + V-ing
```

Parser result:

```ts
interface Flashcard {
  front: string
  pos: string
  meaning: string
  notes: string[]
}
```

Example:

```ts
{
  front: "upon",
  pos: "prep.",
  meaning: "在……時；一……就……",
  notes: [
    "upon + 名詞",
    "upon + V-ing"
  ]
}
```

---

# 12. Parsing Rules

Only convert entries matching this pattern into flashcards:

```markdown
- **...** `...` ...
```

Do not try to infer flashcards from every bullet item.

This is intentional.

Normal Markdown must still work for:

- headings
- paragraphs
- blockquotes
- examples
- grammar explanations
- lists
- tables
- code blocks

Example:

```markdown
## 用法整理

### refer

- **refer + 人 + to + 地方／服務／人**
  > 把某人轉介／推薦給……

- **refer to**
  > 提到；指的是；查閱
```

The parser should only create a card if the entry matches the designated flashcard syntax.

If a vocabulary line does not include a part-of-speech block using backticks, it should not automatically become a flashcard in the MVP.

---

# 13. Recommended Part-of-Speech Convention

Support at least:

```text
n.
v.
adj.
adv.
prep.
conj.
phr.
n./v.
v./n.
adj./adv.
```

The parser should not enforce a hard-coded whitelist unless necessary.

Treat the text inside backticks as the part-of-speech field.

---

# 14. Example Markdown Note

Use this as sample content during development:

```markdown
# Test 1 - Part 7

## 單字、片語

- **improvement** `n.` 改善；改進
- **carry out** `phr.` 執行；進行
- **postpone** `v.` 延後；延期
- **exhibit** `v./n.` 展示；展覽品
- **pothole** `n.` 坑洞
- **sidewalk** `n.` 人行道
- **prohibit** `v.` 禁止
- **event attendees** `n.` 活動參加者；出席者

- **upon** `prep.` 在……時；一……就……
  > upon + 名詞
  > upon + V-ing

- **numerous** `adj.` 許多的；大量的
- **voucher** `n.` 兌換券；優惠券；憑證
- **electronic** `adj.` 電子的

- **certain** `adj.` 某些的；確定的
  > be certain that + 子句 = 確定……
  > be certain of + 名詞 = 對……有把握

- **appointment** `n.` 約會；預約；任命
  > make an appointment = 預約

## 用法整理

### refer

- **refer + 人 + to + 地方／服務／人**
  > 把某人轉介／推薦給……

- **refer to**
  > 提到；指的是；查閱
```

---

# 15. Flashcard Review Page

When the user selects:

```text
Start Review
```

load the note content and generate flashcards dynamically.

Required UI:

```text
Note title
Current card number / total cards
Flashcard
Previous
Next
Shuffle
Back to Note
```

Example:

```text
Test 1 - Part 7

12 / 46

┌────────────────────────────┐
│                            │
│          postpone          │
│                            │
│             v.             │
│                            │
│       Click to reveal      │
│                            │
└────────────────────────────┘

[ Previous ] [ Shuffle ] [ Next ]
```

After flip:

```text
┌────────────────────────────┐
│          postpone          │
│                            │
│             v.             │
│                            │
│         延後；延期          │
│                            │
└────────────────────────────┘
```

If supplementary notes exist:

```text
certain
adj.

某些的；確定的

be certain that + 子句 = 確定……
be certain of + 名詞 = 對……有把握
```

---

# 16. Flashcard Behavior

MVP requirements:

- Click card to flip
- Previous card
- Next card
- Shuffle deck
- Display current position
- Reset to front when moving to another card
- Handle zero parsed flashcards gracefully

Optional keyboard controls:

```text
Space / Enter → flip
← → previous
→ → next
```

If easy to implement, include them.

---

# 17. What Is Explicitly Out of Scope for MVP

Do not implement these unless all core features are finished first:

```text
Spaced repetition
SM-2 algorithm
Anki-style scheduling
Review statistics
Difficulty scoring
Known / unknown tracking
AI-generated flashcards
Cloud Functions
Push notifications
Offline synchronization
Shared/public decks
Collaborative notes
Import from HackMD
Export to Anki
```

The MVP should remain simple and reliable.

---

# 18. UI / UX Direction

Style should be:

```text
clean
minimal
study-focused
desktop-first but responsive
```

Avoid overly decorative UI.

Important states to handle:

- loading
- saving
- authentication loading
- empty note list
- no flashcards detected
- Firestore failure
- authentication failure
- delete confirmation

Use Traditional Chinese for the primary UI.

Example navigation:

```text
TOEIC Flashcards

筆記
新增筆記
登出
```

Example buttons:

```text
新增筆記
儲存
編輯
刪除
開始複習
上一張
下一張
隨機排序
返回筆記
```

---

# 19. Suggested Source Structure

Recommended:

```text
src/
├── assets/
├── components/
│   ├── AppHeader.vue
│   ├── NoteCard.vue
│   ├── MarkdownEditor.vue
│   ├── MarkdownPreview.vue
│   └── Flashcard.vue
│
├── composables/
│   ├── useAuth.ts
│   └── useNotes.ts
│
├── lib/
│   ├── firebase.ts
│   └── flashcardParser.ts
│
├── router/
│   └── index.ts
│
├── types/
│   ├── note.ts
│   └── flashcard.ts
│
├── views/
│   ├── LoginView.vue
│   ├── NotesView.vue
│   ├── NoteEditorView.vue
│   ├── NoteDetailView.vue
│   └── ReviewView.vue
│
├── App.vue
└── main.ts
```

This can be adjusted if a cleaner architecture is preferred.

---

# 20. Firestore Service Layer

Do not scatter Firebase calls across view components.

Create reusable functions/composables such as:

```ts
getNotes(uid)
getNote(uid, noteId)
createNote(uid, data)
updateNote(uid, noteId, data)
deleteNote(uid, noteId)
```

Use a clear separation between:

```text
UI
business logic
Firebase access
Markdown parsing
```

---

# 21. Error Handling

All async Firebase operations should:

```text
try
catch
finally
```

The UI should not fail silently.

Show user-readable errors for:

- login failure
- note loading failure
- note save failure
- delete failure
- unavailable note

Log technical details to the console during development.

---

# 22. Delete Behavior

Deleting a note must require confirmation.

Example:

```text
確定要刪除「Test 1 - Part 7」嗎？
此操作無法復原。
```

Do not delete immediately from a single accidental click.

---

# 23. GitHub Pages Requirements

The app will be deployed to:

```text
https://giantriver.github.io/TOEIC-flashcards/
```

Configure Vite base path appropriately:

```ts
base: '/TOEIC-flashcards/'
```

GitHub Pages must support SPA navigation.

Prefer a deployment approach that avoids broken direct-route refreshes.

If using `createWebHistory()`, account for GitHub Pages limitations.

A simpler MVP option is:

```ts
createWebHashHistory()
```

so routes look like:

```text
https://giantriver.github.io/TOEIC-flashcards/#/notes
```

This is acceptable for the MVP and avoids GitHub Pages SPA 404 issues.

---

# 24. GitHub Actions Deployment

Create a GitHub Actions workflow to:

```text
npm ci
npm run build
deploy dist/
```

to GitHub Pages.

The workflow should use the official GitHub Pages deployment actions where practical.

Do not commit Firebase `.env` secrets/configuration values into the repository.

Use GitHub Actions repository variables/secrets for build-time environment variables if needed.

---

# 25. Development Commands

Expected:

```bash
npm install
npm run dev
npm run build
npm run preview
```

Add useful scripts if needed.

The project must build successfully with:

```bash
npm run build
```

before considering the task complete.

---

# 26. README

Create a useful `README.md` containing:

- project purpose
- features
- tech stack
- local setup
- Firebase setup
- required environment variables
- development commands
- deployment instructions
- Markdown flashcard syntax
- sample note

Do not put real Firebase config values into the README.

---

# 27. `.gitignore`

Ensure at least:

```text
node_modules
dist
.env
.env.local
.env.*.local
```

Do not ignore:

```text
.env.example
```

---

# 28. MVP Acceptance Criteria

The MVP is complete when all of the following work:

### Authentication

- [ ] User can sign in with Google.
- [ ] User remains signed in after refresh.
- [ ] User can sign out.
- [ ] Unauthenticated users cannot access note routes.

### Notes

- [ ] User can create a Markdown note.
- [ ] User can edit the note.
- [ ] User can delete the note.
- [ ] User can view all their notes.
- [ ] Notes are stored in Firestore.
- [ ] Notes belonging to another UID cannot be accessed.

### Markdown

- [ ] Markdown renders correctly.
- [ ] Markdown output is sanitized.
- [ ] Normal Markdown syntax remains usable.
- [ ] Designated vocabulary syntax is parsed correctly.

### Flashcards

- [ ] One note produces one independent deck.
- [ ] Cards are generated from the current note only.
- [ ] Front shows vocabulary / phrase.
- [ ] Back shows part of speech and meaning.
- [ ] Supplementary blockquotes can appear on the back.
- [ ] Card flip works.
- [ ] Previous works.
- [ ] Next works.
- [ ] Shuffle works.
- [ ] Empty deck state is handled.

### Deployment

- [ ] Production build succeeds.
- [ ] GitHub Pages loads successfully.
- [ ] Google Sign-In works from GitHub Pages.
- [ ] Refresh/navigation does not lead to an unrecoverable 404.
- [ ] Firestore read/write works in production.

---

# 29. Development Order

Implement in this order:

## Phase 1 — Bootstrap

1. Initialize Vue 3 + Vite + TypeScript.
2. Install dependencies.
3. Configure Vue Router.
4. Configure GitHub Pages base path.
5. Add `.env.example`.

## Phase 2 — Firebase

1. Initialize Firebase.
2. Implement auth state listener.
3. Implement Google Sign-In.
4. Implement Sign-Out.
5. Add route guards.

## Phase 3 — Firestore Notes

1. Create note type.
2. Create Firestore service/composable.
3. List notes.
4. Create note.
5. Edit note.
6. Delete note.
7. View note.

## Phase 4 — Markdown

1. Add Markdown renderer.
2. Add sanitization.
3. Build editor + preview.
4. Add example content.

## Phase 5 — Flashcards

1. Implement parser.
2. Unit-test parser if practical.
3. Generate deck from selected note.
4. Build flip card component.
5. Previous / Next.
6. Shuffle.
7. Empty state.

## Phase 6 — Polish

1. Loading states.
2. Error states.
3. Delete confirmation.
4. Responsive layout.
5. Keyboard shortcuts if practical.

## Phase 7 — Deployment

1. Production build.
2. GitHub Actions.
3. GitHub Pages deployment.
4. Verify Firebase Authentication.
5. Verify Firestore production behavior.

---

# 30. Important Implementation Principles

1. Markdown notes are the source of truth.
2. Do not duplicate flashcard content into Firestore in the MVP.
3. Keep the Firebase data model minimal.
4. Do not expose another user's data.
5. Keep parsing rules deterministic.
6. Do not make the parser guess arbitrary Markdown.
7. Keep components reasonably small.
8. Keep Firebase logic out of presentation components.
9. Prefer simple solutions over premature abstraction.
10. Ensure the app can be deployed and actually used before adding optional features.

---

# 31. Codex Instructions

Please inspect the existing repository before making changes.

Then:

1. Explain briefly what currently exists.
2. Implement the project incrementally.
3. Do not overwrite useful existing files without checking them first.
4. Keep changes focused on this plan.
5. Run the project locally when possible.
6. Run:

```bash
npm run build
```

before finishing.

7. Fix any TypeScript/build errors.
8. Update README documentation.
9. Summarize:
   - files created
   - files modified
   - Firebase assumptions
   - environment variables required
   - remaining manual Firebase/GitHub setup, if any

If any requirement conflicts with the current repository structure, choose the simplest maintainable approach and document the decision.

Do not implement out-of-scope features before the MVP is complete.

---

# 32. Post-MVP: Starred Review Cards

Users can mark a card as **starred** when they cannot recall it confidently. This is a lightweight "needs practice" marker, not a spaced-repetition or scoring system.

## Behavior

- Show a star icon button in the top-right corner of both sides of a flashcard.
- An outlined star means the card is not marked; a filled warm-gold star means it is in the needs-practice list.
- Star button interactions must not flip the card.
- Persist the state per user and per note so it remains available after refresh and across devices.
- Provide `All` and `Needs practice` review modes. The latter includes only starred cards.
- Reset the card position to the first card and show its front whenever the review mode changes.
- Show a clear empty state when no cards are starred.

## Firestore Data Model

Do not store generated card content. Store only review metadata in a note subcollection:

```text
users/{uid}/notes/{noteId}/progress/{cardId}
  starred: true
  updatedAt: Timestamp
```

`cardId` must be a deterministic identifier derived from the card's vocabulary, part of speech, and meaning. Do not use its index in the parsed deck, because note edits can reorder cards.

## YouGlish Pronunciation Link

- Show a YouGlish pronunciation button beside the star button on each card side.
- Open a new tab using `https://youglish.com/pronounce/{encoded-card-front}/english`.
- Encode the vocabulary or phrase with `encodeURIComponent` so multi-word phrases form a valid URL.
- The external-link interaction must not flip the card.

The Firestore rules must allow the signed-in owner to access this nested collection:

```js
match /users/{uid}/notes/{noteId}/progress/{cardId} {
  allow read, write: if request.auth != null
                     && request.auth.uid == uid;
}
```
