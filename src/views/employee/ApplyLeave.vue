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
    
<!-- ⚡ Modal (shows only when showBalanceModal is true) -->
<transition name="fade">
  <div
    v-if="showBalanceModal"
    class="modal-overlay"
    @click.self="showBalanceModal = false"
  >
    <div class="modal-content">
      <h2 class="modal-title">Leave Balance</h2>

    <ul class="balance-list">
  <li v-for="(total, type) in baseAllowances" :key="type" class="balance-row">
    <span class="balance-type">{{ beautify(type) }}</span>
    <span class="balance-days">
      {{ usedLeaves[type] }} used /
      {{ total }}
    </span>
  </li>
</ul>



      <button class="close-btn" @click="showBalanceModal = false">
        Close
      </button>
    </div>
  </div>
</transition>
    <!-- Main Content -->
    <div class="main-content">
     
      <Sidebar v-if="!isMobile || isSidebarVisible" />

   
     <!-- Leave Form -->
<div class="leave-form-wrapper" v-if="!isMobile || !isSidebarVisible">
 <button class="leave-balance-btn" @click="showBalanceModal = true">
    Leave&nbsp;Balance
  </button>
  <form @submit.prevent="submitForm" class="leave-form">

    <div class="form-grid">
      <!-- Name -->
     <div class="form-group">
  <label for="name">Name</label>
  <input v-model="form.name" type="text" id="name" required disabled />
</div>


      <!-- Department -->
      <div class="form-group">
        <label for="department">Department</label>
        <input v-model="form.department" type="text" id="department" required disabled />
      </div>

     


      <!-- Leave Type -->
<div class="form-group">
  <label for="leaveType">Leave Type</label>
  <select v-model="form.leaveType" id="leaveType" required>
    <option disabled value="">Select leave type</option>
    <p v-if="overlapWarning" class="warning-text">{{ overlapWarning }}</p>

    <option v-for="type in leaveTypes"
            :key="type.id"
            :value="type.leave_name">
      {{ type.leave_name }}
    </option>
    <option value="Half Day">Half Day</option>
  </select>

  <!-- ⚠️ Instant leave warning -->
  <p v-if="leaveWarning" class="warning-text">{{ leaveWarning }}</p>
</div>

<!-- ✅ Time Slot (only for Half Day) -->
<div class="form-group" v-if="isHalfDay">
  <label for="timeSlot">Time Slot</label>
  <select v-model="form.timeSlot" id="timeSlot" required>
    <option disabled value="">Select time</option>
    <option value="9:30 AM - 2:30 PM">9:30 AM - 1:30 PM</option>
    <option value="2:30 PM - 5:30 PM">1:30 PM - 5:30 PM</option>
  </select>
</div>

<!-- From Date -->
<div class="form-group">
  <label for="fromDate">From Date</label>
  <input
    v-model="form.fromDate"
    type="date"
    id="fromDate"
    :min="today"
    required
  />
</div>

<!-- To Date (disabled if Half Day) -->
<div class="form-group">
  <label for="toDate">To Date</label>
  <input
    v-model="form.toDate"
    type="date"
    id="toDate"
    :min="form.fromDate || today"
    :disabled="isHalfDay"
    :required="!isHalfDay"
  />
</div>


  
    <div class="form-group full-width">
  <label for="reason">
    Reason
    <span class="char-count">{{ form.reason.length }}/250</span>
    <small v-if="isCasualLeave">(optional)</small>
    <small v-else class="required">*</small>
  </label>

  <textarea
    id="reason"
    v-model="form.reason"
    rows="4"
    maxlength="250"
    placeholder="Enter reason"
    :required="!isCasualLeave"
  ></textarea>
</div>



      <!-- File Upload -->
      <!-- File Upload  ⬅︎ tweak #1: dynamic required -->
<div class="form-group full-width">
  <label for="file">
  Attach Document <small>(optional)</small>
</label>

<input
  type="file"
  id="file"
  @change="handleFileUpload"
/>

</div>
    </div>

    <!-- Overlap Error -->
   <!-- Validation Errors -->
<div v-if="submitError" class="error-msg">{{ submitError }}</div>


    <!-- Submit Button -->
 <button
  type="submit"
  class="submit-button"
  :disabled="submitLoading"
>
  <span v-if="submitLoading" class="btn-loader"></span>
  <span v-else>Submit Leave Request</span>
</button>

<div v-if="submitSuccessMsg" class="success-msg">{{ submitSuccessMsg }}</div>

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
  toastInfo
} from "@/utils/toast.js";

export default {
  components: { Sidebar },

  data() {
    return {
       leaveWarning: '',
      submitLoading: false,        // loader for submit button
submitSuccessMsg: '',        // success message

      userName: '',
    userDept: '',
      /* yearly allowance -------------------------------- */
      baseAllowances: { casual: 7, sick: 10, pl: 10, medical: 10 },

      /* calculated every time --------------------------- */
      leaveBalance: { casual: 7, sick: 10, pl: 10, medical: 10},
      usedLeaves:   { casual: 0,  sick: 0,  pl: 0,  medical: 0},

      /* ui / form state --------------------------------- */
      showBalanceModal: false,
      leaveRequests   : [],
      submitError     : '',          // ← ONE place for all form errors
      isMobile        : false,
      isSidebarVisible: true,
      form: {
        leaveType : '',
        name      : '',
        department: '',
        fromDate  : '',
        toDate    : '',
        reason    : '',
        file      : null,
      },
      leaveTypes: [],
      today: new Date().toISOString().split('T')[0],

      /* fixed‑date Indian national holidays ------------- */
      holidayMMDD: ['01-26', '08-15', '10-02'], // add more if needed
    }
  },

  /* life‑cycle ----------------------------------------- */
 async mounted() {
  this.fetchLeaveTypes();
  this.fetchUserInfo();
  await this.fetchLeaveBalanceFromDB(); // ← ensure it’s called here
  this.fetchLeaves();
  this.checkIfMobile();
  window.addEventListener('resize', this.checkIfMobile);
},
  beforeDestroy() { clearInterval(this.poll) },

  /* watchers ------------------------------------------- */
 watch: {
   'form.reason'(val) {
    if (val.length > 250) {
      this.form.reason = val.slice(0, 250);
    }
  },
  'form.fromDate': 'checkLeaveBalance',
  'form.toDate': 'checkLeaveBalance',
  'form.leaveType': 'checkLeaveBalance',
  leaveRequests: {
    handler: 'computeLeaveBalance',
    deep: true,
  },
},

computed: {
  overlapWarning() {
    return this.findOverlapMessage();
  },

  isHalfDay() {
    return (this.form.leaveType || '').toLowerCase() === 'half day';
  },
   isCasualLeave() {
    return (this.form.leaveType || '').toLowerCase().includes('casual');
  }
},


  /* methods -------------------------------------------- */
  methods: {
    findOverlapMessage() {
  if (!this.form.fromDate || !this.form.toDate) return '';

  const clash = this.leaveRequests.find(lv => 
    this.isMine(lv) &&
    new Date(lv.fromDate) <= new Date(this.form.toDate) &&
    new Date(this.form.fromDate) <= new Date(lv.toDate)
  );

  return clash ? `❌ You already have a leave from ${clash.fromDate} to ${clash.toDate}` : '';
},

async checkLeaveBalance() {
  // ✅ Skip leave balance check for Half Day
  if (this.isHalfDay) {
    this.submitError = '';       // clear any previous errors
    this.leaveWarning = '';      // clear warning
    return;
  }

  this.submitError = '';
  this.leaveWarning = ''; // clear previous warning

  const { fromDate, toDate, leaveType } = this.form;
  if (!fromDate || !toDate || !leaveType) return;

  const leaveKey = (leaveType || '').toLowerCase().replace(' leave', '');
  const validKeys = ['casual', 'sick', 'pl', 'medical'];
  if (!validKeys.includes(leaveKey)) return;

  // ✅ Calculate total selected days
  const totalSelectedDays = this.daysBetween(fromDate, toDate);

  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(
      'https://employees.archenterprises.co.in/api/api/user',
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const user = res.data;

    const usedMap = {
      casual: user.cl_leave_used || 0,
      pl: user.pl_leave_used || 0,
      medical: user.m_leave_used || 0,
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
    const res = await axios.get(
      'https://employees.archenterprises.co.in/api/api/user',
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const user = res.data;

    // ✅ Base total (you can customize or fetch dynamically if needed)
    const totals = {
      casual: 7,
      sick: 10,
      pl: 10,
      medical: 10,
      // earn: this.baseAllowances.earn || 0, // keep existing earn leave
    };

    // ✅ Used leaves fetched directly from user table
    const used = {
      casual: user.cl_leave_used || 0,
      sick: user.sl_leave_used || 0,
      pl: user.pl_leave_used || 0,
      medical: user.m_leave_used || 0,
      // earn: 0,
    };

    // ✅ Remaining = Total - Used
    const remaining = {};
    for (const key in totals) {
      remaining[key] = totals[key] - used[key];
      if (remaining[key] < 0) remaining[key] = 0;
    }

    // ✅ Update your data properties
    this.baseAllowances = totals;
    this.usedLeaves = used;
    this.leaveBalance = remaining;

  } catch (e) {
    console.error('Failed to fetch leave balance from users table:', e);
  }
},


    async fetchEarnLeaveCount() {
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get(
      `https://employees.archenterprises.co.in/api/api/earn-leave/${this.userName}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const count = res.data?.count || 0
    this.baseAllowances.earn = count
    this.leaveBalance.earn = count
  } catch (e) {
    console.error('Failed to fetch Earn Leave count:', e)
  }
},

    async sendAdminNotification(leaveId) {
  /* Call a protected API that triggers Laravel’s Mail logic */
  try {
    const token = localStorage.getItem('token')
    await axios.post(
      'https://employees.archenterprises.co.in/api/api/leave-notify',
      { leave_id: leaveId },                         // pass whichever id you like
      { headers: { Authorization: `Bearer ${token}` } }
    )
  } catch (err) {
    console.error('Admin e‑mail failed:', err)
    // UI stays silent; log is enough
  }
},

    /* ============== GENERAL HELPERS =================== */
    daysBetween(startStr, endStr) {
    const start = new Date(startStr)
    const end   = new Date(endStr)

    if (end < start) return 0                    // safeguard

    const diff = Math.floor((end - start) / 86400000) // whole‑day difference
    return diff === 0 ? 1 : diff                 // same day ⇒ 1
  },
    dateToMMDD(dateStr) {
      const d = new Date(dateStr)
      return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },
    /* Sunday or national holiday? ---------------------- */
    isDisallowed(dateStr) {
      const d = new Date(dateStr)
      const isSunday  = d.getDay() === 0
      const isHoliday = this.holidayMMDD.includes(this.dateToMMDD(dateStr))
      return isSunday || isHoliday
    },
    rangeHasDisallowed(start, end) {
      for (let cur = new Date(start); cur <= new Date(end); cur.setDate(cur.getDate() + 1)) {
        if (this.isDisallowed(cur.toISOString().slice(0, 10))) return true
      }
      return false
    },

    /* ============== BALANCE CALCULATION =============== */
 computeLeaveBalance() {
  const remaining = { ...this.baseAllowances };
  const used = { casual: 0, sick: 0, pl: 0, medical: 0};

 const map = {
  'casual leave': 'casual', casual: 'casual',
  'sick leave': 'sick', sick: 'sick',
  'pl leave': 'pl', pl: 'pl',
  'medical leave': 'medical', medical: 'medical',
  // 'earn leave': 'earn', earn: 'earn',
};

  this.leaveRequests.forEach(lv => {
    // ✅ Filter only approved leaves for the logged-in user
    if (
      (lv.status || '').toLowerCase().trim() !== 'approved' ||
      (lv.name || '').trim().toLowerCase() !== this.userName.trim().toLowerCase() ||
      (lv.department || '').trim().toLowerCase() !== this.userDept.trim().toLowerCase()
    ) return;

    const key = map[(lv.leave_type || lv.leaveType || '').toLowerCase()];
    if (!key) return;

    const days = this.daysBetween(lv.from_date || lv.fromDate, lv.to_date || lv.toDate);
    used[key] += days;
    remaining[key] -= days;
  });

  // Prevent negative leave balance
  Object.keys(remaining).forEach(k => {
    if (remaining[k] < 0) remaining[k] = 0;
  });

  this.usedLeaves = used;
  this.leaveBalance = remaining;
},


    /* ============== DATA FETCHERS ===================== */
    async fetchLeaves() {
  try {
    const token = localStorage.getItem('token')
    const { data } = await axios.get(
      'https://employees.archenterprises.co.in/api/api/leave-requests',
      { headers: { Authorization: `Bearer ${token}` } }
    )

    this.leaveRequests = data || []

    /* 🔍 DEBUG: show the first item’s keys */
    if (this.leaveRequests.length) {
      console.log('leaveRequests[0] keys →', Object.keys(this.leaveRequests[0]))
      console.table(this.leaveRequests.slice(0, 5))
    }
  } catch (e) {
    console.error('Failed to load leaves:', e)
  }
},

   async fetchLeaveTypes() {
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('https://employees.archenterprises.co.in/api/api/leave-types', {
      headers: { Authorization: `Bearer ${token}` }
    })

    this.leaveTypes = res.data || []

    // 👇 Map the leave types into your baseAllowances dynamically
    const allowances = {}
    this.leaveTypes.forEach(type => {
      const key = (type.leave_name || '').toLowerCase().replace(' leave', '')
      allowances[key] = parseInt(type.total_leaves) || 0
    })

    this.baseAllowances = allowances
    this.leaveBalance = { ...allowances }

  } catch (e) {
    console.error('Fetch leave types failed:', e)
    toastSuccess('Could not load leave types.')
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

    // ✅ Fetch used leaves from user table
    this.usedLeaves = {
      casual: u.cl_leave_used || 0,
      pl: u.pl_leave_used || 0,
      medical: u.m_leave_used || 0,
      sick: u.sl_leave_used || 0,
      // earn: 0, // will fetch separately below
    };

    await this.fetchEarnLeaveCount();          // Fetch earn leave (dynamic)
    await this.fetchLeaveBalanceFromDB();      // Fetch leave totals (dynamic)
  } catch (e) {
    console.error('User info error:', e);
    toastSuccess('Failed to fetch user details — please log in again.');
    this.$router.push('/auth');
  }
},





    /* ============== FORM VALIDATION =================== */
    isOverlapping() {
      if (!this.form.fromDate || !this.form.toDate) return false
      const A = new Date(this.form.fromDate), B = new Date(this.form.toDate)
      return this.leaveRequests.some(lv => {
        const C = new Date(lv.from_date || lv.fromDate)
        const D = new Date(lv.to_date   || lv.toDate)
        return C <= B && A <= D
      })
    },
    /** Return the first leave that overlaps the user’s selected range, or null. */
findOverlap() {
  if (!this.form.fromDate || !this.form.toDate) return null
  const A = new Date(this.form.fromDate)
  const B = new Date(this.form.toDate)

  return (
    this.leaveRequests.find(lv => {
      if (!this.isMine(lv)) return false
      const C = new Date(lv.fromDate)
      const D = new Date(lv.toDate)
      return C <= B && A <= D
    }) || null
  )
},

/* ░░░░░ VALIDATION ░░░░░ */

validateAll() {
  this.submitError = ''

  /* 1️⃣  Same‑user overlap? */
  const clash = this.findOverlap()
  if (clash) {
    const from = (clash.from_date || clash.fromDate).slice(0, 10)
    const to   = (clash.to_date   || clash.toDate).slice(0, 10)
    this.submitError = `You already have a leave from these days.`
    return
  }

  
},
isMine(lv) {
  return lv.name === this.userName && lv.department === this.userDept
},  
    /* ============== FORM SUBMIT ======================= */
async submitForm() {
  // 1️⃣ Skip overlap warning and leave balance for Half Day
  if (!this.isHalfDay) {
    const overlapMsg = this.findOverlapMessage();
    if (overlapMsg) {
      this.submitError = overlapMsg;
      toastSuccess(this.submitError);
      return; // stop submission
    }

    await this.checkLeaveBalance(); // only check balance for full day
    if (this.submitError) {
      toastSuccess(this.submitError);
      return;
    }
  }

  this.submitLoading = true;
  this.submitSuccessMsg = '';

  // ✅ Half day leaves always have same from/to date
  if (this.isHalfDay) {
    this.form.toDate = this.form.fromDate;
  }

  try {
    const token = localStorage.getItem('token');
    const fd = new FormData();
    Object.entries(this.form).forEach(([k, v]) => v && fd.append(k, v));
    if (this.isHalfDay) fd.append('half_day', '1');

    const { data } = await axios.post(
      'https://employees.archenterprises.co.in/api/api/leave-request',
      fd,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      }
    );

    // Update casual leave by 0.5
    if (this.isHalfDay) {
      await axios.post(
        'https://employees.archenterprises.co.in/api/api/update-cl-leave',
        { name: this.form.name, department: this.form.department, increment: 0.5 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
// Reason validation (optional only for Casual Leave)
if (!this.isCasualLeave && !this.form.reason.trim()) {
  this.submitError = 'Reason is required for this leave type.';
  toastSuccess(this.submitError);
  return;
}

    await this.sendAdminNotification(data.leave_id);
    this.submitSuccessMsg = '✅ Leave request submitted successfully!';
    this.resetForm();
    await this.fetchLeaves();

  } catch (e) {
    console.error('Submit error:', e);
    this.submitError = 'Failed to process leave request.';
  } finally {
    this.submitLoading = false;
  }
},






    /* ============== UI HELPERS ======================== */
    handleFileUpload(e) { this.form.file = e.target.files[0] },
    resetForm() { Object.assign(this.form, {
      leaveType:'', fromDate:'', toDate:'', reason:'', file:null,  timeSlot: ''
    })},
    checkIfMobile() {
      this.isMobile        = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },
    toggleSidebar() { this.isSidebarVisible = !this.isSidebarVisible },
   beautify(k) {
  const map = {
    casual: 'Casual Leave',
    sick: 'Sick Leave',
    pl: 'PL Leave',
    medical: 'Medical Leave',
    // earn: 'Earn Leave'
  }
  return map[k.toLowerCase()] || `${k.charAt(0).toUpperCase()}${k.slice(1)} Leave`
},


    /* logout ------------------------------------------- */
    logout() {
      const token = localStorage.getItem('token')
      axios.post('https://employees.archenterprises.co.in/api/api/logout', {},
        { headers: { Authorization: `Bearer ${token}` } })
      .finally(() => { localStorage.removeItem('token'); this.$router.push('/auth') })
    },
  },
}
</script>




<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
.char-count {
  float: right;
  font-size: 12px;
  color: #777;
}

.head-title{
      color: white;
    display: flex;
    gap: 7px;
    text-decoration: none;
font-family: cursive;
    align-items: center; width: 100%;
}
@media (max-width: 768px) {
.head-title{
      color: white;
    display: flex;
    gap: 7px;
    display: none;
    text-decoration: none;
    align-items: center; width: 100%;
}
}
.warning-text {
  color: #e67e22;
  font-weight: 600;
  margin-top: 4px;
  font-size: 13px;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .main-content {
  align-self: center;
  }
}
.success-msg {
  margin-top: 10px;
  color: green;
  font-weight: 500;
}

.leave-form-wrapper {
  background: #fff;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0);
  /* max-width: 800px; */
  margin: auto;
}

.leave-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
  color: var(--text);
}

.form-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
}

.form-group {
  flex: 1 1 48%;
  display: flex;
  flex-direction: column;
}

.full-width {
  flex: 1 1 100%;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #4f46e5;
  outline: none;
}

.submit-button {
  background-color: var(--primary);
  color: #fff;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  align-self: flex-end;
  cursor: pointer;
  transition: background 0.2s ease;
}

.submit-button:hover {
  background: var(--text);
}

.error-msg {
  color: #dc2626;
  font-size: 0.9rem;
  font-weight: 500;
}

.error-msg {
  margin: 0.25rem 0 0.5rem;
  color: #dc2626;    /* red-600 */
  font-size: 0.875rem;
  font-weight: 500;
}

/* Button */
.leave-balance-btn {
 background: var(--text);
    color: #ffffff;
    margin-bottom: 17px;
    padding: 0.55rem 1.25rem;
    border: 0;
    border-radius: .5rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform .15s ease;
}
.leave-balance-btn:hover {
  transform: translateY(-2px);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Modal overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1000;
}

/* Modal box */
.modal-content {
  width: 90%;
  max-width: 380px;
  background: #ffffff;
  border-radius: 1rem;
  padding: 1.75rem 1.5rem;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}

/* Heading */
.modal-title {
  margin-bottom: 1.1rem;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
}

/* List of balances */
.balance-list {
  list-style: none;
  margin: 0 0 1.5rem;
  padding: 0;
}
.balance-row {
  display: flex;
  justify-content: space-between;
  padding: 0.45rem 0;
  border-bottom: 1px dashed #e5e7eb;
}
.balance-type {
  font-weight: 500;
}
.balance-days {
  font-weight: 700;
  color: #335d5f;
}

/* Close button */
.close-btn {
  display: block;
  margin: 0.5rem auto 0;
 background: #ff0000;
    border: 2px solid #ffffff;
    color: #ffffff;
  padding: 0.4rem 1.2rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.15s ease, color 0.15s ease;
}
.close-btn:hover {
  background: #ac0909;
  color: #fff;
}

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text);
}

.header {
  font-size: 17px;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, .3);
 background-color: var(--primary); 
  color: white;
  padding: 0 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.main-content {
  display: flex;
  flex: 1;
  padding: 30px;
  gap: 20px;
}

.sidebar {
  background-color: #ffffff;
  width: 220px;
  padding: 25px 20px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  font-weight: 600;
  color: var(--text);
}

.leave-form-wrapper {
  /* max-width: 800px; */
  width: 100%;
  margin: -1px auto;
  padding: 25px;
  /* background: linear-gradient(135deg, #f5f7fa, var(--text)) ; */
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0);
  border-radius: 16px;
}

.leave-form {
  width: 100%;
}

.form-title {
  text-align: center;
  font-size: 28px;
  margin-bottom: 30px;
  color: var(--text);
}

.form-row {
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text);
}

input, select, textarea {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
  transition: all 0.3s ease;
}

input:hover, select:hover, textarea:hover {
  border-color: #4caf50;
  background: #fafff7;
}

input:focus, select:focus, textarea:focus {
  border-color: #388e3c;
  outline: none;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}



.mobile-menu-icon {
  font-size: 22px;
  margin-left: 10px;
  cursor: pointer;
  display: none;
}

@media (max-width: 768px) {
  .mobile-menu-icon {
    display: inline-block;
  }

  .sidebar {
    position: absolute;
    z-index: 1000;
    width: 240px;
    height: 100vh;
    background-color: var(--text);
  }
}
.header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 35px;
}
@media (max-width: 768px) {
.header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 35px;
  margin-bottom: 6px;
      height: 52px;
}
}

.logo-img {
  height: 65px; background-color: white; border-radius: 9px;
}

.header-title {
  flex: 1;
  text-align: center;
  color: white;
  margin: 0;
  font-size: 1.3rem;
}

.mobile-menu-icon {
  font-size: 22px;
  color: white;
  cursor: pointer;
}

.btn-loader {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Disabled button look */
.submit-button:disabled {
  background-color: #9fbfc1;
  cursor: not-allowed;
}

</style>
