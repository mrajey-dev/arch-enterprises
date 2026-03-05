<template>
  <div class="app-layout">
    <!-- 🔔 Global Notification Bell -->
    <NotificationBell v-if="showBell" />
    <!-- 🌐 Global Top Bar -->
<div v-if="showHeader" class="global-topbar">

 <div 
  v-if="showMenuIcon"
  class="menu-icon" 
  @click="toggleSidebar"
>

    <i class="fas fa-bars"></i>
  </div>
<div class="app-title">
  <img src="./assets/logo.png" alt="Arch Logo" class="app-logo" />
  <span>Arch 360</span>
</div>

</div>

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

<!-- <div class="help-widget">

  <div class="help-button" @click="toggleHelp">
    <i class="fas fa-question"></i>
    <span v-if="!helpOpen">Help</span>
  </div>

<transition name="help-slide">
  <div v-if="helpOpen" class="help-panel">
    <div class="help-header">
      <h4>Arch Support 🤖</h4>
      <i class="fas fa-times" @click="toggleHelp"></i>
    </div>

    <div class="chat-body" ref="chatBody">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['chat-msg', msg.sender]"
      >
        {{ msg.text }}
      </div>
    </div>
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

</div> -->

<!-- Overlay -->
<div v-if="sidebarOpen" class="sidebar-overlay" @click="toggleSidebar"></div>

<!-- Sidebar -->
<transition name="slide-sidebar">
  <div v-if="sidebarOpen" class="global-sidebar">

    <!-- 🔒 Close Button -->
    <!-- <div class="sidebar-close" @click="toggleSidebar">
⪡
    </div> -->

    <!-- 👤 User Section -->
    <!-- 👤 User Section -->
<div class="sidebar-user">
  <img
    :src="user.profile_photo 
      ? `https://employees.archenterprises.co.in/backend/public/storage/${user.profile_photo}` 
      : 'https://i.pravatar.cc/100'"
    alt="User"
    class="user-avatar"
  />

  <div class="user-name">{{ user.name }}</div>
  <div class="user-role">{{ user.department }}</div>
</div>


    <div class="sidebar-divider"></div>

    <!-- 📂 Menu -->
   <ul class="sidebar-menu">

  <!-- 📊 Dashboard -->
  <li @click="goTo('employee/dashboard')">
            <i class="fas fa-tachometer-alt"></i> <span>Dashboard</span>
          </li>

<li @click="goTo('employee/help')">
            <i class="fas fa-comments" aria-hidden="true"></i> <span>Chat</span>
          </li>

  <!-- 🌴 Leaves Dropdown -->
  <li class="has-submenu">
    <div class="submenu-title" @click="toggleLeaves">
      <i class="fas fa-calendar-alt"></i>
      <span>Leaves </span>
     &nbsp;&nbsp;&nbsp; <i class="fa fa-caret-down" :class="{ rotate: leavesOpen }"></i>
    </div>

    <ul v-if="leavesOpen" class="submenu">
      <li @click="$router.push('leaveapplicationsemp'); toggleSidebar()">
         <i class="fas fa-list"></i>  All Leaves
      </li>
      <li @click="$router.push('approvedleavesemp'); toggleSidebar()">
         <i class="fas fa-check-circle"></i>  Approved
      </li>
      <li @click="$router.push('rejectedleavesemp'); toggleSidebar()">
          <i class="fas fa-times-circle"></i> Rejected
      </li>
        <li @click="goTo('pendingleaves')">
               <i class="fas fa-hourglass-half"> </i>Pending Leaves
              </li>
      
    </ul>
  </li>
  <li @click="goTo('employee/applyleave')">
            <i class="fas fa-plane-departure"></i><span> Apply for Leave </span>
          </li>
        <li
  @click="goTo('employee/visitschedule')"
>
  <i class="fas fa-chart-bar"></i> <span>Visit Schedule</span>
</li>

    <li @click="goTo('employee/viewAnnouncement')">
            <i class="fas fa-bullhorn"></i><span> Announcement</span>
          </li>
          <li @click="goTo('employee/request')">
            <i class="fa fa-check-square-o"></i><span> Request Desk</span>
          </li>
           <li @click="goTo('employee/resourcebooking')">
            <i class="fa-solid fa-calendar"></i><span> Resource Booking</span>
          </li>

   <li @click="goTo('employee/viewkra')">
            <i class="fas fa-tasks"></i> <span>View KRA</span>
          </li>
           <li @click="goTo('employee/mydsi')">
            <i class="fas fa-tasks"></i><span> DSI</span>
          </li>
          
          <li @click="goTo('employee/myprofile')">
            <i class="fa-solid fa-user"></i><span> My Profile</span>
          </li>


 <li @click="logout" class="danger-bg">
            <i class="fas fa-sign-out-alt"></i><span> Logout</span>
          </li>

</ul>


  </div>
</transition>




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
      leavesOpen: false,
     user: {
  name: '',
  department: '',
  profile_photo: ''
},

      sidebarOpen: false,
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
      idleTimeLimit: 9 * 60 * 60 * 1000,   // 9 hours
warningTime: (9 * 60 * 60 - 10) * 1000, // 10 seconds before 9 hours


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
      showMenuIcon() {
    return !this.$route.meta?.hideMenu
  },
    showHeader() {
    return !this.$route.meta?.hideHeader
  }
  },
mounted() {
  this.loadUser()
  this.checkSessionExpiry()
  this.startIdleTimers()

  const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
  events.forEach(event => {
    window.addEventListener(event, this.resetIdleTimers)
  })

  window.addEventListener('keydown', this.handleEscape)
},



beforeUnmount() {
  const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
  events.forEach(event => {
    window.removeEventListener(event, this.resetIdleTimers)
  })

  window.removeEventListener('keydown', this.handleEscape)

  this.clearAllTimers()
},


  methods: {
 goTo(route) {
  this.$router.push(`/${route}`)
  this.sidebarOpen = false   // 👈 always close sidebar after navigation
},
    toggleLeaves() {
  this.leavesOpen = !this.leavesOpen
},

    handleEscape(e) {
  if (e.key === 'Escape' && this.sidebarOpen) {
    this.sidebarOpen = false
  }
},

    loadUser() {
  const storedUser = localStorage.getItem('user')

  if (storedUser) {
    const parsedUser = JSON.parse(storedUser)

    this.user.name = parsedUser.name || ''
    this.user.department = parsedUser.department || ''
    this.user.profile_photo = parsedUser.profile_photo || ''
  }
},

toggleSidebar() {
  this.sidebarOpen = !this.sidebarOpen

  if (this.sidebarOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
},

    checkSessionExpiry() {
  const loginTime = localStorage.getItem('loginTime')

  if (!loginTime) return

  const now = Date.now()
  const diff = now - parseInt(loginTime)

  const threeHours = 3 * 60 * 60 * 1000

  if (diff > threeHours) {
    this.logout()
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
        this.logout()
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
logout() {
  if (this.sidebarOpen) {
    this.toggleSidebar()
  }

  const token = localStorage.getItem("token");

  axios
    .post(
      "https://employees.archenterprises.co.in/api/api/logout",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .finally(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.$router.push("/auth");
    });
}



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
/* 🌐 Modern Global Topbar */
.global-topbar {
    height: 83px;
    background: linear-gradient(135deg, var(--primary), #000000);
    color: var(--text-white);
    display: flex;
    align-items: center;
    padding: 0 22px;
    position: sticky;
    top: 0;
    z-index: 999;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
    backdrop-filter: blur(6px);
    justify-content: flex-start;
    gap: 16px;
}

/* Menu Icon */
.menu-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  background: rgba(255, 255, 255, 0.15);
}

.menu-icon i {
  font-size: 18px;
}

.menu-icon:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

/* App Title */
.app-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

/* Optional Right Side Area */
.topbar-right {
  display: flex;
  align-items: center;
  gap: 14px;
}


/* 📂 Professional Sidebar */
.global-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 320px;
  box-sizing: border-box;
  height: 100dvh;
  background: linear-gradient(180deg, var(--primary), #020617);
  color: white;
  box-shadow: 10px 0 35px rgba(0, 0, 0, 0.25);
  z-index: 1000;
  padding: 24px 18px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}


/* Sidebar Header */
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 20px;
  color: var(--text);
}

.sidebar-header i {
  cursor: pointer;
  font-size: 18px;
}

/* Sidebar Menu */
.global-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.global-sidebar li {
  padding: 12px 14px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.25s ease;
  color: white;
}

.global-sidebar li:hover {
  background: var(--primary);
  color: #fff;
  transform: translateX(4px);
}
.slide-sidebar-enter-active,
.slide-sidebar-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-sidebar-enter-from,
.slide-sidebar-leave-to {
  transform: translateX(-100%);
}

.slide-sidebar-enter-to,
.slide-sidebar-leave-from {
  transform: translateX(0);
}


/* 👤 User Section */
.sidebar-user {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 18px;
}

.user-name {
  font-weight: 700;
  font-size: 15px;
}

.user-role {
  font-size: 12px;
  opacity: 0.85;
}

/* Divider */
.sidebar-divider {
  height: 1px;
  background: rgba(255,255,255,0.2);
  margin: 10px 0 20px;
}

/* 📂 Menu */
.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.sidebar-menu li {
  display: flex;
  /* align-items: center; */
  gap: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  background-color: #f8f8f80d;
  margin-bottom: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.75s ease;
}

.sidebar-menu li i {
  font-size: 16px;
  width: 22px;
}

/* Hover Effect */
.sidebar-menu li:hover {
  background: rgba(255,255,255,0.18);
  transform: translateX(6px);
}

/* Active Route Highlight */
.sidebar-menu li.router-link-active {
  background: rgba(255,255,255,0.25);
}
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(2px);
  z-index: 999;
  transition: opacity 0.3s ease;
}


/* Close Button */
.sidebar-close {
  position: absolute;
      top: 11px;
    right: -5px;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  /* background: rgba(255,255,255,0.2); */
  transition: all 0.25s ease;
}

.sidebar-close i {
  font-size: 16px;
  color: #fff;
}

.sidebar-close:hover {
  /* background: rgba(255,255,255,0.35); */
  transform: rotate(90deg);
}
/* 👤 Centered User Section */
.sidebar-user {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
      background-color: #00000030;
      border-radius: 15px;
    padding: 10px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50px;
  object-fit: cover;
  border: 3px solid rgba(255,255,255,0.4);
  margin-bottom: 12px;
}

.user-name {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 4px;
}

.user-role {
  font-size: 13px;
  opacity: 0.9;
}
.has-submenu {
  flex-direction: column;
}

.submenu-title {
  display: flex;
  /* justify-content: space-between; */
  align-items: center;
  cursor: pointer;
}

.submenu {
  list-style: none;
  padding-left: 25px;
  margin-top: 5px;
}

.submenu li {
  padding: 8px 0;
  cursor: pointer;
  font-size: 14px;
 
}


.arrow {
  transition: transform 0.3s ease;
}

.arrow.rotate {
  transform: rotate(180deg);
}

.menu-icon {
  display: none;
}
@media (max-width: 768px) {

  .menu-icon {
    display: flex;
  }
  .app-logo {
  height: 32px!important;
  width: auto;
  object-fit: contain;
}
.app-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px!important;
  font-weight: 600;
  color: #fff;
}

}
@media (max-width: 768px) {

  .global-topbar {
    height: 56px;
    padding: 0 14px;
  }

  .app-title {
    font-size: 15px;
  }

  .menu-icon {
    width: 34px;
    height: 34px;
    flex-shrink: 0;   /* prevents pushing layout */
  }

  .menu-icon i {
    font-size: 16px;
  }

}



html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;   /* 🔥 prevents horizontal scroll */
  width: 100%;
}
.app-layout {
  min-height: 100vh;
  overflow-x: hidden;
}
.app-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.app-logo {
  height: 52px;
  width: auto;
  object-fit: contain;
}

</style>