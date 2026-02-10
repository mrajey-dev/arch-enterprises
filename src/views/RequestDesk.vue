
<template>
  <div class="layout">
    <!-- Header -->
    <header class="header">
      <div class="head-title">
        <a href="https://employees.archenterprises.co.in/">
          <img src="https://archenterprises.co.in/ajay/ajay.png" style="height: 65px; border-radius: 9px;" alt="Logo" />
        </a>
        Arch 360
      </div>
      <i class="fas fa-bars mobile-menu-icon" @click="toggleSidebar" v-if="isMobile"></i>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <h2>Request Desk</h2>

        <div v-if="loadingRequests" class="text-center my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
          <p>Loading requests...</p>
        </div>

        <div v-else class="request-table">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Employee Name</th>
                <th>Request Title</th>
                 <th>Description</th> 
                
                <th>Date Submitted</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
            <tr v-for="(request, index) in employeeRequests" :key="request.id">
  <td>{{ index + 1 }}</td>
  <td>{{ request.user_name || 'Me' }}</td> <!-- or just 'Me' if employee_name is not returned -->
  <td>{{ request.request_type }}</td>
  <td>{{ request.description }}</td>
  <td>{{ formatDate(request.created_at) }}</td>
  <td>
    <select 
      v-model="request.status"
      @change="changeStatus(request)"
      class="status-dropdown"
    >
      <option value="Pending">Pending</option>
      <option value="Approved">Approved</option>
      <option value="Rejected">Rejected</option>
      <option value="Completed">Completed</option>
    </select>
  </td>
</tr>

              <tr v-if="employeeRequests.length === 0">
                <td colspan="5" class="text-center">No requests found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";
export default {
  components: { Sidebar },
  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      loadingRequests: true,
      employeeRequests: [],
    }
  },
  methods: {
    changeStatus(request) {
  const token = localStorage.getItem('token');

  axios.patch(`/api/requests/${request.id}/status`, {
    status: request.status
  }, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => {
    console.log(res.data.message)
    // Optionally show success toast
  })
  .catch(err => {
    console.error('Failed to update status:', err)
    // Optionally reset dropdown to previous status
    this.fetchRequests()
  })
},

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    },
    formatDate(dateStr) {
      const date = new Date(dateStr)
      return date.toLocaleDateString()
    },
    fetchRequests() {
      this.loadingRequests = true
      const token = localStorage.getItem('token')

      axios.get('/api/requests/employee', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
          console.log('API response:', res.data); // <-- Add this
        this.employeeRequests = res.data
      })
      .catch(err => {
        console.error('Employee requests error:', err)
      })
      .finally(() => {
        this.loadingRequests = false
      })
    }
  },
  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    this.fetchRequests()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  }
}
</script>


<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

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
  background-color: var(--sidebar);
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
  text-transform: uppercase;
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


/* Request Desk Tabs */
.request-tabs {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.request-tabs button {
  padding: 8px 18px;
  border: none;
  background-color: var(--sidebar);
  cursor: pointer;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s;
}

.request-tabs button.active {
  background: var(--primary);
  color: #fff;
}

/* Tables */
.request-table table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}

.request-table th, .request-table td {
  padding: 12px 15px;
  text-align: left;
}

.request-table th {
  background-color: var(--primary);
  color: #fff;
  font-weight: 600;
}

.request-table tr:nth-child(even) {
  background-color: #f5f5f5;
}

.status {
  padding: 5px 10px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
}

.status.pending { background-color: #ffeb3b; color: #555; }
.status.approved { background-color: #4caf50; color: #fff; }
.status.completed { background-color: #2196f3; color: #fff; }
.status.rejected { background-color: #f44336; color: #fff; }

.status-dropdown {
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-weight: 600;
  background-color: #fff;
  cursor: pointer;
}

</style>