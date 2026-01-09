

<template>
  <div class="layout">
    <!-- Header -->
    <header class="header">
       <a href="https://employees.archenterprises.co.in/">
  <img src="https://archenterprises.co.in/ajay/ajay.png" style="height: 65px;" alt="Logo">
</a>

      🅰️RCH360⚙️
      <i class="fas fa-bars mobile-menu-icon" @click="toggleSidebar" v-if="isMobile"></i>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

     <section
  class="content"
  v-if="!isMobile || !isSidebarVisible"
  :class="{ 'expanded-content': isMobile && !isSidebarVisible }"
>

        <h2>Attendance Management System</h2>
        <p class="current-date">Date: {{ currentDate }}</p>

        <div class="table-responsive">
          <table class="table user-table">
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Employee Name</th>
                <th>Mark</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(employee, index) in employees" :key="index">
                <td>{{ employees.id }}</td>
                <td>{{ employees.name }}</td>
                <td>
                  <div class="btn-group" role="group">
                    <button
                      :class="['btn', 'btn-sm', 'attractive-btn', employees.status === 'present' ? 'btn-success clicked' : 'btn-outline-success']"
                      @click="markAttendance(index, 'present')"
                    >
                      <i class="fas fa-check-circle"></i> Present
                    </button>

                    <button
                      :class="['btn', 'btn-sm', 'attractive-btn', employees.status === 'absent' ? 'btn-danger clicked' : 'btn-outline-danger']"
                      @click="markAttendance(index, 'absent')"
                    >
                      <i class="fas fa-times-circle"></i> Absent
                    </button>

                    <button
                      :class="['btn', 'btn-sm', 'attractive-btn', employees.status === 'onsite' ? 'btn-warning clicked' : 'btn-outline-warning']"
                      @click="markAttendance(index, 'onsite')"
                    >
                      🏢 On Site
                    </button>

                    <button
                      :class="['btn', 'btn-sm', 'attractive-btn', employees.status === 'halfday' ? 'btn-info clicked' : 'btn-outline-info']"
                      @click="markAttendance(index, 'halfday')"
                    >
                      ⏳ Half Day
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
</template>

<script>
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'


export default {
    components: {
    Sidebar
  },
  data() {
    return {

      isMobile: false,
isSidebarVisible: true,

         currentDate: '',
         employees: [],
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
    setDate() {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      this.currentDate = `${dd}-${mm}-${yyyy}`;
    },
    markAttendance(index, status) {
      this.employees[index].status = status;
    },


    goTo(route) {
      this.$router.push(`/${route}`)
    },

    async fetchEmployees() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/employees')
        this.employees = response.data.map(emp => ({
          id: emp.id,
          name: emp.username || emp.name || emp.full_name,
          status: '',
        }))
      } catch (error) {
        console.error('Failed to fetch employees:', error)
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
       this.fetchEmployees()
    }
    this.setDate();
  }
}
</script>




<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
.logo-img {
  height: 70px;
}
.company-name {
  font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
}
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
  .header {
    flex-direction: row;
    justify-content: space-between;
  }

  .btn-group {
    flex-direction: column;
    gap: 5px;
  }

  .user-table th,
  .user-table td {
    font-size: 14px;
    white-space: nowrap;
  }

  .user-table thead {
    display: none;
  }

  .user-table tr {
    display: block;
    margin-bottom: 15px;
  }

  .user-table td {
    display: block;
    text-align: right;
    position: relative;
    padding-left: 50%;
  }

  .user-table td::before {
    content: attr(data-label);
    position: absolute;
    left: 10px;
    width: 45%;
    text-align: left;
    font-weight: bold;
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

.current-date {
  font-weight: bold;
  margin-bottom: 10px;
  color: #427172;
}
.attractive-btn {
  font-weight: 600;
  transition: all 0.3s ease;
  margin: 2px;
  padding: 6px 12px;
  border-radius: 4px;
}

.btn-outline-info {
  background-color: rgb(255, 255, 255);
  border: 1px solid rgb(6, 184, 201);
  color: rgb(9, 133, 145);
}
.btn-outline-info:hover {
  background-color: rgb(6, 168, 183);
  color: white;
}

.btn-outline-warning {
  background-color: rgb(255, 255, 255);
  border: 1px solid rgb(255, 196, 0);
  color: rgb(126, 97, 4);
}
.btn-outline-warning:hover {
  background-color: rgb(255, 196, 0);
  color: rgb(7, 0, 0);
}

.btn-outline-success {
  background-color: white;
  border: 1px solid #28a745;
  color: #28a745;
}
.btn-outline-success:hover {
  background-color: #28a745;
  color: white;
}

.btn-outline-danger {
  background-color: white;
  border: 1px solid #dc3545;
  color: #dc3545;
}
.btn-outline-danger:hover {
  background-color: #dc3545;
  color: white;
}

.clicked {
  transform: scale(1.05);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
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


.logout-btn {
    background-color: #000000;
    color: #ffffff;
    margin-bottom: 22px;
}

.logout-btn:hover {
 background-color: #a2a2a2;
    color: #000000;
    margin-bottom: 22px;
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
  background-color: #d7e1eb;
  font-weight: 700;
  border-bottom: none;
  /* border-radius: 12px 12px 0 0; */
}

.user-table tbody tr {
  background-color: #fefefe;
  box-shadow: 0 1px 5px rgba(0,0,0,0.07);
  border-radius: 10px;
  transition: transform 0.2s ease;
}

.user-table tbody tr:hover {
  /* background-color: #e9f5ff; */
  transform: translateX(1px);
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
  font-size: 12px;
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
  background-color: #6c7d6d;
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
  color: white;
  box-shadow: 0 4px 12px rgba(220,53,69,0.6);
}

.btn-success.attractive-btn:hover {
  background-color: #368e0d;
  box-shadow: 0 4px 12px rgba(62, 213, 7, 0.6);
}


.btn-warning.attractive-btn:hover {
  background-color: #e8ca06;
  box-shadow: 0 4px 12px #e8ca06;
}

.btn-info.attractive-btn:hover {
  background-color: #078795;
  box-shadow: 0 4px 12px #078795;
}

.btn-info.attractive-btn {
  background-color: #078795;
  border: none;
  color: white;
}


.btn-success.attractive-btn {
  background-color: #368e0d;
  border: none;
  color: white;
}
.btn-warning.attractive-btn {
  background-color: #e8ca06;
  border: none;
  color: rgb(6, 0, 0);
}
.attractive-btn i {
  font-size: 14px;
}

</style>
