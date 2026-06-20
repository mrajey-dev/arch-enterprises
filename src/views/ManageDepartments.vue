<template>
  <div class="layout">

    <!-- KRA Modal - Premium Design -->
    <transition name="modal-fade">
      <div class="modal-backdrop" v-if="showKRAModal" @click.self="closeKRAModal()">
        <div class="premium-modal" :class="{ 'mobile-modal': isMobile }" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium">
              <i class="fas fa-tasks"></i>
            </div>
            <div class="header-text">
              <h2>{{ getModalTitle }}</h2>
              <p>{{ isEditMode ? 'Update KRA information' : 'Create a new Key Responsibility Area' }}</p>
            </div>
            <button class="close-btn-premium" @click="closeKRAModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body-premium">
            <!-- Step 1: KRA Name -->
            <div v-if="isEditMode || addKRAModalStep === 1" class="form-section">
              <div class="section-title">
                <i class="fas fa-bullseye"></i>
                <span>KRA Name</span>
              </div>
              <div class="form-field">
                <div class="field-wrapper">
                  <i class="fas fa-tag field-icon"></i>
                  <input
                    v-model="kraForm.name"
                    type="text"
                    placeholder="Enter Key Responsibility Area name"
                    :class="{ 'error': kraNameError }"
                  />
                </div>
                <span v-if="kraNameError" class="field-error">
                  <i class="fas fa-exclamation-circle"></i> {{ kraNameError }}
                </span>
              </div>
            </div>

            <!-- Step 2: Tasks -->
            <div v-if="isEditMode || addKRAModalStep === 2" class="form-section">
              <div class="section-title">
                <i class="fas fa-list-check"></i>
                <span>Define Tasks</span>
              </div>
              <div class="tasks-container">
                <div v-for="(task, index) in kraForm.tasks" :key="index" class="task-item">
                  <div class="field-wrapper">
                    <i class="fas fa-check-circle field-icon"></i>
                    <input
                      v-model="kraForm.tasks[index]"
                      type="text"
                      :placeholder="`Task ${index + 1}`"
                      :class="{ 'error': taskError }"
                    />
                  </div>
                  <button v-if="kraForm.tasks.length > 1" type="button" @click="removeTask(index)" class="remove-task-btn">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
                <span v-if="taskError" class="field-error">
                  <i class="fas fa-exclamation-circle"></i> {{ taskError }}
                </span>
                <button type="button" @click="kraForm.tasks.push('')" class="add-btn">
                  <i class="fas fa-plus-circle"></i> Add Task
                </button>
              </div>
            </div>

            <!-- Step 3: KPIs -->
            <div v-if="isEditMode || addKRAModalStep === 3" class="form-section">
              <div class="section-title">
                <i class="fas fa-chart-line"></i>
                <span>Key Performance Indicators</span>
              </div>
              <div class="kpi-container">
                <div class="kpi-input-group">
                  <div class="field-wrapper">
                    <i class="fas fa-plus-circle field-icon"></i>
                    <input
                      v-model="newKpi"
                      type="text"
                      placeholder="Enter KPI name"
                      @keyup.enter="addKpi"
                    />
                  </div>
                  <button @click="addKpi" class="add-kpi-btn">
                    <i class="fas fa-save"></i> <span class="btn-text">Add KPI</span>
                  </button>
                </div>
                <span v-if="kpiError" class="field-error">
                  <i class="fas fa-exclamation-circle"></i> {{ kpiError }}
                </span>
                <div class="kpi-chips">
                  <div v-for="(kpi, index) in kraForm.kpis" :key="index" class="kpi-chip">
                    <span>{{ kpi }}</span>
                    <i class="fas fa-times" @click="removeKpi(index)"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 4: Target -->
            <div v-if="isEditMode || addKRAModalStep === 4" class="form-section">
              <div class="section-title">
                <i class="fas fa-bullseye"></i>
                <span>Target (Optional)</span>
              </div>
              <div class="form-field">
                <div class="field-wrapper">
                  <i class="fas fa-flag-checkered field-icon"></i>
                  <input
                    v-model="kraForm.target"
                    type="text"
                    placeholder="e.g., Increase sales by 15%, Complete 10 projects, etc."
                    :class="{ 'error': targetError }"
                  />
                </div>
                <span v-if="targetError" class="field-error">
                  <i class="fas fa-exclamation-circle"></i> {{ targetError }}
                </span>
              </div>
            </div>
          </div>

          <div class="modal-footer-premium" :class="{ 'mobile-footer': isMobile }">
            <button v-if="!isEditMode && addKRAModalStep > 1" type="button" class="btn-cancel-premium" @click="addKRAModalStep--">
              <i class="fas fa-arrow-left"></i> Previous
            </button>
            <button v-if="!isEditMode && addKRAModalStep < 4" type="button" class="btn-submit-premium" @click="validateStep">
              Next <i class="fas fa-arrow-right"></i>
            </button>
            <button v-if="isEditMode || addKRAModalStep === 4" type="button" class="btn-submit-premium" @click="saveKRA">
              <i class="fas fa-save"></i> Save KRA
            </button>
            <button type="button" class="btn-cancel-premium" @click="closeKRAModal()">
              <i class="fas fa-times"></i> Cancel
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Department Modal - Premium Design -->
    <transition name="modal-fade">
      <div class="modal-backdrop" v-if="showDepartmentForm" @click.self="closeDepartmentForm()">
        <div class="premium-modal department-modal" :class="{ 'mobile-modal': isMobile }" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium">
              <i class="fas fa-building"></i>
            </div>
            <div class="header-text">
              <h2>Add Department</h2>
              <p>Create a new department</p>
            </div>
            <button class="close-btn-premium" @click="closeDepartmentForm()">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body-premium">
            <form @submit.prevent="submitDepartment">
              <div class="form-section">
                <div class="form-field">
                  <label>Department Name <span class="required-star">*</span></label>
                  <div class="field-wrapper">
                    <i class="fas fa-building field-icon"></i>
                    <input v-model="departmentForm.name" placeholder="e.g., Engineering, Marketing" required />
                  </div>
                </div>

                <div class="form-field">
                  <label>Department Code <span class="required-star">*</span></label>
                  <div class="field-wrapper">
                    <i class="fas fa-barcode field-icon"></i>
                    <input v-model="departmentForm.code" placeholder="e.g., ENG, MKT" required />
                  </div>
                </div>
              </div>

              <div class="modal-footer-premium" :class="{ 'mobile-footer': isMobile }">
                <button type="button" class="btn-cancel-premium" @click="closeDepartmentForm()">
                  <i class="fas fa-times"></i> Cancel
                </button>
                <button type="submit" class="btn-submit-premium">
                  <i class="fas fa-save"></i> Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <!-- View KRAs Modal - Premium Design -->
    <transition name="modal-fade">
      <div class="modal-backdrop" v-if="showKRAsModal" @click.self="showKRAsModal = false">
        <div class="premium-modal view-kra-modal" :class="{ 'mobile-modal': isMobile }" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <div class="header-text">
              <h2>Key Responsibility Areas</h2>
              <p>{{ selectedDepartmentName }}</p>
            </div>
            <button class="close-btn-premium" @click="showKRAsModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body-premium kra-view-body">
            <div v-if="selectedDepartmentKRAs.length" class="kra-cards-container">
              <div v-for="(kra, index) in selectedDepartmentKRAs" :key="kra.id" class="kra-card-item">
                <div class="kra-card-header" @click="toggleKRA(index)">
                  <div class="kra-title-section">
                    <i :class="expandedKRAIndex === index ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
                    <h3>{{ kra.name }}</h3>
                  </div>
                  <div class="kra-card-actions">
                    <button class="icon-btn-small edit" @click.stop="editKRA(kra)" title="Edit KRA">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn-small delete" @click.stop="deleteKRA(kra.id)" title="Delete KRA">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
                
                <transition name="expand">
                  <div v-if="expandedKRAIndex === index" class="kra-card-body">
                    <div class="info-section">
                      <div class="info-header">
                        <i class="fas fa-tasks"></i>
                        <strong>Tasks</strong>
                      </div>
                      <ul class="info-list">
                        <li v-for="(task, tIndex) in kra.tasks" :key="tIndex">
                          <i class="fas fa-check-circle"></i> {{ task }}
                        </li>
                        <li v-if="!kra.tasks || kra.tasks.length === 0" class="empty-item">No tasks defined</li>
                      </ul>
                    </div>
                    
                    <div class="info-section">
                      <div class="info-header">
                        <i class="fas fa-chart-line"></i>
                        <strong>KPIs</strong>
                      </div>
                      <div class="kpi-badges">
                        <span v-for="(kpi, kIndex) in kra.kpis" :key="kIndex" class="kpi-badge">
                          {{ kpi }}
                        </span>
                        <span v-if="!kra.kpis || kra.kpis.length === 0" class="empty-item">No KPIs defined</span>
                      </div>
                    </div>
                    
                    <div class="info-section" v-if="kra.target">
                      <div class="info-header">
                        <i class="fas fa-bullseye"></i>
                        <strong>Target</strong>
                      </div>
                      <p class="target-text">{{ kra.target }}</p>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
            
            <div v-else class="empty-state-premium">
              <i class="fas fa-inbox"></i>
              <h4>No KRAs Available</h4>
              <p>This department doesn't have any KRAs yet.</p>
            </div>
          </div>

          <div class="modal-footer-premium" :class="{ 'mobile-footer': isMobile }">
            <button type="button" class="btn-submit-premium" @click="showKRAsModal = false">
              <i class="fas fa-check"></i> Close
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{
        'expanded-content': isMobile && !isSidebarVisible,
        'hide-on-mobile': isMobile && isSidebarVisible
      }">
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
        
          <div class="mobile-title">
            <i class="fas fa-building"></i>
            <span>Departments</span>
          </div>
          <button class="mobile-add-btn" @click="showDepartmentForm = true">
            <i class="fas fa-plus"></i>
          </button>
        </div>

        <!-- Desktop Header -->
        <div class="content-header-modern" v-else>
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-building"></i>
            </div>
            <div>
              <h1>Departments & KRA</h1>
              <p class="subtitle-modern">Manage departments and key responsibility areas</p>
            </div>
          </div>
          <button class="register-btn-modern" @click="showDepartmentForm = true">
            <i class="fas fa-plus-circle"></i>
            <span>Add Department</span>
          </button>
        </div>

        <!-- Stats Bar - Mobile Optimized -->
        <div class="stats-bar">
          <div class="stat-card">
            <i class="fas fa-building"></i>
            <div class="stat-info">
              <span class="stat-value">{{ departments.length }}</span>
              <span class="stat-label">Departments</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-tasks"></i>
            <div class="stat-info">
              <span class="stat-value">{{ totalKRAs }}</span>
              <span class="stat-label">Total KRAs</span>
            </div>
          </div>
        </div>

        <!-- Search - Mobile -->
        <div class="search-bar-mobile" v-if="isMobile && departments.length > 0">
          <div class="search-group-mobile">
            <i class="fas fa-search"></i>
            <input type="text" v-model="searchQuery" placeholder="Search departments..." class="search-input-mobile" />
          </div>
        </div>

        <!-- Table - Mobile Optimized -->
        <div class="table-wrapper-premium">
          <!-- Mobile Card View -->
          <div class="mobile-cards" v-if="isMobile">
            <div v-for="dept in filteredDepartments" :key="dept.id" class="department-card">
              <div class="card-header" @click="viewDepartmentKRAs(dept)">
                <div class="dept-info">
                  <div class="dept-avatar">
                    {{ getInitials(dept.name) }}
                  </div>
                  <div>
                    <div class="dept-name">{{ dept.name }}</div>
                    <span class="code-badge-mobile">{{ dept.code }}</span>
                  </div>
                </div>
                <!-- <i class="fas fa-chevron-down"></i> -->
              </div>
              <div class="card-actions">
                <button class="card-action-btn primary" @click.stop="addKRA(dept)">
                  <i class="fas fa-plus-circle"></i> Add KRA
                </button>
                <button class="card-action-btn danger" @click.stop="deleteDepartment(dept.id)">
                  <i class="fas fa-trash-alt"></i> Delete
                </button>
              </div>
            </div>

            <!-- Mobile Empty State -->
            <div v-if="filteredDepartments.length === 0" class="empty-state-mobile">
              <i class="fas fa-building"></i>
              <h4>{{ searchQuery ? 'No Matching Departments' : 'No Departments Yet' }}</h4>
              <p>{{ searchQuery ? 'Try adjusting your search' : 'Click "Add Department" to create your first department' }}</p>
            </div>
          </div>

          <!-- Desktop Table View -->
          <table class="department-table" v-else>
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Department Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dept in filteredDepartments" :key="dept.id">
                <td class="department-name" @click="viewDepartmentKRAs(dept)">
                  <div class="dept-info">
                    <div class="dept-avatar">
                      {{ getInitials(dept.name) }}
                    </div>
                    <span>{{ dept.name }}</span>
                  </div>
                </td>
                <td><span class="code-badge">{{ dept.code }}</span></td>
                <td>
                  <div class="action-group">
                    <button class="action-btn-primary" @click="addKRA(dept)" title="Add KRA">Add KRAs
                      <i class="fas fa-plus-circle"></i>
                    </button>
                    <button class="action-btn-danger" @click="deleteDepartment(dept.id)" title="Delete Department">Delete 
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredDepartments.length === 0" class="empty-row">
                <td colspan="3">
                  <div class="empty-state-premium">
                    <i class="fas fa-building"></i>
                    <h4>No Departments Yet</h4>
                    <p>Click "Add Department" to create your first department</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Sidebar from '../components/Sidebar.vue';
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

export default {
  components: {
    Sidebar
  },
  data() {
    return {
      searchQuery: '',
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
      newKpi: '',
      showKRAModal: false,
      addKRAModalStep: 1,
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
  computed: {
    getModalTitle() {
      return this.isEditMode ? 'Edit KRA' : 'Create New KRA';
    },
    totalKRAs() {
      return this.departments.reduce((total, dept) => total + (dept.kras_count || 0), 0);
    },
    filteredDepartments() {
      if (!this.searchQuery) return this.departments;
      const query = this.searchQuery.toLowerCase();
      return this.departments.filter(dept =>
        dept.name.toLowerCase().includes(query) ||
        dept.code.toLowerCase().includes(query)
      );
    }
  },
  created() {
    this.fetchDepartments();
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
  },
  methods: {
    getInitials(name) {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
    async deleteKRA(kraId) {
      if (!confirm("Are you sure you want to delete this KRA?")) return;
      try {
        await axios.delete(`https://employees.archenterprises.co.in/api/api/kras/${kraId}`);
        this.selectedDepartmentKRAs = this.selectedDepartmentKRAs.filter(kra => kra.id !== kraId);
        toastSuccess("KRA deleted successfully!");
        this.fetchDepartments();
      } catch (error) {
        console.error(error);
        toastError("Unable to delete KRA. Please try again.");
      }
    },
    editKRA(kra) {
      this.resetForm();
      this.isEditMode = true;
      this.showKRAsModal = false;
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
      }, 300);
    },
    toggleKRA(index) {
      this.expandedKRAIndex = this.expandedKRAIndex === index ? null : index;
    },
    async viewDepartmentKRAs(dept) {
      this.selectedDepartmentName = dept.name;
      try {
        const response = await axios.get(`https://employees.archenterprises.co.in/api/api/kras/${dept.id}`);
        this.selectedDepartmentKRAs = response.data.data || [];
        this.showKRAsModal = true;
      } catch (error) {
        console.error('Failed to load KRAs:', error);
        toastError('Unable to load KRAs for this department.');
      }
    },
    validateStep() {
      if (this.addKRAModalStep === 1) {
        if (!this.kraForm.name.trim()) {
          this.kraNameError = 'KRA Name is required.';
          return;
        }
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

      if (this.addKRAModalStep === 2) {
        const hasEmpty = this.kraForm.tasks.some(task => !task.trim());
        if (hasEmpty) {
          this.taskError = 'All tasks must be filled.';
          return;
        }
        this.taskError = '';
      }

      if (this.addKRAModalStep === 3) {
        if (this.kraForm.kpis.length === 0) {
          this.kpiError = 'At least one KPI must be added.';
          return;
        }
        this.kpiError = '';
      }

      this.addKRAModalStep++;
    },
    saveKRA() {
      const isDuplicate = this.existingKRAs.some(kra =>
        kra.name.toLowerCase() === this.kraForm.name.trim().toLowerCase() &&
        (!this.isEditMode || kra.id !== this.kraForm.id)
      );

      if (isDuplicate) {
        this.kraNameError = "This KRA name already exists.";
        this.addKRAModalStep = 1;
        return;
      }

      this.kraNameError = "";

      const payload = {
        department_id: this.kraForm.department_id,
        name: this.kraForm.name,
        tasks: this.kraForm.tasks.filter(t => t.trim()),
        kpis: this.kraForm.kpis,
        target: this.kraForm.target
      };

      const request = this.isEditMode
        ? axios.put(`https://employees.archenterprises.co.in/api/api/kras/${this.kraForm.id}`, payload)
        : axios.post('https://employees.archenterprises.co.in/api/api/kras', payload);

      request.then(() => {
        toastSuccess(`KRA ${this.isEditMode ? 'updated' : 'saved'} successfully!`);
        this.resetForm();
        this.closeKRAModal();
        this.fetchDepartments();
      }).catch(error => {
        console.error('Save error:', error);
        toastError('Duplicate Entry of KRA Name.');
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
        this.newKpi = '';
      }
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
          toastSuccess('Department deleted successfully!');
          this.fetchDepartments();
        } catch (error) {
          console.error('Error deleting department:', error);
          toastError('Failed to delete department.');
        }
      }
    },
    async fetchDepartments() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/departments');
        this.departments = response.data.data;
        // Fetch KRAs count for each department
        for (let dept of this.departments) {
          const kraResponse = await axios.get(`https://employees.archenterprises.co.in/api/api/kras/${dept.id}`);
          dept.kras_count = kraResponse.data.data?.length || 0;
          this.existingKRAs = [...this.existingKRAs, ...(kraResponse.data.data || [])];
        }
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    },
    async submitDepartment() {
      if (!this.departmentForm.name || !this.departmentForm.code) {
        toastWarning('Please fill all required fields');
        return;
      }
      try {
        await axios.post('https://employees.archenterprises.co.in/api/api/departments', this.departmentForm);
        toastSuccess('Department saved successfully!');
        this.closeDepartmentForm();
        this.fetchDepartments();
      } catch (error) {
        console.error('Failed to save department:', error);
        toastError('Something went wrong while saving the department.');
      }
    },
    closeDepartmentForm() {
      this.departmentForm = { name: '', code: '', id: null };
      this.showDepartmentForm = false;
    }
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Variables */
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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

.content {
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

.mobile-add-btn {
  background: var(--primary);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-add-btn:active {
  transform: scale(0.9);
}

/* Search Bar - Mobile */
.search-bar-mobile {
  display: none;
  margin-bottom: 16px;
}

.search-group-mobile {
  position: relative;
  flex: 1;
}

.search-group-mobile i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input-mobile {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  transition: all 0.3s ease;
}

.search-input-mobile:focus {
  outline: none;
  border-color: var(--primary-color);
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
  font-size: 22px;
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

.register-btn-modern {
  padding: 12px 24px;
  background: var(--primary);
  border: none;
  border-radius: 16px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.register-btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

/* Stats Bar */
.stats-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 150px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.stat-card i {
  font-size: 32px;
  color: var(--primary-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

/* Mobile Cards */
.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.department-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.dept-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dept-avatar {
  width: 40px;
  height: 40px;
  background: var(--primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.dept-name {
  font-weight: 600;
  color: var(--dark);
  font-size: 14px;
}

.code-badge-mobile {
  padding: 2px 10px;
  background: #e0e7ff;
  color: var(--primary-color);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.card-action-btn {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.card-action-btn.primary {
  background: #e0e7ff;
  color: var(--primary-color);
}

.card-action-btn.primary:active {
  transform: scale(0.97);
}

.card-action-btn.danger {
  background: #fee2e2;
  color: var(--danger);
}

.card-action-btn.danger:active {
  transform: scale(0.97);
}

/* Empty State Mobile */
.empty-state-mobile {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-state-mobile i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state-mobile h4 {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 6px;
}

.empty-state-mobile p {
  font-size: 13px;
}

/* Table Styles */
.table-wrapper-premium {
  overflow-x: auto;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
}

.department-table {
  width: 100%;
  border-collapse: collapse;
}

.department-table thead {
  background: #f8fafc;
}

.department-table th {
  text-align: left;
  padding: 16px 20px;
  font-weight: 600;
  font-size: 13px;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.department-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.department-table tbody tr {
  transition: all 0.3s ease;
}

.department-table tbody tr:hover {
  background: #fafbfc;
}

.department-name {
  cursor: pointer;
}

.dept-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dept-avatar {
  width: 36px;
  height: 36px;
  background: var(--primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 13px;
}

.department-name span {
  font-weight: 500;
  color: #1a1a2e;
}

.code-badge {
  padding: 4px 12px;
  background: #e0e7ff;
  color: var(--primary-color);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.action-group {
  display: flex;
  gap: 8px;
}

.action-btn-primary,
.action-btn-danger {
  width: auto;
  height: 34px;
  padding: 17px;
  gap: 8px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn-primary {
  background: #e0e7ff;
  color: var(--primary-color);
}

.action-btn-primary:hover {
  color: rgb(0, 0, 0);
  transform: translateY(-2px);
}

.action-btn-danger {
  background: #fee2e2;
  color: var(--danger);
}

.action-btn-danger:hover {
  color: rgb(196, 9, 9);
  transform: translateY(-2px);
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
}

.premium-modal {
  position: relative;
  background: white;
  border-radius: 32px;
  width: 100%;
  max-width: 650px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.premium-modal.mobile-modal {
  max-width: 95%;
  border-radius: 24px;
  max-height: 90vh;
}

.premium-modal.department-modal {
  max-width: 500px;
}

.premium-modal.view-kra-modal {
  max-width: 700px;
}

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

.modal-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary);
}

/* Modal Header */
.modal-header-premium {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.mobile-modal .modal-header-premium {
  padding: 16px 20px;
  gap: 12px;
}

.header-icon-premium {
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

.mobile-modal .header-icon-premium {
  width: 40px;
  height: 40px;
  font-size: 18px;
}

.header-text {
  flex: 1;
}

.header-text h2 {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: #1a1a2e;
}

.mobile-modal .header-text h2 {
  font-size: 18px;
}

.header-text p {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 0;
}

.mobile-modal .header-text p {
  font-size: 12px;
}

.close-btn-premium {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;
  font-size: 18px;
}

.close-btn-premium:hover {
  color: rgb(16, 4, 4);
  transform: rotate(90deg);
}

/* Modal Body */
.modal-body-premium {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
  background: #fafbfc;
}

.mobile-modal .modal-body-premium {
  padding: 16px;
}

.modal-body-premium::-webkit-scrollbar {
  width: 6px;
}

.modal-body-premium::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 10px;
}

.modal-body-premium::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 10px;
}

/* Form Sections */
.form-section {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.mobile-modal .form-section {
  padding: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
}

.mobile-modal .section-title {
  font-size: 14px;
}

.section-title i {
  color: var(--primary-color);
  font-size: 18px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.required-star {
  color: var(--danger);
}

.field-wrapper {
  position: relative;
}

.field-wrapper .field-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
}

.field-wrapper input,
.field-wrapper select,
.field-wrapper textarea {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.mobile-modal .field-wrapper input,
.mobile-modal .field-wrapper select,
.mobile-modal .field-wrapper textarea {
  font-size: 16px;
  padding: 10px 12px 10px 36px;
}

.field-wrapper input:focus,
.field-wrapper select:focus,
.field-wrapper textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.field-wrapper input.error {
  border-color: var(--danger);
}

.field-error {
  font-size: 11px;
  color: var(--danger);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Tasks Container */
.tasks-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  gap: 12px;
  align-items: center;
}

.task-item .field-wrapper {
  flex: 1;
}

.remove-task-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #fee2e2;
  border: none;
  cursor: pointer;
  color: var(--danger);
  transition: all 0.3s ease;
}

.remove-task-btn:active {
  transform: scale(0.9);
}

.add-btn {
  padding: 10px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
}

.add-btn:active {
  transform: scale(0.97);
}

/* KPI Container */
.kpi-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.kpi-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.mobile-modal .kpi-input-group {
  flex-direction: column;
}

.kpi-input-group .field-wrapper {
  flex: 1;
}

.add-kpi-btn {
  padding: 10px 20px;
  background: var(--primary);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.mobile-modal .add-kpi-btn {
  width: 100%;
  justify-content: center;
}

.add-kpi-btn:active {
  transform: scale(0.97);
}

.kpi-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.kpi-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-radius: 30px;
  font-size: 13px;
  font-weight: 500;
  color: #065f46;
}

.kpi-chip i {
  cursor: pointer;
  transition: all 0.3s ease;
}

.kpi-chip i:active {
  transform: scale(0.9);
}

/* Modal Footer */
.modal-footer-premium {
  display: flex;
  gap: 12px;
  padding: 20px 28px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.modal-footer-premium.mobile-footer {
  flex-direction: column;
  padding: 16px 20px;
}

.btn-cancel-premium,
.btn-submit-premium {
  flex: 1;
  padding: 12px;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  border: none;
}

.mobile-footer .btn-cancel-premium,
.mobile-footer .btn-submit-premium {
  padding: 14px;
}

.btn-cancel-premium {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancel-premium:hover {
  background: #e5e7eb;
}

.btn-submit-premium {
  background: var(--primary);
  color: white;
}

.btn-submit-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

/* KRA View Cards */
.kra-cards-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.kra-card-item {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.kra-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.3s ease;
}

.kra-card-header:active {
  transform: scale(0.99);
}

.kra-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.kra-title-section i {
  color: var(--primary-color);
  font-size: 14px;
}

.kra-title-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.kra-card-actions {
  display: flex;
  gap: 8px;
}

.icon-btn-small {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon-btn-small:active {
  transform: scale(0.9);
}

.icon-btn-small.edit {
  background: #e0e7ff;
  color: var(--primary-color);
}

.icon-btn-small.edit:hover {
  background: var(--primary-color);
  color: white;
}

.icon-btn-small.delete {
  background: #fee2e2;
  color: var(--danger);
}

.icon-btn-small.delete:hover {
  background: var(--danger);
  color: white;
}

.kra-card-body {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-section {
  margin-bottom: 16px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #374151;
  font-size: 13px;
}

.info-header i {
  color: var(--primary-color);
}

.info-list {
  list-style: none;
  padding-left: 24px;
}

.info-list li {
  padding: 6px 0;
  font-size: 13px;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-list li i {
  color: var(--success);
  font-size: 12px;
}

.kpi-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-left: 24px;
}

.kpi-badge {
  padding: 4px 12px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: #065f46;
}

.target-text {
  padding-left: 24px;
  font-size: 13px;
  color: #4b5563;
  font-style: italic;
}

.empty-item {
  color: #9ca3af;
  font-size: 12px;
  padding: 6px 0;
}

.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-state-premium i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state-premium h4 {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 8px;
}

.empty-state-premium p {
  font-size: 14px;
}

/* Expand Transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
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
    padding: 12px;
  }

  .content {
    padding: 16px;
    border-radius: 20px;
  }

  .mobile-header {
    display: flex;
  }

  .content-header-modern {
    display: none;
  }

  .stats-bar {
    flex-direction: column;
    gap: 10px;
  }

  .stat-card {
    width: 100%;
    padding: 14px;
  }

  .stat-card i {
    font-size: 28px;
  }

  .stat-value {
    font-size: 18px;
  }

  .search-bar-mobile {
    display: block;
  }

  .mobile-cards {
    display: flex;
  }

  .department-table {
    display: none;
  }

  .table-wrapper-premium {
    border: none;
  }

  .premium-modal {
    max-width: 95%;
  }

  .modal-header-premium {
    padding: 16px 20px;
  }

  .modal-body-premium {
    padding: 16px;
  }

  .modal-footer-premium {
    padding: 16px 20px;
    flex-direction: column;
  }

  .kpi-input-group {
    flex-direction: column;
  }

  .add-kpi-btn {
    width: 100%;
  }

  .action-group {
    flex-direction: column;
  }

  .action-btn-primary,
  .action-btn-danger {
    width: 100%;
    padding: 12px 16px;
  }

  .department-table th,
  .department-table td {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }

  .content {
    padding: 12px;
    border-radius: 16px;
  }

  .mobile-title {
    font-size: 16px;
  }

  .mobile-add-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .department-card {
    padding: 12px;
  }

  .card-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }


  .dept-avatar {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }

  .dept-name {
    font-size: 13px;
  }

  .search-input-mobile {
    font-size: 15px;
    padding: 8px 10px 8px 34px;
  }

  .kra-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .kra-card-actions {
    align-self: flex-end;
  }

  .kra-title-section h3 {
    font-size: 14px;
  }

  .info-list {
    padding-left: 16px;
  }

  .kpi-badges {
    padding-left: 16px;
  }

  .target-text {
    padding-left: 16px;
  }

  .empty-state-mobile i {
    font-size: 40px;
  }

  .empty-state-mobile h4 {
    font-size: 15px;
  }
}
</style>