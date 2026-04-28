<template>
  <div class="layout">

    <!-- Leave Balance Modal -->
    <transition name="modal-fade">
      <div v-if="showBalanceModal" class="modal-premium" @click.self="showBalanceModal = false">
        <div class="modal-premium-container small">
          <div class="modal-premium-header">
            <div class="modal-icon">
              <i class="fas fa-chart-pie"></i>
            </div>
            <h2>Leave Balance</h2>
            <button class="modal-close" @click="showBalanceModal = false">×</button>
          </div>
          <div class="modal-premium-body">
            <div class="balance-list">
              <div v-for="(total, type) in baseAllowances" :key="type" class="balance-item">
                <div class="balance-info">
                  <span class="balance-type">{{ beautify(type) }}</span>
                  <span class="balance-days">
                    <span class="used">{{ usedLeaves[type] || 0 }}</span> / 
                    <span class="total">{{ total }}</span>
                  </span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: getProgressPercentage(type) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-premium-footer">
            <button class="btn-primary-modern" @click="showBalanceModal = false">
              <i class="fas fa-check"></i> Close
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <!-- Leave Form -->
      <div class="leave-form-wrapper" v-if="!isMobile || !isSidebarVisible">
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div>
              <h1>Leave Application</h1>
              <p class="subtitle-modern">Submit your leave request</p>
            </div>
          </div>
          <button class="balance-btn" @click="showBalanceModal = true">
            <i class="fas fa-chart-line"></i> Leave Balance
          </button>
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
                <option value="9:30 AM - 2:30 PM">9:30 AM - 1:30 PM</option>
                <option value="2:30 PM - 5:30 PM">1:30 PM - 5:30 PM</option>
              </select>
            </div>

            <div class="form-field">
              <label><i class="fas fa-calendar-day"></i> From Date <span class="required">*</span></label>
              <input v-model="form.fromDate" type="date" :min="today" required />
            </div>

            <div class="form-field">
              <label><i class="fas fa-calendar-day"></i> To Date</label>
              <input v-model="form.toDate" type="date" :min="form.fromDate || today" :disabled="isHalfDay" :required="!isHalfDay" />
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
              <input type="file" @change="handleFileUpload" class="file-input" />
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
      // Medical leave removed - only casual, sick, and PL remain
      baseAllowances: { casual: 7, sick: 10, pl: 10 },
      leaveBalance: { casual: 7, sick: 10, pl: 10 },
      usedLeaves: { casual: 0, sick: 0, pl: 0 },
      showBalanceModal: false,
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
    getProgressPercentage(type) {
      const total = this.baseAllowances[type] || 1;
      const used = this.usedLeaves[type] || 0;
      return Math.min((used / total) * 100, 100);
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

      // Map leave types - medical removed
      let leaveKey = (leaveType || '').toLowerCase().replace(' leave', '');
      // Handle possible "medical" value if still coming from API
      if (leaveKey === 'medical') {
        leaveKey = 'sick'; // Map medical to sick leave
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

        // Medical removed - using sick for medical cases
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

        // Medical leave removed - only casual, sick, pl
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
      // Medical removed from used tracking
      const used = { casual: 0, sick: 0, pl: 0 };

      const map = {
        'casual leave': 'casual', casual: 'casual',
        'sick leave': 'sick', sick: 'sick',
        'pl leave': 'pl', pl: 'pl',
        // Map any medical entries to sick
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
        // Filter out medical leave types from the API response
        let leaveTypesData = res.data || [];
        leaveTypesData = leaveTypesData.filter(type => 
          type.leave_name && type.leave_name.toLowerCase() !== 'medical' && 
          type.leave_name.toLowerCase() !== 'medical leave'
        );
        this.leaveTypes = leaveTypesData;
        
        const allowances = { casual: 7, sick: 10, pl: 10 };
        this.leaveTypes.forEach(type => {
          const key = (type.leave_name || '').toLowerCase().replace(' leave', '');
          // Skip medical if somehow still present
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
        // Set defaults without medical
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
        // Medical removed from used leaves
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

    handleFileUpload(e) { this.form.file = e.target.files[0]; },

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

    toggleSidebar() { this.isSidebarVisible = !this.isSidebarVisible; },

    beautify(k) {
      const map = {
        casual: 'Casual Leave',
        sick: 'Sick Leave',
        pl: 'PL Leave',
        earn: 'Earn Leave'
      };
      return map[k.toLowerCase()] || `${k.charAt(0).toUpperCase()}${k.slice(1)} Leave`;
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
  --primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
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

.leave-form-wrapper {
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

.balance-btn {
  padding: 10px 22px;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.balance-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
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

.file-input {
  padding: 10px 0;
}

.warning-text {
  font-size: 12px;
  color: var(--warning);
  display: flex;
  align-items: center;
  gap: 6px;
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

/* Modal Styles */
.modal-premium {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  animation: modalBackdropIn 0.3s ease;
}

@keyframes modalBackdropIn {
  from { opacity: 0; backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(10px); }
}

.modal-premium-container {
  background: white;
  border-radius: 32px;
  width: 100%;
  max-width: 450px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.modal-premium-container.small { max-width: 400px; }

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-premium-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.modal-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 20px;
}

.modal-premium-header h2 {
  flex: 1;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #1a1a2e;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;
  font-size: 18px;
}

.modal-close:hover {
  /* background: var(--danger); */
  color: rgb(1, 0, 0);
  transform: rotate(90deg);
}

.modal-premium-body {
  padding: 24px;
  background: #fafbfc;
}

.modal-premium-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.btn-primary-modern {
  padding: 10px 20px;
  background: var(--primary);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

/* Balance List */
.balance-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.balance-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.balance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-type {
  font-weight: 600;
  color: #1a1a2e;
}

.balance-days {
  font-size: 13px;
  color: #6b7280;
}

.balance-days .used {
  font-weight: 700;
  color: var(--primary-color);
}

.balance-days .total {
  font-weight: 500;
}

.progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 10px;
  transition: width 0.3s ease;
}

/* Modal Fade */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 16px;
  }

  .leave-form-wrapper {
    padding: 20px;
  }

  .content-header-modern {
    flex-direction: column;
    align-items: stretch;
  }

  .balance-btn {
    justify-content: center;
  }

  .form-grid-premium {
    grid-template-columns: 1fr;
  }

  .form-field.full-width {
    grid-column: span 1;
  }

  .modal-premium-container {
    max-width: 95%;
  }

  .modal-premium-header {
    padding: 16px 20px;
  }

  .modal-premium-body {
    padding: 20px;
  }

  .modal-premium-footer {
    padding: 16px 20px;
  }
}
</style>