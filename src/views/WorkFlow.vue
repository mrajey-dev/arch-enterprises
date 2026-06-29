<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div>
              <h1>Employee & Office Work Lifecycle</h1>
              <p class="subtitle-modern">Complete workflow from attendance to performance</p>
            </div>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar">
          <div class="stat-card">
            <i class="fas fa-users"></i>
            <div class="stat-info">
              <span class="stat-value">8</span>
              <span class="stat-label">Lifecycle Stages</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-sync-alt"></i>
            <div class="stat-info">
              <span class="stat-value">100%</span>
              <span class="stat-label">Process Coverage</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-trophy"></i>
            <div class="stat-info">
              <span class="stat-value">24/7</span>
              <span class="stat-label">Workflow Active</span>
            </div>
          </div>
        </div>

        <!-- Circular Workflow -->
        <div class="cycle-container">
          <div class="cycle-wrapper">
            <div class="cycle-glow"></div>
            <div class="cycle-center">
              <div class="center-icon">
                <i class="fas fa-building-user"></i>
              </div>
              <p>ARCH OFFICE</p>
              <span class="center-subtitle">Workflow</span>
            </div>

            <div class="cycle-item item1">
              <div class="item-icon">
                <i class="fas fa-user-check"></i>
              </div>
              <div class="item-content">
                <span class="item-title">Attendance & Login</span>
                <span class="item-desc">Mark daily presence</span>
              </div>
            </div>

            <div class="cycle-item item2">
              <div class="item-icon">
                <i class="fas fa-tasks"></i>
              </div>
              <div class="item-content">
                <span class="item-title">Task Allocation</span>
                <span class="item-desc">Assign responsibilities</span>
              </div>
            </div>

            <div class="cycle-item item3">
              <div class="item-icon">
                <i class="fas fa-laptop-code"></i>
              </div>
              <div class="item-content">
                <span class="item-title">Work Execution</span>
                <span class="item-desc">Complete assigned tasks</span>
              </div>
            </div>

            <div class="cycle-item item4">
              <div class="item-icon">
                <i class="fas fa-file-upload"></i>
              </div>
              <div class="item-content">
                <span class="item-title">Daily Reporting</span>
                <span class="item-desc">Submit work reports</span>
              </div>
            </div>

            <div class="cycle-item item5">
              <div class="item-icon">
                <i class="fas fa-user-shield"></i>
              </div>
              <div class="item-content">
                <span class="item-title">Office Review</span>
                <span class="item-desc">Manager evaluation</span>
              </div>
            </div>

            <div class="cycle-item item6">
              <div class="item-icon">
                <i class="fas fa-check-double"></i>
              </div>
              <div class="item-content">
                <span class="item-title">Approval</span>
                <span class="item-desc">Final confirmation</span>
              </div>
            </div>

            <div class="cycle-item item7">
              <div class="item-icon">
                <i class="fas fa-wallet"></i>
              </div>
              <div class="item-content">
                <span class="item-title">Payroll & Salary</span>
                <span class="item-desc">Monthly compensation</span>
              </div>
            </div>

            <div class="cycle-item item8">
              <div class="item-icon">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="item-content">
                <span class="item-title">Performance & Growth</span>
                <span class="item-desc">Career progression</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Legend Section -->
        <div class="legend-section">
          <div class="section-title-modern">
            <i class="fas fa-info-circle"></i>
            <span>Workflow Legend</span>
          </div>
          <div class="legend-grid">
            <div class="legend-item">
              <div class="legend-color start"></div>
              <span>Start</span>
            </div>
            <div class="legend-item">
              <div class="legend-color process"></div>
              <span>Process</span>
            </div>
            <div class="legend-item">
              <div class="legend-color review"></div>
              <span>Review</span>
            </div>
            <div class="legend-item">
              <div class="legend-color end"></div>
              <span>Completion</span>
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

/* Variables */
:root {
  --primary: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%);
  --primary-color: #667eea;
  --dark: #1a1a2e;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  /* background: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%); */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
   ;
}

.content {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* Content Header */
.content-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  width: 52px;
  height: 52px;
  background: var(--primary);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.content-header-modern h1 {
  font-size: 28px;
  font-weight: 700;
  background: var(--primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
}

.subtitle-modern {
  color: #6b7280;
  font-size: 14px;
  margin-top: 4px;
}

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-card i {
  font-size: 32px;
  color: var(--primary-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

/* Section Title */
.section-title-modern {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
}

.section-title-modern i {
  color: var(--primary-color);
  font-size: 18px;
}

/* Cycle Container */
.cycle-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 40px 0;
  padding: 20px;
}

.cycle-wrapper {
  position: relative;
  width: 500px;
  height: 500px;
  margin: 0 auto;
  border-radius: 50%;
  background: radial-gradient(circle at center, #ffffff 50%, #f8fafc);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.15);
  animation: pulseGlow 3s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 20px 40px -15px rgba(102, 126, 234, 0.15);
  }
  50% {
    box-shadow: 0 25px 50px -15px rgba(102, 126, 234, 0.3);
  }
}

.cycle-glow {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 50%;
  background: radial-gradient(circle at center, rgba(102, 126, 234, 0.1), transparent);
  pointer-events: none;
  animation: rotateGlow 20s linear infinite;
}

@keyframes rotateGlow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Cycle Center */
.cycle-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 140px;
  height: 140px;
  transform: translate(-50%, -50%);
  background: var(--primary);
  color: white;
  border-radius: 50%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
  z-index: 10;
  animation: centerPulse 2s ease-in-out infinite;
}

@keyframes centerPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05);
    box-shadow: 0 20px 45px rgba(102, 126, 234, 0.6);
  }
}

.center-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.center-icon i {
  font-size: 28px;
}

.cycle-center p {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  margin: 5px 0 2px;
}

.center-subtitle {
  font-size: 10px;
  opacity: 0.8;
}

/* Cycle Items */
.cycle-item {
  position: absolute;
  width: 160px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 5;
}

.cycle-item:hover {
  transform: translateY(-5px);
}

.cycle-item:hover .item-icon {
  transform: scale(1.1);
  background: var(--primary);
  color: white;
}

.item-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
}

.item-icon i {
  font-size: 22px;
  color: var(--primary-color);
  transition: all 0.3s ease;
}

.cycle-item:hover .item-icon i {
  color: white;
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-title {
  font-size: 12px;
  font-weight: 700;
  color: #1a1a2e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.item-desc {
  font-size: 10px;
  color: #6b7280;
}

/* Positioning around circle */
.item1 { top: -20px; left: 170px; }
.item2 { top: 50px; right: -30px; }
.item3 { top: 180px; right: -50px; }
.item4 { bottom: 50px; right: -30px; }
.item5 { bottom: -20px; left: 170px; }
.item6 { bottom: 50px; left: -30px; }
.item7 { top: 180px; left: -50px; }
.item8 { top: 50px; left: -30px; }

/* Legend Section */
.legend-section {
  margin-top: 40px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  border-radius: 20px;
  border: 1px solid #e5e7eb;
}

.legend-grid {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-color.start {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.legend-color.process {
  background: linear-gradient(135deg, #10b981, #059669);
}

.legend-color.review {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.legend-color.end {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.legend-item span {
  font-size: 13px;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 16px;
  }

  .content {
    padding: 20px;
  }

  .content-header-modern {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-bar {
    grid-template-columns: 1fr;
  }

  .cycle-wrapper {
    transform: scale(0.75);
    margin: -40px auto;
  }

  .legend-grid {
    gap: 15px;
  }

  .legend-item span {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .cycle-wrapper {
    transform: scale(0.6);
    margin: -80px auto;
  }
}

/* Animation for items */
.cycle-item {
  animation: fadeInUp 0.5s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.item1 { animation-delay: 0.1s; }
.item2 { animation-delay: 0.2s; }
.item3 { animation-delay: 0.3s; }
.item4 { animation-delay: 0.4s; }
.item5 { animation-delay: 0.5s; }
.item6 { animation-delay: 0.6s; }
.item7 { animation-delay: 0.7s; }
.item8 { animation-delay: 0.8s; }
</style>