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
            <i class="fas fa-check-circle text-emerald"></i>
            <span>Approved Leaves</span>
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
              <span class="portal-badge-pill pill-emerald">
                <span class="pulse-indicator pulse-emerald"></span>
                <span>APPROVED LEAVES</span>
              </span>
              <span class="status-meta-pill">
                <i class="fas fa-shield-alt text-emerald"></i> Confirmed Records
              </span>
            </div>
            <div class="title-with-icon">
              <div class="header-icon-box box-emerald">
                <i class="fas fa-calendar-check"></i>
              </div>
              <div>
                <h1 class="header-title">Approved Leaves</h1>
                <p class="header-subtitle">Review your officially approved leaves and planned time-off history</p>
              </div>
            </div>
          </div>

          <div class="header-actions">
            <button class="btn-secondary-action" @click="$router.push('/employee/leaveapplicationsemp')">
              <i class="fas fa-list"></i>
              <span>All Leaves</span>
            </button>
            <button class="btn-primary-action" @click="$router.push('/employee/applyleave')">
              <i class="fas fa-plus"></i>
              <span>Apply for Leave</span>
            </button>
          </div>
        </header>

        <!-- 📊 Executive Metric Cards -->
        <section class="metrics-grid">
          <!-- Approved Requests -->
          <div class="metric-card card-approved">
            <div class="metric-header">
              <span class="metric-title">Approved Requests</span>
              <div class="metric-icon-wrap icon-approved">
                <i class="fas fa-check-circle"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ approvedCount }}</span>
              <span class="metric-tag tag-approved">Confirmed approvals</span>
            </div>
          </div>

          <!-- Total Approved Days -->
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-title">Total Approved Days</span>
              <div class="metric-icon-wrap icon-days">
                <i class="fas fa-calendar-day"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ totalDays }}</span>
              <span class="metric-tag tag-all">Cumulative days off</span>
            </div>
          </div>

          <!-- Leave Categories -->
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-title">Leave Categories</span>
              <div class="metric-icon-wrap icon-types">
                <i class="fas fa-layer-group"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ uniqueLeaveTypes }}</span>
              <span class="metric-tag tag-all">Unique types</span>
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
              placeholder="Search approved leaves by reason, type, or date..."
              class="search-input"
            />
            <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="quick-status-strip">
            <span class="strip-pill">
              <i class="fas fa-check-circle text-emerald"></i>
              <span>All approved leaves are verified and synced with attendance & payroll records.</span>
            </span>
          </div>
        </div>

        <!-- 📋 Master Leave Table Card -->
        <div class="table-wrapper-premium">
          <div class="table-card-header">
            <div class="tch-left">
              <div class="tch-icon box-emerald-tint">
                <i class="fas fa-calendar-check text-emerald"></i>
              </div>
              <div>
                <h3 class="tch-title">Approved Leave Records</h3>
                <span class="tch-sub">
                  Total {{ filteredLeaves.length }} approved {{ filteredLeaves.length === 1 ? 'record' : 'records' }} logged
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

          <!-- Table View -->
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
                    <span class="status-badge-premium approved">
                      <span class="status-pulse-dot"></span>
                      <i class="fas fa-check-circle"></i>
                      <span>Approved</span>
                    </span>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr v-if="filteredLeaves.length === 0" class="empty-row">
                  <td colspan="6">
                    <div class="empty-state-premium">
                      <div class="empty-icon-box box-emerald-tint text-emerald">
                        <i class="fas fa-calendar-check"></i>
                      </div>
                      <h4>No Approved Leaves Found</h4>
                      <p>{{ searchQuery ? 'No approved leaves match your search criteria.' : 'You do not have any approved leave requests yet.' }}</p>
                      <button v-if="!searchQuery" class="btn-empty-apply" @click="$router.push('/employee/applyleave')">
                        <i class="fas fa-plus"></i> Submit Leave Request
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
} from "@/utils/toast.js";

export default {
  name: "ApprovedLeavesEmp",
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
      searchQuery: ''
    }
  },
  computed: {
    approvedCount() {
      return this.leaveRequests.length;
    },
    totalDays() {
      return this.leaveRequests.reduce((total, leave) => {
        return total + this.calculateDuration(leave.fromDate, leave.toDate);
      }, 0);
    },
    uniqueLeaveTypes() {
      const types = new Set(this.leaveRequests.map(l => l.leaveType));
      return types.size;
    },
    filteredLeaves() {
      let filtered = this.leaveRequests;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(leave => 
          (leave.leaveType && leave.leaveType.toLowerCase().includes(query)) ||
          (leave.reason && leave.reason.toLowerCase().includes(query)) ||
          (leave.fromDate && leave.fromDate.includes(query)) ||
          (leave.toDate && leave.toDate.includes(query))
        );
      }
      return filtered;
    }
  },
  methods: {
    calculateDuration(fromDate, toDate) {
      if (!fromDate || !toDate) return 1;
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const diffTime = Math.abs(to - from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
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
      if (type.includes('sick')) return 'fas fa-thermometer-half';
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
          headers: { Authorization: `Bearer ${token}` },
          params: { status: 'Approved' }
        });
        if (this.user && this.user.name) {
          this.leaveRequests = (data || []).filter(
            leave => leave.name === this.user.name && leave.status === 'Approved'
          );
        } else {
          this.leaveRequests = [];
        }
      } catch (error) {
        console.error('Failed to fetch leave requests:', error);
        toastError('Error loading approved leave requests.');
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

.text-emerald { color: #059669 !important; }

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

.pill-emerald {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #047857;
}

.pulse-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2);
}

.pulse-emerald {
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
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
}

.box-emerald {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
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

/* ════════ Metrics Grid ════════ */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.metric-card {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  padding: 18px 20px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
}

.card-approved {
  border-left: 4px solid #10b981;
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.metric-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.icon-approved {
  background: #ecfdf5;
  color: #059669;
}

.icon-days {
  background: #f0fdfa;
  color: #0d9488;
}

.icon-types {
  background: #f8fafc;
  color: #475569;
}

.metric-body {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.metric-number {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}

.metric-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
}

.tag-approved {
  background: #ecfdf5;
  color: #047857;
}

.tag-all {
  background: #f1f5f9;
  color: #475569;
}

/* ════════ Controls Bar ════════ */
.table-controls-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-box-wrap {
  position: relative;
  flex: 1;
  max-width: 440px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 13px;
}

.search-input {
  width: 100%;
  padding: 10px 36px 10px 38px;
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 8px;
  font-size: 13px;
  color: #0f172a;
  font-family: inherit;
  transition: all 0.15s ease;
}

.search-input:focus {
  outline: none;
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  font-size: 12px;
}

.quick-status-strip {
  display: flex;
  align-items: center;
}

.strip-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: #475569;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 7px 12px;
  border-radius: 8px;
}

/* ════════ Table Card Container ════════ */
.table-wrapper-premium {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.table-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border, #e2e8f0);
  background: #fafbfd;
}

.tch-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tch-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.box-emerald-tint {
  background: #ecfdf5;
  border: 1px solid #d1fae5;
}

.tch-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.tch-sub {
  font-size: 12px;
  color: #64748b;
}

.tch-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-refresh-table {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 6px 12px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-refresh-table:hover {
  background: #f1f5f9;
  color: #0f172a;
}

/* ════════ Table Design ════════ */
.table-responsive-wrap {
  overflow-x: auto;
  width: 100%;
}

.leave-table-premium {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
  font-size: 13px;
}

.leave-table-premium thead th {
  background: #f8fafc;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 12px 18px;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.leave-table-premium tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.15s ease;
}

.leave-table-premium tbody tr:hover {
  background-color: #f8fafc;
}

.leave-table-premium td {
  padding: 14px 18px;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
}

/* Column specifics */
.col-type {
  width: 170px;
}

.col-reason {
  min-width: 240px;
  max-width: 360px;
}

.col-date {
  width: 140px;
  white-space: nowrap;
}

.col-duration {
  width: 120px;
  white-space: nowrap;
}

.col-status {
  width: 130px;
  white-space: nowrap;
}

/* ════════ Leave Type Badges ════════ */
.leave-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 10px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
}

.lt-icon-wrap {
  font-size: 11px;
  display: flex;
  align-items: center;
}

.type-casual {
  background: #f0fdf4;
  color: #166534;
  border-color: #bbf7d0;
}

.type-sick {
  background: #fffbeb;
  color: #92400e;
  border-color: #fde68a;
}

.type-pl {
  background: #eef2ff;
  color: #3730a3;
  border-color: #c7d2fe;
}

.type-halfday {
  background: #fff7ed;
  color: #9a3412;
  border-color: #ffedd5;
}

.type-default {
  background: #f1f5f9;
  color: #334155;
  border-color: #e2e8f0;
}

/* ════════ Reason Formatting ════════ */
.reason-content {
  display: flex;
  align-items: center;
}

.reason-text {
  font-size: 13px;
  color: #334155;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ════════ Date Chip ════════ */
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

/* ════════ Duration Badge ════════ */
.duration-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f1f5f9;
  color: #334155;
  padding: 4px 9px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #e2e8f0;
}

.duration-badge i {
  color: #64748b;
  font-size: 10px;
}

/* ════════ Status Badges ════════ */
.status-badge-premium {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.status-badge-premium.approved {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.status-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
}

/* ════════ Empty State ════════ */
.empty-row td {
  padding: 50px 20px;
}

.empty-state-premium {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 380px;
  margin: 0 auto;
}

.empty-icon-box {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 14px;
}

.empty-state-premium h4 {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
}

.empty-state-premium p {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 16px;
  line-height: 1.5;
}

.btn-empty-apply {
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  border: none;
  color: #ffffff;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
  transition: all 0.15s ease;
}

.btn-empty-apply:hover {
  transform: translateY(-1px);
}

/* ════════ Responsive ════════ */
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

  .btn-secondary-action,
  .btn-primary-action {
    flex: 1;
    justify-content: center;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .search-box-wrap {
    max-width: 100%;
  }
}
</style>