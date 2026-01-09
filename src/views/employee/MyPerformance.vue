

<template>
  <div class="layout">
    <!-- Header -->
    <header class="header">
      <a href="https://employees.archenterprises.co.in/">
  <img src="https://archenterprises.co.in/ajay/ajay.png" style="height: 65px;" alt="Logo">
</a>

      <i class="fas fa-bars mobile-menu-icon" @click="toggleSidebar" v-if="isMobile"></i>
      <div>
        <button class="logout-btn" @click="logout">Logout</button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="main-content">
    <Sidebar v-if="!isMobile || isSidebarVisible" />

<!-- Hide content when sidebar is visible on mobile -->
<div class="performance-section" v-if="!isMobile || !isSidebarVisible">

    <h2>Performance Overview</h2>

    <!-- Performance Table -->
    <table class="performance-table">
      <thead>
        <tr>
          <th>Month</th>
          <th>Tasks Completed</th>
          <th>Target Achieved (%)</th>
          <th>Attendance (%)</th>
          <th>Remarks</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(entry, index) in performanceData" :key="index">
          <td>{{ entry.month }}</td>
          <td>{{ entry.tasksCompleted }}</td>
          <td>{{ entry.targetAchieved }}%</td>
          <td>{{ entry.attendance }}%</td>
          <td>{{ entry.remarks }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Performance Chart -->
    <div class="chart-container">
      <canvas id="performanceChart"></canvas>
    </div>
  </div>

    </div>
<!-- 
    <footer class="footer">
      &copy; 2025 Arch Enterprises. All rights reserved.
    </footer> -->
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from './components/Sidebar.vue'
import Chart from 'chart.js/auto';


export default {
    components: {
    Sidebar
  },
  data() {
    return {
      isMobile: false,
isSidebarVisible: true,

        performanceData: [
        { month: 'Jan', tasksCompleted: 42, targetAchieved: 85, attendance: 96, remarks: 'Good' },
        { month: 'Feb', tasksCompleted: 38, targetAchieved: 78, attendance: 92, remarks: 'Satisfactory' },
        { month: 'Mar', tasksCompleted: 50, targetAchieved: 90, attendance: 97, remarks: 'Excellent' },
        { month: 'Apr', tasksCompleted: 47, targetAchieved: 88, attendance: 95, remarks: 'Good' },
        { month: 'May', tasksCompleted: 44, targetAchieved: 82, attendance: 94, remarks: 'Good' },
        { month: 'Jun', tasksCompleted: 36, targetAchieved: 75, attendance: 90, remarks: 'Needs Improvement' },
        { month: 'Jul', tasksCompleted: 48, targetAchieved: 89, attendance: 95, remarks: 'Very Good' },
        { month: 'Aug', tasksCompleted: 41, targetAchieved: 84, attendance: 93, remarks: 'Good' },
        { month: 'Sep', tasksCompleted: 45, targetAchieved: 87, attendance: 96, remarks: 'Good' },
        { month: 'Oct', tasksCompleted: 49, targetAchieved: 91, attendance: 97, remarks: 'Excellent' },
        { month: 'Nov', tasksCompleted: 40, targetAchieved: 80, attendance: 92, remarks: 'Satisfactory' },
        { month: 'Dec', tasksCompleted: 43, targetAchieved: 86, attendance: 94, remarks: 'Good' },
      ],
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
    renderChart() {
      const ctx = document.getElementById('performanceChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.performanceData.map((entry) => entry.month),
          datasets: [
            {
              label: 'Tasks Completed',
              data: this.performanceData.map((entry) => entry.tasksCompleted),
              backgroundColor: '#4caf50',
            },
            {
              label: 'Target Achieved (%)',
              data: this.performanceData.map((entry) => entry.targetAchieved),
              backgroundColor: '#2196f3',
            },
            {
              label: 'Attendance (%)',
              data: this.performanceData.map((entry) => entry.attendance),
              backgroundColor: '#ff9800',
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
            },
            title: {
              display: true,
              text: 'Monthly Performance Breakdown',
            },
          },
        },
      });
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
          ? `https://employees.archenterprises.co.in/api/users/${this.editingId}`   // use id here
          : 'https://employees.archenterprises.co.in/api/register'

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
        const response = await axios.get('https://employees.archenterprises.co.in/api/users', {
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
          await axios.delete(`https://employees.archenterprises.co.in/api/users/${encodeURIComponent(id)}`, {
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
          'https://employees.archenterprises.co.in/api/logout',
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

    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    } else {
      this.fetchUsers()
    }
     this.renderChart();
  }
}
</script>




<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

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

.performance-section {
  padding: 20px;
  background: #f9f9ff;
  border-radius: 12px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.performance-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
}
.performance-table th,
.performance-table td {
  padding: 12px;
  border: 1px solid #ccc;
  text-align: center;
}
.performance-table th {
  background-color: #5f9ea0;
  color: white;
}
.chart-container {
  width: 100%;
  max-width: 1000px;
  margin: auto;
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
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #427778;
}

/* Header */
.header {
  font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, .3);
 background-color: cadetblue; 
  color: white;
  padding: 0 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
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
  background-color: white;
  padding: 30px 40px;
  border-radius: 15px;
  box-shadow: 0 5px 30px rgba(0,0,0,0.08);
  overflow-x: auto;
}

h2 {
  margin-bottom: 30px;
  color: #417475;
  font-weight: 700;
  font-size: 21px;
  border-bottom: 2px solid #5f9ea0;
  padding-bottom: 8px;
}

/* User Table */
.user-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
}

.user-table th,
.user-table td {
  padding: 14px 20px;
  text-align: left;
  font-size: 16px;
  color: #427778;
}

.user-table th {
  background-color: #f8f9fa;
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

</style>
