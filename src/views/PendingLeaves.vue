<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div>
              <h1>Pending Leave Applications</h1>
              <p class="subtitle-modern">Review and manage pending leave requests</p>
            </div>
          </div>
          <div class="stats-badge-header pending">
            <i class="fas fa-hourglass-half"></i>
            <span>{{ sortedLeaves.length }} Pending</span>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar">
          <div class="stat-card">
            <i class="fas fa-users"></i>
            <div class="stat-info">
              <span class="stat-value">{{ uniqueEmployees }}</span>
              <span class="stat-label">Employees</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-calendar-week"></i>
            <div class="stat-info">
              <span class="stat-value">{{ totalLeaveDays }}</span>
              <span class="stat-label">Total Days Requested</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-chart-line"></i>
            <div class="stat-info">
              <span class="stat-value">{{ urgentRequests }}</span>
              <span class="stat-label">Urgent (Next 3 days)</span>
            </div>
          </div>
        </div>

        <!-- Loading Spinner -->
        <div v-if="loadingLeaves" class="loading-container">
          <div class="spinner"></div>
          <p>Loading leave requests...</p>
        </div>

        <!-- Leave Table -->
        <div v-else class="table-wrapper-premium">
          <div class="table-header">
            <div class="section-title-modern">
              <i class="fas fa-list-ul"></i>
              <span>Pending Leave Requests</span>
            </div>
            <div class="table-info">
              <i class="fas fa-clock"></i>
              <span>{{ sortedLeaves.length }} pending approvals</span>
            </div>
          </div>

          <div class="table-container">
            <table class="leave-table-premium">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Reason</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="leave in sortedLeaves" :key="leave.id">
                  <td class="employee-cell">
                    <div class="employee-info">
                      <div class="employee-avatar">
                        {{ getInitials(leave.name) }}
                      </div>
                      <span class="employee-name">{{ formatName(leave.name) }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="dept-badge">{{ leave.department }}</span>
                  </td>
                  <td>
                    <span :class="['leave-type-badge', getLeaveTypeClass(leave.leaveType)]">
                      <i :class="getLeaveTypeIcon(leave.leaveType)"></i>
                      {{ leave.leaveType }}
                    </span>
                  </td>
                  <td class="reason-cell" :title="leave.reason">
                    {{ truncateText(leave.reason, 50) }}
                  </td>
                  <td class="date-cell">
                    <i class="fas fa-calendar-day"></i> {{ formatDate(leave.fromDate) }}
                  </td>
                  <td class="date-cell">
                    <i class="fas fa-calendar-day"></i> {{ formatDate(leave.toDate) }}
                  </td>
                  <td class="duration-cell">
                    <span class="duration-badge" :class="{ urgent: isUrgent(leave.fromDate) }">
                      <i class="fas fa-clock"></i> {{ calculateDuration(leave.fromDate, leave.toDate) }} days
                    </span>
                  </td>
                  <td>
                    <div class="action-group">
                      <button 
                        class="action-btn approve" 
                        @click="approveLeave(leave)"
                        :disabled="busyLeave.id === leave.id"
                        title="Approve Leave"
                      >
                        <i v-if="busyLeave.id === leave.id && busyLeave.action === 'Approved'" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-check-circle"></i>
                      </button>
                      <button 
                        class="action-btn reject" 
                        @click="rejectLeave(leave)"
                        :disabled="busyLeave.id === leave.id"
                        title="Reject Leave"
                      >
                        <i v-if="busyLeave.id === leave.id && busyLeave.action === 'Rejected'" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-times-circle"></i>
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr v-if="sortedLeaves.length === 0" class="empty-row">
                  <td colspan="8">
                    <div class="empty-state-premium">
                      <i class="fas fa-calendar-check"></i>
                      <h4>No Pending Requests</h4>
                      <p>All leave requests have been processed</p>
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
  components: {
    Sidebar
  },
  data() {
    return {
      loadingLeaves: false,
      leaveRequests: [],
      busyLeave: { id: null, action: null },
      isMobile: false,
      isSidebarVisible: true,
    }
  },
  computed: {
    sortedLeaves() {
      return [...this.leaveRequests].sort((a, b) => {
        const dateA = new Date(a.created_at || a.fromDate || 0);
        const dateB = new Date(b.created_at || b.fromDate || 0);
        return dateB - dateA;
      });
    },
    uniqueEmployees() {
      const names = new Set(this.leaveRequests.map(l => l.name));
      return names.size;
    },
    totalLeaveDays() {
      return this.leaveRequests.reduce((total, leave) => {
        return total + this.calculateDuration(leave.fromDate, leave.toDate);
      }, 0);
    },
    urgentRequests() {
      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);
      return this.leaveRequests.filter(leave => {
        const fromDate = new Date(leave.fromDate);
        return fromDate >= today && fromDate <= threeDaysFromNow;
      }).length;
    }
  },
  methods: {
    getInitials(name) {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },
    formatName(name) {
      if (!name) return '';
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    },
    truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },
    formatDate(date) {
      if (!date) return '—';
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },
    calculateDuration(fromDate, toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const diffTime = Math.abs(to - from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    },
    isUrgent(fromDate) {
      const today = new Date();
      const from = new Date(fromDate);
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);
      return from >= today && from <= threeDaysFromNow;
    },
    getLeaveTypeClass(leaveType) {
      const type = (leaveType || '').toLowerCase();
      if (type.includes('sick')) return 'sick';
      if (type.includes('casual') || type === 'cl') return 'casual';
      if (type.includes('pl') || type.includes('privilege') || type.includes('paid')) return 'pl';
      if (type.includes('half')) return 'halfday';
      return 'default';
    },
    getLeaveTypeIcon(leaveType) {
      const type = (leaveType || '').toLowerCase();
      if (type.includes('sick')) return 'fas fa-thermometer-half';
      if (type.includes('casual') || type === 'cl') return 'fas fa-coffee';
      if (type.includes('pl') || type.includes('privilege') || type.includes('paid')) return 'fas fa-star';
      if (type.includes('half')) return 'fas fa-adjust';
      return 'fas fa-calendar-alt';
    },
    async updateLeaveStatus(leaveId, status) {
      this.busyLeave = { id: leaveId, action: status };
      try {
        const token = localStorage.getItem('token');
        await axios.patch(
          `https://employees.archenterprises.co.in/api/api/leave-requests/${leaveId}/status`,
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toastSuccess(`Leave ${status.toLowerCase()} successfully!`);
        this.fetchLeaves();
      } catch (error) {
        console.error('Status update failed', error);
        toastError('Could not update status – please try again.');
      } finally {
        this.busyLeave = { id: null, action: null };
      }
    },
    approveLeave(leave) { 
      this.updateLeaveStatus(leave.id, 'Approved'); 
    },
    rejectLeave(leave) { 
      this.updateLeaveStatus(leave.id, 'Rejected'); 
    },
    async fetchLeaves() {
      this.loadingLeaves = true;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/leave-requests', {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: 'Pending' }
        });
        this.leaveRequests = response.data;
      } catch (error) {
        console.error('Failed to fetch leave requests:', error);
        toastError('Error loading leave requests.');
      } finally {
        this.loadingLeaves = false;
      }
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    logout() {
      const token = localStorage.getItem('token');
      axios
        .post('https://employees.archenterprises.co.in/api/api/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .finally(() => {
          localStorage.removeItem('token');
          this.$router.push('/auth');
        });
    }
  },
  mounted() {
    this.fetchLeaves();
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/auth');
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
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
  /* background: linear-gradient(135deg, #ffffff 0%, #ffffff 100%); */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
   ;
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
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 40px;
  font-size: 14px;
  font-weight: 600;
  color: #d97706;
}

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-card i {
  font-size: 32px;
  color: var(--primary-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 13px;
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

.leave-table-premium {
  width: 100%;
  border-collapse: collapse;
}

.leave-table-premium thead {
  background: #f8fafc;
}

.leave-table-premium th {
  text-align: left;
  padding: 16px;
  font-weight: 600;
  font-size: 13px;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.leave-table-premium td {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.leave-table-premium tbody tr {
  transition: all 0.3s ease;
}

.leave-table-premium tbody tr:hover {
  background: #fafbfc;
}

/* Employee Cell */
.employee-cell {
  min-width: 160px;
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
  font-size: 13px;
}

.employee-name {
  font-weight: 500;
  color: #1a1a2e;
}

/* Department Badge */
.dept-badge {
  display: inline-flex;
  padding: 4px 12px;
  background: #e0e7ff;
  color: var(--primary-color);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

/* Leave Type Badge */
.leave-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.leave-type-badge.sick {
  background: #fef3c7;
  color: #d97706;
}

.leave-type-badge.casual {
  background: #d1fae5;
  color: #065f46;
}

.leave-type-badge.pl {
  background: #e0e7ff;
  color: #4338ca;
}

.leave-type-badge.halfday {
  background: #fed7aa;
  color: #c2410c;
}

.leave-type-badge.default {
  background: #f3e8ff;
  color: #7e22ce;
}

/* Reason Cell */
.reason-cell {
  max-width: 200px;
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

/* Duration Cell */
.duration-cell {
  white-space: nowrap;
}

.duration-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #f3f4f6;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: #4b5563;
}

.duration-badge.urgent {
  background: #fef3c7;
  color: #d97706;
}

/* Action Group */
.action-group {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
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
  background: rgb(187, 224, 187);
  color: rgb(0, 0, 0);
  transform: translateY(-2px);
}

.action-btn.reject {
  background: #fee2e2;
  color: var(--danger);
}

.action-btn.reject:hover:not(:disabled) {
  background: var(--danger);
  color: white;
  transform: translateY(-2px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

/* Modal Fade */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .leave-table-premium th,
  .leave-table-premium td {
    padding: 12px;
  }
  
  .reason-cell {
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
    grid-template-columns: 1fr;
  }

  .table-container {
    overflow-x: auto;
  }

  .leave-table-premium {
    min-width: 800px;
  }

  .employee-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .employee-avatar {
    width: 32px;
    height: 32px;
    font-size: 11px;
  }

  .reason-cell {
    max-width: 120px;
  }

  .action-group {
    flex-direction: row;
  }

  .action-btn {
    width: 30px;
    height: 30px;
  }
}
</style>