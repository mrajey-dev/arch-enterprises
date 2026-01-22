

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

 <div class="attendance-container container-fluid p-4">

    <h2 class="popup-title">Daily Attendance</h2>
    <button class="logout-btn" @click="showPopupsalary = true">
  Calculate Salary
</button>

<button class="logout-btn" @click="showMarkAttendancePopup = true">
  Mark Attendance
</button>

        <!-- Summary Section -->
  <div v-if="viewMode === 'day'" class="attendance-table">
  <h5 class="mb-4">{{ currentDate }}</h5>
 <table class="responsive-table attendance-mobile-card">
  <thead class="d-none d-md-table-header-group">
    <tr>
      <th>Name</th>
      <th>Status</th>
      <th>Clock In</th>
      <th>Clock Out</th>
      <th>Required Time</th>
      <th>Actual Time</th>
 
    </tr>
  </thead>
  <tbody>
    <tr v-for="record in attendanceRecords" :key="record.id">
  <td data-label="Members">
    <span class="clickable-name" @click="viewEmployeeMonthlyAttendance(record.name)">
     👤 {{ record.name }}
    </span>
  </td>
  <td data-label="Status">
    <span :class="['attendance-status', getStatusClass(record.status)]">{{ record.status }}</span>
    <div v-if="record.status === 'Present' && record.clock_in">
      <small v-if="isLate(record.clock_in)" class="text-danger">{{ calculateLateTime(record.clock_in) }} Late</small>
      <small v-else-if="isEarly(record.clock_in)" class="text-purple">{{ calculateEarlyTime(record.clock_in) }} Early</small>
    </div>
  </td>
  <td data-label="Clock In">{{ record.clock_in || '-' }}</td>
  <td data-label="Clock Out">{{ record.clock_out || '-' }}</td>
  <td data-label="Required Time">{{ record.required_time }}</td>
  <td data-label="Actual Time">{{ record.actual_time || '-' }}</td>
  
</tr>

  </tbody>
</table>

</div>




  </div>


<!-- Mark Attendance Popup -->
<div v-if="showMarkAttendancePopup" class="popup-overlay fancy-overlay">
  <div class="popup-card animate-pop">

    <div class="popup-header">
      <h3>📝 Mark Attendance</h3>
      <button class="icon-close" @click="showMarkAttendancePopup = false">✕</button>
    </div>

    <div class="popup-body">

      <!-- Employee -->
      <div class="field">
        <label>Employee</label>
        <select v-model="markAttendance.employee">
          <option value="">Select Employee</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.name">
            {{ emp.name }}
          </option>
        </select>
      </div>

      <!-- Status -->
      <div class="field">
        <label>Status</label>
        <select v-model="markAttendance.status" :class="markAttendance.status">
          <option value="">Select Status</option>
          <option>Present</option>
          <option>Traveling</option>
          <option>OnSite</option>
          <option>HalfDay</option>
          <option>Leave</option>
          <option>Absent</option>
        </select>
      </div>

      <!-- Date & Time -->
      <div class="two-col">
       <div class="field">
  <label>Date</label>
  <input 
    type="date" 
    v-model="markAttendance.date" 
    :max="today" 
  />
</div>


        <div class="field">
          <label>Time</label>
          <input type="time" v-model="markAttendance.time" />
        </div>
      </div>

    </div>

    <div class="popup-footer">
      <button class="btn-cancel" @click="showMarkAttendancePopup = false">
        Cancel
      </button>
      <button class="btn-save" @click="submitMarkedAttendance">
        ✔ Save Attendance
      </button>
    </div>

  </div>
</div>



<!-- Popup Modal -->
    <div v-if="showPopupsalary" class="popup-overlay">
    <div class="popup-content">
      <h2 class="popup-title">Salary Calculation</h2>

      <div class="table-wrapper">
        <table class="responsive-table attendance-mobile-card">
          <thead>
            <tr>
              <th>Name</th>
              <th>Salary</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="employee in employees" :key="employee.id">
              <td data-label="Members">
                <span
                  class="clickable-name"
                  @click="viewEmployeeMonthlyAttendance(employee.name)"
                >
                  👤 {{ employee.name }}
                </span>
              </td>

              <td data-label="Salary">
                <div v-if="employee.salary">
                  ₹{{ employee.salary }}.00
                </div>
                <button
                  v-else
                  class="cal_sal"
                  @click="calculateSalaryOnClick(employee)"
                  :disabled="employee.calculating"
                >
                  {{ employee.calculating ? "Calculating..." : "Calculate" }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <button class="close-btn" @click="showPopupsalary = false">X</button>
    </div>
  </div>
  <!-- Popup Modal -->
<div v-if="showPopup" class="popup-overlay">

<div class="popup-content">
  <button @click="showPopup = false" class="close-btn">X</button>
  <div class="present-percentage text-left mb-2" style="position: absolute; top: 15px; left: 20px; font-weight: bold;">
  Attendance Score : {{ quarterlyPresentQuarter }}

</div>
<div v-if="!scoreSaved">
  <button @click="updateQuarterlyScore" class="btn btn-success" style="position: absolute; top: 13px; width: 83px; right: 61px; padding: 7px 0;font-size: 13px; border-radius: 9px;">
    Save Score
  </button> 
</div>
<div v-else style="position: absolute; top: 17px; right: 61px; font-size: 20px; color: green;">
  ✅
</div>



  <!-- <h4>{{ selectedEmployee }}'s Monthly Attendance</h4> -->
<div class="month-header d-flex justify-content-center align-items-center mb-3 gap-4">
  <button @click="goToPreviousMonth" class="btn-light">⮜ </button>
  <h5 class="m-0">{{ getMonthName(currentMonth) }} {{ currentYear }}</h5>
  <button @click="goToNextMonth" class="btn-light"> ⮞</button>
</div>
    <div class="legend">
  <span class="legend-item present"> Present: {{ statusSummary.Present || 0 }}</span>
  <span class="legend-item absent"> Absent: {{ statusSummary.Absent || 0 }}</span>
  <span class="legend-item half-day"> Half Day: {{ statusSummary.HalfDay || 0 }}</span>
  <span class="legend-item onsite"> On Site: {{ statusSummary.OnSite || 0 }}</span>
  <span class="legend-item traveling"> Traveling: {{ statusSummary.Traveling || 0 }}</span>
  <span class="legend-item leave"> Leave: {{ statusSummary.Leave || 0 }}</span>
</div>

    <table class="calendar">
      <thead>
        <tr>
          <th v-for="day in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="day">{{ day }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="week in buildCalendar(employeeMonthlyData)" :key="week[0]?.date">
          <td v-for="day in week" :key="day.date" :class="day.statusClass">
            {{ day.day }}
          </td>
        </tr>
      </tbody>
    </table>

   
  </div>


</div>

<!-- Salary Calculation Popup -->
<div v-if="salaryPopup.show" class="salary-popup-overlay">
  <div class="salary-popup-box shadow-lg rounded-xl bg-white p-5 text-center relative animate-popup">
    <button @click="salaryPopup.show = false" class="salary-popup-close-btn">X</button>
    <h3 class="salary-popup-title mb-3">Salary Summary</h3>
    
    <p class="salary-popup-line">
      <span class="label">Employee:</span>
      <span class="value">{{ salaryPopup.employeeName }}</span>
    </p>

   <p class="salary-popup-line">
  <span class="label">Month:</span>
  <span class="value">{{ getMonthName(currentMonth) }} {{ currentYear }}</span>
</p>

    <p class="salary-popup-line total-salary">
      <span class="label">Calculated Salary:</span>
      <span class="value">₹{{ salaryPopup.calculatedSalary }}</span>
    </p>
  </div>
</div>




    </div>

  
  </div>
</template>

<script>  
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'

export default {
  components: {
    Sidebar
  },
  data() {

    return {
      
markAttendance: {
  employee: '',
  status: '',
  date: '',
  time: ''
},
today: '',
      showMarkAttendancePopup: false,
      employees: [],
       present_quarter: null,
      attendanceByMonth: {},
    holidays: [],
      isMobile: false,
  isSidebarVisible: false,
  userSalary: 0,
  salaryPopup: {
  show: false,
  employeeName: '',
  calculatedSalary: 0
},

  salaries: {},
  statusSummary: {
  Present: 0,
  Absent: 0,
  OnSite: 0,
  HalfDay: 0,
  Traveling: 0,
  Leave: 0
},
      currentMonth: new Date().getMonth(),  // 0 = Jan, 11 = Dec
currentYear: new Date().getFullYear(),

      showPopup: false,
      showPopupsalary: false,
       scoreSaved: false,
selectedEmployee: null,
employeeMonthlyData: [],
      viewMode: 'day',
       currentDate: new Date().toLocaleDateString(),
      attendanceRecords: [],
      statusCounts: {
  Present: 0,
  'OnSite': 0,
  'HalfDay': 0,
  Traveling: 0,
  Absent: 0,
  'Leave': 0,
  Late: 0
},



      allDropdownsLocked: false,
     
      clockOut: '',
showTimer: false,
timer: '',

     users: [
  {
    name: 'Ajay',
    shift: '9:00 AM - 6:00 PM',
    status: '',
    clockIn: '',
    clockOut: '',
    requiredTime: '8 Hours',
    actualTime: '',
    statusLocked: false,
    siteName: '',
    travelTime: '',
    travelFrom: '',
    travelTo: '',
    isLate: false
  },
]


    }
  },
  
computed: {
 quarterlyPercentage() {
  const months = this.getCurrentQuarterMonths();
  let totalWorkingDays = 0;
  let totalPresentDays = 0;

  months.forEach(({ month, year }) => {
    const monthRecords = this.attendanceByMonth[`${year}-${month}`] || [];
    const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-based here

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayOfWeek = new Date(dateStr).getDay();
      const isSunday = dayOfWeek === 0;

      const record = monthRecords.find(r => r.date === dateStr);
      const status = record?.status?.toLowerCase().trim();

      const isLeave = status === 'leave';
      const isAbsent = status === 'absent';

      // Count this calendar day as a working day unless it's a Leave day
      if (!isLeave) {
        totalWorkingDays++;
      }
      if (
        ['present', 'onsite', 'traveling', 'halfday'].includes(status)
        || (isSunday && !isLeave && !isAbsent && !status) // blank Sunday => count as present
      ) {
        totalPresentDays++;
      }
    }
  });

  return totalWorkingDays > 0 ? Math.round((totalPresentDays / totalWorkingDays) * 100) : 0;
},


  quarterlyPresentQuarter() {
    return Math.round(this.quarterlyPercentage * 0.25);
  }
},





  methods: {
async submitMarkedAttendance() {
  if (
    !this.markAttendance.employee ||
    !this.markAttendance.status ||
    !this.markAttendance.date
  ) {
    alert('Please fill all required fields');
    return;
  }

  try {
    const payload = {
      name: this.markAttendance.employee,
      status: this.markAttendance.status,
      clock_in: this.markAttendance.time || null,
      date: this.markAttendance.date
    };

    // 🔥 SINGLE API CALL (backend handles update or insert)
    await axios.post(
      'https://employees.archenterprises.co.in/api/api/attendance/store-or-update',
      payload
    );

    alert('Attendance saved successfully');

    this.showMarkAttendancePopup = false;

    // reset form
    this.markAttendance = {
      employee: '',
      status: '',
      date: '',
      time: ''
    };

    this.fetchAttendance(); // refresh table

  } catch (error) {
    console.error('Error saving attendance:', error);
    alert('Failed to save attendance');
  }
},


async fetchAllEmployees() {
  try {
    const res = await axios.get('https://employees.archenterprises.co.in/api/api/users') // removed extra /api
    // Filter out users from Ownership department
    this.employees = res.data
      .filter(user => user.department !== 'Ownership') // 👈 hide "Ownership"
      .map(user => ({
        id: user.id,
        name: user.name,
        salary: user.salary || null,
        department: user.department,
        calculating: false
      }))
  } catch (err) {
    console.error('Error fetching employees:', err)
  }
},

    async updateClLeaveUsed(amount) {
    try {
      const token = localStorage.getItem("token");

      await axios.post("https://employees.archenterprises.co.in/api/api/update-cl-leave", {
        user_id: this.user.name,
        increment_by: amount
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

    } catch (error) {
      console.error("Error updating CL leave used:", error);
    }
  },
    resetSalaryPopup() {
    // Your logic to reset or hide the popup
    this.salaryPopupVisible = false;
    this.salaryForm = {}; // or whatever needs to be reset
  },

 async updateQuarterlyScore() {
  try {
    const today = new Date();
    const response = await axios.post('https://employees.archenterprises.co.in/api/api/update-quarterly-score', {
      name: this.selectedEmployee,
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      quarter_score: this.quarterlyPresentQuarter,
    });

    console.log('Response:', response.data); // 👈 ADD THIS

    if (response.data.success) {
      console.log('Quarterly score updated.');
    } else {
      console.warn('Quarterly score update failed.');
    }
  } catch (error) {
    console.error('Error updating quarterly score:', error.response?.data?.errors || error);
  }
},




getCurrentQuarterMonths() {
  const month = this.currentMonth + 1; // 1-based
  const year = this.currentYear;
  let startMonth;

  if (month >= 1 && month <= 3) {
    startMonth = 1;
  } else if (month >= 4 && month <= 6) {
    startMonth = 4;
  } else if (month >= 7 && month <= 9) {
    startMonth = 7;
  } else {
    startMonth = 10;
  }

  return [
    { month: startMonth, year },
    { month: startMonth + 1, year },
    { month: startMonth + 2, year },
  ];
},


    fetchHolidays() {
    axios.get('https://employees.archenterprises.co.in/api/api/holidays')
      .then(res => {
        this.holidays = res.data;
      })
      .catch(err => console.error('Error fetching holidays:', err));
  },
  addHoliday() {
    if (!this.newHoliday.date || !this.newHoliday.title) {
      alert("Both title and date are required");
      return;
    }
    axios.post('https://employees.archenterprises.co.in/api/api/holidays', this.newHoliday)
      .then(() => {
        this.newHoliday.title = '';
        this.newHoliday.date = '';
        this.fetchHolidays();
      })
      .catch(err => console.error('Error adding holiday:', err));
  },

    checkIfMobile() {
    this.isMobile = window.innerWidth <= 768;
    if (this.isMobile) {
      this.isSidebarVisible = false;
    } else {
      this.isSidebarVisible = true;
    }
  },
  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  },
    async calculateSalaryOnClick(record) {
  record.calculating = true;


  try {
    const [monthlyRes, salary] = await Promise.all([
      axios.get(`https://employees.archenterprises.co.in/api/api/attendance/monthly/${record.name}?month=${this.currentMonth + 1}&year=${this.currentYear}`),
      this.fetchUserSalary(record.name)
    ]);

    const monthlyData = monthlyRes.data.data || [];

    record.salary = this.calculateSalary({ ...record, monthlyData }, salary);
  } catch (error) {
    console.error(`Error calculating salary for ${record.name}:`, error);
    record.salary = 'Error';
  } finally {
    record.calculating = false;
  }
},

  async fetchUserSalary(name) {
  try {
    const response = await axios.get(`https://employees.archenterprises.co.in/api/api/user-salary-by-name/${name}`);
    return parseFloat(response.data.salary);
  } catch (error) {
    console.error("Failed to fetch salary:", error);
    return 0;
  }
}, 

calculateSalary(record, baseSalary) {
  const totalDaysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
  const perDaySalary = baseSalary / totalDaysInMonth;

  let fullPaidDays = 0;
  let halfPaidDays = 0;

  // 🔹 1. Count full/half paid days from attendance records
  record.monthlyData.forEach(day => {
    const status = day.status?.trim().toLowerCase();
    if (['present', 'onsite', 'traveling', 'leave'].includes(status)) {
      fullPaidDays++;
    } else if (status === 'halfday') {
      fullPaidDays++;
      this.updateClLeaveUsed(0.5); // optional: update CL leave used
    }
  });

  // 🔹 2. Count total Sundays in the current month
  let sundayCount = 0;
  for (let i = 1; i <= totalDaysInMonth; i++) {
    const date = new Date(this.currentYear, this.currentMonth, i);
    if (date.getDay() === 0) sundayCount++; // Sunday = 0
  }

  // 🔹 3. Add Sunday salary
  const sundaySalary = sundayCount * perDaySalary;

  // 🔹 4. Calculate total salary
  const salaryForMonth = (fullPaidDays * perDaySalary) + (halfPaidDays * perDaySalary / 2) + sundaySalary;

  return Math.round(salaryForMonth);
},







    isEarly(clockIn) {
  const earlyThreshold = new Date();
  earlyThreshold.setHours(9, 30, 0); // Before this = Early

  const clockInParts = clockIn.split(':').map(Number);
  const clockInDate = new Date();
  clockInDate.setHours(clockInParts[0], clockInParts[1], clockInParts[2] || 0);

  return clockInDate < earlyThreshold;
},

isLate(clockIn) {
  const lateThreshold = new Date();
  lateThreshold.setHours(10, 0, 0); // After this = Late

  const clockInParts = clockIn.split(':').map(Number);
  const clockInDate = new Date();
  clockInDate.setHours(clockInParts[0], clockInParts[1], clockInParts[2] || 0);

  return clockInDate > lateThreshold;
},

    goToPreviousMonth() {
  if (this.currentMonth === 0) {
    this.currentMonth = 11;
    this.currentYear -= 1;
  } else {
    this.currentMonth -= 1;
  }

  this.resetSalaryPopup(); // 🔁 Reset on month change
  this.fetchEmployeeMonthlyData();
},


goToNextMonth() {
  if (this.currentMonth === 11) {
    this.currentMonth = 0;
    this.currentYear += 1;
  } else {
    this.currentMonth += 1;
  }
  this.fetchEmployeeMonthlyData();
},

getMonthName(index) {
  return [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ][index];
},

buildCalendar(attendanceData) {
  const year = this.currentYear;
  const month = this.currentMonth;

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const calendar = [];
  let week = [];

  const isHoliday = (dateStr) => {
  return this.holidays.some(h => h.date === dateStr);
};


  const getStatusClass = (dateStr) => {
  const normalizedDate = new Date(dateStr).toISOString().split('T')[0];

  const record = attendanceData.find(entry =>
    new Date(entry.date).toISOString().split('T')[0] === normalizedDate
  );

  const publicHolidays = ['01-26', '05-01', '08-15'];
  const [year, month, day] = normalizedDate.split('-');
  const mmdd = `${month}-${day}`;

  if (isHoliday(normalizedDate)) return 'public-holiday';
  if (publicHolidays.includes(mmdd)) return 'public-holiday';

  const todayStr = new Date().toISOString().split('T')[0];

  if (
    new Date(normalizedDate) <= new Date(todayStr) &&
    (!record || !record.status || record.status.trim() === '')
  ) {
    return 'no-status';
  }

  if (!record || !record.status) return '';
  return `cal-${record.status.toLowerCase().replace(/\s+/g, '-')}`;
};



  const padDay = firstDayOfMonth.getDay(); // 0 = Sunday, 6 = Saturday

  for (let i = 0; i < padDay; i++) {
    week.push({ day: '', date: '', statusClass: '' });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    week.push({
      day,
      date: dateStr,
      statusClass: getStatusClass(dateStr)
    });

    if (week.length === 7) {
      calendar.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) {
      week.push({ day: '', date: '', statusClass: '' });
    }
    calendar.push(week);
  }

  return calendar;
},


 async viewEmployeeMonthlyAttendance(name) {
  this.selectedEmployee = name;
  this.showPopup = true;

  const months = this.getCurrentQuarterMonths();
  const requests = months.map(({ month, year }) => {
    return axios.get(`https://employees.archenterprises.co.in/api/api/attendance/monthly/${name}?month=${month}&year=${year}`);
  });

  try {
    const responses = await Promise.all(requests);
    responses.forEach((res, i) => {
      const { month, year } = months[i];
      this.attendanceByMonth[`${year}-${month}`] = res.data.data;
    });

    this.employeeMonthlyData = this.attendanceByMonth[`${this.currentYear}-${this.currentMonth + 1}`] || [];

    // Reset status summary
    this.statusSummary = {
      Present: 0,
      Absent: 0,
      OnSite: 0,
      HalfDay: 0,
      Traveling: 0,
      Leave: 0
    };

    this.employeeMonthlyData.forEach(record => {
      const status = record.status?.trim();
      if (status && this.statusSummary.hasOwnProperty(status)) {
        this.statusSummary[status]++;
      }
    });

    // ✅ Update quarterly presentQuarter
    const quarter = this.quarterlyPresentQuarter;
    const res = await axios.post('https://employees.archenterprises.co.in/api/api/attendance/update-present-quarter', {
      name: this.selectedEmployee,
      month: this.currentMonth + 1,
      year: this.currentYear,
      present_quarter: quarter
    });

    // ✅ Skip insert if update was successful (backend says it's already there)
    if (res.data?.message === 'Present quarter updated successfully') {
      console.log('✅ Present quarter already updated. Skipping insert.');
      return;
    }

    console.log('Quarterly present quarter saved:', quarter);

  } catch (error) {
    console.error('Error fetching quarterly attendance or updating:', error);
  }
},


async fetchEmployeeMonthlyData() {
  const month = this.currentMonth + 1;
  const year = this.currentYear;

  try {
    const response = await axios.get(`https://employees.archenterprises.co.in/api/api/attendance/monthly/${this.selectedEmployee}?month=${month}&year=${year}`);
    this.employeeMonthlyData = response.data.data;

    // Reset counts
    this.statusSummary = {
      Present: 0,
      Absent: 0,
      OnSite: 0,
      HalfDay: 0,
      Traveling: 0,
      Leave: 0
    };

    // Count statuses
    this.employeeMonthlyData.forEach(record => {
      const status = record.status?.trim();
      if (status && this.statusSummary.hasOwnProperty(status)) {
        this.statusSummary[status]++;
      }
    });

    // Save presentQuarter to backend
    const quarter = this.quarterlyPresentQuarter;

    await axios.post('https://employees.archenterprises.co.in/api/api/attendance/update-present-quarter', {
      name: this.selectedEmployee,
      month: month,
      year: year,
      present_quarter: quarter
    });

    console.log('Present quarter saved:', quarter);
  } catch (error) {
    console.error('Error fetching or saving attendance data:', error);
  }
},



    toggleView() {
  this.viewMode = this.viewMode === 'day' ? 'month' : 'day';
  if (this.viewMode === 'day') {
    this.fetchAttendance();
  } else {
    this.fetchMonthlyAttendance();
  }
},

    switchView(mode) {
  this.viewMode = mode;
  if (mode === 'day') {
    this.fetchAttendance(); // Already exists
  } else if (mode === 'month') {
    this.fetchMonthlyAttendance();
  }
},
fetchMonthlyAttendance() {
  axios
    .get('https://employees.archenterprises.co.in/api/api/attendance/monthly') // Adjust URL as per backend
    .then((response) => {
      this.attendanceRecords = response.data;
    })
    .catch((error) => {
      console.error('Error fetching monthly attendance:', error);
    });
},

    calculateEarlyTime(clockIn) {
  const threshold = new Date();
  threshold.setHours(9, 30, 0); // Office time

  const clockInParts = clockIn.split(':').map(Number);
  const clockInDate = new Date();
  clockInDate.setHours(clockInParts[0], clockInParts[1], clockInParts[2] || 0);

  const diffMs = threshold - clockInDate;
  if (diffMs <= 0) return '00:00:00';

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
},

     resetNewTaskForm() {
    this.newTask = {
      title: '',
      description: '',
      dueDate: '',
      assignedTo: ''
    };
  },
   calculateLateTime(clockIn) {
  const clockInParts = clockIn.split(':').map(Number);
  const clockInDate = new Date();
  clockInDate.setHours(clockInParts[0], clockInParts[1], clockInParts[2] || 0);

  // Define 9:30 AM and 1:00 PM thresholds
  const referenceTime = new Date();
  referenceTime.setHours(9, 30, 0); // Always calculate late from 9:30

  const upperBound = new Date();
  upperBound.setHours(13, 0, 0); // 1:00 PM

  if (clockInDate <= referenceTime || clockInDate > upperBound) {
    return null; // Not in late window
  }

  const diffMs = clockInDate - referenceTime;
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
},



    getStatusClass(status) {
  if (!status) return '';

  const normalized = status.toLowerCase();
  switch (normalized) {
    case 'present':
      return 'on-time';
    case 'onsite':
      return 'on-site';
    case 'halfday':
      return 'on-halfday';
    case 'absent':
      return 'absence';
    case 'traveling':
      return 'traveling';
    case 'leave':
      return 'leave';
    default:
      return ''; // ❌ remove fallback to 'late'
  }
    },
 async fetchAttendance() {
  try {
    const response = await axios.get('https://employees.archenterprises.co.in/api/api/attendance');
    const records = response.data;

    // ✅ Filter out "N/A" statuses
    const filteredRecords = records.filter(record => record.status?.trim()?.toUpperCase() !== 'N/A');

    const promises = filteredRecords.map(async (record) => {
      try {
        record.monthlyData = [];
        record.salary = null;
        return record;
      } catch (error) {
        console.error(`Error fetching data for ${record.name}:`, error);
        record.salary = 'N/A';
        return record;
      }
    });

    this.attendanceRecords = await Promise.all(promises);
  } catch (error) {
    console.error('Error fetching attendance:', error);
  }
},



    
    handleTravelToChange(user) {
  if (!user.travelFrom || !user.travelTo) {
    console.warn('Both From and To travel times are required.')
    return
  }

  const now = new Date()
  const formattedTime = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  user.clockIn = user.travelFrom
  user.clockOut = user.travelTo
  user.actualTime = this.calculateActualTime({
    clockIn: user.travelFrom,
    clockOut: user.travelTo
  })

  axios.post('https://employees.archenterprises.co.in/api/api/attendance/store', {
    name: user.name,
    status: user.status,
    clock_in: user.travelFrom,
    clock_out: user.travelTo,
    required_time: user.requiredTime,
    actual_time: user.actualTime,
    site_name: user.siteName,
    travel_from: user.travelFrom,
    travel_to: user.travelTo,
    date: new Date().toISOString().slice(0, 10)
  })
  .then(() => {
    console.log('Attendance saved for Site Traveling')
  })
  .catch(err => {
    console.error('Error saving Site Traveling attendance:', err)
  })
  localStorage.setItem('attendanceData', JSON.stringify(this.users))
localStorage.setItem('statusCounts', JSON.stringify(this.statusCounts))

},

calculateActualTime(user) {
  if (!user.clockIn || !user.clockOut) return ''

  const parseTime = (timeStr) => {
    const parts = timeStr.split(':').map(Number)
    return {
      hours: parts[0] || 0,
      minutes: parts[1] || 0,
      seconds: parts[2] || 0
    }
  }

  const inTime = parseTime(user.clockIn)
  const outTime = parseTime(user.clockOut)

  const inDate = new Date()
  inDate.setHours(inTime.hours, inTime.minutes, inTime.seconds)

  const outDate = new Date()
  outDate.setHours(outTime.hours, outTime.minutes, outTime.seconds)

  const diffMs = outDate - inDate
  if (diffMs <= 0) return '00:00:00'

  const totalSeconds = Math.floor(diffMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
},


    startTimer(user) {
  let seconds = 0
 

  const intervalId = setInterval(() => {
    seconds++
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0')
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
    const secs = String(seconds % 60).padStart(2, '0')
    user.timer = `${hrs}:${mins}:${secs}`

    // Stop timer if user changes status
    if (user.status !== 'Traveling') {
      clearInterval(intervalId)
    }
  }, 1000)
},
punchOut(user) {
  const now = new Date()
  const formattedTime = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  user.clockOut = formattedTime
  user.actualTime = this.calculateActualTime(user)

  axios.post('https://employees.archenterprises.co.in/api/api/attendance/store', {
  name: user.name,
  status: user.status,
  clock_in: user.clockIn,
  clock_out: user.clockOut,
  required_time: user.requiredTime,
  actual_time: user.actualTime,
  site_name: user.siteName,
  travel_from: user.travelFrom,  // ✅
  travel_to: user.travelTo,      // ✅
  date: new Date().toISOString().slice(0, 10)
})

  .then(() => {
    console.log('Attendance saved')
  })
  .catch(err => {
    console.error('Error saving attendance:', err)
  })
  localStorage.setItem('attendanceData', JSON.stringify(this.users))
localStorage.setItem('statusCounts', JSON.stringify(this.statusCounts))

},


    formatDate(date) {
      const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }
      return date.toLocaleDateString(undefined, options)
    },

   getCurrentTime() {
  const now = new Date()
  return now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
},

updateStatus(user) {
  this.allDropdownsLocked = true,     
  user.statusLocked = true;


  const formattedTime = this.getCurrentTime()
  user.clockIn = ''
  user.clockOut = ''
  user.siteName = ''
  user.travelTime = ''
  user.actualTime = ''
  user.isLate = false

  switch (user.status) {
    case 'Present':
  user.clockIn = formattedTime

  // ✅ Late detection logic BEFORE locking
  const threshold = new Date()
  threshold.setHours(9, 45, 0) // 09:45:00

  const clockInDate = new Date()
  const [hrs, mins, secs] = formattedTime.split(':').map(Number)
  clockInDate.setHours(hrs, mins, secs)

  if (clockInDate > threshold) {
    user.isLate = true
    this.statusCounts['Late'] += 1 // ✅ Increment Late count
  }

  user.statusLocked = true // ⬅️ lock dropdown after checking for late
  break


   case 'HalfDay':
  user.clockIn = formattedTime
  user.statusLocked = true

  // ✅ Instantly increase CL leave used by 0.5
  this.updateClLeaveUsed(0.5)

  break


    case 'Absent':
      user.statusLocked = true
      break

    case 'OnSite':
    case 'Traveling':
      user.statusLocked = false
      break
  }
localStorage.setItem('attendanceData', JSON.stringify(this.users))
localStorage.setItem('statusCounts', JSON.stringify(this.statusCounts))
localStorage.setItem('attendanceData', JSON.stringify(this.users))


  console.log(`Updated status for ${user.name}: ${user.status}`)
},



 



    statusClass(status) {
      switch (status) {
        case 'Present': return 'badge-success'
        case 'Absent': return 'badge-danger'
        case 'OnSite': return 'badge-primary'
        case 'Traveling': return 'badge-info'
        case 'HalfDay': return 'badge-warning'
        default: return 'badge-secondary'
      }
    },

    goTo(route) {
      this.$router.push(`/${route}`)
    },

    logout() {
      const token = localStorage.getItem('token')
      axios
        .post(
          'https://employees.archenterprises.co.in/api/api/logout',
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        .finally(() => {
          localStorage.removeItem('token')
          this.$router.push('/auth')
        })
    },

    resetStatusesIfNewDate() {
  const savedDate = localStorage.getItem('attendanceDate');
  const today = new Date().toDateString();

  if (savedDate !== today) {
    localStorage.setItem('attendanceDate', today);
    localStorage.removeItem('attendanceData');
    localStorage.removeItem('statusCounts');

    this.users.forEach(user => {
      user.status = '';
      user.clockIn = '';
      user.clockOut = '';
      user.siteName = '';
      user.travelFrom = '';
      user.travelTo = '';
      user.actualTime = '';
      user.statusLocked = false;
      user.isLate = false;
    });

    this.statusCounts = {
      Present: 0,
      'OnSite': 0,
      'HalfDay': 0,
      Traveling: 0,
      Absent: 0,
      'Leave': 0,
      Late: 0
    };
  }
}

  },
beforeUnmount() {
  clearInterval(this.attendanceInterval);
},
mounted() {
  this.attendanceInterval = setInterval(() => {
  this.fetchAttendance();
}, 30000); // every 30 seconds

   const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0'); // month is 0-indexed
  const dd = String(now.getDate()).padStart(2, '0');
  this.today = `${yyyy}-${mm}-${dd}`;
  
  // Set default date to today
  this.markAttendance.date = this.today;
   this.fetchAllEmployees();
    this.fetchHolidays();
  this.checkIfMobile();
window.addEventListener('resize', this.checkIfMobile);

  const today = new Date().toDateString();
  const savedDate = localStorage.getItem('attendanceDate');
  const savedUsers = localStorage.getItem('attendanceData');

  this.fetchAttendance(); // this internally fetches salaries now

  if (savedUsers && savedUsers !== "undefined") {
    this.users = JSON.parse(savedUsers);
  }

  if (savedDate === today) {
    const storedUsers = localStorage.getItem('attendanceData');
    const storedCounts = localStorage.getItem('statusCounts');

    if (storedUsers && storedUsers !== "undefined") {
      this.users = JSON.parse(storedUsers);
    }

    if (storedCounts && storedCounts !== "undefined") {
      this.statusCounts = JSON.parse(storedCounts);
    }
  } else {
    localStorage.setItem('attendanceDate', today);
    localStorage.removeItem('attendanceData');
    localStorage.removeItem('statusCounts');

    this.users.forEach(user => {
      user.status = '';
      user.clockIn = '';
      user.clockOut = '';
      user.siteName = '';
      user.travelFrom = '';
      user.travelTo = '';
      user.actualTime = '';
      user.statusLocked = false;
      user.isLate = false;
    });

    this.statusCounts = {
      Present: 0,
      OnSite: 0,
      HalfDay: 0,
      Traveling: 0,
      Absent: 0,
      Leave: 0,
      Late: 0
    };
  }

  this.currentDate = this.formatDate(new Date());

  if (!localStorage.getItem('statusCounts')) {
    axios.get('https://employees.archenterprises.co.in/api/api/attendance/status-counts')
      .then(response => {
        Object.assign(this.statusCounts, response.data);
        localStorage.setItem('statusCounts', JSON.stringify(this.statusCounts));
      })
      .catch(error => {
        console.error('Error fetching status counts:', error);
      });
  }
}



}
</script>




<style scoped>
  .head-title{
      color: white;
    display: flex;
    gap: 7px;
    text-decoration: none;
font-family: cursive;
    align-items: center; width: 100%;
}
/* Background overlay */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(6px);
}

/* Popup content box */
.popup-content {
  position: relative;
  background: linear-gradient(145deg, #ffffff, #f9fafb);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  padding: 40px 25px 30px;
  width: 90%;
  max-width: 700px;
  animation: fadeIn 0.4s ease;
}

/* Popup heading */
.popup-title {
  color: #08525c;
  margin-bottom: 17px;
}

/* Subtitle */
.popup-subtitle {
  color: var(--text-white);
  font-size: 0.95rem;
  margin-bottom: 20px;
}

/* Table wrapper for scroll on mobile */
.table-wrapper {
  max-height: 400px;
  overflow-y: auto;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
}

/* Table styles */
.responsive-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.responsive-table th {
  background: var(--primary);
  color: white;
  font-weight: bold;
  padding: 12px;
  text-align: center;
  position: sticky;
  top: 0;
}

.responsive-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
  text-align: left;
  font-size: 0.95rem;
}

.clickable-name {
  color: #004aad;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.3s;
}

.clickable-name:hover {
  color: #002f6c;
  text-decoration: underline;
}


/* Calculate button */
.cal_sal {
  background: #004aad;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: 0.3s;
}

.cal_sal:hover {
  background: #002f6c;
}

.cal_sal:disabled {
  background: #b0b0b0;
  cursor: not-allowed;
}

/* X button */
.close-btn {
  position: absolute;
  top: 12px;
  right: 15px;
  background: #f87171;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 14px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: var(--sidebar);
}
/* Header Section */
.present-percentage {
  color: var(--text);
  font-size: 13px;
  background: #f1f5f9;
  padding: 6px 12px;
  border-radius: 8px;
  box-shadow: inset 0 0 3px rgba(0,0,0,0.1);
}
/* Smooth entrance animation */
@keyframes fadeInUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive tweaks */
@media (max-width: 600px) {
  .popup-content {
    padding: 20px;
  }
  .popup-title {
    font-size: 1.4rem;
  }
  .responsive-table th,
  .responsive-table td {
    font-size: 0.85rem;
  }
}
.logo-img {
  height: 70px;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-box {
  background: #fff;
  padding: 30px;
  width: 400px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  position: relative;
}


.form-group {
  margin-bottom: 15px;
}

input[type="text"],
input[type="date"] {
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.submit-btn {
  background: #28a745;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  margin-bottom: 20px;
}

.holiday-list {
  list-style: none;
  padding: 0;
}

.holiday-list li {
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delete-btn {
  background: red;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 3px 7px;
  cursor: pointer;
}

/* Public Holiday (green) */
.public-holiday {
  background-color: #c8f7c5 !important;
  color: #2d6a2e;
  font-weight: bold;
}

/* No status (red) */
.no-status {
  background-color: #f8d7da;
  color: #842029;
}

/* Optional: Improve overall calendar cell visuals */
.calendar td {
  padding: 10px;
  text-align: center;
  border: 1px solid #dee2e6;
}

.no-status {
     background-color: #ffe0e0 !important;
    color: #c00 !important;
    font-weight: 700;
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

  .expanded-content {
    margin-left: 0 !important;
    transition: margin 0.3s ease-in-out;
  }
}

@media (max-width: 768px) {
  .attendance-mobile-card {
    width: 100%;
    border: none;
  }

  .attendance-mobile-card thead {
    display: none;
  }

  .attendance-mobile-card tbody {
    display: block;
  }

  .attendance-mobile-card tbody tr {
    display: block;
    background: #fff;
    margin-bottom: 16px;
    border-radius: 10px;
    /* box-shadow: 1px 0px 0px 2px rgb(176 176 176); */
    padding: 12px 35px;
  }
  .container-fluid{
        width: 100%!important;
    padding-right: 0!important;
    padding-left: 0!important;
  }

  .attendance-mobile-card td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 14px;
    border-bottom: 1px solid #eee;
  }

  .attendance-mobile-card td:last-child {
    border-bottom: none;
  }

  .attendance-mobile-card td::before {
    content: attr(data-label);
    font-weight: 700;
    text-transform: uppercase;
color: var(--text);
    flex: 1;
    text-align: left;
  }

  .attendance-mobile-card td > span,
  .attendance-mobile-card td > div,
  .attendance-mobile-card td > button {
    flex: 0;
    text-align: right;
    display: block;
    white-space: nowrap;
  }

  .attendance-mobile-card .clickable-name {
    color: var(--text);
    font-weight: 600;
    FONT-SIZE: 15px;
        cursor: pointer;
        text-transform: uppercase;
  }

  .attendance-mobile-card .attendance-status {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 13px;
    color: #fff;
  }

  .attendance-mobile-card .on-time    { background-color: #28a745; }
  .attendance-mobile-card .on-site    { background-color: var(--primary); }
  .attendance-mobile-card .on-halfday { background-color: #ffc107; color: var(--text); }
  .attendance-mobile-card .absence    { background-color: #dc3545; }
  .attendance-mobile-card .traveling  { background-color: #17a2b8; }
  .attendance-mobile-card .leave      { background-color: var(--text); }

  .attendance-mobile-card .text-purple { color: #6f42c1; }
  .attendance-mobile-card .text-danger { color: #dc3545; }
}
.cal_sal {
  color: #0d6efd;
  border: 1px solid #0d6efd;
  background-color: transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.375rem;
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out, border-color 0.15s ease-in-out;
  cursor: pointer;
}

.cal_sal:hover {
  color: #fff;
  background-color: var(--primary);
  border-color: #0d6efd;
}

.cal_sal:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}


@keyframes popupFade {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}


.btn-light {
  background: #e2e8f000;
  border: none;
  border-radius: 8px;
  padding: 5px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn.btn-success {
  background: linear-gradient(90deg, #22c55e, #16a34a);
  color: white;
  border: none;
  transition: all 0.2s ease;
}
.btn.btn-success:hover {
  background: linear-gradient(90deg, #16a34a, #15803d);
}

.btn-light:hover {
  background: #cbd5e1;
}
.popup-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* Prevent body scroll */
  z-index: 999;
}

.popup-content {
  position: relative; /* make this the positioning context for .close-btn */
  /* padding: 20px; */
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  margin: auto;
}
.calendar {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  margin-top: 1rem;
}

.calendar th {
  background: #e2e8f0;
  color: #334155;
  padding: 8px;
  font-weight: 600;
}
.calendar td {
  padding: 10px;
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.calendar td:hover {
  background: #f9fafb;
  transform: scale(1.02);
}

.cal-absent {
  background-color: #f44336; /* Red */
  color: white;
}

.cal-onsite {
  background-color: #9e9e9e; /* Grey */
  color: white;
}

.cal-halfday {
  background-color: #ffc107ad; /* Yellow */
  color: var(--text);
}

.cal-traveling {
  background-color: #ff9800; /* Orange */
  color: white;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  font-size: 14px;
  margin-bottom: 15px;
}

.legend-item {
  background: #f8fafc;
  padding: 6px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  font-weight: 500;
}

.legend-item::before {
  content: '';
  width: 16px;
  height: 16px;
  display: inline-block;
  border-radius: 4px;
}

.legend-item.present::before {
  background-color: #00e676;
}

.legend-item.absent::before {
  background-color: #e77074;
}

.legend-item.half-day::before {
  background-color: #ffc107ad;
}

.legend-item.onsite::before {
  background-color: #9e9e9e;
}

.legend-item.traveling::before {
  background-color: #ff9800;
}
.legend-item.leave::before{
  background-color: #3595fa;
}
.month-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 20px;
  font-weight: bold;
}

.month-header button {
  font-size: 20px;
  font-weight: bold;
}

.legend-item.present {
  /* background-color: #28a745; */
  color: rgb(0, 0, 0);
  padding: 4px 8px;
  border-radius: 4px;
}
.legend-item.absent {
  /* background-color: #dc3545; */
  color: rgb(0, 0, 0);
  padding: 4px 8px;
  border-radius: 4px;
}
.legend-item.half-day {
  /* background-color: #ffc107; */
  color: black;
  padding: 4px 8px;
  border-radius: 4px;
}
.legend-item.onsite {
  /* background-color: var(--primary); */
  color: rgb(2, 1, 1);
  padding: 4px 8px;
  border-radius: 4px;
}
.legend-item.traveling {
  /* background-color: #17a2b8; */
  color: rgb(1, 0, 0);
  padding: 4px 8px;
  border-radius: 4px;
}
.legend-item.leave {
  /* background-color: var(--text); */
  color: rgb(0, 0, 0);
  padding: 4px 8px;
  border-radius: 4px;
}

/* Attendance day coloring */
.cal-present {
  background-color: #00f23a !important;
  color: rgb(9, 1, 1);
  text-align: center;
  border-radius: 4px;
}
.cal-absent {
  background-color: #ffe0e0 !important;
  color: #c00!important;
  text-align: center;
  border-radius: 4px;
}

.cal-traveling {
  background-color: #fca400 !important;
  color: white;
  text-align: center;
  border-radius: 4px;
}
.cal-leave {
  background-color: #3595fa !important;
  color: white;
  text-align: center;
  border-radius: 4px;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 700px;
  max-height: 80vh;
  overflow-y: auto;
}

.legend {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  place-content: center;

}

.legend-item {
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.85rem;
  color: #fff;
}
/* 
.present { background: green; }
.absent { background: red; }
.half-day { background: orange; }
.onsite { background: blue; }
.traveling { background: teal; }
.leave { background: purple; } */

.calendar {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}

.calendar td {
  width: 14%;
  height: 50px;
  border: 1px solid #ccc;
  vertical-align: middle;
}


.clickable-name { 
  cursor: pointer;
  color: var(--text);
  text-decoration: none;
  font-weight: 600;
}

.text-purple {
  color: rgb(25, 1, 62);
  font-weight: 400;
}

.attendance-status.on-time {
  color: #03540f;
  /* border: 1px solid #03540f; */
  background-color: transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.375rem;
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out, border-color 0.15s ease-in-out;
  cursor: context-menu;
}

/* .attendance-status.on-time:hover {
  color: #0a0101;
  background-color: #07e887;
  border-color: #07e887;
} */

.attendance-status.on-time:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}


.attendance-status.on-site {
  color: #949494;
  /* border: 1px solid #949494; */
  background-color: transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.375rem;
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out, border-color 0.15s ease-in-out;
  cursor: context-menu;
}

/* .attendance-status.on-site:hover {
  color: #ffffff;
  background-color: #949494;
  border-color: #949494;
} */

.attendance-status.on-site:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}



.attendance-status.late {
  color: #ff9800;
}

.attendance-container {
  font-family: 'Segoe UI', sans-serif;
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  /* box-shadow: 0 4px 20px rgba(0,0,0,0.1); */
}

.attendance-header-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.attendance-tab {
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
}

.attendance-tab.active {
  color: #00cba9;
  border-bottom: 2px solid #00cba9;
}

.attendance-summary {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.attendance-stat-box {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
  min-width: 100px;
}

.attendance-number {
  font-size: 1.5rem;
  font-weight: bold;
}

.attendance-label {
  color: #888;
}

.attendance-percentage.up {
  color: green;
}

.attendance-percentage.down {
   color:var(--text);
}

.attendance-pie-chart .chart {
  width: 80px;
  height: 80px;
  background: radial-gradient(circle at center, #00cba9 0 25%, #ffd500 25% 50%, #ff647c 50% 75%, #627cff 75%);
  border-radius: 50%;
  margin-bottom: 0.5rem;
}

.attendance-legend span {
  display: block;
  margin: 0.2rem 0;
}

.attendance-table table {
  width: 100%;
  border-collapse: collapse;
}

.attendance-table th,
.attendance-table td {
 
  border-bottom: 1px solid #eee;
 place-self: center;
}

.attendance-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  vertical-align: middle;
  margin-right: 0.5rem;
}

.attendance-status {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  width: 55%;
  font-size: 0.75rem;
  margin-top: 0.25rem;
} 



.attendance-status.traveling {
  background-color: #f49200;
  color: white;
}


.attendance-status.traveling {
  color: #f49200;
  /* border: 1px solid #f49200; */
  background-color: transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.375rem;
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out, border-color 0.15s ease-in-out;
  cursor: context-menu;
}

/* .attendance-status.traveling:hover {
  color: #ffffff;
  background-color: #f49200;
  border-color: #f49200;
} */

.attendance-status.traveling:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}


.attendance-status.on-halfday {
  color: #7e8004;
  /* border: 1px solid #7e8004; */
  background-color: transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.375rem;
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out, border-color 0.15s ease-in-out;
  cursor: context-menu;
}

/* .attendance-status.on-halfday:hover {
  color: #020000;
  background-color: #fbff00;
  border-color: #fbff00;
} */

.attendance-status.on-halfday:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}



.attendance-status.absence {
  color: #dc3545;
  /* border: 1px solid #dc3545; */
  background-color: transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.375rem;
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out, border-color 0.15s ease-in-out;
  cursor: context-menu;
}

/* .attendance-status.absence:hover {
  color: #fff;
  background-color: #dc3545;
  border-color: #dc3545;
} */

.attendance-status.absence:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}




.attendance-status.late {
  background-color: #c803ff;
  color: rgb(255, 255, 255);
}


.attendance-status.leave {
  color: #0d6efd;
  /* border: 1px solid #0d6efd; */
  background-color: transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.375rem;
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out, border-color 0.15s ease-in-out;
  cursor: context-menu;
}

/* .attendance-status.leave:hover {
  color: #fff;
  background-color: var(--primary);
  border-color: #0d6efd;
} */

.attendance-status.leave:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}


.attendance-shift {
  font-size: 0.85rem;
  color: var(--text);
}

.attendance-date {
  margin: 1rem 0;
  font-weight: 600;
}

.text-danger{
   color:var(--text)!important;
      font-weight: 400;
}
.check-out{
  background-color: rgba(255, 255, 255, 0);
  color: #0d6efd;
  font-size: 13px!important;
}
.attendance-layout {
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: 'Segoe UI', sans-serif;
}

.attendance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #fff;
  border-bottom: 1px solid #ddd;
}

.attendance-logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.attendance-logout-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.attendance-container {
  background-color: #f8f9fa;
}

.attendance-card {
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  background-color: #fff;
  border: none;
}

/* Tabs */
.nav-tabs {
  border-bottom: none;
}

.nav-tabs .nav-link {
  border: none;
  background: none;
  font-weight: 600;
  color: #888;
}

.nav-tabs .nav-link.active {
  color: #00bfa6;
  border-bottom: 2px solid #00bfa6;
}

/* Summary Text */
.attendance-card .row h5 {
  font-size: 20px;
  color: var(--text);
  font-weight: 700;
}

.attendance-card .row small {
  color: #888;
  font-weight: 500;
}

/* Table Styling */
.attendance-table {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  font-size: 14px;
}

.attendance-table thead {
  background-color: #f1f5f9;
}

.attendance-table th,
.attendance-table td {
  vertical-align: middle;
  text-align: center;
}

.attendance-table td:first-child {
  text-align: left;
  /* display: flex; */
  align-items: center;
}

.attendance-table td img {
  border-radius: 50%;
  margin-right: 10px;
}

/* Badge Styles */
.badge {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 12px;
}

.badge-success {
  background-color: #e6f4ea;
  color: #28a745;
}

.badge-warning {
  background-color: #fff3cd;
  color: #856404;
}

.badge-danger {
  background-color: #f8d7da;
  color: #dc3545;
}

.badge-primary {
  background-color: #cce5ff;
  color: #004085;
}


/* Chart Canvas */
#attendanceChart {
  display: block;
  margin: auto;
  max-width: 100px;
}

/* Footer */
.attendance-footer {
  background-color: #fff;
  padding: 1rem 2rem;
  text-align: center;
  font-size: 14px;
  border-top: 1px solid #ddd;
  color: var(--text);
}

/* Responsive */
@media (max-width: 768px) {
  .attendance-table th,
  .attendance-table td {
    font-size: 12px;
    padding: 0.5rem;
    place-self: normal;
  }
  .attendance-table{
        background-color: #ffffff00;
  }
  .attendance-container{
    background-color: #f3eeee;
        background: rgba(255, 255, 255, 0);
   
    /* box-shadow: 0 4px 20px rgba(0, 0, 0, 0); */
  }

  .attendance-card .row h5 {
    font-size: 16px;
  }

  .attendance-table td:first-child {
    flex-direction: row;
    align-items: flex-start;
  }
}

.toggle-btn,
.generate-btn {
  padding: 6px 10px;
  background-color: var(--primary);
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.toggle-btn i {
  pointer-events: none;
}

.toggle-btn:hover,
.generate-btn:hover {
  background-color: var(--text);
}

.user-table td .btn-group {
  display: flex;
  gap: 0.5rem;
}
/* Layout */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text);
}
.company-name {
  font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
}
/* Header */
.header {
  font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, .3);
 background-color: var(--primary); 
  color: white;
  padding: 8px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15); */
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo {
  font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
}

.menu-btn, .logout-btn {
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.logout-btn {
  background-color: var(--text);
    color: #ffffff;
    margin-left: 10px;
    margin-bottom: 22px;
}

.logout-btn:hover {
  background-color: var(--primary);
  color: #ffffff;
    margin-bottom: 22px;
}

/* Main Content */
.main-content {
  display: flex;
  flex: 1;
  padding: 30px;
  gap: 20px;
}

/* Sidebar */
.sidebar {
  background-color: #ffffff;
  width: 220px;
  padding: 25px 20px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  font-weight: 600;
  color: var(--text);
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 14px 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sidebar li:hover {
  background-color: var(--primary);
  color: white;
  font-weight: 700;
}

/* Content Section */
.content {
  flex: 1;
  background-color: white;
  padding: 30px 40px;
  border-radius: 15px;
  box-shadow: 0 5px 30px rgba(0,0,0,0.08);
  overflow-x: auto;
}

h2 {
  margin-bottom: 30px;
  color: var(--text);
  font-weight: 800;
  text-transform: uppercase;
  font-size: 21px;
  border-bottom: 2px solid var(--primary);
  padding-bottom: 8px;
}

/* User Table */
.user-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
}

.user-table th,
.user-table td {
  padding: 6px 20px;
  text-align: left;
  font-size: 16px;
  color: var(--text);
}

.user-table th {
  background-color: #f8f9fa;
  font-weight: 700;
  border-bottom: none;
  border-radius: 12px 12px 0 0;
}

.user-table tbody tr {
  background-color: #fefefe;
  box-shadow: 0 1px 5px rgba(0,0,0,0.07);
  border-radius: 10px;
  transition: transform 0.2s ease;
}

.user-table tbody tr:hover {
  background-color: #e9f5ff;
  transform: translateX(5px);
}

.user-table tbody td {
  border: none;
  vertical-align: middle;
}

/* Footer */
.footer {
  background-color: #343a40;
  color: white;
  text-align: center;
  padding: 15px 0;
  font-size: 14px;
  font-weight: 500;
  margin-top: auto;
  letter-spacing: 0.6px;
}

/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 97vw;
  height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 0 15px;
}

/* Modal Card */
.modal-card {
  background-color: white;
  width: 100%;
  border-radius: 20px;
  padding: 40px 50px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  max-height: 86vh;
  overflow-y: auto;
  animation: slideDown 0.4s ease forwards;
  position: relative;

  /* Hide scrollbar but allow scroll */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.modal-card::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}


@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal Title */
.modal-title {
  font-size: 32px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 35px;
  color: var(--text);
  letter-spacing: 1.3px;
}

/* Form Layout */
.attractive-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Form Rows */
.form-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.form-row .input-group {
  flex: 1 1 26%;
  display: flex;
  flex-direction: column;
}

/* Full width input group */
.input-group.full-width {
  flex: 1 1 100%;
}

/* Input Group */
.input-group label {
  font-weight: 700;
  margin-bottom: 10px;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
}

.input-group input,
.input-group select,
.input-group textarea {
  padding: 14px 18px;
  border: 2px solid #ced4da;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: inset 0 1px 4px rgba(0,0,0,0.08);
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.3);
  background-color: #f9fbff;
}

/* Textarea resize */
.input-group textarea {
  resize: vertical;
  min-height: 56px;
  font-family: inherit;
}

/* Modal Buttons */
.modal-buttons {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.btn {
  flex: 1;
  padding: 14px 0;
  font-weight: 700;
  font-size: 0.9rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
}

.btn-white {
  flex: 1;
  padding: 14px 0;
  font-weight: 700;
  width: 47px;
  font-size: 0.9rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
  box-shadow: 0 6px 15px rgba(0, 123, 255, 0.4);
}

.btn-blue {
  background-color: var(--primary);
  color: white;
  margin-bottom: 22px;  
  width: 82px;
  box-shadow: 0 6px 15px rgba(0, 123, 255, 0.4);
}

.btn-primary:hover {
  background-color: var(--text);
  box-shadow: 0 8px 18px rgba(0, 86, 179, 0.6);
}

.btn-secondary {
  background-color: var(--text);
  color: white;
  box-shadow: 0 6px 15px rgba(108, 117, 125, 0.4);
}

.btn-secondary:hover {
  background-color: var(--primary);
  box-shadow: 0 8px 18px rgba(90, 98, 104, 0.6);
}

/* Fade Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.35s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 900px) {
  .form-row .input-group {
    flex: 1 1 100%;
  }

  .modal-card {
    padding: 30px 25px;
  }
}

@media (max-width: 480px) {
  .header {
    flex-direction: row;
    gap: 10px;
  }
  .menu-btn, .logout-btn {
    width: 100%;
  }
}
.attractive-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-weight: 600;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  user-select: none;
}

.btn-primary.attractive-btn {
  background-color: var(--primary);
  border: none;
  color: white;
}

.btn-primary.attractive-btn:hover {
  background-color: var(--text);
  box-shadow: 0 4px 12px rgba(13,110,253,0.6);
}

.btn-danger.attractive-btn {
  background-color: #dc3545;
  border: none;
  color: white;
}

.btn-danger.attractive-btn:hover {
  background-color: #bb2d3b;
  box-shadow: 0 4px 12px rgba(220,53,69,0.6);
}

.attractive-btn i {
  font-size: 14px;
}
/* === BASIC RESET === */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* === TYPOGRAPHY === */
body {
  font-family: "Segoe UI", sans-serif;
  font-size: 14px;
  background-color: #f8f9fa;
  color: #212529;
}

/* === UTILITY CLASSES === */
.text-center {
  text-align: center;
}
.text-left {
  text-align: left;
}
.mt-1 {
  margin-top: 0.25rem;
}
.mt-3 {
  margin-top: 1rem;
}
.mb-4 {
  margin-bottom: 1.5rem;
  margin-left: 5px;
}
.p-4 {
  padding: 1.5rem;
}

/* === CONTAINERS === */
.container-fluid {
  flex: 1;
  width: 100%;
  padding-right: 1.5rem;
  padding-left: 1.5rem;
  margin-right: auto;
  margin-left: auto;
}

/* === GRID SYSTEM (minimal) === */
.row {
  display: flex;
  flex-wrap: wrap;
  margin-left: -0.75rem;
  margin-right: -0.75rem;
}
.col {
  flex: 1 0 0%;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

/* === TABLE === */
.table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  background-color: white;
}
.table th,
.table td {
  padding: 0.75rem;
  /* border: 1px solid #dee2e6; */
  text-align: center;
}
.table thead {
  background-color: #f1f5f9;
  font-weight: 600;
  color: var(--text);
}

/* === NAV TABS === */
.nav-tabs {
  display: flex;
  border-bottom: 1px solid #dee2e6;
}
.nav-tabs .nav-item {
  margin-bottom: -1px;
}
.nav-tabs .nav-link {
  display: block;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  color: var(--text);
  background: none;
  font-weight: 500;
  text-decoration: none;
}
.nav-tabs .nav-link.active {
  color: #00bfa6;
  border-bottom: 2px solid #00bfa6;
}

/* === BADGES === */
.badge {
  display: inline-block;
  padding: 0.35em 0.65em;
  font-size: 0.75em;
  font-weight: 700;
  border-radius: 0.5rem;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
}
.badge-success {
  background-color: #e6f4ea;
  color: #28a745;
}
.badge-warning {
  background-color: #fff3cd;
  color: #856404;
}
.badge-danger {
  background-color: #f8d7da;
  color: #dc3545;
}
.badge-primary {
  background-color: #cce5ff;
  color: #004085;
}

/* === BUTTONS (used in logout) === */
button {
  cursor: pointer;
}
button:focus {
  outline: none;
}
.attendance-logout-btn {
  background-color: #dc3545;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
}

/* === IMAGES === */
.rounded-circle {
  border-radius: 50%;
}
img {
  vertical-align: middle;
  border-style: none;
}

.mark-btn {
  margin-left: 10px;
  background: #6f42c1;
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 12px;
}

.popup-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}
/* Overlay */
.fancy-overlay {
  backdrop-filter: blur(6px);
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* Card */
.popup-card {
  width: 420px;
  max-width: 92%;
  background: linear-gradient(180deg, #ffffff, #f8f9ff);
  border-radius: 18px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  font-family: "Inter", system-ui, sans-serif;
}

/* Animation */
.animate-pop {
  animation: popScale 0.35s ease;
}

@keyframes popScale {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Header */
.popup-header {
  background: linear-gradient(135deg, #6f42c1, #845ef7);
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.popup-header h3 {
  margin: 0;
  font-size: 18px;
}

.icon-close {
  background: transparent;
  border: none;
  font-size: 18px;
  color: white;
  cursor: pointer;
}

/* Body */
.popup-body {
  padding: 20px;
}

/* Fields */
.field {
  margin-bottom: 14px;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
  color: var(--text);
}

.field input,
.field select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #dcdde1;
  font-size: 14px;
  transition: 0.2s;
}

.field input:focus,
.field select:focus {
  outline: none;
  border-color: #845ef7;
  box-shadow: 0 0 0 3px rgba(132, 94, 247, 0.15);
}

/* Two column */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Status color hint */
select.Present { border-left: 4px solid #28a745; }
select.Absent { border-left: 4px solid #dc3545; }
select.Leave { border-left: 4px solid #fd7e14; }
select.HalfDay { border-left: 4px solid #ffc107; }
select.OnSite { border-left: 4px solid #0d6efd; }
select.Traveling { border-left: 4px solid #20c997; }

/* Footer */
.popup-footer {
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #eee;
}

.btn-save {
  background: linear-gradient(135deg, #6f42c1, #845ef7);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.btn-save:hover {
  opacity: 0.9;
}

.btn-cancel {
  background: #f1f3f5;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
}

/* Mobile */
@media (max-width: 480px) {
  .popup-card {
    width: 95%;
  }
}


</style>
