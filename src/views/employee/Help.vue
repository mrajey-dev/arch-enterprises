<template>
  <div class="layout">
    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="announcement-board" v-if="!isMobile || !isSidebarVisible">
        <div class="qa-container">
          <!-- Mobile Header -->
          <div class="mobile-header" v-if="isMobile">
           
            <div class="mobile-title">
              <i class="fas fa-microscope"></i>
              <span>RCA</span>
            </div>
            <div class="mobile-stats-badge">
              <span>{{ questions.length }}</span>
            </div>
          </div>

          <!-- Desktop Header -->
          <div class="qa-header desktop-only">
            <div class="header-content">
              <div class="title-section">
                <div class="icon-badge">
                  <i class="fas fa-microscope"></i>
                </div>
                <div>
                  <h1>Root Cause Analysis</h1>
                  <p>Document, discuss, and resolve technical issues collaboratively</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Ask Question Box - Mobile Optimized -->
          <div class="ask-card" :class="{ 'mobile-card': isMobile }">
            <div class="card-header" :class="{ 'mobile-header-flex': isMobile }">
              <div class="avatar-large" :style="{ backgroundColor: getAvatarColor(authUser.id) }">
                {{ getUserInitials(authUser.handle) }}
              </div>
              <div class="input-wrapper">
                <textarea
                  v-model="newQuestion"
                  placeholder="Describe the problem or incident you're analyzing..."
                  rows="2"
                  @input="onMentionInput($event, 'question')"
                  @keydown="onMentionKeydown"
                  class="smart-input"
                  :class="{ 'mobile-input': isMobile }"
                ></textarea>
                <div class="input-actions" :class="{ 'mobile-actions': isMobile }">
                  <label class="attach-btn" :class="{ 'mobile-btn': isMobile }">
                    <i class="fas fa-image"></i>
                    <span v-if="!isMobile">Add image</span>
                    <input
                      type="file"
                      accept="image/*"
                      ref="questionImageInput"
                      @change="handleQuestionImage"
                      hidden
                    />
                  </label>
                  <button class="submit-btn" :class="{ 'mobile-btn': isMobile }" @click="addQuestion" :disabled="!newQuestion.trim() && !questionImage">
                    <i class="fas fa-paper-plane"></i>
                    <span v-if="!isMobile">Post Issue</span>
                  </button>
                </div>
              </div>
            </div>
            <p v-if="questionError" class="error-message">{{ questionError }}</p>
          </div>

          <!-- Question List -->
          <div class="questions-feed">
            <div
              class="question-card"
              v-for="(q, idx) in questions"
              :key="q.id"
              :class="{ 'expanded': q.showAnswers, 'mobile-card': isMobile }"
            >
              <div class="question-header" :class="{ 'mobile-header-flex': isMobile }">
                <div class="user-info">
                  <div class="avatar" :style="{ backgroundColor: getAvatarColor(q.user_id) }">
                    {{ capitalizeHandle(q.user?.handle || 'A')[0] }}
                  </div>
                  <div class="meta">
                    <h4>{{ capitalizeHandle(q.user?.handle) || 'Anonymous' }}</h4>
                    <div class="time-badge">
                      <i class="far fa-clock"></i>
                      <span>{{ formatTimeAgo(q.created_at) }}</span>
                    </div>
                  </div>
                </div>
                <div class="qa-actions" :class="{ 'mobile-actions': isMobile }">
                  <button v-if="canModify(q) && q.answers.length === 0" class="icon-btn edit" @click="editQuestion(q)" title="Edit">
                    <i class="fas fa-pen"></i>
                  </button>
                  <button v-if="canModify(q) && q.answers.length === 0" class="icon-btn delete" @click="deleteQuestion(q)" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                  <button class="icon-btn expand" @click="toggleAnswers(q)" :title="q.showAnswers ? 'Hide replies' : 'Show replies'">
                    <i :class="q.showAnswers ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                    <span class="reply-count" v-if="q.answers.length > 0">{{ q.answers.length }}</span>
                  </button>
                </div>
              </div>

              <!-- Question Content -->
              <div class="question-body" :class="{ 'mobile-body': isMobile }" v-if="!q.isEditing">
                <p class="question-text" v-html="highlightMentions(q.question)"></p>
                <div v-if="q.image_url" class="image-preview" @click="openImage(q.image_url)">
                  <img :src="q.image_url" alt="Question attachment" />
                  <div class="image-overlay">
                    <i class="fas fa-search-plus"></i>
                  </div>
                </div>
              </div>

              <div class="question-body" :class="{ 'mobile-body': isMobile }" v-else>
                <textarea v-model="q.editText" class="edit-textarea" :class="{ 'mobile-input': isMobile }" rows="3"></textarea>
                <div class="edit-actions" :class="{ 'mobile-actions': isMobile }">
                  <button class="save-btn" @click="updateQuestion(q)"><i class="fas fa-check"></i> Save</button>
                  <button class="cancel-btn" @click="cancelEditQuestion(q)"><i class="fas fa-times"></i> Cancel</button>
                </div>
              </div>

              <!-- Answers Section - Mobile Optimized -->
              <transition name="slide-fade">
                <div v-show="q.showAnswers" class="answers-section" :class="{ 'mobile-section': isMobile }">
                  <div class="answers-timeline">
                    <div class="timeline-line"></div>
                    <div
                      class="answer-item"
                      v-for="a in [...q.answers].reverse()"
                      :key="a.id"
                    >
                      <div class="answer-avatar">
                        <div class="avatar small" :style="{ backgroundColor: getAvatarColor(a.user_id) }">
                          {{ capitalizeHandle(a.user?.handle || 'A')[0] }}
                        </div>
                      </div>
                      <div class="answer-bubble" :class="{ 'mobile-bubble': isMobile }">
                        <div class="answer-header" :class="{ 'mobile-header-flex': isMobile }">
                          <div class="answerer-info">
                            <strong>{{ capitalizeHandle(a.user?.handle) || 'Anonymous' }}</strong>
                            <span class="answer-time">{{ formatTimeAgo(a.created_at) }}</span>
                          </div>
                          <div class="answer-actions" v-if="canModify(a)">
                            <button class="icon-btn small" @click="editAnswer(a)" title="Edit"><i class="fas fa-pen"></i></button>
                            <button class="icon-btn small" @click="deleteAnswer(a, q)" title="Delete"><i class="fas fa-trash-alt"></i></button>
                          </div>
                        </div>
                        <div v-if="!a.isEditing">
                          <p v-html="highlightMentions(a.answer)"></p>
                          <div v-if="a.image_url" class="image-preview small" @click="openImage(a.image_url)">
                            <img :src="a.image_url" alt="Answer attachment" />
                          </div>
                        </div>
                        <div v-else>
                          <textarea v-model="a.editText" class="edit-textarea small" :class="{ 'mobile-input': isMobile }" rows="2"></textarea>
                          <div class="edit-actions inline" :class="{ 'mobile-actions': isMobile }">
                            <button class="save-btn" @click="updateAnswer(a)"><i class="fas fa-check"></i></button>
                            <button class="cancel-btn" @click="cancelEditAnswer(a)"><i class="fas fa-times"></i></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Reply Input - Mobile Optimized -->
                  <div class="reply-input-area" :class="{ 'mobile-reply': isMobile }">
                    <div class="avatar small" :style="{ backgroundColor: getAvatarColor(authUser.id) }">
                      {{ getUserInitials(authUser.handle) }}
                    </div>
                    <div class="reply-input-wrapper" :class="{ 'mobile-reply-wrapper': isMobile }">
                      <input
                        v-model="q.replyText"
                        placeholder="Write a reply... (use @ to mention someone)"
                        @input="onMentionInput($event, q)"
                        @keydown="onMentionKeydown"
                        class="reply-input"
                        :class="{ 'mobile-input': isMobile }"
                      />
                      <div class="reply-actions" :class="{ 'mobile-actions': isMobile }">
                        <label class="attach-icon">
                          <i class="fas fa-paperclip"></i>
                          <input
                            type="file"
                            accept="image/*"
                            @change="handleAnswerImage($event, q)"
                            hidden
                          />
                        </label>
                        <button class="send-reply" @click="addAnswer(q)" :disabled="!q.replyText.trim() && !q.replyImage">
                          <i class="fas fa-paper-plane"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <p v-if="answerError[q.id]" class="error-message small">{{ answerError[q.id] }}</p>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- Mention Dropdown - Mobile Optimized -->
        <div
          v-if="showMentionBox"
          class="mention-dropdown"
          :class="{ 'mobile-dropdown': isMobile }"
          :style="{ top: mentionPosition.top + 'px', left: mentionPosition.left + 'px' }"
        >
          <div class="mention-header">
            <i class="fas fa-at"></i> Mention someone
          </div>
          <div
            v-for="(user, index) in mentionUsers"
            :key="user.id"
            class="mention-option"
            :class="{ active: index === selectedMentionIndex }"
            @click="selectMention(user)"
          >
            <div class="mention-avatar" :style="{ backgroundColor: getAvatarColor(user.id) }">
              {{ (user.handle || 'U')[0].toUpperCase() }}
            </div>
            <span>@{{ user.handle }}</span>
          </div>
          <div v-if="mentionUsers.length === 0" class="mention-empty">
            No users found
          </div>
        </div>

        <!-- Image Preview Modal - Mobile Optimized -->
        <div v-if="showImageModal" class="image-modal" @click="closeImage">
          <div class="modal-content" @click.stop>
            <img :src="previewImage" class="modal-image" :class="{ 'mobile-image': isMobile }" />
            <button class="modal-close" @click="closeImage"><i class="fas fa-times"></i></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import axios from 'axios'

export default {
  name: 'Help',

  components: { Sidebar },

  data() {
    return {
      autoRefreshTimer: null,
      showImageModal: false,
      previewImage: null,
      questionError: '',
      answerError: {},
      authUser: {
        id: null,
        role: null,
        handle: null
      },
      latestMentionMessage: '',
      unreadMentionsCount: 0,
      notifications: [],
      selectedMentionIndex: 0,
      questions: [],
      newQuestion: '',
      questionImage: null,
      isMobile: false,
      isSidebarVisible: true,
      showMentionBox: false,
      mentionUsers: [],
      mentionQuery: '',
      mentionTarget: null,
      mentionPosition: { top: 0, left: 0 }
    }
  },

  mounted() {
    this.fetchQuestions()
    this.autoRefreshTimer = setInterval(() => {
      this.fetchQuestions()
    }, 5000)
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closeImage()
    })
    axios.get('/api/user').then(res => {
      this.authUser.id = res.data.id
      this.authUser.role = res.data.role
      this.authUser.handle = res.data.handle
    })
    document.addEventListener('click', this.closeMentionBox)
    axios.get('/api/mentions/unread-count')
      .then(res => {
        this.unreadMentionsCount = res.data.count
      })
      .catch(err => console.error('Failed to fetch unread mentions', err))
    this.fetchNotifications();
    this.fetchQuestions()
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
  },

  beforeUnmount() {
    clearInterval(this.autoRefreshTimer)
    document.removeEventListener('click', this.closeMentionBox)
    window.removeEventListener('resize', this.checkIfMobile)
  },

  methods: {
    getAvatarColor(id) {
      const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']
      if (!id) return colors[0]
      return colors[id % colors.length]
    },
    getUserInitials(handle) {
      if (!handle) return 'U'
      return handle.slice(0, 2).toUpperCase()
    },
    formatTimeAgo(date) {
      if (!date) return ''
      const now = new Date()
      const past = new Date(date)
      const diffMs = now - past
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)
      
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      return past.toLocaleDateString()
    },
    openImage(src) {
      this.previewImage = src
      this.showImageModal = true
      document.body.style.overflow = 'hidden'
    },
    closeImage() {
      this.showImageModal = false
      this.previewImage = null
      document.body.style.overflow = ''
    },
    canModify(item) {
      return item.user_id === this.authUser.id || this.authUser.role === 'admin'
    },
    editQuestion(q) {
      q.isEditing = true
      q.editText = q.question
    },
    cancelEditQuestion(q) {
      q.isEditing = false
    },
    updateQuestion(q) {
      axios.put(`/api/qa/question/${q.id}`, {
        question: q.editText
      }).then(() => {
        q.question = q.editText
        q.isEditing = false
      })
    },
    deleteQuestion(q) {
      if (!confirm('Delete this question?')) return
      axios.delete(`/api/qa/question/${q.id}`)
        .then(() => {
          this.questions = this.questions.filter(x => x.id !== q.id)
        })
    },
    editAnswer(a) {
      a.isEditing = true
      a.editText = a.answer
    },
    cancelEditAnswer(a) {
      a.isEditing = false
    },
    updateAnswer(a) {
      axios.put(`/api/qa/answer/${a.id}`, {
        answer: a.editText
      }).then(() => {
        a.answer = a.editText
        a.isEditing = false
      })
    },
    deleteAnswer(a, q) {
      if (!confirm('Delete this answer?')) return
      axios.delete(`/api/qa/answer/${a.id}`)
        .then(() => {
          q.answers = q.answers.filter(x => x.id !== a.id)
        })
    },
    capitalizeHandle(handle) {
      if (!handle) return ''
      return handle.charAt(0).toUpperCase() + handle.slice(1)
    },
    onMentionKeydown(e) {
      if (!this.showMentionBox || !this.mentionUsers.length) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        this.selectedMentionIndex = (this.selectedMentionIndex + 1) % this.mentionUsers.length
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        this.selectedMentionIndex = (this.selectedMentionIndex - 1 + this.mentionUsers.length) % this.mentionUsers.length
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        this.selectMention(this.mentionUsers[this.selectedMentionIndex])
      }
      if (e.key === 'Escape') {
        this.showMentionBox = false
      }
    },
    onMentionInput(e, target) {
      const input = e.target
      const text = input.value
      const cursorPos = input.selectionStart
      const beforeCursor = text.slice(0, cursorPos)
      const match = beforeCursor.match(/@([A-Za-z0-9_]*)$/)
      if (!match) {
        this.showMentionBox = false
        return
      }
      const query = match[1].trim()
      this.mentionQuery = query
      this.mentionTarget = target
      this.selectedMentionIndex = 0
      this.setMentionPosition(input)
      axios.get('/api/qa/mention-users', { params: { q: query || '' } })
        .then(res => {
          this.mentionUsers = res.data
          this.showMentionBox = res.data.length > 0
        })
        .catch(() => {
          this.showMentionBox = false
        })
    },
    async fetchNotifications() {
      const res = await axios.get('/api/notifications');
      this.notifications = res.data;
      if (this.notifications.length) {
        const data = JSON.parse(this.notifications[0].data);
        this.latestMentionMessage = data.message ?? '';
      }
    },
    closeMentionBox(e) {
      if (!e.target.closest('.mention-dropdown')) {
        this.showMentionBox = false
      }
    },
    highlightMentions(text) {
      if (!text) return ''
      return text.replace(
        /@([A-Za-z0-9_]+)/g,
        '<span class="mention-highlight">@$1</span>'
      )
    },
    selectMention(user) {
      const isQuestion = this.mentionTarget === 'question'
      const text = isQuestion ? this.newQuestion : this.mentionTarget.replyText
      const inputEl = document.activeElement
      const cursorPos = inputEl.selectionStart
      const before = text.slice(0, cursorPos)
      const after = text.slice(cursorPos)
      const newBefore = before.replace(/@([A-Za-z0-9_]*)$/, `@${user.handle}`)
      const finalText = newBefore + ' ' + after
      if (isQuestion) {
        this.newQuestion = finalText
      } else {
        this.mentionTarget.replyText = finalText
      }
      this.showMentionBox = false
    },
    setMentionPosition(input) {
      const rect = input.getBoundingClientRect()
      this.mentionPosition = {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      }
    },
    fetchQuestions() {
      axios.get('/api/qa')
        .then(res => {
          const currentQuestions = this.questions || []
          this.questions = res.data.map((q, index) => {
            const oldQ = currentQuestions.find(x => x.id === q.id)
            return {
              ...q,
              creator_handle: q.creator_handle || q.creator_name,
              showAnswers: oldQ?.showAnswers ?? (index === 0),
              isEditing: oldQ?.isEditing ?? false,
              editText: oldQ?.editText ?? q.question,
              replyText: oldQ?.replyText ?? '',
              replyImage: null,
              answers: q.answers.map(a => {
                const oldA = oldQ?.answers?.find(x => x.id === a.id)
                return {
                  ...a,
                  creator_handle: a.creator_handle || a.creator_name,
                  isEditing: oldA?.isEditing ?? false,
                  editText: oldA?.editText ?? a.answer
                }
              })
            }
          })
        })
        .catch(err => console.error(err))
    },
    handleQuestionImage(e) {
      this.questionImage = e.target.files[0]
    },
    addQuestion() {
      this.questionError = ''
      if (!this.newQuestion.trim() && !this.questionImage) {
        this.questionError = 'Please enter text or upload an image'
        return
      }
      const formData = new FormData()
      if (this.newQuestion.trim()) {
        formData.append('question', this.newQuestion)
      }
      if (this.questionImage) {
        formData.append('image', this.questionImage)
      }
      axios.post('/api/qa/question', formData)
        .then(() => {
          this.newQuestion = ''
          this.questionImage = null
          this.questionError = ''
          this.fetchQuestions()
        })
    },
    handleAnswerImage(e, question) {
      question.replyImage = e.target.files[0]
    },
    addAnswer(question) {
      this.answerError[question.id] = ''
      if (!question.replyText.trim() && !question.replyImage) {
        this.answerError[question.id] = 'Please enter text or upload an image'
        return
      }
      const formData = new FormData()
      formData.append('question_id', question.id)
      if (question.replyText.trim()) {
        formData.append('answer', question.replyText)
      }
      if (question.replyImage) {
        formData.append('image', question.replyImage)
      }
      axios.post('/api/qa/answer', formData)
        .then(() => {
          question.replyText = ''
          question.replyImage = null
          this.answerError[question.id] = ''
          this.fetchQuestions()
        })
        .catch(err => {
          console.error('Answer submit failed', err)
        })
    },
    toggleAnswers(question) {
      question.showAnswers = !question.showAnswers
    },
    formatDateTime(date) {
      if (!date) return ''
      return new Date(date).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    }
  }
}
</script>

<style scoped>
/* Import Font Awesome */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');

:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --primary-light: #818cf8;
  --bg-light: #f8fafc;
  --surface: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border: #e2e8f0;
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.main-content {
  display: flex;
  flex: 1;
  padding: 24px;
  gap: 24px;
}

.announcement-board {
  flex: 1;
  min-width: 0;
}

/* QA Container */
.qa-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* Mobile Header */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-primary);
  padding: 8px;
  cursor: pointer;
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.mobile-title i {
  color: var(--primary);
}

.mobile-stats-badge {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

/* Header Section */
.qa-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-badge {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.3);
}

.icon-badge i {
  font-size: 28px;
  color: white;
}

.title-section h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.title-section p {
  color: var(--text-secondary);
  font-size: 14px;
}

/* Ask Card */
.ask-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 20px;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.ask-card:focus-within {
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.12);
  border-color: var(--primary-light);
}

.ask-card.mobile-card {
  padding: 16px;
  border-radius: 20px;
}

.card-header {
  display: flex;
  gap: 16px;
}

.card-header.mobile-header-flex {
  flex-direction: column;
  gap: 12px;
}

.avatar-large {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
  color: white;
  flex-shrink: 0;
}

.input-wrapper {
  flex: 1;
}

.smart-input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
  background: var(--bg-light);
}

.smart-input:focus {
  outline: none;
  border-color: var(--primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.smart-input.mobile-input {
  font-size: 16px;
  padding: 12px 14px;
  border-radius: 14px;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 12px;
  gap: 8px;
}

.input-actions.mobile-actions {
  flex-direction: column;
  gap: 8px;
  align-items: stretch;
}

.attach-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-light);
  border-radius: 30px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.attach-btn:hover {
  background: var(--border);
  color: var(--primary);
}

.attach-btn.mobile-btn {
  justify-content: center;
  padding: 10px;
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: black;
  border: none;
  border-radius: 30px;
  color: white;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn.mobile-btn {
  justify-content: center;
  padding: 10px;
  width: 100%;
}

.error-message {
  color: var(--error);
  font-size: 12px;
  margin-top: 12px;
  padding-left: 64px;
}

.error-message.small {
  padding-left: 0;
  margin-top: 8px;
}

/* Questions Feed */
.questions-feed {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 20px;
  transition: all 0.2s ease;
}

.question-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.question-card.expanded {
  border-color: var(--primary-light);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.08);
}

.question-card.mobile-card {
  padding: 16px;
  border-radius: 16px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.question-header.mobile-header-flex {
  flex-direction: column;
  gap: 12px;
}

.user-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  color: white;
}

.avatar.small {
  width: 32px;
  height: 32px;
  font-size: 13px;
}

.meta h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.time-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.time-badge i {
  font-size: 11px;
}

.qa-actions {
  display: flex;
  gap: 8px;
}

.qa-actions.mobile-actions {
  justify-content: flex-end;
  width: 100%;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  position: relative;
}

.icon-btn:hover {
  background: var(--bg-light);
  color: var(--primary);
}

.icon-btn.edit:hover {
  color: var(--warning);
}

.icon-btn.delete:hover {
  color: var(--error);
  background: rgba(239, 68, 68, 0.1);
}

.reply-count {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--primary);
  color: white;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 20px;
  font-weight: 600;
}

.question-body {
  margin-bottom: 16px;
  padding-left: 52px;
}

.question-body.mobile-body {
  padding-left: 0;
}

.question-text {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.image-preview {
  position: relative;
  display: inline-block;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  margin-top: 8px;
}

.image-preview img {
  max-width: 200px;
  max-height: 150px;
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.2s;
}

.image-preview.small img {
  max-width: 120px;
  max-height: 90px;
}

.image-preview:hover img {
  transform: scale(1.02);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.image-overlay i {
  color: white;
  font-size: 24px;
}

.edit-textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 12px;
}

.edit-textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.edit-textarea.mobile-input {
  font-size: 16px;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.edit-actions.mobile-actions {
  flex-direction: column;
}

.save-btn, .cancel-btn {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn {
  background: var(--success);
  border: none;
  color: white;
}

.save-btn:hover {
  background: #0d9488;
}

.cancel-btn {
  background: var(--bg-light);
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.cancel-btn:hover {
  background: var(--border);
}

/* Answers Section */
.answers-section {
  margin-top: 20px;
  padding-left: 52px;
  border-top: 1px solid var(--border);
  padding-top: 20px;
}

.answers-section.mobile-section {
  padding-left: 0;
}

.answers-timeline {
  position: relative;
  margin-bottom: 20px;
}

.timeline-line {
  position: absolute;
  left: 16px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border);
}

.answer-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  position: relative;
}

.answer-avatar {
  flex-shrink: 0;
}

.answer-bubble {
  flex: 1;
  background: var(--bg-light);
  border-radius: 16px;
  padding: 12px 16px;
}

.answer-bubble.mobile-bubble {
  padding: 10px 12px;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.answer-header.mobile-header-flex {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.answerer-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.answerer-info strong {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.answer-time {
  font-size: 11px;
  color: var(--text-secondary);
}

.answer-actions {
  display: flex;
  gap: 4px;
}

.icon-btn.small {
  width: 28px;
  height: 28px;
}

.answer-bubble p {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
}

/* Reply Input */
.reply-input-area {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-top: 16px;
}

.reply-input-area.mobile-reply {
  flex-direction: column;
  gap: 8px;
}

.reply-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-light);
  border-radius: 30px;
  padding: 4px 12px;
  border: 1px solid var(--border);
  transition: all 0.2s;
}

.reply-input-wrapper:focus-within {
  border-color: var(--primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.reply-input-wrapper.mobile-reply-wrapper {
  border-radius: 20px;
  padding: 4px 10px;
}

.reply-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px 0;
  font-size: 13px;
  font-family: inherit;
}

.reply-input:focus {
  outline: none;
}

.reply-input.mobile-input {
  font-size: 15px;
  padding: 8px 0;
}

.reply-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reply-actions.mobile-actions {
  gap: 4px;
}

.attach-icon {
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.2s;
  display: flex;
  align-items: center;
}

.attach-icon:hover {
  color: var(--primary);
}

.send-reply {
  background: transparent;
  border: none;
  color: var(--primary);
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.send-reply:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.1);
  transform: translateX(2px);
}

.send-reply:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Mention Dropdown */
.mention-dropdown {
  position: absolute;
  background: var(--surface);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  width: 260px;
  max-height: 280px;
  overflow-y: auto;
  z-index: 1000;
  border: 1px solid var(--border);
}

.mention-dropdown.mobile-dropdown {
  width: 220px;
  max-height: 200px;
  border-radius: 10px;
}

.mention-header {
  padding: 10px 12px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
  background: var(--bg-light);
}

.mention-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.mention-option:hover,
.mention-option.active {
  background: var(--bg-light);
}

.mention-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.mention-empty {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
}

/* Image Modal */
.image-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  cursor: pointer;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  cursor: default;
}

.modal-image {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.modal-image.mobile-image {
  border-radius: 8px;
}

.modal-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.8);
}

/* Animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Mention Highlight */
:deep(.mention-highlight) {
  background: rgba(99, 102, 241, 0.12);
  color: var(--primary);
  font-weight: 500;
  padding: 2px 4px;
  border-radius: 6px;
  display: inline-block;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .main-content {
    padding: 12px;
    flex-direction: column;
  }
  
  .qa-container {
    width: 100%;
  }
  
  .mobile-header {
    display: flex;
  }
  
  .qa-header {
    display: none;
  }
  
  .title-section h1 {
    font-size: 22px;
  }
  
  .icon-badge {
    width: 44px;
    height: 44px;
  }
  
  .icon-badge i {
    font-size: 22px;
  }
  
  .question-body {
    padding-left: 0;
  }
  
  .answers-section {
    padding-left: 0;
  }
  
  .timeline-line {
    left: 16px;
  }
  
  .card-header {
    flex-direction: column;
  }
  
  .avatar-large {
    align-self: flex-start;
  }
  
  .error-message {
    padding-left: 0;
  }
  
  .input-actions {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .attach-btn {
    justify-content: center;
  }
  
  .submit-btn {
    justify-content: center;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .question-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .qa-actions {
    justify-content: flex-start;
    width: 100%;
  }
  
  .answer-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .reply-input-area {
    flex-direction: column;
    gap: 8px;
  }
  
  .reply-input-wrapper {
    border-radius: 20px;
  }
  
  .edit-actions {
    flex-direction: column;
  }
  
  .save-btn, .cancel-btn {
    width: 100%;
    justify-content: center;
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }
  
  .ask-card {
    padding: 12px;
  }
  
  .question-card {
    padding: 12px;
  }
  
  .answer-bubble {
    padding: 10px 12px;
  }
  
  .mention-dropdown {
    width: 200px;
  }
  
  .modal-image {
    max-width: 95vw;
  }
}
</style>