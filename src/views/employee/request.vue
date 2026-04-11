<template>
  <div class="layout">

    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content">
        <div class="content-header-modern">
          <div class="header-left">
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

        <!-- Stats Bar -->
        <div class="stats-bar">
          <div class="stat-card pending">
            <i class="fas fa-clock"></i>
            <div class="stat-info">
              <span class="stat-value">{{ statusCounts.Pending }}</span>
              <span class="stat-label">Pending</span>
            </div>
          </div>
          <div class="stat-card approved">
            <i class="fas fa-check-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ statusCounts.Approved }}</span>
              <span class="stat-label">Approved</span>
            </div>
          </div>
          <div class="stat-card rejected">
            <i class="fas fa-times-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ statusCounts.Rejected }}</span>
              <span class="stat-label">Rejected</span>
            </div>
          </div>
          <div class="stat-card completed">
            <i class="fas fa-check-double"></i>
            <div class="stat-info">
              <span class="stat-value">{{ statusCounts.Completed }}</span>
              <span class="stat-label">Completed</span>
            </div>
          </div>
        </div>

        <!-- Submit Request Card -->
        <div class="card-premium">
          <div class="card-header-premium">
            <div class="section-title-modern">
              <i class="fas fa-pen-alt"></i>
              <span>{{ editingId ? 'Edit Request' : 'Submit New Request' }}</span>
            </div>
          </div>

          <div class="form-section">
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
                  <i class="fas fa-paper-plane"></i> {{ editingId ? 'Update Request' : 'Submit Request' }}
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
              <span>Request Status Overview</span>
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
              <i class="fas fa-list-ul"></i>
              <span>My Requests</span>
            </div>
            <div class="table-info">
              <i class="fas fa-file-alt"></i>
              <span>{{ requests.length }} records</span>
            </div>
          </div>

          <div class="table-wrapper-premium">
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
                <tr v-for="r in requests" :key="r.id" class="request-row">
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

                <!-- Empty State -->
                <tr v-if="requests.length === 0" class="empty-row">
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
    }
  },

  methods: {
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
              legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 10 } },
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

        this.form.request_type = ''
        this.form.description = ''
        this.editingId = null
        await this.fetchRequests()
        await this.fetchStats()
        toastSuccess(this.editingId ? 'Request updated successfully!' : 'Request submitted successfully!')
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
            legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 10 } },
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
  margin-top: 0;
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

/* Form Section */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  /* background: var(--primary-color); */
  color: rgb(17, 1, 1);
  transform: translateY(-2px);
}

.action-icon.delete {
  background: #fee2e2;
  color: var(--danger);
}

.action-icon.delete:hover {
  /* background: var(--danger); */
  color: rgb(13, 1, 1);
  transform: translateY(-2px);
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

  .request-table-premium {
    min-width: 600px;
  }

  .description-cell {
    max-width: 120px;
  }

  .action-group {
    flex-direction: column;
  }

  .action-icon {
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-submit-premium {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .stats-bar {
    grid-template-columns: 1fr;
  }
}
</style>