<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div>
              <h1>Daily Small Improvement (DSI)</h1>
              <p class="subtitle-modern">Track and manage improvement suggestions</p>
            </div>
          </div>
          <div class="stats-badge-header">
            <i class="fas fa-lightbulb"></i>
            <span>{{ dsiList.length }} Total Improvements</span>
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
          <div class="stat-card approved">
            <i class="fas fa-check-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ approvedCount }}</span>
              <span class="stat-label">Approved</span>
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

        <!-- DSI Table -->
        <div class="table-wrapper-premium">
          <div class="table-header">
            <div class="section-title-modern">
              <i class="fas fa-list-ul"></i>
              <span>Improvement Records</span>
            </div>
            <div class="table-info">
              <i class="fas fa-file-alt"></i>
              <span>{{ dsiList.length }} records</span>
            </div>
          </div>

          <div class="table-container">
            <table class="dsi-table-premium">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Problem</th>
                  <th>Solution</th>
                  <th>Result</th>
                  <th>Before</th>
                  <th>After</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in dsiList" :key="item.id">
                  <td class="serial-number">{{ i + 1 }}</td>
                  <td class="user-cell">
                    <div class="user-info">
                      <div class="user-avatar">
                        {{ getInitials(item.user) }}
                      </div>
                      <span>{{ item.user }}</span>
                    </div>
                  </td>
                  <td class="problem-cell">
                    <div class="text-with-readmore">
                      <span :class="{ 'truncated': !isExpanded(item.id, 'problem') && isTextLong(item.problem, 50) }">
                        {{ isExpanded(item.id, 'problem') ? (item.problem || '—') : truncateText(item.problem, 50) }}
                      </span>
                      <button 
                        v-if="isTextLong(item.problem, 50)" 
                        @click.stop="toggleReadMore(item.id, 'problem')"
                        class="readmore-btn"
                      >
                        {{ isExpanded(item.id, 'problem') ? 'Read Less' : 'Read More' }}
                      </button>
                    </div>
                  </td>
                  <td class="solution-cell">
                    <div class="text-with-readmore">
                      <span :class="{ 'truncated': !isExpanded(item.id, 'solution') && isTextLong(item.solution, 50) }">
                        {{ isExpanded(item.id, 'solution') ? (item.solution || '—') : truncateText(item.solution, 50) }}
                      </span>
                      <button 
                        v-if="isTextLong(item.solution, 50)" 
                        @click.stop="toggleReadMore(item.id, 'solution')"
                        class="readmore-btn"
                      >
                        {{ isExpanded(item.id, 'solution') ? 'Read Less' : 'Read More' }}
                      </button>
                    </div>
                  </td>
                  <td class="result-cell">
                    <div class="text-with-readmore">
                      <span :class="{ 'truncated': !isExpanded(item.id, 'result') && isTextLong(item.result, 50) }">
                        {{ isExpanded(item.id, 'result') ? (item.result || '—') : truncateText(item.result, 50) }}
                      </span>
                      <button 
                        v-if="isTextLong(item.result, 50)" 
                        @click.stop="toggleReadMore(item.id, 'result')"
                        class="readmore-btn"
                      >
                        {{ isExpanded(item.id, 'result') ? 'Read Less' : 'Read More' }}
                      </button>
                    </div>
                  </td>
                  <td class="image-cell">
                    <img
                      v-if="item.beforeImage"
                      :src="item.beforeImage"
                      class="dsi-thumb-premium"
                      @click="openImage(item.beforeImage)"
                    />
                    <span v-else class="no-image">—</span>
                  </td>
                  <td class="image-cell">
                    <img
                      v-if="item.afterImage"
                      :src="item.afterImage"
                      class="dsi-thumb-premium"
                      @click="openImage(item.afterImage)"
                    />
                    <span v-else class="no-image">—</span>
                   </td>
                  <td class="date-cell">
                    <i class="fas fa-calendar-alt"></i> {{ formatDate(item.date) }}
                   </td>
                  <td class="action-cell">
                    <div class="action-group">
                      <button
                        class="action-btn approve"
                        @click="updateStatus(item.id, 'Approved')"
                        :disabled="item.status === 'approved' || item.status === 'rejected'"
                        title="Approve"
                      >
                        <i class="fas fa-check-circle"></i>
                      </button>
                      <button
                        class="action-btn reject"
                        @click="updateStatus(item.id, 'Rejected')"
                        :disabled="item.status === 'rejected' || item.status === 'approved'"
                        title="Reject"
                      >
                        <i class="fas fa-times-circle"></i>
                      </button>
                    </div>
                    <span v-if="item.status" :class="['status-badge-premium', getStatusClass(item.status)]">
                      <i :class="getStatusIcon(item.status)"></i>
                      {{ item.status }}
                    </span>
                   </td>
                 </tr>

                <!-- Empty State -->
                <tr v-if="dsiList.length === 0" class="empty-row">
                  <td colspan="9">
                    <div class="empty-state-premium">
                      <i class="fas fa-lightbulb"></i>
                      <h4>No Improvements Found</h4>
                      <p>No DSI records have been submitted yet</p>
                    </div>
                   </td>
                 </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Image Modal - FIXED POSITIONING -->
        <div v-if="previewImage" class="image-modal-overlay" @click="closeImageModal">
          <div class="image-modal-container" @click.stop>
            <button class="image-modal-close" @click="closeImageModal">
              <i class="fas fa-times"></i>
            </button>
            <img :src="previewImage" alt="Preview" class="image-modal-img" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import axios from 'axios'
import {
  toastSuccess,
  toastError,
} from "@/utils/toast.js";

export default {
  name: "ViewDsi",
  components: {
    Sidebar
  },
  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      dsiList: [],
      previewImage: null,
      expandedTexts: new Map(), // Using Map for better performance
    }
  },
  computed: {
    pendingCount() {
      return this.dsiList.filter(item => item.status === 'pending' || !item.status).length
    },
    approvedCount() {
      return this.dsiList.filter(item => item.status === 'approved').length
    },
    rejectedCount() {
      return this.dsiList.filter(item => item.status === 'rejected').length
    }
  },
  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    this.fetchAllDSI()
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  },
  methods: {
    getExpandKey(id, field) {
      return `${id}_${field}`
    },
    isExpanded(id, field) {
      const key = this.getExpandKey(id, field)
      return this.expandedTexts.get(key) === true
    },
    isTextLong(text, length) {
      if (!text || typeof text !== 'string') return false
      return text.length > length
    },
    truncateText(text, length) {
      if (!text || typeof text !== 'string') return '—'
      if (text.length <= length) return text
      return text.substring(0, length) + '...'
    },
    toggleReadMore(id, field) {
      const key = this.getExpandKey(id, field)
      const currentState = this.expandedTexts.get(key) || false
      this.expandedTexts.set(key, !currentState)
      // Force reactivity
      this.expandedTexts = new Map(this.expandedTexts)
    },
    getInitials(name) {
      if (!name) return '?'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    },
    formatDate(dateStr) {
      if (!dateStr) return '—'
      try {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      } catch (e) {
        return '—'
      }
    },
    getStatusClass(status) {
      const s = (status || '').toLowerCase()
      if (s === 'approved') return 'approved'
      if (s === 'rejected') return 'rejected'
      return 'pending'
    },
    getStatusIcon(status) {
      const s = (status || '').toLowerCase()
      if (s === 'approved') return 'fas fa-check-circle'
      if (s === 'rejected') return 'fas fa-times-circle'
      return 'fas fa-clock'
    },
    openImage(img) {
      this.previewImage = img
      document.body.style.overflow = 'hidden' // Prevent body scroll when modal is open
    },
    closeImageModal() {
      this.previewImage = null
      document.body.style.overflow = '' // Restore body scroll
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    },
    async fetchAllDSI() {
      try {
        const res = await axios.get('/api/dsis/all')
        // Ensure text fields have default values
        this.dsiList = res.data.map(item => ({
          ...item,
          problem: item.problem || '',
          solution: item.solution || '',
          result: item.result || ''
        }))
      } catch (e) {
        toastError('Failed to load DSI')
      }
    },
    async updateStatus(dsiId, status) {
      try {
        // Send with capital first letter as expected by backend
        const statusToSend = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        
        await axios.put(`/api/dsis/${dsiId}/status`, { 
          status: statusToSend 
        });
        
        const index = this.dsiList.findIndex(item => item.id === dsiId);
        if (index !== -1) {
          // Store lowercase in frontend for consistent display
          this.dsiList[index].status = status.toLowerCase();
          // Force reactivity
          this.dsiList = [...this.dsiList];
        }
        
        toastSuccess(`Status updated to ${statusToSend}`);
      } catch (error) {
        console.error('Update status error:', error.response?.data);
        toastError('Failed to update status');
      }
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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
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

.stat-card.approved {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}
.stat-card.approved i { color: #065f46; }

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

/* Table Styles */
.table-wrapper-premium {
  background: white;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fafbfc;
  border-bottom: 1px solid #e5e7eb;
}

.section-title-modern {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #1a1a2e;
}

.section-title-modern i {
  color: var(--primary-color);
}

.table-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.table-container {
  overflow-x: auto;
}

.dsi-table-premium {
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px;
}

.dsi-table-premium thead {
  background: #f8fafc;
}

.dsi-table-premium th {
  text-align: left;
  padding: 14px 12px;
  font-weight: 600;
  font-size: 13px;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.dsi-table-premium td {
  padding: 14px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  vertical-align: middle;
}

.dsi-table-premium tbody tr {
  transition: all 0.3s ease;
}

.dsi-table-premium tbody tr:hover {
  background: #fafbfc;
}

/* Serial Number */
.serial-number {
  font-weight: 600;
  color: #9ca3af;
  width: 50px;
}

/* User Cell */
.user-cell {
  min-width: 120px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: var(--primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
}

/* Read More Styles */
.text-with-readmore {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 200px;
}

.text-with-readmore .truncated {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.readmore-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  padding: 0;
  width: fit-content;
  transition: all 0.2s ease;
}

.readmore-btn:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* Text Cells */
.problem-cell, .solution-cell, .result-cell {
  max-width: 200px;
  color: #4b5563;
}

/* Image Cell */
.image-cell {
  text-align: center;
  width: 60px;
}

.dsi-thumb-premium {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.dsi-thumb-premium:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
}

.no-image {
  color: #9ca3af;
  font-size: 12px;
}

/* Date Cell */
.date-cell {
  font-family: monospace;
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}

.date-cell i {
  margin-right: 6px;
  font-size: 11px;
}

/* Action Cell */
.action-cell {
  min-width: 140px;
}

.action-group {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn.approve {
  background: #d1fae5;
  color: var(--success);
}

.action-btn.approve:hover:not(:disabled) {
  color: rgb(12, 5, 5);
  transform: translateY(-2px);
}

.action-btn.reject {
  background: #fee2e2;
  color: var(--danger);
}

.action-btn.reject:hover:not(:disabled) {
  color: rgb(0, 0, 0);
  transform: translateY(-2px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Status Badge */
.status-badge-premium {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.status-badge-premium.approved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge-premium.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge-premium.pending {
  background: #fef3c7;
  color: #d97706;
}

/* ==================== */
/* IMAGE MODAL - FIXED POSITIONING */
/* ==================== */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  cursor: pointer;
}

.image-modal-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  animation: modalZoomIn 0.3s ease-out;
}

@keyframes modalZoomIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.image-modal-img {
  max-width: 90vw;
  max-height: 90vh;
  width: auto;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: block;
  margin: 0 auto;
}

.image-modal-close {
  position: absolute;
  top: -50px;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: none;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.image-modal-close:hover {
  color: rgb(6, 3, 3);
  transform: rotate(90deg);
}

/* Empty State */
.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
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
  .dsi-table-premium th,
  .dsi-table-premium td {
    padding: 10px 8px;
  }
  
  .problem-cell, .solution-cell, .result-cell {
    max-width: 150px;
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

  .table-container {
    overflow-x: auto;
  }

  .dsi-table-premium {
    min-width: 1000px;
  }

  .action-cell {
    min-width: 120px;
  }

  .action-group {
    justify-content: center;
  }

  .image-modal-close {
    top: -40px;
    right: 0;
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .stats-bar {
    grid-template-columns: 1fr;
  }
}
</style>