<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-users"></i>
            </div>
            <div>
              <h1>Recruitment</h1>
              <p class="subtitle-modern">Manage candidate applications</p>
            </div>
          </div>
          <div class="stats-badge-header">
            <i class="fas fa-user-plus"></i>
            <span>{{ candidates.length }} Candidates</span>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar">
          <div class="stat-card pending">
            <i class="fas fa-clock"></i>
            <div class="stat-info">
              <span class="stat-value">{{ pendingCount }}</span>
              <span class="stat-label">Pending</span>
            </div>
          </div>
          <div class="stat-card followup">
            <i class="fas fa-phone-alt"></i>
            <div class="stat-info">
              <span class="stat-value">{{ followUpCount }}</span>
              <span class="stat-label">Follow Up</span>
            </div>
          </div>
          <div class="stat-card successful">
            <i class="fas fa-check-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ successfulCount }}</span>
              <span class="stat-label">Successful</span>
            </div>
          </div>
          <div class="stat-card rejected">
            <i class="fas fa-times-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ rejectedCount }}</span>
              <span class="stat-label">Rejected</span>
            </div>
          </div>
        </div>

        <!-- Loading Spinner -->
        <div v-if="loadingLeaves" class="loading-container">
          <div class="spinner"></div>
          <p>Loading candidates...</p>
        </div>

        <!-- Candidate Cards Grid -->
        <div v-else class="candidates-grid">
          <div v-for="candidate in candidates" :key="candidate.id" class="candidate-card-premium">
            <div class="card-accent" :class="getStatusClass(candidate.status)"></div>
            
            <div class="card-header-premium">
              <div class="candidate-info">
                <div class="candidate-avatar">
                  {{ getInitials(candidate.name) }}
                </div>
                <div>
                  <h3>{{ candidate.name }}</h3>
                  <span class="job-title">{{ candidate.job_title }}</span>
                </div>
              </div>
              <select
                class="status-select-premium"
                :class="getStatusClass(candidate.status)"
                v-model="candidate.status"
                @change="updateStatus(candidate)"
              >
                <option value="Pending">⏳ Pending</option>
                <option value="Follow Up">📞 Follow Up</option>
                <option value="Successful">✅ Successful</option>
                <option value="Rejected">❌ Rejected</option>
              </select>
            </div>

            <div class="card-body-premium">
              <div class="info-row">
                <i class="fas fa-envelope"></i>
                <div>
                  <span class="info-label">Email</span>
                  <p>{{ candidate.email }}</p>
                </div>
              </div>
              <div class="info-row">
                <i class="fas fa-phone-alt"></i>
                <div>
                  <span class="info-label">Phone</span>
                  <p>{{ candidate.phone }}</p>
                </div>
              </div>
              <div class="info-row">
                <i class="fas fa-calendar-alt"></i>
                <div>
                  <span class="info-label">Applied On</span>
                  <p>{{ formatDate(candidate.created_at) }}</p>
                </div>
              </div>
              <div class="info-row message-row">
                <i class="fas fa-comment"></i>
                <div>
                  <span class="info-label">Message</span>
                  <p :class="{ collapsed: !candidate.expanded }" class="message-text">
                    {{ candidate.message || 'No message provided' }}
                  </p>
                  <button
                    v-if="candidate.message && candidate.message.length > 150"
                    class="show-more-btn-premium"
                    @click="candidate.expanded = !candidate.expanded"
                  >
                    <i :class="candidate.expanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                    {{ candidate.expanded ? 'Show less' : 'Show more' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="card-footer-premium">
              <button
                v-if="candidate.resume"
                class="view-cv-btn-premium"
                @click="viewCV(candidate.resume)"
              >
                <i class="fas fa-file-pdf"></i> View CV
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="candidates.length === 0" class="empty-state-premium">
            <i class="fas fa-users-slash"></i>
            <h4>No Candidates Found</h4>
            <p>No recruitment applications have been submitted yet</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

export default {
  components: { Sidebar },

  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      loadingLeaves: false,
      candidates: [],
    }
  },

  computed: {
    pendingCount() {
      return this.candidates.filter(c => c.status === 'Pending').length
    },
    followUpCount() {
      return this.candidates.filter(c => c.status === 'Follow Up').length
    },
    successfulCount() {
      return this.candidates.filter(c => c.status === 'Successful').length
    },
    rejectedCount() {
      return this.candidates.filter(c => c.status === 'Rejected').length
    }
  },

  methods: {
    getInitials(name) {
      if (!name) return '?'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    },
    getStatusClass(status) {
      const s = (status || '').toLowerCase()
      if (s === 'pending') return 'pending'
      if (s === 'follow up') return 'followup'
      if (s === 'successful') return 'successful'
      if (s === 'rejected') return 'rejected'
      return 'pending'
    },
    formatDate(dateStr) {
      if (!dateStr) return '—'
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },
    viewCV(path) {
      const RESUME_BASE_URL = 'https://it.archenterprises.co.in'
      window.open(`${RESUME_BASE_URL}/${path}`, '_blank')
    },
    async updateStatus(candidate) {
      try {
        const token = localStorage.getItem('token')
        await axios.patch(
          `/api/recruitment/${candidate.id}/status`,
          { status: candidate.status },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        toastSuccess(`Status updated to ${candidate.status}`)
      } catch (error) {
        console.error(error)
        toastError('Failed to update status')
      }
    },
    async fetchCandidates() {
      this.loadingLeaves = true
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('/api/recruitment', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.candidates = res.data.data.map(candidate => ({
          ...candidate,
          expanded: false
        }))
      } catch (error) {
        console.error(error)
        toastError('Failed to load candidates')
      } finally {
        this.loadingLeaves = false
      }
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    }
  },

  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    }
    this.fetchCandidates()
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
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

.content {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
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
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-card.pending {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}
.stat-card.pending i { color: #d97706; }

.stat-card.followup {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
}
.stat-card.followup i { color: #4338ca; }

.stat-card.successful {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}
.stat-card.successful i { color: #065f46; }

.stat-card.rejected {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
}
.stat-card.rejected i { color: #991b1b; }

.stat-card i {
  font-size: 28px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

/* Loading Container */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #6b7280;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #e5e7eb;
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Candidates Grid */
.candidates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

/* Candidate Card */
.candidate-card-premium {
  position: relative;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.candidate-card-premium:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 30px -12px rgba(0, 0, 0, 0.15);
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.card-accent.pending { background: #f59e0b; }
.card-accent.followup { background: #3b82f6; }
.card-accent.successful { background: #10b981; }
.card-accent.rejected { background: #ef4444; }

.card-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  background: #fafbfc;
  border-bottom: 1px solid #e5e7eb;
}

.candidate-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.candidate-avatar {
  width: 48px;
  height: 48px;
  background: var(--primary);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 18px;
}

.candidate-info h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px 0;
}

.job-title {
  font-size: 12px;
  color: #6b7280;
}

/* Status Select */
.status-select-premium {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-select-premium.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-select-premium.followup {
  background: #e0e7ff;
  color: #4338ca;
}

.status-select-premium.successful {
  background: #d1fae5;
  color: #065f46;
}

.status-select-premium.rejected {
  background: #fee2e2;
  color: #991b1b;
}

/* Card Body */
.card-body-premium {
  padding: 20px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.info-row i {
  width: 18px;
  color: var(--primary-color);
  margin-top: 2px;
  font-size: 14px;
}

.info-row > div {
  flex: 1;
}

.info-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: #9ca3af;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 2px;
}

.info-row p {
  font-size: 13px;
  color: #374151;
  margin: 0;
  word-break: break-word;
}

.message-row p {
  line-height: 1.5;
}

.message-text.collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.show-more-btn-premium {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
}

.show-more-btn-premium:hover {
  text-decoration: underline;
}

/* Card Footer */
.card-footer-premium {
  padding: 16px 20px 20px;
  border-top: 1px solid #e5e7eb;
}

.view-cv-btn-premium {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: var(--primary-color);
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.view-cv-btn-premium:hover {
  /* background: var(--primary); */
  color: rgb(19, 10, 10);
  transform: translateY(-1px);
}

/* Empty State */
.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  grid-column: 1 / -1;
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
  .candidates-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 16px;
  }

  .content {
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
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .candidates-grid {
    grid-template-columns: 1fr;
  }

  .card-header-premium {
    flex-direction: column;
    gap: 12px;
  }

  .status-select-premium {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .stats-bar {
    grid-template-columns: 1fr;
  }
}
</style>