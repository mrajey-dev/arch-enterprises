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

  <select
  class="status-select"
  :class="candidate.status.toLowerCase().replace(' ', '-')"
  v-model="candidate.status"
  @change="updateStatus(candidate)"
>

    <option value="Pending">Pending</option>
    <option value="Follow Up">Follow Up</option>
    <option value="Successful">Successful</option>
  </select>
</div>


  <p><strong>Position:</strong> {{ candidate.position }}</p>
  <p><strong>Email:</strong> {{ candidate.email }}</p>
  <p><strong>Phone:</strong> {{ candidate.phone }}</p>
  <p><strong>Message:</strong> {{ candidate.message }}</p>

  <p class="date">
    <strong>Applied On:</strong>
    {{ new Date(candidate.created_at).toLocaleDateString() }}
  </p>

</div>

        </div>
      </section>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'

export default {
  components: { Sidebar },

  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      loadingLeaves: false,
       candidates: [],
    }
  },

  methods: {
    async updateStatus(candidate) {
  try {
    const token = localStorage.getItem('token')

    await axios.patch(
      `/api/recruitment/${candidate.id}/status`,
      { status: candidate.status },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
  } catch (error) {
    console.error(error)
    alert('Failed to update status')
  }
},

    async fetchCandidates() {
    this.loadingLeaves = true
    try {
      const token = localStorage.getItem('token')

      const res = await axios.get('/api/recruitment', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      this.candidates = res.data.data
    } catch (error) {
      console.error(error)
    } finally {
      this.loadingLeaves = false
    }
  },
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
    this.$router.push(`/recruitment/${id}`)
  }
  },

  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)

    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    }
      this.fetchCandidates()
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
.status-select {
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.status-select.pending {
  background: #fff3cd;
  color: #856404;
}

.status-select.follow-up {
  background: #d1ecf1;
  color: #0c5460;
}

.status-select.successful {
  background: #d4edda;
  color: #155724;
}

</style>
