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

        <!-- Welcome Hero -->
        <div class="welcome-hero">
          <div class="hero-pattern"></div>
          <div class="hero-main">
            <div class="hero-avatar">{{ userInitial }}</div>
            <div class="hero-copy">
              <p class="hero-eyebrow">{{ todayLabel }}</p>
              <h1 class="hero-title">{{ greeting }}, {{ formattedUserName }} <span class="wave">👋</span></h1>
              <p class="hero-subtitle">Here's what's happening across your organization today.</p>
            </div>
          </div>
        </div>

        <!-- Dashboard Cards -->
        <div class="dashboard-slider-container">
          <div v-if="showSkeleton" class="dashboard-slider skeleton-wrapper">
            <div
              v-for="n in skeletonCount"
              :key="n"
              class="dashboard-card skeleton-card"
            >
              <div class="card-icon skeleton-icon"></div>
              <div>
                <p class="label skeleton-label"></p>
                <p class="tagline skeleton-tagline"></p>
              </div>
            </div>
          </div>

          <!-- Scrollable Card Section - Mobile Optimized -->
          <div v-else class="dashboard-slider" ref="slider">
            <div class="dashboard-card clickable-card temp leavetype" @click="goTo('employees')">
              <div class="card-icon icon-amber">👨🏻‍💼</div>
              <div>
                <p class="label label-emp">Employees</p>
                <p class="tagline">Manage employees</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card leavetype" @click="goTo('workreport')">
              <div class="card-icon icon-blue">📋</div>
              <div>
                <p class="label label-cust">Work Reports</p>
                <p class="tagline">Tasks Management</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card leavetype" @click="goTo('expensemanage')">
              <div class="card-icon icon-green">💰</div>
              <div>
                <p class="label label-cust">Expenses</p>
                <p class="tagline">Manage expenses</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card leavetype" @click="goTo('resourcebooking')">
              <div class="card-icon icon-blue"></div>
              <div>
                <p class="label label-cust">Resources</p>
                <p class="tagline">Book meeting rooms</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card attendance leavetype" @click="goTo('empattendanceadmin')">
              <div class="card-icon icon-sky">🗓️</div>
              <div>
                <p class="label label-att">Attendance</p>
                <p class="tagline">{{ attendanceRate }}% today</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card leavetype" @click="goTo('announcement')">
              <div class="card-icon icon-orange">📢</div>
              <div>
                <p class="label label-ann">Announcements</p>
                <p class="tagline">Share news & updates</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card dept leavetype" @click="goTo('managedepartments')">
              <div class="card-icon icon-emerald">🏛️</div>
              <div>
                <p class="label label-dept">Departments</p>
                <p class="tagline">Organize teams</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card Leaves leavetype" @click="goToLeaveApplications">
              <div class="card-icon icon-rose">🏖️</div>
              <div>
                <p class="label label-leave">Leaves</p>
                <p class="tagline">Manage leaves</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card Leaves leavetype mobile-only" @click="goToOfferLetters">
              <div class="card-icon icon-indigo">📄</div>
              <div>
                <p class="label label-leave">Offer Letters</p>
                <p class="tagline">Manage offer letters</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card Leaves leavetype mobile-only" @click="goToMyApps">
              <div class="card-icon icon-teal">📊</div>
              <div>
                <p class="label label-leave">Applications</p>
                <p class="tagline">View application status</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card Leaves leavetype" @click="goToSalaryAdvances">
              <div class="card-icon icon-green">💰</div>
              <div>
                <p class="label label-leave">Salary Advances</p>
                <p class="tagline">Manage salary advances</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card Leaves leavetype" @click="goToHoliday">
              <div class="card-icon icon-orange">🌴</div>
              <div>
                <p class="label label-leave">Holidays</p>
                <p class="tagline">Manage holidays</p>
              </div>
            </div>
          </div>  
        </div>

        <!-- Performance Analytics Section - Mobile Optimized -->
        <div class="analytics-section">
        </div>

        <!-- Monthly Revenue Section - Enhanced with Company Breakdown -->
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

        <!-- Birthday Reminder Section - Mobile Optimized -->
        <div class="birthday-section">
          <div class="birthday-card">
            <h3>🎉 Birthday Reminder - {{ months[new Date().getMonth()] }}</h3>
            <div v-if="birthdays.length > 0" class="birthday-grid">
              <div v-for="(emp, index) in birthdays" :key="index" class="employee-birthday-card">
                <img
                  :src="emp.photo || 'https://img.icons8.com/color/48/000000/user-male-circle.png'"
                  alt="Employee"
                />
                <div>
                  <p class="emp-name">{{ emp.name }}</p>
                  <p class="emp-birthday">🎂 {{ formatBirthday(emp.dateofbirth) }}</p>
                  <p class="emp-dept">{{ emp.department || '—' }}</p>
                </div>
              </div>
            </div>
            <p v-else class="no-birthdays">No birthdays this month 🎈</p>
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
    }
  },

  methods: {
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

        const expenseRes = await axios.get('https://employees.archenterprises.co.in/api/api/expenses', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const expenses = expenseRes.data || []
        this.expenseStats.total = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)

        const categories = new Set(expenses.map(e => e.category))
        this.expenseStats.categories = categories.size
        this.expenseStats.data = expenses.reduce((acc, e) => {
          const cat = e.category || 'Other'
          acc[cat] = (acc[cat] || 0) + (parseFloat(e.amount) || 0)
          return acc
        }, {})

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
        const leaves = leaveRes.data || []
        this.leaveStats = {
          total: leaves.length,
          approved: leaves.filter(l => l.status === 'Approved').length,
          pending: leaves.filter(l => l.status === 'Pending').length,
          rejected: leaves.filter(l => l.status === 'Rejected').length
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
      this.workReportStats = { total: 45, completed: 28, pending: 17, completionRate: 62 }
      this.expenseStats = { total: 125000, categories: 6, data: { Travel: 45000, Food: 25000, Supplies: 35000, Other: 20000 } }
      this.attendanceStats = { present: 85, late: 8, absent: 7, total: 45 }
      this.leaveStats = { total: 12, approved: 8, pending: 3, rejected: 1 }
      this.topPerformers = [
        { rank: 1, name: 'John Doe', department: 'Sales', score: 450 },
        { rank: 2, name: 'Jane Smith', department: 'Development', score: 420 },
        { rank: 3, name: 'Mike Johnson', department: 'Support', score: 390 },
        { rank: 4, name: 'Sarah Williams', department: 'Marketing', score: 370 },
        { rank: 5, name: 'David Brown', department: 'Operations', score: 350 }
      ]
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
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

:root {
  --primary: #4f46e5;
  --primary-dark: #4338ca;
  --primary-light: #eef2ff;
  --secondary: #64748b;
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #3b82f6;
  --text: #1e293b;
  --text-light: #64748b;
  --bg: #f7f8fc;
  --card: #ffffff;
  --border: #e7e9f2;
  --shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04);
  --shadow-lg: 0 12px 24px -8px rgba(79, 70, 229, 0.16), 0 4px 8px -2px rgba(15, 23, 42, 0.06);
  --radius: 14px;
  --font-display: 'Sora', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
}

.layout {
  display: flex;
  flex-direction: column;
  background: var(--bg);
  min-height: 100vh;
  font-family: var(--font-body);
  color: var(--text);
}

.main-content {
  display: flex;
  flex: 1;
  padding: 24px;
  gap: 24px;
}

.content {
  flex: 1;
  background: transparent;
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
  color: var(--text);
  padding: 8px;
  cursor: pointer;
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  font-family: var(--font-display);
}

.mobile-title i {
  color: var(--primary);
}

.mobile-user-badge {
  background: var(--primary);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

/* Welcome Hero */
.welcome-hero {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(120deg, #4338ca 0%, #4f46e5 45%, #7c6cf0 100%);
  padding: 28px 32px;
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  box-shadow: var(--shadow-lg);
}

.hero-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.14) 1.5px, transparent 1.5px);
  background-size: 18px 18px;
  mask-image: linear-gradient(to right, black, transparent 75%);
  pointer-events: none;
}

.hero-main {
  display: flex;
  align-items: center;
  gap: 18px;
  position: relative;
  z-index: 1;
}

.hero-avatar {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #fff;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
}

.hero-eyebrow {
  color: rgba(255, 255, 255, 0.75);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.hero-title {
  font-family: var(--font-display);
  color: #ffffff;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 6px;
}

.wave {
  display: inline-block;
  animation: wave-hand 2.2s ease-in-out infinite;
  transform-origin: 70% 70%;
}

@keyframes wave-hand {
  0%, 60%, 100% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(14deg); }
  40% { transform: rotate(-4deg); }
}

.hero-subtitle {
  color: rgba(255, 255, 255, 0.82);
  font-size: 14px;
}

.hero-stats {
  display: flex;
  gap: 12px;
  position: relative;
  z-index: 1;
  flex-wrap: wrap;
}

.hero-stat {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 14px;
  padding: 10px 16px;
  backdrop-filter: blur(6px);
}

.hero-stat i {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
}

.hero-stat-value {
  display: block;
  color: #fff;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 16px;
  line-height: 1.1;
}

.hero-stat-label {
  display: block;
  color: rgba(255, 255, 255, 0.75);
  font-size: 11px;
  margin-top: 2px;
}

/* Dashboard Slider */
.dashboard-slider-container {
  width: 100%;
  margin-bottom: 32px;
}

.dashboard-slider {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  padding: 4px;
}

.dashboard-card {
  min-width: 200px;
  background: #ffffff;
  border-radius: var(--radius);
  padding: 20px;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(79, 70, 229, 0.25);
}

.card-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.icon-amber { background: #fef3c7; }
.icon-blue { background: #dbeafe; }
.icon-green { background: #dcfce7; }
.icon-violet { background: #ede9fe; }
.icon-sky { background: #e0f2fe; }
.icon-orange { background: #ffedd5; }
.icon-emerald { background: #d1fae5; }
.icon-rose { background: #ffe4e6; }
.icon-indigo { background: #e0e7ff; }
.icon-teal { background: #ccfbf1; }

.label {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
  margin-bottom: 4px;
}

.tagline {
  font-size: 12px;
  color: var(--text-light);
}

/* Card bottom borders */
.temp { border-bottom: 3px solid var(--warning); }
.Leaves { border-bottom: 3px solid var(--danger); }
.attendance { border-bottom: 3px solid var(--info); }
.dept { border-bottom: 3px solid var(--success); }
.leavetype { border-bottom: 3px solid var(--primary); }
.announcement { border-bottom: 3px solid #f97316; }

/* Skeleton Styles */
.skeleton-wrapper {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  padding: 4px;
}

.skeleton-card {
  min-width: 200px;
  background: #ffffff;
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  background-image: linear-gradient(
    90deg,
    #f0f0f0 0px,
    #e0e0e0 40px,
    #f0f0f0 80px
  );
  background-size: 300px 100%;
  background-repeat: no-repeat;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 12px;
  background: #e0e0e0;
}

.skeleton-label {
  width: 120px;
  height: 16px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-tagline {
  width: 100px;
  height: 12px;
  background: #e0e0e0;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: -300px 0; }
  100% { background-position: 300px 0; }
}

/* Analytics Section */
.analytics-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-header h3 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header h3 i {
  color: var(--primary);
  font-size: 16px;
}

.period-selector {
  display: flex;
  gap: 6px;
  background: #eef0f6;
  padding: 4px;
  border-radius: 40px;
  border: 1px solid var(--border);
}

.period-selector button {
  padding: 4px 12px;
  font-size: 12px;
  border: none;
  background: transparent;
  border-radius: 32px;
  cursor: pointer;
  color: var(--text-light);
  transition: all 0.2s;
  font-weight: 500;
}

.period-selector button.active {
  background: var(--primary);
  color: white;
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.35);
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.analytics-card {
  background: #ffffff;
  border-radius: var(--radius);
  padding: 20px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}

.analytics-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.analytics-card h4 {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
}

.analytics-card h4 i {
  color: var(--primary);
}

.badge {
  background: var(--primary-light);
  color: var(--primary-dark);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.chart-container {
  position: relative;
  max-height: 160px;
  margin-bottom: 16px;
}

.analytics-card canvas {
  max-height: 160px;
  width: 100% !important;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

.stat-label {
  font-size: 11px;
  color: var(--text-light);
}

/* Revenue Section - Enhanced */
.monthly-revenue-row {
  margin-bottom: 32px;
}

.revenue-card {
  background: #ffffff;
  border-radius: var(--radius);
  padding: 24px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}

.revenue-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.revenue-title h3 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.revenue-title p {
  font-size: 13px;
  color: var(--text-light);
}

.target-input label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-light);
}

.target-input input {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  width: 180px;
}

.revenue-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.kpi {
  background: var(--bg);
  border-radius: var(--radius);
  padding: 14px;
  text-align: center;
  border: 1px solid var(--border);
  transition: transform 0.2s;
}

.kpi:hover {
  transform: translateY(-2px);
}

.kpi h4 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.kpi p {
  font-size: 11px;
  color: var(--text-light);
}

.kpi.success h4 { color: var(--success); }
.kpi.info h4 { color: var(--info); }
.kpi.warning h4 { color: var(--warning); }
.kpi.primary h4 { color: var(--primary); }

/* Companies Breakdown */
.companies-breakdown {
  margin-bottom: 24px;
}

.breakdown-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text);
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
  background: var(--bg);
  border-radius: 10px;
  border: 1px solid var(--border);
  transition: all 0.3s;
}

.company-card:hover {
  background: white;
  box-shadow: var(--shadow);
  border-color: var(--primary-light);
}

.company-card.gold {
  background: linear-gradient(135deg, #fff9e6, #fef3c7);
  border-color: #fbbf24;
}

.company-card.silver {
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-color: #94a3b8;
}

.company-card.bronze {
  background: linear-gradient(135deg, #fff7ed, #fed7aa);
  border-color: #fb923c;
}

.company-rank {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-light);
  text-align: center;
}

.company-card.gold .company-rank { color: #d97706; }
.company-card.silver .company-rank { color: #64748b; }
.company-card.bronze .company-rank { color: #ea580c; }

.company-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.company-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.company-details {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.company-revenue {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.company-percent {
  font-size: 11px;
  color: var(--text-light);
  font-weight: 500;
}

.company-orders {
  font-size: 11px;
  color: var(--text-light);
  background: var(--bg);
  padding: 2px 8px;
  border-radius: 12px;
}

.company-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
  grid-column: 1 / -1;
}

.company-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s ease;
}

.bar-gold { background: linear-gradient(90deg, #fbbf24, #d97706); }
.bar-silver { background: linear-gradient(90deg, #94a3b8, #64748b); }
.bar-bronze { background: linear-gradient(90deg, #fb923c, #ea580c); }
.bar-blue { background: linear-gradient(90deg, #60a5fa, #2563eb); }
.bar-green { background: linear-gradient(90deg, #34d399, #059669); }
.bar-purple { background: linear-gradient(90deg, #a78bfa, #7c3aed); }
.bar-pink { background: linear-gradient(90deg, #f472b6, #db2777); }
.bar-indigo { background: linear-gradient(90deg, #818cf8, #4f46e5); }
.bar-teal { background: linear-gradient(90deg, #2dd4bf, #0d9488); }
.bar-orange { background: linear-gradient(90deg, #fb923c, #ea580c); }

.no-data-message {
  text-align: center;
  padding: 20px;
  color: var(--text-light);
  font-size: 14px;
  background: var(--bg);
  border-radius: var(--radius);
  border: 1px dashed var(--border);
}

/* Quarter Grid */
.quarter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.quarter-card {
  background: var(--bg);
  border-radius: var(--radius);
  padding: 14px;
  text-align: center;
  border: 1px solid var(--border);
}

.quarter-card h4 {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.quarter-card p {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.quarter-card small {
  font-size: 10px;
  color: var(--text-light);
}

.quarter-card.success p { color: var(--success); }
.quarter-card.danger p { color: var(--danger); }

.bar-chart-wrapper {
  height: 220px;
  margin-bottom: 24px;
}

.chart-height {
  height: 220px;
}

/* Birthday Section */
.birthday-section {
  margin-bottom: 24px;
}

.birthday-card {
  background: #ffffff;
  border-radius: var(--radius);
  padding: 24px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}

.birthday-card h3 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
}

.birthday-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.employee-birthday-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: var(--bg);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.employee-birthday-card img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.emp-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.emp-birthday {
  font-size: 12px;
  color: var(--warning);
}

.emp-dept {
  font-size: 11px;
  color: var(--text-light);
}

.no-birthdays {
  text-align: center;
  color: var(--text-light);
  padding: 32px;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 12px;
    gap: 12px;
  }

  .content {
    padding: 0;
  }

  .mobile-header {
    display: flex;
  }

  .welcome-hero {
    padding: 20px;
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-title {
    font-size: 20px;
  }

  .hero-stats {
    width: 100%;
  }

  .hero-stat {
    flex: 1;
    min-width: 0;
    padding: 8px 10px;
  }

  .dashboard-slider {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 4px 0;
    gap: 12px;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
  }

  .dashboard-card {
    min-width: 170px;
    padding: 16px;
    flex-shrink: 0;
    scroll-snap-align: start;
  }

  .skeleton-card {
    min-width: 170px;
    padding: 16px;
    flex-shrink: 0;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .skeleton-icon {
    width: 40px;
    height: 40px;
  }

  .skeleton-label {
    width: 100px;
    height: 14px;
  }

  .skeleton-tagline {
    width: 80px;
    height: 11px;
  }

  .label {
    font-size: 13px;
  }

  .tagline {
    font-size: 11px;
  }

  .analytics-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .analytics-card {
    padding: 16px;
  }

  .analytics-card h4 {
    font-size: 14px;
  }

  .chart-container {
    max-height: 140px;
  }

  .stats-row {
    gap: 8px;
  }

  .stat-value {
    font-size: 18px;
  }

  .performers-grid {
    grid-template-columns: 1fr;
  }

  .performer-card {
    padding: 12px;
  }

  .revenue-header {
    flex-direction: column;
    gap: 12px;
  }

  .target-input input {
    width: 100%;
    max-width: 300px;
  }

  .revenue-kpis {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .kpi h4 {
    font-size: 16px;
  }

  .company-card {
    grid-template-columns: 28px 1fr 100px;
    padding: 8px 12px;
  }

  .company-name {
    font-size: 13px;
  }

  .company-revenue {
    font-size: 12px;
  }

  .company-orders {
    font-size: 10px;
  }

  .quarter-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .bar-chart-wrapper {
    height: 180px;
  }

  .chart-height {
    height: 180px;
  }

  .birthday-grid {
    grid-template-columns: 1fr;
  }

  .employee-birthday-card {
    padding: 10px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-header h3 {
    font-size: 16px;
  }

  .period-selector {
    width: 100%;
  }

  .period-selector button {
    flex: 1;
    text-align: center;
    padding: 8px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }

  .mobile-title {
    font-size: 16px;
  }

  .mobile-user-badge {
    font-size: 10px;
    padding: 2px 10px;
  }

  .welcome-hero {
    padding: 16px;
  }

  .hero-avatar {
    width: 44px;
    height: 44px;
    font-size: 18px;
    border-radius: 12px;
  }

  .hero-title {
    font-size: 18px;
  }

  .hero-subtitle {
    font-size: 13px;
  }

  .hero-stat-value {
    font-size: 14px;
  }

  .dashboard-card {
    min-width: 150px;
    padding: 14px;
    gap: 12px;
  }

  .skeleton-card {
    min-width: 150px;
    padding: 14px;
    gap: 12px;
  }

  .card-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .skeleton-icon {
    width: 36px;
    height: 36px;
  }

  .skeleton-label {
    width: 80px;
    height: 12px;
  }

  .skeleton-tagline {
    width: 70px;
    height: 10px;
  }

  .label {
    font-size: 12px;
  }

  .tagline {
    font-size: 10px;
  }

  .analytics-card {
    padding: 12px;
  }

  .analytics-card canvas {
    max-height: 120px;
  }

  .stat-value {
    font-size: 16px;
  }

  .revenue-kpis {
    grid-template-columns: 1fr 1fr;
  }

  .kpi h4 {
    font-size: 14px;
  }

  .company-card {
    grid-template-columns: 24px 1fr;
    gap: 8px;
    padding: 8px 10px;
  }

  .company-name {
    font-size: 12px;
  }

  .company-revenue {
    font-size: 11px;
  }

  .company-percent {
    font-size: 10px;
  }

  .company-orders {
    font-size: 10px;
  }

  .company-bar {
    grid-column: 1 / -1;
  }

  .quarter-grid {
    grid-template-columns: 1fr 1fr;
  }

  .quarter-card {
    padding: 10px;
  }

  .quarter-card p {
    font-size: 12px;
  }

  .bar-chart-wrapper {
    height: 150px;
  }

  .chart-height {
    height: 150px;
  }

  .birthday-card {
    padding: 16px;
  }

  .birthday-card h3 {
    font-size: 16px;
  }

  .employee-birthday-card img {
    width: 40px;
    height: 40px;
  }

  .emp-name {
    font-size: 13px;
  }

  .kpi {
    padding: 10px;
  }

  .kpi h4 {
    font-size: 14px;
  }

  .quarter-card {
    padding: 10px;
  }

  .quarter-card p {
    font-size: 12px;
  }

  .breakdown-title {
    font-size: 14px;
  }
}
</style>