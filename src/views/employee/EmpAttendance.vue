<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div v-if="!isMobile || !isSidebarVisible" class="attendance-container">
        
        <!-- Premium Header -->
        <div class="attendance-header-premium">
          <div class="header-left">
            <div class="header-icon">
              <i class="fas fa-fingerprint"></i>
            </div>
            <div>
              <h1>Employee Attendance</h1>
              <p class="header-subtitle">Track your daily attendance and monthly overview</p>
            </div>
          </div>
          <div class="toggle-wrapper">
            <button class="toggle-view-btn" @click="toggleView">
              <i :class="viewMode === 'day' ? 'fas fa-calendar-alt' : 'fas fa-clock'"></i>
              {{ viewMode === 'day' ? 'Monthly View' : 'Daily View' }}
            </button>
          </div>
        </div>

        <!-- Daily Attendance View -->
        <div v-if="viewMode === 'day'" class="attendance-card-premium">
          <div class="card-header-premium">
            <div class="section-title">
              <i class="fas fa-calendar-day"></i>
              <span>Today's Attendance</span>
            </div>
            <div class="date-badge">
              <i class="fas fa-calendar-alt"></i>
              {{ formatDate(currentDate) }}
            </div>
          </div>

          <div class="attendance-table-wrapper">
            <table class="attendance-table-premium">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Required Time</th>
                  <th>Actual Time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label="Status" class="status-cell">
                    <select
                      v-model="user.status"
                      @change="updateStatus"
                      class="status-select-premium"
                      :class="getStatusClass(user.status)"
                      :disabled="disableStatusSelect || user.statusLocked"
                    >
                      <option disabled value="">Select Status</option>
                      <option v-for="status in availableStatuses" :key="status" :value="status">
                        {{ getStatusLabel(status) }}
                      </option>
                    </select>
                   </td>
                  <td data-label="Clock In" class="clock-cell">
                    <div v-if="user.status === 'Traveling'" class="travel-info">
                      <span class="travel-place">{{ user.travelFrom || '—' }}</span>
                      <i class="fas fa-arrow-right"></i>
                      <span class="travel-place">{{ user.travelTo || '—' }}</span>
                    </div>
                    <div v-else>
                      <span class="clock-time">{{ user.clockIn || '—' }}</span>
                      <span v-if="user.status === 'Present' && user.isLate" class="late-badge">
                        <i class="fas fa-exclamation-triangle"></i> Late
                      </span>
                      <span v-else-if="user.status === 'Present' && user.isEarly" class="early-badge">
                        <i class="fas fa-star"></i> Early
                      </span>
                    </div>
                   </td>
                  <td data-label="Clock Out" class="clock-cell">
                    <div v-if="['Present', 'HalfDay', 'OnSite'].includes(user.status)">
                      <img
                        src="https://icons.veryicon.com/png/o/internet--web/common-work-social-mobile-terminals/check-in-and-punch-out.png"
                        alt="Punch Out"
                        @click="confirmPunchOut(user)"
                        class="punch-out-icon"
                        :class="{ disabled: user.clockOut !== '' }"
                      />
                    </div>
                    <span v-else>{{ user.clockOut || '—' }}</span>
                   </td>
                  <td data-label="Required Time">{{ user.requiredTime }}</td>
                  <td data-label="Actual Time" class="actual-time">{{ user.actualTime || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Monthly Calendar View -->
        <div v-if="viewMode === 'month'" class="calendar-card-premium">
          <div class="card-header-premium">
            <div class="section-title">
              <i class="fas fa-calendar-alt"></i>
              <span>Monthly Attendance</span>
            </div>
            <div class="month-navigation">
              <button class="nav-btn" @click="previousMonth">
                <i class="fas fa-chevron-left"></i>
              </button>
              <span class="month-year">{{ monthNames[currentMonth] }} {{ currentYear }}</span>
              <button class="nav-btn" @click="nextMonth">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div class="calendar-wrapper">
            <div class="calendar-container">
              <div class="calendar-grid">
                <div class="calendar-header">
                  <div v-for="day in weekdays" :key="day" class="calendar-header-cell">
                    {{ day }}
                  </div>
                </div>
                <div class="calendar-body">
                  <div v-for="(week, weekIndex) in calendarData" :key="weekIndex" class="calendar-week">
                    <div
                      v-for="(day, dayIndex) in week"
                      :key="dayIndex"
                      class="calendar-cell"
                      :class="getAttendanceClass(day)"
                    >
                      <span class="calendar-date">{{ day.date }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="legend-container">
              <h5><i class="fas fa-info-circle"></i> Legend</h5>
              <ul class="legend-list">
                <li><span class="legend-box present"></span> Present</li>
                <li><span class="legend-box on-site"></span> On Site</li>
                <li><span class="legend-box half-day"></span> Half Day</li>
                <li><span class="legend-box traveling"></span> Traveling</li>
                <li><span class="legend-box leave"></span> Leave</li>
                <li><span class="legend-box holiday"></span> Public Holiday</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- OnSite Popup Modal -->
    <div v-if="showOnSitePopup" class="modal-premium" @click.self="cancelOnSite">
      <div class="modal-premium-container small">
        <div class="modal-premium-header">
          <div class="modal-icon">
            <i class="fas fa-building"></i>
          </div>
          <h2>On-Site Location</h2>
          <button class="modal-close" @click="cancelOnSite">×</button>
        </div>
        <div class="modal-premium-body">
          <p class="modal-subtitle">Please enter the site location for today's onsite work</p>
          <input
            type="text"
            v-model="user.siteName"
            class="site-input-premium"
            placeholder="Enter site name"
            autofocus
          />
        </div>
        <div class="modal-premium-footer">
          <button class="btn-secondary-modern" @click="cancelOnSite">Cancel</button>
          <button class="btn-primary-modern" @click="confirmOnSite">Submit</button>
        </div>
      </div>
    </div>

    <!-- Traveling Popup Modal -->
    <div v-if="showTravelPopup" class="modal-premium" @click.self="cancelTravel">
      <div class="modal-premium-container small">
        <div class="modal-premium-header">
          <div class="modal-icon">
            <i class="fas fa-plane"></i>
          </div>
          <h2>Travel Details</h2>
          <button class="modal-close" @click="cancelTravel">×</button>
        </div>
        <div class="modal-premium-body">
          <p class="modal-subtitle">Please enter your travel locations</p>
          <div class="form-field">
            <label>From Place</label>
            <input type="text" v-model="user.travelFrom" class="site-input-premium" placeholder="Starting place" />
          </div>
          <div class="form-field">
            <label>To Place</label>
            <input type="text" v-model="user.travelTo" class="site-input-premium" placeholder="Destination place" />
          </div>
        </div>
        <div class="modal-premium-footer">
          <button class="btn-secondary-modern" @click="cancelTravel">Cancel</button>
          <button class="btn-primary-modern" @click="confirmTravel">Submit</button>
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
    const today = new Date();
    const storedUser = localStorage.getItem('user');
    let userName = 'Unknown';
    let userLeaveBalance = 0;
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        userName = user.name || 'Unknown';
        userLeaveBalance = user.cl_leave_used || 0;
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    return {
      showTravelPopup: false,
      showOnSitePopup: false,
      disableStatusSelect: false,
      isMobile: false,
      isSidebarVisible: true,
      currentMonth: today.getMonth(),
      currentYear: today.getFullYear(),
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      calendarData: [],
      viewMode: 'day',
      statusCounts: {
        Present: 0, OnSite: 0, HalfDay: 0, Traveling: 0, Absent: 0, Leave: 0, Missing: 0
      },
      currentDate: today.toISOString().split('T')[0],
      user: {
        name: userName,
        status: '',
        clockIn: '',
        clockOut: '',
        requiredTime: '8 Hours',
        actualTime: '',
        statusLocked: false,
        siteName: '',
        travelFrom: '',
        travelTo: '',
        isLate: false,
        isEarly: false,
        leaveBalance: userLeaveBalance
      }
    }
  },
  computed: {
    isSunday() {
      const date = new Date(this.currentDate);
      return date.getDay() === 0;
    },
    availableStatuses() {
      if (this.isSunday) return ['OnSite', 'Traveling'];
      if (this.isMobile) return ['OnSite', 'Traveling', 'HalfDay'];
      return ['Present', 'OnSite', 'Traveling'];
    }
  },
  methods: {
    getStatusLabel(status) {
      const labels = {
        Present: '✅ Present',
        OnSite: '🏢 On Site',
        Traveling: '✈️ Traveling',
        HalfDay: '🕒 Half Day'
      };
      return labels[status] || status;
    },
    getStatusClass(status) {
      const s = (status || '').toLowerCase();
      if (s === 'present') return 'present';
      if (s === 'onsite') return 'onsite';
      if (s === 'traveling') return 'traveling';
      if (s === 'halfday') return 'halfday';
      return '';
    },
    formatDate(date) {
      if (!date) return '—';
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },
    getCurrentTime() {
      const now = new Date();
      return now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    },
    calculateActualTime(user) {
      if (!user.clockIn || !user.clockOut) return '';
      const parseTime = (timeStr) => {
        const parts = timeStr.split(':').map(Number);
        return { hours: parts[0] || 0, minutes: parts[1] || 0, seconds: parts[2] || 0 };
      };
      const inTime = parseTime(user.clockIn);
      const outTime = parseTime(user.clockOut);
      const inDate = new Date();
      inDate.setHours(inTime.hours, inTime.minutes, inTime.seconds);
      const outDate = new Date();
      outDate.setHours(outTime.hours, outTime.minutes, outTime.seconds);
      const diffMs = outDate - inDate;
      if (diffMs <= 0) return '00:00:00';
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    async saveAttendance() {
      const now = new Date();
      const formattedTime = this.getCurrentTime();
      this.user.clockIn = formattedTime;
      this.user.clockOut = '';
      this.user.actualTime = '';
      const earlyThreshold = new Date(now);
      earlyThreshold.setHours(9, 30, 0, 0);
      const lateThreshold = new Date(now);
      lateThreshold.setHours(10, 0, 0, 0);
      const halfDayThreshold = new Date(now);
      halfDayThreshold.setHours(13, 0, 0, 0);
      this.user.isEarly = now < earlyThreshold;
      this.user.isLate = now > lateThreshold;
      if (now > halfDayThreshold && this.user.status === 'Present') {
        this.user.status = 'HalfDay';
      }
      const token = localStorage.getItem('token');
      const today = this.currentDate;
      try {
        await axios.post('https://employees.archenterprises.co.in/api/api/attendance/store', {
          name: this.user.name,
          status: this.user.status,
          clock_in: this.user.clockIn,
          clock_out: this.user.clockOut,
          required_time: this.user.requiredTime,
          actual_time: this.user.actualTime,
          site_name: this.user.status === 'OnSite' ? this.user.siteName : null,
          travel_from: this.user.travelFrom,
          travel_to: this.user.travelTo,
          date: today
        }, { headers: { Authorization: `Bearer ${token}` } });
        toastSuccess('Attendance saved successfully');
      } catch (err) {
        console.error('Attendance save failed', err);
        toastError('Failed to save attendance');
      }
      const key = `attendance_${today}_${this.user.name}`;
      localStorage.setItem(key, JSON.stringify(this.user));
    },
    updateStatus() {
      if (this.user.status === 'OnSite') {
        this.showOnSitePopup = true;
        return;
      }
      if (this.user.status === 'Traveling') {
        this.showTravelPopup = true;
        return;
      }
      this.saveAttendance();
    },
    confirmOnSite() {
      if (!this.user.siteName) {
        toastWarning("Please enter site name");
        return;
      }
      this.showOnSitePopup = false;
      this.saveAttendance();
    },
    cancelOnSite() {
      this.showOnSitePopup = false;
      this.user.status = "";
    },
    confirmTravel() {
      if (!this.user.travelFrom || !this.user.travelTo) {
        toastWarning("Please enter both places");
        return;
      }
      this.showTravelPopup = false;
      this.saveAttendance();
    },
    cancelTravel() {
      this.showTravelPopup = false;
      this.user.status = "";
      this.user.travelFrom = "";
      this.user.travelTo = "";
    },
    confirmPunchOut(user) {
      if (window.confirm('Are you sure you want to punch out?')) {
        this.punchOut(user);
      }
    },
    punchOut(user) {
      const now = new Date();
      const formattedTime = this.getCurrentTime();
      user.clockOut = formattedTime;
      user.actualTime = this.calculateActualTime(user);
      const [hrs, mins, secs] = user.actualTime.split(':').map(Number);
      const totalMinutes = hrs * 60 + mins + secs / 60;
      if (totalMinutes < 180) {
        user.status = 'Absent';
      } else if (totalMinutes >= 180 && totalMinutes < 420) {
        user.status = 'HalfDay';
      }
      const token = localStorage.getItem('token');
      axios.post('https://employees.archenterprises.co.in/api/api/attendance/update', {
        name: user.name,
        clock_out: user.clockOut,
        actual_time: user.actualTime,
        status: user.status,
        date: this.currentDate
      }, { headers: { Authorization: `Bearer ${token}` } })
        .then(() => toastSuccess('Punch out successful'))
        .catch(err => console.error('Error updating punch out:', err));
      const key = `attendance_${this.currentDate}_${user.name}`;
      localStorage.setItem(key, JSON.stringify(user));
    },
    async fetchTodayStatus() {
      const token = localStorage.getItem('token');
      const today = this.currentDate;
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/attendance/today', {
          params: { name: this.user.name, date: today },
          headers: { Authorization: `Bearer ${token}` }
        });
        const record = response.data?.data;
        if (record && record.status) {
          this.user.status = record.status;
          this.user.clockIn = record.clock_in || '';
          this.user.clockOut = record.clock_out || '';
          this.user.siteName = record.site_name || '';
          this.user.travelFrom = record.travel_from || '';
          this.user.travelTo = record.travel_to || '';
          this.user.actualTime = record.actual_time || '';
          this.disableStatusSelect = false;
          this.user.statusLocked = false;
          const key = `attendance_${this.currentDate}_${this.user.name}`;
          localStorage.setItem(key, JSON.stringify(this.user));
        } else {
          this.disableStatusSelect = false;
        }
      } catch (err) {
        console.error('Error fetching today\'s attendance:', err);
        this.disableStatusSelect = false;
      }
    },
    async fetchAttendance() {
      const token = localStorage.getItem('token');
      const name = encodeURIComponent(this.user.name);
      const month = this.currentMonth + 1;
      const year = this.currentYear;
      
      const url = `https://employees.archenterprises.co.in/api/api/attendance/monthly/${name}?month=${month}&year=${year}`;
      
      try {
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Monthly Attendance Response:', response.data);
        
        let attendanceData = [];
        if (response.data.data) {
          attendanceData = response.data.data;
        } else if (Array.isArray(response.data)) {
          attendanceData = response.data;
        } else if (response.data.records) {
          attendanceData = response.data.records;
        }
        
        console.log('Processed attendance data:', attendanceData);
        
        // Fetch user's leave balance before generating calendar
        await this.fetchUserLeaveBalance();
        
        this.generateCalendarFromStatus(attendanceData);
        
        // Auto-mark missing attendances
        await this.autoMarkMissingAttendances(attendanceData);
        
      } catch (error) {
        console.error('Error fetching monthly attendance:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          toastError(`Failed to fetch: ${error.response.data.message || 'Unknown error'}`);
        } else {
          toastError('Failed to fetch monthly attendance data');
        }
        this.generateCalendarFromStatus([]);
      }
    },
    
    async fetchUserLeaveBalance() {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/user/leave-balance', {
          params: { name: this.user.name },
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.cl_leave_used !== undefined) {
          this.user.leaveBalance = response.data.cl_leave_used;
          // Update local storage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            userData.cl_leave_used = response.data.cl_leave_used;
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
      } catch (error) {
        console.error('Error fetching leave balance:', error);
      }
    },
    
    async autoMarkMissingAttendances(attendanceData) {
      const token = localStorage.getItem('token');
      const targetMonth = this.currentMonth;
      const targetYear = this.currentYear;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const publicHolidays = ['01-26', '05-01', '08-15', '10-02', '12-25'];
      const markedDates = new Map();
      
      // Create a map of existing attendance records
      if (attendanceData && Array.isArray(attendanceData)) {
        attendanceData.forEach(record => {
          if (record.date) {
            const recordDate = new Date(record.date);
            const dateKey = recordDate.toISOString().split('T')[0];
            markedDates.set(dateKey, record);
          }
        });
      }
      
      const firstDayOfMonth = new Date(targetYear, targetMonth, 1);
      const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0);
      const missingDates = [];
      
      // Loop through all days of the month
      for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
        const currentDate = new Date(targetYear, targetMonth, day);
        const dateString = currentDate.toISOString().split('T')[0];
        const isSunday = currentDate.getDay() === 0;
        const isSaturday = currentDate.getDay() === 6;
        const mmdd = String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
        const isHoliday = publicHolidays.includes(mmdd);
        
        // Check if date is past and no attendance record
        if (currentDate < today && !markedDates.has(dateString)) {
          // Skip weekends and holidays
          if (!isSunday && !isSaturday && !isHoliday) {
            missingDates.push({
              date: dateString,
              day: day,
              month: currentDate.getMonth(),
              year: currentDate.getFullYear()
            });
          }
        }
      }
      
      // Auto-mark missing dates as Leave or Absent
      for (const missingDate of missingDates) {
        // Check if leave balance is <= 7
        let status = '';
        let leaveBalanceUpdate = this.user.leaveBalance;
        
        if (this.user.leaveBalance <= 7) {
          status = 'Leave';
          leaveBalanceUpdate = this.user.leaveBalance + 1;
        } else {
          status = 'Absent';
        }
        
        try {
          // Check if attendance already exists for this date to avoid duplicates
          const checkResponse = await axios.get('https://employees.archenterprises.co.in/api/api/attendance/check', {
            params: { 
              name: this.user.name, 
              date: missingDate.date 
            },
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Only mark if no attendance exists
          if (!checkResponse.data || !checkResponse.data.exists) {
            await axios.post('https://employees.archenterprises.co.in/api/api/attendance/store', {
              name: this.user.name,
              status: status,
              clock_in: '',
              clock_out: '',
              required_time: '8 Hours',
              actual_time: '00:00:00',
              site_name: null,
              travel_from: null,
              travel_to: null,
              date: missingDate.date
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            // Update leave balance if Leave was marked
            if (status === 'Leave') {
              await this.updateLeaveBalance(leaveBalanceUpdate);
              console.log(`Auto-marked ${missingDate.date} as Leave (Leave balance: ${this.user.leaveBalance} -> ${leaveBalanceUpdate})`);
            } else {
              console.log(`Auto-marked ${missingDate.date} as Absent (Leave balance exceeded)`);
            }
          }
        } catch (err) {
          console.error(`Failed to auto-mark attendance for ${missingDate.date}:`, err);
        }
      }
      
      // Refresh attendance data after auto-marking
      if (missingDates.length > 0) {
        toastSuccess(`Auto-marked ${missingDates.length} missing attendance records`);
        await this.refreshAttendanceData();
      }
    },
    
    async updateLeaveBalance(newBalance) {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.post('https://employees.archenterprises.co.in/api/api/user/update-leave-balance', {
          name: this.user.name,
          cl_leave_used: newBalance
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        if (response.data.success) {
          this.user.leaveBalance = newBalance;
          // Update local storage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            userData.cl_leave_used = newBalance;
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
      } catch (error) {
        console.error('Error updating leave balance:', error);
      }
    },
    
    async refreshAttendanceData() {
      const token = localStorage.getItem('token');
      const name = encodeURIComponent(this.user.name);
      const month = this.currentMonth + 1;
      const year = this.currentYear;
      
      const url = `https://employees.archenterprises.co.in/api/api/attendance/monthly/${name}?month=${month}&year=${year}`;
      
      try {
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        let attendanceData = [];
        if (response.data.data) {
          attendanceData = response.data.data;
        } else if (Array.isArray(response.data)) {
          attendanceData = response.data;
        } else if (response.data.records) {
          attendanceData = response.data.records;
        }
        
        this.generateCalendarFromStatus(attendanceData);
      } catch (error) {
        console.error('Error refreshing attendance data:', error);
      }
    },
    
    generateCalendarFromStatus(attendanceData) {
      const targetMonth = this.currentMonth;
      const targetYear = this.currentYear;
      
      const firstDayOfMonth = new Date(targetYear, targetMonth, 1);
      const totalDays = new Date(targetYear, targetMonth + 1, 0).getDate();
      const startingDayOfWeek = firstDayOfMonth.getDay();
      
      const attendanceMap = new Map();
      const statusCounts = {
        Present: 0,
        OnSite: 0,
        HalfDay: 0,
        Traveling: 0,
        Leave: 0,
        Absent: 0,
        Missing: 0
      };
      
      if (attendanceData && Array.isArray(attendanceData)) {
        attendanceData.forEach(record => {
          if (!record.status || record.status.trim().toUpperCase() === 'N/A') return;
          
          const recordDate = new Date(record.date);
          if (recordDate.getMonth() === targetMonth && recordDate.getFullYear() === targetYear) {
            const day = recordDate.getDate();
            let status = this.normalizeStatus(record.status);
            
            attendanceMap.set(day, {
              status: status,
              rawStatus: record.status,
              hasData: true
            });
            
            if (statusCounts.hasOwnProperty(status)) {
              statusCounts[status]++;
            }
          }
        });
      }
      
      const publicHolidays = ['01-26', '05-01', '08-15', '10-02', '12-25'];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const calendar = [];
      let week = [];
      
      for (let i = 0; i < startingDayOfWeek; i++) {
        week.push({ 
          date: '', 
          status: null, 
          noStatusAndPast: false,
          isPublicHoliday: false,
          isWeekend: false,
          fullDate: null
        });
      }
      
      for (let day = 1; day <= totalDays; day++) {
        const cellDate = new Date(targetYear, targetMonth, day);
        const attendance = attendanceMap.get(day);
        const isSunday = cellDate.getDay() === 0;
        const isSaturday = cellDate.getDay() === 6;
        const mmdd = String(cellDate.getMonth() + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
        const isHoliday = publicHolidays.includes(mmdd);
        
        let status = null;
        let noStatusAndPast = false;
        
        if (attendance && attendance.hasData) {
          status = attendance.status;
        } else {
          const isPastDate = cellDate < today;
          const isWeekday = !isSunday && !isSaturday;
          
          if (isPastDate && isWeekday && !isHoliday && !attendance) {
            noStatusAndPast = true;
            statusCounts.Missing++;
          }
        }
        
        week.push({
          date: day,
          status: status,
          noStatusAndPast: noStatusAndPast,
          isPublicHoliday: isHoliday,
          isWeekend: isSunday || isSaturday,
          fullDate: cellDate
        });
        
        if (cellDate.getDay() === 6 || day === totalDays) {
          while (week.length < 7) {
            week.push({ 
              date: '', 
              status: null, 
              noStatusAndPast: false,
              isPublicHoliday: false,
              isWeekend: false,
              fullDate: null
            });
          }
          calendar.push([...week]);
          week = [];
        }
      }
      
      this.statusCounts = statusCounts;
      this.calendarData = calendar;
    },
    
    normalizeStatus(status) {
      if (!status) return null;
      
      const statusLower = status.toLowerCase().trim();
      
      const statusMap = {
        'present': 'Present',
        'on-site': 'OnSite',
        'on site': 'OnSite',
        'onsite': 'OnSite',
        'half-day': 'HalfDay',
        'half day': 'HalfDay',
        'halfday': 'HalfDay',
        'traveling': 'Traveling',
        'leave': 'Leave',
        'absent': 'Absent',
        'missing': 'Missing'
      };
      
      return statusMap[statusLower] || status;
    },
    
    getAttendanceClass(day) {
      if (!day || !day.date) return '';
      
      const classes = [];
      
      if (day.status) {
        const statusClassMap = {
          'Present': 'attendance-present',
          'OnSite': 'attendance-on-site',
          'HalfDay': 'attendance-half-day',
          'Traveling': 'attendance-traveling',
          'Leave': 'attendance-leave',
          'Absent': 'attendance-absent',
          'Missing': 'attendance-missing'
        };
        
        if (statusClassMap[day.status]) {
          classes.push(statusClassMap[day.status]);
        }
      }
      
      if (day.noStatusAndPast && !day.status) {
        classes.push('attendance-missing');
      }
      
      if (day.isPublicHoliday) {
        classes.push('public-holiday');
      }
      
      if (day.isWeekend && day.date && !day.isPublicHoliday && !day.status) {
        classes.push('attendance-weekend');
      }
      
      return classes.join(' ');
    },
    
    toggleView() {
      this.viewMode = this.viewMode === 'day' ? 'month' : 'day';
      if (this.viewMode === 'month') {
        this.fetchAttendance();
      }
    },
    
    previousMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear -= 1;
      } else {
        this.currentMonth -= 1;
      }
      this.fetchAttendance();
    },
    
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear += 1;
      } else {
        this.currentMonth += 1;
      }
      this.fetchAttendance();
    },
    
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },
    
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
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
  
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.currentDate = new Date().toISOString().split('T')[0];
    const key = `attendance_${this.currentDate}_${this.user.name}`;
    const savedData = localStorage.getItem(key);
    if (savedData) {
      this.user = JSON.parse(savedData);
    } else {
      this.fetchTodayStatus();
    }
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/auth');
    }
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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

.attendance-container {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

/* Header */
.attendance-header-premium {
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

.attendance-header-premium h1 {
  font-size: 28px;
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

.toggle-view-btn {
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

.toggle-view-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* Attendance Card */
.attendance-card-premium, .calendar-card-premium {
  background: white;
  border-radius: 24px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.card-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #fafbfc;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #1a1a2e;
}

.section-title i {
  color: var(--primary-color);
}

.date-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: #e0e7ff;
  border-radius: 20px;
  font-size: 13px;
  color: var(--primary-color);
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: black;
  color: rgb(255, 255, 255);
}

.month-year {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  min-width: 140px;
  text-align: center;
}

/* Attendance Table */
.attendance-table-wrapper {
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
  padding: 16px;
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

.status-select-premium {
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  background: #f3f4f6;
  color: #6b7280;
}

.status-select-premium.present { background: #d1fae5; color: #065f46; }
.status-select-premium.onsite { background: #e0e7ff; color: #4338ca; }
.status-select-premium.traveling { background: #fef3c7; color: #d97706; }
.status-select-premium.halfday { background: #fed7aa; color: #c2410c; }

.clock-cell {
  font-family: monospace;
  font-size: 14px;
}

.travel-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.travel-place {
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 6px;
}

.late-badge, .early-badge {
  display: inline-block;
  margin-left: 8px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
}

.late-badge { background: #fee2e2; color: #991b1b; }
.early-badge { background: #d1fae5; color: #065f46; }

.punch-out-icon {
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.punch-out-icon:hover:not(.disabled) {
  transform: scale(1.1);
}

.punch-out-icon.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.actual-time {
  font-weight: 600;
  color: var(--primary-color);
}

/* Calendar */
.calendar-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  padding: 24px;
}

.calendar-container {
  flex: 2;
  min-width: 500px;
}

.calendar-grid {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8fafc;
}

.calendar-header-cell {
  padding: 12px;
  text-align: center;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
}

.calendar-body {
  display: flex;
  flex-direction: column;
}

.calendar-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-cell {
  min-height: 80px;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;
}

.calendar-cell:hover {
  transform: scale(1.1);
  z-index: 1;
}

.calendar-date {
  position: absolute;
  top: 6px;
  right: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

/* Enhanced Attendance Status Colors */
.attendance-present { background: linear-gradient(135deg, #d1fae5, #a7f3d0); }
.attendance-on-site { background: linear-gradient(135deg, #e0e7ff, #c7d2fe); }
.attendance-half-day { background: linear-gradient(135deg, #fed7aa, #fdba74); }
.attendance-traveling { background: linear-gradient(135deg, #fef3c7, #fde68a); }
.attendance-leave { background: linear-gradient(135deg, #e9d5ff, #d8b4fe); }
.attendance-absent { background: linear-gradient(135deg, #fee2e2, #fecaca); border-left: 3px solid #ef4444; }
.attendance-missing { background: linear-gradient(135deg, #ffe0e0, #ffc9c9) !important; border-left: 3px solid #dc2626; position: relative; }
.attendance-missing::after {
  content: "!";
  position: absolute;
  bottom: 4px;
  left: 4px;
  width: 16px;
  height: 16px;
  background: #dc2626;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}
.public-holiday { background: linear-gradient(135deg, #fff, #fef9c3) !important; border: 2px solid #58cc71; position: relative; }
.public-holiday::before {
  content: "🎉";
  position: absolute;
  bottom: 4px;
  left: 4px;
  font-size: 12px;
}
.attendance-weekend { background: #f9fafb; opacity: 0.8; }

/* Legend */
.legend-container {
  flex: 1;
  min-width: 220px;
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
}

.legend-container h5 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-list {
  list-style: none;
  margin-bottom: 20px;
}

.legend-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  font-size: 13px;
}

.legend-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.legend-box.present { background: #d1fae5; border-left: 3px solid #10b981; }
.legend-box.on-site { background: #e0e7ff; border-left: 3px solid #3b82f6; }
.legend-box.half-day { background: #fed7aa; border-left: 3px solid #f59e0b; }
.legend-box.traveling { background: #fef3c7; border-left: 3px solid #d97706; }
.legend-box.leave { background: #e9d5ff; border-left: 3px solid #8b5cf6; }
.legend-box.absent { background: #fee2e2; border-left: 3px solid #ef4444; }
.legend-box.missing { background: #ffe0e0; border-left: 3px solid #dc2626; }
.legend-box.holiday { background: #fff; border: 2px solid #58cc71; }

.stats-summary {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
}

/* Modal */
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
  max-width: 450px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.modal-premium-container.small { max-width: 400px; }

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

.modal-premium-header h2 {
  flex: 1;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #1a1a2e;
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
  background: var(--danger);
  color: white;
  transform: rotate(90deg);
}

.modal-premium-body {
  padding: 28px;
  background: #fafbfc;
}

.modal-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 16px;
  text-align: center;
}

.site-input-premium {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.site-input-premium:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-field {
  margin-bottom: 16px;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
  display: block;
}

.modal-premium-footer {
  display: flex;
  gap: 12px;
  padding: 20px 28px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.btn-primary-modern {
  flex: 1;
  padding: 10px 20px;
  background: var(--primary);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary-modern {
  flex: 1;
  padding: 10px 20px;
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary-modern:hover {
  background: #e5e7eb;
}

/* Responsive */
@media (max-width: 1024px) {
  .calendar-wrapper {
    flex-direction: column;
  }
  .calendar-container {
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 16px;
  }
  .attendance-container {
    padding: 20px;
  }
  .attendance-header-premium {
    flex-direction: column;
    align-items: stretch;
  }
  .toggle-view-btn {
    justify-content: center;
  }
  .attendance-table-premium {
    min-width: 500px;
  }
  .calendar-container {
    overflow-x: auto;
  }
  .calendar-grid {
    min-width: 600px;
  }
  .modal-premium-container {
    max-width: 95%;
  }
  .modal-premium-header {
    padding: 16px 20px;
  }
  .modal-premium-body {
    padding: 20px;
  }
  .modal-premium-footer {
    padding: 16px 20px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>