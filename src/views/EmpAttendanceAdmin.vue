<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <i class="fas fa-calendar-check"></i>
            <span>Attendance</span>
          </div>
          <div class="mobile-actions">
            <button class="mobile-action-btn" @click="showMarkAttendancePopup = true">
              <i class="fas fa-fingerprint"></i>
            </button>
            <button class="mobile-action-btn secondary" @click="showPopupsalary = true">
              <i class="fas fa-calculator"></i>
            </button>
          </div>
        </div>

        <!-- Desktop Header -->
        <div class="content-header-modern" v-else>
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div>
              <h1>Daily Attendance</h1>
              <p class="subtitle-modern">Track and manage employee attendance</p>
            </div>
          </div>
          <div class="header-buttons">
            <button class="register-btn-modern secondary" @click="showMarkAttendancePopup = true">
              <i class="fas fa-fingerprint"></i>
              <span>Mark Attendance</span>
            </button>
            <button class="register-btn-modern" @click="showPopupsalary = true">
              <i class="fas fa-calculator"></i>
              <span>Calculate Salary</span>
            </button>
          </div>
        </div>

        <!-- Stats Bar - Mobile Optimized -->
        <div class="stats-bar">
          <div class="stat-card desktop-only" @click="filterByStatus('all')">
            <i class="fas fa-users"></i>
            <div class="stat-info">
              <span class="stat-value">{{ attendanceRecords.length }}</span>
              <span class="stat-label">Total</span>
            </div>
          </div>
          <div class="stat-card" @click="filterByStatus('Present')">
            <i class="fas fa-check-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ presentCount }}</span>
              <span class="stat-label">Present</span>
            </div>
          </div>
          
          <div class="stat-card" @click="showLateMarksModal = true">
            <i class="fas fa-exclamation-triangle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ totalLateMarks }}</span>
              <span class="stat-label">Total Late</span>
            </div>
          </div>
        </div>

        <!-- Current Date -->
        <div class="current-date-badge">
          <i class="fas fa-calendar-day"></i>
          <span>{{ currentDate }}</span>
        </div>

        <!-- Search - Mobile -->
        <div class="search-bar-mobile" v-if="isMobile && attendanceRecords.length > 0">
          <div class="search-group-mobile">
            <i class="fas fa-search"></i>
            <input type="text" v-model="searchQuery" placeholder="Search employees..." class="search-input-mobile" />
          </div>
        </div>

        <!-- Attendance Table - Mobile Optimized -->
        <div class="table-wrapper-premium">
          <div class="table-header">
            <div class="section-title-modern">
              <div class="title-left">
                <i class="fas fa-list-ul"></i>
                <span>Attendance Records</span>
                <span class="record-count-mobile" v-if="isMobile">{{ filteredRecords.length }}</span>
              </div>
            </div>
            <div class="table-info desktop-only">
              <i class="fas fa-clock"></i>
              <span>Last updated: {{ lastUpdated }}</span>
            </div>
          </div>

          <!-- Mobile Card View -->
          <div class="mobile-cards" v-if="isMobile">
            <div v-for="record in filteredRecords" :key="record.id" class="attendance-card">
              <div class="card-header">
                <div class="employee-info-card">
                  <div class="employee-avatar">
                    {{ getInitials(record.name) }}
                  </div>
                  <span class="employee-name">{{ record.name }}</span>
                </div>
                <span :class="['status-badge-mobile', getStatusClass(record.status)]">
                  <i :class="getStatusIcon(record.status)"></i>
                  {{ record.status || 'Not Marked' }}
                </span>
              </div>

              <div class="card-body">
                <div class="card-row">
                  <span class="card-label"><i class="fas fa-clock"></i> Clock In</span>
                  <span class="card-value">{{ record.clock_in || '—' }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label"><i class="fas fa-clock"></i> Clock Out</span>
                  <span class="card-value">{{ record.clock_out || '—' }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label"><i class="fas fa-hourglass-half"></i> Required</span>
                  <span class="card-value">{{ record.required_time || '—' }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label"><i class="fas fa-hourglass-end"></i> Actual</span>
                  <span class="card-value actual-time">{{ record.actual_time || '—' }}</span>
                </div>
                <div v-if="record.status === 'Present' && record.clock_in" class="card-row">
                  <span class="card-label"></span>
                  <span v-if="isLate(record.clock_in)" class="late-warning-mobile">
                    <i class="fas fa-exclamation-triangle"></i> {{ calculateLateTime(record.clock_in) }} Late
                  </span>
                  <span v-else-if="isEarly(record.clock_in)" class="early-info-mobile">
                    <i class="fas fa-star"></i> {{ calculateEarlyTime(record.clock_in) }} Early
                  </span>
                </div>
              </div>
            </div>

            <!-- Mobile Empty State -->
            <div v-if="filteredRecords.length === 0" class="empty-state-mobile">
              <i class="fas fa-calendar-times"></i>
              <h4>{{ searchQuery ? 'No Matching Records' : 'No Attendance Records' }}</h4>
              <p>{{ searchQuery ? 'Try adjusting your search' : 'No attendance data found for today' }}</p>
            </div>
          </div>

          <!-- Desktop Table View -->
          <div class="table-container" v-else>
            <table class="attendance-table-premium">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Status</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Required Time</th>
                  <th>Actual Time</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in filteredRecords" :key="record.id">
                  <td class="employee-cell">
                    <div class="employee-info">
                      <div class="employee-avatar">
                        {{ getInitials(record.name) }}
                      </div>
                      <span class="employee-name">{{ record.name }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="status-container">
                      <span :class="['status-badge-premium', getStatusClass(record.status)]">
                        <i :class="getStatusIcon(record.status)"></i>
                        {{ record.status || 'Not Marked' }}
                      </span>
                      <div v-if="record.status === 'Present' && record.clock_in">
                        <small v-if="isLate(record.clock_in)" class="late-warning">
                          <i class="fas fa-exclamation-triangle"></i> {{ calculateLateTime(record.clock_in) }} Late
                        </small>
                        <small v-else-if="isEarly(record.clock_in)" class="early-info">
                          <i class="fas fa-star"></i> {{ calculateEarlyTime(record.clock_in) }} Early
                        </small>
                      </div>
                    </div>
                  </td>
                  <td class="time-cell">{{ record.clock_in || '—' }}</td>
                  <td class="time-cell">{{ record.clock_out || '—' }}</td>
                  <td class="time-cell">{{ record.required_time || '—' }}</td>
                  <td class="time-cell">{{ record.actual_time || '—' }}</td>
                </tr>
                <tr v-if="filteredRecords.length === 0" class="empty-row">
                  <td colspan="6">
                    <div class="empty-state-premium">
                      <i class="fas fa-calendar-times"></i>
                      <h4>No Attendance Records</h4>
                      <p>No attendance data found for today</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Late Marks Summary Section -->
        <div class="late-marks-summary-wrapper" v-if="lateMarksData.length > 0 || totalLateMarks > 0">
          <div class="section-title-modern">
          &nbsp;  <i class="fas fa-clock"></i>
            <span> Late Marks Summary</span>
            <span class="info-badge">Threshold: 9:40 AM</span>
          </div>
          
          <!-- Mobile Late Cards -->
          <div class="mobile-late-cards" v-if="isMobile">
            <div v-for="(item, index) in lateMarksData" :key="index" class="late-mark-card">
              <div class="late-mark-header">
                <div class="employee-info-small">
                  <div class="employee-avatar-small">
                    {{ getInitials(item.name) }}
                  </div>
                  <span class="employee-name">{{ item.name }}</span>
                </div>
                <span class="late-count-badge" :class="getLateCountClass(item.late_count)">
                  {{ item.late_count }}
                </span>
              </div>
              <div class="late-mark-body">
                <div class="late-detail">
                  <span class="detail-label">Late Count</span>
                  <span class="detail-value">{{ item.late_count }}</span>
                </div>
                <div class="late-detail">
                  <span class="detail-label">Penalties Applied</span>
                  <span class="detail-value" :class="{ 'has-penalty': item.penalties_applied > 0 }">
                    {{ item.penalties_applied }}
                  </span>
                </div>
                <div class="late-detail" v-if="item.penalty_amount > 0">
                  <span class="detail-label">CL Deduction</span>
                  <span class="detail-value penalty-amount">{{ item.penalty_amount }}</span>
                </div>
                <div class="late-progress">
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" 
                         :style="{ width: Math.min((item.late_count / 10) * 100, 100) + '%' }"
                         :class="getLateProgressClass(item.late_count)">
                    </div>
                  </div>
                  <span class="progress-label">{{ item.late_count }} / 10</span>
                </div>
                <div class="late-detail" v-if="item.pending_penalties > 0">
                  <span class="detail-label pending">⏳ Pending Penalties</span>
                  <span class="detail-value warning">{{ item.pending_penalties }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop Late Table -->
          <div class="table-container" v-else>
            <table class="attendance-table-premium">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Late Count</th>
                  <th>Penalties Applied</th>
                  <th>CL Deduction</th>
                  <th>Pending Penalties</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in lateMarksData" :key="item.name">
                  <td class="employee-cell">
                    <div class="employee-info">
                      <div class="employee-avatar">
                        {{ getInitials(item.name) }}
                      </div>
                      <span class="employee-name">{{ item.name }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="late-count-badge" :class="getLateCountClass(item.late_count)">
                      {{ item.late_count }}
                    </span>
                  </td>
                  <td>
                    <span :class="['penalty-badge', { 'has-penalty': item.penalties_applied > 0 }]">
                      {{ item.penalties_applied }}
                    </span>
                  </td>
                  <td>
                    <span v-if="item.penalty_amount > 0" class="penalty-amount">
                      {{ item.penalty_amount }} CL
                    </span>
                    <span v-else class="no-penalty">—</span>
                  </td>
                  <td>
                    <span v-if="item.pending_penalties > 0" class="pending-badge">
                      <i class="fas fa-clock"></i> {{ item.pending_penalties }}
                    </span>
                    <span v-else class="no-pending">✓</span>
                  </td>
                  <td>
                    <span :class="['status-badge-premium', getLateStatusClass(item)]">
                      <i :class="getLateStatusIcon(item)"></i>
                      {{ getLateStatusText(item) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Penalty Info -->
          <div class="penalty-info-box">
           
            <span>
              <strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Rule:</strong> Every 3 late marks (after 9:40 AM) = 1 penalty (0.5 CL deduction)
            </span>
          </div>
        </div>

        <!-- No Late Marks Message -->
        <div v-else-if="!lateMarksLoading && employees.length > 0" class="no-late-marks">
          <i class="fas fa-check-circle"></i>
          <span>No late marks recorded. All employees are on time! 👏</span>
        </div>
      </section>
    </div>

    <!-- Mark Attendance Modal - Mobile Optimized -->
    <transition name="modal-fade">
      <div v-if="showMarkAttendancePopup" class="modal-backdrop" @click.self="showMarkAttendancePopup = false">
        <div class="premium-modal" :class="{ 'mobile-modal': isMobile }" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium">
              <i class="fas fa-fingerprint"></i>
            </div>
            <div class="header-text">
              <h2>{{ isMobile ? 'Mark Attendance' : 'Mark Attendance' }}</h2>
              <p>Record employee attendance</p>
            </div>
            <button class="close-btn-premium" @click="showMarkAttendancePopup = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body-premium">
            <div class="form-section">
              <div class="form-field">
                <label>Employee <span class="required-star">*</span></label>
                <div class="field-wrapper">
                  <i class="fas fa-user field-icon"></i>
                  <select v-model="markAttendance.employee">
                    <option value="">Select Employee</option>
                    <option v-for="emp in employees" :key="emp.id" :value="emp.name">
                      {{ emp.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-field">
                <label>Status <span class="required-star">*</span></label>
                <div class="field-wrapper">
                  <i class="fas fa-tag field-icon"></i>
                  <select v-model="markAttendance.status" :class="markAttendance.status">
                    <option value="">Select Status</option>
                    <option>Present</option>
                    <option>Traveling</option>
                    <option>OnSite</option>
                    <option>HalfDay</option>
                    <option>Leave</option>
                    <option>Absent</option>
                  </select>
                </div>
              </div>

              <div class="form-field" v-if="markAttendance.status === 'OnSite'">
                <label>Site Name</label>
                <div class="field-wrapper">
                  <i class="fas fa-building field-icon"></i>
                  <input type="text" v-model="markAttendance.site_name" placeholder="Enter site name" />
                </div>
              </div>

              <div class="two-col-grid" v-if="markAttendance.status === 'Traveling'">
                <div class="form-field">
                  <label>Travel From</label>
                  <div class="field-wrapper">
                    <i class="fas fa-location-dot field-icon"></i>
                    <input type="text" v-model="markAttendance.travel_from" placeholder="From location" />
                  </div>
                </div>
                <div class="form-field">
                  <label>Travel To</label>
                  <div class="field-wrapper">
                    <i class="fas fa-location-arrow field-icon"></i>
                    <input type="text" v-model="markAttendance.travel_to" placeholder="To location" />
                  </div>
                </div>
              </div>

              <div class="two-col-grid">
                <div class="form-field">
                  <label>Date <span class="required-star">*</span></label>
                  <div class="field-wrapper">
                    <i class="fas fa-calendar-alt field-icon"></i>
                    <input type="date" v-model="markAttendance.date" :max="today" />
                  </div>
                </div>
                <div class="form-field">
                  <label>Time</label>
                  <div class="field-wrapper">
                    <i class="fas fa-clock field-icon"></i>
                    <input type="time" v-model="markAttendance.time" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer-premium" :class="{ 'mobile-footer': isMobile }">
            <button class="btn-cancel-premium" @click="showMarkAttendancePopup = false">
              <i class="fas fa-times"></i> Cancel
            </button>
            <button class="btn-submit-premium" @click="submitMarkedAttendance">
              <i class="fas fa-save"></i> Save
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Salary Calculation Modal - Mobile Optimized -->
    <transition name="modal-fade">
      <div v-if="showPopupsalary" class="modal-backdrop" @click.self="showPopupsalary = false">
        <div class="premium-modal salary-modal" :class="{ 'mobile-modal': isMobile }" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium">
              <i class="fas fa-rupee-sign"></i>
            </div>
            <div class="header-text">
              <h2>{{ isMobile ? 'Salary' : 'Salary Calculation' }}</h2>
              <p>Calculate monthly salaries</p>
            </div>
            <button class="close-btn-premium" @click="showPopupsalary = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body-premium">
            <div class="table-wrapper-salary">
              <!-- Mobile Salary Cards -->
              <div class="mobile-salary-cards" v-if="isMobile">
                <div v-for="employee in employees" :key="employee.id" class="salary-card">
                  <div class="salary-card-header">
                    <div class="employee-info-small">
                      <div class="employee-avatar-small">
                        {{ getInitials(employee.name) }}
                      </div>
                      <span class="employee-name">{{ employee.name }}</span>
                    </div>
                  </div>
                  <div class="salary-card-body">
                    <div v-if="employee.salary" class="salary-amount-mobile">
                      <i class="fas fa-rupee-sign"></i> {{ formatSalary(employee.salary) }}
                    </div>
                    <button v-else class="calculate-btn-mobile" @click="calculateSalaryOnClick(employee)" :disabled="employee.calculating">
                      <i v-if="employee.calculating" class="fas fa-spinner fa-spin"></i>
                      <i v-else class="fas fa-calculator"></i>
                      {{ employee.calculating ? "Calculating..." : "Calculate" }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Desktop Salary Table -->
              <table class="salary-table-premium" v-else>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Salary</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="employee in employees" :key="employee.id">
                    <td class="employee-cell">
                      <div class="employee-info">
                        <div class="employee-avatar-small">
                          {{ getInitials(employee.name) }}
                        </div>
                        <span class="employee-name" @click="viewEmployeeMonthlyAttendance(employee.name)">
                          {{ employee.name }}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div v-if="employee.salary" class="salary-amount">
                        <i class="fas fa-rupee-sign"></i> {{ formatSalary(employee.salary) }}
                      </div>
                      <button v-else class="calculate-btn" @click="calculateSalaryOnClick(employee)" :disabled="employee.calculating">
                        <i v-if="employee.calculating" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-calculator"></i>
                        {{ employee.calculating ? "Calculating..." : "Calculate" }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer-premium" :class="{ 'mobile-footer': isMobile }">
            <button class="btn-submit-premium" @click="showPopupsalary = false">
              <i class="fas fa-check"></i> Close
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Monthly Attendance Modal - Mobile Optimized -->
    <transition name="modal-fade">
      <div v-if="showPopup" class="modal-backdrop" @click.self="showPopup = false">
        <div class="premium-modal monthly-modal" :class="{ 'mobile-modal': isMobile }" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="header-text">
              <h2>{{ selectedEmployee }}'s Attendance</h2>
              <p>Monthly attendance overview</p>
            </div>
            <button class="close-btn-premium" @click="showPopup = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body-premium">
            <div class="month-navigation">
              <button @click="goToPreviousMonth" class="nav-btn">
                <i class="fas fa-chevron-left"></i>
              </button>
              <h4>{{ getMonthName(currentMonth) }} {{ currentYear }}</h4>
              <button @click="goToNextMonth" class="nav-btn">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>

            <div class="legend-grid">
              <span class="legend-item present">✓ Present: {{ statusSummary.Present || 0 }}</span>
              <span class="legend-item absent">✗ Absent: {{ statusSummary.Absent || 0 }}</span>
              <span class="legend-item halfday">½ Half Day: {{ statusSummary.HalfDay || 0 }}</span>
              <span class="legend-item onsite">🏢 On Site: {{ statusSummary.OnSite || 0 }}</span>
              <span class="legend-item traveling">✈ Traveling: {{ statusSummary.Traveling || 0 }}</span>
              <span class="legend-item leave">🌴 Leave: {{ statusSummary.Leave || 0 }}</span>
            </div>

            <div class="calendar-container">
              <table class="calendar-premium">
                <thead>
                  <tr>
                    <th v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day">{{ day }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="week in buildCalendar(employeeMonthlyData)" :key="week[0]?.date">
                    <td v-for="day in week" :key="day.date" :class="day.statusClass">
                      {{ day.day }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer-premium" :class="{ 'mobile-footer': isMobile }">
            <button class="btn-submit-premium" @click="showPopup = false">
              <i class="fas fa-check"></i> Close
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Salary Result Popup - Mobile Optimized -->
    <transition name="modal-fade">
      <div v-if="salaryPopup.show" class="modal-backdrop" @click.self="salaryPopup.show = false">
        <div class="premium-modal result-modal" :class="{ 'mobile-modal': isMobile }" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium success-icon">
              <i class="fas fa-rupee-sign"></i>
            </div>
            <div class="header-text">
              <h2>Salary Summary</h2>
              <p>{{ salaryPopup.employeeName }}</p>
            </div>
            <button class="close-btn-premium" @click="salaryPopup.show = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body-premium text-center">
            <div class="salary-result">
              <div class="salary-amount-large">
                <i class="fas fa-rupee-sign"></i>
                <span>{{ formatSalary(salaryPopup.calculatedSalary) }}</span>
              </div>
              <p class="month-text">{{ getMonthName(currentMonth) }} {{ currentYear }}</p>
              <div class="success-check">
                <i class="fas fa-check-circle"></i>
                <span>Salary calculated successfully</span>
              </div>
            </div>
          </div>

          <div class="modal-footer-premium" :class="{ 'mobile-footer': isMobile }">
            <button class="btn-submit-premium" @click="salaryPopup.show = false">
              <i class="fas fa-check"></i> Done
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Late Marks Details Modal -->
    <transition name="modal-fade">
      <div v-if="showLateMarksModal" class="modal-backdrop" @click.self="showLateMarksModal = false">
        <div class="premium-modal late-modal" :class="{ 'mobile-modal': isMobile }" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium warning-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="header-text">
              <h2>Late Marks Details</h2>
              <p>Monthly late marks and penalties (Threshold: 9:40 AM)</p>
            </div>
            <button class="close-btn-premium" @click="showLateMarksModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body-premium">
            <div class="late-summary-stats">
              <div class="late-stat-card">
                <span class="stat-number">{{ totalLateMarks }}</span>
                <span class="stat-label">Total Late Marks</span>
              </div>
              <div class="late-stat-card">
                <span class="stat-number">{{ totalPenaltiesApplied }}</span>
                <span class="stat-label">Total Penalties</span>
              </div>
              <div class="late-stat-card">
                <span class="stat-number">{{ totalPenaltyAmount }}</span>
                <span class="stat-label">CL Deducted</span>
              </div>
            </div>

            <div class="monthly-late-list" v-if="monthlyLateSummary.length > 0">
              <h4>Monthly Breakdown</h4>
              <div v-for="item in monthlyLateSummary" :key="item.month" class="monthly-late-item">
                <div class="month-info">
                  <span class="month-name">{{ item.month_name }}</span>
                  <span class="month-count">{{ item.late_count }} late marks</span>
                </div>
                <div class="month-penalties">
                  <span v-if="item.penalties_applied > 0" class="penalty-applied">
                    <i class="fas fa-check-circle"></i> {{ item.penalties_applied }} penalty(ies)
                  </span>
                  <span v-if="item.pending_penalties > 0" class="pending-penalty">
                    <i class="fas fa-clock"></i> {{ item.pending_penalties }} pending
                  </span>
                  <span v-else-if="item.penalties_applied === 0 && item.late_count > 0" class="no-penalty">
                    <i class="fas fa-info-circle"></i> Below threshold
                  </span>
                </div>
              </div>
            </div>
            
            <div class="penalty-info-box">
              
              <span>
                <strong>&nbsp; Rule:</strong> Every 3 late marks (after 9:40 AM) = 1 penalty (0.5 CL deduction)
              </span>
            </div>
          </div>

          <div class="modal-footer-premium" :class="{ 'mobile-footer': isMobile }">
            <button class="btn-submit-premium" @click="showLateMarksModal = false">
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
  components: {
    Sidebar
  },
  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      showMarkAttendancePopup: false,
      showPopupsalary: false,
      showPopup: false,
      showLateMarksModal: false,
      scoreSaved: false,
      selectedEmployee: null,
      employeeMonthlyData: [],
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      today: '',
      searchQuery: '',
      statusFilter: 'all',
      markAttendance: {
        employee: '',
        status: '',
        date: '',
        time: '',
        site_name: "",
        travel_from: "",
        travel_to: ""
      },
      employees: [],
      attendanceRecords: [],
      salaryPopup: {
        show: false,
        employeeName: '',
        calculatedSalary: 0
      },
      statusSummary: {
        Present: 0,
        Absent: 0,
        OnSite: 0,
        HalfDay: 0,
        Traveling: 0,
        Leave: 0
      },
      attendanceByMonth: {},
      holidays: [],
      // Late marks data
      lateMarksData: [],
      monthlyLateSummary: [],
      totalLateMarks: 0,
      totalPenaltiesApplied: 0,
      totalPenaltyAmount: 0,
      lateMarksLoading: false
    }
  },
  computed: {
    presentCount() {
      return this.attendanceRecords.filter(r => r.status === 'Present').length
    },
    lateCount() {
      return this.attendanceRecords.filter(r => r.isLate === true).length
    },
    lastUpdated() {
      return new Date().toLocaleTimeString()
    },
    filteredRecords() {
      let filtered = this.attendanceRecords;
      
      // Status filter
      if (this.statusFilter === 'Present') {
        filtered = filtered.filter(r => r.status === 'Present');
      } else if (this.statusFilter === 'Late') {
        filtered = filtered.filter(r => r.isLate === true);
      }
      
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(r => 
          r.name.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    }
  },
  methods: {
    filterByStatus(status) {
      this.statusFilter = this.statusFilter === status ? 'all' : status;
    },
    getInitials(name) {
      if (!name) return '?'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    },
    formatSalary(amount) {
      if (!amount) return '0'
      return parseFloat(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    getStatusClass(status) {
      if (!status) return ''
      const normalized = status.toLowerCase()
      switch (normalized) {
        case 'present': return 'present'
        case 'onsite': return 'onsite'
        case 'halfday': return 'halfday'
        case 'absent': return 'absent'
        case 'traveling': return 'traveling'
        case 'leave': return 'leave'
        default: return ''
      }
    },
    getStatusIcon(status) {
      if (!status) return 'fas fa-question'
      const normalized = status.toLowerCase()
      switch (normalized) {
        case 'present': return 'fas fa-check-circle'
        case 'onsite': return 'fas fa-building'
        case 'halfday': return 'fas fa-adjust'
        case 'absent': return 'fas fa-times-circle'
        case 'traveling': return 'fas fa-plane'
        case 'leave': return 'fas fa-umbrella-beach'
        default: return 'fas fa-tag'
      }
    },
    // LATE THRESHOLD: 9:40 AM (matches backend)
    isLate(clockIn) {
      if (!clockIn) return false
      const lateThreshold = new Date()
      lateThreshold.setHours(9, 40, 0)
      const clockInParts = clockIn.split(':').map(Number)
      const clockInDate = new Date()
      clockInDate.setHours(clockInParts[0], clockInParts[1], clockInParts[2] || 0)
      return clockInDate > lateThreshold
    },
    isEarly(clockIn) {
      if (!clockIn) return false
      const earlyThreshold = new Date()
      earlyThreshold.setHours(9, 30, 0)
      const clockInParts = clockIn.split(':').map(Number)
      const clockInDate = new Date()
      clockInDate.setHours(clockInParts[0], clockInParts[1], clockInParts[2] || 0)
      return clockInDate < earlyThreshold
    },
    calculateLateTime(clockIn) {
      const lateThreshold = new Date()
      lateThreshold.setHours(9, 40, 0)
      const clockInParts = clockIn.split(':').map(Number)
      const clockInDate = new Date()
      clockInDate.setHours(clockInParts[0], clockInParts[1], clockInParts[2] || 0)
      const diffMs = clockInDate - lateThreshold
      if (diffMs <= 0) return '00:00:00'
      const totalSeconds = Math.floor(diffMs / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },
    calculateEarlyTime(clockIn) {
      const earlyThreshold = new Date()
      earlyThreshold.setHours(9, 30, 0)
      const clockInParts = clockIn.split(':').map(Number)
      const clockInDate = new Date()
      clockInDate.setHours(clockInParts[0], clockInParts[1], clockInParts[2] || 0)
      const diffMs = earlyThreshold - clockInDate
      if (diffMs <= 0) return '00:00:00'
      const totalSeconds = Math.floor(diffMs / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },
    async submitMarkedAttendance() {
      if (!this.markAttendance.employee || !this.markAttendance.status || !this.markAttendance.date) {
        toastWarning('Please fill all required fields')
        return
      }
      try {
        await axios.post('https://employees.archenterprises.co.in/api/api/attendance/store-or-update', {
          name: this.markAttendance.employee,
          status: this.markAttendance.status,
          clock_in: this.markAttendance.time || null,
          date: this.markAttendance.date,
          site_name: this.markAttendance.site_name || null,
          travel_from: this.markAttendance.travel_from || null,
          travel_to: this.markAttendance.travel_to || null
        })
        toastSuccess('Attendance saved successfully')
        this.showMarkAttendancePopup = false
        this.markAttendance = { employee: '', status: '', date: '', time: '', site_name: '', travel_from: '', travel_to: '' }
        this.fetchAttendance()
        this.fetchLateMarksSummary()
      } catch (error) {
        console.error('Error saving attendance:', error)
        toastError('Failed to save attendance')
      }
    },
    async fetchAllEmployees() {
      try {
        const res = await axios.get('https://employees.archenterprises.co.in/api/api/users')
        this.employees = res.data.filter(user => user.department !== 'Ownership').map(user => ({
          id: user.id,
          name: user.name,
          salary: user.salary || null,
          department: user.department,
          calculating: false
        }))
      } catch (err) {
        console.error('Error fetching employees:', err)
      }
    },
    async fetchAttendance() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/attendance')
        this.attendanceRecords = response.data.filter(record => record.status?.trim()?.toUpperCase() !== 'N/A')
      } catch (error) {
        console.error('Error fetching attendance:', error)
      }
    },
    async fetchLateMarksSummary() {
      this.lateMarksLoading = true;
      try {
        const token = localStorage.getItem('token');
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        
        // If no employees, return
        if (this.employees.length === 0) {
          this.lateMarksLoading = false;
          return;
        }
        
        const employeeNames = this.employees.map(emp => emp.name);
        const lateData = [];
        let totalLate = 0;
        let totalPenalties = 0;
        let totalPenaltyAmt = 0;
        let allMonthlySummary = [];
        
        // Fetch late marks for each employee for the current month
        for (const name of employeeNames) {
          try {
            // First try to get current month's late marks
            const response = await axios.get(
              `https://employees.archenterprises.co.in/api/api/attendance/late-marks`,
              {
                params: {
                  name: name,
                  month: currentMonth,
                  year: currentYear
                },
                headers: { 
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            console.log(`Late marks for ${name}:`, response.data);
            
            if (response.data && response.data.success) {
              const data = response.data.data;
              const lateCount = data.late_count || 0;
              
              // Always include employees with late marks, even if 0 (for debugging)
              if (lateCount > 0) {
                const penaltiesCalculated = Math.floor(lateCount / 3);
                const penaltiesApplied = data.penalties_applied || 0;
                const penaltyAmount = data.penalty_amount_applied || 0;
                
                lateData.push({
                  name: name,
                  late_count: lateCount,
                  penalties_applied: penaltiesApplied,
                  penalty_amount: penaltyAmount,
                  pending_penalties: Math.max(0, penaltiesCalculated - penaltiesApplied)
                });
                
                totalLate += lateCount;
                totalPenalties += penaltiesApplied;
                totalPenaltyAmt += penaltyAmount;
              }
            }
          } catch (e) {
            console.error(`Error fetching late marks for ${name}:`, e);
          }
        }
        
        // If we have data, also fetch yearly summary for the modal
        if (lateData.length > 0) {
          try {
            const summaryResponse = await axios.get(
              `https://employees.archenterprises.co.in/api/api/attendance/late-marks-summary`,
              {
                params: {
                  name: this.employees[0]?.name || '',
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
              if (data.monthly_summary) {
                allMonthlySummary = Object.values(data.monthly_summary);
                // Update totals from summary
                totalLate = data.total_late_marks || totalLate;
                totalPenalties = data.total_penalties_applied || totalPenalties;
                totalPenaltyAmt = data.total_penalty_amount || totalPenaltyAmt;
              }
            }
          } catch (e) {
            console.error('Error fetching summary:', e);
          }
        }
        
        this.lateMarksData = lateData;
        this.monthlyLateSummary = allMonthlySummary;
        this.totalLateMarks = totalLate;
        this.totalPenaltiesApplied = totalPenalties;
        this.totalPenaltyAmount = totalPenaltyAmt;
        
        console.log('Late Marks Data:', {
          lateData: this.lateMarksData,
          totalLate: this.totalLateMarks,
          totalPenalties: this.totalPenaltiesApplied,
          totalPenaltyAmount: this.totalPenaltyAmount,
          monthlySummary: this.monthlyLateSummary
        });
        
        this.lateMarksLoading = false;
      } catch (error) {
        console.error('Error fetching late marks summary:', error);
        this.lateMarksLoading = false;
      }
    },
    getLateProgressClass(count) {
      if (count >= 9) return 'critical';
      if (count >= 6) return 'warning';
      if (count >= 3) return 'moderate';
      return 'good';
    },
    getLateCountClass(count) {
      if (count >= 9) return 'critical';
      if (count >= 6) return 'warning';
      if (count >= 3) return 'moderate';
      return 'good';
    },
    getLateStatusClass(item) {
      if (item.pending_penalties > 0) return 'pending';
      if (item.penalties_applied > 0) return 'penalty-applied';
      if (item.late_count >= 3) return 'warning';
      return 'good';
    },
    getLateStatusIcon(item) {
      if (item.pending_penalties > 0) return 'fas fa-clock';
      if (item.penalties_applied > 0) return 'fas fa-check-circle';
      if (item.late_count >= 3) return 'fas fa-exclamation-triangle';
      return 'fas fa-check';
    },
    getLateStatusText(item) {
      if (item.pending_penalties > 0) return 'Pending';
      if (item.penalties_applied > 0) return 'Penalty Applied';
      if (item.late_count >= 3) return 'Needs Action';
      return 'Good';
    },
    async calculateSalaryOnClick(record) {
      record.calculating = true
      try {
        const [monthlyRes, salaryRes] = await Promise.all([
          axios.get(`https://employees.archenterprises.co.in/api/api/attendance/monthly/${record.name}?month=${this.currentMonth + 1}&year=${this.currentYear}`),
          axios.get(`https://employees.archenterprises.co.in/api/api/user-salary-by-name/${record.name}`)
        ])
        const monthlyData = monthlyRes.data.data || []
        const baseSalary = parseFloat(salaryRes.data.salary) || 0
        const totalDaysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate()
        const perDaySalary = baseSalary / totalDaysInMonth
        let fullPaidDays = 0
        monthlyData.forEach(day => {
          const status = day.status?.trim().toLowerCase()
          if (['present', 'onsite', 'traveling', 'leave'].includes(status)) {
            fullPaidDays++
          } else if (status === 'halfday') {
            fullPaidDays++
          }
        })
        let sundayCount = 0
        for (let i = 1; i <= totalDaysInMonth; i++) {
          const date = new Date(this.currentYear, this.currentMonth, i)
          if (date.getDay() === 0) sundayCount++
        }
        const salaryForMonth = (fullPaidDays * perDaySalary) + (sundayCount * perDaySalary)
        record.salary = Math.round(salaryForMonth)
        this.salaryPopup = {
          show: true,
          employeeName: record.name,
          calculatedSalary: Math.round(salaryForMonth)
        }
      } catch (error) {
        console.error(`Error calculating salary for ${record.name}:`, error)
        toastError('Failed to calculate salary')
      } finally {
        record.calculating = false
      }
    },
    async viewEmployeeMonthlyAttendance(name) {
      this.selectedEmployee = name
      this.showPopup = true
      const month = this.currentMonth + 1
      const year = this.currentYear
      try {
        const response = await axios.get(`https://employees.archenterprises.co.in/api/api/attendance/monthly/${name}?month=${month}&year=${year}`)
        this.employeeMonthlyData = response.data.data || []
        this.statusSummary = {
          Present: 0, Absent: 0, OnSite: 0, HalfDay: 0, Traveling: 0, Leave: 0
        }
        this.employeeMonthlyData.forEach(record => {
          const status = record.status?.trim()
          if (status && this.statusSummary.hasOwnProperty(status)) {
            this.statusSummary[status]++
          }
        })
      } catch (error) {
        console.error('Error fetching monthly attendance:', error)
      }
    },
    goToPreviousMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11
        this.currentYear -= 1
      } else {
        this.currentMonth -= 1
      }
      this.viewEmployeeMonthlyAttendance(this.selectedEmployee)
    },
    goToNextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0
        this.currentYear += 1
      } else {
        this.currentMonth += 1
      }
      this.viewEmployeeMonthlyAttendance(this.selectedEmployee)
    },
    getMonthName(index) {
      return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][index]
    },
    buildCalendar(attendanceData) {
      const year = this.currentYear
      const month = this.currentMonth
      const firstDayOfMonth = new Date(year, month, 1)
      const lastDayOfMonth = new Date(year, month + 1, 0)
      const daysInMonth = lastDayOfMonth.getDate()
      const calendar = []
      let week = []
      const padDay = firstDayOfMonth.getDay()
      for (let i = 0; i < padDay; i++) {
        week.push({ day: '', date: '', statusClass: '' })
      }
      const getStatusClass = (dateStr) => {
        const record = attendanceData.find(entry => new Date(entry.date).toISOString().split('T')[0] === dateStr)
        if (!record || !record.status) return ''
        return `cal-${record.status.toLowerCase().replace(/\s+/g, '-')}`
      }
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        week.push({ day, date: dateStr, statusClass: getStatusClass(dateStr) })
        if (week.length === 7) {
          calendar.push(week)
          week = []
        }
      }
      if (week.length > 0) {
        while (week.length < 7) {
          week.push({ day: '', date: '', statusClass: '' })
        }
        calendar.push(week)
      }
      return calendar
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  },
  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    this.today = `${yyyy}-${mm}-${dd}`
    this.markAttendance.date = this.today
    this.currentDate = this.formatDate(new Date())
    this.fetchAllEmployees()
    this.fetchAttendance()
    // Wait for employees to load before fetching late marks
    setTimeout(() => {
      this.fetchLateMarksSummary()
    }, 500)
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  }
}
</script>


<style scoped>
.late-marks-summary-wrapper {
  margin-top: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  overflow: hidden;
}

.mobile-late-cards {
  display: none;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.late-mark-card {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
}

.late-mark-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 8px;
}

.late-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  background: #e5e7eb;
  color: #6b7280;
}

.late-count-badge.critical {
  background: #fee2e2;
  color: #991b1b;
}

.late-count-badge.warning {
  background: #fef3c7;
  color: #d97706;
}

.late-count-badge.moderate {
  background: #fef3c7;
  color: #d97706;
}

.late-count-badge.good {
  background: #d1fae5;
  color: #065f46;
}

.late-mark-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.late-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.late-detail .detail-label {
  color: #6b7280;
}

.late-detail .detail-value {
  font-weight: 500;
  color: #1a1a2e;
}

.late-detail .detail-value.has-penalty {
  color: #dc2626;
  font-weight: 700;
}

.late-detail .detail-value.penalty-amount {
  color: #dc2626;
  font-weight: 700;
}

.late-detail .detail-value.warning {
  color: #d97706;
  font-weight: 600;
}

.late-detail .detail-label.pending {
  color: #d97706;
}

.late-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.late-progress .progress-bar-bg {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.late-progress .progress-bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.6s ease;
}

.late-progress .progress-bar-fill.good {
  background: #10b981;
}

.late-progress .progress-bar-fill.moderate {
  background: #f59e0b;
}

.late-progress .progress-bar-fill.warning {
  background: #f97316;
}

.late-progress .progress-bar-fill.critical {
  background: #ef4444;
}

.late-progress .progress-label {
  font-size: 11px;
  color: #6b7280;
  min-width: 50px;
  text-align: right;
}

.penalty-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  background: #e5e7eb;
  color: #6b7280;
}

.penalty-badge.has-penalty {
  background: #fee2e2;
  color: #991b1b;
}

.penalty-amount {
  font-weight: 600;
  color: #dc2626;
}

.no-penalty {
  color: #9ca3af;
}

.pending-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #d97706;
  font-weight: 500;
  font-size: 13px;
}

.no-pending {
  color: #10b981;
}

.status-badge-premium.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge-premium.penalty-applied {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge-premium.warning {
  background: #fef3c7;
  color: #d97706;
}

.status-badge-premium.good {
  background: #d1fae5;
  color: #065f46;
}

/* Late Marks Modal Styles */
.warning-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706) !important;
}

.late-summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.late-stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.late-stat-card .stat-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
}

.late-stat-card .stat-label {
  font-size: 12px;
  color: #6b7280;
}

.monthly-late-list {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
}

.monthly-late-list h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 12px;
}

.monthly-late-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.monthly-late-item:last-child {
  border-bottom: none;
}

.month-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.month-name {
  font-weight: 500;
  color: #1a1a2e;
}

.month-count {
  font-size: 13px;
  color: #6b7280;
}

.month-penalties {
  display: flex;
  gap: 8px;
  align-items: center;
}

.penalty-applied {
  color: #dc2626;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.pending-penalty {
  color: #d97706;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.month-penalties .no-penalty {
  font-size: 12px;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .mobile-late-cards {
    display: flex;
  }
  
  .late-summary-stats {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
  }
  
  .late-stat-card {
    padding: 10px;
  }
  
  .late-stat-card .stat-number {
    font-size: 18px;
  }
  
  .monthly-late-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .month-penalties {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .late-summary-stats {
    grid-template-columns: 1fr 1fr;
  }
  
  .late-stat-card {
    padding: 8px;
  }
  
  .late-stat-card .stat-number {
    font-size: 16px;
  }
}

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

.content {
  flex: 1;
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

.mobile-actions {
  display: flex;
  gap: 8px;
}

.mobile-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--primary);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-action-btn:active {
  transform: scale(0.9);
}

.mobile-action-btn.secondary {
  background: linear-gradient(135deg, #10b981, #059669);
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
  font-size: 22px;
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
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

.stat-card i {
  font-size: 36px;
  color: var(--primary-color);
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

/* Current Date Badge */
.current-date-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 40px;
  margin-bottom: 24px;
  font-weight: 500;
  color: var(--primary-color);
}

.current-date-badge i {
  font-size: 16px;
}

/* Search Bar - Mobile */
.search-bar-mobile {
  display: none;
  margin-bottom: 16px;
}

.search-group-mobile {
  position: relative;
  flex: 1;
}

.search-group-mobile i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input-mobile {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  transition: all 0.3s ease;
}

.search-input-mobile:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* Table Styles */
.table-wrapper-premium {
  background: white;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fafbfc;
  border-bottom: 1px solid #e5e7eb;
}

.section-title-modern {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #1a1a2e;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title-modern i {
  color: var(--primary-color);
}

.record-count-mobile {
  background: var(--primary);
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 4px;
}

.table-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.table-container {
  overflow-x: auto;
}

.attendance-table-premium {
  width: 100%;
  border-collapse: collapse;
}

.attendance-table-premium thead {
  background: #f8fafc;
}

.attendance-table-premium th {
  text-align: left;
  padding: 16px 16px;
  font-weight: 600;
  font-size: 13px;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.attendance-table-premium td {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.attendance-table-premium tbody tr {
  transition: all 0.3s ease;
}

.attendance-table-premium tbody tr:hover {
  background: #fafbfc;
}

/* Mobile Cards */
.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.attendance-card {
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

.employee-info-card {
  display: flex;
  align-items: center;
  gap: 10px;
}

.employee-avatar {
  width: 36px;
  height: 36px;
  background: var(--primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 13px;
}

.employee-name {
  font-weight: 500;
  color: #1a1a2e;
}

.status-badge-mobile {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.status-badge-mobile.present {
  background: #d1fae5;
  color: #065f46;
}

.status-badge-mobile.onsite {
  background: #e0e7ff;
  color: #4338ca;
}

.status-badge-mobile.halfday {
  background: #fed7aa;
  color: #c2410c;
}

.status-badge-mobile.absent {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge-mobile.traveling {
  background: #fef3c7;
  color: #d97706;
}

.status-badge-mobile.leave {
  background: #f3e8ff;
  color: #7e22ce;
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
  gap: 8px;
}

.card-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-value {
  font-size: 13px;
  color: var(--dark);
  text-align: right;
}

.card-value.actual-time {
  font-weight: 600;
  color: var(--primary-color);
}

.late-warning-mobile {
  font-size: 11px;
  color: var(--danger);
  display: flex;
  align-items: center;
  gap: 4px;
}

.early-info-mobile {
  font-size: 11px;
  color: var(--success);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Empty State Mobile */
.empty-state-mobile {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-state-mobile i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state-mobile h4 {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 6px;
}

.empty-state-mobile p {
  font-size: 13px;
}

/* Employee Cell */
.employee-cell {
  min-width: 180px;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-avatar {
  width: 36px;
  height: 36px;
  background: var(--primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 13px;
}

.employee-name {
  font-weight: 500;
  color: #1a1a2e;
}

/* Status Badge */
.status-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-badge-premium {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
}

.status-badge-premium.present {
  background: #d1fae5;
  color: #065f46;
}

.status-badge-premium.onsite {
  background: #e0e7ff;
  color: #4338ca;
}

.status-badge-premium.halfday {
  background: #fed7aa;
  color: #c2410c;
}

.status-badge-premium.absent {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge-premium.traveling {
  background: #fef3c7;
  color: #d97706;
}

.status-badge-premium.leave {
  background: #f3e8ff;
  color: #7e22ce;
}

.late-warning {
  font-size: 11px;
  color: var(--danger);
  display: flex;
  align-items: center;
  gap: 4px;
}

.early-info {
  font-size: 11px;
  color: var(--success);
  display: flex;
  align-items: center;
  gap: 4px;
}

.time-cell {
  color: #6b7280;
  font-family: monospace;
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
  max-width: 550px;
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

.premium-modal.salary-modal {
  max-width: 600px;
}

.premium-modal.monthly-modal {
  max-width: 750px;
}

.premium-modal.result-modal {
  max-width: 450px;
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

/* Modal Header */
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

.header-icon-premium.success-icon {
  background: linear-gradient(135deg, #10b981, #059669);
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
  background: var(--danger);
  color: white;
  transform: rotate(90deg);
}

/* Modal Body */
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

.field-wrapper input:focus,
.field-wrapper select:focus,
.field-wrapper textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.two-col-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.mobile-modal .two-col-grid {
  grid-template-columns: 1fr;
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

/* Salary Table */
.table-wrapper-salary {
  max-height: 400px;
  overflow-y: auto;
}

.salary-table-premium {
  width: 100%;
  border-collapse: collapse;
}

.salary-table-premium thead {
  background: #f8fafc;
  position: sticky;
  top: 0;
}

.salary-table-premium th {
  text-align: left;
  padding: 12px;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
}

.salary-table-premium td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

/* Mobile Salary Cards */
.mobile-salary-cards {
  display: none;
  flex-direction: column;
  gap: 12px;
}

.salary-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
}

.salary-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.employee-info-small {
  display: flex;
  align-items: center;
  gap: 10px;
}

.employee-avatar-small {
  width: 32px;
  height: 32px;
  background: var(--primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
}

.salary-card-body {
  display: flex;
  justify-content: flex-end;
}

.salary-amount-mobile {
  font-weight: 600;
  color: var(--success);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
}

.calculate-btn-mobile {
  background: #e0e7ff;
  color: var(--primary-color);
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  justify-content: center;
}

.calculate-btn-mobile:active {
  transform: scale(0.97);
}

.calculate-btn-mobile:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.salary-amount {
  font-weight: 600;
  color: var(--success);
  display: flex;
  align-items: center;
  gap: 4px;
}

.calculate-btn {
  background: #e0e7ff;
  color: var(--primary-color);
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.calculate-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: rgb(0, 0, 0);
}

.calculate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Monthly Modal Styles */
.attendance-score-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-radius: 30px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #065f46;
}

.month-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 20px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f3f4f6;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: var(--primary-color);
  color: white;
}

.nav-btn:active {
  transform: scale(0.9);
}

.legend-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 16px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
}

.mobile-modal .legend-item {
  font-size: 10px;
  padding: 2px 8px;
}

.legend-item.present { background: #d1fae5; color: #065f46; }
.legend-item.absent { background: #fee2e2; color: #991b1b; }
.legend-item.halfday { background: #fed7aa; color: #c2410c; }
.legend-item.onsite { background: #e0e7ff; color: #4338ca; }
.legend-item.traveling { background: #fef3c7; color: #d97706; }
.legend-item.leave { background: #f3e8ff; color: #7e22ce; }

.calendar-container {
  overflow-x: auto;
}

.calendar-premium {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

.calendar-premium th {
  padding: 12px;
  background: #f8fafc;
  font-weight: 600;
  color: #6b7280;
}

.mobile-modal .calendar-premium th {
  padding: 6px 4px;
  font-size: 11px;
}

.calendar-premium td {
  padding: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.mobile-modal .calendar-premium td {
  padding: 6px 4px;
  font-size: 11px;
}

.calendar-premium td:hover {
  transform: scale(1.02);
}

.cal-present { background: #d1fae5 !important; color: #065f46; font-weight: 600; }
.cal-absent { background: #fee2e2 !important; color: #991b1b; }
.cal-halfday { background: #fed7aa !important; color: #c2410c; }
.cal-onsite { background: #e0e7ff !important; color: #4338ca; }
.cal-traveling { background: #fef3c7 !important; color: #d97706; }
.cal-leave { background: #f3e8ff !important; color: #7e22ce; }

/* Salary Result */
.salary-result {
  text-align: center;
  padding: 20px;
}

.mobile-modal .salary-result {
  padding: 12px;
}

.salary-amount-large {
  font-size: 48px;
  font-weight: 800;
  color: var(--success);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.mobile-modal .salary-amount-large {
  font-size: 36px;
}

.salary-amount-large i {
  font-size: 40px;
}

.mobile-modal .salary-amount-large i {
  font-size: 30px;
}

.month-text {
  color: #6b7280;
  margin-bottom: 20px;
}

.success-check {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #d1fae5;
  border-radius: 12px;
  color: #065f46;
}

/* Empty State */
.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-state-premium i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state-premium h4 {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 8px;
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
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 12px;
  }

  .content {
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
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .stat-card {
    padding: 14px;
    flex-direction: column;
    text-align: center;
    gap: 6px;
  }

  .stat-card i {
    font-size: 24px;
  }

  .stat-value {
    font-size: 18px;
  }

  .stat-label {
    font-size: 10px;
  }

  .search-bar-mobile {
    display: block;
  }

  .mobile-cards {
    display: flex;
  }

  .table-container {
    display: none;
  }

  .table-header {
    padding: 12px 16px;
  }

  .section-title-modern {
    font-size: 14px;
  }

  .table-info {
    display: none;
  }

  .mobile-salary-cards {
    display: flex;
  }

  .salary-table-premium {
    display: none;
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

  .two-col-grid {
    grid-template-columns: 1fr;
  }

  .legend-grid {
    gap: 8px;
  }

  .legend-item {
    font-size: 10px;
    padding: 2px 8px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }

  .content {
    padding: 12px;
    border-radius: 16px;
  }

  .mobile-title {
    font-size: 16px;
  }

  .mobile-action-btn {
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
    font-size: 16px;
  }

  .attendance-card {
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
    text-align: left;
  }

  .status-badge-mobile {
    align-self: flex-start;
  }

  .search-input-mobile {
    font-size: 15px;
    padding: 8px 10px 8px 34px;
  }

  .salary-card {
    padding: 10px;
  }

  .salary-amount-mobile {
    font-size: 14px;
  }

  .calculate-btn-mobile {
    font-size: 12px;
    padding: 6px 12px;
  }

  .salary-amount-large {
    font-size: 30px;
  }

  .salary-amount-large i {
    font-size: 24px;
  }

  .calendar-premium td {
    padding: 4px 2px;
    font-size: 10px;
  }

  .calendar-premium th {
    padding: 4px 2px;
    font-size: 10px;
  }
}
</style>