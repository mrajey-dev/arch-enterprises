<template>
  <div class="layout" :class="{ 'focus-overlay-active': showFocusOverlay }">
    <!-- Focus Overlay for highlighting SBU button -->
    <div v-if="showFocusOverlay" class="focus-overlay" @click="dismissFocusOverlay"></div>

  

    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- Welcome Banner -->
        <div class="welcome-banner">
          <div class="banner-content">
            <h1>Welcome back, {{ formatFirstName(currentUser.name) || 'Employee' }}!</h1>
            <p>Here's what's happening with your work today.</p>
          </div>
          <div class="date-badge">
            <i class="fas fa-calendar-alt"></i>
            <span>{{ formattedDate }}</span>
          </div>
        </div>

        <!-- KPI Cards Grid -->
        <div class="dashboard-row">
          <div class="dashboard-card clickable-card" @click="goTo('employee/mytask')">
            <div class="card-icon tasks-icon">
              <i class="fas fa-tasks"></i>
            </div>
            <div class="card-info">
              <p class="label">My Tasks</p>
              <h3 class="value">Active: {{ activeTasks.length }}</h3>
              <span class="progress-text">View & Manage Tasks</span>
            </div>
          </div>

          <div class="dashboard-card clickable-card" @click="goTo('employee/empattendance')">
            <div class="card-icon attendance-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="card-info">
              <p class="label">Attendance</p>
              <span class="progress-text">Mark your daily attendance</span>
            </div>
          </div>

          <div class="dashboard-card clickable-card" @click="goTo('employee/help')">
            <div class="card-icon chat-icon">
              <i class="fas fa-comments"></i>
            </div>
            <div class="card-info">
              <p class="label">Recent Mentions</p>
              <h3 class="value">{{ unreadMentionsCount }}</h3>
              <span class="progress-text">You have unread messages</span>
            </div>
          </div>

          <div class="dashboard-card clickable-card desktop-only" @click="goTo('employee/Customerregistrations')">
            <div class="card-icon crm-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="card-info">
              <p class="label">CRM</p>
              <h3 class="value">184</h3>
              <span class="progress-text">Manage customers & add PO</span>
            </div>
          </div>

          <div class="dashboard-card clickable-card mobile-only" @click="goTo('employee/visitschedule')">
            <div class="card-icon visit-icon">
              <i class="fas fa-calendar-week"></i>
            </div>
            <div class="card-info">
              <p class="label">Visit Schedule</p>
              <h3 class="value">3</h3>
              <div class="progress-bar">
                <div class="progress-fill" style="width: 60%"></div>
              </div>
              <span class="progress-text">This week</span>
            </div>
          </div>

          
        </div>

        <!-- Split Section: Chart & Birthday Celebrations -->
        <div class="dashboard-split">
          <div class="chart-card">
            <div class="card-header">
              <h3>Work Analytics</h3>
              <i class="fas fa-chart-line"></i>
            </div>
            <DataChart />
          </div>

          <!-- 🎂 Birthday Celebrations Widget -->
         <div class="upcoming-card">
            <div class="card-header">
              <h3>Active Tasks (Not Completed)</h3>
              <i class="fas fa-tasks"></i>
            </div>
            <div class="upcoming-list">
              <div v-for="(task, index) in activeTasks" :key="task.id" class="upcoming-item" @click="goToTask(task.id)">
                <div class="task-priority" :class="getPriorityClass(task.priority)"></div>
                <div class="task-details">
                  <strong>{{ truncateText(task.title, 40) }}</strong>
                  <span class="deadline"><i class="far fa-clock"></i> Due: {{ formatDate(task.due_date) }}</span>
                  <span class="task-status" :class="getStatusClass(task.status)">{{ task.status || 'Pending' }}</span>
                </div>
                <div class="task-arrow">
                  <i class="fas fa-chevron-right"></i>
                </div>
              </div>
              <div v-if="activeTasks.length === 0" class="no-tasks">
                <i class="far fa-smile-wink"></i>
                <p>All tasks completed! 🎉</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Tasks & Recent Leaves Row -->
        <div class="dashboard-split">
           <div class="birthday-widget">
            <div class="card-header">
              <h3>
                <i class="fas fa-birthday-cake"></i> Birthday Celebrations
              </h3>
              <div class="current-month-badge">
                <i class="fas fa-calendar-alt"></i> {{ currentMonthName }}
              </div>
            </div>

            <div v-if="birthdayList.length > 0" class="birthday-list">
              <div
                v-for="(employee, idx) in birthdayList"
                :key="employee.id"
                class="birthday-item"
                :style="{ animationDelay: (idx * 0.1) + 's' }"
              >
                <div class="birthday-avatar">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    alt="profile"
                    class="avatar-img"
                  />
                  <div class="cake-icon">
                    <i class="fas fa-birthday-cake"></i>
                  </div>
                </div>
                <div class="birthday-info">
                  <strong>{{ employee.name }}</strong>
                  <span class="birthday-date">
                    <i class="fas fa-gift"></i> {{ formatBirthdayDate(employee.dateofbirth) }}
                  </span>
                  <span class="birthday-dept">{{ employee.department || 'N/A' }}</span>
                </div>
                <button class="wish-button" @click="wishBirthday(employee)">
                  <i class="fas fa-heart"></i> Wish
                </button>
              </div>
            </div>

            <div v-else class="no-birthday-state">
              <div class="no-birthday-icon">
                <i class="fas fa-calendar-times"></i>
              </div>
              <p>No birthdays this month 🎈</p>
              <span>Check back next month!</span>
            </div>
          </div>
          

          <div class="recent-leaves-card">
            <div class="card-header">
              <h3><i class="fas fa-umbrella-beach"></i> Recent Leave Applications</h3>
              <button class="view-all-btn" @click="goTo('employee/leaveapplicationsemp')">View All</button>
            </div>
            <div class="leaves-list">
              <div v-for="leave in recentLeaves" :key="leave.id" class="leave-item">
                <div class="leave-icon-small" :class="getLeaveIconClass(leave.leaveType)">
                  <i :class="getLeaveIcon(leave.leaveType)"></i>
                </div>
                <div class="leave-details">
                  <div class="leave-title">{{ leave.leaveType }}</div>
                  <div class="leave-dates">{{ formatDate(leave.fromDate) }} - {{ formatDate(leave.toDate) }}</div>
                </div>
                <div class="leave-status" :class="getLeaveStatusClass(leave.status)">
                  {{ leave.status }}
                </div>
              </div>
              <div v-if="recentLeaves.length === 0" class="no-leaves">
                <i class="far fa-calendar-check"></i>
                <p>No recent leave applications</p>
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>

    <!-- Daily Report Modal -->
    <div class="modal-overlay" v-if="showModal">
      <div class="modal modern-modal">
        <div class="modal-header">
          <h2><i class="fas fa-clipboard-list"></i> Daily Work Report</h2>
          <span class="close-btn" @click="showModal = false">&times;</span>
        </div>
        <form @submit.prevent="submitReport">
          <div class="form-group">
            <label><i class="fas fa-calendar"></i> Date</label>
            <input type="date" v-model="report.date" required />
          </div>
          <div class="form-group">
            <label><i class="fas fa-user"></i> Name</label>
            <input type="text" v-model="report.name" required />
          </div>
          <div class="form-row">
            <div class="form-group half">
              <label><i class="fas fa-chart-simple"></i> Status</label>
              <select v-model="report.status" required>
                <option disabled value="">Select Status</option>
                <option>Completed</option>
                <option>Progress</option>
                <option>Pending</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label><i class="fas fa-pen-alt"></i> Work Summary</label>
            <textarea v-model="report.summary" placeholder="Describe your work today..." required></textarea>
          </div>
          <button type="submit" class="submit-btn"><i class="fas fa-paper-plane"></i> Submit Report</button>
        </form>
      </div>
    </div>

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
import axios from 'axios'
import Sidebar from './components/Sidebar.vue';
import DataChart from './components/DataChart.vue';
import { toastSuccess, toastError, toastInfo } from "@/utils/toast.js";

export default {
  name: 'Dashboard',
  components: { Sidebar, DataChart },
  data() {
    return {
      showDownloadMenu: false,
      isMobile: false,
      upcomingTasks: [],
      currentUser: {},
      allTasks: [],
      leaveRequests: [],
      notifications: [],
      unreadMentionsCount: 0,
      showNotificationPanel: false,
      userEmail: '',
      birthdaysThisMonth: [],
      birthdayList: [],
      currentMonthName: '',
      isSidebarVisible: true,
      report: {
        date: '',
        name: '',
        status: '',
        department: '',
        summary: '',
      },
      departments: [],
      showModal: false,
      users: [],
      showGoogleFormModal: false,
      googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfwz35YgfHbSIm3-zapvywqD8pw56fXc-U5EwpCmcG3v3zwrg/viewform?embedded=true',
      showFocusOverlay: false,
      highlightStyle: {},
      focusTimer: null,
      refreshTimer: null
    }
  },

  computed: {
    activeTasks() {
      if (!this.allTasks.length) return [];
      return this.allTasks.filter(task => {
        const status = (task.status || '').toLowerCase();
        return status !== 'completed';
      });
    },
    pendingLeavesCount() {
      return this.leaveRequests.filter(leave => leave.status === 'Pending').length;
    },
    recentLeaves() {
      return [...this.leaveRequests]
        .sort((a, b) => new Date(b.created_at || b.fromDate) - new Date(a.created_at || a.fromDate))
        .slice(0, 4);
    },
    recentNotifications() {
      return this.notifications.slice(0, 4);
    },
    formattedDate() {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Date().toLocaleDateString(undefined, options);
    }
  },

  methods: {
    getAuthHeaders() {
      return { Authorization: `Bearer ${localStorage.getItem('token')}` };
    },

    async fetchCurrentUser() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/user', {
          headers: this.getAuthHeaders()
        });
        this.currentUser = response.data;
        this.userEmail = response.data.email || '';
        if (this.currentUser.name) this.report.name = this.currentUser.name;
      } catch (err) {
        console.error('fetchCurrentUser error:', err);
      }
    },

    async fetchAllTasks() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/tasks', {
          headers: this.getAuthHeaders()
        });
        this.allTasks = response.data;
      } catch (err) {
        console.error('fetchAllTasks error:', err);
      }
    },

    async fetchLeaveRequests() {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('https://employees.archenterprises.co.in/api/api/leave-requests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (this.currentUser && this.currentUser.name) {
          this.leaveRequests = data.filter(leave => leave.name === this.currentUser.name);
        } else {
          this.leaveRequests = [];
        }
      } catch (error) {
        console.error('Failed to fetch leave requests:', error);
      }
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

    async fetchBirthdays() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/users', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const allUsers = response.data;

        const currentMonth = new Date().getMonth();
        this.currentMonthName = new Date().toLocaleString('default', { month: 'long' });

        this.birthdayList = allUsers.filter(user => {
          if (!user.dateofbirth) return false;
          const dob = new Date(user.dateofbirth);
          return dob.getMonth() === currentMonth;
        }).sort((a, b) => {
          const dayA = new Date(a.dateofbirth).getDate();
          const dayB = new Date(b.dateofbirth).getDate();
          return dayA - dayB;
        });
      } catch (error) {
        console.error('Error fetching birthdays:', error);
      }
    },

    async fetchDepartments() {
      try {
        const res = await axios.get('https://employees.archenterprises.co.in/api/api/departments', {
          headers: this.getAuthHeaders()
        });
        if (Array.isArray(res.data) && res.data.length) this.departments = res.data;
      } catch (err) {
        console.error('fetchDepartments error:', err);
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    formatBirthdayDate(dateString) {
      if (!dateString) return '';
      const options = { day: 'numeric', month: 'long' };
      return new Date(dateString).toLocaleDateString('en-US', options);
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

    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },

    getInitials(name) {
      if (!name) return 'U';
      return name.charAt(0).toUpperCase();
    },

    getLeaveIcon(leaveType) {
      const type = (leaveType || '').toLowerCase();
      if (type.includes('sick')) return 'fas fa-thermometer-half';
      if (type.includes('casual')) return 'fas fa-sun';
      if (type.includes('annual')) return 'fas fa-calendar-alt';
      if (type.includes('emergency')) return 'fas fa-ambulance';
      return 'fas fa-umbrella-beach';
    },

    getLeaveIconClass(leaveType) {
      const type = (leaveType || '').toLowerCase();
      if (type.includes('sick')) return 'leave-sick';
      if (type.includes('casual')) return 'leave-casual';
      if (type.includes('annual')) return 'leave-annual';
      return 'leave-default';
    },

    getLeaveStatusClass(status) {
      if (status === 'Approved') return 'status-approved';
      if (status === 'Rejected') return 'status-rejected';
      return 'status-pending';
    },

    wishBirthday(employee) {
      toastSuccess(`🎉 Happy Birthday ${employee.name}! 🎂\nWishing you a wonderful day!`);
    },

    highlightMentions(text) {
      if (!text) return '';
      return text.replace(
        /@([A-Za-z0-9_]+)/g,
        '<span class="mention-highlight">@$1</span>'
      );
    },

    goTo(route) {
      this.$router.push(`/${route}`);
    },

    goToTask(taskId) {
      this.$router.push(`/employee/mytask`);
    },

    async submitReport() {
      try {
        const formData = new FormData();
        formData.append('date', this.report.date);
        formData.append('name', this.report.name);
        formData.append('status', this.report.status);
        formData.append('department', this.report.department);
        formData.append('summary', this.report.summary);

        await axios.post('https://employees.archenterprises.co.in/api/api/daily-reports', formData, {
          headers: { ...this.getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
        });

        toastSuccess('Report submitted successfully!');
        this.showModal = false;
        this.report.summary = '';
      } catch (error) {
        console.error('Failed to submit report:', error);
        toastError('Page is under maintenance. Please try again later.');
      }
    },

    showFocusOnSBUButton() {
      const hasSeenFocus = localStorage.getItem('hasSeenSBUFocus');
      if (hasSeenFocus) return;

      setTimeout(() => {
        const btn = this.$refs.googleFormBtn;
        const card = this.$refs.googleFormCard;
        
        if (btn || card) {
          this.showFocusOverlay = true;
          this.focusTimer = setTimeout(() => {
            this.dismissFocusOverlay();
          }, 10000);
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

    logout() {
      axios.post('https://employees.archenterprises.co.in/api/api/logout', {}, {
        headers: this.getAuthHeaders()
      }).finally(() => {
        localStorage.removeItem('token');
        this.$router.push('/auth');
      });
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },

    formatFirstName(fullName) {
      if (!fullName) return '';
      return fullName.split(' ')[0];
    },

    downloadApk() {
      toastInfo('APK download starting...');
    },
    downloadIos() {
      toastInfo('iOS app coming soon!');
    },
    toggleDownloadMenu() {
      this.showDownloadMenu = !this.showDownloadMenu;
    },

    getPriorityClass(priority) {
      if (!priority) return 'medium';
      const p = priority.toLowerCase();
      if (p === 'high') return 'high';
      if (p === 'low') return 'low';
      return 'medium';
    },

    getStatusClass(status) {
      if (!status) return '';
      const s = status.toLowerCase();
      if (s === 'pending') return 'status-pending';
      if (s === 'in progress') return 'status-progress';
      if (s === 'completed') return 'status-completed';
      return '';
    },

    async refreshAllData() {
      await Promise.all([
        this.fetchAllTasks(),
        this.fetchLeaveRequests(),
        this.fetchNotifications(),
        this.fetchBirthdays()
      ]);
    }
  },

  async mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    document.addEventListener('click', (e) => {
      if (!this.$el.querySelector('.download-app')?.contains(e.target)) {
        this.showDownloadMenu = false;
      }
    });

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.report.name = user.name || '';
      } catch (e) {}
    }

    await this.fetchCurrentUser();
    await this.refreshAllData();
    await this.fetchDepartments();
    
    this.showFocusOnSBUButton();

    // Auto-refresh every 30 seconds
    this.refreshTimer = setInterval(() => {
      this.refreshAllData();
    }, 30000);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.checkIfMobile);
    document.body.style.overflow = '';
    if (this.focusTimer) {
      clearTimeout(this.focusTimer);
    }
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    document.removeEventListener('click', this.closeNotificationPanel);
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

:root {
  --primary: #4361ee;
  --primary-dark: #3a56d4;
  --secondary: #06ffa5;
  --dark: #1e293b;
  --gray: #64748b;
  --light: #f8fafc;
  --border: #e2e8f0;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #3b82f6;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  background: #f1f5f9;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  position: relative;
}

/* Focus Overlay Styles */
.layout.focus-overlay-active {
  overflow: hidden;
}

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

/* Modern Header */
.modern-header {
  background: white;
  backdrop-filter: blur(10px);
  padding: 0 2rem;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border-bottom: 1px solid var(--border);
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
  height: 36px;
  width: auto;
}

.logo-text {
  font-weight: 700;
  font-size: 1.25rem;
  background: linear-gradient(135deg, var(--primary), #7c3aed);
  -webkit-background-clip: text;
  background-clip: text;
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

/* Main Layout */
.main-content {
  display: flex;
  padding: 1.5rem;
  gap: 1.5rem;
  max-width: 1600px;
  margin: 0 auto;
}

.content {
  flex: 1;
  background: transparent;
  border-radius: 24px;
  transition: all 0.3s ease;
}

/* Welcome Banner */
.welcome-banner {
  background: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%);
  border-radius: 24px;
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  box-shadow: 0 10px 25px -5px rgba(67, 97, 238, 0.3);
}

.banner-content h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.banner-content p {
  opacity: 0.9;
  font-size: 0.9rem;
}

.date-badge {
  background: rgba(255,255,255,0.2);
  padding: 0.5rem 1rem;
  border-radius: 40px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  backdrop-filter: blur(4px);
}

/* Dashboard Cards Row */
.dashboard-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.dashboard-card {
  background: white;
  border-radius: 20px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.25s ease;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid var(--border);
  position: relative;
}

.dashboard-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 25px -12px rgba(0,0,0,0.1);
  border-color: transparent;
}

.card-icon {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.tasks-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.attendance-icon { background: linear-gradient(135deg, #10b981, #059669); }
.crm-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }
.visit-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.leave-icon { background: linear-gradient(135deg, #14b8a6, #0d9488); }
.chat-icon { background: linear-gradient(135deg, #ec4899, #db2777); }
.google-form-icon { background: linear-gradient(135deg, #ea4335, #c5221f); }

.card-info {
  flex: 1;
}

.label {
  font-size: 0.85rem;
  color: var(--gray);
  margin-bottom: 0.25rem;
}

.value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: 0.5rem;
}

.progress-text {
  font-size: 0.7rem;
  color: var(--gray);
}

.arrow-icon {
  color: var(--gray);
  font-size: 0.9rem;
}

/* Split Dashboard */
.dashboard-split {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card, .upcoming-card, .recent-leaves-card, .birthday-widget {
  background: white;
  border-radius: 20px;
  padding: 1.25rem;
  border: 1px solid var(--border);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.card-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--dark);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-header h3 i {
  color: var(--primary);
}

.card-header i {
  color: var(--primary);
}

.current-month-badge {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  padding: 0.25rem 0.75rem;
  border-radius: 40px;
  font-size: 0.7rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.view-all-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  transition: all 0.2s;
}

.view-all-btn:hover {
  background: var(--light);
}

/* Birthday Widget Styles */
.birthday-list {
  max-height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.birthday-list::-webkit-scrollbar {
  width: 4px;
}

.birthday-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.birthday-list::-webkit-scrollbar-thumb {
  /* background: #f59e0b; */
  border-radius: 4px;
}

.birthday-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #fff9f0, #fff5e6);
  padding: 0.75rem 1rem;
  border-radius: 16px;
  transition: all 0.3s ease;
  animation: slideIn 0.4s ease backwards;
  border: 1px solid #fef3c7;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.birthday-item:hover {
  transform: translateX(4px);
  border-color: #f59e0b;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
}

.birthday-avatar {
  position: relative;
}

.avatar-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f59e0b;
  padding: 6px;
  background: white;
}

.cake-icon {
  position: absolute;
  bottom: -4px;
  right: -6px;
  background: #f59e0b;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  color: white;
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.birthday-info {
  flex: 1;
}

.birthday-info strong {
  font-size: 0.9rem;
  color: #1e293b;
  display: block;
  margin-bottom: 4px;
}

.birthday-date {
  font-size: 0.7rem;
  color: #f59e0b;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}

.birthday-dept {
  font-size: 0.65rem;
  color: #94a3b8;
}

.wish-button {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 40px;
  font-size: 0.7rem;
  font-weight: 500;
  color: #d97706;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.wish-button:hover {
  /* background: linear-gradient(135deg, #f59e0b, #d97706); */
  color: white;
  transform: scale(1.05);
}

.no-birthday-state {
  text-align: center;
  padding: 2rem;
}

.no-birthday-icon {
  font-size: 3rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
  animation: pulse 2s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

.no-birthday-state p {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.no-birthday-state span {
  font-size: 0.7rem;
  color: #94a3b8;
}

/* Upcoming Tasks & Leaves */
.upcoming-list {
  max-height: 350px;
  overflow-y: auto;
}

.upcoming-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 0.5rem;
  background: var(--light);
}

.upcoming-item:hover {
  background: #f1f5f9;
}

.task-priority {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gray);
}

.task-priority.high { background: #ef4444; }
.task-priority.medium { background: #f59e0b; }
.task-priority.low { background: #10b981; }

.task-details {
  flex: 1;
}

.task-details strong {
  display: block;
  font-size: 0.85rem;
  color: var(--dark);
}

.deadline {
  font-size: 0.7rem;
  color: var(--gray);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.task-status {
  font-size: 0.65rem;
  padding: 0.2rem 0.5rem;
  border-radius: 20px;
  display: inline-block;
  margin-top: 0.25rem;
}

.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-progress {
  background: #dbeafe;
  color: #2563eb;
}

.status-completed {
  background: #d1fae5;
  color: #059669;
}

.task-arrow {
  color: var(--gray);
  font-size: 0.8rem;
}

/* Recent Leaves Card */
.leaves-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.leave-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--light);
  border-radius: 12px;
  transition: all 0.2s;
}

.leave-item:hover {
  background: #f1f5f9;
}

.leave-icon-small {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: white;
}

.leave-sick { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.leave-casual { background: linear-gradient(135deg, #10b981, #059669); }
.leave-annual { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.leave-default { background: linear-gradient(135deg, #14b8a6, #0d9488); }

.leave-details {
  flex: 1;
}

.leave-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--dark);
}

.leave-dates {
  font-size: 0.7rem;
  color: var(--gray);
}

.leave-status {
  font-size: 0.7rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 500;
}

.status-approved {
  background: #d1fae5;
  color: #059669;
}

.status-rejected {
  background: #fee2e2;
  color: #dc2626;
}

.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.no-leaves, .no-tasks {
  text-align: center;
  padding: 2rem;
  color: var(--gray);
}

.no-leaves i, .no-tasks i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

/* Modal Styles */
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
  z-index: 1000;
}

.modern-modal {
  background: white;
  border-radius: 28px;
  width: 90%;
  max-width: 500px;
  padding: 0;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.google-form-modal {
  background: white;
  border-radius: 28px;
  width: 90%;
  max-width: 900px;
  height: 85vh;
  max-height: 700px;
  padding: 0;
  overflow: hidden;
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
}

.google-form-header {
  background: var(--primary);
}

.google-form-body {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

.form-info-banner {
  background: #e8f0fe;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: #1967d2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border);
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
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remind-later-btn {
  border: 1px solid var(--border);
  background: white;
}

.remind-later-btn:hover {
  background: var(--light);
}

.open-new-tab-btn {
  border: none;
  background: var(--primary);
  color: white;
}

.open-new-tab-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: white;
}

.close-btn {
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.8;
  color: white;
}

.modern-modal form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--dark);
}

.form-row {
  display: flex;
  gap: 1rem;
}

.half {
  flex: 1;
}

input, select, textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.2s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.submit-btn {
  background: var(--primary);
  color: white;
  border: none;
  width: 100%;
  padding: 0.85rem;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
}

.submit-btn:hover {
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 1024px) {
  .dashboard-split {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .modern-header {
    padding: 0 1rem;
  }
  
  .mobile-menu-icon {
    display: block;
  }
  
  .logo-text {
    display: none;
  }
  
  .user-greeting span {
    display: none;
  }
  
  .user-greeting i {
    font-size: 1.25rem;
  }
  
  .logout-btn-modern span {
    display: none;
  }
  
  .logout-btn-modern i {
    font-size: 1.2rem;
  }
  
  .google-form-btn span {
    display: none;
  }
  
  .google-form-btn i {
    font-size: 1.2rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .welcome-banner {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
    padding: 1.25rem;
  }
  
  .banner-content h1 {
    font-size: 1.2rem;
  }
  
  .dashboard-row {
    grid-template-columns: 1fr;
  }
  
  .dashboard-card {
    padding: 1rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .google-form-modal {
    width: 95%;
    height: 90vh;
  }
  
  .google-form-header h2 {
    font-size: 1rem;
  }
  
  .notification-dropdown {
    width: 280px;
    right: -50px;
  }
  
  .birthday-item {
    padding: 0.6rem;
  }
  
  .avatar-img {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .content {
    padding: 0;
  }
  
  .dashboard-split {
    gap: 1rem;
  }
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .mobile-only {
    display: flex;
  }
}

.desktop-only {
  display: flex;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
}

.disabled {
  opacity: 0.6;
  cursor: not-allowed !important;
}

.card-glowing {
  position: relative;
  animation: cardGlow 1s ease-in-out infinite;
  border: 2px solid #ea4335 !important;
}

@keyframes cardGlow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(234, 67, 53, 0.5);
    border-color: #ea4335;
  }
  50% {
    box-shadow: 0 0 0 15px rgba(234, 67, 53, 0.2);
    border-color: #ff6b5e;
  }
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  border-radius: 20px;
  pointer-events: none;
  animation: ringPulse 1s ease-out infinite;
}

@keyframes ringPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(234, 67, 53, 0.7);
    opacity: 1;
  }
  100% {
    box-shadow: 0 0 0 30px rgba(234, 67, 53, 0);
    opacity: 0;
  }
}
</style>