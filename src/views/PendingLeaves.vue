<template>
  <div class="layout">
    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- Top Executive Header -->
        <header class="executive-header">
          <div class="header-main">
            <div class="header-badge pending-badge">
              <span class="pulse-dot"></span>
              <span>HR Approval Pipeline</span>
            </div>
            <div class="title-with-icon">
              <div class="header-icon-box pending-icon-box">
                <i class="fas fa-hourglass-half"></i>
              </div>
              <div>
                <h1 class="header-title">Pending Leave Applications</h1>
                <p class="header-subtitle">Review, evaluate, and take timely action on pending employee leave requests</p>
              </div>
            </div>
          </div>

          <div class="header-actions">
            <button
              class="refresh-btn"
              :class="{ 'spinning': loadingLeaves }"
              @click="fetchLeaves"
              title="Refresh requests"
            >
              <i class="fas fa-sync-alt"></i>
              <span class="desktop-only">Refresh</span>
            </button>

            <div class="count-chip pending-count-chip">
              <i class="fas fa-clock"></i>
              <span>{{ sortedLeaves.length }} Awaiting Review</span>
            </div>
          </div>
        </header>

        <!-- Executive Metric Cards -->
        <section class="metrics-grid">
          <!-- Pending Count -->
          <div class="metric-card card-amber">
            <div class="metric-card-bg"></div>
            <div class="metric-header">
              <span class="metric-title">Pending Approvals</span>
              <div class="metric-icon-wrap icon-pending">
                <i class="fas fa-clock"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ sortedLeaves.length }}</span>
              <span class="metric-tag tag-pending">Needs action</span>
            </div>
            <div class="metric-bar">
              <div class="metric-bar-fill fill-amber" style="width: 100%"></div>
            </div>
          </div>

          <!-- Unique Employees -->
          <div class="metric-card card-indigo">
            <div class="metric-card-bg"></div>
            <div class="metric-header">
              <span class="metric-title">Employees Requesting</span>
              <div class="metric-icon-wrap icon-indigo">
                <i class="fas fa-users"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ uniqueEmployees }}</span>
              <span class="metric-tag tag-indigo">Team members</span>
            </div>
            <div class="metric-bar">
              <div class="metric-bar-fill fill-indigo" style="width: 100%"></div>
            </div>
          </div>

          <!-- Total Leave Days -->
          <div class="metric-card card-blue">
            <div class="metric-card-bg"></div>
            <div class="metric-header">
              <span class="metric-title">Total Requested Days</span>
              <div class="metric-icon-wrap icon-blue">
                <i class="fas fa-calendar-week"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ totalLeaveDays }}</span>
              <span class="metric-tag tag-blue">Working days</span>
            </div>
            <div class="metric-bar">
              <div class="metric-bar-fill fill-blue" style="width: 100%"></div>
            </div>
          </div>

          <!-- Urgent Requests (<3 days) -->
          <div class="metric-card card-rose">
            <div class="metric-card-bg"></div>
            <div class="metric-header">
              <span class="metric-title">Urgent (&le; 3 Days)</span>
              <div class="metric-icon-wrap icon-rose">
                <i class="fas fa-fire-alt"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ urgentRequests }}</span>
              <span class="metric-tag tag-rose">{{ urgentRequests > 0 ? 'High priority' : 'No rush' }}</span>
            </div>
            <div class="metric-bar">
              <div class="metric-bar-fill fill-rose" :style="{ width: urgentRequests > 0 ? '100%' : '20%' }"></div>
            </div>
          </div>
        </section>

        <!-- Command Toolbar (Search & Filter) -->
        <section class="toolbar-card">
          <div class="toolbar-left">
            <div class="search-box-modern">
              <i class="fas fa-search search-icon"></i>
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Search by employee, department, leave type, reason..."
                class="search-input-modern"
              />
              <button
                v-if="searchQuery"
                class="search-clear-btn"
                @click="searchQuery = ''"
                title="Clear search"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- Department Filter -->
            <div class="dropdown-filter-modern" v-if="uniqueDepartments.length > 0">
              <i class="fas fa-building filter-icon"></i>
              <select v-model="departmentFilter" class="select-modern">
                <option value="">All Departments</option>
                <option v-for="dept in uniqueDepartments" :key="dept" :value="dept">
                  {{ dept }}
                </option>
              </select>
            </div>

            <!-- Leave Type Filter -->
            <div class="dropdown-filter-modern" v-if="uniqueLeaveTypes.length > 0">
              <i class="fas fa-tag filter-icon"></i>
              <select v-model="typeFilter" class="select-modern">
                <option value="">All Leave Types</option>
                <option v-for="type in uniqueLeaveTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>
          </div>

          <div class="toolbar-right">
            <span class="results-count-pill">
              Showing <strong>{{ filteredLeaves.length }}</strong> of <strong>{{ sortedLeaves.length }}</strong> pending
            </span>

            <button
              v-if="hasActiveFilters"
              class="reset-filters-btn"
              @click="clearFilters"
              title="Reset all filters"
            >
              <i class="fas fa-undo-alt"></i>
              <span>Reset</span>
            </button>
          </div>
        </section>

        <!-- Loading State -->
        <div v-if="loadingLeaves" class="loading-state-card">
          <div class="modern-spinner">
            <div class="spinner-ring"></div>
            <i class="fas fa-hourglass-half spinner-icon"></i>
          </div>
          <h3>Loading Pending Leaves</h3>
          <p>Fetching latest employee leave requests awaiting approval...</p>
        </div>

        <!-- Table Card -->
        <div v-else class="content-table-card">
          <div class="table-card-header">
            <div class="results-info">
              <i class="fas fa-list-ul"></i>
              <span>Pending Leave Queue</span>
            </div>
            <div class="table-hint">
              <i class="fas fa-info-circle"></i>
              <span>Review reason & dates carefully before approving or rejecting</span>
            </div>
          </div>

          <!-- Desktop Table -->
          <div class="table-responsive desktop-table-wrapper" v-if="!isMobile">
            <table class="modern-table">
              <thead>
                <tr>
                  <th class="th-employee"><i class="fas fa-user-circle"></i> Employee</th>
                  <th class="th-type"><i class="fas fa-tag"></i> Leave Type</th>
                  <th class="th-dates"><i class="fas fa-calendar-alt"></i> Schedule & Duration</th>
                  <th class="th-reason"><i class="fas fa-comment-alt"></i> Reason & Document</th>
                  <th class="th-status text-center"><i class="fas fa-clock"></i> Status</th>
                  <th class="th-actions text-right"><i class="fas fa-sliders-h"></i> Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="leave in filteredLeaves"
                  :key="leave.id"
                  class="table-row-interactive"
                >
                  <!-- Employee Cell -->
                  <td class="td-employee">
                    <div class="employee-identity-card">
                      <div class="avatar-modern" :style="{ background: getAvatarGradient(leave.name) }">
                        {{ getInitials(leave.name) }}
                      </div>
                      <div class="employee-meta">
                        <span class="emp-name" :title="leave.name">
                          {{ formatName(leave.name) }}
                        </span>
                        <div class="emp-sub-meta">
                          <span class="dept-pill" v-if="leave.department">
                            <i class="fas fa-building"></i>
                            {{ leave.department }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Leave Type -->
                  <td class="td-type">
                    <span :class="['category-badge', getLeaveTypeClass(leave.leaveType)]">
                      <i :class="getLeaveTypeIcon(leave.leaveType)"></i>
                      {{ leave.leaveType }}
                    </span>
                  </td>

                  <!-- Dates & Duration -->
                  <td class="td-dates">
                    <div class="schedule-box">
                      <div class="schedule-date-range">
                        <i class="far fa-calendar-alt date-icon"></i>
                        <span class="date-text">
                          {{ formatDate(leave.fromDate) }}
                          <template v-if="leave.fromDate !== leave.toDate">
                            <span class="date-arrow">&rarr;</span>
                            {{ formatDate(leave.toDate) }}
                          </template>
                        </span>
                      </div>
                      <div class="duration-pill" :class="{ 'urgent-pill': isUrgent(leave.fromDate) }">
                        <i class="fas" :class="isUrgent(leave.fromDate) ? 'fa-fire-alt' : 'fa-clock'"></i>
                        <span>{{ calculateDuration(leave.fromDate, leave.toDate) }} day{{ calculateDuration(leave.fromDate, leave.toDate) === 1 ? '' : 's' }}</span>
                        <span v-if="isUrgent(leave.fromDate)" class="urgent-text">Urgent</span>
                      </div>
                    </div>
                  </td>

                  <!-- Reason & Document -->
                  <td class="td-reason">
                    <div class="reason-container">
                      <div class="reason-bubble" @click="openReasonModal(leave)" :title="leave.reason || 'Click to view full reason'">
                        <i class="fas fa-quote-left quote-icon"></i>
                        <p class="reason-text">
                          {{ truncateText(leave.reason, 55) || 'No reason provided' }}
                        </p>
                      </div>
                      <button
                        v-if="leave.file"
                        class="attachment-pill"
                        @click="openAttachmentModal(leave)"
                        title="View attached document"
                      >
                        <i class="fas fa-paperclip"></i>
                        <span>Document</span>
                      </button>
                    </div>
                  </td>

                  <!-- Status -->
                  <td class="td-status text-center">
                    <span class="status-pill status-pending">
                      <span class="status-pulse-dot"></span>
                      <i class="fas fa-hourglass-half"></i>
                      Pending
                    </span>
                  </td>

                  <!-- Actions -->
                  <td class="td-actions text-right">
                    <div class="action-buttons-wrap">
                      <button
                        class="action-btn-modern btn-approve"
                        @click="approveLeave(leave)"
                        :disabled="busyLeave.id === leave.id"
                        title="Approve Leave Application"
                      >
                        <i v-if="busyLeave.id === leave.id && busyLeave.action === 'Approved'" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-check"></i>
                        <span>Approve</span>
                      </button>

                      <button
                        class="action-btn-modern btn-reject"
                        @click="rejectLeave(leave)"
                        :disabled="busyLeave.id === leave.id"
                        title="Reject Leave Application"
                      >
                        <i v-if="busyLeave.id === leave.id && busyLeave.action === 'Rejected'" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-times"></i>
                        <span>Reject</span>
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Empty State Inside Table -->
                <tr v-if="filteredLeaves.length === 0" class="empty-row">
                  <td colspan="6">
                    <div class="empty-state-modern">
                      <div class="empty-icon-circle">
                        <i class="fas fa-check-circle text-emerald"></i>
                      </div>
                      <h3>{{ hasActiveFilters ? 'No Matching Pending Requests' : 'All Clear - No Pending Requests' }}</h3>
                      <p>
                        {{ hasActiveFilters ? 'No requests match your current filters. Try resetting search or category.' : 'All employee leave requests have been reviewed and processed.' }}
                      </p>
                      <button v-if="hasActiveFilters" class="clear-empty-btn" @click="clearFilters">
                        <i class="fas fa-undo"></i>
                        <span>Clear Filters</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards View -->
          <div class="mobile-cards-wrapper" v-else>
            <div
              v-for="leave in filteredLeaves"
              :key="leave.id"
              class="mobile-leave-card"
            >
              <div class="m-card-header">
                <div class="m-emp-info">
                  <div class="avatar-modern avatar-sm" :style="{ background: getAvatarGradient(leave.name) }">
                    {{ getInitials(leave.name) }}
                  </div>
                  <div>
                    <h4 class="m-emp-name">{{ formatName(leave.name) }}</h4>
                    <span class="m-dept-tag">{{ leave.department || 'General' }}</span>
                  </div>
                </div>
                <span :class="['category-badge', getLeaveTypeClass(leave.leaveType)]">
                  {{ leave.leaveType }}
                </span>
              </div>

              <div class="m-card-body">
                <div class="m-detail-item">
                  <span class="m-detail-label"><i class="far fa-calendar-alt"></i> Duration</span>
                  <span class="m-detail-value font-bold">
                    {{ formatDate(leave.fromDate) }} &rarr; {{ formatDate(leave.toDate) }}
                    <span class="m-duration-chip">({{ calculateDuration(leave.fromDate, leave.toDate) }} days)</span>
                  </span>
                </div>

                <div class="m-detail-item" v-if="leave.reason">
                  <span class="m-detail-label"><i class="fas fa-quote-left"></i> Reason</span>
                  <p class="m-reason-text" @click="openReasonModal(leave)">
                    {{ leave.reason }}
                  </p>
                </div>

                <div class="m-detail-item" v-if="leave.file">
                  <button class="attachment-pill" @click="openAttachmentModal(leave)">
                    <i class="fas fa-paperclip"></i> View Attached Document
                  </button>
                </div>
              </div>

              <div class="m-card-footer">
                <button
                  class="action-btn-modern btn-approve m-action-btn"
                  @click="approveLeave(leave)"
                  :disabled="busyLeave.id === leave.id"
                >
                  <i v-if="busyLeave.id === leave.id && busyLeave.action === 'Approved'" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-check"></i>
                  <span>Approve</span>
                </button>

                <button
                  class="action-btn-modern btn-reject m-action-btn"
                  @click="rejectLeave(leave)"
                  :disabled="busyLeave.id === leave.id"
                >
                  <i v-if="busyLeave.id === leave.id && busyLeave.action === 'Rejected'" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-times"></i>
                  <span>Reject</span>
                </button>
              </div>
            </div>

            <!-- Mobile Empty State -->
            <div v-if="filteredLeaves.length === 0" class="empty-state-modern">
              <div class="empty-icon-circle">
                <i class="fas fa-check-circle text-emerald"></i>
              </div>
              <h3>{{ hasActiveFilters ? 'No Matching Leaves' : 'No Pending Requests' }}</h3>
              <p>{{ hasActiveFilters ? 'Try adjusting your filters.' : 'All leave applications have been handled.' }}</p>
              <button v-if="hasActiveFilters" class="clear-empty-btn" @click="clearFilters">
                <i class="fas fa-undo"></i>
                <span>Clear Filters</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- ================= MODALS ================= -->

    <!-- Reason Modal -->
    <div v-if="activeReasonModal" class="modal-overlay" @click="closeReasonModal">
      <div class="modal-card modal-reason" @click.stop>
        <div class="modal-header">
          <div class="modal-header-title">
            <div class="modal-icon-tile icon-reason">
              <i class="fas fa-quote-left"></i>
            </div>
            <div>
              <h2>Leave Reason Details</h2>
              <p class="modal-subtitle">Submitted by {{ formatName(activeReasonModal.name) }}</p>
            </div>
          </div>
          <button class="modal-close-btn" @click="closeReasonModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="modal-info-strip">
            <div class="info-strip-item">
              <span class="label">Leave Type</span>
              <span class="val font-bold">{{ activeReasonModal.leaveType }}</span>
            </div>
            <div class="info-strip-item">
              <span class="label">Date Range</span>
              <span class="val">{{ formatDate(activeReasonModal.fromDate) }} &rarr; {{ formatDate(activeReasonModal.toDate) }}</span>
            </div>
            <div class="info-strip-item">
              <span class="label">Total Duration</span>
              <span class="val font-bold text-amber">{{ calculateDuration(activeReasonModal.fromDate, activeReasonModal.toDate) }} day(s)</span>
            </div>
          </div>

          <div class="reason-full-display">
            <label class="reason-field-label">Full Explanation:</label>
            <div class="reason-box-scroll">
              <p>{{ activeReasonModal.reason || 'No explanation was provided with this application.' }}</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-secondary-btn" @click="closeReasonModal">Close</button>
          <button class="action-btn-modern btn-approve" @click="approveLeave(activeReasonModal); closeReasonModal();">
            <i class="fas fa-check"></i> Approve
          </button>
          <button class="action-btn-modern btn-reject" @click="rejectLeave(activeReasonModal); closeReasonModal();">
            <i class="fas fa-times"></i> Reject
          </button>
        </div>
      </div>
    </div>

    <!-- Attachment Modal -->
    <div v-if="activeAttachmentModal" class="modal-overlay" @click="closeAttachmentModal">
      <div class="modal-card modal-attachment" @click.stop>
        <div class="modal-header">
          <div class="modal-header-title">
            <div class="modal-icon-tile icon-attachment">
              <i class="fas fa-paperclip"></i>
            </div>
            <div>
              <h2>Supporting Document</h2>
              <p class="modal-subtitle">Uploaded by {{ formatName(activeAttachmentModal.name) }}</p>
            </div>
          </div>
          <button class="modal-close-btn" @click="closeAttachmentModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body text-center">
          <div class="attachment-preview-container">
            <img
              v-if="isImageFile(activeAttachmentModal.file)"
              :src="getFileUrl(activeAttachmentModal.file)"
              alt="Leave Document Preview"
              class="attachment-img-preview"
            />
            <div v-else class="generic-file-preview">
              <i class="fas fa-file-pdf file-type-icon"></i>
              <h4>Document File</h4>
              <p>{{ activeAttachmentModal.file }}</p>
            </div>
          </div>
        </div>

        <div class="modal-footer attachment-footer">
          <a
            :href="getFileUrl(activeAttachmentModal.file)"
            target="_blank"
            rel="noopener noreferrer"
            class="modal-download-btn"
          >
            <i class="fas fa-external-link-alt"></i>
            <span>Open in New Tab</span>
          </a>
          <button class="modal-secondary-btn" @click="closeAttachmentModal">Close</button>
        </div>
      </div>
    </div>
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
  name: 'PendingLeaves',
  components: {
    Sidebar
  },
  data() {
    return {
      loadingLeaves: false,
      leaveRequests: [],
      busyLeave: { id: null, action: null },
      searchQuery: '',
      departmentFilter: '',
      typeFilter: '',
      activeReasonModal: null,
      activeAttachmentModal: null,
      isMobile: false,
      isSidebarVisible: true,
    }
  },
  computed: {
    sortedLeaves() {
      return [...this.leaveRequests].sort((a, b) => {
        const dateA = new Date(a.created_at || a.fromDate || 0);
        const dateB = new Date(b.created_at || b.fromDate || 0);
        return dateB - dateA;
      });
    },

    uniqueDepartments() {
      const depts = new Set();
      this.leaveRequests.forEach(l => {
        if (l.department && typeof l.department === 'string' && l.department.trim()) {
          depts.add(l.department.trim());
        }
      });
      return Array.from(depts).sort();
    },

    uniqueLeaveTypes() {
      const types = new Set();
      this.leaveRequests.forEach(l => {
        if (l.leaveType && typeof l.leaveType === 'string' && l.leaveType.trim()) {
          types.add(l.leaveType.trim());
        }
      });
      return Array.from(types).sort();
    },

    filteredLeaves() {
      let list = this.sortedLeaves;

      if (this.departmentFilter) {
        list = list.filter(l => (l.department || '').toLowerCase() === this.departmentFilter.toLowerCase());
      }

      if (this.typeFilter) {
        list = list.filter(l => (l.leaveType || '').toLowerCase() === this.typeFilter.toLowerCase());
      }

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase().trim();
        list = list.filter(l =>
          (l.name && l.name.toLowerCase().includes(q)) ||
          (l.department && l.department.toLowerCase().includes(q)) ||
          (l.leaveType && l.leaveType.toLowerCase().includes(q)) ||
          (l.reason && l.reason.toLowerCase().includes(q))
        );
      }

      return list;
    },

    hasActiveFilters() {
      return !!(this.searchQuery || this.departmentFilter || this.typeFilter);
    },

    uniqueEmployees() {
      const names = new Set(this.leaveRequests.map(l => l.name));
      return names.size;
    },

    totalLeaveDays() {
      return this.leaveRequests.reduce((total, leave) => {
        return total + this.calculateDuration(leave.fromDate, leave.toDate);
      }, 0);
    },

    urgentRequests() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);
      threeDaysFromNow.setHours(23, 59, 59, 999);

      return this.leaveRequests.filter(leave => {
        const fromDate = new Date(leave.fromDate);
        return fromDate >= today && fromDate <= threeDaysFromNow;
      }).length;
    }
  },
  methods: {
    clearFilters() {
      this.searchQuery = '';
      this.departmentFilter = '';
      this.typeFilter = '';
    },

    getInitials(name) {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },

    formatName(name) {
      if (!name) return '';
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    },

    truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },

    formatDate(date) {
      if (!date) return '—';
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },

    calculateDuration(fromDate, toDate) {
      if (!fromDate || !toDate) return 1;
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const diffTime = Math.abs(to - from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return isNaN(diffDays) ? 1 : diffDays;
    },

    isUrgent(fromDate) {
      if (!fromDate) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const from = new Date(fromDate);
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);
      threeDaysFromNow.setHours(23, 59, 59, 999);
      return from >= today && from <= threeDaysFromNow;
    },

    getAvatarGradient(name) {
      if (!name) return 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
      const gradients = [
        'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
      ];
      let sum = 0;
      for (let i = 0; i < name.length; i++) {
        sum += name.charCodeAt(i);
      }
      return gradients[sum % gradients.length];
    },

    getLeaveTypeClass(leaveType) {
      const type = (leaveType || '').toLowerCase();
      if (type.includes('sick')) return 'sick';
      if (type.includes('casual') || type === 'cl') return 'casual';
      if (type.includes('pl') || type.includes('privilege') || type.includes('paid')) return 'pl';
      if (type.includes('half')) return 'halfday';
      return 'default';
    },

    getLeaveTypeIcon(leaveType) {
      const type = (leaveType || '').toLowerCase();
      if (type.includes('sick')) return 'fas fa-thermometer-half';
      if (type.includes('casual') || type === 'cl') return 'fas fa-coffee';
      if (type.includes('pl') || type.includes('privilege') || type.includes('paid')) return 'fas fa-star';
      if (type.includes('half')) return 'fas fa-adjust';
      return 'fas fa-calendar-alt';
    },

    openReasonModal(leave) {
      this.activeReasonModal = leave;
    },

    closeReasonModal() {
      this.activeReasonModal = null;
    },

    openAttachmentModal(leave) {
      this.activeAttachmentModal = leave;
    },

    closeAttachmentModal() {
      this.activeAttachmentModal = null;
    },

    getFileUrl(file) {
      if (!file) return '';
      if (file.startsWith('http://') || file.startsWith('https://')) return file;
      const cleanPath = file.startsWith('/') ? file.substring(1) : file;
      return `https://employees.archenterprises.co.in/backend/public/storage/${cleanPath}`;
    },

    isImageFile(path) {
      if (!path) return false;
      const ext = path.split('.').pop().toLowerCase();
      return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext);
    },

    formatDateToYMD(dateString) {
      if (!dateString) return '';
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '';
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    async updateLeaveStatus(leave, status) {
      if (this.busyLeave.id) return;
      this.busyLeave = { id: leave.id, action: status };

      try {
        const token = localStorage.getItem('token');
        await axios.patch(
          `https://employees.archenterprises.co.in/api/api/leave-requests/${leave.id}/status`,
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Attendance sync helpers if available
        if (status === 'Approved') {
          try {
            const userResponse = await axios.get(
              `https://employees.archenterprises.co.in/api/api/user-by-name?name=${encodeURIComponent(leave.name)}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const userId = userResponse.data.id;
            const isHalfDay = (leave.leaveType || '').toLowerCase().includes('half');

            await axios.post(
              'https://employees.archenterprises.co.in/api/api/mark-attendance-leave',
              {
                name: leave.name,
                fromDate: this.formatDateToYMD(leave.fromDate),
                toDate: this.formatDateToYMD(leave.toDate),
                leaveType: leave.leaveType,
                is_half_day: isHalfDay,
                user_id: userId
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (syncErr) {
            console.warn('Attendance sync note:', syncErr);
          }
        }

        toastSuccess(`Leave ${status.toLowerCase()} successfully!`);
        this.fetchLeaves();
      } catch (error) {
        console.error('Status update failed', error);
        toastError('Could not update status – please try again.');
      } finally {
        this.busyLeave = { id: null, action: null };
      }
    },

    approveLeave(leave) {
      this.updateLeaveStatus(leave, 'Approved');
    },

    rejectLeave(leave) {
      this.updateLeaveStatus(leave, 'Rejected');
    },

    async fetchLeaves() {
      this.loadingLeaves = true;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/leave-requests', {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: 'Pending' }
        });
        const raw = Array.isArray(response.data) ? response.data : [];
        this.leaveRequests = raw.map(l => ({
          ...l,
          fromDate: this.formatDateToYMD(l.fromDate),
          toDate: this.formatDateToYMD(l.toDate)
        }));
      } catch (error) {
        console.error('Failed to fetch leave requests:', error);
        toastError('Error loading pending leave requests.');
      } finally {
        this.loadingLeaves = false;
      }
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 860;
      this.isSidebarVisible = !this.isMobile;
    }
  },

  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.fetchLeaves();
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

.layout {
  min-height: 100vh;
  background: #f1f5f9;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1e293b;
}

.main-content {
  display: flex;
  gap: 24px;
  padding: 24px;
  min-height: 100vh;
  box-sizing: border-box;
}

.content {
  flex: 1;
  background: #ffffff;
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ================= EXECUTIVE HEADER ================= */
.executive-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.header-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pending-badge {
  color: #b45309;
  background: #fef3c7;
  border: 1px solid #fde68a;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background: #d97706;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.2);
  animation: pulseAmber 2s infinite;
}

@keyframes pulseAmber {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.5); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(217, 119, 6, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(217, 119, 6, 0); }
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.pending-icon-box {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 8px 16px rgba(217, 119, 6, 0.25);
}

.header-title {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.header-subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #64748b;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.refresh-btn.spinning i {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.count-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
}

.pending-count-chip {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fef3c7;
}

/* ================= METRIC CARDS ================= */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.metric-card {
  position: relative;
  background: #ffffff;
  border-radius: 20px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: all 0.25s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.06);
  border-color: #cbd5e1;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.icon-pending { background: #fef3c7; color: #d97706; }
.icon-indigo { background: #eef2ff; color: #4f46e5; }
.icon-blue { background: #e0f2fe; color: #0284c7; }
.icon-rose { background: #ffe4e6; color: #e11d48; }

.metric-body {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.metric-number {
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}

.metric-tag {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
}

.tag-pending { background: #fef3c7; color: #b45309; }
.tag-indigo { background: #eef2ff; color: #4338ca; }
.tag-blue { background: #e0f2fe; color: #0369a1; }
.tag-rose { background: #ffe4e6; color: #be123c; }

.metric-bar {
  width: 100%;
  height: 6px;
  background: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}

.metric-bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
}

.fill-amber { background: linear-gradient(90deg, #f59e0b, #d97706); }
.fill-indigo { background: linear-gradient(90deg, #6366f1, #4f46e5); }
.fill-blue { background: linear-gradient(90deg, #38bdf8, #0284c7); }
.fill-rose { background: linear-gradient(90deg, #fb7185, #e11d48); }

/* ================= TOOLBAR ================= */
.toolbar-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}

.search-box-modern {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 280px;
  max-width: 380px;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 14px;
}

.search-input-modern {
  width: 100%;
  padding: 10px 38px 10px 38px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 13.5px;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
}

.search-input-modern:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
}

.search-clear-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-clear-btn:hover {
  color: #0f172a;
}

.dropdown-filter-modern {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  font-size: 13px;
  pointer-events: none;
}

.select-modern {
  padding: 10px 16px 10px 34px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 13.5px;
  color: #334155;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-modern:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.results-count-pill {
  font-size: 13px;
  color: #64748b;
}

.reset-filters-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-filters-btn:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #b91c1c;
}

/* ================= CONTENT TABLE CARD ================= */
.content-table-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.table-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.results-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.table-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: #64748b;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
}

.modern-table thead tr {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.modern-table th {
  padding: 14px 20px;
  font-size: 12.5px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.modern-table th i {
  margin-right: 6px;
  color: #94a3b8;
}

.modern-table td {
  padding: 18px 20px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.table-row-interactive {
  transition: all 0.15s ease;
}

.table-row-interactive:hover {
  background: #fafafa;
}

/* Employee Details */
.employee-identity-card {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar-modern {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.avatar-sm {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  font-size: 12px;
}

.employee-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.emp-name {
  font-size: 14.5px;
  font-weight: 700;
  color: #0f172a;
}

.emp-sub-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dept-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 8px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 6px;
}

/* Category Badge */
.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
}

.category-badge.sick {
  background: #ffe4e6;
  color: #e11d48;
}

.category-badge.casual {
  background: #fef3c7;
  color: #d97706;
}

.category-badge.pl {
  background: #eef2ff;
  color: #4f46e5;
}

.category-badge.halfday {
  background: #e0f2fe;
  color: #0284c7;
}

.category-badge.default {
  background: #f1f5f9;
  color: #475569;
}

/* Schedule & Duration */
.schedule-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.schedule-date-range {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 600;
  color: #1e293b;
}

.date-icon {
  color: #94a3b8;
  font-size: 13px;
}

.date-arrow {
  color: #94a3b8;
  font-weight: normal;
}

.duration-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 20px;
  width: fit-content;
}

.urgent-pill {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.urgent-text {
  font-weight: 800;
  text-transform: uppercase;
  font-size: 10px;
  background: #dc2626;
  color: white;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 4px;
}

/* Reason Container */
.reason-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 320px;
}

.reason-bubble {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.15s ease;
}

.reason-bubble:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.quote-icon {
  color: #cbd5e1;
  font-size: 11px;
  margin-top: 3px;
  flex-shrink: 0;
}

.reason-text {
  margin: 0;
  font-size: 12.5px;
  color: #475569;
  line-height: 1.4;
}

.attachment-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #4f46e5;
  cursor: pointer;
  width: fit-content;
  transition: all 0.2s ease;
}

.attachment-pill:hover {
  background: #e0e7ff;
  color: #3730a3;
}

/* Status Pill */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.status-pending {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fef3c7;
}

.status-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d97706;
}

/* Action Buttons */
.action-buttons-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.action-btn-modern {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn-modern:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-approve {
  background: #10b981;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.25);
}

.btn-approve:hover:not(:disabled) {
  background: #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
  transform: translateY(-1px);
}

.btn-reject {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.btn-reject:hover:not(:disabled) {
  background: #fca5a5;
  color: #991b1b;
  transform: translateY(-1px);
}

/* ================= LOADING & EMPTY STATES ================= */
.loading-state-card {
  padding: 60px 20px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.modern-spinner {
  position: relative;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-ring {
  width: 56px;
  height: 56px;
  border: 4px solid #fef3c7;
  border-top-color: #d97706;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  position: absolute;
}

.spinner-icon {
  font-size: 20px;
  color: #d97706;
}

.empty-state-modern {
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #ecfdf5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.text-emerald {
  color: #10b981;
}

.empty-state-modern h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.empty-state-modern p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  max-width: 440px;
}

.clear-empty-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  margin-top: 6px;
  transition: all 0.2s ease;
}

.clear-empty-btn:hover {
  background: #ffffff;
  color: #0f172a;
  border-color: #94a3b8;
}

/* ================= MOBILE VIEW ================= */
.mobile-cards-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.mobile-leave-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.m-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.m-emp-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.m-emp-name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.m-dept-tag {
  font-size: 11px;
  color: #64748b;
}

.m-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f8fafc;
  padding: 12px;
  border-radius: 12px;
}

.m-detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.m-detail-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
}

.m-detail-value {
  font-size: 13px;
  color: #1e293b;
}

.m-duration-chip {
  color: #d97706;
  font-weight: 700;
}

.m-reason-text {
  margin: 0;
  font-size: 12.5px;
  color: #475569;
  line-height: 1.4;
}

.m-card-footer {
  display: flex;
  gap: 10px;
}

.m-action-btn {
  flex: 1;
  justify-content: center;
}

/* ================= MODALS ================= */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-card {
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: modalIn 0.2s ease-out;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon-tile {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.icon-reason { background: #fef3c7; color: #d97706; }
.icon-attachment { background: #eef2ff; color: #4f46e5; }

.modal-header-title h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.modal-subtitle {
  margin: 2px 0 0 0;
  font-size: 12.5px;
  color: #64748b;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-info-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  background: #f8fafc;
  padding: 12px;
  border-radius: 12px;
}

.info-strip-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-strip-item .label {
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
}

.info-strip-item .val {
  font-size: 13px;
  color: #1e293b;
}

.reason-full-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reason-field-label {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
}

.reason-box-scroll {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  max-height: 220px;
  overflow-y: auto;
}

.reason-box-scroll p {
  margin: 0;
  font-size: 13.5px;
  color: #334155;
  line-height: 1.6;
  white-space: pre-wrap;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.modal-secondary-btn {
  padding: 8px 16px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-secondary-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-attachment {
  max-width: 640px;
}

.attachment-preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 480px;
  overflow: hidden;
  border-radius: 12px;
  background: #f8fafc;
}

.attachment-img-preview {
  max-width: 100%;
  max-height: 460px;
  object-fit: contain;
  border-radius: 8px;
}

.generic-file-preview {
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.file-type-icon {
  font-size: 54px;
  color: #ef4444;
}

.attachment-footer {
  justify-content: space-between;
}

.modal-download-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #4f46e5;
  color: #ffffff;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.modal-download-btn:hover {
  background: #4338ca;
}

/* Helper Utilities */
.font-bold { font-weight: 700; }
.text-amber { color: #d97706; }
.text-emerald { color: #10b981; }
.text-center { text-align: center; }
.text-right { text-align: right; }

@media (max-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  .content {
    padding: 16px;
    border-radius: 16px;
  }
  .toolbar-card {
    flex-direction: column;
    align-items: stretch;
  }
  .toolbar-left {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box-modern {
    max-width: 100%;
  }
  .select-modern {
    width: 100%;
  }
  .toolbar-right {
    justify-content: space-between;
  }
}
</style>