

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
      <i class="fas fa-bars mobile-menu-icon" @click="toggleSidebar" v-if="isMobile"></i>
    </header>


    <!-- Main Content -->
    <div class="main-content">
       <Sidebar v-if="!isMobile || isSidebarVisible" />

<!-- Hide task content when sidebar is open on mobile -->
<div class="task-container" v-if="!isMobile || !isSidebarVisible">

        <div class="task-header">
         <button class="add-task-btn" @click="openAddTaskModal">✚ Add Task</button>
        <button
  class="add-task-btn"
  v-if="currentUser.department?.toLowerCase() === 'management'"
  @click="goTo('employee/empworkreport')"
>
  <i class="fas fa-tasks"></i> Task Assign & Report
</button>


        </div>  
<!-- Reminder Popups -->
<div
  v-for="(task, index) in upcomingTasks"
  :key="task.id"
  class="upcoming-task-popup"
  @click="dismissUpcomingTask(index)"
  :style="{
    background: '#ffffff',
    color: 'red',
    height: '81px',
    padding: '10px 20px',
    borderRadius: '12px',
    top: '0px',
    marginBottom: '10px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  }"
  @mouseover="hover = index"
  @mouseleave="hover = null"
  :class="{ 'popup-hover': hover === index }"
>
  <strong style="font-size: 1.1em;">⚠️ {{ task.title }}</strong><br />
  <small style="opacity: 0.9;">Due: {{ task.dueDate }}</small>
</div>





<!-- Filter Controls -->
<div class="task-filters">
  <input type="date" v-model="filters.date" />
  <select v-model="filters.month">
    <option value="">All Months</option>
    <option v-for="m in 12" :key="m" :value="m">{{ new Date(0, m - 1).toLocaleString('default', { month: 'long' }) }}</option>
  </select>
  <select v-model="filters.status">
    <option value="">All Statuses</option>
    <option>Pending</option>
    <option>In Progress</option>
    <option>Completed</option>
  </select>
  <button @click="clearFilters">Reset</button>
</div>
        <div class="task-grid">
          <div
            class="task-card"
            v-for="task in filteredTasks" :key="task.id"

            :class="formatStatus(task.status)"
          >
            <div class="task-header">
           <span class="task-date">
  <i> Deadline:</i>
  {{
    task.isVisit
      ? task.deadline
      : task.dueDate
  }}
</span>

            
              <div v-if="task.status === 'Completed'" class="completed-date">
  ✅{{ new Date(task.completedAt).toLocaleDateString() }}
</div>
            <span
  class="task-priority"
  :class="task.isVisit ? 'visit-service' : task.priority.toLowerCase()"
>
  {{ task.isVisit ? 'Service Due' : task.priority }}
</span>

            </div>
           <div class="task-title-row">
 <h3
  class="task-title visit-link"
  v-if="task.isVisit"
  @click="goToVisitSchedule"
>
  {{ task.title }}
</h3>

<h3
  class="task-title"
  v-else
>
  {{ task.title }}
</h3>

 
</div>



         <!-- Status Dropdown -->
<select
  v-if="!task.isVisit"
  v-model="task.status"
  @change="updateTaskStatus(task)"
  :class="['task-status-dropdown', formatStatus(task.status)]"
>
  <option>Pending</option>
  <option>In Progress</option>
  <option>Completed</option>
</select>

 <!-- Task Card Buttons -->
<button
  class="edit-btn"
  @click="openEditTaskModal(task)"
  v-if="task.priority !== 'Task Assigned'"
>
  Edit
</button>

<button
  class="delete-btn"
  @click="deleteTask(task)"
  v-if="task.priority !== 'Task Assigned'"
>
  Delete
</button>



          </div>
          
        </div>
                                                  <!-- Show More Button -->
<div
  v-if="visibleTaskCount < totalFilteredTasks"
  class="show-more-container"
>
  <button @click="loadMore" class="show-more-btn">
    Show More Task
  </button>
</div>


      </div>

    </div>

    <!-- Add Task Modal -->
   <!-- Add Task Modal -->
<div class="modal" v-if="showAddTaskForm">
  <div class="modal-content">
    <h3>{{ isEditTaskMode ? 'Edit Task' : 'Add New Task' }}</h3>
    <form @submit.prevent="submitTask">
      <!-- Start Date -->
  Due Date:
<input
  type="date"
  v-model="newTask.dueDate"
  :min="today"
  required
/>


      <!-- Deadline Date -->
      <!-- Deadline:
      <input type="date" v-model="newTask.deadline" :min="newTask.startDate" required /> -->

      <!-- Priority -->
       Select Priority: 
      <select v-model="newTask.priority" required>
        <option disabled value="">Select Priority</option>
        <option>High</option>
        <option>Medium</option>
        <option>Low</option>
      </select>

      <!-- Title -->
  <input
  type="text"
  v-model="newTask.title"
  placeholder="Title"
  maxlength="50"
  required
  @input="filterTitle"
/>
<small style="color: #b39b9b;">{{ newTask.title.length }}/50</small>



      <!-- Description -->
     <textarea
  v-model="newTask.description"
  placeholder="Description (optional)"
  maxlength="250"
></textarea>
<small style="color: #b39b9b;">{{ newTask.description.length }}/250</small>


      <!-- Modules -->
    <textarea
  v-model="newTask.modules"
  placeholder="Modules..."
  rows="5"
  maxlength="250"
></textarea>
<small style="color: #b39b9b;">{{ newTask.modules.length }}/250</small>


      <!-- Status -->
      <select v-model="newTask.status" required>
        <option disabled value="">Select Status</option>
        <option>Pending</option>
        <option>In Progress</option>
        <option>Completed</option>
      </select>

      <!-- Actions -->
      <div class="modal-actions">
        <button type="submit">Save</button>
        <button type="button" @click="showAddTaskForm = false">Cancel</button>
      </div>
    </form>
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
    return {
      totalFilteredTasks: 0,
      upcomingTasks: [], // tasks with deadline = today+1
    showReminderPopup: false,
      visibleTaskCount: 6, // initially show 6 tasks
      filters: {
  date: '',
  month: '',
  status: ''
},
      currentUser: {
   id: null,
  username: '',
  department: ''
},
      isMobile: false,
isSidebarVisible: true,

       tasks: [], // Your existing task list
      showAddTaskForm: false, // Controls the modal/form visibility
     newTask: {
  dueDate: '',        // use dueDate consistently (YYYY-MM-DD)
  deadline: '', 
  priority: '',
  title: '',
  description: '',
  status: '',
  modules: ''
},

      isEditTaskMode: false,
editingTaskId: null,
     
      selectedDocumentType: '',
typedDocuments: {},
      showPassword: true,
      users: [],
      showRegister: false,
      isEditMode: false,
      editingId: null,  // changed from editingEmail to editingId
      registerForm: {
        id: '',  // include id for edit
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
        documents: [],
      }
    }
  },
  computed: {
    today() {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  },
    
filteredTasks() {
    const todayStr = new Date().toISOString().substr(0, 10);

    const filtered = this.tasks
      .filter(task => {
        if (task.isVisit && task.status === 'Completed') return false;
        const taskDate = task.isVisit ? task.deadline : task.dueDate;
        if (!taskDate) return false;

        const dateStr = new Date(taskDate).toISOString().substr(0, 10);
        const taskMonth = new Date(taskDate).getMonth() + 1;
        const isIncomplete = task.status !== 'Completed';

        const matchDate =
          !this.filters.date ||
          (isIncomplete && this.filters.date === todayStr) ||
          dateStr === this.filters.date;

        const matchMonth =
          !this.filters.month || taskMonth === Number(this.filters.month);

        const matchStatus =
          !this.filters.status || task.status === this.filters.status;

        return matchDate && matchMonth && matchStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.isVisit ? a.deadline : a.dueDate);
        const dateB = new Date(b.isVisit ? b.deadline : b.dueDate);
        return dateB - dateA;
      });

    // 🔑 store total filtered count
    this.totalFilteredTasks = filtered.length;

    return filtered.slice(0, this.visibleTaskCount);
  },






},
watch: {
  'filters.month'(newVal) {
    if (newVal) {
      // ✅ When month is selected, clear date
      this.filters.date = '';
    }
  },
  'filters.date'(newVal) {
    if (newVal) {
      // (Optional) When date is selected, clear month
      this.filters.month = '';
    }
  },
  showAddTaskForm(newVal) {
    if (newVal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }
},


  methods: {
async fetchAssignedServices() {
  try {
    const res = await axios.get(
      `/api/get-assigned-services/${this.currentUser.id}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );

    const serviceTasks = res.data
      .filter(s => s.status && s.status.toLowerCase().trim() !== 'completed')
      .map(s => ({
        id: `service-${s.id}`,
        title: s.company_name,
        dueDate: null,
        deadline: s.visit_date,
        priority: 'Task Assigned',
        description: `Service: ${s.service_type || ''}`,
        status: s.status || 'Pending',
        createdAt: s.visit_date,
        isVisit: true,
        isService: true
      }));

    this.tasks.push(...serviceTasks);
  } catch (err) {
    console.error('Failed to fetch assigned services', err);
  }
},


    goToVisitSchedule() {
  window.location.href =
    'https://employees.archenterprises.co.in/employee/visitschedule'
},

    loadMore() {
    this.visibleTaskCount += 6;
  },
async fetchAssignedVisits() {
  try {
    const res = await axios.get(
      `https://employees.archenterprises.co.in/api/api/assigned-visits/${this.currentUser.id}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );

    const visitTasks = res.data
      .filter(v => v.status && v.status.toLowerCase().trim() !== 'completed')
      .map(v => ({
        id: `visit-${v.id}`,
        title: v.company_name,
        dueDate: null,
        deadline: v.visit_date,
        priority: 'Task Assigned',
        description: `Service: ${v.service_type}`,
        status: v.status || 'Pending',
        createdAt: v.visit_date,
        isVisit: true
      }));

    this.tasks.push(...visitTasks);
  } catch (err) {
    console.error('Failed to fetch assigned visits', err);
  }
},


     filterTitle() {
    // Allow: letters, numbers, space, and &
    this.newTask.title = this.newTask.title.replace(/[^a-zA-Z0-9 &\-_.(),@#]/g, '');

  },
    getReminderGradient(task) {
    const due = new Date(task.dueDate);
    const now = new Date();
    const diff = (due - now) / (1000 * 60 * 60 * 24); // days left

    if (diff < 0) return '#ffffff;'; // past due - red
    if (diff <= 1) return '#ffffff;'; // due today - orange
    if (diff <= 3) return '#ffffff;'; // soon - blue
    return '#ffffff;'; // later - green
  },
    getReminderColor(task) {
    if (!task.dueDate) return 'gray'; // fallback

    const today = new Date();
    const due = new Date(task.dueDate);
    
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'red';       // past due
    if (diffDays === 0) return 'orange';  // today
    if (diffDays >= 1 && diffDays <= 2) return 'yellow'; // 1-2 days away

    return 'gray'; // default
  },

  dismissUpcomingTask(index) {
  this.upcomingTasks.splice(index, 1);
},

  dismissReminder() {
    this.showReminderPopup = false;
  },
    closeTaskModal() {
  this.showAddTaskForm = false;
  this.resetNewTaskForm();
},

resetNewTaskForm() {
  this.newTask = {
 
    dueDate: '',
     deadline: '',
    priority: '',
    title: '',
    description: '',
    status: '',
    modules: ''
  };
  this.isEditTaskMode = false;
  this.editingTaskId = null;
},
openEditTaskModal(task) {
  if (!task) return;

  this.newTask = {
    dueDate: task.dueDate ? task.dueDate.substr(0, 10) : this.today, // ensure date string
    deadline: task.deadline ? task.deadline.substr(0, 10) : '',       // ensure date string
    priority: task.priority || '',
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'Pending',
    modules: task.modules || ''
  };

  this.editingTaskId = task.id;
  this.isEditTaskMode = true;
  this.showAddTaskForm = true;
},


    clearFilters() {
  this.filters.date = '';
  this.filters.month = '';
  this.filters.status = '';
},

    async fetchCurrentUser() {
  try {
    const response = await axios.get('https://employees.archenterprises.co.in/api/api/user', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
   this.currentUser.id = response.data.id;
this.currentUser.username = response.data.name;
 this.currentUser.department = response.data.department;

  } catch (error) {
    console.error('Failed to fetch current user:', error);
    alert('Could not fetch logged-in user info.');
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
async fetchTasks() {
  try {
    const response = await axios.get('https://employees.archenterprises.co.in/api/api/tasks', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    this.tasks = response.data
      .filter(task => task.user_id === this.currentUser.id)
      .map(task => ({
        id: task.id,
        title: task.title,
        dueDate: task.due_date,
        deadline: task.deadline_date,
        priority: task.priority,
        description: task.description,
        status: task.status,
        completedAt: task.completed_at,
        createdAt: task.created_at,
        assignedTo: task.user_name
      }));

   // Populate upcomingTasks for popups — exclude completed tasks
const today = new Date();
this.upcomingTasks = this.tasks.filter(task => {
  if (!task.dueDate) return false;
  if (task.status === 'Completed') return false; // ✅ Skip completed tasks
  const due = new Date(task.dueDate);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 2;
});


  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    alert('Could not load tasks');
  }
},





    deleteTask(task) {
  if (confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
    axios.delete(`https://employees.archenterprises.co.in/api/api/tasks/${task.id}`)
      .then(() => {
        this.tasks = this.tasks.filter(t => t.id !== task.id);
        // alert('Task deleted successfully!');
      })
      .catch(error => {
        console.error('Error deleting task:', error);
        alert('Failed to delete task.');
      });
  }
},

async updateTaskStatus(task) {
  const oldStatus = task.status;
  const oldCompletedAt = task.completedAt;
  const payload = { status: task.status };

  if (task.status === 'Completed' && !task.completedAt) {
    const today = new Date().toISOString();
    payload.completed_at = today;
    task.completedAt = today;
  } else if (task.status !== 'Completed' && task.completedAt) {
    payload.completed_at = null;
    task.completedAt = null;
  }

  if (!task.id) {
    alert('Task has no id, cannot update. Please refresh the page.');
    return;
  }

  try {
    await axios.put(`https://employees.archenterprises.co.in/api/api/tasks/${task.id}`, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    // success — optionally show toast
  } catch (error) {
    // rollback UI
    task.status = oldStatus;
    task.completedAt = oldCompletedAt;
    console.error('Failed to update task status', error);
    alert('Failed to update task status on server. Changes reverted.');
  }
},





    formatStatus(status) {
    return status.toLowerCase().replace(/\s+/g, '-'); // "In Progress" → "in-progress"
  },
  openAddTaskModal() {
    const today = new Date().toISOString().substr(0, 10); // format: yyyy-mm-dd
    this.newTask.dueDate = today;
    this.newTask.priority = '';
    this.newTask.title = '';
    this.newTask.description = '';
    this.newTask.status = '';
    this.showAddTaskForm = true;
  },
submitTask() {
  const payload = {
  title: this.newTask.title,
  description: this.newTask.description,
  status: this.newTask.status,
  priority: this.newTask.priority,
  due_date: this.newTask.dueDate,

  deadline_date: this.newTask.deadline, // <-- must be a date string like "2025-10-11"
  modules: this.newTask.modules,
  user_id: this.currentUser.id,
  user_name: this.currentUser.username,
  completed_at: this.newTask.status === 'Completed' ? new Date().toISOString() : null
};


  const url = this.isEditTaskMode
    ? `https://employees.archenterprises.co.in/api/api/tasks/${this.editingTaskId}`
    : 'https://employees.archenterprises.co.in/api/api/tasks';

  const method = this.isEditTaskMode ? 'put' : 'post';

  axios({
    method,
    url,
    data: payload,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(() => {
      this.fetchTasks();
      this.closeTaskModal();
    })
    .catch(error => {
      console.error('Error saving task:', error);
      alert('Failed to save task.');
    });
},







    handleTypedFileUpload(event) {
  const file = event.target.files[0];
  if (this.selectedDocumentType && file) {
    this.typedDocuments[this.selectedDocumentType] = file;
    this.registerForm.documents = Object.values(this.typedDocuments); // update form data
  } else {
    alert('Please select a document type before uploading.');
  }
},

    togglePasswordVisibility() {
  this.showPassword = !this.showPassword
},

generatePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  this.registerForm.password = password
},

    goTo(route) {
      this.$router.push(`/${route}`)
    },

    openRegisterForm() {
      this.resetForm()
      this.showRegister = true
    },

    closeRegisterForm() {
      this.showRegister = false
      this.resetForm()
    },

    async handleRegister() {
      try {
        const formData = new FormData()
        for (const key in this.registerForm) {
          if (key === 'documents') {
            this.registerForm.documents.forEach((file) =>
              formData.append('documents', file)
            )
          } else {
            formData.append(key, this.registerForm[key])
          }
        }

        const url = this.isEditMode
          ? `https://employees.archenterprises.co.in/api/api/users/${this.editingId}`   // use id here
          : 'https://employees.archenterprises.co.in/api/api/register'

        const method = this.isEditMode ? 'put' : 'post'

        await axios({
          method,
          url,
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })

        alert(this.isEditMode ? 'User updated successfully!' : 'Registration successful!')
        this.showRegister = false
        this.resetForm()
        this.fetchUsers()
      } catch (error) {
        console.error('Register error:', error)
        if (error.response && error.response.data && error.response.data.message) {
          alert(`Operation failed: ${error.response.data.message}`)
        } else {
          alert('Operation failed due to network or server error.')
        }
      }
    },

    handleFileUpload(event) {
      this.registerForm.documents = Array.from(event.target.files)
    },

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
        documents: [],
        
      }
      this.isEditMode = false
      this.editingId = null
    },

    async fetchUsers() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.users = response.data
      } catch (error) {
        alert('Failed to fetch users')
        console.error(error)
      }
    },

    editUser(user) {
      // Populate form with user data for editing
      this.registerForm = {
        id: user.id || '',               // assign id here
        empId: user.empId || '',
        username: user.username || '',
        email: user.email || '',
        gender: user.gender || '',
        department: user.department || '',
        city: user.city || '',
        address: user.address || '',
        mobile: user.mobile || '',
        keyResponsibility: user.keyResponsibility || '',
        password: '', // password not required on edit
        documents: []
      }
      this.isEditMode = true
      this.editingId = user.id   // set editingId here
      this.showRegister = true
    },

    async deleteUser(id) {
      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await axios.delete(`https://employees.archenterprises.co.in/api/api/users/${encodeURIComponent(id)}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
          this.fetchUsers()
          alert('User deleted successfully!')
        } catch (error) {
          alert('Failed to delete user.')
          console.error(error)
        }
      }
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
    }
  },

async mounted() {
  this.checkIfMobile();
  window.addEventListener('resize', this.checkIfMobile);

  const token = localStorage.getItem('token');
  if (!token) {
    this.$router.push('/auth');
    return;
  }

  this.filters.date = new Date().toISOString().substr(0, 10);

  await this.fetchCurrentUser();     // 1️⃣ user
  await this.fetchTasks();           // 2️⃣ normal tasks
  await this.fetchAssignedVisits();  // 3️⃣ visit tasks
  await this.fetchAssignedServices(); // 4️⃣ ✅ service tasks

  this.fetchUsers();
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
.visit-link {
  cursor: pointer;
  text-decoration: none;
}

.visit-link:hover {
  color: #08306b;
}
.visit-service {
  background: #0a5153 !important

}

.task-assigned {
  border-left: 5px solid #ff9800;
  background: #fffaf0;
}

.logo-img {
  height: 65px;
}
.upcoming-task-popup {
  position: relative;
  overflow: hidden;
}

.popup-hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}

/* Optional: smooth fade-in for all popups */
.upcoming-task-popup {
  animation: fadeIn 0.5s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.upcoming-task-popup {
  position: fixed;
  right: 20px;
  top: 20px;
  margin-top: 10px;
  padding: 10px;
  /* box-shadow: 0 2px 10px rgb(255 0 0 / 21%); */
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 250px;
  z-index: 9999;

  /* Add animation */
  animation: zoomInOut 1s ease-in-out infinite;
}

/* Task background colors */
.upcoming-task-past {
  background-color: rgb(255, 111, 111);
}

.upcoming-task-today {
  background-color: rgb(223, 180, 100);
}

.upcoming-task-soon {
  background-color: rgb(240, 240, 122);
}

/* Keyframes for zoom in/out */
@keyframes zoomInOut {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05); /* slightly bigger */
  }
}

.upcoming-task-popup + .upcoming-task-popup {
  margin-top: 10px;
}

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

.edit-btn {
  background-color: #5f9ea0;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
  margin-left: 7px;
}

.delete-btn {
  background-color: #f44336;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* .edit-btn{
  background-color: transparent!important ;
      border: white;
    margin-left: 7%;
    cursor: pointer;
        font-size: 15px;
} */
.show-more-container {
  text-align: center;
  margin-top: 16px;
}
.show-more-btn {
  padding: 8px 16px;
  background-color: #5f9ea0;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.show-more-btn:hover {
  background-color: #426b6c;
}

@media (max-width: 768px) {
  .add-task-btn{
        width: 32%!important;
  }
  .main-content {
    flex-direction: column;
    padding: 15px;
    gap: 15px;
  }
  .task-filters {
   .task-filters {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: stretch;
    gap: 10px;
  }
  }

  .task-filters input,
  .task-filters select,
  .task-filters button {
    flex: 1 1 100%;
    width: 100%;
  }

  .task-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .add-task-btn {
    width: 100%;
  }

  .modal-content {
    width: 90%;
  }
}

@media (max-width: 480px) {

  .header img {
    height: 36px;
  }

  .header i {
    align-self: flex-end;
  }
}
.task-status-dropdown {
  width: 100%;
}

.task-filters {
  display: flex;
  /* flex-wrap: wrap; */
  width: 59%;
  gap: 10px;  
  /* background-color: #ffffff; */
  border-radius: 12px;
  /* box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08); */
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  animation: fadeIn 0.4s ease-in-out;
  transition: all 0.3s ease;
}

.task-filters input[type="date"],
.task-filters select {
  padding: 10px 14px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #ced4da;
  background-color: #f9fbff;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  flex: 1 1 180px;
}

.task-filters input[type="date"]:focus,
.task-filters select:focus {
  border-color: #5f9ea0;
  outline: none;
  box-shadow: 0 0 8px rgba(0, 123, 255, 0.2);
}

.task-filters button {
  padding: 10px 16px;
  background-color: #5f9ea0;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.task-filters button:hover {
  background-color: #426b6c;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
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
.task-container{
  padding: 0px!important;
    background: #f4f7fa00!important;
    min-height: 100vh;
    width: 100%;
    font-family: 'Segoe UI', sans-serif;
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

.task-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* .delete-btn {
  margin-left: 26px;
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: red;
} */

.task-status-dropdown {
  width: 43%;
  padding: 6px 10px;
  font-size: 14px;
  background-color: #d5d8e078;
    border-radius: 6px;
    border: 1px solid #d5d8e078;
  margin-top: 8px;
}

  .modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 30px;
  width: 400px;
  border-radius: 12px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-in-out;
}

.modal-content h3 {
  margin-bottom: 20px;
  font-size: 22px;
  text-align: center;
  color: #427172;
}

.modal-content input,
.modal-content select,
.modal-content textarea {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.modal-content input:focus,
.modal-content select:focus,
.modal-content textarea:focus {
  border-color: #4caf50;
  outline: none;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.modal-actions button {
  padding: 10px 16px;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.modal-actions button[type="submit"] {
  background-color: #5f9ea0;
  color: white;
}

.modal-actions button[type="submit"]:hover {
  background-color: #41787a;
}

.modal-actions button[type="button"] {
  background-color: #e0e0e0;
  color: #427172;
}

.modal-actions button[type="button"]:hover {
  background-color: #d5d5d5;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Add task button */
.add-task-btn {
  background-color: #5f9ea0;
  color: white;
  padding: 11px 13px;
  margin-bottom: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.add-task-btn:hover {
  background-color: #41787a;
}

/* Modal styling */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  padding: 20px;
  width: 400px;
  border-radius: 8px;
}
.modal-content input,
.modal-content select,
.modal-content textarea {
  width: 100%;
  margin: 8px 0;
  padding: 8px;
  box-sizing: border-box;
}
.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}
.modal-actions button {
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}
.modal-actions button:first-child {
  background-color: #5f9ea0;
  color: white;
}
.modal-actions button:last-child {
  background-color: #ccc;
}


.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-container {
  padding: 30px;
  background: #f4f7fa;
  min-height: 100vh;
  border-radius: 17px;
  width: 100%;
  font-family: 'Segoe UI', sans-serif;
}
.heading {
  text-align: center;
  margin-bottom: 30px;
  font-size: 26px;
  font-weight: bold;
  color: #427172;
}
.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 38px;
}
.task-card {
  background-color: #fff;
  border-radius: 16px;
  padding: 20px;
  width: 92%;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.07);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-left: 6px solid transparent;
}
.task-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}
.task-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}
.task-title {
  font-size: 18px;
  font-weight: 600;
  color: #427172;
  margin-bottom: 8px;
}
.task-status {
  font-size: 14px;
  font-weight: 500;
  color: #555;
}
.task-priority {
      padding: 2px 10px;
    border-radius: 5px;
    font-size: 12px;
    background-color: cadetblue;
    font-weight: 700;
    color: #ffffff;
}
.task-priority.low {
  background-color: #2c8487;
}
.task-priority.medium {
  background-color: #2c8487;
}
.task-priority.high {
  background-color: #2c8487;
}

/* Status Color Borders */
.task-card.in-progress {
  border-left-color: #2196f3;
}
.task-card.pending {
  border-left-color: #ff9800;
}
.task-card.completed {
  border-left-color: #4caf50;
}
.password-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-wrapper input {
  flex: 1;
}

.toggle-btn,
.generate-btn {
  padding: 6px 10px;
  background-color: #5f9ea0;
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
  background-color: #426b6c;
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
 .layout{
        background: #ffffff!important;
  }
    .layout {
  display: flex;
}

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
  background-color: white;
  padding: 30px 40px;
  border-radius: 15px;
  box-shadow: 0 5px 30px rgba(0,0,0,0.08);
  overflow-x: auto;
}

h2 {
  margin-bottom: 30px;
  color: #417475;
  font-weight: 700;
  font-size: 21px;
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
  font-size: 0.9rem;
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
  background-color: #2e5758;
  border: none;
  color: white;
}

.btn-primary.attractive-btn:hover {
  background-color: #021f4a;
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
  justify-content: space-between;
  padding: 12px 35px;
}

.logo-img {
  height: 65px;
}

.header-title {
  flex: 1;
  text-align: right;
  color: white;
  margin: 0;
  font-size: 1.3rem;
}

.mobile-menu-icon {
  font-size: 22px;
  color: white;
  cursor: pointer;
}
@media (max-width: 768px) {
 
.header-title {
  text-align: center;
}
}
</style>
