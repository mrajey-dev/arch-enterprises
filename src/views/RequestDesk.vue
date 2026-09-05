<template>
  <div class="layout">
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- Modern Header -->
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-ticket-alt"></i>
            </div>
            <div>
              <div class="header-badge">ADMINISTRATION & SUPPORT</div>
              <h1>Employee Request Desk</h1>
              <p class="subtitle-modern">Review, manage, and update tickets and assistance requests submitted by employees.</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn-refresh" @click="fetchRequests" :disabled="loadingRequests" title="Refresh List">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingRequests }"></i>
              <span>Refresh</span>
            </button>
            <div class="stats-badge-header">
              <i class="fas fa-clipboard-list"></i>
              <span>{{ employeeRequests.length }} Total Requests</span>
            </div>
          </div>
        </div>

        <!-- Interactive Filter KPI Stat Cards -->
        <div class="stats-bar">
          <div 
            class="stat-card all" 
            :class="{ active: statusFilter === '' || statusFilter === 'all' }"
            @click="filterByStatus('all')"
          >
            <div class="stat-icon-wrap"><i class="fas fa-layer-group"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ employeeRequests.length }}</span>
              <span class="stat-label">All Tickets</span>
            </div>
          </div>

          <div 
            class="stat-card pending" 
            :class="{ active: statusFilter === 'Pending' }"
            @click="filterByStatus('Pending')"
          >
            <div class="stat-icon-wrap"><i class="fas fa-clock"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ pendingCount }}</span>
              <span class="stat-label">Pending</span>
            </div>
          </div>

          <div 
            class="stat-card approved" 
            :class="{ active: statusFilter === 'Approved' }"
            @click="filterByStatus('Approved')"
          >
            <div class="stat-icon-wrap"><i class="fas fa-check-circle"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ approvedCount }}</span>
              <span class="stat-label">Approved</span>
            </div>
          </div>

          <div 
            class="stat-card completed" 
            :class="{ active: statusFilter === 'Completed' }"
            @click="filterByStatus('Completed')"
          >
            <div class="stat-icon-wrap"><i class="fas fa-check-double"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ completedCount }}</span>
              <span class="stat-label">Completed</span>
            </div>
          </div>

          <div 
            class="stat-card rejected" 
            :class="{ active: statusFilter === 'Rejected' }"
            @click="filterByStatus('Rejected')"
          >
            <div class="stat-icon-wrap"><i class="fas fa-times-circle"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ rejectedCount }}</span>
              <span class="stat-label">Rejected</span>
            </div>
          </div>
        </div>

        <!-- Search & Control Toolbar -->
        <div class="controls-toolbar">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search by employee name, request type, or description..."
            />
            <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="filter-indicators" v-if="statusFilter || searchQuery">
            <span class="indicator-chip" v-if="statusFilter">
              Status: <strong>{{ statusFilter }}</strong>
              <i class="fas fa-times" @click="statusFilter = ''"></i>
            </span>
            <span class="indicator-chip" v-if="searchQuery">
              Search: <strong>"{{ searchQuery }}"</strong>
              <i class="fas fa-times" @click="searchQuery = ''"></i>
            </span>
            <button class="btn-clear-all" @click="clearFilters">Clear All</button>
          </div>
        </div>

        <!-- Loading Spinner -->
        <div v-if="loadingRequests" class="loading-container">
          <div class="spinner"></div>
          <p>Fetching submitted requests...</p>
        </div>

        <!-- Request Table -->
        <div v-else class="table-wrapper-premium">
          <div class="table-header">
            <div class="section-title-modern">
              <i class="fas fa-list-ul"></i>
              <span>Submitted Requests</span>
              <span class="count-tag">{{ filteredRequests.length }}</span>
            </div>
            <div class="table-info">
              <i class="fas fa-info-circle"></i>
              <span>Change status using the interactive dropdown in each row</span>
            </div>
          </div>

          <div class="table-container">
            <table class="request-table-premium">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Request Type</th>
                  <th>Description</th>
                  <th>Date Submitted</th>
                  <th>Status Action</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(request, index) in filteredRequests" :key="request.id">
                  <td class="serial-number">{{ index + 1 }}</td>
                  <td class="employee-cell">
                    <div class="employee-info">
                      <div class="employee-avatar">
                        {{ getInitials(request.user_name || request.user?.name || 'Employee') }}
                      </div>
                      <div class="employee-text">
                        <span class="employee-name">{{ request.user_name || request.user?.name || 'Employee #' + (request.user_id || '') }}</span>
                        <span class="employee-email" v-if="request.user?.email">{{ request.user.email }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="department-badge">
                      <i class="fas fa-building"></i>
                      {{ request.department || request.user?.department || 'General' }}
                    </span>
                  </td>
                  <td>
                    <span :class="['request-type-badge', getRequestTypeClass(request.request_type)]">
                      <i :class="getRequestTypeIcon(request.request_type)"></i>
                      {{ request.request_type }}
                    </span>
                  </td>
                  <td class="description-cell" :title="request.description">
                    <span>{{ truncateText(request.description, 50) }}</span>
                  </td>
                  <td class="date-cell">
                    <div class="date-cell-wrap">
                      <i class="far fa-calendar-alt"></i>
                      <span>{{ formatDate(request.created_at) }}</span>
                    </div>
                  </td>
                  <td class="status-action-cell">
                    <select 
                      v-model="request.status"
                      @change="changeStatus(request)"
                      :class="['status-dropdown-premium', getStatusClass(request.status)]"
                      :disabled="updatingStatusId === request.id"
                    >
                      <option value="Pending">⏳ Pending</option>
                      <option value="Approved">✅ Approved</option>
                      <option value="Rejected">❌ Rejected</option>
                      <option value="Completed">🎯 Completed</option>
                    </select>
                    <i v-if="updatingStatusId === request.id" class="fas fa-spinner fa-spin status-spinner"></i>
                  </td>
                  <td class="action-cell">
                    <div class="action-buttons-group">
                      <button class="btn-action-view" @click="openDetailsModal(request)" title="View Full Ticket">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button 
                        class="btn-action-delete" 
                        @click="deleteRequest(request.id)" 
                        title="Delete Ticket" 
                        :disabled="deletingId === request.id"
                      >
                        <i class="fas fa-trash-alt" :class="{ 'fa-spin': deletingId === request.id }"></i>
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr v-if="filteredRequests.length === 0" class="empty-row">
                  <td colspan="8">
                    <div class="empty-state-premium">
                      <i class="fas fa-inbox"></i>
                      <h4>No Requests Found</h4>
                      <p v-if="searchQuery || statusFilter">No requests matched your current filters.</p>
                      <p v-else>No employee requests have been submitted yet.</p>
                      <button v-if="searchQuery || statusFilter" class="btn-reset-filter" @click="clearFilters">Reset Filters</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Details Modal Popup -->
        <div v-if="selectedRequest" class="modal-overlay" @click.self="closeDetailsModal">
          <div class="modal-card">
            <div class="modal-header">
              <div class="modal-title-group">
                <div class="modal-icon-badge">
                  <i class="fas fa-ticket-alt"></i>
                </div>
                <div>
                  <h3>Request Ticket #{{ selectedRequest.id }}</h3>
                  <p>Submitted by {{ selectedRequest.user_name || selectedRequest.user?.name || 'Employee' }}</p>
                </div>
              </div>
              <button class="btn-close-modal" @click="closeDetailsModal">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="modal-body">
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-lbl"><i class="fas fa-user"></i> Employee</span>
                  <span class="detail-val font-semibold">{{ selectedRequest.user_name || selectedRequest.user?.name || '—' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-lbl"><i class="fas fa-building"></i> Department</span>
                  <span class="detail-val">{{ selectedRequest.department || selectedRequest.user?.department || 'General' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-lbl"><i class="fas fa-tag"></i> Request Type</span>
                  <span class="detail-val">
                    <span :class="['request-type-badge', getRequestTypeClass(selectedRequest.request_type)]">
                      <i :class="getRequestTypeIcon(selectedRequest.request_type)"></i>
                      {{ selectedRequest.request_type }}
                    </span>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-lbl"><i class="fas fa-calendar-alt"></i> Date Submitted</span>
                  <span class="detail-val">{{ formatDateTime(selectedRequest.created_at) }}</span>
                </div>
              </div>

              <div class="detail-desc-box">
                <span class="detail-lbl"><i class="fas fa-align-left"></i> Description & Details</span>
                <div class="description-full-text">{{ selectedRequest.description }}</div>
              </div>

              <div class="modal-status-box">
                <span class="detail-lbl"><i class="fas fa-tasks"></i> Update Ticket Status</span>
                <div class="status-btn-group">
                  <button 
                    class="status-btn pending" 
                    :class="{ active: selectedRequest.status === 'Pending' }"
                    @click="setModalStatus('Pending')"
                  >
                    <i class="fas fa-hourglass-half"></i> Pending
                  </button>
                  <button 
                    class="status-btn approved" 
                    :class="{ active: selectedRequest.status === 'Approved' }"
                    @click="setModalStatus('Approved')"
                  >
                    <i class="fas fa-check-circle"></i> Approved
                  </button>
                  <button 
                    class="status-btn completed" 
                    :class="{ active: selectedRequest.status === 'Completed' }"
                    @click="setModalStatus('Completed')"
                  >
                    <i class="fas fa-check-double"></i> Completed
                  </button>
                  <button 
                    class="status-btn rejected" 
                    :class="{ active: selectedRequest.status === 'Rejected' }"
                    @click="setModalStatus('Rejected')"
                  >
                    <i class="fas fa-times-circle"></i> Rejected
                  </button>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button 
                class="btn-modal-delete" 
                @click="deleteRequest(selectedRequest.id)" 
                :disabled="deletingId === selectedRequest.id"
              >
                <i class="fas fa-trash-alt" :class="{ 'fa-spin': deletingId === selectedRequest.id }"></i>
                <span>Delete Ticket</span>
              </button>
              <button class="btn-modal-close" @click="closeDetailsModal">Close</button>
            </div>
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
  name: "RequestDeskAdmin",
  components: { Sidebar },
  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      loadingRequests: true,
      employeeRequests: [],
      searchQuery: '',
      statusFilter: '',
      selectedRequest: null,
      updatingStatusId: null,
      deletingId: null
    }
  },
  computed: {
    pendingCount() {
      return this.employeeRequests.filter(r => (r.status || '').toLowerCase() === 'pending').length
    },
    approvedCount() {
      return this.employeeRequests.filter(r => (r.status || '').toLowerCase() === 'approved').length
    },
    rejectedCount() {
      return this.employeeRequests.filter(r => (r.status || '').toLowerCase() === 'rejected').length
    },
    completedCount() {
      return this.employeeRequests.filter(r => (r.status || '').toLowerCase() === 'completed').length
    },
    filteredRequests() {
      let list = this.employeeRequests

      // Filter by status
      if (this.statusFilter && this.statusFilter !== 'all') {
        list = list.filter(r => (r.status || '').toLowerCase() === this.statusFilter.toLowerCase())
      }

      // Filter by search query
      if (this.searchQuery && this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim()
        list = list.filter(r => {
          const empName = (r.user_name || r.user?.name || '').toLowerCase()
          const dept = (r.department || r.user?.department || '').toLowerCase()
          const type = (r.request_type || '').toLowerCase()
          const desc = (r.description || '').toLowerCase()
          return empName.includes(q) || dept.includes(q) || type.includes(q) || desc.includes(q)
        })
      }

      return list
    }
  },
  methods: {
    filterByStatus(status) {
      this.statusFilter = this.statusFilter === status ? '' : status
    },
    clearFilters() {
      this.searchQuery = ''
      this.statusFilter = ''
    },
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
      if (t.includes('equipment') || t.includes('asset') || t.includes('hardware')) return 'equipment'
      if (t.includes('travel') || t.includes('visit')) return 'travel'
      if (t.includes('reimbursement') || t.includes('expense')) return 'reimbursement'
      if (t.includes('it') || t.includes('software')) return 'it'
      return 'general'
    },
    getRequestTypeIcon(type) {
      const t = (type || '').toLowerCase()
      if (t.includes('leave')) return 'fas fa-umbrella-beach'
      if (t.includes('equipment') || t.includes('asset')) return 'fas fa-laptop'
      if (t.includes('travel')) return 'fas fa-plane'
      if (t.includes('reimbursement') || t.includes('expense')) return 'fas fa-rupee-sign'
      if (t.includes('it') || t.includes('software')) return 'fas fa-headset'
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
    formatDateTime(dateStr) {
      if (!dateStr) return '—'
      try {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (e) {
        return '—'
      }
    },
    openDetailsModal(request) {
      this.selectedRequest = { ...request }
    },
    closeDetailsModal() {
      this.selectedRequest = null
    },
    async setModalStatus(newStatus) {
      if (!this.selectedRequest) return
      this.selectedRequest.status = newStatus
      
      // Update in main list
      const item = this.employeeRequests.find(r => r.id === this.selectedRequest.id)
      if (item) {
        item.status = newStatus
        await this.changeStatus(item)
      }
    },
    async deleteRequest(id) {
      if (!confirm(`Are you sure you want to permanently delete ticket #${id}? This action cannot be undone.`)) return
      const token = localStorage.getItem('token')
      this.deletingId = id
      const headers = { Authorization: `Bearer ${token}` }
      try {
        let deleted = false
        const attempts = [
          () => axios.delete(`/requests/${id}`, { headers }),
          () => axios.post(`/requests/${id}/delete`, {}, { headers }),
          () => axios.delete(`/api/requests/${id}`, { headers }),
          () => axios.post(`/api/requests/${id}/delete`, {}, { headers })
        ]

        let lastErr = null
        for (const attempt of attempts) {
          try {
            await attempt()
            deleted = true
            break
          } catch (err) {
            lastErr = err
            // If it was unauthorized or bad request (not 404/405), stop early
            if (err.response && err.response.status !== 404 && err.response.status !== 405) {
              throw err
            }
          }
        }

        if (!deleted && lastErr) {
          throw lastErr
        }

        toastSuccess(`Ticket #${id} deleted successfully`)
        if (this.selectedRequest && this.selectedRequest.id === id) {
          this.closeDetailsModal()
        }
        await this.fetchRequests()
      } catch (err) {
        console.error('Delete request error:', err)
        const msg = err.response?.data?.message || 'Failed to delete request ticket'
        toastError(msg)
      } finally {
        this.deletingId = null
      }
    },
    async changeStatus(request) {
      const token = localStorage.getItem('token')
      const previousStatus = request.status
      this.updatingStatusId = request.id
      const headers = { Authorization: `Bearer ${token}` }
      
      try {
        try {
          await axios.patch(`/requests/${request.id}/status`, { status: request.status }, { headers })
        } catch (e1) {
          await axios.patch(`/api/requests/${request.id}/status`, { status: request.status }, { headers })
        }
        toastSuccess(`Ticket #${request.id} status updated to "${request.status}"`)
      } catch (err) {
        console.error('Failed to update status:', err)
        toastError('Failed to update ticket status')
        // Revert status on error
        request.status = previousStatus
      } finally {
        this.updatingStatusId = null
      }
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },
    async fetchRequests() {
      this.loadingRequests = true
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }
      try {
        let res = null
        const endpoints = ['/requests/employee', '/requests/all', '/requests/my', '/api/requests/employee', '/api/requests/my']
        for (const ep of endpoints) {
          try {
            res = await axios.get(ep, { headers })
            if (res && res.data) break
          } catch (e) {
            // try next
          }
        }
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.data || [])
        this.employeeRequests = list
      } catch (err) {
        console.error('Employee requests error:', err)
        toastError('Failed to load requests list')
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
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1e293b;
}

.main-content {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.content {
  flex: 1;
  padding: 24px 32px;
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

/* Header */
.content-header-modern {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 20px;
  padding: 26px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  color: #ffffff;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.15);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-badge {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #94a3b8;
  margin-bottom: 4px;
}

.title-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
}

.content-header-modern h1 {
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}

.subtitle-modern {
  color: #94a3b8;
  font-size: 13px;
  margin-top: 3px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-refresh:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.stats-badge-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  color: #a5b4fc;
}

/* KPI Cards */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: #ffffff;
  border-radius: 16px;
  border: 1.5px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.08);
}

.stat-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.stat-card.all .stat-icon-wrap { background: #f1f5f9; color: #475569; }
.stat-card.all.active { border-color: #64748b; background: #f8fafc; }

.stat-card.pending .stat-icon-wrap { background: #fef3c7; color: #d97706; }
.stat-card.pending.active { border-color: #f59e0b; background: #fffbeb; }

.stat-card.approved .stat-icon-wrap { background: #d1fae5; color: #059669; }
.stat-card.approved.active { border-color: #10b981; background: #ecfdf5; }

.stat-card.completed .stat-icon-wrap { background: #e0e7ff; color: #4f46e5; }
.stat-card.completed.active { border-color: #6366f1; background: #eef2ff; }

.stat-card.rejected .stat-icon-wrap { background: #fee2e2; color: #dc2626; }
.stat-card.rejected.active { border-color: #ef4444; background: #fef2f2; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

/* Controls Toolbar */
.controls-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 280px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 14px;
}

.search-box input {
  width: 100%;
  padding: 12px 38px 12px 40px;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  color: #1e293b;
  outline: none;
  transition: all 0.2s ease;
}

.search-box input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.clear-search-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

.filter-indicators {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.indicator-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #e2e8f0;
  border-radius: 20px;
  font-size: 12px;
  color: #334155;
}

.indicator-chip i {
  cursor: pointer;
  color: #64748b;
}

.indicator-chip i:hover {
  color: #dc2626;
}

.btn-clear-all {
  background: transparent;
  border: none;
  color: #6366f1;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #64748b;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Table Wrapper */
.table-wrapper-premium {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 12px;
}

.section-title-modern {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 15px;
  color: #0f172a;
}

.section-title-modern i {
  color: #6366f1;
}

.count-tag {
  padding: 2px 8px;
  background: #e2e8f0;
  color: #475569;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
}

.table-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
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
  padding: 14px 18px;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
  border-bottom: 1.5px solid #e2e8f0;
  white-space: nowrap;
}

.request-table-premium td {
  padding: 14px 18px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13.5px;
  vertical-align: middle;
}

.request-table-premium tbody tr {
  transition: background 0.15s ease;
}

.request-table-premium tbody tr:hover {
  background: #f8fafc;
}

.serial-number {
  font-weight: 700;
  color: #94a3b8;
  width: 40px;
}

/* Employee Cell */
.employee-cell {
  min-width: 180px;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}

.employee-text {
  display: flex;
  flex-direction: column;
}

.employee-name {
  font-weight: 700;
  color: #0f172a;
}

.employee-email {
  font-size: 11px;
  color: #64748b;
}

.department-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
}

.department-badge i {
  color: #94a3b8;
  font-size: 11px;
}

/* Request Type Badges */
.request-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.request-type-badge.leave { background: #fef3c7; color: #b45309; }
.request-type-badge.equipment { background: #e0e7ff; color: #4338ca; }
.request-type-badge.travel { background: #d1fae5; color: #047857; }
.request-type-badge.reimbursement { background: #fed7aa; color: #c2410c; }
.request-type-badge.it { background: #e0f2fe; color: #0369a1; }
.request-type-badge.general { background: #f3e8ff; color: #7e22ce; }

/* Description */
.description-cell {
  max-width: 260px;
  color: #475569;
}

.description-cell span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date-cell-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: #64748b;
  white-space: nowrap;
}

/* Status Action */
.status-action-cell {
  position: relative;
}

.status-dropdown-premium {
  padding: 7px 12px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 700;
  border: 1.5px solid transparent;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
}

.status-dropdown-premium:hover {
  filter: brightness(0.96);
}

.status-dropdown-premium.pending {
  background: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.status-dropdown-premium.approved {
  background: #d1fae5;
  color: #065f46;
  border-color: #a7f3d0;
}

.status-dropdown-premium.rejected {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}

.status-dropdown-premium.completed {
  background: #e0e7ff;
  color: #3730a3;
  border-color: #c7d2fe;
}

.status-spinner {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  color: #6366f1;
  font-size: 12px;
}

.action-cell {
  white-space: nowrap;
}

.action-buttons-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-action-view,
.btn-action-delete {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
}

.btn-action-view {
  color: #6366f1;
}

.btn-action-view:hover {
  background: #6366f1;
  color: #ffffff;
  border-color: #6366f1;
}

.btn-action-delete {
  color: #ef4444;
}

.btn-action-delete:hover:not(:disabled) {
  background: #ef4444;
  color: #ffffff;
  border-color: #ef4444;
}

.btn-action-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-modal-delete {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  margin-right: auto;
  transition: all 0.2s ease;
}

.btn-modal-delete:hover:not(:disabled) {
  background: #dc2626;
  color: #ffffff;
  border-color: #dc2626;
}

.btn-modal-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty State */
.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.empty-state-premium i {
  font-size: 48px;
  margin-bottom: 12px;
  color: #cbd5e1;
}

.empty-state-premium h4 {
  font-size: 16px;
  color: #334155;
  margin-bottom: 6px;
}

.empty-state-premium p {
  font-size: 13px;
  margin-bottom: 12px;
}

.btn-reset-filter {
  padding: 8px 16px;
  background: #6366f1;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-card {
  background: #ffffff;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon-badge {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.modal-header p {
  font-size: 12px;
  color: #64748b;
}

.btn-close-modal {
  background: transparent;
  border: none;
  font-size: 16px;
  color: #94a3b8;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-lbl {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-val {
  font-size: 13.5px;
  color: #1e293b;
}

.font-semibold {
  font-weight: 700;
}

.detail-desc-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.description-full-text {
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13.5px;
  line-height: 1.6;
  color: #334155;
  white-space: pre-wrap;
  word-break: break-word;
}

.modal-status-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
}

.status-btn-group {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.status-btn {
  padding: 10px 8px;
  border-radius: 10px;
  border: 1.5px solid transparent;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-btn.pending { background: #fef3c7; color: #92400e; border-color: #fde68a; }
.status-btn.approved { background: #d1fae5; color: #065f46; border-color: #a7f3d0; }
.status-btn.completed { background: #e0e7ff; color: #3730a3; border-color: #c7d2fe; }
.status-btn.rejected { background: #fee2e2; color: #991b1b; border-color: #fecaca; }

.status-btn.active {
  box-shadow: 0 0 0 2px #0f172a;
  transform: scale(1.02);
}

.modal-footer {
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.btn-modal-close {
  padding: 9px 20px;
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 1100px) {
  .stats-bar {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .content {
    padding: 16px;
  }

  .content-header-modern {
    padding: 20px;
  }

  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
  }

  .status-btn-group {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-bar {
    grid-template-columns: 1fr;
  }
}
</style>