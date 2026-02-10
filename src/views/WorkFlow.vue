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
      <i
        class="fas fa-bars mobile-menu-icon"
        @click="toggleSidebar"
        v-if="isMobile"
      ></i>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section
        class="content"
        :class="{ 'expanded-content': isMobile && !isSidebarVisible }"
      >
        <h2>Employee & Office Work Lifecycle</h2>

        <!-- CIRCULAR WORKFLOW -->
        <div class="cycle-wrapper">
          <div class="cycle-center">
            <i class="fas fa-building-user"></i>
            <p>ARCH OFFICE</p>
          </div>

          <div class="cycle-item item1">
            <i class="fas fa-user-check"></i>
            <span>Attendance & Login</span>
          </div>

          <div class="cycle-item item2">
            <i class="fas fa-tasks"></i>
            <span>Task Allocation</span>
          </div>

          <div class="cycle-item item3">
            <i class="fas fa-laptop-code"></i>
            <span>Work Execution</span>
          </div>

          <div class="cycle-item item4">
            <i class="fas fa-file-upload"></i>
            <span>Daily Reporting</span>
          </div>

          <div class="cycle-item item5">
            <i class="fas fa-user-shield"></i>
            <span>Office Review</span>
          </div>

          <div class="cycle-item item6">
            <i class="fas fa-check-double"></i>
            <span>Approval</span>
          </div>

          <div class="cycle-item item7">
            <i class="fas fa-wallet"></i>
            <span>Payroll & Salary</span>
          </div>

          <div class="cycle-item item8">
            <i class="fas fa-chart-line"></i>
            <span>Performance & Growth</span>
          </div>
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

/* ===== EXISTING LAYOUT STYLES ===== */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text);
}

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
      font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;

}

.mobile-menu-icon {
  font-size: 22px;
  cursor: pointer;
  display: none;
}

.main-content {
  display: flex;
  flex: 1;
  padding: 30px;
  gap: 20px;
}

.content {
  flex: 1;
  /* background-color: var(--sidebar); */
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

/* ===== CIRCULAR WORKFLOW ===== */
.cycle-wrapper {
  position: relative;
  width: 450px;
  height: 450px;
  margin: 40px auto;
  border-radius: 50%;
  background: radial-gradient(circle, #ffffff 55%, var(--sidebar));
}

.cycle-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 130px;
  height: 98px;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, var(--primary), #0b5ed7);
  color: white;
  border-radius: 50%;
  text-align: center;
  padding-top: 32px;
  box-shadow: 0 12px 35px rgba(0,0,0,0.25);
}

.cycle-center i {
  font-size: 30px;
  margin-bottom: 6px;
}

.cycle-center p {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.cycle-item {
  position: absolute;
  width: 140px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.cycle-item i {
  display: block;
  font-size: 22px;
  color: var(--primary);
  margin-bottom: 6px;
  transition: 0.3s;
}

/* Positioning around circle */
.item1 { top: -10px; left: 155px; }
.item2 { top: 60px; right: -15px; }
.item3 { top: 185px; right: -35px; }
.item4 { bottom: 60px; right: -15px; }
.item5 { bottom: -10px; left: 155px; }
.item6 { bottom: 60px; left: -15px; }
.item7 { top: 185px; left: -35px; }
.item8 { top: 60px; left: -15px; }

.cycle-item:hover i {
  transform: scale(1.3);
  color: #16a34a;
}

/* ===== MOBILE ===== */
@media (max-width: 768px) {
  .mobile-menu-icon {
    display: inline-block;
  }

  .main-content {
    flex-direction: column;
    padding: 20px 15px;
  }

  .cycle-wrapper {
    transform: scale(0.85);
  }
}
</style>
