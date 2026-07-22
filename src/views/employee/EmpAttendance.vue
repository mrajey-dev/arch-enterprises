<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div v-if="!isMobile || !isSidebarVisible" class="attendance-container">
        
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
         
          <div class="mobile-title">
            <i class="fas fa-fingerprint"></i>
            <span>Attendance</span>
          </div>
          <button class="mobile-toggle-btn" @click="toggleView">
            <i :class="viewMode === 'day' ? 'fas fa-calendar-alt' : 'fas fa-clock'"></i>
          </button>
        </div>

        <!-- Desktop Header -->
        <div class="attendance-header-premium desktop-only">
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

        <!-- Daily Attendance View - Mobile Optimized -->
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

          <!-- Animated Working Hours Counter with Progress Bar -->
          <div class="working-hours-counter">
            <div class="counter-container">
             
              <div class="counter-content">
                <div class="counter-header">
                  <span class="counter-label">Total Working Hours</span>
                  <span class="counter-status" v-if="isClockedIn">
                    <i class="fas fa-circle pulse-dot"></i>
                    Live
                  </span>
                </div>
                <div class="counter-value-wrapper">
                  <span class="counter-value">{{ formattedWorkingHours }}</span>
                  <span class="counter-target">/ 8:00:00</span>
                </div>
                
            

                <!-- Working Hours Status Badge -->
                <div class="working-status-badge" :class="getWorkingStatusClass">
                  <div class="status-icon">
                    <i :class="getWorkingStatusIcon"></i>
                  </div>
                  <div class="status-info">
                    <span class="status-title">{{ getWorkingStatusText }}</span>
                    <span class="status-description">{{ getWorkingStatusDescription }}</span>
                  </div>
                  <div class="status-progress-mini">
                    <div class="mini-bar">
                      <div class="mini-bar-fill" :style="{ width: getWorkingStatusProgress + '%' }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="attendance-table-wrapper">
            <!-- Mobile Card View -->
            <div class="mobile-attendance-cards" v-if="isMobile">
              <div class="attendance-card-mobile">
                <div class="card-status-row">
                  <span class="status-label">Status</span>
                  <select
                    v-model="user.status"
                    @change="updateStatus"
                    class="status-select-mobile"
                    :class="getStatusClass(user.status)"
                    :disabled="disableStatusSelect || user.statusLocked"
                  >
                    <option disabled value="">Select Status</option>
                    <option v-for="status in availableStatuses" :key="status" :value="status">
                      {{ getStatusLabel(status) }}
                    </option>
                  </select>
                </div>

                <div class="card-detail-row">
                  <span class="detail-label">Clock In</span>
                  <div v-if="user.status === 'Traveling'" class="travel-info-mobile">
                    <span class="travel-place">{{ user.travelFrom || '—' }}</span>
                    <i class="fas fa-arrow-right"></i>
                    <span class="travel-place">{{ user.travelTo || '—' }}</span>
                  </div>
                  <div v-else class="clock-info-mobile">
                    <span class="clock-time">{{ user.clockIn || '—' }}</span>
                    <span v-if="user.status === 'Present' && user.isLate" class="late-badge">
                      <i class="fas fa-exclamation-triangle"></i> Late
                    </span>
                    <span v-else-if="user.status === 'Present' && user.isEarly" class="early-badge">
                      <i class="fas fa-star"></i> Early
                    </span>
                  </div>
                </div>

                <div class="card-detail-row">
                  <span class="detail-label">Clock Out</span>
                  <div v-if="['Present', 'HalfDay', 'OnSite'].includes(user.status)">
                    <img
                      src="https://icons.veryicon.com/png/o/internet--web/common-work-social-mobile-terminals/check-in-and-punch-out.png"
                      alt="Punch Out"
                      @click="confirmPunchOut(user)"
                      class="punch-out-icon-mobile"
                      :class="{ disabled: user.clockOut !== '' }"
                    />
                  </div>
                  <span v-else>{{ user.clockOut || '—' }}</span>
                </div>

                <div class="card-detail-row">
                  <span class="detail-label">Required Time</span>
                  <span class="detail-value">{{ user.requiredTime }}</span>
                </div>

                <div class="card-detail-row">
                  <span class="detail-label">Actual Time</span>
                  <span class="detail-value actual-time">{{ user.actualTime || '—' }}</span>
                </div>
              </div>
            </div>

            <!-- Desktop Table View -->
            <table class="attendance-table-premium" v-else>
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

        <!-- Monthly Calendar View - Mobile Optimized -->
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
              <!-- Mobile Calendar - Full 7 days -->
              <div class="calendar-grid-mobile" v-if="isMobile">
                <div class="calendar-header-mobile">
                  <div v-for="day in weekdays" :key="day" class="calendar-header-cell-mobile">
                    {{ day.slice(0, 2) }}
                  </div>
                </div>
                <div class="calendar-body-mobile">
                  <div v-for="(week, weekIndex) in calendarData" :key="weekIndex" class="calendar-week-mobile">
                    <div
                      v-for="(day, dayIndex) in week"
                      :key="dayIndex"
                      class="calendar-cell-mobile"
                      :class="getAttendanceClass(day)"
                    >
                      <span class="calendar-date-mobile">{{ day.date }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Desktop Calendar -->
              <div class="calendar-grid" v-else>
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

            <!-- Legend - Mobile Optimized -->
            <div class="legend-container">
              <h5><i class="fas fa-info-circle"></i> Legend</h5>
              <ul class="legend-list" :class="{ 'legend-list-mobile': isMobile }">
                <li><span class="legend-box present"></span> Present</li>
                <li><span class="legend-box on-site"></span> On Site</li>
                <li><span class="legend-box half-day"></span> Half Day</li>
                <li><span class="legend-box traveling"></span> Traveling</li>
                <li><span class="legend-box leave"></span> Leave</li>
                <li><span class="legend-box holiday"></span> Holiday</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- OnSite Popup Modal - Mobile Optimized -->
    <div v-if="showOnSitePopup" class="modal-premium" @click.self="cancelOnSite">
      <div class="modal-premium-container small" :class="{ 'mobile-modal': isMobile }">
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
            :class="{ 'mobile-input': isMobile }"
            placeholder="Enter site name"
            autofocus
          />
        </div>
        <div class="modal-premium-footer" :class="{ 'mobile-footer': isMobile }">
          <button class="btn-secondary-modern" @click="cancelOnSite">Cancel</button>
          <button class="btn-primary-modern" @click="confirmOnSite">Submit</button>
        </div>
      </div>
    </div>

    <!-- Traveling Popup Modal - Mobile Optimized -->
    <div v-if="showTravelPopup" class="modal-premium" @click.self="cancelTravel">
      <div class="modal-premium-container small" :class="{ 'mobile-modal': isMobile }">
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
            <input type="text" v-model="user.travelFrom" class="site-input-premium" :class="{ 'mobile-input': isMobile }" placeholder="Starting place" />
          </div>
          <div class="form-field">
            <label>To Place</label>
            <input type="text" v-model="user.travelTo" class="site-input-premium" :class="{ 'mobile-input': isMobile }" placeholder="Destination place" />
          </div>
        </div>
        <div class="modal-premium-footer" :class="{ 'mobile-footer': isMobile }">
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
      },
      // Working hours counter properties
      workingHoursInterval: null,
      workingHours: 0, // in seconds
      targetHours: 8 * 3600, // 8 hours in seconds
      // New property to track if previous day was Traveling or OnSite
      previousDayStatus: null
    }
  },
  computed: {
    isTimerRunning() {
    return this.workingHoursInterval !== null;
  },
    isSunday() {
      const date = new Date(this.currentDate);
      return date.getDay() === 0;
    },
    availableStatuses() {
      if (this.isSunday) return ['OnSite', 'Traveling'];
      if (this.isMobile) return ['OnSite', 'Traveling', 'HalfDay'];
      return ['Present', 'OnSite', 'Traveling'];
    },
    // Check if user is currently clocked in
    isClockedIn() {
      return this.user.clockIn && !this.user.clockOut;
    },
    // Format working hours for display - updates in real-time
  formattedWorkingHours() {
  if (!this.user.clockIn) return '00:00:00';
  
  let totalSeconds = this.workingHours;
  
  // If clocked in and not clocked out, calculate elapsed time
  if (this.isClockedIn) {
    const clockInTime = this.parseTimeToDate(this.user.clockIn);
    if (clockInTime) {
      const now = new Date();
      const elapsed = Math.floor((now - clockInTime) / 1000);
      totalSeconds = Math.max(this.workingHours, elapsed);
    }
  }
  
  // Ensure we have a valid number
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    totalSeconds = 0;
  }
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
},
    // Get total working hours in hours (decimal)
    totalWorkingHours() {
      if (!this.user.clockIn) return 0;
      
      let totalSeconds = this.workingHours;
      
      if (this.isClockedIn) {
        const clockInTime = this.parseTimeToDate(this.user.clockIn);
        if (clockInTime) {
          const now = new Date();
          const elapsed = Math.floor((now - clockInTime) / 1000);
          totalSeconds = Math.max(this.workingHours, elapsed);
        }
      }
      
      return totalSeconds / 3600;
    },
    // Calculate work progress percentage
    workProgress() {
      if (!this.user.clockIn) return 0;
      
      let totalSeconds = this.workingHours;
      
      if (this.isClockedIn) {
        const clockInTime = this.parseTimeToDate(this.user.clockIn);
        if (clockInTime) {
          const now = new Date();
          const elapsed = Math.floor((now - clockInTime) / 1000);
          totalSeconds = Math.max(this.workingHours, elapsed);
        }
      }
      
      const progress = (totalSeconds / this.targetHours) * 100;
      return Math.min(progress, 100);
    },
    // Get progress class for color changes
    getProgressClass() {
      const progress = this.workProgress;
      if (progress >= 100) return 'completed';
      if (progress >= 75) return 'excellent';
      if (progress >= 50) return 'good';
      if (progress >= 25) return 'moderate';
      return 'starting';
    },
    // Working Hours Status
    getWorkingStatusClass() {
      const hours = this.totalWorkingHours;
      if (!this.user.clockIn) return 'not-started';
      if (hours >= 7.5) return 'full-day';
      if (hours >= 3) return 'half-day';
      return 'absent';
    },
    getWorkingStatusText() {
      const hours = this.totalWorkingHours;
      if (!this.user.clockIn) return 'Not Started';
      if (hours >= 7.5) return '✅ Full Day';
      if (hours >= 3) return '🕒 Half Day';
      return '❌ Absent';
    },
    getWorkingStatusDescription() {
      const hours = this.totalWorkingHours;
      if (!this.user.clockIn) return 'Clock in to start tracking';
      if (hours >= 7.5) return `Great! You've completed ${hours.toFixed(1)} hours`;
      if (hours >= 3) return `${hours.toFixed(1)} hours completed. Need 7.5 hours for Full Day`;
      return `${hours.toFixed(1)} hours completed. Need at least 3 hours for Half Day`;
    },
    getWorkingStatusIcon() {
      const hours = this.totalWorkingHours;
      if (!this.user.clockIn) return 'fas fa-clock';
      if (hours >= 7.5) return 'fas fa-check-circle';
      if (hours >= 3) return 'fas fa-hourglass-half';
      return 'fas fa-times-circle';
    },
    getWorkingStatusProgress() {
      const hours = this.totalWorkingHours;
      if (!this.user.clockIn) return 0;
      if (hours >= 7.5) return 100;
      if (hours >= 3) return ((hours - 3) / 4.5) * 100;
      return (hours / 3) * 100;
    }
  },
  methods: {
    debugTimer() {
  console.log('=== DEBUG TIMER ===');
  console.log('workingHours:', this.workingHours);
  console.log('formattedWorkingHours:', this.formattedWorkingHours);
  console.log('user.clockIn:', this.user.clockIn);
  console.log('user.clockOut:', this.user.clockOut);
  console.log('isClockedIn:', this.isClockedIn);
  console.log('workingHoursInterval:', this.workingHoursInterval);
  
  // Try to restart the counter
  this.startWorkingHoursCounter();
  
  // Force update
  this.$forceUpdate();
  
  // Log after force update
  this.$nextTick(() => {
    console.log('After force update - workingHours:', this.workingHours);
    console.log('After force update - formattedWorkingHours:', this.formattedWorkingHours);
  });
},
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
    // Parse time string to Date object
parseTimeToDate(timeStr) {
  if (!timeStr) {
    console.warn('parseTimeToDate: No time string provided');
    return null;
  }
  
  console.log('parseTimeToDate: Input time:', timeStr, 'Type:', typeof timeStr);
  
  try {
    const now = new Date();
    let hours = 0, minutes = 0, seconds = 0;
    
    // Try different time formats
    if (typeof timeStr === 'string') {
      // Format: "HH:MM:SS" (24-hour)
      const timeParts = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
      if (timeParts) {
        hours = parseInt(timeParts[1]);
        minutes = parseInt(timeParts[2]);
        seconds = parseInt(timeParts[3] || 0);
        console.log('Parsed from HH:MM:SS format:', { hours, minutes, seconds });
      } else {
        // Try parsing as full date
        const dateObj = new Date(timeStr);
        if (!isNaN(dateObj.getTime())) {
          hours = dateObj.getHours();
          minutes = dateObj.getMinutes();
          seconds = dateObj.getSeconds();
          console.log('Parsed from Date object:', { hours, minutes, seconds });
        } else {
          console.error('parseTimeToDate: Could not parse time string:', timeStr);
          return null;
        }
      }
    }
    
    // Validate hours, minutes, seconds
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      console.error('parseTimeToDate: Invalid time components:', { hours, minutes, seconds });
      return null;
    }
    
    // Create date with current date and the time from the string
    const date = new Date(now);
    date.setHours(hours, minutes, seconds, 0);
    
    console.log('parseTimeToDate: Created date:', date.toISOString());
    console.log('parseTimeToDate: Created date (local):', date.toLocaleString());
    
    if (isNaN(date.getTime())) {
      console.error('parseTimeToDate: Invalid date created');
      return null;
    }
    
    return date;
  } catch (error) {
    console.error('parseTimeToDate: Error parsing time:', error);
    return null;
  }
},
    // Get particle style for animation
    getParticleStyle(index) {
      const positions = [
        { top: '10%', left: '20%', delay: '0s' },
        { top: '5%', left: '50%', delay: '1s' },
        { top: '15%', left: '80%', delay: '2s' },
        { top: '0%', left: '35%', delay: '0.5s' },
        { top: '20%', left: '65%', delay: '1.5s' }
      ];
      const pos = positions[index % positions.length];
      return {
        top: pos.top,
        left: pos.left,
        animationDelay: pos.delay
      };
    },
    calculateActualTime(user) {
      if (!user.clockIn || !user.clockOut) {
        // If clocked in but not out, calculate running total
        if (user.clockIn && !user.clockOut) {
          const now = new Date();
          const clockInTime = this.parseTimeToDate(user.clockIn);
          if (clockInTime) {
            const diffMs = now - clockInTime;
            if (diffMs <= 0) return '00:00:00';
            const totalSeconds = Math.floor(diffMs / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          }
        }
        return '';
      }
      
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
    // Start the working hours counter with real-time updates
startWorkingHoursCounter() {
  console.log('=== STARTING COUNTER ===');
  console.log('ClockIn:', this.user.clockIn);
  console.log('ClockOut:', this.user.clockOut);
  console.log('Current Date:', new Date().toISOString());
  
  // Clear any existing interval
  if (this.workingHoursInterval) {
    clearInterval(this.workingHoursInterval);
    this.workingHoursInterval = null;
  }
  
  // Calculate base working hours from clockIn to now
  if (this.user.clockIn && !this.user.clockOut) {
    const clockInTime = this.parseTimeToDate(this.user.clockIn);
    console.log('Parsed clockInTime:', clockInTime);
    console.log('Parsed time as ISO:', clockInTime ? clockInTime.toISOString() : 'Invalid');
    
    if (clockInTime) {
      const now = new Date();
      console.log('Now:', now.toISOString());
      console.log('Now (local):', now.toLocaleString());
      
      const elapsed = Math.floor((now - clockInTime) / 1000);
      console.log('Elapsed seconds:', elapsed);
      
      // Ensure we have a valid number
      if (!isNaN(elapsed) && elapsed > 0) {
        this.workingHours = elapsed;
        console.log('Working hours set to:', this.workingHours);
      } else {
        console.warn('Invalid elapsed time, using 0');
        this.workingHours = 0;
      }
      
      // Force initial update
      this.$forceUpdate();
      console.log('Force update called');
      
      // Start interval to update every second
      this.workingHoursInterval = setInterval(() => {
        if (this.user.clockIn && !this.user.clockOut) {
          const clockInTime = this.parseTimeToDate(this.user.clockIn);
          if (clockInTime) {
            const now = new Date();
            const elapsed = Math.floor((now - clockInTime) / 1000);
            if (!isNaN(elapsed) && elapsed > 0) {
              this.workingHours = elapsed;
            }
            this.$forceUpdate();
          }
        } else {
          clearInterval(this.workingHoursInterval);
          this.workingHoursInterval = null;
          console.log('Counter stopped - user clocked out');
        }
      }, 1000);
      
      console.log('Interval started, ID:', this.workingHoursInterval);
    } else {
      console.error('Failed to parse clockIn time:', this.user.clockIn);
    }
  } else {
    console.log('Not starting counter - conditions not met');
    console.log('ClockIn exists?', !!this.user.clockIn);
    console.log('Not clocked out?', !this.user.clockOut);
  }
},
    // NEW METHOD: Check previous day's status
    async checkPreviousDayStatus() {
      const token = localStorage.getItem('token');
      // Get yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/attendance/today', {
          params: { 
            name: this.user.name, 
            date: yesterdayStr 
          },
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const record = response.data?.data;
        if (record && record.status) {
          const status = record.status.toLowerCase();
          // Check if previous day was Traveling or OnSite
          if (status === 'traveling' || status === 'onsite') {
            this.previousDayStatus = status;
            console.log(`Previous day (${yesterdayStr}) status: ${status} - Override active for today`);
          } else {
            this.previousDayStatus = null;
          }
        } else {
          this.previousDayStatus = null;
        }
      } catch (err) {
        console.error('Error fetching previous day attendance:', err);
        this.previousDayStatus = null;
      }
    },
async saveAttendance() {
  const now = new Date();
  
  // REMOVED: Subtracting 2 minutes logic
  // const adjustedTime = new Date(now);
  // adjustedTime.setMinutes(now.getMinutes() - 2);
  
  // Use the actual current time
  const formattedTime = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  this.user.clockIn = formattedTime;
  this.user.clockOut = '';
  this.user.actualTime = '';
  
  // Use actual current time for early/late checks
  const earlyThreshold = new Date(now);
  earlyThreshold.setHours(9, 30, 0, 0);
  const lateThreshold = new Date(now);
  lateThreshold.setHours(9, 40, 0, 0);
  const halfDayThreshold = new Date(now);
  halfDayThreshold.setHours(13, 0, 0, 0);
  
  this.user.isEarly = now < earlyThreshold;
  this.user.isLate = now > lateThreshold;
  
  // MODIFIED LOGIC: Check if previous day was Traveling or OnSite
  const isPreviousDayTravelingOrOnSite = this.previousDayStatus !== null;
  
  if (this.user.status === 'Present' && now > halfDayThreshold) {
    if (!isPreviousDayTravelingOrOnSite) {
      this.user.status = 'HalfDay';
    } else {
      console.log(`Keeping as Present due to previous day status: ${this.previousDayStatus}`);
    }
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
  
  this.startWorkingHoursCounter();
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
      
      // Stop the counter
      if (this.workingHoursInterval) {
        clearInterval(this.workingHoursInterval);
        this.workingHoursInterval = null;
      }
      
      // Set final working hours
      if (user.actualTime) {
        const parts = user.actualTime.split(':').map(Number);
        this.workingHours = parts[0] * 3600 + parts[1] * 60 + (parts[2] || 0);
      }
    },
convertToLocalTime(timeStr) {
  if (!timeStr) return timeStr;
  
  try {
    // If time is in UTC format (has 'Z' or '+00:00')
    if (timeStr.includes('Z') || timeStr.includes('+')) {
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
      }
    }
    
    // If it's already in HH:MM:SS format, return as is
    if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return timeStr;
    }
    
    // If it's a date string, try to parse it
    const date = new Date(timeStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }
    
    return timeStr;
  } catch (error) {
    console.error('Error converting time:', error);
    return timeStr;
  }
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
      
      // Handle time conversion if needed
    this.user.clockIn = this.convertToLocalTime(record.clock_in || '');
this.user.clockOut = this.convertToLocalTime(record.clock_out || ''); // ✅ Add this
      this.user.siteName = record.site_name || '';
      this.user.travelFrom = record.travel_from || '';
      this.user.travelTo = record.travel_to || '';
      this.user.actualTime = record.actual_time || '';
      this.disableStatusSelect = false;
      this.user.statusLocked = false;
      
      // Save to localStorage
      const key = `attendance_${this.currentDate}_${this.user.name}`;
      localStorage.setItem(key, JSON.stringify(this.user));
      
      // Start counter if clocked in and not clocked out
      if (this.user.clockIn && !this.user.clockOut) {
        // Small delay to ensure data is fully loaded
        setTimeout(() => {
          this.startWorkingHoursCounter();
          console.log('Counter started after fetching from database');
          this.$forceUpdate();
        }, 100);
      }
      
      // Set working hours if already clocked out
      if (this.user.clockOut && this.user.actualTime) {
        const parts = this.user.actualTime.split(':').map(Number);
        this.workingHours = parts[0] * 3600 + parts[1] * 60 + (parts[2] || 0);
      }
      
      this.$forceUpdate();
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
        
        await this.fetchUserLeaveBalance();
        this.generateCalendarFromStatus(attendanceData);
        
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
      
      const publicHolidays = ['01-26', '05-01', '08-15', '10-02', '12-25', '07-08'];
      
      const calendar = [];
      let week = [];
      
      for (let i = 0; i < startingDayOfWeek; i++) {
        week.push({ 
          date: '', 
          status: null, 
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
        
        if (attendance && attendance.hasData) {
          status = attendance.status;
        }
        
        week.push({
          date: day,
          status: status,
          isPublicHoliday: isHoliday,
          isWeekend: isSunday || isSaturday,
          fullDate: cellDate
        });
        
        if (cellDate.getDay() === 6 || day === totalDays) {
          while (week.length < 7) {
            week.push({ 
              date: '', 
              status: null, 
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
  
  watch: {
  'user.clockIn'(newVal) {
    if (newVal && !this.user.clockOut) {
      this.startWorkingHoursCounter();
    }
  },
  workingHours(newVal) {
    // This will trigger when workingHours changes
    console.log('Working hours updated:', newVal);
  }
},

mounted() {
  console.log('=== COMPONENT MOUNTED ===');
  console.log('Environment:', window.location.hostname);
  
  this.checkIfMobile();
  window.addEventListener('resize', this.checkIfMobile);
  this.currentDate = new Date().toISOString().split('T')[0];
  console.log('Current date:', this.currentDate);
  
  // NEW: Check previous day's status first
  this.checkPreviousDayStatus().then(() => {
    const key = `attendance_${this.currentDate}_${this.user.name}`;
    console.log('LocalStorage key:', key);
    const savedData = localStorage.getItem(key);
    console.log('Saved data from localStorage:', savedData);
    
    if (savedData) {
      try {
        this.user = JSON.parse(savedData);
        console.log('Parsed user data:', this.user);
        console.log('ClockIn value:', this.user.clockIn);
        console.log('ClockOut value:', this.user.clockOut);
        
        // Restore working hours from saved data
        if (this.user.clockIn && !this.user.clockOut) {
          console.log('Condition met - starting counter from localStorage');
          // This will start the counter and calculate from clock-in time
          this.startWorkingHoursCounter();
          console.log('Counter started from localStorage data');
        } else if (this.user.clockOut && this.user.actualTime) {
          console.log('User already clocked out, setting final hours');
          const parts = this.user.actualTime.split(':').map(Number);
          this.workingHours = parts[0] * 3600 + parts[1] * 60 + (parts[2] || 0);
          console.log('Working hours set to:', this.workingHours);
        } else {
          console.log('No clock in or clock out data found');
        }
        
        // Force update after data load
        this.$forceUpdate();
        this.$nextTick(() => {
          this.$forceUpdate();
          console.log('After force update - formatted hours:', this.formattedWorkingHours);
        });
      } catch (error) {
        console.error('Error parsing saved data:', error);
        this.fetchTodayStatus();
      }
    } else {
      console.log('No saved data, fetching from database');
      this.fetchTodayStatus().then(() => {
        // After fetching, if user is clocked in, start the counter
        if (this.user.clockIn && !this.user.clockOut) {
          console.log('Condition met - starting counter from database');
          this.startWorkingHoursCounter();
          console.log('Counter started from database data');
        }
        this.$forceUpdate();
      });
    }
  });
  
  const token = localStorage.getItem('token');
  if (!token) {
    this.$router.push('/auth');
  }
},
  
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
    // Clean up interval
    if (this.workingHoursInterval) {
      clearInterval(this.workingHoursInterval);
      this.workingHoursInterval = null;
    }
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

.attendance-container {
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

.mobile-toggle-btn {
  background: var(--primary);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-toggle-btn:active {
  transform: scale(0.9);
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
  font-size: 21px;
  font-weight: 700;
  background: var(--primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
}

.header-subtitle {
  color: #6b7280;
  font-size: 12px;
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
  white-space: nowrap;
}

.toggle-view-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.toggle-view-btn:active {
  transform: scale(0.95);
}

/* Animated Working Hours Counter */
.working-hours-counter {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8faff, #f0f4ff);
  border-bottom: 2px solid #e5e7eb;
  position: relative;
  overflow: hidden;
}

.working-hours-counter::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 50%, rgba(102, 126, 234, 0.05) 0%, transparent 70%);
  animation: shimmer 10s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { transform: translateX(-30%) translateY(-20%); }
  50% { transform: translateX(30%) translateY(20%); }
}

.counter-container {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.counter-icon {
  width: 56px;
  height: 56px;
  background: var(--primary);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  flex-shrink: 0;
  animation: iconPulse 3s ease-in-out infinite;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.counter-content {
  flex: 1;
  min-width: 0;
}

.counter-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.counter-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.counter-status {
  font-size: 11px;
  color: #10b981;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  background: #d1fae5;
  border-radius: 12px;
}

.pulse-dot {
  animation: pulse-dot 1.5s ease-in-out infinite;
  font-size: 8px;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.8); }
}

.counter-value-wrapper {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.counter-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.counter-target {
  font-size: 16px;
  color: #9ca3af;
  font-weight: 500;
}

/* Progress Bar */
.progress-wrapper {
  position: relative;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar-track {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.8s cubic-bezier(0.34, 1.2, 0.64, 1);
  position: relative;
  background: linear-gradient(90deg, #667eea, #764ba2);
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
}

.progress-bar-fill.starting {
  background: linear-gradient(90deg, #60a5fa, #3b82f6);
}

.progress-bar-fill.moderate {
  background: linear-gradient(90deg, #34d399, #10b981);
}

.progress-bar-fill.good {
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
}

.progress-bar-fill.excellent {
  background: linear-gradient(90deg, #f472b6, #ec4899);
}

.progress-bar-fill.completed {
  background: linear-gradient(90deg, #34d399, #10b981);
  animation: completedPulse 2s ease-in-out infinite;
}

@keyframes completedPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
}

.progress-glow {
  position: absolute;
  top: -2px;
  left: 0;
  right: 0;
  height: 12px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: glowMove 2s ease-in-out infinite;
}

@keyframes glowMove {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-percentage {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  min-width: 44px;
  text-align: right;
}

/* Particles */
.progress-particles {
  position: relative;
  height: 0;
  overflow: visible;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: var(--primary-color);
  border-radius: 50%;
  opacity: 0;
  animation: particleFloat 3s ease-in-out infinite;
}

.particle:nth-child(1) { animation-delay: 0s; }
.particle:nth-child(2) { animation-delay: 0.6s; }
.particle:nth-child(3) { animation-delay: 1.2s; }
.particle:nth-child(4) { animation-delay: 1.8s; }
.particle:nth-child(5) { animation-delay: 2.4s; }

@keyframes particleFloat {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0);
  }
  20% {
    opacity: 0.8;
    transform: translateY(-10px) scale(1);
  }
  80% {
    opacity: 0.8;
    transform: translateY(-30px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-40px) scale(0);
  }
}

/* Milestones */
.milestones {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding: 0 4px;
}

.milestone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  opacity: 0.3;
  transition: all 0.5s ease;
}

.milestone.achieved {
  opacity: 1;
}

.milestone-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d1d5db;
  transition: all 0.5s ease;
}

.milestone.achieved .milestone-dot {
  background: #10b981;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
  animation: dotPop 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
}

@keyframes dotPop {
  0% { transform: scale(0); }
  50% { transform: scale(1.5); }
  100% { transform: scale(1); }
}

.milestone-label {
  font-size: 10px;
  color: #9ca3af;
  font-weight: 500;
}

.milestone.achieved .milestone-label {
  color: #10b981;
}

/* Working Status Badge */
.working-status-badge {
  margin-top: 14px;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 14px;
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  transition: all 0.5s ease;
  position: relative;
  overflow: hidden;
}

.working-status-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  transition: all 0.5s ease;
}

.working-status-badge.absent {
  background: #fef2f2;
  border-color: #fca5a5;
}

.working-status-badge.absent::before {
  background: #ef4444;
}

.working-status-badge.half-day {
  background: #fffbeb;
  border-color: #fcd34d;
}

.working-status-badge.half-day::before {
  background: #f59e0b;
}

.working-status-badge.full-day {
  background: #f0fdf4;
  border-color: #6ee7b7;
}

.working-status-badge.full-day::before {
  background: #10b981;
}

.working-status-badge.not-started {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.working-status-badge.not-started::before {
  background: #9ca3af;
}

.status-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.working-status-badge.absent .status-icon {
  background: #fee2e2;
  color: #dc2626;
}

.working-status-badge.half-day .status-icon {
  background: #fef3c7;
  color: #d97706;
}

.working-status-badge.full-day .status-icon {
  background: #d1fae5;
  color: #059669;
}

.working-status-badge.not-started .status-icon {
  background: #e5e7eb;
  color: #6b7280;
}

.status-info {
  flex: 1;
  position: relative;
  z-index: 1;
}

.status-title {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
}

.status-description {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-top: 1px;
}

.status-progress-mini {
  width: 80px;
  position: relative;
  z-index: 1;
}

.mini-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.mini-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.working-status-badge.absent .mini-bar-fill {
  background: #ef4444;
}

.working-status-badge.half-day .mini-bar-fill {
  background: #f59e0b;
}

.working-status-badge.full-day .mini-bar-fill {
  background: #10b981;
}

.working-status-badge.not-started .mini-bar-fill {
  background: #9ca3af;
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
  white-space: nowrap;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: black;
  color: rgb(255, 255, 255);
}

.nav-btn:active {
  transform: scale(0.9);
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
  -webkit-overflow-scrolling: touch;
}

.attendance-table-premium {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
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

/* Mobile Attendance Cards */
.mobile-attendance-cards {
  display: none;
  padding: 16px;
}

.attendance-card-mobile {
  background: #f8fafc;
  border-radius: 16px;
  padding: 16px;
}

.card-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.status-label {
  font-weight: 600;
  color: #6b7280;
  font-size: 13px;
}

.status-select-mobile {
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  background: #f3f4f6;
  color: #6b7280;
  transition: all 0.3s ease;
  min-width: 120px;
}

.status-select-mobile:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.status-select-mobile.present { background: #d1fae5; color: #065f46; }
.status-select-mobile.onsite { background: #e0e7ff; color: #4338ca; }
.status-select-mobile.traveling { background: #fef3c7; color: #d97706; }
.status-select-mobile.halfday { background: #fed7aa; color: #c2410c; }

.card-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.card-detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 13px;
  color: #6b7280;
}

.detail-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--dark);
}

.detail-value.actual-time {
  font-weight: 600;
  color: var(--primary-color);
}

.travel-info-mobile {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.clock-info-mobile {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.punch-out-icon-mobile {
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.punch-out-icon-mobile:active:not(.disabled) {
  transform: scale(0.9);
}

.punch-out-icon-mobile.disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  width: 100%;
  max-width: 160px;
  transition: all 0.3s ease;
}

.status-select-premium:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.status-select-premium.present { background: #d1fae5; color: #065f46; }
.status-select-premium.onsite { background: #e0e7ff; color: #4338ca; }
.status-select-premium.traveling { background: #fef3c7; color: #d97706; }
.status-select-premium.halfday { background: #fed7aa; color: #c2410c; }

.clock-cell {
  font-family: monospace;
  font-size: 14px;
}

.clock-time {
  font-weight: 500;
}

.travel-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  flex-wrap: wrap;
}

.travel-place {
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 6px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.late-badge, .early-badge {
  display: inline-block;
  margin-left: 8px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  white-space: nowrap;
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

.punch-out-icon:active:not(.disabled) {
  transform: scale(0.9);
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
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.calendar-grid {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  min-width: 500px;
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
  font-size: 13px;
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

/* Mobile Calendar - Full 7 Days */
.calendar-grid-mobile {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.calendar-header-mobile {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.calendar-header-cell-mobile {
  padding: 8px 4px;
  text-align: center;
  font-weight: 600;
  color: #6b7280;
  font-size: 10px;
  border-right: 1px solid #e5e7eb;
}

.calendar-header-cell-mobile:last-child {
  border-right: none;
}

.calendar-body-mobile {
  display: flex;
  flex-direction: column;
}

.calendar-week-mobile {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-cell-mobile {
  min-height: 40px;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}

.calendar-cell-mobile:last-child {
  border-right: none;
}

.calendar-date-mobile {
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
}

/* Mobile Calendar Status Colors */
.calendar-cell-mobile.attendance-present { background: #d1fae5; }
.calendar-cell-mobile.attendance-on-site { background: #e0e7ff; }
.calendar-cell-mobile.attendance-half-day { background: #fed7aa; }
.calendar-cell-mobile.attendance-traveling { background: #fef3c7; }
.calendar-cell-mobile.attendance-leave { background: #e9d5ff; }
.calendar-cell-mobile.attendance-absent { background: #fee2e2; border-left: 2px solid #ef4444; }
.calendar-cell-mobile.attendance-missing { background: #ffe0e0; border-left: 2px solid #dc2626; position: relative; }
.calendar-cell-mobile.attendance-weekend { background: #f9fafb; opacity: 0.8; }
.calendar-cell-mobile.public-holiday { background: #fef9c3; border: 2px solid #58cc71; }

/* Attendance Status Colors */
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
  min-width: 200px;
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

.legend-list-mobile li {
  font-size: 12px;
  padding: 6px 0;
}

.legend-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-box.present { background: #d1fae5; border-left: 3px solid #10b981; }
.legend-box.on-site { background: #e0e7ff; border-left: 3px solid #3b82f6; }
.legend-box.half-day { background: #fed7aa; border-left: 3px solid #f59e0b; }
.legend-box.traveling { background: #fef3c7; border-left: 3px solid #d97706; }
.legend-box.leave { background: #e9d5ff; border-left: 3px solid #8b5cf6; }
.legend-box.holiday { background: #fff; border: 2px solid #58cc71; }

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

.modal-premium-container.mobile-modal {
  max-width: 95%;
  border-radius: 24px;
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
  flex-shrink: 0;
}

.mobile-modal .modal-icon {
  width: 36px;
  height: 36px;
  font-size: 16px;
}

.modal-premium-header h2 {
  flex: 1;
  font-size: 20px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-close:hover {
  background: var(--danger);
  color: white;
  transform: rotate(90deg);
}

.modal-premium-body {
  padding: 28px;
  background: #fafbfc;
  overflow-y: auto;
}

.mobile-modal .modal-premium-body {
  padding: 16px;
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

.site-input-premium.mobile-input {
  font-size: 16px;
  padding: 14px;
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

.modal-premium-footer.mobile-footer {
  flex-direction: column;
  padding: 16px 20px;
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

.btn-primary-modern:active {
  transform: scale(0.98);
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

.btn-secondary-modern:active {
  transform: scale(0.98);
}

.mobile-footer .btn-primary-modern,
.mobile-footer .btn-secondary-modern {
  width: 100%;
  padding: 14px;
}

/* Responsive */
@media (max-width: 1024px) {
  .calendar-container {
    min-width: auto;
  }
  .calendar-grid {
    min-width: 400px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 12px;
    gap: 12px;
  }
  
  .attendance-container {
    padding: 16px;
    border-radius: 20px;
  }
  
  .mobile-header {
    display: flex;
  }
  
  .attendance-header-premium {
    display: none;
  }
  
  .card-header-premium {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .section-title {
    font-size: 15px;
  }
  
  .date-badge {
    font-size: 12px;
    padding: 4px 12px;
  }
  
  .month-navigation {
    width: 100%;
    justify-content: space-between;
  }
  
  .month-year {
    font-size: 14px;
    min-width: auto;
  }
  
  .attendance-table-premium {
    display: none;
  }
  
  .mobile-attendance-cards {
    display: block;
  }
  
  .calendar-wrapper {
    flex-direction: column;
    padding: 16px;
    gap: 20px;
  }
  
  .calendar-container {
    min-width: auto;
    overflow-x: auto;
  }
  
  .calendar-grid {
    display: none;
  }
  
  .calendar-grid-mobile {
    display: block;
    min-width: 320px;
  }
  
  .legend-container {
    min-width: auto;
  }
  
  .legend-list li {
    font-size: 12px;
    padding: 6px 0;
  }

  /* Working Hours Counter Mobile */
  .working-hours-counter {
    padding: 16px;
  }
  
  .counter-container {
    gap: 12px;
  }
  
  .counter-icon {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }
  
  .counter-value {
    font-size: 24px;
  }
  
  .counter-target {
    font-size: 14px;
  }
  
  .counter-label {
    font-size: 12px;
  }
  
  .counter-status {
    font-size: 10px;
    padding: 1px 8px;
  }
  
  .progress-bar-track {
    height: 6px;
  }
  
  .progress-percentage {
    font-size: 12px;
    min-width: 36px;
  }
  
  .milestone-label {
    font-size: 8px;
  }
  
  .milestone-dot {
    width: 6px;
    height: 6px;
  }

  .working-status-badge {
    padding: 10px 14px;
    gap: 10px;
  }

  .status-icon {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .status-title {
    font-size: 13px;
  }

  .status-description {
    font-size: 11px;
  }

  .status-progress-mini {
    width: 60px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
    gap: 8px;
  }
  
  .attendance-container {
    padding: 12px;
    border-radius: 16px;
  }
  
  .mobile-title {
    font-size: 16px;
  }
  
  .mobile-toggle-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .card-header-premium {
    padding: 12px;
  }
  
  .section-title {
    font-size: 13px;
  }
  
  .attendance-card-mobile {
    padding: 12px;
  }
  
  .status-select-mobile {
    font-size: 12px;
    padding: 4px 10px;
    min-width: 100px;
  }
  
  .card-detail-row {
    padding: 8px 0;
  }
  
  .detail-label {
    font-size: 12px;
  }
  
  .detail-value {
    font-size: 12px;
  }
  
  .punch-out-icon-mobile {
    width: 32px;
    height: 32px;
  }
  
  .calendar-grid-mobile {
    min-width: 280px;
  }
  
  .calendar-header-cell-mobile {
    font-size: 8px;
    padding: 6px 2px;
  }
  
  .calendar-cell-mobile {
    min-height: 32px;
    font-size: 9px;
    padding: 2px;
  }
  
  .calendar-date-mobile {
    font-size: 9px;
  }
  
  .calendar-cell-mobile.attendance-missing::after {
    width: 10px;
    height: 10px;
    font-size: 7px;
    bottom: 2px;
    left: 2px;
  }
  
  .public-holiday::before {
    font-size: 8px;
    bottom: 2px;
    left: 2px;
  }
  
  .legend-container {
    padding: 16px;
  }
  
  .legend-container h5 {
    font-size: 14px;
  }
  
  .legend-box {
    width: 16px;
    height: 16px;
  }
  
  .modal-premium-container {
    max-width: 98%;
  }
  
  .modal-premium-header {
    padding: 14px 16px;
  }
  
  .modal-premium-header h2 {
    font-size: 16px;
  }
  
  .modal-premium-body {
    padding: 16px;
  }
  
  .modal-premium-footer {
    padding: 14px 16px;
  }
  
  .site-input-premium.mobile-input {
    font-size: 15px;
    padding: 12px;
  }
  
  .travel-place {
    max-width: 50px;
    font-size: 9px;
  }
  
  .late-badge, .early-badge {
    font-size: 9px;
    padding: 1px 4px;
  }
  
  .clock-time {
    font-size: 12px;
  }

  /* Working Hours Counter Mobile Small */
  .working-hours-counter {
    padding: 12px;
  }
  
  .counter-container {
    gap: 10px;
  }
  
  .counter-icon {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
  
  .counter-value {
    font-size: 18px;
  }
  
  .counter-target {
    font-size: 12px;
  }
  
  .counter-label {
    font-size: 10px;
  }
  
  .counter-status {
    font-size: 8px;
    padding: 1px 6px;
  }
  
  .progress-bar-track {
    height: 5px;
  }
  
  .progress-percentage {
    font-size: 10px;
    min-width: 30px;
  }
  
  .milestones {
    gap: 2px;
  }
  
  .milestone-label {
    font-size: 7px;
  }
  
  .milestone-dot {
    width: 5px;
    height: 5px;
  }

  .working-status-badge {
    padding: 8px 12px;
    gap: 8px;
    flex-wrap: wrap;
  }

  .status-icon {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .status-title {
    font-size: 12px;
  }

  .status-description {
    font-size: 10px;
  }

  .status-progress-mini {
    width: 100%;
    margin-top: 4px;
  }
}

/* Touch-friendly improvements */
@media (hover: none) and (pointer: coarse) {
  .status-select-premium,
  .status-select-mobile,
  .toggle-view-btn,
  .nav-btn,
  .btn-primary-modern,
  .btn-secondary-modern,
  .modal-close,
  .mobile-toggle-btn,
  .menu-toggle {
    min-height: 44px;
    min-width: 44px;
  }
  
  .punch-out-icon,
  .punch-out-icon-mobile {
    min-width: 44px;
    min-height: 44px;
  }
  
  .calendar-cell:hover {
    transform: none;
  }
}

/* Utility classes */
.desktop-only {
  display: flex;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
}
</style>