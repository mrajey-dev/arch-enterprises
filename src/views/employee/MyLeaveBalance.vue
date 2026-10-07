  <template>
    <div class="layout">

      <!-- Main Content -->
      <div class="main-content">
        <Sidebar v-if="!isMobile || isSidebarVisible" />

        <div class="kra-board-premium" v-if="!isMobile || !isSidebarVisible">
          <!-- Mobile Header -->
          <div class="mobile-header" v-if="isMobile">
          
            <div class="mobile-title">
              <i class="fas fa-umbrella-beach"></i>
              <span>Leave Balance</span>
            </div>
            <div class="mobile-stats-badge">
              <span>{{ totalRemaining }}</span>
            </div>
          </div>

          <!-- Desktop Header -->
          <div class="content-header-modern" v-else>
            <div class="header-left desktop-only">
              <div class="title-icon">
                <i class="fas fa-umbrella-beach"></i>
              </div>
              <div>
                <h1>My Leave Balance</h1>
                <p class="subtitle-modern">Remaining & Total Leave Quota (Financial Year)</p>
              </div>
            </div>
            <div class="stats-badge-header">
              <i class="fas fa-calendar-alt"></i>
              <span>{{ getFinancialYearRange() }}</span>
            </div>
          </div>

          <!-- Summary Cards - Mobile Optimized -->
          <div class="stats-bar">
            <div class="stat-card" v-for="(value, type) in leaveSummary" :key="type">
              <i :class="getLeaveIcon(type)"></i>
              <div class="stat-info">
                <span class="stat-value">{{ value.remaining }}</span>
                <span class="stat-label">{{ formatLeaveType(type) }}</span>
                <span class="stat-sub">Total: {{ value.total }}</span>
              </div>
            </div>
          </div>

          <!-- Total Summary Card - Mobile Optimized -->
          <div class="total-summary-card">
            <div class="total-summary-content">
              <div class="total-item" @click="scrollToSection('remaining')">
                <i class="fas fa-calendar-check"></i>
                <div>
                  <span class="total-label">Remaining</span>
                  <span class="total-value">{{ totalRemaining }}</span>
                </div>
              </div>
              <div class="total-item" @click="scrollToSection('used')">
                <i class="fas fa-check-circle"></i>
                <div>
                  <span class="total-label">Used</span>
                  <span class="total-value">{{ totalUsed }}</span>
                </div>
              </div>
              <div class="total-item" @click="scrollToSection('allocated')">
                <i class="fas fa-chart-bar"></i>
                <div>
                  <span class="total-label">Allocated</span>
                  <span class="total-value">{{ totalAllocated }}</span>
                </div>
              </div>
              <div class="total-item" @click="scrollToSection('unpaid')">
                <i class="fas fa-hourglass-half"></i>
                <div>
                  <span class="total-label">Unpaid</span>
                  <span class="total-value">{{ unpaidLeaveDays }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Late Marks Summary Card -->
        <!-- Late Marks Summary Card -->
  <div class="late-marks-summary-card" :class="{ 'mobile-card': isMobile }">
    <div class="late-marks-header" @click="toggleLateMarksDetails">
      <div class="header-left-late">
        <i class="fas fa-clock"></i>
        <h4>Late Marks (Current Month)</h4>
        <span class="late-count-badge" :class="{ 'has-penalty': totalPenaltiesApplied > 0 }">
          {{ totalLateMarks }}
        </span>
      </div>
      <div class="header-right-late">
        <span v-if="totalPenaltiesApplied > 0" class="penalty-badge">
          <i class="fas fa-exclamation-triangle"></i> 
          {{ totalPenaltiesApplied }} Penalty(ies) This Month
        </span>
        <i class="fas fa-chevron-down" :class="{ 'rotated': lateMarksVisible }"></i>
      </div>
    </div>
    
    <div class="late-marks-body" :class="{ 'late-marks-hidden': !lateMarksVisible }">
      <!-- Late Marks Summary Stats -->
      <div class="late-marks-stats">
        <div class="stat-item">
          <span class="stat-label">Current Month Late Marks</span>
          <span class="stat-value" :class="{ 'warning': totalLateMarks >= penaltyThreshold }">
            {{ totalLateMarks }}
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Monthly Threshold</span>
          <span class="stat-value">{{ penaltyThreshold }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Penalties Calculated</span>
          <span class="stat-value">{{ penaltiesCalculated }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Penalties Applied</span>
          <span class="stat-value" :class="{ 'penalty-applied': totalPenaltiesApplied > 0 }">
            {{ totalPenaltiesApplied }}
          </span>
        </div>
        <div class="stat-item" v-if="pendingPenalties > 0">
          <span class="stat-label">Pending Penalties</span>
          <span class="stat-value warning">{{ pendingPenalties }}</span>
        </div>
        <div class="stat-item" v-if="totalPenaltyAmount > 0">
          <span class="stat-label">Total Deduction</span>
          <span class="stat-value penalty-amount">
            {{ totalPenaltyAmount }} CL ({{ getFullDaysDeduction() }})
          </span>
        </div>
      </div>

      <!-- Penalty Info Message -->
      <div class="penalty-info-box">
        <i class="fas fa-info-circle"></i>
        <span>
          <strong>Rule:</strong> In current month, every {{ penaltyThreshold }} late marks = 1 half-day deduction (0.5 day). <em>Refreshed every month.</em>
          <span v-if="totalLateMarks >= penaltyThreshold">
            <br>
            <strong>Your {{ totalLateMarks }} late marks this month</strong> = {{ penaltiesCalculated }} half day(s) deducted from leave balance.
          </span>
        </span>
      </div>

      <!-- Late Marks Table -->
      <div v-if="lateMarks.length > 0" class="late-marks-table-container">
        <div class="section-title-modern small">
          <i class="fas fa-list"></i>
          <span>Late Marks Details ({{ lateMarks.length }})</span>
        </div>
        
        <!-- Mobile Card View -->
        <div class="mobile-late-cards" v-if="isMobile">
          <div v-for="(mark, index) in lateMarks" :key="index" class="late-mark-card">
            <div class="late-mark-header">
              <span class="late-date">{{ formatDate(mark.date) }}</span>
              <span class="late-time">{{ mark.clock_in }}</span>
            </div>
            <div class="late-mark-body">
              <span class="late-status">{{ mark.status }}</span>
              <span class="late-number">#{{ index + 1 }}</span>
            </div>
          </div>
        </div>

        <!-- Desktop Table View -->
        <table class="late-marks-table" v-else>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Clock In</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(mark, index) in lateMarks" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ formatDate(mark.date) }}</td>
              <td>{{ mark.clock_in }}</td>
              <td>
                <span class="status-badge late">{{ mark.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- No late marks message -->
      <div v-if="lateMarks.length === 0" class="no-late-marks">
        <i class="fas fa-check-circle"></i>
        <span>No late marks this month. Great job! 👏</span>
      </div>

      <!-- Monthly Late Marks Summary -->
      <div v-if="monthlyLateSummary.length > 0" class="monthly-late-summary">
        <div class="section-title-modern small">
          <i class="fas fa-calendar-alt"></i>
          <span>Monthly Late Marks Summary</span>
        </div>
        <div class="monthly-summary-grid" :class="{ 'mobile-grid': isMobile }">
          <div v-for="(item, index) in monthlyLateSummary" :key="index" 
              class="monthly-summary-item"
              :class="{ 
                'has-penalty': item.penalties_applied > 0,
                'pending-penalty': item.pending_penalties > 0
              }">
            <span class="month-name">{{ item.month_name }}</span>
            <span class="month-count">{{ item.late_count }}</span>
            <span v-if="item.penalties_applied > 0" class="penalty-indicator" :title="`${item.penalties_applied} penalties applied (${item.penalty_amount} CL)`">
              <i class="fas fa-check-circle"></i> {{ item.penalties_applied }}
            </span>
            <span v-if="item.pending_penalties > 0" class="pending-indicator" :title="`${item.pending_penalties} penalties pending`">
              <i class="fas fa-clock"></i> {{ item.pending_penalties }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

          <!-- Half Day Info Card - Mobile Optimized -->
          <div v-if="halfDayLeaves.length" class="halfday-info-card" :class="{ 'mobile-card': isMobile }">
            <div class="halfday-info-header" @click="toggleHalfDayDetails">
              <div class="header-left-half">
                <i class="fas fa-sun"></i>
                <h4>Half Day Leaves</h4>
              </div>
              <i class="fas fa-chevron-down" :class="{ 'rotated': halfDayVisible }"></i>
            </div>
            <div class="halfday-info-body" :class="{ 'halfday-hidden': !halfDayVisible }">
              <div class="halfday-detail">
                <span class="label">Total Half Days Taken:</span>
                <span class="value">{{ halfDayLeaves.length }} half day(s)</span>
              </div>
              <div class="halfday-detail">
                <span class="label">Converted to Full Days:</span>
                <span class="value">{{ Math.floor(halfDayLeaves.length / 2) }} day(s)</span>
              </div>
              <div class="halfday-detail">
                <span class="label">Remaining Half Days:</span>
                <span class="value">{{ halfDayLeaves.length % 2 }} half day(s)</span>
              </div>
              <div class="halfday-note">
                <i class="fas fa-info-circle"></i>
                <span>Note: 2 half days = 1 full casual leave</span>
              </div>
            </div>
          </div>

          <!-- Dedicated Separate Section: Late Mark Penalty Leave Deductions -->
          <div class="late-penalty-leaves-section" :class="{ 'mobile-card': isMobile }">
            <div class="section-title-modern section-title-clickable" @click="toggleLatePenaltySection">
              <div class="title-left">
                <div class="title-icon-badge">
                  <i class="fas fa-user-clock"></i>
                </div>
                <div>
                  <span class="section-heading">Late Mark Leave Deductions (Current Month)</span>
                  <span class="section-subheading">Rule: 3 Late Marks in a Month = 1 Half Day Leave (0.5 Day) • Refreshed Monthly</span>
                </div>
                <span class="count-badge count-badge-penalty" v-if="latePenaltyRecords.length > 0">
                  {{ latePenaltyRecords.length }} Half Day(s) This Month
                </span>
                <span class="count-badge count-badge-zero" v-else>
                  0 Penalties
                </span>
              </div>
              <i class="fas fa-chevron-down" :class="{ 'rotated': latePenaltySectionVisible }"></i>
            </div>

            <div class="late-penalty-content" :class="{ 'list-hidden': !latePenaltySectionVisible }">
              <!-- Policy Highlights Bar -->
              <div class="late-penalty-highlights">
                <!-- Stat 1: Total Late Marks -->
                <div class="penalty-highlight-card">
                  <div class="highlight-icon icon-clock">
                    <i class="fas fa-clock"></i>
                  </div>
                  <div class="highlight-info">
                    <span class="highlight-num">{{ totalLateMarks }}</span>
                    <span class="highlight-label">Current Month Late Marks</span>
                    <span class="highlight-sub">Refreshed every month (Threshold: 3)</span>
                  </div>
                </div>

                <!-- Stat 2: Casual Leave Half Days -->
                <div class="penalty-highlight-card" :class="{ 'highlight-active-casual': latePenaltyClDeducted > 0 }">
                  <div class="highlight-icon icon-cl">
                    <i class="fas fa-calendar-minus"></i>
                  </div>
                  <div class="highlight-info">
                    <span class="highlight-num">{{ latePenaltyClDeducted }} Day(s)</span>
                    <span class="highlight-label">Added to Used Casual Leave</span>
                    <span class="highlight-sub">{{ latePenaltyClDeducted * 2 }} Half Day(s) from CL</span>
                  </div>
                </div>

                <!-- Stat 3: Unpaid Half Days -->
                <div class="penalty-highlight-card" :class="{ 'highlight-active-unpaid': latePenaltyUnpaidDeducted > 0 }">
                  <div class="highlight-icon icon-unpaid">
                    <i class="fas fa-hourglass-half"></i>
                  </div>
                  <div class="highlight-info">
                    <span class="highlight-num">{{ latePenaltyUnpaidDeducted }} Day(s)</span>
                    <span class="highlight-label">Marked as Unpaid Half Day</span>
                    <span class="highlight-sub">When Casual Leaves are 0</span>
                  </div>
                </div>
              </div>

              <!-- Active Policy Status Callout Banner -->
              <div class="policy-status-banner" :class="getPenaltyBannerClass()">
                <div class="banner-icon">
                  <i :class="getPenaltyBannerIcon()"></i>
                </div>
                <div class="banner-text">
                  <template v-if="latePenaltyUnpaidDeducted > 0 && latePenaltyClDeducted > 0">
                    <strong>Casual & Unpaid Penalties Active:</strong> {{ latePenaltyClDeducted }} day(s) deducted from Casual Leave, and {{ latePenaltyUnpaidDeducted }} day(s) marked as Unpaid Half Day because your casual leave balance was exhausted.
                  </template>
                  <template v-else-if="latePenaltyUnpaidDeducted > 0">
                    <strong>Casual Leaves Exhausted:</strong> No casual leaves remaining! {{ latePenaltyUnpaidDeducted }} day(s) ({{ latePenaltyUnpaidDeducted * 2 }} half days) has been marked in your <strong>Unpaid Leave</strong> column.
                  </template>
                  <template v-else-if="latePenaltyClDeducted > 0">
                    <strong>Deducted from Casual Leave:</strong> {{ latePenaltyClDeducted }} day(s) ({{ latePenaltyClDeducted * 2 }} half day(s)) has been automatically added to your <strong>Used Casual Leave</strong> column.
                  </template>
                  <template v-else-if="totalLateMarks > 0">
                    <strong>Within Quota:</strong> You have {{ totalLateMarks }} late mark(s). Once you reach {{ penaltyThreshold }} late marks, 1 half-day leave will be deducted from your casual leave (or marked unpaid if casual leave is 0).
                  </template>
                  <template v-else>
                    <strong>No Late Marks:</strong> You currently have 0 late marks for this period. Great punctuality!
                  </template>
                </div>
              </div>

              <!-- Penalty Records Table (Desktop) / Cards (Mobile) -->
              <div v-if="latePenaltyRecords.length > 0" class="penalty-records-wrap">
                <div class="penalty-records-title">
                  <i class="fas fa-history"></i>
                  <span>Breakdown of Applied Half-Day Deductions ({{ latePenaltyRecords.length }})</span>
                </div>

                <!-- Mobile Cards -->
                <div class="mobile-penalty-cards" v-if="isMobile">
                  <div v-for="(item, idx) in latePenaltyRecords" :key="idx" class="penalty-record-card" :class="item.type === 'unpaid' ? 'card-unpaid' : 'card-casual'">
                    <div class="card-p-header">
                      <span class="p-badge" :class="item.type === 'unpaid' ? 'badge-unpaid' : 'badge-casual'">
                        <i :class="item.type === 'unpaid' ? 'fas fa-hourglass-half' : 'fas fa-calendar-minus'"></i>
                        {{ item.title }}
                      </span>
                      <span class="p-duration">{{ item.duration }} Day</span>
                    </div>
                    <div class="card-p-body">
                      <div class="p-row">
                        <span class="p-lbl">Trigger</span>
                        <span class="p-val">{{ item.late_mark_trigger }}th Late Mark</span>
                      </div>
                      <div class="p-row" v-if="item.trigger_date">
                        <span class="p-lbl">Date</span>
                        <span class="p-val">{{ formatDate(item.trigger_date) }}</span>
                      </div>
                      <div class="p-row">
                        <span class="p-lbl">Deduction Column</span>
                        <span class="p-val column-target" :class="item.type === 'unpaid' ? 'target-unpaid' : 'target-casual'">
                          {{ item.type === 'unpaid' ? 'Unpaid Leave Column' : 'Used Casual Leave Column' }}
                        </span>
                      </div>
                      <div class="p-row">
                        <span class="p-lbl">Status</span>
                        <span class="p-status-pill" :class="item.type === 'unpaid' ? 'status-pill-unpaid' : 'status-pill-casual'">
                          {{ item.status }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Desktop Table -->
                <div class="desktop-penalty-table-wrap" v-else>
                  <table class="penalty-records-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Trigger Event</th>
                        <th>Date / Time</th>
                        <th>Leave Deducted</th>
                        <th>Applied Column</th>
                        <th>Deduction Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, idx) in latePenaltyRecords" :key="idx" :class="item.type === 'unpaid' ? 'row-p-unpaid' : 'row-p-casual'">
                        <td class="col-index">{{ idx + 1 }}</td>
                        <td class="col-trigger">
                          <span class="trigger-chip">
                            <i class="fas fa-stopwatch"></i> {{ item.late_mark_trigger }}th Late Mark
                          </span>
                        </td>
                        <td class="col-date">
                          <span v-if="item.trigger_date">{{ formatDate(item.trigger_date) }}</span>
                          <span v-else class="text-muted">Accumulated</span>
                          <span v-if="item.clock_in" class="clock-in-hint">({{ item.clock_in }})</span>
                        </td>
                        <td class="col-leave">
                          <span class="leave-type-pill" :class="item.type === 'unpaid' ? 'pill-unpaid' : 'pill-casual'">
                            <i :class="item.type === 'unpaid' ? 'fas fa-hourglass-half' : 'fas fa-calendar-minus'"></i>
                            {{ item.title }} ({{ item.duration }} Day)
                          </span>
                        </td>
                        <td class="col-column">
                          <span class="column-name-tag" :class="item.type === 'unpaid' ? 'col-tag-unpaid' : 'col-tag-casual'">
                            <i :class="item.type === 'unpaid' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'"></i>
                            {{ item.type === 'unpaid' ? 'Unpaid Leave' : 'Used Casual Leave' }}
                          </span>
                        </td>
                        <td class="col-status">
                          <span class="status-badge-applied" :class="item.type === 'unpaid' ? 'badge-applied-unpaid' : 'badge-applied-casual'">
                            {{ item.status }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Empty state for penalties -->
              <div v-else class="empty-penalties-state">
                <i class="fas fa-smile"></i>
                <span>No late mark leave penalties applied. You have {{ totalLateMarks }} late mark(s) (threshold is 3).</span>
              </div>
            </div>
          </div>

          <!-- Leave Details Table - Mobile Optimized -->
          <div class="kras-section">
            <div class="section-title-modern">
              <i class="fas fa-list-ul"></i>
              <span>Leave Breakdown</span>
            </div>

            <div v-if="leaveDetails.length" class="leave-table-container">
              <!-- Mobile Card View -->
              <div class="mobile-leave-cards" v-if="isMobile">
                <div v-for="(item, index) in leaveDetails" :key="index" class="leave-detail-card">
                  <div class="card-header">
                    <div class="leave-type-cell">
                      <i :class="getLeaveIcon(item.type)"></i>
                      <span>{{ formatLeaveType(item.type) }}</span>
                    </div>
                    <span class="status-badge" :class="getStatusClass(item.remaining, item.total)">
                      {{ getStatusText(item.remaining, item.total) }}
                    </span>
                  </div>
                  <div class="card-body">
                    <div class="card-row">
                      <span class="card-label">Total</span>
                      <span class="card-value">{{ item.total }}</span>
                    </div>
                    <div class="card-row">
                      <span class="card-label">Used</span>
                      <span class="card-value">{{ item.used }}</span>
                    </div>
                    <div class="card-row">
                      <span class="card-label">Remaining</span>
                      <span class="card-value" :class="getRemainingClass(item.remaining)">{{ item.remaining }}</span>
                    </div>
                    <div class="progress-bar-bg">
                      <div class="progress-bar-fill" 
                          :style="{ width: getUsagePercentage(item.used, item.total) + '%' }"
                          :class="getProgressClass(item.remaining, item.total)">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Desktop Table View -->
              <table class="leave-table" v-else>
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Total Days</th>
                    <th>Used Days</th>
                    <th>Remaining Days</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in leaveDetails" :key="index">
                    <td class="leave-type-cell">
                      <i :class="getLeaveIcon(item.type)"></i>
                      <span>{{ formatLeaveType(item.type) }}</span>
                    </td>
                    <td class="total-cell">{{ item.total }}</td>
                    <td class="used-cell">{{ item.used }}</td>
                    <td class="remaining-cell" :class="getRemainingClass(item.remaining)">
                      <strong>{{ item.remaining }}</strong>
                    </td>
                    <td>
                      <span class="status-badge" :class="getStatusClass(item.remaining, item.total)">
                        {{ getStatusText(item.remaining, item.total) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Half Day Leave Requests List - Mobile Optimized -->
          <div class="halfday-leaves-section" v-if="halfDayLeaves.length">
            <div class="section-title-modern" @click="toggleHalfDayList">
              <div class="title-left">
                <i class="fas fa-sun"></i>
                <span>Half Day Requests</span>
                <span class="count-badge">{{ halfDayLeaves.length }}</span>
              </div>
              <i class="fas fa-chevron-down" :class="{ 'rotated': halfDayListVisible }"></i>
            </div>
            <div class="halfday-leaves-container" :class="{ 'list-hidden': !halfDayListVisible }">
              <div v-for="(leave, index) in halfDayLeaves" :key="index" class="halfday-leave-card" :class="{ 'mobile-item': isMobile }">
                <div class="leave-header">
                  <i class="fas fa-sun"></i>
                  <span class="leave-type">Half Day</span>
                  <span class="leave-dates">{{ formatDate(leave.fromDate) }}</span>
                </div>
                <div class="leave-body">
                  <div class="leave-duration">
                    <i class="fas fa-clock"></i>
                    <span>0.5 day (Casual Leave)</span>
                  </div>
                  <div class="leave-reason" v-if="leave.reason">
                    <i class="fas fa-comment"></i>
                    <span>{{ truncateText(leave.reason, isMobile ? 30 : 50) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Approved Leave Requests List - Mobile Optimized -->
          <div class="approved-leaves-section" v-if="approvedLeaves.length">
            <div class="section-title-modern" @click="toggleApprovedList">
              <div class="title-left">
                <i class="fas fa-check-circle"></i>
                <span>Approved Leaves</span>
                <span class="count-badge">{{ approvedLeaves.length }}</span>
              </div>
              <i class="fas fa-chevron-down" :class="{ 'rotated': approvedListVisible }"></i>
            </div>
            <div class="approved-leaves-container" :class="{ 'list-hidden': !approvedListVisible }">
              <div v-for="(leave, index) in approvedLeaves" :key="index" class="approved-leave-card" :class="{ 'mobile-item': isMobile }">
                <div class="leave-header">
                  <i :class="getLeaveIcon(leave.leaveType)"></i>
                  <span class="leave-type">{{ formatLeaveType(leave.leaveType) }}</span>
                  <span class="leave-dates">{{ formatDate(leave.fromDate) }} - {{ formatDate(leave.toDate) }}</span>
                </div>
                <div class="leave-body">
                  <div class="leave-duration">
                    <i class="fas fa-clock"></i>
                    <span>{{ leave.duration }} day(s)</span>
                  </div>
                  <div class="leave-reason" v-if="leave.reason">
                    <i class="fas fa-comment"></i>
                    <span>{{ truncateText(leave.reason, isMobile ? 30 : 50) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Unpaid Leave Records - Mobile Optimized -->
          <div class="unpaid-leaves-section" v-if="unpaidAttendanceRecords.length">
            <div class="section-title-modern" @click="toggleUnpaidList">
              <div class="title-left">
                <i class="fas fa-hourglass-half"></i>
                <span>Unpaid Leave Records</span>
                <span class="count-badge">{{ unpaidAttendanceRecords.length }}</span>
              </div>
              <i class="fas fa-chevron-down" :class="{ 'rotated': unpaidListVisible }"></i>
            </div>
            <div class="unpaid-leaves-container" :class="{ 'list-hidden': !unpaidListVisible }">
              <div v-for="(record, index) in unpaidAttendanceRecords" :key="index" class="unpaid-leave-card" :class="{ 'mobile-item': isMobile }">
                <div class="leave-header">
                  <i class="fas fa-user-clock"></i>
                  <span class="leave-type">Unpaid Leave (Absent)</span>
                  <span class="leave-dates">{{ formatDate(record.date) }}</span>
                </div>
                <div class="leave-body">
                  <div class="leave-duration">
                    <i class="fas fa-clock"></i>
                    <span>1 day</span>
                  </div>
                  <div class="leave-reason">
                    <i class="fas fa-info-circle"></i>
                    <span>Marked as Absent in attendance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Leave Usage Progress Bars - Mobile Optimized -->
          <div class="progress-section" v-if="leaveDetails.length">
            <div class="section-title-modern">
              <i class="fas fa-chart-line"></i>
              <span>Leave Usage Overview</span>
            </div>
            <div class="progress-bars">
              <div v-for="(item, index) in leaveDetails" :key="index" class="progress-item">
                <div class="progress-header">
                  <span class="progress-label">{{ formatLeaveType(item.type) }}</span>
                  <span class="progress-stats">{{ item.used }} / {{ item.total }} ({{ getUsagePercentage(item.used, item.total) }}%)</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" 
                      :style="{ width: getUsagePercentage(item.used, item.total) + '%' }"
                      :class="getProgressClass(item.remaining, item.total)">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Year Selector - Mobile Optimized -->
          <div class="leave-footer" :class="{ 'mobile-footer': isMobile }">
            <div class="year-selector">
              <label><i class="fas fa-calendar-week"></i> Financial Year:</label>
              <select v-model="selectedFinancialYear" @change="fetchLeaveBalance">
                <option v-for="year in availableYears" :key="year" :value="year">{{ year }} - {{ year + 1 }}</option>
              </select>
            </div>
            <div class="footer-note">
              <i class="fas fa-info-circle"></i>
              <span>FY: Apr - Mar</span>
            </div>
          </div>

          <!-- Empty State - Mobile Optimized -->
          <div v-if="!leaveDetails.length && !loading && !approvedLeaves.length && !unpaidAttendanceRecords.length && !halfDayLeaves.length" class="empty-state-premium" :class="{ 'empty-mobile': isMobile }">
            <i class="fas fa-calendar-times"></i>
            <h4>No Leave Data Found</h4>
            <p>No leave requests or absent records found</p>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading leave balance...</span>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script>
  import Sidebar from './components/Sidebar.vue'
  import axios from 'axios'
  import {
    toastSuccess,
    toastError,
  } from "@/utils/toast.js";

  export default {
    name: "LeaveBalance",
    components: {
      Sidebar
    },
    data() {
      return {
        username: '',
        userId: null,
        isMobile: false,
        isSidebarVisible: true,
        loading: false,
        selectedFinancialYear: new Date().getFullYear(),
        availableYears: [],
        approvedLeaves: [],
        halfDayLeaves: [],
        unpaidAttendanceRecords: [],
        leaveDetails: [],
        leaveAllocations: {
          casual: 0,
          sick: 0,
          privilege: 0,
          unpaid: 0
        },
        leaveUsed: {
          casual: 0,
          sick: 0,
          privilege: 0,
          unpaid: 0
        },
        leaveRemaining: {
          casual: 0,
          sick: 0,
          privilege: 0,
          unpaid: 0
        },
        unpaidLeaveDays: 0,
        holidayWorkCredits: 0,
        halfDayVisible: true,
        halfDayListVisible: false,
        approvedListVisible: false,
        unpaidListVisible: false,
        // Late marks data
        lateMarks: [],
      monthlyLateSummary: [],
      totalLateMarks: 0,
      totalPenaltiesApplied: 0,
      totalPenaltyAmount: 0,
      penaltiesCalculated: 0,
      pendingPenalties: 0,
      hasLatePenalty: false,
      lateMarksVisible: true,
      lateMarksLoading: false,
      penaltyPerUnit: 0.5,
      penaltyThreshold: 3,
      // Dedicated Late Mark Penalties Section Data
      latePenaltySectionVisible: true,
      latePenaltyRecords: [],
      latePenaltyClDeducted: 0,
      latePenaltyUnpaidDeducted: 0
      }
    },
    computed: {
      leaveSummary() {
        return {
          casual: { 
            remaining: this.leaveRemaining.casual, 
            total: this.leaveAllocations.casual,
            used: this.leaveUsed.casual
          },
          sick: { 
            remaining: this.leaveRemaining.sick, 
            total: this.leaveAllocations.sick,
            used: this.leaveUsed.sick
          },
          privilege: { 
            remaining: this.leaveRemaining.privilege, 
            total: this.leaveAllocations.privilege,
            used: this.leaveUsed.privilege
          }
        };
      },
      totalRemaining() {
        return (
          (parseFloat(this.leaveRemaining.casual) || 0) +
          (parseFloat(this.leaveRemaining.sick) || 0) +
          (parseFloat(this.leaveRemaining.privilege) || 0)
        );
      },
      totalUsed() {
        return (
          (parseFloat(this.leaveUsed.casual) || 0) +
          (parseFloat(this.leaveUsed.sick) || 0) +
          (parseFloat(this.leaveUsed.privilege) || 0)
        );
      },
      totalAllocated() {
        return (
          (parseFloat(this.leaveAllocations.casual) || 0) +
          (parseFloat(this.leaveAllocations.sick) || 0) +
          (parseFloat(this.leaveAllocations.privilege) || 0)
        );
      },
      getFullDaysDeduction() {
      return function() {
        if (this.totalPenaltyAmount === 0) return '0 days';
        const fullDays = Math.floor(this.totalPenaltyAmount / 0.5);
        const remainingHalf = this.totalPenaltyAmount % 0.5;
        
        if (remainingHalf === 0) {
          return `${fullDays} full day(s)`;
        } else {
          return `${fullDays} full day(s) + ${remainingHalf} half day`;
        }
      };
    }
    
    },
    mounted() {
      this.checkIfMobile();
      window.addEventListener('resize', this.checkIfMobile);
      this.initFinancialYears();
      this.validateAuth();
      this.getUserInfo();
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.checkIfMobile);
    },
    methods: {
      truncateText(text, length) {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
      },
      toggleLateMarksDetails() {
        if (this.isMobile) {
          this.lateMarksVisible = !this.lateMarksVisible;
        }
      },
      toggleHalfDayDetails() {
        if (this.isMobile) {
          this.halfDayVisible = !this.halfDayVisible;
        }
      },
      toggleHalfDayList() {
        if (this.isMobile) {
          this.halfDayListVisible = !this.halfDayListVisible;
        }
      },
      toggleApprovedList() {
        if (this.isMobile) {
          this.approvedListVisible = !this.approvedListVisible;
        }
      },
      toggleUnpaidList() {
        if (this.isMobile) {
          this.unpaidListVisible = !this.unpaidListVisible;
        }
      },
      toggleLatePenaltySection() {
        this.latePenaltySectionVisible = !this.latePenaltySectionVisible;
      },
      getPenaltyBannerClass() {
        if (this.latePenaltyUnpaidDeducted > 0) return 'banner-unpaid';
        if (this.latePenaltyClDeducted > 0) return 'banner-casual';
        if (this.totalLateMarks > 0) return 'banner-warning';
        return 'banner-neutral';
      },
      getPenaltyBannerIcon() {
        if (this.latePenaltyUnpaidDeducted > 0) return 'fas fa-exclamation-triangle';
        if (this.latePenaltyClDeducted > 0) return 'fas fa-calendar-minus';
        if (this.totalLateMarks > 0) return 'fas fa-info-circle';
        return 'fas fa-check-circle';
      },
      generatePenaltyRecordsFallback() {
        const records = [];
        const count = this.penaltiesCalculated;
        let availCL = Math.max(0, (this.leaveAllocations.casual || 7) - ((this.leaveUsed.casual || 0) - (this.latePenaltyClDeducted || 0)));
        let clDeducted = 0;
        let unpaidDeducted = 0;

        for (let i = 1; i <= count; i++) {
          const triggerIndex = (i * 3) - 1;
          const triggerItem = this.lateMarks[triggerIndex] || null;
          const triggerDate = triggerItem ? triggerItem.date : null;
          const triggerClockIn = triggerItem ? triggerItem.clock_in : null;

          if (availCL >= 0.5) {
            clDeducted += 0.5;
            availCL -= 0.5;
            records.push({
              penalty_number: i,
              late_mark_trigger: i * 3,
              trigger_date: triggerDate,
              clock_in: triggerClockIn,
              duration: 0.5,
              type: 'casual',
              deducted_column: 'used_cl_leave',
              title: 'Half Day Casual Leave',
              description: `3 Late Marks Penalty` + (triggerDate ? ` (Triggered on ${this.formatDate(triggerDate)})` : ''),
              status: 'Deducted from Casual Leave'
            });
          } else if (availCL > 0) {
            const clPart = availCL;
            const unpaidPart = 0.5 - clPart;
            clDeducted += clPart;
            unpaidDeducted += unpaidPart;
            availCL = 0;
            records.push({
              penalty_number: i,
              late_mark_trigger: i * 3,
              trigger_date: triggerDate,
              clock_in: triggerClockIn,
              duration: 0.5,
              type: 'unpaid',
              deducted_column: 'used_unpaid_leave',
              title: 'Unpaid Half Day Leave',
              description: `3 Late Marks Penalty (${clPart} CL + ${unpaidPart} Unpaid - CL Exhausted)`,
              status: 'Marked as Unpaid Half Day'
            });
          } else {
            unpaidDeducted += 0.5;
            records.push({
              penalty_number: i,
              late_mark_trigger: i * 3,
              trigger_date: triggerDate,
              clock_in: triggerClockIn,
              duration: 0.5,
              type: 'unpaid',
              deducted_column: 'used_unpaid_leave',
              title: 'Unpaid Half Day Leave',
              description: `3 Late Marks Penalty (Casual Leave Quota Exhausted)`,
              status: 'Marked as Unpaid Half Day'
            });
          }
        }

        this.latePenaltyRecords = records;
        if (!this.latePenaltyClDeducted) this.latePenaltyClDeducted = clDeducted;
        if (!this.latePenaltyUnpaidDeducted) this.latePenaltyUnpaidDeducted = unpaidDeducted;
      },
      scrollToSection(section) {
        const element = document.querySelector(`.${section}-section`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      },
      checkIfMobile() {
        this.isMobile = window.innerWidth <= 768;
        this.isSidebarVisible = !this.isMobile;
        if (this.isMobile) {
          this.halfDayVisible = false;
          this.halfDayListVisible = false;
          this.approvedListVisible = false;
          this.unpaidListVisible = false;
          this.lateMarksVisible = false;
          this.latePenaltySectionVisible = false;
        } else {
          this.halfDayVisible = true;
          this.halfDayListVisible = true;
          this.approvedListVisible = true;
          this.unpaidListVisible = true;
          this.lateMarksVisible = true;
          this.latePenaltySectionVisible = true;
        }
      },
      toggleSidebar() {
        this.isSidebarVisible = !this.isSidebarVisible;
      },
      validateAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
          this.$router.push('/auth');
        }
      },
      getUserInfo() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.name) {
          this.username = user.name;
          this.userId = user.id;
          this.fetchLeaveBalance();
          this.fetchLateMarks();
        } else {
          toastError('User information not found');
        }
      },
      initFinancialYears() {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        let startYear;
        if (currentMonth >= 3) {
          startYear = currentYear;
        } else {
          startYear = currentYear - 1;
        }
        this.availableYears = [startYear - 1, startYear, startYear + 1];
        this.selectedFinancialYear = startYear;
      },
      getFinancialYearRange() {
        const startYear = this.selectedFinancialYear;
        const endYear = startYear + 1;
        return `Apr ${startYear} - Mar ${endYear}`;
      },
      getFinancialYearDates(year) {
        const startDate = `${year}-04-01`;
        const endDate = `${year + 1}-03-31`;
        return { startDate, endDate };
      },
      isDateInFinancialYear(date, financialYear) {
        if (!date) return false;
        const leaveDate = new Date(date);
        const financialYearStart = new Date(financialYear, 3, 1);
        const financialYearEnd = new Date(financialYear + 1, 2, 31);
        return leaveDate >= financialYearStart && leaveDate <= financialYearEnd;
      },
      calculateDaysBetweenDates(startDate, endDate, isHalfDay = false) {
        if (isHalfDay) {
          return 0.5;
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        return diffDays;
      },
      mapLeaveType(leaveType) {
        const typeMap = {
          'PL': 'privilege',
          'PL Leave': 'privilege',
          'Privilege': 'privilege',
          'Privilege Leave': 'privilege',
          'CL': 'casual',
          'Casual': 'casual',
          'Casual Leave': 'casual',
          'SL': 'sick',
          'Sick': 'sick',
          'Sick Leave': 'sick',
          'Medical': 'sick'
        };
        return typeMap[leaveType] || 'casual';
      },
 async fetchLateMarks() {
  if (!this.username) return;
  
  this.lateMarksLoading = true;
  
  try {
    const token = localStorage.getItem('token');
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Fetch attendance records for current month
    const response = await axios.get(
      `https://employees.archenterprises.co.in/api/api/attendance/late-marks`,
      {
        params: {
          name: this.username,
          month: currentMonth,
          year: currentYear
        },
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Late Marks Response:', response.data);
    
    if (response.data && response.data.success) {
      const data = response.data.data;
      
      // FILTER: Only include late marks where status is 'Present' or 'P'
      const allLateRecords = data.late_records || [];
      const filteredLateRecords = allLateRecords.filter(record => 
        record.status && (record.status.toLowerCase() === 'present' || record.status.toLowerCase() === 'p')
      );
      
      this.lateMarks = filteredLateRecords;
      this.totalLateMarks = filteredLateRecords.length;
      
      // Recalculate penalties based on filtered late marks
      const threshold = data.threshold || 3;
      const penaltyPerUnit = data.penalty_per_unit || 0.5;
      
      // Calculate penalties based on filtered records
      this.penaltiesCalculated = Math.floor(filteredLateRecords.length / threshold);
      
      // For penalties_applied - we need to check if penalties were actually applied
      // This should come from the backend or we calculate based on existing logic
      this.totalPenaltiesApplied = Math.min(
        this.penaltiesCalculated,
        data.penalties_applied || 0
      );
      
      this.totalPenaltyAmount = this.totalPenaltiesApplied * penaltyPerUnit;
      this.pendingPenalties = this.penaltiesCalculated - this.totalPenaltiesApplied;
      this.hasLatePenalty = this.totalPenaltiesApplied > 0;
      this.penaltyPerUnit = penaltyPerUnit;
      this.penaltyThreshold = threshold;
    }
    
    // Fetch monthly summary
    const summaryResponse = await axios.get(
      `https://employees.archenterprises.co.in/api/api/attendance/late-marks-summary`,
      {
        params: {
          name: this.username,
          year: currentYear
        },
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (summaryResponse.data && summaryResponse.data.success) {
      const data = summaryResponse.data.data;
      
      // Filter monthly summary to only include Present status
      const monthlySummary = data.monthly_summary || {};
      const filteredMonthlySummary = {};
      
      Object.keys(monthlySummary).forEach(monthKey => {
        const monthData = monthlySummary[monthKey];
        // If month data has records, filter by status
        if (monthData.records) {
          const presentRecords = monthData.records.filter(record => 
            record.status && (record.status.toLowerCase() === 'present' || record.status.toLowerCase() === 'p')
          );
          filteredMonthlySummary[monthKey] = {
            ...monthData,
            late_count: presentRecords.length,
            records: presentRecords
          };
        } else {
          filteredMonthlySummary[monthKey] = monthData;
        }
      });
      
      this.monthlyLateSummary = Object.values(filteredMonthlySummary);
      
      // Keep late marks & penalties strictly for the CURRENT MONTH (refreshed every month, not summed across all months)
      this.totalLateMarks = filteredLateRecords.length;
      const threshold = data.threshold || 3;
      this.penaltiesCalculated = Math.floor(this.totalLateMarks / threshold);
      this.totalPenaltiesApplied = this.penaltiesCalculated;
      this.totalPenaltyAmount = this.totalPenaltiesApplied * (data.penalty_per_unit || 0.5);

      if (this.latePenaltyRecords.length === 0 && this.penaltiesCalculated > 0) {
        this.generatePenaltyRecordsFallback();
      }
    }
    
    this.lateMarksLoading = false;
    
  } catch (error) {
    console.error('Error fetching late marks:', error);
    this.lateMarksLoading = false;
  }
},
      async fetchLeaveBalance() {
        if (!this.userId) {
          toastError('User information not available');
          return;
        }

        this.loading = true;

        try {
          this.leaveUsed = {
            privilege: 0,
            casual: 0,
            sick: 0
          };
          
          this.approvedLeaves = [];
          this.halfDayLeaves = [];
          this.unpaidAttendanceRecords = [];

          const balanceResponse = await axios.get(`https://employees.archenterprises.co.in/api/api/leave-balances/user/${this.userId}`, {
            params: { 
              year: this.selectedFinancialYear
            },
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('Leave Balance Response:', balanceResponse.data);

          if (balanceResponse.data && balanceResponse.data.success && balanceResponse.data.data) {
            const balanceData = balanceResponse.data.data;
            
            this.leaveAllocations = {
              casual: parseFloat(balanceData.casual_leave) || 7,
              sick: parseFloat(balanceData.sick_leave) || 10,
              privilege: parseFloat(balanceData.pl_leave) || 10,
              unpaid: parseFloat(balanceData.unpaid_leave) || 0
            };
            
            this.leaveUsed = {
              casual: parseFloat(balanceData.used_cl_leave) || 0,
              sick: parseFloat(balanceData.used_sick_leave) || 0,
              privilege: parseFloat(balanceData.used_pl_leave) || 0,
              unpaid: parseFloat(balanceData.used_unpaid_leave) || 0
            };
            
            const remainingCL = balanceData.remaining_cl_leave !== undefined && balanceData.remaining_cl_leave !== null
              ? parseFloat(balanceData.remaining_cl_leave)
              : Math.max(0, this.leaveAllocations.casual - this.leaveUsed.casual);

            const remainingSick = balanceData.remaining_sick_leave !== undefined && balanceData.remaining_sick_leave !== null
              ? parseFloat(balanceData.remaining_sick_leave)
              : Math.max(0, this.leaveAllocations.sick - this.leaveUsed.sick);

            const remainingPL = balanceData.remaining_pl_leave !== undefined && balanceData.remaining_pl_leave !== null
              ? parseFloat(balanceData.remaining_pl_leave)
              : Math.max(0, this.leaveAllocations.privilege - this.leaveUsed.privilege);

            const remainingUnpaid = balanceData.remaining_unpaid_leave !== undefined && balanceData.remaining_unpaid_leave !== null
              ? parseFloat(balanceData.remaining_unpaid_leave)
              : Math.max(0, this.leaveAllocations.unpaid - this.leaveUsed.unpaid);

            this.leaveRemaining = {
              casual: remainingCL,
              sick: remainingSick,
              privilege: remainingPL,
              unpaid: remainingUnpaid
            };
            
            this.unpaidLeaveDays = parseFloat(balanceData.used_unpaid_leave) || 0;

            // Extract late penalty breakdown from balance data
            const penaltyData = balanceData.late_penalty_months || {};
            if (typeof penaltyData === 'object' && penaltyData !== null) {
              if (Array.isArray(penaltyData.penalty_records) && penaltyData.penalty_records.length > 0) {
                this.latePenaltyRecords = penaltyData.penalty_records;
              }
              if (penaltyData.late_penalty_cl_deducted !== undefined) {
                this.latePenaltyClDeducted = parseFloat(penaltyData.late_penalty_cl_deducted) || 0;
              }
              if (penaltyData.late_penalty_unpaid_deducted !== undefined) {
                this.latePenaltyUnpaidDeducted = parseFloat(penaltyData.late_penalty_unpaid_deducted) || 0;
              }
            }
            
            console.log('Leave Data from DB (leave_balances):', {
              allocations: this.leaveAllocations,
              used: this.leaveUsed,
              remaining: this.leaveRemaining,
              unpaidLeave: this.unpaidLeaveDays,
              latePenalties: this.latePenaltyRecords
            });
            
            this.leaveDetails = [
              { 
                type: 'casual', 
                total: this.leaveAllocations.casual, 
                used: this.leaveUsed.casual, 
                remaining: remainingCL
              },
              { 
                type: 'sick', 
                total: this.leaveAllocations.sick, 
                used: this.leaveUsed.sick, 
                remaining: remainingSick
              },
              { 
                type: 'privilege', 
                total: this.leaveAllocations.privilege, 
                used: this.leaveUsed.privilege, 
                remaining: remainingPL
              },
              { 
                type: 'unpaid', 
                total: this.leaveAllocations.unpaid, 
                used: this.leaveUsed.unpaid, 
                remaining: remainingUnpaid
              }
            ];
            
          } else {
            this.leaveAllocations = {
              casual: 7,
              sick: 10,
              privilege: 10,
              unpaid: 0
            };
            
            this.leaveUsed = {
              casual: 0,
              sick: 0,
              privilege: 0,
              unpaid: 0
            };

            this.leaveRemaining = {
              casual: 7,
              sick: 10,
              privilege: 10,
              unpaid: 0
            };
            
            this.leaveDetails = [
              { type: 'casual', total: 7, used: 0, remaining: 7 },
              { type: 'sick', total: 10, used: 0, remaining: 10 },
              { type: 'privilege', total: 10, used: 0, remaining: 10 },
              { type: 'unpaid', total: 0, used: 0, remaining: 0 }
            ];
            
            this.unpaidLeaveDays = 0;
          }

          const response = await axios.get(`https://employees.archenterprises.co.in/api/api/leave-requests`, {
            params: { 
              name: this.username,
              year: this.selectedFinancialYear
            },
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('Leave Requests Response:', response.data);

          if (response.data) {
            let allLeaves = [];
            if (Array.isArray(response.data)) {
              allLeaves = response.data;
            } else if (response.data.data && Array.isArray(response.data.data)) {
              allLeaves = response.data.data;
            } else if (response.data.success && response.data.data) {
              allLeaves = response.data.data;
            } else {
              allLeaves = [];
            }
            
            const filteredLeaves = allLeaves.filter(leave => 
              this.isDateInFinancialYear(leave.fromDate, this.selectedFinancialYear) &&
              leave.status === 'Approved'
            );
            
            filteredLeaves.forEach(leave => {
              const isHalfDay = leave.is_half_day === 1 || leave.leave_duration === 'half';
              
              let duration = 0;
              
              if (isHalfDay) {
                duration = 0.5;
                this.halfDayLeaves.push({
                  ...leave,
                  duration: 0.5
                });
              } else {
                duration = this.calculateDaysBetweenDates(leave.fromDate, leave.toDate, false);
                this.approvedLeaves.push({
                  ...leave,
                  duration: duration
                });
              }
            });
          }

          const { startDate, endDate } = this.getFinancialYearDates(this.selectedFinancialYear);
          
          const attendanceResponse = await axios.get(`https://employees.archenterprises.co.in/api/api/attendances`, {
            params: {
              name: this.username,
              status: 'Absent',
              from_date: startDate,
              to_date: endDate
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('Attendance Response:', attendanceResponse.data);

          if (attendanceResponse.data) {
            let allAttendances = [];
            if (Array.isArray(attendanceResponse.data)) {
              allAttendances = attendanceResponse.data;
            } else if (attendanceResponse.data.data && Array.isArray(attendanceResponse.data.data)) {
              allAttendances = attendanceResponse.data.data;
            } else {
              allAttendances = [];
            }

            this.unpaidAttendanceRecords = allAttendances.filter(record => 
              record.status === 'Absent' && 
              this.isDateInFinancialYear(record.date, this.selectedFinancialYear)
            );
          }
          
          this.loading = false;
          toastSuccess(`Leave balance loaded for ${this.getFinancialYearRange()}`);
          
        } catch (error) {
          console.error('Failed to load leave balance:', error);
          if (error.response) {
            console.error('Error response:', error.response.data);
            if (error.response.status === 404) {
              toastError('No leave balance record found. Please contact HR.');
            } else if (error.response.status === 422) {
              toastError('Please select a valid financial year');
            } else {
              toastError('Could not fetch leave data. Please try again.');
            }
          } else {
            toastError('Could not fetch leave data. Please try again.');
          }
          this.loading = false;
        }
      },
      formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      },
      getLeaveIcon(type) {
        const icons = {
          privilege: 'fas fa-crown',
          casual: 'fas fa-coffee',
          sick: 'fas fa-thermometer-half',
          unpaid: 'fas fa-hourglass-half',
          absent: 'fas fa-hourglass-half',
          'half day': 'fas fa-sun',
          default: 'fas fa-calendar-check'
        };
        return icons[type?.toLowerCase()] || icons.default;
      },
      formatLeaveType(type) {
        const types = {
          privilege: 'Privilege',
          casual: 'Casual',
          sick: 'Sick / Medical',
          unpaid: 'Unpaid Leave',
          absent: 'Unpaid (Absent)',
          'half day': 'Half Day'
        };
        return types[type?.toLowerCase()] || type;
      },
      getRemainingClass(remaining) {
        if (remaining <= 0) return 'critical';
        if (remaining <= 2) return 'warning';
        return 'good';
      },
      getUsagePercentage(used, total) {
        if (total === 0) return 0;
        return Math.round((used / total) * 100);
      },
      getProgressClass(remaining, total) {
        const used = total - remaining;
        const percentage = (used / total) * 100;
        if (percentage >= 90) return 'progress-critical';
        if (percentage >= 70) return 'progress-warning';
        return 'progress-good';
      },
      getStatusClass(remaining, total) {
        if (total === 0) return 'neutral';
        if (remaining <= 0) return 'critical';
        if (remaining <= 2) return 'warning';
        return 'good';
      },
      getStatusText(remaining, total) {
        if (total === 0) return 'N/A';
        if (remaining <= 0) return 'Exhausted';
        if (remaining <= 2) return 'Low Balance';
        return 'Available';
      },
      logout() {
        axios.post('https://employees.archenterprises.co.in/api/logout', {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).finally(() => {
          localStorage.removeItem('token');
          this.$router.push('/auth');
        });
      }
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
  --unpaid: #f59e0b;
  --late-color: #dc2626;
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

.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

.kra-board-premium {
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

.mobile-stats-badge {
  background: var(--primary);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

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

.stats-badge-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 40px;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
}

.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-card i {
  font-size: 36px;
  color: var(--primary-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

.stat-sub {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

.total-summary-card {
  background: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 28px;
}

.total-summary-content {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.total-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.total-item:active {
  transform: scale(0.95);
}

.total-item i {
  font-size: 28px;
  opacity: 0.9;
}

.total-item div {
  display: flex;
  flex-direction: column;
}

.total-label {
  font-size: 12px;
  opacity: 0.8;
}

.total-value {
  font-size: 24px;
  font-weight: 700;
}

/* Late Marks Card */
.late-marks-summary-card {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 28px;
  border: 1px solid #fca5a5;
}

.late-marks-summary-card.mobile-card {
  padding: 16px;
}

.late-marks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #fca5a5;
  cursor: pointer;
}

.header-left-late {
  display: flex;
  align-items: center;
  gap: 10px;
}

.late-marks-header i:first-child {
  font-size: 24px;
  color: #dc2626;
}

.late-marks-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #991b1b;
  margin: 0;
}

.late-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #dc2626;
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 13px;
  font-weight: 700;
}

.late-count-badge.has-penalty {
  background: #f59e0b;
}

.header-right-late {
  display: flex;
  align-items: center;
  gap: 12px;
}

.penalty-badge {
  background: #f59e0b;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.penalty-badge i {
  font-size: 11px;
  margin-right: 4px;
}

.late-marks-header .fa-chevron-down {
  transition: transform 0.3s ease;
  color: #991b1b;
}

.late-marks-header .fa-chevron-down.rotated {
  transform: rotate(180deg);
}

.late-marks-body {
  transition: all 0.3s ease;
}

.late-marks-body.late-marks-hidden {
  display: none;
}

.late-marks-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.late-marks-stats .stat-item {
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  text-align: center;
}

.late-marks-stats .stat-item .stat-label {
  display: block;
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
}

.late-marks-stats .stat-item .stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: var(--dark);
  margin-top: 4px;
}

.late-marks-stats .stat-item .stat-value.warning {
  color: #dc2626;
}

.late-marks-stats .stat-item .stat-value.penalty-applied {
  color: #f59e0b;
}

.late-marks-stats .stat-item .stat-value.no-penalty {
  color: #10b981;
}

.late-marks-stats .stat-item .stat-value.penalty-amount {
  color: #f59e0b;
}

.late-marks-table-container {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-top: 8px;
}

.section-title-modern.small {
  font-size: 14px;
  margin-bottom: 12px;
  padding-bottom: 8px;
}

/* Mobile Late Cards */
.mobile-late-cards {
  display: none;
  flex-direction: column;
  gap: 10px;
}

.late-mark-card {
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px;
  border-left: 3px solid #dc2626;
}

.late-mark-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.late-date {
  font-weight: 600;
  font-size: 13px;
  color: var(--dark);
}

.late-time {
  font-size: 12px;
  color: #6b7280;
}

.late-mark-body .late-status {
  font-size: 12px;
  color: #4b5563;
  background: #f1f5f9;
  padding: 2px 10px;
  border-radius: 12px;
}

/* Late Marks Table */
.late-marks-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.late-marks-table th {
  text-align: left;
  padding: 10px 12px;
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.late-marks-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #4b5563;
}

.late-marks-table tr:last-child td {
  border-bottom: none;
}

.status-badge.late {
  background: #fee2e2;
  color: #991b1b;
}

.no-late-marks {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #10b981;
  font-size: 14px;
  padding: 12px 0;
}

.no-late-marks i {
  font-size: 20px;
}

/* Monthly Late Summary */
.monthly-late-summary {
  margin-top: 16px;
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.monthly-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  margin-top: 8px;
}

.monthly-summary-grid.mobile-grid {
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
}

.monthly-summary-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  transition: all 0.2s;
}

.monthly-summary-item.has-penalty {
  background: #fef3c7;
  border: 1px solid #fbbf24;
}

.month-name {
  font-weight: 500;
  color: #374151;
}

.month-count {
  font-weight: 700;
  color: var(--dark);
}

.monthly-summary-item.has-penalty .month-count {
  color: #f59e0b;
}

.penalty-indicator {
  color: #f59e0b;
  font-size: 12px;
}

.halfday-info-card {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 28px;
  border: 1px solid #fbbf24;
}

.halfday-info-card.mobile-card {
  padding: 16px;
}

.halfday-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #fbbf24;
  cursor: pointer;
}

.header-left-half {
  display: flex;
  align-items: center;
  gap: 10px;
}

.halfday-info-header i:first-child {
  font-size: 24px;
  color: #d97706;
}

.halfday-info-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #92400e;
  margin: 0;
}

.halfday-info-header .fa-chevron-down {
  transition: transform 0.3s ease;
  color: #92400e;
}

.halfday-info-header .fa-chevron-down.rotated {
  transform: rotate(180deg);
}

.halfday-info-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.3s ease;
}

.halfday-info-body.halfday-hidden {
  display: none;
}

.halfday-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 10px;
}

.halfday-detail .label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.halfday-detail .value {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
}

.halfday-note {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fef3c7;
  border-radius: 10px;
  font-size: 12px;
  color: #92400e;
}

.halfday-note i {
  font-size: 14px;
}

.section-title-modern {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
  cursor: pointer;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title-modern i {
  color: var(--primary-color);
  font-size: 18px;
}

.section-title-modern .fa-chevron-down {
  transition: transform 0.3s ease;
}

.section-title-modern .fa-chevron-down.rotated {
  transform: rotate(180deg);
}

.count-badge {
  margin-left: 4px;
  background: #e0e7ff;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: var(--primary-color);
}

.leave-table-container {
  overflow-x: auto;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  margin-bottom: 28px;
}

/* Mobile Leave Cards */
.mobile-leave-cards {
  display: none;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.leave-detail-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.leave-type-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.leave-type-cell i {
  width: 28px;
  color: var(--primary-color);
  font-size: 16px;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-label {
  font-size: 13px;
  color: #6b7280;
}

.card-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--dark);
}

.card-value.good {
  color: var(--success);
}

.card-value.warning {
  color: var(--warning);
}

.card-value.critical {
  color: var(--danger);
}

.leave-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.leave-table th {
  text-align: left;
  padding: 14px 16px;
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.leave-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #4b5563;
}

.leave-table tr:last-child td {
  border-bottom: none;
}

.leave-type-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.leave-type-cell i {
  width: 28px;
  color: var(--primary-color);
  font-size: 16px;
}

.total-cell, .used-cell {
  font-weight: 500;
}

.remaining-cell {
  font-size: 16px;
}

.remaining-cell.good {
  color: var(--success);
}

.remaining-cell.warning {
  color: var(--warning);
}

.remaining-cell.critical {
  color: var(--danger);
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.good {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.warning {
  background: #fed7aa;
  color: #92400e;
}

.status-badge.critical {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.neutral {
  background: #f3f4f6;
  color: #6b7280;
}

.approved-leaves-section, .unpaid-leaves-section, .halfday-leaves-section {
  margin-bottom: 28px;
}

.approved-leaves-container, .unpaid-leaves-container, .halfday-leaves-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
  transition: all 0.3s ease;
}

.approved-leaves-container.list-hidden,
.unpaid-leaves-container.list-hidden,
.halfday-leaves-container.list-hidden {
  display: none;
}

.approved-leave-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px;
  border-left: 3px solid var(--success);
  transition: all 0.2s;
}

.approved-leave-card:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.approved-leave-card.mobile-item {
  padding: 10px;
}

.unpaid-leave-card {
  background: #fef3c7;
  border-radius: 12px;
  padding: 12px;
  border-left: 3px solid var(--unpaid);
  transition: all 0.2s;
}

.unpaid-leave-card:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.unpaid-leave-card.mobile-item {
  padding: 10px;
}

.halfday-leave-card {
  background: #fef3c7;
  border-radius: 12px;
  padding: 12px;
  border-left: 3px solid #f59e0b;
  transition: all 0.2s;
}

.halfday-leave-card:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.halfday-leave-card.mobile-item {
  padding: 10px;
}

.leave-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.leave-header i {
  font-size: 14px;
}

.approved-leave-card .leave-header i {
  color: var(--success);
}

.unpaid-leave-card .leave-header i,
.halfday-leave-card .leave-header i {
  color: var(--warning);
}

.leave-type {
  font-weight: 600;
  font-size: 13px;
  color: #1a1a2e;
}

.leave-dates {
  font-size: 11px;
  color: #6b7280;
  margin-left: auto;
}

.leave-body {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #4b5563;
  flex-wrap: wrap;
}

.leave-duration, .leave-reason {
  display: flex;
  align-items: center;
  gap: 4px;
}

.leave-duration i, .leave-reason i {
  font-size: 11px;
  color: #9ca3af;
}

.leave-reason {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-section {
  margin-bottom: 28px;
}

.progress-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-item {
  width: 100%;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13px;
}

.progress-label {
  font-weight: 500;
  color: #374151;
}

.progress-stats {
  color: #6b7280;
  font-size: 12px;
}

.progress-bar-bg {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-bar-fill.progress-good {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.progress-bar-fill.progress-warning {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.progress-bar-fill.progress-critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.leave-footer {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.leave-footer.mobile-footer {
  flex-direction: column;
  align-items: flex-start;
}

.year-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.year-selector label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.year-selector select {
  padding: 8px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.year-selector select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.footer-note {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #9ca3af;
}

.footer-note i {
  font-size: 14px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: #6b7280;
}

.loading-state i {
  font-size: 24px;
  color: var(--primary-color);
}

.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  background: #fafbfc;
  border-radius: 20px;
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

.empty-state-premium p {
  font-size: 14px;
}

.empty-mobile .empty-state-premium p {
  font-size: 13px;
}

.approved-leaves-container::-webkit-scrollbar,
.unpaid-leaves-container::-webkit-scrollbar,
.halfday-leaves-container::-webkit-scrollbar {
  width: 6px;
}

.approved-leaves-container::-webkit-scrollbar-track,
.unpaid-leaves-container::-webkit-scrollbar-track,
.halfday-leaves-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.approved-leaves-container::-webkit-scrollbar-thumb,
.unpaid-leaves-container::-webkit-scrollbar-thumb,
.halfday-leaves-container::-webkit-scrollbar-thumb {
  background: #c7d2fe;
  border-radius: 10px;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 12px;
  }

  .kra-board-premium {
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
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-card {
    padding: 14px;
  }

  .stat-card i {
    font-size: 28px;
  }

  .stat-value {
    font-size: 28px;
  }

  .total-summary-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .total-item i {
    font-size: 24px;
  }

  .total-value {
    font-size: 20px;
  }

  .late-marks-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .late-marks-header {
    flex-wrap: wrap;
  }

  .header-right-late {
    width: 100%;
    justify-content: space-between;
  }

  .mobile-late-cards {
    display: flex;
  }

  .late-marks-table {
    display: none;
  }

  .mobile-leave-cards {
    display: flex;
  }

  .leave-table {
    display: none;
  }

  .approved-leaves-container,
  .unpaid-leaves-container,
  .halfday-leaves-container {
    grid-template-columns: 1fr;
    max-height: 300px;
  }
  
  .leave-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .leave-dates {
    margin-left: 0;
  }
  
  .halfday-info-body {
    flex-direction: column;
  }

  .section-title-modern {
    font-size: 14px;
  }

  .footer-note span {
    display: none;
  }

  .year-selector {
    width: 100%;
  }

  .year-selector select {
    flex: 1;
  }

  .leave-footer.mobile-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .monthly-summary-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }

  .monthly-summary-item {
    font-size: 11px;
    padding: 4px 8px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }

  .kra-board-premium {
    padding: 12px;
    border-radius: 16px;
  }

  .mobile-title {
    font-size: 16px;
  }

  .mobile-stats-badge {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .stats-bar {
    gap: 8px;
  }

  .stat-card {
    padding: 10px;
  }

  .stat-card i {
    font-size: 24px;
  }

  .stat-value {
    font-size: 24px;
  }

  .stat-label {
    font-size: 11px;
  }

  .stat-sub {
    font-size: 10px;
  }

  .total-item i {
    font-size: 20px;
  }

  .total-value {
    font-size: 18px;
  }

  .late-marks-summary-card.mobile-card {
    padding: 12px;
  }

  .late-marks-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .late-marks-stats .stat-item {
    padding: 8px 12px;
  }

  .late-marks-stats .stat-item .stat-value {
    font-size: 20px;
  }

  .late-count-badge {
    width: 24px;
    height: 24px;
    font-size: 11px;
  }

  .penalty-badge {
    font-size: 10px;
    padding: 2px 8px;
  }

  .halfday-info-card.mobile-card {
    padding: 12px;
  }

  .halfday-detail .label {
    font-size: 12px;
  }

  .halfday-detail .value {
    font-size: 14px;
  }

  .leave-detail-card {
    padding: 12px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .card-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .card-value {
    font-size: 14px;
  }

  .approved-leave-card.mobile-item,
  .unpaid-leave-card.mobile-item,
  .halfday-leave-card.mobile-item {
    padding: 10px;
  }

  .leave-body {
    flex-direction: column;
    gap: 4px;
  }

  .leave-reason {
    white-space: normal;
  }

  .progress-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .empty-state-premium i {
    font-size: 40px;
  }

  .empty-state-premium h4 {
    font-size: 15px;
  }

  .year-selector label {
    font-size: 12px;
  }

  .year-selector select {
    font-size: 12px;
    padding: 6px 10px;
  }

  .monthly-summary-grid {
    grid-template-columns: repeat(auto-fill, minmax(65px, 1fr));
    gap: 4px;
  }

  .monthly-summary-item {
    font-size: 10px;
    padding: 4px 6px;
    flex-direction: column;
    text-align: center;
  }

  .month-count {
    font-size: 14px;
  }
}
/* Penalty Info Box */
.penalty-info-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #eff6ff;
  border: 1px solid #93c5fd;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #1e40af;
}

.penalty-info-box i {
  font-size: 18px;
  margin-top: 2px;
  color: #3b82f6;
}

.penalty-info-box .pending-warning {
  color: #dc2626;
  font-weight: 600;
}

/* Pending Penalty Indicator */
.pending-indicator {
  color: #dc2626;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.monthly-summary-item.pending-penalty {
  border: 1px solid #dc2626;
  background: #fef2f2;
}

.monthly-summary-item .month-count {
  font-weight: 700;
  font-size: 14px;
}

.monthly-summary-item.has-penalty .month-count {
  color: #f59e0b;
}

.monthly-summary-item.pending-penalty .month-count {
  color: #dc2626;
}

/* Late Number */
.late-number {
  font-size: 10px;
  color: #9ca3af;
  background: #f1f5f9;
  padding: 1px 8px;
  border-radius: 10px;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .late-marks-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .penalty-info-box {
    font-size: 12px;
    padding: 10px 12px;
    flex-direction: column;
  }
  
  .penalty-info-box i {
    font-size: 16px;
  }
  
  .monthly-summary-item {
    font-size: 11px;
  }
  
  .monthly-summary-item .month-count {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .late-marks-stats {
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  
  .late-marks-stats .stat-item {
    padding: 6px 10px;
  }
  
  .late-marks-stats .stat-item .stat-value {
    font-size: 18px;
  }
  
  .penalty-info-box {
    font-size: 11px;
    padding: 8px 10px;
  }
}

/* ================= LATE MARK PENALTY LEAVES DEDICATED SECTION ================= */
.late-penalty-leaves-section {
  background: #ffffff;
  border: 2px solid #94a3b8;
  border-radius: 18px;
  padding: 22px;
  margin-bottom: 28px;
  box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.08);
}

.late-penalty-leaves-section.mobile-card {
  padding: 16px;
  border-radius: 14px;
}

.section-title-clickable {
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.section-title-clickable .title-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.title-icon-badge {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #eef2ff;
  color: #4f46e5;
  border: 1.5px solid #c7d2fe;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.section-heading {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  display: block;
  line-height: 1.2;
}

.section-subheading {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  margin-top: 2px;
  display: block;
}

.count-badge-penalty {
  background: #fee2e2;
  color: #b91c1c;
  border: 1.5px solid #fca5a5;
  font-weight: 800;
  font-size: 11.5px;
  padding: 4px 10px;
  border-radius: 20px;
}

.count-badge-zero {
  background: #f1f5f9;
  color: #475569;
  border: 1.5px solid #cbd5e1;
  font-weight: 700;
  font-size: 11.5px;
  padding: 4px 10px;
  border-radius: 20px;
}

.late-penalty-content {
  transition: all 0.3s ease;
}

.late-penalty-content.list-hidden {
  display: none;
}

.late-penalty-highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.penalty-highlight-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: #f8fafc;
  border: 2px solid #cbd5e1;
  border-radius: 14px;
  transition: all 0.2s ease;
}

.highlight-active-casual {
  background: #f0fdf4;
  border-color: #22c55e;
}

.highlight-active-unpaid {
  background: #fff7ed;
  border-color: #f97316;
}

.highlight-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.highlight-icon.icon-clock {
  background: #f1f5f9;
  color: #475569;
  border: 1.5px solid #cbd5e1;
}

.highlight-icon.icon-cl {
  background: #ecfdf5;
  color: #059669;
  border: 1.5px solid #86efac;
}

.highlight-icon.icon-unpaid {
  background: #ffedd5;
  color: #ea580c;
  border: 1.5px solid #fdba74;
}

.highlight-info {
  display: flex;
  flex-direction: column;
}

.highlight-num {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
}

.highlight-label {
  font-size: 12.5px;
  font-weight: 700;
  color: #334155;
  margin-top: 3px;
}

.highlight-sub {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  margin-top: 1px;
}

.policy-status-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 13.5px;
  line-height: 1.45;
  border: 2px solid transparent;
}

.policy-status-banner.banner-casual {
  background: #ecfdf5;
  border-color: #34d399;
  color: #065f46;
}

.policy-status-banner.banner-unpaid {
  background: #fff7ed;
  border-color: #fb923c;
  color: #9a3412;
}

.policy-status-banner.banner-warning {
  background: #fefce8;
  border-color: #fde047;
  color: #854d0e;
}

.policy-status-banner.banner-neutral {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #334155;
}

.policy-status-banner .banner-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.penalty-records-wrap {
  margin-top: 14px;
}

.penalty-records-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 12px;
}

.penalty-records-title i {
  color: #4f46e5;
}

.desktop-penalty-table-wrap {
  overflow-x: auto;
  border: 2px solid #94a3b8;
  border-radius: 12px;
}

.penalty-records-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.penalty-records-table thead tr {
  background: #e2e8f0;
}

.penalty-records-table th {
  padding: 12px 14px;
  font-weight: 800;
  color: #0f172a;
  text-transform: uppercase;
  font-size: 11.5px;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #64748b;
  border-right: 1.5px solid #cbd5e1;
  text-align: left;
}

.penalty-records-table th:last-child {
  border-right: none;
}

.penalty-records-table td {
  padding: 12px 14px;
  vertical-align: middle;
  border-bottom: 1.5px solid #cbd5e1;
  border-right: 1.5px solid #cbd5e1;
  background: #ffffff;
}

.penalty-records-table td:last-child {
  border-right: none;
}

.trigger-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 700;
  color: #475569;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 12px;
}

.clock-in-hint {
  font-size: 11.5px;
  color: #64748b;
  margin-left: 4px;
}

.leave-type-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.leave-type-pill.pill-casual {
  background: #ecfdf5;
  color: #047857;
  border: 1.5px solid #34d399;
}

.leave-type-pill.pill-unpaid {
  background: #fff7ed;
  color: #c2410c;
  border: 1.5px solid #fb923c;
}

.column-name-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

.column-name-tag.col-tag-casual {
  background: #f0fdf4;
  color: #15803d;
  border: 1.5px solid #86efac;
}

.column-name-tag.col-tag-unpaid {
  background: #fff7ed;
  color: #c2410c;
  border: 1.5px solid #fdba74;
}

.status-badge-applied {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 700;
}

.status-badge-applied.badge-applied-casual {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.status-badge-applied.badge-applied-unpaid {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

/* Mobile Penalty Cards */
.mobile-penalty-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.penalty-record-card {
  background: #ffffff;
  border: 2px solid #cbd5e1;
  border-left-width: 5px;
  border-radius: 12px;
  padding: 14px;
}

.penalty-record-card.card-casual {
  border-left-color: #22c55e;
}

.penalty-record-card.card-unpaid {
  border-left-color: #ea580c;
}

.card-p-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.p-badge {
  font-size: 12px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.p-badge.badge-casual { color: #15803d; }
.p-badge.badge-unpaid { color: #c2410c; }

.p-duration {
  font-size: 12px;
  font-weight: 800;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 2px 7px;
  border-radius: 6px;
}

.card-p-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
}

.p-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.p-lbl {
  color: #64748b;
  font-weight: 600;
}

.p-val {
  color: #0f172a;
  font-weight: 700;
}

.p-val.column-target.target-casual {
  color: #15803d;
}

.p-val.column-target.target-unpaid {
  color: #c2410c;
}

.empty-penalties-state {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  background: #f8fafc;
  border: 1.5px dashed #cbd5e1;
  border-radius: 12px;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
}

.empty-penalties-state i {
  color: #22c55e;
  font-size: 18px;
}
</style>