<template>
  <div class="app-layout">
    <!-- 🔔 Global Notification Bell -->
    <NotificationBell v-if="showBell" />
    
    <!-- 🌐 Modern Global Header (Replacing old topbar) -->
    <header v-if="showHeader" class="modern-header" :class="{ 'focus-overlay-active': showFocusOverlay }">
      <!-- Focus Overlay for highlighting SBU button -->
      <div v-if="showFocusOverlay" class="focus-overlay" @click="dismissFocusOverlay"></div>

      <div class="header-left">
        <div class="mobile-menu-icon" @click="toggleSidebar">
          <i class="fas fa-bars"></i>
        </div>
        <div class="logo-section">
          <img src="./assets/Arch360.png" alt="Logo" class="logo-img" />
          <!-- <span class="logo-text">Arch 360</span> -->
        </div>
      </div>

      <div class="header-right">
        <div class="user-greeting desktop-only" v-if="user.name">
          <i class="fas fa-user-circle"></i>
          <span>Hi, {{ formatFirstName(user.name) }}</span>
        </div>
        
        <div class="download-app desktop-only">
          <button @click="toggleDownloadMenu" class="download-btn">
            <i class="fas fa-download"></i> App
          </button>
          <div v-if="showDownloadMenu" class="download-menu">
            <a href="#" @click.prevent="downloadApk">Android APK</a>
            <a href="#" @click.prevent="downloadIos">iOS App</a>
          </div>
        </div>
        <button @click="logout" class="logout-btn-modern">
          <i class="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="main-content-area" :class="{ 'no-margin': $route.meta.hideHeader }">
  <router-view />
</div>
    
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

    <!-- Overlay -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="toggleSidebar"></div>

    <!-- Sidebar -->
    <transition name="slide-sidebar">
      <div v-if="sidebarOpen" class="global-sidebar">
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
          <li @click="goTo('employee/dashboard')">
            <i class="fas fa-tachometer-alt"></i> <span>Dashboard</span>
          </li>
          <li @click="goTo('employee/archcalender')">
            <i class="fas fa-calendar-alt"></i> <span>Calendar</span>
          </li>
          <li @click="goTo('employee/help')">
            <i class="fas fa-comments"></i> <span>Chat</span>
          </li>
          <li class="has-submenu">
            <div class="submenu-title" @click="toggleLeaves">
              <i class="fas fa-calendar-check"></i>
              <span>Leaves</span>
              <i class="fa fa-caret-down" :class="{ rotate: leavesOpen }"></i>
            </div>
            <ul v-if="leavesOpen" class="submenu">
              <li @click="$router.push('leaveapplicationsemp'); toggleSidebar()">
                <i class="fas fa-list"></i> All Leaves
              </li>
              <li @click="$router.push('approvedleavesemp'); toggleSidebar()">
                <i class="fas fa-check-circle"></i> Approved
              </li>
              <li @click="$router.push('rejectedleavesemp'); toggleSidebar()">
                <i class="fas fa-times-circle"></i> Rejected
              </li>
              <li @click="goTo('pendingleaves')">
                <i class="fas fa-hourglass-half"></i> Pending Leaves
              </li>
            </ul>
          </li>
          <li @click="goTo('employee/applyleave')">
            <i class="fas fa-plane-departure"></i><span> Apply for Leave</span>
          </li>
          <li class="mobile-only" @click="goTo('employee/Customerregistrations')">
            <i class="fas fa-user-friends"></i><span> CRM</span>
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
            <i class="fas fa-chart-line"></i><span> DSI</span>
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

    <!-- Google Form Popup Modal -->
    <div class="modal-overlay" v-if="showGoogleFormModal">
      <div class="modal google-form-modal">
        <div class="modal-header google-form-header">
          <h2><i class="fab fa-google"></i> Strategic Business Unit Discussion – SBU</h2>
          <span class="close-btn" @click="closeGoogleForm">&times;</span>
        </div>
        <div class="google-form-body">
          <div class="form-info-banner">
            <i class="fas fa-info-circle"></i>
            <span>Topic: Strategic Business Proposal Discussion – SBU | Presented by: Prasad Sir</span>
          </div>
          <iframe 
            :src="googleFormUrl" 
            frameborder="0" 
            class="google-form-iframe"
            title="SBU Discussion Form"
          ></iframe>
        </div>
        <div class="google-form-footer">
          <button @click="closeGoogleForm" class="remind-later-btn">
            <i class="fas fa-clock"></i> Remind Later
          </button>
          <button @click="openFormInNewTab" class="open-new-tab-btn">
            <i class="fas fa-external-link-alt"></i> Open in New Tab
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NotificationBell from '@views/employee/components/NotificationBell.vue'
import axios from 'axios'
import { toastInfo } from "@/utils/toast.js";

export default {
  components: {
    NotificationBell,
  },

  data() {
    return {
      // Header data
      unreadMentionsCount: 0,
      showNotificationPanel: false,
      notifications: [],
      showDownloadMenu: false,
      showGoogleFormModal: false,
      googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfwz35YgfHbSIm3-zapvywqD8pw56fXc-U5EwpCmcG3v3zwrg/viewform?embedded=true',
      showFocusOverlay: false,
      focusTimer: null,
      
      // Existing data
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
        { question: 'Hi' },
        { question: 'Hello' },
        { question: 'How to mark attendance?' },
        { question: 'How to apply for leave?' },
        { question: 'What is the office time?' },
        { question: 'How is salary calculated?' },
      ],
      faqMap: {
        'hi': 'Hello 👋 How can I help you today?',
        'hello': 'Hi there! 😊 Ask me anything about attendance, leave, salary, or system.',
        'attendance': 'Go to Attendance → Select your status → Save. Attendance can be marked only once per day.',
        'apply leave': 'Go to Apply for Leave → Select Leave Type → Select date and reason → Submit.',
        'office time': 'Office working hours are 9:30 AM to 5:30 PM.',
        'salary': 'Salary is calculated based on attendance, approved leave, and company rules.',
      },
      selectedHelp: null,
      idleTimer: null,
      warningTimer: null,
      idleTimeLimit: 9 * 60 * 60 * 1000,
      warningTime: (9 * 60 * 60 - 10) * 1000,
      showWarning: false,
      countdown: 10,
      countdownInterval: null
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
    },
    recentNotifications() {
      return this.notifications.slice(0, 4);
    }
  },

  mounted() {
    this.loadUser()
    this.checkSessionExpiry()
    this.startIdleTimers()
    this.fetchNotifications()

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach(event => {
      window.addEventListener(event, this.resetIdleTimers)
    })

    window.addEventListener('keydown', this.handleEscape)
    
    // Close download menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.$el.querySelector('.download-app')?.contains(e.target)) {
        this.showDownloadMenu = false
      }
    })
    
    this.showFocusOnSBUButton()
  },

  beforeUnmount() {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach(event => {
      window.removeEventListener(event, this.resetIdleTimers)
    })

    window.removeEventListener('keydown', this.handleEscape)
    document.removeEventListener('click', this.closeNotificationPanel)
    this.clearAllTimers()
    if (this.focusTimer) {
      clearTimeout(this.focusTimer)
    }
  },

  methods: {
    // Header methods
    getAuthHeaders() {
      return { Authorization: `Bearer ${localStorage.getItem('token')}` };
    },

    async fetchNotifications() {
      try {
        const token = localStorage.getItem('token');
        const [mentionsRes, unreadRes] = await Promise.all([
          axios.get('https://employees.archenterprises.co.in/api/api/notifications', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('https://employees.archenterprises.co.in/api/api/mentions/unread-count', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        this.notifications = mentionsRes.data || [];
        this.unreadMentionsCount = unreadRes.data?.count || 0;
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    },

    formatFirstName(fullName) {
      if (!fullName) return '';
      return fullName.split(' ')[0];
    },

    formatTimeAgo(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    toggleNotificationPanel() {
      this.showNotificationPanel = !this.showNotificationPanel;
      if (this.showNotificationPanel) {
        setTimeout(() => {
          document.addEventListener('click', this.closeNotificationPanel);
        }, 100);
      } else {
        document.removeEventListener('click', this.closeNotificationPanel);
      }
    },

    closeNotificationPanel(e) {
      if (!this.$el.querySelector('.notification-bell-wrapper')?.contains(e.target)) {
        this.showNotificationPanel = false;
        document.removeEventListener('click', this.closeNotificationPanel);
      }
    },

    downloadApk() {
      toastInfo('APK comming soon!');
    },
    
    downloadIos() {
      toastInfo('iOS app coming soon!');
    },
    
    toggleDownloadMenu() {
      this.showDownloadMenu = !this.showDownloadMenu;
    },

    openGoogleForm() {
      this.showGoogleFormModal = true;
      document.body.style.overflow = 'hidden';
      if (this.showFocusOverlay) {
        this.dismissFocusOverlay();
      }
    },

    closeGoogleForm() {
      this.showGoogleFormModal = false;
      document.body.style.overflow = '';
    },

    openFormInNewTab() {
      window.open('https://docs.google.com/forms/d/e/1FAIpQLSfwz35YgfHbSIm3-zapvywqD8pw56fXc-U5EwpCmcG3v3zwrg/viewform', '_blank');
    },

    showFocusOnSBUButton() {
      const hasSeenFocus = localStorage.getItem('hasSeenSBUFocus');
      if (hasSeenFocus) return;

      setTimeout(() => {
        const btn = this.$refs.googleFormBtn;
        if (btn) {
          this.showFocusOverlay = true;
          this.focusTimer = setTimeout(() => {
            this.dismissFocusOverlay();
          }, 30000);
        }
      }, 1500);
    },

    dismissFocusOverlay() {
      this.showFocusOverlay = false;
      if (this.focusTimer) {
        clearTimeout(this.focusTimer);
      }
      localStorage.setItem('hasSeenSBUFocus', 'true');
    },

    // Existing methods
    goTo(route) {
      this.$router.push(`/${route}`)
      this.sidebarOpen = false
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

    startIdleTimers() {
      this.warningTimer = setTimeout(() => {
        this.showWarning = true
        this.startCountdown()
      }, this.warningTime)
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
/* Import Font Awesome */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Root Variables */
:root {
  --primary: #08a594;
  --primary-dark: #067a6a;
  --sidebar: #a5d5cf;
  --card: #08a594;
  --text: #134e4a;
  --text-white: #ffffff;
  --gray: #64748b;
  --light: #f8fafc;
  --border: #e2e8f0;
  --danger: #ef4444;
}

/* Theme Support */
[data-theme="Default"] {
  --primary: #518587; 
  --sidebar: #add7d9; 
  --card: #ffffff; 
  --text: #0d5a5d;
}

[data-theme="green"] {
  --primary: #3fc470;
  --sidebar: #b6f7ca;
  --card: #3fc470bd;
  --text: #065f46;
}

[data-theme="blue"] {
  --primary: #180552;
  --sidebar: #b4ccf9;
  --card: #034081;
  --text: #042345;
}

[data-theme="dark"] {
  --primary: #000000;
  --sidebar: #ffffffad;
  --card: #000000;
  --text: #000a0a;
}

[data-theme="orange"] {
  --primary: #ae4c08;
  --sidebar: #fed7aa;
  --card: #ae4c08;
  --text: #691f06;
}

[data-theme="red"] {
  --primary: #a80606;
  --sidebar: #fecaca;
  --card: #a80606;
  --text: #540101;
}

/* Layout */
.app-layout {
  min-height: 100vh;
  background: #ffffff!;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Modern Header - Fixed */
.modern-header {
  background: white;
  padding: 0 2rem;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border-bottom: 1px solid var(--border);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mobile-menu-icon {
  display: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: var(--dark);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.logo-img {
  height: 126px;
  width: 123px;
}

.logo-text {
  font-weight: 700;
  font-size: 1.25rem;
  background: linear-gradient(135deg, var(--primary), #7c3aed);
  -webkit-background-clip: text;
  background-clip: text;
      font-family: sans-serif;
  color: transparent;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.user-greeting {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--dark);
  font-weight: 500;
}

.user-greeting i {
  font-size: 1.2rem;
  color: var(--primary);
}

/* Notification Bell */
.notification-bell-wrapper {
  position: relative;
  cursor: pointer;
  font-size: 1.2rem;
  color: var(--gray);
  transition: color 0.2s;
}
.mobile-only {
  display: none!important;
}
.notification-bell-wrapper:hover {
  color: var(--primary);
}

.notification-bell-wrapper .badge {
  position: absolute;
  top: -8px;
  right: -10px;
  background: var(--danger);
  color: white;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 20px;
  font-weight: 600;
}

.notification-dropdown {
  position: absolute;
  top: 45px;
  right: 0;
  width: 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
  z-index: 200;
  max-height: 350px;
  overflow-y: auto;
}

.notification-item {
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border);
  font-size: 0.85rem;
}

.notification-item i {
  color: var(--primary);
}

.notification-item small {
  margin-left: auto;
  font-size: 0.7rem;
  color: var(--gray);
}

.no-notif {
  padding: 20px;
  text-align: center;
  color: var(--gray);
}

.download-app {
  position: relative;
}

.download-btn {
  background: var(--light);
  border: 1px solid var(--border);
  padding: 0.5rem 1rem;
  border-radius: 40px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.download-btn:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.download-menu {
  position: absolute;
  top: 45px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
  overflow: hidden;
  z-index: 10;
  min-width: 140px;
}

.download-menu a {
  display: block;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--dark);
  transition: background 0.2s;
}

.download-menu a:hover {
  background: var(--light);
}

.google-form-btn {
  background: linear-gradient(135deg, #ea4335, #c5221f);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 40px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  transition: all 0.2s;
  position: relative;
}

.google-form-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(234, 67, 53, 0.3);
}

.btn-glowing {
  animation: btnGlow 1s ease-in-out infinite;
}

@keyframes btnGlow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(234, 67, 53, 0.7);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(234, 67, 53, 0.3);
    transform: scale(1.02);
  }
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 20px;
  animation: badgePulse 1s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.logout-btn-modern {
  background: none;
  margin-right: 14px;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--gray);
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 40px;
  transition: all 0.2s;
}

.logout-btn-modern:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* Focus Overlay */
.focus-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Main Content Area - Scrollable */
.main-content-area {
  margin-top: 70px;
  /* padding: 1.5rem; */
  min-height: calc(100vh - 70px);
  overflow-y: auto;
}

/* Custom scrollbar */
.main-content-area::-webkit-scrollbar {
  width: 8px;
}

.main-content-area::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.main-content-area::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 10px;
}

/* Idle Modal */
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

/* Sidebar Styles */
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
}

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

.sidebar-divider {
  height: 1px;
  background: rgba(255,255,255,0.2);
  margin: 10px 0 20px;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.sidebar-menu li {
  display: flex;
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

.sidebar-menu li:hover {
  background: rgba(255,255,255,0.18);
  transform: translateX(6px);
}

.has-submenu {
  flex-direction: column;
}

.submenu-title {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
}

.submenu-title .fa-caret-down {
  margin-left: auto;
  transition: transform 0.3s;
}

.submenu-title .fa-caret-down.rotate {
  transform: rotate(180deg);
}

.submenu {
  list-style: none;
  padding-left: 36px;
  margin-top: 8px;
}

.submenu li {
  padding: 8px 12px;
  font-size: 13px;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(2px);
  z-index: 999;
}

/* Slide Animation */
.slide-sidebar-enter-active,
.slide-sidebar-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-sidebar-enter-from,
.slide-sidebar-leave-to {
  transform: translateX(-100%);
}

/* Google Form Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.google-form-modal {
  background: white;
  border-radius: 28px;
  width: 90%;
  max-width: 900px;
  height: 85vh;
  max-height: 700px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.google-form-header {
  background: var(--primary);
  padding: 1rem 1.5rem;
}

.google-form-body {
  flex: 1;
  overflow: hidden;
}

.form-info-banner {
  background: #e8f0fe;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: #1967d2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.google-form-iframe {
  width: 100%;
  height: calc(100% - 45px);
  border: none;
}

.google-form-footer {
  padding: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  border-top: 1px solid var(--border);
  background: var(--light);
}

.remind-later-btn, .open-new-tab-btn {
  padding: 0.5rem 1rem;
  border-radius: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remind-later-btn {
  border: 1px solid var(--border);
  background: white;
}

.open-new-tab-btn {
  border: none;
  background: var(--primary);
  color: white;
}

.close-btn {
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .modern-header {
    padding: 0 1rem;
  }
/*   
  .mobile-menu-icon {
    display: block;
  } */
  
  .logo-text {
    display: none;
  }
  
  .user-greeting span {
    display: none;
  }
  
  .logout-btn-modern span {
    display: none;
  }
  
  .google-form-btn span {
    display: none;
  }
  
  .main-content-area {
    /* padding: 1rem; */
    margin-top: 70px;
  }
  
  .global-sidebar {
    width: 280px;
  }
  
  .notification-dropdown {
    width: 280px;
    right: -50px;
  }
  
  .google-form-modal {
    width: 95%;
    height: 90vh;
  }
}

@media (max-width: 480px) {
  .download-btn span {
    display: none;
  }
  
  .download-btn i {
    font-size: 1.2rem;
  }
}
.fa-bell {
  font-size: 1.2rem;
  color: var(--text)!important;
  transition: color 0.2s;
}
/* Responsive visibility classes - FIXED */
@media (max-width: 768px) {
  .logo-img {
  height: 90px;
  width: 90px;
}
  .mobile-only { 
    display: flex !important; 
  }
  .desktop-only { 
    display: none !important; 
  }
}

@media (min-width: 769px) {
  .mobile-only { 
    display: none !important; 
  }
  .desktop-only { 
    display: flex !important; 
  }
}
.main-content-area.no-margin {
  margin-top: 0;
  min-height: 100vh;
}

/* Or if you want auth page to have no margin and no scroll */
.main-content-area.no-margin {
  margin-top: 0;
  min-height: 100vh;
  overflow-y: hidden;
}
</style>