<template>
  <div class="layout">
    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section
        class="content"
        v-show="!isMobile || !isSidebarVisible"
        :class="{ 'expanded-content': isMobile && !isSidebarVisible }"
      >
        <!-- 📱 Mobile Top Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <i class="fas fa-calendar-alt"></i>
            <span>Leave Applications</span>
          </div>
          <div class="mobile-header-actions">
            <button class="btn-mobile-apply" @click="$router.push('/employee/applyleave')">
              <i class="fas fa-plus"></i> Apply
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
                <span>EMPLOYEE LEAVE PORTAL</span>
              </span>
              <span class="status-meta-pill">
                <i class="fas fa-shield-alt"></i> Self Service
              </span>
            </div>
            <div class="title-with-icon">
              <div class="header-icon-box">
                <i class="fas fa-calendar-alt"></i>
              </div>
              <div>
                <h1 class="header-title">Leave Applications</h1>
                <p class="header-subtitle">Track and manage your leave requests, check approvals and balances</p>
              </div>
            </div>
          </div>

          <div class="header-actions">
            <button class="btn-secondary-action" @click="$router.push('/employee/myleavebalance')">
              <i class="fas fa-balance-scale"></i>
              <span>My Balance</span>
            </button>
            <button class="btn-primary-action" @click="$router.push('/employee/applyleave')">
              <i class="fas fa-plus"></i>
              <span>Apply for Leave</span>
            </button>
          </div>
        </header>

        <!-- ⚠️ Probation Period Warning Banner -->
        <div v-if="isProbation" class="probation-warning-banner">
          <div class="probation-banner-icon">
            <i class="fas fa-user-clock"></i>
          </div>
          <div class="probation-banner-content">
            <div class="probation-banner-header">
              <span class="probation-tag"><i class="fas fa-shield-alt"></i> Probation Period Active</span>
              <span class="probation-days-badge"><i class="fas fa-hourglass-half"></i> {{ probationDaysLeft }} Days Remaining</span>
            </div>
            <h3 class="probation-title">Probation Status: Leave Applications Restricted</h3>
            <p class="probation-desc">
              You are currently within your 90-day probation period (ending on <strong>{{ probationEndDateFormatted }}</strong>). As per company policy, leave applications cannot be submitted. If you forget to mark attendance, it will be marked as <strong>Unpaid Leave</strong>, and taking a half day will deduct <strong>half-day salary</strong>.
            </p>
          </div>
        </div>

        <!-- 📊 Executive Metric Cards -->
        <section class="metrics-grid">
          <!-- All Applications -->
          <div
            class="metric-card"
            :class="{ 'card-active': statusFilter === '' }"
            @click="filterByStatus('')"
          >
            <div class="metric-header">
              <span class="metric-title">Total Requests</span>
              <div class="metric-icon-wrap icon-all">
                <i class="fas fa-layer-group"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ leaveRequests.length }}</span>
              <span class="metric-tag tag-all">All applications</span>
            </div>
          </div>

          <!-- Pending Requests -->
          <div
            class="metric-card card-pending"
            :class="{ 'card-active': statusFilter === 'Pending' }"
            @click="filterByStatus('Pending')"
          >
            <div class="metric-header">
              <span class="metric-title">Pending Approval</span>
              <div class="metric-icon-wrap icon-pending">
                <i class="fas fa-clock"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ pendingCount }}</span>
              <span class="metric-tag tag-pending">Awaiting review</span>
            </div>
          </div>

          <!-- Approved Requests -->
          <div
            class="metric-card card-approved"
            :class="{ 'card-active': statusFilter === 'Approved' }"
            @click="filterByStatus('Approved')"
          >
            <div class="metric-header">
              <span class="metric-title">Approved Leaves</span>
              <div class="metric-icon-wrap icon-approved">
                <i class="fas fa-check-circle"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ approvedCount }}</span>
              <span class="metric-tag tag-approved">Confirmed requests</span>
            </div>
          </div>

          <!-- Rejected Requests -->
          <div
            class="metric-card card-rejected"
            :class="{ 'card-active': statusFilter === 'Rejected' }"
            @click="filterByStatus('Rejected')"
          >
            <div class="metric-header">
              <span class="metric-title">Rejected Requests</span>
              <div class="metric-icon-wrap icon-rejected">
                <i class="fas fa-times-circle"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ rejectedCount }}</span>
              <span class="metric-tag tag-rejected">Declined leaves</span>
            </div>
          </div>
        </section>

        <!-- 🏷️ Search & Filters Control Strip -->
        <div class="table-controls-bar">
          <div class="search-box-wrap">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search by reason, leave type, or date..."
              class="search-input"
            />
            <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="filter-pills-wrap">
            <button
              class="filter-tab-pill"
              :class="{ active: statusFilter === '' }"
              @click="statusFilter = ''"
            >
              <span>All Status</span>
              <span class="pill-count">{{ leaveRequests.length }}</span>
            </button>
            <button
              class="filter-tab-pill pill-pending"
              :class="{ active: statusFilter === 'Pending' }"
              @click="statusFilter = 'Pending'"
            >
              <i class="fas fa-clock"></i>
              <span>Pending</span>
              <span class="pill-count" v-if="pendingCount > 0">{{ pendingCount }}</span>
            </button>
            <button
              class="filter-tab-pill pill-approved"
              :class="{ active: statusFilter === 'Approved' }"
              @click="statusFilter = 'Approved'"
            >
              <i class="fas fa-check-circle"></i>
              <span>Approved</span>
              <span class="pill-count" v-if="approvedCount > 0">{{ approvedCount }}</span>
            </button>
            <button
              class="filter-tab-pill pill-rejected"
              :class="{ active: statusFilter === 'Rejected' }"
              @click="statusFilter = 'Rejected'"
            >
              <i class="fas fa-times-circle"></i>
              <span>Rejected</span>
              <span class="pill-count" v-if="rejectedCount > 0">{{ rejectedCount }}</span>
            </button>
          </div>
        </div>

        <!-- 📋 Master Leave Table Card -->
        <div class="table-wrapper-premium">
          <div class="table-card-header">
            <div class="tch-left">
              <div class="tch-icon">
                <i class="fas fa-list-ul"></i>
              </div>
              <div>
                <h3 class="tch-title">Leave History & Records</h3>
                <span class="tch-sub" v-if="filteredLeaves.length !== leaveRequests.length">
                  Showing {{ filteredLeaves.length }} of {{ leaveRequests.length }} records
                </span>
                <span class="tch-sub" v-else>
                  Total {{ leaveRequests.length }} records recorded
                </span>
              </div>
            </div>

            <div class="tch-right">
              <button class="btn-refresh-table" @click="fetchLeaves" title="Reload requests">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingLeaves }"></i>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <!-- Desktop Table View -->
          <div class="table-responsive-wrap">
            <table class="leave-table-premium">
              <thead>
                <tr>
                  <th class="col-type">LEAVE TYPE</th>
                  <th class="col-reason">REASON / NOTES</th>
                  <th class="col-date">FROM DATE</th>
                  <th class="col-date">TO DATE</th>
                  <th class="col-duration">DURATION</th>
                  <th class="col-status">STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="leave in filteredLeaves" :key="leave.id" class="leave-row">
                  <!-- Leave Type Badge -->
                  <td class="col-type">
                    <span :class="['leave-type-badge', getLeaveTypeClass(leave.leaveType)]">
                      <span class="lt-icon-wrap">
                        <i :class="getLeaveTypeIcon(leave.leaveType)"></i>
                      </span>
                      <span class="lt-name">{{ leave.leaveType }}</span>
                    </span>
                  </td>

                  <!-- Reason -->
                  <td class="col-reason" :title="leave.reason">
                    <div class="reason-content">
                      <span class="reason-text">{{ leave.reason || 'No description provided' }}</span>
                    </div>
                  </td>

                  <!-- From Date -->
                  <td class="col-date">
                    <div class="date-chip">
                      <i class="fas fa-calendar-day"></i>
                      <span>{{ formatDate(leave.fromDate) }}</span>
                    </div>
                  </td>

                  <!-- To Date -->
                  <td class="col-date">
                    <div class="date-chip">
                      <i class="fas fa-calendar-day"></i>
                      <span>{{ formatDate(leave.toDate) }}</span>
                    </div>
                  </td>

                  <!-- Duration -->
                  <td class="col-duration">
                    <span class="duration-badge">
                      <i class="fas fa-clock"></i>
                      <span>{{ calculateDuration(leave.fromDate, leave.toDate) }} {{ calculateDuration(leave.fromDate, leave.toDate) > 1 ? 'Days' : 'Day' }}</span>
                    </span>
                  </td>

                  <!-- Status -->
                  <td class="col-status">
                    <span :class="['status-badge-premium', getStatusClass(leave.status)]">
                      <span class="status-pulse-dot"></span>
                      <i :class="getStatusIcon(leave.status)"></i>
                      <span>{{ leave.status }}</span>
                    </span>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr v-if="filteredLeaves.length === 0" class="empty-row">
                  <td colspan="6">
                    <div class="empty-state-premium">
                      <div class="empty-icon-box">
                        <i class="fas fa-calendar-check"></i>
                      </div>
                      <h4>No Leave Applications Found</h4>
                      <p>{{ searchQuery || statusFilter ? 'No leave records match your active search filters.' : 'You have not submitted any leave applications yet.' }}</p>
                      <button v-if="!searchQuery && !statusFilter" class="btn-empty-apply" @click="$router.push('/employee/applyleave')">
                        <i class="fas fa-plus"></i> Submit Your First Application
                      </button>
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
import Sidebar from './components/Sidebar.vue'
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

export default {
  name: "LeaveApplicationsEmp",
  components: {
    Sidebar
  },
  data() {
    return {
      user: null,
      leaveRequests: [],
      loadingLeaves: false,
      isMobile: false,
      isSidebarVisible: true,
      searchQuery: '',
      statusFilter: ''
    }
  },
  computed: {
    isProbation() {
      if (this.user && this.user.is_probation !== undefined) {
        return Boolean(this.user.is_probation);
      }
      if (this.user && this.user.created_at) {
        const diff = Math.floor((new Date() - new Date(this.user.created_at)) / (1000 * 60 * 60 * 24));
        return diff < 90;
      }
      return false;
    },
    probationDaysLeft() {
      if (this.user && this.user.probation_days_left !== undefined) {
        return this.user.probation_days_left;
      }
      if (this.user && this.user.created_at) {
        const diff = Math.floor((new Date() - new Date(this.user.created_at)) / (1000 * 60 * 60 * 24));
        return Math.max(0, 90 - diff);
      }
      return 0;
    },
    probationEndDateFormatted() {
      if (this.user && this.user.probation_end_date) {
        return new Date(this.user.probation_end_date).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        });
      }
      if (this.user && this.user.created_at) {
        const d = new Date(this.user.created_at);
        d.setDate(d.getDate() + 90);
        return d.toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        });
      }
      return '90 days from joining';
    },
    pendingCount() {
      return this.leaveRequests.filter(l => l.status === 'Pending').length;
    },
    approvedCount() {
      return this.leaveRequests.filter(l => l.status === 'Approved').length;
    },
    rejectedCount() {
      return this.leaveRequests.filter(l => l.status === 'Rejected').length;
    },
    filteredLeaves() {
      let filtered = this.leaveRequests;
      
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(leave => 
          (leave.leaveType && leave.leaveType.toLowerCase().includes(query)) ||
          (leave.reason && leave.reason.toLowerCase().includes(query)) ||
          (leave.status && leave.status.toLowerCase().includes(query)) ||
          (leave.fromDate && leave.fromDate.includes(query)) ||
          (leave.toDate && leave.toDate.includes(query))
        );
      }
      
      // Status filter
      if (this.statusFilter) {
        filtered = filtered.filter(leave => leave.status === this.statusFilter);
      }
      
      return filtered;
    }
  },
  methods: {
    filterByStatus(status) {
      this.statusFilter = this.statusFilter === status ? '' : status;
    },
    calculateDuration(fromDate, toDate) {
      if (!fromDate || !toDate) return 1;
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const diffTime = Math.abs(to - from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return isNaN(diffDays) ? 1 : diffDays;
    },
    getStatusClass(status) {
      const s = (status || '').toLowerCase();
      if (s === 'approved') return 'approved';
      if (s === 'rejected') return 'rejected';
      return 'pending';
    },
    getStatusIcon(status) {
      const s = (status || '').toLowerCase();
      if (s === 'approved') return 'fas fa-check-circle';
      if (s === 'rejected') return 'fas fa-times-circle';
      return 'fas fa-clock';
    },
    getLeaveTypeClass(leaveType) {
      const type = (leaveType || '').toLowerCase();
      if (type.includes('sick')) return 'type-sick';
      if (type.includes('casual') || type === 'cl') return 'type-casual';
      if (type.includes('pl') || type.includes('privilege') || type.includes('paid')) return 'type-pl';
      if (type.includes('half')) return 'type-halfday';
      return 'type-default';
    },
    getLeaveTypeIcon(leaveType) {
      const type = (leaveType || '').toLowerCase();
      if (type.includes('sick')) return 'fas fa-stethoscope';
      if (type.includes('casual') || type === 'cl') return 'fas fa-coffee';
      if (type.includes('pl') || type.includes('privilege') || type.includes('paid')) return 'fas fa-star';
      if (type.includes('half')) return 'fas fa-adjust';
      return 'fas fa-calendar-alt';
    },
    formatDate(date) {
      if (!date) return '—';
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },
    async fetchUserInfo() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.user = response.data;
        this.fetchLeaves();
      } catch (error) {
        console.error('Error fetching user info:', error);
        this.$router.push('/auth');
      }
    },
    async fetchLeaves() {
      this.loadingLeaves = true;
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('https://employees.archenterprises.co.in/api/api/leave-requests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (this.user && this.user.name) {
          this.leaveRequests = (data || []).filter(leave => leave.name === this.user.name);
        } else {
          this.leaveRequests = data || [];
        }
      } catch (error) {
        console.error('Failed to fetch leave requests:', error);
        toastError('Error loading leave requests.');
      } finally {
        this.loadingLeaves = false;
      }
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 992;
      this.isSidebarVisible = !this.isMobile;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/auth');
    } else {
      this.fetchUserInfo();
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

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

.mobile-title i {
  color: var(--primary, #0d9488);
}

.mobile-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-mobile-apply {
  background: #0d9488;
  color: #ffffff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
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

/* ════════ Top Executive Banner ════════ */
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

.status-meta-pill i {
  color: #10b981;
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
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.22);
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
  color: #ffffff;
  border: none;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
}

.btn-primary-action:hover {
  opacity: 0.94;
  transform: translateY(-1px);
}

/* ════════ Probation Warning Banner ════════ */
.probation-warning-banner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-left: 4px solid #f59e0b;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.06);
}

.probation-banner-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #fef3c7;
  color: #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.probation-banner-content {
  flex: 1;
}

.probation-banner-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.probation-tag {
  font-size: 11px;
  font-weight: 700;
  color: #92400e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.probation-days-badge {
  background: #fef3c7;
  border: 1px solid #fde68a;
  color: #b45309;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
}

.probation-title {
  font-size: 14.5px;
  font-weight: 700;
  color: #78350f;
  margin: 0 0 4px;
}

.probation-desc {
  font-size: 12.5px;
  color: #92400e;
  line-height: 1.5;
  margin: 0;
}

/* ════════ KPI Metric Cards ════════ */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.metric-card {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  padding: 18px 20px;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px -4px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.metric-card.card-active {
  border-color: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15), 0 4px 12px -2px rgba(13, 148, 136, 0.1);
  background: linear-gradient(180deg, #fafefe 0%, #ffffff 100%);
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.metric-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-icon-wrap {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.icon-all { background: #f1f5f9; color: #475569; }
.icon-pending { background: #fef3c7; color: #d97706; }
.icon-approved { background: #d1fae5; color: #059669; }
.icon-rejected { background: #fee2e2; color: #dc2626; }

.metric-body {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.metric-number {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}

.metric-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.tag-all { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
.tag-pending { background: #fffbeb; color: #b45309; border: 1px solid #fef3c7; }
.tag-approved { background: #ecfdf5; color: #047857; border: 1px solid #d1fae5; }
.tag-rejected { background: #fff1f2; color: #be123c; border: 1px solid #fee2e2; }

/* ════════ Controls Strip ════════ */
.table-controls-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.search-box-wrap {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0 14px;
  height: 42px;
  width: 360px;
  max-width: 100%;
  transition: all 0.15s ease;
}

.search-box-wrap:focus-within {
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
}

.search-icon {
  color: #94a3b8;
  font-size: 13px;
  margin-right: 10px;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #0f172a;
  width: 100%;
}

.clear-search-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  font-size: 11px;
}

.clear-search-btn:hover {
  color: #0f172a;
}

.filter-pills-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-tab-pill:hover {
  background: #f8fafc;
  color: #0f172a;
}

.filter-tab-pill.active {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

.filter-tab-pill.pill-pending.active {
  background: #d97706;
  border-color: #d97706;
  color: #ffffff;
}

.filter-tab-pill.pill-approved.active {
  background: #059669;
  border-color: #059669;
  color: #ffffff;
}

.filter-tab-pill.pill-rejected.active {
  background: #dc2626;
  border-color: #dc2626;
  color: #ffffff;
}

.pill-count {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
}

.filter-tab-pill.active .pill-count {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* ════════ Master Table Card ════════ */
.table-wrapper-premium {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04);
}

.table-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fafbfc;
  border-bottom: 1px solid #f1f5f9;
}

.tch-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tch-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #f0fdfa;
  color: #0d9488;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.tch-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.tch-sub {
  font-size: 11.5px;
  color: #64748b;
}

.btn-refresh-table {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-refresh-table:hover {
  background: #f8fafc;
  color: #0f172a;
}

/* ════════ Table Layout ════════ */
.table-responsive-wrap {
  overflow-x: auto;
}

.leave-table-premium {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.leave-table-premium thead {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.leave-table-premium th {
  padding: 12px 18px;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.leave-table-premium tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s ease;
}

.leave-table-premium tbody tr:hover {
  background: #fafbfc;
}

.leave-table-premium td {
  padding: 14px 18px;
  font-size: 13px;
  vertical-align: middle;
}

/* Column Dimensions */
.col-type { width: 180px; }
.col-reason { min-width: 240px; max-width: 380px; }
.col-date { width: 140px; }
.col-duration { width: 120px; }
.col-status { width: 140px; }

/* Leave Type Badge */
.leave-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.lt-icon-wrap {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.type-casual {
  background: #f0fdfa;
  color: #0f766e;
  border: 1px solid #ccfbf1;
}
.type-casual .lt-icon-wrap { background: rgba(13, 148, 136, 0.15); color: #0d9488; }

.type-sick {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}
.type-sick .lt-icon-wrap { background: rgba(245, 158, 11, 0.18); color: #d97706; }

.type-pl {
  background: #f5f3ff;
  color: #6d28d9;
  border: 1px solid #ddd6fe;
}
.type-pl .lt-icon-wrap { background: rgba(124, 58, 237, 0.15); color: #7c3aed; }

.type-halfday {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}
.type-halfday .lt-icon-wrap { background: rgba(37, 99, 235, 0.15); color: #2563eb; }

.type-default {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
}
.type-default .lt-icon-wrap { background: rgba(100, 116, 139, 0.15); color: #64748b; }

/* Reason */
.reason-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 360px;
}

.reason-text {
  color: #334155;
  font-size: 12.5px;
  line-height: 1.4;
}

/* Dates */
.date-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: #475569;
  font-weight: 500;
}

.date-chip i {
  color: #94a3b8;
  font-size: 11px;
}

/* Duration */
.duration-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 4px 9px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  color: #334155;
}

.duration-badge i {
  color: #64748b;
  font-size: 10px;
}

/* Status Badges */
.status-badge-premium {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.status-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-badge-premium.approved {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #065f46;
  border: 1px solid #a7f3d0;
}
.status-badge-premium.approved .status-pulse-dot { background: #10b981; }

.status-badge-premium.pending {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  color: #92400e;
  border: 1px solid #fde68a;
}
.status-badge-premium.pending .status-pulse-dot { background: #f59e0b; }

.status-badge-premium.rejected {
  background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);
  color: #9f1239;
  border: 1px solid #fecdd3;
}
.status-badge-premium.rejected .status-pulse-dot { background: #ef4444; }

/* Empty State */
.empty-state-premium {
  padding: 48px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.empty-icon-box {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: #f0fdfa;
  color: #0d9488;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 4px;
}

.empty-state-premium h4 {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.empty-state-premium p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  max-width: 380px;
}

.btn-empty-apply {
  margin-top: 10px;
  background: #0d9488;
  color: #ffffff;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* ════════ Responsive Adaptations ════════ */
@media (max-width: 1100px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 12px;
  }
  .executive-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
  }
  .header-actions {
    width: 100%;
    justify-content: stretch;
  }
  .btn-secondary-action,
  .btn-primary-action {
    flex: 1;
    justify-content: center;
  }
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  .table-controls-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box-wrap {
    width: 100%;
  }
  .col-reason {
    max-width: 200px;
  }
}
</style>