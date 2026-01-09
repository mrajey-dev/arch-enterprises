

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
  <div class="modal-backdrop" v-if="showKRAModal" @click.self="closeKRAModal()">
    <div class="modal-card" @click.stop>
      <h2 class="modal-title">
        {{ getModalTitle }}
      </h2>

     
    <div v-if="isEditMode || addKRAModalStep === 1" class="kra-step">

  <label class="kra-title">
    <i class="fas fa-bullseye"></i> KRA Name *
  </label>
  <input
    v-model="kraForm.name"
    type="text"
    class="kra-input"
    placeholder="Enter your Key Responsibility Area"
    required
    :class="{ 'input-error': kraNameError }"
  />
  <p v-if="kraNameError" class="error-message">{{ kraNameError }}</p>
</div>


    <div v-if="isEditMode || addKRAModalStep === 2" class="task-step">
  <label class="task-title">
    <i class="fas fa-tasks"></i>
    Define Tasks for KRA
  </label>

  <!-- Input List -->
  <div
    v-for="(task, index) in kraForm.tasks"
    :key="index"
    class="task-input-wrapper"
  >
    <input
      v-model="kraForm.tasks[index]"
      type="text"
      :placeholder="`Task ${index + 1}`"
      class="task-input"
      :class="{ 'input-error': taskError }"
    />
    <button
      v-if="kraForm.tasks.length > 1"
      type="button"
      @click="removeTask(index)"
      class="delete-icon"
      title="Remove Task"
    >
      <i class="fas fa-trash-alt"></i>
    </button>
  </div>

  <!-- Error Message -->
  <p v-if="taskError" class="error-message">{{ taskError }}</p>

  <!-- Add Task Button -->
  <div class="kpi-step button">
    <button type="button" @click="kraForm.tasks.push('')" class="kpi-step button">
      <i class="fas fa-plus-circle"></i> Add Task
    </button>
  </div>
</div>




     <div v-if="isEditMode || addKRAModalStep === 3" class="kpi-step">
  <label class="kpi-title">
    <i class="fas fa-chart-line"></i>
    Enter KPI
  </label>

  <!-- Input + Add -->
  <div class="kpi-input-wrapper">
    <input
      v-model="newKpi"
      type="text"
      placeholder="Enter KPI name"
      :class="{ 'input-error': kpiError }"
    />
    <button @click="addKpi" type="button">Save</button>
  </div>

  <!-- Error -->
  <p v-if="kpiError" class="error-message">{{ kpiError }}</p>

  <!-- Chips -->
  <div class="kpi-chip-container">
    <div
      class="kpi-chip"
      v-for="(kpi, index) in kraForm.kpis"
      :key="index"
    >
      <i class="fas fa-trash" @click="removeKpi(index)" title="Remove KPI"></i>
      <span>{{ kpi }}</span>
    </div>
  </div>
</div>




     <div v-if="isEditMode || addKRAModalStep === 4" class="target-step">
  <label class="target-title">🎯 Target (Optional)</label>
  <input
    v-model="kraForm.target"
    type="text"
    placeholder="Enter performance target (e.g., Increase sales by 15%)"
    class="target-input"
    :class="{ 'input-error': targetError }"
  />
  <p v-if="targetError" class="error-message">{{ targetError }}</p>
</div>


<br>
      <div class="modal-buttons">
  <button
    v-if="!isEditMode && addKRAModalStep > 1"
    @click="addKRAModalStep--"
    class="btn btn-secondary"
  >
    Previous
  </button>

  <button
    v-if="!isEditMode && addKRAModalStep < 4"
    @click="validateStep"
    class="btn btn-primary"
  >
    Next
  </button>

  <button
    v-if="isEditMode || addKRAModalStep === 4"
    @click="saveKRA"
    class="btn btn-primary"
  >
    Save
  </button>

  <button @click="closeKRAModal" class="btn btn-danger">Cancel</button>
</div>

    </div>
  </div>
</transition>

<transition name="fade">
  <div class="modal-backdrop" v-if="showDepartmentForm" @click.self="closeDepartmentForm()">
    <div class="modal-card" @click.stop>
      <h2 class="modal-title">Add Department</h2>

      <form @submit.prevent="submitDepartment" class="attractive-form">
        <div class="form-row">
          <div class="input-group">
            <label><i class="fas fa-building"></i> Department Name *</label>
            <input v-model="departmentForm.name" placeholder="Enter Department Name" required />
          </div>

          <div class="input-group">
            <label><i class="fas fa-barcode"></i> Department Code *</label>
            <input v-model="departmentForm.code" placeholder="Enter Department Code" required />
          </div>
        </div>

        <div class="modal-buttons">
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i> Save Department
          </button>
          <button type="button" class="btn btn-secondary" @click="closeDepartmentForm()">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</transition>

<transition name="fade">
  <div class="modal-backdrop" v-if="showKRAsModal" @click.self="showKRAsModal = false">
    
    <div class="modal-card" @click.stop>
      <h2 class="modal-title">KRA for {{ selectedDepartmentName }}</h2>

      <div v-if="selectedDepartmentKRAs.length">
  <ul class="kra-list">
    <li v-for="(kra, index) in selectedDepartmentKRAs" :key="kra.id" class="kra-item">
      <h3
  class="kra-title-toggle"
  @click="toggleKRA(index)"
  :class="{ expanded: expandedKRAIndex === index }"
>
  {{ kra.name }}

  <!-- Action Buttons Wrapper -->
  <div class="kra-actions">
    <!-- Edit KRA Button -->
    <button
      class="btn-edit btn-sm btn-warning"
      @click.stop="editKRA(kra)"
    >
      <i class="fas fa-edit"></i>
    </button>

    <!-- Delete KRA Button -->
   <button
      class="btn-delete btn-sm btn-danger"
      @click.stop="deleteKRA(kra.id)"
    >
      <i class="fas fa-trash"></i>
    </button>

  </div>
</h3>





      <transition name="expand-fade">
  <div v-if="expandedKRAIndex === index" class="kra-details">
<!-- Tasks List -->
<div>
  <strong>Tasks:</strong>
  <ul v-if="kra.tasks && kra.tasks.length" class="nested-list">
    <li v-for="(task, tIndex) in kra.tasks" :key="tIndex">{{ task }}</li>
  </ul>
  <p v-else>N/A</p>
</div>

<!-- KPIs List -->
<div style="margin-top: 10px;">
  <strong>KPI:</strong>
  <ul v-if="kra.kpis && kra.kpis.length" class="nested-list">
    <li v-for="(kpi, kIndex) in kra.kpis" :key="kIndex"> {{ kpi }}</li>
  </ul>
  <p v-else>N/A</p>
</div>

    <p><strong>Target:</strong> {{ kra.target || 'N/A' }}</p>
  </div>
</transition>

    </li>
  </ul>
</div>

      <div v-else>
        <p>No KRAs available for this department.</p>
      </div>

      <div class="modal-buttons">
        <button @click="showKRAsModal = false" class="btn btn-danger">Close</button>
      </div>
    </div>
  </div>
</transition>




    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

 <section class="content" :class="{
  'expanded-content': isMobile && !visible,
  'hide-on-mobile': isMobile && visible
}">


  <h2>Manage Departments & KRA</h2>
  <button class="logout-btn" @click="showDepartmentForm = true">Add Department</button>
  <table class="styled-table user-table">
  <thead>
    <tr>
      <th>Department Name</th>
      <th>Department Code</th>
      <th>Action</th>
    </tr>
  </thead>

  <tbody>
    <tr v-for="dept in departments" :key="dept.id">
      <td @click="viewDepartmentKRAs(dept)" class="clickable-name">
        {{ dept.name }}
      </td>
      <td>{{ dept.code }}</td>

      <td>
        <div class="action-buttons">
         <button
  class="btn-add tooltip-btn"
  data-tooltip="Add KRA"
  @click="addKRA(dept)"
>
  <i class="fas fa-plus-circle"></i>
</button>


       <button
  class="btn-delete tooltip-btn"
  data-tooltip="Delete Department"
  @click="deleteDepartment(dept.id)"
>
  <i class="fas fa-trash"></i>
</button>


        </div>
      </td>
    </tr>
  </tbody>
</table>

</section>

    </div>

   
  </div>
</template>

<script>
import axios from 'axios';
import Sidebar from '../components/Sidebar.vue';

export default {
  components: {
    Sidebar
  },
  data() {
    return {
     existingKRAs: [],
      isMobile: false,
isSidebarVisible: true,

      kpiError: '',
targetError: '',
      taskError: '',
      kraNameError: '',
      expandedKRAIndex: null,
      showKRAsModal: false,
selectedDepartmentKRAs: [],
selectedDepartmentName: '',
      kraForm: {
  id: null,
  department_id: null,
  name: '',
  tasks: [''],
  kpis: [],
  target: ''
},
kraNameError: "",
      newKpi: '',
      showKRAModal: false,
      addKRAModalStep: 1,
      availableKpis: ['Quality', 'Efficiency', 'Punctuality'],
      departments: [],
      showDepartmentForm: false,
      isEditMode: false,
      departmentForm: {
        id: null,
        name: '',
        code: ''
      }
    };
  },
  created() {
    this.fetchDepartments();
  },
  computed: {
    getModalTitle() {
    const base = this.isEditMode ? 'Edit KRA' : 'Add KRA';
    switch (this.addKRAModalStep) {
      case 1: return `${base}`;
      case 2: return `${base}`;
      case 3: return `${base}`;
      case 4: return `${base}`;
      default: return base;
    }
  }
  },
  mounted() {
    this.checkIfMobile();
window.addEventListener('resize', this.checkIfMobile);

  },
  methods: {
    async deleteKRA(kraId) {
  if (!confirm("Are you sure you want to delete this KRA?")) return;

  try {
    await axios.delete(`/api/kras/${kraId}`);
    this.selectedDepartmentKRAs = this.selectedDepartmentKRAs.filter(
      kra => kra.id !== kraId
    );
    alert("KRA deleted successfully!");
  } catch (error) {
    console.error(error);
    alert("Unable to delete KRA. Please try again.");
  }
},

    editKRA(kra) {
  this.resetForm(); // Reset the form first
  this.isEditMode = true;

  // Close current modal (KRAs list)
  this.showKRAsModal = false;

  // Small delay to ensure modal transition completes before opening another
  setTimeout(() => {
    this.kraForm = {
      id: kra.id,
      department_id: kra.department_id,
      name: kra.name,
      tasks: kra.tasks && kra.tasks.length ? [...kra.tasks] : [''],
      kpis: kra.kpis && kra.kpis.length ? [...kra.kpis] : [],
      target: kra.target || ''
    };
    this.addKRAModalStep = 1;
    this.showKRAModal = true;
  }, 300); // 300ms delay for smoother UX
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
validateStep() {
  // Step 1: KRA Name
  if (this.addKRAModalStep === 1) {

    if (!this.kraForm.name.trim()) {
      this.kraNameError = 'KRA Name is required.';
      return;
    }

    // 🔍 DUPLICATE CHECK (Only in Add mode)
    if (!this.isEditMode) {
      const isDuplicate = this.existingKRAs.some(kra =>
        kra.name.toLowerCase() === this.kraForm.name.trim().toLowerCase()
      );

      if (isDuplicate) {
        this.kraNameError = 'This KRA name already exists.';
        return;
      }
    }

    this.kraNameError = '';
  }

  // Step 2: Tasks
  if (this.addKRAModalStep === 2) {
    const hasEmpty = this.kraForm.tasks.some(task => !task.trim());
    if (hasEmpty) {
      this.taskError = 'All tasks must be filled.';
      return;
    } else {
      this.taskError = '';
    }
  }

  // Step 3: KPIs
  if (this.addKRAModalStep === 3) {
    if (this.kraForm.kpis.length === 0) {
      this.kpiError = 'At least one KPI must be added.';
      return;
    } else {
      this.kpiError = '';
    }
  }

  // Step 4: Target
  if (this.addKRAModalStep === 4) {
    if (this.kraForm.target.trim()) { // Optional field logic (your original)
      this.targetError = 'Target is required.';
      return;
    } else {
      this.targetError = '';
    }
  }

  this.addKRAModalStep++;
},



    toggleKRA(index) {
  this.expandedKRAIndex = this.expandedKRAIndex === index ? null : index;
},
    async viewDepartmentKRAs(dept) {
  this.selectedDepartmentName = dept.name;
  try {
    const response = await axios.get(`https://employees.archenterprises.co.in/api/api/kras/${dept.id}`);
    this.selectedDepartmentKRAs = response.data.data; // Adjust based on actual response
    this.showKRAsModal = true;
  } catch (error) {
    console.error('Failed to load KRAs:', error);
    alert('Unable to load KRAs for this department.');
  }
},

saveKRA() {
  // 🔍 DUPLICATE CHECK
  const isDuplicate = this.existingKRAs.some(kra =>
    kra.name.toLowerCase() === this.kraForm.name.trim().toLowerCase() &&
    (!this.isEditMode || kra.id !== this.kraForm.id) // allow same name for the record being edited
  );

  if (isDuplicate) {
    this.kraNameError = "This KRA name already exists.";
    this.addKRAModalStep = 1; // jump user back to KRA name step
    return;
  }

  this.kraNameError = "";

  const payload = {
    department_id: this.kraForm.department_id,
    name: this.kraForm.name,
    tasks: this.kraForm.tasks,
    kpis: this.kraForm.kpis,
    target: this.kraForm.target
  };

  const request = this.isEditMode
    ? axios.put(`https://employees.archenterprises.co.in/api/api/kras/${this.kraForm.id}`, payload)
    : axios.post('https://employees.archenterprises.co.in/api/api/kras', payload);

  request.then(response => {
    alert(`KRA ${this.isEditMode ? 'updated' : 'saved'} successfully!`);
    this.resetForm();
    this.closeKRAModal();
    this.fetchDepartments(); // refresh department data
  }).catch(error => {
    console.error('Save error:', error);
    alert('Duplicate Entry of KRA Name.');
  });
},


    resetForm() {
  this.kraForm = {
    id: null,
    department_id: null,
    name: '',
    tasks: [''],
    kpis: [],
    target: ''
  };
  this.newKpi = '';
  this.isEditMode = false;
},


    addKpi() {
      const trimmed = this.newKpi.trim();
      if (trimmed && !this.kraForm.kpis.includes(trimmed)) {
        this.kraForm.kpis.push(trimmed);
      }
      this.newKpi = '';
    },

    removeKpi(index) {
      this.kraForm.kpis.splice(index, 1);
    },

    removeTask(index) {
      this.kraForm.tasks.splice(index, 1);
    },

    addKRA(dept) {
      this.kraForm = {
        department_id: dept.id,
        name: '',
        tasks: [''],
        kpis: [],
        target: ''
      };
      this.addKRAModalStep = 1;
      this.showKRAModal = true;
    },

   closeKRAModal() {
  this.resetForm();
  this.showKRAModal = false;
  this.isEditMode = false;
},


    async deleteDepartment(id) {
      if (confirm('Are you sure you want to delete this department?')) {
        try {
          await axios.delete(`https://employees.archenterprises.co.in/api/api/departments/${id}`);
          this.fetchDepartments();
        } catch (error) {
          console.error('Error deleting department:', error);
        }
      }
    },

    async fetchDepartments() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/departments');
        this.departments = response.data.data;
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    },

    editDepartment(dept) {
      this.departmentForm = { ...dept };
      this.showDepartmentForm = true;
    },

    async submitDepartment() {
      try {
        const response = await axios.post('https://employees.archenterprises.co.in/api/api/departments', this.departmentForm);
        alert('Department saved successfully!');
        this.closeDepartmentForm();
        this.fetchDepartments();
      } catch (error) {
        console.error('Failed to save department:', error);
        alert('Something went wrong while saving the department.');
      }
    },

    closeDepartmentForm() {
      this.departmentForm = { name: '', code: '', id: null };
      this.showDepartmentForm = false;
      this.isEditMode = false;
    },

    logout() {
      const token = localStorage.getItem('token');
      axios.post('https://employees.archenterprises.co.in/api/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).finally(() => {
        localStorage.removeItem('token');
        this.$router.push('/auth');
      });
    }
  }
};
</script>





<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

.tooltip-btn {
  position: relative;
}

.tooltip-btn::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 130%;
  left: 50%;
  transform: translateX(-50%);
  background: #222;
  color: #fff;
  padding: 6px 10px;
  font-size: 12px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: 0.2s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
}

.tooltip-btn::before {
  content: "";
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #222;
  opacity: 0;
  transition: 0.2s ease;
}

.tooltip-btn:hover::after,
.tooltip-btn:hover::before {
  opacity: 1;
}

/* Table Wrapper */
.styled-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  font-family: 'Poppins', sans-serif;
}

/* Header Style */
.styled-table thead tr {
  /* background: #1b3f44; */
  color: #ffffff;
  text-align: center;
  font-weight: bold;
}

.styled-table th {
  padding: 14px;
  border-radius: 8px;
  font-size: 15px;
}

/* Table Row */
.styled-table tbody tr {
  background: #ffffff;
  transition: all 0.3s ease;
  border-radius: 10px;
  box-shadow: 0px 4px 12px rgba(0,0,0,0.05);
}

.styled-table tbody tr:hover {
  transform: scale(1.02);
  box-shadow: 0px 6px 18px rgba(0,0,0,0.12);
}

/* Table Data Cell */
.styled-table td {
  padding: 12px;
  font-size: 14px;
  color: #333;
  text-align: center;
}

/* Clickable department name */
.clickable-name {
  cursor: pointer;
  color: #2a8c82;
  font-weight: 600;
}

.clickable-name:hover {
  color: #116e6d;
  text-decoration: underline;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.btn-add, .btn-delete {
  border: none;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s ease;
}

.btn-add {
  background: #1f9e75;
  color: #fff;
}

.btn-add:hover {
  background: #147a5b;
  transform: translateY(-2px);
}

.btn-delete {
  background: #d9534f;
  color: #fff;
}

.btn-delete:hover {
  background: #b52a27;
  transform: translateY(-2px);
}

/* Responsive */
@media(max-width: 768px) {
  .styled-table th, .styled-table td {
    font-size: 12px;
    padding: 8px;
  }
}

.kra-actions {
  display: inline-flex;
  gap: 6px;
  margin-left: 10px;
}

.btn-delete {
 background: #ff0013;
    color: white;
    border: none;
    padding: 5px 8px;
    cursor: pointer;
    border-radius: 3px;
}

.btn-edit {
  padding: 4px 6px;
  border-radius: 4px;
}

.logo-img {
  height: 70px;
}
.company-name {
font-size: 21px;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, .3);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}
.btn-edit{
  background-color: #009cff !important;
    color: white;
        cursor: pointer;
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
.layout{
    align-self: anchor-center;

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

.input-error {
  border-color: red;
}

.error-message {
  color: red;
  font-size: 0.875rem;
  margin-top: 4px;
}


.nested-list {
  padding-left: 1.5rem;
  list-style-type: disc;     /* Use disc for dark round bullets */
  color: #2e5758;                /* Optional: darken text color */
}

.nested-list li {
  margin-bottom: 5px;         /* Optional: spacing between list items */
  /* font-family: 'Roboto', 'Arial', sans-serif; */
  font-size: 13px;
}

.expand-fade-enter-active,
.expand-fade-leave-active {
  transition: all 1.3s ease;
  overflow: hidden;
}

.expand-fade-enter-from,
.expand-fade-leave-to {
  opacity: 0;
  max-height: 0;
  padding: 0;
  margin: 0;
}

.expand-fade-enter-to,
.expand-fade-leave-from {
  opacity: 1;
  max-height: 500px; /* Large enough to accommodate content */
  padding: 10px 15px;
  margin-bottom: 10px;
}

.kra-title-toggle {
  cursor: pointer;
  background: #e9ecef;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 5px;
  transition: background 0.3s;
}
.kra-title-toggle:hover {
  background: #dee2e6;
}
.kra-details {
  padding: 10px 15px;
  background: #f8f9fa;
  border-left: 3px solid #007bff;
  margin-bottom: 10px;
  border-radius: 5px;
}
.expanded {
  font-weight: bold;
}

.kra-list {
  padding: 0;
  list-style-type: none;
}
.kra-item {
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 10px;
}
.kra-item h3 {
  margin: 0 0 8px;
}

.kpi-step {
  padding: 1rem;
  background-color: #fff;
  border-radius: 1rem;
}

.kpi-step h2 {
  font-size: 1.75rem;
  font-weight: bold;
  color: #1f2937; /* gray-800 */
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.kpi-step .kpi-input-wrapper {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.kpi-step input[type="text"] {
  flex-grow: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #86efac; /* green-300 */
  border-radius: 9999px;
  font-size: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: border 0.2s, box-shadow 0.2s;
}

.kpi-step input[type="text"]:focus {
  outline: none;
  border-color: #10b981; /* green-500 */
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
}

.kpi-step button {
  background-color: #10b981;
  color: white;
  font-weight: 600;
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.kpi-step button:hover {
  background-color: #059669; /* green-600 */
  transform: scale(1.03);
}

.kpi-chip-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.kpi-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #d1fae5; /* green-100 */
  color: #1f2937; /* gray-800 */
  padding: 0.35rem 0.75rem;
  /* border-radius: 9999px; */
  font-size: 0.875rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s;
}

.kpi-chip:hover {
  background-color: #bbf7d0; /* green-200 */
}

.kpi-chip i {
  font-size: 0.85rem;
  color: #ef4444; /* red-500 */
  cursor: pointer;
  transition: color 0.2s;
}

.kpi-chip i:hover {
  color: #b91c1c; /* red-700 */
}

.kra-step {
  margin-top: 20px;
}

.kra-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1f2937;
  display: block;
  margin-bottom: 20px;
}

.kra-title i {
  color: #2563eb; /* blue tone */
  margin-right: 10px;
}

.kra-input {
  width: 100%;
  padding: 14px 20px;
  font-size: 1rem;
  border: 1px solid #93c5fd;
  border-radius: 12px;
  background-color: #fff;
  color: #1f2937;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: border 0.3s, box-shadow 0.3s;
}

.kra-input::placeholder {
  color: #9ca3af;
}

.kra-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.target-step {
  margin-top: 20px;
}

.target-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #427172;
  display: block;
  margin-bottom: 20px;
}

.target-input {
  width: 100%;
  padding: 14px 20px;
  font-size: 1rem;
  border: 1px solid #a5b4fc;
  border-radius: 12px;
  background-color: #fff;
  color: #1f2937;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: border 0.3s, box-shadow 0.3s;
}

.target-input::placeholder {
  color: #9ca3af;
}

.target-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.kpi-step {
  margin-top: 20px;
}

.kpi-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #427172;
  display: block;
  margin-bottom: 20px;
}

.kpi-title i {
  color: #10b981; /* green tone for variety */
  margin-right: 10px;
}

.kpi-checkbox-wrapper {
  margin-bottom: 16px;
  background-color: #f9f9ff;
  padding: 14px 18px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: 0.3s ease;
}

.kpi-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
  cursor: pointer;
}

.kpi-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #10b981; /* green highlight */
  cursor: pointer;
}

.task-step {
  margin-top: 20px;
}

.task-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #427172;
  display: block;
  margin-bottom: 20px;
}

.task-title i {
  color: #a855f7;
  margin-right: 10px;
}

.task-input-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 20px;
}

.task-input {
  width: 100%;
  padding: 14px 20px 14px 18px;
  padding-right: 45px;
  font-size: 1rem;
  border: 1px solid #d8b4fe;
  border-radius: 12px;
  background-color: #fff;
  color: #427172;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.task-input:focus {
  outline: none;
  border-color: #a855f7;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
}

.delete-icon {
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  color: #44b6ef;
  font-size: 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
}

.delete-icon:hover {
  color: #dc2626;
  transform: translateY(-50%) scale(1.15);
}

.add-task-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(236, 72, 153, 0.3);
}

.kra-step label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 5px;
  display: block;
}

.kra-step input {
  width: 100%;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid #60a5fa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: border 0.3s ease, box-shadow 0.3s ease;
}

.kra-step input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.modal-backdrop {
  pointer-events: auto;
  position: fixed;
  z-index: 999;
  background: rgba(0, 0, 0, 0.5);
}
body.modal-open {
  overflow: hidden;
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
  /* box-shadow: 0 5px 30px rgba(0,0,0,0.08); */
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
  text-align: left;
  font-size: 16px;
 
}

.user-table th {
  padding: 11px 20px;
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
  text-transform: uppercase;
  font-size: 28px;
    /* font-weight: 800; */
    text-align: center;
    margin-bottom: 35px;
    color: #041f3d;
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
      background-color: #000000;
    color: white;
  
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
  padding: 10px 20px;

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

</style>
