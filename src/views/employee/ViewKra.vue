<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="kra-board-premium" v-if="!isMobile || !isSidebarVisible">
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
         
          <div class="mobile-title">
            <i class="fas fa-tasks"></i>
            <span>My KRA</span>
          </div>
          <div class="mobile-stats-badge">
            <span>{{ kras.length }}</span>
          </div>
        </div>

        <!-- Desktop Header -->
        <div class="content-header-modern" v-else>
          <div class="header-left desktop-only">
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

        <!-- Stats Bar - Mobile Optimized -->
        <div class="stats-bar">
          <div class="stat-card" @click="scrollToSection('tasks')">
            <i class="fas fa-list-check"></i>
            <div class="stat-info">
              <span class="stat-value">{{ totalTasks }}</span>
              <span class="stat-label">Total Tasks</span>
            </div>
          </div>
          <div class="stat-card" @click="scrollToSection('kpis')">
            <i class="fas fa-chart-simple"></i>
            <div class="stat-info">
              <span class="stat-value">{{ totalKPIs }}</span>
              <span class="stat-label">Total KPIs</span>
            </div>
          </div>
        </div>

        <!-- Search/Filter - Mobile -->
        <div class="search-bar-mobile" v-if="isMobile && kras.length > 0">
          <div class="search-group-mobile">
            <i class="fas fa-search"></i>
            <input type="text" v-model="searchQuery" placeholder="Search KRAs..." class="search-input-mobile" />
          </div>
        </div>

        <!-- KRAs List -->
        <div class="kras-section">
          <div class="section-title-modern">
            <div class="title-left">
              <i class="fas fa-list-ul"></i>
              <span>Key Responsibility Areas</span>
              <span class="kra-count-mobile" v-if="isMobile">{{ filteredKras.length }}</span>
            </div>
            <div class="title-actions" v-if="isMobile && filteredKras.length > 0">
              <button class="expand-all-btn" @click="toggleAllExpand">
                <i :class="allExpanded ? 'fas fa-compress' : 'fas fa-expand'"></i>
              </button>
            </div>
          </div>

          <!-- KRAs Grid -->
          <div v-if="filteredKras.length" class="kras-grid-premium">
            <div v-for="(kra, index) in filteredKras" :key="index" class="kra-card-premium">
              <div class="card-accent"></div>
              <div class="kra-header" @click="toggleExpand(kra)">
                <div class="kra-icon">
                  <i class="fas fa-bullseye"></i>
                </div>
                <div class="kra-title-wrap">
                  <h3>{{ kra.name }}</h3>
                  <div class="kra-stats-mobile" v-if="isMobile">
                    <span class="stat-chip"><i class="fas fa-tasks"></i> {{ kra.tasks?.length || 0 }}</span>
                    <span class="stat-chip"><i class="fas fa-chart-line"></i> {{ kra.kpis?.length || 0 }}</span>
                  </div>
                </div>
                <div class="expand-icon" v-if="isMobile">
                  <i :class="kra.expanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                </div>
              </div>

              <div class="kra-content" :class="{ 'collapsed': !kra.expanded && isMobile }">
                <!-- Tasks Section -->
                <div v-if="kra.tasks && kra.tasks.length" class="info-section" id="tasks">
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
                <div v-if="kra.kpis && kra.kpis.length" class="info-section" id="kpis">
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
            <h4>{{ searchQuery ? 'No Matching KRAs Found' : 'No KRAs Assigned' }}</h4>
            <p>{{ searchQuery ? 'No Key Responsibility Areas match your search' : 'No Key Responsibility Areas have been assigned to you yet' }}</p>
            <button v-if="searchQuery" class="btn-clear-search" @click="clearSearch">
              <i class="fas fa-times"></i> Clear Search
            </button>
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
      kras: [],
      searchQuery: '',
      allExpanded: false
    }
  },
  computed: {
    totalTasks() {
      return this.kras.reduce((total, kra) => total + (kra.tasks?.length || 0), 0);
    },
    totalKPIs() {
      return this.kras.reduce((total, kra) => total + (kra.kpis?.length || 0), 0);
    },
    filteredKras() {
      if (!this.searchQuery) return this.kras;
      const query = this.searchQuery.toLowerCase();
      return this.kras.filter(kra => {
        const matchesName = kra.name.toLowerCase().includes(query);
        const matchesTask = kra.tasks?.some(task => task.toLowerCase().includes(query));
        const matchesKPI = kra.kpis?.some(kpi => kpi.toLowerCase().includes(query));
        const matchesTarget = kra.target?.toLowerCase().includes(query);
        return matchesName || matchesTask || matchesKPI || matchesTarget;
      });
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
    toggleExpand(kra) {
      if (this.isMobile) {
        kra.expanded = !kra.expanded;
      }
    },
    toggleAllExpand() {
      this.allExpanded = !this.allExpanded;
      this.kras.forEach(kra => {
        kra.expanded = this.allExpanded;
      });
    },
    scrollToSection(sectionId) {
      if (this.isMobile) {
        // Find first KRA with the section
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    },
    clearSearch() {
      this.searchQuery = '';
    },
    async loadKRAs() {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.name) return;

      this.username = user.name;

      try {
        const res = await axios.get(`https://employees.archenterprises.co.in/api/api/user-kras/username/${user.name}`);
        this.kras = res.data.map(kra => ({
          ...kra,
          expanded: false // Add expanded state for mobile
        }));
      } catch (error) {
        console.error('Failed to load KRAs:', error);
        toastError('No KRAs found for your account');
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
  --primary: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%);
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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

.kra-board-premium {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
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
  color: var(--dark);
  padding: 8px;
  cursor: pointer;
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--dark);
}

.mobile-title i {
  color: var(--primary-color);
}

.mobile-stats-badge {
  background: var(--primary);
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
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-card:active {
  transform: scale(0.97);
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

/* Search Bar - Mobile */
.search-bar-mobile {
  display: none;
  margin-bottom: 20px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 16px;
}

.search-group-mobile {
  position: relative;
  flex: 1;
}

.search-group-mobile i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input-mobile {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  transition: all 0.3s ease;
}

.search-input-mobile:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* Section Title */
.section-title-modern {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title-modern i {
  color: var(--primary-color);
  font-size: 18px;
}

.kra-count-mobile {
  background: var(--primary);
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 4px;
}

.title-actions {
  display: flex;
  gap: 8px;
}

.expand-all-btn {
  background: none;
  border: 1px solid #e5e7eb;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
}

.expand-all-btn:hover {
  background: #f3f4f6;
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
  cursor: pointer;
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
  flex-shrink: 0;
}

.kra-title-wrap {
  flex: 1;
}

.kra-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.kra-stats-mobile {
  display: none;
  gap: 8px;
  margin-top: 4px;
}

.stat-chip {
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.expand-icon {
  display: none;
  font-size: 14px;
  color: #9ca3af;
  padding: 4px;
}

.kra-content {
  padding: 20px;
  transition: all 0.3s ease;
}

.kra-content.collapsed {
  display: none;
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
  flex-shrink: 0;
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
  max-width: 400px;
  margin: 0 auto;
}

.btn-clear-search {
  margin-top: 16px;
  padding: 8px 20px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-clear-search:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
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
    padding: 12px;
  }

  .kra-board-premium {
    padding: 16px;
    border-radius: 20px;
  }

  .mobile-header {
    display: flex;
  }

  .content-header-modern {
    display: none;
  }

  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .stat-card {
    padding: 14px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .stat-card i {
    font-size: 24px;
  }

  .stat-value {
    font-size: 22px;
  }

  .stat-label {
    font-size: 11px;
  }

  .search-bar-mobile {
    display: block;
  }

  .kras-grid-premium {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .kra-header {
    padding: 14px 16px;
    cursor: pointer;
    flex-wrap: wrap;
  }

  .kra-title-wrap {
    flex: 1;
    min-width: 0;
  }

  .kra-header h3 {
    font-size: 16px;
  }

  .kra-stats-mobile {
    display: flex;
  }

  .expand-icon {
    display: block;
  }

  .kra-content {
    padding: 16px;
  }

  .kra-content.collapsed {
    display: none;
  }

  .section-title-modern {
    font-size: 14px;
  }

  .kpi-list {
    justify-content: flex-start;
  }

  .empty-state-premium {
    padding: 40px 16px;
  }

  .empty-state-premium i {
    font-size: 48px;
  }

  .empty-state-premium h4 {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }

  .kra-board-premium {
    padding: 12px;
    border-radius: 16px;
  }

  .stats-bar {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-card i {
    font-size: 20px;
  }

  .stat-value {
    font-size: 18px;
  }

  .mobile-title {
    font-size: 16px;
  }

  .mobile-stats-badge {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .kra-header {
    padding: 12px 14px;
    gap: 10px;
  }

  .kra-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .kra-header h3 {
    font-size: 14px;
  }

  .kra-content {
    padding: 12px;
  }

  .section-header {
    font-size: 13px;
  }

  .task-list li {
    font-size: 12px;
    padding: 6px 0;
  }

  .kpi-item {
    font-size: 11px;
    padding: 4px 10px;
  }

  .target-box {
    font-size: 12px;
    padding: 10px;
  }

  .search-input-mobile {
    font-size: 15px;
    padding: 8px 10px 8px 34px;
  }

  .empty-state-premium i {
    font-size: 40px;
  }

  .empty-state-premium h4 {
    font-size: 15px;
  }

  .empty-state-premium p {
    font-size: 12px;
  }
}

@media (max-width: 380px) {
  .stats-bar {
    grid-template-columns: 1fr;
  }

  .stat-card {
    flex-direction: row;
    text-align: left;
  }
}

/* Utility Classes */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
}

@media (min-width: 769px) {
  .mobile-only {
    display: none !important;
  }
}
</style>