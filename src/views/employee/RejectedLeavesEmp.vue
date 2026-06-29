<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-times-circle"></i>
            </div>
            <div>
              <h1>Rejected Leaves</h1>
              <p class="subtitle-modern">View all your rejected leave requests</p>
            </div>
          </div>
          <div class="stats-badge-header">
            <i class="fas fa-chart-line"></i>
            <span>{{ leaveRequests.length }} Rejected</span>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar">
          <div class="stat-card rejected">
            <i class="fas fa-times-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ rejectedCount }}</span>
              <span class="stat-label">Rejected Leaves</span>
            </div>
          </div>
          <div class="stat-card days">
            <i class="fas fa-calendar-week"></i>
            <div class="stat-info">
              <span class="stat-value">{{ totalDays }}</span>
              <span class="stat-label">Total Days</span>
            </div>
          </div>
          <div class="stat-card leaves">
            <i class="fas fa-chart-line"></i>
            <div class="stat-info">
              <span class="stat-value">{{ uniqueLeaveTypes }}</span>
              <span class="stat-label">Leave Types</span>
            </div>
          </div>
        </div>

        <!-- Leave Table -->
        <div class="table-wrapper-premium">
          <div class="table-header">
            <div class="section-title-modern">
              <i class="fas fa-list-ul"></i>
              <span>Rejected Leave Records</span>
            </div>
            <div class="table-info">
              <i class="fas fa-file-alt"></i>
              <span>{{ leaveRequests.length }} records</span>
            </div>
          </div>

          <div class="table-container">
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
                <tr v-for="leave in leaveRequests" :key="leave.id" class="leave-row">
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
                    <span class="status-badge-premium rejected">
                      <i class="fas fa-times-circle"></i> Rejected
                    </span>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr v-if="leaveRequests.length === 0" class="empty-row">
                  <td colspan="6">
                    <div class="empty-state-premium">
                      <i class="fas fa-calendar-times"></i>
                      <h4>No Rejected Leaves</h4>
                      <p>You don't have any rejected leave requests</p>
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
    rejectedCount() {
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
    }
  },
  methods: {
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
    async fetchLeaves() {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('https://employees.archenterprises.co.in/api/api/leave-requests', {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: 'Rejected' }
        });
        if (this.user && this.user.name) {
          this.leaveRequests = data.filter(
            leave => leave.name === this.user.name && leave.status === 'Rejected'
          );
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
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border-radius: 40px;
  font-size: 14px;
  font-weight: 600;
  color: #991b1b;
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
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-card.rejected {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
}
.stat-card.rejected i { color: #991b1b; }

.stat-card.days {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
}
.stat-card.days i { color: #4338ca; }

.stat-card.leaves {
  background: linear-gradient(135deg, #fed7aa, #fdba74);
}
.stat-card.leaves i { color: #c2410c; }

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

.status-badge-premium.rejected {
  background: #fee2e2;
  color: #991b1b;
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
    min-width: 600px;
  }

  .reason-cell {
    max-width: 120px;
  }

  /* Hide From Date & To Date on mobile */
  .leave-table-premium th:nth-child(3),
  .leave-table-premium th:nth-child(4),
  .leave-table-premium td:nth-child(3),
  .leave-table-premium td:nth-child(4) {
    display: none;
  }
}

@media (max-width: 480px) {
  .leave-table-premium {
    min-width: 500px;
  }
}
</style>