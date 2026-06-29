<template>
  <div class="layout">

    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content">
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
        
          <div class="mobile-title">
            <i class="fas fa-ticket-alt"></i>
            <span>Request Desk</span>
          </div>
          <div class="mobile-stats-badge">
            <span>{{ requests.length }}</span>
          </div>
        </div>

        <!-- Desktop Header -->
        <div class="content-header-modern" v-else>
          <div class="header-left desktop-only">
            <div class="title-icon">
              <i class="fas fa-ticket-alt"></i>
            </div>
            <div>
              <h1>Request Desk</h1>
              <p class="subtitle-modern">Manage and track your requests</p>
            </div>
          </div>
          <div class="stats-badge-header">
            <i class="fas fa-clipboard-list"></i>
            <span>{{ requests.length }} Total Requests</span>
          </div>
        </div>

        <!-- Stats Bar - Mobile Optimized -->
        <div class="stats-bar">
          <div class="stat-card pending" @click="filterByStatus('Pending')">
            <i class="fas fa-clock"></i>
            <div class="stat-info">
              <span class="stat-value">{{ statusCounts.Pending }}</span>
              <span class="stat-label">Pending</span>
            </div>
          </div>
          <div class="stat-card approved" @click="filterByStatus('Approved')">
            <i class="fas fa-check-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ statusCounts.Approved }}</span>
              <span class="stat-label">Approved</span>
            </div>
          </div>
          <div class="stat-card rejected" @click="filterByStatus('Rejected')">
            <i class="fas fa-times-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ statusCounts.Rejected }}</span>
              <span class="stat-label">Rejected</span>
            </div>
          </div>
          <div class="stat-card completed" @click="filterByStatus('Completed')">
            <i class="fas fa-check-double"></i>
            <div class="stat-info">
              <span class="stat-value">{{ statusCounts.Completed }}</span>
              <span class="stat-label">Completed</span>
            </div>
          </div>
        </div>

        <!-- Submit Request Card - Mobile Optimized -->
        <div class="card-premium">
          <div class="card-header-premium" @click="toggleForm">
            <div class="section-title-modern">
              <div class="title-left">
                <i class="fas fa-pen-alt"></i>
                <span>{{ editingId ? 'Edit Request' : 'Submit New Request' }}</span>
              </div>
              <i class="fas fa-chevron-down form-toggle" :class="{ 'rotated': formVisible }"></i>
            </div>
          </div>

          <div class="form-section" :class="{ 'form-hidden': !formVisible }">
            <div class="form-field">
              <label><i class="fas fa-tag"></i> Request Type</label>
              <div class="field-wrapper">
                <i class="fas fa-file-alt field-icon"></i>
                <input
                  type="text"
                  v-model="form.request_type"
                  placeholder="e.g., WFO, Asset, HR, IT Support"
                />
              </div>
            </div>

            <div class="form-field full-width">
              <label><i class="fas fa-align-left"></i> Description</label>
              <div class="field-wrapper">
                <i class="fas fa-comment field-icon" style="top: 18px;"></i>
                <textarea
                  v-model="form.description"
                  rows="4"
                  maxlength="250"
                  placeholder="Provide detailed description of your request..."
                ></textarea>
              </div>
              <div class="char-counter">{{ form.description.length }}/250 characters</div>
            </div>

            <div class="form-actions">
              <button class="btn-submit-premium" @click="submitRequest" :disabled="isSubmitting">
                <span v-if="isSubmitting">
                  <i class="fas fa-spinner fa-spin"></i> Processing...
                </span>
                <span v-else>
                  <i class="fas fa-paper-plane"></i> {{ editingId ? 'Update' : 'Submit' }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Donut Chart Card -->
        <div class="card-premium">
          <div class="card-header-premium">
            <div class="section-title-modern">
              <i class="fas fa-chart-pie"></i>
              <span>Status Overview</span>
            </div>
          </div>
          <div class="chart-container">
            <canvas ref="statusChart"></canvas>
          </div>
        </div>

        <!-- My Requests Card -->
        <div class="card-premium">
          <div class="card-header-premium">
            <div class="section-title-modern">
              <div class="title-left">
                <i class="fas fa-list-ul"></i>
                <span>My Requests</span>
                <span class="record-count-mobile" v-if="isMobile">{{ filteredRequests.length }}</span>
              </div>
            </div>
            <div class="table-info desktop-only">
              <i class="fas fa-file-alt"></i>
              <span>{{ requests.length }} records</span>
            </div>
          </div>

          <!-- Mobile Search -->
          <div class="search-bar-mobile" v-if="isMobile && requests.length > 0">
            <div class="search-group-mobile">
              <i class="fas fa-search"></i>
              <input type="text" v-model="searchQuery" placeholder="Search requests..." class="search-input-mobile" />
            </div>
          </div>

          <!-- Mobile Card View -->
          <div class="mobile-cards" v-if="isMobile">
            <div v-for="r in filteredRequests" :key="r.id" class="request-card">
              <div class="card-header">
                <div class="card-type">
                  <span class="request-type-badge-mobile">
                    <i class="fas fa-tag"></i>
                    {{ r.request_type }}
                  </span>
                </div>
                <div class="card-actions">
                  <button class="action-btn-mobile edit" @click="editRequest(r)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn-mobile delete" @click="deleteRequest(r.id)">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>

              <div class="card-body">
                <div class="card-row">
                  <span class="card-label"><i class="fas fa-align-left"></i> Description</span>
                  <span class="card-value description-text">{{ r.description || '—' }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label"><i class="fas fa-calendar-alt"></i> Date</span>
                  <span class="card-value">{{ formatDate(r.created_at) }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label"><i class="fas fa-info-circle"></i> Status</span>
                  <span :class="['status-badge-mobile', getStatusClass(r.status)]">
                    <i :class="getStatusIcon(r.status)"></i>
                    {{ r.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Mobile Empty State -->
            <div v-if="filteredRequests.length === 0" class="empty-state-mobile">
              <i class="fas fa-inbox"></i>
              <h4>{{ searchQuery ? 'No Matching Requests' : 'No Requests Found' }}</h4>
              <p>{{ searchQuery ? 'Try adjusting your search' : 'Submit your first request using the form above' }}</p>
            </div>
          </div>

          <!-- Desktop Table View -->
          <div class="table-wrapper-premium" v-else>
            <table class="request-table-premium">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in filteredRequests" :key="r.id" class="request-row">
                  <td class="type-cell">
                    <span class="request-type-badge">
                      <i class="fas fa-tag"></i>
                      {{ r.request_type }}
                    </span>
                  </td>
                  <td class="description-cell" :title="r.description">
                    {{ truncateText(r.description, 60) }}
                  </td>
                  <td>
                    <span :class="['status-badge-premium', getStatusClass(r.status)]">
                      <i :class="getStatusIcon(r.status)"></i>
                      {{ r.status }}
                    </span>
                  </td>
                  <td class="date-cell">
                    <i class="fas fa-calendar-alt"></i> {{ formatDate(r.created_at) }}
                  </td>
                  <td class="action-cell">
                    <div class="action-group">
                      <button class="action-icon edit" @click="editRequest(r)" title="Edit Request">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="action-icon delete" @click="deleteRequest(r.id)" title="Delete Request">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Desktop Empty State -->
                <tr v-if="filteredRequests.length === 0" class="empty-row">
                  <td colspan="5">
                    <div class="empty-state-premium">
                      <i class="fas fa-inbox"></i>
                      <h4>No Requests Found</h4>
                      <p>Submit your first request using the form above</p>
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
import Sidebar from './components/Sidebar.vue'
import Chart from 'chart.js/auto'
import axios from "axios";
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

export default {
  components: { Sidebar },

  data() {
    return {
      isSubmitting: false,
      editingId: null,
      isMobile: false,
      isSidebarVisible: true,
      formVisible: false,
      searchQuery: '',
      statusFilter: '',
      form: {
        request_type: '',
        description: ''
      },
      requests: [],
      chart: null
    }
  },

  computed: {
    statusCounts() {
      const counts = { Pending: 0, Approved: 0, Rejected: 0, Completed: 0 }
      this.requests.forEach(r => {
        if (counts[r.status] !== undefined) counts[r.status]++
      })
      return counts
    },
    filteredRequests() {
      let filtered = this.requests;
      
      // Status filter
      if (this.statusFilter) {
        filtered = filtered.filter(r => r.status === this.statusFilter);
      }
      
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(r => 
          r.request_type.toLowerCase().includes(query) ||
          (r.description && r.description.toLowerCase().includes(query))
        );
      }
      
      return filtered;
    }
  },

  methods: {
    toggleForm() {
      if (this.isMobile) {
        this.formVisible = !this.formVisible;
      }
    },
    filterByStatus(status) {
      this.statusFilter = this.statusFilter === status ? '' : status;
    },
    truncateText(text, length) {
      if (!text) return '—';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },

    getStatusClass(status) {
      const s = (status || '').toLowerCase();
      if (s === 'approved') return 'approved';
      if (s === 'rejected') return 'rejected';
      if (s === 'completed') return 'completed';
      return 'pending';
    },

    getStatusIcon(status) {
      const s = (status || '').toLowerCase();
      if (s === 'approved') return 'fas fa-check-circle';
      if (s === 'rejected') return 'fas fa-times-circle';
      if (s === 'completed') return 'fas fa-check-double';
      return 'fas fa-clock';
    },

    fetchStats() {
      axios.get('/api/requests/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => {
        const counts = { Pending: 0, Approved: 0, Rejected: 0, Completed: 0 }
        res.data.forEach(i => {
          if (counts[i.status] !== undefined) counts[i.status] = i.total
        })

        if (this.chart) this.chart.destroy()

        this.chart = new Chart(this.$refs.statusChart, {
          type: 'doughnut',
          data: {
            labels: Object.keys(counts),
            datasets: [{
              data: Object.values(counts),
              backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#3b82f6'],
              borderWidth: 0,
              hoverOffset: 10
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '60%',
            animation: { animateScale: true, animateRotate: true },
            plugins: {
              legend: { 
                position: 'bottom', 
                labels: { 
                  usePointStyle: true, 
                  boxWidth: 10,
                  padding: 20
                } 
              },
              tooltip: { backgroundColor: '#1a1a2e', titleColor: '#fff', bodyColor: '#fff' }
            }
          }
        })
      }).catch(err => console.error('Stats error:', err))
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    },

    async submitRequest() {
      if (!this.form.request_type || !this.form.description) {
        toastWarning('Please fill all fields')
        return
      }

      this.isSubmitting = true

      const url = this.editingId
        ? `/api/requests/${this.editingId}`
        : '/api/requests'
      const method = this.editingId ? 'put' : 'post'

      try {
        await axios({
          method,
          url,
          data: this.form,
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })

        const successMsg = this.editingId ? 'Request updated successfully!' : 'Request submitted successfully!'
        this.form.request_type = ''
        this.form.description = ''
        this.editingId = null
        await this.fetchRequests()
        await this.fetchStats()
        toastSuccess(successMsg)
        if (this.isMobile) {
          this.formVisible = false
        }
      } catch (error) {
        console.error('Submit error:', error)
        toastError('Failed to save request')
      } finally {
        this.isSubmitting = false
      }
    },

    async fetchRequests() {
      try {
        const res = await axios.get('/api/requests/my', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.requests = res.data
        this.updateChart()
      } catch (error) {
        console.error('Fetch requests error:', error)
        toastError('No requests found for your account')
      }
    },

    editRequest(request) {
      this.editingId = request.id
      this.form.request_type = request.request_type
      this.form.description = request.description
      if (this.isMobile) {
        this.formVisible = true
        this.searchQuery = ''
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    async deleteRequest(id) {
      if (!confirm('Are you sure you want to delete this request?')) return

      try {
        await axios.delete(`/api/requests/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        await this.fetchRequests()
        await this.fetchStats()
        toastSuccess('Request deleted successfully')
      } catch (error) {
        console.error('Delete error:', error)
        toastError('Failed to delete request')
      }
    },

    formatDate(date) {
      if (!date) return '—'
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },

    updateChart() {
      const counts = { Pending: 0, Approved: 0, Rejected: 0, Completed: 0 }
      this.requests.forEach(r => {
        if (counts[r.status] !== undefined) counts[r.status]++
      })

      if (this.chart) this.chart.destroy()

      this.chart = new Chart(this.$refs.statusChart, {
        type: 'doughnut',
        data: {
          labels: ['Pending', 'Approved', 'Rejected', 'Completed'],
          datasets: [{
            data: [counts.Pending, counts.Approved, counts.Rejected, counts.Completed],
            backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#3b82f6'],
            borderWidth: 0,
            hoverOffset: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '60%',
          animation: { animateScale: true, animateRotate: true },
          plugins: {
            legend: { 
              position: 'bottom', 
              labels: { 
                usePointStyle: true, 
                boxWidth: 10,
                padding: 20
              } 
            },
            tooltip: { backgroundColor: '#1a1a2e', titleColor: '#fff', bodyColor: '#fff' }
          }
        }
      })
    }
  },

  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    this.fetchRequests()
    this.fetchStats()
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    }
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
    if (this.chart) this.chart.destroy()
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

.content {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-top: 0;
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
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-card:active {
  transform: scale(0.97);
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

/* Card Premium */
.card-premium {
  background: white;
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.card-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.card-header-premium {
  cursor: pointer;
}

.section-title-modern {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-weight: 600;
  color: #1a1a2e;
  width: 100%;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title-modern i {
  color: var(--primary-color);
}

.form-toggle {
  transition: transform 0.3s ease;
  font-size: 14px;
  color: #9ca3af;
}

.form-toggle.rotated {
  transform: rotate(180deg);
}

.record-count-mobile {
  background: var(--primary);
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 4px;
}

.table-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

/* Form Section */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 0.3s ease;
}

.form-section.form-hidden {
  display: none;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field.full-width {
  grid-column: span 2;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-field label i {
  color: var(--primary-color);
}

.field-wrapper {
  position: relative;
}

.field-wrapper .field-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
}

.field-wrapper textarea + .field-icon {
  top: 18px;
  transform: none;
}

.field-wrapper input,
.field-wrapper textarea {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.field-wrapper textarea {
  padding-top: 12px;
  resize: vertical;
}

.field-wrapper input:focus,
.field-wrapper textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.char-counter {
  font-size: 11px;
  text-align: right;
  color: #6b7280;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn-submit-premium {
  padding: 10px 24px;
  background: var(--primary);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-submit-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-submit-premium:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Chart Container */
.chart-container {
  max-width: 300px;
  margin: 0 auto;
  position: relative;
}

/* Search Bar - Mobile */
.search-bar-mobile {
  display: none;
  margin-bottom: 16px;
  padding: 0 4px;
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

/* Table Styles */
.table-wrapper-premium {
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
  padding: 14px;
  font-weight: 600;
  font-size: 13px;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.request-table-premium td {
  padding: 14px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.request-row {
  transition: all 0.3s ease;
}

.request-row:hover {
  background: #fafbfc;
}

/* Type Cell */
.type-cell {
  min-width: 120px;
}

.request-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #e0e7ff;
  color: var(--primary-color);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
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
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}

.date-cell i {
  margin-right: 6px;
  font-size: 11px;
}

/* Status Badge */
.status-badge-premium {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
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

.status-badge-premium.completed {
  background: #e0e7ff;
  color: #4338ca;
}

/* Action Group */
.action-group {
  display: flex;
  gap: 8px;
}

.action-icon {
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

.action-icon.edit {
  background: #e0e7ff;
  color: var(--primary-color);
}

.action-icon.edit:hover {
  background: #c7d2fe;
  transform: translateY(-2px);
}

.action-icon.delete {
  background: #fee2e2;
  color: var(--danger);
}

.action-icon.delete:hover {
  background: #fecaca;
  transform: translateY(-2px);
}

/* Mobile Cards */
.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.request-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.card-type {
  flex: 1;
}

.request-type-badge-mobile {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #e0e7ff;
  color: var(--primary-color);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn-mobile {
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

.action-btn-mobile.edit {
  background: #e0e7ff;
  color: var(--primary-color);
}

.action-btn-mobile.edit:active {
  transform: scale(0.9);
}

.action-btn-mobile.delete {
  background: #fee2e2;
  color: var(--danger);
}

.action-btn-mobile.delete:active {
  transform: scale(0.9);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.card-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 50px;
}

.card-value {
  font-size: 13px;
  color: var(--dark);
  text-align: right;
}

.description-text {
  max-width: 60%;
  word-break: break-word;
  text-align: right;
}

.status-badge-mobile {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.status-badge-mobile.approved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge-mobile.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge-mobile.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge-mobile.completed {
  background: #e0e7ff;
  color: #4338ca;
}

/* Empty States */
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

.empty-state-mobile {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-state-mobile i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state-mobile h4 {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 6px;
}

.empty-state-mobile p {
  font-size: 13px;
}

/* Responsive */
@media (max-width: 1024px) {
  .description-cell {
    max-width: 150px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 12px;
  }

  .content {
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
    padding: 12px;
    flex-direction: column;
    text-align: center;
    gap: 6px;
  }

  .stat-card i {
    font-size: 22px;
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-label {
    font-size: 10px;
  }

  .card-premium {
    padding: 16px;
    border-radius: 20px;
  }

  .card-header-premium {
    margin-bottom: 12px;
  }

  .section-title-modern {
    font-size: 14px;
  }

  .form-section.form-hidden {
    display: none;
  }

  .field-wrapper input,
  .field-wrapper textarea {
    font-size: 16px;
    padding: 10px 12px 10px 36px;
  }

  .form-actions {
    justify-content: stretch;
  }

  .btn-submit-premium {
    width: 100%;
    justify-content: center;
  }

  .search-bar-mobile {
    display: block;
  }

  .table-wrapper-premium {
    display: none;
  }

  .mobile-cards {
    display: flex;
  }

  .table-info {
    display: none;
  }

  .chart-container {
    max-width: 250px;
  }

  .request-card {
    padding: 14px;
  }

  .card-row {
    flex-wrap: wrap;
  }

  .description-text {
    max-width: 100%;
    text-align: left;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }

  .content {
    padding: 12px;
    border-radius: 16px;
  }

  .stats-bar {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .stat-card {
    padding: 10px;
  }

  .stat-card i {
    font-size: 18px;
  }

  .stat-value {
    font-size: 17px;
  }

  .mobile-title {
    font-size: 16px;
  }

  .mobile-stats-badge {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .card-premium {
    padding: 12px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .card-actions {
    align-self: flex-end;
  }

  .card-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .card-value {
    text-align: left;
    width: 100%;
  }

  .description-text {
    max-width: 100%;
    text-align: left;
  }

  .field-wrapper input,
  .field-wrapper textarea {
    font-size: 15px;
    padding: 8px 10px 8px 34px;
  }

  .search-input-mobile {
    font-size: 15px;
    padding: 8px 10px 8px 34px;
  }

  .chart-container {
    max-width: 200px;
  }

  .empty-state-mobile i {
    font-size: 40px;
  }

  .empty-state-mobile h4 {
    font-size: 15px;
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