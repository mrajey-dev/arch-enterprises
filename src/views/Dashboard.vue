<template>
  <div class="layout">
    <!-- Main Content -->
    <div class="main-content">
      <!-- Sidebar -->
      <Sidebar ref="sidebarRef" @collapse-changed="onSidebarCollapseChanged" />

      <!-- Content -->
      <section class="content">
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <i class="fas fa-chart-pie"></i>
            <span>Dashboard</span>
          </div>
          <button type="button" class="mobile-menu-toggle-btn" @click="toggleSidebar" aria-label="Toggle menu">
            <i class="fas fa-bars"></i>
            <span>Menu</span>
          </button>
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
          <div class="dashboard-topbar-actions">
            <button @click="goTo('ScheduleMeeting')" class="btn-create-new">
              <i class="fas fa-plus"></i>
              <span>Schedule Meeting</span>
            </button>
          </div>
        </div>

        <!-- 🌟 Multi-Column Master Dashboard Layout -->
        <div class="dashboard-main-grid">

          <!-- ◀️ LEFT COLUMN (72%): Main Content -->
          <div class="dashboard-left-col">

            <!-- 🌟 Executive Pulse Strip: High-Level Core Metrics -->
            <div class="executive-pulse-grid">
              <div class="pulse-stat-card" @click="goTo('employees')">
                <div class="pulse-icon-box pulse-blue">
                  <i class="fas fa-users"></i>
                </div>
                <div class="pulse-info">
                  <span class="pulse-label">Workforce</span>
                  <h3 class="pulse-value">{{ totalEmployees }}</h3>
                  <span class="pulse-sub">Active Staff & Records</span>
                </div>
              </div>

              <div class="pulse-stat-card pulse-attendance-card" @click="goTo('empattendanceadmin')" title="Click to view Today's Attendance Master">
                <div class="pulse-icon-box pulse-teal">
                  <i class="fas fa-user-check"></i>
                </div>
                <div class="pulse-info">
                  <div class="pulse-header-row">
                    <span class="pulse-label">Today's Attendance</span>
                    <span class="pulse-ratio-tag" v-if="totalEmployees > 0">
                      {{ attendanceStats.activeToday || 0 }}/{{ totalEmployees }} Active
                    </span>
                  </div>
                  <h3 class="pulse-value">{{ attendanceRate }}%</h3>
                  <div class="pulse-status-chips" v-if="attendanceStats.activeToday > 0">
                    <span class="pulse-chip chip-present" title="Present in office">
                      <i class="fas fa-check"></i> {{ attendanceStats.present || 0 }} Present
                    </span>
                    <span class="pulse-chip chip-onsite" title="Working On Site" v-if="attendanceStats.onSite > 0">
                      <i class="fas fa-map-marker-alt"></i> {{ attendanceStats.onSite }} Onsite
                    </span>
                    <span class="pulse-chip chip-travel" title="Traveling on duty" v-if="attendanceStats.traveling > 0">
                      <i class="fas fa-plane"></i> {{ attendanceStats.traveling }} Travel
                    </span>
                    <span class="pulse-chip chip-halfday" title="Half-Day attendance" v-if="attendanceStats.halfDay > 0">
                      <i class="fas fa-adjust"></i> {{ attendanceStats.halfDay }} Half-Day
                    </span>
                  </div>
                  <span class="pulse-sub" v-else>
                    {{ attendanceStats.activeToday || 0 }} of {{ totalEmployees || 0 }} staff logged in today
                  </span>
                </div>
              </div>

              <div class="pulse-stat-card pulse-analytics-link" @click="goTo('revenue-analytics')">
                <div class="pulse-icon-box pulse-amber">
                  <i class="fas fa-chart-line"></i>
                </div>
                <div class="pulse-info">
                  <span class="pulse-label">FY Target Achievement</span>
                  <h3 class="pulse-value">{{ overallAchievement }}%</h3>
                  <span class="pulse-sub pulse-action-hint">View full analytics <i class="fas fa-arrow-right"></i></span>
                </div>
              </div>
            </div>

            <!-- 1. Quick Access Section -->
            <div class="dashboard-section-block">
              <div class="section-title-row">
                <h3 class="section-heading">Quick Access</h3>
                <span class="section-subtitle">Key daily workflows</span>
              </div>

              <div class="quick-access-grid">
                <!-- Card 1: Attendance Master -->
                <div class="qa-card" @click="goTo('empattendanceadmin')">
                  <div class="qa-top-row">
                    <div class="qa-icon-box qa-teal">
                      <i class="fas fa-user-clock"></i>
                    </div>
                    <span class="qa-pill-badge">Today's Hub</span>
                  </div>
                  <div class="qa-info">
                    <h4 class="qa-title">Attendance Master</h4>
                    <p class="qa-subtitle">Real-time attendance logs & punch records</p>
                  </div>
                  <div class="qa-action-row">
                    <span>Manage logs</span>
                    <i class="fas fa-arrow-right"></i>
                  </div>
                </div>

                <!-- Card 2: Work Reports -->
                <div class="qa-card" @click="goTo('workreport')">
                  <div class="qa-top-row">
                    <div class="qa-icon-box qa-blue">
                      <i class="fas fa-clipboard-check"></i>
                    </div>
                    <span class="qa-stat-pill">{{ workReportStats.completed || 28 }} Done</span>
                  </div>
                  <div class="qa-info">
                    <h4 class="qa-title">Work Reports</h4>
                    <p class="qa-subtitle">Employee task sheets, submissions & reviews</p>
                  </div>
                  <div class="qa-action-row">
                    <span>View reports</span>
                    <i class="fas fa-arrow-right"></i>
                  </div>
                </div>

                <!-- Card 3: Resource Booking -->
                <div class="qa-card" @click="goTo('resourcebooking')">
                  <div class="qa-top-row">
                    <div class="qa-icon-box qa-purple">
                      <i class="fas fa-video"></i>
                    </div>
                    <span class="qa-pill-badge">Reservations</span>
                  </div>
                  <div class="qa-info">
                    <h4 class="qa-title">Resource Booking</h4>
                    <p class="qa-subtitle">Meeting rooms, conference gear & assets</p>
                  </div>
                  <div class="qa-action-row">
                    <span>Reserve space</span>
                    <i class="fas fa-arrow-right"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Operational Modules Shortcuts -->
            <div class="dashboard-section-block">
              <div class="section-title-row">
                <h3 class="section-heading">Operational Modules</h3>
                <span class="section-subtitle">Core directories & data</span>
              </div>

              <div class="folders-grid">
                <!-- Module 1: Employees -->
                <div class="folder-card" @click="goTo('employees')">
                  <div class="folder-header">
                    <div class="folder-icon-wrap icon-emp">
                      <i class="fas fa-users"></i>
                    </div>
                    <span class="folder-badge">Active</span>
                  </div>
                  <h4 class="folder-name">Employees</h4>
                  <div class="folder-meta">
                    <span><strong>{{ totalEmployees }}</strong> Active Staff</span>
                    <i class="fas fa-chevron-right folder-arrow"></i>
                  </div>
                </div>

                <!-- Module 2: Departments -->
                <div class="folder-card" @click="goTo('managedepartments')">
                  <div class="folder-header">
                    <div class="folder-icon-wrap icon-dept">
                      <i class="fas fa-sitemap"></i>
                    </div>
                    <span class="folder-badge">Org Hub</span>
                  </div>
                  <h4 class="folder-name">Departments</h4>
                  <div class="folder-meta">
                    <span>Teams & Structure</span>
                    <i class="fas fa-chevron-right folder-arrow"></i>
                  </div>
                </div>

                <!-- Module 3: Expenses -->
                <div class="folder-card" @click="goTo('expensemanage')">
                  <div class="folder-header">
                    <div class="folder-icon-wrap icon-exp">
                      <i class="fas fa-receipt"></i>
                    </div>
                    <span class="folder-badge">{{ expenseStats.categories || 0 }} Cats</span>
                  </div>
                  <h4 class="folder-name">Expenses</h4>
                  <div class="folder-meta">
                    <span>₹ <strong>{{ formatExpenseAmount(expenseStats.total) }}</strong></span>
                    <i class="fas fa-chevron-right folder-arrow"></i>
                  </div>
                </div>

                <!-- Module 4: Leaves Center -->
                <div class="folder-card" @click="goToLeaveApplications">
                  <div class="folder-header">
                    <div class="folder-icon-wrap icon-leave">
                      <i class="fas fa-calendar-check"></i>
                    </div>
                    <span class="folder-badge pending" v-if="leaveStats.pending > 0">{{ leaveStats.pending }} Pending</span>
                    <span class="folder-badge" v-else>Clear</span>
                  </div>
                  <h4 class="folder-name">Leaves Center</h4>
                  <div class="folder-meta">
                    <span><strong>{{ leaveStats.total }}</strong> Requests</span>
                    <i class="fas fa-chevron-right folder-arrow"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Recent Activity & Operations Table -->
            <div class="dashboard-section-block">
              <div class="section-title-row">
                <h3 class="section-heading">Recent Operations & Registers</h3>
                <span class="section-subtitle">Quick access registers</span>
              </div>

              <div class="recent-files-card">
                <table class="recent-files-table">
                  <thead>
                    <tr>
                      <th>OPERATION / DOCUMENT</th>
                      <th>STATUS / PERIOD</th>
                      <th>DEPARTMENT</th>
                      <th class="col-action">ACTION</th>
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
                      <td class="text-secondary-cell">{{ todayLabel }}</td>
                      <td><span class="member-tag">All Employees</span></td>
                      <td class="col-action"><i class="fas fa-arrow-right row-arrow"></i></td>
                    </tr>

                    <tr @click="goTo('offerletter')">
                      <td>
                        <div class="file-name-cell">
                          <span class="file-pill pill-amber">DOC</span>
                          <span class="file-title-text">Offer Letters & Onboarding</span>
                        </div>
                      </td>
                      <td class="text-secondary-cell">Active Hub</td>
                      <td><span class="member-tag success">HR Desk</span></td>
                      <td class="col-action"><i class="fas fa-arrow-right row-arrow"></i></td>
                    </tr>

                    <tr @click="goTo('empattendanceadmin')">
                      <td>
                        <div class="file-name-cell">
                          <span class="file-pill pill-teal">PDF</span>
                          <span class="file-title-text">Monthly Attendance Register</span>
                        </div>
                      </td>
                      <td class="text-secondary-cell"><strong>{{ attendanceRate }}%</strong> Present</td>
                      <td><span class="member-tag">Attendance Master</span></td>
                      <td class="col-action"><i class="fas fa-arrow-right row-arrow"></i></td>
                    </tr>

                    <tr @click="goTo('salaryadvances')">
                      <td>
                        <div class="file-name-cell">
                          <span class="file-pill pill-purple">FIN</span>
                          <span class="file-title-text">Salary Advances & Payroll</span>
                        </div>
                      </td>
                      <td class="text-secondary-cell">FY {{ financialYear }}</td>
                      <td><span class="member-tag">Finance</span></td>
                      <td class="col-action"><i class="fas fa-arrow-right row-arrow"></i></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <!-- ▶️ RIGHT COLUMN (28%): Widgets & Executive Panel -->
          <div class="dashboard-right-col">

            <!-- Widget 1: Annual Target Meter -->
            <div class="side-widget-card annual-target-widget">
              <div class="widget-header">
                <div>
                  <h4 class="widget-title">Annual Performance</h4>
                  <p class="widget-subtitle">FY {{ financialYear }} Target</p>
                </div>
                <span class="widget-badge" :class="overallAchievement >= 70 ? 'badge-good' : 'badge-neutral'">
                  {{ overallAchievement >= 70 ? 'On Track' : 'In Progress' }}
                </span>
              </div>

              <!-- Clean Modern Progress Arc -->
              <div class="arc-meter-container">
                <svg class="arc-svg" viewBox="0 0 200 115">
                  <defs>
                    <linearGradient id="arcModernGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#3b82f6" />
                      <stop offset="100%" stop-color="#10b981" />
                    </linearGradient>
                  </defs>
                  <!-- Track -->
                  <path
                    d="M 28,105 A 72,72 0 0,1 172,105"
                    fill="none"
                    stroke="#f1f5f9"
                    stroke-width="15"
                    stroke-linecap="round"
                  />
                  <!-- Progress Arc -->
                  <path
                    d="M 28,105 A 72,72 0 0,1 172,105"
                    fill="none"
                    stroke="url(#arcModernGrad)"
                    stroke-width="15"
                    stroke-linecap="round"
                    :stroke-dasharray="226"
                    :stroke-dashoffset="226 - (226 * Math.min(overallAchievement, 100) / 100)"
                    style="transition: stroke-dashoffset 0.8s ease;"
                  />
                </svg>
                <div class="arc-center-text">
                  <h2 class="arc-big-val">{{ overallAchievement }}%</h2>
                  <p class="arc-sub-val">of ₹ {{ formatNumber(yearlyTarget) }}</p>
                </div>
              </div>

              <!-- Quick Target Stats -->
              <div class="target-stats-row">
                <div class="target-stat-item">
                  <span class="stat-label">Total Closed</span>
                  <span class="stat-value">₹ {{ formatNumber(totalRevenueFY) }}</span>
                </div>
                <div class="target-stat-divider"></div>
                <div class="target-stat-item">
                  <span class="stat-label">Remaining</span>
                  <span class="stat-value">₹ {{ formatNumber(Math.max(0, yearlyTarget - totalRevenueFY)) }}</span>
                </div>
              </div>

              <!-- Dedicated Analytics Hub Link -->
              <button class="target-details-btn" @click="goTo('revenue-analytics')">
                <span>Detailed Revenue Analytics</span>
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>


            <!-- Widget 3: Birthday Reminders -->
            <div class="side-widget-card birthday-side-card">
              <div class="side-card-header">
                <div class="birthday-header-title">
                  <i class="fas fa-birthday-cake birthday-icon"></i>
                  <h4>Birthdays &middot; {{ months[new Date().getMonth()] }}</h4>
                </div>
                <span class="birthday-count-pill" v-if="birthdays.length">{{ birthdays.length }}</span>
              </div>

              <div v-if="birthdays.length > 0" class="side-birthdays-list">
                <div v-for="(emp, index) in birthdays" :key="index" class="side-birthday-item">
                  <div class="birthday-avatar-wrap">
                    <img
                      v-if="emp.photo"
                      :src="emp.photo"
                      alt="Employee"
                      class="birthday-avatar"
                    />
                    <div v-else class="birthday-initials">
                      {{ (emp.name || 'E').charAt(0) }}
                    </div>
                  </div>
                  <div class="birthday-details">
                    <p class="birthday-emp-name">{{ emp.name }}</p>
                    <span class="birthday-emp-date">
                      <i class="far fa-calendar-alt"></i>
                      {{ formatBirthday(emp.dateofbirth) }}
                    </span>
                  </div>
                </div>
              </div>
              <p v-else class="no-birthdays-side">No birthdays this month</p>
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
        { title: 'Help & RCA Desk', category: 'Support', route: 'rcahelp', icon: 'fas fa-life-ring', desc: 'Root cause analysis & support tickets' },
        { 
          title: 'Announcements & Notice Board', 
          category: 'Communication', 
          route: 'announcement', 
          icon: 'fas fa-bullhorn', 
          desc: 'Broadcast company updates, news & team notices',
          keywords: 'announcement announcements announcment announce notice board news updates bulletin broadcast'
        },
        { 
          title: 'Company Apps', 
          category: 'Applications', 
          route: 'myapps', 
          icon: 'fas fa-th-large', 
          desc: 'Enterprise application suite and tools',
          keywords: 'apps myapps company applications software'
        },
        { 
          title: 'Security Vault', 
          category: 'Security', 
          route: 'vault', 
          icon: 'fas fa-shield-alt', 
          desc: 'Confidential documents & digital signatures',
          keywords: 'vault security documents passwords sensitive'
        },
        { 
          title: 'Revenue & Analytics', 
          category: 'Finance', 
          route: 'revenue-analytics', 
          icon: 'fas fa-chart-line', 
          desc: 'FY Target, closed orders, quarterly performance & charts',
          keywords: 'revenue analytics financial target orders companies turnover graph'
        },
        { 
          title: 'Workflow & Tasks', 
          category: 'Operations', 
          route: 'workflow', 
          icon: 'fas fa-project-diagram', 
          desc: 'Task management & pipeline workflows',
          keywords: 'workflow process tasks operations pipeline'
        }
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
      isSidebarCollapsed: localStorage.getItem('admin_sidebar_collapsed') === 'true',
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
      attendanceStats: { present: 0, onSite: 0, traveling: 0, halfDay: 0, absent: 0, leave: 0, late: 0, activeToday: 0, totalActive: 0, total: 0, rate: 0 },
      leaveStats: { total: 0, approved: 0, pending: 0, rejected: 0 },
      topPerformers: [],
      topCompanies: [],
      poData: [],
      isLoading: false,
      closedOrdersCount: 0,
      currentTheme: "blue",
      previousTheme: null,
      showThemePalette: false,
      themeList: [
        { value: "default", label: "Emerald Mint", color: "#2cb67d", gradient: "linear-gradient(135deg, #2cb67d 0%, #10b981 100%)" },
        { value: "blue", label: "Ocean Blue", color: "#3b82f6", gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" },
        { value: "purple", label: "Royal Purple", color: "#8b5cf6", gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)" },
        { value: "green", label: "Forest Green", color: "#10b981", gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)" },
        { value: "orange", label: "Sunset Orange", color: "#f97316", gradient: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)" },
        { value: "red", label: "Crimson Red", color: "#ef4444", gradient: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)" },
        { value: "teal", label: "Mystic Teal", color: "#14b8a6", gradient: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)" },
        { value: "dark", label: "Midnight Dark", color: "#0f172a", gradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }
      ]
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
      if (this.attendanceStats && this.attendanceStats.rate !== undefined && this.attendanceStats.rate !== null) {
        return this.attendanceStats.rate
      }
      const total = this.totalEmployees || 0
      if (!total) return 0
      const active = (this.attendanceStats.present || 0) +
                     (this.attendanceStats.onSite || 0) +
                     (this.attendanceStats.traveling || 0) +
                     (this.attendanceStats.halfDay || 0)
      return Math.min(100, Math.round((active / total) * 100))
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
      return this.searchCatalog.filter(item => {
        const title = (item.title || '').toLowerCase()
        const category = (item.category || '').toLowerCase()
        const desc = (item.desc || '').toLowerCase()
        const keywords = (item.keywords || '').toLowerCase()
        const route = (item.route || '').toLowerCase()

        return (
          title.includes(q) ||
          category.includes(q) ||
          desc.includes(q) ||
          keywords.includes(q) ||
          route.includes(q) ||
          (q.includes('announc') && (route.includes('announc') || title.includes('announc') || keywords.includes('announc')))
        )
      })
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

        // 1. Fetch total active employees
        let totalActiveStaff = this.totalEmployees || 0
        try {
          const usersRes = await axios.get('https://employees.archenterprises.co.in/api/api/users', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          const allUsers = Array.isArray(usersRes.data) ? usersRes.data : []
          const activeUsers = allUsers.filter(u => {
            const s = (u.status || '').toLowerCase().trim()
            const d = (u.department || '').toLowerCase().trim()
            return s !== 'inactive' && d !== 'ownership'
          })
          if (activeUsers.length > 0) {
            totalActiveStaff = activeUsers.length
            this.totalEmployees = totalActiveStaff
          } else if (allUsers.length > 0) {
            totalActiveStaff = allUsers.length
            this.totalEmployees = totalActiveStaff
          }
        } catch (uErr) {
          console.warn('Could not fetch active users list:', uErr)
        }

        // 2. Fetch attendance and strictly filter for TODAY's date
        const attendanceRes = await axios.get('https://employees.archenterprises.co.in/api/api/attendance', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const allAttendance = Array.isArray(attendanceRes.data) ? attendanceRes.data : []

        const now = new Date()
        const yyyy = now.getFullYear()
        const mm = String(now.getMonth() + 1).padStart(2, '0')
        const dd = String(now.getDate()).padStart(2, '0')
        const todayStr = `${yyyy}-${mm}-${dd}`

        const todayRecords = allAttendance.filter(record => {
          if (!record.date) return false
          let recordDate = String(record.date).split('T')[0].split(' ')[0]
          if (recordDate.includes('/')) {
            const parts = recordDate.split('/')
            recordDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
          }
          return recordDate === todayStr
        })

        // De-duplicate by unique employee name or user_id
        const employeeStatusMap = new Map()
        todayRecords.forEach(r => {
          const key = (r.user_id ? `uid_${r.user_id}` : (r.name || '')).trim().toLowerCase()
          if (!key) return
          const rawStatus = (r.status || '').toLowerCase().replace(/[\s-_/]+/g, '')
          if (!employeeStatusMap.has(key)) {
            employeeStatusMap.set(key, rawStatus)
          } else {
            const prev = employeeStatusMap.get(key)
            const isWorking = ['present', 'onsite', 'traveling', 'halfday'].includes(rawStatus)
            if (isWorking || prev === 'notmarked') {
              employeeStatusMap.set(key, rawStatus)
            }
          }
        })

        let presentCount = 0
        let onSiteCount = 0
        let travelingCount = 0
        let halfDayCount = 0
        let leaveCount = 0
        let absentCount = 0

        employeeStatusMap.forEach(status => {
          if (status === 'present') presentCount++
          else if (status === 'onsite') onSiteCount++
          else if (status === 'traveling') travelingCount++
          else if (status === 'halfday') halfDayCount++
          else if (status === 'leave') leaveCount++
          else if (status === 'absent') absentCount++
        })

        const activeLoggedCount = presentCount + onSiteCount + travelingCount + halfDayCount
        const denominator = totalActiveStaff > 0 ? totalActiveStaff : (activeLoggedCount || 1)
        const calculatedRate = Math.min(100, Math.round((activeLoggedCount / denominator) * 100))

        const lateCount = todayRecords.filter(a => a.isLate === true || a.is_late === true || a.is_late === 1 || a.is_late === '1').length

        this.attendanceStats = {
          rate: calculatedRate,
          present: presentCount,
          onSite: onSiteCount,
          traveling: travelingCount,
          halfDay: halfDayCount,
          leave: leaveCount,
          absent: absentCount,
          late: lateCount,
          activeToday: activeLoggedCount,
          totalActive: denominator,
          total: activeLoggedCount
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
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#2cb67d'

      this.chartRevenueInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { 
              label: 'Target', 
              data: labels.map(m => this.monthlyTargetData[m] || 0), 
              backgroundColor: 'rgba(203, 213, 225, 0.65)', 
              borderRadius: 10 
            },
            { 
              label: 'Revenue (Closed Orders)', 
              data: labels.map(m => this.monthlyRevenueData[m] || 0), 
              backgroundColor: labels.map(m => {
                const revenue = this.monthlyRevenueData[m] || 0
                const target = this.monthlyTargetData[m] || 0
                return revenue >= target ? primaryColor : 'rgba(239,68,68,0.85)'
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
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#2cb67d'

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
              borderColor: primaryColor, 
              backgroundColor: primaryColor.startsWith('#') ? primaryColor + '22' : 'rgba(44,182,125,0.15)', 
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
      this.isMobile = window.innerWidth <= 992
    },

    toggleSidebar() {
      if (this.$refs.sidebarRef) {
        this.$refs.sidebarRef.isMobileOpen = !this.$refs.sidebarRef.isMobileOpen
      }
    },

    toggleSidebarCollapse() {
      if (this.$refs.sidebarRef && typeof this.$refs.sidebarRef.toggleCollapse === 'function') {
        this.$refs.sidebarRef.toggleCollapse()
      } else {
        this.isSidebarCollapsed = !this.isSidebarCollapsed
        localStorage.setItem('admin_sidebar_collapsed', this.isSidebarCollapsed ? 'true' : 'false')
      }
    },

    onSidebarCollapseChanged(val) {
      this.isSidebarCollapsed = val
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
    },
    getThemeName(themeVal) {
      const match = this.themeList.find(t => t.value === themeVal);
      return match ? match.label : "Theme";
    },
    getThemeColor(themeVal) {
      const match = this.themeList.find(t => t.value === themeVal);
      return match ? match.color : "#3b82f6";
    },
    selectTheme(theme) {
      this.currentTheme = theme;
      document.documentElement.classList.add("theme-transition");
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
      this.showThemePalette = false;
      this.$nextTick(() => {
        this.renderRevenueBarChart();
        this.renderCumulativeChart();
      });
      setTimeout(() => {
        document.documentElement.classList.remove("theme-transition");
      }, 400);
    },
    handleClickOutsideTheme(event) {
      if (this.showThemePalette && this.$refs.themePaletteDropdown && !this.$refs.themePaletteDropdown.contains(event.target)) {
        this.showThemePalette = false;
      }
    }
  },

  mounted() {
    setTimeout(() => { this.showSkeleton = false }, 1000)
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    this.previousTheme = document.documentElement.getAttribute("data-theme") || localStorage.getItem("theme") || "teal"
    document.documentElement.setAttribute("data-theme", "blue")
    document.addEventListener("click", this.handleClickOutsideTheme)

    // Fetch active workforce count (excluding inactive and ownership)
    axios.get('https://employees.archenterprises.co.in/api/api/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
      const allUsers = Array.isArray(res.data) ? res.data : []
      const active = allUsers.filter(u => {
        const s = (u.status || '').toLowerCase().trim()
        const d = (u.department || '').toLowerCase().trim()
        return s !== 'inactive' && d !== 'ownership'
      })
      if (active.length > 0) {
        this.totalEmployees = active.length
      } else if (allUsers.length > 0) {
        this.totalEmployees = allUsers.length
      }
    }).catch(() => {
      axios.get('https://employees.archenterprises.co.in/api/api/total-employees')
        .then(response => { if (!this.totalEmployees) this.totalEmployees = response.data.count })
        .catch(err => console.error(err))
    })

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
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
    document.removeEventListener("click", this.handleClickOutsideTheme)
    if (this.previousTheme && this.previousTheme !== 'blue') {
      document.documentElement.setAttribute("data-theme", this.previousTheme)
    } else {
      document.documentElement.setAttribute("data-theme", localStorage.getItem("theme") || "teal")
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

.layout {
  display: flex;
  flex-direction: column;
  background: var(--bg-app, #f8fafc);
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--text, #0f172a);
}

.main-content {
  display: flex;
  flex: 1;
  padding: 20px 28px;
  gap: 24px;
}

.content {
  flex: 1;
  min-width: 0;
  background: transparent;
  overflow-x: hidden;
}

/* Mobile Header */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--card, #ffffff);
  border-radius: 10px;
  margin-bottom: 16px;
  border: 1px solid var(--border, #e2e8f0);
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text, #0f172a);
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

.mobile-title i {
  color: var(--primary, #0d9488);
}

/* 🔍 Top Search & Action Bar */
.dashboard-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.search-box-wrapper {
  flex: 1;
  position: relative;
  max-width: 640px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 14px;
}

.dashboard-search-input {
  width: 100%;
  padding: 11px 16px 11px 44px;
  background: var(--card, #ffffff);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 10px;
  font-size: 13.5px;
  color: var(--text, #0f172a);
  font-weight: 500;
  outline: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.dashboard-search-input:focus {
  border-color: var(--primary, #0d9488);
  box-shadow: 0 0 0 3px var(--primary-glow, rgba(13, 148, 136, 0.12));
}

.search-clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  font-size: 10px;
  transition: all 0.15s ease;
}

.search-clear-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* Live Search Dropdown */
.search-results-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid var(--border, #e2e8f0);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  overflow: hidden;
  max-height: 380px;
  display: flex;
  flex-direction: column;
}

.search-dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #fafbfc;
  border-bottom: 1px solid #f1f5f9;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text, #0f172a);
}

.search-esc-hint {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
}

.search-results-list {
  overflow-y: auto;
  max-height: 320px;
  padding: 4px;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.search-result-item:hover {
  background: #f8fafc;
}

.search-item-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f1f5f9;
  color: var(--primary, #0d9488);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.search-item-info {
  flex: 1;
  min-width: 0;
}

.search-item-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 1px;
}

.search-item-title {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.search-item-cat {
  font-size: 10px;
  font-weight: 600;
  color: #475569;
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 4px;
}

.search-item-desc {
  font-size: 11.5px;
  color: #64748b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-item-arrow {
  color: #cbd5e1;
  font-size: 11px;
}

.search-no-results {
  padding: 24px;
  text-align: center;
  color: #64748b;
}

.search-no-results i {
  font-size: 24px;
  color: #cbd5e1;
  margin-bottom: 6px;
}

.search-no-results p {
  font-size: 13px;
  color: #0f172a;
  margin: 0 0 4px;
}

.search-no-results small {
  font-size: 11.5px;
  color: #94a3b8;
}

/* Topbar Actions */
.dashboard-topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-create-new {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--primary-gradient, linear-gradient(135deg, #0d9488 0%, #0f766e 100%));
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  white-space: nowrap;
}

.btn-create-new:hover {
  opacity: 0.94;
  transform: translateY(-1px);
}

/* 🌟 Multi-Column Master Dashboard Layout */
.dashboard-main-grid {
  display: grid;
  grid-template-columns: 1fr 330px;
  gap: 24px;
  align-items: start;
}

.dashboard-left-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

.dashboard-right-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Section Title Row */
.dashboard-section-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.section-heading {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.2px;
}

.section-subtitle {
  font-size: 12px;
  color: #64748b;
  font-weight: 400;
}

/* 1. Quick Access Cards */
.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.qa-card {
  background: var(--card, #ffffff);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  padding: 18px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 145px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.qa-card:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
}

.qa-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.qa-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.qa-teal {
  background: #f0fdfa;
  color: #0d9488;
}

.qa-blue {
  background: #eff6ff;
  color: #2563eb;
}

.qa-purple {
  background: #f5f3ff;
  color: #7c3aed;
}

.qa-pill-badge {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 2px 8px;
  border-radius: 6px;
}

.qa-stat-pill {
  font-size: 11px;
  font-weight: 600;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #d1fae5;
  padding: 2px 8px;
  border-radius: 6px;
}

.qa-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 14.5px;
  font-weight: 700;
  color: #0f172a;
  margin: 12px 0 3px;
}

.qa-subtitle {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.45;
}

.qa-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
  font-weight: 600;
  color: #64748b;
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
  transition: color 0.15s ease;
}

.qa-card:hover .qa-action-row {
  color: var(--primary, #0d9488);
}

/* 2. Folders / Operational Modules */
.folders-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.folder-card {
  background: var(--card, #ffffff);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--border, #e2e8f0);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.folder-card:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
}

.folder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.folder-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.icon-emp { background: #eff6ff; color: #2563eb; }
.icon-dept { background: #f0fdfa; color: #0d9488; }
.icon-exp { background: #fef3c7; color: #d97706; }
.icon-leave { background: #ecfdf5; color: #16a34a; }

.folder-name {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.folder-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
  color: #64748b;
}

.folder-arrow {
  font-size: 10px;
  color: #cbd5e1;
  transition: transform 0.2s ease, color 0.2s ease;
}

.folder-card:hover .folder-arrow {
  color: #0f172a;
  transform: translateX(2px);
}

.folder-badge {
  font-size: 10.5px;
  font-weight: 600;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 1.5px 7px;
  border-radius: 6px;
}

.folder-badge.pending {
  color: #ea580c;
  background: #fff7ed;
  border-color: #fed7aa;
}

/* 3. Recent Activity & Operations Table */
.recent-files-card {
  background: var(--card, #ffffff);
  border-radius: 12px;
  border: 1px solid var(--border, #e2e8f0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  overflow-x: auto;
}

.recent-files-table {
  width: 100%;
  border-collapse: collapse;
}

.recent-files-table th {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-align: left;
  padding: 12px 18px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}

.recent-files-table td {
  padding: 13px 18px;
  font-size: 13px;
  color: #0f172a;
  border-bottom: 1px solid #f8fafc;
}

.recent-files-table tbody tr {
  cursor: pointer;
  transition: background 0.15s ease;
}

.recent-files-table tbody tr:hover {
  background: #f8fafc;
}

.recent-files-table tbody tr:last-child td {
  border-bottom: none;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-pill {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.pill-blue { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; }
.pill-amber { background: #fffbeb; color: #d97706; border: 1px solid #fef3c7; }
.pill-teal { background: #f0fdfa; color: #0d9488; border: 1px solid #ccfbf1; }
.pill-purple { background: #f5f3ff; color: #7c3aed; border: 1px solid #ede9fe; }

.file-title-text {
  font-weight: 600;
  color: #0f172a;
}

.text-secondary-cell {
  color: #64748b;
  font-size: 12.5px;
}

.member-tag {
  font-size: 11.5px;
  font-weight: 500;
  color: #475569;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 6px;
  display: inline-block;
}

.member-tag.success {
  background: #ecfdf5;
  color: #059669;
}

.col-action {
  text-align: right;
  width: 60px;
}

.row-arrow {
  color: #cbd5e1;
  font-size: 11px;
  transition: transform 0.2s ease, color 0.2s ease;
}

.recent-files-table tbody tr:hover .row-arrow {
  color: var(--primary, #0d9488);
  transform: translateX(3px);
}

/* 🌟 Executive Pulse Strip: High-Level Metrics */
.executive-pulse-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.pulse-stat-card {
  background: var(--card, #ffffff);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.pulse-stat-card:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.pulse-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
}

.pulse-blue { background: #eff6ff; color: #2563eb; }
.pulse-teal { background: #f0fdfa; color: #0d9488; }
.pulse-green { background: #ecfdf5; color: #059669; }
.pulse-amber { background: #fffbeb; color: #d97706; }

.pulse-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.pulse-label {
  font-size: 10.5px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.pulse-value {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 2px 0;
  line-height: 1.2;
}

.pulse-sub {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pulse-action-hint {
  color: var(--primary, #0d9488);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.pulse-action-hint i {
  font-size: 10px;
  transition: transform 0.2s ease;
}

.pulse-stat-card:hover .pulse-action-hint i {
  transform: translateX(3px);
}

/* Attendance Pulse Card Enhancements */
.pulse-attendance-card .pulse-info {
  flex: 1;
}

.pulse-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.pulse-ratio-tag {
  font-size: 10px;
  font-weight: 700;
  color: #0d9488;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  padding: 1px 7px;
  border-radius: 9999px;
  letter-spacing: 0.2px;
  white-space: nowrap;
}

.pulse-status-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
}

.pulse-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 9.5px;
  font-weight: 600;
  padding: 1.5px 6px;
  border-radius: 4px;
  line-height: 1.3;
  white-space: nowrap;
}

.pulse-chip i {
  font-size: 8px;
}

.chip-present {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.chip-onsite {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.chip-travel {
  background: #f5f3ff;
  color: #7c3aed;
  border: 1px solid #ddd6fe;
}

.chip-halfday {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}

/* Dedicated Target Details Button */
.target-details-btn {
  margin-top: 12px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 14px;
  background: var(--surface-tint, #f8fafc);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text, #0f172a);
  cursor: pointer;
  transition: all 0.2s ease;
}

.target-details-btn i {
  font-size: 11px;
  color: var(--primary, #0d9488);
  transition: transform 0.2s ease;
}

.target-details-btn:hover {
  background: var(--primary-light, #f0fdfa);
  border-color: var(--primary, #0d9488);
  color: var(--primary, #0d9488);
}

.target-details-btn:hover i {
  transform: translateX(3px);
}

/* ▶️ RIGHT COLUMN WIDGETS */
.side-widget-card {
  background: var(--card, #ffffff);
  border-radius: 12px;
  padding: 18px;
  border: 1px solid var(--border, #e2e8f0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.widget-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.widget-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px;
}

.widget-subtitle {
  font-size: 11.5px;
  color: #64748b;
  margin: 0;
}

.widget-badge {
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 6px;
}

.badge-good {
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #d1fae5;
}

.badge-neutral {
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

/* Progress Arc */
.arc-meter-container {
  position: relative;
  width: 100%;
  max-width: 190px;
  margin: 0 auto 10px;
  text-align: center;
}

.arc-svg {
  width: 100%;
  height: auto;
}

.arc-center-text {
  position: absolute;
  bottom: 4px;
  left: 0;
  right: 0;
  text-align: center;
}

.arc-big-val {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  line-height: 1;
}

.arc-sub-val {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  margin: 3px 0 0;
}

.target-stats-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #fafbfc;
  border-radius: 8px;
  margin-top: 10px;
  border: 1px solid #f1f5f9;
}

.target-stat-item {
  display: flex;
  flex-direction: column;
}

.target-stat-divider {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
}

.stat-label {
  font-size: 10.5px;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-size: 12.5px;
  font-weight: 700;
  color: #0f172a;
  margin-top: 1px;
}

/* SBU Widget */
.sbu-widget {
  background: #ffffff;
  border-radius: 12px;
  padding: 18px;
  border: 1px solid var(--border, #e2e8f0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.sbu-header-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sbu-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f0fdfa;
  color: #0d9488;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.sbu-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.sbu-tag {
  font-size: 10.5px;
  color: #64748b;
}

.sbu-desc {
  font-size: 11.5px;
  color: #64748b;
  line-height: 1.45;
  margin: 10px 0 14px;
}

.sbu-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #fafbfc;
  color: #0f172a;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sbu-btn:hover {
  background: var(--primary, #0d9488);
  color: #ffffff;
  border-color: var(--primary, #0d9488);
}

/* Birthday Reminders */
.birthday-side-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 18px;
  border: 1px solid var(--border, #e2e8f0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.side-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.birthday-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

.birthday-header-title h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

.birthday-icon {
  color: #f59e0b;
  font-size: 13px;
}

.birthday-count-pill {
  font-size: 11px;
  font-weight: 600;
  color: #d97706;
  background: #fef3c7;
  border: 1px solid #fde68a;
  padding: 1px 7px;
  border-radius: 6px;
}

.side-birthdays-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.side-birthday-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 0;
  border-bottom: 1px solid #f8fafc;
}

.side-birthday-item:last-child {
  border-bottom: none;
}

.birthday-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}

.birthday-initials {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
  font-weight: 700;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.birthday-details {
  flex: 1;
  min-width: 0;
}

.birthday-emp-name {
  font-size: 12.5px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.birthday-emp-date {
  font-size: 11px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Mobile Menu Toggle Button */
.mobile-menu-toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  border: 1px solid var(--border, #e2e8f0);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text, #0f172a);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-menu-toggle-btn:hover {
  background: #e2e8f0;
}

/* ════════ Complete Responsive System ════════ */
@media (max-width: 1400px) {
  .dashboard-main-grid {
    grid-template-columns: 1fr 310px;
    gap: 18px;
  }

  .folders-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1180px) {
  .dashboard-main-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .dashboard-right-col {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .quick-access-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .executive-pulse-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
}

@media (max-width: 992px) {
  .main-content {
    padding: 16px 14px;
    gap: 16px;
    flex-direction: column;
  }

  .mobile-header {
    display: flex;
  }

  .dashboard-topbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin-bottom: 18px;
  }

  .search-box-wrapper {
    max-width: 100%;
  }

  .dashboard-topbar-actions {
    width: 100%;
  }

  .btn-create-new {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 12px 10px;
  }

  .executive-pulse-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .pulse-stat-card {
    padding: 14px 16px;
  }

  .quick-access-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .folders-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .dashboard-right-col {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .recent-files-card {
    border-radius: 10px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .recent-files-table {
    min-width: 520px;
  }
}

@media (max-width: 480px) {
  .folders-grid {
    grid-template-columns: 1fr;
  }

  .recent-files-table {
    min-width: 480px;
  }
}
</style>