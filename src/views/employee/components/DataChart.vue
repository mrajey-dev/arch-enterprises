<template>
  <div class="charts-container">
    <!-- 🟩 Task Completion Chart -->
    <div class="chart-box">
      <h3>📊 Task Completion</h3>
      <canvas ref="taskChart"></canvas>
    </div>

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

Chart.register(...registerables);

export default {
  name: 'DataChart',
  data() {
    return {
      taskChartInstance: null,
      currentMonthName: '',
      birthdayList: []
    };
  },
  mounted() {
    this.fetchTasks();
    this.fetchBirthdays();
  },
  methods: {
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
          datasets: [
            {
              label: 'Tasks',
              data: [
                statusCounts.completed,
                statusCounts['in progress'],
                statusCounts.pending
              ],
              backgroundColor: ['#4caf50', '#ff9800', '#f44336']
            }
          ]
        },
        options: {
          responsive: true,
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
</style>
