

<template>
  <div class="layout">
    <!-- Header -->
    <header class="header">

      <div class="header-left">
   <a href="https://employees.archenterprises.co.in/">
  <img src="https://archenterprises.co.in/ajay/ajay.png" style="height: 65px;  border-radius: 9px;" alt="Logo">
</a>

    <!-- <h1 class="company-name">ARCH ENTERPRISES</h1> -->
  </div>
     <i class="fas fa-bars mobile-menu-icon" @click="toggleSidebar" v-if="isMobile"></i>
    </header>

    <!-- Main Content -->
    <div class="main-content">
       <Sidebar v-if="!isMobile || isSidebarVisible" />

<div
  class="admin-task-panel"
  v-if="!isMobile || !isSidebarVisible"
  :class="{ 'expanded-content': isMobile && !isSidebarVisible }"
>

    <h2><i class="fa-solid fa-tasks"></i> Task Manager</h2>

    <!-- Toggle Buttons -->
    <div class="toggle-buttons">
      <button
        :class="{ active: showAssignForm }"
        @click="showAssignForm = true"
      >
        Assign Task
      </button>
      <button
        :class="{ active: !showAssignForm }"
        @click="showAssignForm = false"
      >
        View Tasks
      </button>
    </div>

    <!-- Assign Task Form -->
    <transition name="fade">
      <form
        v-if="showAssignForm"
        @submit.prevent="assignTask"
        class="assign-task-form"
      >
        <h3>Assign Task</h3>

        <div class="form-group">
          <label>Task Title</label>
          <input
            v-model="newTask.title"
            type="text"
            required
            placeholder="Enter task title"
          />
        </div>

        <div class="form-group">
          <label>Employee Name</label>
          <input
            v-model="newTask.employee"
            type="text"
            required
            placeholder="Assign to (Employee)"
          />
        </div>

        <div class="form-group">
          <label>Due Date</label>
          <input v-model="newTask.dueDate" type="date" required />
        </div>

       

        <button class="assign-btn" type="submit">Assign Task</button>
      </form>
    </transition>

    <!-- View Tasks by Status -->
    <transition name="fade">
      <div v-if="!showAssignForm" class="task-sections">
        <div
          class="task-group"
          v-for="status in ['Pending', 'In Progress', 'Completed']"
          :key="status"
        >
          <h3>{{ status }} Tasks</h3>
          <div v-if="filteredTasks(status).length === 0" class="no-task">
            No {{ status.toLowerCase() }} tasks.
          </div>

          <div
  class="task-card"
  v-for="(task, index) in filteredTasks(status)"
  :key="index"
  :class="statusClass(task.status)"
>
  <div class="task-card-header">
    <h4>{{ task.title }}</h4>
    <span class="status-tag">{{ task.status }}</span>
  </div>
  <div class="task-card-body">
    <p><i class="fa-solid fa-user"></i> {{ task.employee }}</p>
    <p><i class="fa-solid fa-calendar-day"></i> Due: {{ task.dueDate }}</p>
  </div>
</div>

        </div>
      </div>
    </transition>
  </div>

    </div>

    <!-- <footer class="footer">
      &copy; 2025 Arch Enterprises. All rights reserved.
    </footer> -->
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'


export default {
     name: "AdminTaskManager",
    components: {
    Sidebar
  },
  data() {
    return {
      isMobile: false,
isSidebarVisible: true,

        showAssignForm: true,
      newTask: {
        title: "",
        employee: "",
        dueDate: "",
        status: ""
      },
      tasks: [
        {
          title: "Design login page",
          employee: "Ravi",
          dueDate: "2025-06-15",
          status: "In Progress"
        },
        {
          title: "Fix API bugs",
          employee: "Nisha",
          dueDate: "2025-06-14",
          status: "Pending"
        },
        {
          title: "Update report UI",
          employee: "Ajay",
          dueDate: "2025-06-10",
          status: "Completed"
        }
      ]

     
    }
  },
  mounted() {
    this.checkIfMobile();
window.addEventListener('resize', this.checkIfMobile);

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
  statusClass(status) {
    return {
      'task-card': true,
      'pending': status === 'Pending',
      'in-progress': status === 'In Progress',
      'completed': status === 'Completed',
    };
  },
assignTask() {
  const token = localStorage.getItem('token')
  axios
    .post(
      'https://employees.archenterprises.co.in/api/assign-task',
      {
        title: this.newTask.title,
        employee: this.newTask.employee,
        dueDate: this.newTask.dueDate
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    .then((res) => {
      alert('Task assigned successfully!')
      this.tasks.push({ ...this.newTask, status: 'Pending' })
      this.newTask = { title: '', employee: '', dueDate: '', status: '' }
    })
    .catch((err) => {
      console.error(err)
      alert('Error assigning task')
    })
},

    goTo(route) {
      this.$router.push(`/${route}`)
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

}
</script>




<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

.logo-img {
  height: 70px;
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

.task-card {
  background: #ffffff;
  padding: 18px;
  border-left: 6px solid #4caf50;
  border-radius: 12px;
  margin-bottom: 18px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.task-card:hover {
  transform: scale(1.02);
  background: #f4fef7;
  box-shadow: 0 8px 16px rgba(76, 175, 80, 0.25);
}

.task-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-card-header h4 {
  font-size: 18px;
  color: var(--text);
  margin: 0;
}

.status-tag {
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 20px;
  font-weight: bold;
  color: white;
  text-transform: uppercase;
}

.task-card-body p {
  margin: 6px 0;
  font-size: 14px;
  color: var(--text);
}

.task-card-body i {
  margin-right: 6px;
  color: #4caf50;
}

.task-card.pending {
  border-left-color: #ff9800;
}

.task-card.in-progress {
  border-left-color: #2196f3;
}

.task-card.completed {
  border-left-color: #4caf50;
}

.task-card .status-tag {
  background: #4caf50;
}

.task-card.pending .status-tag {
  background: #ff9800;
}

.task-card.in-progress .status-tag {
  background: #2196f3;
}

.task-card.completed .status-tag {
  background: #4caf50;
}
.admin-task-panel {
  width: 60%;
  margin: 0px auto;
  padding: 30px;
  background: #fdfdfd;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  font-family: "Segoe UI", sans-serif;
}

h2 {
  font-size: 28px;
  text-align: center;
  margin-bottom: 20px;
}

.toggle-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
}

.toggle-buttons button {
  padding: 10px 20px;
  background: #eee;
  border: 1px solid #ccc;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.3s;
  font-weight: bold;
}

.toggle-buttons button:hover {
  background: #d4edda;
}

.toggle-buttons .active {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}

.assign-task-form {
  background: #fafafa;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
}

.assign-task-form h3 {
  margin-bottom: 20px;
  font-size: 22px;
  color: #4caf50;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text);
}

input,
select {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  transition: all 0.3s;
}

input:hover,
select:hover,
input:focus,
select:focus {
  border-color: #4caf50;
  background: #f9fff9;
  outline: none;
}

.assign-btn {
  background: #4caf50;
  color: white;
  padding: 12px 20px;
  border: none;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s ease;
}

.assign-btn:hover {
  background: #388e3c;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.task-sections {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: space-between;
}

.task-group {
  flex: 1 1 30%;
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
}

.task-group h3 {
  margin-bottom: 15px;
  font-size: 20px;
  color: var(--text);
  border-bottom: 1px solid #ddd;
  padding-bottom: 6px;
}

.task-card {
  background: #f1f8f6;
  border-left: 5px solid #4caf50;
  margin-bottom: 15px;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s;
}

.task-card:hover {
  transform: translateY(-5px);
  background: #e9f5ee;
}

.task-card h4 {
  margin: 0 0 5px;
  color: var(--text);
}

.task-card p {
  margin: 3px 0;
  font-size: 14px;
}

.no-task {
  color: #999;
  font-style: italic;
  padding: 10px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
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
  background-color: var(--primary); 
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
  background-color: var(--sidebar);
  padding: 30px 40px;
  border-radius: 15px;
  /* box-shadow: 0 5px 30px rgba(0,0,0,0.08); */
  overflow-x: auto;
}

h2 {
  margin-bottom: 30px;
  color: var(--text);
  font-weight: 700;
  font-size: 21px;
  border-bottom: 2px solid var(--primary);
  padding-bottom: 8px;
  text-transform: uppercase;
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
  color: var(--text);
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
