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

        <div v-if="!isMobile || !isSidebarVisible" class="attendance-container container-fluid p-4">

          <!-- Summary Section -->
        
  <div class="toggle-buttons mb-4 text-center">
    <button class="toggle-btn" @click="toggleView">
    {{ viewMode === 'day' ? '╰┈➤  Monthly' : '╰┈➤ View Daily' }} Attendance 📅
    </button>
  </div>



          <!-- Attendance Table -->
          <div v-if="viewMode === 'day'" class="attendance-table">
            <h5 class="mb-4"> <br>&nbsp; Date: {{ currentDate }}</h5>

            <table class="attendance-table table table-bordered">
              <thead class="thead-light">
                <tr>
                  <!-- <th>Name</th> -->
                  <th>Punch In </th>
                  <th>Clock In 🕒</th>
                  <th>Clock Out ⌛</th>
                  <th>Required Time</th>
                  <th>Actual Time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
  
  <td data-label="Punch In"><br>
  <select
    v-model="user.status"
    @change="updateStatus"
    :disabled="user.statusLocked"
    class="status-select"
  >
    <option disabled value="">🔽 Select</option>
    <option
      v-for="status in availableStatuses"
      :key="status"
      :value="status"
    >
      {{ getStatusLabel(status) }}
    </option>
  </select>
</td>




                <td data-label="Clock In">
    <!-- Absent -->
    <!-- <span v-if="user.status === 'Absent'" class="text-danger font-weight-bold">Absent</span> -->

    <!-- On Site -->
    <!-- <input
      v-else-if="user.status === 'On Site'"
      type="text"
      v-model="user.siteName"
      class="form-control form-control-sm"
      placeholder="Enter site name"
      :disabled="user.statusLocked"
      @blur="lockIfOnSiteWithValue"
    /> -->


    <!-- Site Traveling -->
    
  <!-- Site Traveling: Show Time Picker with "From:" label -->
  <div v-if="user.status === 'Traveling'">
    <label class="mb-0"><strong>-</strong></label>
  <!-- <input
    type="time"
    v-model="user.travelFrom"
    class="form-control form-control-sm mt-1"
    :disabled="user.statusLocked"
  /> -->

  </div>


  <!-- Half Day -->
  <!-- Half Day -->
  <span v-else-if="user.status === 'HalfDay'">
    {{ user.clockIn }}
  </span>



  <!-- Present -->
  <span v-else>
    {{ user.clockIn }}
    <span v-if="user.status === 'Present' && user.isLate" class="text-danger font-weight-bold">(Late)</span>
    <span v-else-if="user.status === 'Present' && user.isEarly" class="text-success font-weight-bold">(Early)</span>
  </span>



  </td>

                <td data-label="Clock Out">
    <!-- Site Traveling: Show Time Picker -->
    <div v-if="user.status === 'Traveling'">
      <label class="mb-0"><strong>-</strong></label>
      <!-- <input
      type="time"
      v-model="user.travelTo"
      class="form-control form-control-sm mt-1"
      :disabled="user.statusLocked"
      @change="handleTravelToChange(user)"
    /> -->


    </div>

  <!-- Present / Half Day / On Site -->
<div v-else-if="['Present', 'HalfDay', 'OnSite'].includes(user.status) || (user.status === 'OnSite' && user.siteName)">
  <img
    src="https://icons.veryicon.com/png/o/internet--web/common-work-social-mobile-terminals/check-in-and-punch-out.png"
    alt="Punch Out"
    @click="confirmPunchOut(user)"

    :style="{ cursor: user.clockOut === '' ? 'pointer' : 'not-allowed', opacity: user.clockOut === '' ? 1 : 0.5, width: '50px', height: '50px' }"
    :disabled="user.clockOut !== ''"
  />
</div>



    <!-- Default: Just show recorded time -->
    <span v-else>{{ user.clockOut }}</span>
  </td>


                  <td data-label="Required Time">{{ user.requiredTime }}</td>
                 <td data-label="Actual Time">{{ user.actualTime }}</td>
                </tr>
              </tbody>
            </table>
          </div>

 <div v-if="viewMode === 'month'" class="month-view-message p-5">
  <!--privious month -->
  <!-- <div class="d-flex justify-content-center align-items-center mb-4">
    
    <h2 class="text-primary mb-0 mx-4"><button class=" btn-light px-3" @click="previousMonth">⮜ </button>{{ monthNames[currentMonth] }} {{ currentYear }}<button class=" btn-light px-3" @click="nextMonth"> ⮞</button></h2>


  </div> -->



    <div class="calender-wrapper">
    <div class="calender-container">
      <div class="calender">
        <div class="calender-row calender-header">
          <div
            v-for="day in weekdays"
            :key="day"
            class="calender-cell calender-header-cell"
          >
            {{ day }}
          </div>
        </div>

        <div class="calender-row" v-for="(week, weekIndex) in calendarData" :key="weekIndex">
          <div
            v-for="(day, dayIndex) in week"
            :key="dayIndex"
            class="calender-cell"
            :class="getAttendanceClass(day)"
          >
            <div class="calender-date">{{ day.date }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="calender-legend">
  <h5>LEGEND</h5>
  <ul class="calender-legend-list">
    <li>
      <span class="calender-legend-box present"></span>
      Present: {{ statusCounts.Present }}
    </li>
    <!-- <li>
      <span class="calender-legend-box absent"></span>
      Absent: {{ statusCounts.Absent }}
    </li> -->
    <li>
  <span class="calender-legend-box attendance-missing"></span>
  Absent:: {{ statusCounts.Missing }}
</li>
    <li>
      <span class="calender-legend-box on-site"></span>
      OnSite: {{ statusCounts.OnSite }}
    </li>
    <li>
      <span class="calender-legend-box half-day"></span>
      HalfDay: {{ statusCounts.HalfDay }}
    </li>
    <li>
      <span class="calender-legend-box traveling"></span>
      Traveling: {{ statusCounts.Traveling }}
    </li>
      <li>
      <span class="calender-legend-box leave"></span>
      Leave: {{ statusCounts.Leave }}
    </li>
    <li>
  <span class="calender-legend-box public-holiday" style="background-color: #fff; border: 1px solid #58cc71;"></span>
  Public Holiday
</li>
  </ul>
</div>

  </div>

  </div>



        </div>
      </div>

    
    </div>
  </template>

  <script>
    import axios from 'axios'
    import Sidebar from './components/Sidebar.vue'

    export default {
      components: {
        Sidebar
      },
      data() {
        
        const today = new Date();
        const storedUser = localStorage.getItem('user');
      let userName = 'Unknown';

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          userName = user.name || 'Unknown';
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
        return {
           lockTimer: null,
  disableStatusSelect: false,
             status: '',
  statusLocked: false,        // disables dropdown temporarily
  permanentlyLocked: false,   // disables it forever after 1 min
          isMobile: false,
  isSidebarVisible: true,

          currentMonth: today.getMonth(), // 0-indexed
      currentYear: today.getFullYear(),
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'],

          weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          calendarData: this.generateCalendar(),
          viewMode: 'day',
        isEarly: false,
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
          currentDate: '',
          clockOut: '',
    showTimer: false,
    timer: '',

        user: {
      name: userName,
          status: '',
          clockIn: '',
          clockOut: '',
          requiredTime: '8 Hours',
          actualTime: '',
          statusLocked: false,
          siteName: '',
          travelFrom: '',
          travelTo: '',
          isLate: false
    }
      


        }
      },
 computed: {
  isSunday() {
    const date = new Date(this.currentDate);
    return date.getDay() === 0;
  },
  isAfter1230PM() {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setHours(12, 30, 0, 0); // 12:30 PM
    return now >= cutoff;
  },
  availableStatuses() {
    if (this.isSunday) {
      return ['OnSite', 'Traveling'];
    }
    if (this.isMobile) {
      return ['OnSite', 'Traveling', 'HalfDay'];
    }
    return ['Present', 'OnSite', 'Traveling'];
  }
},




      methods: {

async handleAutoStatusAfter5PM() {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setHours(17, 0, 0, 0); // 5:00 PM

  if (now < cutoff || this.user.status) return;

  const token = localStorage.getItem('token');
  const today = this.currentDate;

  try {
    // 1. Check if already marked
    const checkRes = await axios.get(`https://employees.archenterprises.co.in/api/api/attendance/check?date=${today}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (checkRes.data.exists) return;

    // 2. Get user from localStorage
    const localUser = JSON.parse(localStorage.getItem('user'));
    const name = localUser.name;

    // 3. Fetch latest user data from backend
    const userRes = await axios.get(`https://employees.archenterprises.co.in/api/api/user-by-name?name=${encodeURIComponent(name)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const latestUser = userRes.data;
    let clLeaveUsed = latestUser.cl_leave_used || 0;

    // 4. Get leave types
    const leaveTypeRes = await axios.get(`https://employees.archenterprises.co.in/api/api/leave-types`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const leaveTypes = leaveTypeRes.data || [];
    const casualLeave = leaveTypes.find(lt => lt.leave_name === 'Casual Leave');
    const totalLeaves = casualLeave ? casualLeave.total_leaves : 0;

    // 5. Decide status
    let statusToSet = clLeaveUsed < totalLeaves ? 'Leave' : 'Absent';

    // 6. Insert attendance
    await axios.post(`https://employees.archenterprises.co.in/api/api/attendance/store`, {
      name: name,
      date: today,
      status: statusToSet,
      clock_in: null,
      clock_out: null
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // 7. Update leave only if status is Leave
    if (statusToSet === 'Leave') {
      await axios.put(`https://employees.archenterprises.co.in/api/api/user/update-cl-leave`, {
        name: name,
        cl_leave_used: clLeaveUsed + 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Also update localStorage
      localUser.cl_leave_used = clLeaveUsed + 1;
      localStorage.setItem('user', JSON.stringify(localUser));
    }

    // 8. Update UI
    this.user.status = statusToSet;
    this.user.statusLocked = true;
    const key = `attendance_${this.currentDate}_${name}`;
    localStorage.setItem(key, JSON.stringify(this.user));

    console.log(`✅ Auto-marked as ${statusToSet} at 5 PM`);
  } catch (error) {
    console.error('❌ Error in auto status logic at 5 PM:', error);
  }
},






        getStatusLabel(status) {
      const labels = {
        Present: '✅ Present',
        Absent: '❌ Absent',
        OnSite: '🏢 On Site',
        Traveling: '✈️ Traveling',
        HalfDay: '🕒 Half Day'
      };
      return labels[status] || status;
    },
        confirmPunchOut(user) {
    if (window.confirm('Are you sure you want to punch out?')) {
      this.punchOut(user);
    } else {
      console.log('Punch out cancelled by user.');
    }
  },

        autoPunchOutIfMissing() {
    const now = new Date();
    const sevenPM = new Date();
    sevenPM.setHours(19, 0, 0, 0); // 7:00 PM

    if (
      now >= sevenPM &&
      this.user.status &&
      this.user.clockIn &&
      !this.user.clockOut &&
      !this.user.statusLocked // Optional: prevent override if locked
    ) {
      this.punchOut(this.user);
      // console.log("⏰ Auto punched out at 7 PM.");
    }
  },







fetchTodayStatus() {
  return new Promise((resolve) => {
    const token = localStorage.getItem('token');
    const today = this.currentDate;

    axios.get('https://employees.archenterprises.co.in/api/api/attendance/today', {
      params: { name: this.user.name, date: today },
      headers: { Authorization: `Bearer ${token}` }
    }).then((response) => {
      const record = response.data?.data;

      if (record && record.status) {
        this.user.status = record.status;
        this.user.clockIn = record.clock_in || '';
        this.user.clockOut = record.clock_out || '';
        this.user.siteName = record.site_name || '';
        this.user.travelFrom = record.travel_from || '';
        this.user.travelTo = record.travel_to || '';
        this.user.actualTime = record.actual_time || '';
        
        // ✅ Disable dropdown if a record exists
        this.disableStatusSelect = true;
        this.user.statusLocked = true;

        const key = `attendance_${this.currentDate}_${this.user.name}`;
        localStorage.setItem(key, JSON.stringify(this.user));

        resolve(true); // status found
      } else {
        this.disableStatusSelect = false;
        resolve(false); // no record, user can mark
      }
    }).catch(err => {
      console.error('Error fetching today\'s attendance from server:', err);
      this.disableStatusSelect = false;
      resolve(false);
    });
  });
},



        clearAttendanceAfterMidnight() {
      const lastDate = localStorage.getItem('lastAttendanceDate');
      const today = new Date().toISOString().split('T')[0];

      if (lastDate !== today) {
        // Clear all attendance data since it's a new day
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('attendance_')) {
            localStorage.removeItem(key);
          }
        });
        localStorage.setItem('lastAttendanceDate', today);
      }
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
        previousMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear -= 1;
      } else {
        this.currentMonth -= 1;
      }
      this.fetchAttendance();
    },
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear += 1;
      } else {
        this.currentMonth += 1;
      }
      this.fetchAttendance();
    },
        toggleView() {
        this.viewMode = this.viewMode === 'day' ? 'month' : 'day';
        if (this.viewMode === 'month') {
          this.fetchAttendance(); // Or fetchMonthlyAttendance() if used separately
        }
      },
      processCalendarData(data) {
      console.log('Processing Calendar Data:', data); // 👀 confirm correct data
      return this.generateCalendarFromStatus(data);
    },

        fetchAttendance() {
    const token = localStorage.getItem('token');
    const payload = {
      name: this.user.name,
      month: this.currentMonth + 1, // send as 1-indexed
      year: this.currentYear
    };

    axios
      .post('https://employees.archenterprises.co.in/api/api/attendance/monthly', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        this.calendarData = this.generateCalendarFromStatus(response.data.data);
      })
      .catch((error) => {
        console.error('Error fetching monthly attendance:', error);
      });
  },



        generateCalendar() {
      return []; // Remove dummy generation; actual generation will come from fetched data
    },

  generateCalendarFromStatus(data) {
    const targetMonth = this.currentMonth;
    const targetYear = this.currentYear;
    const firstDay = new Date(targetYear, targetMonth, 1);
    const lastDay = new Date(targetYear, targetMonth + 1, 0);
    const totalDays = lastDay.getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const normalizeStatus = (status) => {
      const map = {
        'onsite': 'on-site',
        'on site': 'on-site',
        'halfday': 'half-day',
        'half day': 'half-day',
      };
      const lower = (status || '').toLowerCase();
      return map[lower] || lower;
    };

    const statusMap = {};
    const counts = {
      present: 0,
      'on-site': 0,
      'half-day': 0,
      traveling: 0,
      absent: 0,
      leave: 0
    };

    const publicHolidays = ['01-26', '05-01', '08-15', '10-20', '10-21', '10-22']; // MM-DD format for all years

    let missingCount = 0;

  data.forEach(record => {
    // ✅ Skip if status is empty or "N/A" (case-insensitive)
    if (!record.status || record.status.trim().toUpperCase() === 'N/A') return;

    const dateObj = new Date(record.date);
    if (dateObj.getMonth() === targetMonth && dateObj.getFullYear() === targetYear) {
      const day = dateObj.getDate();
      const normalized = normalizeStatus(record.status);

      if (normalized) {
        statusMap[day] = normalized;

        // Only count colored (non-empty) statuses
        if (counts.hasOwnProperty(normalized)) {
          counts[normalized]++;
        }
      }
    }
  });



    this.statusCounts = {
      Present: counts.present || 0,
      OnSite: counts['on-site'] || 0,
      HalfDay: counts['half-day'] || 0,
      Traveling: counts.traveling || 0,
      Absent: counts.absent || 0,
      Leave: counts.leave || 0,
      Missing: 0
    };

    const calendar = [];
    let week = new Array(7).fill({ date: '', status: null });
    let dayOfWeek = firstDay.getDay();

    for (let i = 0; i < dayOfWeek; i++) {
      week[i] = { date: '', status: null };
    }

    for (let day = 1; day <= totalDays; day++) {
      const cellDate = new Date(targetYear, targetMonth, day);
      const status = statusMap[day] || null;
  const isSunday = cellDate.getDay() === 0;
  const mmdd = String(cellDate.getMonth() + 1).padStart(2, '0') + '-' + String(cellDate.getDate()).padStart(2, '0');
  const isHoliday = publicHolidays.includes(mmdd);


      const isPastAndNoStatus = cellDate < today && !status && !isSunday && !isHoliday;

      if (isPastAndNoStatus) {
        missingCount++;
      }

    week[dayOfWeek] = {
    date: day,
    status,
    noStatusAndPast: isPastAndNoStatus,
    isPublicHoliday: isHoliday
  };


      dayOfWeek++;
      if (dayOfWeek === 7 || day === totalDays) {
        calendar.push(week);
        week = new Array(7).fill({ date: '', status: null });
        dayOfWeek = 0;
      }
    }

    this.statusCounts.Missing = missingCount;

    return calendar;
  },








        getMockStatus() {
      const statuses = ['present', 'absent', 'on-site', 'half-day', 'traveling', 'leave'];
      return statuses[Math.floor(Math.random() * statuses.length)];
    },
  getAttendanceClass(day) {
  const statusClass = day.status ? `attendance-${day.status}` : '';
  const redClass = day.noStatusAndPast ? 'attendance-missing' : '';
  const holidayClass = day.isPublicHoliday ? 'public-holiday' : '';
  return `${statusClass} ${redClass} ${holidayClass}`.trim();


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

        lockIfOnSiteWithValue() {
      if (this.user.status === 'OnSite' && this.user.siteName.trim() !== '') {
        this.user.statusLocked = true;
        localStorage.setItem('attendance_' + this.currentDate + '_' + this.user.name, JSON.stringify(this.user));
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

      const token = localStorage.getItem('token');

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
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
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
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    user.clockOut = formattedTime;
    user.actualTime = this.calculateActualTime(user);

    // Check and adjust status based on actual work duration
    const [hrs, mins, secs] = user.actualTime.split(':').map(Number);
    const totalMinutes = hrs * 60 + mins + secs / 60;

    if (totalMinutes < 180) {
      user.status = 'Absent';
    } else if (totalMinutes >= 180 && totalMinutes < 420) {
      user.status = 'HalfDay';
    } // else keep as Present or whatever was set

    const token = localStorage.getItem('token');

    axios.post('https://employees.archenterprises.co.in/api/api/attendance/update', {
      name: user.name,
      clock_out: user.clockOut,
      actual_time: user.actualTime,
      status: user.status, // send updated status
      date: this.currentDate
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(() => {
        console.log('Punch out and status update successful');
      })
      .catch(err => {
        console.error('Error updating punch out:', err);
      });

    const key = `attendance_${this.currentDate}_${user.name}`;
    localStorage.setItem(key, JSON.stringify(user));
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

updateStatus() {
  // If already locked permanently, don't allow further changes
  if (this.user.permanentlyLocked) return;

  const now = new Date();
  const formattedTime = this.getCurrentTime();

  // Update punch-in time and reset relevant fields
  this.user.clockIn = formattedTime;
  this.user.clockOut = '';
  this.user.actualTime = '';
  this.user.statusLocked = false;      // keep enabled initially
  this.user.permanentlyLocked = false; // allow 30-sec re-selection

  // Time thresholds
  const earlyThreshold = new Date(now); earlyThreshold.setHours(9, 30, 0, 0);
  const lateThreshold  = new Date(now); lateThreshold.setHours(10, 0, 0, 0);
  const halfDayThreshold = new Date(now); halfDayThreshold.setHours(13, 0, 0, 0);

  // Status logic
  this.user.isEarly = now < earlyThreshold;
  this.user.isLate = now > lateThreshold;
  if (now > halfDayThreshold && this.user.status === 'Present') {
    this.user.status = 'HalfDay';
  }

  const token = localStorage.getItem('token');
  const today = this.currentDate;
  const isSunday = new Date(today).getDay() === 0;

  // Save attendance to backend
  axios.post('https://employees.archenterprises.co.in/api/api/attendance/store', {
    name: this.user.name,
    status: this.user.status,
    clock_in: this.user.clockIn,
    clock_out: this.user.clockOut,
    required_time: this.user.requiredTime,
    actual_time: this.user.actualTime,
    site_name: this.user.siteName,
    travel_from: this.user.travelFrom,
    travel_to: this.user.travelTo,
    date: today
  }, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(() => {
    console.log('✅ Attendance inserted');

    // Increment CL leave if Sunday
    if (isSunday) {
      axios.put('https://employees.archenterprises.co.in/api/api/user/update-cl-leave', {
        name: this.user.name,
        increment: 1
      }, { headers: { Authorization: `Bearer ${token}` }})
      .then(() => {
        console.log('✅ CL leave incremented for Sunday punch-in');
        const localUser = JSON.parse(localStorage.getItem('user'));
        localUser.cl_leave_used = (localUser.cl_leave_used || 0) + 1;
        localStorage.setItem('user', JSON.stringify(localUser));
      })
      .catch(err => console.error('❌ Failed to increment CL leave:', err));
    }

  }).catch(err => console.error('❌ Attendance store failed:', err));

  // Save locally
  localStorage.setItem('attendance_' + today + '_' + this.user.name, JSON.stringify(this.user));

  // ⏳ Lock dropdown AFTER 30 SECONDS
  if (this.lockTimer) clearTimeout(this.lockTimer); // reset if user changes again
  this.lockTimer = setTimeout(() => {
    this.user.statusLocked = true;
    this.user.permanentlyLocked = true;

    localStorage.setItem(
      'attendance_' + today + '_' + this.user.name,
      JSON.stringify(this.user)
    );

    console.log('🔒 Status locked permanently after 30 seconds');
  }, 30 * 1000); // 30 seconds
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
          user.isEarly = false; // ✅ new line
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
 created() {
  const today = new Date();
  this.currentDate = today.toISOString().split('T')[0];

  this.clearAttendanceAfterMidnight();
  this.checkIfMobile();

  const key = `attendance_${this.currentDate}_${this.user.name}`;
  const savedData = localStorage.getItem(key);

  if (savedData) {
    this.user = JSON.parse(savedData);
  } else {
    // If no saved data, fetch from server
    this.fetchTodayStatus();
  }

  // Start auto checks

  this.autoPunchOutIfMissing();
  

  // Optional: start timer for status re-locking logic
  setInterval(() => {
    this.checkIfMobile(); // Keep checking for responsive layout
  }, 3000);
},



 mounted() {
  this.checkIfMobile();
  window.addEventListener('resize', this.checkIfMobile);

  this.currentDate = new Date().toISOString().split('T')[0];
  const key = `attendance_${this.currentDate}_${this.user.name}`;
  const savedData = localStorage.getItem(key);

  if (savedData) {
    this.user = JSON.parse(savedData);
    this.autoPunchOutIfMissing(); // keep this
  } else {
    this.fetchTodayStatus().then(() => {
      this.autoPunchOutIfMissing(); // still needed
      this.handleAutoStatusAfter5PM(); // 👈 new method
    });
  }

  // Optional: run every 5 minutes in case user keeps tab open
  setInterval(() => {
    this.handleAutoStatusAfter5PM();
  }, 5 * 60 * 1000);
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
.public-holiday {
  background-color: #fff !important; /* soft green */
  border: 2px solid #58cc71;
  font-weight: bold;
}

.attendance-missing {
  background-color: #ffe0e0 !important;
  color: #cc0000 !important;
  font-weight: bold;
}

html, body {
  overflow-x: hidden;
  width: 100%;
}
.layout {
  overflow-x: hidden;
  align-self: center;
  
}
/* For medium devices (e.g. tablets) */
@media (min-width: 600px) {
  .calender {
    width: 70%;
    
  }
  .sidebar{
    margin-top: 28px;
  }

}

/* For large screens (e.g. desktops) */
@media (min-width: 1024px) {
  .calender {
    width: 77vh; /* or replace with fixed px if needed */
  }
}

@media (max-width: 768px) {
  .main-content {
  align-self: center;
      display: contents!important;
  }
.container-fluid{
  width: 100%!important ;
  
}
 .calender-cell{
min-height: 50px!important;
  }
.calender{
width: 47vh;
        /* margin-left: 17vh !important; */
        justify-self: center;
}
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
  .attendance-container {
    padding: 1rem !important;
  }

  /* Attendance Table - Make fields stack vertically */
  .attendance-table table {
    width: 100%;
    font-size: 14px;
    border-collapse: collapse;
  }

  .attendance-table thead {
    display: none; /* Hide header on small screens */
  }

  .attendance-table tbody tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 10px;
  }

  .attendance-table tbody td {
    display: flex;
    justify-content: space-between;
    padding: 20px 0;
    border: none;
    border-bottom: 1px solid #eee;
  }

  .attendance-table tbody td::before {
    content: attr(data-label);
    font-weight: bold;
    flex: -1;
color: var(--text);
  }

  .status-select {
    width: 100%;
    font-size: 14px;
  }

  /* Calendar */
  .calender-wrapper {
    padding: 0 10px;
  }

  .calender {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
    font-size: 12px;
  }

  .calender-header {
    display: contents;
  }

  .calender-header-cell {
    font-weight: bold;
    text-align: center;
    padding: 5px 0;
  }

  .calender-cell {
    text-align: center;
    padding: 8px 4px;
    border-radius: 5px;
    min-height: 40px;
  }

  .calender-date {
    font-size: 12px;
  }

  .calender-legend {
    margin-top: 1rem;
  }

  .calender-legend-list {
    padding-left: 0;
    list-style: none;
    font-size: 13px;
  }

  .calender-legend-list li {
    margin-bottom: 6px;
    display: flex;
    align-items: center;
  }

  .calender-legend-box {
    width: 14px;
    height: 14px;
    margin-right: 8px;
    border-radius: 2px;
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

.status-select {
  padding: 8px 12px;
  border-radius: 8px;
  background-color: #f5f9ff;
  border: 1px solid #b3c6ff;
  font-size: 12px;
  font-weight: bold;
  color: var(--text);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: 0.3s ease;
  cursor: pointer;
}

.status-select:hover {
  border-color: #5c85ff;
  background-color: #e6f0ff;
}

.status-select:disabled {
  background-color: #eaeaea;
  color: #888;
  cursor: not-allowed;
}

.btn-light{
  background-color: rgba(255, 255, 255, 0);
  border: none;
  font-size: 25px;
    margin-top: -11%;
    padding: 33px;
}
.month-view-message h2 {
  min-width: 160px;
  text-align: center;
}
.attendance-present {
  background-color: #00f23a;
}
.attendance-on-site {
  background-color: #9494949c;
  border: 1px solid #007bff;
}

.attendance-half-day {
  background-color: #ffc107ad;
  border: 1px solid #07eaff;
}

.attendance-traveling {
  background-color: #fca400;
}
.attendance-absent {
  background-color: #ffe0e0 !important;
  color: #c00!important;
}



.calender-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  align-items: flex-start;
}

.calender-container {
  width: 600px;
  min-width: 300px;
  flex-shrink: 0;
}

.calender {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
}

.calender-row {
  display: flex;
}

.calender-cell {
  flex: 1;
  border: 1px solid #eee;
  min-height: 70px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 4px;
  font-size: 14px;
  position: relative;
}

.calender-header-cell {
  background-color: #f0f0f0;
  font-weight: bold;
  justify-content: center;
  align-items: center;
  display: flex;
}

.calender-date {
  position: absolute;
  top: 4px;
  right: 6px;
  font-weight: bold;
}

/* Status Background Colors */
.calender-present {
  background-color: #d4edda;
}
.calender-absent {
  background-color: #f8d7da;
}
.calender-on-site {
  background-color: #e2e3e5;
}
.calender-half-day {
  background-color: #fff3cd;
}
.calender-traveling {
  background-color: #ffe5b4;
}
.calender-leave {
  background-color: #cce5ff;
}

/* Beautified Legend Section */
.calender-legend {
  min-width: 200px;
  background-color: #ffffff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.08);
  font-size: 15px;
}

.calender-legend h5 {
  font-weight: bold;
  color: var(--text);
  margin-bottom: 1rem;
  border-bottom: 2px solid #e4e4e4;
  padding-bottom: 0.5rem;
}

.calender-legend-list {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.calender-legend-list li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.calender-legend-box {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  border-radius: 4px;
  border: 1px solid #999;
}

.calender-legend-box.present {
  background-color: #00f23a;
}

.calender-legend-box.absent {
  background-color: #fd071ed9;
}

.calender-legend-box.on-site {
  background-color: #9494949c;
}

.calender-legend-box.half-day {
  background-color: #ffc107ad;
}

.calender-legend-box.traveling {
  background-color: #fca400;
}

.calender-legend-box.leave {
  background-color: #3595fa;
}

.month-view-message {
  max-width: 1000px;
  margin: 0 auto;
}

.calendar-legend-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 2rem;
}

.calendar-container {
  width: 600px;
  min-width: 300px;
  flex-shrink: 0;
}

.calendar {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-row {
  display: flex;
}

.calendar-cell {
  flex: 1;
  border: 1px solid #eee;
  min-height: 70px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 4px;
  font-size: 14px;
  position: relative;
}

.calendar-header-cell {
  background-color: #f0f0f0;
  font-weight: bold;
  justify-content: center;
}

.calendar-date {
  position: absolute;
  top: 4px;
  right: 6px;
  font-weight: bold;
}

/* Legend */
.legend-container {
  min-width: 180px;
  flex-shrink: 0;
}

.legend-list {
  list-style: none;
  padding-left: 0;
}

.legend-box {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  vertical-align: middle;
  border-radius: 4px;
}

.legend-box.present {
  background-color: #d4edda;
}
.legend-box.absent {
  background-color: #f8d7da;
}
.legend-box.on-site {
  background-color: #e2e3e5;
}
.legend-box.half-day {
  background-color: #fff3cd;
}
.legend-box.traveling {
  background-color: #ffe5b4;
}
.legend-box.leave {
  background-color: #cce5ff;
}
.attendance-leave {
  background-color: #3595fa;
  color: white;
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
.text-danger{
  color: var(--text)!important;
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
  display: flex;
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
  }

  .attendance-card .row h5 {
    font-size: 16px;
  }

  .attendance-table td:first-child {
    flex-direction: column;
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
.btn-blue {
  background-color: var(--primary);
  color: white;
  margin-bottom: 22px;  
  width: 82px;
  box-shadow: 0 6px 15px rgba(0, 123, 255, 0.4);
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

/* Header */
.header {
  font-size: 17px;
    font-weight: 700;
    height: 93px;
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

.menu-btn {
  background-color: #28a745;
  color: white;
  margin-right: 15px;
}

.menu-btn:hover {
  background-color: #218838;
}

.logout-btn {
  background-color: white;
  color: #003977;
  border: 2px solid #007bff;
}

.logout-btn:hover {
  background-color: #e7f1ff;
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
  font-weight: 700;
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
  padding: 14px 20px;
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
  flex: 1 1 48%;
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

.btn-primary {
  background-color: var(--primary);
  color: white;
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
            font-size: 17px;
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
}
.p-4 {
  padding: 1.5rem;
}

/* === CONTAINERS === */
.container-fluid {
  width: 79%;
  padding-right: 1.5rem;
  border-radius: 16px;
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

.logo-img {
  height: 45px;
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

</style> 
