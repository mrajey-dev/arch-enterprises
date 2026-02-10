

<template>
  <div class="layout">
    <!-- Header -->
          <header class="header">
      <div class="head-title"><a href="https://employees.archenterprises.co.in/">
        <img
          src="https://archenterprises.co.in/ajay/ajay.png"
          style="height: 65px;  border-radius: 9px;"
          alt="Logo"
        />
         </a>
         Arch 360
     
      </div>
      <i class="fas fa-bars mobile-menu-icon" @click="toggleSidebar" v-if="isMobile"></i>
    </header>

    <!-- Main Content -->
    <div class="main-content">
       <Sidebar v-if="!isMobile || isSidebarVisible" />

   <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
  <h2>BOOK A RESOURCE</h2>

  <!-- Booking Form -->
  <div class="booking-card">
    <h3>{{ editId ? 'Edit Booking' : 'New Booking' }}</h3>

    <div class="form-grid">
      <div class="form-group">
        <label>Resource Type</label>
        <select v-model="form.resource_type">
  <option disabled value="">Select Resource</option>

  <option
    v-for="resource in resources"
    :key="resource.id"
    :value="resource.name"
  >
    {{ resource.name }}
  </option>
</select>

      </div>

      <!-- <div class="form-group">
        <label>Resource Name</label>
        <input type="text" v-model="form.resource_name" placeholder="Ex: Conference Room A" />
      </div> -->
  <div class="form-group full">
        <label>Purpose</label>
        <textarea v-model="form.purpose" rows="3" placeholder="Reason for booking"></textarea>
      </div>
      <div class="form-group">
        <label>From Date</label>
        <input type="datetime-local" v-model="form.from_date" />
      </div>

      <div class="form-group">
        <label>To Date</label>
        <input type="datetime-local" v-model="form.to_date" />
      </div>

    
    </div>

    <button class="btn-primary" @click="submitBooking">
      {{ editId ? 'Update Booking' : 'Book Resource' }}
    </button>
  </div>

  <!-- Booking List -->
  <div class="table-card">
    <h3>My Bookings</h3>

    <table>
      <thead>
        <tr>
          <!-- <th>Resource</th> -->
          <th>Type</th>
          <th>From</th>
          <th>To</th>
          <th>Purpose</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="b in bookings" :key="b.id">
          <!-- <td>{{ b.resource_name }}</td> -->
          <td>{{ b.resource_type }}</td>
         <td>
  <div class="date-block">
    <span class="date">{{ formatDate(b.from_date) }}</span>
    <span class="time">{{ formatTime(b.from_date) }}</span>
  </div>
</td>

<td>
  <div class="date-block">
    <span class="date">{{ formatDate(b.to_date) }}</span>
    <span class="time">{{ formatTime(b.to_date) }}</span>
  </div>
</td>
          <td>{{ b.purpose }}</td>
          <td class="actions">
            <button class="edit" @click="editBooking(b)">Edit</button>
            <button class="delete" @click="deleteBooking(b.id)">Delete</button>
          </td>
        </tr>
        <tr v-if="bookings.length === 0">
          <td colspan="6" class="empty">No bookings yet</td>
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
import Sidebar from './components/Sidebar.vue'
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";

const api = axios.create({
  baseURL: 'https://employees.archenterprises.co.in/api',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    Accept: 'application/json'
  }
})

export default {
  components: { Sidebar },

  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
 resources: [],
      form: {
        resource_type: ""
      },
      bookings: [],
      editId: null,
      loading: false,

      form: {
        resource_type: '',
        resource_name: '',
        from_date: '',
        to_date: '',
        purpose: ''
      }
    }
  },

  methods: {
     fetchResources() {
      axios.get("/api/resources")
        .then(response => {
          this.resources = response.data;
        })
        .catch(error => {
          console.error("Error fetching resources:", error);
        });
    },
    formatDate(datetime) {
    return new Date(datetime).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  },

  formatTime(datetime) {
    return new Date(datetime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  },
    async fetchBookings() {
      try {
        const res = await api.get('/api/resource-bookings')
        this.bookings = res.data
      } catch (e) {
        console.error('Fetch failed', e)
      }
    },

    async submitBooking() {
      this.loading = true
      try {
        if (this.editId) {
          await api.put(`/api/resource-bookings/${this.editId}`, this.form)
        } else {
          await api.post('/api/resource-bookings', this.form)
        }

        this.resetForm()
        this.fetchBookings()
      } catch (e) {
        toastSuccess(e.response?.data?.message || 'Something went wrong')
      } finally {
        this.loading = false
      }
    },

    editBooking(b) {
      this.editId = b.id
      this.form = {
        resource_type: b.resource_type,
        resource_name: b.resource_name,
        from_date: b.from_date.replace(' ', 'T'),
        to_date: b.to_date.replace(' ', 'T'),
        purpose: b.purpose
      }
    },

    async deleteBooking(id) {
      if (!confirm('Delete this booking?')) return

      try {
        await api.delete(`/api/resource-bookings/${id}`)
        this.fetchBookings()
      } catch (e) {
        toastSuccess(e.response?.data?.message || 'Delete failed')
      }
    },

    resetForm() {
      this.editId = null
      this.form = {
        resource_type: '',
        resource_name: '',
        from_date: '',
        to_date: '',
        purpose: ''
      }
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    }
  },

  mounted() {
     this.fetchResources();
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)

    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
      return
    }

    this.fetchBookings()
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


.booking-card,
.table-card {
  background: #fff;
  padding: 25px;
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
  margin-bottom: 30px;
}

.booking-card h3,
.table-card h3 {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full {
  grid-column: span 2;
}

label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 5px;
}

input, select, textarea {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.btn-primary {
  margin-top: 20px;
  padding: 10px 20px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
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

.actions button {
  margin-right: 6px;
  padding: 5px 10px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.actions .edit {
  background: #f0ad4e;
  color: #fff;
}

.actions .delete {
  background: #d9534f;
  color: #fff;
}

.empty {
  text-align: center;
  color: #999;
}

.date-block {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.date-block .date {
  font-weight: 600;
  font-size: 13px;
}

.date-block .time {
  font-size: 12px;
  color: #777;
}

</style>