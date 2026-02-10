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
    <option value="Rejected">Rejected</option>
  </select>
</div>


  <p><strong>Job Title:</strong> {{ candidate.job_title }}</p>
  <p><strong>Email:</strong> {{ candidate.email }}</p>
  <p><strong>Phone:</strong> {{ candidate.phone }}</p>
  <p
  class="message"
  :class="{ collapsed: !candidate.expanded }"
>
  <strong>Message:</strong>
  {{ candidate.message }}
</p>
 <p class="date">
    <strong>Applied On:</strong>
    {{ new Date(candidate.created_at).toLocaleDateString() }}
  </p>
<button
  v-if="candidate.resume"
  class="view-cv-btn"
  @click="viewCV(candidate.resume)"
>
  📄 View CV
</button>




 
<button
  v-if="candidate.message && candidate.message.length > 150"
  class="show-more-btn"
  @click="candidate.expanded = !candidate.expanded"
>
  {{ candidate.expanded ? '▲ Show less' : '▼ Show more' }}
</button>

</div>

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
      loadingLeaves: false,
       candidates: [],
    }
  },

  methods: {
  viewCV(path) {
  const RESUME_BASE_URL = 'https://it.archenterprises.co.in'
  window.open(`${RESUME_BASE_URL}/${path}`, '_blank')
},

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
    toastSuccess('Failed to update status')
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

    // 👇 add expanded flag per card
    this.candidates = res.data.data.map(candidate => ({
      ...candidate,
      expanded: false
    }))
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

.message {
  margin-top: 8px;
  line-height: 1.5;
  transition: max-height 0.3s ease;
}

.message.collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 3;   /* number of lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.show-more-btn {
  margin-top: 6px;
  background: none;
  border: none;
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.show-more-btn:hover {
  text-decoration: none;
}

.view-cv-btn {
  margin-top: 10px;
  background: #eef2ff;
  color: #3730a3;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.view-cv-btn:hover {
  background: #e0e7ff;
}

.show-more-btn {
  width: -webkit-fill-available;
    margin-top: 10px;
    display: inline-flex;
    align-items: center;
    place-content: center;
    gap: 6px;
    background: linear-gradient(135deg, #000000, #000000);
    color: #ffffff;
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all .25s ease;
    box-shadow: 0 4px 10px #00000014;
     text-decoration: none;
}

.show-more-btn:active {
  transform: translateY(0);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
}


@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
/* Grid layout */
.recruitment-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

/* Card */
.candidate-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.candidate-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.12);
}

/* Header */
.candidate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.candidate-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

/* Job title */
.candidate-card p strong {
  color: #555;
}

.candidate-card p {
  font-size: 14px;
  margin: 6px 0;
  color: #444;
}

/* Status select */
.status-select {
  padding: 5px 10px;
  border-radius: 20px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: #fff;
}

/* Status colors */
.status-select.pending {
  background: #f0ad4e;
}

.status-select.follow-up {
  background: #5bc0de;
}

.status-select.successful {
  background: #5cb85c;
}

/* Message */
.message {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: #555;
}

.message.collapsed {
  max-height: 45px;
  overflow: hidden;
  position: relative;
}

/* Show more */
.show-more-btn {
  background: none;
  border: none;
  color: #0d6efd;
  font-size: 13px;
  cursor: pointer;
  margin-top: 4px;
  padding: 0;
}

/* CV Button */
.view-cv-btn {
  margin-top: 10px;
  background: #0d6efd;
  color: #fff;
  border: none;
  padding: 7px 14px;
  border-radius: 5px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.view-cv-btn:hover {
  background: #0b5ed7;
}

/* Footer info */
.date {
  font-size: 12px;
  color: #777;
  margin-top: 10px;
}

.status-select.rejected {
  background: #dc3545; /* red */
  color: #ffffff;
}

</style>
