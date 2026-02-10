<template>
 <div class="charts-container">
  <!-- 🟩 Task Completion Chart -->
 <div class="chart-box">
  <h3>📊 Task Data</h3>
  <div class="chart-wrapper">
    <canvas ref="taskChart"></canvas>
  </div>
</div>

  <!-- 📈 Monthly Services Done Chart (NEW) -->
  <div class="chart-box">
    <h3>📈 Monthly Services Data</h3>
    <canvas ref="serviceChart"></canvas>
  </div>

  
  <!-- <div class="performance-toggle">
  <button
    :class="{ active: activeView === 'monthly' }"
    @click="activeView = 'monthly'"
  >
    Monthly
  </button>

  <button
    :class="{ active: activeView === 'quarterly' }"
    @click="activeView = 'quarterly'"
  >
    Quarterly
  </button>

  <button
    :class="{ active: activeView === 'yearly' }"
    @click="activeView = 'yearly'"
  >
    Yearly
  </button>
</div> -->

<!-- <br>
  <div class="chart-box" v-if="activeView === 'monthly'">
  <h3>📅 Monthly Performance</h3>
  <canvas ref="monthlyChart"></canvas>
</div> -->

<!-- <div class="chart-box" v-if="activeView === 'quarterly'">
  <h3>📊 Quarterly Performance</h3>
  <canvas ref="quarterlyChart"></canvas>
</div>

<div class="chart-box" v-if="activeView === 'yearly'">
  <h3>🏆 Yearly Performance</h3>
  <canvas ref="yearlyChart"></canvas>
</div> -->

<!-- </div> -->
<!-- 🎂 Birthday Reminder Section -->
 <div class="chart-box birthday-box">
      <h3>🎉 Birthdays Reminder</h3>

      <div v-if="birthdayList.length > 0" class="birthday-grid">
        <div
          v-for="employee in birthdayList"
          :key="employee.id"
          class="birthday-card"
        >
       <div class="avatar-wrapper">
  <img
    src="https://png.pngtree.com/png-clipart/20250531/original/pngtree-happy-birthday-text-png-image_21102940.png"
    alt="profile"
    class="avatar-img"
  />
</div>


          <div class="details">
            <strong>{{ employee.name }}</strong>
            <span class="dob">
              🎂 {{ formatDate(employee.dateofbirth) }}
            </span>
            <span class="dept">{{ employee.department }}</span>
          </div>
        </div>
      </div>

      <div v-else class="no-birthday">
        <img src="https://freepngimg.com/save/10774-birthday-cake-png-clipart/2499x3334" alt="cake" />
        <p>No birthdays this month 🎈</p>
      </div>
    </div>
</div>

</template>

<script>
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";
Chart.register(...registerables);

export default {
  name: 'DataChart',
  data() {
    return {
      options: {
  responsive: true,
  maintainAspectRatio: false, // 🔥 THIS IS THE KEY
},

        activeView: 'monthly', // default
      monthlyChart: null,
quarterlyChart: null,
yearlyChart: null,
monthlyData: {},
quarterlyData: {},
yearlyData: {},

      taskChartInstance: null,
        serviceChartInstance: null,
      currentMonthName: '',
      birthdayList: []
    };
  },
  mounted() {
    this.fetchTasks();
     this.createServiceChart();
    this.fetchBirthdays();
    this.fetchPerformance();
  },
  watch: {
  activeView() {
    this.$nextTick(() => {
      if (this.activeView === 'monthly') {
        this.createMonthlyChart(this.monthlyData);
      }
      if (this.activeView === 'quarterly') {
        this.createQuarterlyChart(this.quarterlyData);
      }
      if (this.activeView === 'yearly') {
        this.createYearlyChart(this.yearlyData);
      }
    });
  }
},

  methods: {
async fetchPerformance() {
  const res = await axios.get('/api/tasks');
  const tasks = res.data;

  const monthly = {};
  const quarterly = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  const yearly = {};

  tasks.forEach(task => {
    if (task.status.toLowerCase() !== 'completed') return;

    const date = new Date(task.created_at);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const m = date.getMonth() + 1;

    // Monthly
    monthly[month] = (monthly[month] || 0) + 1;

    // Quarterly
    if (m <= 3) quarterly.Q1++;
    else if (m <= 6) quarterly.Q2++;
    else if (m <= 9) quarterly.Q3++;
    else quarterly.Q4++;

    // Yearly
    yearly[year] = (yearly[year] || 0) + 1;
  });

  // 🔥 STORE DATA
  this.monthlyData = monthly;
  this.quarterlyData = quarterly;
  this.yearlyData = yearly;

  // 🔥 DRAW DEFAULT VIEW ONLY
  this.createMonthlyChart(monthly);
},
createMonthlyChart(data) {
  if (this.monthlyChart) this.monthlyChart.destroy();

  this.monthlyChart = new Chart(this.$refs.monthlyChart, {
    type: 'bar',
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: 'Completed Tasks',
        data: Object.values(data),
        backgroundColor: '#42a5f5'
      }]
    },
    options: { responsive: true }
  });
},  
createQuarterlyChart(data) {
  if (this.quarterlyChart) this.quarterlyChart.destroy();

  this.quarterlyChart = new Chart(this.$refs.quarterlyChart, {
    type: 'line',
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: 'Quarterly Performance',
        data: Object.values(data),
        borderColor: '#66bb6a',
        tension: 0.4,
        fill: true
      }]
    }
  });
}
,
createYearlyChart(data) {
  if (this.yearlyChart) this.yearlyChart.destroy();

  this.yearlyChart = new Chart(this.$refs.yearlyChart, {
    type: 'bar',
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: 'Yearly Performance',
        data: Object.values(data),
        backgroundColor: '#ff7043'
      }]
    }
  });
}
,

createServiceChart() {
  if (this.serviceChartInstance) this.serviceChartInstance.destroy();

  // 🔒 STATIC MONTHLY SERVICE DATA
  const serviceData = [
    { month: 'Jan', done: 14, pending: 6 },
    { month: 'Feb', done: 18, pending: 4 },
    { month: 'Mar', done: 22, pending: 8 },
    { month: 'Apr', done: 19, pending: 5 },
    { month: 'May', done: 27, pending: 7 },
    { month: 'Jun', done: 24, pending: 3 }
  ];

  this.serviceChartInstance = new Chart(this.$refs.serviceChart, {
    type: 'line', // 👉 keep line (or change to 'bar' if you want)
    data: {
      labels: serviceData.map(item => item.month),
      datasets: [
        {
          label: 'Services Done',
          data: serviceData.map(item => item.done),
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25,118,210,0.15)',
          tension: 0.4,
          fill: true,
          pointRadius: 5
        },
        {
          label: 'Pending Services',
          data: serviceData.map(item => item.pending),
          borderColor: '#f44336',
          backgroundColor: 'rgba(244,67,54,0.15)',
          tension: 0.4,
          fill: true,
          pointRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
},

    // 🟩 Fetch Task Data and Create Task Chart
    async fetchTasks() {
      try {
        const response = await axios.get('/api/tasks');
        const tasks = response.data;

        const statusCounts = {
          completed: 0,
          'in progress': 0,
          pending: 0
        };

        tasks.forEach(task => {
          const status = task.status.toLowerCase();
          if (statusCounts[status] !== undefined) {
            statusCounts[status]++;
          }
        });

        this.createTaskChart(statusCounts);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    },

    createTaskChart(statusCounts) {
      if (this.taskChartInstance) this.taskChartInstance.destroy();

      this.taskChartInstance = new Chart(this.$refs.taskChart, {
  type: 'bar',
  data: {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [{
      label: 'Tasks',
      data: [
        statusCounts.completed,
        statusCounts['in progress'],
        statusCounts.pending
      ],
      backgroundColor: ['#4caf50', '#ff9800', '#f44336']
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    }
  }
});

    },

    // 🎂 Fetch Birthday List
    async fetchBirthdays() {
      try {
        const response = await axios.get('/api/users'); // Adjust API endpoint if needed
        const allUsers = response.data;

        const currentMonth = new Date().getMonth() + 1;
        this.currentMonthName = new Date().toLocaleString('default', { month: 'long' });

        this.birthdayList = allUsers.filter(user => {
          const dob = new Date(user.dateofbirth);
          return dob.getMonth() + 1 === currentMonth;
        });
      } catch (error) {
        console.error('Error fetching birthdays:', error);
      }
    },

    formatDate(dateString) {
      const options = { day: 'numeric', month: 'long' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    }
  }
};
</script>

<style scoped>

.avatar-wrapper {
  margin-right: 15px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  /* border: 2px solid #42a5f5; */
}

.avatar-cake {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: contain;
  background: #fff;
  padding: 4px;
  animation: bounce 1.5s infinite ease-in-out;
}

/* Fun bounce animation for the cake */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}


.charts-container {
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
  margin-top: 30px;
}
.chart-box {
  flex: 1 1 350px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  padding: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.chart-box:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 18px rgba(0, 0, 0, 0.12);
}
.chart-box h3 {
  text-align: center;
  margin-bottom: 18px;
  color: var(--text);
  font-weight: 600;
}

/* 🌈 Birthday Section */
.birthday-box {
  background: linear-gradient(135deg, #fdfbfb, #ebedee);
}
.birthday-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 15px;
}
.birthday-card {
  display: flex;
  align-items: center;
  background: #ffffffb3;
  border-radius: 12px;
  padding: 12px 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.25s ease;
  cursor: pointer;
  border-left: 5px solid #42a5f5;
}
.birthday-card:hover {
  transform: scale(1.03);
  background: #f0f7ff;
  border-left-color: #1976d2;
}

/* Avatar section */
.avatar-wrapper {
  margin-right: 15px;
}
.avatar-fallback {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #42a5f5, #1e88e5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
}

/* Details text */
.details {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.details strong {
  font-size: 15px;
  color: var(--text);
}
.dob {
  font-size: 13px;
  color: #ff6f61;
  margin-top: 3px;
}
.dept {
  font-size: 13px;
  color: var(--text-white);
  font-style: italic;
  margin-top: 2px;
}

/* Empty state */
.no-birthday {
  text-align: center;
  padding: 20px;
  color: #888;
}
.no-birthday img {
  width: 80px;
  opacity: 0.7;
  margin-bottom: 10px;
}
.no-birthday p {
  font-size: 14px;
}
.performance-toggle {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}

.performance-toggle button {
  padding: 8px 18px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  background: #e3f2fd;
  color: #1976d2;
  font-weight: 600;
  transition: 0.3s;
}

.performance-toggle button.active {
  background: #1976d2;
  color: #fff;
}

.chart-wrapper {
  position: relative;
  height: 280px; /* 👈 CONTROL HEIGHT HERE */
  width: 100%;
}

.chart-wrapper canvas {
  width: 100% !important;
  height: 100% !important;
}

</style>
