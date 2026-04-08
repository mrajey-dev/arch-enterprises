<template>
  <div class="layout">
    <!-- Modern Header -->
    <header class="modern-header">
      <div class="header-left">
        <div class="mobile-menu-icon" @click="toggleSidebar">
          <i class="fas fa-bars"></i>
        </div>
        <div class="logo-section">
          <img src="https://img.icons8.com/fluency/48/company.png" alt="Logo" class="logo-img" />
          <span class="logo-text">Arc Enterprises</span>
        </div>
      </div>

      <div class="header-right">
        <div class="user-greeting" v-if="currentUser.name">
          <i class="fas fa-user-circle"></i>
          <span>Hi, {{ formatFirstName(currentUser.name) }}</span>
        </div>
        <div class="download-app">
          <button @click="toggleDownloadMenu" class="download-btn">
            <i class="fas fa-download"></i> App
          </button>
          <div v-if="showDownloadMenu" class="download-menu">
            <a href="#" @click.prevent="downloadApk">Android APK</a>
            <a href="#" @click.prevent="downloadIos">iOS App</a>
          </div>
        </div>
        <button @click="logout" class="logout-btn-modern">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </header>

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
              <h3 class="value">{{ tasks.length }}</h3>
              <div class="progress-bar">
                <div class="progress-fill" style="width: 68%"></div>
              </div>
              <span class="progress-text">68% completed</span>
            </div>
          </div>

          <div class="dashboard-card clickable-card" @click="goTo('employee/empattendance')">
            <div class="card-icon attendance-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="card-info">
              <p class="label">Attendance</p>
              <h3 class="value">92%</h3>
              <div class="progress-bar green">
                <div class="progress-fill" style="width: 92%"></div>
              </div>
              <span class="progress-text">This month</span>
            </div>
          </div>

          <div class="dashboard-card clickable-card desktop-only" @click="goTo('employee/Customerregistrations')">
            <div class="card-icon crm-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="card-info">
              <p class="label">CRM</p>
              <h3 class="value">24</h3>
              <div class="progress-bar">
                <div class="progress-fill" style="width: 45%"></div>
              </div>
              <span class="progress-text">New leads</span>
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

          <div class="dashboard-card clickable-card" @click="openReportModal">
            <div class="card-icon report-icon">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="card-info">
              <p class="label">Daily Report</p>
              <h3 class="value">Submit</h3>
              <i class="fas fa-chevron-right arrow-icon"></i>
            </div>
          </div>
        </div>

        <!-- Split Section: Chart & Upcoming -->
        <div class="dashboard-split">
          <div class="chart-card">
            <div class="card-header">
              <h3>Work Analytics</h3>
              <i class="fas fa-chart-line"></i>
            </div>
            <DataChart />
          </div>

          <div class="upcoming-card">
            <div class="card-header">
              <h3>Upcoming Tasks</h3>
              <i class="fas fa-bell"></i>
            </div>
            <div class="upcoming-list">
              <div v-for="task in upcomingTasks" :key="task.id" class="upcoming-item" @click="dismissUpcomingTask(index)">
                <div class="task-priority" :class="task.priority?.toLowerCase() || 'medium'"></div>
                <div class="task-details">
                  <strong>{{ task.title }}</strong>
                  <span class="deadline"><i class="far fa-clock"></i> {{ formatDate(task.deadline_date) }}</span>
                </div>
              </div>
              <div v-if="upcomingTasks.length === 0" class="no-tasks">
                <i class="far fa-smile-wink"></i>
                <p>No upcoming deadlines! 🎉</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Birthday Section -->
        <div class="birthday-section" v-if="sortedBirthdaysThisMonth.length">
          <div class="section-header">
            <h3><i class="fas fa-birthday-cake"></i> Birthday's This Month</h3>
            <span class="badge">{{ sortedBirthdaysThisMonth.length }} celebrating</span>
          </div>
          <div class="birthday-scroll">
            <div v-for="person in sortedBirthdaysThisMonth" :key="person.id" class="birthday-chip">
              <img :src="person.avatar || 'https://img.icons8.com/color/48/user-male-circle.png'" alt="avatar" />
              <div class="chip-info">
                <strong>{{ person.username }}</strong>
                <span>{{ formatBirthday(person.dateofbirth) }}</span>
              </div>
            </div>
          </div>
        </div>

        <EmployeeProfiles />
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
            <div class="form-group half">
              <label><i class="fas fa-building"></i> Department</label>
              <select v-model="report.department" required>
                <option value="" disabled>Select Department</option>
                <option v-for="dept in departments" :key="dept.id" :value="dept.name">{{ dept.name }}</option>
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
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from './components/Sidebar.vue';
import DataChart from './components/DataChart.vue';
import EmployeeProfiles from './components/EmployeeProfiles.vue';
import { toastSuccess, toastError } from "@/utils/toast.js";

export default {
  name: 'Dashboard',
  components: { Sidebar, DataChart, EmployeeProfiles },
  data() {
    return {
      showDownloadMenu: false,
      isMobile: false,
      upcomingTasks: [],
      currentUser: {},
      tasks: [],
      userEmail: '',
      birthdaysThisMonth: [],
      isSidebarVisible: true,
      report: {
        date: '',
        name: '',
        status: '',
        department: '',
        summary: '',
      },
      departments: [
        { id: 1, name: 'IT' },
        { id: 2, name: 'HR' },
        { id: 3, name: 'ACCOUNT' }
      ],
      showModal: false,
      users: [],
    }
  },

  computed: {
    sortedBirthdaysThisMonth() {
      const today = new Date();
      const todayDay = today.getDate();
      return [...this.birthdaysThisMonth].sort((a, b) => {
        const dayA = new Date(a.dateofbirth).getDate();
        const dayB = new Date(b.dateofbirth).getDate();
        const isPastA = dayA < todayDay;
        const isPastB = dayB < todayDay;
        if (isPastA && !isPastB) return 1;
        if (!isPastA && isPastB) return -1;
        return dayA - dayB;
      });
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

    async fetchTasks() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/tasks', {
          headers: this.getAuthHeaders()
        });
        this.tasks = response.data.filter(t => t.user_id === this.currentUser.id);
        this.getUpcomingTasks();
      } catch (err) {
        console.error('fetchTasks error:', err);
      }
    },

    async fetchUsers() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/users', {
          headers: this.getAuthHeaders()
        });
        this.users = response.data;
      } catch (err) {
        console.error('fetchUsers error:', err);
      }
    },

    async fetchBirthdays() {
      if (!this.users.length) await this.fetchUsers();
      const currentMonth = new Date().getMonth();
      this.birthdaysThisMonth = this.users.filter(user => {
        if (!user.dateofbirth) return false;
        const birthMonth = new Date(user.dateofbirth).getMonth();
        return birthMonth === currentMonth;
      });
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

    localDateString(value) {
      if (!value) return '';
      const d = new Date(value);
      if (isNaN(d)) return '';
      return d.toISOString().split('T')[0];
    },

    getUpcomingTasks() {
      const today = this.localDateString(new Date());
      const tomorrow = this.localDateString(new Date(Date.now() + 86400000));
      this.upcomingTasks = (this.tasks || [])
        .filter(task => {
          const deadline = task.deadline || task.deadline_date;
          if (!deadline) return false;
          const taskDateStr = this.localDateString(deadline);
          return [today, tomorrow].includes(taskDateStr);
        })
        .filter(task => ['Pending', 'In Progress'].includes(task.status))
        .sort((a, b) => new Date(a.deadline || a.deadline_date) - new Date(b.deadline || b.deadline_date));
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    formatBirthday(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    dismissUpcomingTask(index) {
      this.upcomingTasks.splice(index, 1);
    },

    goTo(route) {
      this.$router.push(`/${route}`);
    },

    openReportModal() {
      this.report.date = new Date().toISOString().split('T')[0];
      this.showModal = true;
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
        toastError('Failed to submit report');
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
    await this.fetchTasks();
    await this.fetchUsers();
    await this.fetchBirthdays();
    await this.fetchDepartments();
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.checkIfMobile);
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
  gap: 1.5rem;
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
.report-icon { background: linear-gradient(135deg, #ef4444, #dc2626); }

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

.progress-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 4px;
}

.progress-bar.green .progress-fill {
  background: #10b981;
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

.chart-card, .upcoming-card {
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
}

.card-header i {
  color: var(--gray);
}

.upcoming-list {
  max-height: 280px;
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

.no-tasks {
  text-align: center;
  padding: 2rem;
  color: var(--gray);
}

.no-tasks i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

/* Birthday Section */
.birthday-section {
  background: white;
  border-radius: 20px;
  padding: 1.25rem;
  margin-bottom: 2rem;
  border: 1px solid var(--border);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}

.section-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--dark);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge {
  background: #fef3c7;
  color: #d97706;
  padding: 0.25rem 0.75rem;
  border-radius: 40px;
  font-size: 0.75rem;
  font-weight: 500;
}

.birthday-scroll {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.birthday-chip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--light);
  padding: 0.5rem 1rem;
  border-radius: 60px;
  min-width: 160px;
}

.birthday-chip img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.chip-info strong {
  font-size: 0.8rem;
  display: block;
}

.chip-info span {
  font-size: 0.7rem;
  color: var(--gray);
}

/* Modal */
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
  background: var(--primary);
  color: white;
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
}

.close-btn {
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.8;
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
  background: var(--primary-dark);
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
  
  .birthday-chip {
    min-width: 140px;
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
</style>