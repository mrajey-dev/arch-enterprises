<template>
  <div class="layout">
    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- Top Executive Header -->
        <header class="executive-header">
          <div class="header-main">
            <div class="header-badge">
              <span class="pulse-dot"></span>
              <span>HR & Administration</span>
            </div>
            <div class="title-with-icon">
              <div class="header-icon-box">
                <i class="fas fa-calendar-check"></i>
              </div>
              <div>
                <h1 class="header-title">Leave Applications</h1>
                <p class="header-subtitle">Review, approve, and track employee leave requests & quotas</p>
              </div>
            </div>
          </div>

          <div class="header-actions">
            <button
              class="refresh-btn"
              :class="{ 'spinning': isRefreshing || loadingLeaves }"
              @click="refreshData"
              title="Refresh requests"
            >
              <i class="fas fa-sync-alt"></i>
              <span class="desktop-only">Refresh</span>
            </button>

            <div class="pending-chip" v-if="pendingCount > 0">
              <span class="chip-dot"></span>
              <span>{{ pendingCount }} Pending Action</span>
            </div>
          </div>
        </header>

        <!-- Executive Metric Cards -->
        <section class="metrics-grid">
          <!-- All Requests -->
          <div
            class="metric-card"
            :class="{ 'card-active': statusFilter === '' }"
            @click="filterByStatus('')"
          >
            <div class="metric-card-bg"></div>
            <div class="metric-header">
              <span class="metric-title">Total Requests</span>
              <div class="metric-icon-wrap icon-all">
                <i class="fas fa-layer-group"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ leaveRequests.length }}</span>
              <span class="metric-tag tag-all">All records</span>
            </div>
            <div class="metric-bar">
              <div class="metric-bar-fill fill-all" style="width: 100%"></div>
            </div>
          </div>

          <!-- Pending Requests -->
          <div
            class="metric-card"
            :class="{ 'card-active': statusFilter === 'Pending' }"
            @click="filterByStatus('Pending')"
          >
            <div class="metric-card-bg"></div>
            <div class="metric-header">
              <span class="metric-title">Pending Review</span>
              <div class="metric-icon-wrap icon-pending">
                <i class="fas fa-hourglass-half"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ pendingCount }}</span>
              <span class="metric-tag tag-pending">{{ getPercentage(pendingCount) }}% of total</span>
            </div>
            <div class="metric-bar">
              <div class="metric-bar-fill fill-pending" :style="{ width: getPercentage(pendingCount) + '%' }"></div>
            </div>
          </div>

          <!-- Approved Requests -->
          <div
            class="metric-card"
            :class="{ 'card-active': statusFilter === 'Approved' }"
            @click="filterByStatus('Approved')"
          >
            <div class="metric-card-bg"></div>
            <div class="metric-header">
              <span class="metric-title">Approved</span>
              <div class="metric-icon-wrap icon-approved">
                <i class="fas fa-check-circle"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ approvedCount }}</span>
              <span class="metric-tag tag-approved">{{ getPercentage(approvedCount) }}% of total</span>
            </div>
            <div class="metric-bar">
              <div class="metric-bar-fill fill-approved" :style="{ width: getPercentage(approvedCount) + '%' }"></div>
            </div>
          </div>

          <!-- Rejected Requests -->
          <div
            class="metric-card"
            :class="{ 'card-active': statusFilter === 'Rejected' }"
            @click="filterByStatus('Rejected')"
          >
            <div class="metric-card-bg"></div>
            <div class="metric-header">
              <span class="metric-title">Rejected</span>
              <div class="metric-icon-wrap icon-rejected">
                <i class="fas fa-times-circle"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ rejectedCount }}</span>
              <span class="metric-tag tag-rejected">{{ getPercentage(rejectedCount) }}% of total</span>
            </div>
            <div class="metric-bar">
              <div class="metric-bar-fill fill-rejected" :style="{ width: getPercentage(rejectedCount) + '%' }"></div>
            </div>
          </div>
        </section>

        <!-- Command Toolbar (Search & Filters) -->
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

            <!-- Department Dropdown Filter -->
            <div class="dropdown-filter-modern" v-if="uniqueDepartments.length > 0">
              <i class="fas fa-building filter-icon"></i>
              <select v-model="departmentFilter" class="select-modern">
                <option value="">All Departments</option>
                <option v-for="dept in uniqueDepartments" :key="dept" :value="dept">
                  {{ dept }}
                </option>
              </select>
            </div>
          </div>

          <div class="toolbar-right">
            <!-- Quick Status Chips -->
            <div class="status-chips-group">
              <button
                class="chip-btn"
                :class="{ active: statusFilter === '' }"
                @click="statusFilter = ''"
              >
                All ({{ leaveRequests.length }})
              </button>
              <button
                class="chip-btn pending"
                :class="{ active: statusFilter === 'Pending' }"
                @click="statusFilter = 'Pending'"
              >
                Pending ({{ pendingCount }})
              </button>
              <button
                class="chip-btn approved"
                :class="{ active: statusFilter === 'Approved' }"
                @click="statusFilter = 'Approved'"
              >
                Approved ({{ approvedCount }})
              </button>
              <button
                class="chip-btn rejected"
                :class="{ active: statusFilter === 'Rejected' }"
                @click="statusFilter = 'Rejected'"
              >
                Rejected ({{ rejectedCount }})
              </button>
            </div>

            <!-- Reset Filters if any active -->
            <button
              v-if="hasActiveFilters"
              class="reset-filters-btn"
              @click="clearAllFilters"
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
            <i class="fas fa-calendar-alt spinner-icon"></i>
          </div>
          <h3>Loading Leave Applications</h3>
          <p>Connecting to secure server & fetching latest records...</p>
        </div>

        <!-- Table Container (Desktop & Tablet) -->
        <div v-else class="content-table-card">
          <div class="table-card-header">
            <div class="results-info">
              <span class="results-count">
                Showing <strong>{{ visibleLeaves.length }}</strong> of <strong>{{ filteredLeaves.length }}</strong> requests
              </span>
              <span class="results-filter-badge" v-if="hasActiveFilters">
                Filtered view
              </span>
            </div>

            <div class="table-hint">
              <i class="fas fa-info-circle"></i>
              <span>Click employee name or avatar to inspect live balance</span>
            </div>
          </div>

          <!-- Desktop Table -->
          <div class="table-responsive desktop-table-wrapper" v-if="!isMobile">
            <table class="modern-table">
              <thead>
                <tr>
                  <th class="th-employee">Employee Details</th>
                  <th class="th-type">Leave Category</th>
                  <th class="th-dates">Schedule & Duration</th>
                  <th class="th-reason">Reason & Document</th>
                  <th class="th-status">Status</th>
                  <th class="th-actions text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="leave in visibleLeaves"
                  :key="leave.id"
                  class="table-row-interactive"
                  :class="`row-${(leave.status || 'pending').toLowerCase()}`"
                >
                  <!-- Employee Column -->
                  <td class="td-employee">
                    <div class="employee-identity" @click="openLeaveBalancePopup(leave.name)">
                      <div class="avatar-modern" :style="{ background: getAvatarGradient(leave.name) }">
                        {{ getInitials(leave.name) }}
                      </div>
                      <div class="employee-meta">
                        <span class="emp-name" :title="leave.name">
                          {{ formatName(leave.name) }}
                        </span>
                        <div class="emp-sub-meta">
                          <span class="dept-pill" v-if="leave.department">
                            <i class="fas fa-briefcase"></i>
                            {{ leave.department }}
                          </span>
                          <span class="view-balance-prompt">
                            <i class="fas fa-chart-pie"></i> Balance
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Leave Category -->
                  <td class="td-type">
                    <div class="category-wrapper">
                      <span :class="['category-badge', getLeaveTypeClass(leave.leaveType)]">
                        <i :class="getLeaveTypeIcon(leave.leaveType)"></i>
                        {{ leave.leaveType }}
                      </span>
                    </div>
                  </td>

                  <!-- Schedule & Duration -->
                  <td class="td-dates">
                    <div class="schedule-block">
                      <div class="date-range">
                        <i class="far fa-calendar-alt date-icon"></i>
                        <span class="date-text">
                          {{ formatDate(leave.fromDate) }}
                          <template v-if="leave.fromDate !== leave.toDate">
                            <span class="date-arrow">&rarr;</span>
                            {{ formatDate(leave.toDate) }}
                          </template>
                        </span>
                      </div>
                      <div class="duration-badge" :class="{ 'half-day-duration': isHalfDayLeave(leave) }">
                        <i class="fas" :class="isHalfDayLeave(leave) ? 'fa-adjust' : 'fa-clock'"></i>
                        <span>{{ getLeaveDurationDisplay(leave) }}</span>
                      </div>
                    </div>
                  </td>

                  <!-- Reason & Attachment -->
                  <td class="td-reason">
                    <div class="reason-container">
                      <p
                        class="reason-text"
                        :title="leave.reason"
                        @click="openReasonModal(leave)"
                      >
                        {{ truncateText(leave.reason, 60) }}
                      </p>
                      <button
                        v-if="leave.file"
                        class="attachment-pill"
                        @click.stop="openAttachmentModal(leave)"
                        title="View attached document"
                      >
                        <i class="fas fa-paperclip"></i>
                        <span>Attachment</span>
                      </button>
                    </div>
                  </td>

                  <!-- Status -->
                  <td class="td-status">
                    <span :class="['status-pill', getStatusClass(leave.status)]">
                      <span class="status-pulse-dot"></span>
                      <i :class="getStatusIcon(leave.status)"></i>
                      {{ leave.status }}
                    </span>
                  </td>

                  <!-- Actions -->
                  <td class="td-actions text-right">
                    <div class="action-buttons-wrap">
                      <!-- Approve Button -->
                      <button
                        v-if="leave.status === 'Pending' || leave.status === 'Rejected'"
                        class="btn-action btn-approve"
                        :class="{ 'btn-loading': busyLeave.id === leave.id && busyLeave.action === 'Approved' }"
                        :disabled="busyLeave.id === leave.id"
                        @click="approveLeave(leave)"
                        :title="leave.status === 'Rejected' ? 'Re-approve leave request' : 'Approve leave request'"
                      >
                        <i v-if="busyLeave.id === leave.id && busyLeave.action === 'Approved'" class="fas fa-circle-notch fa-spin"></i>
                        <i v-else class="fas fa-check"></i>
                        <span>{{ leave.status === 'Rejected' ? 'Re-Approve' : 'Approve' }}</span>
                      </button>

                      <!-- Reject Button -->
                      <button
                        v-if="leave.status === 'Pending' || leave.status === 'Approved'"
                        class="btn-action btn-reject"
                        :class="{ 'btn-loading': busyLeave.id === leave.id && busyLeave.action === 'Rejected' }"
                        :disabled="busyLeave.id === leave.id"
                        @click="rejectLeave(leave)"
                        :title="leave.status === 'Approved' ? 'Revoke and mark as rejected' : 'Reject leave request'"
                      >
                        <i v-if="busyLeave.id === leave.id && busyLeave.action === 'Rejected'" class="fas fa-circle-notch fa-spin"></i>
                        <i v-else class="fas fa-times"></i>
                        <span>{{ leave.status === 'Approved' ? 'Revoke' : 'Reject' }}</span>
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Desktop Empty State -->
                <tr v-if="visibleLeaves.length === 0" class="empty-table-row">
                  <td colspan="6">
                    <div class="empty-state-modern">
                      <div class="empty-icon-circle">
                        <i class="fas fa-inbox"></i>
                      </div>
                      <h3>No Leave Applications Found</h3>
                      <p v-if="hasActiveFilters">
                        No requests match your current filters. Try changing or clearing filters.
                      </p>
                      <p v-else>
                        There are currently no leave requests recorded in the system.
                      </p>
                      <button v-if="hasActiveFilters" class="clear-empty-btn" @click="clearAllFilters">
                        <i class="fas fa-undo"></i>
                        <span>Clear All Filters</span>
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
              v-for="leave in visibleLeaves"
              :key="leave.id"
              class="mobile-leave-card"
              :class="`border-${(leave.status || 'pending').toLowerCase()}`"
            >
              <!-- Card Header -->
              <div class="m-card-header">
                <div class="m-employee-info" @click="openLeaveBalancePopup(leave.name)">
                  <div class="avatar-modern avatar-mobile" :style="{ background: getAvatarGradient(leave.name) }">
                    {{ getInitials(leave.name) }}
                  </div>
                  <div>
                    <h4 class="m-emp-name">{{ formatName(leave.name) }}</h4>
                    <span class="m-dept-tag" v-if="leave.department">{{ leave.department }}</span>
                  </div>
                </div>

                <span :class="['status-pill', getStatusClass(leave.status)]">
                  <span class="status-pulse-dot"></span>
                  {{ leave.status }}
                </span>
              </div>

              <!-- Card Grid Details -->
              <div class="m-card-body">
                <div class="m-detail-item">
                  <span class="m-label"><i class="fas fa-tag"></i> Leave Type</span>
                  <span :class="['category-badge', getLeaveTypeClass(leave.leaveType)]">
                    <i :class="getLeaveTypeIcon(leave.leaveType)"></i>
                    {{ leave.leaveType }}
                  </span>
                </div>

                <div class="m-detail-item">
                  <span class="m-label"><i class="fas fa-clock"></i> Duration</span>
                  <span class="duration-badge m-duration">
                    {{ getLeaveDurationDisplay(leave) }}
                  </span>
                </div>

                <div class="m-detail-item m-full-width">
                  <span class="m-label"><i class="far fa-calendar-alt"></i> Dates</span>
                  <span class="m-value">
                    {{ formatDate(leave.fromDate) }}
                    <template v-if="leave.fromDate !== leave.toDate">
                      &rarr; {{ formatDate(leave.toDate) }}
                    </template>
                  </span>
                </div>

                <div class="m-detail-item m-full-width">
                  <span class="m-label"><i class="fas fa-quote-left"></i> Reason</span>
                  <p class="m-reason" @click="openReasonModal(leave)">
                    {{ leave.reason || 'No reason provided' }}
                  </p>
                </div>

                <div class="m-detail-item m-full-width" v-if="leave.file">
                  <button class="attachment-pill" @click="openAttachmentModal(leave)">
                    <i class="fas fa-paperclip"></i>
                    <span>View Attached Document</span>
                  </button>
                </div>
              </div>

              <!-- Card Actions -->
              <div class="m-card-actions">
                <button
                  v-if="leave.status === 'Pending' || leave.status === 'Rejected'"
                  class="btn-action btn-approve m-action-btn"
                  :disabled="busyLeave.id === leave.id"
                  @click="approveLeave(leave)"
                >
                  <i v-if="busyLeave.id === leave.id && busyLeave.action === 'Approved'" class="fas fa-circle-notch fa-spin"></i>
                  <i v-else class="fas fa-check"></i>
                  <span>{{ leave.status === 'Rejected' ? 'Re-Approve' : 'Approve' }}</span>
                </button>

                <button
                  v-if="leave.status === 'Pending' || leave.status === 'Approved'"
                  class="btn-action btn-reject m-action-btn"
                  :disabled="busyLeave.id === leave.id"
                  @click="rejectLeave(leave)"
                >
                  <i v-if="busyLeave.id === leave.id && busyLeave.action === 'Rejected'" class="fas fa-circle-notch fa-spin"></i>
                  <i v-else class="fas fa-times"></i>
                  <span>{{ leave.status === 'Approved' ? 'Revoke' : 'Reject' }}</span>
                </button>
              </div>
            </div>

            <!-- Mobile Empty State -->
            <div v-if="visibleLeaves.length === 0" class="empty-state-modern">
              <div class="empty-icon-circle">
                <i class="fas fa-inbox"></i>
              </div>
              <h3>No Leave Applications</h3>
              <p>No records matching your search or filters.</p>
              <button v-if="hasActiveFilters" class="clear-empty-btn" @click="clearAllFilters">
                <i class="fas fa-undo"></i>
                <span>Clear Filters</span>
              </button>
            </div>
          </div>

          <!-- Pagination / Show More -->
          <div class="table-pagination-footer" v-if="visibleLeaveCount < filteredLeaves.length">
            <button class="btn-load-more" @click="showMoreLeaves">
              <i class="fas fa-chevron-down"></i>
              <span>Show More Requests ({{ filteredLeaves.length - visibleLeaveCount }} remaining)</span>
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- ================= MODALS ================= -->

    <!-- 1. Modern Leave Balance Modal -->
    <div v-if="showBalancePopup" class="modal-overlay" @click="closeLeaveBalancePopup">
      <div class="modal-card modal-balance" @click.stop>
        <div class="modal-header">
          <div class="modal-header-title">
            <div class="modal-icon-tile">
              <i class="fas fa-umbrella-beach"></i>
            </div>
            <div>
              <h2>Leave Quota & Balance</h2>
              <p class="modal-subtitle">Official leave balance breakdown for Financial Year</p>
            </div>
          </div>
          <button class="modal-close-btn" @click="closeLeaveBalancePopup" title="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <!-- Employee Profile Banner -->
          <div class="modal-employee-banner">
            <div class="modal-avatar" :style="{ background: getAvatarGradient(selectedUser || '') }">
              {{ selectedUser ? getInitials(selectedUser) : '?' }}
            </div>
            <div class="modal-emp-info">
              <h3>{{ selectedUser ? formatName(selectedUser) : 'Loading...' }}</h3>
              <div class="modal-emp-tags">
                <span class="modal-tag-dept"><i class="fas fa-building"></i> {{ selectedUserDepartment || 'Department' }}</span>
                <span class="modal-tag-year"><i class="fas fa-calendar-alt"></i> FY {{ popupFinancialYear }}</span>
              </div>
            </div>
          </div>

          <div v-if="loadingBalance" class="modal-loading-wrap">
            <div class="spinner-ring"></div>
            <span>Fetching real-time quota data...</span>
          </div>

          <div v-else-if="popupLeaveDetails.length" class="balance-content-wrapper">
            <!-- Quota Visual Progress Cards -->
            <div class="balance-quota-grid">
              <div
                v-for="(value, type) in popupLeaveSummary"
                :key="type"
                class="quota-progress-card"
                :class="`quota-${type}`"
              >
                <div class="quota-top">
                  <div class="quota-icon-wrap">
                    <i :class="getLeaveIcon(type)"></i>
                  </div>
                  <div class="quota-title-wrap">
                    <span class="quota-type-name">{{ formatLeaveType(type) }}</span>
                    <span class="quota-available">{{ value.remaining }} Left</span>
                  </div>
                </div>

                <div class="quota-meter">
                  <div
                    class="quota-meter-fill"
                    :style="{ width: getUsagePercentage(value.total - value.remaining, value.total) + '%' }"
                  ></div>
                </div>

                <div class="quota-stats-row">
                  <span>Used: <strong>{{ (value.total - value.remaining).toFixed(1) }}</strong></span>
                  <span>Total: <strong>{{ value.total }}</strong></span>
                </div>
              </div>
            </div>

            <!-- Summary Chips -->
            <div class="balance-summary-strip">
              <div class="summary-chip-item">
                <i class="fas fa-check-double text-emerald"></i>
                <div>
                  <span class="chip-caption">Total Remaining</span>
                  <span class="chip-figure text-emerald">{{ popupTotalRemaining.toFixed(1) }} Days</span>
                </div>
              </div>

              <div class="summary-chip-item">
                <i class="fas fa-history text-amber"></i>
                <div>
                  <span class="chip-caption">Total Consumed</span>
                  <span class="chip-figure text-amber">{{ popupTotalUsed.toFixed(1) }} Days</span>
                </div>
              </div>

              <div class="summary-chip-item">
                <i class="fas fa-award text-indigo"></i>
                <div>
                  <span class="chip-caption">Total Entitlement</span>
                  <span class="chip-figure text-indigo">{{ popupTotalAllocated }} Days</span>
                </div>
              </div>
            </div>

            <!-- Table breakdown -->
            <div class="breakdown-table-wrap">
              <table class="modal-breakdown-table">
                <thead>
                  <tr>
                    <th>Leave Category</th>
                    <th class="text-center">Entitlement</th>
                    <th class="text-center">Consumed</th>
                    <th class="text-center">Remaining</th>
                    <th class="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in popupLeaveDetails" :key="idx">
                    <td>
                      <div class="category-breakdown-cell">
                        <i :class="getLeaveIcon(item.type)"></i>
                        <span>{{ formatLeaveType(item.type) }}</span>
                      </div>
                    </td>
                    <td class="text-center font-bold">{{ item.total }}</td>
                    <td class="text-center text-amber font-bold">{{ item.used }}</td>
                    <td class="text-center text-emerald font-bold" :class="getRemainingClass(item.remaining)">
                      {{ item.remaining }}
                    </td>
                    <td class="text-center">
                      <span class="modal-status-badge" :class="getQuotaStatusClass(item.remaining, item.total)">
                        {{ getStatusText(item.remaining, item.total) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="popupUnpaidLeaveDays > 0" class="unpaid-warning-box">
              <i class="fas fa-exclamation-triangle"></i>
              <span>This employee has <strong>{{ popupUnpaidLeaveDays }}</strong> recorded Unpaid / Absent leave day(s).</span>
            </div>
          </div>

          <div v-else class="modal-empty-state">
            <i class="fas fa-calendar-times"></i>
            <p>No leave balance record available for this employee.</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-primary-btn" @click="closeLeaveBalancePopup">
            Close Overview
          </button>
        </div>
      </div>
    </div>

    <!-- 2. Attachment Preview Modal -->
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
          <button class="modal-secondary-btn" @click="closeAttachmentModal">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- 3. Full Reason Reading Modal -->
    <div v-if="activeReasonModal" class="modal-overlay" @click="closeReasonModal">
      <div class="modal-card modal-reason" @click.stop>
        <div class="modal-header">
          <div class="modal-header-title">
            <div class="modal-icon-tile">
              <i class="fas fa-quote-left"></i>
            </div>
            <div>
              <h2>Leave Request Reason</h2>
              <p class="modal-subtitle">{{ formatName(activeReasonModal.name) }} &bull; {{ activeReasonModal.leaveType }}</p>
            </div>
          </div>
          <button class="modal-close-btn" @click="closeReasonModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="reason-full-box">
            <p>{{ activeReasonModal.reason || 'No detailed reason was provided for this application.' }}</p>
          </div>

          <div class="reason-meta-strip">
            <span><strong>From:</strong> {{ formatDate(activeReasonModal.fromDate) }}</span>
            <span><strong>To:</strong> {{ formatDate(activeReasonModal.toDate) }}</span>
            <span><strong>Duration:</strong> {{ getLeaveDurationDisplay(activeReasonModal) }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-primary-btn" @click="closeReasonModal">
            Close
          </button>
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
  name: 'LeaveApplications',
  components: { Sidebar },
  data() {
    return {
      loadingLeaves: false,
      isRefreshing: false,
      busyLeave: { id: null, action: null },
      visibleLeaveCount: 10,
      leaveRequests: [],
      isMobile: false,
      isSidebarVisible: true,
      loggedInUserName: '',
      searchQuery: '',
      statusFilter: '',
      departmentFilter: '',
      
      // Modals
      showBalancePopup: false,
      selectedUser: null,
      selectedUserDepartment: null,
      loadingBalance: false,
      popupLeaveDetails: [],
      popupLeaveAllocations: {
        privilege: 0,
        casual: 0,
        sick: 0
      },
      popupLeaveUsed: {
        privilege: 0,
        casual: 0,
        sick: 0
      },
      popupUnpaidLeaveDays: 0,
      popupUserId: null,
      popupFinancialYear: new Date().getFullYear(),

      activeAttachmentModal: null,
      activeReasonModal: null,
    }
  },

  computed: {
    sortedLeaves() {
      return [...this.leaveRequests].sort((a, b) => {
        const dateA = new Date(a.created_at || a.fromDate || 0)
        const dateB = new Date(b.created_at || b.fromDate || 0)
        return dateB - dateA
      })
    },

    uniqueDepartments() {
      const depts = new Set()
      this.leaveRequests.forEach(l => {
        if (l.department && typeof l.department === 'string' && l.department.trim()) {
          depts.add(l.department.trim())
        }
      })
      return Array.from(depts).sort()
    },

    filteredLeaves() {
      let list = this.sortedLeaves

      if (this.statusFilter) {
        list = list.filter(l => (l.status || '').toLowerCase() === this.statusFilter.toLowerCase())
      }

      if (this.departmentFilter) {
        list = list.filter(l => (l.department || '').toLowerCase() === this.departmentFilter.toLowerCase())
      }

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase().trim()
        list = list.filter(l =>
          (l.name && l.name.toLowerCase().includes(q)) ||
          (l.department && l.department.toLowerCase().includes(q)) ||
          (l.leaveType && l.leaveType.toLowerCase().includes(q)) ||
          (l.reason && l.reason.toLowerCase().includes(q))
        )
      }

      return list
    },

    visibleLeaves() {
      return this.filteredLeaves.slice(0, this.visibleLeaveCount)
    },

    hasActiveFilters() {
      return !!(this.statusFilter || this.departmentFilter || this.searchQuery)
    },

    pendingCount() {
      return this.leaveRequests.filter(l => (l.status || '').toLowerCase() === 'pending').length
    },

    approvedCount() {
      return this.leaveRequests.filter(l => (l.status || '').toLowerCase() === 'approved').length
    },

    rejectedCount() {
      return this.leaveRequests.filter(l => (l.status || '').toLowerCase() === 'rejected').length
    },

    popupLeaveSummary() {
      return {
        privilege: { 
          remaining: Math.max(0, this.popupLeaveAllocations.privilege - this.popupLeaveUsed.privilege), 
          total: this.popupLeaveAllocations.privilege 
        },
        casual: { 
          remaining: Math.max(0, this.popupLeaveAllocations.casual - this.popupLeaveUsed.casual), 
          total: this.popupLeaveAllocations.casual 
        },
        sick: { 
          remaining: Math.max(0, this.popupLeaveAllocations.sick - this.popupLeaveUsed.sick), 
          total: this.popupLeaveAllocations.sick 
        }
      }
    },

    popupTotalRemaining() {
      return Object.values(this.popupLeaveSummary).reduce((sum, item) => sum + Math.max(0, (item.remaining || 0)), 0)
    },

    popupTotalUsed() {
      return Object.values(this.popupLeaveUsed).reduce((sum, item) => sum + (item || 0), 0)
    },

    popupTotalAllocated() {
      return Object.values(this.popupLeaveAllocations).reduce((sum, item) => sum + (item || 0), 0)
    }
  },

  methods: {
    getPercentage(count) {
      if (!this.leaveRequests.length) return 0
      return Math.round((count / this.leaveRequests.length) * 100)
    },

    filterByStatus(status) {
      this.statusFilter = this.statusFilter === status ? '' : status
      this.visibleLeaveCount = 10
    },

    clearAllFilters() {
      this.statusFilter = ''
      this.departmentFilter = ''
      this.searchQuery = ''
      this.visibleLeaveCount = 10
    },

    showMoreLeaves() {
      this.visibleLeaveCount += 10
    },

    async refreshData() {
      this.isRefreshing = true
      await this.fetchLeaves()
      setTimeout(() => {
        this.isRefreshing = false
      }, 500)
    },

    truncateText(text, length = 50) {
      if (!text) return '—'
      return text.length > length ? text.substring(0, length) + '...' : text
    },

    getInitials(name) {
      if (!name) return '?'
      return name
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },

    formatName(name) {
      if (!name) return ''
      return name
        .split(' ')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    },

    formatDate(date) {
      if (!date) return 'N/A'
      try {
        let d
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
          const [y, m, day] = date.trim().split('-').map(Number)
          d = new Date(y, m - 1, day)
        } else {
          d = new Date(date)
        }
        if (isNaN(d.getTime())) return date
        return d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      } catch (error) {
        return date
      }
    },

    formatDateToYMD(dateInput) {
      if (!dateInput) return ''
      if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
        return dateInput.trim()
      }
      const d = new Date(dateInput)
      if (isNaN(d.getTime())) {
        return String(dateInput).slice(0, 10)
      }
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    isHalfDayLeave(leave) {
      if (!leave) return false
      if (leave.is_half_day || leave.half_day) return true
      const type = (leave.leaveType || '').toLowerCase()
      return type.includes('half')
    },

    getLeaveDurationDisplay(leave) {
      if (!leave) return '1 Day'
      const days = this.calculateLeaveDays(leave.fromDate, leave.toDate, leave.leaveType)
      if (days === 0.5) {
        return '0.5 Day (Half Day)'
      }
      return `${days} ${days === 1 ? 'Day' : 'Days'}`
    },

    calculateLeaveDays(fromDate, toDate, leaveType) {
      try {
        const fromStr = this.formatDateToYMD(fromDate)
        const toStr = this.formatDateToYMD(toDate)
        
        const [y1, m1, d1] = fromStr.split('-').map(Number)
        const [y2, m2, d2] = toStr.split('-').map(Number)
        const from = new Date(y1, m1 - 1, d1)
        const to = new Date(y2, m2 - 1, d2)
        
        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
          return 1
        }
        
        const diffTime = Math.abs(to - from)
        let diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1
        
        const leaveTypeLower = (leaveType || '').toLowerCase().trim()
        if (
          leaveTypeLower === 'half day' || 
          leaveTypeLower === 'half-day' || 
          leaveTypeLower === 'halfday' ||
          leaveTypeLower.includes('half')
        ) {
          diffDays = 0.5
        }
        
        return diffDays
      } catch (error) {
        return 1
      }
    },

    getAvatarGradient(name) {
      const colors = [
        'linear-gradient(135deg, #6366f1, #4f46e5)',
        'linear-gradient(135deg, #3b82f6, #2563eb)',
        'linear-gradient(135deg, #10b981, #059669)',
        'linear-gradient(135deg, #f59e0b, #d97706)',
        'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        'linear-gradient(135deg, #ec4899, #db2777)',
        'linear-gradient(135deg, #14b8a6, #0d9488)',
      ]
      let hash = 0
      for (let i = 0; i < (name || '').length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
      }
      const index = Math.abs(hash) % colors.length
      return colors[index]
    },

    getStatusClass(status) {
      switch (status) {
        case 'Approved': return 'approved'
        case 'Rejected': return 'rejected'
        default: return 'pending'
      }
    },

    getStatusIcon(status) {
      switch (status) {
        case 'Approved': return 'fas fa-check-circle'
        case 'Rejected': return 'fas fa-times-circle'
        default: return 'fas fa-clock'
      }
    },

    getLeaveTypeClass(leaveType) {
      const type = (leaveType || '').toLowerCase()
      if (type.includes('sick')) return 'sick'
      if (type.includes('casual') || type === 'cl') return 'casual'
      if (type.includes('pl') || type.includes('privilege') || type.includes('paid')) return 'pl'
      if (type.includes('half')) return 'halfday'
      return 'default'
    },

    getLeaveTypeIcon(leaveType) {
      const type = (leaveType || '').toLowerCase()
      if (type.includes('sick')) return 'fas fa-thermometer-half'
      if (type.includes('casual') || type === 'cl') return 'fas fa-coffee'
      if (type.includes('pl') || type.includes('privilege') || type.includes('paid')) return 'fas fa-star'
      if (type.includes('half')) return 'fas fa-adjust'
      return 'fas fa-calendar-alt'
    },

    mapLeaveTypeToColumn(leaveType) {
      if (!leaveType) return null
      
      const typeMap = {
        'casual': { used_column: 'used_cl_leave', total_column: 'casual_leave', remaining_column: 'remaining_cl_leave' },
        'cl': { used_column: 'used_cl_leave', total_column: 'casual_leave', remaining_column: 'remaining_cl_leave' },
        'pl': { used_column: 'used_pl_leave', total_column: 'pl_leave', remaining_column: 'remaining_pl_leave' },
        'privilege': { used_column: 'used_pl_leave', total_column: 'pl_leave', remaining_column: 'remaining_pl_leave' },
        'sick': { used_column: 'used_sick_leave', total_column: 'sick_leave', remaining_column: 'remaining_sick_leave' },
        'sl': { used_column: 'used_sick_leave', total_column: 'sick_leave', remaining_column: 'remaining_sick_leave' },
        'unpaid': { used_column: 'used_unpaid_leave', total_column: 'unpaid_leave', remaining_column: 'remaining_unpaid_leave' },
        'half day': { used_column: 'used_cl_leave', total_column: 'casual_leave', remaining_column: 'remaining_cl_leave' }
      }
      
      const key = (leaveType || '').toLowerCase().trim()
      if (typeMap[key]) return typeMap[key]
      if (key.includes('half')) return typeMap['half day']
      
      for (const [typeKey, mapping] of Object.entries(typeMap)) {
        if (key.includes(typeKey)) return mapping
      }
      
      return typeMap['casual']
    },

    async approveLeave(leave) {
      if (this.busyLeave.id) return
      const previousStatus = leave.status
      this.busyLeave = { id: leave.id, action: 'Approved' }

      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No auth token found!')

        const userName = leave.name || this.loggedInUserName
        if (!userName) throw new Error('No valid user name found!')

        const totalDays = this.calculateLeaveDays(leave.fromDate, leave.toDate, leave.leaveType)

        const isHalfDay = this.isHalfDayLeave(leave)

        // 1. Update leave request status in backend
        await axios.patch(
          `https://employees.archenterprises.co.in/api/api/leave-requests/${leave.id}/status`,
          { 
            status: 'Approved',
            is_half_day: isHalfDay
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )

        // 2. IMMEDIATE UI UPDATE
        const leaveIndex = this.leaveRequests.findIndex(l => l.id === leave.id)
        if (leaveIndex !== -1) {
          this.leaveRequests[leaveIndex].status = 'Approved'
          this.leaveRequests = [...this.leaveRequests]
        }

        // 3. Update leave balance table
        try {
          const userResponse = await axios.get(
            `https://employees.archenterprises.co.in/api/api/user-by-name?name=${encodeURIComponent(userName)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          const userId = userResponse.data.id
          const currentYear = new Date().getFullYear()

          const balanceResponse = await axios.get(
            `https://employees.archenterprises.co.in/api/api/leave-balances/user/${userId}`,
            { 
              params: { year: currentYear },
              headers: { Authorization: `Bearer ${token}` }
            }
          )

          if (balanceResponse.data && balanceResponse.data.success && balanceResponse.data.data) {
            const currentBalance = balanceResponse.data.data
            const leaveTypeMapping = this.mapLeaveTypeToColumn(leave.leaveType)

            if (leaveTypeMapping) {
              const currentUsed = parseFloat(currentBalance[leaveTypeMapping.used_column]) || 0
              const totalAllowed = parseFloat(currentBalance[leaveTypeMapping.total_column]) || 0
              const newUsed = currentUsed + totalDays

              await axios.put(
                `https://employees.archenterprises.co.in/api/api/leave-balances/${currentBalance.id}`,
                {
                  [leaveTypeMapping.used_column]: parseFloat(newUsed.toFixed(2))
                },
                { headers: { Authorization: `Bearer ${token}` } }
              )

              if (newUsed > totalAllowed) {
                toastWarning(`Warning: This approval exceeds the ${leave.leaveType} quota limit.`)
              }
            }
          }

          // 4. Mark attendance
          if (previousStatus === 'Rejected' || previousStatus === 'Pending') {
            await this.markAttendanceAsLeave(leave, userId)
          }

          // 5. Delete absent records if re-approving
          if (previousStatus === 'Rejected') {
            await this.deleteAbsentRecords(leave)
          }

        } catch (subErr) {
          console.warn('Balance or attendance helper error:', subErr)
        }

        toastSuccess(`Leave approved successfully! (${totalDays} day${totalDays === 1 ? '' : 's'})`)
        await this.fetchLeaves()

      } catch (error) {
        console.error('Approve leave failed:', error)
        const leaveIndex = this.leaveRequests.findIndex(l => l.id === leave.id)
        if (leaveIndex !== -1) {
          this.leaveRequests[leaveIndex].status = previousStatus
          this.leaveRequests = [...this.leaveRequests]
        }
        toastError('Could not approve leave: ' + (error.message || 'Unknown error'))
      } finally {
        this.busyLeave = { id: null, action: null }
      }
    },

    async rejectLeave(leave) {
      if (this.busyLeave.id) return
      const previousStatus = leave.status
      this.busyLeave = { id: leave.id, action: 'Rejected' }

      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No auth token found!')

        const totalDays = this.calculateLeaveDays(leave.fromDate, leave.toDate, leave.leaveType)

        // 1. Update status
        await axios.patch(
          `https://employees.archenterprises.co.in/api/api/leave-requests/${leave.id}/status`,
          { status: 'Rejected' },
          { headers: { Authorization: `Bearer ${token}` } }
        )

        // 2. Immediate UI update
        const leaveIndex = this.leaveRequests.findIndex(l => l.id === leave.id)
        if (leaveIndex !== -1) {
          this.leaveRequests[leaveIndex].status = 'Rejected'
          this.leaveRequests = [...this.leaveRequests]
        }

        // 3. Revert balance if previously approved
        if (previousStatus === 'Approved') {
          try {
            const userName = leave.name || this.loggedInUserName
            const userResponse = await axios.get(
              `https://employees.archenterprises.co.in/api/api/user-by-name?name=${encodeURIComponent(userName)}`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
            const userId = userResponse.data.id
            const currentYear = new Date().getFullYear()

            const balanceResponse = await axios.get(
              `https://employees.archenterprises.co.in/api/api/leave-balances/user/${userId}`,
              { 
                params: { year: currentYear },
                headers: { Authorization: `Bearer ${token}` }
              }
            )

            if (balanceResponse.data && balanceResponse.data.success && balanceResponse.data.data) {
              const currentBalance = balanceResponse.data.data
              const leaveTypeMapping = this.mapLeaveTypeToColumn(leave.leaveType)

              if (leaveTypeMapping) {
                const currentUsed = parseFloat(currentBalance[leaveTypeMapping.used_column]) || 0
                const newUsed = Math.max(0, currentUsed - totalDays)

                await axios.put(
                  `https://employees.archenterprises.co.in/api/api/leave-balances/${currentBalance.id}`,
                  {
                    [leaveTypeMapping.used_column]: parseFloat(newUsed.toFixed(2))
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
                )
              }
            }
          } catch (revertErr) {
            console.warn('Reverting balance failed:', revertErr)
          }

          toastSuccess(`Leave rejected and ${totalDays} day(s) restored to quota`)
        } else {
          toastSuccess('Leave application rejected')
        }

        // 4. Mark attendance as Absent
        if (previousStatus !== 'Rejected') {
          await this.markAttendanceAsAbsent(leave)
        }

        await this.fetchLeaves()

      } catch (error) {
        console.error('Reject failed:', error)
        const leaveIndex = this.leaveRequests.findIndex(l => l.id === leave.id)
        if (leaveIndex !== -1) {
          this.leaveRequests[leaveIndex].status = previousStatus
          this.leaveRequests = [...this.leaveRequests]
        }
        toastError('Could not reject leave: ' + (error.message || 'Unknown error'))
      } finally {
        this.busyLeave = { id: null, action: null }
      }
    },

    async markAttendanceAsLeave(leave, userId) {
      try {
        const token = localStorage.getItem('token')
        const fromDateStr = this.formatDateToYMD(leave.fromDate)
        const toDateStr = this.formatDateToYMD(leave.toDate)
        const isHalfDay = this.isHalfDayLeave(leave)

        await axios.post(
          'https://employees.archenterprises.co.in/api/api/mark-attendance-leave',
          {
            name: leave.name,
            fromDate: fromDateStr,
            toDate: toDateStr,
            leaveType: leave.leaveType,
            is_half_day: isHalfDay,
            user_id: userId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } catch (error) {
        console.error('Failed to mark attendance as Leave:', error)
      }
    },

    async markAttendanceAsAbsent(leave) {
      try {
        const token = localStorage.getItem('token')
        const fromDateStr = this.formatDateToYMD(leave.fromDate)
        const toDateStr = this.formatDateToYMD(leave.toDate)
        const isHalfDay = this.isHalfDayLeave(leave)

        const userResponse = await axios.get(
          `https://employees.archenterprises.co.in/api/api/user-by-name?name=${encodeURIComponent(leave.name)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const userId = userResponse.data.id

        await axios.post(
          'https://employees.archenterprises.co.in/api/api/mark-attendance-absent',
          {
            name: leave.name,
            fromDate: fromDateStr,
            toDate: toDateStr,
            leaveType: leave.leaveType,
            is_half_day: isHalfDay,
            user_id: userId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } catch (error) {
        console.error('Failed to mark attendance as Absent:', error)
      }
    },

    async deleteAbsentRecords(leave) {
      try {
        const token = localStorage.getItem('token')
        const fromDateStr = this.formatDateToYMD(leave.fromDate)
        const toDateStr = this.formatDateToYMD(leave.toDate)

        const userResponse = await axios.get(
          `https://employees.archenterprises.co.in/api/api/user-by-name?name=${encodeURIComponent(leave.name)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const userId = userResponse.data.id

        const absentResponse = await axios.get(
          `https://employees.archenterprises.co.in/api/api/attendance`,
          { 
            params: { 
              user_id: userId,
              from_date: fromDateStr,
              to_date: toDateStr,
              status: 'Absent'
            },
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        if (absentResponse.data && absentResponse.data.length > 0) {
          for (const absentRecord of absentResponse.data) {
            await axios.delete(
              `https://employees.archenterprises.co.in/api/api/attendance/${absentRecord.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
          }
        }
      } catch (error) {
        console.error('Failed to delete absent records:', error)
      }
    },

    async fetchLeaves() {
      this.loadingLeaves = true
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(
          'https://employees.archenterprises.co.in/api/api/leave-requests',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const rawLeaves = Array.isArray(response.data) ? response.data : []
        this.leaveRequests = rawLeaves.map(leave => ({
          ...leave,
          fromDate: this.formatDateToYMD(leave.fromDate),
          toDate: this.formatDateToYMD(leave.toDate)
        }))
      } catch (error) {
        console.error('FULL ERROR:', error)
        toastError('Failed to load leave requests')
      } finally {
        this.loadingLeaves = false
      }
    },

    // Popup Methods
    async openLeaveBalancePopup(userName) {
      if (!userName) return
      this.selectedUser = userName
      this.showBalancePopup = true
      this.loadingBalance = true
      this.popupLeaveDetails = []

      this.popupLeaveAllocations = { privilege: 0, casual: 0, sick: 0 }
      this.popupLeaveUsed = { privilege: 0, casual: 0, sick: 0 }
      this.popupUnpaidLeaveDays = 0

      try {
        const token = localStorage.getItem('token')
        const userResponse = await axios.get(
          `https://employees.archenterprises.co.in/api/api/user-by-name?name=${encodeURIComponent(userName)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const userId = userResponse.data.id
        this.popupUserId = userId
        this.selectedUserDepartment = userResponse.data.department || ''

        const currentYear = new Date().getFullYear()
        const balanceResponse = await axios.get(
          `https://employees.archenterprises.co.in/api/api/leave-balances/user/${userId}`,
          { 
            params: { year: currentYear },
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        if (balanceResponse.data && balanceResponse.data.success && balanceResponse.data.data) {
          const balanceData = balanceResponse.data.data
          
          this.popupLeaveAllocations = {
            privilege: parseFloat(balanceData.pl_leave) || 0,
            casual: parseFloat(balanceData.casual_leave) || 0,
            sick: parseFloat(balanceData.sick_leave) || 0
          }
          
          this.popupLeaveUsed = {
            privilege: parseFloat(balanceData.used_pl_leave) || 0,
            casual: parseFloat(balanceData.used_cl_leave) || 0,
            sick: parseFloat(balanceData.used_sick_leave) || 0
          }
          
          const remainingPL = parseFloat(balanceData.remaining_pl_leave) || 0
          const remainingCL = parseFloat(balanceData.remaining_cl_leave) || 0
          const remainingSick = parseFloat(balanceData.remaining_sick_leave) || 0
          this.popupUnpaidLeaveDays = parseFloat(balanceData.used_unpaid_leave) || 0
          
          this.popupLeaveDetails = [
            { 
              type: 'casual', 
              total: this.popupLeaveAllocations.casual, 
              used: this.popupLeaveUsed.casual, 
              remaining: remainingCL
            },
            { 
              type: 'sick', 
              total: this.popupLeaveAllocations.sick, 
              used: this.popupLeaveUsed.sick, 
              remaining: remainingSick
            },
            { 
              type: 'privilege', 
              total: this.popupLeaveAllocations.privilege, 
              used: this.popupLeaveUsed.privilege, 
              remaining: remainingPL
            }
          ]
        }
      } catch (error) {
        console.error('Error fetching balance:', error)
        toastError('Could not fetch leave balance')
      } finally {
        this.loadingBalance = false
      }
    },

    closeLeaveBalancePopup() {
      this.showBalancePopup = false
      this.selectedUser = null
      this.selectedUserDepartment = null
      this.popupLeaveDetails = []
    },

    openAttachmentModal(leave) {
      this.activeAttachmentModal = leave
    },

    closeAttachmentModal() {
      this.activeAttachmentModal = null
    },

    openReasonModal(leave) {
      this.activeReasonModal = leave
    },

    closeReasonModal() {
      this.activeReasonModal = null
    },

    getFileUrl(file) {
      if (!file) return ''
      if (file.startsWith('http://') || file.startsWith('https://')) return file
      const cleanPath = file.startsWith('/') ? file.substring(1) : file
      return `https://employees.archenterprises.co.in/backend/public/storage/${cleanPath}`
    },

    isImageFile(path) {
      if (!path) return false
      const ext = path.split('.').pop().toLowerCase()
      return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)
    },

    getLeaveIcon(type) {
      const icons = {
        privilege: 'fas fa-award',
        casual: 'fas fa-coffee',
        sick: 'fas fa-heartbeat',
        absent: 'fas fa-calendar-times',
        'half day': 'fas fa-adjust',
        default: 'fas fa-calendar-day'
      }
      return icons[type?.toLowerCase()] || icons.default
    },

    formatLeaveType(type) {
      const types = {
        privilege: 'Privilege Leave',
        casual: 'Casual Leave',
        sick: 'Sick / Medical',
        absent: 'Unpaid / Absent',
        'half day': 'Half Day'
      }
      return types[type?.toLowerCase()] || type
    },

    getRemainingClass(remaining) {
      if (remaining <= 0) return 'text-critical'
      if (remaining <= 2) return 'text-warning'
      return 'text-good'
    },

    getQuotaStatusClass(remaining, total) {
      if (total === 0) return 'quota-na'
      if (remaining <= 0) return 'quota-exhausted'
      if (remaining <= 2) return 'quota-low'
      return 'quota-available'
    },

    getUsagePercentage(used, total) {
      if (total === 0) return 0
      const pct = Math.round((used / total) * 100)
      return Math.min(100, Math.max(0, pct))
    },

    getStatusText(remaining, total) {
      if (total === 0) return 'N/A'
      if (remaining <= 0) return 'Exhausted'
      if (remaining <= 2) return 'Low Balance'
      return 'Available'
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 860
      this.isSidebarVisible = !this.isMobile
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    }
  },

  mounted() {
    const token = localStorage.getItem('token')
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null')

    if (!token) {
      this.$router.push('/auth')
      return
    }

    this.fetchLeaves()
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)

    if (storedUser && storedUser.name) this.loggedInUserName = storedUser.name

    const role = (storedUser && storedUser.role) ? String(storedUser.role).toLowerCase() : null
    if (role === 'employee' || role === 'staff') {
      this.$router.push('/employee/dashboard')
      return
    }
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  }
}
</script>

<style scoped>
/* ================= DESIGN SYSTEM TOKENS ================= */
:root {
  --primary-gradient: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  --primary-color: #4f46e5;
  --primary-light: #eef2ff;
  --slate-900: #0f172a;
  --slate-800: #1e293b;
  --slate-700: #334155;
  --slate-600: #475569;
  --slate-500: #64748b;
  --slate-400: #94a3b8;
  --slate-300: #cbd5e1;
  --slate-200: #e2e8f0;
  --slate-100: #f1f5f9;
  --slate-50: #f8fafc;
  --success: #10b981;
  --success-light: #ecfdf5;
  --warning: #f59e0b;
  --warning-light: #fffbeb;
  --danger: #ef4444;
  --danger-light: #fef2f2;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 28px;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

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
  color: #4f46e5;
  background: #eef2ff;
  padding: 4px 12px;
  border-radius: 20px;
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background: #4f46e5;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  animation: pulseAnimation 2s infinite;
}

@keyframes pulseAnimation {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.5); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(79, 70, 229, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
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
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 8px 16px rgba(79, 70, 229, 0.25);
  flex-shrink: 0;
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
  font-weight: 400;
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
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.refresh-btn.spinning i {
  animation: spin 0.8s linear infinite;
}

.pending-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #b45309;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.chip-dot {
  width: 8px;
  height: 8px;
  background: #f59e0b;
  border-radius: 50%;
  animation: pulseAmber 1.5s infinite;
}

@keyframes pulseAmber {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

/* ================= METRICS CARDS ================= */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 18px;
}

.metric-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px -3px rgba(0, 0, 0, 0.06);
  border-color: #cbd5e1;
}

.metric-card.card-active {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25), 0 10px 20px -3px rgba(99, 102, 241, 0.1);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.metric-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.metric-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.icon-all { background: #eef2ff; color: #4f46e5; }
.icon-pending { background: #fffbeb; color: #d97706; }
.icon-approved { background: #ecfdf5; color: #059669; }
.icon-rejected { background: #fef2f2; color: #dc2626; }

.metric-body {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 14px;
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
  padding: 2px 8px;
  border-radius: 8px;
}

.tag-all { background: #f1f5f9; color: #475569; }
.tag-pending { background: #fef3c7; color: #92400e; }
.tag-approved { background: #d1fae5; color: #065f46; }
.tag-rejected { background: #fee2e2; color: #991b1b; }

.metric-bar {
  width: 100%;
  height: 5px;
  background: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}

.metric-bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.6s ease;
}

.fill-all { background: #6366f1; }
.fill-pending { background: #f59e0b; }
.fill-approved { background: #10b981; }
.fill-rejected { background: #ef4444; }

/* ================= TOOLBAR (SEARCH & FILTERS) ================= */
.toolbar-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 16px 20px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 280px;
}

.search-box-modern {
  position: relative;
  flex: 1;
  max-width: 460px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 14px;
}

.search-input-modern {
  width: 100%;
  padding: 10px 36px 10px 38px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  border-radius: 12px;
  font-size: 14px;
  color: #1e293b;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.search-input-modern:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.search-clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.search-clear-btn:hover {
  color: #475569;
  background: #f1f5f9;
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
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
  color: #334155;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  padding-right: 32px;
  transition: all 0.2s ease;
}

.select-modern:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-chips-group {
  display: flex;
  gap: 6px;
  background: #ffffff;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.chip-btn {
  border: none;
  background: transparent;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip-btn:hover {
  color: #0f172a;
  background: #f1f5f9;
}

.chip-btn.active {
  background: #0f172a;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.2);
}

.chip-btn.pending.active {
  background: #d97706;
  color: #ffffff;
}

.chip-btn.approved.active {
  background: #059669;
  color: #ffffff;
}

.chip-btn.rejected.active {
  background: #dc2626;
  color: #ffffff;
}

.reset-filters-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-filters-btn:hover {
  background: #fecaca;
}

/* ================= TABLE CARD ================= */
.content-table-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.table-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 13px;
  color: #64748b;
}

.results-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.results-count strong {
  color: #0f172a;
}

.results-filter-badge {
  background: #e0e7ff;
  color: #4338ca;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
}

.table-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.modern-table th {
  padding: 14px 20px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #fafbfc;
  border-bottom: 1px solid #e2e8f0;
}

.modern-table td {
  padding: 16px 20px;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.table-row-interactive {
  transition: background-color 0.15s ease, transform 0.15s ease;
}

.table-row-interactive:hover {
  background-color: #f8fafc;
}

/* Row accent indication on hover */
.row-pending:hover {
  background-color: #fffdf5;
}
.row-approved:hover {
  background-color: #f6fef9;
}
.row-rejected:hover {
  background-color: #fff8f8;
}

/* ================= TABLE CELLS ================= */
.employee-identity {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  width: fit-content;
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
  letter-spacing: 0.5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.employee-identity:hover .avatar-modern {
  transform: scale(1.08);
}

.employee-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.emp-name {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
  transition: color 0.15s ease;
}

.employee-identity:hover .emp-name {
  color: #4f46e5;
}

.emp-sub-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dept-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #475569;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.view-balance-prompt {
  font-size: 11px;
  color: #6366f1;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.employee-identity:hover .view-balance-prompt {
  opacity: 1;
}

/* Leave Category Badge */
.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.category-badge.casual {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.category-badge.sick {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

.category-badge.pl {
  background: #eef2ff;
  color: #4338ca;
  border: 1px solid #c7d2fe;
}

.category-badge.halfday {
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
}

.category-badge.default {
  background: #faf5ff;
  color: #7e22ce;
  border: 1px solid #e9d5ff;
}

/* Schedule & Duration */
.schedule-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.date-icon {
  color: #6366f1;
  font-size: 13px;
}

.date-arrow {
  color: #94a3b8;
  margin: 0 2px;
}

.duration-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 6px;
  width: fit-content;
}

.duration-badge.half-day-duration {
  color: #c2410c;
  background: #fff7ed;
  border: 1px solid #ffedd5;
}

/* Reason & Document */
.reason-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 320px;
}

.reason-text {
  margin: 0;
  font-size: 13px;
  color: #475569;
  line-height: 1.4;
  cursor: pointer;
  transition: color 0.15s ease;
}

.reason-text:hover {
  color: #4f46e5;
  text-decoration: underline;
}

.attachment-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 3px 10px;
  border-radius: 8px;
  width: fit-content;
  cursor: pointer;
  transition: all 0.2s ease;
}

.attachment-pill:hover {
  background: #dbeafe;
  transform: translateY(-1px);
}

/* Status Pill */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.status-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.status-pill.pending {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}
.status-pill.pending .status-pulse-dot {
  background: #f59e0b;
}

.status-pill.approved {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}
.status-pill.approved .status-pulse-dot {
  background: #10b981;
}

.status-pill.rejected {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}
.status-pill.rejected .status-pulse-dot {
  background: #ef4444;
}

/* Action Buttons */
.action-buttons-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-approve {
  background: #10b981;
  color: #ffffff;
  border-color: #059669;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.25);
}

.btn-approve:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.35);
}

.btn-reject {
  background: #ffffff;
  color: #dc2626;
  border-color: #fca5a5;
}

.btn-reject:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #ef4444;
  color: #b91c1c;
  transform: translateY(-1px);
}

.btn-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-loading {
  pointer-events: none;
}

/* Pagination / Load More */
.table-pagination-footer {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: #fafbfc;
  border-top: 1px solid #e2e8f0;
}

.btn-load-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 10px 24px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.btn-load-more:hover {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(15, 23, 42, 0.15);
}

/* Empty State Modern */
.empty-state-modern {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin-bottom: 16px;
}

.empty-state-modern h3 {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.empty-state-modern p {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #64748b;
  max-width: 400px;
}

.clear-empty-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #4f46e5;
  color: #ffffff;
  border: none;
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.clear-empty-btn:hover {
  background: #4338ca;
}

/* ================= MOBILE VIEW ================= */
.mobile-cards-wrapper {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-leave-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-left-width: 4px;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mobile-leave-card.border-pending { border-left-color: #f59e0b; }
.mobile-leave-card.border-approved { border-left-color: #10b981; }
.mobile-leave-card.border-rejected { border-left-color: #ef4444; }

.m-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.m-employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.avatar-mobile {
  width: 40px;
  height: 40px;
  font-size: 14px;
}

.m-emp-name {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.m-dept-tag {
  font-size: 11px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 6px;
}

.m-card-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  background: #f8fafc;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}

.m-detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.m-full-width {
  grid-column: span 2;
}

.m-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
}

.m-label i {
  margin-right: 4px;
}

.m-value {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.m-duration {
  font-size: 12px;
}

.m-reason {
  margin: 0;
  font-size: 13px;
  color: #334155;
  line-height: 1.4;
  cursor: pointer;
}

.m-card-actions {
  display: flex;
  gap: 10px;
}

.m-action-btn {
  flex: 1;
  justify-content: center;
  padding: 10px;
  font-size: 13px;
}

/* ================= MODALS & POPUPS ================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: fadeIn 0.25s ease;
}

.modal-card {
  background: #ffffff;
  border-radius: 24px;
  max-height: 90vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalSlideUp 0.25s ease;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.modal-balance { max-width: 680px; }
.modal-attachment { max-width: 600px; }
.modal-reason { max-width: 520px; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideUp {
  from { transform: translateY(20px) scale(0.98); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 28px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.modal-icon-tile {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #eef2ff;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.modal-icon-tile.icon-attachment {
  background: #eff6ff;
  color: #2563eb;
}

.modal-header-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.modal-subtitle {
  margin: 2px 0 0 0;
  font-size: 13px;
  color: #64748b;
}

.modal-close-btn {
  background: #f1f5f9;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: #fee2e2;
  color: #ef4444;
  transform: rotate(90deg);
}

.modal-body {
  padding: 28px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-employee-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 16px 20px;
  border-radius: 16px;
}

.modal-avatar {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.modal-emp-info h3 {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.modal-emp-tags {
  display: flex;
  gap: 8px;
}

.modal-tag-dept, .modal-tag-year {
  font-size: 12px;
  font-weight: 500;
  color: #475569;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 2px 10px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* Quota Progress Grid */
.balance-quota-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.quota-progress-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quota-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quota-icon-wrap {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.quota-casual .quota-icon-wrap { background: #ecfdf5; color: #059669; }
.quota-sick .quota-icon-wrap { background: #fffbeb; color: #d97706; }
.quota-privilege .quota-icon-wrap { background: #eef2ff; color: #4f46e5; }

.quota-title-wrap {
  display: flex;
  flex-direction: column;
}

.quota-type-name {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.quota-available {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

.quota-meter {
  height: 6px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.quota-meter-fill {
  height: 100%;
  border-radius: 10px;
  background: #6366f1;
}

.quota-casual .quota-meter-fill { background: #10b981; }
.quota-sick .quota-meter-fill { background: #f59e0b; }
.quota-privilege .quota-meter-fill { background: #6366f1; }

.quota-stats-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #64748b;
}

.quota-stats-row strong {
  color: #1e293b;
}

/* Summary Strip */
.balance-summary-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  background: #fafbfc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px;
}

.summary-chip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px;
}

.summary-chip-item i {
  font-size: 20px;
}

.chip-caption {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.chip-figure {
  display: block;
  font-size: 16px;
  font-weight: 800;
}

.text-emerald { color: #059669; }
.text-amber { color: #d97706; }
.text-indigo { color: #4f46e5; }
.font-bold { font-weight: 700; }

/* Breakdown Table */
.breakdown-table-wrap {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
}

.modal-breakdown-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.modal-breakdown-table th {
  background: #f8fafc;
  padding: 10px 16px;
  color: #64748b;
  font-weight: 600;
  font-size: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-breakdown-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.category-breakdown-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1e293b;
}

.category-breakdown-cell i {
  color: #6366f1;
}

.text-critical { color: #dc2626 !important; font-weight: 800; }
.text-warning { color: #d97706 !important; font-weight: 800; }
.text-good { color: #059669 !important; font-weight: 800; }

.modal-status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
}

.quota-available { background: #ecfdf5; color: #047857; }
.quota-low { background: #fffbeb; color: #b45309; }
.quota-exhausted { background: #fef2f2; color: #b91c1c; }
.quota-na { background: #f1f5f9; color: #64748b; }

.unpaid-warning-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #c2410c;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
}

.modal-footer {
  padding: 16px 28px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-primary-btn {
  background: #0f172a;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.modal-primary-btn:hover {
  background: #1e293b;
}

.modal-secondary-btn {
  background: #ffffff;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-secondary-btn:hover {
  background: #f1f5f9;
}

.modal-download-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #2563eb;
  color: #ffffff;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  transition: background 0.2s ease;
}

.modal-download-btn:hover {
  background: #1d4ed8;
}

.attachment-preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  padding: 20px;
  min-height: 240px;
}

.attachment-img-preview {
  max-width: 100%;
  max-height: 480px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  object-fit: contain;
}

.generic-file-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.file-type-icon {
  font-size: 54px;
  color: #ef4444;
}

.reason-full-box {
  background: #f8fafc;
  border-left: 4px solid #6366f1;
  border-radius: 8px;
  padding: 18px;
}

.reason-full-box p {
  margin: 0;
  font-size: 15px;
  color: #1e293b;
  line-height: 1.6;
}

.reason-meta-strip {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #64748b;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 10px 14px;
  border-radius: 10px;
}

/* Loading Spinners */
.loading-state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.modern-spinner {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border: 4px solid #e2e8f0;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-icon {
  font-size: 22px;
  color: #4f46e5;
}

.modal-loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #64748b;
}

.modal-loading-wrap .spinner-ring {
  position: relative;
  width: 24px;
  height: 24px;
  border-width: 3px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ================= RESPONSIVENESS ================= */
@media (max-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .balance-quota-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .main-content {
    padding: 12px;
    gap: 12px;
  }
  .content {
    padding: 16px;
    border-radius: 20px;
  }
  .executive-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  .metrics-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .metric-card {
    padding: 14px;
  }
  .metric-number {
    font-size: 24px;
  }
  .toolbar-card {
    padding: 12px;
  }
  .toolbar-left {
    min-width: 100%;
  }
  .toolbar-right {
    width: 100%;
    justify-content: space-between;
  }
  .status-chips-group {
    overflow-x: auto;
    width: 100%;
  }
  .balance-summary-strip {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  .m-card-body {
    grid-template-columns: 1fr;
  }
  .m-detail-item {
    grid-column: span 1 !important;
  }
}

.desktop-only {
  display: inline;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
}
</style>