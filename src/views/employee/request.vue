<template>
  <div class="layout">
    <div class="main-content">
      <Sidebar />

      <div class="request-desk-container">
        <!-- Hero Header -->
        <header class="desk-hero">
          <div class="hero-content">
            <div class="hero-title-group">
              <div class="hero-icon-badge">
                <i class="fas fa-ticket-alt"></i>
              </div>
              <div>
                <div class="hero-badge">INTERNAL SUPPORT & TICKETING</div>
                <h1 class="hero-title">Employee Request Desk</h1>
                <p class="hero-subtitle">Submit, track, and manage administrative, HR, asset, and IT assistance requests.</p>
              </div>
            </div>

            <div class="hero-actions">
              <button class="btn-hero-secondary" @click="fetchData" :disabled="loading" title="Refresh List">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                <span class="desktop-only">Refresh</span>
              </button>
              <button class="btn-hero-primary" @click="openCreateForm">
                <i class="fas fa-plus-circle"></i>
                <span>{{ editingId ? 'Edit Mode' : 'New Request' }}</span>
              </button>
            </div>
          </div>

          <!-- Status KPI Metric Cards -->
          <div class="stats-grid">
            <div 
              class="stat-pill total" 
              :class="{ active: statusFilter === '' || statusFilter === 'all' }"
              @click="filterByStatus('all')"
            >
              <div class="stat-pill-icon"><i class="fas fa-clipboard-list"></i></div>
              <div class="stat-pill-content">
                <span class="stat-num">{{ requests.length }}</span>
                <span class="stat-txt">Total Requests</span>
              </div>
            </div>

            <div 
              class="stat-pill pending" 
              :class="{ active: statusFilter === 'Pending' }"
              @click="filterByStatus('Pending')"
            >
              <div class="stat-pill-icon"><i class="fas fa-hourglass-half"></i></div>
              <div class="stat-pill-content">
                <span class="stat-num">{{ statusCounts.Pending }}</span>
                <span class="stat-txt">Pending</span>
              </div>
            </div>

            <div 
              class="stat-pill approved" 
              :class="{ active: statusFilter === 'Approved' }"
              @click="filterByStatus('Approved')"
            >
              <div class="stat-pill-icon"><i class="fas fa-check-circle"></i></div>
              <div class="stat-pill-content">
                <span class="stat-num">{{ statusCounts.Approved }}</span>
                <span class="stat-txt">Approved</span>
              </div>
            </div>

            <div 
              class="stat-pill completed" 
              :class="{ active: statusFilter === 'Completed' }"
              @click="filterByStatus('Completed')"
            >
              <div class="stat-pill-icon"><i class="fas fa-check-double"></i></div>
              <div class="stat-pill-content">
                <span class="stat-num">{{ statusCounts.Completed }}</span>
                <span class="stat-txt">Completed</span>
              </div>
            </div>

            <div 
              class="stat-pill rejected" 
              :class="{ active: statusFilter === 'Rejected' }"
              @click="filterByStatus('Rejected')"
            >
              <div class="stat-pill-icon"><i class="fas fa-times-circle"></i></div>
              <div class="stat-pill-content">
                <span class="stat-num">{{ statusCounts.Rejected }}</span>
                <span class="stat-txt">Rejected</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Main Form & Overview Section Grid -->
        <div class="form-and-chart-grid">
          <!-- Request Form Card -->
          <section class="form-section-card" ref="formSection">
            <div class="form-section-header" @click="formVisible = !formVisible">
              <div class="header-tagline">
                <div class="tag-icon">
                  <i :class="editingId ? 'fas fa-pen-to-square' : 'fas fa-paper-plane'"></i>
                </div>
                <div>
                  <h3 class="tag-title">{{ editingId ? 'Edit Your Request' : 'Submit New Request' }}</h3>
                  <p class="tag-desc">{{ editingId ? 'Update details of your existing request ticket.' : 'Select a category and explain what you require.' }}</p>
                </div>
              </div>
              <button type="button" class="btn-toggle-form" :class="{ rotated: formVisible }">
                <i class="fas fa-chevron-down"></i>
              </button>
            </div>

            <transition name="expand">
              <div v-show="formVisible" class="form-body-wrapper">
                <form @submit.prevent="submitRequest" class="custom-ticket-form">
                  
                  <!-- Request Type -->
                  <div class="input-block">
                    <label class="input-label">
                      <i class="fas fa-tag label-icon"></i>
                      <span>Request Category / Type</span>
                      <span class="req-star">*</span>
                    </label>

                    <div class="input-with-icon">
                      <i class="fas fa-folder-open field-lead-icon"></i>
                      <input
                        type="text"
                        v-model="form.request_type"
                        placeholder="e.g., Work From Home, IT Support, Asset, HR Query..."
                        class="text-input"
                        required
                      />
                    </div>

                    <!-- Suggestion Quick-Pills -->
                    <div class="quick-types-row">
                      <span class="quick-hint">Quick Select:</span>
                      <button 
                        type="button" 
                        v-for="type in quickTypes" 
                        :key="type"
                        class="quick-type-chip"
                        :class="{ selected: form.request_type === type }"
                        @click="form.request_type = type"
                      >
                        {{ type }}
                      </button>
                    </div>
                  </div>

                  <!-- Description -->
                  <div class="input-block">
                    <label class="input-label">
                      <i class="fas fa-align-left label-icon"></i>
                      <span>Detailed Request Description</span>
                      <span class="req-star">*</span>
                    </label>

                    <div class="input-with-icon textarea-icon-wrap">
                      <i class="fas fa-comment-dots field-lead-icon textarea-icon"></i>
                      <textarea
                        v-model="form.description"
                        rows="4"
                        maxlength="250"
                        placeholder="Provide all relevant details, reason, date requirements, or assets needed..."
                        class="text-input textarea-field"
                        required
                      ></textarea>
                    </div>

                    <div class="input-footer">
                      <span class="hint-text"><i class="fas fa-shield-alt"></i> Submitted securely to management & HR</span>
                      <span class="char-count" :class="{ 'char-limit': form.description.length >= 250 }">
                        {{ form.description.length }}/250
                      </span>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="form-action-row">
                    <button 
                      type="button" 
                      class="btn-cancel" 
                      @click="cancelEdit"
                      v-if="editingId"
                    >
                      <i class="fas fa-times"></i> Cancel Edit
                    </button>
                    <button 
                      type="button" 
                      class="btn-reset" 
                      @click="resetForm" 
                      :disabled="isSubmitting"
                      v-else
                    >
                      <i class="fas fa-undo"></i> Clear
                    </button>
                    <button type="submit" class="btn-submit-gradient" :disabled="isSubmitting">
                      <span v-if="isSubmitting" class="flex-center gap-8">
                        <i class="fas fa-circle-notch fa-spin"></i> Processing...
                      </span>
                      <span v-else class="flex-center gap-8">
                        <i :class="editingId ? 'fas fa-save' : 'fas fa-paper-plane'"></i>
                        {{ editingId ? 'Update Request' : 'Submit Request Ticket' }}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </transition>
          </section>

          <!-- Status Analytics Chart Card -->
          <section class="chart-section-card">
            <div class="chart-header">
              <div class="chart-title-wrap">
                <i class="fas fa-chart-pie chart-icon"></i>
                <div>
                  <h4>Status Overview</h4>
                  <p>Distribution of your ticket statuses</p>
                </div>
              </div>
            </div>

            <div class="chart-content-area">
              <div v-if="requests.length === 0" class="chart-empty">
                <i class="fas fa-inbox"></i>
                <p>No requests recorded yet</p>
              </div>
              <div v-show="requests.length > 0" class="chart-canvas-wrap">
                <canvas ref="statusChart"></canvas>
              </div>
            </div>
          </section>
        </div>

        <!-- Requests Directory Card -->
        <section class="listing-section-card">
          <!-- Filter / Search Toolbar -->
          <div class="listing-toolbar">
            <div class="toolbar-title-group">
              <div class="toolbar-icon"><i class="fas fa-list-check"></i></div>
              <div>
                <h3 class="toolbar-title">My Request Tickets</h3>
                <p class="toolbar-desc">Showing {{ filteredRequests.length }} of {{ requests.length }} total tickets</p>
              </div>
            </div>

            <div class="toolbar-controls">
              <!-- Search box -->
              <div class="search-input-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Search by type or description..." 
                  class="search-field"
                />
                <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear-btn">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <!-- Status filter pills -->
              <div class="filter-pills-row">
                <button 
                  class="filter-pill" 
                  :class="{ active: statusFilter === '' || statusFilter === 'all' }"
                  @click="filterByStatus('all')"
                >
                  All
                </button>
                <button 
                  class="filter-pill pill-pending" 
                  :class="{ active: statusFilter === 'Pending' }"
                  @click="filterByStatus('Pending')"
                >
                  <span class="dot pending-dot"></span> Pending
                </button>
                <button 
                  class="filter-pill pill-approved" 
                  :class="{ active: statusFilter === 'Approved' }"
                  @click="filterByStatus('Approved')"
                >
                  <span class="dot approved-dot"></span> Approved
                </button>
                <button 
                  class="filter-pill pill-completed" 
                  :class="{ active: statusFilter === 'Completed' }"
                  @click="filterByStatus('Completed')"
                >
                  <span class="dot completed-dot"></span> Completed
                </button>
                <button 
                  class="filter-pill pill-rejected" 
                  :class="{ active: statusFilter === 'Rejected' }"
                  @click="filterByStatus('Rejected')"
                >
                  <span class="dot rejected-dot"></span> Rejected
                </button>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="state-container loading-state">
            <i class="fas fa-circle-notch fa-spin state-icon"></i>
            <h4>Loading your requests...</h4>
            <p>Fetching tickets from server</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredRequests.length === 0" class="state-container empty-state">
            <div class="empty-icon-wrap">
              <i class="fas fa-ticket-alt"></i>
            </div>
            <h4>No Request Tickets Found</h4>
            <p v-if="searchQuery || statusFilter">
              No tickets match your filter criteria. Try clearing search or status filters.
            </p>
            <p v-else>
              You haven't submitted any requests yet. Use the form above to submit your first ticket!
            </p>
            <button v-if="searchQuery || statusFilter" class="btn-clear-filters" @click="clearFilters">
              <i class="fas fa-filter-circle-xmark"></i> Reset Filters
            </button>
          </div>

          <!-- Mobile Cards View -->
          <div v-else-if="isMobile" class="mobile-feed">
            <div 
              v-for="(r, index) in filteredRequests" 
              :key="r.id || index" 
              class="mobile-req-card"
            >
              <div class="mobile-card-top">
                <div class="req-badge-group">
                  <span class="req-type-pill">
                    <i class="fas fa-tag"></i> {{ r.request_type }}
                  </span>
                  <span class="req-date"><i class="far fa-calendar-alt"></i> {{ formatDate(r.created_at) }}</span>
                </div>
                
                <div class="req-status-group">
                  <span :class="['status-chip', getStatusClass(r.status)]">
                    <i :class="getStatusIcon(r.status)"></i> {{ r.status }}
                  </span>
                  <div class="mobile-actions">
                    <button class="btn-m-action edit" @click="editRequest(r)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-m-action delete" @click="deleteRequest(r.id)" title="Delete">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div class="mobile-card-body">
                <span class="body-label">Description:</span>
                <p class="body-desc">{{ r.description || '—' }}</p>
              </div>
            </div>
          </div>

          <!-- Desktop Modern Table View -->
          <div v-else class="desktop-table-container">
            <table class="modern-desk-table">
              <thead>
                <tr>
                  <th class="th-num">#</th>
                  <th class="th-type">Request Type</th>
                  <th class="th-desc">Description</th>
                  <th class="th-status">Status</th>
                  <th class="th-date">Date Submitted</th>
                  <th class="th-action">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, index) in filteredRequests" :key="r.id || index" class="table-row-hover">
                  <td class="td-num">
                    <span class="seq-badge">{{ filteredRequests.length - index }}</span>
                  </td>
                  <td class="td-type">
                    <div class="type-badge-container">
                      <i class="fas fa-tag type-icon"></i>
                      <span class="type-text">{{ r.request_type }}</span>
                    </div>
                  </td>
                  <td class="td-desc">
                    <div class="desc-cell" :title="r.description">
                      {{ truncateText(r.description, 75) }}
                    </div>
                  </td>
                  <td class="td-status">
                    <span :class="['status-pill-badge', getStatusClass(r.status)]">
                      <i :class="getStatusIcon(r.status)"></i>
                      {{ r.status }}
                    </span>
                  </td>
                  <td class="td-date">
                    <div class="date-cell-wrap">
                      <i class="far fa-calendar-alt date-icon"></i>
                      <span>{{ formatDate(r.created_at) }}</span>
                    </div>
                  </td>
                  <td class="td-action">
                    <div class="action-buttons-group">
                      <button class="btn-tbl-action edit" @click="editRequest(r)" title="Edit Request">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn-tbl-action delete" @click="deleteRequest(r.id)" title="Delete Request">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import Chart from 'chart.js/auto'
import axios from 'axios'
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

export default {
  name: "RequestDesk",
  components: {
    Sidebar
  },
  data() {
    return {
      loading: false,
      isSubmitting: false,
      editingId: null,
      isMobile: false,
      isSidebarVisible: true,
      formVisible: true,
      searchQuery: '',
      statusFilter: '',
      quickTypes: [
        'Work From Office',
        'IT & Software Support',
        'Asset / Equipment',
        'HR Query',
        'Leave / Attendance',
        'Expense Reimbursement'
      ],
      form: {
        request_type: '',
        description: ''
      },
      requests: [],
      chartInstance: null
    }
  },
  computed: {
    statusCounts() {
      const counts = { Pending: 0, Approved: 0, Rejected: 0, Completed: 0 };
      this.requests.forEach(r => {
        const status = r.status || 'Pending';
        if (counts[status] !== undefined) {
          counts[status]++;
        } else {
          counts.Pending++;
        }
      });
      return counts;
    },
    filteredRequests() {
      let list = this.requests;

      // Status filter
      if (this.statusFilter && this.statusFilter !== 'all') {
        list = list.filter(r => (r.status || '').toLowerCase() === this.statusFilter.toLowerCase());
      }

      // Search filter
      if (this.searchQuery && this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        list = list.filter(r => 
          (r.request_type && r.request_type.toLowerCase().includes(q)) ||
          (r.description && r.description.toLowerCase().includes(q))
        );
      }

      return list;
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.fetchData();
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/auth');
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  },
  methods: {
    openCreateForm() {
      this.formVisible = true;
      if (this.$refs.formSection) {
        this.$refs.formSection.scrollIntoView({ behavior: 'smooth' });
      }
    },
    filterByStatus(status) {
      this.statusFilter = this.statusFilter === status ? '' : status;
    },
    clearFilters() {
      this.searchQuery = '';
      this.statusFilter = '';
    },
    truncateText(text, length) {
      if (!text) return '—';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },
    getStatusClass(status) {
      const s = (status || '').toLowerCase();
      if (s === 'approved') return 'status-approved';
      if (s === 'rejected') return 'status-rejected';
      if (s === 'completed') return 'status-completed';
      return 'status-pending';
    },
    getStatusIcon(status) {
      const s = (status || '').toLowerCase();
      if (s === 'approved') return 'fas fa-check-circle';
      if (s === 'rejected') return 'fas fa-times-circle';
      if (s === 'completed') return 'fas fa-check-double';
      return 'fas fa-hourglass-half';
    },
    formatDate(date) {
      if (!date) return '—';
      try {
        return new Date(date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } catch (e) {
        return '—';
      }
    },
    resetForm() {
      this.form = {
        request_type: '',
        description: ''
      };
      this.editingId = null;
    },
    cancelEdit() {
      this.resetForm();
    },
    editRequest(request) {
      this.editingId = request.id;
      this.form.request_type = request.request_type || '';
      this.form.description = request.description || '';
      this.formVisible = true;
      this.$nextTick(() => {
        if (this.$refs.formSection) {
          this.$refs.formSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    },
    async fetchData() {
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        let res = null;
        try {
          res = await axios.get('/requests/my', { headers });
        } catch (e1) {
          res = await axios.get('/api/requests/my', { headers });
        }
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        this.requests = list;
        this.renderChart();
      } catch (error) {
        console.error('Fetch requests error:', error);
        toastError('Could not load request tickets.');
      } finally {
        this.loading = false;
      }
    },
    async submitRequest() {
      if (!this.form.request_type.trim() || !this.form.description.trim()) {
        toastWarning('Please provide both a request type and description.');
        return;
      }

      this.isSubmitting = true;
      const primaryUrl = this.editingId ? `/requests/${this.editingId}` : '/requests';
      const fallbackUrl = this.editingId ? `/api/requests/${this.editingId}` : '/api/requests';
      const method = this.editingId ? 'put' : 'post';
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        request_type: this.form.request_type.trim(),
        description: this.form.description.trim()
      };

      try {
        try {
          await axios({ method, url: primaryUrl, data: payload, headers });
        } catch (e1) {
          await axios({ method, url: fallbackUrl, data: payload, headers });
        }

        const successMsg = this.editingId ? 'Request ticket updated successfully!' : 'Request ticket submitted successfully!';
        toastSuccess(successMsg);
        this.resetForm();
        await this.fetchData();
      } catch (error) {
        console.error('Submit error:', error);
        const msg = error.response?.data?.message || 'Failed to process request ticket. Please try again.';
        toastError(msg);
      } finally {
        this.isSubmitting = false;
      }
    },
    async deleteRequest(id) {
      if (!confirm('Are you sure you want to delete this request ticket?')) return;
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      try {
        try {
          await axios.delete(`/requests/${id}`, { headers });
        } catch (e1) {
          try {
            await axios.post(`/requests/${id}/delete`, {}, { headers });
          } catch (e2) {
            await axios.delete(`/api/requests/${id}`, { headers });
          }
        }
        toastSuccess('Request deleted successfully.');
        await this.fetchData();
      } catch (error) {
        console.error('Delete error:', error);
        toastError('Failed to delete request.');
      }
    },
    renderChart() {
      this.$nextTick(() => {
        const canvas = this.$refs.statusChart;
        if (!canvas) return;

        const counts = this.statusCounts;

        if (this.chartInstance) {
          this.chartInstance.destroy();
          this.chartInstance = null;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        this.chartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Pending', 'Approved', 'Completed', 'Rejected'],
            datasets: [{
              data: [counts.Pending, counts.Approved, counts.Completed, counts.Rejected],
              backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444'],
              borderWidth: 2,
              borderColor: '#ffffff',
              hoverOffset: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  boxWidth: 8,
                  padding: 14,
                  font: {
                    family: "'Plus Jakarta Sans', sans-serif",
                    size: 11,
                    weight: '600'
                  }
                }
              },
              tooltip: {
                backgroundColor: '#0f172a',
                padding: 10,
                cornerRadius: 8,
                titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: '700' },
                bodyFont: { family: "'Plus Jakarta Sans', sans-serif" }
              }
            }
          }
        });
      });
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 860;
      this.isSidebarVisible = !this.isMobile;
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
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

.request-desk-container {
  flex: 1;
  padding: 24px 32px;
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

.flex-center {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.gap-8 {
  gap: 8px;
}

/* ========================================================
   HERO HEADER
   ======================================================== */
.desk-hero {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #334155 100%);
  border-radius: 24px;
  padding: 30px;
  color: #ffffff;
  box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.45);
  position: relative;
  overflow: hidden;
}

.desk-hero::before {
  content: '';
  position: absolute;
  top: -60px;
  right: -60px;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
  pointer-events: none;
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.hero-title-group {
  display: flex;
  align-items: center;
  gap: 18px;
}

.hero-icon-badge {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #38bdf8;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.hero-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #38bdf8;
  margin-bottom: 4px;
}

.hero-title {
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 13.5px;
  color: #cbd5e1;
  margin-top: 6px;
  max-width: 580px;
  line-height: 1.45;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.btn-hero-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 11px 18px;
  font-size: 13.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
}

.btn-hero-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.45);
}

.btn-hero-secondary {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 11px 16px;
  font-size: 13.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-hero-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  position: relative;
  z-index: 1;
}

.stat-pill {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  backdrop-filter: blur(8px);
}

.stat-pill:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.stat-pill.active {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.stat-pill-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}

.stat-pill.total .stat-pill-icon { background: rgba(148, 163, 184, 0.25); color: #cbd5e1; }
.stat-pill.pending .stat-pill-icon { background: rgba(245, 158, 11, 0.25); color: #fde68a; }
.stat-pill.approved .stat-pill-icon { background: rgba(16, 185, 129, 0.25); color: #6ee7b7; }
.stat-pill.completed .stat-pill-icon { background: rgba(59, 130, 246, 0.25); color: #93c5fd; }
.stat-pill.rejected .stat-pill-icon { background: rgba(239, 68, 68, 0.25); color: #fca5a5; }

.stat-pill-content {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 17px;
  font-weight: 800;
  line-height: 1.1;
  color: #ffffff;
}

.stat-txt {
  font-size: 11px;
  color: #cbd5e1;
  font-weight: 500;
}

/* ========================================================
   FORM & ANALYTICS SPLIT SECTION
   ======================================================== */
.form-and-chart-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  align-items: start;
}

.form-section-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease;
}

.form-section-header {
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  user-select: none;
}

.form-section-header:hover {
  background: #f8fafc;
}

.header-tagline {
  display: flex;
  align-items: center;
  gap: 14px;
}

.tag-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0284c7, #38bdf8);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  box-shadow: 0 4px 10px rgba(2, 132, 199, 0.3);
  flex-shrink: 0;
}

.tag-title {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.tag-desc {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.btn-toggle-form {
  background: #f1f5f9;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-toggle-form.rotated {
  transform: rotate(180deg);
  background: #e0f2fe;
  color: #0284c7;
}

.form-body-wrapper {
  padding: 24px;
  background: #fcfdfe;
}

.custom-ticket-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.input-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
}

.label-icon {
  color: #0284c7;
}

.req-star {
  color: #ef4444;
}

.input-with-icon {
  position: relative;
  width: 100%;
}

.field-lead-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 14px;
}

.textarea-icon-wrap .textarea-icon {
  top: 16px;
  transform: none;
}

.text-input {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 14px 11px 40px;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  font-size: 13.5px;
  font-family: inherit;
  color: #1e293b;
  background: #ffffff;
  transition: all 0.2s ease;
}

.text-input:focus {
  outline: none;
  border-color: #0284c7;
  box-shadow: 0 0 0 3.5px rgba(2, 132, 199, 0.15);
}

.textarea-field {
  resize: vertical;
  min-height: 95px;
  line-height: 1.45;
}

.quick-types-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding-top: 4px;
}

.quick-hint {
  font-size: 11.5px;
  font-weight: 700;
  color: #64748b;
}

.quick-type-chip {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 11.5px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.quick-type-chip:hover {
  background: #e0f2fe;
  color: #0284c7;
  border-color: #bae6fd;
}

.quick-type-chip.selected {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11.5px;
  color: #64748b;
}

.char-count {
  font-weight: 700;
  color: #94a3b8;
}

.char-count.char-limit {
  color: #ef4444;
}

.form-action-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding-top: 6px;
}

.btn-reset, .btn-cancel {
  background: #f1f5f9;
  border: none;
  border-radius: 12px;
  padding: 11px 18px;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #fee2e2;
  color: #dc2626;
}

.btn-reset:hover { background: #e2e8f0; color: #1e293b; }
.btn-cancel:hover { background: #fecaca; }

.btn-submit-gradient {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 11px 26px;
  font-size: 13.5px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 18px rgba(2, 132, 199, 0.35);
  transition: all 0.25s ease;
}

.btn-submit-gradient:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(2, 132, 199, 0.45);
}

.btn-submit-gradient:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* Chart Card */
.chart-section-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.06);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.chart-header {
  margin-bottom: 12px;
}

.chart-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chart-icon {
  color: #0284c7;
  font-size: 18px;
}

.chart-title-wrap h4 {
  font-size: 14.5px;
  font-weight: 800;
  color: #0f172a;
}

.chart-title-wrap p {
  font-size: 11.5px;
  color: #64748b;
}

.chart-content-area {
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.chart-canvas-wrap {
  width: 100%;
  height: 100%;
}

.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #94a3b8;
  gap: 8px;
}

.chart-empty i { font-size: 32px; }

/* ========================================================
   REQUESTS DIRECTORY / LISTING
   ======================================================== */
.listing-section-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.listing-toolbar {
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.toolbar-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #e0f2fe;
  color: #0284c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.toolbar-title {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.toolbar-desc {
  font-size: 12px;
  color: #64748b;
}

.toolbar-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  min-width: 260px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 13px;
}

.search-field {
  width: 100%;
  padding: 9px 32px 9px 34px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13px;
  font-family: inherit;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.search-field:focus {
  outline: none;
  background: #ffffff;
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12);
}

.search-clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 12px;
}

.filter-pills-row {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
}

.filter-pill {
  border: none;
  background: transparent;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.filter-pill.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

.pending-dot { background: #f59e0b; }
.approved-dot { background: #10b981; }
.completed-dot { background: #3b82f6; }
.rejected-dot { background: #ef4444; }

/* States */
.state-container {
  padding: 60px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.state-icon {
  font-size: 36px;
  color: #0284c7;
  margin-bottom: 14px;
}

.empty-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin-bottom: 14px;
}

.empty-state h4 {
  font-size: 16px;
  font-weight: 800;
  color: #334155;
  margin-bottom: 4px;
}

.empty-state p {
  font-size: 13px;
  color: #64748b;
  max-width: 400px;
}

.btn-clear-filters {
  margin-top: 14px;
  background: #e0f2fe;
  color: #0284c7;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* ========================================================
   DESKTOP TABLE
   ======================================================== */
.desktop-table-container {
  width: 100%;
  overflow-x: auto;
}

.modern-desk-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
}

.modern-desk-table thead tr {
  background: #f8fafc;
}

.modern-desk-table th {
  padding: 14px 18px;
  font-size: 11.5px;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1.5px solid #e2e8f0;
}

.th-num { width: 50px; text-align: center; }
.th-type { width: 22%; }
.th-desc { width: 38%; }
.th-status { width: 120px; text-align: center; }
.th-date { width: 140px; }
.th-action { width: 90px; text-align: center; }

.table-row-hover {
  transition: background 0.2s ease;
}

.table-row-hover:hover {
  background: #f8fafc;
}

.modern-desk-table td {
  padding: 16px 18px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-size: 13px;
}

.seq-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 6px;
}

.type-badge-container {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #0f172a;
}

.type-icon {
  color: #0284c7;
  font-size: 12px;
}

.desc-cell {
  line-height: 1.45;
  color: #334155;
  word-break: break-word;
}

.status-pill-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.status-approved { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.status-pending { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
.status-completed { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
.status-rejected { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }

.date-cell-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 12.5px;
  font-weight: 600;
}

.date-icon {
  color: #94a3b8;
}

.action-buttons-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-tbl-action {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-tbl-action.edit {
  background: #e0f2fe;
  color: #0284c7;
}

.btn-tbl-action.edit:hover {
  background: #0284c7;
  color: #ffffff;
  transform: scale(1.1);
}

.btn-tbl-action.delete {
  background: #fee2e2;
  color: #ef4444;
}

.btn-tbl-action.delete:hover {
  background: #ef4444;
  color: #ffffff;
  transform: scale(1.1);
}

/* ========================================================
   MOBILE FEED
   ======================================================== */
.mobile-feed {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mobile-req-card {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.mobile-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.req-badge-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.req-type-pill {
  font-size: 13px;
  font-weight: 800;
  color: #0284c7;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.req-date {
  font-size: 11.5px;
  color: #94a3b8;
}

.req-status-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-chip {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.mobile-actions {
  display: flex;
  gap: 4px;
}

.btn-m-action {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}

.btn-m-action.edit { background: #e0f2fe; color: #0284c7; }
.btn-m-action.delete { background: #fee2e2; color: #ef4444; }

.mobile-card-body {
  background: #f8fafc;
  border-radius: 10px;
  padding: 10px 12px;
}

.body-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 2px;
}

.body-desc {
  font-size: 12.5px;
  color: #1e293b;
  line-height: 1.4;
}

.desktop-only {
  display: inline-block;
}

/* Responsive */
@media (max-width: 1024px) {
  .request-desk-container {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .form-and-chart-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .desktop-only {
    display: none;
  }

  .hero-content {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .toolbar-controls {
    width: 100%;
    flex-direction: column;
  }

  .search-input-wrapper {
    width: 100%;
  }

  .filter-pills-row {
    width: 100%;
    justify-content: space-between;
  }
}
</style>