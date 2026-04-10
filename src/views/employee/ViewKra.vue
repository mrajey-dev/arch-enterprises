<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="kra-board-premium" v-if="!isMobile || !isSidebarVisible">
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-tasks"></i>
            </div>
            <div>
              <h1>My KRA</h1>
              <p class="subtitle-modern">Key Responsibility Areas & Performance Indicators</p>
            </div>
          </div>
          <div class="stats-badge-header">
            <i class="fas fa-chart-line"></i>
            <span>{{ kras.length }} KRAs Assigned</span>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar">
          <div class="stat-card">
            <i class="fas fa-list-check"></i>
            <div class="stat-info">
              <span class="stat-value">{{ totalTasks }}</span>
              <span class="stat-label">Total Tasks</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-chart-simple"></i>
            <div class="stat-info">
              <span class="stat-value">{{ totalKPIs }}</span>
              <span class="stat-label">Total KPIs</span>
            </div>
          </div>
        </div>

        <!-- KRAs List -->
        <div class="kras-section">
          <div class="section-title-modern">
            <i class="fas fa-list-ul"></i>
            <span>Key Responsibility Areas</span>
          </div>

          <div v-if="kras.length" class="kras-grid-premium">
            <div v-for="(kra, index) in kras" :key="index" class="kra-card-premium">
              <div class="card-accent"></div>
              <div class="kra-header">
                <div class="kra-icon">
                  <i class="fas fa-bullseye"></i>
                </div>
                <h3>{{ kra.name }}</h3>
              </div>

              <div class="kra-content">
                <!-- Tasks Section -->
                <div v-if="kra.tasks && kra.tasks.length" class="info-section">
                  <div class="section-header">
                    <i class="fas fa-tasks"></i>
                    <span>Tasks</span>
                    <span class="count-badge">{{ kra.tasks.length }}</span>
                  </div>
                  <ul class="task-list">
                    <li v-for="(task, tIndex) in kra.tasks" :key="tIndex">
                      <i class="fas fa-check-circle"></i>
                      <span>{{ task }}</span>
                    </li>
                  </ul>
                </div>

                <!-- KPIs Section -->
                <div v-if="kra.kpis && kra.kpis.length" class="info-section">
                  <div class="section-header">
                    <i class="fas fa-chart-line"></i>
                    <span>Key Performance Indicators</span>
                    <span class="count-badge">{{ kra.kpis.length }}</span>
                  </div>
                  <div class="kpi-list">
                    <div v-for="(kpi, kIndex) in kra.kpis" :key="kIndex" class="kpi-item">
                      <i class="fas fa-chart-simple"></i>
                      <span>{{ kpi }}</span>
                    </div>
                  </div>
                </div>

                <!-- Target Section -->
                <div v-if="kra.target" class="info-section">
                  <div class="section-header">
                    <i class="fas fa-bullseye"></i>
                    <span>Target</span>
                  </div>
                  <div class="target-box">
                    <i class="fas fa-flag-checkered"></i>
                    <span>{{ kra.target }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state-premium">
            <i class="fas fa-tasks"></i>
            <h4>No KRAs Assigned</h4>
            <p>No Key Responsibility Areas have been assigned to you yet</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import axios from 'axios'
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

export default {
  name: "ViewKRA",
  components: {
    Sidebar
  },
  data() {
    return {
      username: '',
      isMobile: false,
      isSidebarVisible: true,
      kras: []
    }
  },
  computed: {
    totalTasks() {
      return this.kras.reduce((total, kra) => total + (kra.tasks?.length || 0), 0);
    },
    totalKPIs() {
      return this.kras.reduce((total, kra) => total + (kra.kpis?.length || 0), 0);
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.loadKRAs();
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/auth');
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  },
  methods: {
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    async loadKRAs() {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.name) return;

      this.username = user.name;

      try {
        const res = await axios.get(`https://employees.archenterprises.co.in/api/api/user-kras/username/${user.name}`);
        this.kras = res.data;
      } catch (error) {
        console.error('Failed to load KRAs:', error);
        toastError('Failed to load KRAs');
      }
    },
    logout() {
      const token = localStorage.getItem('token');
      axios.post('https://employees.archenterprises.co.in/api/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).finally(() => {
        localStorage.removeItem('token');
        this.$router.push('/auth');
      });
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Variables */
:root {
  --primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --primary-color: #667eea;
  --dark: #1a1a2e;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
   ;
}

.kra-board-premium {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

/* Content Header */
.content-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  width: 52px;
  height: 52px;
  background: var(--primary);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.content-header-modern h1 {
  font-size: 28px;
  font-weight: 700;
  background: var(--primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
}

.subtitle-modern {
  color: #6b7280;
  font-size: 14px;
  margin-top: 4px;
}

.stats-badge-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 40px;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
}

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-card i {
  font-size: 32px;
  color: var(--primary-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

/* Section Title */
.section-title-modern {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
}

.section-title-modern i {
  color: var(--primary-color);
  font-size: 18px;
}

/* KRAs Grid */
.kras-grid-premium {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

/* KRA Card */
.kra-card-premium {
  position: relative;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.kra-card-premium:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 30px -12px rgba(0, 0, 0, 0.15);
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary);
}

.kra-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: #fafbfc;
  border-bottom: 1px solid #e5e7eb;
}

.kra-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 20px;
}

.kra-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.kra-content {
  padding: 20px;
}

/* Info Section */
.info-section {
  margin-bottom: 20px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 14px;
  color: #374151;
}

.section-header i {
  color: var(--primary-color);
  font-size: 14px;
}

.count-badge {
  margin-left: auto;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
}

/* Task List */
.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  color: #4b5563;
}

.task-list li:last-child {
  border-bottom: none;
}

.task-list li i {
  color: var(--success);
  font-size: 14px;
}

/* KPI List */
.kpi-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.kpi-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: #d97706;
}

.kpi-item i {
  font-size: 12px;
}

/* Target Box */
.target-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
  font-size: 13px;
  color: #4b5563;
  border-left: 3px solid var(--primary-color);
}

.target-box i {
  color: var(--primary-color);
}

/* Empty State */
.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  background: #fafbfc;
  border-radius: 20px;
}

.empty-state-premium i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state-premium h4 {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 8px;
}

.empty-state-premium p {
  font-size: 14px;
}

/* Responsive */
@media (max-width: 1024px) {
  .kras-grid-premium {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 16px;
  }

  .kra-board-premium {
    padding: 20px;
  }

  .content-header-modern {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-badge-header {
    align-self: flex-start;
  }

  .stats-bar {
    grid-template-columns: 1fr;
  }

  .kras-grid-premium {
    grid-template-columns: 1fr;
  }

  .kra-header {
    flex-direction: column;
    text-align: center;
  }

  .section-header {
    flex-wrap: wrap;
  }

  .kpi-list {
    justify-content: center;
  }
}
</style>