

<template>
  <div class="layout">
    <!-- Header -->
         <header class="header">
       <a href="https://employees.archenterprises.co.in/">
  <img src="https://archenterprises.co.in/ajay/ajay.png" style="height: 65px;" alt="Logo">
</a>

      🅰️RCH360⚙️
      <i class="fas fa-bars mobile-menu-icon" @click="toggleSidebar" v-if="isMobile"></i>
    </header>


<transition name="fade">
  <div class="modal-backdrop" v-if="showLeaveTypeForm" @click.self="closeLeaveTypeForm()">
    <div class="modal-card" @click.stop>
      <h2 class="modal-title">Add Leave Type</h2>

      <form @submit.prevent="submitLeaveType" class="attractive-form">
        <div class="form-row">
          <div class="input-group">
  <label><i class="fas fa-heading"></i> Leave Name *</label>
  <input
  v-model="leaveForm.leaveName"
  maxlength="20"
  required
  @input="allowOnlyText('leaveName')"
/>

</div>


         <div class="input-group">
  <label><i class="fas fa-code"></i> Total Leaves *</label>
  <input
    type="number"
    min="0"
    v-model="leaveForm.totalLeaves"
    placeholder="Enter Total Leaves"
    required
  />
</div>

        </div>

        <div class="form-row">
          <div class="input-group full-width">
  <label><i class="fas fa-align-left"></i> Description</label>
   <textarea
      v-model="leaveForm.description"
      placeholder="Enter Description (optional)"
      rows="4"
      maxlength="50"
      @input="allowOnlyText('description')"
    ></textarea>
</div>

        </div>

        <div class="modal-buttons">
          <button type="submit" class="btn btn-primary" :disabled="isSaving">
  <i v-if="!isSaving" class="fas fa-save"></i>
  <i v-else class="fas fa-spinner fa-spin"></i>
  {{ isSaving ? 'Saving...' : 'Save Leave Type' }}
</button>

          <button type="button" class="btn btn-secondary" @click="closeLeaveTypeForm()">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</transition>

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

   <section
  class="content"
  :class="{
    'expanded-content': isMobile && !isSidebarVisible,
    'hide-on-mobile': isMobile && isSidebarVisible
  }"
>

  <h2>Manage Leave Type</h2>
   <button class="logout-btn" @click="startNewLeaveType()">Add Leave Type</button>
 <table class="leave-table">
  <thead>
    <tr>
      <th>Leave Type</th>
      <th>Description</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="type in leaveTypes" :key="type.id">
      <td>{{ type.leave_name }}</td>
      <td>{{ type.description }}</td>
      <td>
        <div class="action-buttons">
         <button class="btn-edit"
        :disabled="editingId === type.id"
        @click="editLeaveType(type)">
  <i v-if="editingId !== type.id" class="fas fa-edit"></i>
  <i v-else class="fas fa-spinner fa-spin"></i>
  {{ editingId === type.id ? 'Opening...' : 'Edit' }}
</button>

          <button class="btn-delete"
        :disabled="deletingId === type.id"
        @click="deleteLeaveType(type.id)">
  <i v-if="deletingId !== type.id" class="fas fa-trash-alt"></i>
  <i v-else class="fas fa-spinner fa-spin"></i>
  {{ deletingId === type.id ? 'Deleting...' : 'Delete' }}
</button>

        </div>
      </td>
    </tr>
  </tbody>
</table>

</section>

    </div>

    <!-- <footer class="footer">
      &copy; 2025 Arch Enterprises. All rights reserved.
    </footer> -->
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
      isMobile: false,
isSidebarVisible: true,

      leaveTypes: [],
       editingLeaveId: null,
      showLeaveTypeForm: false,
      // 🔹 loaders
    isSaving: false,
    deletingId: null,
    editingId: null,
    leaveForm: {
      leaveName: '',
     totalLeaves: '',
      description: ''
    },
  }
  },
  methods: {
   allowOnlyText(field) {
  if (!this.leaveForm[field]) return;

  this.leaveForm[field] = this.leaveForm[field].replace(/[^a-zA-Z\s]/g, '');
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
    startNewLeaveType() {
  this.leaveForm = {
    leaveName: '',
    totalLeaves: '',
    description: ''
  };
  this.editingLeaveId = null;
  this.showLeaveTypeForm = true;
},

    async fetchLeaveTypes() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/leave-types');
        this.leaveTypes = response.data;
      } catch (error) {
        console.error("Error fetching leave types:", error);
      }
    },
async submitLeaveType() {
  this.isSaving = true
  try {
    if (this.editingLeaveId) {
      await axios.put(
        `https://employees.archenterprises.co.in/api/api/leave-types/${this.editingLeaveId}`,
        {
          leave_name: this.leaveForm.leaveName,
          total_leaves: this.leaveForm.totalLeaves,
          description: this.leaveForm.description
        }
      )
      alert('Leave type updated successfully!')
    } else {
      await axios.post(
        'https://employees.archenterprises.co.in/api/api/leave-types',
        {
          leave_name: this.leaveForm.leaveName,
          total_leaves: this.leaveForm.totalLeaves,
          description: this.leaveForm.description
        }
      )
      alert('Leave type created successfully!')
    }

    this.fetchLeaveTypes()
    this.closeLeaveTypeForm()
  } catch (error) {
    if (error.response?.status === 422) {
      const errors = error.response.data.errors
      alert(
        errors.leave_name?.[0] ||
        errors.total_leaves?.[0] ||
        'Validation error'
      )
    } else {
      alert('Server error')
    }
  } finally {
    this.isSaving = false
  }
},


  closeLeaveTypeForm() {
    this.showLeaveTypeForm = false;
    this.leaveForm = {
      leaveName: '',
      totalLeaves: '',
      description: ''
    };
  },
 async deleteLeaveType(id) {
  if (!confirm('Are you sure you want to delete this leave type?')) return

  this.deletingId = id
  try {
    await axios.delete(
      `https://employees.archenterprises.co.in/api/api/leave-types/${id}`
    )
    this.fetchLeaveTypes()
    alert('Leave type deleted!')
  } catch (error) {
    alert('This leave type is already used and cannot be deleted.')
  } finally {
    this.deletingId = null
  }
},

  editLeaveType(type) {
  this.editingId = type.id

  setTimeout(() => {
    this.leaveForm.leaveName = type.leave_name
    this.leaveForm.totalLeaves = type.total_leaves
    this.leaveForm.description = type.description
    this.editingLeaveId = type.id
    this.showLeaveTypeForm = true
    this.editingId = null
  }, 300) // small UX delay
},

   
       closeLeaveTypeForm() {
  this.showLeaveTypeForm = false
  this.leaveForm = {
    leaveName: '',
    totalLeaves: '',
    description: ''
  }
  this.editingLeaveId = null

    
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
    }
  },

 mounted() {
  this.checkIfMobile();
window.addEventListener('resize', this.checkIfMobile);

  const token = localStorage.getItem('token')
  if (!token) {
    this.$router.push('/auth')
  } else {
    this.fetchLeaveTypes()
  }
}

}
</script>




<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

.leave-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 6px 9px;
  font-family: "Poppins", sans-serif;
}

.leave-table thead th {
  background: #5f9ea0;
  color: white;
  text-transform: uppercase;
  padding: 12px;
  font-size: 14px;
  text-align: left;
      border-top-left-radius: 13px;
    border-top-right-radius: 13px;
}

.leave-table tbody tr {
  background: #ffffff;
  box-shadow: 0 3px 10px rgba(0,0,0,0.08);
  border-radius: 10px;
}

.leave-table tbody td {
  padding: 14px;
  font-size: 15px;
  color: #222;
}

.leave-table tbody tr:hover {
  transform: scale(1.01);
  background: #f3f6ff;
  transition: 0.2s ease-in-out;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn-edit,
.btn-delete {
  border: none;
 padding: 6px 10px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-edit {
  background: #2563eb;
  color: #fff;
}

.btn-edit:hover {
  background: #1e40af;
}

.btn-delete {
  background: #e63946;
  color: #fff;
}

.btn-delete:hover {
  background: #9b2226;
}

.logo-img {
  height: 70px;
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
.hide-on-mobile {
    display: none !important;
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
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #427778;
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
 background-color: cadetblue; 
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

.menu-btn {
  background-color: #28a745;
  color: white;
  margin-right: 15px;
}

.menu-btn:hover {
  background-color: #218838;
}


.logout-btn {
   background-color: #407173;
    color: #ffffff;
    margin-bottom: 22px;
}

.logout-btn:hover {
 background-color: #1f3b3c;
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
  background-color: #f0f2f8;
  padding: 30px 40px;
  border-radius: 15px;
  /* box-shadow: 0 5px 30px rgba(255, 255, 255, 0.08); */
  overflow-x: auto;
}

h2 {
  margin-bottom: 30px;
  color: #417475;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 21px;
  border-bottom: 2px solid #5f9ea0;
  padding-bottom: 8px;
}

/* User Table */
.user-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 6px 9px;
}

.user-table th,
.user-table td {
  padding: 14px 20px;
  text-align: left;
  font-size: 16px;
 
}

.user-table th {
  background-color: #5f9ea0;
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
  width: 88%;
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
            padding: 49px 23px;
        margin-left: -19px;
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
  width: 0;
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
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}


</style>
