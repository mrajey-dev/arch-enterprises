
<template>
  <div class="layout">
    <!-- Header -->
    <header class="header">
      <div class="head-title">
        <a href="https://employees.archenterprises.co.in/">
          <img src="https://archenterprises.co.in/ajay/ajay.png" style="height:65px;border-radius:9px;" />
        </a>
        Arch 360
      </div>
      <i class="fas fa-bars mobile-menu-icon" @click="toggleSidebar" v-if="isMobile"></i>
    </header>

    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content">
        <h2>REQUEST DESK</h2>

        <!-- 📝 Request Form -->
        <div class="card">
          <h3>Submit Request</h3>

          <div class="form-group">
           <div class="form-group modern-input">
  <label>Request Type</label>
  <input
    type="text"
    v-model="form.request_type"
    placeholder="e.g. WFO, Asset, HR"
  />
</div>


          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="form.description" rows="3" maxlength="250"></textarea>
            <small>{{ form.description.length }}/250</small>
          </div>
<button class="btn" @click="submitRequest" :disabled="isSubmitting">
  <span v-if="isSubmitting">
    <i class="fas fa-spinner fa-spin"></i> Processing...
  </span>
  <span v-else>
    {{ editingId ? 'Update Request' : 'Submit Request' }}
  </span>
</button>


        </div>

        <!-- 📊 Donut Chart -->
        <div class="card">
          <h3>Request Status Overview</h3>
         <div class="donut-wrapper">
  <canvas ref="statusChart"></canvas>
</div>

        </div>

        <!-- 📋 Request List -->
        <div class="card">
          <h3>My Requests</h3>

          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Status</th>
               <th>Date</th>
<th>Actions</th>

              </tr>
            </thead>
            <tbody>
              <tr v-for="r in requests" :key="r.id">
                <td>{{ r.request_type }}</td>
                <td>{{ r.description }}</td>
                <td>
                  <span :class="['badge', r.status.toLowerCase()]">
                    {{ r.status }}
                  </span>
                </td>
              <td>{{ formatDate(r.created_at) }}</td>
<td class="actions">
  <button class="icon-btn edit" @click="editRequest(r)">
    <i class="fas fa-edit"></i>
  </button>
  <button class="icon-btn delete" @click="deleteRequest(r.id)">
    <i class="fas fa-trash"></i>
  </button>
</td>

              </tr>
            </tbody>
          </table>
        </div>

      </section>
    </div>
  </div>
</template>


<script>
import Sidebar from './components/Sidebar.vue'
import Chart from 'chart.js/auto'
import axios from "axios";

export default {
  components: { Sidebar },

  data() {
    return {
          isSubmitting: false,
      editingId: null,

      isMobile: false,
      isSidebarVisible: true,

      form: {
        request_type: '',
        description: ''
      },

      requests: [],
      chart: null
    }
  },

  methods: {
fetchStats() {
  axios.get('/api/requests/stats', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
  .then(res => {
    const counts = { Pending: 0, Approved: 0, Rejected: 0, Completed: 0 }
    res.data.forEach(i => {
      if(counts[i.status] !== undefined) counts[i.status] = i.total
    })

    if (this.chart) this.chart.destroy()

    this.chart = new Chart(this.$refs.statusChart, {
      type: 'doughnut',
      data: {
        labels: Object.keys(counts),
        datasets: [{
          data: Object.values(counts),
          backgroundColor: ['#fbbf24', '#22c55e', '#ef4444', '#2196f3']
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        animation: { animateScale: true },
        plugins: { legend: { position: 'bottom' } }
      }
    })
  })
},



    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    },

submitRequest() {
  if (!this.form.request_type || !this.form.description) {
    alert('Fill all fields')
    return
  }

  this.isSubmitting = true   // start loader

  const url = this.editingId
    ? `/api/requests/${this.editingId}`
    : '/api/requests'

  const method = this.editingId ? 'put' : 'post'

  axios({
    method,
    url,
    data: this.form,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
  .then(() => {
    this.form.request_type = ''
    this.form.description = ''
    this.editingId = null
    this.fetchRequests()
    this.fetchStats()
  })
  .catch(() => {
    alert('Failed to save request')
  })
  .finally(() => {
    this.isSubmitting = false  // stop loader
  })
},


fetchRequests() {
  axios.get('/api/requests/my', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
  .then(res => {
    this.requests = res.data
    this.updateChart()
  })
},
editRequest(request) {
  this.editingId = request.id
  this.form.request_type = request.request_type
  this.form.description = request.description
  window.scrollTo({ top: 0, behavior: 'smooth' })
},

deleteRequest(id) {
  if (!confirm('Are you sure you want to delete this request?')) return

  axios.delete(`/api/requests/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
  .then(() => {
    this.fetchRequests()
    this.fetchStats()
  })
  .catch(() => {
    alert('Failed to delete request')
  })
},



    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },

   updateChart() {
  const counts = { Pending: 0, Approved: 0, Rejected: 0, Completed: 0 }

  this.requests.forEach(r => {
    if(counts[r.status] !== undefined) counts[r.status]++
  })

  if (this.chart) this.chart.destroy()

  this.chart = new Chart(this.$refs.statusChart, {
    type: 'doughnut',
    data: {
      labels: ['Pending', 'Approved', 'Rejected', 'Completed'],
      datasets: [{
        data: [
          counts.Pending,
          counts.Approved,
          counts.Rejected,
          counts.Completed
        ],
        backgroundColor: ['#fbbf24', '#22c55e', '#ef4444', '#2196f3']
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      animation: { animateScale: true },
      plugins: { legend: { position: 'bottom' } }
    }
  })
}

  },

  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    this.updateChart()
     this.fetchRequests()
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  }
}
</script>



<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
.actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.icon-btn.edit {
  color: #2563eb;
}

.icon-btn.edit:hover {
  background: rgba(37, 99, 235, 0.1);
}

.icon-btn.delete {
  color: #ef4444;
}

.icon-btn.delete:hover {
  background: rgba(239, 68, 68, 0.1);
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

/* 🌟 Modern Input Styling */
.modern-input input {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1.5px solid #e5e7eb;
  font-size: 14px;
  outline: none;
  transition: all 0.25s ease;
  background: #f9fafb;
}

/* Hover */
.modern-input input:hover {
  border-color: #93c5fd;
}

/* Focus glow */
.modern-input input:focus {
  background: #fff;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

/* Placeholder */
.modern-input input::placeholder {
  color: #9ca3af;
}

.donut-wrapper {
  width: 260px;
  height: 260px;
  margin: 0 auto;            /* center */
  position: relative;
}

.donut-wrapper canvas {
  width: 260px !important;
  height: 260px !important;
}

/* Layout */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text);
}

/* Header */
.header {
  background-color: var(--primary);
  color: white;
  padding: 8px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.head-title {
  display: flex;
  align-items: center;
  gap: 7px;
  color: white;
  font-family: cursive;
  text-decoration: none;
      font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;

}

.mobile-menu-icon {
  font-size: 22px;
  cursor: pointer;
  display: none;
}

/* Main */
.main-content {
  display: flex;
  flex: 1;
  padding: 30px;
  gap: 20px;
}

/* Sidebar */
.sidebar {
  width: 220px;
  background: #fff;
  padding: 25px 20px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}

/* Content */
.content {
  flex: 1;
  background-color: #a5d5cf33;
  padding: 30px 40px;
  border-radius: 15px;
  overflow-x: auto;
}

h2 {
  margin-bottom: 30px;
  font-weight: 800;
  font-size: 21px;
  border-bottom: 2px solid var(--primary);
  padding-bottom: 8px;
}

/* Mobile */
@media (max-width: 768px) {
  .mobile-menu-icon {
    display: inline-block;
  }

  .main-content {
    flex-direction: column;
    padding: 20px 15px;
  }

  .sidebar {
    width: 100%;
    border-radius: 10px;
  }

  .expanded-content {
    margin-left: 0 !important;
  }
}


.card {
  background: #fff;
  padding: 20px;
  border-radius: 14px;
  margin-bottom: 25px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
}

.form-group {
  margin-bottom: 15px;
}

select, textarea {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.btn {
  background: var(--primary);
  color: white;
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  color: white;
}

.pending { background: #fbbf24; }
.approved { background: #22c55e; }
.rejected { background: #ef4444; }
.badge.completed { background: #2196f3; }

.btn i.fa-spinner {
  margin-right: 8px;
}
.btn[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
}

</style>