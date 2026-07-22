<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <!-- Hide task content when sidebar is open on mobile -->
      <div class="task-container" v-if="!isMobile || !isSidebarVisible">

        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
          
          <div class="mobile-title">
            <i class="fas fa-tasks"></i>
            <span>Tasks</span>
          </div>
          <button class="mobile-add-btn" @click="openAddTaskModal">
            <i class="fas fa-plus"></i>
          </button>
        </div>

        <!-- Desktop Header -->
        <div class="task-header-premium" v-else>
          <div class="header-left desktop-only">
            <div class="header-icon">
              <i class="fas fa-tasks"></i>
            </div>
            <div>
              <h1>Task Management</h1>
              <p class="header-subtitle">Organize, track, and complete your daily tasks</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn-primary-modern" @click="openAddTaskModal">
              <i class="fas fa-plus-circle"></i> Add Task
            </button>
            <button
              v-if="currentUser.department?.toLowerCase() === 'management' || currentUser.id === 107 || currentUser.id === 1"
              class="btn-secondary-modern"
              @click="goTo('employee/empworkreport')"
            >
              <i class="fas fa-chart-line"></i> <span class="btn-text">Report</span>
            </button>
          </div>
        </div>

        <!-- Stats Cards - Mobile Optimized -->
        <div class="stats-grid">
          <div class="stat-card" :style="{ borderLeftColor: '#3b82f6' }" @click="filterByStatus('all')">
            <div class="stat-icon blue">
              <i class="fas fa-list-check"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ tasks.length }}</span>
              <span class="stat-label">Total</span>
            </div>
          </div>
          <div class="stat-card" :style="{ borderLeftColor: '#f59e0b' }" @click="filterByStatus('Pending')">
            <div class="stat-icon orange">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ pendingTasks }}</span>
              <span class="stat-label">Pending</span>
            </div>
          </div>
          <div class="stat-card" :style="{ borderLeftColor: '#10b981' }" @click="filterByStatus('Completed')">
            <div class="stat-icon green">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ completedTasks }}</span>
              <span class="stat-label">Completed</span>
            </div>
          </div>
          <div class="stat-card" :style="{ borderLeftColor: '#8b5cf6' }" @click="filterByStatus('In Progress')">
            <div class="stat-icon purple">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ inProgressTasks }}</span>
              <span class="stat-label">Progress</span>
            </div>
          </div>
        </div>

        <!-- Upcoming Reminders - Mobile Optimized -->
        <div class="reminders-section" v-if="upcomingTasks.length">
          <div class="section-title" @click="toggleReminders">
            <i class="fas fa-bell"></i>
            <span>Upcoming Deadlines</span>
            <span class="reminder-count">{{ upcomingTasks.length }}</span>
            <i class="fas fa-chevron-down reminder-toggle" :class="{ 'rotated': remindersVisible }"></i>
          </div>
          <div class="reminders-grid" :class="{ 'reminders-hidden': !remindersVisible }">
            <div
              v-for="(task, index) in upcomingTasks"
              :key="task.id"
              class="reminder-card"
              @click="dismissUpcomingTask(index)"
            >
              <div class="reminder-icon">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="reminder-content">
                <strong>{{ truncateText(task.title, isMobile ? 25 : 40) }}</strong>
                <small>Due: {{ formatDate(task.dueDate) }}</small>
              </div>
              <button class="reminder-dismiss">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Filter Section - Mobile Optimized -->
        <div class="filter-section">
          <div class="section-title" @click="toggleFilters">
            <i class="fas fa-filter"></i>
            <span>Filter Tasks</span>
            <i class="fas fa-chevron-down filter-toggle" :class="{ 'rotated': filtersVisible }"></i>
          </div>
          <div class="filter-grid" :class="{ 'filters-hidden': !filtersVisible }">
            <div class="filter-group">
              <i class="fas fa-calendar"></i>
              <input type="date" v-model="filters.date" placeholder="Due Date" />
            </div>
            <div class="filter-group">
              <i class="fas fa-calendar-alt"></i>
              <select v-model="filters.month">
                <option value="">All Months</option>
                <option v-for="m in 12" :key="m" :value="m">{{ new Date(0, m - 1).toLocaleString('default', { month: 'short' }) }}</option>
              </select>
            </div>
            <div class="filter-group">
              <i class="fas fa-tag"></i>
              <select v-model="filters.status">
                <option value="">All Statuses</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
            <button class="clear-filter-btn" @click="clearFilters">
              <i class="fas fa-sync-alt"></i> Reset
            </button>
          </div>
        </div>

        <!-- Task Grid - Mobile Optimized -->
        <div class="tasks-section">
          <div class="section-title">
            <div class="title-left">
              <i class="fas fa-list-ul"></i>
              <span>My Tasks</span>
              <span class="task-count">{{ filteredTasks.length }}</span>
            </div>
          </div>

          <div class="task-grid">
            <div
              class="task-card-premium"
              v-for="task in filteredTasks"
              :key="task.id"
              :class="[getStatusClass(task.status), { 'mobile-card': isMobile }]"
              @click="openTaskPopup(task)"
            >
              <div class="task-card-header" :class="{ 'mobile-header': isMobile }">
                <div class="task-priority-badge" :class="getPriorityClass(task.priority)">
                  <i :class="getPriorityIcon(task.priority)"></i>
                  {{ task.priority || 'Normal' }}
                </div>
                <div class="task-date">
                  <i class="fas fa-calendar-alt"></i>
                  {{ formatDate(task.dueDate) }}
                </div>
              </div>

              <h3 class="task-title">{{ truncateText(task.title, isMobile ? 30 : 40) }}</h3>
              <p class="task-description" :class="{ 'mobile-desc': isMobile }">{{ truncateText(task.description, isMobile ? 50 : 80) }}</p>

              <div class="task-card-footer" :class="{ 'mobile-footer': isMobile }">
                <select
                  v-if="!task.isVisit"
                  v-model="task.status"
                  @click.stop
                  @change.stop="updateTaskStatus(task)"
                  :class="['task-status-select', getStatusClass(task.status)]"
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>

                <div class="task-actions" :class="{ 'mobile-actions': isMobile }">
                  <button
                    class="icon-btn edit"
                    @click.stop="openEditTaskModal(task)"
                    v-if="task.priority !== 'Task Assigned'"
                    title="Edit Task"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    class="icon-btn delete"
                    @click.stop="deleteTask(task)"
                    v-if="task.priority !== 'Task Assigned'"
                    title="Delete Task"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty State - Mobile Optimized -->
            <div v-if="filteredTasks.length === 0" class="empty-state-premium" :class="{ 'empty-mobile': isMobile }">
              <i class="fas fa-check-circle"></i>
              <h4>All caught up!</h4>
              <p>No tasks match your filters</p>
            </div>
          </div>

          <!-- Load More -->
          <div v-if="visibleTaskCount < totalFilteredTasks" class="load-more-container">
            <button @click="loadMore" class="load-more-btn">
              <i class="fas fa-chevron-down"></i> Load More
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Details Modal - Mobile Optimized -->
    <div v-if="showTaskPopup" class="modal-premium" @click.self="closeTaskPopup">
      <div class="modal-premium-container task-modal" :class="{ 'mobile-modal': isMobile }">
        <div class="modal-premium-header">
          <div class="modal-icon">
            <i class="fas fa-clipboard-list"></i>
          </div>
          <h2>{{ isMobile ? 'Task' : 'Task Details' }}</h2>
          <button class="modal-close" @click="closeTaskPopup">×</button>
        </div>
        <div class="modal-premium-body" v-if="selectedTask">
          <div class="task-detail-header" :class="{ 'mobile-header': isMobile }">
            <h3>{{ truncateText(selectedTask.title, isMobile ? 30 : 50) }}</h3>
            <span :class="['status-badge-premium', getStatusClass(selectedTask.status)]">
              <i :class="getStatusIcon(selectedTask.status)"></i>
              <span class="status-text">{{ selectedTask.status }}</span>
            </span>
          </div>

          <div class="task-detail-grid" :class="{ 'mobile-grid': isMobile }">
            <div class="detail-item">
              <label><i class="fas fa-calendar-alt"></i> Due Date</label>
              <p>{{ formatDate(selectedTask.dueDate) }}</p>
            </div>
            <div class="detail-item">
              <label><i class="fas fa-flag"></i> Priority</label>
              <p :class="getPriorityClass(selectedTask.priority)">
                {{ selectedTask.priority || 'Normal' }}
              </p>
            </div>
          </div>

          <div class="detail-item full-width" v-if="selectedTask.description">
            <label><i class="fas fa-align-left"></i> Description</label>
            <p class="description-text">{{ selectedTask.description }}</p>
          </div>

          <div class="detail-item full-width" v-if="selectedTask.priority === 'Task Assigned'">
            <label><i class="fas fa-comment"></i> Comments</label>
            <textarea
              v-model="selectedTask.comment"
              placeholder="Add your comment here..."
              rows="3"
              class="comment-textarea"
              :class="{ 'mobile-textarea': isMobile }"
            ></textarea>
            <button class="btn-primary-modern small" @click="saveTaskComment">
              <i class="fas fa-save"></i> Save
            </button>
          </div>

          <div class="detail-item full-width" v-if="selectedTask.modules && !isMobile">
            <label><i class="fas fa-cube"></i> Modules</label>
            <p>{{ selectedTask.modules }}</p>
          </div>
        </div>
        <div class="modal-premium-footer" :class="{ 'mobile-footer': isMobile }">
          <button class="btn-secondary-modern" @click="closeTaskPopup">
            <i class="fas fa-times"></i> Close
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Task Modal - Mobile Optimized -->
    <div v-if="showAddTaskForm" class="modal-premium" @click.self="closeTaskModal">
      <div class="modal-premium-container task-form-modal" :class="{ 'mobile-modal': isMobile }">
        <div class="modal-premium-header">
          <div class="modal-icon">
            <i class="fas fa-plus-circle"></i>
          </div>
          <h2>{{ isEditTaskMode ? 'Edit Task' : 'New Task' }}</h2>
          <button class="modal-close" @click="closeTaskModal">×</button>
        </div>
        <div class="modal-premium-body">
          <form @submit.prevent="submitTask" class="task-form">
            <div class="form-row" :class="{ 'mobile-row': isMobile }">
              <div class="form-field">
                <label>Due Date *</label>
                <input type="date" v-model="newTask.dueDate" :min="today" required />
              </div>
              <div class="form-field">
                <label>Priority *</label>
                <select v-model="newTask.priority" required>
                  <option disabled value="">Select Priority</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>

            <div class="form-field">
              <label>Title *</label>
              <input type="text" v-model="newTask.title" placeholder="Enter task title" maxlength="50" required />
              <small>{{ newTask.title.length }}/50</small>
            </div>

            <div class="form-field">
              <label>Description</label>
              <textarea v-model="newTask.description" placeholder="Enter task description (optional)" maxlength="250" rows="3"></textarea>
              <small>{{ newTask.description.length }}/250</small>
            </div>

            <div class="form-field" v-if="!isMobile">
              <label>Modules</label>
              <textarea v-model="newTask.modules" placeholder="Enter module names (optional)" rows="3" maxlength="250"></textarea>
              <small>{{ newTask.modules.length }}/250</small>
            </div>

            <div class="form-field">
              <label>Status *</label>
              <select v-model="newTask.status" required>
                <option disabled value="">Select Status</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>

            <div class="form-actions" :class="{ 'mobile-actions': isMobile }">
              <button type="button" class="btn-secondary-modern" @click="closeTaskModal">
                <i class="fas fa-times"></i> Cancel
              </button>
              <button type="submit" class="btn-primary-modern">
                <i class="fas fa-save"></i> {{ isEditTaskMode ? 'Update' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
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
      showTaskPopup: false,
      selectedTask: null,
      totalFilteredTasks: 0,
      upcomingTasks: [],
      visibleTaskCount: 99,
      filtersVisible: true,
      remindersVisible: true,
      filters: {
        date: '',
        month: '',
        status: ''
      },
      currentUser: {
        id: null,
        username: '',
        department: ''
      },
      isMobile: false,
      isSidebarVisible: true,
      tasks: [],
      showAddTaskForm: false,
      newTask: {
        dueDate: '',
        deadline: '',
        priority: '',
        title: '',
        description: '',
        status: '',
        modules: ''
      },
      isEditTaskMode: false,
      editingTaskId: null,
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
    today() {
      const date = new Date();
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    },
    pendingTasks() {
      return this.tasks.filter(t => t.status === 'Pending').length;
    },
    completedTasks() {
      return this.tasks.filter(t => t.status === 'Completed').length;
    },
    inProgressTasks() {
      return this.tasks.filter(t => t.status === 'In Progress').length;
    },
    filteredTasks() {
      const todayStr = new Date().toISOString().substr(0, 10);
      const filtered = this.tasks.filter(task => {
        // Show all tasks including "Task Assigned" where assigned_by matches current user
        // Don't filter out "Task Assigned" tasks anymore
        if (task.isVisit && task.status === 'Completed') return false;
        
        const taskDate = task.isVisit ? task.deadline : task.dueDate;
        if (!taskDate) return false;
        
        const dateStr = new Date(taskDate).toISOString().substr(0, 10);
        const taskMonth = new Date(taskDate).getMonth() + 1;
        const isIncomplete = task.status !== 'Completed';
        const matchDate = !this.filters.date || (isIncomplete && this.filters.date === todayStr) || dateStr === this.filters.date;
        const matchMonth = !this.filters.month || taskMonth === Number(this.filters.month);
        const matchStatus = !this.filters.status || task.status === this.filters.status;
        
        return matchDate && matchMonth && matchStatus;
      }).sort((a, b) => {
        const dateA = new Date(a.isVisit ? a.deadline : a.dueDate);
        const dateB = new Date(b.isVisit ? b.deadline : b.dueDate);
        return dateB - dateA;
      });
      
      this.totalFilteredTasks = filtered.length;
      return filtered.slice(0, this.visibleTaskCount);
    }
  },
  watch: {
    'filters.month'(newVal) {
      if (newVal) this.filters.date = '';
    },
    'filters.date'(newVal) {
      if (newVal) this.filters.month = '';
    },
    showAddTaskForm(newVal) {
      document.body.classList.toggle('modal-open', newVal);
    }
  },
  methods: {
    toggleFilters() {
      if (this.isMobile) {
        this.filtersVisible = !this.filtersVisible;
      }
    },
    toggleReminders() {
      if (this.isMobile) {
        this.remindersVisible = !this.remindersVisible;
      }
    },
    filterByStatus(status) {
      this.filters.status = this.filters.status === status ? '' : status;
    },
    truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },
    getPriorityClass(priority) {
      const p = (priority || '').toLowerCase();
      if (p === 'high') return 'priority-high';
      if (p === 'medium') return 'priority-medium';
      if (p === 'low') return 'priority-low';
      return 'priority-normal';
    },
    getPriorityIcon(priority) {
      const p = (priority || '').toLowerCase();
      if (p === 'high') return 'fas fa-arrow-up';
      if (p === 'medium') return 'fas fa-minus';
      if (p === 'low') return 'fas fa-arrow-down';
      return 'fas fa-flag';
    },
    getStatusIcon(status) {
      const s = (status || '').toLowerCase();
      if (s === 'completed') return 'fas fa-check-circle';
      if (s === 'in progress') return 'fas fa-spinner fa-pulse';
      return 'fas fa-clock';
    },
    getStatusClass(status) {
      return (status || '').toLowerCase().replace(/\s+/g, '-');
    },
    formatDate(date) {
      if (!date) return '—';
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },
    async saveTaskComment() {
      if (!this.selectedTask?.id) return;
      try {
        await axios.put(`https://employees.archenterprises.co.in/api/api/tasks/${this.selectedTask.id}`, {
          comment: this.selectedTask.comment
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const task = this.tasks.find(t => t.id === this.selectedTask.id);
        if (task) task.comment = this.selectedTask.comment;
        toastSuccess('Comment saved successfully');
      } catch (err) {
        console.error('Failed to save comment', err);
        toastError('Failed to save comment');
      }
    },
    openTaskPopup(task) {
      this.selectedTask = { ...task };
      this.showTaskPopup = true;
    },
    closeTaskPopup() {
      this.showTaskPopup = false;
      this.selectedTask = null;
    },
    async fetchAssignedServices() {
      try {
        const res = await axios.get(`https://employees.archenterprises.co.in/api/api/get-assigned-services/${this.currentUser.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        let services = [];
        if (Array.isArray(res.data)) services = res.data;
        else if (Array.isArray(res.data.data)) services = res.data.data;
        else if (res.data.data) services = [res.data.data];
        services = services.filter(s => s.status && s.status.toLowerCase().trim() !== 'completed');
        const serviceTasks = services.map(s => ({
          id: `service-${s.id}`,
          title: s.company_name,
          deadline: s.visit_date,
          priority: 'Task Assigned',
          description: `Service: ${s.type_of_service}`,
          status: 'Pending',
          createdAt: s.visit_date,
          isVisit: true,
          isService: true
        }));
        this.tasks.push(...serviceTasks);
      } catch (err) {
        console.error('Failed to fetch assigned services', err);
      }
    },
    goToVisitSchedule() {
      window.location.href = 'https://employees.archenterprises.co.in/employee/visitschedule';
    },
    loadMore() {
      this.visibleTaskCount += 99;
    },
    async fetchAssignedVisits() {
      try {
        const res = await axios.get(`https://employees.archenterprises.co.in/api/api/assigned-visits/${this.currentUser.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const visitTasks = res.data.filter(v => !v.status || v.status.toLowerCase().trim() !== 'completed').map(v => ({
          id: `visit-${v.id}`,
          title: v.company_name,
          dueDate: null,
          deadline: v.visit_date,
          priority: 'Task Assigned',
          description: `Service: ${v.service_type}`,
          status: v.status ?? 'Pending',
          createdAt: v.visit_date,
          isVisit: true,
          isService: true
        }));
        this.tasks.push(...visitTasks);
      } catch (err) {
        console.error('Failed to fetch assigned visits', err);
      }
    },
    clearFilters() {
      this.filters.date = '';
      this.filters.month = '';
      this.filters.status = '';
    },
    async fetchCurrentUser() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/user', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.currentUser.id = response.data.id;
        this.currentUser.username = response.data.name;
        this.currentUser.department = response.data.department;
      } catch (error) {
        console.error('Failed to fetch current user:', error);
        toastError('Could not fetch logged-in user info.');
      }
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
      if (this.isMobile) {
        this.filtersVisible = false;
        this.remindersVisible = false;
      } else {
        this.filtersVisible = true;
        this.remindersVisible = true;
      }
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
async fetchTasks() {
  try {
    // Use the new getAllTasks endpoint
    const response = await axios.get(
      'https://employees.archenterprises.co.in/api/api/tasks/all',
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }
    );
    
    this.tasks = response.data.map(task => ({
      id: task.id,
      title: task.title,
      dueDate: task.due_date,
      deadline: task.deadline_date,
      priority: task.priority,
      description: task.description,
      comment: task.comment,
      status: task.status,
      completedAt: task.completed_at,
      createdAt: task.created_at,
      assignedTo: task.user_name,
      modules: task.modules,
      assigned_by: task.assigned_by,
      assign_by_name: task.assign_by_name
    }));
    
    // Calculate upcoming tasks
    const today = new Date();
    this.upcomingTasks = this.tasks.filter(task => {
      if (!task.dueDate) return false;
      if (task.status === 'Completed') return false;
      const due = new Date(task.dueDate);
      const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 2;
    });
    
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    toastError('Could not load tasks');
  }
},
    deleteTask(task) {
      if (confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
        axios.delete(`https://employees.archenterprises.co.in/api/api/tasks/${task.id}`)
          .then(() => {
            this.tasks = this.tasks.filter(t => t.id !== task.id);
            toastSuccess('Task deleted successfully!');
          })
          .catch(error => {
            console.error('Error deleting task:', error);
            toastError('Failed to delete task.');
          });
      }
    },
    async updateTaskStatus(task) {
      const oldStatus = task.status;
      const oldCompletedAt = task.completedAt;
      const payload = { status: task.status };
      if (task.status === 'Completed' && !task.completedAt) {
        const today = new Date().toISOString();
        payload.completed_at = today;
        task.completedAt = today;
      } else if (task.status !== 'Completed' && task.completedAt) {
        payload.completed_at = null;
        task.completedAt = null;
      }
      if (!task.id) {
        toastWarning('Task has no id, cannot update. Please refresh the page.');
        return;
      }
      try {
        await axios.put(`https://employees.archenterprises.co.in/api/api/tasks/${task.id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } catch (error) {
        task.status = oldStatus;
        task.completedAt = oldCompletedAt;
        console.error('Failed to update task status', error);
        toastError('Failed to update task status');
      }
    },
    openAddTaskModal() {
      const today = new Date().toISOString().substr(0, 10);
      this.newTask = {
        dueDate: today,
        deadline: '',
        priority: '',
        title: '',
        description: '',
        status: '',
        modules: ''
      };
      this.isEditTaskMode = false;
      this.editingTaskId = null;
      this.showAddTaskForm = true;
    },
    openEditTaskModal(task) {
      if (!task) return;
      this.newTask = {
        dueDate: task.dueDate ? task.dueDate.substr(0, 10) : this.today,
        deadline: task.deadline ? task.deadline.substr(0, 10) : '',
        priority: task.priority || '',
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'Pending',
        modules: task.modules || ''
      };
      this.editingTaskId = task.id;
      this.isEditTaskMode = true;
      this.showAddTaskForm = true;
    },
    closeTaskModal() {
      this.showAddTaskForm = false;
      this.resetNewTaskForm();
    },
    resetNewTaskForm() {
      this.newTask = {
        dueDate: '',
        deadline: '',
        priority: '',
        title: '',
        description: '',
        status: '',
        modules: ''
      };
      this.isEditTaskMode = false;
      this.editingTaskId = null;
    },
    submitTask() {
      const payload = {
        title: this.newTask.title,
        description: this.newTask.description,
        status: this.newTask.status,
        priority: this.newTask.priority,
        due_date: this.newTask.dueDate,
        deadline_date: this.newTask.deadline,
        modules: this.newTask.modules,
        user_id: this.currentUser.id,
        user_name: this.currentUser.username,
        assigned_by: this.currentUser.id, // Add assigned_by field
        completed_at: this.newTask.status === 'Completed' ? new Date().toISOString() : null
      };
      const url = this.isEditTaskMode
        ? `https://employees.archenterprises.co.in/api/api/tasks/${this.editingTaskId}`
        : 'https://employees.archenterprises.co.in/api/api/tasks';
      const method = this.isEditTaskMode ? 'put' : 'post';
      axios({
        method,
        url,
        data: payload,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(() => {
        this.fetchTasks();
        this.closeTaskModal();
        toastSuccess(this.isEditTaskMode ? 'Task updated successfully!' : 'Task created successfully!');
      }).catch(error => {
        console.error('Error saving task:', error);
        toastError('Failed to save task.');
      });
    },
    goTo(route) {
      this.$router.push(`/${route}`);
    },
    dismissUpcomingTask(index) {
      this.upcomingTasks.splice(index, 1);
    },
    async fetchUsers() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.users = response.data;
      } catch (error) {
        console.error(error);
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
  async mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/auth');
      return;
    }
    this.filters.date = new Date().toISOString().substr(0, 10);
    await this.fetchCurrentUser();
    await this.fetchTasks();
    await this.fetchAssignedVisits();
    await this.fetchAssignedServices();
    this.fetchUsers();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  }
}
</script>
<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Premium Variables */
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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

.task-container {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
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

.mobile-add-btn {
  background: var(--primary);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-add-btn:active {
  transform: scale(0.9);
}

/* ==================== HEADER ==================== */
.task-header-premium {
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

.header-icon {
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

.task-header-premium h1 {
  font-size: 20px;
  font-weight: 700;
  background: var(--primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
}

.header-subtitle {
  color: #6b7280;
  font-size: 14px;
  margin-top: 4px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-text {
  display: inline;
}

.btn-primary-modern {
  padding: 10px 22px;
  background: var(--primary);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary-modern {
  padding: 10px 22px;
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary-modern:hover {
  background: #e5e7eb;
}

/* ==================== STATS CARDS ==================== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
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
  border-left: 4px solid;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.15);
}

.stat-card:active {
  transform: scale(0.97);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.stat-icon.blue {
  background: #e0e7ff;
  color: #3b82f6;
}
.stat-icon.orange {
  background: #fef3c7;
  color: #f59e0b;
}
.stat-icon.green {
  background: #d1fae5;
  color: #10b981;
}
.stat-icon.purple {
  background: #e0e7ff;
  color: #8b5cf6;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

/* ==================== REMINDERS ==================== */
.reminders-section {
  margin-bottom: 28px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
  cursor: pointer;
}

.section-title i {
  color: var(--primary-color);
}

.reminder-count {
  background: #f59e0b;
  color: white;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.reminder-toggle {
  margin-left: auto;
  transition: transform 0.3s ease;
}

.reminder-toggle.rotated {
  transform: rotate(180deg);
}

.task-count {
  margin-left: auto;
  font-size: 12px;
  background: #f3f4f6;
  padding: 2px 10px;
  border-radius: 20px;
  color: #6b7280;
}

.reminders-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.3s ease;
}

.reminders-grid.reminders-hidden {
  display: none;
}

.reminder-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 14px;
  animation: pulseWarning 2s infinite;
  cursor: pointer;
  transition: all 0.3s ease;
}

@keyframes pulseWarning {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}

.reminder-card:hover {
  transform: translateX(5px);
}

.reminder-icon {
  width: 36px;
  height: 36px;
  background: #f59e0b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.reminder-content {
  flex: 1;
}

.reminder-content strong {
  display: block;
  font-size: 14px;
  color: #92400e;
}

.reminder-content small {
  font-size: 11px;
  color: #b45309;
}

.reminder-dismiss {
  background: transparent;
  border: none;
  color: #92400e;
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.reminder-dismiss:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* ==================== FILTER SECTION ==================== */
.filter-section {
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 28px;
  border: 1px solid #e5e7eb;
}

.filter-toggle {
  margin-left: auto;
  transition: transform 0.3s ease;
}

.filter-toggle.rotated {
  transform: rotate(180deg);
}

.filter-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  transition: all 0.3s ease;
}

.filter-grid.filters-hidden {
  display: none;
}

.filter-group {
  position: relative;
  flex: 1;
  min-width: 160px;
}

.filter-group i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
}

.filter-group input,
.filter-group select {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 13px;
  background: white;
  transition: all 0.3s ease;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.clear-filter-btn {
  padding: 10px 20px;
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.clear-filter-btn:hover {
  background: #e5e7eb;
}

/* ==================== TASK GRID ==================== */
.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.task-card-premium {
  background: white;
  border-radius: 20px;
  padding: 20px;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.task-card-premium.mobile-card {
  padding: 16px;
  border-radius: 16px;
}

.task-card-premium::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.task-card-premium.pending::before {
  background: #f59e0b;
}
.task-card-premium.in-progress::before {
  background: #3b82f6;
}
.task-card-premium.completed::before {
  background: #10b981;
}

.task-card-premium:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 30px -12px rgba(0, 0, 0, 0.15);
}

.task-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-card-header.mobile-header {
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.task-priority-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.task-priority-badge.priority-high {
  background: #fee2e2;
  color: #991b1b;
}
.task-priority-badge.priority-medium {
  background: #fef3c7;
  color: #d97706;
}
.task-priority-badge.priority-low {
  background: #d1fae5;
  color: #065f46;
}
.task-priority-badge.priority-normal {
  background: #f3e8ff;
  color: #7e22ce;
}

.task-date {
  font-size: 11px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
}

.task-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.task-description {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 16px;
}

.task-description.mobile-desc {
  font-size: 12px;
  margin-bottom: 12px;
}

.task-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.task-card-footer.mobile-footer {
  flex-wrap: wrap;
}

.task-status-select {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  background: #f3f4f6;
  color: #6b7280;
}

.task-status-select.pending {
  background: #fef3c7;
  color: #d97706;
}
.task-status-select.in-progress {
  background: #e0e7ff;
  color: #4338ca;
}
.task-status-select.completed {
  background: #d1fae5;
  color: #065f46;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.task-actions.mobile-actions {
  gap: 4px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon-btn.edit {
  background: #e0e7ff;
  color: var(--primary-color);
}

.icon-btn.edit:active {
  transform: scale(0.9);
}

.icon-btn.delete {
  background: #fee2e2;
  color: #991b1b;
}

.icon-btn.delete:active {
  transform: scale(0.9);
}

/* ==================== MODAL STYLES ==================== */
.modal-premium {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  animation: modalBackdropIn 0.3s ease;
}

@keyframes modalBackdropIn {
  from { opacity: 0; backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(10px); }
}

.modal-premium-container {
  background: white;
  border-radius: 32px;
  width: 100%;
  max-width: 550px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.modal-premium-container.mobile-modal {
  max-width: 95%;
  border-radius: 24px;
  max-height: 90vh;
}

.task-modal {
  max-width: 600px;
}

.task-form-modal {
  max-width: 550px;
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

.modal-premium-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.mobile-modal .modal-premium-header {
  padding: 16px 20px;
  gap: 12px;
}

.modal-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 20px;
}

.mobile-modal .modal-icon {
  width: 40px;
  height: 40px;
  font-size: 16px;
}

.modal-premium-header h2 {
  flex: 1;
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: #1a1a2e;
}

.mobile-modal .modal-premium-header h2 {
  font-size: 18px;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;
  font-size: 18px;
}

.modal-close:hover {
  color: rgb(10, 2, 2);
  transform: rotate(90deg);
}

.modal-premium-body {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
  background: #fafbfc;
}

.mobile-modal .modal-premium-body {
  padding: 16px;
}

.modal-premium-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.modal-premium-footer.mobile-footer {
  flex-direction: column;
  padding: 16px 20px;
}

/* ==================== TASK DETAILS ==================== */
.task-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.task-detail-header.mobile-header {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.task-detail-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
}

.status-badge-premium {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
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

.status-text {
  display: inline;
}

.task-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.task-detail-grid.mobile-grid {
  grid-template-columns: 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item.full-width {
  grid-column: span 2;
}

.mobile-grid .detail-item.full-width {
  grid-column: span 1;
}

.detail-item label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #9ca3af;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-item p {
  font-size: 14px;
  color: #374151;
}

.description-text {
  background: #f8fafc;
  padding: 12px;
  border-radius: 12px;
  line-height: 1.6;
}

.comment-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 13px;
  resize: vertical;
  font-family: inherit;
}

.comment-textarea.mobile-textarea {
  font-size: 16px;
}

.comment-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* ==================== TASK FORM ==================== */
.task-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-row.mobile-row {
  grid-template-columns: 1fr;
  gap: 12px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 13px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.mobile-modal .form-field input,
.mobile-modal .form-field select,
.mobile-modal .form-field textarea {
  font-size: 16px;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-field small {
  font-size: 11px;
  color: #9ca3af;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.form-actions.mobile-actions {
  flex-direction: column;
}

.form-actions.mobile-actions button {
  width: 100%;
  justify-content: center;
}

/* ==================== LOAD MORE ==================== */
.load-more-container {
  text-align: center;
  margin-top: 28px;
}

.load-more-btn {
  padding: 10px 28px;
  background: #f3f4f6;
  border: none;
  border-radius: 40px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.load-more-btn:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

/* ==================== EMPTY STATE ==================== */
.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  grid-column: 1 / -1;
}

.empty-state-premium.empty-mobile {
  padding: 40px 16px;
}

.empty-state-premium i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-mobile .empty-state-premium i {
  font-size: 48px;
}

.empty-state-premium h4 {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 8px;
}

.empty-mobile .empty-state-premium h4 {
  font-size: 16px;
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 1024px) {
  .task-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 12px;
  }

  .task-container {
    padding: 16px;
    border-radius: 20px;
  }

  .mobile-header {
    display: flex;
  }

  .task-header-premium {
    display: none;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .stat-card {
    padding: 14px;
    flex-direction: column;
    text-align: center;
    gap: 6px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .stat-value {
    font-size: 18px;
  }

  .stat-label {
    font-size: 10px;
  }

  .filter-grid {
    flex-direction: column;
  }

  .filter-grid.filters-hidden {
    display: none;
  }

  .filter-group {
    min-width: auto;
  }

  .section-title {
    font-size: 14px;
  }

  .task-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .task-detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-item.full-width {
    grid-column: span 1;
  }

  .modal-premium-container {
    max-width: 95%;
  }

  .modal-premium-header {
    padding: 16px 20px;
  }

  .modal-premium-body {
    padding: 16px;
  }

  .modal-premium-footer {
    padding: 16px 20px;
  }

  .btn-text {
    display: none;
  }

  .reminder-card {
    padding: 12px 16px;
  }

  .reminder-icon {
    width: 30px;
    height: 30px;
    font-size: 12px;
  }

  .reminder-content strong {
    font-size: 13px;
  }

  .task-card-footer.mobile-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .task-status-select {
    width: 100%;
  }

  .task-actions.mobile-actions {
    justify-content: flex-end;
  }

  .load-more-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }

  .task-container {
    padding: 12px;
    border-radius: 16px;
  }

  .mobile-title {
    font-size: 16px;
  }

  .mobile-add-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .stat-card {
    padding: 10px;
  }

  .stat-icon {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .stat-value {
    font-size: 16px;
  }

  .task-card-premium.mobile-card {
    padding: 12px;
  }

  .task-title {
    font-size: 14px;
  }

  .task-description.mobile-desc {
    font-size: 12px;
  }

  .task-priority-badge {
    font-size: 10px;
    padding: 3px 10px;
  }

  .task-date {
    font-size: 10px;
  }

  .icon-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .modal-premium-header h2 {
    font-size: 16px;
  }

  .modal-icon {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }

  .form-field input,
  .form-field select,
  .form-field textarea {
    font-size: 15px;
    padding: 8px 12px;
  }

  .comment-textarea.mobile-textarea {
    font-size: 15px;
  }

  .empty-state-premium i {
    font-size: 40px;
  }
}
</style>