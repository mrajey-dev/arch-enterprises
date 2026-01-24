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
        <h2>Resource Booking</h2>

        <!-- Loading Spinner -->
        <div v-if="loadingResources" class="text-center my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
          <p>Loading resources...</p>
        </div>

        <!-- Resource Cards -->
        <div v-else class="resources-grid">
          <div v-for="resource in resources" :key="resource.id" class="resource-card">
            <div class="resource-header">
              <h3>{{ resource.name }}</h3>
              <span
                class="status-badge"
                :class="resource.available ? 'available' : 'booked'"
              >
                {{ resource.available ? 'Available' : 'Booked' }}
              </span>
            </div>
            <p>{{ resource.description }}</p>

            <button
              :disabled="!resource.available"
              class="btn-book"
              @click="bookResource(resource.id)"
            >
              Book Now
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
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'

export default {
  components: { Sidebar },

  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      loadingResources: true,
      resources: [],
      showModal: false,
      bookedResourceName: ''
    }
  },

  methods: {
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
      // Simulate API call (replace with real API later)
      setTimeout(() => {
        this.resources = [
  { id: 1, name: 'Meeting Room A', description: 'Seats 10 people', available: true },
  { id: 2, name: 'Meeting Room B', description: 'Seats 20 people', available: true },
  { id: 3, name: 'Conference Room C', description: 'Seats 30 people with projector', available: false },
  { id: 4, name: 'Meeting Room D', description: 'Seats 8 people', available: true },

  { id: 5, name: 'Whiteboard', description: 'Magnetic whiteboard with markers', available: true },
  { id: 6, name: 'Video Conferencing Kit', description: 'Zoom Room Kit', available: false },
  { id: 7, name: 'Company Car', description: 'Toyota Innova Crysta', available: true },
  { id: 8, name: 'Projector Screen', description: '120-inch retractable screen', available: true },
];

        this.loadingResources = false
      }, 1000)
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
  font-size: 21px;
  border-bottom: 2px solid var(--primary);
  padding-bottom: 8px;
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
</style>
