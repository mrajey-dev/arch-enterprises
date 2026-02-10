

<template>
  <div class="layout">
    <!-- Header -->
     <header class="header">
    <div class="head-title"><a href="https://employees.archenterprises.co.in/">
        <img
          src="https://archenterprises.co.in/ajay/ajay.png"
          style="height: 65px;  border-radius: 9px;"
          alt="Logo"
        />
         </a>
         Arch 360
     
      </div>
      <i class="fas fa-bars mobile-menu-icon" @click="toggleSidebar" v-if="isMobile"></i>
    </header>

    <!-- Main Content -->
    <div class="main-content">
       <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
  <h2>Leave Applications</h2>
   <!-- Loader while fetching data -->
  <div v-if="loadingLeaves" class="text-center my-4">
    <div class="spinner-border text-primary" role="status">
      <span class="sr-only">Loading...</span>
    </div>
    <p>Loading leave requests...</p>
  </div>

   <!-- Leave Table -->
  <table v-else class="table table-striped table-bordered user-table">
  <thead class="thead-dark">
    <tr>
      <th>Name</th>
      <th>Department</th>
      <th>Type</th>
      <th>Reason</th>
      <th>From</th>
      <th>To</th>
      <th>Status</th>
      <th>Action</th>
    </tr>
  </thead>

  <!-- DATA -->
  <tbody v-if="visibleLeaves.length">
    <tr v-for="leave in visibleLeaves" :key="leave.id">
      <td>{{ formatName(leave.name) }}</td>
      <td>{{ leave.department }}</td>
      <td>{{ leave.leaveType }}</td>
      <td>{{ leave.reason }}</td>
      <td>{{ leave.fromDate }}</td>
      <td>{{ leave.toDate }}</td>

      <td>
        <span
          :class="{
            'badge badge-success': leave.status === 'Approved',
            'badge badge-danger': leave.status === 'Rejected',
            'badge badge-secondary': leave.status === 'Pending'
          }"
        >
          {{ leave.status }}
        </span>
      </td>

      <td>
        <div class="btn-group" role="group">
          <!-- APPROVE -->
          <button
            class="btn btn-sm btn-success attractive-btn"
            title="Approve"
            @click="approveLeave(leave)"
            :disabled="leave.status !== 'Pending' || busyLeave.id === leave.id"
          >
            <i
              v-if="busyLeave.id === leave.id && busyLeave.action === 'Approved'"
              class="fas fa-spinner fa-spin"
            ></i>
            <i v-else class="fas fa-check-circle"></i>
          </button>

          <!-- REJECT -->
          <button
            class="btn btn-sm btn-danger attractive-btn"
            title="Reject"
            @click="rejectLeave(leave)"
            :disabled="leave.status !== 'Pending' || busyLeave.id === leave.id"
          >
            <i
              v-if="busyLeave.id === leave.id && busyLeave.action === 'Rejected'"
              class="fas fa-spinner fa-spin"
            ></i>
            <i v-else class="fas fa-times-circle"></i>
          </button>
        </div>
      </td>
    </tr>
  </tbody>

  <!-- NO DATA -->
  <tbody v-else>
    <tr>
      <td colspan="8" class="text-center font-weight-bold text-muted py-4">
        No leave requests found
      </td>
    </tr>
  </tbody>
</table>

  <div v-if="visibleLeaveCount < sortedLeaves.length" class="text-center mt-3">
  <button class="btn btn-info" @click="showMoreLeaves">
    Show More Leaves
  </button>
</div>
</section>

    </div>

    <!-- <footer class="footer">
      &copy; 2025 Arch Enterprises. All rights reserved.
    </footer> -->
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";
export default {
  components: { Sidebar },
  data() {
    return {
      loadingLeaves: false,
      busyLeave: { id: null, action: null },
      visibleLeaveCount: 4,
      leaveRequests: [],
      isMobile: false,
      isSidebarVisible: true,
      selectedDocumentType: '',
      typedDocuments: {},
      showPassword: true,
      users: [],
      showRegister: false,
      isEditMode: false,
      editingName: null,
      registerForm: {
        name: '',
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
      },
      loggedInUserName: '', // Store logged-in user's name
    }
  },

  computed: {
    sortedLeaves() {
      return [...this.leaveRequests].sort((a, b) => {
        const dateA = new Date(a.created_at || a.fromDate || 0)
        const dateB = new Date(b.created_at || b.fromDate || 0)
        return dateB - dateA
      })
    },
    visibleLeaves() {
      return this.sortedLeaves.slice(0, this.visibleLeaveCount)
    },
  },

  methods: {
    formatName(name) {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },
    showMoreLeaves() {
      this.visibleLeaveCount += 5
    },

    calculateLeaveDays(fromDate, toDate) {
      const from = new Date(fromDate)
      const to = new Date(toDate)
      const diffTime = Math.abs(to - from)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays
    },

 async approveLeave(leave) {
  if (this.busyLeave.id) return;
  this.busyLeave = { id: leave.id, action: 'Approved' };

  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('❌ No auth token found!');

    const userName = leave.name || this.loggedInUserName;
    if (!userName) throw new Error('❌ No valid user name found!');

    // Determine total leave days
    let totalDays = this.calculateLeaveDays(leave.fromDate, leave.toDate);

    // If leave type is "half day", count as 0.5
    const leaveTypeLower = (leave.leaveType || '').toLowerCase().trim();
    if (leaveTypeLower === 'half day' || leaveTypeLower === 'half-day') {
      totalDays = 0.5;
    }

    // Update leave status first
    await axios.patch(
      `https://employees.archenterprises.co.in/api/api/leave-requests/${leave.id}/status`,
      { status: 'Approved' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Only add leave days if previous status was not Approved
    if (leave.status !== 'Approved') {
      const typeMap = {
        'pl leave': 'pl',
        'privilege leave': 'pl',
        'paid leave': 'pl',
        pl: 'pl',
        'casual leave': 'casual',
        cl: 'casual',
        'sick leave': 'sick',
        sl: 'sick',
        'medical leave': 'medical',
        m: 'medical',
        'half day': 'casual', // ✅ Half day counts in casual leave
        'half-day': 'casual'
      };
      const leaveType = typeMap[leaveTypeLower];
      if (!leaveType) throw new Error(`❌ Unknown leaveType: ${leave.leaveType}`);

      await axios.post(
        'https://employees.archenterprises.co.in/api/api/update-used-leaves',
        {
          name: userName,
          leave_type: leaveType,
          days: totalDays // ✅ Add days (0.5 if half-day)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    await this.fetchLeaves();
    toastSuccess(`Leave approved successfully! (${totalDays} day(s) counted)`);

  } catch (error) {
    console.error('❌ Approve leave failed:', error);
    toastSuccess('Could not approve leave – check console/network tab.');
  } finally {
    this.busyLeave = { id: null, action: null };
  }
},


async rejectLeave(leave) {
  if (this.busyLeave.id) return;
  this.busyLeave = { id: leave.id, action: 'Rejected' };

  try {
    const token = localStorage.getItem('token');
    const userName = leave.name || this.loggedInUserName;

    await axios.patch(
      `https://employees.archenterprises.co.in/api/api/leave-requests/${leave.id}/status`,
      { status: 'Rejected' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // ✅ Subtract days **only if previous status was Approved**
    if (leave.status === 'Approved') {
      const totalDays = this.calculateLeaveDays(leave.fromDate, leave.toDate);
      const typeMap = {
        'pl leave': 'pl',
        'privilege leave': 'pl',
        'paid leave': 'pl',
        pl: 'pl',
        'casual leave': 'casual',
        cl: 'casual',
        'sick leave': 'sick',
        sl: 'sick',
        'medical leave': 'medical',
        m: 'medical'
      };
      const leaveType = typeMap[(leave.leaveType || '').toLowerCase().trim()];
      if (!leaveType) throw new Error(`❌ Unknown leaveType: ${leave.leaveType}`);

      await axios.post(
        'https://employees.archenterprises.co.in/api/api/update-used-leaves',
        {
          name: userName,
          leave_type: leaveType,
          days: -totalDays // ✅ Subtract days
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    await this.fetchLeaves();

  } catch (e) {
    console.error('Reject failed:', e);
    toastSuccess('Could not reject leave – try again.');
  } finally {
    this.busyLeave = { id: null, action: null };
  }
},



    async rejectLeave(leave) {
  if (this.busyLeave.id) return;

  const previousStatus = leave.status; // ✅ store previous status
  this.busyLeave = { id: leave.id, action: 'Rejected' };

  try {
    const token = localStorage.getItem('token');
    const userName = leave.name || this.loggedInUserName;

    // Step 1: Update leave status to Rejected
    await axios.patch(
      `https://employees.archenterprises.co.in/api/api/leave-requests/${leave.id}/status`,
      { status: 'Rejected' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Step 2: Subtract leave days only if it was previously Approved
    if (previousStatus === 'Approved') {
      const totalDays = this.calculateLeaveDays(leave.fromDate, leave.toDate);

      const typeMap = {
        'pl leave': 'pl',
        'privilege leave': 'pl',
        'paid leave': 'pl',
        pl: 'pl',
        'casual leave': 'casual',
        cl: 'casual',
        'sick leave': 'sick',
        sl: 'sick',
        'medical leave': 'medical',
        m: 'medical'
      };
      const leaveType = typeMap[(leave.leaveType || '').toLowerCase().trim()];

      await axios.post(
        'https://employees.archenterprises.co.in/api/api/update-used-leaves',
        {
          name: userName,
          leave_type: leaveType,
          days: -totalDays // ✅ negative to subtract
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    await this.fetchLeaves();

  } catch (e) {
    console.error('Reject failed:', e);
    toastSuccess('Could not reject leave – try again.');
  } finally {
    this.busyLeave = { id: null, action: null };
  }
},


    async fetchLeaves() {
      this.loadingLeaves = true
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(
          'https://employees.archenterprises.co.in/api/api/leave-requests',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        this.leaveRequests = response.data
        console.log('Fetched leaveRequests sample:', JSON.parse(JSON.stringify(this.leaveRequests[0])))
      } catch (error) {
        console.error('Failed to fetch leave requests:', error)
        toastSuccess('Error loading leave requests.')
      } finally {
        this.loadingLeaves = false
      }
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    },
    handleTypedFileUpload(event) {
      const file = event.target.files[0]
      if (this.selectedDocumentType && file) {
        this.typedDocuments[this.selectedDocumentType] = file
        this.registerForm.documents = Object.values(this.typedDocuments)
      } else {
        toastSuccess('Please select a document type before uploading.')
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },
    generatePassword() {
      const chars =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+'
      let password = ''
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      this.registerForm.password = password
    },
    goTo(route) {
      this.$router.push(`/${route}`)
    },
    openRegisterForm() {
      this.resetForm()
      this.showRegister = true
    },
    closeRegisterForm() {
      this.showRegister = false
      this.resetForm()
    },
    async handleRegister() {
      try {
        const formData = new FormData()
        for (const key in this.registerForm) {
          if (key === 'documents') {
            this.registerForm.documents.forEach((file) =>
              formData.append('documents', file)
            )
          } else {
            formData.append(key, this.registerForm[key])
          }
        }

        const url = this.isEditMode
          ? `https://employees.archenterprises.co.in/api/api/users/${this.editingName}`
          : 'https://employees.archenterprises.co.in/api/api/register'

        const method = this.isEditMode ? 'put' : 'post'

        await axios({
          method,
          url,
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        toastSuccess(
          this.isEditMode
            ? 'User updated successfully!'
            : 'Registration successful!'
        )
        this.showRegister = false
        this.resetForm()
        this.fetchUsers()
      } catch (error) {
        console.error('Register error:', error)
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          toastSuccess(`Operation failed: ${error.response.data.message}`)
        } else {
          toastSuccess('Operation failed due to network or server error.')
        }
      }
    },
    handleFileUpload(event) {
      this.registerForm.documents = Array.from(event.target.files)
    },
    resetForm() {
      this.registerForm = {
        name: '',
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
      this.isEditMode = false
      this.editingName = null
    },
    
    editUser(user) {
      this.registerForm = {
        name: user.name || '',
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
        documents: [],
      }
      this.isEditMode = true
      this.editingName = user.name
      this.showRegister = true
    },
    async deleteUser(name) {
      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await axios.delete(
            `https://employees.archenterprises.co.in/api/api/users/${encodeURIComponent(name)}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          )
          this.fetchUsers()
          toastSuccess('User deleted successfully!')
        } catch (error) {
          toastSuccess('Failed to delete user.')
          console.error(error)
        }
      }
    },
    logout() {
      const token = localStorage.getItem('token')
      axios
        .post(
          'https://employees.archenterprises.co.in/api/api/logout',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .finally(() => {
          localStorage.removeItem('token')
          this.$router.push('/auth')
        })
    },
  },

  mounted() {
    const token = localStorage.getItem('token')
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null')

    // Redirect to auth if no token
    if (!token) {
      this.$router.push('/auth')
      return
    }

    this.fetchLeaves()
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)

    
    // Save logged in user's name for fallback use
    if (storedUser && storedUser.name) this.loggedInUserName = storedUser.name

    // Role-based access: employees should not access this admin page
    const role = (storedUser && storedUser.role) ? String(storedUser.role).toLowerCase() : null
    if (role === 'employee' || role === 'staff') {
      // Redirect employees to their dashboard
      this.$router.push('/employee/dashboard')
      return
    }

    // For admin / hr / crm etc. fetch users for admin screens
    this.fetchUsers()
  },
}
</script>



<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

.head-title{
      color: white;
    display: flex;
    gap: 7px;
    text-decoration: none;
font-family: cursive;
    align-items: center; width: 100%;
}
/* ===========================
   Stylish HR Table Design
=========================== */
.user-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  font-family: "Poppins", sans-serif;
}

/* Header */
.user-table thead tr {
  /* background: linear-gradient(90deg, #02524b, #038c7f); */
  color: #fff;
  font-size: 15px;
}

.user-table th {
  text-align: center;
  padding: 14px;
  font-weight: 600;
}

/* Table Rows */
.user-table tbody tr {
  background: #ffffff;
  box-shadow: 0px 5px 10px rgba(0,0,0,0.07);
  border-radius: 10px;
  transition: all 0.25s ease-in-out;
}

.user-table tbody tr:hover {
  transform: scale(1.02);
  box-shadow: 0px 10px 20px rgba(0,0,0,0.15);
}

.user-table td {
  padding: 12px;
  font-size: 14px;
  text-align: center;
  
}

/* ===========================
   Custom Status Badges
=========================== */
.badge {
  padding: 6px 12px;
  border-radius: 25px;
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  background-color: #1da75a !important;
  color: #fff !important;
}

.badge-danger {
  background-color: #d9534f !important;
  color: #fff !important;
}

.badge-secondary {
  background-color: #607d8b !important;
  color: #fff !important;
}

/* ===========================
   Approve / Reject Buttons
=========================== */
.btn-group .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  border-radius: 8px;
  transition: 0.3s ease;
}

.btn-success {
  background-color: #2e8b57;
  border: none;
}

.btn-success:hover:not(:disabled) {
  background-color: #246c45;
  transform: scale(1.12);
}

.btn-danger {
  background-color: #c62828;
  border: none;
}

.btn-danger:hover:not(:disabled) {
  background-color: #a71d1d;
  transform: scale(1.12);
}

/* Disable state smooth UI */
.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ===========================
   "Show More Leaves" Button
=========================== */
.btn-info {
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: 0.3s ease;
}

.btn-info:hover {
  transform: scale(1.08);
}

/* ===========================
   RESPONSIVE
=========================== */
@media (max-width: 768px) {
  .user-table th, .user-table td {
    font-size: 12px;
    padding: 8px;
  }

  .btn-group .btn {
    width: 30px;
    height: 30px;
  }
}

.mobile-menu-icon {
  font-size: 20px;
  cursor: pointer;
  transition: color 0.3s ease, transform 0.3s ease;
}

.mobile-menu-icon:hover {
  color: #ffdd57;
  transform: scale(1.2);
}
.logo-img {
  height: 70px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-info{
  background: var(--primary);
  color: white;
  padding: 12px 16px!important ;
}
.fa-spinner {
  font-size: 0.9rem;   /* keep it similar to the other icons */
}

.badge {
  padding: 4px 10px;
  border-radius: 4px;
  color: white;
  font-size: 0.75rem;
}
.badge-success { background-color: #28a745; }
.badge-danger { background-color: #dc3545; }
.badge-secondary { background-color: var(--text); }

.mobile-menu-icon {
  font-size: 22px;
  margin-left: 10px;
  cursor: pointer;
  display: none;
}

@media (max-width: 768px) {
  .mobile-menu-icon {
    display: inline-block;
  }

  .sidebar {
    position: absolute;
    z-index: 1000;
    width: 240px;
    height: 100vh;
    background-color: var(--text);
  }

  .expanded-content {
    margin-left: 0 !important;
    transition: margin 0.3s ease-in-out;
  }
}


@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 20px 15px;
  }

  .sidebar {
    width: 100%;
    padding: 20px;
    border-radius: 10px;
  }

  .content {
    padding: 20px;
  }

  .user-table {
    display: block;
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
  }

  .user-table th,
  .user-table td {
    font-size: 14px;
    padding: 10px 12px;
  }

  .btn-group {
    flex-direction: column;
    gap: 6px;
  }

  .attractive-btn {
    font-size: 13px;
    padding: 5px 12px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .header {
    flex-direction: row;
    align-items: flex-start;
    gap: 10px;
    padding: 15px;
  }
.layout{
    align-self: anchor-center;

  }
  .logo {
    font-size: 20px;
  }

  .logout-btn {
    width: 100%;
    margin-top: 10px;
  }

  h2 {
    font-size: 18px;
  }

  .content {
    padding: 15px;
  }

  .btn {
    font-size: 12px;
    padding: 10px 0;
  }
}

.password-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-wrapper input {
  flex: 1;
}

.toggle-btn,
.generate-btn {
  padding: 6px 10px;
  background-color: var(--primary);
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.toggle-btn i {
  pointer-events: none;
}

.toggle-btn:hover,
.generate-btn:hover {
  background-color: var(--text);
}

.user-table td .btn-group {
  display: flex;
  gap: 0.5rem;
}
/* Layout */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text);
}
.company-name {
  font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
}
/* Header */
.header {
  font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, .3);
 background-color: var(--primary); 
  color: white;
  padding: 8px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15); */
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo {
  font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
}

.menu-btn, .logout-btn {
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.menu-btn {
  background-color: #28a745;
  color: white;
  margin-right: 15px;
}

.menu-btn:hover {
  background-color: #218838;
}

.logout-btn {
  background-color: white;
  color: #003977;
  border: 2px solid #007bff;
}

.logout-btn:hover {
  background-color: #e7f1ff;
}

/* Main Content */
.main-content {
  display: flex;
  flex: 1;
  padding: 30px;
  gap: 20px;
}

/* Sidebar */
.sidebar {
  background-color: #ffffff;
  width: 220px;
  padding: 25px 20px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  font-weight: 600;
  color: var(--text);
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 14px 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sidebar li:hover {
  background-color: var(--primary);
  color: white;
  font-weight: 700;
}

/* Content Section */
.content {
  flex: 1;
  background-color: #a5d5cf33;
  padding: 30px 40px;
  border-radius: 15px;
  /* box-shadow: 0 5px 30px rgba(0,0,0,0.08); */
  overflow-x: auto;
}

h2 {
  margin-bottom: 30px;
  color: var(--text);
  font-weight: 800;
  text-transform: uppercase;
  font-size: 21px;
  border-bottom: 2px solid var(--primary);
  padding-bottom: 8px;
}

/* User Table */
.user-table {
  width: 100%;
  border-collapse: separate;
 border-spacing: 6px 9px;
}

.user-table th,
.user-table td {
  text-align: left;
  font-size: 16px;

}

.user-table th {
  padding: 11px 20px;
  background-color: var(--primary);
  font-weight: 700;
  border-bottom: none;
  border-radius: 12px 12px 0 0;
}

.user-table tbody tr {
  background-color: #fefefe;
  box-shadow: 0 1px 5px rgba(0,0,0,0.07);
  border-radius: 10px;
  transition: transform 0.2s ease;
}

.user-table tbody tr:hover {
  background-color: #e9f5ff;
  transform: translateX(5px);
}

.user-table tbody td {
  border: none;
  vertical-align: middle;
}

/* Footer */
.footer {
  background-color: #343a40;
  color: white;
  text-align: center;
  padding: 15px 0;
  font-size: 14px;
  font-weight: 500;
  margin-top: auto;
  letter-spacing: 0.6px;
}

/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 97vw;
  height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 0 15px;
}

/* Modal Card */
.modal-card {
  background-color: white;
  width: 100%;
  border-radius: 20px;
  padding: 40px 50px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  max-height: 86vh;
  overflow-y: auto;
  animation: slideDown 0.4s ease forwards;
  position: relative;

  /* Hide scrollbar but allow scroll */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.modal-card::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}


@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal Title */
.modal-title {
  font-size: 32px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 35px;
  color: var(--text);
  letter-spacing: 1.3px;
}

/* Form Layout */
.attractive-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Form Rows */
.form-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.form-row .input-group {
  flex: 1 1 48%;
  display: flex;
  flex-direction: column;
}

/* Full width input group */
.input-group.full-width {
  flex: 1 1 100%;
}

/* Input Group */
.input-group label {
  font-weight: 700;
  margin-bottom: 10px;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
}

.input-group input,
.input-group select,
.input-group textarea {
  padding: 14px 18px;
  border: 2px solid #ced4da;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: inset 0 1px 4px rgba(0,0,0,0.08);
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.3);
  background-color: #f9fbff;
}

/* Textarea resize */
.input-group textarea {
  resize: vertical;
  min-height: 56px;
  font-family: inherit;
}

/* Modal Buttons */
.modal-buttons {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.btn {
  flex: 1;
  padding: 14px 0;
  font-weight: 700;
  font-size: 0.9rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
  box-shadow: 0 6px 15px rgba(0, 123, 255, 0.4);
}

.btn-primary:hover {
  background-color: var(--text);
  box-shadow: 0 8px 18px rgba(0, 86, 179, 0.6);
}

.btn-secondary {
  background-color: var(--text);
  color: white;
  box-shadow: 0 6px 15px rgba(108, 117, 125, 0.4);
}

.btn-secondary:hover {
  background-color: var(--primary);
  box-shadow: 0 8px 18px rgba(90, 98, 104, 0.6);
}

/* Fade Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.35s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 900px) {
  .form-row .input-group {
    flex: 1 1 100%;
  }

  .modal-card {
    padding: 30px 25px;
  }
}

@media (max-width: 480px) {
  .header {
    flex-direction: row;
    gap: 10px;
  }
  .menu-btn, .logout-btn {
    width: 100%;
  }
}
.attractive-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-weight: 600;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  user-select: none;
}

.btn-primary.attractive-btn {
  background-color: var(--primary);
  border: none;
  color: white;
}

.btn-primary.attractive-btn:hover {
  background-color: var(--text);
  box-shadow: 0 4px 12px rgba(13,110,253,0.6);
}

.btn-danger.attractive-btn {
  background-color: #dc3545;
  border: none;
  color: white;
}

.btn-danger.attractive-btn:hover {
  background-color: #bb2d3b;
  box-shadow: 0 4px 12px rgba(220,53,69,0.6);
}

.attractive-btn i {
  font-size: 14px;
}

</style>
