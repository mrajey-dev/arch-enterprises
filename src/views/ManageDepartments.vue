<template>
  <div class="layout">

    <!-- 🌟 KRA Modal - Emerald Mint Modern Design -->
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
            <!-- Step Progress Indicator -->
            <div v-if="!isEditMode" class="step-progress-bar">
              <div 
                v-for="step in 4" 
                :key="step" 
                class="step-progress-item" 
                :class="{ 'active': addKRAModalStep === step, 'completed': addKRAModalStep > step }"
                @click="step < addKRAModalStep ? addKRAModalStep = step : null"
              >
                <div class="step-circle">
                  <i v-if="addKRAModalStep > step" class="fas fa-check"></i>
                  <span v-else>{{ step }}</span>
                </div>
                <span class="step-name">
                  {{ step === 1 ? 'Name' : step === 2 ? 'Tasks' : step === 3 ? 'KPIs' : 'Target' }}
                </span>
              </div>
            </div>

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
                  <button v-if="kraForm.tasks.length > 1" type="button" @click="removeTask(index)" class="remove-task-btn" title="Remove task">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
                <span v-if="taskError" class="field-error">
                  <i class="fas fa-exclamation-circle"></i> {{ taskError }}
                </span>
                <button type="button" @click="kraForm.tasks.push('')" class="add-task-btn">
                  <i class="fas fa-plus-circle"></i> Add Another Task
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
                      placeholder="Enter KPI name (e.g. Sales Target, Quality Score)"
                      @keyup.enter="addKpi"
                    />
                  </div>
                  <button @click="addKpi" class="add-kpi-btn">
                    <i class="fas fa-plus"></i> <span class="btn-text">Add KPI</span>
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
                <span>Target & Objective (Optional)</span>
              </div>
              <div class="form-field">
                <div class="field-wrapper">
                  <i class="fas fa-flag-checkered field-icon"></i>
                  <input
                    v-model="kraForm.target"
                    type="text"
                    placeholder="e.g., Increase efficiency by 15%, Complete 10 projects, etc."
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
              Next Step <i class="fas fa-arrow-right"></i>
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

    <!-- 🌟 Department Modal - Emerald Mint Modern Design -->
    <transition name="modal-fade">
      <div class="modal-backdrop" v-if="showDepartmentForm" @click.self="closeDepartmentForm()">
        <div class="premium-modal department-modal" :class="{ 'mobile-modal': isMobile }" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium">
              <i class="fas fa-building"></i>
            </div>
            <div class="header-text">
              <h2>Add New Department</h2>
              <p>Create an organizational department with code</p>
            </div>
            <button class="close-btn-premium" @click="closeDepartmentForm()">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body-premium">
            <form @submit.prevent="submitDepartment">
              <div class="form-section">
                <div class="form-field">
                  <label class="field-label">Department Name <span class="required-star">*</span></label>
                  <div class="field-wrapper">
                    <i class="fas fa-building field-icon"></i>
                    <input v-model="departmentForm.name" placeholder="e.g., Engineering, Marketing, Operations" required />
                  </div>
                </div>

                <div class="form-field" style="margin-top: 16px;">
                  <label class="field-label">Department Code <span class="required-star">*</span></label>
                  <div class="field-wrapper">
                    <i class="fas fa-barcode field-icon"></i>
                    <input v-model="departmentForm.code" placeholder="e.g., ENG, MKT, OPS" required />
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

    <!-- 🌟 View KRAs Modal - Emerald Mint Modern Design -->
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
                    <div class="kra-expand-icon">
                      <i :class="expandedKRAIndex === index ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
                    </div>
                    <div class="kra-title-wrap">
                      <h3 class="kra-name-heading">{{ kra.name }}</h3>
                      <span class="kra-meta-badge">{{ (kra.tasks && kra.tasks.length) || 0 }} Tasks • {{ (kra.kpis && kra.kpis.length) || 0 }} KPIs</span>
                    </div>
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
                        <strong>Tasks List</strong>
                      </div>
                      <ul class="info-list">
                        <li v-for="(task, tIndex) in kra.tasks" :key="tIndex">
                          <i class="fas fa-check-circle"></i> <span>{{ task }}</span>
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
                          <i class="fas fa-bolt"></i> {{ kpi }}
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
              <div class="empty-icon-circle">
                <i class="fas fa-inbox"></i>
              </div>
              <h4>No KRAs Available</h4>
              <p>This department doesn't have any Key Responsibility Areas defined yet.</p>
            </div>
          </div>

          <div class="modal-footer-premium" :class="{ 'mobile-footer': isMobile }">
            <button type="button" class="btn-submit-premium" @click="showKRAsModal = false">
              <i class="fas fa-check"></i> Done
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 🌟 Main Layout Content -->
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

        <!-- 🏢 Desktop Header Banner -->
        <div class="content-header-modern" v-else>
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-building"></i>
            </div>
            <div>
              <h1 class="page-title">Departments & KRA Master</h1>
              <p class="subtitle-modern">Manage department directory, codes, and Key Responsibility Areas (KRAs)</p>
            </div>
          </div>
          <button class="register-btn-modern" @click="showDepartmentForm = true">
            <i class="fas fa-plus-circle"></i>
            <span>Add Department</span>
          </button>
        </div>

        <!-- 📊 Top Metric KPI Summary Cards -->
        <div class="stats-bar">
          <div class="stat-card">
            <div class="stat-icon-wrap emerald">
              <i class="fas fa-building"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ departments.length }}</span>
              <span class="stat-label">Total Departments</span>
            </div>
            <span class="stat-tag emerald">Active Units</span>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap mint">
              <i class="fas fa-bullseye"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ totalKRAs }}</span>
              <span class="stat-label">Total KRAs Defined</span>
            </div>
            <span class="stat-tag mint">Key Goals</span>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap amber">
              <i class="fas fa-layer-group"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ departmentsWithKRAs }}</span>
              <span class="stat-label">Units with KRAs</span>
            </div>
            <span class="stat-tag amber">{{ Math.round((departmentsWithKRAs / (departments.length || 1)) * 100) }}% Coverage</span>
          </div>
        </div>

        <!-- 🔍 Search & Live Filter Bar -->
        <div class="department-search-bar">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search departments by name or code..." 
              class="search-input-field" 
            />
            <button v-if="searchQuery" class="search-clear-btn" @click="searchQuery = ''">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="search-results-counter">
            <span>Showing <strong>{{ filteredDepartments.length }}</strong> of {{ departments.length }} Departments</span>
          </div>
        </div>

        <!-- 📋 Departments Directory / Table -->
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
              </div>
              <div class="card-actions">
                <button class="card-action-btn primary" @click.stop="addKRA(dept)">
                  <i class="fas fa-plus-circle"></i> Add KRA
                </button>
                <button class="card-action-btn secondary" @click.stop="viewDepartmentKRAs(dept)">
                  <i class="fas fa-eye"></i> View ({{ dept.kras_count || 0 }})
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
              <p>{{ searchQuery ? 'Try adjusting your search query' : 'Click "Add Department" to create your first department' }}</p>
            </div>
          </div>

          <!-- Desktop Modern Table View -->
          <table class="department-table" v-else>
            <thead>
              <tr>
                <th>DEPARTMENT NAME</th>
                <th>DEPARTMENT CODE</th>
                <th>ASSIGNED KRAS</th>
                <th class="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dept in filteredDepartments" :key="dept.id" class="dept-table-row">
                <!-- Department Name -->
                <td class="department-name" @click="viewDepartmentKRAs(dept)">
                  <div class="dept-info">
                    <div class="dept-avatar">
                      {{ getInitials(dept.name) }}
                    </div>
                    <div class="dept-text-wrap">
                      <span class="dept-main-name">{{ dept.name }}</span>
                      <small class="dept-sub-text">Click to view Key Responsibility Areas</small>
                    </div>
                  </div>
                </td>

                <!-- Code Badge -->
                <td>
                  <span class="code-badge">{{ dept.code }}</span>
                </td>

                <!-- KRAs Count Pill -->
                <td>
                  <button class="kras-count-pill" @click="viewDepartmentKRAs(dept)">
                    <i class="fas fa-bullseye"></i>
                    <span>{{ dept.kras_count || 0 }} KRAs</span>
                    <i class="fas fa-arrow-right pill-arrow"></i>
                  </button>
                </td>

                <!-- Action Buttons -->
                <td class="text-right">
                  <div class="action-group">
                    <button class="action-btn-primary" @click="addKRA(dept)" title="Add KRA">
                      <i class="fas fa-plus-circle"></i>
                      <span>Add KRA</span>
                    </button>
                    <button class="action-btn-view" @click="viewDepartmentKRAs(dept)" title="View KRAs">
                      <i class="fas fa-eye"></i>
                      <span>View</span>
                    </button>
                    <button class="action-btn-danger" @click="deleteDepartment(dept.id)" title="Delete Department">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty Row -->
              <tr v-if="filteredDepartments.length === 0" class="empty-row">
                <td colspan="4">
                  <div class="empty-state-premium">
                    <div class="empty-icon-circle">
                      <i class="fas fa-building"></i>
                    </div>
                    <h4>{{ searchQuery ? 'No Matching Departments Found' : 'No Departments Configured' }}</h4>
                    <p>{{ searchQuery ? `No department matches "${searchQuery}". Try clearing search.` : 'Click "Add Department" to start structuring your organization.' }}</p>
                    <button v-if="!searchQuery" class="register-btn-modern inline-btn" @click="showDepartmentForm = true">
                      <i class="fas fa-plus-circle"></i>
                      <span>Create Department</span>
                    </button>
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
  name: 'ManageDepartments',
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
    departmentsWithKRAs() {
      return this.departments.filter(dept => (dept.kras_count || 0) > 0).length;
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
        this.departments = response.data.data || [];
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
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

/* 🌿 Root & Variables - Emerald Mint Theme */
:root {
  --primary: #2cb67d;
  --primary-dark: #209961;
  --primary-light: #eaf7f1;
  --secondary: #638578;
  --text: #0f2e22;
  --text-light: #6b8f81;
  --bg-app: #edf7f2;
  --card: #ffffff;
  --border: #e0f0e8;
  --danger: #ef4444;
  --warning: #f59e0b;
  --font-display: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  background: var(--bg-app, #edf7f2);
  font-family: var(--font-body, 'Inter', sans-serif);
  color: #0f2e22;
}

/* 🌿 Main Content Area */
.main-content {
  display: flex;
  gap: 24px;
  padding: 18px 24px;
  min-height: 100vh;
}

.content {
  flex: 1;
  background: transparent;
  overflow-x: hidden;
}

/* 📱 Mobile Header */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: #ffffff;
  border-radius: 18px;
  margin-bottom: 18px;
  border: 1px solid #e0f0e8;
  box-shadow: 0 4px 16px rgba(44, 182, 125, 0.06);
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: #0f2e22;
  font-family: var(--font-display, sans-serif);
}

.mobile-title i {
  color: #2cb67d;
}

.mobile-add-btn {
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  color: white;
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(44, 182, 125, 0.3);
}

/* 🏢 Desktop Header Banner */
.content-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
  box-shadow: 0 8px 20px rgba(44, 182, 125, 0.28);
}

.page-title {
  font-size: 22px;
  font-weight: 800;
  color: #0f2e22;
  font-family: var(--font-display, sans-serif);
  margin: 0;
  letter-spacing: -0.3px;
}

.subtitle-modern {
  color: #6b8f81;
  font-size: 13.5px;
  margin-top: 3px;
  font-weight: 500;
}

.register-btn-modern {
  padding: 12px 24px;
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  border: none;
  border-radius: 16px;
  color: white;
  font-weight: 700;
  font-size: 13.5px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 6px 20px rgba(44, 182, 125, 0.3);
}

.register-btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(44, 182, 125, 0.4);
}

/* 📊 Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #dff0e7;
  box-shadow: 0 4px 18px rgba(44, 182, 125, 0.05);
  position: relative;
  transition: all 0.25s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(44, 182, 125, 0.1);
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.stat-icon-wrap.emerald {
  background: #eaf7f1;
  color: #16935b;
}

.stat-icon-wrap.mint {
  background: #e0f2fe;
  color: #0284c7;
}

.stat-icon-wrap.amber {
  background: #fef3c7;
  color: #d97706;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #0f2e22;
  font-family: var(--font-display, sans-serif);
  line-height: 1.1;
  display: block;
}

.stat-label {
  font-size: 12.5px;
  color: #6b8f81;
  font-weight: 600;
  margin-top: 3px;
  display: block;
}

.stat-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 8px;
  align-self: flex-start;
}

.stat-tag.emerald { background: #eaf7f1; color: #16935b; }
.stat-tag.mint { background: #e0f2fe; color: #0284c7; }
.stat-tag.amber { background: #fef3c7; color: #d97706; }

/* 🔍 Search Bar */
.department-search-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  max-width: 480px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #2cb67d;
  font-size: 14px;
}

.search-input-field {
  width: 100%;
  padding: 12px 40px 12px 44px;
  background: #ffffff;
  border: 1px solid #dff0e7;
  border-radius: 14px;
  font-size: 13.5px;
  color: #0f2e22;
  font-weight: 500;
  outline: none;
  box-shadow: 0 2px 10px rgba(44, 182, 125, 0.04);
  transition: all 0.25s ease;
}

.search-input-field:focus {
  border-color: #2cb67d;
  box-shadow: 0 0 0 3px rgba(44, 182, 125, 0.16);
}

.search-clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  font-size: 10px;
}

.search-results-counter {
  font-size: 13px;
  color: #6b8f81;
  font-weight: 500;
}

.search-results-counter strong {
  color: #16935b;
}

/* 📋 Table Styles */
.table-wrapper-premium {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #dff0e7;
  box-shadow: 0 6px 24px rgba(44, 182, 125, 0.06);
  overflow: hidden;
}

.department-table {
  width: 100%;
  border-collapse: collapse;
}

.department-table thead {
  background: #f7fcf9;
  border-bottom: 1px solid #e0f0e8;
}

.department-table th {
  text-align: left;
  padding: 16px 24px;
  font-weight: 800;
  font-size: 11.5px;
  color: #7d9e92;
  letter-spacing: 0.6px;
}

.department-table th.text-right {
  text-align: right;
}

.department-table td {
  padding: 16px 24px;
  border-bottom: 1px solid #f2faf6;
  vertical-align: middle;
}

.department-table td.text-right {
  text-align: right;
}

.dept-table-row {
  transition: all 0.2s ease;
}

.dept-table-row:hover {
  background: #f7fcf9;
}

.department-name {
  cursor: pointer;
}

.dept-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.dept-avatar {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(44, 182, 125, 0.25);
  flex-shrink: 0;
}

.dept-text-wrap {
  display: flex;
  flex-direction: column;
}

.dept-main-name {
  font-weight: 700;
  color: #0f2e22;
  font-size: 14.5px;
}

.dept-sub-text {
  font-size: 11.5px;
  color: #7d9e92;
  margin-top: 1px;
}

.code-badge {
  padding: 5px 14px;
  background: #eaf7f1;
  color: #16935b;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid #d4ede1;
  display: inline-block;
}

.kras-count-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  color: #15803d;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.kras-count-pill:hover {
  background: #dcfce7;
  transform: translateX(2px);
}

.pill-arrow {
  font-size: 10px;
  opacity: 0.6;
}

/* Action Buttons */
.action-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #eaf7f1;
  color: #16935b;
  border: 1px solid #cbe9dc;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn-primary:hover {
  background: #2cb67d;
  color: #ffffff;
  border-color: #2cb67d;
  transform: translateY(-1px);
}

.action-btn-view {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn-view:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.action-btn-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: #fee2e2;
  color: #ef4444;
  border: 1px solid #fecaca;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn-danger:hover {
  background: #ef4444;
  color: #ffffff;
  border-color: #ef4444;
  transform: translateY(-1px);
}

/* 🌿 Modal Modern Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 46, 34, 0.45);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
}

.premium-modal {
  position: relative;
  background: #ffffff;
  border-radius: 28px;
  width: 100%;
  max-width: 650px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(15, 46, 34, 0.2);
  border: 1px solid #dff0e7;
  animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.premium-modal.department-modal {
  max-width: 480px;
}

.premium-modal.view-kra-modal {
  max-width: 680px;
}

@keyframes modalSlideIn {
  from { opacity: 0; transform: scale(0.96) translateY(-14px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-decoration {
  height: 5px;
  background: linear-gradient(90deg, #34b782, #2cb67d, #0284c7);
}

.modal-header-premium {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 28px;
  background: #f7fcf9;
  border-bottom: 1px solid #e0f0e8;
}

.header-icon-premium {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 14px rgba(44, 182, 125, 0.25);
}

.header-text h2 {
  font-size: 19px;
  font-weight: 800;
  color: #0f2e22;
  font-family: var(--font-display, sans-serif);
  margin: 0;
}

.header-text p {
  font-size: 12.5px;
  color: #6b8f81;
  margin: 2px 0 0;
}

.close-btn-premium {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e0f0e8;
  cursor: pointer;
  color: #6b8f81;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn-premium:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fecaca;
}

/* Step Progress Indicator */
.step-progress-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
  padding: 0 10px;
}

.step-progress-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  z-index: 1;
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.25s ease;
}

.step-progress-item.active .step-circle {
  background: #2cb67d;
  color: #ffffff;
  box-shadow: 0 0 0 4px rgba(44, 182, 125, 0.2);
}

.step-progress-item.completed .step-circle {
  background: #10b981;
  color: #ffffff;
}

.step-name {
  font-size: 11.5px;
  font-weight: 600;
  color: #6b8f81;
}

.step-progress-item.active .step-name {
  color: #16935b;
  font-weight: 700;
}

/* Modal Body */
.modal-body-premium {
  padding: 24px 28px;
  overflow-y: auto;
  background: #ffffff;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #0f2e22;
  margin-bottom: 12px;
}

.section-title i {
  color: #2cb67d;
}

.field-label {
  font-size: 13px;
  font-weight: 700;
  color: #0f2e22;
  margin-bottom: 6px;
  display: block;
}

.required-star {
  color: #ef4444;
}

.field-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 14px;
  color: #2cb67d;
  font-size: 14px;
}

.field-wrapper input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  font-size: 13.5px;
  color: #0f2e22;
  outline: none;
  transition: all 0.2s ease;
}

.field-wrapper input:focus {
  background: #ffffff;
  border-color: #2cb67d;
  box-shadow: 0 0 0 3px rgba(44, 182, 125, 0.16);
}

.field-wrapper input.error {
  border-color: #ef4444;
  background: #fff5f5;
}

.field-error {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ef4444;
  font-size: 12px;
  margin-top: 6px;
}

/* Tasks list */
.tasks-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-item .field-wrapper {
  flex: 1;
}

.remove-task-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #fee2e2;
  color: #ef4444;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-task-btn:hover {
  background: #ef4444;
  color: #ffffff;
}

.add-task-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #eaf7f1;
  color: #16935b;
  border: 1px dashed #2cb67d;
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 4px;
  align-self: flex-start;
  transition: all 0.2s ease;
}

.add-task-btn:hover {
  background: #2cb67d;
  color: #ffffff;
}

/* KPIs chips */
.kpi-input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.kpi-input-group .field-wrapper {
  flex: 1;
}

.add-kpi-btn {
  padding: 0 18px;
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 12.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.kpi-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.kpi-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #eaf7f1;
  color: #16935b;
  border: 1px solid #cbe9dc;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 700;
}

.kpi-chip i {
  cursor: pointer;
  opacity: 0.7;
}

.kpi-chip i:hover {
  opacity: 1;
  color: #ef4444;
}

/* Modal Footer */
.modal-footer-premium {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 18px 28px;
  background: #f7fcf9;
  border-top: 1px solid #e0f0e8;
}

.btn-submit-premium {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 22px;
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(44, 182, 125, 0.28);
  transition: all 0.2s ease;
}

.btn-submit-premium:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(44, 182, 125, 0.35);
}

.btn-cancel-premium {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 18px;
  background: #ffffff;
  color: #64748b;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel-premium:hover {
  background: #f1f5f9;
  color: #0f172a;
}

/* View KRAs Cards List */
.kra-cards-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.kra-card-item {
  border: 1px solid #e0f0e8;
  border-radius: 18px;
  background: #f7fcf9;
  overflow: hidden;
  transition: all 0.2s ease;
}

.kra-card-item:hover {
  border-color: #2cb67d;
  box-shadow: 0 4px 14px rgba(44, 182, 125, 0.08);
}

.kra-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  cursor: pointer;
}

.kra-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.kra-expand-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #eaf7f1;
  color: #16935b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}

.kra-name-heading {
  font-size: 14.5px;
  font-weight: 700;
  color: #0f2e22;
  margin: 0;
}

.kra-meta-badge {
  font-size: 11.5px;
  color: #6b8f81;
}

.kra-card-actions {
  display: flex;
  gap: 6px;
}

.icon-btn-small {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.icon-btn-small.edit {
  background: #eaf7f1;
  color: #16935b;
}

.icon-btn-small.delete {
  background: #fee2e2;
  color: #ef4444;
}

.kra-card-body {
  padding: 16px 18px;
  background: #ffffff;
  border-top: 1px solid #eef6f2;
}

.info-section {
  margin-bottom: 14px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: #16935b;
  margin-bottom: 6px;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #0f2e22;
  padding: 4px 0;
}

.info-list li i {
  color: #2cb67d;
  font-size: 11px;
}

.kpi-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.kpi-badge {
  padding: 4px 10px;
  background: #eaf7f1;
  color: #16935b;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.kpi-badge i {
  font-size: 10px;
}

.target-text {
  font-size: 13px;
  color: #0f2e22;
  font-weight: 600;
  margin: 0;
}

/* Empty States */
.empty-state-premium {
  padding: 40px 20px;
  text-align: center;
}

.empty-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #eaf7f1;
  color: #2cb67d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin: 0 auto 14px;
}

.empty-state-premium h4 {
  font-size: 16px;
  font-weight: 700;
  color: #0f2e22;
  margin: 0 0 6px;
}

.empty-state-premium p {
  font-size: 13px;
  color: #6b8f81;
  margin: 0 0 16px;
}

.inline-btn {
  margin: 0 auto;
}

/* Mobile Cards */
.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 14px;
  padding: 12px;
}

.department-card {
  background: white;
  border: 1px solid #e0f0e8;
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(44, 182, 125, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f2faf6;
}

.code-badge-mobile {
  padding: 2px 10px;
  background: #eaf7f1;
  color: #16935b;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-action-btn {
  flex: 1;
  padding: 8px 10px;
  border: none;
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.card-action-btn.primary { background: #eaf7f1; color: #16935b; }
.card-action-btn.secondary { background: #f1f5f9; color: #475569; }
.card-action-btn.danger { background: #fee2e2; color: #ef4444; }

/* 📱 Media Queries */
@media (max-width: 900px) {
  .stats-bar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }

  .content-header-modern {
    display: none;
  }

  .main-content {
    padding: 12px;
  }

  .department-table {
    display: none;
  }

  .mobile-cards {
    display: flex;
  }
}
</style>