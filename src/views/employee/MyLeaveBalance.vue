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
        privilege: 0,
        casual: 0,
        sick: 0
      },
      leaveUsed: {
        privilege: 0,
        casual: 0,
        sick: 0
      },
      unpaidLeaveDays: 0,
      holidayWorkCredits: 0,
      halfDayVisible: true,
      halfDayListVisible: false,
      approvedListVisible: false,
      unpaidListVisible: false
    }
  },
  computed: {
    leaveSummary() {
      return {
        privilege: { 
          remaining: Math.max(0, this.leaveAllocations.privilege - this.leaveUsed.privilege), 
          total: this.leaveAllocations.privilege 
        },
        casual: { 
          remaining: Math.max(0, this.leaveAllocations.casual - this.leaveUsed.casual), 
          total: this.leaveAllocations.casual 
        },
        sick: { 
          remaining: Math.max(0, this.leaveAllocations.sick - this.leaveUsed.sick), 
          total: this.leaveAllocations.sick 
        }
      };
    },
    totalRemaining() {
      return Object.values(this.leaveSummary).reduce((sum, item) => sum + Math.max(0, (item.remaining || 0)), 0);
    },
    totalUsed() {
      return Object.values(this.leaveUsed).reduce((sum, item) => sum + (item || 0), 0);
    },
    totalAllocated() {
      return Object.values(this.leaveAllocations).reduce((sum, item) => sum + (item || 0), 0);
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
    scrollToSection(section) {
      // Scroll to relevant section on mobile
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
      } else {
        this.halfDayVisible = true;
        this.halfDayListVisible = true;
        this.approvedListVisible = true;
        this.unpaidListVisible = true;
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
            privilege: parseFloat(balanceData.pl_leave) || 0,
            casual: parseFloat(balanceData.casual_leave) || 0,
            sick: parseFloat(balanceData.sick_leave) || 0
          };
          
          this.leaveUsed = {
            privilege: parseFloat(balanceData.used_pl_leave) || 0,
            casual: parseFloat(balanceData.used_cl_leave) || 0,
            sick: parseFloat(balanceData.used_sick_leave) || 0
          };
          
          const remainingPL = parseFloat(balanceData.remaining_pl_leave) || 0;
          const remainingCL = parseFloat(balanceData.remaining_cl_leave) || 0;
          const remainingSick = parseFloat(balanceData.remaining_sick_leave) || 0;
          
          this.unpaidLeaveDays = parseFloat(balanceData.used_unpaid_leave) || 0;
          
          console.log('Leave Data from DB:', {
            allocations: this.leaveAllocations,
            used: this.leaveUsed,
            remaining: { privilege: remainingPL, casual: remainingCL, sick: remainingSick },
            unpaidLeave: this.unpaidLeaveDays
          });
          
          this.leaveDetails = [
            { 
              type: 'privilege', 
              total: this.leaveAllocations.privilege, 
              used: this.leaveUsed.privilege, 
              remaining: remainingPL
            },
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
            }
          ];
          
        } else {
          this.leaveAllocations = {
            privilege: 0,
            casual: 0,
            sick: 0
          };
          
          this.leaveUsed = {
            privilege: 0,
            casual: 0,
            sick: 0
          };
          
          this.leaveDetails = [
            { type: 'privilege', total: 0, used: 0, remaining: 0 },
            { type: 'casual', total: 0, used: 0, remaining: 0 },
            { type: 'sick', total: 0, used: 0, remaining: 0 }
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
          this.unpaidLeaveDays = this.unpaidAttendanceRecords.length;
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
            toastError(error.response.data.message || 'Could not fetch leave data. Please try again.');
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
  --primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --primary-color: #667eea;
  --dark: #1a1a2e;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
  --unpaid: #f59e0b;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
}
</style>