<template>
  <div class="layout">
    <div class="main-content">
      <!-- Sidebar -->
      <Sidebar ref="sidebarRef" v-if="!isMobile || isSidebarVisible" />

      <!-- Main Content -->
      <section class="content" v-if="!isMobile || !isSidebarVisible">
        <!-- Header -->
        <div class="page-topbar">
          <div>
            <h1 class="page-title">Revenue & Financial Analytics</h1>
            <p class="page-subtitle">FY {{ financialYear }} Annual Target Tracking, Closed Orders & Company Performance</p>
          </div>
          <div class="topbar-actions">
            <button @click="$router.push('/dashboard')" class="btn-back">
              <i class="fas fa-arrow-left"></i>
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        <!-- Revenue Dashboard Grid -->
        <div class="analytics-container">
          
          <!-- Top KPI Summary Cards -->
          <div class="revenue-kpis-grid">
            <div class="kpi-card success">
              <div class="kpi-icon-wrap"><i class="fas fa-coins"></i></div>
              <div class="kpi-data">
                <span class="kpi-label">Total Revenue FY</span>
                <h3 class="kpi-val">₹ {{ totalRevenueFY.toLocaleString() }}</h3>
                <span class="kpi-hint">From closed sales orders</span>
              </div>
            </div>

            <div class="kpi-card info">
              <div class="kpi-icon-wrap"><i class="fas fa-bullseye"></i></div>
              <div class="kpi-data">
                <span class="kpi-label">Annual Target</span>
                <h3 class="kpi-val">₹ {{ yearlyTarget.toLocaleString() }}</h3>
                <div class="target-inline-edit">
                  <label>Adjust Target: ₹</label>
                  <input type="number" v-model.number="yearlyTarget" min="0" />
                </div>
              </div>
            </div>

            <div class="kpi-card warning">
              <div class="kpi-icon-wrap"><i class="fas fa-percentage"></i></div>
              <div class="kpi-data">
                <span class="kpi-label">Achievement</span>
                <h3 class="kpi-val">{{ overallAchievement }}%</h3>
                <span class="kpi-hint" :class="overallAchievement >= 70 ? 'text-good' : 'text-warn'">
                  {{ overallAchievement >= 70 ? 'On Track for Year End' : 'In Progress' }}
                </span>
              </div>
            </div>

            <div class="kpi-card primary">
              <div class="kpi-icon-wrap"><i class="fas fa-building"></i></div>
              <div class="kpi-data">
                <span class="kpi-label">Active Companies</span>
                <h3 class="kpi-val">{{ topCompanies.length }}</h3>
                <span class="kpi-hint">Top client revenue contributors</span>
              </div>
            </div>
          </div>

          <!-- Mid Section: Top Companies & Quarter Performance -->
          <div class="analytics-two-col">
            <!-- Top 5 Companies Breakdown -->
            <div class="analytics-card">
              <div class="card-header">
                <div>
                  <h3 class="card-title">Top 5 Companies by Closed Orders</h3>
                  <p class="card-subtitle">Major clients contributing to FY {{ financialYear }} revenue</p>
                </div>
                <span class="badge-pill">{{ topCompanies.length }} Companies</span>
              </div>

              <div class="companies-grid" v-if="topCompanies.length > 0">
                <div 
                  v-for="(company, index) in topCompanies" 
                  :key="company.name"
                  class="company-row"
                >
                  <div class="company-rank">{{ index + 1 }}</div>
                  <div class="company-main">
                    <div class="company-title-row">
                      <span class="company-name">{{ company.name }}</span>
                      <span class="company-revenue">₹ {{ company.revenue.toLocaleString() }}</span>
                    </div>
                    <div class="company-progress-track">
                      <div 
                        class="company-progress-bar"
                        :style="{ width: company.percentage + '%' }"
                        :class="getBarColor(index)"
                      ></div>
                    </div>
                    <div class="company-footer-row">
                      <span class="company-percent">{{ company.percentage }}% of top revenue</span>
                      <span class="company-orders-pill"><i class="fas fa-box"></i> {{ company.orderCount }} orders</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>No closed orders found for the current financial year</p>
              </div>
            </div>

            <!-- Quarter Performance & Target -->
            <div class="analytics-card">
              <div class="card-header">
                <div>
                  <h3 class="card-title">Quarterly Performance</h3>
                  <p class="card-subtitle">Progress across FY quarters</p>
                </div>
              </div>

              <div class="quarters-list">
                <div
                  v-for="q in ['Q1','Q2','Q3','Q4']"
                  :key="q"
                  class="quarter-box"
                  :class="quarterAnalytics[q].percent >= 100 ? 'status-met' : 'status-progress'"
                >
                  <div class="q-header">
                    <span class="q-badge">{{ q }}</span>
                    <span class="q-status">
                      {{ quarterAnalytics[q].percent >= 100 ? 'Met' : quarterAnalytics[q].percent + '%' }}
                    </span>
                  </div>
                  <div class="q-amount">₹ {{ quarterAnalytics[q].revenue.toLocaleString() }}</div>
                  <div class="q-progress-bar">
                    <div class="q-progress-fill" :style="{ width: Math.min(quarterAnalytics[q].percent, 100) + '%' }"></div>
                  </div>
                  <span class="q-target-hint">Target: ₹ {{ (monthlyTargetData['April'] * 3).toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Section: Monthly Chart & Cumulative Chart -->
          <div class="analytics-two-col charts-row">
            <div class="analytics-card chart-card">
              <div class="card-header">
                <h3 class="card-title">Monthly Closed Revenue Breakdown</h3>
              </div>
              <div class="chart-canvas-wrapper">
                <canvas id="monthlyRevenueBarChart"></canvas>
              </div>
            </div>

            <div class="analytics-card chart-card">
              <div class="card-header">
                <h3 class="card-title">Cumulative Revenue vs. Target</h3>
              </div>
              <div class="chart-canvas-wrapper">
                <canvas id="cumulativeChart"></canvas>
              </div>
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
import Chart from "chart.js/auto"

export default {
  name: 'RevenueAnalytics',
  components: { Sidebar },
  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      yearlyTarget: Number(localStorage.getItem('yearlyTarget')) || 77000000,
      monthlyRevenueData: {},
      topCompanies: [],
      chartRevenueInstance: null,
      cumulativeChartInstance: null,
      months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    }
  },
  watch: {
    yearlyTarget(val) {
      localStorage.setItem('yearlyTarget', val)
      this.$nextTick(() => {
        this.renderRevenueBarChart()
        this.renderCumulativeChart()
      })
    }
  },
  computed: {
    financialYear() {
      const today = new Date()
      const year = today.getFullYear()
      const month = today.getMonth() + 1
      if (month >= 4) return `${year}-${(year + 1).toString().slice(-2)}`
      return `${year - 1}-${year.toString().slice(-2)}`
    },
    totalRevenueFY() {
      return Object.values(this.monthlyRevenueData).reduce((a, b) => a + b, 0)
    },
    overallAchievement() {
      if (!this.yearlyTarget) return 0
      return Math.round((this.totalRevenueFY / this.yearlyTarget) * 100)
    },
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
    }
  },
  methods: {
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },
    getBarColor(index) {
      const colors = ['bar-primary', 'bar-blue', 'bar-amber', 'bar-purple', 'bar-slate']
      return colors[index % colors.length] || 'bar-primary'
    },
    async fetchMonthlyRevenueData() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/graph/monthly-revenue', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const apiData = response.data || []
        const fyMonths = ['April','May','June','July','August','September','October','November','December','January','February','March']
        this.monthlyRevenueData = {}
        fyMonths.forEach(m => { this.monthlyRevenueData[m] = 0 })

        apiData.forEach(item => {
          const monthIndex = parseInt(item.month) - 1
          const monthName = this.months[monthIndex]
          if (monthName && this.monthlyRevenueData[monthName] !== undefined) {
            this.monthlyRevenueData[monthName] = parseFloat(item.total_revenue) || 0
          }
        })
      } catch (err) {
        console.error("Error fetching revenue:", err)
        const fyMonths = ['April','May','June','July','August','September','October','November','December','January','February','March']
        this.monthlyRevenueData = {}
        fyMonths.forEach(m => { this.monthlyRevenueData[m] = 0 })
      }
    },
    async fetchTopCompanies() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/graph/top-companies', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const data = response.data || []
        if (data.length === 0) {
          this.topCompanies = []
          return
        }
        const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0)
        this.topCompanies = data.map(item => ({
          name: item.company_name || 'Unknown',
          revenue: parseFloat(item.total_revenue) || 0,
          orderCount: parseInt(item.order_count) || 0,
          percentage: totalRevenue > 0 ? Math.round((parseFloat(item.total_revenue) / totalRevenue) * 100) : 0
        }))
      } catch (err) {
        console.error("Error fetching top companies:", err)
        this.topCompanies = []
      }
    },
    renderRevenueBarChart() {
      const ctx = document.getElementById('monthlyRevenueBarChart')
      if (!ctx) return
      if (this.chartRevenueInstance) this.chartRevenueInstance.destroy()

      const monthsFY = ['April','May','June','July','August','September','October','November','December','January','February','March']
      const actualRevenue = monthsFY.map(m => this.monthlyRevenueData[m] || 0)
      const targetRevenue = monthsFY.map(m => this.monthlyTargetData[m] || 0)

      this.chartRevenueInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: monthsFY,
          datasets: [
            {
              label: 'Actual Revenue',
              data: actualRevenue,
              backgroundColor: '#0d9488',
              borderRadius: 6
            },
            {
              label: 'Target',
              data: targetRevenue,
              backgroundColor: '#e2e8f0',
              borderRadius: 6
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
                label: ctx => ` ₹ ${ctx.raw.toLocaleString()}`
              }
            }
          },
          scales: {
            y: {
              ticks: {
                callback: v => {
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
              borderDash: [5, 5],
              tension: 0.35,
              fill: false
            },
            {
              label: 'Cumulative Closed Revenue',
              data: cumulativeData.map(d => d.cumRevenue),
              borderColor: '#0d9488',
              backgroundColor: 'rgba(13, 148, 136, 0.12)',
              fill: true,
              tension: 0.35
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
                label: ctx => ` ₹ ${ctx.raw.toLocaleString()}`
              }
            }
          },
          scales: {
            y: {
              ticks: {
                callback: v => {
                  if (v >= 10000000) return `₹ ${(v / 10000000).toFixed(1)} Cr`
                  if (v >= 100000) return `₹ ${(v / 100000).toFixed(1)} L`
                  return `₹ ${v.toLocaleString()}`
                }
              }
            }
          }
        }
      })
    }
  },
  async mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    await Promise.all([this.fetchMonthlyRevenueData(), this.fetchTopCompanies()])
    this.$nextTick(() => {
      this.renderRevenueBarChart()
      this.renderCumulativeChart()
    })
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

.layout {
  display: flex;
  flex-direction: column;
  background: var(--bg-app, #f8fafc);
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #0f172a;
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
}

/* Page Topbar */
.page-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px;
}

.page-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: #f1f5f9;
  color: #0f172a;
}

/* KPIs Grid */
.revenue-kpis-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.kpi-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.kpi-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.kpi-card.success .kpi-icon-wrap { background: #ecfdf5; color: #059669; }
.kpi-card.info .kpi-icon-wrap { background: #eff6ff; color: #2563eb; }
.kpi-card.warning .kpi-icon-wrap { background: #fffbeb; color: #d97706; }
.kpi-card.primary .kpi-icon-wrap { background: #f0fdfa; color: #0d9488; }

.kpi-data {
  flex: 1;
  min-width: 0;
}

.kpi-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  display: block;
}

.kpi-val {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 19px;
  font-weight: 700;
  color: #0f172a;
  margin: 3px 0;
}

.kpi-hint {
  font-size: 11px;
  color: #94a3b8;
  display: block;
}

.text-good { color: #059669 !important; font-weight: 600; }
.text-warn { color: #d97706 !important; font-weight: 600; }

.target-inline-edit {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 11px;
  color: #64748b;
}

.target-inline-edit input {
  padding: 3px 6px;
  font-size: 11px;
  width: 110px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  outline: none;
}

/* Two Column Layout */
.analytics-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.analytics-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 14.5px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px;
}

.card-subtitle {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.badge-pill {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 6px;
}

/* Companies Grid */
.companies-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.company-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}

.company-rank {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #e2e8f0;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.company-main {
  flex: 1;
  min-width: 0;
}

.company-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.company-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.company-revenue {
  font-size: 12.5px;
  font-weight: 700;
  color: #0f172a;
}

.company-progress-track {
  height: 5px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.company-progress-bar {
  height: 100%;
  border-radius: 4px;
}

.bar-primary { background: #0d9488; }
.bar-blue { background: #3b82f6; }
.bar-amber { background: #f59e0b; }
.bar-purple { background: #8b5cf6; }
.bar-slate { background: #64748b; }

.company-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #64748b;
}

.company-orders-pill {
  font-size: 10.5px;
  background: #ffffff;
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

/* Quarters List */
.quarters-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.quarter-box {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  padding: 12px;
}

.q-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.q-badge {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
}

.q-status {
  font-size: 11px;
  font-weight: 600;
  color: #059669;
}

.quarter-box.status-progress .q-status {
  color: #d97706;
}

.q-amount {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
}

.q-progress-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.q-progress-fill {
  height: 100%;
  background: #0d9488;
  border-radius: 4px;
}

.q-target-hint {
  font-size: 10.5px;
  color: #94a3b8;
}

/* Charts */
.charts-row {
  margin-bottom: 0;
}

.chart-card {
  min-height: 280px;
}

.chart-canvas-wrapper {
  height: 220px;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #94a3b8;
  font-size: 13px;
}

.empty-state i {
  font-size: 24px;
  margin-bottom: 6px;
}

/* Responsive */
@media (max-width: 1024px) {
  .revenue-kpis-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .analytics-two-col {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 12px;
  }
  .revenue-kpis-grid {
    grid-template-columns: 1fr;
  }
}
</style>
