<template>
  <div class="layout">

    <!-- Leave Type Modal - Premium Design -->
    <transition name="modal-fade">
      <div class="modal-backdrop" v-if="showLeaveTypeForm" @click.self="closeLeaveTypeForm()">
        <div class="premium-modal" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="header-text">
              <h2>{{ editingLeaveId ? 'Edit Leave Type' : 'Add Leave Type' }}</h2>
              <p>{{ editingLeaveId ? 'Update leave type information' : 'Create a new leave type' }}</p>
            </div>
            <button class="close-btn-premium" @click="closeLeaveTypeForm()">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body-premium">
            <form @submit.prevent="submitLeaveType">
              <div class="form-section">
                <div class="form-field">
                  <label>Leave Name <span class="required-star">*</span></label>
                  <div class="field-wrapper">
                    <i class="fas fa-heading field-icon"></i>
                    <input
                      v-model="leaveForm.leaveName"
                      maxlength="20"
                      required
                      @input="allowOnlyText('leaveName')"
                      placeholder="e.g., Annual Leave, Sick Leave"
                    />
                  </div>
                </div>

                <div class="form-field">
                  <label>Total Leaves <span class="required-star">*</span></label>
                  <div class="field-wrapper">
                    <i class="fas fa-code field-icon"></i>
                    <input
                      type="number"
                      min="0"
                      v-model="leaveForm.totalLeaves"
                      placeholder="Enter total leaves"
                      required
                    />
                  </div>
                </div>

                <div class="form-field full-width">
                  <label>Description</label>
                  <div class="field-wrapper">
                    <i class="fas fa-align-left field-icon" style="top: 18px;"></i>
                    <textarea
                      v-model="leaveForm.description"
                      placeholder="Enter description (optional)"
                      rows="4"
                      maxlength="50"
                      @input="allowOnlyText('description')"
                    ></textarea>
                  </div>
                  <div class="char-counter" v-if="leaveForm.description">
                    {{ leaveForm.description.length }}/50 characters
                  </div>
                </div>
              </div>

              <div class="modal-footer-premium">
                <button type="button" class="btn-cancel-premium" @click="closeLeaveTypeForm()">
                  <i class="fas fa-times"></i> Cancel
                </button>
                <button type="submit" class="btn-submit-premium" :disabled="isSaving">
                  <span v-if="isSaving">
                    <i class="fas fa-spinner fa-spin"></i> Saving...
                  </span>
                  <span v-else>
                    <i class="fas fa-save"></i> {{ editingLeaveId ? 'Update' : 'Save' }} Leave Type
                  </span>
                </button>
              </div>
            </form>
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
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div>
              <h1>Leave Type Management</h1>
              <p class="subtitle-modern">Manage and configure leave policies</p>
            </div>
          </div>
          <button class="register-btn-modern" @click="startNewLeaveType()">
            <i class="fas fa-plus-circle"></i>
            <span>Add Leave Type</span>
          </button>
        </div>

        <div class="stats-bar">
          <div class="stat-card">
            <i class="fas fa-calendar-alt"></i>
            <div class="stat-info">
              <span class="stat-value">{{ leaveTypes.length }}</span>
              <span class="stat-label">Leave Types</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-chart-line"></i>
            <div class="stat-info">
              <span class="stat-value">{{ totalLeaves }}</span>
              <span class="stat-label">Total Leaves Available</span>
            </div>
          </div>
        </div>

        <div class="table-wrapper-premium">
          <table class="leave-table-premium">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Total Leaves</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="type in leaveTypes" :key="type.id">
                <td>
                  <div class="leave-type-badge">
                    <i class="fas fa-leaf"></i>
                    <span>{{ type.leave_name }}</span>
                  </div>
                </td>
                <td>
                  <span class="leaves-count">{{ type.total_leaves }} days</span>
                </td>
                <td class="description-cell">{{ type.description || '—' }}</td>
                <td>
                  <div class="action-group">
                    <button 
                      class="action-btn edit" 
                      :disabled="editingId === type.id"
                      @click="editLeaveType(type)"
                      title="Edit Leave Type"
                    >
                     Edit <i v-if="editingId !== type.id" class="fas fa-edit"></i>
                      <i v-else class="fas fa-spinner fa-spin"></i>
                    </button>
                    <button 
                      class="action-btn delete" 
                      :disabled="deletingId === type.id"
                      @click="deleteLeaveType(type.id)"
                      title="Delete Leave Type"
                    >
                     Delete <i v-if="deletingId !== type.id" class="fas fa-trash-alt"></i>
                      <i v-else class="fas fa-spinner fa-spin"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="leaveTypes.length === 0" class="empty-row">
                <td colspan="4">
                  <div class="empty-state-premium">
                    <i class="fas fa-calendar-times"></i>
                    <h4>No Leave Types</h4>
                    <p>Click "Add Leave Type" to create your first leave policy</p>
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
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'
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
      isMobile: false,
      isSidebarVisible: true,
      leaveTypes: [],
      editingLeaveId: null,
      showLeaveTypeForm: false,
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
  computed: {
    totalLeaves() {
      return this.leaveTypes.reduce((total, type) => total + (type.total_leaves || 0), 0);
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
        toastError("Failed to load leave types");
      }
    },

    async submitLeaveType() {
      if (!this.leaveForm.leaveName.trim()) {
        toastWarning("Please enter a leave name");
        return;
      }
      if (!this.leaveForm.totalLeaves || this.leaveForm.totalLeaves < 0) {
        toastWarning("Please enter a valid number of leaves");
        return;
      }

      this.isSaving = true;
      try {
        if (this.editingLeaveId) {
          await axios.put(
            `https://employees.archenterprises.co.in/api/api/leave-types/${this.editingLeaveId}`,
            {
              leave_name: this.leaveForm.leaveName,
              total_leaves: this.leaveForm.totalLeaves,
              description: this.leaveForm.description
            }
          );
          toastSuccess('Leave type updated successfully!');
        } else {
          await axios.post(
            'https://employees.archenterprises.co.in/api/api/leave-types',
            {
              leave_name: this.leaveForm.leaveName,
              total_leaves: this.leaveForm.totalLeaves,
              description: this.leaveForm.description
            }
          );
          toastSuccess('Leave type created successfully!');
        }

        this.fetchLeaveTypes();
        this.closeLeaveTypeForm();
      } catch (error) {
        if (error.response?.status === 422) {
          const errors = error.response.data.errors;
          toastError(
            errors.leave_name?.[0] ||
            errors.total_leaves?.[0] ||
            'Validation error'
          );
        } else if (error.response?.data?.message) {
          toastError(error.response.data.message);
        } else {
          toastError('Server error. Please try again.');
        }
      } finally {
        this.isSaving = false;
      }
    },

    closeLeaveTypeForm() {
      this.showLeaveTypeForm = false;
      this.leaveForm = {
        leaveName: '',
        totalLeaves: '',
        description: ''
      };
      this.editingLeaveId = null;
    },

    async deleteLeaveType(id) {
      if (!confirm('Are you sure you want to delete this leave type?')) return;

      this.deletingId = id;
      try {
        await axios.delete(`https://employees.archenterprises.co.in/api/api/leave-types/${id}`);
        this.fetchLeaveTypes();
        toastSuccess('Leave type deleted successfully!');
      } catch (error) {
        if (error.response?.status === 409) {
          toastError('This leave type is already used and cannot be deleted.');
        } else {
          toastError('Failed to delete leave type.');
        }
      } finally {
        this.deletingId = null;
      }
    },

    editLeaveType(type) {
      this.editingId = type.id;
      setTimeout(() => {
        this.leaveForm.leaveName = type.leave_name;
        this.leaveForm.totalLeaves = type.total_leaves;
        this.leaveForm.description = type.description || '';
        this.editingLeaveId = type.id;
        this.showLeaveTypeForm = true;
        this.editingId = null;
      }, 300);
    },

    logout() {
      const token = localStorage.getItem('token');
      axios
        .post(
          'https://employees.archenterprises.co.in/api/api/logout',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .finally(() => {
          localStorage.removeItem('token');
          this.$router.push('/auth');
        });
    }
  },

  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);

    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/auth');
    } else {
      this.fetchLeaveTypes();
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Variables */
:root {
  --primary: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%);
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
  /* background: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%); */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
   ;
}

.content {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
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
  font-size: 20px;
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
  min-width: 180px;
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
  font-size: 36px;
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

/* Table Styles */
.table-wrapper-premium {
  overflow-x: auto;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
}

.leave-table-premium {
  width: 100%;
  border-collapse: collapse;
}

.leave-table-premium thead {
  background: #f8fafc;
}

.leave-table-premium th {
  text-align: left;
  padding: 16px 20px;
  font-weight: 600;
  font-size: 13px;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.leave-table-premium td {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.leave-table-premium tbody tr {
  transition: all 0.3s ease;
}

.leave-table-premium tbody tr:hover {
  background: #fafbfc;
}

/* Leave Type Badge */
.leave-type-badge {
  display: flex;
  align-items: center;
  gap: 10px;
}

.leave-type-badge i {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 14px;
}

.leave-type-badge span {
  font-weight: 500;
  color: #1a1a2e;
}

/* Leaves Count */
.leaves-count {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #065f46;
}

/* Description Cell */
.description-cell {
  color: #6b7280;
  font-size: 13px;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Action Group */
.action-group {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: auto;
  padding: 17px;
  height: 34px;
  gap: 8px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn.edit {
  background: #e0e7ff;
  color: var(--primary-color);
}

.action-btn.edit:hover:not(:disabled) {
  /* background: var(--primary-color); */
  color: rgb(9, 3, 3);
  transform: translateY(-2px);
}

.action-btn.delete {
  background: #fee2e2;
  color: var(--danger);
}

.action-btn.delete:hover:not(:disabled) {
  /* background: var(--danger); */
  color: rgb(0, 0, 0);
  transform: translateY(-2px);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  max-width: 550px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
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

.header-text {
  flex: 1;
}

.header-text h2 {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: #1a1a2e;
}

.header-text p {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 0;
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
  /* background: var(--danger); */
  color: rgb(15, 7, 7);
  transform: rotate(90deg);
}

/* Modal Body */
.modal-body-premium {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
  background: #fafbfc;
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

/* Form Section */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field.full-width {
  grid-column: span 2;
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

.field-wrapper textarea + .field-icon {
  top: 18px;
  transform: none;
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

.field-wrapper textarea {
  padding-top: 12px;
  resize: vertical;
  min-height: 100px;
}

.field-wrapper input:focus,
.field-wrapper select:focus,
.field-wrapper textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.char-counter {
  font-size: 11px;
  text-align: right;
  color: #6b7280;
  margin-top: 4px;
}

/* Modal Footer */
.modal-footer-premium {
  display: flex;
  gap: 12px;
  padding: 20px 28px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
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

.btn-submit-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.btn-submit-premium:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Empty State */
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
    padding: 16px;
  }

  .content {
    padding: 20px;
  }

  .content-header-modern {
    flex-direction: column;
    align-items: stretch;
  }

  .register-btn-modern {
    justify-content: center;
  }

  .stats-bar {
    flex-direction: column;
  }

  .stat-card {
    width: 100%;
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

  .action-group {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .leave-table-premium th,
  .leave-table-premium td {
    padding: 12px;
  }

  .description-cell {
    max-width: 150px;
  }
}

/* Disabled Button State */
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>