<template>
  <div class="layout">
    <!-- Main Content -->
    <div class="main-content">
      <!-- Sidebar -->
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <!-- Content -->
      <section
        class="content"
        v-if="(!isMobile || !isSidebarVisible)"
        :class="{ 'expanded-content': isMobile && !isSidebarVisible }"
      >
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <i class="fas fa-chart-pie"></i>
            <span>Dashboard</span>
          </div>
        </div>

        <!-- 🔍 Top Search & Action Bar -->
        <div class="dashboard-topbar">
          <div class="search-box-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search in ARCH360 (Employees, Reports, Resources, Leaves...)"
              class="dashboard-search-input"
            />
            <button v-if="searchQuery" class="search-clear-btn" @click="searchQuery = ''">
              <i class="fas fa-times"></i>
            </button>

            <!-- 🔍 Live Instant Search Results Dropdown -->
            <div v-if="searchQuery && searchQuery.trim()" class="search-results-dropdown">
              <div class="search-dropdown-header">
                <span>Matching Results ({{ filteredSearchResults.length }})</span>
                <span class="search-esc-hint">Click to open</span>
              </div>
              <div v-if="filteredSearchResults.length > 0" class="search-results-list">
                <div
                  v-for="item in filteredSearchResults"
                  :key="item.route + item.title"
                  class="search-result-item"
                  @click="selectSearchResult(item.route)"
                >
                  <div class="search-item-icon">
                    <i :class="item.icon"></i>
                  </div>
                  <div class="search-item-info">
                    <div class="search-item-title-row">
                      <span class="search-item-title">{{ item.title }}</span>
                      <span class="search-item-cat">{{ item.category }}</span>
                    </div>
                    <p class="search-item-desc">{{ item.desc }}</p>
                  </div>
                  <i class="fas fa-chevron-right search-item-arrow"></i>
                </div>
              </div>
              <div v-else class="search-no-results">
                <i class="fas fa-search-minus"></i>
                <p>No matches found for "<strong>{{ searchQuery }}</strong>"</p>
                <small>Try searching for Attendance, Employees, Leaves, Expenses, or Reports</small>
              </div>
            </div>
          </div>
          <button @click="goTo('ScheduleMeeting')" class="btn-create-new">
            <i class="fas fa-plus"></i>
            <span>Schedule Meeting</span>
          </button>
        </div>

        <!-- 🌟 Multi-Column Master Dashboard Layout -->
        <div class="dashboard-main-grid">

          <!-- ◀️ LEFT COLUMN (72%): Main Content -->
          <div class="dashboard-left-col">

            <!-- 1. Quick Access Section -->
            <div class="dashboard-section-block">
              <div class="section-title-row">
                <h3 class="section-heading">Quick Access</h3>
              </div>

              <div class="quick-access-grid">
                <!-- Featured Emerald Card (Attendance Overview) -->
                <div class="qa-card qa-featured" @click="goTo('empattendanceadmin')">
                  <div class="qa-top-row">
                    <div class="qa-icon-box white-box">
                      <i class="fas fa-calendar-check"></i>
                    </div>
                    <div class="qa-avatar-stack">
                      <span class="qa-avatar"><i class="fas fa-user-check"></i></span>
                     
                    </div>
                  </div>
                  <div class="qa-info">
                    <h4 class="qa-title">Attendance Master</h4>
                    <p class="qa-subtitle">Check Attendance</p>
                  </div>
                </div>

                <!-- White Card 1: Work Reports -->
                <div class="qa-card qa-white" @click="goTo('workreport')">
                  <div class="qa-top-row">
                    <div class="qa-icon-box red-tint">
                      <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="qa-avatar-stack">
                      <span class="qa-avatar"><i class="fas fa-user-check"></i></span>
                  
                    </div>
                  </div>
                  <div class="qa-info">
                    <h4 class="qa-title">Work Reports</h4>
                    <p class="qa-subtitle">{{ workReportStats.completed || 28 }} Tasks Done</p>
                  </div>
                </div>

                <!-- White Card 2: Resource Bookings -->
                <div class="qa-card qa-white" @click="goTo('resourcebooking')">
                  <div class="qa-top-row">
                    <div class="qa-icon-box blue-tint">
                      <i class="fas fa-video"></i>
                    </div>
                    <div class="qa-avatar-stack">
                      <span class="qa-avatar"><i class="fas fa-building"></i></span>
                    </div>
                  </div>
                  <div class="qa-info">
                    <h4 class="qa-title">Resource Booking</h4>
                    <p class="qa-subtitle">Meeting Rooms & Assets</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Folders / Modules Shortcuts -->
            <div class="dashboard-section-block">
              <div class="section-title-row">
                <h3 class="section-heading">Folders</h3>
              
              </div>

              <div class="folders-grid">
                <!-- Folder 1: Employees -->
                <div class="folder-card" @click="goTo('employees')">
                  <div class="folder-header">
                    <div class="folder-icon-wrap">
                      <i class="fas fa-folder folder-icon"></i>
                    </div>
                    
                  </div>
                  <h4 class="folder-name">Employees</h4>
                  <div class="folder-meta">
                    <span>{{ totalEmployees }} files</span>
                    <span class="folder-size">Active</span>
                  </div>
                </div>

                <!-- Folder 2: Departments -->
                <div class="folder-card" @click="goTo('managedepartments')">
                  <div class="folder-header">
                    <div class="folder-icon-wrap">
                      <i class="fas fa-folder folder-icon"></i>
                    </div>
                  
                  </div>
                  <h4 class="folder-name">Departments</h4>
                  <div class="folder-meta">
                    <span>Teams Hub</span>
                    <span class="folder-size">Master</span>
                  </div>
                </div>

                <!-- Folder 3: Expenses -->
                <div class="folder-card" @click="goTo('expensemanage')">
                  <div class="folder-header">
                    <div class="folder-icon-wrap">
                      <i class="fas fa-folder folder-icon"></i>
                    </div>
                  
                  </div>
                  <h4 class="folder-name">Expenses</h4>
                  <div class="folder-meta">
                    <span>₹ {{ formatExpenseAmount(expenseStats.total) }}</span>
                    <span class="folder-size">{{ expenseStats.categories || 0 }} Categories</span>
                  </div>
                </div>

                <!-- Folder 4: Leaves -->
                <div class="folder-card" @click="goToLeaveApplications">
                  <div class="folder-header">
                    <div class="folder-icon-wrap">
                      <i class="fas fa-folder folder-icon"></i>
                    </div>
                  
                  </div>
                  <h4 class="folder-name">Leaves Center</h4>
                  <div class="folder-meta">
                    <span>{{ leaveStats.total }} Requests</span>
                    <span class="folder-size">{{ leaveStats.pending }} Pending</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Recent Activity Table ("Recent Files") -->
            <div class="dashboard-section-block">
              <div class="section-title-row">
                <h3 class="section-heading">Recent Files & Operations</h3>
             
              </div>

              <div class="recent-files-card">
                <table class="recent-files-table">
                  <thead>
                    <tr>
                      <th>NAME</th>
                      <th>LAST MODIFIED</th>
                      <th>MEMBER</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr @click="goTo('workreport')">
                      <td>
                        <div class="file-name-cell">
                          <span class="file-pill pill-blue">WR</span>
                          <span class="file-title-text">Work Reports & Daily Tasks</span>
                        </div>
                      </td>
                      <td>{{ todayLabel }}</td>
                      <td><span class="member-tag">All Employees</span></td>
                    </tr>

                    <tr class="highlighted-row" @click="goTo('offerletter')">
                      <td>
                        <div class="file-name-cell">
                          <span class="file-pill pill-orange">DOC</span>
                          <span class="file-title-text">Offer Letters & Onboarding</span>
                        </div>
                      </td>
                      <td>Active Hub</td>
                      <td><span class="member-tag success">HR Desk</span></td>
                    </tr>

                    <tr @click="goTo('empattendanceadmin')">
                      <td>
                        <div class="file-name-cell">
                          <span class="file-pill pill-red">PDF</span>
                          <span class="file-title-text">Monthly Attendance Register</span>
                        </div>
                      </td>
                      <td>{{ attendanceRate }}% Present</td>
                      <td><span class="member-tag">Attendance Master</span></td>
                    </tr>

                    <tr @click="goTo('salaryadvances')">
                      <td>
                        <div class="file-name-cell">
                          <span class="file-pill pill-purple">FIN</span>
                          <span class="file-title-text">Salary Advances & Payroll</span>
                        </div>
                      </td>
                      <td>FY {{ financialYear }}</td>
                      <td><span class="member-tag">Finance</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 4. Monthly Revenue Section -->
            <div class="monthly-revenue-row">
              <div class="revenue-card">
                <div class="revenue-header">
                  <div class="revenue-title">
                    <h3>Revenue Overview</h3>
                    <p>FY {{ financialYear }}</p>
                  </div>
                  <div class="target-input">
                    <label>🎯 Yearly Target (₹) </label>
                    <input
                      type="number"
                      v-model.number="yearlyTarget"
                      placeholder="Enter target"
                      min="0"
                    />
                  </div>
                </div>

                <!-- KPI Summary Cards -->
                <div class="revenue-kpis">
                  <div class="kpi success">
                    <h4>₹ {{ totalRevenueFY.toLocaleString() }}</h4>
                    <p>Total Revenue</p>
                  </div>
                  <div class="kpi info">
                    <h4>₹ {{ yearlyTarget.toLocaleString() }}</h4>
                    <p>Yearly Target</p>
                  </div>
                  <div class="kpi warning">
                    <h4>{{ overallAchievement }}%</h4>
                    <p>Achievement</p>
                  </div>
                  <div class="kpi primary">
                    <h4>{{ topCompanies.length }}</h4>
                    <p>Active Companies</p>
                  </div>
                </div>

                <!-- Top 5 Companies Revenue Breakdown -->
                <div class="companies-breakdown">
                  <h4 class="breakdown-title">🏢 Top 5 Companies Revenue (Closed Orders)</h4>
                  <div class="companies-grid">
                    <div 
                      v-for="(company, index) in topCompanies" 
                      :key="company.name"
                      class="company-card"
                      :class="getCompanyClass(index)"
                    >
                      <div class="company-rank">{{ index + 1 }}</div>
                      <div class="company-info">
                        <div class="company-name">{{ company.name }}</div>
                        <div class="company-details">
                          <span class="company-revenue">₹ {{ company.revenue.toLocaleString() }}</span>
                          <span class="company-percent">{{ company.percentage }}%</span>
                          <span class="company-orders">📦 {{ company.orderCount }} orders</span>
                        </div>
                      </div>
                      <div class="company-bar">
                        <div 
                          class="company-bar-fill"
                          :style="{ width: company.percentage + '%' }"
                          :class="getBarColor(index)"
                        ></div>
                      </div>
                    </div>
                  </div>
                  <p v-if="topCompanies.length === 0" class="no-data-message">
                    No closed orders found for the current financial year
                  </p>
                </div>

                <!-- Quarter Grid -->
                <div class="quarter-grid">
                  <div
                    v-for="q in ['Q1','Q2','Q3','Q4']"
                    :key="q"
                    class="quarter-card"
                    :class="quarterAnalytics[q].percent >= 100 ? 'success' : 'danger'"
                  >
                    <h4>{{ q }}</h4>
                    <p>₹ {{ quarterAnalytics[q].revenue.toLocaleString() }}</p>
                    <small>{{ quarterAnalytics[q].percent }}%</small>
                  </div>
                </div>

                <!-- Charts -->
                <div class="bar-chart-wrapper">
                  <canvas id="monthlyRevenueBarChart"></canvas>
                </div>

                <div class="analytics-card">
                  <h4><i class="fas fa-chart-line"></i> Cumulative Revenue vs Target</h4>
                  <div class="chart-height">
                    <canvas id="cumulativeChart"></canvas>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- ▶️ RIGHT COLUMN (28%): Widgets & Capacity Panel -->
          <div class="dashboard-right-col">

            <!-- Widget 1: Capacity & Annual Goal Arc Card -->
            <div class="side-widget-card arc-gauge-card">
              <!-- Rainbow Arc Meter -->
              <div class="arc-meter-container">
                <svg class="arc-svg" viewBox="0 0 200 115">
                  <defs>
                    <linearGradient id="arcRainbowGrad" x1="0%" y1="100%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#ef4444" />
                      <stop offset="22%" stop-color="#f43f5e" />
                      <stop offset="38%" stop-color="#10b981" />
                      <stop offset="68%" stop-color="#2cb67d" />
                      <stop offset="84%" stop-color="#f59e0b" />
                      <stop offset="100%" stop-color="#38bdf8" />
                    </linearGradient>
                  </defs>
                  <!-- Gray background track -->
                  <path
                    d="M 28,105 A 72,72 0 0,1 172,105"
                    fill="none"
                    stroke="#e8f5ee"
                    stroke-width="17"
                    stroke-linecap="round"
                  />
                  <!-- Continuous Smooth Rainbow Arc -->
                  <path
                    d="M 28,105 A 72,72 0 0,1 172,105"
                    fill="none"
                    stroke="url(#arcRainbowGrad)"
                    stroke-width="17"
                    stroke-linecap="round"
                  />
                </svg>
                <div class="arc-center-text">
                  <h2 class="arc-big-val">{{ overallAchievement }}%</h2>
                  <p class="arc-sub-val">of ₹ {{ formatNumber(yearlyTarget) }} Target</p>
                </div>
              </div>

              <!-- Strategic Business Unit Box (PRO Box style from mockup) -->
              <div class="pro-promo-card">
                <div class="promo-illustration">
                  <div class="shield-circle">
                    <i class="fas fa-shield-alt"></i>
                  </div>
                </div>
                <h4 class="promo-title">Strategic Business Unit</h4>
                <p class="promo-desc">Review quarterly goals, KRA targets & strategic performance.</p>
                <button class="promo-cta-btn" disabled @click="goTo('#')">
                  <span>Open SBU Portal</span>
                </button>
              </div>
            </div>

            <!-- Widget 2: Birthday Reminders -->
            <div class="side-widget-card birthday-side-card">
              <div class="side-card-header">
                <h4>🎉 Birthdays - {{ months[new Date().getMonth()] }}</h4>
              </div>

              <div v-if="birthdays.length > 0" class="side-birthdays-list">
                <div v-for="(emp, index) in birthdays" :key="index" class="side-birthday-item">
                  <img
                    :src="emp.photo || 'https://img.icons8.com/color/48/000000/user-male-circle.png'"
                    alt="Employee"
                    class="birthday-avatar"
                  />
                  <div class="birthday-details">
                    <p class="birthday-emp-name">{{ emp.name }}</p>
                    <span class="birthday-emp-date">🎂 {{ formatBirthday(emp.dateofbirth) }}</span>
                  </div>
                </div>
              </div>
              <p v-else class="no-birthdays-side">No birthdays this month 🎈</p>
            </div>

          </div>

        </div>

      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'
import Chart from "chart.js/auto";

export default {
  name: 'Dashboard',
  components: { Sidebar },
  data() {
    return {
      searchQuery: '',
      searchCatalog: [
        { title: 'Attendance Master', category: 'Attendance', route: 'empattendanceadmin', icon: 'fas fa-calendar-check', desc: 'Daily attendance logs, time-in/out records' },
        { title: 'Work Reports', category: 'Operations', route: 'workreport', icon: 'fas fa-file-alt', desc: 'Employee daily task sheets & reports' },
        { title: 'Workforce & Employees', category: 'HR Master', route: 'employees', icon: 'fas fa-users', desc: 'Employee directory, profiles & records' },
        { title: 'Resource Booking', category: 'Operations', route: 'resourcebooking', icon: 'fas fa-video', desc: 'Meeting rooms, equipment & asset reservations' },
        { title: 'Manage Departments', category: 'HR Master', route: 'managedepartments', icon: 'fas fa-building', desc: 'Department hierarchy and designations' },
        { title: 'Expense Management', category: 'Finance', route: 'expensemanage', icon: 'fas fa-receipt', desc: 'Track claims, IT expenses & category spend' },
        { title: 'Salary Advances', category: 'Finance', route: 'salaryadvances', icon: 'fas fa-money-bill-wave', desc: 'Employee salary advance requests & status' },
        { title: 'Salary Slips', category: 'Finance', route: 'salaryslip', icon: 'fas fa-file-invoice-dollar', desc: 'Generate & download payroll pay slips' },
        { title: 'Recruitment & Job Openings', category: 'HR Master', route: 'recruitmentsection', icon: 'fas fa-user-plus', desc: 'Job postings, candidates & hiring pipeline' },
        { title: 'Leave Applications', category: 'Leaves', route: 'leaveapplications', icon: 'fas fa-calendar-minus', desc: 'All leave requests & approval pipeline' },
        { title: 'Pending Leaves', category: 'Leaves', route: 'pendingleaves', icon: 'fas fa-clock', desc: 'Awaiting manager & HR approval' },
        { title: 'Approved Leaves', category: 'Leaves', route: 'approvedleaves', icon: 'fas fa-check-circle', desc: 'List of sanctioned leaves' },
        { title: 'Rejected Leaves', category: 'Leaves', route: 'rejectedleaves', icon: 'fas fa-times-circle', desc: 'Declined leave requests' },
        { title: 'Manage Leave Types', category: 'Leaves', route: 'manageleavetype', icon: 'fas fa-cog', desc: 'Configure sick, casual & privilege leaves' },
        { title: 'Generate Offer Letter', category: 'Letters', route: 'offerletter', icon: 'fas fa-file-contract', desc: 'Create and issue employment offer letters' },
        { title: 'Offer Letter List', category: 'Letters', route: 'OfferLetterList', icon: 'fas fa-list-alt', desc: 'Issued offer letter records' },
        { title: 'Company Holidays', category: 'HR Master', route: 'holidays', icon: 'fas fa-umbrella-beach', desc: 'Official holiday calendar & list' },
        { title: 'Schedule Meeting', category: 'Operations', route: 'ScheduleMeeting', icon: 'fas fa-calendar-plus', desc: 'Create new meetings and invitations' },
        { title: 'Strategic Business Unit (SBU)', category: 'Strategy', route: 'viewkra', icon: 'fas fa-shield-alt', desc: 'KRA targets, quarterly goals & reviews' },
        { title: 'ARCH Calendar', category: 'Operations', route: 'archcalendar', icon: 'fas fa-calendar-alt', desc: 'Company events & operational calendar' },
        { title: 'Help & RCA Desk', category: 'Support', route: 'rcahelp', icon: 'fas fa-life-ring', desc: 'Root cause analysis & support tickets' }
      ],
      chartRevenueInstance: null,
      cumulativeChartInstance: null,
      workReportChart: null,
      expenseChart: null,
      attendanceChart: null,
      leaveChart: null,
      yearlyTarget: 77000000,
      showSkeleton: true,
      currentUserName: 'HR',
      isMobile: false,
      isSidebarVisible: true,
      selectedMonth: new Date().getMonth(),
      selectedYear: new Date().getFullYear(),
      months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
      totalEmployees: 0,
      period: 'month',
      tasksRecorder: {
        pendingTasks: 0,
        completedTasks: 0,
        totalVisits: 0,
        pendingVisits: 0,
        completedVisits: 0,
        ordersCompleted: 0,
        ordersPending: 0,
        materialOrdersPending: 0,
        materialOrdersCompleted: 0,
      },
      colors: {
        'Pending Tasks': '#FF6B6B',
        'Completed Tasks': '#4ECDC4',
        'Service Orders Pending': '#C7CEEA',
        'Service Orders Completed': '#45B7D1',
        'Pending Material Orders': '#FFA07A',
        'Completed Material Orders': '#7DCEA0',
        'Pending Visits': '#FFD93D',
        'Completed Visits': '#7D3C98'
      },
      chartInstances: [],
      monthlyRevenueData: {},
      pieChartsData: [],
      birthdays: [],
      workReportStats: { total: 0, completed: 0, pending: 0, completionRate: 0 },
      expenseStats: { total: 0, categories: 0, data: {} },
      attendanceStats: { present: 0, late: 0, absent: 0, total: 0 },
      leaveStats: { total: 0, approved: 0, pending: 0, rejected: 0 },
      topPerformers: [],
      topCompanies: [],
      poData: [],
      isLoading: false,
      closedOrdersCount: 0
    }
  },

  watch: {
    yearlyTarget(val) {
      localStorage.setItem('yearlyTarget', val)
      this.$nextTick(() => {
        this.renderRevenueBarChart()
        this.renderCumulativeChart()
      })
    },
    period() {
      this.fetchAnalyticsData()
    }
  },

  computed: {
    quarterAnalytics() {
      const quarters = {
        Q1: ['April','May','June'],
        Q2: ['July','August','September'],
        Q3: ['October','November','December'],
        Q4: ['January','February','March']
      }
      const result = {}
      Object.entries(quarters).forEach(([q, months]) => {
        const revenue = months.reduce((sum, m) => sum + (this.monthlyRevenueData[m] || 0), 0)
        const target = months.reduce((sum, m) => sum + (this.monthlyTargetData[m] || 0), 0)
        result[q] = { revenue, target, percent: target ? Math.round((revenue / target) * 100) : 0 }
      })
      return result
    },

    monthlyTargetData() {
      const targets = {}
      const equalMonthlyTarget = Math.round(this.yearlyTarget / 12)
      const monthsFY = ['April','May','June','July','August','September','October','November','December','January','February','March']
      monthsFY.forEach(month => { targets[month] = equalMonthlyTarget })
      return targets
    },

    overallAchievement() {
      return Math.round((this.totalRevenueFY / this.yearlyTarget) * 100)
    },

    totalRevenueFY() {
      return Object.values(this.monthlyRevenueData).reduce((a, b) => a + b, 0)
    },

    skeletonCount() {
      return 10
    },

    financialYear() {
      const today = new Date()
      const year = today.getFullYear()
      const month = today.getMonth() + 1
      if (month >= 4) return `${year}-${(year + 1).toString().slice(-2)}`
      return `${year - 1}-${year.toString().slice(-2)}`
    },

    attendanceRate() {
      return this.attendanceStats.present || 92
    },

    pendingLeaves() {
      return this.leaveStats.pending || ''
    },

    formattedUserName() {
      if (!this.currentUserName) return 'HR'
      return this.currentUserName
        .split(' ')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    },

    userInitial() {
      return this.formattedUserName.charAt(0).toUpperCase()
    },

    greeting() {
      const hour = new Date().getHours()
      if (hour < 12) return 'Good morning'
      if (hour < 17) return 'Good afternoon'
      return 'Good evening'
    },

    todayLabel() {
      return new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    },

    filteredSearchResults() {
      if (!this.searchQuery || !this.searchQuery.trim()) return []
      const q = this.searchQuery.trim().toLowerCase()
      return this.searchCatalog.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q)
      )
    }
  },

  methods: {
    selectSearchResult(route) {
      this.searchQuery = ''
      this.goTo(route)
    },

    formatNumber(num) {
      if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr'
      if (num >= 100000) return (num / 100000).toFixed(1) + 'L'
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
      return num
    },

    getCompanyClass(index) {
      const classes = ['gold', 'silver', 'bronze']
      return classes[index] || ''
    },

    getBarColor(index) {
      const colors = ['bar-gold', 'bar-silver', 'bar-bronze', 'bar-blue', 'bar-green', 'bar-purple', 'bar-pink', 'bar-indigo', 'bar-teal', 'bar-orange']
      return colors[index % colors.length] || 'bar-blue'
    },

    getProgressPercent(value, tasks) {
      const total = Object.values(tasks).reduce((a, b) => a + b, 0)
      if (total === 0) return 0
      return (value / total) * 100
    },

    async fetchAnalyticsData() {
      try {
        const workRes = await axios.get('https://employees.archenterprises.co.in/api/api/employee-reports', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const tasks = workRes.data || []
        const completed = tasks.filter(t => t.status === 'Completed').length
        const pending = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length
        this.workReportStats = {
          total: tasks.length,
          completed,
          pending,
          completionRate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0
        }

        // Fetch Real IT & Office Expenses from API
        const expenseEndpoints = [
          '/office-expenses',
          '/api/office-expenses',
          'https://employees.archenterprises.co.in/api/office-expenses',
          'https://employees.archenterprises.co.in/api/api/office-expenses'
        ]
        let expenseSuccess = false
        for (const ep of expenseEndpoints) {
          try {
            const expenseRes = await axios.get(ep, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            if (expenseRes && expenseRes.data) {
              const expenses = expenseRes.data.expenses || (Array.isArray(expenseRes.data) ? expenseRes.data : [])
              const totalAmount = expenseRes.data.summary?.total !== undefined
                ? Number(expenseRes.data.summary.total)
                : expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
              
              const categories = new Set(expenses.map(e => e.category).filter(Boolean))
              this.expenseStats = {
                total: totalAmount,
                categories: categories.size,
                count: expenses.length,
                data: expenses.reduce((acc, e) => {
                  const cat = e.category || 'Other'
                  acc[cat] = (acc[cat] || 0) + (parseFloat(e.amount) || 0)
                  return acc
                }, {})
              }
              expenseSuccess = true
              break
            }
          } catch (e) {
            // try next endpoint
          }
        }
        if (!expenseSuccess) {
          this.expenseStats = { total: 0, categories: 0, count: 0, data: {} }
        }

        const attendanceRes = await axios.get('https://employees.archenterprises.co.in/api/api/attendance', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const attendance = attendanceRes.data || []
        const present = attendance.filter(a => a.status === 'Present').length
        const late = attendance.filter(a => a.isLate === true).length
        const absent = attendance.filter(a => a.status === 'Absent').length
        const total = attendance.length || 1
        this.attendanceStats = {
          present: Math.round((present / total) * 100),
          late: Math.round((late / total) * 100),
          absent: Math.round((absent / total) * 100),
          total: attendance.length
        }

        const leaveRes = await axios.get('https://employees.archenterprises.co.in/api/api/leave-requests', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const leaves = Array.isArray(leaveRes.data) ? leaveRes.data : (leaveRes.data?.data || [])
        this.leaveStats = {
          total: leaves.length,
          approved: leaves.filter(l => (l.status || '').toLowerCase() === 'approved').length,
          pending: leaves.filter(l => (l.status || '').toLowerCase() === 'pending').length,
          rejected: leaves.filter(l => (l.status || '').toLowerCase() === 'rejected').length
        }

        const perfRes = await axios.get('https://employees.archenterprises.co.in/api/api/performance/history', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const performances = perfRes.data || []
        const employeeScores = {}
        performances.forEach(p => {
          if (!employeeScores[p.employee_name]) {
            employeeScores[p.employee_name] = { total: 0, department: p.department || 'General' }
          }
          employeeScores[p.employee_name].total += p.total_points || 0
        })
        this.topPerformers = Object.entries(employeeScores)
          .map(([name, data], index) => ({
            rank: index + 1,
            name,
            department: data.department,
            score: data.total
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)

        this.$nextTick(() => {
          this.renderWorkReportChart()
          this.renderExpenseChart()
          this.renderAttendanceChart()
          this.renderLeaveChart()
        })

      } catch (err) {
        console.error('Error fetching analytics:', err)
        this.setDefaultAnalyticsData()
      }
    },

    setDefaultAnalyticsData() {
      this.workReportStats = { total: 0, completed: 0, pending: 0, completionRate: 0 }
      this.expenseStats = { total: 0, categories: 0, count: 0, data: {} }
      this.attendanceStats = { present: 0, late: 0, absent: 0, total: 0 }
      this.leaveStats = { total: 0, approved: 0, pending: 0, rejected: 0 }
      this.topPerformers = []
      this.$nextTick(() => {
        this.renderWorkReportChart()
        this.renderExpenseChart()
        this.renderAttendanceChart()
        this.renderLeaveChart()
      })
    },

    renderWorkReportChart() {
      const ctx = document.getElementById('workReportChart')
      if (!ctx) return
      if (this.workReportChart) this.workReportChart.destroy()

      this.workReportChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'Pending'],
          datasets: [{
            data: [this.workReportStats.completed, this.workReportStats.pending],
            backgroundColor: ['#22c55e', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { position: 'bottom' } }
        }
      })
    },

    renderExpenseChart() {
      const ctx = document.getElementById('expenseChart')
      if (!ctx) return
      if (this.expenseChart) this.expenseChart.destroy()

      const labels = Object.keys(this.expenseStats.data)
      const values = Object.values(this.expenseStats.data)

      this.expenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Amount (₹)',
            data: values,
            backgroundColor: '#4f46e5',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { callback: v => '₹' + v.toLocaleString() } } }
        }
      })
    },

    renderAttendanceChart() {
      const ctx = document.getElementById('attendanceChart')
      if (!ctx) return
      if (this.attendanceChart) this.attendanceChart.destroy()

      this.attendanceChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          datasets: [{
            label: 'Attendance %',
            data: [92, 88, 95, 90, 85, 78],
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { position: 'top' } },
          scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } } }
        }
      })
    },

    renderLeaveChart() {
      const ctx = document.getElementById('leaveChart')
      if (!ctx) return
      if (this.leaveChart) this.leaveChart.destroy()

      this.leaveChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Approved', 'Pending', 'Rejected'],
          datasets: [{
            data: [this.leaveStats.approved, this.leaveStats.pending, this.leaveStats.rejected],
            backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { position: 'bottom' } }
        }
      })
    },

    renderCumulativeChart() {
      const ctx = document.getElementById('cumulativeChart')
      if (!ctx) return
      if (this.cumulativeChartInstance) this.cumulativeChartInstance.destroy()

      const cumulativeData = []
      let cumRevenue = 0
      let cumTarget = 0
      const monthsFY = ['April','May','June','July','August','September','October','November','December','January','February','March']

      monthsFY.forEach(month => {
        cumRevenue += this.monthlyRevenueData[month] || 0
        cumTarget += this.monthlyTargetData[month] || 0
        cumulativeData.push({ month, cumRevenue, cumTarget })
      })

      this.cumulativeChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: cumulativeData.map(d => d.month),
          datasets: [
            { label: 'Cumulative Target', data: cumulativeData.map(d => d.cumTarget), borderColor: '#94a3b8', borderDash: [6, 6], tension: 0.4, fill: false },
            { label: 'Cumulative Revenue (Closed Orders)', data: cumulativeData.map(d => d.cumRevenue), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.15)', fill: true, tension: 0.4 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' }, tooltip: { callbacks: { label: ctx => ` ₹ ${ctx.raw.toLocaleString()}` } } },
          scales: { y: { ticks: { callback: v => `₹ ${v / 10000000} Cr` } } }
        }
      })
    },

    async fetchAllTimePieData() {
      try {
        const [pendingRes, completedRes, serviceRes, materialRes, visitRes] = await Promise.allSettled([
          axios.get('https://employees.archenterprises.co.in/api/api/tasks/pending-count'),
          axios.get('https://employees.archenterprises.co.in/api/api/tasks/completed-count'),
          axios.get('https://employees.archenterprises.co.in/api/api/service-assign/status-count'),
          axios.get('https://employees.archenterprises.co.in/api/api/material-orders-supply-status'),
          axios.get('https://employees.archenterprises.co.in/api/api/visit-assign/status-count')
        ])

        const getData = (res, field) => res.status === 'fulfilled' && res.value?.data?.[field] ? res.value.data[field] : 0

        this.tasksRecorder.pendingTasks = getData(pendingRes, 'pendingTasks') || getData(pendingRes, 'pending')
        this.tasksRecorder.completedTasks = getData(completedRes, 'completedTasks') || getData(completedRes, 'completed')
        this.tasksRecorder.ordersPending = getData(serviceRes, 'pending')
        this.tasksRecorder.ordersCompleted = getData(serviceRes, 'completed')
        this.tasksRecorder.materialOrdersPending = getData(materialRes, 'pending')
        this.tasksRecorder.materialOrdersCompleted = getData(materialRes, 'completed')
        this.tasksRecorder.pendingVisits = getData(visitRes, 'pending')
        this.tasksRecorder.completedVisits = getData(visitRes, 'completed')

        this.updatePieCharts()
      } catch (err) {
        console.error('Pie chart error:', err)
      }
    },

    updatePieCharts() {
      this.pieChartsData = [
        { title: 'Service Orders', canvasId: 'tasksPieChart2', tasks: { 'Pending': this.tasksRecorder.ordersPending, 'Completed': this.tasksRecorder.ordersCompleted } },
        { title: 'Material Orders', canvasId: 'tasksPieChart3', tasks: { 'Pending': this.tasksRecorder.materialOrdersPending, 'Completed': this.tasksRecorder.materialOrdersCompleted } },
        { title: 'Visits Status', canvasId: 'tasksPieChart4', tasks: { 'Pending': this.tasksRecorder.pendingVisits, 'Completed': this.tasksRecorder.completedVisits } }
      ]

      this.chartInstances.forEach(chart => chart.destroy())
      this.chartInstances = []

      this.$nextTick(() => {
        this.pieChartsData.forEach(chartData => {
          const labels = Object.keys(chartData.tasks)
          const values = Object.values(chartData.tasks).map(v => Number(v) || 0)
          let finalLabels = labels, finalValues = values
          if (finalValues.every(v => v === 0)) { finalLabels = ['No data']; finalValues = [1] }
          const bgColors = finalLabels.map(l => this.colors[l] || '#d3d3d3')
          const canvasEl = document.getElementById(chartData.canvasId)
          if (!canvasEl) return
          const ctx = canvasEl.getContext('2d')
          const chart = new Chart(ctx, {
            type: 'pie',
            data: { labels: finalLabels, datasets: [{ data: finalValues, backgroundColor: bgColors, borderColor: '#fff', borderWidth: 2 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
          })
          this.chartInstances.push(chart)
        })
      })
    },

    /**
     * Fetch monthly revenue data from API
     */
    async fetchMonthlyRevenueData() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/graph/monthly-revenue', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        
        const apiData = response.data || []
        const fyMonths = ['April','May','June','July','August','September','October','November','December','January','February','March']
        this.monthlyRevenueData = {}
        
        // Initialize all months with 0
        fyMonths.forEach(month => {
          this.monthlyRevenueData[month] = 0
        })
        
        // Map API data to months (1 = January, 2 = February, etc.)
        apiData.forEach(item => {
          const monthIndex = parseInt(item.month) - 1 // 0-based index
          const monthName = this.months[monthIndex]
          if (monthName && this.monthlyRevenueData[monthName] !== undefined) {
            this.monthlyRevenueData[monthName] = parseFloat(item.total_revenue) || 0
          }
        })
        
        console.log('Monthly revenue data:', this.monthlyRevenueData)
        
      } catch (err) {
        console.error("Error fetching monthly revenue:", err)
        // Initialize with zeros
        const fyMonths = ['April','May','June','July','August','September','October','November','December','January','February','March']
        this.monthlyRevenueData = {}
        fyMonths.forEach(month => {
          this.monthlyRevenueData[month] = 0
        })
      }
    },

    /**
     * Fetch top 5 companies from API
     */
    async fetchTopCompanies() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/graph/top-companies', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        
        const data = response.data || []
        
        if (data.length === 0) {
          console.log('No top companies data found')
          this.topCompanies = []
          return
        }
        
        // Calculate total revenue for percentage
        const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0)
        
        this.topCompanies = data.map(item => ({
          name: item.company_name || 'Unknown',
          revenue: parseFloat(item.total_revenue) || 0,
          orderCount: parseInt(item.order_count) || 0,
          percentage: totalRevenue > 0 ? Math.round((parseFloat(item.total_revenue) / totalRevenue) * 100) : 0
        }))
        
        console.log('Top 5 Companies:', this.topCompanies)
        
      } catch (err) {
        console.error("Error fetching top companies:", err)
        this.topCompanies = []
      }
    },

    /**
     * Fetch all data for dashboard
     */
    async fetchPORevenueData() {
      this.isLoading = true
      try {
        // Fetch monthly revenue data
        await this.fetchMonthlyRevenueData()
        
        // Fetch top 5 companies
        await this.fetchTopCompanies()
        
        // Render charts
        this.$nextTick(() => {
          this.renderRevenueBarChart()
          this.renderCumulativeChart()
        })
        
      } catch (err) {
        console.error("Error fetching PO revenue data:", err)
      } finally {
        this.isLoading = false
      }
    },

    renderRevenueBarChart() {
      const ctx = document.getElementById('monthlyRevenueBarChart')
      if (!ctx) return
      if (this.chartRevenueInstance) this.chartRevenueInstance.destroy()

      const labels = ['April','May','June','July','August','September','October','November','December','January','February','March']

      this.chartRevenueInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { 
              label: 'Target', 
              data: labels.map(m => this.monthlyTargetData[m] || 0), 
              backgroundColor: 'rgba(203, 213, 225, 0.7)', 
              borderRadius: 10 
            },
            { 
              label: 'Revenue (Closed Orders)', 
              data: labels.map(m => this.monthlyRevenueData[m] || 0), 
              backgroundColor: labels.map(m => {
                const revenue = this.monthlyRevenueData[m] || 0
                const target = this.monthlyTargetData[m] || 0
                return revenue >= target ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)'
              }),
              borderRadius: 12 
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { position: 'top' }, 
            tooltip: { 
              callbacks: { 
                label: function(ctx) {
                  return `₹ ${ctx.raw.toLocaleString()}`
                } 
              } 
            } 
          },
          scales: { 
            y: { 
              beginAtZero: true, 
              ticks: { 
                callback: function(v) {
                  if (v >= 10000000) return `₹ ${(v / 10000000).toFixed(1)} Cr`
                  if (v >= 100000) return `₹ ${(v / 100000).toFixed(1)} L`
                  return `₹ ${v.toLocaleString()}`
                }
              } 
            } 
          }
        }
      })
    },

    renderCumulativeChart() {
      const ctx = document.getElementById('cumulativeChart')
      if (!ctx) return
      if (this.cumulativeChartInstance) this.cumulativeChartInstance.destroy()

      const cumulativeData = []
      let cumRevenue = 0
      let cumTarget = 0
      const monthsFY = ['April','May','June','July','August','September','October','November','December','January','February','March']

      monthsFY.forEach(month => {
        cumRevenue += this.monthlyRevenueData[month] || 0
        cumTarget += this.monthlyTargetData[month] || 0
        cumulativeData.push({ month, cumRevenue, cumTarget })
      })

      this.cumulativeChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: cumulativeData.map(d => d.month),
          datasets: [
            { 
              label: 'Cumulative Target', 
              data: cumulativeData.map(d => d.cumTarget), 
              borderColor: '#94a3b8', 
              borderDash: [6, 6], 
              tension: 0.4, 
              fill: false 
            },
            { 
              label: 'Cumulative Revenue (Closed Orders)', 
              data: cumulativeData.map(d => d.cumRevenue), 
              borderColor: '#22c55e', 
              backgroundColor: 'rgba(34,197,94,0.15)', 
              fill: true, 
              tension: 0.4 
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { position: 'top' }, 
            tooltip: { 
              callbacks: { 
                label: function(ctx) {
                  return `₹ ${ctx.raw.toLocaleString()}`
                } 
              } 
            } 
          },
          scales: { 
            y: { 
              ticks: { 
                callback: function(v) {
                  if (v >= 10000000) return `₹ ${(v / 10000000).toFixed(1)} Cr`
                  if (v >= 100000) return `₹ ${(v / 100000).toFixed(1)} L`
                  return `₹ ${v.toLocaleString()}`
                }
              } 
            } 
          }
        }
      })
    },

    async fetchBirthdayReminders() {
      try {
        const res = await axios.get('https://employees.archenterprises.co.in/api/api/users')
        const allEmployees = res.data || []
        const currentMonth = new Date().getMonth() + 1
        this.birthdays = allEmployees.filter(emp => {
          if (!emp.dateofbirth) return false
          const month = new Date(emp.dateofbirth).getMonth() + 1
          return month === currentMonth
        })
      } catch (err) {
        console.error('Error fetching birthdays:', err)
        this.birthdays = []
      }
    },

    formatBirthday(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const day = date.getDate().toString().padStart(2, '0')
      const month = this.months[date.getMonth()].substring(0, 3)
      return `${day} ${month}`
    },

    formatExpenseAmount(val) {
      const num = parseFloat(val) || 0
      return num.toLocaleString('en-IN', { maximumFractionDigits: 0 })
    },

    formatNumber(val) {
      const num = parseFloat(val) || 0
      return num.toLocaleString('en-IN')
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    },

    goTo(page) {
      this.$router.push({ path: `/${page}` })
    },

    goToLeaveApplications() {
      this.$router.push('/leaveapplications')
    },
    goToSalaryAdvances() {
      this.$router.push('/salaryadvances')
    },
    goToHoliday() {
      this.$router.push('/holidays')
    },
    goToOfferLetters() {
      this.$router.push('/offerletter')
    },
    goToMyApps() {
      this.$router.push('/myapps')
    }
  },

  mounted() {
    setTimeout(() => { this.showSkeleton = false }, 1000)
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)

    axios.get('https://employees.archenterprises.co.in/api/api/total-employees')
      .then(response => { this.totalEmployees = response.data.count })
      .catch(err => console.error(err))

    axios.get('https://employees.archenterprises.co.in/api/api/admin-info', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
      if (res.data && res.data.name) {
        this.currentUserName = res.data.name
      }
    }).catch(err => console.error('Error fetching admin info:', err))

    const savedTarget = localStorage.getItem('yearlyTarget')
    if (savedTarget) this.yearlyTarget = Number(savedTarget)

    // MAIN: Fetch PO data from database for revenue (only closed orders)
    this.fetchPORevenueData()
    
    this.fetchAnalyticsData()
    this.fetchAllTimePieData()
    this.fetchBirthdayReminders()
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

:root {
  --primary: #2cb67d;
  --primary-dark: #209961;
  --primary-light: #eaf7f1;
  --secondary: #638578;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #3b82f6;
  --text: #0f2e22;
  --text-light: #6b8f81;
  --bg: #edf7f2;
  --card: #ffffff;
  --border: #e0f0e8;
  --shadow: 0 8px 30px rgba(44, 182, 125, 0.06), 0 2px 6px rgba(0, 0, 0, 0.02);
  --shadow-lg: 0 14px 38px rgba(44, 182, 125, 0.12), 0 4px 10px rgba(0, 0, 0, 0.03);
  --radius: 18px;
  --font-display: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
}

.layout {
  display: flex;
  flex-direction: column;
  background: var(--bg, #edf7f2);
  min-height: 100vh;
  font-family: var(--font-body);
  color: var(--text, #0f2e22);
}

.main-content {
  display: flex;
  flex: 1;
  padding: 18px 24px;
  gap: 24px;
}

.content {
  flex: 1;
  background: transparent;
  overflow-x: hidden;
}

/* Mobile Header */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: #ffffff;
  border-radius: 18px;
  margin-bottom: 18px;
  border: 1px solid #e0f0e8;
  box-shadow: 0 4px 16px rgba(44, 182, 125, 0.06);
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text, #0f2e22);
  font-family: var(--font-display);
}

.mobile-title i {
  color: #2cb67d;
}

/* 🔍 Top Search & Action Bar */
.dashboard-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.search-box-wrapper {
  flex: 1;
  position: relative;
  max-width: 680px;
}

.search-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #2cb67d;
  font-size: 15px;
}

.dashboard-search-input {
  width: 100%;
  padding: 13px 18px 13px 48px;
  background: #ffffff;
  border: 1px solid #dff0e7;
  border-radius: 16px;
  font-size: 14px;
  color: #0f2e22;
  font-weight: 500;
  outline: none;
  box-shadow: 0 4px 18px rgba(44, 182, 125, 0.04);
  transition: all 0.25s ease;
}

.dashboard-search-input:focus {
  border-color: #2cb67d;
  box-shadow: 0 0 0 3px rgba(44, 182, 125, 0.18);
}

/* Search clear button */
.search-clear-btn {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s ease;
}

.search-clear-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* Live Search Dropdown */
.search-results-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #dff0e7;
  box-shadow: 0 14px 40px rgba(15, 46, 34, 0.12), 0 4px 12px rgba(44, 182, 125, 0.08);
  z-index: 1000;
  overflow: hidden;
  max-height: 420px;
  display: flex;
  flex-direction: column;
  animation: searchFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes searchFadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.search-dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background: #f7fcf9;
  border-bottom: 1px solid #eef6f2;
  font-size: 12px;
  font-weight: 700;
  color: #16935b;
}

.search-esc-hint {
  font-size: 11px;
  color: #6b8f81;
  font-weight: 500;
}

.search-results-list {
  overflow-y: auto;
  max-height: 350px;
  padding: 6px;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.search-result-item:hover {
  background: #f0f9f4;
  transform: translateX(3px);
}

.search-item-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #eaf7f1;
  color: #2cb67d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}

.search-result-item:hover .search-item-icon {
  background: #2cb67d;
  color: #ffffff;
}

.search-item-info {
  flex: 1;
  min-width: 0;
}

.search-item-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.search-item-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #0f2e22;
}

.search-item-cat {
  font-size: 10.5px;
  font-weight: 700;
  color: #16935b;
  background: #eaf7f1;
  padding: 1px 7px;
  border-radius: 6px;
}

.search-item-desc {
  font-size: 11.5px;
  color: #6b8f81;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-item-arrow {
  color: #c0ded2;
  font-size: 12px;
  transition: transform 0.2s ease;
}

.search-result-item:hover .search-item-arrow {
  color: #2cb67d;
  transform: translateX(2px);
}

.search-no-results {
  padding: 28px 20px;
  text-align: center;
  color: #6b8f81;
}

.search-no-results i {
  font-size: 32px;
  color: #cbe9dc;
  margin-bottom: 8px;
}

.search-no-results p {
  font-size: 13.5px;
  color: #0f2e22;
  margin: 0 0 4px;
}

.search-no-results small {
  font-size: 11.5px;
  color: #6b8f81;
}

.btn-create-new {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  color: #ffffff;
  border: none;
  padding: 12px 22px;
  border-radius: 16px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(44, 182, 125, 0.3);
  transition: all 0.25s ease;
  white-space: nowrap;
}

.btn-create-new:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(44, 182, 125, 0.4);
}

/* 🌟 Multi-Column Master Dashboard Layout */
.dashboard-main-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  align-items: start;
}

.dashboard-left-col {
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-width: 0;
}

.dashboard-right-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Section Title Row */
.dashboard-section-block {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-heading {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 800;
  color: #0f2e22;
  margin: 0;
  letter-spacing: -0.2px;
}

.see-all-link {
  color: #2cb67d;
  cursor: pointer;
  font-size: 14px;
  transition: transform 0.2s ease;
}

.see-all-link:hover {
  transform: translateX(3px);
}

/* 1. Quick Access Cards */
.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.qa-card {
  border-radius: 20px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease, border-color 0.25s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 130px;
}

.qa-card:hover {
  transform: translateY(-4px);
}

.qa-featured {
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  color: #ffffff;
  box-shadow: 0 10px 26px rgba(44, 182, 125, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.qa-white {
  background: #ffffff;
  border: 1px solid #dff0e7;
  box-shadow: 0 6px 20px rgba(44, 182, 125, 0.05);
}

.qa-white:hover {
  box-shadow: 0 10px 28px rgba(44, 182, 125, 0.12);
  border-color: #2cb67d;
}

.qa-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.qa-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.qa-icon-box.white-box {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
  backdrop-filter: blur(4px);
}

.qa-icon-box.red-tint {
  background: #fee2e2;
  color: #ef4444;
}

.qa-icon-box.blue-tint {
  background: #e0f2fe;
  color: #0284c7;
}

.qa-avatar-stack {
  display: flex;
  align-items: center;
}

.qa-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #2cb67d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #16935b;
  margin-left: -6px;
}

.qa-white .qa-avatar {
  border-color: #ffffff;
  background: #f1f5f9;
  color: #475569;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.qa-badge-pill {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  margin-left: -4px;
}

.qa-badge-pill.light {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.qa-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  margin: 12px 0 2px;
}

.qa-featured .qa-title {
  color: #ffffff;
}

.qa-white .qa-title {
  color: #0f2e22;
}

.qa-subtitle {
  font-size: 12px;
  margin: 0;
}

.qa-featured .qa-subtitle {
  color: rgba(255, 255, 255, 0.88);
}

.qa-white .qa-subtitle {
  color: #6b8f81;
}

/* 2. Folders Grid */
.folders-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.folder-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 16px 18px;
  border: 1px solid #dff0e7;
  box-shadow: 0 4px 18px rgba(44, 182, 125, 0.04);
  cursor: pointer;
  transition: all 0.25s ease;
}

.folder-card:hover {
  transform: translateY(-3px);
  border-color: #2cb67d;
  box-shadow: 0 8px 24px rgba(44, 182, 125, 0.1);
}

.folder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.folder-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #eaf7f1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.folder-icon {
  font-size: 20px;
  color: #2cb67d;
}

.folder-options {
  color: #94a3b8;
  font-size: 12px;
}

.folder-name {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: #0f2e22;
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.folder-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
  color: #6b8f81;
  font-weight: 500;
}

.folder-size {
  color: #16935b;
  font-weight: 700;
}

/* 3. Recent Activity Table */
.recent-files-card {
  background: #ffffff;
  border-radius: 22px;
  padding: 20px 24px;
  border: 1px solid #dff0e7;
  box-shadow: 0 6px 22px rgba(44, 182, 125, 0.05);
  overflow-x: auto;
}

.recent-files-table {
  width: 100%;
  border-collapse: collapse;
}

.recent-files-table th {
  font-size: 11px;
  font-weight: 800;
  color: #7d9e92;
  letter-spacing: 0.6px;
  text-align: left;
  padding: 8px 12px;
  border-bottom: 1px solid #eef6f2;
}

.recent-files-table td {
  padding: 14px 12px;
  font-size: 13px;
  color: #0f2e22;
  border-bottom: 1px solid #f2faf6;
}

.recent-files-table tr {
  cursor: pointer;
  transition: background 0.2s ease;
}

.recent-files-table tbody tr:hover {
  background: #f4fbf7;
}

.highlighted-row {
  background: #eef9f4;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-pill {
  font-size: 10px;
  font-weight: 800;
  padding: 3px 7px;
  border-radius: 6px;
  color: #ffffff;
  letter-spacing: 0.2px;
}

.pill-blue { background: #3b82f6; }
.pill-orange { background: #f97316; }
.pill-red { background: #ef4444; }
.pill-purple { background: #8b5cf6; }

.file-title-text {
  font-weight: 600;
  color: #0f2e22;
}

.member-tag {
  font-size: 11.5px;
  font-weight: 600;
  color: #475569;
  background: #f1f5f9;
  padding: 3px 10px;
  border-radius: 999px;
  display: inline-block;
}

.member-tag.success {
  background: #eaf7f1;
  color: #16935b;
}

.action-dot {
  color: #94a3b8;
  font-size: 12px;
}

/* 4. Revenue Overview Section */
.monthly-revenue-row {
  margin-top: 6px;
}

.revenue-card {
  background: #ffffff;
  border-radius: 22px;
  padding: 24px;
  border: 1px solid #dff0e7;
  box-shadow: 0 6px 22px rgba(44, 182, 125, 0.05);
}

.revenue-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 22px;
}

.revenue-title h3 {
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 800;
  color: #0f2e22;
  margin-bottom: 4px;
}

.revenue-title p {
  font-size: 13px;
  color: #6b8f81;
  margin: 0;
}

.target-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.target-input label {
  font-size: 12.5px;
  font-weight: 600;
  color: #6b8f81;
}

.target-input input {
  padding: 8px 14px;
  border: 1px solid #cbe9dc;
  border-radius: 12px;
  font-size: 14px;
  width: 170px;
  background: #f7fcf9;
  outline: none;
  font-weight: 600;
  color: #0f2e22;
}

.revenue-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 22px;
}

.kpi {
  border-radius: 16px;
  padding: 14px 12px;
  text-align: center;
  border: 1px solid var(--border);
}

.kpi h4 {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 800;
  margin: 0 0 3px;
}

.kpi p {
  font-size: 11px;
  color: #6b8f81;
  font-weight: 600;
  text-transform: uppercase;
  margin: 0;
}

.kpi.success { background: #eaf7f1; border-color: #cbe9dc; }
.kpi.success h4 { color: #16935b; }
.kpi.info { background: #f0f7ff; border-color: #dbeafe; }
.kpi.info h4 { color: #2563eb; }
.kpi.warning { background: #fffbeb; border-color: #fef3c7; }
.kpi.warning h4 { color: #d97706; }
.kpi.primary { background: #f0fdfa; border-color: #ccfbf1; }
.kpi.primary h4 { color: #0d9488; }

.companies-breakdown {
  margin-bottom: 22px;
}

.breakdown-title {
  font-family: var(--font-display);
  font-size: 14.5px;
  font-weight: 700;
  margin-bottom: 14px;
  color: #0f2e22;
}

.companies-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.company-card {
  display: grid;
  grid-template-columns: 32px 1fr 120px;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #f7fcf9;
  border-radius: 12px;
  border: 1px solid #e5f2eb;
}

.company-rank {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: #16935b;
  background: #eaf7f1;
}

.company-name {
  font-size: 13.5px;
  font-weight: 700;
  color: #0f2e22;
}

.company-details {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 12px;
}

.company-revenue {
  font-weight: 700;
  color: #16935b;
}

.company-percent {
  color: #6b8f81;
}

.company-orders {
  color: #0f766e;
  background: #ccfbf1;
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 10.5px;
}

.company-bar {
  height: 6px;
  background: #e5f2eb;
  border-radius: 6px;
  overflow: hidden;
  width: 100%;
  grid-column: 1 / -1;
}

.company-bar-fill {
  height: 100%;
  border-radius: 6px;
}

.bar-gold { background: linear-gradient(90deg, #fbbf24, #d97706); }
.bar-silver { background: linear-gradient(90deg, #94a3b8, #64748b); }
.bar-bronze { background: linear-gradient(90deg, #fb923c, #ea580c); }
.bar-blue { background: linear-gradient(90deg, #60a5fa, #2563eb); }
.bar-green { background: linear-gradient(90deg, #34b782, #10b981); }

.no-data-message {
  text-align: center;
  padding: 18px;
  color: #6b8f81;
  font-size: 13px;
  background: #f7fcf9;
  border-radius: 12px;
}

.quarter-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.quarter-card {
  background: #f7fcf9;
  border-radius: 14px;
  padding: 14px 10px;
  text-align: center;
  border: 1px solid #e5f2eb;
}

.quarter-card h4 {
  font-size: 12px;
  font-weight: 700;
  margin: 0 0 4px;
}

.quarter-card p {
  font-size: 13.5px;
  font-weight: 800;
  margin: 0 0 3px;
}

.quarter-card small {
  font-size: 10.5px;
  font-weight: 700;
  color: #6b8f81;
}

.quarter-card.success p { color: #16935b; }
.quarter-card.danger p { color: #ef4444; }

.bar-chart-wrapper {
  height: 200px;
  margin-bottom: 20px;
}

.chart-height {
  height: 200px;
}

/* ▶️ RIGHT COLUMN WIDGETS */
.side-widget-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 24px 20px;
  border: 1px solid #dff0e7;
  box-shadow: 0 8px 28px rgba(44, 182, 125, 0.06);
}

.gauge-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.gauge-user-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f4fbf7;
  border: 1px solid #e2efe8;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #0f2e22;
}

.gauge-user-pill i {
  color: #2cb67d;
}

/* Arc Gauge */
.arc-meter-container {
  position: relative;
  width: 100%;
  max-width: 220px;
  margin: 0 auto 20px;
  text-align: center;
}

.arc-svg {
  width: 100%;
  height: auto;
}

.arc-center-text {
  position: absolute;
  bottom: 6px;
  left: 0;
  right: 0;
  text-align: center;
}

.arc-big-val {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 800;
  color: #0f2e22;
  margin: 0;
  line-height: 1;
}

.arc-sub-val {
  font-size: 11px;
  color: #6b8f81;
  font-weight: 600;
  margin: 4px 0 0;
}

/* Side Stats List */
.side-stats-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.side-stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.side-stat-item:hover {
  background: #f7fcf9;
}

.side-stat-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.side-stat-icon.red-box { background: #fee2e2; color: #ef4444; }
.side-stat-icon.green-box { background: #eaf7f1; color: #16935b; }
.side-stat-icon.amber-box { background: #fef3c7; color: #d97706; }
.side-stat-icon.blue-box { background: #e0f2fe; color: #0284c7; }

.side-stat-info {
  flex: 1;
}

.side-stat-title {
  font-size: 13px;
  font-weight: 700;
  color: #0f2e22;
  margin: 0 0 2px;
}

.side-stat-count {
  font-size: 11px;
  color: #6b8f81;
}

.side-stat-value {
  font-size: 12px;
  font-weight: 700;
  color: #0f2e22;
}

/* PRO Promo Card */
.pro-promo-card {
  background: linear-gradient(135deg, #eaf8f2 0%, #f7fcf9 100%);
  border: 1px solid #d4ede1;
  border-radius: 20px;
  padding: 20px;
  text-align: center;
}

.promo-illustration {
  margin-bottom: 12px;
}

.shield-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #34b782, #209961);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin: 0 auto;
  box-shadow: 0 6px 18px rgba(44, 182, 125, 0.35);
}

.promo-title {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 800;
  color: #0f2e22;
  margin: 0 0 6px;
}

.promo-desc {
  font-size: 11.5px;
  color: #6b8f81;
  margin: 0 0 14px;
  line-height: 1.4;
}

.promo-cta-btn {
  background: #2cb67d;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: not-allowed;
  width: 100%;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(44, 182, 125, 0.25);
}

.promo-cta-btn:hover {
  background: #209961;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(44, 182, 125, 0.35);
}

/* Birthday Side Card */
.birthday-side-card .side-card-header h4 {
  font-family: var(--font-display);
  font-size: 14.5px;
  font-weight: 800;
  color: #0f2e22;
  margin: 0 0 14px;
}

.side-birthdays-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.side-birthday-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  background: #f7fcf9;
  border-radius: 12px;
  border: 1px solid #e5f2eb;
}

.birthday-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid #2cb67d;
  object-fit: cover;
}

.birthday-emp-name {
  font-size: 12.5px;
  font-weight: 700;
  color: #0f2e22;
  margin: 0 0 2px;
}

.birthday-emp-date {
  font-size: 11px;
  color: #d97706;
  font-weight: 600;
}

.no-birthdays-side {
  text-align: center;
  color: #6b8f81;
  font-size: 12px;
  padding: 16px 0;
  margin: 0;
}

/* Responsive */
@media (max-width: 1200px) {
  .dashboard-main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 12px;
  }

  .mobile-header {
    display: flex;
  }

  .quick-access-grid {
    grid-template-columns: 1fr;
  }

  .folders-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .revenue-kpis {
    grid-template-columns: repeat(2, 1fr);
  }

  .quarter-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>