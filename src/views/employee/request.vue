<template>
  <div class="layout">
    <div class="main-content">
      <!-- Fixed Sidebar -->
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <!-- Main Content Area -->
      <section
        class="content"
        v-show="!isMobile || !isSidebarVisible"
        :class="{ 'expanded-content': isMobile && !isSidebarVisible }"
      >
        <!-- 📱 Mobile Top Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <i class="fas fa-ticket-alt text-teal"></i>
            <span>Request Desk</span>
          </div>
          <div class="mobile-header-actions">
            <button class="btn-mobile-add" @click="openCreateForm">
              <i class="fas fa-plus"></i>
            </button>
            <button class="btn-mobile-menu" @click="toggleSidebar" aria-label="Toggle menu">
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </div>

        <!-- 🏢 Modern Enterprise Header Banner -->
        <header class="executive-header">
          <div class="header-main">
            <div class="header-badge-row">
              <span class="portal-badge-pill">
                <span class="pulse-indicator"></span>
                <span>INTERNAL SUPPORT & TICKETING</span>
              </span>
              <span class="status-meta-pill">
                <i class="fas fa-shield-alt text-teal"></i> Self-Service Assistance Desk
              </span>
            </div>
            <div class="title-with-icon">
              <div class="header-icon-box">
                <i class="fas fa-headset"></i>
              </div>
              <div>
                <h1 class="header-title">Employee Request Desk</h1>
                <p class="header-subtitle">Submit, track, and manage administrative, HR, asset, and IT assistance tickets</p>
              </div>
            </div>
          </div>

          <div class="header-actions">
            <button class="btn-secondary-action" @click="fetchData" :disabled="loading" title="Refresh List">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              <span>Refresh</span>
            </button>
            <button class="btn-primary-action" @click="openCreateForm">
              <i class="fas fa-plus"></i>
              <span>{{ editingId ? 'Edit Mode' : 'New Request' }}</span>
            </button>
          </div>
        </header>

        <!-- 📊 KPI Metrics Grid (5 Cards) -->
        <section class="metrics-grid">
          <!-- Total Requests -->
          <div
            class="metric-card"
            :class="{ 'card-active': statusFilter === '' || statusFilter === 'all' }"
            @click="filterByStatus('all')"
          >
            <div class="metric-header">
              <span class="metric-title">Total Requests</span>
              <div class="metric-icon-wrap icon-all">
                <i class="fas fa-clipboard-list"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ requests.length }}</span>
              <span class="metric-tag tag-all">All tickets</span>
            </div>
          </div>

          <!-- Pending -->
          <div
            class="metric-card card-pending"
            :class="{ 'card-active': statusFilter === 'Pending' }"
            @click="filterByStatus('Pending')"
          >
            <div class="metric-header">
              <span class="metric-title">Pending</span>
              <div class="metric-icon-wrap icon-pending">
                <i class="fas fa-hourglass-half"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ statusCounts.Pending }}</span>
              <span class="metric-tag tag-pending">In queue</span>
            </div>
          </div>

          <!-- Approved -->
          <div
            class="metric-card card-approved"
            :class="{ 'card-active': statusFilter === 'Approved' }"
            @click="filterByStatus('Approved')"
          >
            <div class="metric-header">
              <span class="metric-title">Approved</span>
              <div class="metric-icon-wrap icon-approved">
                <i class="fas fa-check-circle"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ statusCounts.Approved }}</span>
              <span class="metric-tag tag-approved">Sanctioned</span>
            </div>
          </div>

          <!-- Completed -->
          <div
            class="metric-card card-completed"
            :class="{ 'card-active': statusFilter === 'Completed' }"
            @click="filterByStatus('Completed')"
          >
            <div class="metric-header">
              <span class="metric-title">Completed</span>
              <div class="metric-icon-wrap icon-completed">
                <i class="fas fa-check-double"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ statusCounts.Completed }}</span>
              <span class="metric-tag tag-completed">Resolved</span>
            </div>
          </div>

          <!-- Rejected -->
          <div
            class="metric-card card-rejected"
            :class="{ 'card-active': statusFilter === 'Rejected' }"
            @click="filterByStatus('Rejected')"
          >
            <div class="metric-header">
              <span class="metric-title">Rejected</span>
              <div class="metric-icon-wrap icon-rejected">
                <i class="fas fa-times-circle"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ statusCounts.Rejected }}</span>
              <span class="metric-tag tag-rejected">Declined</span>
            </div>
          </div>
        </section>

        <!-- 📝 Main Form & Status Overview 2-Column Grid -->
        <div class="desk-content-grid">
          <!-- Request Form Card -->
          <div class="form-card-container" ref="formSection" :class="{ 'form-card-editing': editingId }">
            <div class="form-card-header" @click="formVisible = !formVisible">
              <div class="fch-left">
                <div class="fch-icon-box" :class="editingId ? 'icon-amber' : 'icon-teal'">
                  <i :class="editingId ? 'fas fa-edit' : 'fas fa-paper-plane'"></i>
                </div>
                <div>
                  <h3 class="fch-title">{{ editingId ? 'Edit Support Request' : 'Submit New Request' }}</h3>
                  <span class="fch-sub">{{ editingId ? 'Update details of your existing request ticket' : 'Select a category and explain your requirement' }}</span>
                </div>
              </div>

              <div class="fch-right">
                <button type="button" class="btn-toggle-round" :class="{ rotated: formVisible }" aria-label="Toggle form">
                  <i class="fas fa-chevron-down"></i>
                </button>
              </div>
            </div>

            <transition name="expand">
              <div v-show="formVisible" class="form-body-wrapper">
                <form @submit.prevent="submitRequest" class="desk-form">
                  <!-- Category / Type -->
                  <div class="field-item">
                    <label class="field-label">
                      <span>Request Category / Type</span>
                      <span class="required">*</span>
                    </label>

                    <div class="input-with-icon">
                      <i class="fas fa-folder-open field-icon"></i>
                      <input
                        type="text"
                        v-model="form.request_type"
                        placeholder="e.g., Work From Home, IT Support, Asset, HR Query..."
                        class="custom-input"
                        required
                      />
                    </div>

                    <!-- Quick Select Suggestion Pills -->
                    <div class="quick-types-strip">
                      <span class="quick-types-label">Quick Select:</span>
                      <button
                        type="button"
                        v-for="type in quickTypes"
                        :key="type"
                        class="quick-pill"
                        :class="{ selected: form.request_type === type }"
                        @click="form.request_type = type"
                      >
                        {{ type }}
                      </button>
                    </div>
                  </div>

                  <!-- Description -->
                  <div class="field-item">
                    <div class="field-label-row">
                      <label class="field-label">
                        <span>Detailed Description</span>
                        <span class="required">*</span>
                      </label>
                      <span class="char-counter" :class="{ 'char-limit-near': form.description.length >= 240 }">
                        {{ form.description.length }} / 250
                      </span>
                    </div>

                    <div class="input-with-icon textarea-icon-wrap">
                      <i class="fas fa-comment-dots field-icon textarea-icon"></i>
                      <textarea
                        v-model="form.description"
                        rows="4"
                        maxlength="250"
                        placeholder="Provide all relevant details, reason, date requirements, or assets needed..."
                        class="custom-textarea"
                        required
                      ></textarea>
                    </div>
                  </div>

                  <!-- Footer Meta & Actions -->
                  <div class="form-actions-footer">
                    <span class="security-note">
                      <i class="fas fa-lock text-teal"></i> Submitted securely to management & HR
                    </span>

                    <div class="actions-right">
                      <button
                        type="button"
                        class="btn-form-cancel"
                        @click="cancelEdit"
                        v-if="editingId"
                      >
                        <i class="fas fa-times"></i> Cancel Edit
                      </button>
                      <button
                        type="button"
                        class="btn-form-reset"
                        @click="resetForm"
                        :disabled="isSubmitting"
                        v-else
                      >
                        <i class="fas fa-undo"></i> Clear
                      </button>

                      <button type="submit" class="btn-form-submit" :disabled="isSubmitting">
                        <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                        <i v-else :class="editingId ? 'fas fa-save' : 'fas fa-paper-plane'"></i>
                        <span>{{ isSubmitting ? 'Processing...' : (editingId ? 'Update Request' : 'Submit Request Ticket') }}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </transition>
          </div>

          <!-- Status Analytics Chart & Guidelines Card -->
          <div class="status-overview-card">
            <div class="card-header-clean">
              <div class="chc-left">
                <div class="chc-icon-box">
                  <i class="fas fa-chart-pie text-teal"></i>
                </div>
                <div>
                  <h4 class="chc-title">Status Overview</h4>
                  <span class="chc-sub">Distribution of ticket statuses</span>
                </div>
              </div>
            </div>

            <div class="chart-content-area">
              <div v-if="requests.length === 0" class="chart-empty">
                <div class="chart-empty-icon">
                  <i class="fas fa-inbox"></i>
                </div>
                <p>No request tickets submitted yet</p>
                <span class="chart-empty-sub">Your ticket status breakdown will display here</span>
              </div>

              <div v-show="requests.length > 0" class="chart-wrapper">
                <div class="canvas-box">
                  <canvas ref="statusChart"></canvas>
                </div>
                <div class="chart-mini-stats">
                  <div class="mini-stat-item">
                    <span class="ms-dot pending"></span>
                    <span class="ms-name">Pending:</span>
                    <strong class="ms-val">{{ statusCounts.Pending }}</strong>
                  </div>
                  <div class="mini-stat-item">
                    <span class="ms-dot approved"></span>
                    <span class="ms-name">Approved:</span>
                    <strong class="ms-val">{{ statusCounts.Approved }}</strong>
                  </div>
                  <div class="mini-stat-item">
                    <span class="ms-dot completed"></span>
                    <span class="ms-name">Completed:</span>
                    <strong class="ms-val">{{ statusCounts.Completed }}</strong>
                  </div>
                  <div class="mini-stat-item">
                    <span class="ms-dot rejected"></span>
                    <span class="ms-name">Rejected:</span>
                    <strong class="ms-val">{{ statusCounts.Rejected }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Support SLA Guideline -->
            <div class="desk-sla-box">
              <div class="sla-icon"><i class="fas fa-bolt text-teal"></i></div>
              <div class="sla-text">
                <strong>Standard Resolution Time:</strong> Requests are typically reviewed within 24–48 business hours by the respective department lead.
              </div>
            </div>
          </div>
        </div>

        <!-- 📋 My Request Tickets Directory Card -->
        <div class="table-card-container">
          <!-- Toolbar -->
          <div class="table-toolbar">
            <div class="toolbar-title-wrap">
              <div class="toolbar-icon-box">
                <i class="fas fa-list-check text-teal"></i>
              </div>
              <div>
                <h3 class="toolbar-heading">My Request Tickets</h3>
                <span class="toolbar-sub">
                  Showing {{ filteredRequests.length }} of {{ requests.length }} total submitted {{ requests.length === 1 ? 'ticket' : 'tickets' }}
                </span>
              </div>
            </div>

            <div class="toolbar-controls-wrap">
              <!-- Search Box -->
              <div class="search-box-wrap">
                <i class="fas fa-search search-icon"></i>
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search by category, reason, or date..."
                  class="search-input"
                />
                <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear-btn">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <!-- Status Filter Pills -->
              <div class="filter-pills-bar">
                <button
                  class="filter-pill"
                  :class="{ active: statusFilter === '' || statusFilter === 'all' }"
                  @click="filterByStatus('all')"
                >
                  All
                </button>
                <button
                  class="filter-pill"
                  :class="{ active: statusFilter === 'Pending' }"
                  @click="filterByStatus('Pending')"
                >
                  Pending
                </button>
                <button
                  class="filter-pill"
                  :class="{ active: statusFilter === 'Approved' }"
                  @click="filterByStatus('Approved')"
                >
                  Approved
                </button>
                <button
                  class="filter-pill"
                  :class="{ active: statusFilter === 'Completed' }"
                  @click="filterByStatus('Completed')"
                >
                  Completed
                </button>
                <button
                  class="filter-pill"
                  :class="{ active: statusFilter === 'Rejected' }"
                  @click="filterByStatus('Rejected')"
                >
                  Rejected
                </button>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="state-container loading-state">
            <i class="fas fa-circle-notch fa-spin state-icon text-teal"></i>
            <h4>Loading request tickets...</h4>
            <p>Fetching records from server</p>
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
              <i class="fas fa-undo"></i> Reset Filters
            </button>
          </div>

          <!-- Desktop Modern Table View -->
          <div v-else-if="!isMobile" class="table-responsive-container">
            <table class="modern-desk-table">
              <thead>
                <tr>
                  <th class="th-num">#</th>
                  <th class="th-type">REQUEST CATEGORY</th>
                  <th class="th-desc">DESCRIPTION / JUSTIFICATION</th>
                  <th class="th-status">STATUS</th>
                  <th class="th-date">SUBMITTED DATE</th>
                  <th class="th-action">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, index) in filteredRequests" :key="r.id || index" class="table-row-hover">
                  <td class="td-num">
                    <span class="seq-badge">{{ filteredRequests.length - index }}</span>
                  </td>
                  <td class="td-type">
                    <div class="type-pill-box">
                      <i class="fas fa-tag text-teal"></i>
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
                      <span class="status-pulse-dot"></span>
                      <i :class="getStatusIcon(r.status)"></i>
                      <span>{{ r.status }}</span>
                    </span>
                  </td>
                  <td class="td-date">
                    <div class="date-chip">
                      <i class="fas fa-calendar-day"></i>
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

          <!-- Mobile Cards View -->
          <div v-else class="mobile-feed">
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
                  <span class="req-date"><i class="fas fa-calendar-day"></i> {{ formatDate(r.created_at) }}</span>
                </div>

                <div class="req-status-group">
                  <span :class="['status-pill-badge', getStatusClass(r.status)]">
                    <i :class="getStatusIcon(r.status)"></i> {{ r.status }}
                  </span>
                  <div class="mobile-actions">
                    <button class="btn-tbl-action edit" @click="editRequest(r)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-tbl-action delete" @click="deleteRequest(r.id)" title="Delete">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div class="mobile-card-body">
                <p class="body-desc">{{ r.description || '—' }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
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
      this.$nextTick(() => {
        if (this.$refs.formSection) {
          this.$refs.formSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
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
              hoverOffset: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
              legend: { display: false },
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
      this.isMobile = window.innerWidth <= 992;
      this.isSidebarVisible = !this.isMobile;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* ════════ Master Page Layout ════════ */
.layout {
  display: flex;
  flex-direction: column;
  background: var(--bg-app, #f8fafc);
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--text, #0f172a);
}

.main-content {
  display: flex;
  flex: 1;
  padding: 20px 28px;
  gap: 24px;
}

.content {
  flex: 1;
  min-width: 0;
  background: transparent;
  overflow-x: hidden;
}

.text-teal { color: #0d9488 !important; }

/* ════════ Mobile Top Header ════════ */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 10px;
  margin-bottom: 16px;
  border: 1px solid var(--border, #e2e8f0);
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

.mobile-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-mobile-add {
  background: #0d9488;
  color: #ffffff;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.btn-mobile-menu {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

/* ════════ Executive Header Banner ════════ */
.executive-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.header-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.portal-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  color: #0d9488;
  letter-spacing: 0.6px;
}

.pulse-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2);
}

.status-meta-pill {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 5px;
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 20px;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
}

.header-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
  letter-spacing: -0.3px;
}

.header-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-secondary-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary-action:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-primary-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  border: none;
  color: #ffffff;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
  transition: all 0.15s ease;
}

.btn-primary-action:hover {
  background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
  transform: translateY(-1px);
}

/* ════════ KPI Metrics Grid (5 Columns) ════════ */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.metric-card {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  padding: 16px 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
}

.metric-card.card-active {
  border-color: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2);
}

.metric-card.card-pending { border-left: 3px solid #f59e0b; }
.metric-card.card-approved { border-left: 3px solid #10b981; }
.metric-card.card-completed { border-left: 3px solid #3b82f6; }
.metric-card.card-rejected { border-left: 3px solid #ef4444; }

.metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.metric-title {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.metric-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.icon-all { background: #f0fdfa; color: #0d9488; }
.icon-pending { background: #fffbeb; color: #d97706; }
.icon-approved { background: #ecfdf5; color: #059669; }
.icon-completed { background: #eff6ff; color: #2563eb; }
.icon-rejected { background: #fef2f2; color: #dc2626; }

.metric-body {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.metric-number {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.metric-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
}

.tag-all { background: #f0fdfa; color: #0d9488; }
.tag-pending { background: #fffbeb; color: #b45309; }
.tag-approved { background: #ecfdf5; color: #047857; }
.tag-completed { background: #eff6ff; color: #1d4ed8; }
.tag-rejected { background: #fef2f2; color: #b91c1c; }

/* ════════ Desk Content Grid (Form + Overview) ════════ */
.desk-content-grid {
  display: grid;
  grid-template-columns: 2fr 1.15fr;
  gap: 20px;
  margin-bottom: 20px;
  align-items: start;
}

/* Form Card Container */
.form-card-container {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.form-card-editing {
  border-color: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.15);
}

.form-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border, #e2e8f0);
  background: #fafbfd;
  cursor: pointer;
  user-select: none;
}

.fch-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fch-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.icon-teal { background: #f0fdfa; border: 1px solid #ccfbf1; color: #0d9488; }
.icon-amber { background: #fffbeb; border: 1px solid #fde68a; color: #d97706; }

.fch-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 15.5px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.fch-sub {
  font-size: 12px;
  color: #64748b;
}

.btn-toggle-round {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn-toggle-round.rotated {
  transform: rotate(180deg);
}

/* Form Body */
.form-body-wrapper {
  padding: 20px;
}

.desk-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 4px;
}

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.required {
  color: #ef4444;
  font-weight: 700;
}

.char-counter {
  font-size: 11px;
  color: #94a3b8;
}

.char-counter.char-limit-near {
  color: #d97706;
  font-weight: 700;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 13px;
  pointer-events: none;
}

.textarea-icon-wrap .textarea-icon {
  top: 14px;
}

.custom-input {
  width: 100%;
  padding: 10px 14px 10px 38px;
  background: #ffffff;
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 8px;
  font-size: 13px;
  color: #0f172a;
  font-family: inherit;
  transition: all 0.15s ease;
}

.custom-textarea {
  width: 100%;
  padding: 12px 14px 12px 38px;
  background: #ffffff;
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 8px;
  font-size: 13px;
  color: #0f172a;
  font-family: inherit;
  resize: vertical;
  line-height: 1.5;
  transition: all 0.15s ease;
}

.custom-input:focus, .custom-textarea:focus {
  outline: none;
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
}

/* Quick Selection Pills */
.quick-types-strip {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.quick-types-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  margin-right: 2px;
}

.quick-pill {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.quick-pill:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.quick-pill.selected {
  background: #f0fdfa;
  border-color: #99f6e4;
  color: #0d9488;
  font-weight: 700;
}

/* Form Action Footer */
.form-actions-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
  gap: 12px;
  flex-wrap: wrap;
}

.security-note {
  font-size: 11.5px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.actions-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-form-cancel {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 8px 14px;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.btn-form-reset {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 8px 14px;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.btn-form-submit {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  border: none;
  color: #ffffff;
  padding: 8px 18px;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
  transition: all 0.15s ease;
}

.btn-form-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
  transform: translateY(-1px);
}

.btn-form-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* ════════ Status Overview Card (Right Side) ════════ */
.status-overview-card {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.card-header-clean {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.chc-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chc-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.chc-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 14.5px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.chc-sub {
  font-size: 11.5px;
  color: #64748b;
}

.chart-content-area {
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.chart-empty {
  text-align: center;
  color: #64748b;
  padding: 16px;
}

.chart-empty-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin: 0 auto 10px;
}

.chart-empty p {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 4px;
}

.chart-empty-sub {
  font-size: 11.5px;
  color: #94a3b8;
}

.chart-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.canvas-box {
  position: relative;
  height: 140px;
  width: 140px;
}

.chart-mini-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  width: 100%;
}

.mini-stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  padding: 6px 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.ms-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.ms-dot.pending { background: #f59e0b; }
.ms-dot.approved { background: #10b981; }
.ms-dot.completed { background: #3b82f6; }
.ms-dot.rejected { background: #ef4444; }

.ms-name { color: #64748b; }
.ms-val { color: #0f172a; margin-left: auto; }

.desk-sla-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  border-radius: 8px;
  margin-top: auto;
}

.sla-icon {
  font-size: 13px;
  margin-top: 1px;
}

.sla-text {
  font-size: 11.5px;
  color: #134e4a;
  line-height: 1.45;
}

/* ════════ Master Table Directory Card ════════ */
.table-card-container {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border, #e2e8f0);
  background: #fafbfd;
  flex-wrap: wrap;
  gap: 14px;
}

.toolbar-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.toolbar-heading {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.toolbar-sub {
  font-size: 12px;
  color: #64748b;
}

.toolbar-controls-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-box-wrap {
  position: relative;
  width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 12px;
}

.search-input {
  width: 100%;
  padding: 8px 30px 8px 34px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  font-size: 12.5px;
  color: #0f172a;
  font-family: inherit;
}

.search-input:focus {
  outline: none;
  border-color: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.12);
}

.search-clear-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px;
  font-size: 11px;
}

.filter-pills-bar {
  display: flex;
  gap: 4px;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 8px;
}

.filter-pill {
  background: transparent;
  border: none;
  color: #64748b;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-pill.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* ════════ Table Design ════════ */
.table-responsive-container {
  overflow-x: auto;
  width: 100%;
}

.modern-desk-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
  font-size: 13px;
}

.modern-desk-table thead th {
  background: #f8fafc;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.modern-desk-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.15s ease;
}

.modern-desk-table tbody tr:hover {
  background-color: #f8fafc;
}

.modern-desk-table td {
  padding: 13px 16px;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
}

.th-num { width: 50px; text-align: center; }
.th-type { width: 220px; }
.th-desc { min-width: 260px; max-width: 420px; }
.th-status { width: 140px; white-space: nowrap; }
.th-date { width: 130px; white-space: nowrap; }
.th-action { width: 90px; text-align: right; }

.td-num { text-align: center; }

.seq-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
  font-weight: 700;
  font-size: 11.5px;
}

.type-pill-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #0f172a;
}

.desc-cell {
  color: #475569;
  line-height: 1.45;
}

.date-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}

.date-chip i {
  color: #94a3b8;
  font-size: 11px;
}

/* Status Badges */
.status-pill-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.status-pill-badge.status-pending {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

.status-pill-badge.status-approved {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.status-pill-badge.status-completed {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.status-pill-badge.status-rejected {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.status-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* Action Buttons */
.action-buttons-group {
  display: inline-flex;
  gap: 6px;
}

.btn-tbl-action {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-tbl-action.edit:hover {
  background: #f0fdfa;
  color: #0d9488;
  border-color: #99f6e4;
}

.btn-tbl-action.delete:hover {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

/* State Containers */
.state-container {
  padding: 50px 20px;
  text-align: center;
  color: #64748b;
  max-width: 380px;
  margin: 0 auto;
}

.state-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.empty-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  color: #0d9488;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 14px;
}

.state-container h4 {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
}

.state-container p {
  font-size: 12.5px;
  color: #64748b;
  margin: 0 0 16px;
  line-height: 1.5;
}

.btn-clear-filters {
  background: #0d9488;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

/* Mobile Feed */
.mobile-feed {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-req-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px;
}

.mobile-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 10px;
}

.req-badge-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.req-type-pill {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.req-date {
  font-size: 11px;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.req-status-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-actions {
  display: flex;
  gap: 4px;
}

.body-desc {
  font-size: 12.5px;
  color: #475569;
  margin: 0;
  line-height: 1.45;
}

/* ════════ Responsive ════════ */
@media (max-width: 1100px) {
  .desk-content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 992px) {
  .main-content {
    padding: 14px;
  }

  .executive-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .btn-secondary-action, .btn-primary-action {
    flex: 1;
    justify-content: center;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .toolbar-controls-wrap {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .search-box-wrap {
    width: 100%;
  }

  .filter-pills-bar {
    overflow-x: auto;
  }
}

@media (max-width: 576px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>