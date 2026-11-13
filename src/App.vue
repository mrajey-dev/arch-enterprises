<template>
  <div class="app-layout" :class="{ 'employee-mode': isEmployeeRoute }">
    <!-- 🪔 Diwali Decoration Overlay (shown only during Diwali window: -2 to +1 days) -->
    <DiwaliDecoration v-if="isLoggedIn" />

    <!-- 🔔 Floating Notification Bell (Only for pages without top header) -->
    <NotificationBell v-if="showBell && !showHeader" />
    
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
        <!-- 🔔 Unified Notification Bell -->
        <AdminNotificationBell v-if="isAdmin" />
        <NotificationBell v-else :inHeader="true" />

        <div class="user-greeting desktop-only" v-if="user.name">
          <i class="fas fa-user-circle"></i>
          <span>Hi, {{ formatFirstName(user.name) }}</span>
        </div>
        
        <div class="download-app desktop-only">
          <button @click="toggleDownloadMenu" class="download-btn" title="Download Mobile App" aria-label="Download App">
            <i class="fas fa-download"></i>
          </button>
          <div v-if="showDownloadMenu" class="download-menu">
            <a href="#" @click.prevent="downloadApk">Android APK</a>
            <a href="#" @click.prevent="downloadIos">iOS App</a>
          </div>
        </div>
        <button @click="logout" class="logout-btn-modern" title="Logout" aria-label="Logout">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </header>

    <!-- Persistent Employee Sidebar (Stays mounted, never refreshes during employee navigation) -->
    <EmployeeSidebar
      v-if="showEmployeeSidebar"
      :isLayoutInstance="true"
    />

    <!-- Main Content Area -->
    <div
      ref="mainContentArea"
      class="main-content-area"
      :class="{
        'no-margin': $route.meta.hideHeader,
        'with-employee-sidebar': showEmployeeSidebar,
        'sidebar-collapsed': isSidebarCollapsed
      }"
    >
      <router-view />
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
              : 'https://cdn-icons-png.flaticon.com/512/219/219983.png'"
            alt="User"
            class="user-avatar"
          />
          <div class="user-name">{{ user.name }}</div>
          <div class="user-role">{{ user.department }}</div>
        </div>

        <div class="sidebar-divider"></div>

        <!-- 📂 Menu -->
        <ul class="sidebar-menu">
          <li @click="goTo('employee/dashboard')" :class="{ active: isActive('employee/dashboard', ['dashboard']) }">
            <i class="fas fa-tachometer-alt"></i> <span>Dashboard</span>
          </li>
          <li @click="goTo('employee/archcalendar')" :class="{ active: isActive('employee/archcalendar', ['archcalendar', 'employee/archcalender']) }">
            <i class="fas fa-calendar-alt"></i> <span>Calendar</span>
          </li>
          <li @click="goTo('employee/help')" :class="{ active: isActive('employee/help', ['help']) }">
            <i class="fas fa-comments"></i> <span>Chat</span>
          </li>
          <li class="has-submenu" :class="{ 'submenu-active': isLeavesActive }">
            <div class="submenu-title" @click="toggleLeaves">
              <i class="fas fa-calendar-check"></i>
              <span>Leaves</span>
              <i class="fa fa-caret-down" :class="{ rotate: leavesOpen }"></i>
            </div>
            <ul v-if="leavesOpen" class="submenu">
              <li @click="goTo('employee/leaveapplicationsemp')" :class="{ active: isActive('employee/leaveapplicationsemp') }">
                <i class="fas fa-list"></i> All Leaves
              </li>
              <li @click="goTo('employee/approvedleavesemp')" :class="{ active: isActive('employee/approvedleavesemp') }">
                <i class="fas fa-check-circle"></i> Approved
              </li>
              <li @click="goTo('employee/rejectedleavesemp')" :class="{ active: isActive('employee/rejectedleavesemp') }">
                <i class="fas fa-times-circle"></i> Rejected
              </li>
              <li @click="goTo('employee/pendingleaves')" :class="{ active: isActive('employee/pendingleaves') }">
                <i class="fas fa-hourglass-half"></i> Pending Leaves
              </li>
            </ul>
          </li>
          <li @click="goTo('employee/applyleave')" :class="{ active: isActive('employee/applyleave') }">
            <i class="fas fa-plane-departure"></i><span> Apply for Leave</span>
          </li>
          <li class="mobile-only" @click="goTo('employee/Customerregistrations')" :class="{ active: isActive('employee/Customerregistrations', ['employee/customerregistrations']) }">
            <i class="fas fa-user-friends"></i><span> CRM</span>
          </li>
          <li class="mobile-only" @click="goTo('employee/quotations')" :class="{ active: isActive('employee/quotations', ['quotations', 'all-quotations', 'employee/all-quotations', 'quotations-list']) }">
            <i class="fas fa-file-invoice-dollar"></i><span> All Quotations</span>
          </li>
          <li v-if="onlyViewITSales" @click="goTo('employee/lead-management')" :class="{ active: isActive('employee/lead-management', ['lead-management', 'employee/leads', 'leads']) }">
            <i class="fas fa-funnel-dollar"></i><span> Lead Management</span>
          </li>
          <li @click="goTo('employee/viewAnnouncement')" :class="{ active: isActive('employee/viewAnnouncement', ['employee/viewannouncement']) }">
            <i class="fas fa-bullhorn"></i><span> Announcement</span>
          </li>
          <li @click="goTo('employee/request')" :class="{ active: isActive('employee/request') }">
            <i class="fa fa-check-square-o"></i><span> Request Desk</span>
          </li>
          <li @click="goTo('employee/resourcebooking')" :class="{ active: isActive('employee/resourcebooking', ['employee/Resourcebooking', 'resourcebooking']) }">
            <i class="fa-solid fa-calendar"></i><span> Resource Booking</span>
          </li>
          <li @click="goTo('employee/viewkra')" :class="{ active: isActive('employee/viewkra') }">
            <i class="fas fa-tasks"></i> <span>View KRA</span>
          </li>
          <li @click="goTo('employee/mydsi')" :class="{ active: isActive('employee/mydsi', ['mydsi', 'empdsi']) }">
            <i class="fas fa-chart-line"></i><span> DSI</span>
          </li>
          <li @click="goTo('employee/vault')" :class="{ active: isActive('employee/vault', ['vault', 'security-vault']) }">
            <i class="fas fa-shield-alt"></i><span> Security Vault</span>
          </li>
          <li @click="goTo('employee/myprofile')" :class="{ active: isActive('employee/myprofile') }">
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

    <!-- 🔒 Daily Mandatory Attendance Modal -->
    <DailyAttendanceModal />
  </div>
</template>

<script>
import { computed } from 'vue'
import NotificationBell from '@views/employee/components/NotificationBell.vue'
import AdminNotificationBell from './components/AdminNotificationBell.vue'
import DailyAttendanceModal from './components/DailyAttendanceModal.vue'
import DiwaliDecoration from './components/DiwaliDecoration.vue'
import AdminSidebar from './components/Sidebar.vue'
import EmployeeSidebar from './views/employee/components/Sidebar.vue'
import axios from 'axios'
import { toastInfo } from "@/utils/toast.js";
import { initSessionTimeout, destroySessionTimeout, clearActivityTimer } from "@/utils/sessionTimeout.js";

export default {
  components: {
    NotificationBell,
    AdminNotificationBell,
    DailyAttendanceModal,
    DiwaliDecoration,
    AdminSidebar,
    EmployeeSidebar,
  },

  provide() {
    return {
      hasPersistentSidebar: computed(() => this.showEmployeeSidebar)
    };
  },

  data() {
    return {
      isSidebarCollapsed: false,
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
      user: (() => {
        try {
          const stored = localStorage.getItem('user');
          if (stored) {
            const parsed = JSON.parse(stored);
            return {
              name: parsed.name || '',
              department: parsed.department || '',
              profile_photo: parsed.profile_photo || '',
              role: parsed.role || '',
              id: parsed.id || null
            };
          }
        } catch (e) {}
        return { name: '', department: '', profile_photo: '', role: '', id: null };
      })(),
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
    } 
  },

  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token');
    },
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
    },
    isAdmin() {
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      const role = String(this.user?.role || localUser?.role || '').toLowerCase();
      return role === 'admin' || role === 'superadmin';
    },
    isAdminRoute() {
      const path = (this.$route.path || '').toLowerCase();
      if (path === '/' || path === '/auth' || path.startsWith('/quotation') || path.startsWith('/employee/')) {
        return false;
      }
      try {
        const localUser = JSON.parse(localStorage.getItem('user') || '{}');
        const role = String(this.user?.role || localUser?.role || '').toLowerCase();
        if (role === 'employee') return false;
      } catch (_) {}
      return !!localStorage.getItem('token');
    },
    isEmployeeRoute() {
      const currentPath = (this.$route?.path && this.$route.path !== '/')
        ? this.$route.path
        : (typeof window !== 'undefined' ? window.location.pathname : '');
      const path = currentPath.toLowerCase();
      if (path === '/' || path === '/auth' || path.startsWith('/quotation') || path === '/quotation-report') {
        return false;
      }
      if (path === '/employee' || path.startsWith('/employee/')) {
        return true;
      }
      const employeeStandaloneRoutes = [
        '/archapps',
        '/myapps',
        '/salaryslip',
        '/revenue-analytics',
        '/performance'
      ];
      if (employeeStandaloneRoutes.some(r => path === r || path.startsWith(r + '/'))) {
        try {
          const localUser = JSON.parse(localStorage.getItem('user') || '{}');
          const role = String(this.user?.role || localUser?.role || '').toLowerCase();
          return role === 'employee';
        } catch (_) {}
      }
      return false;
    },
    showEmployeeSidebar() {
      if (!this.isEmployeeRoute) return false;
      if (this.$route?.meta?.hideSidebar) return false;
      const currentPath = (this.$route?.path && this.$route.path !== '/')
        ? this.$route.path
        : (typeof window !== 'undefined' ? window.location.pathname : '');
      const path = currentPath.toLowerCase();
      const hideSidebarRoutes = [
        '/employee/lead-management',
        '/lead-management',
        '/employee/leads',
        '/leads',
        '/employee/lead-details',
        '/lead-details',
        '/employee/lead-360',
        '/employee/daily-sales-report',
        '/daily-sales-report',
        '/employee/sales-report',
        '/today-sales-report',
        '/daily-report',
        '/employee/followup',
        '/followup'
      ];
      if (hideSidebarRoutes.some(r => path === r || path.startsWith(r + '/'))) {
        return false;
      }
      return true;
    },
    onlyViewITSales() {
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      const dept = String(this.user?.department || localUser?.department || '').toLowerCase().trim();
      const role = String(this.user?.role || localUser?.role || '').toLowerCase().trim();
      const desig = String(this.user?.designation || localUser?.designation || '').toLowerCase().trim();
      const normDept = dept.replace(/[\s_-]+/g, '');
      const normRole = role.replace(/[\s_-]+/g, '');
      const normDesig = desig.replace(/[\s_-]+/g, '');

      const isSales = (
        normDept === 'itsales' ||
        dept === 'it sales' ||
        dept === 'it_sales' ||
        dept === 'it-sales' ||
        (normDept.includes('it') && (normDept.includes('sale') || normDept.includes('sales'))) ||
        (normDesig.includes('it') && (normDesig.includes('sale') || normDesig.includes('sales')))
      );

      const isOwnerOrAdmin = (
        normDept === 'owner' ||
        normDept === 'ownership' ||
        dept === 'owner' ||
        dept === 'ownership' ||
        normRole === 'owner' ||
        normRole === 'itlead' ||
        normRole === 'it lead' ||
        dept === 'it lead' ||
        role === 'it_lead' ||
        normRole === 'admin' ||
        this.isAdmin
      );

      return Boolean(isSales || isOwnerOrAdmin);
    },
    isLeavesActive() {
      const current = (this.$route?.path || '').toLowerCase().replace(/^\/+|\/+$/g, '');
      return [
        'employee/leaveapplicationsemp',
        'employee/approvedleavesemp',
        'employee/rejectedleavesemp',
        'employee/pendingleaves',
        'leaveapplicationsemp',
        'approvedleavesemp',
        'rejectedleavesemp',
        'pendingleaves'
      ].some(r => current === r || current.startsWith(r + '/'));
    }
  },

  watch: {
    $route: {
      immediate: true,
      handler(to) {
        if (this.$refs.mainContentArea) {
          this.$refs.mainContentArea.scrollTop = 0;
        }
        if (this.isLeavesActive) {
          this.leavesOpen = true;
        }
        this.loadUser();
        if (to && to.path !== '/auth' && to.path !== '/') {
          this.fetchNotifications();
        }
      }
    }
  },

  mounted() {
    this.loadUser()
    this.fetchNotifications()
    initSessionTimeout(this.$router)

    window.addEventListener('auth-change', this.handleAuthChange)
    window.addEventListener('storage', this.handleStorageChange)
    window.addEventListener('keydown', this.handleEscape)
    window.addEventListener('sidebar-collapse-change', this.handleSidebarCollapse)
    
    // Close download menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.$el.querySelector('.download-app')?.contains(e.target)) {
        this.showDownloadMenu = false
      }
    })
    
    this.showFocusOnSBUButton()
  },

  beforeUnmount() {
    destroySessionTimeout()
    window.removeEventListener('auth-change', this.handleAuthChange)
    window.removeEventListener('storage', this.handleStorageChange)
    window.removeEventListener('keydown', this.handleEscape)
    window.removeEventListener('sidebar-collapse-change', this.handleSidebarCollapse)
    document.removeEventListener('click', this.closeNotificationPanel)
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
          }).catch(err => {
            console.warn('Notifications fetch warning:', err?.message || err);
            return { data: [] };
          }),
          axios.get('https://employees.archenterprises.co.in/api/api/mentions/unread-count', {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => {
            console.warn('Mentions unread-count warning:', err?.message || err);
            return { data: { count: 0 } };
          })
        ]);
        this.notifications = Array.isArray(mentionsRes?.data) ? mentionsRes.data : [];
        this.unreadMentionsCount = unreadRes?.data?.count || 0;
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

    isActive(route, aliases = []) {
      if (!route) return false;
      const current = (this.$route?.path || '').toLowerCase().replace(/^\/+|\/+$/g, '');
      const targets = [route, ...(Array.isArray(aliases) ? aliases : [aliases])].filter(Boolean);
      return targets.some(target => {
        const clean = target.toLowerCase().replace(/^\/+|\/+$/g, '');
        return current === clean || current.startsWith(clean + '/');
      });
    },

    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
      window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'));
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

    handleAuthChange(e) {
      if (e && e.detail) {
        this.user.name = e.detail.name || '';
        this.user.department = e.detail.department || '';
        this.user.profile_photo = e.detail.profile_photo || '';
        this.user.role = e.detail.role || '';
        this.user.id = e.detail.id || null;
      } else {
        this.loadUser();
      }
    },

    handleStorageChange(e) {
      if (!e || e.key === 'user' || e.key === null) {
        this.loadUser();
      }
    },

    loadUser() {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          this.user.name = parsedUser.name || ''
          this.user.department = parsedUser.department || ''
          this.user.profile_photo = parsedUser.profile_photo || ''
          this.user.role = parsedUser.role || ''
          this.user.id = parsedUser.id || null
          return
        } catch (e) {}
      }
      this.user.name = ''
      this.user.department = ''
      this.user.profile_photo = ''
      this.user.role = ''
      this.user.id = null
    },

    handleSidebarCollapse(e) {
      this.isSidebarCollapsed = Boolean(e?.detail);
    },

    toggleSidebar() {
      if (this.isEmployeeRoute) {
        window.dispatchEvent(new CustomEvent('toggle-employee-sidebar'));
        return;
      }
      this.sidebarOpen = !this.sidebarOpen
      if (this.sidebarOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    },
    
    logout() {
      if (this.sidebarOpen) {
        this.toggleSidebar()
      }
      clearActivityTimer()
      const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
      axios
        .post(
          "https://employees.archenterprises.co.in/api/api/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .finally(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("admin_token");
          localStorage.removeItem("user");
          localStorage.removeItem("loginTime");
          this.user.name = '';
          this.user.department = '';
          this.user.profile_photo = '';
          this.user.role = '';
          this.user.id = null;
          window.dispatchEvent(new CustomEvent('auth-change', { detail: null }));
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
  --primary: #0d9488;
  --primary-dark: #0f766e;
  --primary-light: #f0fdfa;
  --sidebar: #ffffff;
  --sidebar-bg: #ffffff;
  --card: #ffffff;
  --text: #0f172a;
  --text-white: #ffffff;
  --gray: #64748b;
  --light: #f8fafc;
  --border: #e2e8f0;
  --danger: #ef4444;
  --bg-app: #f1f5f9;
}

/* Theme Support - Professional Clean Palettes */
:root, [data-theme="default"], [data-theme="Default"], [data-theme="teal"] {
  --primary: #0d9488; 
  --primary-dark: #0f766e;
  --primary-light: #f0fdfa;
  --primary-gradient: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  --primary-glow: rgba(13, 148, 136, 0.16);
  --sidebar: #ffffff; 
  --card: #ffffff; 
  --text: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;
  --bg: #f1f5f9;
  --bg-app: #f1f5f9;
  --surface-tint: #f1f5f9;
}

[data-theme="emerald"] {
  --primary: #10b981; 
  --primary-dark: #059669;
  --primary-light: #ecfdf5;
  --primary-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
  --primary-glow: rgba(16, 185, 129, 0.16);
  --sidebar: #ffffff; 
  --card: #ffffff; 
  --text: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;
  --bg: #f1f5f9;
  --bg-app: #f1f5f9;
  --surface-tint: #f1f5f9;
}

[data-theme="blue"] {
  --primary: #3b82f6;
  --primary-dark: #1d4ed8;
  --primary-light: #eff6ff;
  --primary-gradient: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  --primary-glow: rgba(59, 130, 246, 0.16);
  --sidebar: #ffffff;
  --card: #ffffff;
  --text: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;
  --bg: #f1f5f9;
  --bg-app: #f1f5f9;
  --surface-tint: #f1f5f9;
}

[data-theme="purple"] {
  --primary: #8b5cf6;
  --primary-dark: #6d28d9;
  --primary-light: #f5f3ff;
  --primary-gradient: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  --primary-glow: rgba(139, 92, 246, 0.16);
  --sidebar: #ffffff;
  --card: #ffffff;
  --text: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;
  --bg: #f1f5f9;
  --bg-app: #f1f5f9;
  --surface-tint: #f1f5f9;
}

[data-theme="green"] {
  --primary: #16a34a;
  --primary-dark: #15803d;
  --primary-light: #f0fdf4;
  --primary-gradient: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  --primary-glow: rgba(22, 163, 74, 0.16);
  --sidebar: #ffffff;
  --card: #ffffff;
  --text: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;
  --bg: #f1f5f9;
  --bg-app: #f1f5f9;
  --surface-tint: #f1f5f9;
}

[data-theme="orange"] {
  --primary: #ea580c;
  --primary-dark: #c2410c;
  --primary-light: #fff7ed;
  --primary-gradient: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
  --primary-glow: rgba(234, 88, 12, 0.16);
  --sidebar: #ffffff;
  --card: #ffffff;
  --text: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;
  --bg: #f1f5f9;
  --bg-app: #f1f5f9;
  --surface-tint: #f1f5f9;
}

[data-theme="red"] {
  --primary: #ef4444;
  --primary-dark: #b91c1c;
  --primary-light: #fef2f2;
  --primary-gradient: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  --primary-glow: rgba(239, 68, 68, 0.16);
  --sidebar: #ffffff;
  --card: #ffffff;
  --text: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;
  --bg: #f1f5f9;
  --bg-app: #f1f5f9;
  --surface-tint: #f1f5f9;
}

[data-theme="dark"] {
  --primary: #38bdf8;
  --primary-dark: #0284c7;
  --primary-light: #1e293b;
  --primary-gradient: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
  --primary-glow: rgba(56, 189, 248, 0.25);
  --sidebar: #0f172a;
  --card: #1e293b;
  --text: #f8fafc;
  --text-muted: #94a3b8;
  --border: #334155;
  --bg: #0b1120;
  --bg-app: #0b1120;
  --surface-tint: #162033;
}

.theme-transition,
.theme-transition * {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease !important;
}

/* Global & Layout Base */
html, body {
  background-color: var(--bg-app, #f1f5f9);
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

.app-layout {
  min-height: 100vh;
  background: var(--bg-app, #f1f5f9);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.app-layout.employee-mode {
  background: #f1f5f9 !important;
}

/* Modern Header - Fixed */
.modern-header {
  background: var(--card, #ffffff);
  padding: 0 2rem;
  height: 78px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* box-shadow: 0 4px 20px var(--primary-glow, rgba(44, 182, 125, 0.05)); */
  border-bottom: 1px solid var(--border, #e0f0e8);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transition: background-color 0.25s ease, border-color 0.25s ease;
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
  color: var(--text, #0f2e22);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.logo-img {
  height: 56px;
  width: auto;
  max-width: 280px;
  object-fit: contain;
  transition: transform 0.2s ease;
}

.logo-text {
  font-weight: 700;
  font-size: 1.4rem;
  background: var(--primary-gradient, linear-gradient(135deg, var(--primary), #7c3aed));
  -webkit-background-clip: text;
  background-clip: text;
      font-family: sans-serif;
  color: transparent;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  position: relative;
}

.user-greeting {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--primary-light, #f0fdf4);
  border: 1px solid var(--border, #dcfce7);
  color: var(--primary-dark, #166534);
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.4rem 0.85rem;
  border-radius: 30px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.user-greeting i {
  font-size: 1.05rem;
  color: var(--primary, #16a34a);
}

/* Notification Bell */
.notification-bell-wrapper {
  position: relative;
  cursor: pointer;
  font-size: 1.2rem;
  color: var(--text-muted, #64748b);
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
  top: -4px;
  right: -4px;
  background: var(--danger, #ef4444);
  color: white;
  font-size: 0.68rem;
  padding: 0 4px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 2px solid var(--card, #ffffff);
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.35);
}

.notification-dropdown {
  position: absolute;
  top: 45px;
  right: 0;
  width: 300px;
  background: var(--card, #ffffff);
  border: 1px solid var(--border, #e0f0e8);
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
  color: var(--text, #0f2e22);
}

.notification-item i {
  color: var(--primary);
}

.notification-item small {
  margin-left: auto;
  font-size: 0.7rem;
  color: var(--text-muted, #64748b);
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
  background: #ffffff;
  border: 1px solid #e2e8f0;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.download-btn:hover {
  background: #f8fafc;
  color: #0284c7;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(2, 132, 199, 0.12);
}

.download-btn i {
  font-size: 1.05rem;
  color: #0284c7;
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
  background: #fff1f2;
  border: 1px solid #ffe4e6;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.logout-btn-modern:hover {
  background: #fee2e2;
  border-color: #fecdd3;
  color: #be123c;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(225, 29, 72, 0.12);
}

.logout-btn-modern i {
  font-size: 1.05rem;
  color: #e11d48;
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
  margin-top: 78px;
  /* padding: 1.5rem; */
  min-height: calc(100vh - 78px);
  overflow-y: auto;
  box-sizing: border-box;
}

@media (min-width: 769px) {
  .main-content-area.with-employee-sidebar {
    padding-left: 284px;
  }
  .main-content-area.with-employee-sidebar.sidebar-collapsed {
    padding-left: 104px;
    transition: padding-left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@media (max-width: 768px) {
  .main-content-area.with-employee-sidebar {
    padding-left: 0 !important;
  }
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

.sidebar-menu li.active {
  background: var(--primary-gradient, linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)) !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18) !important;
}

.sidebar-menu li.active i {
  color: #ffffff !important;
}

.submenu li.active {
  background: rgba(255, 255, 255, 0.25) !important;
  color: #ffffff !important;
  font-weight: 700 !important;
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

/* ════════ Completely Invisible Scrollbars for Admin Sidebar ════════ */
.sidebar,
.sidebar *,
.menu-scroll,
.menu-scroll * {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.sidebar::-webkit-scrollbar,
.menu-scroll::-webkit-scrollbar,
.sidebar *::-webkit-scrollbar,
.menu-scroll *::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}

.sidebar::-webkit-scrollbar-thumb,
.menu-scroll::-webkit-scrollbar-thumb,
.sidebar::-webkit-scrollbar-track,
.menu-scroll::-webkit-scrollbar-track,
.sidebar::-webkit-scrollbar-button,
.menu-scroll::-webkit-scrollbar-button {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
  border: none !important;
}
</style>