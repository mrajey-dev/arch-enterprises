<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <div v-show="!isMobile || isSidebarVisible">
        <Sidebar />
      </div>

      <div class="announcement-board-premium" v-if="!isMobile || !isSidebarVisible">
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-bullhorn"></i>
            </div>
            <div>
              <h1>Announcement Board</h1>
              <p class="subtitle-modern">Stay updated with latest company news</p>
            </div>
          </div>
          <div class="stats-badge-header">
            <i class="fas fa-newspaper"></i>
            <span>{{ announcements.length }} Announcements</span>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar">
          <div class="stat-card">
            <i class="fas fa-calendar-alt"></i>
            <div class="stat-info">
              <span class="stat-value">{{ announcements.length }}</span>
              <span class="stat-label">Total Posts</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-clock"></i>
            <div class="stat-info">
              <span class="stat-value">{{ getLatestMonth }}</span>
              <span class="stat-label">Latest Update</span>
            </div>
          </div>
        </div>

        <!-- Announcements List -->
        <div class="announcements-section">
          <div class="section-title-modern">
            <i class="fas fa-list-alt"></i>
            <span>Recent Announcements</span>
          </div>

          <div class="announcements-grid-premium">
            <div
              class="announcement-card-premium"
              v-for="(announcement, index) in announcements"
              :key="index"
            >
              <div class="card-accent"></div>
              <div class="card-header-premium">
                <div class="announcement-icon">
                  <i class="fas fa-bullhorn"></i>
                </div>
                <div class="header-info">
                  <h3>{{ announcement.title }}</h3>
                  <div class="meta-info">
                    <i class="fas fa-calendar-alt"></i>
                    <span>{{ announcement.date }}</span>
                  </div>
                </div>
              </div>
              <div class="card-body-premium">
                <p>{{ announcement.message }}</p>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="announcements.length === 0" class="empty-state-premium">
              <i class="fas fa-bullhorn"></i>
              <h4>No Announcements Yet</h4>
              <p>Check back later for updates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from './components/Sidebar.vue'
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

export default {
  name: "AnnouncementBoard",
  components: {
    Sidebar
  },
  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      announcements: [],
    }
  },
  computed: {
    getLatestMonth() {
      if (this.announcements.length === 0) return 'No updates';
      const latestDate = new Date(this.announcements[0].date);
      return latestDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.fetchAnnouncements();
    setInterval(this.fetchAnnouncements, 300000);
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
      if (!this.isMobile) {
        this.isSidebarVisible = true;
      }
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    async fetchAnnouncements() {
      try {
        const res = await axios.get('https://employees.archenterprises.co.in/api/api/announcements');
        const records = res.data.data;
        this.announcements = records.map(item => ({
          title: item.title,
          message: item.message,
          date: new Date(item.created_at).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }));
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
        toastError('Failed to load announcements');
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
  /* background: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%); */
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

.announcement-board-premium {
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

/* Announcements Grid */
.announcements-grid-premium {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Announcement Card */
.announcement-card-premium {
  position: relative;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.announcement-card-premium:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px -12px rgba(0, 0, 0, 0.15);
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary);
}

.card-header-premium {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px 12px 24px;
  background: #fafbfc;
}

.announcement-icon {
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

.header-info {
  flex: 1;
}

.header-info h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px 0;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #9ca3af;
}

.meta-info i {
  font-size: 11px;
}

.card-body-premium {
  padding: 16px 24px 24px 24px;
}

.card-body-premium p {
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
  white-space: pre-line;
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

/* Modal Fade */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-bar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 16px;
  }

  .announcement-board-premium {
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

  .card-header-premium {
    flex-direction: column;
  }

  .announcement-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .header-info h3 {
    font-size: 16px;
  }

  .card-body-premium {
    padding: 12px 20px 20px;
  }
}

@media (max-width: 480px) {
  .stats-bar {
    grid-template-columns: 1fr;
  }
}
</style>