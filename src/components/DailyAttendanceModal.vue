<template>
  <div>
    <!-- 🔒 Fullscreen Mandatory Attendance Modal -->
    <transition name="modal-pop">
      <div v-if="shouldShowModal" class="attendance-overlay" @click.self="preventDismiss">
        <div class="attendance-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          
          <!-- Top Accent Line -->
          <div class="card-accent-line"></div>

          <div class="card-body">
            <!-- Icon Bubble -->
            <div class="icon-bubble">
              <i class="fas fa-fingerprint"></i>
            </div>

            <!-- Badges -->
            <div class="badges-wrap">
              <span class="status-pill pending">
                <span class="pulsing-dot"></span> Attendance Pending
              </span>
              <span v-if="isProbation" class="status-pill probation">
                <i class="fas fa-user-clock"></i> {{ probationDaysLeft }} Days Probation
              </span>
            </div>

            <!-- Title & Date -->
            <h2 id="modal-title" class="modal-title">Daily Attendance Required</h2>
            <div class="modal-date">
              <i class="far fa-calendar-alt"></i>
              <span>{{ formattedToday }}</span>
            </div>

            <!-- Friendly Message -->
            <p class="modal-message">
              Hello <strong>{{ userDisplayName }}</strong>, please mark your attendance to get started with your workday.
            </p>

            <!-- Probation Notice (Clean & Compact) -->
            <div v-if="isProbation" class="probation-alert">
              <i class="fas fa-info-circle alert-icon"></i>
              <span>
                <strong>Probation Policy:</strong> Unmarked attendance is automatically recorded as <strong>Unpaid Leave</strong>. Leaves cannot be applied during probation.
              </span>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <!-- Primary: Mark Attendance -->
              <button class="btn-primary" @click="goToAttendancePage">
                <i class="fas fa-fingerprint"></i>
                <span>Mark Attendance Now</span>
                <i class="fas fa-arrow-right btn-arrow"></i>
              </button>

              <!-- Secondary: Apply for Leave (Only for non-probation) -->
              <button v-if="!isProbation" class="btn-secondary" @click="goToApplyLeave">
                <i class="fas fa-calendar-minus"></i>
                <span>Apply for Leave</span>
              </button>

              <!-- Locked note if in probation -->
              <div v-else class="probation-leave-locked">
                <i class="fas fa-lock"></i>
                <span>Leave application is disabled during probation</span>
              </div>
            </div>

            <!-- Footer Hint -->
            <div class="modal-footer-note">
              <i class="fas fa-shield-alt"></i>
              <span>Required to continue to your dashboard</span>
            </div>
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

    currentUserObj() {
      try {
        return JSON.parse(localStorage.getItem('user') || '{}');
      } catch (e) {
        return {};
      }
    },

    isProbation() {
      if (this.currentUserObj.is_probation !== undefined) {
        return Boolean(this.currentUserObj.is_probation);
      }
      if (this.currentUserObj.created_at) {
        const diff = Math.floor((new Date() - new Date(this.currentUserObj.created_at)) / (1000 * 60 * 60 * 24));
        return diff < 90;
      }
      return false;
    },

    probationDaysLeft() {
      if (this.currentUserObj.probation_days_left !== undefined) {
        return this.currentUserObj.probation_days_left;
      }
      if (this.currentUserObj.created_at) {
        const diff = Math.floor((new Date() - new Date(this.currentUserObj.created_at)) / (1000 * 60 * 60 * 24));
        return Math.max(0, 90 - diff);
      }
      return 0;
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
      if (this.isProbation) {
        toastWarning('Please mark your daily attendance to continue.');
      } else {
        toastWarning('Please mark attendance or apply for leave to continue.');
      }
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
   CLEAN & NICE ATTENDANCE POPUP
   ========================================================= */

.attendance-overlay {
  position: fixed;
  inset: 0;
  z-index: 999999;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  overflow-y: auto;
}

.attendance-card {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.3),
              0 0 0 1px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  position: relative;
  text-align: center;
  animation: modalEnter 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(12px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Subtle accent header line */
.card-accent-line {
  height: 4px;
  background: linear-gradient(90deg, #10b981 0%, #06b6d4 100%);
  width: 100%;
}

.card-body {
  padding: 2rem 1.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Icon Bubble */
.icon-bubble {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #059669;
  border: 2px solid #a7f3d0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.65rem;
  box-shadow: 0 8px 18px -4px rgba(16, 185, 129, 0.25);
  margin-bottom: 1rem;
}

/* Badges */
.badges-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.85rem;
}

.status-pill {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.status-pill.pending {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fee2e2;
}

.pulsing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #dc2626;
  box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.6);
  animation: pulseDot 1.8s infinite;
}

@keyframes pulseDot {
  0% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.6);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(220, 38, 38, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
  }
}

.status-pill.probation {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

/* Title & Date */
.modal-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.modal-date {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: #64748b;
  margin-top: 0.35rem;
  font-weight: 500;
}

.modal-message {
  margin: 0.75rem 0 0;
  font-size: 0.92rem;
  color: #475569;
  line-height: 1.5;
}

/* Probation Alert Banner */
.probation-alert {
  margin-top: 1rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  display: flex;
  align-items: flex-start;
  text-align: left;
  gap: 0.65rem;
  font-size: 0.82rem;
  color: #92400e;
  line-height: 1.45;
  width: 100%;
}

.alert-icon {
  font-size: 1rem;
  color: #d97706;
  margin-top: 0.15rem;
  flex-shrink: 0;
}

/* Action Buttons */
.action-buttons {
  margin-top: 1.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.85rem 1.25rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-arrow {
  font-size: 0.85rem;
  transition: transform 0.2s ease;
}

.btn-primary:hover .btn-arrow {
  transform: translateX(3px);
}

.btn-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1.25rem;
  background: #f8fafc;
  color: #475569;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

.probation-leave-locked {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: #94a3b8;
  padding: 0.25rem 0;
}

/* Footer Note */
.modal-footer-note {
  margin-top: 1.15rem;
  padding-top: 0.85rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  font-size: 0.76rem;
  color: #94a3b8;
  width: 100%;
}

.modal-footer-note i {
  color: #10b981;
}

/* Modal Transition */
.modal-pop-enter-active,
.modal-pop-leave-active {
  transition: opacity 0.25s ease;
}

.modal-pop-enter-active .attendance-card,
.modal-pop-leave-active .attendance-card {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}

.modal-pop-enter-from,
.modal-pop-leave-to {
  opacity: 0;
}

.modal-pop-enter-from .attendance-card {
  opacity: 0;
  transform: scale(0.95) translateY(12px);
}

.modal-pop-leave-to .attendance-card {
  opacity: 0;
  transform: scale(0.95) translateY(12px);
}

/* Mobile adjustments */
@media (max-width: 480px) {
  .card-body {
    padding: 1.75rem 1.25rem 1.25rem;
  }
  .modal-title {
    font-size: 1.2rem;
  }
  .btn-primary {
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
