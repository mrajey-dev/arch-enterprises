

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
  <h2>Title</h2>
  
<div v-if="loadingLeaves" class="text-center my-4">
  <div class="spinner-border text-primary" role="status">
    <span class="sr-only">Loading...</span>
  </div>
  <p>Loading...</p>
</div>


</section>

    </div>
  </div>
</template>

<script>
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
      isSidebarVisible: true
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
  background-color:#a5d5cf33;
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


</style>