<template>
  <div class="layout">
    <!-- Header -->
    <header class="header">
   <div class="head-title"><a href="https://employees.archenterprises.co.in/">
        <img
          src="https://archenterprises.co.in/ajay/ajay.png"
          style="height: 65px;"
          alt="Logo"
        />
         </a>
         🅰️RCH360⚙️
     
      </div>
      <i class="fas fa-bars mobile-menu-icon" @click="toggleSidebar" v-if="isMobile"></i>
    </header>

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
    

    <!-- Scrollable Card Section -->
    <div class="dashboard-slider" ref="slider">
      <!-- Left Arrow -->
    <!-- <button class="scroll-arrow left" @click="scrollLeft">
      <i class="fas fa-chevron-left"></i>
    </button> -->
      <div class="dashboard-card clickable-card temp" @click="goTo('employees')">
        <div>
          <p class="label label-emp">Employees 👨🏻‍💼</p>
          <p class="tagline">Manage all employees</p>
        </div>
      </div>
       <div class="dashboard-card clickable-card leavetype" @click="goTo('Customerregistration')">
        <div>
          <p class="label label-cust">CRM 🤝</p>
          <p class="tagline">Our clients and PO</p>
        </div>
      </div>

      <div class="dashboard-card clickable-card attendance" @click="goTo('empattendanceadmin')">
        <div>
          <p class="label label-att">Attendance 🗓️</p>
          <p class="tagline">Track employee check-ins</p>
        </div>
      </div>

      <div class="dashboard-card clickable-card announcement" @click="goTo('announcement')">
        <div>
          <p class="label label-ann">Announcement 📢</p>
          <p class="tagline">Share news & updates</p>
        </div>
      </div>

      <div class="dashboard-card clickable-card dept" @click="goTo('managedepartments')">
        <div>
          <p class="label label-dept">Departments 🏛️</p>
          <p class="tagline">Organize teams and roles</p>
        </div>
      </div>

      <div class="dashboard-card clickable-card Leaves" @click="goToLeaveApplications">
        <div>
          <p class="label label-leave">Leave Applications 🏖️</p>
          <p class="tagline">Review and approve requests</p>
        </div>
      </div>

     
     <!-- Right Arrow -->
    <!-- <button class="scroll-arrow right" @click="scrollRight">
      <i class="fas fa-chevron-right"></i>
    </button> -->
    </div>

   
  </div>

        <!-- Common Month Switcher -->
        <div
          class="month-switcher"
          style="display: flex; justify-content: center; align-items: center; margin-top: 30px; gap: 12px; background: #fff; padding: 8px 16px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"
        >
          <button
            @click="prevMonth"
            style="background: #f7f7f7; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 18px; font-weight: bold; color: #555; display: flex; align-items: center; justify-content: center; transition: all 0.3s;"
            @mouseover="hover=true"
            @mouseleave="hover=false"
            :style="{ background: hover ? '#e0e0e0' : '#f7f7f7' }"
          >
            ‹
          </button>

          <span style="font-size: 16px; font-weight: 600; color: #427172; min-width: 80px; text-align: center;">
            {{ selectedMonthName }}
          </span>

          <button
            @click="nextMonth"
            style="background: #f7f7f7; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 18px; font-weight: bold; color: #555; display: flex; align-items: center; justify-content: center; transition: all 0.3s;"
            @mouseover="hoverNext=true"
            @mouseleave="hoverNext=false"
            :style="{ background: hoverNext ? '#e0e0e0' : '#f7f7f7' }"
          >
            ›
          </button>
        </div>

        <!-- Pie Charts Row -->
        <div class="pie-slider-wrapper">
  <div class="pie-slider">

          <div
            v-for="(chartData, index) in pieChartsData"
            :key="index"
            class="chart-box"
            style="flex: 1 1 220px; background: white; padding: 10px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: relative;"
          >
            <h4 style="font-size: 14px; margin-bottom: 8px;">{{ chartData.title }}</h4>
            <canvas :id="chartData.canvasId" style="width: 100%; height: 180px;"></canvas>
            <div class="task-details" style="margin-top: 8px;">
              <div
                v-for="(value, label) in chartData.tasks"
                :key="label"
                style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 12px;"
              >
                <span>{{ label }}</span>
                <span>{{ value }}</span>
              </div>
            </div>
            </div>
          </div>
        </div>

       <!-- Monthly Revenue Row -->
<div class="monthly-revenue-row" style="margin-top: 30px;">
  <div
    class="bar-chart-container"
    style="width: 100%; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
  >
    <h3>Revenue {{ financialYear }}</h3>


    <canvas
      id="monthlyRevenueBarChart"
      style="max-width: 100%; height: 90px;"
    ></canvas>
  </div>
</div>




        <!-- 🎂 Birthday Reminder Section -->
        <div class="birthday-section" style="margin-top: 40px;">
          <div
            class="birthday-card"
            style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
          >
            <h3 style="font-size: 18px; margin-bottom: 16px;">
              🎉 Birthday Reminder - {{ months[new Date().getMonth()] }}
            </h3>

            <div
              v-if="birthdays.length > 0"
              style="display: flex; flex-wrap: wrap; gap: 15px;"
            >
              <div
                v-for="(emp, index) in birthdays"
                :key="index"
                class="employee-birthday-card"
                style="flex: 1 1 220px; background: #f9f9ff; border-radius: 10px; padding: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.08); transition: all 0.3s;"
              >
                <img
                  :src="emp.photo || 'https://img.icons8.com/color/48/000000/user-male-circle.png'"
                  alt="Employee"
                  style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;"
                />
                <div>
                  <p style="font-weight: 600; color: #427172;">{{ emp.name }}</p>
                  <p style="font-size: 13px; color: #777;">🎂 {{ formatBirthday(emp.dateofbirth) }}</p>
                  <p style="font-size: 13px; color: #999;">{{ emp.department || '—' }}</p>
                </div>
              </div>
            </div>

            <p v-else style="color: #666; text-align: center; font-style: italic;">
              No birthdays this month 🎈
            </p>
          </div>
        </div>
        <!-- 🎂 End Birthday Section -->
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'
// import { Chart, registerables } from 'chart.js'
import Chart from "chart.js/auto";
import { onMounted, ref } from "vue";
// Chart.register(...registerables)


export default {
  
  name: 'Dashboard',
  components: { Sidebar },
  data() {
    return {
      hover: false,
      hoverNext: false,
      currentMonth: '',
      isMobile: false,
      isSidebarVisible: true,
      selectedMonth: new Date().getMonth(),
      selectedYear: new Date().getFullYear(),
      months: [
        'January','February','March','April','May','June',
        'July','August','September','October','November','December'
      ],
      totalEmployees: 0,
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
        totalRevenue: '₹ 3,25,000'
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
      birthdays: [] 
    }
  },
  computed: {
    selectedMonthName() {
    return `${this.months[this.selectedMonth]} ${this.selectedYear}`
  },

  financialYear() {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1 // Jan = 1

    // Financial year starts in April
    if (month >= 4) {
      return `${year}-${(year + 1).toString().slice(-2)}`
    } else {
      return `${year - 1}-${year.toString().slice(-2)}`
    }
  },
    selectedMonthName() {
      return `${this.months[this.selectedMonth]} ${this.selectedYear}`
    }
  },
  methods: {
  scrollLeft() {
      const slider = this.$refs.slider;
      slider.scrollBy({ left: -300, behavior: 'smooth' });
    },
    scrollRight() {
      const slider = this.$refs.slider;
      slider.scrollBy({ left: 300, behavior: 'smooth' });
    },
    /** ✅ Update dashboard for selected month */
    async updateDashboardForSelectedMonth() {
  const month = this.selectedMonth + 1
  const year = this.selectedYear

  try {
    const [
      pendingRes,
      completedRes,
      serviceRes,
      materialRes,
      visitRes
    ] = await Promise.allSettled([
      axios.get('https://employees.archenterprises.co.in/api/api/tasks/pending-count', {
        params: { month, year, filter_by: 'updated_at' }
      }),
      axios.get('https://employees.archenterprises.co.in/api/api/tasks/completed-count', {
        params: { month, year, filter_by: 'updated_at' }
      }),
      axios.get('https://employees.archenterprises.co.in/api/api/service-assign/status-count'),
      // ✅ Fetch material orders from the correct table with your logic
      axios.get('https://employees.archenterprises.co.in/api/api/material-orders-supply-status', {
        params: { month, year } // optional if you want month filter
      }),
      axios.get('https://employees.archenterprises.co.in/api/api/visit-assign/status-count')
    ])

    const getData = (res, field) =>
      res.status === 'fulfilled' && res.value?.data?.[field]
        ? res.value.data[field]
        : 0

    this.tasksRecorder.pendingTasks = getData(pendingRes, 'pendingTasks') || getData(pendingRes, 'pending')
    this.tasksRecorder.completedTasks = getData(completedRes, 'completedTasks') || getData(completedRes, 'completed')

    this.tasksRecorder.ordersPending = getData(serviceRes, 'pending')
    this.tasksRecorder.ordersCompleted = getData(serviceRes, 'completed')

    // ✅ New logic for Material Orders Status
    if (materialRes.status === 'fulfilled' && materialRes.value?.data) {
      this.tasksRecorder.materialOrdersCompleted = materialRes.value.data.completed || 0
      this.tasksRecorder.materialOrdersPending = materialRes.value.data.pending || 0
    } else {
      this.tasksRecorder.materialOrdersCompleted = 0
      this.tasksRecorder.materialOrdersPending = 0
    }

    this.tasksRecorder.pendingVisits = getData(visitRes, 'pending')
    this.tasksRecorder.completedVisits = getData(visitRes, 'completed')

    this.generateMonthlyRevenue()
    this.updatePieCharts()
    this.renderRevenueBarChart()

    this.currentMonth = `${this.months[this.selectedMonth]} ${this.selectedYear}`
  } catch (err) {
    console.error('Error fetching dashboard data:', err)
  }
},


    prevMonth() {
      if (this.selectedMonth === 0) {
        this.selectedMonth = 11
        this.selectedYear--
      } else {
        this.selectedMonth--
      }
      this.updateDashboardForSelectedMonth()
    },
    nextMonth() {
      if (this.selectedMonth === 11) {
        this.selectedMonth = 0
        this.selectedYear++
      } else {
        this.selectedMonth++
      }
      this.updateDashboardForSelectedMonth()
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

async generateMonthlyRevenue() {
  try {
    const response = await axios.get(
      'https://employees.archenterprises.co.in/api/api/graph/monthly-revenue'
    )

    const data = response.data || []
    this.monthlyRevenueData = {}

    // Months Jan–Dec
    this.months.forEach((monthName, index) => {
      const found = data.find(
        d => Number(d.month) === index + 1
      )
      this.monthlyRevenueData[monthName] =
        found ? Number(found.total_revenue) : 0
    })

    // ✅ Draw chart AFTER data is ready
    this.$nextTick(() => {
      this.renderRevenueBarChart()
    })

  } catch (err) {
    console.error("Error fetching monthly revenue:", err)
  }
},



    renderRevenueBarChart() {
      const ctx = document.getElementById('monthlyRevenueBarChart')
      if (!ctx) return
      if (this.chartRevenueInstance) this.chartRevenueInstance.destroy()

      const months = Object.keys(this.monthlyRevenueData)
      const revenueValues = Object.values(this.monthlyRevenueData)

      this.chartRevenueInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Revenue (₹)',
              data: revenueValues,
              backgroundColor: '#4ECDC4',
              borderRadius: 10
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 50000 } },
            x: { ticks: { color: '#333' } }
          },
          plugins: { legend: { display: false } }
        }
      })
    },

    updatePieCharts() {
      this.pieChartsData = [
        {
          title: 'Tasks Status',
          canvasId: 'tasksPieChart1',
          tasks: {
            'Pending Tasks': this.tasksRecorder.pendingTasks,
            'Completed Tasks': this.tasksRecorder.completedTasks
          }
        },
        {
          title: 'Service Orders Status',
          canvasId: 'tasksPieChart2',
          tasks: {
            'Service Orders Pending': this.tasksRecorder.ordersPending,
            'Service Orders Completed': this.tasksRecorder.ordersCompleted
          }
        },
        {
          title: 'Material Orders Status',
          canvasId: 'tasksPieChart3',
          tasks: {
            'Pending Material Orders': this.tasksRecorder.materialOrdersPending,
            'Completed Material Orders': this.tasksRecorder.materialOrdersCompleted
          }
        },
        {
          title: 'Visits Status',
          canvasId: 'tasksPieChart4',
          tasks: {
            'Pending Visits': this.tasksRecorder.pendingVisits,
            'Completed Visits': this.tasksRecorder.completedVisits
          }
        }
      ]

      this.chartInstances.forEach(chart => chart.destroy())
      this.chartInstances = []

      this.$nextTick(() => {
        this.pieChartsData.forEach(chartData => {
          const labels = Object.keys(chartData.tasks || {})
          const values = Object.values(chartData.tasks || {}).map(v => Number(v) || 0)

          let finalLabels = labels
          let finalValues = values
          if (finalValues.every(v => v === 0)) {
            finalLabels = ['No data']
            finalValues = [1]
          }

          const bgColors = finalLabels.map(l => this.colors[l] || '#d3d3d3')

          const canvasEl = document.getElementById(chartData.canvasId)
          if (!canvasEl) return

          const ctx = canvasEl.getContext('2d')
          const chart = new Chart(ctx, {
            type: 'pie',
            data: {
              labels: finalLabels,
              datasets: [
                {
                  data: finalValues,
                  backgroundColor: bgColors,
                  borderColor: '#fff',
                  borderWidth: 2
                }
              ]
            },
            options: {
              responsive: true,
              plugins: {
                legend: { position: 'bottom' }
              },
              // ✅ ADD CLICK EVENT HERE
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const clickedLabel = chart.data.labels[index];

        // 🎯 When clicking "Pending Tasks"
        if (
          chartData.title === 'Tasks Status' &&
          clickedLabel === 'Pending Tasks'
        ) {
          window.location.href =
            'https://employees.archenterprises.co.in/workreport';
        }
      }
    }
      
            }
          })

          this.chartInstances.push(chart)
        })
      })
    },

    /** 🎂 Fetch birthdays */
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
    }
  },

  mounted() {
    const now = new Date()
    this.currentMonth = `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)

    axios.get('https://employees.archenterprises.co.in/api/api/total-employees')
      .then(response => { this.totalEmployees = response.data.count })
      .catch(err => console.error(err))

    this.generateMonthlyRevenue()
    this.$nextTick(() => {
   
      this.updateDashboardForSelectedMonth()
      this.fetchBirthdayReminders() // 🎂 Fetch birthdays
    })
  }
}
</script>


<style scoped>

@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

.head-title{
      color: white;
    display: flex;
    font-size: 17px;
    gap: 7px;
    text-decoration: none;
    align-items: center;
}
.dashboard-slider-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.dashboard-slider {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 10px;

}


.dashboard-card {
  min-width: 220px;
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}
.dashboard-card:hover {
  transform: scale(1.05);
}

.scroll-arrow {
  background: #08245c!important;
  border: none;
  color: white;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  cursor: pointer;
  font-size: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.scroll-arrow.left {
  left: 10px;
}
.scroll-arrow.right {
  right: 10px;
}
.scroll-arrow:hover {
  background: rgba(0, 0, 0, 0.8);
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-card {
    min-width: 180px;
    padding: 15px;
  }
  .scroll-arrow {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
}
.button-7 {
  background-color: #0095ff;
  border: 1px solid transparent;
  border-radius: 8px;
  box-shadow: rgba(255, 255, 255, .4) 0 1px 0 0 inset;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  display: inline-block;
  font-family: -apple-system,system-ui,"Segoe UI","Liberation Sans",sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.15385;
  margin: 6px;
  outline: none;
  padding: 8px .8em;
  position: relative;
  text-align: center;
  text-decoration: none;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: baseline;
  white-space: nowrap;
}

.button-7:hover,
.button-7:focus {
  background-color: #07c;
}

.button-7:focus {
  box-shadow: 0 0 0 4px rgba(0, 149, 255, .15);
}

.button-7:active {
  background-color: #0064bd;
  box-shadow: none;
}
.dashboard-slider-container {
  width: 100%;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 20px 0;

}

.dashboard-slider {
  display: flex;
  gap: 20px;
  padding: 10px 20px;
  transition: transform 0.5s ease;
}
.dashboard-slider {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 10px;

}

.scroll-arrow {
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  cursor: pointer;
  font-size: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.scroll-arrow.left {
  left: 10px;
}
.scroll-arrow.right {
  right: 10px;
}
.scroll-arrow:hover {
  background: rgba(0, 0, 0, 0.8);
}
.dashboard-card {
  flex: 0 0 250px;
  height: 150px;
  background: linear-gradient(135deg, #f8fafc, #e0e7ff);
  border-radius: 20px;
  /* box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); */
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
}

.dashboard-card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.dashboard-card img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.label {
  font-weight: 700;
  font-size: 1.1rem;
  color: #1e293b;
}

.tagline {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 4px;
}

/* Optional: Add gradient backgrounds for variety */
.label-emp { color: #2563eb; }
.label-dept { color: #7c3aed; }
.label-leave { color: #16a34a; }
.label-cust { color: #ea580c; }
.label-att { color: #0ea5e9; }
.label-ann { color: #f43f5e; }

/* Responsive for small screens */
@media (max-width: 768px) {
  .dashboard-card {
    flex: 0 0 200px;
    height: 130px;
    padding: 15px;
  }
  .dashboard-slider {
    gap: 15px;
  }
}
.layout {
  display: flex;
  flex-direction: column;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo-img {
  /* width: 40px; */
  height: 40px;
}
.company-name {
  font-size: 18px;
  font-weight: 600;
}
.dashboard-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}
.dashboard-card {
  flex: 1 1 200px;
  background: #fff;
  padding: 15px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s;
  cursor: pointer;
}
.dashboard-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
@media (max-width: 768px) {
  .dashboard-row {
    flex-direction: column;
  }
}
/* Header */
.header {
  font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, .3);
 background-color: cadetblue; 
  color: white;
  padding: 8px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15); */
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-img {
 
  border-radius: 50%; /* Rounded logo */

  /* transition: transform 0.3s ease; */
}


.company-name {
  font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
}

.mobile-menu-icon {
  font-size: 20px;
  cursor: pointer;
  transition: color 0.3s ease, transform 0.3s ease;
}

.mobile-menu-icon:hover {
  color: #ffdd57;
  transform: scale(1.2);
}

.dashboard-card {
  position: relative;
  background-color: #ffffff !important;
  overflow: hidden;
  border: none !important;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  text-align: center;
  padding: 20px 10px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dashboard-card::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  z-index: 0;
}

.temp::after { background-color: #ffd500; }
.Leaves::after { background-color: #e43f3f; }
.attendance::after { background-color: #3491f5; }
.dept::after { background-color: #5b9644; }
.leavetype::after { background-color: #da6bc6; }
.announcement::after { background-color: #d8d34a; }

.dashboard-card * {
  position: relative;
  z-index: 1;
}

.dashboard-card img {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
}

.label {
  font-size: 16px;
  font-weight: 600;
  color: #427172;
  margin-bottom: 4px;
}

/* ✨ tagline styling */
.tagline {
  font-size: 13px;
  font-family: sans-serif;
  color: #ffffff;
  background: #ffffff00;
  border-radius: 6px;
  /* padding: 9px 22px; */
  display: inline-block;
  margin-top: 6px;
  margin-top: 20px;
  font-style: italic;
  top: 28px;
  left: 14px;
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

.dashboard-card {
  position: relative;
  background-color: #ffffff !important;
  overflow: hidden;
  border: none !important;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dashboard-card::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30%; /* Half of the card height */
  z-index: 0;
  transition: height 0.3s ease;
}

/* Each color variant */
.temp::after {
  background-color: #001bff; /* Yellow */
}
.Leaves::after {
  background-color: #ff0000; /* Red */
}
.attendance::after {
  background-color: #035858; /* Blue */
}
.dept::after {
  background-color: #34ba00; /* Green */
}
.leavetype::after {
  background-color: #ff00d1; /* Pink */
}
.announcement::after {
  background-color: #ff9100; /* Yellowish */
}

/* Make content appear above the colored background */
.dashboard-card * {
  position: relative;
  z-index: 1;
}

/* Optional: hover effect */
.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

.layout {
  display: flex;
  flex-direction: column;
  background: #f4f6f8;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-img {
  height: 70px;
}
.app-title {
  font-size: 18px;
  font-weight: 600;
  color: #427172;
  letter-spacing: 0.5px;
}
.mobile-menu-icon {
  font-size: 22px;
  cursor: pointer;
  color: #427172;
}

/* Dashboard */
.dashboard-content {
  flex: 1;
  padding: 30px;
}

/* Cards Row */
.cards-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}
.dashboard-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  /* box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05); */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.dashboard-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}
.dashboard-card i {
  font-size: 28px;
  color: #518587;
}
.card-info h3 {
  font-size: 15px;
  font-weight: 600;
  color: #555;
}
.card-info p {
  font-size: 20px;
  font-weight: 700;
  color: #222;
}

/* Tasks Recorder */
.tasks-recorder-box {
  background: #fff;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}
.task-item {
  margin-bottom: 15px;
}
.task-label {
  display: flex;
  justify-content: space-between;
  font-weight: 500;
  color: #555;
}
.progress-bar {
  width: 100%;
  background: #eee;
  border-radius: 12px;
  height: 8px;
  margin-top: 5px;
}
.progress-fill {
  height: 100%;
  bbackground-color: #5f9ea0;
  border-radius: 12px;
  transition: width 0.4s ease;
}

/* Charts Section */
.charts-section {
  background: #fff;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}
.charts-section h3 {
  margin-bottom: 20px;
  color: #427172;
  font-weight: 600;
}
.bar-chart-container {
  margin-top: 40px;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-content {
    padding: 15px;
  }
}
.month-name {
  color: #0078d7;
  font-weight: 600;
}
.revenue-item .task-label {
  font-weight: bold;
  font-size: 1rem;
  color: #427172;
  margin-top: 8px;
}
.task-item {
  margin-bottom: 20px;
}

.task-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-weight: 600;
  color: #427172;
}

.progress-bar {
  width: 100%;
  height: 14px;
  background-color: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
}

/* Wrap Tasks Recorder and Chart side-by-side */
.tasks-chart-row {
  display: flex
;
    justify-content: space-around;
    align-items: flex-start;
    gap: 20px;
    margin-top: 40px;
    flex-wrap: wrap;
    align-content: space-between;
    flex-direction: row-reverse;
}

/* Tasks Recorder Box */
.tasks-recorder-box {
  flex: 1 1 33%; /* grow and shrink, default 60% width */
  padding: 25px;
  background: #ffffff00;
  border-radius: 15px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0);
  display: flex;
  flex-direction: column;
  justify-content: center; /* center content vertically */
}

/* Chart Container */
.chart-container {
  flex: 1 1 35%; /* grow and shrink, default 35% width */
  background: #ffffff00;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center; /* center chart vertically */
  align-items: center; /* center chart horizontally */
}


/* ✅ Smaller Pie Chart */
.chart-container canvas {
  max-width: 450px;
  max-height: 450px;
  margin: 0 auto;
}

/* ✅ Responsive Behavior (Stack on Mobile) */
@media (max-width: 768px) {
  .tasks-chart-row {
    flex-direction: column;
  }
  .tasks-recorder-box, .chart-container {
    flex: 1 1 100%;
    width: 100%;
  }
  .chart-container canvas {
    max-width: 280px;
    max-height: 280px;
  }
}

.chart-container {
  background: #ffffff00;
  border-radius: 10px;
  padding: 20px;
  margin: 25px auto;
  width: 90%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0);
  text-align: center;
}

.chart-container h3 {
  margin-bottom: 15px;
  color: #427172;
}

.tasks-recorder-box {
  background: #fdfdfd00;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0);
  margin-top: 30px;
}

.task-data {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: space-around;
  margin-top: 10px;
}

.task-item {
  background: #fafafa;
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
/* ✅ Tasks Recorder Section */
.tasks-recorder-box {
  margin-top: 40px;
  padding: 25px;
  background: #ffffff00;
  border-radius: 15px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0);
}

.tasks-recorder-box h3 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 20px;
  color: #518587;
  font-weight: 700;
}

.task-data {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 10px 30px;
}

.task-item {
  background: #f8f9fb;
  padding: 14px 18px;
  border-radius: 10px;
  font-size: 16px;
  color: #427172;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.task-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .task-data {
    padding: 5px 10px;
  }
  .task-item {
    font-size: 15px;
    padding: 10px;
  }
}

.main-content {
  display: flex;
  flex: 1;
  padding: 30px;
  gap: 20px;
}

.content {
  padding: 40px;
  background-color: #f4f6f9;
  font-family: math;
}

.mobile-menu-icon {
  font-size: 22px;
  margin-left: 10px;
  cursor: pointer;
  display: none;
}

@media (max-width: 768px) {
  .mobile-menu-icon {
    display: inline-block;
  }
}
.wave-chart-box {
  margin-top: 40px;
  padding: 25px;
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
}

.wave-chart-box h3 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 18px;
  color: #427172;
}
.dashboard-card{
   background-color: #aedbe782;
    /* box-shadow: 3px 3px #968e8e !important; */

}

.temp{
  background-color: #ffffff !important;
    /* box-shadow: 3px 3px #968e8e !important; */
    border-bottom: 22px solid #ffd500;
}
.Leaves{
   background-color: #ffffff !important;
    /* box-shadow: 3px 3px #968e8e !important; */
    border-bottom: 22px solid #e43f3f;
}
.attendance{
   background-color: #ffffff !important;
    /* box-shadow: 3px 3px #968e8e !important; */
    border-bottom: 22px solid #3491f5;
}
.dept{
background-color: #ffffff !important;
    /* box-shadow: 3px 3px #968e8e !important; */
    border-bottom: 22px solid #5b9644;
}
.leavetype{
background-color: #ffffff !important;
    /* box-shadow: 3px 3px #968e8e !important; */
    border-bottom: 22px solid #da6bc6;
    
}
.announcement{
     background-color: #ffffff !important;
    /* box-shadow: 3px 3px #968e8e !important; */
    border-bottom: 22px solid #d8d34a;


}


.mobile-menu-icon {
  font-size: 22px;
  margin-left: 10px;
  cursor: pointer;
  display: none;
}

@media (max-width: 768px) {
  .mobile-menu-icon {
    display: inline-block;
  }

  .sidebar {
    position: absolute;
    z-index: 1000;
    width: 240px;
    height: 100vh;
    background-color: #2c3e50;
  }

  .expanded-content {
    margin-left: 0 !important;
    transition: margin 0.3s ease-in-out;
  }
}

/* Main content default (desktop view) */
.main-content {
  display: flex;
  flex: 1;
  padding: 30px;
  gap: 20px;
}

/* Stack sidebar and content vertically on small screens */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 15px;
  }
  .layout{
    align-self: anchor-center;

  }

  .sidebar {
    width: 100%;
    margin-bottom: 20px;
  }

  .content {
    padding: 20px;
  }
 
}

.content {
  padding: 40px;
  background-color: #f4f6f9;
  /* font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; */
}

.dashboard-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 30px;
  color: #427172;
  text-align: center;
}

.dashboard-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.dashboard-card {
 /* background: lightblue url("https://png.pngtree.com/thumb_back/fh260/background/20220316/pngtree-download-background-biru-polos-hd-dan-keren-untuk-desain-ppt-image_1067745.jpg");  */
    border-radius: 10px;
    padding: 0px 0px;
    display: flex;
    /* box-shadow: rgb(0 0 0 / 26%) 1px 0px 12px 0px, rgba(0, 0, 0, 0.05) 0px 2px 2px -1px; */
;
  
    gap: 15px;
    /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); */
    transition: 0.3s ease;
    min-width: 260px;
    max-width: 280px;
    flex: 1 1 250px;
}

.dashboard-card:hover {
 /* background-color: #aedbe7 !important; */
    /* box-shadow: 3px 3px #007bff87 !important; */
  transform: translateY(-4px);
  cursor: pointer;
  /* background: lightblue url("https://png.pngtree.com/thumb_back/fh260/background/20220316/pngtree-download-background-biru-polos-hd-dan-keren-untuk-desain-ppt-image_1067745.jpg");  */
}

.dashboard-card img {
  width: 48px;
  height: 48px;
  margin-left: 8px;
}

.label-emp {
  left: 50px;
  font-size: 21px;
  font-weight: 500;
  margin-bottom: 5px;
  color: #001bff;
}

.label-dept {
  left: 54px;
  font-size: 21px;
  font-weight: 500;
  margin-bottom: 5px;
  color: #1f6a02;
}
.label-ann {
  left: 40px;
  font-size: 21px;
  font-weight: 500;
  margin-bottom: 5px;

  color: #cc7605;
}

.label-att {
  left: 58px;
  font-size: 21px;
  font-weight: 500;
  margin-bottom: 5px;
  color: #035858;
}
.label-leave {
  left: 34px;
  font-size: 21px;
  font-weight: 500;
  margin-bottom: 5px;
  color: #a20606;
}
.label-cust {
      left: 43px;
  font-size: 21px;
  font-weight: 500;
  margin-bottom: 5px;
  color: #660c56;
}


.value {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}


/* Responsive design for mobile */
@media (max-width: 768px) {
  .dashboard-row {
    flex-direction: column;
    align-items: center;
  }
 

  .dashboard-card {
     flex: 0 0 48%;   /* 2 cards per row */
    max-width: 48%;
    /* background: lightblue url("https://png.pngtree.com/thumb_back/fh260/background/20220316/pngtree-download-background-biru-polos-hd-dan-keren-untuk-desain-ppt-image_1067745.jpg");  */
    /* box-shadow: 0 6px 24px rgba(0, 123, 255, 0.25) !important; */
     border-radius: 8px;
        padding: 6px;
    display: flex;
    align-items: center;
    gap: 15px;
    /* box-shadow: 9px 10px 0px 0px rgb(162 195 215); */
    transition: 0.3s ease;
    /* min-width: 163px; */
    max-width: 71px;
    flex: 1 1 105px;
  }

  .dashboard-card .label {
    font-size: 15px;
    font-weight: 600;
    color: #010101;
  }

  .dashboard-card .value {
    font-size: 22px;
    font-weight: 800;
    color: #003b84;
  }
  .content{
    display: contents;
  }
}

.user-table td .btn-group {
  display: flex;
  gap: 0.5rem;
}
/* Layout */
.layout {
  display: flex;
  background-color: #ffffff;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}


.logo {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 1px;
      margin-left: 3%;  
}

.menu-btn, .logout-btn {
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.menu-btn {
  background-color: #28a745;
  color: white;
  margin-right: 15px;
}

.menu-btn:hover {
  background-color: #218838;
}

.logout-btn {
  background-color: white;
  color: #518587;
  border: 2px solid #007bff;
}

.logout-btn:hover {
  background-color: #e7f1ff;
}

/* Main Content */
.main-content {
  display: flex;
  flex: 1;
  padding: 30px;
  gap: 20px;
}

/* Sidebar */
.sidebar {
  background-color: #ffffff;
  width: 220px;
  padding: 25px 20px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  font-weight: 600;
  color: #495057;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 14px 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sidebar li:hover {
  background-color: #5f9ea0;
  color: white;
  font-weight: 700;
}

/* Content Section */
.content {
  flex: 1;
  background-color: rgb(240, 242, 248);
  padding: 30px 40px;
  border-radius: 15px;
  /* box-shadow: 0 5px 30px rgba(0,0,0,0.08); */
  overflow-x: auto;
}

h2 {
  margin-bottom: 30px;
  color: #518587;
  font-weight: 700;
  font-size: 28px;
  border-bottom: 2px solid #5f9ea0;
  padding-bottom: 8px;
}

/* User Table */
.user-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
}

.user-table th,
.user-table td {
  padding: 14px 20px;
  text-align: left;
  font-size: 16px;
  color: #427778;
}

.user-table th {
  background-color: #f8f9fa;
  font-weight: 700;
  border-bottom: none;
  border-radius: 12px 12px 0 0;
}

.user-table tbody tr {
  background-color: #fefefe;
  box-shadow: 0 1px 5px rgba(0,0,0,0.07);
  border-radius: 10px;
  transition: transform 0.2s ease;
}

.user-table tbody tr:hover {
  background-color: #e9f5ff;
  transform: translateX(5px);
}

.user-table tbody td {
  border: none;
  vertical-align: middle;
}

/* Footer */
.footer {
  background-color: #343a40;
  color: white;
  text-align: center;
  padding: 15px 0;
  font-size: 14px;
  font-weight: 500;
  margin-top: auto;
  letter-spacing: 0.6px;
}

/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 97vw;
  height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 0 15px;
}

/* Modal Card */
.modal-card {
  background-color: white;
  width: 100%;
  border-radius: 20px;
  padding: 40px 50px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  max-height: 86vh;
  overflow-y: auto;
  animation: slideDown 0.4s ease forwards;
  position: relative;

  /* Hide scrollbar but allow scroll */

  -ms-overflow-style: none; /* IE 10+ */
}


@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal Title */
.modal-title {
  font-size: 32px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 35px;
  color: #518587;
  letter-spacing: 1.3px;
}

/* Form Layout */
.attractive-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Form Rows */
.form-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.form-row .input-group {
  flex: 1 1 48%;
  display: flex;
  flex-direction: column;
}

/* Full width input group */
.input-group.full-width {
  flex: 1 1 100%;
}

/* Input Group */
.input-group label {
  font-weight: 700;
  margin-bottom: 10px;
  color: #427778;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
}

.input-group input,
.input-group select,
.input-group textarea {
  padding: 14px 18px;
  border: 2px solid #ced4da;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: inset 0 1px 4px rgba(0,0,0,0.08);
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  border-color: #5f9ea0;
  outline: none;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.3);
  background-color: #f9fbff;
}

/* Textarea resize */
.input-group textarea {
  resize: vertical;
  min-height: 56px;
  font-family: inherit;
}

/* Modal Buttons */
.modal-buttons {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.btn {
  flex: 1;
  padding: 14px 0;
  font-weight: 700;
  font-size: 1.1rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
}

.btn-primary {
  background-color: #5f9ea0;
  color: white;
  box-shadow: 0 6px 15px rgba(0, 123, 255, 0.4);
}

.btn-primary:hover {
  background-color: #426b6c;
  box-shadow: 0 8px 18px rgba(0, 86, 179, 0.6);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  box-shadow: 0 6px 15px rgba(108, 117, 125, 0.4);
}

.btn-secondary:hover {
  background-color: #5a6268;
  box-shadow: 0 8px 18px rgba(90, 98, 104, 0.6);
}

/* Fade Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.35s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 900px) {
  .form-row .input-group {
    flex: 1 1 100%;
  }

  .modal-card {
    padding: 30px 25px;
  }
}

@media (max-width: 480px) {
  .header {
    flex-direction: row;
    gap: 10px;
  }
  .menu-btn, .logout-btn {
    width: 100%;
  }
}
.attractive-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-weight: 600;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  user-select: none;
}

.btn-primary.attractive-btn {
  background-color: #5f9ea0;
  border: none;
  color: white;
}

.btn-primary.attractive-btn:hover {
  background-color: #426b6c;
  box-shadow: 0 4px 12px rgba(13,110,253,0.6);
}

.btn-danger.attractive-btn {
  background-color: #dc3545;
  border: none;
  color: white;
}

.btn-danger.attractive-btn:hover {
  background-color: #bb2d3b;
  box-shadow: 0 4px 12px rgba(220,53,69,0.6);
}

.attractive-btn i {
  font-size: 14px;
}

.pie-slider-wrapper {
  margin-top: 10px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.pie-slider {
  display: flex;
  flex-wrap: nowrap;       /* 🔑 single row */
  gap: 20px;
  scroll-behavior: smooth;
}

/* Each pie chart */
.pie-slider .chart-box {
  min-width: 260px;        /* controls card width */
  flex-shrink: 0;
}

/* Optional – hide scrollbar */
.pie-slider-wrapper::-webkit-scrollbar {
  height: 6px;
}

.pie-slider-wrapper::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

/* Container */
.dashboard-slider-container {
  width: 100%;
  overflow: hidden; /* keep arrows clean if you add later */
}

/* Horizontal scrolling row */
.dashboard-slider {
  display: flex;
  gap: 16px;
  overflow-x: auto;          /* ✅ enable horizontal scroll */
  overflow-y: hidden;
  padding: 10px 4px 14px;
  scroll-behavior: smooth;
  scrollbar-width: thin;     /* Firefox */
  scrollbar-color: #c1c1c1 transparent;
}

/* Show scrollbar (Chrome, Edge, Safari) */
.dashboard-slider::-webkit-scrollbar {
  height: 8px;
}

.dashboard-slider::-webkit-scrollbar-track {
  background: transparent;
}

.dashboard-slider::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 10px;
}

/* Cards */
.dashboard-card {
  min-width: 220px;          /* ✅ forces horizontal scroll */
  flex-shrink: 0;            /* ✅ prevent wrapping */
  height: 120px;
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.15);
}

/* Mobile optimization */
@media (max-width: 768px) {
  .dashboard-card {
    min-width: 180px;
  }
}

</style>
