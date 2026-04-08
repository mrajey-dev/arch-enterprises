<template>
  <div class="charts-container">
    <!-- 📊 Enhanced Task Analytics Section -->
    <div class="chart-box analytics-box">
      <div class="box-header">
        <h3>
          <i class="fas fa-chart-pie"></i> Task Analytics
        </h3>
        <div class="filter-container">
          <select v-model="selectedMonth" @change="filterTasksByMonth" class="month-filter">
            <option value="all">📅 All Months</option>
            <option v-for="month in availableMonths" :key="month.value" :value="month.value">
              {{ month.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Stats Summary Cards -->
      <div class="stats-row">
        <div class="stat-card completed" :style="{ '--progress': completionPercentage + '%' }">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ statusCounts.completed }}</span>
            <span class="stat-label">Completed</span>
          </div>
          <div class="stat-progress">
            <div class="progress-bar-fill" :style="{ width: completionPercentage + '%' }"></div>
          </div>
        </div>
        <div class="stat-card progress" :style="{ '--progress': progressPercentage + '%' }">
          <div class="stat-icon">
            <i class="fas fa-spinner fa-pulse"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ statusCounts['in progress'] }}</span>
            <span class="stat-label">In Progress</span>
          </div>
          <div class="stat-progress">
            <div class="progress-bar-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>
        <div class="stat-card pending" :style="{ '--progress': pendingPercentage + '%' }">
          <div class="stat-icon">
            <i class="fas fa-hourglass-half"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ statusCounts.pending }}</span>
            <span class="stat-label">Pending</span>
          </div>
          <div class="stat-progress">
            <div class="progress-bar-fill" :style="{ width: pendingPercentage + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Chart and Legend Row -->
      <div class="chart-row">
        <div class="chart-wrapper">
          <canvas ref="taskChart"></canvas>
        </div>
        <div class="legend-stats">
          <div class="legend-item" v-for="item in chartData" :key="item.label">
            <div class="legend-color" :style="{ background: item.color }"></div>
            <div class="legend-label">{{ item.label }}</div>
            <div class="legend-value">{{ item.count }}</div>
            <div class="legend-percent">{{ item.percentage }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
Chart.register(...registerables);

export default {
  name: 'DataChart',
  data() {
    return {
      taskChartInstance: null,
      selectedMonth: 'all',
      allTasks: [],
      availableMonths: [],
      statusCounts: {
        completed: 0,
        'in progress': 0,
        pending: 0
      },
      totalTasks: 0
    };
  },
  computed: {
    completionPercentage() {
      if (this.totalTasks === 0) return 0;
      return ((this.statusCounts.completed / this.totalTasks) * 100).toFixed(1);
    },
    progressPercentage() {
      if (this.totalTasks === 0) return 0;
      return ((this.statusCounts['in progress'] / this.totalTasks) * 100).toFixed(1);
    },
    pendingPercentage() {
      if (this.totalTasks === 0) return 0;
      return ((this.statusCounts.pending / this.totalTasks) * 100).toFixed(1);
    },
    chartData() {
      return [
        { label: 'Completed', count: this.statusCounts.completed, percentage: this.completionPercentage, color: '#10b981' },
        { label: 'In Progress', count: this.statusCounts['in progress'], percentage: this.progressPercentage, color: '#f59e0b' },
        { label: 'Pending', count: this.statusCounts.pending, percentage: this.pendingPercentage, color: '#ef4444' }
      ];
    }
  },
  mounted() {
    this.fetchTasks();
  },
  beforeDestroy() {
    if (this.taskChartInstance) {
      this.taskChartInstance.destroy();
    }
  },
  methods: {
    async fetchTasks() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/tasks');
        this.allTasks = response.data;
        this.extractAvailableMonths();
        this.filterTasksByMonth();
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    },

    extractAvailableMonths() {
      const months = new Set();
      this.allTasks.forEach(task => {
        if (task.created_at) {
          const date = new Date(task.created_at);
          if (!isNaN(date.getTime())) {
            const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
            months.add(monthYear);
          }
        }
      });
      
      this.availableMonths = Array.from(months)
        .sort()
        .map(monthYear => {
          const [year, month] = monthYear.split('-');
          const date = new Date(year, month - 1);
          return {
            value: monthYear,
            name: date.toLocaleString('default', { month: 'long', year: 'numeric' })
          };
        });
    },

    filterTasksByMonth() {
      let filteredTasks = this.allTasks;
      
      if (this.selectedMonth !== 'all') {
        const [year, month] = this.selectedMonth.split('-');
        filteredTasks = this.allTasks.filter(task => {
          if (!task.created_at) return false;
          const taskDate = new Date(task.created_at);
          if (isNaN(taskDate.getTime())) return false;
          return taskDate.getFullYear() === parseInt(year) && 
                 taskDate.getMonth() + 1 === parseInt(month);
        });
      }
      
      const statusCounts = {
        completed: 0,
        'in progress': 0,
        pending: 0
      };
      
      filteredTasks.forEach(task => {
        const status = (task.status || '').toLowerCase();
        if (statusCounts[status] !== undefined) {
          statusCounts[status]++;
        }
      });
      
      this.statusCounts = statusCounts;
      this.totalTasks = filteredTasks.length;
      this.createTaskChart();
    },

    createTaskChart() {
      if (this.taskChartInstance) {
        this.taskChartInstance.destroy();
      }

      const ctx = this.$refs.taskChart.getContext('2d');
      
      this.taskChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'In Progress', 'Pending'],
          datasets: [{
            data: [
              this.statusCounts.completed,
              this.statusCounts['in progress'],
              this.statusCounts.pending
            ],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 15,
            cutout: '65%',
            borderRadius: 10,
            spacing: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: '#1e293b',
              titleColor: '#f1f5f9',
              bodyColor: '#cbd5e1',
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return `${context.label}: ${value} (${percentage}%)`;
                }
              }
            }
          },
          layout: {
            padding: 10
          },
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000,
            easing: 'easeOutBounce'
          }
        }
      });
    }
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

.charts-container {
  display: block;
  margin-top: 20px;
}

/* Chart Box Styles */
.chart-box {
  background: white;
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  max-width: 100%;
}

.chart-box:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
}

.box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.box-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.box-header h3 i {
  color: #4361ee;
  font-size: 1.2rem;
}

/* Filter Styles */
.filter-container {
  display: flex;
  justify-content: flex-end;
}

.month-filter {
  padding: 8px 16px;
  border-radius: 40px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #1e293b;
}

.month-filter:hover {
  border-color: #4361ee;
  box-shadow: 0 2px 8px rgba(67, 97, 238, 0.1);
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: var(--progress, 0%);
  height: 3px;
  background: currentColor;
  transition: width 0.5s ease;
}

.stat-card.completed { color: #10b981; background: linear-gradient(135deg, #f0fdf4, #dcfce7); }
.stat-card.progress { color: #f59e0b; background: linear-gradient(135deg, #fffbeb, #fef3c7); }
.stat-card.pending { color: #ef4444; background: linear-gradient(135deg, #fef2f2, #fee2e2); }

.stat-icon {
  width: 44px;
  height: 44px;
  background: rgba(255,255,255,0.8);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.stat-info {
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.7rem;
  color: #64748b;
}

.stat-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0,0,0,0.05);
}

.progress-bar-fill {
  height: 100%;
  background: currentColor;
  border-radius: 3px;
  transition: width 0.5s ease;
}

/* Chart Row */
.chart-row {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.chart-wrapper {
  flex: 1;
  min-width: 200px;
  height: 220px;
  position: relative;
}

.chart-wrapper canvas {
  width: 100% !important;
  height: 100% !important;
}

/* Legend Stats */
.legend-stats {
  flex: 0.8;
  min-width: 140px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
  animation: fadeInUp 0.4s ease backwards;
}

.legend-item:nth-child(1) { animation-delay: 0.1s; }
.legend-item:nth-child(2) { animation-delay: 0.2s; }
.legend-item:nth-child(3) { animation-delay: 0.3s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 4px;
}

.legend-label {
  flex: 1;
  font-size: 0.8rem;
  color: #475569;
}

.legend-value {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1e293b;
}

.legend-percent {
  font-size: 0.75rem;
  color: #64748b;
  min-width: 45px;
  text-align: right;
}

/* Responsive */
@media (max-width: 640px) {
  .chart-box {
    padding: 16px;
  }
  
  .stats-row {
    gap: 8px;
  }
  
  .stat-icon {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
  
  .stat-value {
    font-size: 1.2rem;
  }
  
  .chart-row {
    flex-direction: column;
  }
  
  .chart-wrapper {
    height: 180px;
  }
  
  .legend-stats {
    width: 100%;
  }
  
  .box-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>