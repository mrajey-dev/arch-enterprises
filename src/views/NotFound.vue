<template>
  <div class="not-found-container">
    <!-- Subtle Background Elements -->
    <div class="ambient-circle circle-1"></div>
    <div class="ambient-circle circle-2"></div>

    <div class="not-found-card">
      <!-- Brand Logo / Badge -->
      <div class="brand-header">
        <div class="brand-title">
          <span class="brand-main">ARCH</span>
          <span class="brand-accent">360°</span>
        </div>
      </div>

      <!-- Error Graphic -->
      <div class="visual-wrapper">
        <div class="big-404">404</div>
        <div class="icon-ring">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
      </div>

      <!-- Text Details -->
      <h1 class="error-title">Page Not Found</h1>
      <p class="error-message">
        The page you are trying to access does not exist, has been relocated, or is restricted for your role.
      </p>

      <!-- Action Buttons -->
      <div class="actions-group">
        <button type="button" class="btn-home" @click="goToDashboard">
          <i class="fas fa-home"></i>
          <span>Back to Dashboard</span>
        </button>
        <button type="button" class="btn-back" @click="goBack">
          <i class="fas fa-arrow-left"></i>
          <span>Go Back</span>
        </button>
      </div>

      <!-- Support Footer Note -->
      <div class="card-footer-note">
        <i class="fas fa-shield-alt"></i>
        <span>Arch 360 Security & Access Gateway</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  computed: {
    canGoBack() {
      return window.history.length > 1
    }
  },
  methods: {
    goToDashboard() {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const role = (user?.role || '').toLowerCase().trim();
        const dept = (user?.department || '').toLowerCase().trim();
        const token = localStorage.getItem('token') || localStorage.getItem('admin_token');

        if (!token) {
          this.$router.push('/auth');
          return;
        }

        // If admin/owner/management -> go to admin dashboard
        if (role === 'admin' || role === 'super_admin' || role === 'owner' || dept === 'admin') {
          this.$router.push('/dashboard');
        } else {
          // All other employees / HR -> employee dashboard
          this.$router.push('/employee/dashboard');
        }
      } catch (e) {
        this.$router.push('/auth');
      }
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        this.goToDashboard();
      }
    }
  }
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
  padding: 1.5rem;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.ambient-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  opacity: 0.45;
}

.circle-1 {
  width: 450px;
  height: 450px;
  background: rgba(37, 99, 235, 0.25);
  top: -100px;
  left: -100px;
}

.circle-2 {
  width: 400px;
  height: 400px;
  background: rgba(147, 51, 234, 0.2);
  bottom: -100px;
  right: -100px;
}

.not-found-card {
  position: relative;
  z-index: 10;
  max-width: 520px;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 28px;
  padding: 3rem 2.5rem 2.25rem;
  box-shadow: 0 20px 45px -12px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(226, 232, 240, 0.8);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand-header {
  margin-bottom: 1.75rem;
}

.brand-title {
  font-size: 1.65rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.brand-main {
  color: #0f172a;
}

.brand-accent {
  color: #2563eb;
  margin-left: 2px;
}

.visual-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.big-404 {
  font-size: 7.5rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 50%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  user-select: none;
}

.icon-ring {
  position: absolute;
  bottom: -4px;
  right: -10px;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #fef2f2;
  border: 2px solid #fee2e2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.error-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.01em;
}

.error-message {
  font-size: 0.975rem;
  line-height: 1.55;
  color: #64748b;
  margin: 0 0 2rem 0;
  max-width: 420px;
}

.actions-group {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: center;
  margin-bottom: 2rem;
}

.btn-home {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  border: none;
  padding: 0.85rem 1.6rem;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 6px 16px -2px rgba(37, 99, 235, 0.4);
}

.btn-home:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px -3px rgba(37, 99, 235, 0.5);
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
}

.btn-home:active {
  transform: translateY(0);
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 0.85rem 1.4rem;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: #e2e8f0;
  color: #0f172a;
  border-color: #94a3b8;
}

.card-footer-note {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #94a3b8;
  border-top: 1px solid #f1f5f9;
  padding-top: 1.25rem;
  width: 100%;
  justify-content: center;
}

.card-footer-note i {
  color: #3b82f6;
}

@media (max-width: 480px) {
  .not-found-card {
    padding: 2.25rem 1.5rem;
  }
  .big-404 {
    font-size: 5.5rem;
  }
  .actions-group {
    flex-direction: column;
  }
  .btn-home, .btn-back {
    width: 100%;
    justify-content: center;
  }
}
</style>

