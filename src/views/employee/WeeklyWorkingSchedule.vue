<template>
  <div class="layout">
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content">
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
          <button class="menu-toggle" @click="toggleSidebar">
            <i class="fas fa-bars"></i>
          </button>
          <div class="mobile-title">
            <i class="fas fa-list-check"></i>
            <span>Weekly To-Do</span>
          </div>
          <div class="mobile-stats-badge">
            <span>{{ tasks.length }}</span>
          </div>
        </div>

        <!-- Desktop Header -->
        <div class="content-header" v-else>
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-list-check"></i>
            </div>
            <div>
              <h1>Weekly To-Do List</h1>
              <p class="subtitle">Manage your team's weekly tasks</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn-send-report" @click="showReportOptions" :disabled="isSendingEmail">
              <i class="fas fa-share-alt"></i>
              Send Report
            </button>
            <span class="task-count">{{ tasks.length }} tasks</span>
          </div>
        </div>

        <!-- Send Report Modal -->
        <div class="modal-overlay" v-if="showModal" @click="closeModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>Send Weekly Report</h3>
              <button class="modal-close" @click="closeModal">&times;</button>
            </div>
            <div class="modal-body">
              <p class="modal-subtitle">Choose how you want to send the weekly report:</p>
              
              <div class="report-options">
                <button class="report-option whatsapp" @click="sendWhatsAppReport" :disabled="isSendingEmail">
                  <i class="fab fa-whatsapp"></i>
                  <div class="option-details">
                    <span class="option-title">WhatsApp</span>
                    <span class="option-desc">Send via WhatsApp message</span>
                  </div>
                </button>
                
                <button class="report-option email" @click="sendEmailReport" :disabled="isSendingEmail">
                  <i class="fas fa-envelope"></i>
                  <div class="option-details">
                    <span class="option-title">Email</span>
                    <span class="option-desc">Send</span>
                  </div>
                  <div class="loader-container" v-if="isSendingEmail">
                    <div class="loader"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Week Navigation -->
        <div class="week-nav">
          <button @click="previousWeek" class="nav-btn"><i class="fas fa-chevron-left"></i></button>
          <span class="week-label">{{ getWeekRange() }}</span>
          <button @click="nextWeek" class="nav-btn"><i class="fas fa-chevron-right"></i></button>
          <button @click="currentWeek" class="nav-btn today">Today</button>
        </div>

        <!-- Add Task Form -->
        <div class="card">
          <div class="card-header" @click="toggleForm">
            <div class="card-title">
              <i class="fas fa-plus-circle"></i>
              <span>{{ editingId ? 'Edit Task' : 'Add New Task' }}</span>
            </div>
            <i class="fas fa-chevron-down form-toggle" :class="{ rotated: formVisible }"></i>
          </div>

          <div class="form-section" :class="{ hidden: !formVisible }">
            <div class="form-row">
              <div class="form-group">
                <label>Task Title *</label>
                <input type="text" v-model="form.title" placeholder="What needs to be done?" />
              </div>
              <div class="form-group">
                <label>Assigned To *</label>
                <select v-model="form.assigned_to">
                  <option value="">Select Employee</option>
                  <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                    {{ formatName(emp.name) }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Status</label>
                <select v-model="form.status">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div class="form-group">
                <label>Day (Optional)</label>
                <select v-model="form.day">
                  <option value="">Not Specified</option>
                  <option v-for="day in weekDays" :key="day" :value="day">{{ day }}</option>
                </select>
              </div>
            </div>
            <div class="form-group full">
              <label>Description (optional)</label>
              <textarea v-model="form.description" rows="2" placeholder="Additional details..."></textarea>
            </div>
            <div class="form-actions">
              <button class="btn-submit" @click="submitTask" :disabled="isSubmitting">
                <i class="fas fa-save"></i> {{ editingId ? 'Update' : 'Add Task' }}
              </button>
              <button v-if="editingId" class="btn-cancel" @click="cancelEdit">Cancel</button>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="filters">
          <select v-model="statusFilter" class="filter-select">
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select v-model="employeeFilter" class="filter-select">
            <option value="">All Employees</option>
            <option v-for="emp in itEmployees" :key="emp.id" :value="emp.id">
              {{ formatName(emp.name) }}
            </option>
          </select>
          <input type="text" v-model="searchQuery" placeholder="Search tasks..." class="search-input" />
          
          <!-- Mobile Send Report Button -->
          <button class="btn-send-report-mobile" @click="showReportOptions" v-if="isMobile" :disabled="isSendingEmail">
            <i class="fas fa-share-alt"></i>
            Send Report
          </button>
        </div>

        <!-- Task List -->
        <div class="card task-list">
          <div class="card-header">
            <div class="card-title">
              <i class="fas fa-tasks"></i>
              <span>Tasks</span>
              <span class="badge">{{ filteredTasks.length }}</span>
            </div>
            <div class="sort-info">
              <i class="fas fa-sort-amount-up"></i>
              <span>Oldest first</span>
            </div>
          </div>

          <!-- Desktop Table -->
          <div class="table-wrapper" v-if="!isMobile">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Task</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(task, index) in filteredTasks" :key="task.id">
                  <td class="serial-number">{{ index + 1 }}</td>
                  <td>
                    <div class="task-title">{{ task.title }}</div>
                    <div class="task-desc" v-if="task.description">{{ task.description }}</div>
                    <div class="task-day" v-if="task.day">
                      <span class="day-badge-small">{{ task.day }}</span>
                    </div>
                  </td>
                  <td>{{ formatName(getEmployeeName(task.assigned_to)) }}</td>
                  <td>
                    <span :class="['status-badge', task.status.toLowerCase().replace(' ', '-')]">
                      {{ task.status }}
                    </span>
                  </td>
                  <td>
                    <span class="date-added">{{ formatDate(task.created_at) }}</span>
                  </td>
                  <td>
                    <div class="actions">
                      <button class="action-btn edit" @click="editTask(task)" title="Edit">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="action-btn delete" @click="deleteTask(task.id)" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredTasks.length === 0">
                  <td colspan="6" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No tasks found for this week</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="mobile-cards" v-else>
            <div v-for="(task, index) in filteredTasks" :key="task.id" class="task-card">
              <div class="task-card-header">
                <span class="task-number">#{{ index + 1 }}</span>
                <span class="task-title">{{ task.title }}</span>
                <div class="card-actions">
                  <button class="action-btn edit" @click="editTask(task)"><i class="fas fa-edit"></i></button>
                  <button class="action-btn delete" @click="deleteTask(task.id)"><i class="fas fa-trash-alt"></i></button>
                </div>
              </div>
              <div class="task-card-body">
                <div class="detail" v-if="task.day"><span class="label">Day:</span> {{ task.day }}</div>
                <div class="detail"><span class="label">Assigned:</span> {{ formatName(getEmployeeName(task.assigned_to)) }}</div>
                <div class="detail"><span class="label">Status:</span> 
                  <span :class="['status-badge', task.status.toLowerCase().replace(' ', '-')]">{{ task.status }}</span>
                </div>
                <div class="detail"><span class="label">Added:</span> {{ formatDate(task.created_at) }}</div>
                <div class="detail" v-if="task.description"><span class="label">Note:</span> {{ task.description }}</div>
              </div>
            </div>
            <div v-if="filteredTasks.length === 0" class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>No tasks found</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import axios from "axios";
import { toastSuccess, toastError, toastWarning } from "@/utils/toast.js";

export default {
  components: { Sidebar },

  data() {
    return {
      isSubmitting: false,
      isSendingEmail: false,
      editingId: null,
      isMobile: false,
      isSidebarVisible: true,
      formVisible: false,
      searchQuery: '',
      statusFilter: '',
      employeeFilter: '',
      currentWeekOffset: 0,
      showModal: false,
      weekDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      employees: [],
      itEmployees: [], // Added: Store only IT employees
      form: {
        title: '',
        description: '',
        day: '',
        assigned_to: '',
        status: 'Pending',
      },
      tasks: [],
      loading: false,
    }
  },

  computed: {
    filteredTasks() {
      let filtered = this.tasks;
      
      // Filter by status
      if (this.statusFilter) {
        filtered = filtered.filter(t => t.status === this.statusFilter);
      }
      
      // Filter by employee (only IT employees)
      if (this.employeeFilter) {
        filtered = filtered.filter(t => t.assigned_to === this.employeeFilter);
      }
      
      // Search filter
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        filtered = filtered.filter(t => 
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          this.getEmployeeName(t.assigned_to).toLowerCase().includes(q)
        );
      }
      
      return filtered.sort((a, b) => {
        return new Date(a.created_at) - new Date(b.created_at);
      });
    }
  },

  methods: {
    formatName(name) {
      if (!name) return 'Unassigned';
      return name
        .split(' ')
        .map(word => {
          if (word.length === 0) return word;
          if (word.match(/^Mc[A-Z]/)) return word;
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
    },

    getWeekRange() {
      const now = new Date();
      const currentDate = new Date(now);
      currentDate.setDate(now.getDate() + (this.currentWeekOffset * 7));
      const dayOfWeek = currentDate.getDay();
      const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(currentDate);
      monday.setDate(diff);
      monday.setHours(0,0,0,0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const opts = { day: '2-digit', month: 'short', year: 'numeric' };
      return `${monday.toLocaleDateString('en-IN', opts)} - ${sunday.toLocaleDateString('en-IN', opts)}`;
    },

    previousWeek() { this.currentWeekOffset--; this.fetchTasks(); },
    nextWeek() { this.currentWeekOffset++; this.fetchTasks(); },
    currentWeek() { this.currentWeekOffset = 0; this.fetchTasks(); },

    toggleForm() {
      this.formVisible = !this.formVisible;
    },

    showReportOptions() {
      if (this.tasks.length === 0) {
        toastWarning('No tasks to report. Please add some tasks first.');
        return;
      }
      this.showModal = true;
    },

    closeModal() {
      if (this.isSendingEmail) return;
      this.showModal = false;
    },

    getEmployeeName(id) {
      const emp = this.employees.find(e => e.id === id);
      return emp ? emp.name : 'Unassigned';
    },

    formatDate(date) {
      if (!date) return '—';
      const d = new Date(date);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dateObj = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      
      const diffTime = Math.abs(today - dateObj);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Today ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays <= 7) {
        return diffDays + ' days ago';
      } else {
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    },

    /**
     * Generate WhatsApp report message
     */
    generateReportMessage() {
      const weekRange = this.getWeekRange();
      const totalTasks = this.tasks.length;
      const completed = this.tasks.filter(t => t.status === 'Completed').length;
      const inProgress = this.tasks.filter(t => t.status === 'In Progress').length;
      const pending = this.tasks.filter(t => t.status === 'Pending').length;
      
      const completionPercentage = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
      
      let message = `WEEKLY TASK REPORT\n`;
      message += `═══════════════════════════════════════\n\n`;
      
      message += `Week: ${weekRange}\n`;
      message += `Report Date: ${new Date().toLocaleString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}\n\n`;
      
      message += `PERFORMANCE SUMMARY\n`;
      message += `───────────────────────────────────────\n`;
      message += `Total Tasks    : ${totalTasks}\n`;
      message += `Completed      : ${completed}\n`;
      message += `In Progress    : ${inProgress}\n`;
      message += `Pending        : ${pending}\n`;
      message += `───────────────────────────────────────\n`;
      message += `Completion Rate: ${completionPercentage}%\n\n`;
      
      const barLength = 20;
      const filledBars = Math.round((completionPercentage / 100) * barLength);
      const emptyBars = barLength - filledBars;
      const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);
      message += `[${progressBar}] ${completionPercentage}%\n\n`;
      
      if (this.tasks.length > 0) {
        message += `TASK BREAKDOWN\n`;
        message += `═══════════════════════════════════════\n\n`;
        
        const completedTasks = this.tasks.filter(t => t.status === 'Completed');
        const inProgressTasks = this.tasks.filter(t => t.status === 'In Progress');
        const pendingTasks = this.tasks.filter(t => t.status === 'Pending');
        
        if (completedTasks.length > 0) {
          message += `COMPLETED TASKS (${completedTasks.length})\n`;
          message += `───────────────────────────────────────\n`;
          completedTasks.forEach((task, index) => {
            const assignedTo = this.formatName(this.getEmployeeName(task.assigned_to));
            message += `${index + 1}. ${task.title}\n`;
            message += `   Assigned To: ${assignedTo}`;
            if (task.day) message += ` | Day: ${task.day}`;
            message += `\n`;
            
            if (task.description) {
              const descLines = task.description.split('\n');
              if (descLines.length === 1) {
                message += `   Description: ${descLines[0]}\n`;
              } else {
                message += `   Description: ${descLines[0]}\n`;
                for (let i = 1; i < descLines.length; i++) {
                  message += `                ${descLines[i]}\n`;
                }
              }
            }
            message += `\n`;
          });
        }
        
        if (inProgressTasks.length > 0) {
          message += `IN PROGRESS (${inProgressTasks.length})\n`;
          message += `───────────────────────────────────────\n`;
          inProgressTasks.forEach((task, index) => {
            const assignedTo = this.formatName(this.getEmployeeName(task.assigned_to));
            message += `${index + 1}. ${task.title}\n`;
            message += `   Assigned To: ${assignedTo}`;
            if (task.day) message += ` | Day: ${task.day}`;
            message += `\n`;
            
            if (task.description) {
              const descLines = task.description.split('\n');
              if (descLines.length === 1) {
                message += `   Description: ${descLines[0]}\n`;
              } else {
                message += `   Description: ${descLines[0]}\n`;
                for (let i = 1; i < descLines.length; i++) {
                  message += `                ${descLines[i]}\n`;
                }
              }
            }
            message += `\n`;
          });
        }
        
        if (pendingTasks.length > 0) {
          message += `PENDING TASKS (${pendingTasks.length})\n`;
          message += `───────────────────────────────────────\n`;
          pendingTasks.forEach((task, index) => {
            const assignedTo = this.formatName(this.getEmployeeName(task.assigned_to));
            message += `${index + 1}. ${task.title}\n`;
            message += `   Assigned To: ${assignedTo}`;
            if (task.day) message += ` | Day: ${task.day}`;
            message += `\n`;
            
            if (task.description) {
              const descLines = task.description.split('\n');
              if (descLines.length === 1) {
                message += `   Description: ${descLines[0]}\n`;
              } else {
                message += `   Description: ${descLines[0]}\n`;
                for (let i = 1; i < descLines.length; i++) {
                  message += `                ${descLines[i]}\n`;
                }
              }
            }
            message += `\n`;
          });
        }
      } else {
        message += `No tasks found for this week.\n`;
        message += `───────────────────────────────────────\n`;
        message += `Please add tasks to track your weekly progress.\n\n`;
      }
      
      message += `═══════════════════════════════════════\n`;
      
      return message;
    },

    /**
     * Send WhatsApp report
     */
    sendWhatsAppReport() {
      this.closeModal();
      const message = this.generateReportMessage();
      const encodedMessage = encodeURIComponent(message);
      
      // WhatsApp numbers
      const numbers = ['918390704453', '918390704453'];
      
      // Open WhatsApp for the first number
      const firstNumber = numbers[0];
      const whatsappUrl = `https://wa.me/${firstNumber}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
      toastSuccess('Opening WhatsApp to send report...');
      
      // Ask if they want to send to second number
      setTimeout(() => {
        if (confirm('Do you want to send this report to the second manager as well?')) {
          const secondUrl = `https://wa.me/${numbers[1]}?text=${encodedMessage}`;
          window.open(secondUrl, '_blank');
        }
      }, 1500);
    },

    /**
     * Send Email Report with Loader
     */
    async sendEmailReport() {
      if (this.isSendingEmail) return;
      
      this.isSendingEmail = true;
      this.showModal = false;
      
      // Show loading toast
      toastSuccess('Sending email report... Please wait.');
      
      try {
        const reportData = {
          subject: `Weekly Task Report - ${this.getWeekRange()}`,
          message: this.generateReportMessage(),
          recipient: 'prasad@archenterprises.co.in',
          employee_name: localStorage.getItem('user_name') || 'Team Member',
          week_range: this.getWeekRange(),
          task_count: this.tasks.length,
          completed: this.tasks.filter(t => t.status === 'Completed').length,
          in_progress: this.tasks.filter(t => t.status === 'In Progress').length,
          pending: this.tasks.filter(t => t.status === 'Pending').length,
          tasks: this.tasks.map(task => ({
            title: task.title,
            description: task.description,
            day: task.day,
            assigned_to: this.getEmployeeName(task.assigned_to),
            status: task.status,
            created_at: task.created_at
          }))
        };

        const response = await axios.post('/api/send-weekly-report', reportData, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        this.isSendingEmail = false;

        if (response.data.success) {
          toastSuccess('✅ Report sent successfully!');
        } else {
          toastError('Failed to send email report');
        }
      } catch (error) {
        this.isSendingEmail = false;
        console.error('Email send error:', error);
        toastError(error.response?.data?.message || 'Failed to send email report');
      }
    },

    async fetchEmployees() {
      try {
        const res = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.employees = res.data;
        
        // Filter employees with department 'IT'
        this.itEmployees = this.employees.filter(emp => 
          emp.department && emp.department.toUpperCase() === 'IT' || 'Marketing'
        );
        
        // If no IT employees found, show all employees (fallback)
        if (this.itEmployees.length === 0) {
          console.warn('No IT employees found. Showing all employees.');
          this.itEmployees = [...this.employees];
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        toastError('Failed to load employees');
      }
    },

    async submitTask() {
      if (!this.form.title || !this.form.assigned_to) {
        toastWarning('Please fill in all required fields');
        return;
      }
      this.isSubmitting = true;
      const url = this.editingId ? `/api/weekly-tasks/${this.editingId}` : '/api/weekly-tasks';
      const method = this.editingId ? 'put' : 'post';
      try {
        await axios({
          method,
          url,
          data: { ...this.form, week_offset: this.currentWeekOffset },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const msg = this.editingId ? 'Task updated!' : 'Task added!';
        this.resetForm();
        await this.fetchTasks();
        toastSuccess(msg);
        if (this.isMobile) this.formVisible = false;
      } catch (error) {
        console.error('Submit error:', error);
        toastError(error.response?.data?.message || 'Failed to save task');
      } finally {
        this.isSubmitting = false;
      }
    },

    resetForm() {
      this.form = { title: '', description: '', day: '', assigned_to: '', status: 'Pending' };
      this.editingId = null;
    },

    cancelEdit() {
      this.resetForm();
    },

    editTask(task) {
      this.editingId = task.id;
      this.form = { ...task };
      this.formVisible = true;
      if (this.isMobile) {
        this.searchQuery = '';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    async deleteTask(id) {
      if (!confirm('Delete this task?')) return;
      try {
        await axios.delete(`/api/weekly-tasks/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        await this.fetchTasks();
        toastSuccess('Task deleted');
      } catch (error) {
        console.error('Delete error:', error);
        toastError('Failed to delete task');
      }
    },

  async fetchTasks() {
  this.loading = true;
  try {
    const res = await axios.get('/api/weekly-tasks', {
      params: { week_offset: this.currentWeekOffset },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    
    // ✅ SHOW ALL TASKS TO ALL USERS
    // Just assign all tasks directly without filtering
    this.tasks = res.data;
    
  } catch (error) {
    console.error('Fetch tasks error:', error);
    toastError('Failed to load tasks');
    this.tasks = [];
  } finally {
    this.loading = false;
  }
},

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    }
  },

  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/auth');
      return;
    }
    
    this.fetchEmployees();
    this.fetchTasks();
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  }
}
</script>

<style scoped>
/* ... (previous styles remain the same) ... */

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  font-size: 22px;
  font-weight: 700;
  color: var(--dark);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  color: var(--gray);
  cursor: pointer;
  padding: 0 8px;
  transition: 0.2s;
}

.modal-close:hover {
  color: var(--danger);
}

.modal-close:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-subtitle {
  color: var(--gray);
  margin-bottom: 24px;
  font-size: 15px;
}

.report-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border: 2px solid var(--border);
  border-radius: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-align: left;
  position: relative;
}

.report-option:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.report-option:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.report-option i {
  font-size: 28px;
  width: 40px;
  text-align: center;
}

.report-option.whatsapp i {
  color: #25D366;
}

.report-option.whatsapp:hover:not(:disabled) {
  border-color: #25D366;
  background: #f0faf4;
}

.report-option.email i {
  color: #ea4335;
}

.report-option.email:hover:not(:disabled) {
  border-color: #ea4335;
  background: #fdf0ee;
}

.option-details {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.option-title {
  font-weight: 600;
  color: var(--dark);
  font-size: 16px;
}

.option-desc {
  font-size: 13px;
  color: var(--gray);
  margin-top: 2px;
}

/* Loader Styles */
.loader-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
}

.loader {
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #ea4335;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Modal Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Modal */
@media (max-width: 480px) {
  .modal-content {
    padding: 20px;
    width: 95%;
  }
  
  .modal-header h3 {
    font-size: 18px;
  }
  
  .report-option {
    padding: 14px 16px;
  }
  
  .report-option i {
    font-size: 24px;
    width: 32px;
  }
  
  .option-title {
    font-size: 14px;
  }
  
  .option-desc {
    font-size: 12px;
  }
  
  .loader {
    width: 20px;
    height: 20px;
  }
}

/* === Global Reset & Variables === */
* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --primary: #667eea;
  --primary-dark: #5a6fd6;
  --dark: #1a1a2e;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --whatsapp: #25D366;
  --whatsapp-dark: #128C7E;
  --gray: #6b7280;
  --light-bg: #f8fafc;
  --border: #e5e7eb;
}

body { font-family: 'Inter', sans-serif; background: #f1f5f9; }

.layout { min-height: 100vh; }
.main-content { display: flex; gap: 20px; padding: 20px; min-height: 100vh; }
.content { flex: 1; background: white; border-radius: 24px; padding: 28px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); overflow-x: auto; }

/* Mobile Header */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.menu-toggle { background: none; border: none; font-size: 20px; cursor: pointer; }
.mobile-title { display: flex; align-items: center; gap: 10px; font-weight: 600; }
.mobile-title i { color: var(--primary); }
.mobile-stats-badge { background: var(--primary); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; }

/* Desktop Header */
.content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.title-icon { width: 48px; height: 48px; background: var(--primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 22px; }
.content-header h1 { font-size: 24px; font-weight: 700; color: var(--dark); }
.subtitle { color: var(--gray); font-size: 14px; }
.header-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.header-actions .task-count { background: var(--light-bg); padding: 6px 14px; border-radius: 20px; font-size: 14px; color: var(--dark); }

/* Send Report Button */
.btn-send-report {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: #389f38;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-send-report:hover:not(:disabled) {
  background: #267926;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
}

.btn-send-report:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-send-report i {
  font-size: 18px;
}

.btn-send-report-mobile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: #389f38;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.btn-send-report-mobile:hover:not(:disabled) {
  background: #267926;
}

.btn-send-report-mobile:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-send-report-mobile i {
  font-size: 18px;
}

/* Week Navigation */
.week-nav { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding: 8px 16px; background: var(--light-bg); border-radius: 14px; flex-wrap: wrap; }
.nav-btn { background: white; border: 1px solid var(--border); border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: 0.2s; color: var(--gray); }
.nav-btn:hover { background: var(--primary); color: white; border-color: var(--primary); }
.nav-btn.today { background: var(--primary); color: white; border-color: var(--primary); }
.nav-btn.today:hover { background: var(--primary-dark); }
.week-label { font-weight: 600; color: var(--dark); flex: 1; text-align: center; }

/* Card */
.card { background: white; border: 1px solid var(--border); border-radius: 18px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.card-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; }
.card-header:hover { opacity: 0.8; }
.card-title { display: flex; align-items: center; gap: 10px; font-weight: 600; color: var(--dark); }
.card-title i { color: var(--primary); }
.badge { background: var(--primary); color: white; padding: 0 10px; border-radius: 12px; font-size: 12px; }
.form-toggle { transition: transform 0.3s; color: var(--gray); }
.form-toggle.rotated { transform: rotate(180deg); }

/* Sort Info */
.sort-info { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--gray); }
.sort-info i { color: var(--primary); }

/* Form */
.form-section { margin-top: 16px; transition: all 0.3s ease; overflow: hidden; }
.form-section.hidden { display: none; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { font-size: 13px; font-weight: 600; color: #374151; }
.form-group input, .form-group select, .form-group textarea {
  padding: 8px 12px;
  border: 2px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  transition: 0.2s;
  background: white;
  font-family: inherit;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(102,126,234,0.15);
}
.form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
.btn-submit, .btn-cancel {
  padding: 8px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn-submit { background: var(--primary); color: white; }
.btn-submit:hover:not(:disabled) { background: var(--primary-dark); transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-cancel { background: #e5e7eb; color: #374151; }
.btn-cancel:hover { background: #d1d5db; }

/* Filters */
.filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
.filter-select, .search-input {
  padding: 8px 12px;
  border: 2px solid var(--border);
  border-radius: 10px;
  background: white;
  font-size: 14px;
  transition: 0.2s;
  flex: 1 1 150px;
}
.filter-select:focus, .search-input:focus {
  outline: none;
  border-color: var(--primary);
}
.search-input { flex: 2 1 200px; }

/* Table */
.table-wrapper { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 12px 14px; font-size: 12px; font-weight: 600; color: var(--gray); border-bottom: 2px solid var(--border); background: var(--light-bg); }
td { padding: 12px 14px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
tr:hover td { background: #fafbfc; }
.serial-number { color: var(--gray); font-size: 12px; font-weight: 500; }
.task-title { font-weight: 500; color: var(--dark); }
.task-desc { font-size: 12px; color: var(--gray); }
.task-day { margin-top: 4px; }
.day-badge-small { background: #e0e7ff; color: var(--primary); padding: 1px 8px; border-radius: 8px; font-size: 10px; }
.date-added { font-size: 12px; color: var(--gray); }

/* Status Badge */
.status-badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; display: inline-block; }
.status-badge.pending { background: #fef3c7; color: #d97706; }
.status-badge.in-progress { background: #dbeafe; color: #1e40af; }
.status-badge.completed { background: #d1fae5; color: #065f46; }

/* Actions */
.actions { display: flex; gap: 6px; }
.action-btn { width: 30px; height: 30px; border: none; border-radius: 8px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; }
.action-btn.edit { background: #e0e7ff; color: var(--primary); }
.action-btn.edit:hover { background: #c7d2fe; }
.action-btn.delete { background: #fee2e2; color: var(--danger); }
.action-btn.delete:hover { background: #fecaca; }

/* Empty State */
.empty-state { text-align: center; padding: 40px 20px; color: var(--gray); }
.empty-state i { font-size: 48px; opacity: 0.4; margin-bottom: 12px; }

/* Loading State */
.loading-state { text-align: center; padding: 20px; color: var(--gray); }
.spinner { animation: spin 1s linear infinite; }

/* Mobile Cards */
.mobile-cards { display: none; flex-direction: column; gap: 14px; }
.task-card { border: 1px solid var(--border); border-radius: 14px; padding: 14px; background: white; }
.task-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap; }
.task-number { font-size: 12px; color: var(--gray); font-weight: 500; }
.task-card-header .task-title { font-weight: 600; font-size: 16px; flex: 1; }
.card-actions { display: flex; gap: 6px; margin-left: auto; }
.task-card-body .detail { display: flex; gap: 8px; margin-top: 4px; font-size: 14px; }
.task-card-body .label { font-weight: 500; color: var(--gray); min-width: 70px; }

/* Responsive */
@media (max-width: 768px) {
  .main-content { flex-direction: column; padding: 12px; }
  .content { padding: 16px; border-radius: 20px; }
  .mobile-header { display: flex; }
  .content-header { display: none; }
  .form-row { grid-template-columns: 1fr; }
  .filters { flex-direction: column; }
  .filter-select, .search-input { flex: 1; }
  .search-input { order: 1; }
  .btn-send-report-mobile { order: 2; }
  .table-wrapper { display: none; }
  .mobile-cards { display: flex; }
  .week-nav { justify-content: center; }
  .week-label { font-size: 13px; }
  .sort-info { font-size: 10px; }
}

@media (max-width: 480px) {
  .content { padding: 12px; }
  .card { padding: 14px; }
  .task-card { padding: 12px; }
  .task-card-body .detail { font-size: 13px; flex-wrap: wrap; }
  .task-card-header .task-title { font-size: 14px; }
}

/* Desktop form visible by default */
@media (min-width: 769px) {
  .form-section.hidden {
    display: none;
  }
  .form-section:not(.hidden) {
    display: block;
  }
}
</style>