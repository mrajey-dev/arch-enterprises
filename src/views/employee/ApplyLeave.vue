<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <!-- Leave Form -->
      <div class="leave-form-wrapper" v-if="!isMobile || !isSidebarVisible">
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
       
          <div class="mobile-title">
            <i class="fas fa-calendar-alt"></i>
            <span>Leave Application</span>
          </div>
         
        </div>

       
      
        
        <form @submit.prevent="submitForm" class="premium-form">
          <div class="form-grid-premium">
            <div class="form-field">
              <label><i class="fas fa-user"></i> Name</label>
              <input v-model="form.name" type="text" disabled class="readonly-field" />
            </div>

            <div class="form-field">
              <label><i class="fas fa-building"></i> Department</label>
              <input v-model="form.department" type="text" disabled class="readonly-field" />
            </div>

            <div class="form-field">
              <label><i class="fas fa-tag"></i> Leave Type <span class="required">*</span></label>
              <select v-model="form.leaveType" required>
                <option disabled value="">Select leave type</option>
                <option v-for="type in leaveTypes" :key="type.id" :value="type.leave_name">
                  {{ type.leave_name }}
                </option>
                <option value="Half Day">Half Day</option>
              </select>
              <p v-if="leaveWarning" class="warning-text">
                <i class="fas fa-exclamation-triangle"></i> {{ leaveWarning }}
              </p>
            </div>

            <div class="form-field" v-if="isHalfDay">
              <label><i class="fas fa-clock"></i> Time Slot <span class="required">*</span></label>
              <select v-model="form.timeSlot" required>
                <option disabled value="">Select time</option>
                <option value="9:30 AM - 1:30 PM">9:30 AM - 1:30 PM</option>
                <option value="1:30 PM - 5:30 PM">1:30 PM - 5:30 PM</option>
              </select>
            </div>

            <div class="form-field">
              <label><i class="fas fa-calendar-day"></i> From Date <span class="required">*</span></label>
              <input v-model="form.fromDate" type="date" :min="today" required />
            </div>

            <div class="form-field" :class="{ 'disabled-field': isHalfDay }">
              <label><i class="fas fa-calendar-day"></i> To Date</label>
              <input v-model="form.toDate" type="date" :min="form.fromDate || today" :disabled="isHalfDay" :required="!isHalfDay" />
              <small v-if="isHalfDay" class="field-note">Auto-set to same date for half day</small>
            </div>

            <div class="form-field full-width">
              <label>
                <i class="fas fa-comment"></i> Reason
                <span class="char-counter">{{ form.reason.length }}/250</span>
                <small v-if="isCasualLeave" class="optional">(optional)</small>
                <small v-else class="required-text">*</small>
              </label>
              <textarea v-model="form.reason" rows="4" maxlength="250" placeholder="Enter reason for leave" :required="!isCasualLeave"></textarea>
            </div>

            <div class="form-field full-width">
              <label><i class="fas fa-paperclip"></i> Attach Document <small class="optional">(optional)</small></label>
              <div class="file-upload-wrapper">
                <input type="file" @change="handleFileUpload" class="file-input" accept=".pdf,.doc,.docx,.jpg,.png" />
                <div class="file-upload-placeholder" v-if="!form.file">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <span>Click to upload or drag & drop</span>
                </div>
                <div class="file-uploaded" v-else>
                  <i class="fas fa-file"></i>
                  <span>{{ form.file.name }}</span>
                  <button type="button" class="remove-file" @click="removeFile">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <small class="file-hint">Supported: PDF, DOC, DOCX, JPG, PNG (Max 5MB)</small>
            </div>
          </div>

          <div v-if="submitError" class="error-alert">
            <i class="fas fa-times-circle"></i> {{ submitError }}
          </div>

          <div v-if="submitSuccessMsg" class="success-alert">
            <i class="fas fa-check-circle"></i> {{ submitSuccessMsg }}
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-submit-premium" :disabled="submitLoading">
              <span v-if="submitLoading">
                <i class="fas fa-spinner fa-spin"></i> Submitting...
              </span>
              <span v-else>
                <i class="fas fa-paper-plane"></i> Submit Leave Request
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from './components/Sidebar.vue'
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

export default {
  components: { Sidebar },

  data() {
    return {
      leaveWarning: '',
      submitLoading: false,
      submitSuccessMsg: '',
      userName: '',
      userDept: '',
      baseAllowances: { casual: 7, sick: 10, pl: 10 },
      leaveBalance: { casual: 7, sick: 10, pl: 10 },
      usedLeaves: { casual: 0, sick: 0, pl: 0 },
      leaveRequests: [],
      submitError: '',
      isMobile: false,
      isSidebarVisible: true,
      form: {
        leaveType: '',
        name: '',
        department: '',
        fromDate: '',
        toDate: '',
        reason: '',
        file: null,
        timeSlot: ''
      },
      leaveTypes: [],
      today: new Date().toISOString().split('T')[0],
      holidayMMDD: ['01-26', '08-15', '10-02'],
    }
  },

  computed: {
    isHalfDay() {
      return (this.form.leaveType || '').toLowerCase() === 'half day';
    },
    isCasualLeave() {
      return (this.form.leaveType || '').toLowerCase().includes('casual');
    },
    overlapWarning() {
      return this.findOverlapMessage();
    }
  },

  async mounted() {
    this.fetchLeaveTypes();
    this.fetchUserInfo();
    await this.fetchLeaveBalanceFromDB();
    this.fetchLeaves();
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.checkIfMobile);
  },

  watch: {
    'form.reason'(val) {
      if (val.length > 250) this.form.reason = val.slice(0, 250);
    },
    'form.fromDate': 'checkLeaveBalance',
    'form.toDate': 'checkLeaveBalance',
    'form.leaveType': 'checkLeaveBalance',
    leaveRequests: {
      handler: 'computeLeaveBalance',
      deep: true,
    },
  },

  methods: {
    getIconClass(key) {
      const icons = {
        casual: 'fas fa-umbrella-beach',
        sick: 'fas fa-ambulance',
        pl: 'fas fa-plane-departure',
        earn: 'fas fa-coins'
      };
      return icons[key] || 'fas fa-calendar';
    },
    viewLeaveHistory() {
      // Navigate to leave history or show modal
      this.$router.push('/leave-history');
    },
    removeFile() {
      this.form.file = null;
      const input = this.$el.querySelector('.file-input');
      if (input) input.value = '';
    },
    findOverlapMessage() {
      if (!this.form.fromDate || !this.form.toDate) return '';
      const clash = this.leaveRequests.find(lv =>
        this.isMine(lv) &&
        new Date(lv.fromDate) <= new Date(this.form.toDate) &&
        new Date(this.form.fromDate) <= new Date(lv.toDate)
      );
      return clash ? `⚠️ You already have a leave from ${clash.fromDate} to ${clash.toDate}` : '';
    },

    async checkLeaveBalance() {
      if (this.isHalfDay) {
        const casualRemaining = this.baseAllowances.casual - (this.usedLeaves.casual || 0);
        if (casualRemaining < 0.5) {
          this.submitError = `❌ You have only ${casualRemaining} casual leave left. Half-day requires 0.5 casual leave.`;
        } else {
          this.submitError = '';
        }
        this.leaveWarning = '';
        return;
      }

      this.submitError = '';
      this.leaveWarning = '';

      const { fromDate, toDate, leaveType } = this.form;
      if (!fromDate || !toDate || !leaveType) return;

      let leaveKey = (leaveType || '').toLowerCase().replace(' leave', '');
      if (leaveKey === 'medical') {
        leaveKey = 'sick';
      }
      
      const validKeys = ['casual', 'sick', 'pl'];
      if (!validKeys.includes(leaveKey)) return;

      const totalSelectedDays = this.daysBetween(fromDate, toDate);

      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://employees.archenterprises.co.in/api/api/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = res.data;

        const usedMap = {
          casual: user.cl_leave_used || 0,
          pl: user.pl_leave_used || 0,
          sick: user.sl_leave_used || 0,
        };

        const totalAllowed = this.baseAllowances[leaveKey] || 0;
        const alreadyUsed = usedMap[leaveKey] || 0;
        const remaining = totalAllowed - alreadyUsed;

        this.leaveWarning = `⚠️ You have ${remaining} ${this.beautify(leaveKey)} leave(s) remaining out of ${totalAllowed}.`;

        if (totalSelectedDays > remaining) {
          this.submitError = `❌ You have only ${remaining} ${this.beautify(leaveKey)} left. Please reduce your date range.`;
        } else {
          this.submitError = '';
        }
      } catch (err) {
        console.error('Error checking leave balance:', err);
        this.submitError = 'Unable to verify leave balance. Please try again.';
      }
    },

    async fetchLeaveBalanceFromDB() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://employees.archenterprises.co.in/api/api/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = res.data;

        const totals = { casual: 7, sick: 10, pl: 10 };
        const used = {
          casual: user.cl_leave_used || 0,
          sick: user.sl_leave_used || 0,
          pl: user.pl_leave_used || 0,
        };

        const remaining = {};
        for (const key in totals) {
          remaining[key] = totals[key] - used[key];
          if (remaining[key] < 0) remaining[key] = 0;
        }

        this.baseAllowances = totals;
        this.usedLeaves = used;
        this.leaveBalance = remaining;
      } catch (e) {
        console.error('Failed to fetch leave balance:', e);
      }
    },

    async fetchEarnLeaveCount() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`https://employees.archenterprises.co.in/api/api/earn-leave/${this.userName}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const count = res.data?.count || 0;
        this.baseAllowances.earn = count;
        this.leaveBalance.earn = count;
      } catch (e) {
        console.error('Failed to fetch Earn Leave count:', e);
      }
    },

    async sendAdminNotification(leaveId) {
      try {
        const token = localStorage.getItem('token');
        await axios.post('https://employees.archenterprises.co.in/api/api/leave-notify',
          { leave_id: leaveId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error('Admin email failed:', err);
      }
    },

    daysBetween(startStr, endStr) {
      const start = new Date(startStr);
      const end = new Date(endStr);
      if (end < start) return 0;
      const diff = Math.floor((end - start) / 86400000);
      return diff === 0 ? 1 : diff;
    },

    computeLeaveBalance() {
      const remaining = { ...this.baseAllowances };
      const used = { casual: 0, sick: 0, pl: 0 };

      const map = {
        'casual leave': 'casual', casual: 'casual',
        'sick leave': 'sick', sick: 'sick',
        'pl leave': 'pl', pl: 'pl',
        'medical leave': 'sick', medical: 'sick',
      };

      this.leaveRequests.forEach(lv => {
        if ((lv.status || '').toLowerCase().trim() !== 'approved' ||
            (lv.name || '').trim().toLowerCase() !== this.userName.trim().toLowerCase()) return;

        const leaveType = (lv.leave_type || lv.leaveType || '').toLowerCase();
        if (leaveType === 'half day' || lv.half_day) {
          used.casual += 0.5;
          remaining.casual -= 0.5;
        } else {
          const key = map[leaveType] || leaveType;
          if (!remaining.hasOwnProperty(key)) return;
          const days = this.daysBetween(lv.from_date || lv.fromDate, lv.to_date || lv.toDate);
          used[key] += days;
          remaining[key] -= days;
        }
      });

      Object.keys(remaining).forEach(k => {
        if (remaining[k] < 0) remaining[k] = 0;
      });

      this.usedLeaves = used;
      this.leaveBalance = remaining;
    },

    async fetchLeaves() {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('https://employees.archenterprises.co.in/api/api/leave-requests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.leaveRequests = data || [];
      } catch (e) {
        console.error('Failed to load leaves:', e);
      }
    },

    async fetchLeaveTypes() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://employees.archenterprises.co.in/api/api/leave-types', {
          headers: { Authorization: `Bearer ${token}` }
        });
        let leaveTypesData = res.data || [];
        leaveTypesData = leaveTypesData.filter(type => 
          type.leave_name && type.leave_name.toLowerCase() !== 'medical' && 
          type.leave_name.toLowerCase() !== 'medical leave'
        );
        this.leaveTypes = leaveTypesData;
        
        const allowances = { casual: 7, sick: 10, pl: 10 };
        this.leaveTypes.forEach(type => {
          const key = (type.leave_name || '').toLowerCase().replace(' leave', '');
          if (key === 'medical') return;
          if (allowances.hasOwnProperty(key)) {
            allowances[key] = parseInt(type.total_leaves) || allowances[key];
          }
        });
        this.baseAllowances = allowances;
        this.leaveBalance = { ...allowances };
      } catch (e) {
        console.error('Fetch leave types failed:', e);
        toastError('Could not load leave types.');
        this.baseAllowances = { casual: 7, sick: 10, pl: 10 };
        this.leaveBalance = { casual: 7, sick: 10, pl: 10 };
      }
    },

    async fetchUserInfo() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://employees.archenterprises.co.in/api/api/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const u = res.data;
        this.form.name = u.name;
        this.form.department = u.department;
        this.userName = u.name;
        this.userDept = u.department;
        this.usedLeaves = {
          casual: u.cl_leave_used || 0,
          pl: u.pl_leave_used || 0,
          sick: u.sl_leave_used || 0,
        };
        await this.fetchEarnLeaveCount();
        await this.fetchLeaveBalanceFromDB();
      } catch (e) {
        console.error('User info error:', e);
        toastError('Failed to fetch user details — please log in again.');
        this.$router.push('/auth');
      }
    },

    findOverlap() {
      if (!this.form.fromDate || !this.form.toDate) return null;
      const A = new Date(this.form.fromDate);
      const B = new Date(this.form.toDate);
      return this.leaveRequests.find(lv => {
        if (!this.isMine(lv)) return false;
        const C = new Date(lv.fromDate);
        const D = new Date(lv.toDate);
        return C <= B && A <= D;
      }) || null;
    },

    isMine(lv) {
      return lv.name === this.userName && lv.department === this.userDept;
    },

    async submitForm() {
      if (!this.isHalfDay && this.form.fromDate && this.form.toDate && new Date(this.form.fromDate) > new Date(this.form.toDate)) {
        this.submitError = 'From date cannot be after to date.';
        toastWarning(this.submitError);
        return;
      }

      const overlapMsg = this.findOverlapMessage();
      if (overlapMsg) {
        this.submitError = overlapMsg;
        toastWarning(this.submitError);
        return;
      }

      await this.checkLeaveBalance();
      if (this.submitError) {
        toastWarning(this.submitError);
        return;
      }

      let isLimitExceeded = false;
      if (this.usedLeaves.casual > 10 || this.usedLeaves.pl > 10 || this.usedLeaves.sick > 10) {
        isLimitExceeded = true;
        toastWarning("⚠️ Your leave limit is exceeded. This will NOT be counted in attendance.");
      }

      this.submitLoading = true;
      this.submitSuccessMsg = '';

      if (this.isHalfDay) {
        this.form.toDate = this.form.fromDate;
        if (!this.form.timeSlot) {
          this.submitError = 'Time slot is required for half-day leave.';
          toastWarning(this.submitError);
          return;
        }
      }

      try {
        const token = localStorage.getItem('token');
        const fd = new FormData();
        Object.entries(this.form).forEach(([k, v]) => { if (v) fd.append(k, v); });
        fd.append('limit_exceeded', isLimitExceeded ? 1 : 0);
        if (this.isHalfDay) fd.append('half_day', '1');

        const { data } = await axios.post('https://employees.archenterprises.co.in/api/api/leave-request', fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });

        if (this.isHalfDay) {
          await axios.post('https://employees.archenterprises.co.in/api/api/update-cl-leave', {
            name: this.form.name,
            department: this.form.department,
            increment: 0.5,
          }, { headers: { Authorization: `Bearer ${token}` } });
        }

        if (!this.isCasualLeave && !this.isHalfDay && !this.form.reason.trim()) {
          this.submitError = 'Reason is required for this leave type.';
          toastWarning(this.submitError);
          return;
        }

        await this.sendAdminNotification(data.leave_id);
        this.submitSuccessMsg = '✅ Leave request submitted successfully!';
        toastSuccess('Leave request submitted successfully!');
        this.resetForm();
        await this.fetchLeaves();
        await this.fetchLeaveBalanceFromDB();
      } catch (e) {
        console.error('Submit error:', e);
        this.submitError = 'Failed to process leave request.';
        toastError('Failed to process leave request.');
      } finally {
        this.submitLoading = false;
      }
    },

    handleFileUpload(e) { 
      this.form.file = e.target.files[0]; 
    },

    resetForm() {
      Object.assign(this.form, {
        leaveType: '', fromDate: '', toDate: '', reason: '', file: null, timeSlot: ''
      });
      this.submitError = '';
      this.submitSuccessMsg = '';
      this.leaveWarning = '';
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },

    toggleSidebar() { 
      this.isSidebarVisible = !this.isSidebarVisible; 
    },

    beautify(k) {
      const map = {
        casual: 'Casual',
        sick: 'Sick',
        pl: 'PL',
        earn: 'Earn'
      };
      return map[k.toLowerCase()] || `${k.charAt(0).toUpperCase()}${k.slice(1)}`;
    },

    logout() {
      const token = localStorage.getItem('token');
      axios.post('https://employees.archenterprises.co.in/api/api/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).finally(() => {
        localStorage.removeItem('token');
        this.$router.push('/auth');
      });
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Premium Variables */
:root {
  --primary: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%);
  --primary-color: #667eea;
  --dark: #1a1a2e;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

.leave-form-wrapper {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* Mobile Header */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--dark);
  padding: 8px;
  cursor: pointer;
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--dark);
}

.mobile-title i {
  color: var(--primary-color);
}

.mobile-status-badge {
  background: var(--primary);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-status-badge:hover {
  transform: scale(1.05);
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

/* Leave Balance Summary - Desktop */
.leave-balance-summary {
  display: flex;
  gap: 20px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.balance-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.balance-label {
  font-size: 13px;
  color: #6b7280;
}

.balance-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--dark);
}

/* Leave Balance Cards - Mobile */
.leave-balance-cards {
  display: none;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.balance-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 14px;
  transition: all 0.3s ease;
}

.balance-card:active {
  transform: scale(0.97);
}

.balance-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
}

.balance-icon.casual {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

.balance-icon.sick {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
}

.balance-icon.pl {
  background: linear-gradient(135deg, #34d399, #10b981);
}

.balance-icon.earn {
  background: linear-gradient(135deg, #a78bfa, #8b5cf6);
}

.balance-info {
  display: flex;
  flex-direction: column;
}

.balance-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--dark);
}

.balance-label {
  font-size: 11px;
  color: #6b7280;
}

/* Premium Form */
.premium-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-grid-premium {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field.full-width {
  grid-column: span 2;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-field label i {
  color: var(--primary-color);
}

.required {
  color: var(--danger);
}

.required-text {
  color: var(--danger);
  font-size: 11px;
}

.optional {
  color: #6b7280;
  font-size: 11px;
}

.char-counter {
  margin-left: auto;
  font-size: 11px;
  color: #9ca3af;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
  width: 100%;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.readonly-field {
  background: #f3f4f6;
  cursor: not-allowed;
}

.disabled-field {
  opacity: 0.7;
}

.field-note {
  font-size: 11px;
  color: #6b7280;
  font-style: italic;
}

/* File Upload */
.file-upload-wrapper {
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.file-upload-wrapper:hover {
  border-color: var(--primary-color);
  background: #f8faff;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.file-upload-placeholder {
  text-align: center;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.file-upload-placeholder i {
  font-size: 32px;
  color: #9ca3af;
}

.file-uploaded {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 8px;
}

.file-uploaded i {
  color: var(--primary-color);
}

.file-uploaded span {
  flex: 1;
  font-size: 13px;
  color: var(--dark);
  word-break: break-all;
}

.remove-file {
  background: none;
  border: none;
  color: var(--danger);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.remove-file:hover {
  background: #fee2e2;
}

.file-hint {
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
}

/* Alerts */
.error-alert, .success-alert {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.error-alert {
  background: #fee2e2;
  color: #991b1b;
}

.success-alert {
  background: #d1fae5;
  color: #065f46;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-submit-premium {
  padding: 12px 28px;
  background: var(--primary);
  border: none;
  border-radius: 14px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-submit-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-submit-premium:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Warning Text */
.warning-text {
  font-size: 12px;
  color: var(--warning);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

/* Responsive */
@media (max-width: 1024px) {
  .form-grid-premium {
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 12px;
  }

  .leave-form-wrapper {
    padding: 16px;
    border-radius: 20px;
  }

  .mobile-header {
    display: flex;
  }

  .content-header-modern {
    display: none;
  }

  .leave-balance-cards {
    display: grid;
  }

  .leave-balance-summary {
    display: none;
  }

  .form-grid-premium {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .form-field.full-width {
    grid-column: span 1;
  }

  .form-field input,
  .form-field select,
  .form-field textarea {
    font-size: 16px; /* Prevents iOS zoom */
    padding: 10px 12px;
  }

  .form-actions {
    justify-content: stretch;
  }

  .btn-submit-premium {
    width: 100%;
    justify-content: center;
    padding: 14px;
  }

  .file-upload-wrapper {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }

  .leave-form-wrapper {
    padding: 12px;
    border-radius: 16px;
  }

  .mobile-title {
    font-size: 16px;
  }

  .mobile-status-badge {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .leave-balance-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .balance-card {
    padding: 10px 12px;
  }

  .balance-icon {
    width: 34px;
    height: 34px;
    font-size: 14px;
  }

  .balance-value {
    font-size: 17px;
  }

  .balance-label {
    font-size: 10px;
  }

  .form-field label {
    font-size: 12px;
  }

  .form-field input,
  .form-field select,
  .form-field textarea {
    font-size: 15px;
    padding: 8px 10px;
  }

  .btn-submit-premium {
    font-size: 13px;
    padding: 12px;
  }

  .error-alert,
  .success-alert {
    font-size: 12px;
    padding: 10px 12px;
  }
}

@media (max-width: 380px) {
  .leave-balance-cards {
    grid-template-columns: 1fr;
  }

  .mobile-title {
    font-size: 14px;
  }

  .mobile-title i {
    font-size: 16px;
  }
}

/* Utility Classes */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
}

@media (min-width: 769px) {
  .mobile-only {
    display: none !important;
  }
}
</style>