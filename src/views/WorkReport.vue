<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="main-content-work-report">
        <section class="report-container">
          <div class="content-header-modern">
            <div class="header-left">
              <div class="title-icon">
                <i class="fas fa-file-alt"></i>
              </div>
              <div>
                <h1>Work Reports</h1>
                <p class="subtitle-modern">Manage and track employee tasks</p>
              </div>
            </div>
            <div class="header-buttons">
              <button class="register-btn-modern secondary" @click="showAssignedReport = true">
                <i class="fas fa-chart-bar"></i>
                <span>Report</span>
              </button>
              <button class="register-btn-modern" @click="openAssignTaskModal">
                <i class="fas fa-plus-circle"></i>
                <span>Assign Task</span>
              </button>
            </div>
          </div>

          <!-- Stats Bar -->
          <div class="stats-bar">
            <div class="stat-card">
              <i class="fas fa-tasks"></i>
              <div class="stat-info">
                <span class="stat-value">{{ reports.length }}</span>
                <span class="stat-label">Total Tasks</span>
              </div>
            </div>
            <div class="stat-card pending">
              <i class="fas fa-clock"></i>
              <div class="stat-info">
                <span class="stat-value">{{ pendingTasks }}</span>
                <span class="stat-label">Pending</span>
              </div>
            </div>
            <div class="stat-card progress">
              <i class="fas fa-spinner"></i>
              <div class="stat-info">
                <span class="stat-value">{{ inProgressTasks }}</span>
                <span class="stat-label">In Progress</span>
              </div>
            </div>
            <div class="stat-card completed">
              <i class="fas fa-check-circle"></i>
              <div class="stat-info">
                <span class="stat-value">{{ completedTasks }}</span>
                <span class="stat-label">Completed</span>
              </div>
            </div>
          </div>

          <!-- Search and Filters -->
          <div class="search-filter-section">
            <div class="search-wrapper-modern">
              <i class="fas fa-search search-icon"></i>
              <input
                type="text"
                v-model="filters.search"
                class="search-input-modern"
                placeholder="Search tasks by name, summary, or employee..."
              />
            </div>

            <div class="filter-group-modern">
              <select v-model="filters.name" class="filter-select">
                <option value="">All Employees</option>
                <option v-for="emp in filteredEmployeeList" :key="emp.name" :value="emp.name">
                  {{ emp.name }}
                </option>
              </select>

              <input type="date" v-model="filters.date" class="filter-date" />

              <select v-model="filters.month" class="filter-select">
                <option value="">All Months</option>
                <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
              </select>

              <select v-model="filters.status" class="filter-select">
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Assigned">Assigned Tasks</option>
              </select>

              <button class="clear-filter-btn" @click="clearFilters">
                <i class="fas fa-times-circle"></i> Clear
              </button>
            </div>
          </div>

          <!-- Report Cards Grid -->
          <div class="report-grid-premium">
            <transition-group name="card-fade" tag="div" class="report-grid-premium">
              <div
                class="report-card-premium"
                v-for="report in visibleReports"
                :key="report.id"
                @click="openModal(report)"
              >
                <div class="card-accent" :class="report.status.toLowerCase()"></div>
                <div class="card-header-premium">
                  <div class="header-info">
                    <div class="task-icon">
                      <i class="fas fa-clipboard-list"></i>
                    </div>
                    <div>
                      <h3>{{ report.name }}</h3>
                      <div class="meta-tags">
                        <span v-if="report.assigned_by_manager" class="manager-badge">
                          <i class="fas fa-user-tie"></i> {{ report.manager_name }}
                        </span>
                        <span class="date-badge">
                          <i class="fas fa-calendar-alt"></i> {{ report.date }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span :class="['status-badge-premium', getStatusClass(report.status)]">
                    <i :class="getStatusIcon(report.status)"></i>
                    {{ report.status }}
                  </span>
                </div>

                <div class="card-body-premium">
                  <div class="info-row">
                    <i class="fas fa-user"></i>
                    <span><strong>Assigned To:</strong> {{ report.username }}</span>
                  </div>
                  <div class="info-row">
                    <i class="fas fa-building"></i>
                    <span><strong>Department:</strong> {{ report.department }}</span>
                  </div>
                  <div class="info-row summary">
                    <i class="fas fa-align-left"></i>
                    <span><strong>Summary:</strong> {{ truncateText(report.summary, 100) }}</span>
                  </div>
                  <div class="info-row" v-if="report.comment">
                    <i class="fas fa-comment"></i>
                    <span><strong>Comment:</strong> {{ truncateText(report.comment, 80) }}</span>
                  </div>
                </div>

                <div class="card-footer-premium">
                  <button class="action-edit" @click.stop="editTask(report)">
                    <i class="fas fa-edit"></i> Edit
                  </button>
                  <button class="action-delete" @click.stop="deleteTask(report.id)">
                    <i class="fas fa-trash-alt"></i> Delete
                  </button>
                </div>
              </div>
            </transition-group>
          </div>

          <!-- Load More Button -->
          <div v-if="visibleCount < reports.length" class="load-more-wrapper">
            <button class="load-more-btn-premium" @click="loadMore">
              <i class="fas fa-chevron-down"></i> Load More
            </button>
          </div>
        </section>
      </div>
    </div>

    <!-- Task Detail Modal -->
    <transition name="modal-fade">
      <div class="modal-backdrop" v-if="selectedReport" @click.self="closeModal">
        <div class="premium-modal detail-modal" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="header-text">
              <h2>Task Details</h2>
              <p>{{ selectedReport.name }}</p>
            </div>
            <button class="close-btn-premium" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body-premium">
            <div class="detail-grid">
              <div class="detail-item">
                <i class="fas fa-user-tie"></i>
                <div>
                  <label>Assigned By</label>
                  <p>{{ selectedReport.manager_name || 'Admin' }}</p>
                </div>
              </div>
              <div class="detail-item">
                <i class="fas fa-user"></i>
                <div>
                  <label>Assigned To</label>
                  <p>{{ selectedReport.username }}</p>
                </div>
              </div>
              <div class="detail-item">
                <i class="fas fa-building"></i>
                <div>
                  <label>Department</label>
                  <p>{{ selectedReport.department }}</p>
                </div>
              </div>
              <div class="detail-item">
                <i class="fas fa-calendar-alt"></i>
                <div>
                  <label>Due Date</label>
                  <p>{{ selectedReport.date }}</p>
                </div>
              </div>
              <div class="detail-item">
                <i class="fas fa-flag-checkered"></i>
                <div>
                  <label>Status</label>
                  <span :class="['status-badge-premium', getStatusClass(selectedReport.status)]">
                    {{ selectedReport.status }}
                  </span>
                </div>
              </div>
              <div class="detail-item">
                <i class="fas fa-check-circle"></i>
                <div>
                  <label>Completed At</label>
                  <p>{{ selectedReport.completed_at || 'Not completed' }}</p>
                </div>
              </div>
              <div class="detail-item full-width">
                <i class="fas fa-align-left"></i>
                <div>
                  <label>Summary</label>
                  <p>{{ selectedReport.summary }}</p>
                </div>
              </div>
              <div class="detail-item full-width" v-if="selectedReport.modules !== 'N/A'">
                <i class="fas fa-cube"></i>
                <div>
                  <label>Modules</label>
                  <p>{{ selectedReport.modules }}</p>
                </div>
              </div>
              <div class="detail-item full-width" v-if="selectedReport.comment">
                <i class="fas fa-comment"></i>
                <div>
                  <label>Comments</label>
                  <p>{{ selectedReport.comment }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer-premium">
            <button class="btn-submit-premium" @click="closeModal">
              <i class="fas fa-check"></i> Close
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Assign Task Modal -->
    <transition name="modal-fade">
      <div class="modal-backdrop" v-if="showAssignTaskModal" @click.self="closeAssignTaskModal">
        <div class="premium-modal" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium">
              <i class="fas fa-tasks"></i>
            </div>
            <div class="header-text">
              <h2>{{ isEditTaskMode ? 'Edit Task' : 'Assign New Task' }}</h2>
              <p>{{ isEditTaskMode ? 'Update task details' : 'Assign a task to an employee' }}</p>
            </div>
            <button class="close-btn-premium" @click="closeAssignTaskModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body-premium">
            <div class="form-section">
              <div class="form-field full-width">
                <label>Task Name <span class="required-star">*</span></label>
                <div class="field-wrapper">
                  <i class="fas fa-heading field-icon"></i>
                  <input
                    type="text"
                    v-model="newTask.title"
                    placeholder="Enter task name"
                    maxlength="50"
                  />
                </div>
                <div class="char-counter">{{ newTask.title.length }}/50 characters</div>
              </div>

              <div class="form-field full-width">
                <label>Description</label>
                <div class="field-wrapper">
                  <i class="fas fa-align-left field-icon" style="top: 18px;"></i>
                  <textarea
                    v-model="newTask.description"
                    placeholder="Enter task description"
                    maxlength="250"
                    rows="4"
                  ></textarea>
                </div>
                <div class="char-counter">{{ newTask.description.length }}/250 characters</div>
              </div>

              <div class="form-field">
                <label>Assign To <span class="required-star">*</span></label>
                <div class="field-wrapper">
                  <i class="fas fa-user field-icon"></i>
                  <select v-model="newTask.user_id">
                    <option value="">Select Employee</option>
                    <option v-for="emp in filteredEmployeesDropdown" :key="emp.id" :value="emp.id">
                      {{ emp.name }} ({{ emp.department }})
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-field">
                <label>Due Date <span class="required-star">*</span></label>
                <div class="field-wrapper">
                  <i class="fas fa-calendar-alt field-icon"></i>
                  <input type="date" v-model="newTask.due_date" :min="minDate" />
                </div>
              </div>

              <div class="form-field full-width">
                <label>Modules</label>
                <div class="field-wrapper">
                  <i class="fas fa-cube field-icon"></i>
                  <input
                    type="text"
                    v-model="newTask.modules"
                    placeholder="Module names (comma separated)"
                    maxlength="250"
                  />
                </div>
                <div class="char-counter">{{ newTask.modules.length }}/250 characters</div>
              </div>
            </div>
          </div>

          <div class="modal-footer-premium">
            <button class="btn-cancel-premium" @click="closeAssignTaskModal">
              <i class="fas fa-times"></i> Cancel
            </button>
            <button class="btn-submit-premium" @click="assignTask">
              <i class="fas fa-save"></i> {{ isEditTaskMode ? 'Update Task' : 'Assign Task' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Assigned Report Modal -->
    <transition name="modal-fade">
      <div class="modal-backdrop" v-if="showAssignedReport" @click.self="showAssignedReport = false">
        <div class="premium-modal report-modal" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="header-text">
              <h2>Assigned Task Report</h2>
              <p>Overview of all assigned tasks</p>
            </div>
            <button class="close-btn-premium" @click="showAssignedReport = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body-premium report-body">
            <div class="report-filters">
              <div class="search-wrapper-small">
                <i class="fas fa-search"></i>
                <input type="text" v-model="reportSearch" placeholder="Search tasks..." />
              </div>
              <select v-model="reportFilters.status" class="filter-select-small">
                <option value="">All Status</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
              <input type="date" v-model="reportFilters.date" class="filter-date-small" />
            </div>

            <div class="table-wrapper-premium">
              <table class="report-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Task</th>
                    <th>Summary</th>
                    <th>Assigned To</th>
                    <th>Department</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(task, index) in filteredAssignedReports" :key="task.id">
                    <td>{{ index + 1 }}</td>
                    <td class="task-title-cell">{{ task.name }}</td>
                    <td class="summary-cell">{{ truncateText(task.summary, 60) }}</td>
                    <td>{{ task.username }}</td>
                    <td><span class="dept-badge">{{ task.department }}</span></td>
                    <td>{{ task.date }}</td>
                    <td>
                      <span :class="['status-badge-premium small', getStatusClass(task.status)]">
                        {{ task.status }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="filteredAssignedReports.length === 0">
                    <td colspan="7" class="empty-state-cell">
                      <div class="empty-state-small">
                        <i class="fas fa-inbox"></i>
                        <p>No assigned tasks found</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer-premium">
            <button class="btn-submit-premium" @click="showAssignedReport = false">
              <i class="fas fa-check"></i> Close
            </button>
          </div>
        </div>
      </div>
    </transition>
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
  components: { Sidebar },
  data() {
    const today = new Date().toISOString().split('T')[0]
    return {
      showAssignedReport: false,
      reportSearch: '',
      reportFilters: { status: '', date: '' },
      isEditTaskMode: false,
      editTaskId: null,
      managerName: localStorage.getItem('user_name') || 'Assigned',
      selectedReport: null,
      showAssignTaskModal: false,
      visibleCount: 12,
      minDate: today,
      filters: { name: '', date: '', month: (new Date().getMonth() + 1).toString(), status: '', search: '' },
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
    pendingTasks() {
      return this.reports.filter(r => r.status === 'Pending').length
    },
    inProgressTasks() {
      return this.reports.filter(r => r.status === 'In Progress').length
    },
    completedTasks() {
      return this.reports.filter(r => r.status === 'Completed').length
    },
    filteredAssignedReports() {
      const today = new Date()
      const lastYear = new Date()
      lastYear.setFullYear(today.getFullYear() - 1)

      return this.tasks
        .map(task => {
          const isManagerAssigned = task.assigned_by_manager === true || (task.assigned_by && task.assigned_by !== task.user_id)
          return {
            id: task.id,
            username: task.user?.name || 'Unknown',
            name: task.title,
            date: task.due_date,
            department: task.user?.department || 'Unknown',
            status: task.status || 'Pending',
            modules: task.modules || '',
            comment: task.comment || '-',
            summary: task.description || '-',
            completed_at: task.completed_at || 'Not completed',
            priority: task.priority || '',
            manager_name: task.manager_name || this.managerName,
            assigned_by_manager: isManagerAssigned
          }
        })
        .filter(task => {
          const taskDate = new Date(task.date)
          const lastYearMatch = taskDate >= lastYear
          const assignedMatch = task.priority === 'Task Assigned'
          const search = this.reportSearch.toLowerCase()
          const searchMatch = !search || task.name.toLowerCase().includes(search) || task.username.toLowerCase().includes(search)
          const statusMatch = !this.reportFilters.status || task.status === this.reportFilters.status
          return lastYearMatch && assignedMatch && searchMatch && statusMatch
        })
    },
    filteredEmployeesDropdown() {
      return this.employeesDropdown.filter(emp => emp.department !== 'Ownership')
    },
    filteredEmployeeList() {
      return this.employeeList.filter(emp => emp.department !== 'Ownership' && emp.name)
    },
    reports() {
      return this.tasks
        .map(task => {
          const isManagerAssigned = task.assigned_by_manager === true || (task.assigned_by && task.assigned_by !== task.user_id)
          return {
            id: task.id,
            username: task.user?.name || 'Unknown',
            name: task.title,
            date: task.due_date || task.dueDate,
            department: task.user?.department || 'Unknown',
            status: task.status || 'Unknown',
            summary: task.description || 'No summary provided.',
            comment: task.comment || '',
            modules: task.modules || 'N/A',
            completed_at: task.completed_at || 'Not completed',
            priority: task.priority || '',
            assigned_by_manager: isManagerAssigned,
            manager_name: isManagerAssigned ? (task.manager_name || this.managerName) : null
          }
        })
        .filter(task => {
          const nameMatch = !this.filters.name || task.username === this.filters.name
          const dateMatch = !this.filters.date || task.date === this.filters.date
          const monthMatch = !this.filters.month || new Date(task.date).getMonth() + 1 === parseInt(this.filters.month)
          let statusMatch = true
          if (this.filters.status === 'Assigned') {
            statusMatch = task.priority === 'Task Assigned'
          } else if (this.filters.status) {
            statusMatch = task.status && task.status.toLowerCase() === this.filters.status.toLowerCase()
          }
          const searchText = this.filters.search.trim().toLowerCase()
          const searchMatch = !searchText ||
            task.name.toLowerCase().includes(searchText) ||
            task.summary.toLowerCase().includes(searchText) ||
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
    truncateText(text, length) {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    },
    getStatusClass(status) {
      const s = (status || '').toLowerCase()
      if (s === 'completed') return 'completed'
      if (s === 'in progress') return 'in-progress'
      return 'pending'
    },
    getStatusIcon(status) {
      const s = (status || '').toLowerCase()
      if (s === 'completed') return 'fas fa-check-circle'
      if (s === 'in progress') return 'fas fa-spinner fa-pulse'
      return 'fas fa-clock'
    },
    editTask(report) {
      this.newTask = {
        title: report.name,
        description: report.summary !== 'No summary provided.' ? report.summary : '',
        user_id: this.employeesDropdown.find(emp => emp.name === report.username)?.id || '',
        due_date: report.date,
        modules: report.modules !== 'N/A' ? report.modules : '',
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
          toastSuccess('Task deleted successfully!')
          this.fetchReports()
        })
        .catch(err => {
          console.error('Error deleting task:', err)
          toastError('Failed to delete task!')
        })
      }
    },
    fetchEmployees() {
      axios.get('https://employees.archenterprises.co.in/api/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => {
        this.employeesDropdown = res.data
          .filter(user => user.id && user.name && user.department !== 'Ownership')
          .map(user => ({ id: user.id, name: user.name, department: user.department }))
      })
      .catch(err => console.error('Error fetching employees:', err))
    },
    openModal(report) { this.selectedReport = report },
    closeModal() { this.selectedReport = null },
    loadMore() { this.visibleCount += 12 },
    clearFilters() {
      this.filters = { name: '', date: '', month: '', status: '', search: '' }
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },
    toggleSidebar() { this.isSidebarVisible = !this.isSidebarVisible },
    openAssignTaskModal() { 
      this.isEditTaskMode = false
      this.editTaskId = null
      this.resetNewTask()
      this.showAssignTaskModal = true 
    },
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
        toastWarning("Please fill all required fields!")
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
        toastSuccess(this.isEditTaskMode ? "Task updated successfully!" : "Task assigned successfully!")
        this.fetchReports()
        this.closeAssignTaskModal()
      })
      .catch(err => {
        console.error(err)
        toastError("Error saving task!")
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
    const token = localStorage.getItem('token')
    if (!token) this.$router.push('/auth')
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
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
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
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

.main-content-work-report {
  flex: 1;
}

.report-container {
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

.header-buttons {
  display: flex;
  gap: 12px;
}

.register-btn-modern {
  padding: 12px 24px;
  background: var(--primary);
  border: none;
  border-radius: 16px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.register-btn-modern.secondary {
  background: linear-gradient(135deg, #10b981, #059669);
}

.register-btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-card.pending {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}
.stat-card.progress {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
}
.stat-card.completed {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}

.stat-card i {
  font-size: 32px;
  color: var(--primary-color);
}

.stat-card.pending i { color: #d97706; }
.stat-card.progress i { color: #4338ca; }
.stat-card.completed i { color: #065f46; }

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
  font-size: 12px;
  color: #6b7280;
}

/* Search and Filter Section */
.search-filter-section {
  margin-bottom: 28px;
}

.search-wrapper-modern {
  position: relative;
  margin-bottom: 16px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input-modern {
  width: 100%;
  padding: 14px 16px 14px 45px;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input-modern:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-group-modern {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-select, .filter-date {
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  flex: 1;
  min-width: 130px;
}

.filter-select:focus, .filter-date:focus {
  outline: none;
  border-color: var(--primary-color);
}

.clear-filter-btn {
  padding: 10px 20px;
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.clear-filter-btn:hover {
  background: #e5e7eb;
}

/* Report Cards Grid */
.report-grid-premium {
  /* display: grid; */
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

/* Report Card */
.report-card-premium {
  position: relative;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  cursor: pointer;
}

.report-card-premium:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 30px -12px rgba(0, 0, 0, 0.15);
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.card-accent.pending { background: var(--warning); }
.card-accent.in-progress { background: var(--info); }
.card-accent.completed { background: var(--success); }

.card-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 18px 20px 12px 20px;
  background: #fafbfc;
  border-bottom: 1px solid #e5e7eb;
}

.header-info {
  display: flex;
  gap: 12px;
  flex: 1;
}

.task-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
}

.header-info h3 {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 6px 0;
}

.meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.manager-badge, .date-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #f3f4f6;
  color: #6b7280;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-badge-premium {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.status-badge-premium.completed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge-premium.in-progress {
  background: #e0e7ff;
  color: #4338ca;
}

.status-badge-premium.pending {
  background: #fef3c7;
  color: #d97706;
}

.card-body-premium {
  padding: 16px 20px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  margin-bottom: 10px;
  color: #4b5563;
}

.info-row i {
  width: 18px;
  color: var(--primary-color);
  margin-top: 2px;
}

.info-row.summary {
  background: #f8fafc;
  padding: 10px;
  border-radius: 12px;
  margin-bottom: 0;
}

.card-footer-premium {
  display: flex;
  gap: 10px;
  padding: 12px 20px 18px;
  border-top: 1px solid #e5e7eb;
}

.action-edit, .action-delete {
  flex: 1;
  padding: 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
}

.action-edit {
  background: #e0e7ff;
  color: var(--primary-color);
}

.action-edit:hover {
  /* background: var(--primary-color); */
  color: rgb(5, 3, 3);
}

.action-delete {
  background: #fee2e2;
  color: var(--danger);
}

.action-delete:hover {
  /* background: var(--danger); */
  color: rgb(5, 1, 1);
}

/* Load More Button */
.load-more-wrapper {
  text-align: center;
  margin-top: 28px;
}

.load-more-btn-premium {
  background: #f3f4f6;
  border: none;
  padding: 12px 32px;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.load-more-btn-premium:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
}

.premium-modal {
  position: relative;
  background: white;
  border-radius: 32px;
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.premium-modal.detail-modal {
  max-width: 650px;
}

.premium-modal.report-modal {
  max-width: 1100px;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary);
}

.modal-header-premium {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.header-icon-premium {
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

.header-text {
  flex: 1;
}

.header-text h2 {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: #1a1a2e;
}

.header-text p {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 0;
}

.close-btn-premium {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;
  font-size: 18px;
}

.close-btn-premium:hover {
  /* background: var(--danger); */
  color: rgb(10, 4, 4);
  transform: rotate(90deg);
}

.modal-body-premium {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
  background: #fafbfc;
}

.modal-body-premium::-webkit-scrollbar {
  width: 6px;
}

.modal-body-premium::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 10px;
}

.modal-body-premium::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 10px;
}

/* Detail Grid */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.detail-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.detail-item.full-width {
  grid-column: span 2;
}

.detail-item i {
  width: 20px;
  color: var(--primary-color);
  margin-top: 2px;
}

.detail-item label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #9ca3af;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 4px;
}

.detail-item p {
  font-size: 14px;
  color: #1a1a2e;
  margin: 0;
}

/* Form Section */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field.full-width {
  grid-column: span 2;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.required-star {
  color: var(--danger);
}

.field-wrapper {
  position: relative;
}

.field-wrapper .field-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
}

.field-wrapper textarea + .field-icon {
  top: 18px;
  transform: none;
}

.field-wrapper input,
.field-wrapper select,
.field-wrapper textarea {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.field-wrapper textarea {
  padding-top: 12px;
  resize: vertical;
}

.field-wrapper input:focus,
.field-wrapper select:focus,
.field-wrapper textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.char-counter {
  font-size: 11px;
  text-align: right;
  color: #6b7280;
}

/* Modal Footer */
.modal-footer-premium {
  display: flex;
  gap: 12px;
  padding: 20px 28px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.btn-cancel-premium,
.btn-submit-premium {
  flex: 1;
  padding: 12px;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  border: none;
}

.btn-cancel-premium {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancel-premium:hover {
  background: #e5e7eb;
}

.btn-submit-premium {
  background: var(--primary);
  color: white;
}

.btn-submit-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

/* Report Modal Specific */
.report-body {
  padding: 20px;
}

.report-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-wrapper-small {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-wrapper-small i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
}

.search-wrapper-small input {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 13px;
}

.filter-select-small,
.filter-date-small {
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 13px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.report-table th {
  background: #f8fafc;
  padding: 12px;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
  text-align: left;
}

.report-table td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.task-title-cell {
  font-weight: 500;
  color: #1a1a2e;
}

.summary-cell {
  color: #6b7280;
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dept-badge {
  padding: 3px 10px;
  background: #e0e7ff;
  color: var(--primary-color);
  border-radius: 20px;
  font-size: 11px;
}

.status-badge-premium.small {
  padding: 3px 10px;
  font-size: 10px;
}

.empty-state-cell {
  text-align: center;
  padding: 40px;
}

.empty-state-small {
  color: #9ca3af;
}

.empty-state-small i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

/* Card Fade Animation */
.card-fade-enter-active,
.card-fade-leave-active {
  transition: all 0.4s ease;
}

.card-fade-enter-from,
.card-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
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
  .report-grid-premium {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 16px;
  }

  .report-container {
    padding: 20px;
  }

  .content-header-modern {
    flex-direction: column;
    align-items: stretch;
  }

  .header-buttons {
    flex-direction: column;
  }

  .register-btn-modern {
    justify-content: center;
  }

  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-group-modern {
    flex-direction: column;
  }

  .filter-select, .filter-date, .clear-filter-btn {
    width: 100%;
  }

  .report-grid-premium {
    grid-template-columns: 1fr;
  }

  .premium-modal {
    max-width: 95%;
  }

  .modal-header-premium {
    padding: 16px 20px;
  }

  .modal-body-premium {
    padding: 16px;
  }

  .modal-footer-premium {
    padding: 16px 20px;
    flex-direction: column;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-item.full-width {
    grid-column: span 1;
  }

  .report-filters {
    flex-direction: column;
  }

  .report-table {
    font-size: 11px;
  }

  .report-table th,
  .report-table td {
    padding: 8px;
  }

  .summary-cell {
    max-width: 120px;
  }
}

</style>