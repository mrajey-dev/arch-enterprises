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
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
          
          <div class="mobile-title">
            <i class="fas fa-calendar-alt"></i>
            <span>Leave Applications</span>
          </div>
          <div class="mobile-stats-badge">
            <span>{{ leaveRequests.length }}</span>
          </div>
        </div>

        <!-- Desktop Header -->
        <div class="content-header-modern" v-else>
          <div class="header-left desktop-only">
            <div class="title-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div>
              <h1>Leave Applications</h1>
              <p class="subtitle-modern">Track and manage your leave requests</p>
            </div>
          </div>
          <div class="stats-badge-header">
            <i class="fas fa-chart-line"></i>
            <span>{{ leaveRequests.length }} Applications</span>
          </div>
        </div>

        <!-- Stats Bar - Mobile Optimized -->
        <div class="stats-bar">
          <div class="stat-card pending" @click="filterByStatus('Pending')">
            <i class="fas fa-clock"></i>
            <div class="stat-info">
              <span class="stat-value">{{ pendingCount }}</span>
              <span class="stat-label">Pending</span>
            </div>
          </div>
          <div class="stat-card approved" @click="filterByStatus('Approved')">
            <i class="fas fa-check-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ approvedCount }}</span>
              <span class="stat-label">Approved</span>
            </div>
          </div>
          <div class="stat-card rejected" @click="filterByStatus('Rejected')">
            <i class="fas fa-times-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ rejectedCount }}</span>
              <span class="stat-label">Rejected</span>
            </div>
          </div>
        </div>

        <!-- Filter Bar - Mobile -->
        <div class="filter-bar-mobile" v-if="isMobile">
          <div class="filter-group-mobile">
            <i class="fas fa-search"></i>
            <input type="text" v-model="searchQuery" placeholder="Search leaves..." class="filter-input-mobile" />
          </div>
          <select v-model="statusFilter" class="filter-select-mobile">
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <!-- Leave Table -->
        <div class="table-wrapper-premium">
          <div class="table-header">
            <div class="section-title-modern">
              <i class="fas fa-list-ul"></i>
              <span>Leave Requests</span>
              <span class="record-count-mobile" v-if="isMobile">{{ filteredLeaves.length }}</span>
            </div>
            <div class="table-info desktop-only">
              <i class="fas fa-file-alt"></i>
              <span>{{ leaveRequests.length }} records</span>
            </div>
          </div>

          <!-- Mobile Card View -->
          <div class="mobile-cards" v-if="isMobile">
            <div v-for="leave in filteredLeaves" :key="leave.id" class="leave-card">
              <div class="card-header">
                <div class="card-title">
                  <span :class="['leave-type-badge-mobile', getLeaveTypeClass(leave.leaveType)]">
                    <i :class="getLeaveTypeIcon(leave.leaveType)"></i>
                    {{ leave.leaveType }}
                  </span>
                  <span :class="['status-badge-mobile', getStatusClass(leave.status)]">
                    <i :class="getStatusIcon(leave.status)"></i>
                    {{ leave.status }}
                  </span>
                </div>
              </div>
              <div class="card-body">
                <div class="card-row">
                  <span class="card-label">Reason</span>
                  <span class="card-value reason-text">{{ leave.reason || '—' }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">From</span>
                  <span class="card-value"><i class="fas fa-calendar-day"></i> {{ formatDate(leave.fromDate) }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">To</span>
                  <span class="card-value"><i class="fas fa-calendar-day"></i> {{ formatDate(leave.toDate) }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">Duration</span>
                  <span class="card-value duration-badge-mobile">
                    <i class="fas fa-clock"></i> {{ calculateDuration(leave.fromDate, leave.toDate) }} days
                  </span>
                </div>
              </div>
            </div>

            <!-- Mobile Empty State -->
            <div v-if="filteredLeaves.length === 0" class="empty-state-mobile">
              <i class="fas fa-calendar-times"></i>
              <h4>No Leave Applications</h4>
              <p>{{ searchQuery || statusFilter ? 'No matches found for your filters' : 'You haven\'t submitted any leave requests yet' }}</p>
            </div>
          </div>

          <!-- Desktop Table View -->
          <div class="table-container" v-else>
            <table class="leave-table-premium">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Reason</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="leave in filteredLeaves" :key="leave.id" class="leave-row">
                  <td class="leave-type-cell">
                    <span :class="['leave-type-badge', getLeaveTypeClass(leave.leaveType)]">
                      <i :class="getLeaveTypeIcon(leave.leaveType)"></i>
                      {{ leave.leaveType }}
                    </span>
                  </td>
                  <td class="reason-cell" :title="leave.reason">
                    {{ truncateText(leave.reason, 60) }}
                  </td>
                  <td class="date-cell">
                    <i class="fas fa-calendar-day"></i> {{ formatDate(leave.fromDate) }}
                  </td>
                  <td class="date-cell">
                    <i class="fas fa-calendar-day"></i> {{ formatDate(leave.toDate) }}
                  </td>
                  <td class="duration-cell">
                    <span class="duration-badge">
                      <i class="fas fa-clock"></i> {{ calculateDuration(leave.fromDate, leave.toDate) }} days
                    </span>
                  </td>
                  <td>
                    <span :class="['status-badge-premium', getStatusClass(leave.status)]">
                      <i :class="getStatusIcon(leave.status)"></i>
                      {{ leave.status }}
                    </span>
                  </td>
                </tr>

                <!-- Desktop Empty State -->
                <tr v-if="filteredLeaves.length === 0" class="empty-row">
                  <td colspan="6">
                    <div class="empty-state-premium">
                      <i class="fas fa-calendar-times"></i>
                      <h4>No Leave Applications</h4>
                      <p>You haven't submitted any leave requests yet</p>
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
  components: {
    Sidebar
  },
  data() {
    return {
      user: null,
      leaveRequests: [],
      isMobile: false,
      isSidebarVisible: true,
      searchQuery: '',
      statusFilter: '',
      selectedDocumentType: '',
      typedDocuments: {},
      showPassword: true,
      users: [],
      showRegister: false,
      isEditMode: false,
      editingId: null,
      registerForm: {
        id: '',
        empId: '',
        username: '',
        email: '',
        gender: '',
        department: '',
        city: '',
        address: '',
        mobile: '',
        keyResponsibility: '',
        password: '',
        documents: [],
      }
    }
  },
  computed: {
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
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(leave => 
          leave.leaveType.toLowerCase().includes(query) ||
          (leave.reason && leave.reason.toLowerCase().includes(query)) ||
          leave.status.toLowerCase().includes(query)
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
    truncateText(text, length) {
      if (!text) return '—';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },
    calculateDuration(fromDate, toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const diffTime = Math.abs(to - from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    },
    getStatusClass(status) {
      switch (status) {
        case 'Approved': return 'approved';
        case 'Rejected': return 'rejected';
        default: return 'pending';
      }
    },
    getStatusIcon(status) {
      switch (status) {
        case 'Approved': return 'fas fa-check-circle';
        case 'Rejected': return 'fas fa-times-circle';
        default: return 'fas fa-clock';
      }
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
    async updateLeaveStatus(leaveId, status) {
      try {
        const token = localStorage.getItem('token');
        await axios.patch(
          `https://employees.archenterprises.co.in/api/api/leave-requests/${leaveId}/status`,
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toastSuccess('Status updated successfully!');
        this.fetchLeaves();
      } catch (error) {
        console.error('Status update failed', error);
        toastError('Could not update status – please try again.');
      }
    },
    approveLeave(leave) { this.updateLeaveStatus(leave.id, 'Approved'); },
    rejectLeave(leave) { this.updateLeaveStatus(leave.id, 'Rejected'); },
    async fetchLeaves() {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('https://employees.archenterprises.co.in/api/api/leave-requests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (this.user && this.user.name) {
          this.leaveRequests = data.filter(leave => leave.name === this.user.name);
        } else {
          this.leaveRequests = [];
        }
      } catch (error) {
        console.error('Failed to fetch leave requests:', error);
        toastError('Error loading leave requests.');
      }
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      if (this.isMobile) {
        this.isSidebarVisible = false;
      } else {
        this.isSidebarVisible = true;
      }
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    handleTypedFileUpload(event) {
      const file = event.target.files[0];
      if (this.selectedDocumentType && file) {
        this.typedDocuments[this.selectedDocumentType] = file;
        this.registerForm.documents = Object.values(this.typedDocuments);
      } else {
        toastWarning('Please select a document type before uploading.');
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    generatePassword() {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
      let password = '';
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.registerForm.password = password;
    },
    goTo(route) {
      this.$router.push(`/${route}`);
    },
    openRegisterForm() {
      this.resetForm();
      this.showRegister = true;
    },
    closeRegisterForm() {
      this.showRegister = false;
      this.resetForm();
    },
    async handleRegister() {
      try {
        const formData = new FormData();
        for (const key in this.registerForm) {
          if (key === 'documents') {
            this.registerForm.documents.forEach((file) => formData.append('documents', file));
          } else {
            formData.append(key, this.registerForm[key]);
          }
        }
        const url = this.isEditMode
          ? `https://employees.archenterprises.co.in/api/api/users/${this.editingId}`
          : 'https://employees.archenterprises.co.in/api/api/register';
        const method = this.isEditMode ? 'put' : 'post';
        await axios({
          method,
          url,
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        toastSuccess(this.isEditMode ? 'User updated successfully!' : 'Registration successful!');
        this.showRegister = false;
        this.resetForm();
        this.fetchUsers();
      } catch (error) {
        console.error('Register error:', error);
        if (error.response && error.response.data && error.response.data.message) {
          toastError(`Operation failed: ${error.response.data.message}`);
        } else {
          toastError('Operation failed due to network or server error.');
        }
      }
    },
    handleFileUpload(event) {
      this.registerForm.documents = Array.from(event.target.files);
    },
    resetForm() {
      this.registerForm = {
        id: '',
        empId: '',
        username: '',
        email: '',
        gender: '',
        department: '',
        city: '',
        address: '',
        mobile: '',
        keyResponsibility: '',
        password: '',
        documents: [],
      };
      this.isEditMode = false;
      this.editingId = null;
    },
    async fetchUsers() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.users = response.data;
      } catch (error) {
        toastError('Failed to fetch users');
        console.error(error);
      }
    },
    editUser(user) {
      this.registerForm = {
        id: user.id || '',
        empId: user.empId || '',
        username: user.username || '',
        email: user.email || '',
        gender: user.gender || '',
        department: user.department || '',
        city: user.city || '',
        address: user.address || '',
        mobile: user.mobile || '',
        keyResponsibility: user.keyResponsibility || '',
        password: '',
        documents: []
      };
      this.isEditMode = true;
      this.editingId = user.id;
      this.showRegister = true;
    },
    async deleteUser(id) {
      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await axios.delete(`https://employees.archenterprises.co.in/api/api/users/${encodeURIComponent(id)}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          this.fetchUsers();
          toastSuccess('User deleted successfully!');
        } catch (error) {
          toastError('Failed to delete user.');
          console.error(error);
        }
      }
    },
    logout() {
      const token = localStorage.getItem('token');
      axios.post('https://employees.archenterprises.co.in/api/api/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).finally(() => {
        localStorage.removeItem('token');
        this.$router.push('/auth');
      });
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/auth');
    } else {
      this.fetchUsers();
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
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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

.stat-card i {
  font-size: 32px;
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

/* Filter Bar - Mobile */
.filter-bar-mobile {
  display: none;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 16px;
}

.filter-group-mobile {
  position: relative;
  flex: 1;
}

.filter-group-mobile i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.filter-input-mobile {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  transition: all 0.3s ease;
}

.filter-input-mobile:focus {
  outline: none;
  border-color: var(--primary-color);
}

.filter-select-mobile {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  appearance: auto;
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

.leave-row {
  transition: all 0.3s ease;
}

.leave-row:hover {
  background: #fafbfc;
}

/* Leave Type Badge */
.leave-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
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

/* Status Badge */
.status-badge-premium {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
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

/* Mobile Cards */
.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.leave-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.leave-card:active {
  transform: scale(0.99);
}

.card-header {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.leave-type-badge-mobile {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.leave-type-badge-mobile.sick {
  background: #fef3c7;
  color: #d97706;
}

.leave-type-badge-mobile.casual {
  background: #d1fae5;
  color: #065f46;
}

.leave-type-badge-mobile.pl {
  background: #e0e7ff;
  color: #4338ca;
}

.leave-type-badge-mobile.halfday {
  background: #fed7aa;
  color: #c2410c;
}

.leave-type-badge-mobile.default {
  background: #f3e8ff;
  color: #7e22ce;
}

.status-badge-mobile {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
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
  min-width: 60px;
}

.card-value {
  font-size: 13px;
  color: var(--dark);
  text-align: right;
  word-break: break-word;
}

.reason-text {
  max-width: 60%;
  text-align: right;
}

.duration-badge-mobile {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  background: #f3f4f6;
  border-radius: 12px;
  font-size: 12px;
  color: #4b5563;
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
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .stat-card {
    padding: 14px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .stat-card i {
    font-size: 24px;
  }

  .stat-value {
    font-size: 22px;
  }

  .stat-label {
    font-size: 11px;
  }

  .filter-bar-mobile {
    display: flex;
  }

  .table-container {
    display: none;
  }

  .mobile-cards {
    display: flex;
  }

  .table-header {
    padding: 12px 16px;
  }

  .section-title-modern {
    font-size: 14px;
  }

  .table-info {
    display: none;
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
    padding: 12px;
  }

  .stat-card i {
    font-size: 20px;
  }

  .stat-value {
    font-size: 18px;
  }

  .mobile-title {
    font-size: 16px;
  }

  .mobile-stats-badge {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .leave-card {
    padding: 12px;
  }

  .card-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
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

  .reason-text {
    max-width: 100%;
    text-align: left;
  }

  .card-label {
    min-width: auto;
  }

  .filter-input-mobile,
  .filter-select-mobile {
    font-size: 15px;
    padding: 8px 10px;
  }

  .filter-input-mobile {
    padding-left: 34px;
  }

  .leave-type-badge-mobile,
  .status-badge-mobile {
    font-size: 10px;
    padding: 3px 10px;
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