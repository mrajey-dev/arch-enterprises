<template>
  <div class="layout">

    <!-- Registration / Edit Modal - Ultra Premium Design -->
    <transition name="modal-fade">
      <div class="modal-backdrop" v-if="showRegister" @click.self="closeRegisterForm()">
        <div class="premium-modal" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium">
              <i :class="isEditMode ? 'fas fa-user-edit' : 'fas fa-user-plus'"></i>
            </div>
            <div class="header-text">
              <h2>{{ isEditMode ? 'Edit Employee' : 'Create New Employee' }}</h2>
              <p>{{ isEditMode ? 'Update employee information' : 'Add a new team member' }}</p>
            </div>
            <button class="close-btn-premium" @click="closeRegisterForm()">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body-premium">
            <form @submit.prevent="handleRegister" class="premium-form">
              <div class="form-sections">
                <!-- Personal Information Section -->
                <div class="form-section">
                  <div class="section-title">
                    <i class="fas fa-user-circle"></i>
                    <span>Personal Information</span>
                  </div>
                  <div class="form-row-premium">
                    <div class="form-field">
                      <label>Full Name <span class="required-star">*</span></label>
                      <div class="field-wrapper">
                        <i class="fas fa-user field-icon"></i>
                        <input
                          v-model="registerForm.username"
                          placeholder="Enter full name"
                          @input="validateName"
                          :class="{ 'error': nameError }"
                        />
                      </div>
                      <span v-if="nameError" class="field-error">
                        <i class="fas fa-exclamation-circle"></i> Only letters and spaces allowed
                      </span>
                    </div>

                    <div class="form-field">
                      <label>Handle <span class="required-star">*</span></label>
                      <div class="field-wrapper">
                        <i class="fas fa-at field-icon"></i>
                        <input
                          v-model="registerForm.handle"
                          placeholder="username_123"
                          maxlength="25"
                          @input="registerForm.handle = registerForm.handle.replace(/[^A-Za-z0-9_]/g, '').slice(0,25)"
                        />
                      </div>
                      <span class="field-hint">Only letters, numbers & underscore</span>
                    </div>

                    <div class="form-field">
                      <label>Email Address <span class="required-star">*</span></label>
                      <div class="field-wrapper">
                        <i class="fas fa-envelope field-icon"></i>
                        <input
                          v-model="registerForm.email"
                          type="email"
                          placeholder="employee@company.com"
                          @input="registerForm.email = registerForm.email.trim().toLowerCase()"
                          @blur="checkEmailExists"
                          :class="{ 'error': emailExists && !isEditMode }"
                        />
                      </div>
                      <span v-if="emailExists && !isEditMode" class="field-error">
                        <i class="fas fa-exclamation-circle"></i> Email already registered
                      </span>
                    </div>

                    <div class="form-field" v-if="!isEditMode">
                      <label>Password</label>
                      <div class="password-field-premium">
                        <div class="field-wrapper" style="flex: 1;">
                          <i class="fas fa-lock field-icon"></i>
                          <input
                            :type="showPassword ? 'text' : 'password'"
                            v-model="registerForm.password"
                            readonly
                            placeholder="Auto-generated"
                          />
                        </div>
                        <button type="button" class="icon-btn-premium" @click="togglePasswordVisibility">
                          <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                        </button>
                        <button type="button" class="generate-btn-premium" @click="generatePassword">
                          <i class="fas fa-sync-alt"></i> Generate
                        </button>
                      </div>
                    </div>

                    <div class="form-field">
                      <label>Date of Birth <span class="required-star">*</span></label>
                      <div class="field-wrapper">
                        <i class="fas fa-calendar-alt field-icon"></i>
                        <input type="date" v-model="registerForm.birthDate" @change="validateDOB" :class="{ 'error': dobError }" />
                      </div>
                      <span v-if="dobError" class="field-error">
                        <i class="fas fa-exclamation-circle"></i> Age must be 18+ and valid date
                      </span>
                    </div>

                    <div class="form-field">
                      <label>Gender <span class="required-star">*</span></label>
                      <div class="field-wrapper">
                        <i class="fas fa-venus-mars field-icon"></i>
                        <select v-model="registerForm.gender">
                          <option value="" disabled>Select gender</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>

                    <div class="form-field">
                      <label>Blood Group</label>
                      <div class="field-wrapper">
                        <i class="fas fa-tint field-icon"></i>
                        <select v-model="registerForm.bloodGroup">
                          <option value="" disabled>Select blood group</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Contact Information Section -->
                <div class="form-section">
                  <div class="section-title">
                    <i class="fas fa-address-card"></i>
                    <span>Contact Information</span>
                  </div>
                  <div class="form-row-premium">
                    <div class="form-field full-width">
                      <label>Address <span class="required-star">*</span></label>
                      <div class="field-wrapper">
                        <i class="fas fa-map-marker-alt field-icon" style="top: 18px;"></i>
                        <textarea
                          v-model="registerForm.address"
                          placeholder="Enter complete address"
                          rows="3"
                          maxlength="250"
                          @input="checkAddressLength"
                        ></textarea>
                      </div>
                      <div class="char-count" :class="{ 'warning': addressWarning }">
                        {{ registerForm.address.length }}/250 characters
                      </div>
                    </div>

                    <div class="form-field">
                      <label>Primary Contact <span class="required-star">*</span></label>
                      <div class="field-wrapper">
                        <i class="fas fa-phone-alt field-icon"></i>
                        <input type="tel" v-model="registerForm.mobile" @input="registerForm.mobile = registerForm.mobile.replace(/[^0-9]/g, '').slice(0,10)" placeholder="10-digit number" />
                      </div>
                    </div>

                    <div class="form-field">
                      <label>Secondary Contact</label>
                      <div class="field-wrapper">
                        <i class="fas fa-phone field-icon"></i>
                        <input type="tel" v-model="registerForm.secondaryContact" @input="registerForm.secondaryContact = registerForm.secondaryContact.replace(/[^0-9]/g, '').slice(0,10)" placeholder="Optional" />
                      </div>
                    </div>

                    <div class="form-field">
                      <label>City <span class="required-star">*</span></label>
                      <div class="field-wrapper">
                        <i class="fas fa-city field-icon"></i>
                        <input v-model="registerForm.city" placeholder="City name" maxlength="25" @input="registerForm.city = registerForm.city.replace(/[^A-Za-z\s]/g, '').slice(0,25)" />
                      </div>
                    </div>

                    <div class="form-field">
                      <label>Department <span class="required-star">*</span></label>
                      <div class="field-wrapper">
                        <i class="fas fa-building field-icon"></i>
                        <select v-model="registerForm.department">
                          <option value="" disabled>Select department</option>
                          <option v-for="dept in departments" :key="dept.id" :value="dept.name">
                            {{ dept.name }}
                          </option>
                        </select>
                      </div>
                    </div>

                    <div class="form-field">
                      <label>Salary</label>
                      <div class="field-wrapper">
                        <i class="fas fa-rupee-sign field-icon"></i>
                        <input 
                          v-model="registerForm.keyResponsibility" 
                          @input="registerForm.keyResponsibility = registerForm.keyResponsibility.replace(/[^0-9]/g, '')" 
                          placeholder="Amount" 
                          type="text"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Documents Section -->
                <div class="form-section" v-if="!isEditMode">
                  <div class="section-title">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Upload Documents</span>
                  </div>
                  <div class="documents-area">
                    <div class="upload-row">
                      <select v-model="selectedDocumentType" class="doc-select">
                        <option disabled value="">Select document type</option>
                        <option value="permanent_address_proof">📄 Permanent Address Proof</option>
                        <option value="aadhaar_card">🆔 Aadhaar Card</option>
                        <option value="education_certificate">🎓 Education Certificate</option>
                        <option value="relevance_letter">📝 Company Relevance Letter</option>
                        <option value="photo">📸 Photograph</option>
                      </select>
                      <label class="upload-btn">
                        <i class="fas fa-folder-open"></i> Choose File
                        <input type="file" @change="handleFileUpload" hidden />
                      </label>
                    </div>
                    
                    <div class="documents-list" v-if="Object.keys(typedDocuments).length > 0">
                      <div v-for="(file, type) in typedDocuments" :key="type" class="doc-item">
                        <i class="fas fa-file-alt"></i>
                        <span>{{ type.replace(/_/g, ' ') }}: {{ file.name }}</span>
                        <button type="button" @click="removeDocument(type)" class="remove-doc-btn">
                          <i class="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-footer-premium">
                <button type="button" class="btn-cancel-premium" @click="closeRegisterForm()">
                  <i class="fas fa-times"></i> Cancel
                </button>
                <button type="submit" class="btn-submit-premium" :disabled="loading">
                  <span v-if="loading">
                    <i class="fas fa-spinner fa-spin"></i> {{ isEditMode ? 'Updating...' : 'Registering...' }}
                  </span>
                  <span v-else>
                    <i :class="isEditMode ? 'fas fa-save' : 'fas fa-user-plus'"></i>
                    {{ isEditMode ? 'Update Employee' : 'Register Employee' }}
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

      <section class="content" v-if="!isMobile || !isSidebarVisible">
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
        
          <div class="mobile-title">
            <i class="fas fa-users"></i>
            <span>Employees</span>
          </div>
          <button class="mobile-add-btn" @click="openRegisterForm()">
            <i class="fas fa-plus"></i>
          </button>
        </div>

        <!-- Desktop Header -->
        <div class="content-header" v-else>
          <div>
            <h1>Employee Management</h1>
            <p>Manage and oversee all employee records</p>
          </div>
          <button class="register-btn" @click="openRegisterForm()">
            <i class="fas fa-plus-circle"></i> Register Employee
          </button>
        </div>

        <div class="search-bar">
          <div class="search-input-wrapper">
            <i class="fas fa-search"></i>
            <input type="text" v-model="searchQuery" placeholder="Search by name, department, or email..." />
          </div>
          <div class="stats">
            <i class="fas fa-users"></i>
            <span>{{ filteredUsers.length }} Employees</span>
          </div>
        </div>

        <!-- Mobile Card View -->
        <div class="mobile-cards" v-if="isMobile">
          <div v-for="(user, index) in filteredUsers" :key="user.id" class="employee-card">
            <div class="card-header">
              <div class="card-avatar" @click="openKRASelection(user)">
                <div class="avatar">{{ getInitials(user.name) }}</div>
                <span class="card-name">{{ formatName(user.name) }}</span>
                <i class="fas fa-chart-line kra-hint-mobile"></i>
              </div>
              <span :class="['status-badge-mobile', user.status === 'active' ? 'active' : 'inactive']">
                <i class="fas fa-circle"></i>
                {{ user.status === 'active' ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <div class="card-body">
              <div class="card-row">
                <span class="card-label"><i class="fas fa-envelope"></i> Email</span>
                <span class="card-value">{{ user.email }}</span>
              </div>
              <div class="card-row">
                <span class="card-label"><i class="fas fa-building"></i> Department</span>
                <span class="card-value dept-badge-mobile">{{ user.department }}</span>
              </div>
              <div class="card-row">
                <span class="card-label"><i class="fas fa-phone"></i> Contact</span>
                <span class="card-value">{{ user.mobile }}</span>
              </div>
            </div>

            <div class="card-actions">
              <button class="card-action-btn edit" @click="editUser(user)">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="card-action-btn toggle" :class="user.status === 'active' ? 'deactivate' : 'activate'" @click="toggleStatus(user)">
                <i :class="user.status === 'active' ? 'fas fa-user-slash' : 'fas fa-user-check'"></i>
                {{ user.status === 'active' ? 'Deactivate' : 'Activate' }}
              </button>
            </div>
          </div>

          <div v-if="filteredUsers.length === 0" class="empty-state-mobile">
            <i class="fas fa-user-friends"></i>
            <p>No employees found</p>
            <span>Try adjusting your search</span>
          </div>
        </div>

        <!-- Desktop Table View -->
        <div class="table-container" v-else>
          <table class="employee-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Employee</th>
                <th>Email</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, index) in filteredUsers" :key="user.id">
                <td>{{ index + 1 }}</td>
                <td class="employee-name" @click="openKRASelection(user)">
                  <div class="avatar">{{ getInitials(user.name) }}</div>
                  <span>{{ formatName(user.name) }}</span>
                  <i class="fas fa-chart-line kra-hint"></i>
                </td>
                <td>{{ user.email }}</td>
                <td><span class="dept-badge">{{ user.department }}</span></td>
                <td>{{ user.mobile }}</td>
                <td>
                  <span :class="['status-badge', user.status === 'active' ? 'active' : 'inactive']">
                    <i class="fas fa-circle"></i>
                    {{ user.status === 'active' ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <div class="actions">
                    <button class="action-edit" @click="editUser(user)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-toggle" :class="user.status === 'active' ? 'deactivate' : 'activate'" @click="toggleStatus(user)" :title="user.status === 'active' ? 'Deactivate' : 'Activate'">
                      <i :class="user.status === 'active' ? 'fas fa-user-slash' : 'fas fa-user-check'"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="7" class="empty-state">
                  <i class="fas fa-user-friends"></i>
                  <p>No employees found</p>
                  <span>Try adjusting your search</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- KRA Modal - Premium -->
        <transition name="modal-fade">
          <div class="modal-backdrop" v-if="showKRAPopup" @click.self="cancelKRA">
            <div class="premium-modal kra-modal" @click.stop>
              <div class="modal-decoration"></div>
              
              <div class="modal-header-premium">
                <div class="header-icon-premium">
                  <i class="fas fa-tasks"></i>
                </div>
                <div class="header-text">
                  <h2>Assign Key Responsibilities</h2>
                  <p>Select KRAs for {{ selectedUser?.name }}</p>
                </div>
                <button class="close-btn-premium" @click="cancelKRA">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="modal-body-premium kra-body">
                <div class="kra-container">
                  <div class="kra-header">
                    <i class="fas fa-list-check"></i>
                    <span>Available KRAs</span>
                  </div>
                  <div class="kra-list">
                    <div v-for="kra in filteredKRAOptions" :key="kra.id" class="kra-item" :class="{ 'selected': selectedKRAs.includes(kra.id) }" @click="toggleKRA(kra.id)">
                      <div class="kra-checkbox">
                        <i :class="selectedKRAs.includes(kra.id) ? 'fas fa-check-square' : 'far fa-square'"></i>
                      </div>
                      <div class="kra-info">
                        <span class="kra-name">{{ kra.name }}</span>
                      </div>
                    </div>
                    <div v-if="filteredKRAOptions.length === 0" class="no-items">
                      <i class="fas fa-info-circle"></i>
                      <p>No KRAs available for this department</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-footer-premium">
                <button type="button" class="btn-cancel-premium" @click="cancelKRA">
                  <i class="fas fa-times"></i> Cancel
                </button>
                <button type="button" class="btn-secondary-premium" @click="showPerformance = true">
                  <i class="fas fa-eye"></i> View Assigned
                </button>
                <button type="button" class="btn-submit-premium" @click="assignKRA">
                  <i class="fas fa-check"></i> Assign KRAs
                </button>
              </div>
            </div>
          </div>
        </transition>

        <!-- Assigned KRAs Modal - Premium -->
        <transition name="modal-fade">
          <div class="modal-backdrop" v-if="showPerformance" @click.self="showPerformance = false">
            <div class="premium-modal assigned-modal" @click.stop>
              <div class="modal-decoration"></div>
              
              <div class="modal-header-premium">
                <div class="header-icon-premium">
                  <i class="fas fa-clipboard-list"></i>
                </div>
                <div class="header-text">
                  <h2>Assigned KRAs</h2>
                  <p>{{ selectedUser?.name }}</p>
                </div>
                <button class="close-btn-premium" @click="showPerformance = false">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="modal-body-premium assigned-body">
                <div class="assigned-container">
                  <div class="assigned-header">
                    <i class="fas fa-check-circle"></i>
                    <span>Currently Assigned Responsibilities</span>
                  </div>
                  <div class="assigned-list">
                    <div v-for="kra in parsedKRAs" :key="kra" class="assigned-item">
                      <i class="fas fa-check-circle"></i>
                      <span>{{ kra }}</span>
                    </div>
                    <div v-if="parsedKRAs.length === 0" class="no-items">
                      <i class="fas fa-inbox"></i>
                      <p>No KRAs assigned yet</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-footer-premium">
                <button type="button" class="btn-submit-premium" @click="showPerformance = false">
                  <i class="fas fa-check"></i> Done
                </button>
              </div>
            </div>
          </div>
        </transition>
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
  toastInfo
} from "@/utils/toast.js";

export default {
  components: {
    Sidebar
  },
  data() {
    return {
      searchQuery: '',
      dobError: false,
      userAssignedKRAs: [],
      loading: false,
      documents: [],
      isMobile: false,
      isSidebarVisible: true,
      selectedKRAs: [],
      showPerformance: false,
      selectedUser: null,
      kraOptions: [],
      departments: [],
      users: [],
      allKRAs: [],
      showKRAPopup: false,
      selectedDocumentType: '',
      typedDocuments: {},
      showPassword: true,
      showRegister: false,
      isEditMode: false,
      editingId: null,
      registerForm: {
        id: '',
        empId: '',
        username: '',
        handle: '',
        email: '',
        gender: '',
        department: '',
        city: '',
        address: '',
        mobile: '',
        secondaryContact: '',
        keyResponsibility: '',
        birthDate: '',
        bloodGroup: '',
        password: ''
      },
      addressWarning: false,
      emailExists: false,
      nameError: false,
    }
  },
  watch: {
    showRegister(val) {
      document.body.style.overflow = val ? 'hidden' : '';
    },
    showKRAPopup(val) {
      document.body.style.overflow = val ? 'hidden' : '';
    },
    showPerformance(val) {
      document.body.style.overflow = val ? 'hidden' : '';
    }
  },
  computed: {
    filteredUsers() {
      if (!this.searchQuery) return this.users;
      const query = this.searchQuery.toLowerCase();
      return this.users.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.department.toLowerCase().includes(query)
      );
    },
    filteredKRAOptions() {
      const userDept = this.selectedUser?.department;
      const departmentObj = this.departments.find(dept => dept.name === userDept);
      if (!departmentObj) return [];
      return this.kraOptions.filter(kra => kra.department_id === departmentObj.id);
    },
    parsedKRAs() {
      if (!this.selectedUser || !this.selectedUser.kra_name) return [];
      if (Array.isArray(this.selectedUser.kra_name)) {
        return this.selectedUser.kra_name;
      }
      return this.selectedUser.kra_name.split(',').map(kra => kra.trim());
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.fetchUsers();
    this.fetchDepartments();
    this.fetchAllKRAs();
  },
  methods: {
    getInitials(name) {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },
    formatName(name) {
      if (!name) return '';
      return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    },
    toggleKRA(kraId) {
      const index = this.selectedKRAs.indexOf(kraId);
      if (index > -1) {
        this.selectedKRAs.splice(index, 1);
      } else {
        this.selectedKRAs.push(kraId);
      }
    },
    removeDocument(type) {
      delete this.typedDocuments[type];
      toastInfo('Document removed');
    },
    cancelKRA() {
      this.showKRAPopup = false;
      this.selectedKRAs = [];
      setTimeout(() => {
        this.selectedUser = null;
      }, 300);
    },
    validateDOB() {
      const dobInput = this.registerForm.birthDate;
      if (!dobInput) {
        this.dobError = false;
        return;
      }
      const dob = new Date(dobInput);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;
      if (dob > today || actualAge < 18) {
        this.dobError = true;
        this.registerForm.birthDate = '';
      } else {
        this.dobError = false;
      }
    },
    checkAddressLength() {
      this.addressWarning = this.registerForm.address.length > 250;
    },
    async toggleStatus(user) {
      const newStatus = user.status === "active" ? "inactive" : "active";
      try {
        await axios.put(`https://employees.archenterprises.co.in/api/api/users-active/${user.id}`, { status: newStatus });
        user.status = newStatus;
        toastSuccess(`User is now ${newStatus}!`);
      } catch (error) {
        toastError("Failed to update status");
      }
    },
    validateName() {
      const regex = /^[A-Za-z\s]+$/;
      this.nameError = !regex.test(this.registerForm.username);
      this.registerForm.username = this.registerForm.username.replace(/[^A-Za-z\s]/g, "");
    },
    async checkEmailExists() {
      if (this.isEditMode) return;
      this.registerForm.email = this.registerForm.email.trim().toLowerCase();
      if (!this.registerForm.email) {
        this.emailExists = false;
        return;
      }
      try {
        const response = await axios.post("https://employees.archenterprises.co.in/api/api/check-email", { email: this.registerForm.email });
        this.emailExists = response.data.exists;
      } catch (error) {
        console.error("Email check failed:", error);
      }
    },
    async fetchAssignedKRAs(userId) {
      try {
        const response = await axios.get(`https://employees.archenterprises.co.in/api/api/user-kras/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.userAssignedKRAs = response.data.data || [];
      } catch (error) {
        console.error('Error fetching assigned KRAs:', error);
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!this.selectedDocumentType || !file) {
        toastWarning('Please select document type and file');
        return;
      }
      const formData = new FormData();
      formData.append('document', file);
      formData.append('empName', this.registerForm.username);
      formData.append('type', this.selectedDocumentType);
      axios.post('https://employees.archenterprises.co.in/api/api/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(() => {
        this.typedDocuments = {
          ...this.typedDocuments,
          [this.selectedDocumentType]: { name: file.name, type: this.selectedDocumentType }
        };
        this.selectedDocumentType = '';
        event.target.value = '';
        toastSuccess('Document uploaded');
      })
      .catch(() => toastError('Upload failed'));
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    async fetchUsers() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/users');
        this.users = response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
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
    async fetchAllKRAs() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/kras');
        this.kraOptions = response.data.data;
      } catch (error) {
        console.error('Error fetching KRAs:', error);
      }
    },
    async openKRASelection(user) {
      this.selectedUser = user;
      this.selectedKRAs = [];
      this.showKRAPopup = true;
      await this.fetchAssignedKRAs(user.id);
    },
    assignKRA() {
      if (this.selectedKRAs.length === 0) {
        toastWarning('Please select at least one KRA');
        return;
      }
      axios.post('https://employees.archenterprises.co.in/api/api/assign-kra', {
        user_id: this.selectedUser.id,
        kra_ids: this.selectedKRAs,
      })
      .then(() => {
        toastSuccess('KRA(s) assigned successfully!');
        this.showKRAPopup = false;
        this.selectedKRAs = [];
        this.fetchUsers();
      })
      .catch(() => toastError('Failed to assign KRAs'));
    },
    editUser(user) {
      this.isEditMode = true;
      this.editingId = user.id;
      this.showRegister = true;
      this.registerForm = {
        id: user.id,
        empId: user.empId || '',
        username: user.name || '',
        handle: user.handle || '',
        email: user.email || '',
        gender: user.gender || '',
        department: user.department || '',
        city: user.city || '',
        address: user.address || '',
        mobile: user.mobile || '',
        secondaryContact: user.mobile2 || '',
        keyResponsibility: user.keyresponsibility || '',
        birthDate: user.dateofbirth || '',
        bloodGroup: user.bloodgroup || '',
        password: ''
      };
    },
  async handleRegister() {
  if (this.nameError) {
    toastWarning("Invalid name format");
    return;
  }
  if (!this.isEditMode && Object.keys(this.typedDocuments).length === 0) {
    toastWarning("Please upload at least one document");
    return;
  }
  if (!this.validateForm()) return;
  
  this.loading = true;
  try {
    if (this.isEditMode) {
      await axios.put(`https://employees.archenterprises.co.in/api/api/users/${this.editingId}`, {
        username: this.registerForm.username,
        handle: this.registerForm.handle,
        email: this.registerForm.email.toLowerCase(),
        gender: this.registerForm.gender,
        department: this.registerForm.department,
        city: this.registerForm.city,
        address: this.registerForm.address,
        mobile: this.registerForm.mobile,
        secondaryContact: this.registerForm.secondaryContact,
        birthDate: this.registerForm.birthDate,
        bloodGroup: this.registerForm.bloodGroup,
        keyResponsibility: this.registerForm.keyResponsibility ? String(this.registerForm.keyResponsibility) : ''
      });
      toastSuccess("User updated successfully!");
    } else {
      if (!this.registerForm.password) this.generatePassword();
      await axios.post("https://employees.archenterprises.co.in/api/api/register", {
        ...this.registerForm,
        email: this.registerForm.email.toLowerCase(),
        keyResponsibility: this.registerForm.keyResponsibility ? String(this.registerForm.keyResponsibility) : ''
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toastSuccess("Registration successful!");
    }
    this.showRegister = false;
    this.resetForm();
    this.fetchUsers();
  } catch (error) {
    toastError(error.response?.data?.message || "Operation failed");
  } finally {
    this.loading = false;
  }
},
    validateForm() {
      const form = this.registerForm;
      if (!/^[A-Za-z ]+$/.test(form.username.trim())) {
        toastWarning("Name must contain only letters");
        return false;
      }
      if (!/^[A-Za-z0-9_]+$/.test(form.handle.trim())) {
        toastWarning("Handle can only contain letters, numbers, underscores");
        return false;
      }
      if (this.dobError || !form.birthDate) {
        toastWarning("Please enter valid date of birth (18+)");
        return false;
      }
      if (!/^[0-9]{10}$/.test(form.mobile)) {
        toastError("Contact number must be 10 digits");
        return false;
      }
      if (form.secondaryContact && !/^[0-9]{10}$/.test(form.secondaryContact)) {
        toastError("Secondary contact must be 10 digits");
        return false;
      }
      return true;
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    generatePassword() {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
      let password = '';
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.registerForm.password = password;
    },
    openRegisterForm() {
      this.resetForm();
      this.showRegister = true;
    },
    closeRegisterForm() {
      this.showRegister = false;
      this.resetForm();
    },
    resetForm() {
      this.registerForm = {
        id: '', empId: '', username: '', handle: '', email: '', gender: '',
        department: '', city: '', address: '', mobile: '', secondaryContact: '',
        keyResponsibility: '', birthDate: '', bloodGroup: '', password: ''
      };
      this.typedDocuments = {};
      this.selectedDocumentType = '';
      this.isEditMode = false;
      this.editingId = null;
      this.nameError = false;
      this.emailExists = false;
      this.dobError = false;
      this.addressWarning = false;
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Variables */
:root {
  --primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --primary-color: #667eea;
  --dark: #1a1a2e;
  --gray: #f5f5f5;
  --border: #e0e0e0;
  --success: #10b981;
  --danger: #ef4444;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  background: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Modal Backdrop */
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

/* Premium Modal */
.premium-modal {
  position: relative;
  background: white;
  border-radius: 32px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.premium-modal.kra-modal,
.premium-modal.assigned-modal {
  max-width: 550px;
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
  color: rgb(0, 0, 0);
  transform: rotate(90deg);
}

/* Modal Body with Scrolling */
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

/* Form Sections */
.form-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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

.section-title i {
  color: var(--primary-color);
  font-size: 18px;
}

.form-row-premium {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
  background: white;
}

.field-wrapper textarea {
  padding-top: 12px;
  resize: vertical;
  min-height: 80px;
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

.field-hint {
  font-size: 11px;
  color: #6b7280;
}

.char-count {
  font-size: 11px;
  text-align: right;
  color: #6b7280;
  margin-top: 4px;
}

.char-count.warning {
  color: #f59e0b;
}

/* Password Field */
.password-field-premium {
  display: flex;
  gap: 10px;
  align-items: center;
}

.icon-btn-premium {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.icon-btn-premium:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.generate-btn-premium {
  padding: 0 16px;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: var(--primary);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.generate-btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

/* Documents Area */
.documents-area {
  border: 2px dashed #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
}

.documents-area:hover {
  border-color: var(--primary-color);
  background: rgba(102, 126, 234, 0.02);
}

.upload-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.doc-select {
  flex: 1;
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 13px;
}

.upload-btn {
  padding: 10px 20px;
  background: #f3f4f6;
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-btn:hover {
  background: #e5e7eb;
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f9fafb;
  border-radius: 12px;
  font-size: 13px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.doc-item i:first-child {
  color: var(--success);
}

.remove-doc-btn {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  transition: all 0.3s ease;
}

.remove-doc-btn:hover {
  color: var(--danger);
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
.btn-secondary-premium,
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
}

.btn-cancel-premium {
  background: #f3f4f6;
  border: none;
  color: #6b7280;
}

.btn-cancel-premium:hover {
  background: #e5e7eb;
}

.btn-secondary-premium {
  background: #e0e7ff;
  border: none;
  color: var(--primary-color);
}

.btn-secondary-premium:hover {
  background: #c7d2fe;
}

.btn-submit-premium {
  background: var(--primary);
  border: none;
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

/* KRA Styles */
.kra-body {
  padding: 0;
}

.kra-container {
  padding: 20px;
}

.kra-header,
.assigned-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  font-weight: 600;
  color: #1a1a2e;
}

.kra-list {
  max-height: 350px;
  overflow-y: auto;
  padding: 8px;
}

.kra-list::-webkit-scrollbar {
  width: 4px;
}

.kra-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  margin-bottom: 8px;
  background: #f9fafb;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.kra-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.kra-item.selected {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
}

.kra-checkbox i {
  font-size: 20px;
  color: var(--primary-color);
}

.kra-info {
  flex: 1;
}

.kra-name {
  font-size: 14px;
  font-weight: 500;
}

/* Assigned Items */
.assigned-body {
  padding: 0;
}

.assigned-container {
  padding: 20px;
}

.assigned-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 350px;
  overflow-y: auto;
  padding: 8px;
}

.assigned-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-radius: 14px;
  animation: slideIn 0.3s ease;
}

.assigned-item i {
  color: var(--success);
  font-size: 18px;
}

.no-items {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}

.no-items i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

/* Main Content Styles */
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

/* Content Header */
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.content-header h1 {
  font-size: 28px;
  font-weight: 700;
  background: var(--primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
}

.content-header p {
  color: #6b7280;
  font-size: 14px;
  margin-top: 4px;
}

.register-btn {
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

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  max-width: 380px;
}

.search-input-wrapper i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input-wrapper input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 2px solid #e5e7eb;
  border-radius: 30px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input-wrapper input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.stats {
  padding: 8px 20px;
  background: #f3f4f6;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 14px;
}

/* Mobile Cards */
.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 16px;
}

.employee-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.card-avatar {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex: 1;
}

.card-avatar .avatar {
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

.card-name {
  font-weight: 600;
  color: var(--dark);
  font-size: 14px;
}

.kra-hint-mobile {
  color: var(--primary-color);
  font-size: 14px;
  opacity: 0.5;
}

.status-badge-mobile {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge-mobile.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge-mobile.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge-mobile i {
  font-size: 5px;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.card-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-value {
  font-size: 13px;
  color: var(--dark);
  text-align: right;
  word-break: break-word;
  max-width: 60%;
}

.dept-badge-mobile {
  padding: 2px 10px;
  background: #e0e7ff;
  color: var(--primary-color);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
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

.card-action-btn.edit {
  background: #e0e7ff;
  color: var(--primary-color);
}

.card-action-btn.edit:active {
  transform: scale(0.97);
}

.card-action-btn.toggle.deactivate {
  background: #fee2e2;
  color: #991b1b;
}

.card-action-btn.toggle.deactivate:active {
  transform: scale(0.97);
}

.card-action-btn.toggle.activate {
  background: #d1fae5;
  color: #065f46;
}

.card-action-btn.toggle.activate:active {
  transform: scale(0.97);
}

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

.empty-state-mobile p {
  font-size: 16px;
  margin-bottom: 4px;
  color: #6b7280;
}

/* Table Styles */
.table-container {
  overflow-x: auto;
}

.employee-table {
  width: 100%;
  border-collapse: collapse;
}

.employee-table thead th {
  text-align: left;
  padding: 16px;
  background: #f9fafb;
  font-weight: 600;
  font-size: 13px;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.employee-table tbody td {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.employee-table tbody tr:hover {
  background: #fafbfc;
}

.employee-name {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.avatar {
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

.kra-hint {
  margin-left: auto;
  opacity: 0;
  transition: all 0.3s ease;
  color: var(--primary-color);
}

.employee-name:hover .kra-hint {
  opacity: 1;
}

.dept-badge {
  padding: 4px 12px;
  background: #e0e7ff;
  color: var(--primary-color);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge i {
  font-size: 6px;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-edit,
.action-toggle {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-edit {
  background: #e0e7ff;
  color: var(--primary-color);
}

.action-edit:hover {
  color: rgb(6, 1, 1);
}

.action-toggle.deactivate {
  background: #fee2e2;
  color: #991b1b;
}

.action-toggle.deactivate:hover {
  background: #991b1b;
  color: white;
}

.action-toggle.activate {
  background: #d1fae5;
  color: #065f46;
}

.action-toggle.activate:hover {
  background: #065f46;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #9ca3af;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 4px;
  color: #6b7280;
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

  .content-header {
    display: none;
  }

  .search-bar {
    flex-direction: column;
    margin-bottom: 16px;
  }

  .search-input-wrapper {
    max-width: 100%;
  }

  .stats {
    width: 100%;
    justify-content: center;
  }

  .mobile-cards {
    display: flex;
  }

  .table-container {
    display: none;
  }

  .form-row-premium {
    grid-template-columns: 1fr;
  }

  .form-field.full-width {
    grid-column: span 1;
  }

  .premium-modal {
    max-width: 95%;
    max-height: 83vh;
  }

  .modal-header-premium {
    padding: 16px 20px;
  }

  .modal-header-premium h2 {
    font-size: 18px;
  }

  .modal-body-premium {
    padding: 16px;
  }

  .modal-footer-premium {
    padding: 16px 20px;
    flex-direction: column;
  }

  .btn-cancel-premium,
  .btn-secondary-premium,
  .btn-submit-premium {
    width: 100%;
  }

  .premium-modal.kra-modal,
  .premium-modal.assigned-modal {
    max-width: 95%;
  }

  .upload-row {
    flex-direction: column;
  }

  .password-field-premium {
    flex-direction: column;
  }

  .icon-btn-premium {
    width: 100%;
  }

  .generate-btn-premium {
    width: 100%;
    justify-content: center;
  }

  .doc-item {
    flex-wrap: wrap;
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

  .employee-card {
    padding: 12px;
  }

  .card-header {
    flex-direction: column;
    gap: 8px;
  }

  .card-actions {
    flex-direction: column;
  }

  .card-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .card-value {
    text-align: left;
    max-width: 100%;
  }

  .dept-badge-mobile {
    align-self: flex-start;
  }

  .modal-header-premium {
    padding: 12px 16px;
  }

  .modal-header-premium h2 {
    font-size: 16px;
  }

  .header-icon-premium {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .modal-body-premium {
    padding: 12px;
  }

  .modal-footer-premium {
    padding: 12px 16px;
  }

  .form-section {
    padding: 16px;
  }

  .section-title {
    font-size: 14px;
  }
}
</style>