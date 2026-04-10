<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <div class="content-header-modern">
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

        <!-- Stats Bar -->
        <div class="stats-bar">
          <div class="stat-card">
            <i class="fas fa-users"></i>
            <div class="stat-info">
              <span class="stat-value">{{ attendanceRecords.length }}</span>
              <span class="stat-label">Total Records</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-check-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ presentCount }}</span>
              <span class="stat-label">Present</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-clock"></i>
            <div class="stat-info">
              <span class="stat-value">{{ lateCount }}</span>
              <span class="stat-label">Late Arrivals</span>
            </div>
          </div>
        </div>

        <!-- Current Date -->
        <div class="current-date-badge">
          <i class="fas fa-calendar-day"></i>
          <span>{{ currentDate }}</span>
        </div>

        <!-- Attendance Table -->
        <div class="table-wrapper-premium">
          <div class="table-header">
            <div class="section-title-modern">
              <i class="fas fa-list-ul"></i>
              <span>Attendance Records</span>
            </div>
            <div class="table-info">
              <i class="fas fa-clock"></i>
              <span>Last updated: {{ lastUpdated }}</span>
            </div>
          </div>

          <div class="table-container">
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
                <tr v-for="record in attendanceRecords" :key="record.id">
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
                <tr v-if="attendanceRecords.length === 0" class="empty-row">
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
      </section>
    </div>

    <!-- Mark Attendance Modal - Premium -->
    <transition name="modal-fade">
      <div v-if="showMarkAttendancePopup" class="modal-backdrop" @click.self="showMarkAttendancePopup = false">
        <div class="premium-modal" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium">
              <i class="fas fa-fingerprint"></i>
            </div>
            <div class="header-text">
              <h2>Mark Attendance</h2>
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

          <div class="modal-footer-premium">
            <button class="btn-cancel-premium" @click="showMarkAttendancePopup = false">
              <i class="fas fa-times"></i> Cancel
            </button>
            <button class="btn-submit-premium" @click="submitMarkedAttendance">
              <i class="fas fa-save"></i> Save Attendance
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Salary Calculation Modal -->
    <transition name="modal-fade">
      <div v-if="showPopupsalary" class="modal-backdrop" @click.self="showPopupsalary = false">
        <div class="premium-modal salary-modal" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium">
              <i class="fas fa-rupee-sign"></i>
            </div>
            <div class="header-text">
              <h2>Salary Calculation</h2>
              <p>Calculate monthly salaries</p>
            </div>
            <button class="close-btn-premium" @click="showPopupsalary = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body-premium">
            <div class="table-wrapper-salary">
              <table class="salary-table-premium">
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

          <div class="modal-footer-premium">
            <button class="btn-submit-premium" @click="showPopupsalary = false">
              <i class="fas fa-check"></i> Close
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Monthly Attendance Modal -->
    <transition name="modal-fade">
      <div v-if="showPopup" class="modal-backdrop" @click.self="showPopup = false">
        <div class="premium-modal monthly-modal" @click.stop>
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
            <!-- <div class="attendance-score-badge">
              <i class="fas fa-chart-line"></i>
              <span>Attendance Score: <strong>{{ quarterlyPresentQuarter }}%</strong></span>
            </div> -->

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

          <div class="modal-footer-premium">
            <button class="btn-submit-premium" @click="showPopup = false">
              <i class="fas fa-check"></i> Close
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Salary Result Popup -->
    <transition name="modal-fade">
      <div v-if="salaryPopup.show" class="modal-backdrop" @click.self="salaryPopup.show = false">
        <div class="premium-modal result-modal" @click.stop>
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

          <div class="modal-footer-premium">
            <button class="btn-submit-premium" @click="salaryPopup.show = false">
              <i class="fas fa-check"></i> Done
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
      scoreSaved: false,
      selectedEmployee: null,
      employeeMonthlyData: [],
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      today: '',
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
      holidays: []
    }
  },
  computed: {
    presentCount() {
      return this.attendanceRecords.filter(r => r.status === 'Present').length
    },
    lateCount() {
      return this.attendanceRecords.filter(r => r.isLate).length
    },
    lastUpdated() {
      return new Date().toLocaleTimeString()
    },
    quarterlyPresentQuarter() {
      // Calculate quarterly percentage
      return 75 // Placeholder
    }
  },
  methods: {
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
    isLate(clockIn) {
      if (!clockIn) return false
      const lateThreshold = new Date()
      lateThreshold.setHours(10, 0, 0)
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
      lateThreshold.setHours(10, 0, 0)
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
   ;
  min-height: 100vh;
}

.content {
  flex: 1;
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

.section-title-modern i {
  color: var(--primary-color);
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
  color: white;
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

.calendar-premium td {
  padding: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
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

.salary-amount-large i {
  font-size: 40px;
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
    padding: 16px;
  }

  .content {
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
    grid-template-columns: 1fr;
  }

  .two-col-grid {
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

  .legend-grid {
    gap: 8px;
  }

  .legend-item {
    font-size: 10px;
    padding: 2px 8px;
  }

  .calendar-premium td {
    padding: 8px 4px;
    font-size: 12px;
  }
}
</style>