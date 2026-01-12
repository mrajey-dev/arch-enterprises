<template>
  <div class="layout">
    <!-- Header -->
    <header class="header">
      <div class="head-title"><a href="https://employees.archenterprises.co.in/">
        <img
          src="https://archenterprises.co.in/ajay/ajay.png"
          style="height: 65px;"
          alt="Logo"
        />
         </a>
         🅰️RCH360⚙️
     
      </div>
     
      <i
        class="fas fa-bars mobile-menu-icon"
        v-if="isMobile"
        @click="toggleSidebar"
      ></i>
    <!-- <div class="notification-bell-wrapper">
  <i class="fas fa-bell"></i>
  <span v-if="unreadMentionsCount" class="badge">{{ unreadMentionsCount }}</span>
</div> -->


    </header>

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="announcement-board" v-if="!isMobile || !isSidebarVisible">
        <div class="qa-board">
          <h2>Problem Capturing & RCA</h2>

          <!-- Ask Question -->
          <div class="ask-box">
         <textarea
  v-model="newQuestion"
  placeholder="Describe the problem..."
  @input="onMentionInput($event, 'question')"
  @keydown="onMentionKeydown"
/>



            <input
              type="file"
              accept="image/*"
              ref="questionImageInput"
              @change="handleQuestionImage"
            />

            <button @click="addQuestion">Post Question</button>
          </div>

          <!-- Question List -->
          <div
            class="question-card"
            v-for="q in questions"
            :key="q.id"
          >
            <div class="question-header">
              <h5>{{ q.creator_name || 'ADMIN' }}</h5>
              <span class="date">{{ formatDate(q.created_at) }}</span>

              <i
                class="fas"
                :class="q.showAnswers ? 'fa-chevron-up' : 'fa-chevron-down'"
                @click="toggleAnswers(q)"
                style="cursor:pointer;margin-left:10px;"
              ></i>
            </div>

           <p class="question-text" v-html="highlightMentions(q.question)"></p>

            <img
              v-if="q.image_url"
              :src="q.image_url"
              class="qa-image"
            />

            <!-- Answers -->
            <transition name="slide-fade">
              <div v-show="q.showAnswers">
               <div
  class="answer-box"
  v-for="a in [...q.answers].reverse()"
  :key="a.id"
>

  <h5>{{ a.creator_name || 'ADMIN' }}</h5>
<p v-html="highlightMentions(a.answer)"></p>

  <img v-if="a.image_url" :src="a.image_url" class="qa-image" />

 
</div>


                <!-- Add Answer -->
                <div class="reply-box">
<input
  v-model="q.replyText"
  placeholder="Write an answer..."
  @input="onMentionInput($event, q)"
  @keydown="onMentionKeydown"
/>


                  <input
                    type="file"
                    accept="image/*"
                    @change="handleAnswerImage($event, q)"
                  />
                  <button @click="addAnswer(q)">Reply</button>
                </div>
              </div>
            </transition>
          </div>
        </div>
        <!-- Mention Dropdown -->
<div
  v-if="showMentionBox"
  class="mention-box"
  :style="{ top: mentionPosition.top + 'px', left: mentionPosition.left + 'px' }"
>
  <div
  v-for="(user, index) in mentionUsers"
  :key="user.id"
  class="mention-item"
  :class="{ active: index === selectedMentionIndex }"
  @click="selectMention(user)"
>
 @{{ user.handle }}
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
      latestMentionMessage: '',
       unreadMentionsCount: 0,
       notifications: [],
       selectedMentionIndex: 0,
      questions: [],
      newQuestion: '',
      questionImage: null,
      isMobile: false,
      isSidebarVisible: true,
       // ✅ MENTION SYSTEM
    showMentionBox: false,
    mentionUsers: [],
    mentionQuery: '',
    mentionTarget: null,
    mentionPosition: { top: 0, left: 0 }
    }
  },

  mounted() {
    document.addEventListener('click', this.closeMentionBox)

   axios.get('/api/mentions/unread-count')
  .then(res => {
    console.log(res.data)  // Check if it has { count: number }
    this.unreadMentionsCount = res.data.count
  })
  .catch(err => console.error('Failed to fetch unread mentions', err))
this.fetchNotifications();
    this.fetchQuestions()
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.closeMentionBox)

    window.removeEventListener('resize', this.checkIfMobile)
  },

  methods: {
    onMentionKeydown(e) {
  if (!this.showMentionBox || !this.mentionUsers.length) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    this.selectedMentionIndex =
      (this.selectedMentionIndex + 1) % this.mentionUsers.length
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    this.selectedMentionIndex =
      (this.selectedMentionIndex - 1 + this.mentionUsers.length) %
      this.mentionUsers.length
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

  const match = beforeCursor.match(/@([A-Za-z]+(?:\s+[A-Za-z]+){0,4})$/)
  if (!match) {
    this.showMentionBox = false
    return
  }

  const query = match[1].trim()
  if (!query) {
    this.showMentionBox = false
    return
  }

  this.mentionQuery = query
  this.mentionTarget = target
  this.selectedMentionIndex = 0
  this.setMentionPosition(input)

  axios.get('/api/qa/mention-users', { params: { q: query } })
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

    // extract latest message
    if (this.notifications.length) {
      const data = JSON.parse(this.notifications[0].data);
      this.latestMentionMessage = data.message ?? '';
    }
  },
    closeMentionBox(e) {
  if (!e.target.closest('.mention-box')) {
    this.showMentionBox = false
  }
},

highlightMentions(text) {
  if (!text) return ''
  // Match @handles (alphanumeric + underscores, e.g., @ajay_123)
  return text.replace(
    /@([A-Za-z0-9_]+)/g,
    '<span class="mention-highlight">@$1</span>'
  )
},




onMentionKeyup(e, target) {
  const input = e.target
  const text = input.value
  const cursorPos = input.selectionStart

  // Text before cursor
  const beforeCursor = text.slice(0, cursorPos)

  // Match last @mention (1–5 words, multi-word support)
  const mentionMatch = beforeCursor.match(/@([A-Za-z]+(?:\s+[A-Za-z]+){0,4})$/)
  if (!mentionMatch) {
    this.showMentionBox = false
    return
  }

  const query = mentionMatch[1].trim()
  if (!query) {
    this.showMentionBox = false
    return
  }

  // ✅ Store mention info
  this.mentionQuery = query
  this.mentionTarget = target
  this.selectedMentionIndex = 0
  this.setMentionPosition(input)

  // Keyboard navigation
  if (this.showMentionBox && this.mentionUsers.length) {
    if (e.key === 'ArrowDown') {
      this.selectedMentionIndex =
        (this.selectedMentionIndex + 1) % this.mentionUsers.length
      return
    }

    if (e.key === 'ArrowUp') {
      this.selectedMentionIndex =
        (this.selectedMentionIndex - 1 + this.mentionUsers.length) %
        this.mentionUsers.length
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      this.selectMention(this.mentionUsers[this.selectedMentionIndex])
      return
    }

    if (e.key === 'Escape') {
      this.showMentionBox = false
      return
    }
  }

  // Fetch matching users from API
  axios.get('/api/qa/mention-users', { params: { q: query } })
    .then(res => {
      this.mentionUsers = res.data
      this.showMentionBox = res.data.length > 0
    })
    .catch(() => {
      this.showMentionBox = false
    })
},






selectMention(user) {
  const isQuestion = this.mentionTarget === 'question'
  const text = isQuestion ? this.newQuestion : this.mentionTarget.replyText
  const inputEl = document.activeElement
  const cursorPos = inputEl.selectionStart

  const before = text.slice(0, cursorPos)
  const after = text.slice(cursorPos)

  // ✅ replace EXACT same pattern used while typing
  const newBefore = before.replace(
    /@([A-Za-z]+(?:\s+[A-Za-z]+){0,4})$/,
    `@${user.handle}`
  )

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

    toggleLike(answer) {
  axios.post(`/api/qa/answer/${answer.id}/like`)
    .then(res => {
      answer.is_liked = res.data.liked;
      answer.likes_count = res.data.likes_count;
    })
},

    /* ===============================
       FETCH QUESTIONS
    =============================== */
    fetchQuestions() {
      axios.get('/api/qa')
        .then(res => {
          this.questions = res.data.map(q => ({
            ...q,
            showAnswers: false,
            replyText: '',
            replyImage: null
          }))
        })
        .catch(err => console.error(err))
    },

    /* ===============================
       POST QUESTION
    =============================== */
    handleQuestionImage(e) {
      this.questionImage = e.target.files[0]
    },

    addQuestion() {
      if (!this.newQuestion.trim()) return

      const formData = new FormData()
      formData.append('question', this.newQuestion)

      if (this.questionImage) {
        formData.append('image', this.questionImage)
      }

      axios.post('/api/qa/question', formData)
        .then(() => {
          this.newQuestion = ''
          this.questionImage = null
          this.fetchQuestions()
        })
    },

    /* ===============================
       POST ANSWER
    =============================== */
    handleAnswerImage(e, question) {
      question.replyImage = e.target.files[0]
    },

    addAnswer(question) {
      if (!question.replyText.trim()) return

      const formData = new FormData()
      formData.append('question_id', question.id)
      formData.append('answer', question.replyText)

      if (question.replyImage) {
        formData.append('image', question.replyImage)
      }

      axios.post('/api/qa/answer', formData)
        .then(() => {
          question.replyText = ''
          question.replyImage = null
          this.fetchQuestions()
        })
    },

    /* ===============================
       UI HELPERS
    =============================== */
    toggleAnswers(question) {
      question.showAnswers = !question.showAnswers
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('en-GB')
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
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
.notification-bell-wrapper {
  position: relative;
  text-align: center;
}

.notification-short-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mention-item.active {
  background: #1976d2;
  color: white;
}

.mention-highlight {
  color: #1976d2;
  font-weight: 600;
  background: rgba(25,118,210,0.1);
  padding: 2px 4px;
  border-radius: 4px;
}

.loader {
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}



.mobile-menu-icon {
  font-size: 22px;
  margin-left: 10px;
  cursor: pointer;
  display: none;
}

@media (max-width: 768px) {
  .mobile-menu-icon {
    display: inline-block;
  }
.main-content {
  align-self: center;
  width: 100%;
        background-color: #f6f7fb;

}
  .sidebar {
    position: absolute;
    z-index: 1000;
    width: 240px;
    height: 100vh;
    background-color: #2c3e50;
  }

  .expanded-content {
    margin-left: 0 !important;
    transition: margin 0.3s ease-in-out;
  }
}


.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-header h3 {
  font-size: 18px;
  color: #427172;
  margin: 0;
}

.card-header .date {
  font-size: 13px;
  color: #888;
}

.card-message {
  font-size: 15px;
  color: #444;
  margin-top: 5px;
  line-height: 1.5;
}
.password-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-wrapper input {
  flex: 1;
}

.toggle-btn,
.generate-btn {
  padding: 6px 10px;
  background-color: #5f9ea0;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.toggle-btn i {
  pointer-events: none;
}

.toggle-btn:hover,
.generate-btn:hover {
  background-color: #426b6c;
}


/* Layout */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #427778;
}

/* Header */
.header {
  font-size: 17px;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, .3);
 background-color: cadetblue; 
  color: white;
  padding: 0 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo {
  font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
}

.menu-btn, .logout-btn {
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}


/* Main Content */
.main-content {
  display: flex;
  flex: 1;
  padding: 30px;
  gap: 20px;
}

/* Sidebar */
.sidebar {
  background-color: #ffffff;
  width: 220px;
  padding: 25px 20px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  font-weight: 600;
  color: #495057;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 14px 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sidebar li:hover {
  background-color: #5f9ea0;
  color: white;
  font-weight: 700;
}

/* Content Section */
.content {
  flex: 1;
  background-color: white;
  padding: 30px 40px;
  border-radius: 15px;
  box-shadow: 0 5px 30px rgba(0,0,0,0.08);
  overflow-x: auto;
}

h2 {
      text-transform: uppercase;
  margin-bottom: 30px;
  color: #417475;
  font-weight: 800;
  font-size: 21px;
  border-bottom: 2px solid #5f9ea0;
  padding-bottom: 8px;
}



/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 97vw;
  height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 0 15px;
}

/* Modal Card */
.modal-card {
  background-color: white;
  width: 100%;
  border-radius: 20px;
  padding: 40px 50px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  max-height: 86vh;
  overflow-y: auto;
  animation: slideDown 0.4s ease forwards;
  position: relative;

  /* Hide scrollbar but allow scroll */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.modal-card::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}


@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal Title */
.modal-title {
  font-size: 32px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 35px;
  color: #518587;
  letter-spacing: 1.3px;
}



/* Modal Buttons */
.modal-buttons {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}



/* Fade Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.35s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 900px) {
  .form-row .input-group {
    flex: 1 1 100%;
  }

  .modal-card {
    padding: 30px 25px;
  }
}

@media (max-width: 480px) {
  .header {
    flex-direction: row;
    gap: 10px;
    font-size: 17px;
  }
  .menu-btn, .logout-btn {
    width: 100%;
  }
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 35px;
}

.logo-img {
  height: 45px;
}

.header-title {
  flex: 1;
  text-align: center;
  color: white;
  margin: 0;
  font-size: 1.3rem;
}

.mobile-menu-icon {
  font-size: 22px;
  color: white;
  cursor: pointer;
}

.dsi-input-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-bottom: 15px;
}


@media (max-width: 768px) {
  
}

.qa-board {
  max-width: 900px;
  margin: auto;
}

.ask-box {
  background: #c0d9d9;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  /* box-shadow: 0 4px 15px rgba(0,0,0,0.05); */
}

.ask-box input,
.ask-box textarea {
  width: 95%;
  margin-bottom: 10px;
  background-color: white;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.ask-box button {
  background: cadetblue;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.question-card {
  background: #c0d9d9;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
}

.question-header {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #555;
}

.question-text {
  font-size: 16px;
  margin: 15px 0;
  color: #333;
}

.answer-box {
  background: #ffffff;
    padding: 10px 15px;
    color: #000000;
    border-radius: 8px;
    margin-bottom: 10px;
}

.reply-box {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.reply-box input {
  flex: 1;
    padding: 8px;
    color: #ffffff;
    background-color: #4b8c8f;
    border-radius: 6px;
    border: 1px solid #ffffff;
}

.reply-box button {
  background: #5f9ea0;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
}

.qa-image {
  margin-top: 8px;
  max-width: 260px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

/* Slide down/up animation for answers */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}
.slide-fade-enter-to,
.slide-fade-leave-from {
  max-height: 1000px; /* large enough for content */
  opacity: 1;
  overflow: hidden;
}
h5{
      color: #32696b;
}
p{
  font-family: math;
}
.reply-box input::placeholder {
  color: white;       /* placeholder text color */
  opacity: 1;         /* ensure full opacity across browsers */
}
.reply-box input {
  color: white;       /* text color inside input */
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 15px;
  }

  /* Sidebar overlay */
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 240px;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.show {
    transform: translateX(0);
  }

  .announcement-board {
    width: 100%;
    padding: 0;
  }

  .qa-board {
    max-width: 100%;
    margin: 0;
  }

  .ask-box input,
  .ask-box textarea,
  .reply-box input {
    width: 94%;
  }

  .reply-box {
    flex-direction: column;
    gap: 10px;
  }

  .reply-box button {
    width: 21%;
  }

  .qa-image {
    max-width: 100%;
    height: auto;
  }

  .question-card {
    padding: 15px;
  }

  .ask-box {
    padding: 15px;
  }

  .header {
    flex-wrap: wrap;
    font-size: 16px;
    padding: 10px 15px;
  }

  .mobile-menu-icon {
    display: inline-block;
  }
  h2{
        font-size: 17px;
    place-self: anchor-center;
  }
}
button{

    border-color: rgba(255, 255, 255, 0)!important;
}
.mention-box {
  position: absolute;
  background: #fff;
  border: 1px solid #ddd;
  width: 220px;
  max-height: 160px;
  overflow-y: auto;
  z-index: 9999;
  border-radius: 6px;
}

.mention-item {
  padding: 8px;
  cursor: pointer;
}

.mention-item:hover {
  background: #f2f2f2;
}

.notification-bell-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.notification-bell-wrapper .badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.7rem;
}
:deep(.mention-highlight) {
  font-weight: 800!important;
  color: #0a58ca!important; /* optional */
}

.head-title{
      color: white;
    display: flex;
    gap: 7px;
    text-decoration: none;
    align-items: center;
}
</style>
