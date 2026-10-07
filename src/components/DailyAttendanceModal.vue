<template>
  <div>
    <!-- 🔒 Fullscreen Mandatory Attendance Modal (Cannot be closed until attendance is marked or leave is applied) -->
    <transition name="modal-pop">
      <div v-if="shouldShowModal" class="mandatory-attendance-overlay" @click.self="preventDismiss">
        <div class="mandatory-attendance-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          
          <!-- Top Accent Gradient Line -->
          <div class="card-accent-bar"></div>

          <!-- Header Section -->
          <div class="modal-header-section">
            <div class="header-icon-wrapper">
              <i class="fas fa-fingerprint"></i>
            </div>
            <div class="header-text-group">
              <div class="badge-row">
                <span class="status-pill-badge pending">
                  <i class="fas fa-exclamation-circle"></i> Attendance Pending
                </span>
                <span class="date-chip">
                  <i class="fas fa-calendar-day"></i> {{ formattedToday }}
                </span>
              </div>
              <h2 id="modal-title" class="modal-main-title">Daily Attendance Required</h2>
              <p class="modal-subtitle">
                Hello <strong>{{ userDisplayName }}</strong>, your attendance for today has not been recorded in the system. Please mark your attendance or apply for leave to continue.
              </p>
            </div>
          </div>

          <!-- Action Options (Redirect Cards) -->
          <div class="modal-body-section">
            <p class="section-instruction">Please choose an action to proceed:</p>

            <div class="action-cards-container">
              <!-- Option 1: Redirect to Mark Attendance -->
              <div class="action-card attendance-card" @click="goToAttendancePage">
                <div class="card-icon-box attendance-icon-box">
                  <i class="fas fa-fingerprint"></i>
                </div>
                <div class="card-content-box">
                  <div class="card-title-row">
                    <span class="card-title">Mark Daily Attendance</span>
                    <span class="card-badge green">Quick Punch</span>
                  </div>
                  <p class="card-description">
                    Clock in, select your status (Present, On Site, or Traveling), and start tracking your day.
                  </p>
                  <div class="card-action-link green-link">
                    <span>Go to Attendance Page</span>
                    <i class="fas fa-arrow-right"></i>
                  </div>
                </div>
              </div>

              <!-- Option 2: Redirect to Apply for Leave -->
              <div class="action-card leave-card" @click="goToApplyLeave">
                <div class="card-icon-box leave-icon-box">
                  <i class="fas fa-plane-departure"></i>
                </div>
                <div class="card-content-box">
                  <div class="card-title-row">
                    <span class="card-title">Apply for Leave</span>
                    <span class="card-badge indigo">Need Time Off</span>
                  </div>
                  <p class="card-description">
                    Submit an application for Casual Leave, Sick Leave, Privilege Leave, or Half Day.
                  </p>
                  <div class="card-action-link indigo-link">
                    <span>Go to Leave Application</span>
                    <i class="fas fa-arrow-right"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Notice Footer -->
          <div class="modal-footer-section">
            <i class="fas fa-info-circle"></i>
            <span>This window cannot be dismissed until your attendance or leave is recorded.</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';
import { toastWarning } from '@/utils/toast.js';

export default {
  name: 'DailyAttendanceModal',
  data() {
    return {
      checking: false,
      attendanceMarked: true, // Defaults to true until verification check runs
      checkTimer: null,
    };
  },

  computed: {
    isAdminOrHrUser() {
      // If admin token is set or authTab is admin
      if (localStorage.getItem('admin_token') || localStorage.getItem('authTab') === 'admin') {
        return true;
      }

      let userObj = {};
      try {
        userObj = JSON.parse(localStorage.getItem('user') || '{}');
      } catch (e) {}

      const role = String(userObj.role || '').toLowerCase().trim();
      const department = String(userObj.department || '').toLowerCase().trim();

      const adminRoles = ['admin', 'superadmin', 'administrator', 'hr', 'hr manager', 'hrmanager'];
      const adminDepts = ['hr', 'admin', 'administration', 'management', 'hr panel', 'admin panel'];

      return adminRoles.includes(role) || adminDepts.includes(department);
    },

    isAdminOrHrRoute() {
      const path = (this.$route?.path || '').toLowerCase();
      const meta = this.$route?.meta || {};

      // If route is flagged as adminOnly
      if (meta.adminOnly === true) return true;

      // Public / root auth routes
      if (path === '/' || path === '/auth' || meta.public === true) return true;

      // In this app, only employee routes start with /employee/
      // All other routes (/dashboard, /employees, /leaveapplications, /recruitmentsection, etc.) are admin/hr panel
      if (!path.startsWith('/employee/')) {
        return true;
      }

      return false;
    },

    isAuthenticated() {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const isAuthRoute = this.$route?.path === '/' || this.$route?.path === '/auth';
      return !!(token && user && !isAuthRoute && !this.isAdminOrHrUser);
    },

    userDisplayName() {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const user = JSON.parse(stored);
          return user.name || 'Employee';
        }
      } catch (e) {}
      return 'Employee';
    },

    todayDate() {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    formattedToday() {
      const d = new Date();
      return d.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },

    // Allow user to fill the forms on the Attendance or Leave pages without the blocking modal
    isExemptRoute() {
      const path = (this.$route?.path || '').toLowerCase();
      return (
        path.includes('/applyleave') ||
        path.includes('/empattendance') ||
        path.includes('/leaveapplication')
      );
    },

    shouldShowModal() {
      // Never show on admin panel, hr panel, or for admin/hr users
      if (this.isAdminOrHrUser || this.isAdminOrHrRoute) {
        return false;
      }
      return this.isAuthenticated && !this.attendanceMarked && !this.isExemptRoute;
    }
  },

  watch: {
    '$route.path': {
      immediate: true,
      handler(newPath) {
        if (newPath !== '/' && newPath !== '/auth') {
          this.checkTodayAttendance();
        }
      }
    }
  },

  mounted() {
    this.checkTodayAttendance();

    // Recheck on window focus (e.g. if marked in another tab)
    window.addEventListener('focus', this.checkTodayAttendance);
    window.addEventListener('auth-change', this.handleAuthChange);
    window.addEventListener('attendance-marked', this.handleAttendanceMarkedEvent);

    // Periodic check every 45 seconds
    this.checkTimer = setInterval(() => {
      if (this.isAuthenticated && !this.attendanceMarked) {
        this.checkTodayAttendance();
      }
    }, 45000);
  },

  beforeUnmount() {
    window.removeEventListener('focus', this.checkTodayAttendance);
    window.removeEventListener('auth-change', this.handleAuthChange);
    window.removeEventListener('attendance-marked', this.handleAttendanceMarkedEvent);
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }
  },

  methods: {
    handleAuthChange() {
      this.checkTodayAttendance();
    },

    handleAttendanceMarkedEvent() {
      this.attendanceMarked = true;
    },

    preventDismiss() {
      toastWarning('Please select "Mark Daily Attendance" or "Apply for Leave" to continue.');
    },

    async checkTodayAttendance() {
      // Never check or prompt for attendance on admin panel, hr panel, or for admin/hr users
      if (this.isAdminOrHrUser || this.isAdminOrHrRoute) {
        this.attendanceMarked = true;
        return;
      }

      const token = localStorage.getItem('token');
      if (!token || this.$route?.path === '/' || this.$route?.path === '/auth') {
        this.attendanceMarked = true;
        return;
      }

      let userName = '';
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        userName = u.name || '';
      } catch (e) {}

      this.checking = true;
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/attendance/check', {
          params: {
            date: this.todayDate,
            name: userName
          },
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = response.data;

        // Skip popup on Sundays or Holidays
        if (data.is_sunday || data.is_holiday) {
          this.attendanceMarked = true;
          return;
        }

        if (data && data.exists) {
          this.attendanceMarked = true;
        } else {
          this.attendanceMarked = false;
          const key = `attendance_${this.todayDate}_${userName}`;
          localStorage.removeItem(key);
        }
      } catch (err) {
        // Fallback check to /attendance/today
        try {
          const fallbackRes = await axios.get('https://employees.archenterprises.co.in/api/api/attendance/today', {
            params: {
              date: this.todayDate,
              name: userName
            },
            headers: { Authorization: `Bearer ${token}` }
          });
          const rec = fallbackRes.data?.data;
          if (rec && rec.status) {
            this.attendanceMarked = true;
          } else {
            this.attendanceMarked = false;
            const key = `attendance_${this.todayDate}_${userName}`;
            localStorage.removeItem(key);
          }
        } catch (subErr) {
          console.error('Attendance status check failed:', subErr);
        }
      } finally {
        this.checking = false;
      }
    },

    goToAttendancePage() {
      this.$router.push('/employee/empattendance');
    },

    goToApplyLeave() {
      this.$router.push('/employee/applyleave');
    }
  }
};
</script>

<style scoped>
/* =========================================================
   MANDATORY ATTENDANCE MODAL - REDIRECT SELECTION
   ========================================================= */

.mandatory-attendance-overlay {
  position: fixed;
  inset: 0;
  z-index: 999999;
  background: rgba(15, 23, 42, 0.82);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  overflow-y: auto;
}

.mandatory-attendance-card {
  width: 100%;
  max-width: 580px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 30px 70px -15px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.25);
  overflow: hidden;
  position: relative;
  animation: cardEntrance 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: inherit;
}

@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(24px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Top accent gradient bar */
.card-accent-bar {
  height: 6px;
  background: linear-gradient(90deg, #10b981 0%, #0d9488 40%, #6366f1 100%);
  width: 100%;
}

/* Header Section */
.modal-header-section {
  padding: 2rem 2.25rem 1.25rem;
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  border-bottom: 1px solid #f1f5f9;
}

.header-icon-wrapper {
  width: 58px;
  height: 58px;
  min-width: 58px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(13, 148, 136, 0.25) 100%);
  color: #0f766e;
  border: 1.5px solid rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.85rem;
  box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.25);
  animation: pulseIcon 2.6s infinite ease-in-out;
}

@keyframes pulseIcon {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.25);
  }
  50% {
    transform: scale(1.06);
    box-shadow: 0 14px 28px -5px rgba(16, 185, 129, 0.4);
  }
}

.header-text-group {
  flex: 1;
}

.badge-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.status-pill-badge {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.status-pill-badge.pending {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.date-chip {
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  background: #f8fafc;
  padding: 0.25rem 0.65rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.modal-main-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.modal-subtitle {
  margin: 0.45rem 0 0;
  font-size: 0.92rem;
  color: #475569;
  line-height: 1.5;
}

/* Body Section */
.modal-body-section {
  padding: 1.75rem 2.25rem;
}

.section-instruction {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  margin: 0 0 1rem;
}

/* Action Cards */
.action-cards-container {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.action-card {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.35rem;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  text-align: left;
}

.card-icon-box {
  width: 52px;
  height: 52px;
  min-width: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: transform 0.25s ease;
}

.card-content-box {
  flex: 1;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
  flex-wrap: wrap;
}

.card-title {
  font-size: 1.08rem;
  font-weight: 800;
  color: #0f172a;
}

.card-badge {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.2rem 0.55rem;
  border-radius: 12px;
}

.card-badge.green {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.card-badge.indigo {
  background: #eef2ff;
  color: #4338ca;
  border: 1px solid #c7d2fe;
}

.card-description {
  margin: 0 0 0.85rem;
  font-size: 0.86rem;
  color: #64748b;
  line-height: 1.45;
}

.card-action-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.88rem;
  font-weight: 700;
  transition: transform 0.2s ease, gap 0.2s ease;
}

/* Card 1: Attendance Card Style */
.attendance-card {
  background: #ffffff;
  border: 2px solid #e6f4ea;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.08);
}

.attendance-icon-box {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #059669;
  border: 1px solid #a7f3d0;
}

.green-link {
  color: #059669;
}

.attendance-card:hover {
  border-color: #10b981;
  background: #f7fdfa;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.18);
}

.attendance-card:hover .card-icon-box {
  transform: scale(1.06);
  background: #10b981;
  color: #ffffff;
}

.attendance-card:hover .card-action-link {
  gap: 0.7rem;
}

/* Card 2: Leave Card Style */
.leave-card {
  background: #ffffff;
  border: 2px solid #eef2ff;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.08);
}

.leave-icon-box {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  color: #4f46e5;
  border: 1px solid #c7d2fe;
}

.indigo-link {
  color: #4f46e5;
}

.leave-card:hover {
  border-color: #6366f1;
  background: #f9faff;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.18);
}

.leave-card:hover .card-icon-box {
  transform: scale(1.06);
  background: #6366f1;
  color: #ffffff;
}

.leave-card:hover .card-action-link {
  gap: 0.7rem;
}

/* Footer Section */
.modal-footer-section {
  padding: 1rem 2.25rem 1.35rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #64748b;
  text-align: center;
}

.modal-footer-section i {
  color: #0d9488;
}

/* Transitions */
.modal-pop-enter-active,
.modal-pop-leave-active {
  transition: opacity 0.3s ease;
}

.modal-pop-enter-from,
.modal-pop-leave-to {
  opacity: 0;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .mandatory-attendance-card {
    border-radius: 18px;
  }

  .modal-header-section {
    padding: 1.5rem 1.5rem 1rem;
    gap: 1rem;
  }

  .header-icon-wrapper {
    width: 48px;
    height: 48px;
    min-width: 48px;
    font-size: 1.5rem;
    border-radius: 14px;
  }

  .modal-main-title {
    font-size: 1.25rem;
  }

  .modal-body-section {
    padding: 1.25rem 1.5rem;
  }

  .action-card {
    padding: 1.15rem;
    gap: 1rem;
  }

  .card-icon-box {
    width: 44px;
    height: 44px;
    min-width: 44px;
    font-size: 1.25rem;
  }

  .card-title {
    font-size: 0.98rem;
  }
}
</style>
