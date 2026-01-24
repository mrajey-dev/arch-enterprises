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
        <h2>Recruitment</h2>

        <div v-if="loadingLeaves" class="text-center my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
          <p>Loading...</p>
        </div>

        <!-- Recruitment Cards -->
        <div class="recruitment-cards">
          <div class="candidate-card" v-for="candidate in candidates" :key="candidate.id">
            <div class="candidate-header">
              <h3>{{ candidate.name }}</h3>
              <span :class="['status', candidate.status.toLowerCase().replace(' ', '-')]">
                {{ candidate.status }}
              </span>
            </div>
            <p><strong>Position:</strong> {{ candidate.position }}</p>
            <p><strong>Email:</strong> {{ candidate.email }}</p>
            <p><strong>Phone:</strong> {{ candidate.phone }}</p>
            <div class="card-footer">
              <button @click="viewProfile(candidate.id)">View Profile</button>
            </div>
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
      loadingLeaves: false,
      candidates: [
        { id: 1, name: 'Ajay Sharma', position: 'Frontend Developer', email: 'ajay@example.com', phone: '+91 9876543210', status: 'Pending' },
        { id: 2, name: 'Riya Singh', position: 'Backend Developer', email: 'riya@example.com', phone: '+91 9123456789', status: 'Approved' },
        { id: 3, name: 'Vikram Patel', position: 'UI/UX Designer', email: 'vikram@example.com', phone: '+91 9988776655', status: 'Follow Up' },
        { id: 4, name: 'Neha Joshi', position: 'QA Engineer', email: 'neha@example.com', phone: '+91 9871234567', status: 'Rejected' }
      ]
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

    goTo(route) {
      this.$router.push(`/${route}`)
    },

    viewProfile(id) {
      alert(`View profile for candidate ID: ${id}`)
    }
  },

  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)

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
  background: #f5f6fa;
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

/* Recruitment Cards */
.recruitment-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.candidate-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.candidate-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.candidate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.candidate-header h3 {
  font-size: 18px;
  margin: 0;
  color: var(--primary);
}

.status {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  color: #fff;
  font-weight: 600;
  text-transform: uppercase;
}

.status.pending { background: #f59e0b; }       /* amber */
.status.approved { background: #10b981; }      /* green */
.status.follow-up { background: #3b82f6; }    /* blue */
.status.rejected { background: #ef4444; }     /* red */

.card-footer {
  margin-top: 15px;
  text-align: right;
}

.card-footer button {
  background-color: var(--primary);
  color: white;
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.card-footer button:hover {
  background-color: #0256b3;
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

  .recruitment-cards {
    grid-template-columns: 1fr;
  }
}
</style>
