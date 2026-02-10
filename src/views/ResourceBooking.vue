<template>
  <div class="layout">
    <!-- Header -->
    <header class="header">
      <div class="head-title">
        <a href="https://employees.archenterprises.co.in/">
          <img
            src="https://archenterprises.co.in/ajay/ajay.png"
            style="height: 65px; border-radius: 9px;"
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
        <h2>Resource Booking  <button class="btn-add" @click="showAddModal = true">
    <i class="fas fa-plus"></i> Add New Resource
  </button></h2>

        <!-- Loading Spinner -->
        <div v-if="loadingResources" class="text-center my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
          <p>Loading resources...</p>
        </div>



        <!-- Resource Cards -->
       <div v-else class="resources-grid">
  <div
    v-for="resource in resources"
    :key="resource.id"
    class="resource-card"
  >
    <div class="resource-header">
      <h3>{{ resource.resource_type }}</h3>

      <span
        class="status-badge"
        :class="resource.status === 'booked' ? 'booked' : 'available'"
      >
        {{ resource.status }}
      </span>
    </div>

    <p><strong>Booked By:</strong> {{ resource.user?.name || 'N/A' }}</p>
    <p><strong>From:</strong> {{ formatDate(resource.from_date) }}</p>
    <p><strong>To:</strong> {{ formatDate(resource.to_date) }}</p>
    <p><strong>Purpose:</strong> {{ resource.purpose }}</p>

    <button class="btn-book" disabled>
      Already Booked
    </button>
  </div>
</div>


        <!-- Booking Confirmation Modal -->
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal">
            <h3>Resource Booked Successfully!</h3>
            <p>You have booked <strong>{{ bookedResourceName }}</strong>.</p>
            <button class="btn-close" @click="showModal = false">Close</button>
          </div>
        </div>
      </section>
      <!-- Add Resource Modal -->
<div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
  <div class="modal">
    <h3>Add New Resource</h3>

    <div class="form-group">
      <label>Resource Name</label>
      <input v-model="newResource.name" type="text" />
    </div>

    <div class="form-group">
      <label>Description</label>
      <textarea v-model="newResource.description"></textarea>
    </div>

    <div class="form-group">
      <label>Status</label>
      <select v-model="newResource.available">
        <option :value="1">Available</option>
        <option :value="0">Booked</option>
      </select>
    </div>

    <div class="modal-actions">
      <button class="btn-book" @click="addResource">Save</button>
      <button class="btn-close" @click="showAddModal = false">Cancel</button>
    </div>
  </div>
</div>

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
    loadingResources: true,
    resources: [],

    showModal: false,
    bookedResourceName: '',

    // 🔹 ADD THESE
    showAddModal: false,
    newResource: {
      name: '',
      description: '',
      available: 1
    }
  }
},


  methods: {
     formatDate(date) {
    return new Date(date).toLocaleString()
  },
 addResource() {
  if (!this.newResource.name || !this.newResource.description) {
    toastSuccess('All fields are required')
    return
  }

  axios.post('/api/resource-booking', {
    name: this.newResource.name,
    description: this.newResource.description
  })
  .then(() => {
    this.showAddModal = false

    this.newResource = {
      name: '',
      description: '',
      available: 1
    }

    toastSuccess('Resource booking request submitted')
  })
  .catch(() => {
    toastSuccess('Failed to submit request')
  })
},


    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    },

    bookResource(id) {
      const resource = this.resources.find(r => r.id === id)
      if (resource && resource.available) {
        resource.available = false
        this.bookedResourceName = resource.name
        this.showModal = true
      }
    },

   fetchResources() {
  this.loadingResources = true

  axios.get('/api/resource-bookings', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
  .then(res => {
    this.resources = res.data
    this.loadingResources = false
  })
  .catch(err => {
    console.error(err)
    this.loadingResources = false
    toastSuccess('Failed to load resources')
  })
}

  },

  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    this.fetchResources()

    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    }
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
    display: flex;
    font-size: 21px;
    border-bottom: 2px solid var(--primary);
    padding-bottom: 8px;
    text-transform: uppercase;
    justify-content: space-between;
    align-items: center;
}

/* Resources Grid */
.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

/* Resource Card */
.resource-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}
.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  color: white;
}
.status-badge.available {
  background: #28a745;
}
.status-badge.booked {
  background: #dc3545;
}

.btn-book {
  background: var(--primary);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  margin-top: 15px;
  transition: background 0.3s;
}
.btn-book:hover:not(:disabled) {
  background: #012a5c;
}
.btn-book:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}
.modal {
  background: #fff;
  padding: 30px 25px;
  border-radius: 15px;
  text-align: center;
  width: 300px;
}
.btn-close {
  margin-top: 20px;
  background: var(--primary);
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
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

  .resources-grid {
    grid-template-columns: 1fr;
  }
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.btn-add {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.btn-add i {
  margin-right: 6px;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
  display: block;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 7px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* Resource Card */
.resource-card {
  background: linear-gradient(145deg, #f9f9f9, #e6f0ff);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.08);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  position: relative;
  overflow: hidden;
}

.resource-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: rgba(255,255,255,0.1);
  transform: rotate(25deg);
  pointer-events: none;
}

.resource-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.15);
}

/* Resource Header */
.resource-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #0d3b66;
}

.status-badge {
  font-size: 13px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 50px;
  color: white;
  text-transform: uppercase;
}

.status-badge.available {
  background: #28a745;
  box-shadow: 0 3px 6px rgba(40,167,69,0.3);
}

.status-badge.booked {
  background: #dc3545;
  box-shadow: 0 3px 6px rgba(220,53,69,0.3);
}

/* Buttons */
.btn-book {
  background: #0d3b66;
  color: #fff;
  font-weight: 600;
  border: none;
  padding: 10px 14px;
  border-radius: 12px;
  width: 100%;
  margin-top: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-book:hover:not(:disabled) {
  background: #07407c;
  transform: scale(1.05);
}

.btn-book:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Text Styling */
.resource-card p {
  font-size: 14px;
  margin: 6px 0;
  color: #333;
}

.resource-card p strong {
  color: #0d3b66;
}

</style>
