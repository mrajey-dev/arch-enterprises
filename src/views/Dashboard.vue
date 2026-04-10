<template>
  <div class="layout">
    <!-- Main Content -->
    <div class="main-content">
      <!-- Sidebar -->
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <!-- Content -->
      <section
        class="content"
        v-if="!isMobile || !isSidebarVisible"
        :class="{ 'expanded-content': isMobile && !isSidebarVisible }"
      >
        <!-- Dashboard Cards -->
        <div class="dashboard-slider-container">
          <div v-if="showSkeleton" class="dashboard-slider skeleton-wrapper">
            <div
              v-for="n in skeletonCount"
              :key="n"
              class="dashboard-card skeleton-card"
              :class="{ 'crm-skeleton': currentUserName === 'crm' }"
            >
              <div class="skeleton-label"></div>
              <div class="skeleton-text"></div>
            </div>
          </div>

          <!-- Scrollable Card Section -->
          <div v-else class="dashboard-slider" ref="slider">
            <div class="dashboard-card clickable-card temp leavetype" @click="goTo('employees')" v-if="currentUserName !== 'crm'">
              <div class="card-icon">👨🏻‍💼</div>
              <div>
                <p class="label label-emp">Employees</p>
                <p class="tagline">Manage employees</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card leavetype leavetype" v-if="currentUserName !== 'hr'" @click="goTo('Customerregistration')">
              <div class="card-icon">🤝</div>
              <div>
                <p class="label label-cust">Customers & PO</p>
                <p class="tagline">Our clients & Purchase Orders</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card temp leavetype" @click="goTo('employee/followup')" v-if="currentUserName !== 'hr'">
              <div class="card-icon">📞</div>
              <div>
                <p class="label label-emp">Follow-up</p>
                <p class="tagline">Quotations follow-up</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card Leaves leavetype" @click="goTo('employee/amcrecord')" v-if="currentUserName !== 'hr'">
              <div class="card-icon">📄</div>
              <div>
                <p class="label label-leave">AMC Record</p>
                <p class="tagline">Service status</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card leavetype" v-if="currentUserName !== 'crm'" @click="goTo('workreport')">
              <div class="card-icon">📋</div>
              <div>
                <p class="label label-cust">Work Reports</p>
                <p class="tagline">Tasks Management</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card leavetype" v-if="currentUserName !== 'crm'" @click="goTo('expensemanage')">
              <div class="card-icon">💰</div>
              <div>
                <p class="label label-cust">Expenses</p>
                <p class="tagline">Manage expenses</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card leavetype" v-if="currentUserName !== 'crm'" @click="goTo('resourcebooking')">
              <div class="card-icon">📅</div>
              <div>
                <p class="label label-cust">Resources</p>
                <p class="tagline">Book meeting rooms</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card attendance leavetype" @click="goTo('rcahelp')" v-if="currentUserName !== 'hr'">
              <div class="card-icon">🗪</div>
              <div>
                <p class="label label-att">RCA</p>
                <p class="tagline">Root Cause Analysis</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card attendance leavetype" @click="goTo('empattendanceadmin')" v-if="currentUserName !== 'crm'">
              <div class="card-icon">🗓️</div>
              <div>
                <p class="label label-att">Attendance</p>
                <p class="tagline">{{ attendanceRate }}% today</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card  leavetype" @click="goTo('announcement')" v-if="currentUserName !== 'crm'">
              <div class="card-icon">📢</div>
              <div>
                <p class="label label-ann">Announcements</p>
                <p class="tagline">Share news & updates</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card dept leavetype" @click="goTo('managedepartments')" v-if="currentUserName !== 'crm'">
              <div class="card-icon">🏛️</div>
              <div>
                <p class="label label-dept">Departments</p>
                <p class="tagline">Organize teams</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card Leaves leavetype" @click="goToLeaveApplications" v-if="currentUserName !== 'crm'">
              <div class="card-icon">🏖️</div>
              <div>
                <p class="label label-leave">Leaves</p>
                <p class="tagline">Manage leaves</p>
              </div>
            </div>

            <div class="dashboard-card clickable-card Leaves leavetype" @click="goToSalaryAdvances" v-if="currentUserName !== 'crm'">
              <div class="card-icon">💰</div>
              <div>
                <p class="label label-leave">Salary Advances</p>
                <p class="tagline">Manage salary advances</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Analytics Section -->
        <div class="analytics-section">
          <div class="section-header">
            <h3>📊 Performance Analytics</h3>
            <div class="period-selector">
              <button :class="{ active: period === 'week' }" @click="period = 'week'">Week</button>
              <button :class="{ active: period === 'month' }" @click="period = 'month'">Month</button>
              <button :class="{ active: period === 'quarter' }" @click="period = 'quarter'">Quarter</button>
            </div>
          </div>

          <div class="analytics-grid">
            <!-- Work Report Chart -->
            <div class="analytics-card">
              <div class="card-header">
                <h4>📝 Work Reports</h4>
                <span class="badge">{{ workReportStats.total }} Tasks</span>
              </div>
              <canvas id="workReportChart"></canvas>
              <div class="stats-row">
                <div class="stat">
                  <span class="stat-value">{{ workReportStats.completed }}</span>
                  <span class="stat-label">Completed</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ workReportStats.pending }}</span>
                  <span class="stat-label">Pending</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ workReportStats.completionRate }}%</span>
                  <span class="stat-label">Completion Rate</span>
                </div>
              </div>
            </div>

            <!-- Expense Chart -->
            <div class="analytics-card">
              <div class="card-header">
                <h4>💵 Expense Breakdown</h4>
                <span class="badge">This {{ period }}</span>
              </div>
              <canvas id="expenseChart"></canvas>
              <div class="stats-row">
                <div class="stat">
                  <span class="stat-value">₹{{ formatNumber(expenseStats.total) }}</span>
                  <span class="stat-label">Total Expenses</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ expenseStats.categories }}</span>
                  <span class="stat-label">Categories</span>
                </div>
              </div>
            </div>

            <!-- Attendance Chart -->
            <div class="analytics-card">
              <div class="card-header">
                <h4>✅ Attendance Overview</h4>
                <span class="badge">{{ period }}</span>
              </div>
              <canvas id="attendanceChart"></canvas>
              <div class="stats-row">
                <div class="stat">
                  <span class="stat-value">{{ attendanceStats.present }}%</span>
                  <span class="stat-label">Present</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ attendanceStats.late }}%</span>
                  <span class="stat-label">Late</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ attendanceStats.absent }}%</span>
                  <span class="stat-label">Absent</span>
                </div>
              </div>
            </div>

            <!-- Leave Chart -->
            <div class="analytics-card">
              <div class="card-header">
                <h4>🏖️ Leave Distribution</h4>
                <span class="badge">{{ leaveStats.total }} Requests</span>
              </div>
              <canvas id="leaveChart"></canvas>
              <div class="stats-row">
                <div class="stat">
                  <span class="stat-value">{{ leaveStats.approved }}</span>
                  <span class="stat-label">Approved</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ leaveStats.pending }}</span>
                  <span class="stat-label">Pending</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ leaveStats.rejected }}</span>
                  <span class="stat-label">Rejected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

 

        <!-- Monthly Revenue Section -->
        <div class="monthly-revenue-row" v-if="currentUserName !== 'crm'">
          <div class="revenue-card">
            <div class="revenue-header">
              <div class="revenue-title">
                <h3>Revenue Overview</h3>
                <p>Financial Year {{ financialYear }} (Apr – Mar)</p>
              </div>
              <div class="target-input">
                <label>🎯 Yearly Target (₹) </label>
                <input
                  type="number"
                  v-model.number="yearlyTarget"
                  placeholder="Enter yearly target"
                  min="0"
                />
              </div>
            </div>

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
            </div>

            <div class="quarter-grid">
              <div
                v-for="q in ['Q1','Q2','Q3','Q4']"
                :key="q"
                class="quarter-card"
                :class="quarterAnalytics[q].percent >= 100 ? 'success' : 'danger'"
              >
                <h4>{{ q }}</h4>
                <p>₹ {{ quarterAnalytics[q].revenue.toLocaleString() }}</p>
                <small>Target ₹ {{ quarterAnalytics[q].target.toLocaleString() }} · {{ quarterAnalytics[q].percent }}%</small>
              </div>
            </div>

            <div class="bar-chart-wrapper">
              <canvas id="monthlyRevenueBarChart"></canvas>
            </div>

            <div class="analytics-card">
              <h4>📈 Cumulative Revenue vs Target</h4>
              <div class="chart-height">
                <canvas id="cumulativeChart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Birthday Reminder Section -->
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
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";

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
      currentUserName: '',
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
      topPerformers: []
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
      if (this.currentUserName === 'crm') return 4
      return 8
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
    }
  },

  methods: {
    formatNumber(num) {
      if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr'
      if (num >= 100000) return (num / 100000).toFixed(1) + 'L'
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
      return num
    },

    getProgressPercent(value, tasks) {
      const total = Object.values(tasks).reduce((a, b) => a + b, 0)
      if (total === 0) return 0
      return (value / total) * 100
    },

    async fetchAnalyticsData() {
      try {
        // Fetch work reports
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

        // Fetch expenses
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

        // Fetch attendance
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

        // Fetch leaves
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

        // Fetch top performers
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
        // Set default demo data
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
            backgroundColor: '#3b82f6',
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
            { label: 'Cumulative Revenue', data: cumulativeData.map(d => d.cumRevenue), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.15)', fill: true, tension: 0.4 }
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

    async generateMonthlyRevenue() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/graph/monthly-revenue')
        const apiData = response.data || []
        const fyMonths = ['April','May','June','July','August','September','October','November','December','January','February','March']
        this.monthlyRevenueData = {}
        fyMonths.forEach(monthName => {
          const monthIndex = this.months.indexOf(monthName) + 1
          const found = apiData.find(d => Number(d.month) === monthIndex)
          this.monthlyRevenueData[monthName] = found ? Number(found.total_revenue) : 0
        })
        this.$nextTick(() => {
          this.renderRevenueBarChart()
          this.renderCumulativeChart()
        })
      } catch (err) {
        console.error("Error fetching monthly revenue:", err)
      }
    },

    renderRevenueBarChart() {
      if (!this.monthlyRevenueData || !Object.keys(this.monthlyRevenueData).length) return
      const ctx = document.getElementById('monthlyRevenueBarChart')
      if (!ctx) return
      if (this.chartRevenueInstance) this.chartRevenueInstance.destroy()

      const labels = ['April','May','June','July','August','September','October','November','December','January','February','March']

      this.chartRevenueInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Target', data: labels.map(m => this.monthlyTargetData[m] || 0), backgroundColor: 'rgba(203, 213, 225, 0.7)', borderRadius: 10 },
            { label: 'Revenue', data: labels.map(m => this.monthlyRevenueData[m] || 0), backgroundColor: labels.map(m => (this.monthlyRevenueData[m] || 0) >= (this.monthlyTargetData[m] || 0) ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)'), borderRadius: 12 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' }, tooltip: { callbacks: { label: ctx => `₹ ${ctx.raw.toLocaleString()}` } } },
          scales: { y: { beginAtZero: true, ticks: { callback: v => `₹ ${v / 100000} L` } } }
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
    }).then(res => { this.currentUserName = res.data.name.toLowerCase() })
      .catch(err => console.error('Error fetching admin info:', err))

    const savedTarget = localStorage.getItem('yearlyTarget')
    if (savedTarget) this.yearlyTarget = Number(savedTarget)

    this.generateMonthlyRevenue()
    this.fetchAnalyticsData()
    this.fetchAllTimePieData()
    this.fetchBirthdayReminders()
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

:root {
  --primary: #2563eb;
  --primary-dark: #1d4ed8;
  --secondary: #64748b;
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #3b82f6;
  --text: #1e293b;
  --text-light: #64748b;
  --bg: #f8fafc;
  --card: #ffffff;
  --border: #e2e8f0;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --radius: 12px;
}

.layout {
  display: flex;
  flex-direction: column;
  background: var(--bg);
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
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

/* Dashboard Slider */
.dashboard-slider-container {
  width: 100%;
  margin-bottom: 32px;
}

.dashboard-slider {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding: 4px;
}

.dashboard-card {
  min-width: 200px;
  background:#ffffff;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #edecec;
  box-shadow: var(--shadow);
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.card-icon {
  font-size: 32px;
}

.label {
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

/* Analytics Section */
.analytics-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

.period-selector {
  display: flex;
  gap: 8px;
  background: #f1f1f1;
  padding: 4px;
  border-radius: 40px;
  border: 1px solid var(--border);
}

.period-selector button {
  padding: 6px 16px;
  font-size: 13px;
  border: none;
  background: transparent;
  border-radius: 32px;
  cursor: pointer;
  color: var(--text-light);
  transition: all 0.2s;
}

.period-selector button.active {
  background: var(--primary);
  color: white;
}

.view-all {
  padding: 6px 16px;
  font-size: 13px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 20px;
  cursor: pointer;
  color: var(--primary);
  transition: all 0.2s;
}

.view-all:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.analytics-card {
  background: #f3f5f4e0;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid rgb(208, 206, 206);
  box-shadow: var(--shadow);
}

.analytics-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.analytics-card h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.badge {
  background: var(--bg);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-light);
}

.analytics-card canvas {
  max-height: 160px;
  margin-bottom: 16px;
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
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

.stat-label {
  font-size: 11px;
  color: var(--text-light);
}

/* Performance Section */
.performance-section {
  margin-bottom: 32px;
}

.performers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.performer-card {
  background: var(--card);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid var(--border);
  transition: all 0.3s;
}

.performer-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.performer-rank {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 14px;
}

.performer-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 20px;
  color: white;
}

.performer-info {
  flex: 1;
}

.performer-info h5 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.performer-info p {
  font-size: 12px;
  color: var(--text-light);
}

.performer-score {
  text-align: right;
}

.score-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}

.score-label {
  font-size: 10px;
  color: var(--text-light);
}

/* Pie Charts */
.pie-slider-wrapper {
  margin-bottom: 32px;
  overflow-x: auto;
}

.pie-slider {
  display: flex;
  gap: 20px;
  padding-bottom: 8px;
}

.chart-box {
  min-width: 280px;
  background: var(--card);
  border-radius: var(--radius);
  padding: 20px;
  border: 1px solid var(--border);
}

.chart-box h4 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text);
}

.pie-chart-wrapper {
  width: 180px;
  height: 180px;
  margin: 0 auto;
}

.task-details {
  margin-top: 16px;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}

.task-label {
  color: var(--text-light);
  width: 80px;
}

.task-progress {
  flex: 1;
  background: var(--bg);
  border-radius: 10px;
  height: 20px;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  background: var(--primary);
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s;
}

.task-value {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  font-weight: 600;
  color: var(--text);
}

/* Revenue Section */
.monthly-revenue-row {
  margin-bottom: 32px;
}

.revenue-card {
  background: #f2f5f4;
  border-radius:10px;
  padding: 24px;
  border: 1px solid #d9dddb;
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
  font-size: 18px;
  font-weight: 600;
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
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.kpi {
  background: var(--bg);
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
}

.kpi h4 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.kip p {
  font-size: 12px;
  color: var(--text-light);
}

.kpi.success h4 { color: var(--success); }
.kpi.info h4 { color: var(--info); }
.kpi.warning h4 { color: var(--warning); }

.quarter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.quarter-card {
  background: var(--bg);
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
}

.quarter-card h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.quarter-card p {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.quarter-card small {
  font-size: 11px;
  color: var(--text-light);
}

.quarter-card.success p { color: var(--success); }
.quarter-card.danger p { color: var(--danger); }

.bar-chart-wrapper {
  height: 280px;
  margin-bottom: 24px;
}

.chart-height {
  height: 280px;
}

/* Birthday Section */
.birthday-section {
  margin-bottom: 24px;
}

.birthday-card {
  /* background: var(--card); */
  border-radius: var(--radius);
  padding: 24px;
  border: 1px solid var(--border);
}

.birthday-card h3 {
  font-size: 18px;
  font-weight: 600;
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

/* Skeleton */
.skeleton-wrapper {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.skeleton-card {
  min-width: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius);
  padding: 20px;
}

.skeleton-label {
  width: 70%;
  height: 16px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 12px;
}

.skeleton-text {
  width: 50%;
  height: 12px;
  background: #e0e0e0;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 16px;
  }

  .content {
    padding: 0;
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .performers-grid {
    grid-template-columns: 1fr;
  }

  .pie-slider {
    flex-direction: column;
  }

  .chart-box {
    width: 100%;
  }

  .revenue-header {
    flex-direction: column;
  }

  .target-input input {
    width: 100%;
  }
}
</style>