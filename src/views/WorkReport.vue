
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

      <div class="main-content-work-report">
        <div class="report-container">
          <h2>📝 Work Reports</h2>
 <button class="btn btn-primary attractive-btn" @click="openAssignTaskModal">
          <i class="fas fa-tasks"></i> Assign Task
        </button>
          <div class="search-group">
            <input
              type="text"
              v-model="filters.search"
              class="input-bar"
              placeholder="Search tasks..."
            />
            <span class="search-icon"><i class="fas fa-search"></i></span>
          </div>

          <!-- Filters -->
          <div class="filter-bar">
            <div class="filter-group">
             <select v-model="filters.name" class="filter-input">
  <option value="">Filter By Name</option>
  <option
    v-for="emp in filteredEmployeeList"
    :key="emp.name"
    :value="emp.name"
  >
    {{ emp.name }}
  </option>
</select>


              <input type="date" v-model="filters.date" class="filter-input" />

              <select v-model="filters.month" class="filter-input">
                <option value="">All Months</option>
                <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
              </select>

              <select v-model="filters.status" class="filter-input">
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <button class="btn btn-primary attractive-btn" @click="clearFilters">
                <i class="fas fa-times-circle"></i> Clear Filters
              </button>
            </div>
          </div>

          <!-- Report Cards -->
          <div class="report-grid">
            <transition-group name="fade" tag="div" class="report-grid">
              <div
  class="report-card"
  v-for="report in visibleReports"
  :key="report.id"
  style="cursor: pointer; position: relative;"
>
  <div class="card-header">
    <h3>
      {{ report.name }}
      <span v-if="report.assigned_by_manager" class="manager-tag">
        👔 {{ report.manager_name }}
      </span>
    </h3>

    <span class="status" :class="report.status.toLowerCase()">
      {{ report.status }}
    </span>
  </div>

  <p><strong>Date:</strong> {{ report.date }}</p>
  <p><strong>Assigned To:</strong> {{ report.username || 'Unknown' }}</p>
  <p><strong>Department:</strong> {{ report.department }}</p>
  <p class="summary"><strong>Summary:</strong> {{ report.summary }}</p>
 <button class="edit-task-btn" @click.stop="editTask(report)">
      <i class="fas fa-edit"></i> Edit
    </button>
     <button class="delete-task-btn" @click.stop="deleteTask(report.id)">
      <i class="fas fa-trash-alt"></i> Delete
    </button>
  <!-- ✅ Edit/Delete buttons (Visible only for Manager-assigned tasks) -->
  <div
    v-if="report.assigned_by_manager"
    class="card-actions"
    style="margin-top: 10px; display: flex; gap: 10px;"
  >
   
  </div>
</div>

            </transition-group>
          </div>

          <!-- Load More Button -->
          <div v-if="visibleCount < reports.length" class="load-more-container">
            <button class="btn btn-load-task load-more-btn" @click="loadMore">
              Load More
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Detail Modal -->
    <div class="modal-backdrop" v-if="selectedReport" @click.self="closeModal">
      <div class="modal-card">
        <p class="manager-tag" v-if="selectedReport.assigned_by_manager">
          👔 Assigned by {{ selectedReport.manager_name }}
        </p>

        <p><strong>Task:</strong> {{ selectedReport.name }}</p>
        <p><strong>Date:</strong> {{ selectedReport.date }}</p>
        <p><strong>Completed At:</strong> {{ selectedReport.completed_at }}</p>
        <p><strong>Assigned To:</strong> {{ selectedReport.username }}</p>
        <p><strong>Department:</strong> {{ selectedReport.department }}</p>
        <p>
          <strong>Status:</strong>
          <span :class="'status ' + selectedReport.status.toLowerCase()">{{ selectedReport.status }}</span>
        </p>
        <p><strong>Summary:</strong> {{ selectedReport.summary }}</p>
        <p><strong>Modules:</strong> {{ selectedReport.modules }}</p>

        <div class="modal-buttons">
          <button class="btn btn-primary" @click="closeModal">
            <i class="fas fa-times-circle"></i>&nbsp;Close
          </button>
        </div>
      </div>
    </div>

    <!-- Assign Task Modal -->
    <div class="modal-backdrop" v-if="showAssignTaskModal" @click.self="closeAssignTaskModal">
      <div class="modal-card">
        <h2 class="modal-title">📝 Assign Task</h2>

        <div class="attractive-form">
          <div class="form-row">
           <div class="input-group full-width">
  <label>Task Name</label>
  <input
    type="text"
    v-model="newTask.title"
    placeholder="Enter task name"
    maxlength="50"
  />
  <small>
   {{ newTask.title.length }}/50 characters
  </small>
</div>


           <div class="input-group full-width">
  <label>Description</label>
  <textarea
    v-model="newTask.description"
    placeholder="Enter task description"
    maxlength="250"
    rows="4"
  ></textarea>
  <small>
    {{ newTask.description.length }}/250 characters
  </small>
</div>


            <div class="input-group">
              <label>Assign To</label>
              <select v-model="newTask.user_id">
                <option value="">Select Employee</option>
                <option
                  v-for="emp in filteredEmployeesDropdown"
                  :key="emp.id"
                  :value="emp.id"
                >
                  {{ emp.name }}
                </option>
              </select>
            </div>

            <div class="input-group">
              <label>Due Date</label>
              <input type="date" v-model="newTask.due_date" :min="minDate" />
            </div>

          <div class="input-group">
  <label>Modules</label>
  <input
    type="text"
    v-model="newTask.modules"
    placeholder="Module names"
    maxlength="250"
  />
  <small>
    {{ newTask.modules.length }}/250 characters
  </small>
</div>

          </div>

          <div class="modal-buttons">
            <button class="btn btn-primary" @click="assignTask">
              <i class="fas fa-check-circle"></i> Assign
            </button>
            <button class="btn btn-secondary" @click="closeAssignTaskModal">
              <i class="fas fa-times-circle"></i> Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'

export default {
  components: { Sidebar },
  data() {
    const today = new Date().toISOString().split('T')[0]
    return {
      isEditTaskMode: false,
editTaskId: null,
      managerName: localStorage.getItem('user_name') || 'Assigned',
      selectedReport: null,
      showAssignTaskModal: false,
      visibleCount: 6,
      minDate: today,
      filters: { name: '', date: today, month: (new Date().getMonth() + 1).toString(), status: '', search: '' },
      tasks: [],
      employeeList: [],
      employeesDropdown: [],
      months: [
        { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
        { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
        { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
        { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' }
      ],
      isMobile: false,
      isSidebarVisible: true,
      newTask: {
        title: '',
        description: '',
        user_id: '',
        due_date: '',
        modules: '',
        status: 'Pending',
        priority: 'Task Assigned'
      }
    }
  },
  computed: {
    wordCount() {
    if (!this.newTask.title) return 0;
    return this.newTask.title.trim().split(/\s+/).length;
  },
    // ✅ Hide employees from "Ownership" department in both dropdowns
    filteredEmployeesDropdown() {
      return this.employeesDropdown.filter(emp => emp.department !== 'Ownership')
    },
    filteredEmployeeList() {
      return this.employeeList.filter(emp => emp.department !== 'Ownership' && emp.name)
    },

    reports() {
      return this.tasks
        .map(task => {
          const isManagerAssigned =
            task.assigned_by_manager === true ||
            (task.assigned_by && task.assigned_by !== task.user_id)

          return {
            id: task.id,
            username: task.user?.name || 'Unknown',
            name: task.title,
            date: task.due_date || task.dueDate,
            department: task.user?.department || 'Unknown',
            status: task.status || 'Unknown',
            summary: task.description || 'No summary provided.',
            modules: task.modules || 'N/A',
            completed_at: task.completed_at || 'Not completed',
            assigned_by_manager: isManagerAssigned,
            manager_name: isManagerAssigned ? (task.manager_name || this.managerName) : null
          }
        })
        .filter(task => {
          const nameMatch = !this.filters.name || task.username === this.filters.name
          const dateMatch = !this.filters.date || task.date === this.filters.date
          const monthMatch = !this.filters.month || new Date(task.date).getMonth() + 1 === parseInt(this.filters.month)
          const statusMatch = !this.filters.status || (task.status ? task.status.toLowerCase() === this.filters.status.toLowerCase() : false)

          const searchText = this.filters.search.trim().toLowerCase()
          const searchMatch = !searchText ||
            task.name.toLowerCase().includes(searchText) ||
            task.summary.toLowerCase().includes(searchText) ||
            task.modules.toLowerCase().includes(searchText) ||
            task.username.toLowerCase().includes(searchText) ||
            task.department.toLowerCase().includes(searchText)

          return nameMatch && dateMatch && monthMatch && statusMatch && searchMatch
        })
    },

    visibleReports() {
      return this.reports.slice(0, this.visibleCount)
    }
  },
  methods: {
    editTask(report) {
  // Pre-fill Assign Task modal with selected report
  this.newTask = {
    title: report.name,
    description: report.summary,
    user_id: this.employeesDropdown.find(emp => emp.name === report.username)?.id || '',
    due_date: report.date,
    modules: report.modules,
    status: report.status || 'Pending',
  }

  this.showAssignTaskModal = true
  this.isEditTaskMode = true
  this.editTaskId = report.id
},

deleteTask(id) {
  if (confirm('Are you sure you want to delete this task?')) {
    axios.delete(`https://employees.archenterprises.co.in/api/api/delete-task/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(() => {
        alert('Task deleted successfully!')
        this.fetchReports()
      })
      .catch(err => {
        console.error('Error deleting task:', err)
        alert('Failed to delete task!')
      })
  }
},
    fetchEmployees() {
      axios.get('https://employees.archenterprises.co.in/api/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => {
          this.employeesDropdown = res.data
            .filter(user => user.id && user.name && user.department !== 'Ownership') // ✅ filter applied here too
            .map(user => ({
              id: user.id,
              name: user.name,
              department: user.department
            }))
        })
        .catch(err => {
          console.error('Error fetching employees:', err)
          this.employeesDropdown = []
        })
    },

    openModal(report) { this.selectedReport = report },
    closeModal() { this.selectedReport = null },
    loadMore() { this.visibleCount += 3 },
    clearFilters() {
      this.filters = { name: '', date: '', month: '', status: '', search: '' }
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },
    toggleSidebar() { this.isSidebarVisible = !this.isSidebarVisible },
    openAssignTaskModal() { this.showAssignTaskModal = true },
    closeAssignTaskModal() { this.showAssignTaskModal = false; this.resetNewTask() },
    resetNewTask() {
      this.newTask = {
        title: '',
        description: '',
        user_id: '',
        due_date: '',
        modules: '',
        status: 'Pending'
      }
    },

   assignTask() {
  if (!this.newTask.title || !this.newTask.user_id || !this.newTask.due_date) {
    alert("Please fill all required fields!")
    return
  }

  const url = this.isEditTaskMode
    ? `https://employees.archenterprises.co.in/api/api/update-task/${this.editTaskId}`
    : 'https://employees.archenterprises.co.in/api/api/assign-task'

  const method = this.isEditTaskMode ? 'put' : 'post'

  axios[method](url, this.newTask, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
    .then(() => {
      alert(this.isEditTaskMode ? "Task updated successfully!" : "Task assigned successfully!")
      this.fetchReports()
      this.closeAssignTaskModal()
      this.isEditTaskMode = false
      this.editTaskId = null
    })
    .catch(err => {
      console.error(err)
      alert("Error saving task!")
    })
},


    fetchReports() {
      axios.get('https://employees.archenterprises.co.in/api/api/employee-reports', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(response => {
          this.tasks = response.data
          const namesSet = new Set()
          this.tasks.forEach(task => {
            if (task.user && task.user.name && task.user.department !== 'Ownership') {
              namesSet.add(task.user.name)
            }
          })
          this.employeeList = Array.from(namesSet).map(name => ({ name }))
        })
        .catch(error => { console.error(error) })
    }
  },
  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    this.fetchReports()
    this.fetchEmployees()
  }
}
</script>








<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
/* work report */

.edit-task-btn{
  background-color: #5f9ea0;
    color: white;
    padding: 8px 17px;
    font-size: 11px;
    border-radius: 5px;
    font-weight: 600;
    margin-right: 24px;
}
.delete-task-btn{
  background-color: #ff0018;
    color: white;
    padding: 8px 17px;
    font-size: 11px;
    border-radius: 5px;
    font-weight: 600;
    margin-right: 24px;
}
.search-group {
  position: relative;
  width: 100%;
  max-width: 400px; /* Adjust as needed */
  margin: 0 auto;
}

.input-bar {
  width: 100%;
  padding: 12px 45px 12px 15px; /* Space for the icon */
  border-radius: 25px;
  border: 1px solid #ccc;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.input-bar:focus {
  border-color: #4A90E2;
  box-shadow: 0 4px 12px rgba(74,144,226,0.3);
  outline: none;
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
  font-size: 18px;
  pointer-events: none;
  transition: color 0.3s ease;
}

.input-bar:focus + .search-icon {
  color: #4A90E2;
}

.logo-img {
  height: 70px;
}
.manager-tag {
  background-color: #5f9ea0;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 10px;
  margin-left: 8px;
  display: inline-block;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 97vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4); /* Darker backdrop */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 0 15px;
}


.btn-load-task{
  background-color: #003977!important ;
    color: #fff!important;
   width: 23% !important;
    font-size: 0.8rem!important ;
}
.report-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.report-card {
  width: calc(33.333% - 16px);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.load-more-container {
  width: 100%;
  text-align: center;
  margin-top: 20px;
}

.load-more-btn {
  padding: 10px 20px;
  background-color: #5f9ea0;
  border: none;
  color: white;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
}
.load-more-btn:hover {
  background-color: #45a049;
}
.filter-bar {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
  padding: 10px 0;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.filter-input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  min-width: 160px;
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
    background-color: #2c3e50;
  }

  .expanded-content {
    margin-left: 0 !important;
    transition: margin 0.3s ease-in-out;
  }
}

.status {
  padding: 4px 10px;
  border-radius: 12px;
  background-color: orange;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: bold;
  color: white;
}

.status.completed {
  background-color: #28a745;
}

.status.in-progress {
  background-color: #ffc107;
}

.status.pending {
  background-color: #dc3545;
}
.report-container {
     padding: 30px 40px;
         border-radius: 15px;
  width: 100%;
  font-family: 'Segoe UI', sans-serif;
  background-color: #f4f8fb;
  min-height: 100vh;
}

.heading {
  font-size: 28px;
  text-align: center;
  color: #427172;
  margin-bottom: 2rem;
  font-weight: bold;
}

.report-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.report-card {
  background: linear-gradient(145deg, #ffffff, #e6ecf0);
  border-radius: 16px;
  width: 80%;
  padding: 1.5rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease-in-out;
  border-left: 6px solid #007bff;
}

.report-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
  border-left: 6px solid #00c292;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.report-card h3 {
  margin: 0;
    text-transform: uppercase;
  font-size: 18px;
  color: #2c3e50;
}

.report-card p {
  margin: 6px 0;
  font-size: 14px;
  color: #555;
}

.summary {
  margin-top: 10px;
  /* font-style: italic; */
  color: #020840;
}

.status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: bold;
  color: white;
}

/* ------------------------------------- */
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
.main-content-work-report{
   display: flex;
  flex: 1;
  padding: 0px !important;
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
  width: 68%;
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
  font-size: 1rem;
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
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    /* padding: 15px; */
  }
.report-container{
  background-color: #f4f8fb00;
}
  .sidebar {
    width: 100%;
    margin-bottom: 20px;
  }

  .report-container {
    padding: 15px;
  }

  .report-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 cards per row */
  }

  @media (max-width: 480px) {
    .report-grid {
      grid-template-columns: 1fr; /* fallback to 1 card per row on extra small screens */
    }
  }
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
  background-color: #2e5758;
  border: none;
  color: white;
}

.btn-primary.attractive-btn:hover {
  background-color: #272626;
  box-shadow: 0 4px 12px rgba(57, 58, 59, 0.6);
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
