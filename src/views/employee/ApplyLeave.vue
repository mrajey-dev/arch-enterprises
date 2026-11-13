<template>
  <div class="layout">
    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section
        class="content"
        v-show="!isMobile || !isSidebarVisible"
        :class="{ 'expanded-content': isMobile && !isSidebarVisible }"
      >
        <!-- 📱 Mobile Top Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <i class="fas fa-paper-plane text-teal"></i>
            <span>Apply for Leave</span>
          </div>
          <div class="mobile-header-actions">
            <button class="btn-mobile-secondary" @click="$router.push('/employee/leaveapplicationsemp')">
              <i class="fas fa-list"></i>
            </button>
            <button class="btn-mobile-menu" @click="toggleSidebar" aria-label="Toggle menu">
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </div>

        <!-- 🏢 Modern Enterprise Header Banner -->
        <header class="executive-header">
          <div class="header-main">
            <div class="header-badge-row">
              <span class="portal-badge-pill">
                <span class="pulse-indicator"></span>
                <span>EMPLOYEE SELF-SERVICE</span>
              </span>
              <span class="status-meta-pill">
                <i class="fas fa-bolt text-teal"></i> Direct Approval Workflow
              </span>
            </div>
            <div class="title-with-icon">
              <div class="header-icon-box">
                <i class="fas fa-paper-plane"></i>
              </div>
              <div>
                <h1 class="header-title">Apply for Leave</h1>
                <p class="header-subtitle">Submit a new leave request or half-day notification for manager and HR approval</p>
              </div>
            </div>
          </div>

          <div class="header-actions">
            <button class="btn-secondary-action" @click="$router.push('/employee/myleavebalance')">
              <i class="fas fa-balance-scale"></i>
              <span>My Balance</span>
            </button>
            <button class="btn-secondary-action" @click="$router.push('/employee/leaveapplicationsemp')">
              <i class="fas fa-list"></i>
              <span>All Leaves</span>
            </button>
          </div>
        </header>

        <!-- ⚠️ Probation Period Warning Banner -->
        <div v-if="isProbation" class="probation-warning-banner">
          <div class="probation-banner-icon">
            <i class="fas fa-user-clock"></i>
          </div>
          <div class="probation-banner-content">
            <div class="probation-banner-header">
              <span class="probation-tag"><i class="fas fa-shield-alt"></i> Probation Period Active</span>
              <span class="probation-days-badge"><i class="fas fa-hourglass-half"></i> {{ probationDaysLeft }} Days Remaining</span>
            </div>
            <h3 class="probation-title">Leave Applications Disabled During Probation</h3>
            <p class="probation-desc">
              As per company policy, employees in their <strong>90-day probation period</strong> (ending <strong>{{ probationEndDateFormatted }}</strong>) are not eligible to apply for leaves.
            </p>
            <div class="probation-rules-grid">
              <div class="probation-rule-item danger">
                <i class="fas fa-ban"></i>
                <span><strong>No Leave Eligibility:</strong> You cannot apply for Casual, Sick, Privilege Leave, or Half Day.</span>
              </div>
              <div class="probation-rule-item warning">
                <i class="fas fa-calendar-times"></i>
                <span><strong>Forgot Attendance = Unpaid Leave:</strong> If you forget to mark attendance, it will be automatically recorded as <strong>Unpaid Leave</strong>.</span>
              </div>
              <div class="probation-rule-item info">
                <i class="fas fa-coins"></i>
                <span><strong>Half Day Salary Deduction:</strong> Taking a half day will deduct <strong>half-day salary</strong> for that day.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 📊 Live Balance Cards Strip -->
        <section class="balance-strip">
          <div class="balance-card casual">
            <div class="bc-icon-box">
              <i class="fas fa-coffee"></i>
            </div>
            <div class="bc-info">
              <span class="bc-label">Casual Leave</span>
              <div class="bc-values">
                <span class="bc-number">{{ leaveBalance.casual !== undefined ? leaveBalance.casual : (baseAllowances.casual || 7) }}</span>
                <span class="bc-total">/ {{ baseAllowances.casual || 7 }} days left</span>
              </div>
            </div>
          </div>

          <div class="balance-card sick">
            <div class="bc-icon-box">
              <i class="fas fa-thermometer-half"></i>
            </div>
            <div class="bc-info">
              <span class="bc-label">Sick Leave</span>
              <div class="bc-values">
                <span class="bc-number">{{ leaveBalance.sick !== undefined ? leaveBalance.sick : (baseAllowances.sick || 10) }}</span>
                <span class="bc-total">/ {{ baseAllowances.sick || 10 }} days left</span>
              </div>
            </div>
          </div>

          <div class="balance-card pl">
            <div class="bc-icon-box">
              <i class="fas fa-star"></i>
            </div>
            <div class="bc-info">
              <span class="bc-label">Privilege Leave</span>
              <div class="bc-values">
                <span class="bc-number">{{ leaveBalance.pl !== undefined ? leaveBalance.pl : (baseAllowances.pl || 10) }}</span>
                <span class="bc-total">/ {{ baseAllowances.pl || 10 }} days left</span>
              </div>
            </div>
          </div>

          <div class="balance-card earn" v-if="baseAllowances.earn !== undefined">
            <div class="bc-icon-box">
              <i class="fas fa-coins"></i>
            </div>
            <div class="bc-info">
              <span class="bc-label">Earned Leave</span>
              <div class="bc-values">
                <span class="bc-number">{{ leaveBalance.earn || 0 }}</span>
                <span class="bc-total">earned balance</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 📝 Main Form & Policy Guidelines Grid -->
        <div class="application-layout-grid">
          <!-- Main Form Card -->
          <div class="form-card-container">
            <div class="form-card-header">
              <div class="fch-left">
                <div class="fch-icon-box">
                  <i class="fas fa-edit text-teal"></i>
                </div>
                <div>
                  <h3 class="fch-title">Leave Request Form</h3>
                  <span class="fch-sub">Fill out the mandatory fields marked with an asterisk (*)</span>
                </div>
              </div>

              <!-- Live Duration Indicator Badge -->
              <div class="fch-duration-chip" v-if="selectedDuration > 0">
                <i class="fas fa-clock"></i>
                <span>Duration: <strong>{{ selectedDuration }} {{ selectedDuration > 1 ? 'Days' : 'Day' }}</strong></span>
              </div>
            </div>

            <!-- Employee Meta Badge Bar -->
            <div class="applicant-meta-bar">
              <div class="meta-item">
                <span class="meta-label">APPLICANT</span>
                <div class="meta-value">
                  <i class="fas fa-user-circle"></i>
                  <span>{{ form.name || userName || 'Employee' }}</span>
                </div>
              </div>
              <div class="meta-divider"></div>
              <div class="meta-item">
                <span class="meta-label">DEPARTMENT</span>
                <div class="meta-value">
                  <i class="fas fa-building"></i>
                  <span>{{ form.department || userDept || 'General' }}</span>
                </div>
              </div>
            </div>

            <form @submit.prevent="submitForm" class="leave-form-body" :class="{ 'form-disabled': isProbation }">
              <div class="fields-grid">
                <!-- Leave Type -->
                <div class="field-group">
                  <label class="field-label">
                    <span>Leave Type</span>
                    <span class="required">*</span>
                  </label>
                  <div class="input-with-icon">
                    <i class="fas fa-tag input-icon"></i>
                    <select
                      v-model="form.leaveType"
                      class="custom-select"
                      :required="!isProbation"
                      :disabled="isProbation"
                      @change="onLeaveTypeChange"
                    >
                      <option disabled value="">Select leave type</option>
                      <option v-for="type in leaveTypes" :key="type.id" :value="type.leave_name">
                        {{ type.leave_name }}
                      </option>
                      <option value="Half Day">Half Day (0.5 Day)</option>
                    </select>
                  </div>
                  <p v-if="leaveWarning" class="field-warning-text">
                    <i class="fas fa-exclamation-triangle"></i> {{ leaveWarning }}
                  </p>
                </div>

                <!-- Time Slot (Conditional for Half Day) -->
                <div class="field-group" v-if="isHalfDay">
                  <label class="field-label">
                    <span>Time Slot</span>
                    <span class="required">*</span>
                  </label>
                  <div class="input-with-icon">
                    <i class="fas fa-clock input-icon"></i>
                    <select v-model="form.timeSlot" class="custom-select" required>
                      <option disabled value="">Select slot</option>
                      <option value="9:30 AM - 1:30 PM">First Half (9:30 AM - 1:30 PM)</option>
                      <option value="1:30 PM - 5:30 PM">Second Half (1:30 PM - 5:30 PM)</option>
                    </select>
                  </div>
                  <span class="field-hint">Half-day leaves deduct 0.5 from your Casual Leave balance</span>
                </div>

                <!-- From Date -->
                <div class="field-group">
                  <label class="field-label">
                    <span>From Date</span>
                    <span class="required">*</span>
                  </label>
                  <div class="input-with-icon">
                    <i class="fas fa-calendar-day input-icon"></i>
                    <input
                      v-model="form.fromDate"
                      type="date"
                      :min="dateMin"
                      class="custom-input"
                      :required="!isProbation"
                      :disabled="isProbation"
                      @change="onDateChange"
                    />
                  </div>
                  <span v-if="isSickLeave" class="field-hint hint-info">
                    <i class="fas fa-info-circle"></i> Past dates are permitted for sick leave
                  </span>
                </div>

                <!-- To Date -->
                <div class="field-group" :class="{ 'field-group-disabled': isHalfDay }">
                  <label class="field-label">
                    <span>To Date</span>
                    <span class="required" v-if="!isHalfDay">*</span>
                  </label>
                  <div class="input-with-icon">
                    <i class="fas fa-calendar-check input-icon"></i>
                    <input
                      v-model="form.toDate"
                      type="date"
                      :min="toDateMin"
                      class="custom-input"
                      :disabled="isHalfDay || isProbation"
                      :required="!isHalfDay && !isProbation"
                      @change="onDateChange"
                    />
                  </div>
                  <span v-if="isHalfDay" class="field-hint">Auto-locked to the same date for Half Day</span>
                </div>

                <!-- Reason / Description (Full Width) -->
                <div class="field-group full-span">
                  <div class="field-label-row">
                    <label class="field-label">
                      <span>Reason / Description</span>
                      <span class="required" v-if="!isCasualLeave">*</span>
                      <small v-if="isCasualLeave" class="optional-tag">(Optional)</small>
                    </label>
                    <span class="char-counter" :class="{ 'char-limit-near': form.reason.length > 220 }">
                      {{ form.reason.length }} / 250
                    </span>
                  </div>
                  <textarea
                    v-model="form.reason"
                    rows="4"
                    maxlength="250"
                    class="custom-textarea"
                    placeholder="Provide detailed reason or context for this leave request..."
                    :required="!isCasualLeave && !isProbation"
                    :disabled="isProbation"
                  ></textarea>
                </div>

                <!-- Document Attachment (Full Width) -->
                <div class="field-group full-span">
                  <label class="field-label">
                    <span>Supporting Document</span>
                    <small class="optional-tag">(Optional for general leave, recommended for sick leave)</small>
                  </label>

                  <div class="dropzone-box" :class="{ 'has-file': form.file }">
                    <input
                      type="file"
                      @change="handleFileUpload"
                      class="dropzone-input"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      :disabled="isProbation"
                    />

                    <!-- Placeholder -->
                    <div class="dropzone-placeholder" v-if="!form.file">
                      <div class="dropzone-icon-circle">
                        <i class="fas fa-cloud-upload-alt"></i>
                      </div>
                      <div class="dropzone-text">
                        <span class="dz-primary">Click to browse or drag & drop file</span>
                        <span class="dz-sub">PDF, DOC, DOCX, JPG or PNG (Up to 5MB)</span>
                      </div>
                    </div>

                    <!-- File Attached -->
                    <div class="dropzone-attached" v-else>
                      <div class="dz-attached-left">
                        <div class="dz-attached-icon">
                          <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="dz-file-info">
                          <span class="dz-filename">{{ form.file.name }}</span>
                          <span class="dz-filesize">{{ (form.file.size / 1024 / 1024).toFixed(2) }} MB</span>
                        </div>
                      </div>
                      <button type="button" class="btn-remove-attachment" @click.stop="removeFile" title="Remove file">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Alerts -->
              <div v-if="submitError" class="alert-box alert-error">
                <i class="fas fa-times-circle"></i>
                <div class="alert-content">
                  <span class="alert-title">Submission Error</span>
                  <span class="alert-text">{{ submitError }}</span>
                </div>
              </div>

              <div v-if="submitSuccessMsg" class="alert-box alert-success">
                <i class="fas fa-check-circle"></i>
                <div class="alert-content">
                  <span class="alert-title">Request Submitted</span>
                  <span class="alert-text">{{ submitSuccessMsg }}</span>
                </div>
              </div>

              <!-- Form Action Footer -->
              <div class="form-actions-footer">
                <button
                  type="button"
                  class="btn-form-reset"
                  @click="resetForm"
                  :disabled="submitLoading || isProbation"
                >
                  <i class="fas fa-undo"></i>
                  <span>Clear</span>
                </button>

                <button
                  type="submit"
                  class="btn-form-submit"
                  :disabled="submitLoading || isProbation"
                  :class="{ 'btn-locked': isProbation }"
                >
                  <span v-if="isProbation">
                    <i class="fas fa-lock"></i> Application Locked (Probation)
                  </span>
                  <span v-else-if="submitLoading">
                    <i class="fas fa-spinner fa-spin"></i> Submitting Request...
                  </span>
                  <span v-else>
                    <i class="fas fa-paper-plane"></i> Submit Leave Request
                  </span>
                </button>
              </div>
            </form>
          </div>

          <!-- Right Side: Policy Guidelines & Notes -->
          <aside class="guidelines-card">
            <div class="guide-header">
              <div class="guide-icon-box">
                <i class="fas fa-info-circle text-teal"></i>
              </div>
              <h4 class="guide-title">Leave Guidelines</h4>
            </div>

            <div class="guide-list">
              <div class="guide-item">
                <div class="gi-bullet bg-teal"></div>
                <div class="gi-content">
                  <span class="gi-title">Casual Leave (CL)</span>
                  <p class="gi-desc">Should ideally be submitted at least 24 hours in advance for approval.</p>
                </div>
              </div>

              <div class="guide-item">
                <div class="gi-bullet bg-amber"></div>
                <div class="gi-content">
                  <span class="gi-title">Sick Leave (SL)</span>
                  <p class="gi-desc">Past dates allowed. For sick leave exceeding 2 consecutive days, attach a medical certificate.</p>
                </div>
              </div>

              <div class="guide-item">
                <div class="gi-bullet bg-indigo"></div>
                <div class="gi-content">
                  <span class="gi-title">Half-Day Leaves</span>
                  <p class="gi-desc">Requires selecting either morning or afternoon shift slot; deducts 0.5 from your casual leave balance.</p>
                </div>
              </div>

              <div class="guide-item">
                <div class="gi-bullet bg-emerald"></div>
                <div class="gi-content">
                  <span class="gi-title">Automatic Notifications</span>
                  <p class="gi-desc">Once submitted, your direct reporting lead and HR receive instant notification for decisioning.</p>
                </div>
              </div>
            </div>

            <!-- Quick Links Box -->
            <div class="guide-quick-links">
              <button class="btn-guide-link" @click="$router.push('/employee/myleavebalance')">
                <i class="fas fa-balance-scale"></i> View Complete Leave Ledger
              </button>
              <button class="btn-guide-link" @click="$router.push('/employee/leaveapplicationsemp')">
                <i class="fas fa-history"></i> Check Application Status
              </button>
            </div>
          </aside>
        </div>
      </section>
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
  name: "ApplyLeave",
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
      userInfo: null,
      userCreatedAt: null,
      leaveTypes: [],
      today: new Date().toISOString().split('T')[0],
      holidayMMDD: ['01-26', '08-15', '10-02', '07-25'],
    }
  },

  computed: {
    isProbation() {
      if (this.userInfo && this.userInfo.is_probation !== undefined) {
        return Boolean(this.userInfo.is_probation);
      }
      if (this.userCreatedAt) {
        const diff = Math.floor((new Date() - new Date(this.userCreatedAt)) / (1000 * 60 * 60 * 24));
        return diff < 90;
      }
      return false;
    },
    probationDaysLeft() {
      if (this.userInfo && this.userInfo.probation_days_left !== undefined) {
        return this.userInfo.probation_days_left;
      }
      if (this.userCreatedAt) {
        const diff = Math.floor((new Date() - new Date(this.userCreatedAt)) / (1000 * 60 * 60 * 24));
        return Math.max(0, 90 - diff);
      }
      return 0;
    },
    probationEndDateFormatted() {
      if (this.userInfo && this.userInfo.probation_end_date) {
        return new Date(this.userInfo.probation_end_date).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        });
      }
      if (this.userCreatedAt) {
        const d = new Date(this.userCreatedAt);
        d.setDate(d.getDate() + 90);
        return d.toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        });
      }
      return '90 days from joining';
    },
    isHalfDay() {
      return (this.form.leaveType || '').toLowerCase() === 'half day';
    },
    isCasualLeave() {
      return (this.form.leaveType || '').toLowerCase().includes('casual');
    },
    isSickLeave() {
      return (this.form.leaveType || '').toLowerCase().includes('sick') || 
             (this.form.leaveType || '').toLowerCase().includes('medical');
    },
    selectedDuration() {
      if (this.isHalfDay) return 0.5;
      if (!this.form.fromDate || !this.form.toDate) return 0;
      return this.daysBetween(this.form.fromDate, this.form.toDate);
    },
    dateMin() {
      if (this.isSickLeave) {
        return null;
      }
      return this.today;
    },
    toDateMin() {
      if (this.isSickLeave && this.form.fromDate) {
        return this.form.fromDate;
      }
      return this.today;
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

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  },

  watch: {
    'form.reason'(val) {
      if (val && val.length > 250) this.form.reason = val.slice(0, 250);
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
    removeFile() {
      this.form.file = null;
      const input = this.$el.querySelector('.dropzone-input');
      if (input) input.value = '';
    },

    findOverlapMessage() {
      if (!this.form.fromDate || !this.form.toDate) return '';
      const start = new Date(this.form.fromDate);
      const end = new Date(this.form.toDate);
      const clash = this.leaveRequests.find(lv => {
        if (!this.isMine(lv)) return false;
        const status = (lv.status || '').toLowerCase().trim();
        if (status === 'rejected') return false;

        const lvFrom = new Date(lv.fromDate || lv.from_date);
        const lvTo = new Date(lv.toDate || lv.to_date);
        return lvFrom <= end && start <= lvTo;
      });
      return clash ? `⚠️ You already have a leave request from ${clash.fromDate || clash.from_date} to ${clash.toDate || clash.to_date} (${clash.status || 'Pending'})` : '';
    },

    async checkLeaveBalance() {
      if (this.isHalfDay) {
        const casualRemaining = this.leaveBalance?.casual !== undefined
          ? this.leaveBalance.casual
          : ((this.baseAllowances.casual || 7) - (this.usedLeaves.casual || 0));

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

      let leaveKey = (leaveType || '').toLowerCase().replace(' leave', '').trim();
      if (leaveKey === 'medical') {
        leaveKey = 'sick';
      }
      
      const validKeys = ['casual', 'sick', 'pl'];
      if (!validKeys.includes(leaveKey)) return;

      const totalSelectedDays = this.daysBetween(fromDate, toDate);

      const totalAllowed = this.baseAllowances[leaveKey] || 0;
      const alreadyUsed = this.usedLeaves[leaveKey] || 0;
      const remaining = this.leaveBalance?.[leaveKey] !== undefined
        ? this.leaveBalance[leaveKey]
        : Math.max(0, totalAllowed - alreadyUsed);

      this.leaveWarning = `You have ${remaining} ${this.beautify(leaveKey)} leave(s) remaining out of ${totalAllowed}.`;

      if (totalSelectedDays > remaining) {
        this.submitError = `❌ You have only ${remaining} ${this.beautify(leaveKey)} left. Please reduce your date range.`;
      } else {
        this.submitError = '';
      }
    },

    async fetchLeaveBalanceFromDB() {
      try {
        const token = localStorage.getItem('token');
        let user = {};
        try {
          user = JSON.parse(localStorage.getItem('user') || '{}');
        } catch (e) {}
        const userId = this.userId || user.id;
        const currentYear = new Date().getFullYear();

        if (userId) {
          const balanceRes = await axios.get(`https://employees.archenterprises.co.in/api/api/leave-balances/user/${userId}`, {
            params: { year: currentYear },
            headers: { Authorization: `Bearer ${token}` }
          });

          if (balanceRes.data && balanceRes.data.success && balanceRes.data.data) {
            const b = balanceRes.data.data;
            const totals = {
              casual: parseFloat(b.casual_leave) || 7,
              sick: parseFloat(b.sick_leave) || 10,
              pl: parseFloat(b.pl_leave) || 10,
              unpaid: parseFloat(b.unpaid_leave) || 0
            };
            const used = {
              casual: parseFloat(b.used_cl_leave) || 0,
              sick: parseFloat(b.used_sick_leave) || 0,
              pl: parseFloat(b.used_pl_leave) || 0,
              unpaid: parseFloat(b.used_unpaid_leave) || 0
            };
            const remaining = {
              casual: b.remaining_cl_leave !== undefined && b.remaining_cl_leave !== null
                ? parseFloat(b.remaining_cl_leave)
                : Math.max(0, totals.casual - used.casual),
              sick: b.remaining_sick_leave !== undefined && b.remaining_sick_leave !== null
                ? parseFloat(b.remaining_sick_leave)
                : Math.max(0, totals.sick - used.sick),
              pl: b.remaining_pl_leave !== undefined && b.remaining_pl_leave !== null
                ? parseFloat(b.remaining_pl_leave)
                : Math.max(0, totals.pl - used.pl),
              unpaid: b.remaining_unpaid_leave !== undefined && b.remaining_unpaid_leave !== null
                ? parseFloat(b.remaining_unpaid_leave)
                : Math.max(0, totals.unpaid - used.unpaid)
            };

            this.baseAllowances = totals;
            this.usedLeaves = used;
            this.leaveBalance = remaining;
            return;
          }
        }
      } catch (e) {
        console.error('Failed to fetch leave balance from leave_balances table:', e);
      }
    },

    async fetchEarnLeaveCount() {
      try {
        if (!this.userName) return;
        const token = localStorage.getItem('token');
        const res = await axios.get(`https://employees.archenterprises.co.in/api/api/earn-leave/${encodeURIComponent(this.userName)}`, {
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
        console.warn('Admin email notification note:', err);
      }
    },

    daysBetween(startStr, endStr) {
      if (!startStr || !endStr) return 0;
      const start = new Date(startStr);
      const end = new Date(endStr);
      if (end < start) return 0;
      const diff = Math.round((end.getTime() - start.getTime()) / 86400000);
      return diff + 1;
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

      const myName = (this.userName || '').trim().toLowerCase();

      this.leaveRequests.forEach(lv => {
        const lvName = (lv.name || '').trim().toLowerCase();
        if ((lv.status || '').toLowerCase().trim() !== 'approved' || lvName !== myName) return;

        const leaveType = (lv.leave_type || lv.leaveType || '').toLowerCase();
        if (leaveType === 'half day' || lv.half_day || lv.is_half_day) {
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
          const key = (type.leave_name || '').toLowerCase().replace(' leave', '').trim();
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
        this.userInfo = u;
        this.userCreatedAt = u.created_at;
        this.form.name = u.name;
        this.form.department = u.department;
        this.userName = u.name;
        this.userDept = u.department;
        this.userId = u.id;
        await this.fetchEarnLeaveCount();
        await this.fetchLeaveBalanceFromDB();
      } catch (e) {
        console.error('User info error:', e);
        toastError('Failed to fetch user details — please log in again.');
        this.$router.push('/auth');
      }
    },

    isMine(lv) {
      const lvName = (lv.name || '').trim().toLowerCase();
      const myName = (this.userName || '').trim().toLowerCase();
      return lvName === myName && !!myName;
    },

    onLeaveTypeChange() {
      this.form.fromDate = '';
      this.form.toDate = '';
      this.submitError = '';
      this.leaveWarning = '';
    },

    onDateChange() {
      if (!this.isSickLeave) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (this.form.fromDate) {
          const fromDate = new Date(this.form.fromDate);
          fromDate.setHours(0, 0, 0, 0);
          
          if (fromDate < today) {
            this.submitError = '❌ For this leave type, you cannot select a past date.';
            this.form.fromDate = '';
            toastWarning('Past dates are not allowed for this leave type.');
            return;
          }
        }
        
        if (this.form.toDate) {
          const toDate = new Date(this.form.toDate);
          toDate.setHours(0, 0, 0, 0);
          
          if (toDate < today) {
            this.submitError = '❌ For this leave type, you cannot select a past date.';
            this.form.toDate = '';
            toastWarning('Past dates are not allowed for this leave type.');
            return;
          }
        }
      }
      
      this.submitError = '';
    },

    async submitForm() {
      if (this.isProbation) {
        this.submitError = 'Leave applications are not allowed during the 90-day probation period.';
        toastError(`You cannot apply for leave during your probation period (${this.probationDaysLeft} days remaining).`);
        return;
      }

      if (!this.form.leaveType) {
        this.submitError = 'Please select a leave type.';
        toastWarning(this.submitError);
        return;
      }

      if (!this.form.fromDate) {
        this.submitError = 'Please select from date.';
        toastWarning(this.submitError);
        return;
      }

      if (!this.isHalfDay && !this.form.toDate) {
        this.submitError = 'Please select to date.';
        toastWarning(this.submitError);
        return;
      }

      if (this.isHalfDay) {
        this.form.toDate = this.form.fromDate;
        if (!this.form.timeSlot) {
          this.submitError = 'Time slot is required for half-day leave.';
          toastWarning(this.submitError);
          return;
        }
      }

      if (!this.isSickLeave) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (this.form.fromDate) {
          const fromDate = new Date(this.form.fromDate);
          fromDate.setHours(0, 0, 0, 0);
          if (fromDate < today) {
            this.submitError = '❌ Past dates are not allowed for this leave type.';
            toastWarning(this.submitError);
            return;
          }
        }
        
        if (this.form.toDate) {
          const toDate = new Date(this.form.toDate);
          toDate.setHours(0, 0, 0, 0);
          if (toDate < today) {
            this.submitError = '❌ Past dates are not allowed for this leave type.';
            toastWarning(this.submitError);
            return;
          }
        }
      }

      if (!this.isHalfDay && this.form.fromDate && this.form.toDate && new Date(this.form.fromDate) > new Date(this.form.toDate)) {
        this.submitError = 'From date cannot be after to date.';
        toastWarning(this.submitError);
        return;
      }

      if (!this.isCasualLeave && !this.isHalfDay && !(this.form.reason || '').trim()) {
        this.submitError = 'Reason is required for this leave type.';
        toastWarning(this.submitError);
        return;
      }

      if (this.form.file && this.form.file.size > 5 * 1024 * 1024) {
        this.submitError = 'File size exceeds 5MB limit. Please choose a smaller file.';
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

      try {
        const token = localStorage.getItem('token');
        const fd = new FormData();
        
        fd.append('name', this.form.name || this.userName || '');
        fd.append('department', this.form.department || this.userDept || '');
        fd.append('leaveType', this.form.leaveType);
        fd.append('fromDate', this.form.fromDate);
        fd.append('toDate', this.isHalfDay ? this.form.fromDate : this.form.toDate);
        fd.append('reason', (this.form.reason || '').trim() || `${this.form.leaveType} Application`);
        
        if (this.form.file) {
          fd.append('file', this.form.file);
        }
        if (this.form.timeSlot) {
          fd.append('timeSlot', this.form.timeSlot);
        }
        fd.append('limit_exceeded', isLimitExceeded ? '1' : '0');
        if (this.isHalfDay) {
          fd.append('is_half_day', '1');
          fd.append('half_day', '1');
          fd.append('leave_duration', 'half');
        } else {
          fd.append('is_half_day', '0');
          fd.append('half_day', '0');
          fd.append('leave_duration', 'full');
        }

        const { data } = await axios.post('https://employees.archenterprises.co.in/api/api/leave-request', fd, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' 
          }
        });

        if (this.isHalfDay) {
          try {
            await axios.post('https://employees.archenterprises.co.in/api/api/update-cl-leave', {
              name: this.form.name || this.userName,
              department: this.form.department || this.userDept,
              increment: 0.5,
            }, { headers: { Authorization: `Bearer ${token}` } });
          } catch (clErr) {
            console.warn('Could not update CL balance directly:', clErr);
          }
        }

        if (data && data.leave_id) {
          await this.sendAdminNotification(data.leave_id);
        }

        this.submitSuccessMsg = 'Leave request submitted successfully!';
        toastSuccess('Leave request submitted successfully!');
        window.dispatchEvent(new CustomEvent('attendance-marked'));
        this.resetForm();
        await this.fetchLeaves();
        await this.fetchLeaveBalanceFromDB();
      } catch (e) {
        console.error('Submit error:', e);
        const errMsg = e.response?.data?.message || 
                       (e.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(' ') : '') ||
                       'Failed to process leave request. Please check your inputs and try again.';
        this.submitError = errMsg;
        toastError(errMsg);
      } finally {
        this.submitLoading = false;
      }
    },

    handleFileUpload(e) { 
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        toastWarning('File size exceeds 5MB limit.');
        this.submitError = 'File size exceeds 5MB limit. Please upload a smaller file.';
        e.target.value = '';
        this.form.file = null;
        return;
      }
      this.submitError = '';
      this.form.file = file; 
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
      this.isMobile = window.innerWidth <= 992;
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
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

/* ════════ Master Page Layout ════════ */
.layout {
  display: flex;
  flex-direction: column;
  background: var(--bg-app, #f8fafc);
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--text, #0f172a);
}

.main-content {
  display: flex;
  flex: 1;
  padding: 20px 28px;
  gap: 24px;
}

.content {
  flex: 1;
  min-width: 0;
  background: transparent;
  overflow-x: hidden;
}

.text-teal { color: #0d9488 !important; }

/* ════════ Mobile Top Header ════════ */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 10px;
  margin-bottom: 16px;
  border: 1px solid var(--border, #e2e8f0);
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

.mobile-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-mobile-secondary {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #334155;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.btn-mobile-menu {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

/* ════════ Top Executive Banner ════════ */
.executive-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.header-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.portal-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  color: #0d9488;
  letter-spacing: 0.6px;
}

.pulse-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2);
}

.status-meta-pill {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 5px;
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 20px;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
}

.header-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
  letter-spacing: -0.3px;
}

.header-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-secondary-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary-action:hover {
  background: #f1f5f9;
  color: #0f172a;
}

/* ════════ Probation Period Banner ════════ */
.probation-warning-banner {
  display: flex;
  gap: 16px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-left: 5px solid #d97706;
  border-radius: 12px;
  padding: 18px 20px;
  margin-bottom: 20px;
}

.probation-banner-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #fef3c7;
  color: #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.probation-banner-content {
  flex: 1;
}

.probation-banner-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.probation-tag {
  font-size: 11px;
  font-weight: 700;
  color: #92400e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.probation-days-badge {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}

.probation-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #92400e;
  margin: 0 0 6px;
}

.probation-desc {
  font-size: 12.5px;
  color: #78350f;
  margin: 0 0 12px;
  line-height: 1.5;
}

.probation-rules-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.probation-rule-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 11.5px;
  line-height: 1.45;
  padding: 8px 10px;
  border-radius: 7px;
  background: #ffffff;
  border: 1px solid #fef3c7;
}

.probation-rule-item.danger i { color: #dc2626; }
.probation-rule-item.warning i { color: #d97706; }
.probation-rule-item.info i { color: #2563eb; }

/* ════════ Live Balance Strip ════════ */
.balance-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.balance-card {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
}

.balance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.balance-card.casual { border-left: 3px solid #16a34a; }
.balance-card.sick { border-left: 3px solid #d97706; }
.balance-card.pl { border-left: 3px solid #6366f1; }
.balance-card.earn { border-left: 3px solid #0d9488; }

.bc-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}

.balance-card.casual .bc-icon-box { background: #f0fdf4; color: #16a34a; }
.balance-card.sick .bc-icon-box { background: #fffbeb; color: #d97706; }
.balance-card.pl .bc-icon-box { background: #eef2ff; color: #6366f1; }
.balance-card.earn .bc-icon-box { background: #f0fdfa; color: #0d9488; }

.bc-info {
  display: flex;
  flex-direction: column;
}

.bc-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.bc-values {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.bc-number {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.bc-total {
  font-size: 11.5px;
  color: #64748b;
}

/* ════════ Application Layout Grid ════════ */
.application-layout-grid {
  display: grid;
  grid-template-columns: 2.2fr 1fr;
  gap: 20px;
  align-items: start;
}

/* ════════ Form Card Container ════════ */
.form-card-container {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.form-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid var(--border, #e2e8f0);
  background: #fafbfd;
  flex-wrap: wrap;
  gap: 12px;
}

.fch-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fch-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.fch-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.fch-sub {
  font-size: 12px;
  color: #64748b;
}

.fch-duration-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  color: #0d9488;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
}

/* Applicant Meta Bar */
.applicant-meta-bar {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 12px 24px;
  gap: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.meta-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.6px;
}

.meta-value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.meta-value i {
  color: #0d9488;
  font-size: 13px;
}

.meta-divider {
  width: 1px;
  height: 18px;
  background: #cbd5e1;
}

/* ════════ Form Body ════════ */
.leave-form-body {
  padding: 24px;
}

.form-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.fields-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field-group.full-span {
  grid-column: 1 / -1;
}

.field-group-disabled {
  opacity: 0.65;
}

.field-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 4px;
}

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.required {
  color: #ef4444;
  font-weight: 700;
}

.optional-tag {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 400;
}

.char-counter {
  font-size: 11.5px;
  color: #94a3b8;
  font-weight: 500;
}

.char-limit-near {
  color: #d97706;
  font-weight: 700;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 13px;
  pointer-events: none;
}

.custom-input,
.custom-select {
  width: 100%;
  padding: 10px 14px 10px 38px;
  background: #ffffff;
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 8px;
  font-size: 13px;
  color: #0f172a;
  font-family: inherit;
  transition: all 0.15s ease;
}

.custom-input:focus,
.custom-select:focus,
.custom-textarea:focus {
  outline: none;
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
}

.custom-input:disabled,
.custom-select:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
  color: #64748b;
}

.custom-textarea {
  width: 100%;
  padding: 12px 14px;
  background: #ffffff;
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 8px;
  font-size: 13px;
  color: #0f172a;
  font-family: inherit;
  resize: vertical;
  line-height: 1.5;
  transition: all 0.15s ease;
}

.field-hint {
  font-size: 11.5px;
  color: #64748b;
  margin-top: 2px;
}

.hint-info {
  color: #0d9488;
  display: flex;
  align-items: center;
  gap: 4px;
}

.field-warning-text {
  font-size: 12px;
  color: #d97706;
  margin: 3px 0 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* ════════ Modern Dropzone ════════ */
.dropzone-box {
  position: relative;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  padding: 24px;
  text-align: center;
  transition: all 0.2s ease;
}

.dropzone-box:hover {
  border-color: #0d9488;
  background: #f0fdfa;
}

.dropzone-box.has-file {
  background: #ffffff;
  border: 1px solid #ccfbf1;
  padding: 14px 18px;
}

.dropzone-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.dropzone-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.dropzone-icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.dropzone-box:hover .dropzone-icon-circle {
  background: #ccfbf1;
  color: #0d9488;
}

.dropzone-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.dz-primary {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.dz-sub {
  font-size: 11.5px;
  color: #64748b;
}

.dropzone-attached {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  position: relative;
  z-index: 2;
}

.dz-attached-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.dz-attached-icon {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  color: #0d9488;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.dz-file-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  text-align: left;
}

.dz-filename {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dz-filesize {
  font-size: 11px;
  color: #64748b;
}

.btn-remove-attachment {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-remove-attachment:hover {
  background: #fee2e2;
}

/* ════════ Alerts ════════ */
.alert-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 20px;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.alert-error i {
  font-size: 16px;
  margin-top: 1px;
  color: #ef4444;
}

.alert-success {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #047857;
}

.alert-success i {
  font-size: 16px;
  margin-top: 1px;
  color: #10b981;
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.alert-title {
  font-weight: 700;
}

.alert-text {
  font-size: 12.5px;
}

/* ════════ Footer Actions ════════ */
.form-actions-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid #f1f5f9;
}

.btn-form-reset {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-form-reset:hover {
  background: #f8fafc;
  color: #0f172a;
}

.btn-form-submit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  border: none;
  color: #ffffff;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.25);
  transition: all 0.15s ease;
}

.btn-form-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
  transform: translateY(-1px);
}

.btn-form-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

.btn-form-submit.btn-locked {
  background: #94a3b8;
  box-shadow: none;
}

/* ════════ Right Policy Guidelines ════════ */
.guidelines-card {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.guide-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.guide-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #f0fdfa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.guide-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.guide-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 22px;
}

.guide-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.gi-bullet {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.bg-teal { background: #0d9488; }
.bg-amber { background: #f59e0b; }
.bg-indigo { background: #6366f1; }
.bg-emerald { background: #10b981; }

.gi-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.gi-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.gi-desc {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.45;
}

.guide-quick-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.btn-guide-link {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #334155;
  padding: 9px 12px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.btn-guide-link:hover {
  background: #f1f5f9;
  color: #0d9488;
  border-color: #cbd5e1;
}

.btn-guide-link i {
  color: #0d9488;
  font-size: 12px;
}

/* ════════ Responsive ════════ */
@media (max-width: 992px) {
  .main-content {
    padding: 14px;
  }

  .executive-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .btn-secondary-action {
    flex: 1;
    justify-content: center;
  }

  .probation-rules-grid {
    grid-template-columns: 1fr;
  }

  .application-layout-grid {
    grid-template-columns: 1fr;
  }

  .fields-grid {
    grid-template-columns: 1fr;
  }
}
</style>