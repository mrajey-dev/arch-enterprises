<template>
  <div class="layout">
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- Clean, Sweet Header -->
        <div class="simple-header">
          <div class="header-titles">
            <h1 class="page-title">Daily Attendance</h1>
            <p class="page-subtitle">{{ displayDateFormatted }}</p>
          </div>

          <div class="header-buttons">
            <button class="btn-mark" @click="showMarkAttendancePopup = true">
              <i class="fas fa-plus"></i>
              <span>Mark Attendance</span>
            </button>
            <button class="btn-secondary" @click="showPopupsalary = true">
              <i class="fas fa-calculator"></i>
              <span>Salary</span>
            </button>
            <button class="btn-secondary" @click="showLateMarksModal = true" :class="{ 'has-late': totalLateMarks > 0 }">
              <i class="fas fa-clock"></i>
              <span>Late Marks</span>
              <span class="late-count-bubble" v-if="totalLateMarks > 0">{{ totalLateMarks }}</span>
            </button>
          </div>
        </div>

        <!-- Clean Metric Pills (Clickable to Filter) -->
        <div class="summary-strip">
          <div
            class="summary-pill"
            :class="{ active: statusFilter === 'all' }"
            @click="filterByStatus('all')"
          >
            <span class="pill-dot dot-all"></span>
            <span class="pill-label">Total Staff</span>
            <span class="pill-value">{{ displayRecords.length }}</span>
          </div>

          <div
            class="summary-pill"
            :class="{ active: statusFilter === 'Present' }"
            @click="filterByStatus('Present')"
          >
            <span class="pill-dot dot-present"></span>
            <span class="pill-label">Present</span>
            <span class="pill-value text-present">{{ presentCount }}</span>
          </div>

          <div
            class="summary-pill"
            :class="{ active: statusFilter === 'Leave' }"
            @click="filterByStatus('Leave')"
          >
            <span class="pill-dot dot-leave"></span>
            <span class="pill-label">Leave</span>
            <span class="pill-value text-leave">{{ leaveCount }}</span>
          </div>

          <div
            class="summary-pill"
            :class="{ active: statusFilter === 'OnSite' }"
            @click="filterByStatus('OnSite')"
          >
            <span class="pill-dot dot-onsite"></span>
            <span class="pill-label">On Site</span>
            <span class="pill-value text-onsite">{{ onSiteCount }}</span>
          </div>

          <div
            class="summary-pill"
            :class="{ active: statusFilter === 'Traveling' }"
            @click="filterByStatus('Traveling')"
          >
            <span class="pill-dot dot-traveling"></span>
            <span class="pill-label">Traveling</span>
            <span class="pill-value text-traveling">{{ travelingCount }}</span>
          </div>

          <div
            class="summary-pill"
            :class="{ active: statusFilter === 'HalfDay' }"
            @click="filterByStatus('HalfDay')"
          >
            <span class="pill-dot dot-halfday"></span>
            <span class="pill-label">Half Day</span>
            <span class="pill-value text-halfday">{{ halfDayCount }}</span>
          </div>

          <div
            class="summary-pill"
            :class="{ active: statusFilter === 'Absent' }"
            @click="filterByStatus('Absent')"
          >
            <span class="pill-dot dot-absent"></span>
            <span class="pill-label">Absent</span>
            <span class="pill-value text-absent">{{ absentCount }}</span>
          </div>

          <div
            class="summary-pill"
            :class="{ active: statusFilter === 'Late' }"
            @click="filterByStatus('Late')"
          >
            <span class="pill-dot dot-late"></span>
            <span class="pill-label">Late Today</span>
            <span class="pill-value text-late">{{ todayLateCount }}</span>
          </div>
        </div>

        <!-- Unified Date Navigator & Search Bar (Single Row!) -->
        <div class="toolbar-single-row">
          <!-- Date Navigator -->
          <div class="date-navigator-sweet">
            <button class="nav-arrow" @click="changeDisplayDate(-1)" title="Previous day">
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="date-pill" @click="openDatePickerModal" title="Click to pick any date">
              <i class="far fa-calendar-alt"></i>
              <span>{{ displayDateFormatted }}</span>
            </div>
            <button class="nav-arrow" @click="changeDisplayDate(1)" title="Next day">
              <i class="fas fa-chevron-right"></i>
            </button>
            <button class="btn-today" @click="goToTodayDisplay">
              Today
            </button>
          </div>

          <!-- Search Input -->
          <div class="search-sweet">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search employee..."
              class="search-input"
            />
            <button v-if="searchQuery" class="btn-clear-search" @click="searchQuery = ''">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="displayLoading" class="simple-loading">
          <i class="fas fa-circle-notch fa-spin"></i>
          <span>Loading attendance...</span>
        </div>

        <!-- Clean, Sweet Attendance Table -->
        <div v-else class="table-card-sweet">
          <table class="table-sweet">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Status</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Working Time</th>
                <th class="text-right">History</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="record in filteredDisplayRecords"
                :key="record.id || record.name"
                class="row-sweet"
              >
                <!-- Employee -->
                <td class="td-employee">
                  <div class="emp-identity" @click="viewEmployeeMonthlyAttendance(record.name)">
                    <div class="avatar-sweet" :style="{ background: getAvatarGradient(record.name) }">
                      {{ getInitials(record.name) }}
                    </div>
                    <div class="emp-info">
                      <span class="emp-name">{{ formatName(record.name) }}</span>
                      <span class="emp-sub" v-if="record.site_name">
                        <i class="fas fa-map-marker-alt"></i> {{ record.site_name }}
                      </span>
                      <span class="emp-sub" v-else-if="record.travel_from && record.travel_to">
                        <i class="fas fa-plane"></i> {{ record.travel_from }} &rarr; {{ record.travel_to }}
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Status -->
                <td>
                  <div class="status-wrap">
                    <span :class="['badge-sweet', getStatusClass(record.status)]">
                      <span class="dot"></span>
                      {{ record.status || 'Not Marked' }}
                    </span>
                    <span v-if="isRecordLate(record)" class="late-tag-sweet">
                      {{ calculateLateTime(record.clock_in) }} Late
                    </span>
                  </div>
                </td>

                <!-- Clock In -->
                <td class="time-text">
                  <span v-if="record.clock_in && record.clock_in !== '-'">
                    {{ formatTime(record.clock_in) }}
                  </span>
                  <span v-else class="text-dash">—</span>
                </td>

                <!-- Clock Out -->
                <td class="time-text">
                  <span v-if="record.clock_out && record.clock_out !== '-'">
                    {{ formatTime(record.clock_out) }}
                  </span>
                  <span v-else class="text-dash">—</span>
                </td>

                <!-- Actual Working Time -->
                <td class="time-text">
                  <span v-if="record.actual_time && record.actual_time !== '-'" class="font-medium text-emerald">
                    {{ record.actual_time }}
                  </span>
                  <span v-else class="text-dash">—</span>
                </td>

                <!-- Action (View Monthly Calendar) -->
                <td class="text-right">
                  <button
                    class="btn-icon-sweet"
                    @click="viewEmployeeMonthlyAttendance(record.name)"
                    title="View monthly attendance calendar"
                  >
                    <i class="far fa-calendar-alt"></i>
                  </button>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="filteredDisplayRecords.length === 0">
                <td colspan="6" class="td-empty">
                  <div class="empty-sweet">
                    <i class="far fa-calendar-times"></i>
                    <p>{{ searchQuery || statusFilter !== 'all' ? 'No employees match your search filter' : 'No attendance marked for ' + displayDateFormatted }}</p>
                    <button v-if="searchQuery || statusFilter !== 'all'" class="btn-reset-sweet" @click="resetFilters">
                      Clear Filter
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Monthly Late Marks Summary Section -->
        <div class="late-marks-section-sweet" v-if="lateMarksData.length > 0">
          <div class="section-title-sweet">
            <div class="section-title-left">
              <i class="fas fa-clock text-amber"></i>
              <h3>Monthly Late Marks Summary ({{ getMonthName(currentMonth) }} {{ currentYear }})</h3>
              <span class="late-count-bubble">{{ totalLateMarks }}</span>
            </div>
            <span class="info-badge-sweet">Rule: After 9:40 AM &bull; 3 late marks = 0.5 CL</span>
          </div>

          <div class="table-card-sweet">
            <table class="table-sweet">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th class="text-center">Late Count</th>
                  <th class="text-center">Penalties Applied</th>
                  <th class="text-center">CL Deducted</th>
                  <th class="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in lateMarksData" :key="idx">
                  <td>
                    <div class="emp-cell">
                      <div class="avatar-sweet" :style="{ background: getAvatarGradient(item.name) }">
                        {{ getInitials(item.name) }}
                      </div>
                      <span class="emp-name">{{ formatName(item.name) }}</span>
                    </div>
                  </td>
                  <td class="text-center">
                    <span class="late-count-badge" :class="{ 'critical': item.late_count >= 3 }">
                      {{ item.late_count }} late
                    </span>
                  </td>
                  <td class="text-center">{{ item.penalties_applied }}</td>
                  <td class="text-center font-medium">{{ item.penalty_amount }} CL</td>
                  <td class="text-center">
                    <span v-if="item.late_count >= 3" class="late-tag-sweet">Needs Action</span>
                    <span v-else class="badge-sweet status-present"><span class="dot"></span> Good</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>

    <!-- ================= CLEAN MODALS ================= -->

    <!-- 1. Mark Attendance Modal -->
    <div v-if="showMarkAttendancePopup" class="modal-overlay" @click.self="showMarkAttendancePopup = false">
      <div class="modal-sweet modal-small" @click.stop>
        <div class="modal-sweet-header">
          <h3>Mark Attendance</h3>
          <button class="btn-close" @click="showMarkAttendancePopup = false">&times;</button>
        </div>

        <div class="modal-sweet-body">
          <div class="form-group-sweet">
            <label>Employee <span class="req">*</span></label>
            <select v-model="markAttendance.employee" class="input-sweet">
              <option value="">Select Employee</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.name">
                {{ emp.name }}
              </option>
            </select>
          </div>

          <div class="form-group-sweet">
            <label>Status <span class="req">*</span></label>
            <select v-model="markAttendance.status" class="input-sweet">
              <option value="">Select Status</option>
              <option value="Present">Present</option>
              <option value="Traveling">Traveling</option>
              <option value="OnSite">On Site</option>
              <option value="HalfDay">Half Day</option>
              <option value="Leave">Leave</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div class="form-group-sweet" v-if="markAttendance.status === 'OnSite'">
            <label>Site Name</label>
            <input type="text" v-model="markAttendance.site_name" placeholder="Enter site name" class="input-sweet" />
          </div>

          <div class="two-col" v-if="markAttendance.status === 'Traveling'">
            <div class="form-group-sweet">
              <label>Travel From</label>
              <input type="text" v-model="markAttendance.travel_from" placeholder="From" class="input-sweet" />
            </div>
            <div class="form-group-sweet">
              <label>Travel To</label>
              <input type="text" v-model="markAttendance.travel_to" placeholder="To" class="input-sweet" />
            </div>
          </div>

          <div class="two-col">
            <div class="form-group-sweet">
              <label>Date <span class="req">*</span></label>
              <input type="date" v-model="markAttendance.date" :max="today" class="input-sweet" />
            </div>
            <div class="form-group-sweet">
              <label>Clock In Time</label>
              <input type="time" v-model="markAttendance.time" class="input-sweet" />
            </div>
          </div>
        </div>

        <div class="modal-sweet-footer">
          <button class="btn-cancel" @click="showMarkAttendancePopup = false">Cancel</button>
          <button class="btn-save" @click="submitMarkedAttendance">Save Attendance</button>
        </div>
      </div>
    </div>

    <!-- 2. Calculate Salary Modal -->
    <div v-if="showPopupsalary" class="modal-overlay" @click.self="showPopupsalary = false">
      <div class="modal-sweet modal-medium" @click.stop>
        <div class="modal-sweet-header">
          <h3>Salary Calculation</h3>
          <button class="btn-close" @click="showPopupsalary = false">&times;</button>
        </div>

        <div class="modal-sweet-body">
          <table class="table-sweet">
            <thead>
              <tr>
                <th>Employee</th>
                <th class="text-right">Salary</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="emp in employees" :key="emp.id">
                <td>
                  <span class="font-medium">{{ formatName(emp.name) }}</span>
                </td>
                <td class="text-right">
                  <span v-if="emp.salary" class="salary-green font-medium">₹ {{ formatSalary(emp.salary) }}</span>
                  <span v-else class="text-dash">—</span>
                </td>
                <td class="text-right">
                  <button
                    class="btn-calc"
                    @click="calculateSalaryOnClick(emp)"
                    :disabled="emp.calculating"
                  >
                    <i v-if="emp.calculating" class="fas fa-circle-notch fa-spin"></i>
                    <span v-else>Calculate</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-sweet-footer">
          <button class="btn-cancel" @click="showPopupsalary = false">Close</button>
        </div>
      </div>
    </div>

    <!-- 3. Monthly Attendance Calendar Modal -->
    <div v-if="showPopup" class="modal-overlay" @click.self="showPopup = false">
      <div class="modal-sweet modal-medium" @click.stop>
        <div class="modal-sweet-header">
          <div>
            <h3>{{ selectedEmployee ? formatName(selectedEmployee) : 'Employee' }}</h3>
            <p class="modal-sub">{{ getMonthName(currentMonth) }} {{ currentYear }}</p>
          </div>
          <button class="btn-close" @click="showPopup = false">&times;</button>
        </div>

        <div class="modal-sweet-body">
          <!-- Stepper -->
          <div class="month-stepper-sweet">
            <button @click="goToPreviousMonth" class="step-arrow"><i class="fas fa-chevron-left"></i></button>
            <span class="month-label">{{ getMonthName(currentMonth) }} {{ currentYear }}</span>
            <button @click="goToNextMonth" class="step-arrow"><i class="fas fa-chevron-right"></i></button>
          </div>

          <!-- Status Counts -->
          <div class="cal-status-row">
            <span class="status-summary present">Present: {{ statusSummary.Present || 0 }}</span>
            <span class="status-summary leave">Leave: {{ statusSummary.Leave || 0 }}</span>
            <span class="status-summary onsite">On Site: {{ statusSummary.OnSite || 0 }}</span>
            <span class="status-summary traveling">Traveling: {{ statusSummary.Traveling || 0 }}</span>
            <span class="status-summary halfday">Half Day: {{ statusSummary.HalfDay || 0 }}</span>
            <span class="status-summary absent">Absent: {{ statusSummary.Absent || 0 }}</span>
          </div>

          <!-- Calendar Grid -->
          <table class="cal-table-sweet">
            <thead>
              <tr>
                <th v-for="d in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="d">{{ d }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(week, wIdx) in buildCalendar(employeeMonthlyData)" :key="wIdx">
                <td
                  v-for="(cell, cIdx) in week"
                  :key="cIdx"
                  :class="cell.statusClass"
                  :title="cell.statusText ? `${cell.statusText} (${cell.date})` : ''"
                >
                  <div class="cal-cell-inner" v-if="cell.day">
                    <span class="day-num">{{ cell.day }}</span>
                    <span class="status-sub-code" v-if="cell.shortStatus">{{ cell.shortStatus }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-sweet-footer">
          <button class="btn-cancel" @click="showPopup = false">Close</button>
        </div>
      </div>
    </div>

    <!-- 4. Date Picker Modal -->
    <div v-if="showDatePickerModal" class="modal-overlay" @click.self="showDatePickerModal = false">
      <div class="modal-sweet modal-medium" @click.stop>
        <div class="modal-sweet-header">
          <h3>Attendance by Date</h3>
          <button class="btn-close" @click="showDatePickerModal = false">&times;</button>
        </div>

        <div class="modal-sweet-body">
          <div class="modal-date-picker-row">
            <button class="step-arrow" @click="changeModalDate(-1)"><i class="fas fa-chevron-left"></i></button>
            <div class="date-clicker" @click="showDatePickerInput">
              <i class="far fa-calendar-alt"></i>
              <span>{{ modalDateFormatted }}</span>
            </div>
            <button class="step-arrow" @click="changeModalDate(1)"><i class="fas fa-chevron-right"></i></button>
            <button class="btn-today" @click="goToTodayModal">Today</button>
          </div>

          <input
            type="date"
            ref="datePickerInput"
            v-model="modalSelectedDate"
            @change="fetchModalAttendanceByDate"
            class="hidden-input"
            :max="today"
          />

          <div v-if="modalLoading" class="simple-loading">
            <i class="fas fa-circle-notch fa-spin"></i>
            <span>Loading records...</span>
          </div>

          <table class="table-sweet" v-else>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Status</th>
                <th>Clock In</th>
                <th>Clock Out</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rec in modalAttendanceData" :key="rec.id || rec.name">
                <td>{{ formatName(rec.name) }}</td>
                <td>
                  <span :class="['badge-sweet', getStatusClass(rec.status)]">
                    <span class="dot"></span>
                    {{ rec.status || 'Not Marked' }}
                  </span>
                </td>
                <td>{{ rec.clock_in ? formatTime(rec.clock_in) : '—' }}</td>
                <td>{{ rec.clock_out ? formatTime(rec.clock_out) : '—' }}</td>
              </tr>
              <tr v-if="modalAttendanceData.length === 0">
                <td colspan="4" class="td-empty">No records for this date</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-sweet-footer">
          <button class="btn-cancel" @click="showDatePickerModal = false">Done</button>
        </div>
      </div>
    </div>

    <!-- 5. Late Marks Summary Modal -->
    <div v-if="showLateMarksModal" class="modal-overlay" @click.self="showLateMarksModal = false">
      <div class="modal-sweet modal-medium" @click.stop>
        <div class="modal-sweet-header">
          <div>
            <h3>Monthly Late Marks</h3>
            <p class="modal-sub">Threshold: After 9:40 AM &bull; 3 late marks = 0.5 CL</p>
          </div>
          <button class="btn-close" @click="showLateMarksModal = false">&times;</button>
        </div>

        <div class="modal-sweet-body">
          <table class="table-sweet" v-if="lateMarksData.length > 0">
            <thead>
              <tr>
                <th>Employee</th>
                <th class="text-center">Late Count</th>
                <th class="text-center">Penalties</th>
                <th class="text-center">CL Deducted</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in lateMarksData" :key="item.name">
                <td class="font-medium">{{ formatName(item.name) }}</td>
                <td class="text-center">
                  <span class="late-count-tag">{{ item.late_count }}</span>
                </td>
                <td class="text-center">{{ item.penalties_applied }}</td>
                <td class="text-center">
                  <span v-if="item.penalty_amount > 0" class="text-red font-medium">{{ item.penalty_amount }} CL</span>
                  <span v-else class="text-dash">—</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="simple-empty">
            <i class="fas fa-check-circle text-emerald"></i>
            <p>No late marks recorded for any employee this month.</p>
          </div>
        </div>

        <div class="modal-sweet-footer">
          <button class="btn-cancel" @click="showLateMarksModal = false">Close</button>
        </div>
      </div>
    </div>

    <!-- 6. Salary Result Popup -->
    <div v-if="salaryPopup.show" class="modal-overlay" @click.self="salaryPopup.show = false">
      <div class="modal-sweet modal-small" @click.stop>
        <div class="modal-sweet-header">
          <h3>Calculated Salary</h3>
          <button class="btn-close" @click="salaryPopup.show = false">&times;</button>
        </div>
        <div class="modal-sweet-body text-center">
          <p class="salary-name">{{ salaryPopup.employeeName }}</p>
          <div class="salary-big">₹ {{ formatSalary(salaryPopup.calculatedSalary) }}</div>
          <p class="salary-date">{{ getMonthName(currentMonth) }} {{ currentYear }}</p>
        </div>
        <div class="modal-sweet-footer">
          <button class="btn-save" @click="salaryPopup.show = false">Done</button>
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
} from "@/utils/toast.js";

export default {
  name: 'EmpAttendanceAdmin',
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
      showDatePickerModal: false,
      
      displayDate: '',
      displayDateFormatted: '',
      displayRecords: [],
      displayLoading: false,
      
      modalAttendanceData: [],
      modalLoading: false,
      modalSelectedDate: '',
      modalDateFormatted: '',
      
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
      lateMarksData: [],
      totalLateMarks: 0,
      lateMarksLoading: false
    }
  },
  computed: {
    presentCount() {
      return this.displayRecords.filter(r => (r.status || '').toLowerCase() === 'present').length
    },
    leaveCount() {
      return this.displayRecords.filter(r => (r.status || '').toLowerCase() === 'leave').length
    },
    onSiteCount() {
      return this.displayRecords.filter(r => (r.status || '').toLowerCase().replace(/\s+/g, '') === 'onsite').length
    },
    travelingCount() {
      return this.displayRecords.filter(r => (r.status || '').toLowerCase() === 'traveling').length
    },
    halfDayCount() {
      return this.displayRecords.filter(r => (r.status || '').toLowerCase().replace(/\s+/g, '') === 'halfday').length
    },
    absentCount() {
      return this.displayRecords.filter(r => (r.status || '').toLowerCase() === 'absent').length
    },
    todayLateCount() {
      return this.displayRecords.filter(r => this.isRecordLate(r)).length
    },
    filteredDisplayRecords() {
      let filtered = this.displayRecords

      if (this.statusFilter !== 'all') {
        if (this.statusFilter === 'Late') {
          filtered = filtered.filter(r => this.isRecordLate(r))
        } else if (this.statusFilter === 'OnSite') {
          filtered = filtered.filter(r => (r.status || '').toLowerCase().replace(/\s+/g, '') === 'onsite')
        } else if (this.statusFilter === 'HalfDay') {
          filtered = filtered.filter(r => (r.status || '').toLowerCase().replace(/\s+/g, '') === 'halfday')
        } else {
          filtered = filtered.filter(r => (r.status || '').toLowerCase() === this.statusFilter.toLowerCase())
        }
      }

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase().trim()
        filtered = filtered.filter(r => 
          (r.name && r.name.toLowerCase().includes(query)) ||
          (r.status && r.status.toLowerCase().includes(query)) ||
          (r.site_name && r.site_name.toLowerCase().includes(query))
        )
      }

      return filtered
    }
  },
  methods: {
    filterByStatus(status) {
      this.statusFilter = this.statusFilter === status ? 'all' : status
    },
    resetFilters() {
      this.statusFilter = 'all'
      this.searchQuery = ''
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
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
    },
    getAvatarGradient(name) {
      const colors = [
        'linear-gradient(135deg, #4f46e5, #6366f1)',
        'linear-gradient(135deg, #2563eb, #3b82f6)',
        'linear-gradient(135deg, #059669, #10b981)',
        'linear-gradient(135deg, #d97706, #f59e0b)',
        'linear-gradient(135deg, #7c3aed, #8b5cf6)',
        'linear-gradient(135deg, #db2777, #ec4899)',
      ]
      let hash = 0
      for (let i = 0; i < (name || '').length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
      }
      return colors[Math.abs(hash) % colors.length]
    },
    formatSalary(amount) {
      if (!amount) return '0'
      return parseFloat(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    formatTime(time) {
      if (!time || time === '-') return '—'
      if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
        return time.substring(0, 5)
      }
      try {
        const date = new Date(`2000-01-01 ${time}`)
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        }
      } catch (e) {
        return time
      }
      return time
    },
    getStatusClass(status) {
      if (!status) return 'status-default'
      const s = status.toLowerCase().replace(/\s+/g, '')
      switch (s) {
        case 'present': return 'status-present'
        case 'absent': return 'status-absent'
        case 'onsite': return 'status-onsite'
        case 'halfday': return 'status-halfday'
        case 'traveling': return 'status-traveling'
        case 'leave': return 'status-leave'
        default: return 'status-default'
      }
    },
    isRecordLate(record) {
      if (!record) return false
      const status = (record.status || '').toLowerCase()
      // Late mark is strictly ONLY for Present employees, never for Traveling or OnSite
      if (status !== 'present') return false
      return Boolean(record.is_late) || (record.clock_in && record.clock_in !== '-' && this.isLate(record.clock_in))
    },
    isLate(clockIn) {
      if (!clockIn || clockIn === '-') return false
      const timeMatch = String(clockIn).match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i)
      if (!timeMatch) return false
      let hours = parseInt(timeMatch[1], 10)
      const minutes = parseInt(timeMatch[2], 10)
      const meridian = timeMatch[4] ? timeMatch[4].toLowerCase() : null
      if (meridian === 'pm' && hours < 12) hours += 12
      if (meridian === 'am' && hours === 12) hours = 0
      
      const clockInMinutes = hours * 60 + minutes
      const thresholdMinutes = 9 * 60 + 40 // 09:40 AM
      return clockInMinutes > thresholdMinutes
    },
    calculateLateTime(clockIn) {
      if (!clockIn || clockIn === '-') return ''
      const timeMatch = String(clockIn).match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i)
      if (!timeMatch) return ''
      let hours = parseInt(timeMatch[1], 10)
      const minutes = parseInt(timeMatch[2], 10)
      const meridian = timeMatch[4] ? timeMatch[4].toLowerCase() : null
      if (meridian === 'pm' && hours < 12) hours += 12
      if (meridian === 'am' && hours === 12) hours = 0
      
      const diff = (hours * 60 + minutes) - (9 * 60 + 40)
      if (diff <= 0) return ''
      if (diff >= 60) {
        const h = Math.floor(diff / 60)
        const m = diff % 60
        return m > 0 ? `${h}h ${m}m` : `${h}h`
      }
      return `${diff}m`
    },
    
    // Main Display Date Navigation
    changeDisplayDate(days) {
      const date = new Date(this.displayDate)
      date.setDate(date.getDate() + days)
      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      this.displayDate = `${yyyy}-${mm}-${dd}`
      this.fetchDisplayAttendance()
    },
    goToTodayDisplay() {
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      this.displayDate = `${yyyy}-${mm}-${dd}`
      this.fetchDisplayAttendance()
    },
    async fetchDisplayAttendance() {
      if (!this.displayDate) return
      this.displayLoading = true
      try {
        const dateObj = new Date(this.displayDate)
        this.displayDateFormatted = dateObj.toLocaleDateString('en-IN', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
        
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/attendance')
        const allRecords = response.data || []
        
        const filteredRecords = allRecords.filter(record => {
          if (!record.date) return false
          let recordDate = record.date
          if (recordDate.includes('T')) recordDate = recordDate.split('T')[0]
          if (recordDate.includes(' ')) recordDate = recordDate.split(' ')[0]
          if (recordDate.includes('/')) {
            const parts = recordDate.split('/')
            recordDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
          }
          return recordDate === this.displayDate
        })
        
        this.displayRecords = filteredRecords.map(record => ({
          name: record.name || 'Unknown',
          status: record.status || 'Not Marked',
          is_late: record.is_late || false,
          clock_in: record.clock_in || null,
          clock_out: record.clock_out || null,
          required_time: record.required_time || null,
          actual_time: record.actual_time || null,
          date: record.date,
          site_name: record.site_name || null,
          travel_from: record.travel_from || null,
          travel_to: record.travel_to || null,
          id: record.id
        }))
        
        if (this.displayRecords.length === 0) {
          await this.fetchDisplayAttendanceFromMonthly()
        }
      } catch (error) {
        console.error('Error fetching attendance:', error)
      } finally {
        this.displayLoading = false
      }
    },
    async fetchDisplayAttendanceFromMonthly() {
      try {
        const token = localStorage.getItem('token')
        const dateParts = this.displayDate.split('-')
        const year = parseInt(dateParts[0])
        const month = parseInt(dateParts[1])
        
        if (this.employees.length === 0) {
          await this.fetchAllEmployees()
        }
        
        const employeeNames = this.employees.map(emp => emp.name)
        const promises = employeeNames.map(name => 
          axios.get(
            `https://employees.archenterprises.co.in/api/api/attendance/monthly/${encodeURIComponent(name)}?month=${month}&year=${year}`,
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          ).catch(() => ({ data: { data: [] } }))
        )
        
        const results = await Promise.all(promises)
        const allRecords = []
        
        results.forEach(res => {
          if (res.data && res.data.data) {
            allRecords.push(...res.data.data)
          }
        })
        
        const dayRecords = allRecords.filter(r => {
          if (!r.date) return false
          let recordDate = r.date
          if (recordDate.includes('T')) recordDate = recordDate.split('T')[0]
          return recordDate === this.displayDate
        })
        
        if (dayRecords.length > 0) {
          this.displayRecords = dayRecords.map(r => ({
            name: r.name || 'Unknown',
            status: r.status || 'Not Marked',
            is_late: r.is_late || false,
            clock_in: r.clock_in || null,
            clock_out: r.clock_out || null,
            required_time: r.required_time || null,
            actual_time: r.actual_time || null,
            date: r.date,
            id: r.id
          }))
        }
      } catch (err) {
        console.error('Error in monthly fallback:', err)
      }
    },
    
    // Date Modal
    openDatePickerModal() {
      this.showDatePickerModal = true
      this.modalSelectedDate = this.displayDate
      this.modalDateFormatted = this.displayDateFormatted
      this.fetchModalAttendanceByDate()
    },
    showDatePickerInput() {
      this.$refs.datePickerInput.click()
    },
    changeModalDate(days) {
      const date = new Date(this.modalSelectedDate)
      date.setDate(date.getDate() + days)
      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      this.modalSelectedDate = `${yyyy}-${mm}-${dd}`
      this.fetchModalAttendanceByDate()
    },
    goToTodayModal() {
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      this.modalSelectedDate = `${yyyy}-${mm}-${dd}`
      this.fetchModalAttendanceByDate()
    },
    async fetchModalAttendanceByDate() {
      if (!this.modalSelectedDate) return
      this.modalLoading = true
      try {
        const dateObj = new Date(this.modalSelectedDate)
        this.modalDateFormatted = dateObj.toLocaleDateString('en-IN', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
        
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/attendance')
        const allRecords = response.data || []
        
        this.modalAttendanceData = allRecords
          .filter(r => r.date && r.date.startsWith(this.modalSelectedDate))
          .map(r => ({
            name: r.name || 'Unknown',
            status: r.status || 'Not Marked',
            clock_in: r.clock_in,
            clock_out: r.clock_out,
            id: r.id
          }))
      } catch (err) {
        console.error('Error fetching date modal:', err)
      } finally {
        this.modalLoading = false
      }
    },

    // Core Data Fetchers
    async fetchAllEmployees() {
      try {
        const res = await axios.get('https://employees.archenterprises.co.in/api/api/users')
        this.employees = res.data.filter(u => u.department !== 'Ownership').map(u => ({
          id: u.id,
          name: u.name,
          base_salary: parseFloat(u.keyresponsibility) || null,
          salary: null,
          department: u.department,
          calculating: false
        }))
      } catch (err) {
        console.error('Error fetching employees:', err)
      }
    },
    async fetchLateMarksSummary() {
      this.lateMarksLoading = true
      try {
        const token = localStorage.getItem('token')
        const year = new Date().getFullYear()
        const month = new Date().getMonth() + 1
        
        if (!this.employees.length) {
          await this.fetchAllEmployees()
        }
        if (!this.employees.length) return
        
        const names = this.employees.map(e => e.name)
        const lateData = []
        let total = 0
        
        const promises = names.map(name =>
          axios.get('https://employees.archenterprises.co.in/api/api/attendance/late-marks', {
            params: { name, month, year },
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: { success: false } }))
        )
        
        const results = await Promise.all(promises)
        results.forEach((res, i) => {
          if (res.data && res.data.success) {
            const data = res.data.data
            const count = data.late_count || 0
            if (count > 0) {
              lateData.push({
                name: names[i],
                late_count: count,
                penalties_applied: data.penalties_applied || 0,
                penalty_amount: data.penalty_amount_applied || 0
              })
              total += count
            }
          }
        })
        
        this.lateMarksData = lateData
        this.totalLateMarks = total
      } catch (err) {
        console.error('Error fetching late marks:', err)
      } finally {
        this.lateMarksLoading = false
      }
    },
    async submitMarkedAttendance() {
      if (!this.markAttendance.employee || !this.markAttendance.status || !this.markAttendance.date) {
        toastError('Please fill in required fields')
        return
      }
      try {
        await axios.post('https://employees.archenterprises.co.in/api/api/attendance', {
          name: this.markAttendance.employee,
          status: this.markAttendance.status,
          clock_in: this.markAttendance.time || null,
          date: this.markAttendance.date,
          site_name: this.markAttendance.site_name || null,
          travel_from: this.markAttendance.travel_from || null,
          travel_to: this.markAttendance.travel_to || null
        })
        toastSuccess('Attendance marked')
        this.showMarkAttendancePopup = false
        this.markAttendance = { employee: '', status: '', date: '', time: '', site_name: '', travel_from: '', travel_to: '' }
        this.fetchDisplayAttendance()
        this.fetchLateMarksSummary()
      } catch (err) {
        toastError('Failed to mark attendance')
      }
    },
    async calculateSalaryOnClick(employee) {
      employee.calculating = true
      try {
        const token = localStorage.getItem('token')
        const month = this.currentMonth + 1
        const year = this.currentYear

        // 1. Fetch monthly attendance and base salary in parallel
        const [monthlyRes, salaryRes] = await Promise.all([
          axios.get(
            `https://employees.archenterprises.co.in/api/api/attendance/monthly/${encodeURIComponent(employee.name)}?month=${month}&year=${year}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ).catch(() => ({ data: { data: [] } })),
          axios.get(
            `https://employees.archenterprises.co.in/api/api/user-salary-by-name/${encodeURIComponent(employee.name)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ).catch(() => ({ data: { salary: employee.base_salary || 0 } }))
        ])

        const monthlyData = monthlyRes.data?.data || []
        const baseSalary = parseFloat(salaryRes.data?.salary || employee.base_salary || 0)

        const totalDaysInMonth = new Date(year, month, 0).getDate()
        const perDaySalary = totalDaysInMonth > 0 ? baseSalary / totalDaysInMonth : 0

        let fullPaidDays = 0
        monthlyData.forEach(day => {
          const status = (day.status || '').trim().toLowerCase().replace(/\s+/g, '')
          if (['present', 'onsite', 'traveling', 'leave'].includes(status)) {
            fullPaidDays += 1
          } else if (status === 'halfday') {
            fullPaidDays += 0.5
          }
        })

        // Count Sundays in the month
        let sundayCount = 0
        for (let i = 1; i <= totalDaysInMonth; i++) {
          const date = new Date(year, month - 1, i)
          if (date.getDay() === 0) sundayCount++
        }

        const calculated = (fullPaidDays * perDaySalary) + (sundayCount * perDaySalary)
        const finalSalary = Math.round(calculated)

        employee.salary = finalSalary
        this.salaryPopup = {
          show: true,
          employeeName: employee.name,
          calculatedSalary: finalSalary
        }
        toastSuccess(`Salary calculated for ${employee.name}`)
      } catch (error) {
        console.error(`Error calculating salary for ${employee.name}:`, error)
        toastError('Failed to calculate salary')
      } finally {
        employee.calculating = false
      }
    },
    async viewEmployeeMonthlyAttendance(employeeName) {
      this.selectedEmployee = employeeName
      this.showPopup = true
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(
          `https://employees.archenterprises.co.in/api/api/attendance/monthly/${encodeURIComponent(employeeName)}?month=${this.currentMonth + 1}&year=${this.currentYear}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        this.employeeMonthlyData = response.data.data || []
        const summary = { Present: 0, Absent: 0, OnSite: 0, HalfDay: 0, Traveling: 0, Leave: 0 }
        this.employeeMonthlyData.forEach(entry => {
          if (!entry.status) return
          const s = entry.status.toLowerCase().replace(/\s+/g, '')
          if (s === 'present') summary.Present++
          else if (s === 'leave') summary.Leave++
          else if (s === 'onsite') summary.OnSite++
          else if (s === 'traveling') summary.Traveling++
          else if (s === 'halfday') summary.HalfDay++
          else if (s === 'absent') summary.Absent++
        })
        this.statusSummary = summary
      } catch (err) {
        console.error('Error fetching calendar:', err)
      }
    },
    goToPreviousMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11
        this.currentYear--
      } else {
        this.currentMonth--
      }
      if (this.selectedEmployee) this.viewEmployeeMonthlyAttendance(this.selectedEmployee)
    },
    goToNextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0
        this.currentYear++
      } else {
        this.currentMonth++
      }
      if (this.selectedEmployee) this.viewEmployeeMonthlyAttendance(this.selectedEmployee)
    },
    buildCalendar(attendanceData) {
      const year = this.currentYear
      const month = this.currentMonth
      const firstDay = new Date(year, month, 1).getDay()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const calendar = []
      let week = []
      for (let i = 0; i < firstDay; i++) {
        week.push({ day: '', date: '', statusClass: '', statusText: '', shortStatus: '' })
      }
      const getStatusInfo = (dateStr) => {
        const rec = attendanceData.find(e => {
          if (!e.date) return false
          let d = e.date
          if (d.includes('T')) d = d.split('T')[0]
          if (d.includes(' ')) d = d.split(' ')[0]
          return d === dateStr
        })
        if (!rec || !rec.status) return { statusClass: '', statusText: '', shortStatus: '' }
        const s = rec.status.toLowerCase().replace(/\s+/g, '')
        let short = ''
        if (s === 'present') short = 'P'
        else if (s === 'leave') short = 'L'
        else if (s === 'onsite') short = 'OS'
        else if (s === 'traveling') short = 'TR'
        else if (s === 'halfday') short = 'HD'
        else if (s === 'absent') short = 'A'
        return {
          statusClass: `cal-${s}`,
          statusText: rec.status,
          shortStatus: short
        }
      }
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const info = getStatusInfo(dateStr)
        week.push({ day, date: dateStr, statusClass: info.statusClass, statusText: info.statusText, shortStatus: info.shortStatus })
        if (week.length === 7) {
          calendar.push(week)
          week = []
        }
      }
      if (week.length > 0) {
        while (week.length < 7) {
          week.push({ day: '', date: '', statusClass: '', statusText: '', shortStatus: '' })
        }
        calendar.push(week)
      }
      return calendar
    },
    getMonthName(monthIndex) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return months[monthIndex] || ''
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    }
  },
  async mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    this.today = `${yyyy}-${mm}-${dd}`
    this.displayDate = this.today
    this.markAttendance.date = this.today
    await this.fetchAllEmployees()
    this.fetchDisplayAttendance()
    this.fetchLateMarksSummary()
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
/* ================= SIMPLE & SWEET DESIGN SYSTEM ================= */
.layout {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1e293b;
}

.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
  box-sizing: border-box;
}

.content {
  flex: 1;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ================= 1. SIMPLE HEADER ================= */
.simple-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.page-subtitle {
  margin: 2px 0 0 0;
  font-size: 13px;
  color: #64748b;
}

.header-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-mark {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #4f46e5;
  color: #ffffff;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-mark:hover {
  background: #4338ca;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  color: #334155;
  border: 1px solid #e2e8f0;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}

.late-count-bubble {
  background: #ef4444;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
}

/* ================= 2. CLEAN SUMMARY STRIP ================= */
.summary-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow-x: auto;
  padding: 2px 0;
}

.summary-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  user-select: none;
}

.summary-pill:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
}

.summary-pill.active {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

.summary-pill.active .pill-label {
  color: #cbd5e1;
}

.summary-pill.active .pill-value {
  color: #ffffff !important;
}

.pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot-all { background: #64748b; }
.dot-present { background: #10b981; }
.dot-leave { background: #6366f1; }
.dot-onsite { background: #a855f7; }
.dot-traveling { background: #0ea5e9; }
.dot-halfday { background: #f97316; }
.dot-absent { background: #ef4444; }
.dot-late { background: #f59e0b; }

.pill-label {
  font-weight: 500;
  color: #64748b;
}

.pill-value {
  font-weight: 700;
  color: #0f172a;
}

.text-present { color: #059669; }
.text-leave { color: #4f46e5; }
.text-onsite { color: #7e22ce; }
.text-traveling { color: #0284c7; }
.text-halfday { color: #c2410c; }
.text-absent { color: #dc2626; }
.text-late { color: #d97706; }

/* ================= 3. SINGLE ROW TOOLBAR ================= */
.toolbar-single-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.date-navigator-sweet {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-arrow {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 11px;
}

.nav-arrow:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.date-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
}

.date-pill i {
  color: #4f46e5;
}

.date-pill:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
}

.btn-today {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-today:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.search-sweet {
  position: relative;
  min-width: 240px;
  max-width: 320px;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 13px;
}

.search-input {
  width: 100%;
  padding: 8px 30px 8px 34px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  background: #ffffff;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #4f46e5;
}

.btn-clear-search {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 12px;
}

/* ================= 4. SWEET TABLE ================= */
.table-card-sweet {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow-x: auto;
  background: #ffffff;
}

.table-sweet {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.table-sweet th {
  padding: 12px 18px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.table-sweet td {
  padding: 14px 18px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.row-sweet:hover {
  background: #fafbfc;
}

.emp-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.avatar-sweet {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.emp-info {
  display: flex;
  flex-direction: column;
}

.emp-name {
  font-weight: 600;
  color: #0f172a;
}

.emp-identity:hover .emp-name {
  color: #4f46e5;
}

.emp-sub {
  font-size: 11px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.badge-sweet {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 600;
}

.badge-sweet .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-present { background: #ecfdf5; color: #047857; }
.status-present .dot { background: #10b981; }

.status-absent { background: #fef2f2; color: #b91c1c; }
.status-absent .dot { background: #ef4444; }

.status-onsite { background: #faf5ff; color: #7e22ce; }
.status-onsite .dot { background: #a855f7; }

.status-halfday { background: #fff7ed; color: #c2410c; }
.status-halfday .dot { background: #f97316; }

.status-traveling { background: #f0f9ff; color: #0369a1; }
.status-traveling .dot { background: #0ea5e9; }

.status-leave { background: #eef2ff; color: #4338ca; }
.status-leave .dot { background: #6366f1; }

.status-default { background: #f1f5f9; color: #64748b; }
.status-default .dot { background: #94a3b8; }

.late-tag-sweet {
  font-size: 11px;
  font-weight: 600;
  color: #b45309;
  background: #fef3c7;
  padding: 2px 8px;
  border-radius: 6px;
}

.time-text {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 13px;
  color: #334155;
}

.font-medium { font-weight: 600; }
.text-emerald { color: #059669; }
.text-red { color: #dc2626; }
.text-dash { color: #cbd5e1; }

.btn-icon-sweet {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-icon-sweet:hover {
  background: #eef2ff;
  color: #4f46e5;
  border-color: #c7d2fe;
}

/* Late Marks Section on Page */
.late-marks-section-sweet {
  margin-top: 24px;
}

.section-title-sweet {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.section-title-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title-left h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.info-badge-sweet {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 3px 10px;
  border-radius: 20px;
}

.late-count-badge {
  font-size: 12px;
  font-weight: 700;
  color: #d97706;
  background: #fef3c7;
  padding: 3px 10px;
  border-radius: 20px;
}

.late-count-badge.critical {
  color: #dc2626;
  background: #fee2e2;
}

.emp-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.td-empty {
  padding: 40px !important;
  text-align: center;
}

.empty-sweet {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
}

.empty-sweet i {
  font-size: 32px;
}

.empty-sweet p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.btn-reset-sweet {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

/* ================= 5. SWEET MODALS ================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.modal-sweet {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 88vh;
}

.modal-small { max-width: 480px; }
.modal-medium { max-width: 620px; }

.modal-sweet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-sweet-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.modal-sub {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #64748b;
}

.btn-close {
  background: none;
  border: none;
  font-size: 22px;
  color: #94a3b8;
  cursor: pointer;
  padding: 0 4px;
}

.btn-close:hover {
  color: #0f172a;
}

.modal-sweet-body {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-sweet-footer {
  padding: 12px 20px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  background: #fafbfc;
}

.form-group-sweet {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group-sweet label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.req { color: #ef4444; }

.input-sweet {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  box-sizing: border-box;
}

.input-sweet:focus {
  outline: none;
  border-color: #4f46e5;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.btn-cancel {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-save {
  background: #4f46e5;
  border: none;
  color: #ffffff;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-calc {
  background: #4f46e5;
  color: #ffffff;
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-calc:disabled {
  opacity: 0.6;
}

.salary-green {
  color: #059669;
}

/* Calendar Modal Inner */
.month-stepper-sweet {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.step-arrow {
  width: 28px;
  height: 28px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
}

.month-label {
  font-weight: 700;
  font-size: 14px;
}

.cal-status-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.status-summary {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.status-summary.present { background: #ecfdf5; color: #047857; }
.status-summary.leave { background: #eef2ff; color: #4338ca; }
.status-summary.onsite { background: #faf5ff; color: #7e22ce; }
.status-summary.traveling { background: #f0f9ff; color: #0369a1; }
.status-summary.halfday { background: #fff7ed; color: #c2410c; }
.status-summary.absent { background: #fef2f2; color: #b91c1c; }

.cal-table-sweet {
  width: 100%;
  border-collapse: collapse;
}

.cal-table-sweet th {
  padding: 6px;
  font-size: 11px;
  color: #94a3b8;
  text-align: center;
}

.cal-table-sweet td {
  padding: 4px;
  text-align: center;
  border: 1px solid #f1f5f9;
  height: 42px;
  font-size: 12px;
  font-weight: 600;
  vertical-align: middle;
}

.cal-cell-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.day-num {
  font-size: 12px;
  line-height: 1;
}

.status-sub-code {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  margin-top: 2px;
  opacity: 0.85;
}

.cal-table-sweet .cal-present { background: #ecfdf5; color: #047857; }
.cal-table-sweet .cal-leave { background: #eef2ff; color: #4338ca; }
.cal-table-sweet .cal-onsite { background: #faf5ff; color: #7e22ce; }
.cal-table-sweet .cal-traveling { background: #f0f9ff; color: #0369a1; }
.cal-table-sweet .cal-halfday { background: #fff7ed; color: #c2410c; }
.cal-table-sweet .cal-absent { background: #fef2f2; color: #b91c1c; }

/* Date Picker Inner */
.modal-date-picker-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.date-clicker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #cbd5e1;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

.hidden-input {
  display: none;
}

/* Salary Result */
.salary-name {
  margin: 0;
  font-weight: 600;
  color: #64748b;
  font-size: 13px;
}

.salary-big {
  font-size: 32px;
  font-weight: 800;
  color: #059669;
  margin: 8px 0;
}

.salary-date {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}

.late-count-tag {
  background: #fef3c7;
  color: #92400e;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 12px;
}

.simple-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: #64748b;
  font-size: 13px;
}

.simple-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 30px;
  color: #64748b;
  font-size: 13px;
}

.simple-empty i {
  font-size: 28px;
}

@media (max-width: 768px) {
  .main-content {
    padding: 12px;
    gap: 12px;
  }
  .content {
    padding: 16px;
    border-radius: 16px;
  }
  .simple-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-buttons {
    width: 100%;
  }
  .toolbar-single-row {
    flex-direction: column;
    align-items: stretch;
  }
  .search-sweet {
    max-width: 100%;
  }
}
</style>