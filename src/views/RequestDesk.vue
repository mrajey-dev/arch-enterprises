<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-ticket-alt"></i>
            </div>
            <div>
              <h1>Request Desk</h1>
              <p class="subtitle-modern">Manage and track employee requests</p>
            </div>
          </div>
          <div class="stats-badge-header">
            <i class="fas fa-clipboard-list"></i>
            <span>{{ employeeRequests.length }} Total Requests</span>
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
          <div class="stat-card completed">
            <i class="fas fa-check-double"></i>
            <div class="stat-info">
              <span class="stat-value">{{ completedCount }}</span>
              <span class="stat-label">Completed</span>
            </div>
          </div>
        </div>

        <!-- Loading Spinner -->
        <div v-if="loadingRequests" class="loading-container">
          <div class="spinner"></div>
          <p>Loading requests...</p>
        </div>

        <!-- Request Table -->
        <div v-else class="table-wrapper-premium">
          <div class="table-header">
            <div class="section-title-modern">
              <i class="fas fa-list-ul"></i>
              <span>Employee Requests</span>
            </div>
            <div class="table-info">
              <i class="fas fa-file-alt"></i>
              <span>{{ employeeRequests.length }} records</span>
            </div>
          </div>

          <div class="table-container">
            <table class="request-table-premium">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employee</th>
                  <th>Request Type</th>
                  <th>Description</th>
                  <th>Date Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(request, index) in employeeRequests" :key="request.id">
                  <td class="serial-number">{{ index + 1 }}</td>
                  <td class="employee-cell">
                    <div class="employee-info">
                      <div class="employee-avatar">
                        {{ getInitials(request.user_name || 'Me') }}
                      </div>
                      <span class="employee-name">{{ request.user_name || 'Me' }}</span>
                    </div>
                  </td>
                  <td>
                    <span :class="['request-type-badge', getRequestTypeClass(request.request_type)]">
                      <i :class="getRequestTypeIcon(request.request_type)"></i>
                      {{ request.request_type }}
                    </span>
                  </td>
                  <td class="description-cell" :title="request.description">
                    {{ truncateText(request.description, 60) }}
                  </td>
                  <td class="date-cell">
                    <i class="fas fa-calendar-alt"></i> {{ formatDate(request.created_at) }}
                  </td>
                  <td>
                    <select 
                      v-model="request.status"
                      @change="changeStatus(request)"
                      :class="['status-dropdown-premium', getStatusClass(request.status)]"
                    >
                      <option value="Pending">🕐 Pending</option>
                      <option value="Approved">✅ Approved</option>
                      <option value="Rejected">❌ Rejected</option>
                      <option value="Completed">🎯 Completed</option>
                    </select>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr v-if="employeeRequests.length === 0" class="empty-row">
                  <td colspan="6">
                    <div class="empty-state-premium">
                      <i class="fas fa-inbox"></i>
                      <h4>No Requests Found</h4>
                      <p>No employee requests have been submitted yet</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
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
      loadingRequests: true,
      employeeRequests: [],
    }
  },
  computed: {
    pendingCount() {
      return this.employeeRequests.filter(r => r.status === 'Pending').length
    },
    approvedCount() {
      return this.employeeRequests.filter(r => r.status === 'Approved').length
    },
    rejectedCount() {
      return this.employeeRequests.filter(r => r.status === 'Rejected').length
    },
    completedCount() {
      return this.employeeRequests.filter(r => r.status === 'Completed').length
    }
  },
  methods: {
    getInitials(name) {
      if (!name || name === 'Me') return '👤'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    },
    truncateText(text, length) {
      if (!text) return '—'
      return text.length > length ? text.substring(0, length) + '...' : text
    },
    getRequestTypeClass(type) {
      const t = (type || '').toLowerCase()
      if (t.includes('leave')) return 'leave'
      if (t.includes('equipment')) return 'equipment'
      if (t.includes('travel')) return 'travel'
      if (t.includes('reimbursement')) return 'reimbursement'
      return 'general'
    },
    getRequestTypeIcon(type) {
      const t = (type || '').toLowerCase()
      if (t.includes('leave')) return 'fas fa-umbrella-beach'
      if (t.includes('equipment')) return 'fas fa-laptop'
      if (t.includes('travel')) return 'fas fa-plane'
      if (t.includes('reimbursement')) return 'fas fa-rupee-sign'
      return 'fas fa-ticket-alt'
    },
    getStatusClass(status) {
      const s = (status || '').toLowerCase()
      if (s === 'approved') return 'approved'
      if (s === 'rejected') return 'rejected'
      if (s === 'completed') return 'completed'
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
    async changeStatus(request) {
      const token = localStorage.getItem('token')
      const previousStatus = request.status
      
      try {
        await axios.patch(`/api/requests/${request.id}/status`, {
          status: request.status
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toastSuccess(`Request status updated to ${request.status}`)
      } catch (err) {
        console.error('Failed to update status:', err)
        toastError('Failed to update status')
        // Revert status on error
        request.status = previousStatus
      }
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    },
    async fetchRequests() {
      this.loadingRequests = true
      const token = localStorage.getItem('token')
      try {
        const res = await axios.get('/api/requests/employee', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.employeeRequests = res.data
      } catch (err) {
        console.error('Employee requests error:', err)
        toastError('Failed to load requests')
      } finally {
        this.loadingRequests = false
      }
    }
  },
  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    this.fetchRequests()
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    }
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

.stat-card.completed {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
}
.stat-card.completed i { color: #4338ca; }

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

.request-table-premium {
  width: 100%;
  border-collapse: collapse;
}

.request-table-premium thead {
  background: #f8fafc;
}

.request-table-premium th {
  text-align: left;
  padding: 16px;
  font-weight: 600;
  font-size: 13px;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.request-table-premium td {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.request-table-premium tbody tr {
  transition: all 0.3s ease;
}

.request-table-premium tbody tr:hover {
  background: #fafbfc;
}

/* Serial Number */
.serial-number {
  font-weight: 600;
  color: #9ca3af;
  width: 50px;
}

/* Employee Cell */
.employee-cell {
  min-width: 150px;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-avatar {
  width: 36px;
  height: 36px;
  background: var(--primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.employee-name {
  font-weight: 500;
  color: #1a1a2e;
}

/* Request Type Badge */
.request-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.request-type-badge.leave {
  background: #fef3c7;
  color: #d97706;
}

.request-type-badge.equipment {
  background: #e0e7ff;
  color: #4338ca;
}

.request-type-badge.travel {
  background: #d1fae5;
  color: #065f46;
}

.request-type-badge.reimbursement {
  background: #fed7aa;
  color: #c2410c;
}

.request-type-badge.general {
  background: #f3e8ff;
  color: #7e22ce;
}

/* Description Cell */
.description-cell {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #6b7280;
}

/* Date Cell */
.date-cell {
  font-family: monospace;
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
}

.date-cell i {
  margin-right: 6px;
  font-size: 12px;
}

/* Status Dropdown */
.status-dropdown-premium {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: #f3f4f6;
  color: #6b7280;
  transition: all 0.3s ease;
}

.status-dropdown-premium:hover {
  transform: translateY(-1px);
}

.status-dropdown-premium.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-dropdown-premium.approved {
  background: #d1fae5;
  color: #065f46;
}

.status-dropdown-premium.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.status-dropdown-premium.completed {
  background: #e0e7ff;
  color: #4338ca;
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
  .request-table-premium th,
  .request-table-premium td {
    padding: 12px;
  }
  
  .description-cell {
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

  .stat-card {
    padding: 12px;
  }

  .stat-card i {
    font-size: 22px;
  }

  .stat-value {
    font-size: 20px;
  }

  .table-container {
    overflow-x: auto;
  }

  .request-table-premium {
    min-width: 700px;
  }

  .employee-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .employee-avatar {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }

  .description-cell {
    max-width: 120px;
  }
}

@media (max-width: 480px) {
  .stats-bar {
    grid-template-columns: 1fr;
  }
}
</style>