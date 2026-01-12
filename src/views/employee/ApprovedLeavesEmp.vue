

<template>
  <div class="layout">
    <!-- Header -->
   <header class="header">
     <div class="head-title"><a href="https://employees.archenterprises.co.in/">
        <img
          src="https://archenterprises.co.in/ajay/ajay.png"
          style="height: 65px;"
          alt="Logo"
        />
         </a>
         🅰️RCH360⚙️
     
      </div>
      <i class="fas fa-bars mobile-menu-icon" @click="toggleSidebar" v-if="isMobile"></i>
    </header>
    <!-- Main Content -->
    <div class="main-content">
       <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
  <h2>Approved Leaves</h2>
  <table class="table table-striped table-bordered user-table">
   <thead class="thead-dark">
  <tr>
    <!-- <th>Employee Name</th>
    <th>Department</th> -->
    <th>Leave Type</th>
    <th>Reason</th>
    <th>From Date</th>
    <th>To Date</th>
    <th>Status</th>          <!-- NEW -->
    <!-- <th>Take Action</th> -->
  </tr>
</thead>

<tbody>
  <!-- show all leaves -->
  <template v-if="leaveRequests.length">
    <tr v-for="leave in leaveRequests" :key="leave.id">
      <td>{{ leave.leaveType }}</td>
      <td>{{ leave.reason }}</td>
      <td>{{ leave.fromDate }}</td>
      <td>{{ leave.toDate }}</td>
      <td>
        <span :class="{
          'badge badge-success': leave.status === 'Approved',
          'badge badge-danger' : leave.status === 'Rejected',
          'badge badge-secondary': leave.status === 'Pending'
        }">
          {{ leave.status }}
        </span>
      </td>
    </tr>
  </template>

  <!-- no records fallback -->
  <tr v-else>
    <td colspan="5" class="text-center py-3">
      No Approved applications found.
    </td>
  </tr>
</tbody>


  </table>
</section>

    </div>

    <!-- <footer class="footer">
      &copy; 2025 Arch Enterprises. All rights reserved.
    </footer> -->
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from './components/Sidebar.vue'


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
      editingId: null,  // changed from editingEmail to editingId
      registerForm: {
        id: '',  // include id for edit
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
  methods: {
    async fetchUserInfo() {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('https://employees.archenterprises.co.in/api/api/user', {
      headers: { Authorization: `Bearer ${token}` }
    });
    this.user = response.data;
    this.fetchLeaves(); // 👈 Fetch leaves *after* user is known
  } catch (error) {
    console.error('Error fetching user info:', error);
    this.$router.push('/auth');
  }
},

   async updateLeaveStatus(leaveId, status) {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.patch(
      `https://employees.archenterprises.co.in/api/api/leave-requests/${leaveId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    alert('Status updated successfully!');
    this.fetchLeaves(); // Refresh list
  } catch (error) {
    console.error('Status update failed', error);
    alert('Could not update status – please try again.');
  }
},

approveLeave(leave) { this.updateLeaveStatus(leave.id, 'Approved'); },
rejectLeave(leave)  { this.updateLeaveStatus(leave.id, 'Rejected'); },


   async fetchLeaves() {
  try {
    const token = localStorage.getItem('token');

    // If your API supports a status filter, keep the params line.
    // Otherwise remove `params` and filter entirely on the front‑end.
    const { data } = await axios.get('https://employees.archenterprises.co.in/api/api/leave-requests', {
      headers: { Authorization: `Bearer ${token}` },
      params: { status: 'Approved' }          // 👈 fetch only approved
    });

    // Keep only the current user’s rejected leaves
    if (this.user && this.user.name) {
      this.leaveRequests = data.filter(
        leave =>
          leave.name === this.user.name &&
          leave.status === 'Approved'         // 👈 ensure status
      );
    } else {
      this.leaveRequests = [];
    }
  } catch (error) {
    console.error('Failed to fetch leave requests:', error);
    alert('Error loading leave requests.');
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
    this.registerForm.documents = Object.values(this.typedDocuments); // update form data
  } else {
    alert('Please select a document type before uploading.');
  }
},

    togglePasswordVisibility() {
  this.showPassword = !this.showPassword
},

generatePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+'
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
          ? `https://employees.archenterprises.co.in/api/api/users/${this.editingId}`   // use id here
          : 'https://employees.archenterprises.co.in/api/api/register'

        const method = this.isEditMode ? 'put' : 'post'

        await axios({
          method,
          url,
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })

        alert(this.isEditMode ? 'User updated successfully!' : 'Registration successful!')
        this.showRegister = false
        this.resetForm()
        this.fetchUsers()
      } catch (error) {
        console.error('Register error:', error)
        if (error.response && error.response.data && error.response.data.message) {
          alert(`Operation failed: ${error.response.data.message}`)
        } else {
          alert('Operation failed due to network or server error.')
        }
      }
    },

    handleFileUpload(event) {
      this.registerForm.documents = Array.from(event.target.files)
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
        
      }
      this.isEditMode = false
      this.editingId = null
    },

    async fetchUsers() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.users = response.data
      } catch (error) {
        alert('Failed to fetch users')
        console.error(error)
      }
    },

    editUser(user) {
      // Populate form with user data for editing
      this.registerForm = {
        id: user.id || '',               // assign id here
        empId: user.empId || '',
        username: user.username || '',
        email: user.email || '',
        gender: user.gender || '',
        department: user.department || '',
        city: user.city || '',
        address: user.address || '',
        mobile: user.mobile || '',
        keyResponsibility: user.keyResponsibility || '',
        password: '', // password not required on edit
        documents: []
      }
      this.isEditMode = true
      this.editingId = user.id   // set editingId here
      this.showRegister = true
    },

    async deleteUser(id) {
      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await axios.delete(`https://employees.archenterprises.co.in/api/api/users/${encodeURIComponent(id)}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
          this.fetchUsers()
          alert('User deleted successfully!')
        } catch (error) {
          alert('Failed to delete user.')
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
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        .finally(() => {
          localStorage.removeItem('token')
          this.$router.push('/auth')
        })
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
    this.fetchUserInfo(); // 👈 NEW: Get the current user
  }
}
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
.head-title{
      color: white;
    display: flex;
    gap: 7px;
    text-decoration: none;
    align-items: center;
}
.badge {
  padding: 4px 10px;
  border-radius: 4px;
  color: white;
  font-size: 0.75rem;
}
.badge-success { background-color: #28a745; }
.badge-danger { background-color: #dc3545; }
.badge-secondary { background-color: #6c757d; }

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
    background-color: #2c3e50;
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
    white-space: normal;
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
  background-color: #5f9ea0;
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
  background-color: #426b6c;
}

.user-table td .btn-group {
  display: flex;
  gap: 0.5rem;
}
/* Layout */
.layout {
  display: flex;
  align-self: anchor-center;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #427778;
}

/* Header */
.header {
  font-size: 17px;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, .3);
 background-color: cadetblue; 
  color: white;
  padding: 0 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  color: #495057;
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
  background-color: #5f9ea0;
  color: white;
  font-weight: 700;
}

/* Content Section */
.content {
  flex: 1;
  background-color: #f0f2f8;
  padding: 30px 40px;
  border-radius: 15px;
  /* box-shadow: 0 5px 30px rgba(0,0,0,0.08); */
  overflow-x: auto;
}

h2 {
  margin-bottom: 30px;
  color: #417475;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 21px;
  border-bottom: 2px solid #5f9ea0;
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
   padding: 11px 20px;
  text-align: left;
  font-size: 16px;
  color: #427778;
}

.user-table th {
  padding: 11px 20px;
 background-color: #5f9ea0;
      color: #ffffff;
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
  color: #518587;
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
  color: #427778;
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
  border-color: #5f9ea0;
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
  background-color: #5f9ea0;
  color: white;
  box-shadow: 0 6px 15px rgba(0, 123, 255, 0.4);
}

.btn-primary:hover {
  background-color: #426b6c;
  box-shadow: 0 8px 18px rgba(0, 86, 179, 0.6);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  box-shadow: 0 6px 15px rgba(108, 117, 125, 0.4);
}

.btn-secondary:hover {
  background-color: #5a6268;
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
    font-size: 17px;
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
  background-color: #5f9ea0;
  border: none;
  color: white;
}

.btn-primary.attractive-btn:hover {
  background-color: #426b6c;
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
/* Hide From Date & To Date on mobile */
@media (max-width: 768px) {
  .user-table th:nth-child(3),
  .user-table th:nth-child(4),
  .user-table td:nth-child(3),
  .user-table td:nth-child(4) {
    display: none;
  }
  .main-content{
    padding: 0px;
  }
  .content {
    transition: opacity 0.3s ease;
  }
  .user-table th{
    font-size: 13px;
  }
  .content{
    padding: 4px 10px;
  }
  h2{
    font-size: 17px;
  }
  .user-table tbody td{
    font-size: 12px;
  }
  .badge{
        font-size: 11px;
  }
 .user-table{
    place-items: anchor-center;
  }
  
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 35px;
}


.header-title {
  flex: 1;
  text-align: center;
  color: white;
  margin: 0;
  font-size: 1.3rem;
}

.mobile-menu-icon {
  font-size: 22px;
  color: white;
  cursor: pointer;
}

</style>