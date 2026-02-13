<template>
  <div class="app-layout">
    <!-- 🔔 Global Notification Bell -->
    <NotificationBell v-if="showBell" />
    <router-view />
    <!-- ⚠️ Idle Warning Modal -->
<div v-if="showWarning" class="idle-modal">
  <div class="idle-box">
    <h3>Session Expiring</h3>
    <p>
      You will be logged out in
      <strong>{{ countdown }}</strong> seconds due to inactivity.
    </p>
    <button @click="stayLoggedIn">Stay Logged In</button>
  </div>
</div>

  <!-- 🆘 Help Support Widget -->
<div class="help-widget">
  <!-- Floating Button -->
  <div class="help-button" @click="toggleHelp">
    <i class="fas fa-question"></i>
    <span v-if="!helpOpen">Help</span>
  </div>

<!-- 🤖 Chatbot Panel -->
<transition name="help-slide">
  <div v-if="helpOpen" class="help-panel">
    <div class="help-header">
      <h4>Arch Support 🤖</h4>
      <i class="fas fa-times" @click="toggleHelp"></i>
    </div>

    <!-- Chat Messages -->
    <div class="chat-body" ref="chatBody">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['chat-msg', msg.sender]"
      >
        {{ msg.text }}
      </div>
    </div>

    <!-- Quick Questions -->
    <!-- <div class="quick-questions">
      <span
        v-for="(q, i) in quickQuestions"
        :key="i"
        @click="sendQuickQuestion(q.question)"
      >
        {{ q.question }}
      </span>
    </div> -->

    <!-- Input -->
    <div class="chat-input">
      <input
        type="text"
        v-model="userInput"
        placeholder="Type your message..."
        @keyup.enter="sendMessage"
      />
      <button @click="sendMessage">➤</button>
    </div>
  </div>
</transition>

</div>

</div>

</template>

<script>
import NotificationBell from '@views/employee/components/NotificationBell.vue'
import axios from 'axios'

export default {
  components: {
    NotificationBell,
  },

  data() {
    return {
      
       helpOpen: false,
       userInput: '',
    messages: [
      { sender: 'bot', text: 'Hi 👋 I am Arch Support Bot. How can I help you?' },
    ],

  quickQuestions: [
  // 👋 Greetings
  { question: 'Hi' },
  { question: 'Hello' },
  { question: 'Hey' },
  { question: 'Good morning' },
  { question: 'Good evening' },

  // 📅 Attendance
  { question: 'How to mark attendance?' },
  { question: 'What if I forget to punch out?' },
  { question: 'Why was I marked absent?' },
  { question: 'Can I edit attendance later?' },

  // ⏱ Office Timing
  { question: 'What is the office time?' },
  { question: 'What if I punch in late?' },

  // 🌴 Leave
  { question: 'How to apply for leave?' },
  { question: 'How does leave work?' },
  { question: 'What happens if I have no leave balance?' },
  { question: 'How are Sundays counted?' },

  // 💰 Salary
  { question: 'How is salary calculated?' },
  { question: 'Is salary deducted for absents?' },

  // 📊 Performance
  { question: 'What is quarterly performance?' },
  { question: 'How are quarters calculated?' },

  // 🚗 Travel / Visit
  { question: 'What if I am on travel or onsite?' },
  { question: 'Where can I see my visits or services?' },

  // 👤 Profile & Account
  { question: 'How to change my profile details?' },
  { question: 'How to change password?' },
  { question: 'How to change theme?' },

  // 🧠 System / Info
  { question: 'What is your name?' },
  { question: 'Who are you?' },
  { question: 'What is RCA?' },
  { question: 'What is auto logout time?' },

  // 🏢 CRM / Sales
  { question: 'How to register new customer?' },
  { question: 'How to add PO?' },
  { question: 'How to create quotation?' },
  { question: 'How to view quotation?' },

  // 🆘 Support
  { question: 'Who to contact for support?' },
],




faqMap: {
  // 👋 Greetings
  'hi': 'Hello 👋 How can I help you today?',
  'hello': 'Hi there! 😊 Ask me anything about attendance, leave, salary, or system.',
  'hey': 'Hey! 👋 What would you like to know?',
  'good morning': 'Good morning ☀️ Wishing you a productive day!',
  'good evening': 'Good evening 🌙 How can I assist you?',

  // 📅 Attendance
  'attendance':
    'Go to Attendance → Select your status → Save. Attendance can be marked only once per day.',

  'mark attendance':
    'Attendance is allowed only once per day and cannot be edited after saving.',

  'forget punch out':
    'If you forget to punch out, the system will auto punch-out at 5:30 PM.',

  'marked absent':
    'You may be marked Absent if no attendance is marked and no leave balance is available.',

  'edit attendance':
    'No, attendance cannot be edited once saved for the day.',

  // ⏱ Office Time
  'office time':
    'Office working hours are 9:30 AM to 5:30 PM.',

  'late punch':
    'Late punch-ins may affect attendance percentage as per company policy.',

  // 🌴 Leave
  'apply leave':
    'Go to Apply for Leave → Select Leave Type → Select date and reason → Submit.',

  'how to apply leave':
    'You can apply leave from the Leave section by selecting dates and submitting a request.',

  'leave deduct':
    'Leave is deducted automatically from your balance. If balance is zero, the day is marked Absent.',

  'no leave balance':
    'If you have no leave balance, the system marks the day as Absent.',

  'sunday':
    'If attendance is marked on Sunday, 1 Earned Leave is credited.',

  'holiday':
    'Public holidays are predefined by admin and do not require attendance.',

  // 💰 Salary
  'salary':
    'Salary is calculated based on attendance, approved leave, and company rules.',

  'salary deduction':
    'Absent days may result in salary deduction as per HR policy.',

  // 📊 Performance
  'performance':
    'Quarterly performance is calculated using attendance percentage and target completion.',

  'quarter':
    'Q1: Jan–Mar, Q2: Apr–Jun, Q3: Jul–Sep, Q4: Oct–Dec.',

  // 🚗 Travel / Visit
  'travel':
    'If you are on travel or onsite, select Travel/Onsite while marking attendance.',

  'onsite':
    'Onsite work must be marked using the Onsite option in attendance.',

  'visit':
    'You can view your visits and services from the Visits or Services section.',

  'services':
    'All assigned services are visible in the Services module.',

  // 👤 Profile & Account
  'profile':
    'Profile details can be updated from Profile → Edit. Some changes need admin approval.',

  'change password':
    'Go to Settings → Change Password → Save.',

  'change theme':
    'You can change the theme from Settings → Appearance.',

  // 🧠 System Info
  'your name':
    'I am Arch 360 Assistant 🤖, here to help you with the system.',

  'who are you':
    'I am your virtual assistant for Arch 360.',

  'rca':
    'RCA stands for Root Cause Analysis. It is used to identify the main reason behind an issue.',

  'auto logout':
    'The system automatically logs you out after inactivity for security reasons.',

  // 🏢 CRM / Sales
  'new customer':
    'Go to Customers → Add New Customer → Fill details → Save.',

  'register customer':
    'You can register a new customer from the Customers section.',

  'add po':
    'Go to Purchase Order → Add PO → Enter details → Save.',

  'create quotation':
    'Go to Quotation → Create → Add items → Generate quotation.',

  'view quotation':
    'All quotations can be viewed from the Quotation List section.',

  // 🆘 Support
  'support':
    'For help, contact HR or email support@archenterprises.co.in.',

  'contact':
    'You can contact HR or email contact@archenterprises.co.in.',
},



    selectedHelp: null,
      idleTimer: null,
      warningTimer: null,
      idleTimeLimit: 3 * 60 * 60 * 1000,   // 3 hours
warningTime: (3 * 60 * 60 - 10) * 1000, // 10 seconds before 3 hours


      showWarning: false,
      countdown: 10,
      countdownInterval: null,
    } 
  },

  computed: {
    showHelpWidget() {
    return !this.$route.meta?.hideHelp
  },
    showBell() {
      return !this.$route.meta?.hideBell
    },
  },

  mounted() {
     this.checkSessionExpiry() 
    this.startIdleTimers()

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach(event =>
      window.addEventListener(event, this.resetIdleTimers)
    )
  },

  beforeUnmount() {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach(event =>
      window.removeEventListener(event, this.resetIdleTimers)
    )

    this.clearAllTimers()
  },

  methods: {
    checkSessionExpiry() {
  const loginTime = localStorage.getItem('loginTime')

  if (!loginTime) return

  const now = Date.now()
  const diff = now - parseInt(loginTime)

  const threeHours = 3 * 60 * 60 * 1000

  if (diff > threeHours) {
    this.logoutUser()
  }
},

    sendQuickQuestion(question) {
    this.userInput = question
    this.sendMessage()
  },
sendMessage() {
  if (!this.userInput.trim()) return

  const rawText = this.userInput
  const cleanText = rawText.toLowerCase().trim()

  // show original text in chat
  this.messages.push({ sender: 'user', text: rawText })
  this.userInput = ''

  setTimeout(() => {
    const reply = this.getBotReply(cleanText) // 👈 normalized text
    this.messages.push({ sender: 'bot', text: reply })
    this.scrollToBottom()
  }, 500)

  this.scrollToBottom()
},


 getBotReply(text) {
  const lower = text.toLowerCase()

  // Loop through all FAQ keys
  for (const key in this.faqMap) {
    if (lower.includes(key)) {
      return this.faqMap[key]
    }
  }

  // fallback
  return "🤔 I’m not sure about that. Please contact HR or support for help."
},


  scrollToBottom() {
    const el = this.$refs.chatBody
    if (el) el.scrollTop = el.scrollHeight
  },

     toggleHelp() {
    this.helpOpen = !this.helpOpen
    this.selectedHelp = null
  },

  selectHelp(type) {
    this.selectedHelp = type
  },
    startIdleTimers() {
      // Warning popup timer
      this.warningTimer = setTimeout(() => {
        this.showWarning = true
        this.startCountdown()
      }, this.warningTime)

      // Final logout timer
      this.idleTimer = setTimeout(() => {
        this.logoutUser()
      }, this.idleTimeLimit)
    },

    resetIdleTimers() {
      this.clearAllTimers()
      this.showWarning = false
      this.countdown = 10
      this.startIdleTimers()
    },

    startCountdown() {
      this.countdownInterval = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(this.countdownInterval)
        }
      }, 1000)
    },

    clearAllTimers() {
      clearTimeout(this.warningTimer)
      clearTimeout(this.idleTimer)
      clearInterval(this.countdownInterval)
    },

    stayLoggedIn() {
      this.resetIdleTimers()
    },

    logoutUser() {
      axios.post('/logout').finally(() => {
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = '/auth'
      })
    },
  },
}
</script>


<style>
  .idle-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.idle-box {
  background: #fff;
  padding: 24px 30px;
  border-radius: 10px;
  text-align: center;
  max-width: 360px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.idle-box h3 {
  margin-bottom: 10px;
}

.idle-box button {
  margin-top: 15px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
}

/* ===== DEFAULT THEME (Blue) ===== */
:root {
 --primary: #08a594;
  --sidebar: #a5d5cf;
  --card: #08a594;
  --text: #134e4a;
  --text-white: #ffffff;

}

[data-theme="Default"] {
--primary: #518587; --sidebar: #add7d9; --card: #ffffff; --text: #0d5a5d;
  --text-white: #ffffff;
}

[data-theme="green"] {
  --primary: #3fc470;
  --sidebar: #b6f7ca;
  --card: #3fc470bd;
  --text: #065f46;
  --text-white: #ffffff;
}


[data-theme="blue"] {
  --primary: #180552;
  --sidebar: #b4ccf9;
  --card: #034081;
  --text: #042345;
  --text-white: #ffffff;
}

[data-theme="dark"] {
  --primary: #000000;
   --sidebar: #ffffffad;
    --card: #000000;
     --text: #000a0a;
  --text-white: #ffffff;
}

[data-theme="orange"] {
  --primary: #ae4c08;
  --sidebar: #fed7aa;
  --card: #ae4c08;
  --text: #691f06;
  --text-white: #ffffff;
}

[data-theme="red"] {
  --primary: #a80606;
  --sidebar: #fecaca;
  --card: #a80606;
  --text: #540101;
  --text-white: #ffffff;
}


[data-theme="amber"] {
  --primary: #afb805;
  --sidebar: #afb80569;
  --card: #afb805;
  --text: #727802;
  --text-white: #ffffff;
}

/* [data-theme="teal"] {
  --primary: #08a594;
  --sidebar: #a5d5cf;
  --card: #08a594;
  --text: #134e4a;
  --text-white: #ffffff;
} */

[data-theme="pink"] {
  --primary: #ec4899;
  --sidebar: #fbcfe8;
  --card: #ec4899;
  --text: #831843;
  --text-white: #ffffff;
}
[data-theme="purple"] {
  --primary: #8d004e;
  --sidebar: #edd2e1 ;
  --card: #8d004e;
  --text: #580433;
  --text-white: #ffffff;
}

* {
  transition: background-color 0.3s ease, color 0.3s ease;
}


/* ===== APPLY TO APP ===== */
.app-layout {
  padding: 0px;
  font-family: Arial, sans-serif;
  /* background: var(--background); */
  color: black;
}

.theme-switcher {
  position: static;
  top: 12px;
  right: 12px;
  z-index: 9999;
  background: white;
  padding: 10px 14px;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.theme-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
}

/* Arrow */
.theme-select {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg fill='gray' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
}

.theme-select:hover {
  border-color: var(--primary);
}

.theme-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(81, 133, 135, 0.25);
}

/* Slide-in on load */
.slide-in {
  animation: slideIn 0.6s ease-out forwards;
}

@keyframes slideIn {
  from {
    transform: translateX(40px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Theme switcher container */
.theme-switcher {
  position: static;
  top: 28px;
    right: 54px;
  z-index: 9999;
  background: #ffffff8c;
  padding: 10px 14px;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* Label */
.theme-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

/* Select */
.theme-select {
  appearance: none;
  padding: 7px 3px 7px 2px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 12px;
  border: 1px solid rgba(61, 29, 29, 0);
  background: rgba(255, 255, 255, 0);
  color: var(--text);
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
    border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(81, 133, 135, 0.25);
}

/* Dropdown arrow */
.theme-select {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg fill='gray' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
}

/* Hover & focus */
.theme-select:hover {
  border-color: var(--primary);
}

.theme-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(81, 133, 135, 0.25);
}
html {
  transition: background-color 0.4s ease, color 0.4s ease;
}

body,
.card,
.sidebar,
.header {
  transition: background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease;
}
 @media (max-width: 768px) {
  .theme-switcher{
       top: 38px;
        right: 74px;
        padding: 2px 1px;

  }
  .theme-label{
        font-size: 8px;
  }
  .theme-select{
        font-size: 9px;
  }
  .fa-bell:before {
    margin-right: 16px!important;
  }
}

/* 🆘 Help Widget */
.help-widget {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 9999;
}

/* Floating Button */
.help-button {
  background: var(--primary);
  color: #fff;
  padding: 12px 16px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0,0,0,0.25);
  font-weight: 600;
}

.help-button i {
  font-size: 16px;
}

/* Panel */
.help-panel {
  width: 320px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.3);
  position: absolute;
  bottom: 60px;
  right: 0;
  overflow: hidden;
}

/* Header */
.help-header {
  background: var(--primary);
  color: #fff;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.help-header i {
  cursor: pointer;
}

/* Body */
.help-body {
  padding: 16px;
  font-size: 14px;
}

.help-options {
  list-style: none;
  padding: 0;
  margin: 10px 0;
}

.help-options li {
  padding: 10px;
  background: #f3f4f6;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.help-options li:hover {
  background: #e5e7eb;
}

.help-form textarea {
  width: 100%;
  min-height: 70px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.help-form button {
  margin-top: 8px;
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: none;
  background: var(--primary);
  color: #fff;
  cursor: pointer;
}

/* Animation */
.help-slide-enter-active,
.help-slide-leave-active {
  transition: all 0.3s ease;
}

.help-slide-enter-from,
.help-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Mobile */
@media (max-width: 768px) {
  .help-panel {
    width: 90vw;
    right: -10px;
  }
}

/* 🤖 Chatbot */
.chat-body {
  max-height: 260px;
  overflow-y: auto;
  padding: 12px;
  background: #f9fafb;
}

.chat-msg {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 12px;
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.4;
}

.chat-msg.bot {
  background: #e5e7eb;
  align-self: flex-start;
}

.chat-msg.user {
  background: var(--primary);
  color: #fff;
  margin-left: auto;
}

/* Quick questions */
.quick-questions {
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.quick-questions span {
  background: #eef2ff;
  padding: 5px 8px;
  border-radius: 10px;
  font-size: 11px;
  cursor: pointer;
}

/* Input */
.chat-input {
  display: flex;
  gap: 6px;
  padding: 10px;
  border-top: 1px solid #e5e7eb;
}

.chat-input input {
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.chat-input button {
  border: none;
  border-radius: 8px;
  padding: 0 14px;
  background: var(--primary);
  color: #fff;
  cursor: pointer;
}

</style>


<!-- <style>
.app-layout {
  padding: 0px;
  font-family: Arial, sans-serif;
}
</style> -->
