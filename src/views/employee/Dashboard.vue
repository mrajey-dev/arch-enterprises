<template>
  <div class="layout">
    <!-- Header -->
   <header class="header">
    <div class="head-title"><a href="https://employees.archenterprises.co.in/">
        <img
          src="https://archenterprises.co.in/ajay/ajay.png"
          style="height: 65px;"
          alt="Logo"
        />
         </a>
         🅰️RCH360⚙️
     
      </div>
<div class="download-app" style="position: relative; display: inline-block;">
      <button @click="toggleDownloadMenu">Download Arch App ⬇️</button>

      <!-- Dropdown -->
      <div 
        v-if="showDownloadMenu" 
        class="download-menu" 
        style="position: absolute; top: 100%; left: 0; background: white; border: 1px solid #ccc; padding: 10px; z-index: 100;"
      >
        <div style="margin-bottom: 10px;">
          <!-- QR Code -->
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://median.co/share/qddwled#apk" alt="QR Code">
          <div style="font-size: 12px; margin-top: 5px; color: #000000;">Scan QR Code</div>
        </div>
        <div style="text-align: center;">
          <!-- Direct Link -->
          <a href="https://median.co/share/qddwled#apk" target="_blank" style="color: blue; text-decoration: underline;">Download via Link</a>
        </div>
      </div>
    </div>
    
    <i class="fas fa-bars mobile-menu-icon" @click="toggleSidebar" v-if="isMobile"></i>

    <!-- Download Button -->
    
  </header>

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

<!-- Hide content if sidebar is shown on mobile -->
<section
  v-if="!isMobile || !isSidebarVisible"
  class="content"
  :class="{ 'expanded-content': isMobile && !isSidebarVisible }"
>


 <div class="dashboard-row">
    <!-- Modal -->
    <div class="modal-overlay" v-if="showModal">
      <div class="modal">
        <span class="close-btn" @click="showModal = false">&times;</span>
        <h2>Daily Work Report</h2>
        <form @submit.prevent="submitReport">
            <div class="form-group">
    <label>Date</label>
    <input type="date" v-model="report.date" required />
  </div>
         <div class="form-group">
  <label>Name</label>
  <input type="text" v-model="report.name" required />
</div>

          <div class="form-group">
            <label>Status</label>
            <select v-model="report.status" required>
              <option disabled value="">Select Status</option>
              <option>Completed</option>
              <option>Progress</option>
              <option>Pending</option>
            </select>
          </div>
         <div class="form-group">
  <label>Department</label>
<select v-model="report.department" required>
  <option value="" disabled>Select Department</option>
  <option v-for="dept in departments" :key="dept.id" :value="dept.name">
    {{ dept.name }}
  </option>
</select>
</div>

          
          <div class="form-group">
            <label>Work Summary</label>
            <textarea v-model="report.summary" placeholder="Describe your work..." required></textarea>
          </div>
          
          <button type="submit" class="submit-btn">Submit</button>
        </form>
      </div>
      
    </div>

  


  
    <!-- Leaves Type -->
<div class="dashboard-card clickable-card Tasks" @click="goTo('employee/mytask')" style="cursor:pointer;" >
  <img src="https://img.icons8.com/color/48/task.png" alt="Leaves Type" />
  <div>
    <p class="label">My Tasks</p>
    <h3 class="value" id="leavesType"></h3>
  </div>
</div>  




    <div class="dashboard-card clickable-card Attendance" @click="goTo('employee/empattendance')" style="cursor:pointer;">
  <img src="https://cdn-icons-png.flaticon.com/512/8999/8999099.png" alt="Approved Leaves" />
  <div>
    <p class="label">Attendance</p>
    <h3 class="value" id="approvedLeaves"></h3>
  </div>
</div>



 <!-- Card: Leave Applications -->
  <!-- <div 
  class="dashboard-card clickable-card Leaves"
  @click="goTo('employee/leaveapplicationsemp')"
  style="cursor:pointer;"
>
  <img src="https://img.icons8.com/color/48/checklist.png" alt="Leave Applications" />
  <div>
    <p class="label">Leaves Applications</p>
    <h3 class="value" id="totalLeaveApplications"></h3>
  </div>
</div> -->

 <!-- Customer Registration -->
<div 
  class="dashboard-card clickable-card leavetype desktop-only" 
  @click="goTo('employee/Customerregistrations')"
>
  <img
    src="https://img.icons8.com/color/48/conference-call.png"
    alt="Customer Registration"
  />
  <div>
    <p class="label">CRM</p>
    <h3 class="value" id="leavesType"></h3>
  </div>
</div>


<div 
  class="dashboard-card clickable-card leavetype mobile-only" 
  @click="goTo('employee/visitschedule')"
>
  <img
    src="https://www.freeiconspng.com/uploads/service-icon-0.png"
    alt="Customer Registration"
  />
  <div>
    <p class="label">Visit Schedule</p>
    <h3 class="value" id="leavesType"></h3>
  </div>
</div>






   
<!-- Approved Leaves -->
<!-- <div class="dashboard-card clickable-card" @click="goTo('employee/approvedleavesemp')" style="cursor:pointer;">
  <img src="https://www.pngplay.com/wp-content/uploads/2/Approved-Transparent-Background.png" alt="Approved Leaves" />
  <div>
    <p class="label">Approved Leaves</p>
    <h3 class="value" id="approvedLeaves"></h3>
  </div>
</div> -->





  </div>
<DataChart />
</section>

    </div>

   
  <!-- Inside Layout.vue, after <router-view /> or at the root level -->
<div 
  class="upcoming-task-popup" 
  v-for="(task, index) in upcomingTasks" 
  :key="task.id"
  @click="dismissUpcomingTask(index)"
  :style="{ top: `${index * 80}px` }"
>
  <strong>{{ task.title }}</strong><br>
  Deadline: {{ new Date(task.deadline_date).toLocaleDateString() }}
</div>


  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from './components/Sidebar.vue';
import DataChart from './components/DataChart.vue';

export default {
  name: 'Dashboard',
  components: { Sidebar, DataChart },
  data() {
    return {
      showDownloadMenu: false,
       isMobile: window.innerWidth <= 768,
      upcomingTasks: [],
      currentUser: {},
      tasks: [],
      userEmail: '',
      birthdaysThisMonth: [],
      isMobile: false,
      isSidebarVisible: true,
      report: {
        date: '',
        name: '',
        status: '',
        department: '',
        summary: '',
        file: null
      },
      departments: [
        { id: 1, name: 'IT' },
        { id: 2, name: 'HR' },
        { id: 3, name: 'ACCOUNT' }
      ],
      username: '',
      showModal: false,
      totalEmployees: 0,
      users: [],
      showRegister: false,
      isEditMode: false,
      editingId: null,
      registerForm: {
        id: '',
        empId: '',
        username: '',
        email: '',
        gender: '',
        department: '',
        city: '',
        address: '',
        mobile: '',
        secondary_contact: '',
        keyResponsibility: '',
        password: '',
        birth_date: '',
        blood_group: '',
        documents: []
      }
    }
  },

  computed: {
    sortedBirthdaysThisMonth() {
      const today = new Date();
      const todayDay = today.getDate();

      return this.birthdaysThisMonth.slice().sort((a, b) => {
        const dayA = new Date(a.dateofbirth).getDate();
        const dayB = new Date(b.dateofbirth).getDate();

        const isPastA = dayA < todayDay;
        const isPastB = dayB < todayDay;

        if (isPastA && !isPastB) return 1;
        if (!isPastA && isPastB) return -1;

        return dayA - dayB;
      });
    }
  },

  methods: {
    toggleDownloadMenu() {
      this.showDownloadMenu = !this.showDownloadMenu;
    },
    // ---------- API helpers ----------
    getAuthHeaders() {
      return { Authorization: `Bearer ${localStorage.getItem('token')}` };
    },

    // Fetch logged-in user (consistent: axios + token)
    async fetchCurrentUser() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/user', {
          headers: this.getAuthHeaders()
        });
        this.currentUser = response.data;
        this.userEmail = response.data.email || '';
      } catch (err) {
        console.error('fetchCurrentUser error:', err);
      }
    },

    async fetchTasks() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/tasks', {
          headers: this.getAuthHeaders()
        });
        // Ensure currentUser is set before filtering
        if (!this.currentUser || !this.currentUser.id) {
          // store unfiltered tasks; we'll filter again once currentUser is available
          this.tasks = response.data;
        } else {
          this.tasks = response.data.filter(t => t.user_id === this.currentUser.id);
        }
        this.getUpcomingTasks();
      } catch (err) {
        console.error('fetchTasks error:', err);
      }
    },

    // Use axios and token for users list
    async fetchUsers() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/users', {
          headers: this.getAuthHeaders()
        });
        this.users = response.data;
      } catch (err) {
        console.error('fetchUsers error:', err);
        alert('Failed to fetch users');
      }
    },

    async fetchBirthdays() {
      try {
        // reuse fetchUsers (which uses axios/token)
        if (!this.users.length) await this.fetchUsers();

        const currentMonth = new Date().getMonth(); // 0-indexed
        this.birthdaysThisMonth = this.users.filter(user => {
          if (!user.dateofbirth) return false;
          const birthMonth = new Date(user.dateofbirth).getMonth();
          return birthMonth === currentMonth;
        });
      } catch (error) {
        console.error('Failed to fetch birthdays:', error);
      }
    },

    async fetchDepartments() {
      try {
        const res = await axios.get('https://employees.archenterprises.co.in/api/api/departments', {
          headers: this.getAuthHeaders()
        });
        if (Array.isArray(res.data) && res.data.length) this.departments = res.data;
      } catch (err) {
        console.error('fetchDepartments error:', err);
      }
    },

    async fetchTotalEmployees() {
      try {
        const response = await fetch("/api/api/total-employees");
        const data = await response.json();
        this.totalEmployees = data.totalEmployees || 0;
      } catch (err) {
        console.error("Failed to fetch total employees:", err);
      }
    },

    // ---------- Date helpers (local-date safe comparison) ----------
    // return local YYYY-MM-DD for a Date or date-string
    localDateString(value) {
      if (!value) return '';
      const d = new Date(value);
      if (isNaN(d)) return '';
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    },

    // Upcoming tasks — includes today and tomorrow, using local date strings
    getUpcomingTasks() {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const todayStr = this.localDateString(today);
      const tomorrowStr = this.localDateString(tomorrow);

      this.upcomingTasks = (this.tasks || [])
        .filter(task => {
          const deadline = task.deadline || task.deadline_date;
          if (!deadline) return false;
          const taskDateStr = this.localDateString(deadline);
          return [todayStr, tomorrowStr].includes(taskDateStr);
        })
        .filter(task => ['Pending', 'In Progress'].includes(task.status))
        .sort((a, b) => new Date(a.deadline || a.deadline_date) - new Date(b.deadline || b.deadline_date));
    },

    dismissUpcomingTask(index) {
      this.upcomingTasks.splice(index, 1);
    },

    // ---------- Navigation ----------
    goTo(route) {
      this.$router.push(`/${route}`);
    },

    // ---------- File uploads ----------
    handleReportFileUpload(event) {
      this.report.file = event.target.files[0] || null;
    },

    handleRegisterFiles(event) {
      this.registerForm.documents = Array.from(event.target.files || []);
    },

    // ---------- Form actions ----------
    async submitReport() {
      try {
        const formData = new FormData();
        formData.append('date', this.report.date);
        formData.append('name', this.report.name);
        formData.append('status', this.report.status);
        formData.append('department', this.report.department);
        formData.append('summary', this.report.summary);
        if (this.report.file) formData.append('file', this.report.file);

        await axios.post('https://employees.archenterprises.co.in/api/api/daily-reports', formData, {
          headers: { ...this.getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
        });

        alert('Report submitted successfully!');
        this.showModal = false;
        this.report = { date: '', name: this.report.name || '', status: '', department: '', summary: '', file: null };
      } catch (error) {
        console.error('Failed to submit report:', error);
        alert('Failed to submit report');
      }
    },

    // Register / edit user
    resetForm() {
      this.registerForm = {
        id: '',
        empId: '',
        username: '',
        email: '',
        gender: '',
        department: '',
        city: '',
        address: '',
        mobile: '',
        keyResponsibility: '',
        password: '',
        documents: []
      };
      this.isEditMode = false;
      this.editingId = null;
    },

    openRegisterForm() {
      this.resetForm();
      this.showRegister = true;
    },

    closeRegisterForm() {
      this.showRegister = false;
      this.resetForm();
    },

    async handleRegister() {
      try {
        const formData = new FormData();
        for (const key in this.registerForm) {
          if (key === 'documents') {
            this.registerForm.documents.forEach((file) =>
              formData.append('documents[]', file)
            );
          } else {
            formData.append(key, this.registerForm[key] || '');
          }
        }

        const url = this.isEditMode
          ? `https://employees.archenterprises.co.in/api/api/users/${this.editingId}`
          : 'https://employees.archenterprises.co.in/api/api/register';

        const method = this.isEditMode ? 'put' : 'post';

        await axios({
          method,
          url,
          data: formData,
          headers: { ...this.getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
        });

        alert(this.isEditMode ? 'User updated successfully!' : 'Registration successful!');
        this.showRegister = false;
        this.resetForm();
        await this.fetchUsers();
      } catch (error) {
        console.error('Register error:', error);
        if (error.response && error.response.data && error.response.data.message) {
          alert(`Operation failed: ${error.response.data.message}`);
        } else {
          alert('Operation failed due to network or server error.');
        }
      }
    },

    editUser(user) {
      this.registerForm = {
        id: user.id || '',
        empId: user.empId || '',
        username: user.username || '',
        email: user.email || '',
        gender: user.gender || '',
        department: user.department || '',
        city: user.city || '',
        address: user.address || '',
        mobile: user.mobile || '',
        keyResponsibility: user.keyResponsibility || '',
        password: '',
        documents: []
      };
      this.isEditMode = true;
      this.editingId = user.id;
      this.showRegister = true;
    },

    async deleteUser(id) {
      if (!confirm('Are you sure you want to delete this user?')) return;
      try {
        await axios.delete(`https://employees.archenterprises.co.in/api/api/users/${encodeURIComponent(id)}`, {
          headers: this.getAuthHeaders()
        });
        await this.fetchUsers();
        alert('User deleted successfully!');
      } catch (error) {
        console.error('deleteUser error:', error);
        alert('Failed to delete user.');
      }
    },

    logout() {
      const token = localStorage.getItem('token');
      axios.post('https://employees.archenterprises.co.in/api/api/logout', {}, {
        headers: this.getAuthHeaders()
      }).finally(() => {
        localStorage.removeItem('token');
        this.$router.push('/auth');
      });
    },

    // responsive
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },

    formatFirstName(fullName) {
      if (!fullName) return '';
      const firstName = fullName.split(' ')[0];
      return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    }
  },

  // ---------- lifecycle ----------
  async mounted() {
    // Close menu if clicked outside
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.showDownloadMenu = false;
      }
    });
    // set default report date and user name (if stored in localStorage)
    const today = new Date().toISOString().substr(0, 10);
    if (!this.report.date) this.report.date = today;

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.report.name = user.name || 'Unknown';
      } catch (e) {
        console.error('Error parsing user from storage:', e);
      }
    }

    window.addEventListener('resize', this.checkIfMobile);
    this.checkIfMobile();

    // Fetch core data sequentially (safer) and update dependent parts
    await this.fetchCurrentUser();
    await this.fetchTasks();        // fetchTasks uses currentUser to filter tasks if available
    await this.fetchUsers();
    await this.fetchBirthdays();
    await this.fetchDepartments();
    await this.fetchTotalEmployees();
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.checkIfMobile);
  }
}
</script>





<style scoped>

@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
.head-title{
      color: white;
    display: flex;
    gap: 7px;
    text-decoration: none;
    align-items: center;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5); /* semi-transparent black */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* on top of everything */
}

/* Modal content stays on top of overlay */
.modal-content {
  background-color: #fff;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  z-index: 10000; /* above overlay */
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  position: relative;
}

/* Optional: fade-in animation */
.modal-overlay {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}


.upcoming-task-popup {
  position: fixed;  /* stay fixed on the screen */
  right: 20px;      /* distance from the right edge */
  width: 250px;     /* adjust width as needed */
  background: #f9f9f9;
  border: 1px solid #ccc;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;  /* smooth movement */
  z-index: 9999;
}

.upcoming-task-popup {
  position: fixed;
  right: 20px;
  top: 20px;
  background-color: #fff8dc;
  border-left: 5px solid #ffa500;
  padding: 15px;
  margin-top: 85px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 250px;
  z-index: 9999;
}
/* .upcoming-task-popup + .upcoming-task-popup {
  margin-top: 10px;
} */

.deadline-reminder-popup {
  position: fixed;
  top: 86px;
  right: 20px;
  background: #ffeeba;
  color: #856404;
  border: 1px solid #ffeeba;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 9999;
  cursor: pointer;
  width: 250px;
}

.deadline-reminder-popup h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.deadline-reminder-popup ul {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 14px;
}

.deadline-reminder-popup small {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: #555;
}
.upcoming-task-popup {
  position: fixed;
  right: 20px;
  top: 20px; /* stacked automatically */
  background-color: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 10000;
  cursor: pointer;
  min-width: 250px;
}


.leavetype{
background-color: #6419ed33 !important;
    box-shadow: 9px 10px #bdaddb !important;
}
.birthday-reminder {
  margin-top: -25px;
  padding: 20px;
  background: #f3f9ff;
  border-radius: 12px;
  /* box-shadow: 0 4px 10px rgba(0,0,0,0.05); */
}

.birthday-reminder h2 {
  font-size: 15px;
  color: #518587;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.birthday-list {
  justify-content: center;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
}

.birthday-card {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 12px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  width: 190px;
}

.birthday-card img {
     width: 32px;
    height: 32px;
  margin-right: 15px;
}

.birthday-info h3 {
  margin: 0;
  font-size: 13px;
  color: #427172;
}

.birthday-info p {
  margin: 2px 0;
  font-size: 11px;
  color: #666;
}

.birthday-dept {
  font-style: italic;
  font-size: 0.85rem;
  color: #888;
}

.static-info-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.static-info-section h2 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #427172;
  font-weight: 600;
}

.static-info-section ul {
  list-style: none;
  padding: 0;
}

.static-info-section ul li {
  padding: 8px 0;
  font-size: 16px;
  color: #555;
}




.Tasks{
  background-color: #ffc0cb52 !important;
     box-shadow: 9px 10px #e4bbc3 !important;
}
.Leaves{
   background-color: #ff9d0052 !important ;
  box-shadow: 9px 10px #e2c18c !important;
}
.Attendance{
   background-color: #00ff3745 !important ;
   box-shadow: 9px 10px #84cf94 !important;
}




.mobile-menu-icon {
  font-size: 22px;
  margin-left: 10px;
  cursor: pointer;
  display: none;
}

@media (max-width: 768px) {
  .birthday-card{
        width: 100px!important;
  }
  .mobile-menu-icon {
    display: inline-block;
  }

  .layout{
        background: #ffffff!important;
  }
.content{
  box-shadow: 0 5px 30px rgb(0 0 0 / 0%)!important;
}
  .sidebar {
    position: absolute;
    z-index: 1000;
    width: 240px;
    height: 100vh;
    background-color: #2c3e50;
  }

  .expanded-content {
    margin-left: 0 !important;
    transition: margin 0.3s ease-in-out;
  }
}


.dashboard-card {
  background: #0d6efd57;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
  text-align: center;
  width: 250px;
  cursor: pointer;
  height: 113px;
}
.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  background-color: #f9f9ff;
}
.dashboard-card img {
  width: 60px;
  margin-bottom: 10px;
  
}
.label {
  
  font-size: 18px;
  color: #427172;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal {
  background: white;
  padding: 30px;
  border-radius: 16px;
  width: 450px;
  position: relative;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.2);
}
.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 20px;
  cursor: pointer;
  color: #888;
}
.form-group {
  margin-bottom: 15px;
}
input[type='text'],
input[type='date'],
input[type='file'],
select,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
}
textarea {
  height: 100px;
  resize: vertical;
}
.submit-btn {
  background-color: #5f9ea0;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  transition: background-color 0.3s;
}
.submit-btn:hover {
  background-color: #45a049;
}
.dashboard-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
  text-align: center;
  width: 250px;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  background-color: #f9f9ff;
}

.dashboard-card img {
  width: 60px;
  margin-bottom: 10px;
}



.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 16px;
  width: 40%;
  position: relative;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 20px;
  cursor: pointer;
  color: #888;
}

.form-group {
  margin-bottom: 15px;
}

input[type='date'],
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
}

textarea {
  height: 100px;
  resize: vertical;
}

.submit-btn {
  background-color: #5f9ea0;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #45a049;
}   
.content {
  padding: 40px;
  background-color: #f4f6f9;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 30px;
  color: #427172;
  text-align: center;
}

.dashboard-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.dashboard-card {
  /* background: lightblue url("https://png.pngtree.com/thumb_back/fh260/background/20220316/pngtree-download-background-biru-polos-hd-dan-keren-untuk-desain-ppt-image_1067745.jpg");  */
  border-radius: 16px;
  padding: 13px 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: 0.3s ease;
  min-width: 260px;
  max-width: 280px;
  flex: 1 1 250px;
}

.dashboard-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
 /* background: lightblue url("https://png.pngtree.com/thumb_back/fh260/background/20220316/pngtree-download-background-biru-polos-hd-dan-keren-untuk-desain-ppt-image_1067745.jpg");  */
  color: black;
}

.dashboard-card img {
  width: 48px;
  height: 48px;
  margin-left: 38px;
}

.label {
  font-size: 18px;
  color: #2e5758;
  margin-bottom: 5px;
}


.value {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

/* Responsive design for mobile */
@media (max-width: 768px) {
  .dashboard-row {
    flex-direction: column;
    align-items: center;
  }
  .layout {
  display: flex;
}

  .label[data-v-5dea76fb] {
    font-size: 15px;
        font-weight: 600;
    color: #2e5758;
    margin-bottom: 5px;
}
  .dashboard-card {
 /* background: lightblue url("https://png.pngtree.com/thumb_back/fh260/background/20220316/pngtree-download-background-biru-polos-hd-dan-keren-untuk-desain-ppt-image_1067745.jpg");  */
  /* border-radius: 16px; */
  padding: 0px 26px;
  display: flex;
  align-items: center;
  gap: 15px;
  /* box-shadow: 9px 10px 0px 0px rgb(162 195 215); */
  transition: 0.3s ease;
  /* margin-left: -19px; */
  max-width: 216px;
  flex: 1 1 123px;
}
.content{
    flex: 1;
    background-color: #f3f9ff;
    padding: 16px 17px;
    border-radius: 15px;
    /* box-shadow: 0 5px 30px rgba(0, 0, 0, 0.08); */
    overflow-x: auto;
}
}

.user-table td .btn-group {
  display: flex;
  gap: 0.5rem;
}
/* Layout */
.layout {
  /* display: flex; */
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #427778;
}

/* Header */
.header {
  font-size: 17px;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, .3);
 background-color: cadetblue; 
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
  color: #518587;
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
      align-self: center;
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
  color: #495057;
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
  background-color: #5f9ea0;
  color: white;
  font-weight: 700;
}

/* Content Section */
.content {
  flex: 1;
  background-color: f0f2f8!important ;
  padding: 30px 40px;
  border-radius: 15px;
  /* box-shadow: 0 5px 30px rgba(0,0,0,0.08); */
  overflow-x: auto;
}

h2 {
  margin-bottom: 30px;
  color: #518587;
  font-weight: 700;
  font-size: 28px;
  border-bottom: 2px solid #5f9ea0;
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
  color: #427778;
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
  background-color: #2e5758;
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
  color: #518587;
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
  color: #427778;
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
  border-color: #5f9ea0;
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
  font-size: 1.1rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
}

.btn-primary {
  background-color: #5f9ea0;
  color: white;
  box-shadow: 0 6px 15px rgba(0, 123, 255, 0.4);
}

.btn-primary:hover {
  background-color: #426b6c;
  box-shadow: 0 8px 18px rgba(0, 86, 179, 0.6);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  box-shadow: 0 6px 15px rgba(108, 117, 125, 0.4);
}

.btn-secondary:hover {
  background-color: #5a6268;
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
  background-color: #5f9ea0;
  border: none;
  color: white;
}

.btn-primary.attractive-btn:hover {
  background-color: #426b6c;
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
.header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 35px;
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
.download-app button {
  padding: 8px 13px;
  cursor: pointer;
  border-radius: 30px;
  border: none;
  font-weight: 600;
  font-size: 11px;
  color: #000000;
  /* background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); */
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Hover Effect */
.download-app button:hover {
  transform: translateY(-2px);
  color:#000000;
  box-shadow: 0 10px 25px rgba(44, 83, 100, 0.6);
  /* background: linear-gradient(135deg, #2c5364, #203a43, #0f2027); */
}

/* Click Effect */
.download-app button:active {
  transform: scale(0.95);
}

/* Optional glow animation */
.download-app button::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.15);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.download-app button:hover::after {
  opacity: 1;
}

/* Hide download app button on mobile */
@media (max-width: 768px) {
  .download-app {
    display: none !important;
  }
}

/* Hide by default (desktop & tablet) */
.mobile-only {
  display: none;
}

/* Show only on mobile */
@media (max-width: 768px) {
  .mobile-only {
    display: flex; /* or block depending on your card layout */
  }
}
/* Show by default (desktop & laptop) */
.desktop-only {
  display: flex;
}

/* Hide on mobile */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
}

  

</style>
