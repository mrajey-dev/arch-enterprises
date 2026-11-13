<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="main-content-work-report">
        <section class="report-container">
          <!-- Mobile Header -->
          <div class="mobile-header" v-if="isMobile">
           
            <div class="mobile-title">
              <i class="fas fa-file-alt"></i>
              <span>Work Reports</span>
            </div>
            <button class="mobile-add-btn" @click="openAssignTaskModal">
              <i class="fas fa-plus"></i>
            </button>
          </div>

          <!-- Desktop Header -->
          <div class="content-header-modern" v-else>
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

          <!-- Stats Bar - Mobile Optimized -->
          <div class="stats-bar">
            <div class="stat-card" @click="filterByStatus('all')">
              <i class="fas fa-tasks"></i>
              <div class="stat-info">
                <span class="stat-value">{{ reports.length }}</span>
                <span class="stat-label">Total</span>
              </div>
            </div>
            <div class="stat-card pending" @click="filterByStatus('Pending')">
              <i class="fas fa-clock"></i>
              <div class="stat-info">
                <span class="stat-value">{{ pendingTasks }}</span>
                <span class="stat-label">Pending</span>
              </div>
            </div>
            <div class="stat-card progress" @click="filterByStatus('In Progress')">
              <i class="fas fa-spinner"></i>
              <div class="stat-info">
                <span class="stat-value">{{ inProgressTasks }}</span>
                <span class="stat-label">Progress</span>
              </div>
            </div>
            <div class="stat-card completed" @click="filterByStatus('Completed')">
              <i class="fas fa-check-circle"></i>
              <div class="stat-info">
                <span class="stat-value">{{ completedTasks }}</span>
                <span class="stat-label">Completed</span>
              </div>
            </div>
          </div>

          <!-- Search and Filters - Mobile Optimized -->
          <div class="search-filter-section">
            <div class="filter-toggle-btn" @click="toggleFilters">
              <i class="fas fa-sliders-h"></i>
              <span>{{ isMobile ? 'Filters' : 'Filter' }}</span>
              <i class="fas fa-chevron-down" :class="{ 'rotated': filtersVisible }"></i>
            </div>

            <div class="filter-group-modern" :class="{ 'filters-hidden': !filtersVisible }">
              <div class="search-wrapper-modern">
                <i class="fas fa-search search-icon"></i>
                <input
                  type="text"
                  v-model="filters.search"
                  class="search-input-modern"
                  placeholder="Search tasks..."
                />
              </div>

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

          <!-- Loading State -->
          <div v-if="loading" class="work-reports-loading-box">
            <div class="loader-spinner-wrapper">
              <i class="fas fa-circle-notch fa-spin"></i>
            </div>
            <h3>Loading Work Reports...</h3>
            <p>Fetching employee task sheets and daily updates</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="reports.length === 0" class="empty-reports-state">
            <div class="empty-icon-wrap">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <h3>No Work Reports Found</h3>
            <p>No reports match your current filters or search criteria.</p>
            <button class="clear-filter-btn" @click="clearFilters" style="margin-top: 14px;">
              <i class="fas fa-redo"></i> Reset Filters
            </button>
          </div>

          <!-- Report Cards Grid - Mobile Optimized -->
          <div v-else class="report-grid-premium">
            <transition-group name="card-fade" tag="div" class="cards-grid-two">
              <div
                class="report-card-premium"
                :class="{ 'assigned-task-card': report.priority === 'Task Assigned', 'mobile-card': isMobile }"
                v-for="report in visibleReports"
                :key="report.id"
                @click="openModal(report)"
              >
                <!-- Assigned task badge -->
                <div v-if="report.priority === 'Task Assigned'" class="assigned-badge">
                  <i class="fas fa-tasks"></i> Assigned
                </div>
                <div class="card-accent" :class="report.status.toLowerCase()"></div>
                <div class="card-header-premium">
                  <div class="header-info">
                    <div class="task-icon">
                      <i class="fas fa-clipboard-list"></i>
                    </div>
                    <div>
                      <h3>{{ truncateText(report.name, isMobile ? 25 : 30) }}</h3>
                      <div class="meta-tags">
                        <span class="date-badge">
                          <i class="fas fa-calendar-alt"></i> {{ report.date }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span :class="['status-badge-premium', getStatusClass(report.status)]">
                    <i :class="getStatusIcon(report.status)"></i>
                    <span class="status-text">{{ report.status }}</span>
                  </span>
                </div>

                <div class="card-body-premium">
                  <div class="info-row">
                    <i class="fas fa-user"></i>
                    <span><strong>Assigned To:</strong> {{ report.username }}</span>
                  </div>
                  <div class="info-row" v-if="!isMobile">
                    <i class="fas fa-building"></i>
                    <span><strong>Department:</strong> {{ report.department }}</span>
                  </div>
                  <div class="info-row" v-if="report.priority === 'Task Assigned'">
                    <i class="fas fa-user-check"></i>
                    <span><strong>Assign By:</strong> {{ report.assign_by_name || '-' }}</span>
                  </div>
                  <div class="info-row summary">
                    <i class="fas fa-align-left"></i>
                    <span><strong>Summary:</strong> {{ truncateText(report.summary, isMobile ? 60 : 100) }}</span>
                  </div>
                  <div class="info-row" v-if="report.comment && !isMobile">
                    <i class="fas fa-comment"></i>
                    <span><strong>Comment:</strong> {{ truncateText(report.comment, 80) }}</span>
                  </div>
                </div>

                <div class="card-footer-premium" :class="{ 'mobile-footer': isMobile }">
                  <button class="action-edit" @click.stop="editTask(report)">
                    <i class="fas fa-edit"></i> <span class="btn-text">Edit</span>
                  </button>
                  <button class="action-delete" @click.stop="deleteTask(report.id)">
                    <i class="fas fa-trash-alt"></i> <span class="btn-text">Delete</span>
                  </button>
                </div>
              </div>
            </transition-group>
          </div>

          <!-- Load More Button -->
          <div v-if="!loading && visibleCount < reports.length" class="load-more-wrapper">
            <button class="load-more-btn-premium" @click="loadMore">
              <i class="fas fa-chevron-down"></i> Load More
            </button>
          </div>
        </section>
      </div>
    </div>

    <!-- Task Detail Modal - Mobile Optimized -->
    <transition name="modal-fade">
      <div class="modal-backdrop" v-if="selectedReport" @click.self="closeModal">
        <div class="premium-modal detail-modal" :class="{ 'mobile-modal': isMobile }" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="header-text">
              <h2>{{ isMobile ? 'Task' : 'Task Details' }}</h2>
              <p>{{ truncateText(selectedReport.name, isMobile ? 30 : 50) }}</p>
            </div>
            <button class="close-btn-premium" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body-premium">
            <div class="detail-grid" :class="{ 'mobile-grid': isMobile }">
              <div class="detail-item">
                <i class="fas fa-user-tie"></i>
                <div>
                  <label>Assign By</label>
                  <p v-if="selectedReport.priority === 'Task Assigned'">{{ selectedReport.assign_by_name || selectedReport.manager_name || loggedUserName }}</p>
                  <p v-else>-</p>
                </div>
              </div>
              <div class="detail-item">
                <i class="fas fa-user"></i>
                <div>
                  <label>Assigned To</label>
                  <p>{{ selectedReport.username }}</p>
                </div>
              </div>
              <div class="detail-item" v-if="!isMobile">
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
              <div class="detail-item" v-if="!isMobile">
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
              <div class="detail-item full-width" v-if="selectedReport.modules !== 'N/A' && !isMobile">
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

          <div class="modal-footer-premium" :class="{ 'mobile-footer': isMobile }">
            <button class="btn-submit-premium" @click="closeModal">
              <i class="fas fa-check"></i> Close
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Assign Task Modal - Mobile Optimized -->
    <transition name="modal-fade">
      <div class="modal-backdrop" v-if="showAssignTaskModal" @click.self="closeAssignTaskModal">
        <div class="premium-modal" :class="{ 'mobile-modal': isMobile }" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium">
              <i class="fas fa-tasks"></i>
            </div>
            <div class="header-text">
              <h2>{{ isEditTaskMode ? 'Edit Task' : 'Assign Task' }}</h2>
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
                      {{ emp.name }}
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

              <div class="form-field full-width" v-if="!isMobile">
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

          <div class="modal-footer-premium" :class="{ 'mobile-footer': isMobile }">
            <button class="btn-cancel-premium" @click="closeAssignTaskModal">
              <i class="fas fa-times"></i> Cancel
            </button>
            <button class="btn-submit-premium" @click="assignTask">
              <i class="fas fa-save"></i> {{ isEditTaskMode ? 'Update' : 'Assign' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Assigned Report Modal - Mobile Optimized -->
    <transition name="modal-fade">
      <div class="modal-backdrop" v-if="showAssignedReport" @click.self="showAssignedReport = false">
        <div class="premium-modal report-modal modern-assigned-modal" :class="{ 'mobile-modal': isMobile }" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium assigned-modal-header">
            <div class="header-left-group">
              <div class="header-icon-premium assigned-icon-glow">
                <i class="fas fa-clipboard-check"></i>
              </div>
              <div class="header-text">
                <div class="title-with-pill">
                  <h2>{{ isMobile ? 'Assigned Tasks' : 'Assigned Task Report' }}</h2>
                  <span class="task-counter-pill">{{ filteredAssignedReports.length }} Tasks</span>
                </div>
                <p>{{ isMobile ? 'Overview of assigned tasks' : 'Track and manage all tasks assigned across departments' }}</p>
              </div>
            </div>
            <button class="close-btn-premium modern-close-btn" @click="showAssignedReport = false" title="Close Modal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Quick Status Tabs / Overview Pills -->
          <div class="assigned-quick-stats">
            <div 
              class="stat-chip" 
              :class="{ active: !reportFilters.status }"
              @click="reportFilters.status = ''"
            >
              <span class="chip-label">All Tasks</span>
              <span class="chip-count">{{ assignedStats.total }}</span>
            </div>
            <div 
              class="stat-chip pending" 
              :class="{ active: reportFilters.status === 'Pending' }"
              @click="reportFilters.status = reportFilters.status === 'Pending' ? '' : 'Pending'"
            >
              <span class="chip-dot pending"></span>
              <span class="chip-label">Pending</span>
              <span class="chip-count">{{ assignedStats.pending }}</span>
            </div>
            <div 
              class="stat-chip progress" 
              :class="{ active: reportFilters.status === 'In Progress' }"
              @click="reportFilters.status = reportFilters.status === 'In Progress' ? '' : 'In Progress'"
            >
              <span class="chip-dot progress"></span>
              <span class="chip-label">In Progress</span>
              <span class="chip-count">{{ assignedStats.inProgress }}</span>
            </div>
            <div 
              class="stat-chip completed" 
              :class="{ active: reportFilters.status === 'Completed' }"
              @click="reportFilters.status = reportFilters.status === 'Completed' ? '' : 'Completed'"
            >
              <span class="chip-dot completed"></span>
              <span class="chip-label">Completed</span>
              <span class="chip-count">{{ assignedStats.completed }}</span>
            </div>
          </div>

          <div class="modal-body-premium report-body assigned-body">
            <div class="report-filters modern-filters-bar" :class="{ 'mobile-filters': isMobile }">
              <div class="search-wrapper-small modern-search-wrap">
                <i class="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  v-model="reportSearch" 
                  placeholder="Search by task name, employee..." 
                />
                <button 
                  v-if="reportSearch" 
                  class="search-clear-btn" 
                  @click="reportSearch = ''" 
                  title="Clear search"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="filter-controls-group">
                <div class="select-wrapper-styled">
                  <i class="fas fa-filter select-icon"></i>
                  <select v-model="reportFilters.status" class="filter-select-small modern-select">
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div class="date-wrapper-styled">
                  <input type="date" v-model="reportFilters.date" class="filter-date-small modern-date" />
                </div>

                <button 
                  v-if="reportSearch || reportFilters.status || reportFilters.date" 
                  class="btn-reset-filters" 
                  @click="clearReportFilters"
                  title="Reset Filters"
                >
                  <i class="fas fa-undo-alt"></i>
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <!-- Mobile Report Cards -->
            <div class="mobile-report-cards" v-if="isMobile">
              <div v-for="(task, index) in filteredAssignedReports" :key="task.id" class="report-mini-card">
                <div class="mini-card-header">
                  <div class="mini-title-wrap">
                    <span class="mini-index">#{{ index + 1 }}</span>
                    <span class="mini-task-name">{{ task.name }}</span>
                  </div>
                  <span :class="['status-badge-pill', getStatusClass(task.status)]">
                    <span class="status-pulse-dot"></span>
                    {{ task.status }}
                  </span>
                </div>
                <div class="mini-card-body">
                  <div class="mini-row" v-if="task.summary && task.summary !== '-'">
                    <span class="mini-label">Summary:</span>
                    <span class="mini-val">{{ truncateText(task.summary, 60) }}</span>
                  </div>
                  <div class="mini-row">
                    <span class="mini-label">Assigned To:</span>
                    <span class="mini-val highlight">{{ task.username }}</span>
                  </div>
                  <div class="mini-row">
                    <span class="mini-label">Assign By:</span>
                    <span class="mini-val">{{ task.assign_by_name || task.manager_name || loggedUserName }}</span>
                  </div>
                  <div class="mini-row">
                    <span class="mini-label">Department:</span>
                    <span :class="['dept-badge-pill', getDeptColor(task.department)]">{{ task.department }}</span>
                  </div>
                  <div class="mini-row">
                    <span class="mini-label">Due Date:</span>
                    <span class="mini-val due-val"><i class="far fa-calendar-alt"></i> {{ formatDate(task.date) }}</span>
                  </div>
                </div>
              </div>
              <div v-if="filteredAssignedReports.length === 0" class="empty-state-modern">
                <div class="empty-icon-circle">
                  <i class="fas fa-clipboard-check"></i>
                </div>
                <h4>No assigned tasks found</h4>
                <p>Try adjusting your search query or status filter.</p>
                <button class="btn-clear-inline" @click="clearReportFilters">Clear Filters</button>
              </div>
            </div>

            <!-- Desktop Report Table -->
            <div class="table-wrapper-premium modern-table-container" v-else>
              <table class="report-table modern-task-table">
                <thead>
                  <tr>
                    <th class="th-index">#</th>
                    <th class="th-task">Task Details</th>
                    <th class="th-summary">Summary</th>
                    <th class="th-user">Assigned To</th>
                    <th class="th-assigner">Assign By</th>
                    <th class="th-dept">Department</th>
                    <th class="th-date">Due Date</th>
                    <th class="th-status">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(task, index) in filteredAssignedReports" :key="task.id" class="task-table-row">
                    <td class="td-index">
                      <span class="index-pill">{{ index + 1 }}</span>
                    </td>
                    <td class="td-task">
                      <div class="task-title-group">
                        <span class="task-name-text">{{ task.name }}</span>
                      </div>
                    </td>
                    <td class="td-summary">
                      <span v-if="task.summary && task.summary !== '-'" class="summary-text" :title="task.summary">
                        {{ truncateText(task.summary, 120) }}
                      </span>
                      <span v-else class="text-muted-dash">—</span>
                    </td>
                    <td class="td-user">
                      <div class="user-info-cell">
                        <div class="user-avatar-initials">{{ getInitials(task.username) }}</div>
                        <span class="user-name-label">{{ task.username }}</span>
                      </div>
                    </td>
                    <td class="td-assigner">
                      <div class="assigner-cell">
                        <i class="fas fa-user-check assigner-icon"></i>
                        <span>{{ task.assign_by_name || task.manager_name || loggedUserName }}</span>
                      </div>
                    </td>
                    <td class="td-dept">
                      <span :class="['dept-badge-pill', getDeptColor(task.department)]">
                        {{ task.department }}
                      </span>
                    </td>
                    <td class="td-date">
                      <div class="due-date-pill">
                        <i class="far fa-calendar-alt"></i>
                        <span>{{ formatDate(task.date) }}</span>
                      </div>
                    </td>
                    <td class="td-status">
                      <span :class="['status-badge-pill', getStatusClass(task.status)]">
                        <span class="status-pulse-dot"></span>
                        {{ task.status }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="filteredAssignedReports.length === 0">
                    <td colspan="8" class="empty-state-cell">
                      <div class="empty-state-modern">
                        <div class="empty-icon-circle">
                          <i class="fas fa-clipboard-check"></i>
                        </div>
                        <h4>No assigned tasks found</h4>
                        <p>No tasks matched your current search and filter criteria.</p>
                        <button class="btn-clear-inline" @click="clearReportFilters">
                          <i class="fas fa-undo-alt"></i> Reset Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Refined Modal Footer -->
          <div class="modal-footer-premium modern-assigned-footer" :class="{ 'mobile-footer': isMobile }">
            <div class="footer-left-info" v-if="!isMobile">
              <i class="fas fa-info-circle"></i>
              <span>Showing <strong>{{ filteredAssignedReports.length }}</strong> tasks</span>
            </div>
            <div class="footer-actions">
              <button class="btn-modern-close" @click="showAssignedReport = false">
                <i class="fas fa-check"></i> Done
              </button>
            </div>
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
    
    let loggedUser = null
    let loggedUserName = 'Ajay'
    let loggedUserId = null
    
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        loggedUser = JSON.parse(userData)
        loggedUserName = loggedUser.name || 'Ajay'
        loggedUserId = loggedUser.id || null
      }
    } catch (error) {
      console.error('Error parsing user data:', error)
    }
    
    return {
      loading: true,
      showAssignedReport: false,
      reportSearch: '',
      reportFilters: { status: '', date: '' },
      isEditTaskMode: false,
      editTaskId: null,
      managerName: loggedUserName,
      loggedUserId: loggedUserId,
      loggedUserName: loggedUserName,
      selectedReport: null,
      showAssignTaskModal: false,
      visibleCount: 12,
      minDate: today,
      filtersVisible: true,
      filters: { name: '', date: '', month: (new Date().getMonth() + 1).toString(), status: '', search: '' },
      tasks: [],
      employeeList: [],
      employeesDropdown: [],
      months: [
        { value: '1', label: 'Jan' }, { value: '2', label: 'Feb' }, { value: '3', label: 'Mar' },
        { value: '4', label: 'Apr' }, { value: '5', label: 'May' }, { value: '6', label: 'Jun' },
        { value: '7', label: 'Jul' }, { value: '8', label: 'Aug' }, { value: '9', label: 'Sep' },
        { value: '10', label: 'Oct' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dec' }
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
    allAssignedReports() {
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
            assign_by_name: task.assign_by_name || task.manager_name || this.managerName,
            assigned_by_manager: isManagerAssigned
          }
        })
        .filter(task => {
          const taskDate = new Date(task.date)
          return taskDate >= lastYear && task.priority === 'Task Assigned'
        })
    },
    assignedStats() {
      const all = this.allAssignedReports
      return {
        total: all.length,
        pending: all.filter(t => t.status === 'Pending').length,
        inProgress: all.filter(t => t.status === 'In Progress').length,
        completed: all.filter(t => t.status === 'Completed').length,
      }
    },
    filteredAssignedReports() {
      const search = this.reportSearch.toLowerCase().trim()
      return this.allAssignedReports.filter(task => {
        const searchMatch = !search ||
          (task.name && task.name.toLowerCase().includes(search)) ||
          (task.username && task.username.toLowerCase().includes(search)) ||
          (task.department && task.department.toLowerCase().includes(search)) ||
          (task.summary && task.summary.toLowerCase().includes(search))
        const statusMatch = !this.reportFilters.status || task.status === this.reportFilters.status
        const dateMatch = !this.reportFilters.date || task.date === this.reportFilters.date
        return searchMatch && statusMatch && dateMatch
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
            manager_name: isManagerAssigned ? (task.manager_name || this.managerName) : null,
            assign_by_name: task.assign_by_name || task.manager_name || this.loggedUserName
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
    toggleFilters() {
      if (this.isMobile) {
        this.filtersVisible = !this.filtersVisible
      }
    },
    filterByStatus(status) {
      this.filters.status = this.filters.status === status ? '' : status
    },
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
    clearReportFilters() {
      this.reportSearch = ''
      this.reportFilters = { status: '', date: '' }
    },
    formatDate(dateStr) {
      if (!dateStr) return '-'
      try {
        const parts = String(dateStr).split('-')
        if (parts.length === 3) {
          const d = new Date(dateStr)
          if (!isNaN(d.getTime())) {
            return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          }
        }
      } catch (e) {}
      return dateStr
    },
    getInitials(name) {
      if (!name || name === 'Unknown') return '?'
      return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(n => n[0].toUpperCase())
        .join('')
    },
    getDeptColor(dept) {
      const d = (dept || '').toLowerCase()
      if (d.includes('video') || d.includes('editor') || d.includes('creative')) return 'dept-purple'
      if (d.includes('sales') || d.includes('it sales')) return 'dept-blue'
      if (d.includes('marketing') || d.includes('seo')) return 'dept-amber'
      if (d.includes('develop') || d.includes('tech') || d.includes('it')) return 'dept-emerald'
      if (d.includes('hr') || d.includes('admin')) return 'dept-rose'
      return 'dept-gray'
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
      if (this.isMobile) {
        this.filtersVisible = false
      } else {
        this.filtersVisible = true
      }
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
      const taskData = {
        ...this.newTask,
        assigned_by: this.loggedUserId,
        assign_by_name: this.loggedUserName,
        manager_name: this.loggedUserName
      }
      
      const url = this.isEditTaskMode
        ? `https://employees.archenterprises.co.in/api/api/update-task/${this.editTaskId}`
        : 'https://employees.archenterprises.co.in/api/api/assign-task'
      const method = this.isEditTaskMode ? 'put' : 'post'
      axios[method](url, taskData, {
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
      this.loading = true
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
      .finally(() => {
        this.loading = false
      })
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

.main-content-work-report {
  flex: 1;
}

.report-container {
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
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
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-card:active {
  transform: scale(0.97);
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

.filter-toggle-btn {
  display: none;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  color: var(--dark);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 12px;
}

.filter-toggle-btn:active {
  transform: scale(0.97);
}

.filter-toggle-btn .fa-chevron-down {
  transition: transform 0.3s ease;
}

.filter-toggle-btn .fa-chevron-down.rotated {
  transform: rotate(180deg);
}

.filter-group-modern {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  transition: all 0.3s ease;
}

.filter-group-modern.filters-hidden {
  display: none;
}

.search-wrapper-modern {
  position: relative;
  flex: 1;
  min-width: 200px;
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
  width: 100%;
}

.cards-grid-two {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
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
  display: flex;
  flex-direction: column;
}

.report-card-premium:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 30px -12px rgba(0, 0, 0, 0.15);
}

.report-card-premium.mobile-card {
  border-radius: 16px;
}

.report-card-premium.assigned-task-card {
  border-left: 4px solid var(--primary-color);
  background: linear-gradient(135deg, #ffffff, #f8f9ff);
}

.assigned-badge {
  background: var(--primary);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
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

.mobile-card .card-header-premium {
  padding: 14px 16px 10px 16px;
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

.mobile-card .task-icon {
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.header-info h3 {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 6px 0;
}

.mobile-card .header-info h3 {
  font-size: 13px;
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

.status-text {
  display: inline;
}

.status-badge-premium {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.mobile-card .status-badge-premium {
  padding: 3px 8px;
  font-size: 10px;
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
  flex: 1;
}

.mobile-card .card-body-premium {
  padding: 12px 16px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  margin-bottom: 10px;
  color: #4b5563;
}

.mobile-card .info-row {
  font-size: 12px;
  margin-bottom: 8px;
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

.card-footer-premium.mobile-footer {
  padding: 10px 16px 14px;
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

.mobile-footer .action-edit,
.mobile-footer .action-delete {
  padding: 10px;
  font-size: 11px;
}

.action-edit {
  background: #e0e7ff;
  color: var(--primary-color);
}

.action-edit:hover {
  color: rgb(5, 3, 3);
}

.action-delete {
  background: #fee2e2;
  color: var(--danger);
}

.action-delete:hover {
  color: rgb(5, 1, 1);
}

.btn-text {
  display: inline;
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

.premium-modal.mobile-modal {
  max-width: 95%;
  border-radius: 24px;
  max-height: 90vh;
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

.mobile-modal .modal-header-premium {
  padding: 16px 20px;
  gap: 12px;
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

.mobile-modal .header-icon-premium {
  width: 40px;
  height: 40px;
  font-size: 18px;
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

.mobile-modal .header-text h2 {
  font-size: 18px;
}

.header-text p {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 0;
}

.mobile-modal .header-text p {
  font-size: 12px;
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
  color: rgb(10, 4, 4);
  transform: rotate(90deg);
}

.modal-body-premium {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
  background: #fafbfc;
}

.mobile-modal .modal-body-premium {
  padding: 16px;
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

.detail-grid.mobile-grid {
  grid-template-columns: 1fr;
  gap: 14px;
}

.detail-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.detail-item.full-width {
  grid-column: span 2;
}

.mobile-grid .detail-item.full-width {
  grid-column: span 1;
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

.mobile-modal .form-field.full-width {
  grid-column: span 1;
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

.mobile-modal .field-wrapper input,
.mobile-modal .field-wrapper select,
.mobile-modal .field-wrapper textarea {
  font-size: 16px;
  padding: 10px 12px 10px 36px;
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

.modal-footer-premium.mobile-footer {
  flex-direction: column;
  padding: 16px 20px;
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

.mobile-footer .btn-cancel-premium,
.mobile-footer .btn-submit-premium {
  padding: 14px;
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

/* ===================================================
   MODERN ASSIGNED TASK REPORT MODAL
   =================================================== */

.modern-assigned-modal {
  max-width: 96vw;
  width: 96vw;
  height: 92vh;
  max-height: 92vh;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.assigned-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 28px;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

.header-left-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.assigned-icon-glow {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 20px;
  box-shadow: 0 8px 16px -4px rgba(37, 99, 235, 0.35);
}

.title-with-pill {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-with-pill h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}

.task-counter-pill {
  font-size: 11px;
  font-weight: 700;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 3px 10px;
  border-radius: 9999px;
  letter-spacing: 0.02em;
}

.assigned-modal-header p {
  font-size: 13px;
  color: #64748b;
  margin: 3px 0 0 0;
}

.modern-close-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modern-close-btn:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fecaca;
  transform: scale(1.05);
}

/* Quick Stats Bar */
.assigned-quick-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 28px;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.stat-chip:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
}

.stat-chip.active {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
}

.stat-chip.active .chip-count {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.chip-dot.pending { background: #f59e0b; }
.chip-dot.progress { background: #3b82f6; }
.chip-dot.completed { background: #10b981; }

.chip-count {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 9999px;
  background: #f1f5f9;
  color: #475569;
}

/* Body & Filters */
.assigned-body {
  padding: 16px 28px;
  background: #ffffff;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.modern-filters-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.modern-search-wrap {
  position: relative;
  flex: 1;
  min-width: 260px;
}

.modern-search-wrap .search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 14px;
}

.modern-search-wrap input {
  width: 100%;
  height: 42px;
  padding: 0 38px 0 38px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13px;
  color: #0f172a;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.modern-search-wrap input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.search-clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  font-size: 12px;
}

.search-clear-btn:hover {
  color: #0f172a;
}

.filter-controls-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.select-wrapper-styled {
  position: relative;
}

.select-wrapper-styled .select-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 12px;
  pointer-events: none;
}

.modern-select {
  height: 42px;
  padding: 0 32px 0 32px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13px;
  color: #334155;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 14px;
}

.modern-select:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.modern-date {
  height: 42px;
  padding: 0 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13px;
  color: #334155;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modern-date:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.btn-reset-filters {
  height: 42px;
  padding: 0 16px;
  border: 1px solid #fed7aa;
  background: #fff7ed;
  color: #ea580c;
  font-size: 13px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-reset-filters:hover {
  background: #ffedd5;
  border-color: #fdba74;
}

/* Modern Table */
.modern-table-container {
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow-x: auto;
  overflow-y: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  min-height: 0;
}

.modern-task-table {
  width: 100%;
  min-width: 1150px;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
}

.modern-task-table thead {
  background: #f8fafc;
  position: sticky;
  top: 0;
  z-index: 5;
}

.modern-task-table th {
  padding: 14px 18px;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e2e8f0;
  background: #f8fafc;
  text-align: left;
  white-space: nowrap;
}

.modern-task-table tbody tr {
  transition: background-color 0.15s ease;
}

.modern-task-table tbody tr:not(:last-child) td {
  border-bottom: 1px solid #f1f5f9;
}

.modern-task-table tbody tr:hover {
  background: #f8fafc;
}

.modern-task-table td {
  padding: 14px 18px;
  vertical-align: middle;
}

.th-index, .td-index { width: 50px; min-width: 50px; text-align: center; }
.th-task, .td-task { min-width: 250px; max-width: 380px; }
.th-summary, .td-summary { min-width: 240px; max-width: 440px; }
.th-user, .td-user { min-width: 180px; }
.th-assigner, .td-assigner { min-width: 180px; }
.th-dept, .td-dept { min-width: 140px; }
.th-date, .td-date { min-width: 130px; }
.th-status, .td-status { min-width: 130px; }

/* Columns styling */
.index-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.task-name-text {
  font-weight: 600;
  color: #0f172a;
  line-height: 1.4;
  display: block;
}

.summary-text {
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
}

.text-muted-dash {
  color: #cbd5e1;
  font-weight: bold;
}

.user-info-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar-initials {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #e0e7ff;
  color: #4338ca;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-name-label {
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
}

.assigner-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #475569;
  font-size: 12px;
  white-space: nowrap;
}

.assigner-icon {
  color: #94a3b8;
  font-size: 11px;
}

/* Department Badges */
.dept-badge-pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.dept-purple {
  background: #f3e8ff;
  color: #7e22ce;
  border: 1px solid #e9d5ff;
}

.dept-blue {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.dept-amber {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
}

.dept-emerald {
  background: #d1fae5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.dept-rose {
  background: #ffe4e6;
  color: #be123c;
  border: 1px solid #fecdd3;
}

.dept-gray {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

/* Due Date Pill */
.due-date-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #475569;
  font-size: 12px;
  white-space: nowrap;
}

.due-date-pill i {
  color: #94a3b8;
}

/* Status Pill with Dot */
.status-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.status-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-badge-pill.pending {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fef3c7;
}
.status-badge-pill.pending .status-pulse-dot {
  background: #f59e0b;
}

.status-badge-pill.in-progress {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #dbeafe;
}
.status-badge-pill.in-progress .status-pulse-dot {
  background: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.status-badge-pill.completed {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #d1fae5;
}
.status-badge-pill.completed .status-pulse-dot {
  background: #10b981;
}

/* Empty State Modern */
.empty-state-modern {
  padding: 48px 24px;
  text-align: center;
}

.empty-icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 12px;
}

.empty-state-modern h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.empty-state-modern p {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 14px;
}

.btn-clear-inline {
  padding: 8px 18px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-clear-inline:hover {
  background: #1d4ed8;
}

/* Refined Modal Footer */
.modern-assigned-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 28px;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
}

.footer-left-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
}

.footer-left-info i {
  color: #3b82f6;
}

.btn-modern-close {
  padding: 10px 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  transition: all 0.2s ease;
}

.btn-modern-close:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}

/* Mobile Report Cards */
.mobile-report-cards {
  display: none;
  flex-direction: column;
  gap: 12px;
}

.report-mini-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px;
  border: 1px solid #e2e8f0;
}

.mini-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.mini-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-index {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 6px;
}

.mini-task-name {
  font-weight: 600;
  font-size: 13px;
  color: #0f172a;
}

.mini-card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mini-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #64748b;
}

.mini-label {
  font-weight: 500;
  color: #64748b;
}

.mini-val.highlight {
  font-weight: 600;
  color: #0f172a;
}

.mini-val.due-val {
  color: #475569;
  font-weight: 500;
}

/* Loading & Empty States for Work Reports */
.work-reports-loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  text-align: center;
  margin: 16px 0 24px;
}

.loader-spinner-wrapper {
  font-size: 38px;
  color: #4f46e5;
  margin-bottom: 16px;
  display: inline-flex;
}

.work-reports-loading-box h3 {
  font-size: 1.15rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
}

.work-reports-loading-box p {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

.empty-reports-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px dashed #cbd5e1;
  text-align: center;
  margin: 16px 0 24px;
}

.empty-reports-state .empty-icon-wrap {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin-bottom: 14px;
}

.empty-reports-state h3 {
  font-size: 1.15rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
}

.empty-reports-state p {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

/* Empty States */
.empty-state-small {
  text-align: center;
  padding: 40px;
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
  .cards-grid-two {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 12px;
  }

  .report-container {
    padding: 16px;
    border-radius: 20px;
  }

  .mobile-header {
    display: flex;
  }

  .content-header-modern {
    display: none;
  }

  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .stat-card {
    padding: 12px 14px;
    flex-direction: column;
    text-align: center;
    gap: 6px;
  }

  .stat-card i {
    font-size: 24px;
  }

  .stat-value {
    font-size: 22px;
  }

  .stat-label {
    font-size: 10px;
  }

  .filter-toggle-btn {
    display: flex;
    width: 100%;
    justify-content: center;
  }

  .filter-group-modern {
    flex-direction: column;
    gap: 10px;
  }

  .filter-group-modern.filters-hidden {
    display: none;
  }

  .search-wrapper-modern {
    min-width: auto;
  }

  .filter-select, .filter-date, .clear-filter-btn {
    width: 100%;
  }

  .cards-grid-two {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .mobile-report-cards {
    display: flex;
  }

  .table-wrapper-premium {
    display: none;
  }

  .report-table {
    font-size: 11px;
  }

  .report-filters {
    flex-direction: column;
  }

  .btn-text {
    display: inline;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }

  .report-container {
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

  .stats-bar {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .stat-card {
    padding: 10px;
  }

  .stat-card i {
    font-size: 20px;
  }

  .stat-value {
    font-size: 18px;
  }

  .report-card-premium.mobile-card {
    border-radius: 14px;
  }

  .card-header-premium {
    padding: 12px 14px;
    flex-direction: column;
    gap: 8px;
  }

  .header-info h3 {
    font-size: 13px;
  }

  .status-badge-premium {
    align-self: flex-start;
  }

  .card-body-premium {
    padding: 10px 14px;
  }

  .info-row {
    font-size: 11px;
    margin-bottom: 6px;
  }

  .info-row.summary {
    padding: 8px;
  }

  .card-footer-premium.mobile-footer {
    flex-direction: column;
    gap: 8px;
    padding: 10px 14px;
  }

  .action-edit, .action-delete {
    padding: 10px;
    font-size: 12px;
  }

  .premium-modal.mobile-modal {
    max-width: 98%;
    border-radius: 20px;
  }

  .modal-header-premium {
    padding: 12px 16px;
  }

  .modal-header-premium h2 {
    font-size: 16px;
  }

  .modal-body-premium {
    padding: 12px;
  }

  .modal-footer-premium.mobile-footer {
    padding: 12px 16px;
  }

  .detail-item {
    font-size: 13px;
  }

  .report-mini-card {
    padding: 10px;
  }

  .mini-task-name {
    font-size: 12px;
  }

  .mini-row {
    font-size: 11px;
  }

  .empty-state-small {
    padding: 30px 16px;
  }

  .empty-state-small i {
    font-size: 36px;
  }
}
</style>